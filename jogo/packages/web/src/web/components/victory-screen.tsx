import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RobotSprite } from "@/components/pixel";
import { faceUrl } from "@/game/robots";
import type { battleReport, CombatSummary } from "@/game/battle";
import "./victory-screen.css";

type Report = ReturnType<typeof battleReport>;
type Phase = "ignite" | "cinematic" | "reveal" | "ready";
const ART = ["/victory/intro_01.webp", "/victory/intro_02.webp", "/victory/background.webp"];
const FRAME_MS = 70;
const CINEMATIC_MS = 50 * FRAME_MS;
let preload: Promise<void> | undefined;

/** Warm both cinematic sheets before combat ends; failures never trap the player. */
export function preloadVictoryArt() {
  if (!preload) preload = Promise.all(ART.map((src) => new Promise<void>((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(resolve, 5000);
    const done = () => { window.clearTimeout(timeout); resolve(); };
    image.onload = () => { image.decode().catch(() => undefined).finally(done); };
    image.onerror = done;
    image.src = src;
  }))).then(() => undefined);
  return preload;
}

function sheetStyle(src: string, frame: number, columns: number): CSSProperties {
  return {
    backgroundImage: `url('${src}')`,
    backgroundSize: `${columns * 100}% ${columns * 100}%`,
    backgroundPosition: `${(frame % columns) * 100 / (columns - 1)}% ${Math.floor(frame / columns) * 100 / (columns - 1)}%`,
  };
}

function score(row: CombatSummary) { return row.damageDealt + row.healed + row.kills * 40; }
const number = (value: number) => value.toLocaleString("pt-BR");

export function VictoryScreen({ report, label, onContinue }: {
  report: Report;
  label: string;
  onContinue: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("ignite");
  const [frame, setFrame] = useState(0);
  const [backgroundFrame, setBackgroundFrame] = useState(0);
  const [tab, setTab] = useState<"team" | "enemy" | "log">("team");
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [artReady, setArtReady] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const continued = useRef(false);
  const mvp = [...report.player].sort((a, b) => score(b) - score(a))[0];
  const kills = report.player.reduce((sum, row) => sum + row.kills, 0);
  const healed = report.player.reduce((sum, row) => sum + row.healed, 0);
  const crits = report.player.reduce((sum, row) => sum + row.crits, 0);
  const survivors = report.player.filter((row) => row.alive).length;
  const revealed = phase === "reveal" || phase === "ready";

  useEffect(() => {
    let alive = true;
    void preloadVictoryArt().then(() => { if (alive) setArtReady(true); });
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    dialog.current?.focus();
    return () => { alive = false; query.removeEventListener("change", change); };
  }, []);

  useEffect(() => {
    if (reduced) { setPhase("ready"); return; }
    if (phase === "ignite" && artReady) {
      const timer = window.setTimeout(() => setPhase("cinematic"), 420);
      return () => window.clearTimeout(timer);
    }
    if (phase === "cinematic") {
      let raf = 0;
      let start: number | undefined;
      const tick = (now: number) => {
        start ??= now;
        const elapsed = now - start;
        setFrame(Math.min(49, Math.floor(elapsed / FRAME_MS)));
        if (elapsed >= CINEMATIC_MS) setPhase("reveal");
        else raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(raf);
    }
    if (phase === "reveal") {
      const timer = window.setTimeout(() => setPhase("ready"), 850);
      return () => window.clearTimeout(timer);
    }
  }, [phase, artReady, reduced]);

  useEffect(() => {
    if (!revealed || reduced) return;
    const timer = window.setInterval(() => setBackgroundFrame((previous) => (previous + 1) % 9), 180);
    return () => window.clearInterval(timer);
  }, [revealed, reduced]);

  useEffect(() => { if (phase === "ready") continueButton.current?.focus(); }, [phase]);

  return (
    <div ref={dialog} className={`mk-victory mk-victory-phase-${phase}${reduced ? " mk-victory-reduced" : ""}`}
      role="dialog" aria-modal="true" aria-label="Vitória — relatório da batalha" tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !revealed) { event.preventDefault(); setPhase("reveal"); }
        if (event.key === "Tab") {
          const buttons = Array.from(dialog.current?.querySelectorAll<HTMLElement>("button:not(:disabled), summary") ?? [])
            .filter((button) => button.offsetParent !== null && button.tabIndex >= 0 && !button.closest("[inert]"));
          const first = buttons[0]; const last = buttons[buttons.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
            event.preventDefault(); last?.focus();
          } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) {
            event.preventDefault(); first?.focus();
          }
        }
      }}>
      <div className="mk-victory-result" aria-hidden={!revealed} inert={!revealed}>
        <section className="mk-victory-art" aria-label="Santuário da vitória">
          <div className="mk-victory-scene" style={sheetStyle(ART[2], reduced ? 0 : backgroundFrame, 3)} />
          <div className="mk-victory-art-shade" />
          <div className="mk-victory-art-top"><span>CAMPEÕES MECHA</span><span>RELATÓRIO DE COMBATE</span></div>
          <div className="mk-victory-champion">
            {mvp && <RobotSprite robotId={mvp.robotId} size={144} fps={reduced ? 0.01 : 5} />}
            <span className="mk-victory-eyebrow">DESTAQUE DA EQUIPE</span>
            <strong>{mvp?.name ?? "SEU ESQUADRÃO"}</strong>
            <span>{mvp ? `${number(mvp.damageDealt)} DANO · ${mvp.kills} ABATES` : "MISSÃO CUMPRIDA"}</span>
          </div>
          <div className="mk-victory-art-bottom"><span>O CAMPO É SEU.</span><span>A LENDA CONTINUA.</span></div>
        </section>

        <section className="mk-victory-details">
          <header className="mk-victory-heading">
            <span className="mk-victory-eyebrow">OPERAÇÃO CONCLUÍDA · {label}</span>
            <h1>VITÓRIA</h1>
            <p>Você venceu. Seu esquadrão dominou a batalha.</p>
            <div className="mk-victory-rule"><span /> <b>MISSÃO CUMPRIDA</b> <span /></div>
          </header>
          <div className="mk-victory-stats">
            {[
              ["DANO CAUSADO", number(report.totals.player)],
              ["RODADAS", number(report.rounds)],
              ["ABATES", number(kills)],
              ["CURA TOTAL", number(healed)],
              ["CRÍTICOS", number(crits)],
              ["SOBREVIVENTES", `${survivors}/${report.player.length}`],
            ].map(([name, value], index) => <div key={name} style={{ "--victory-delay": `${index * 65}ms` } as CSSProperties}>
              <strong>{value}</strong><span>{name}</span>
            </div>)}
          </div>
          <div className="mk-victory-analysis">
            <div className="mk-victory-tabs" role="tablist" aria-label="Estatísticas da partida">
              {([ ["team", "SUA EQUIPE"], ["enemy", "ADVERSÁRIOS"], ["log", "CRONOLOGIA"] ] as const).map(([id, name]) =>
                <button key={id} role="tab" id={`victory-tab-${id}`} aria-controls="victory-panel" aria-selected={tab === id}
                  tabIndex={tab === id ? 0 : -1} disabled={!revealed} onClick={() => setTab(id)}
                  onKeyDown={(event) => {
                    const tabs = ["team", "enemy", "log"] as const;
                    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    const index = tabs.indexOf(id);
                    const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
                    setTab(tabs[next]);
                    document.getElementById(`victory-tab-${tabs[next]}`)?.focus();
                  }}>{name}</button>)}
            </div>
            <div className="mk-victory-rows" role="tabpanel" id="victory-panel" aria-labelledby={`victory-tab-${tab}`}>
              {tab === "log" ? report.timeline.slice(-24).reverse().map((line, index) =>
                <p className="mk-victory-log" key={`${index}-${line}`}>{line}</p>) :
                (tab === "team" ? report.player : report.enemy).map((row) => <FighterRow key={row.uid} row={row}
                  mvp={tab === "team" && row.uid === mvp?.uid} total={tab === "team" ? report.totals.player : report.totals.enemy} />)}
            </div>
          </div>
          <footer className="mk-victory-footer">
            <span>DANO RECEBIDO <b>{number(report.totals.enemy)}</b></span>
            <button ref={continueButton} className="mk-victory-continue" disabled={phase !== "ready"}
              onClick={() => { if (!continued.current) { continued.current = true; onContinue(); } }}>CONTINUAR <span aria-hidden="true">›</span></button>
          </footer>
        </section>
      </div>
      <div className="mk-victory-cinematic" aria-hidden="true">
        <div className="mk-victory-film" style={sheetStyle(ART[frame < 25 ? 0 : 1], frame % 25, 5)} />
        <div className="mk-victory-ignition" />
        <div className="mk-victory-light-sweep" />
        <div className="mk-victory-film-label"><span>CONFRONTO ENCERRADO</span><strong>VITÓRIA</strong></div>
      </div>
      {!revealed && <button className="mk-victory-skip" onClick={() => setPhase("reveal")}>PULAR ANIMAÇÃO</button>}
      <span className="mk-victory-sr" role="status">{revealed ? "Você venceu. Estatísticas da partida disponíveis." : "Vitória. Apresentação de encerramento."}</span>
    </div>
  );
}

function FighterRow({ row, mvp, total }: { row: CombatSummary; mvp: boolean; total: number }) {
  const share = Math.min(100, Math.round(row.damageDealt / Math.max(1, total) * 100));
  return <div className={`mk-victory-fighter${mvp ? " mk-victory-mvp" : ""}`}>
    <img src={faceUrl(row.robotId)} alt="" width={44} height={44} />
    <div className="mk-victory-fighter-info">
      <div className="mk-victory-fighter-name"><strong>{row.name}</strong>{mvp && <b>MVP</b>}<span>{row.alive ? "ATIVO" : "CAÍDO"}</span></div>
      <div className="mk-victory-damage"><span style={{ width: `${share}%` }} /></div>
      <div className="mk-victory-fighter-numbers"><span>DANO <b>{number(row.damageDealt)}</b></span><span>CURA {number(row.healed)}</span><span>{row.kills} ABT · {row.crits} CRIT</span></div>
      <details><summary>DETALHES</summary><p>HP {row.hp}/{row.maxHp} · SOFREU {number(row.damageTaken)} · {row.parries} APAROS · {row.dodges} ESQUIVAS · {row.statusApplied} STATUS</p>
        {row.topSkills.length > 0 && <p>{row.topSkills.map((skill) => `${skill.name} ×${skill.uses}`).join(" · ")}</p>}
      </details>
    </div>
  </div>;
}