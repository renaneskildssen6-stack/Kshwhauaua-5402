import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { KitSkill } from "@/game/kits";
import type { CombatAction, Fighter, Forecast } from "@/game/battle";
import { skillUnavailable } from "@/game/combat";
import { useDialogFocus } from "./dialog-focus";
import "./battle-commands.css";

/** Tempo que o jogador precisa segurar uma esfera para executar a ação. */
export const HOLD_MS = 2000;

const ORB = (name: string) => `/orbs/${name}.webp`;
const assets = ["attack", "defend", "ultimate", "items", "swap", "tactics", "fist", "fist2", "blades", "missiles", "rocket", "vortex", "repair", "strike", "cycle", "info"];
export function preloadCommandArt(): void { for (const name of assets) { const im = new Image(); im.src = ORB(name); } }

function skillSymbol(s: KitSkill, index: number): string {
  if (s.kind === "defense") return s.defense?.kind === "repair" || s.defense?.kind === "overcharge" ? "repair" : "defend";
  const tags = s.tags ?? [];
  if (tags.includes("corte")) return "blades";
  if (tags.includes("projetil") || tags.includes("explosao")) return "missiles";
  if (tags.includes("area")) return "vortex";
  return ["fist", "strike", "rocket", "fist2"][index % 4];
}

/** Uma opção de esfera (golpe, item, troca, tática). */
export interface OrbOption {
  id: string;
  label: string;
  sub?: string;
  /** imagem da esfera gerada (/orbs/*) */
  orb?: string;
  /** ícone/rosto dentro de uma esfera neutra */
  glyph?: string;
  tone?: string;
  blocked?: string | false;
  info: { title: string; lines: string[] };
  run: () => void;
  onFocus?: () => void;
}

type Cat = "attack" | "defense" | "ultimate" | "items" | "swap" | "tactics";

export function BattleCommands({ fighter, skills, ultimate, onAction, onSelect, forecast, competitive = false, items = [], team = [], tactics = [] }: {
  fighter: Fighter; skills: KitSkill[]; ultimate: KitSkill;
  competitive?: boolean;
  onAction: (action: CombatAction) => void;
  /** compat: menus antigos não são mais usados */
  onMenu?: (menu: "items" | "swap" | "extra") => void;
  onSelect: (id: string) => void; forecast: (id: string) => Forecast | null;
  items?: OrbOption[]; team?: OrbOption[]; tactics?: OrbOption[];
}) {
  const [open, setOpen] = useState<Cat | null>(null);
  const [shown, setShown] = useState<Cat | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [info, setInfo] = useState<OrbOption["info"] | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  useDialogFocus(infoRef, !!info, () => setInfo(null));

  // fade-out da bandeja antiga → fade-in da nova
  useEffect(() => {
    if (open === shown) { setLeaving(false); return; }
    if (!shown) { setShown(open); return; }
    setLeaving(true);
    const id = window.setTimeout(() => { setShown(open); setLeaving(false); }, 180);
    return () => window.clearTimeout(id);
  }, [open, shown]);

  const resourceCost = (s: KitSkill) => fighter.resId ? s.cost?.[fighter.resId] ?? 0 : 0;
  const ready = fighter.ultimateCharge >= 100;
  const skillOption = (s: KitSkill, i: number): OrbOption => {
    const cost = resourceCost(s);
    const fc = forecast(s.id);
    return {
      id: s.id, label: s.name, orb: skillSymbol(s, i),
      sub: `${s.mp === 0 ? "SEM MP" : `${s.mp} MP`}${cost ? ` · ${cost} ${fighter.resId?.toUpperCase()}` : ""}${s.charge ? ` · ${s.charge}T` : ""}`,
      blocked: skillUnavailable(fighter, s) || false,
      info: {
        title: s.name,
        lines: [
          s.desc,
          `${s.mp} MP · Poder ${s.power} · ${cost} recurso do chassi`,
          ...(s.charge ? [`Preparação: ${s.charge} turno(s) antes de liberar o golpe.`] : []),
          ...((s.hits ?? 1) > 1 ? [`${s.hits} impactos · a carga de ação é concedida uma vez.`] : []),
          ...(fc ? [`Previsão: ${fc.min}–${fc.max} · ${fc.tier}`] : []),
        ],
      },
      run: () => onAction({ kind: "skill", skillId: s.id }),
      onFocus: () => onSelect(s.id),
    };
  };
  const options = (cat: Cat | null): OrbOption[] => {
    switch (cat) {
      case "attack": return skills.filter((s) => s.kind === "attack").map(skillOption);
      case "defense": return skills.filter((s) => s.kind === "defense").map(skillOption);
      case "ultimate": return [{
        id: ultimate.id, label: ultimate.name, orb: "ultimate", tone: "#ffd46c",
        sub: ready ? "100% · SEM MP" : `${fighter.ultimateCharge}%`,
        blocked: !ready ? "CARREGANDO" : fighter.charged ? "GOLPE EM PREPARO" : false,
        info: { title: ultimate.name, lines: [ultimate.desc, "100% de carga · SEM MP · exclusivo deste robô", "Ataque +18 · Defesa +14 · Dano +4–16"] },
        run: () => onAction({ kind: "ultimate" }),
      }];
      case "items": return items;
      case "swap": return team;
      case "tactics": return tactics;
      default: return [];
    }
  };
  const cats: { id: Cat; label: string; orb: string; hidden?: boolean }[] = [
    { id: "attack", label: "ATACAR", orb: "attack" },
    { id: "defense", label: "DEFENDER", orb: "defend" },
    { id: "ultimate", label: "ULTIMATE", orb: "ultimate" },
    { id: "items", label: "ITENS", orb: "items", hidden: competitive },
    { id: "swap", label: "TROCAR", orb: "swap" },
    { id: "tactics", label: "TÁTICAS", orb: "tactics" },
  ];
  const tray = options(shown);
  const pick = (c: Cat) => setOpen((o) => (o === c ? null : c));

  return <div className="mc-commands mc-orbs" key={fighter.uid}>
    <div className="mc-command-heading"><span>SUA VEZ · {fighter.name}</span><small>SEGURE A ESFERA 2s PARA EXECUTAR</small></div>
    {fighter.charged && <HoldOrb option={{ id: "release", label: fighter.chargeTurns > 0 ? `MANTER · ${fighter.chargeTurns}T` : "LIBERAR GOLPE", orb: "cycle", info: { title: "Golpe carregado", lines: ["Mantém a preparação ou libera o golpe carregado."] }, run: () => onAction({ kind: "pass" }) }} index={0} onInfo={setInfo} compact />}
    <div className={`mc-orb-tray${leaving ? " is-leaving" : ""}`} role="group" aria-label={shown ? `Opções de ${cats.find((c) => c.id === shown)?.label}` : "Opções"} data-testid="orb-tray">
      {!shown && <p className="mc-orb-hint">TOQUE EM UMA ESFERA ABAIXO</p>}
      {shown && tray.length === 0 && <p className="mc-orb-hint">{shown === "items" ? "SEM ITENS DE BATALHA" : "NADA DISPONÍVEL"}</p>}
      {tray.map((o, i) => <HoldOrb key={`${shown}-${o.id}`} option={o} index={i} onInfo={setInfo} />)}
    </div>
    <nav className="mc-orb-root" aria-label="Ações de combate">
      {cats.filter((c) => !c.hidden).map((c) => <button key={c.id} type="button"
        className={`mc-cat${open === c.id ? " is-open" : ""}${c.id === "ultimate" && ready ? " is-ready" : ""}`}
        aria-pressed={open === c.id} aria-label={c.label} data-testid={`cat-${c.id}`} onClick={() => pick(c.id)}
        style={c.id === "ultimate" ? { "--charge": `${Math.min(100, fighter.ultimateCharge)}%` } as CSSProperties : undefined}>
        <span className="mc-cat-orb"><img src={ORB(c.orb)} alt="" draggable={false} /></span>
        <span className="mc-cat-label">{c.label}{c.id === "ultimate" ? ` ${Math.min(100, fighter.ultimateCharge)}%` : ""}</span>
      </button>)}
    </nav>
    {info && <div className="mc-skill-dossier" role="dialog" aria-modal="true" aria-label={info.title} ref={infoRef} tabIndex={-1}>
      <button className="mc-close" onClick={() => setInfo(null)}>FECHAR ×</button><h3>{info.title}</h3>
      {info.lines.map((l, i) => <p key={i}>{l}</p>)}
      <small>A informação não consome turno.</small>
    </div>}
  </div>;
}

/** Esfera que só dispara depois de segurada por HOLD_MS (toque, mouse ou Enter/Espaço). */
function HoldOrb({ option: o, index, onInfo, compact }: { option: OrbOption; index: number; onInfo: (i: OrbOption["info"]) => void; compact?: boolean }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(0);
  const runRef = useRef(o.run); runRef.current = o.run;
  const stop = () => { window.clearTimeout(timer.current); timer.current = 0; setHolding(false); };
  const start = () => {
    if (o.blocked || timer.current) return;
    o.onFocus?.();
    setHolding(true);
    timer.current = window.setTimeout(() => { timer.current = 0; setHolding(false); navigator.vibrate?.(35); runRef.current(); }, HOLD_MS);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return <div className={`mc-opt${compact ? " is-compact" : ""}${holding ? " is-holding" : ""}${o.blocked ? " is-blocked" : ""}`} style={{ "--i": index, "--tone": o.tone ?? "#89f5ff" } as CSSProperties}>
    <button type="button" className="mc-opt-orb" aria-disabled={!!o.blocked} data-testid={`opt-${o.id}`}
      aria-label={`${o.label}${o.sub ? `, ${o.sub}` : ""}${o.blocked ? `, ${o.blocked}` : ", segure 2 segundos para usar"}`}
      onPointerDown={(e) => { if (e.button > 0) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); start(); }}
      onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") stop(); }}
      onFocus={o.onFocus} onPointerEnter={o.onFocus} onContextMenu={(e) => e.preventDefault()}>
      <svg className="mc-hold-ring" viewBox="0 0 100 100" aria-hidden><circle cx="50" cy="50" r="46" pathLength={100} /></svg>
      {o.orb ? <img src={ORB(o.orb)} alt="" draggable={false} />
        : <span className="mc-glyph"><img src={o.glyph} alt="" draggable={false} /></span>}
    </button>
    <button type="button" className="mc-opt-info" onClick={() => onInfo(o.info)} aria-label={`Informações de ${o.label}`}><img src={ORB("info")} alt="" draggable={false} /></button>
    <span className="mc-opt-label">{o.label}</span>
    <small className="mc-opt-sub">{holding ? "SEGURANDO…" : o.blocked || o.sub || ""}</small>
  </div>;
}

