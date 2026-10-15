import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TopBar } from "@/screens/roster";
import { useGame } from "@/game/save";
import { CITY_LABELS, energyCap, type CitySystem } from "@/game/expansion";
import "./city-stage.css";

export function CityStage({ system, onBack, subtitle, children }: { system: CitySystem; onBack: () => void; subtitle: string; children: ReactNode }) {
  const g = useGame();
  return <main className={`mk-city-stage mk-city-${system}`}>
    <TopBar title={CITY_LABELS[system]} gold={g.gold} onBack={onBack} />
    <div className="mk-city-status"><span>{subtitle}</span><div><b>{g.expansion.energy}<small>/{energyCap(g.expansion.plant)} ENERGIA</small></b><b>{g.expansion.reputation}<small> REPUTAÇÃO</small></b></div></div>
    <div className="mk-city-content mk-scroll">{children}</div>
  </main>;
}

/** Only animate decoded sheets while visible, and never in reduced-motion mode. */
export function CityArt({ name, cols = 4, rows = 3, frames = 12, fps = 6, className = "", style, label }: {
  name: string; cols?: number; rows?: number; frames?: number; fps?: number;
  className?: string; style?: CSSProperties; label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0), [visible, setVisible] = useState(false), [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    let alive = true;
    setFrame(0); setReady(false);
    const image = new Image(); image.onload = () => { void image.decode().catch(() => undefined).then(() => { if (alive) setReady(true); }); };
    image.src = `/city2/${name}.webp`;
    return () => { alive = false; image.onload = null; };
  }, [name]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });
    if (ref.current) observer.observe(ref.current);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => { observer.disconnect(); query.removeEventListener("change", change); };
  }, []);
  useEffect(() => {
    if (!visible || reduced || !ready || frames <= 1) { setFrame(0); return; }
    const id = window.setInterval(() => { if (!document.hidden) setFrame((previous) => (previous + 1) % frames); }, 1000 / fps);
    return () => window.clearInterval(id);
  }, [name, visible, reduced, ready, frames, fps]);
  return <div ref={ref} className={`mk-city-art ${className}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    style={{ backgroundImage: `url('/city2/${name}.webp')`, backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${cols === 1 ? 0 : frame % cols * 100 / (cols - 1)}% ${rows === 1 ? 0 : Math.floor(frame / cols) * 100 / (rows - 1)}%`, ...style }} />;
}
export function GateArt({ id, className = "", label }: { id: string; className?: string; label?: string }) {
  return <CityArt name={`gate_${id}`} cols={4} rows={4} frames={16} fps={12} className={`mk-gate-art ${className}`} label={label} />;
}
export function RelicArt({ index, size = 100, locked = false }: { index: number; size?: number; locked?: boolean }) {
  return <div className="mk-city-relic-art" aria-hidden="true" style={{ width: size, height: size, backgroundImage: "url('/city2/relics.webp')", backgroundSize: "600% 400%", backgroundPosition: `${index % 6 * 20}% ${Math.floor(index / 6) * 100 / 3}%`, filter: locked ? "grayscale(1) brightness(.35)" : undefined }} />;
}
export function CityToast({ children }: { children: ReactNode }) {
  return <div className="mk-city-toast" role="status" aria-live="polite">{children || "Escolha um ponto de interesse para interagir."}</div>;
}
export function CityHeading({ tag, title, children }: { tag: string; title: string; children?: ReactNode }) {
  return <header className="mk-city-heading"><span>{tag}</span><h1>{title}</h1>{children && <p>{children}</p>}</header>;
}
export function CityMeter({ value, max, label, tone = "cyan" }: { value: number; max: number; label: string; tone?: string }) {
  return <div className={`mk-city-meter mk-city-meter-${tone}`}><div><span>{label}</span><b>{value}/{max}</b></div><div role="progressbar" aria-label={label} aria-valuenow={Math.min(value, max)} aria-valuemin={0} aria-valuemax={max}><span style={{ width: `${Math.min(100, value / Math.max(1, max) * 100)}%` }} /></div></div>;
}
export function CityHelp({ children }: { children: ReactNode }) { return <details className="mk-city-help"><summary>COMO FUNCIONA</summary><div>{children}</div></details>; }