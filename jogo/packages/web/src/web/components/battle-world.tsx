import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Side } from "@/game/battle";
import "./battle-world.css";

export interface BattleShot { side: Side; kind: "action" | "impact" | "entry" | "power" }

/** Only the world moves. Controls, reports and event text stay anchored. */
export function BattleWorld({ shot, enabled, children }: {
  shot: BattleShot | null;
  enabled: boolean;
  children: (size: number, reduced: boolean) => ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  // Faixa livre entre o HUD superior e o console: o palco cabe sempre nela.
  const [bounds, setBounds] = useState({ width: 480, height: 800, top: 200, bottom: 470 });
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const root = (el.closest(".mk-battle") as HTMLElement | null) ?? el;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const width = el.clientWidth, height = el.clientHeight;
      const hud = root.querySelector(".mk-battle-top")?.getBoundingClientRect();
      const con = root.querySelector(".mk-battle-console")?.getBoundingClientRect();
      const top = Math.round(hud && hud.height ? hud.bottom - r.top : height * .22);
      const bottom = Math.round(con && con.height ? con.top - r.top : height * .6);
      setBounds(p => p.width === width && p.height === height && p.top === top && p.bottom === bottom ? p : { width, height, top, bottom });
    };
    const update = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const watch = () => {
      root.querySelectorAll(".mk-battle-top,.mk-battle-console").forEach(n => observer.observe(n));
    };
    watch();
    const mo = new MutationObserver(() => { watch(); update(); });
    mo.observe(root, { childList: true });
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => { observer.disconnect(); mo.disconnect(); if (raf) cancelAnimationFrame(raf); query.removeEventListener("change", change); };
  }, []);
  const label = bounds.width < 620 ? 24 : 32; // espaço reservado ao rótulo de ação
  const stageTop = bounds.top + label;
  const stageBottom = Math.max(stageTop + 72, bounds.bottom - 6);
  const stageH = stageBottom - stageTop;
  const size = Math.round(Math.max(64, Math.min(192, stageH * .94, Math.max(112, bounds.width * .16))));
  const focus = enabled && !reduced ? shot : null;
  const wanted = !focus ? 1 : focus.kind === "impact" ? 1.18 : focus.kind === "power" ? 1.48 : focus.kind === "entry" ? 1.25 : 1.38;
  // Zoom limitado: o robô ampliado nunca invade HUD nem console.
  const zoom = Math.max(1, Math.min(wanted, (stageBottom - bounds.top) / size * .92));
  const anchor = bounds.width < 700 ? .2 : .24;
  const subjectX = bounds.width * (focus?.side === "enemy" ? 1 - anchor : anchor);
  const desiredX = bounds.width * (focus?.side === "enemy" ? .59 : .41);
  const subjectY = stageBottom - size / 2;
  const bandMid = (bounds.top + stageBottom) / 2;
  const dx = focus ? desiredX - (bounds.width / 2 + (subjectX - bounds.width / 2) * zoom) : 0;
  const dy = focus ? bandMid - (bounds.height / 2 + (subjectY - bounds.height / 2) * zoom) : 0;
  useLayoutEffect(() => {
    const root = viewport.current?.closest(".mk-battle") as HTMLElement | null;
    if (!root) return;
    root.style.setProperty("--mk-stage-top", `${stageTop}px`);
    root.style.setProperty("--mk-stage-h", `${stageH}px`);
    root.style.setProperty("--mk-action-top", `${bounds.top + 3}px`);
    root.dataset.fit = "true";
  }, [stageTop, stageH, bounds.top]);
  return <div ref={viewport} className="mk-battle-viewport" data-camera={focus?.kind ?? "wide"}>
    <div className="mk-battle-world" style={{ transform: `translate3d(${dx}px,${dy}px,0) scale(${zoom})`,
      "--mk-player-x": `${anchor * 100}%`, "--mk-enemy-x": `${(1 - anchor) * 100}%`,
      "--mk-travel": `${bounds.width * (1 - anchor * 2)}px`,
      "--mk-step": `${Math.min(90, bounds.width * (1 - anchor * 2) * .18)}px` } as CSSProperties}>
      {children(size, reduced || !enabled)}
    </div>
    <div className="mk-battle-depth" aria-hidden />
  </div>;
}