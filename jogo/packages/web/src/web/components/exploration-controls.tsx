import { useEffect, useRef, useState } from "react";

type Props = {
  onMove: (x: number, y: number) => void;
  onJump: () => void; onJumpEnd: () => void;
  onAttack: () => void; onSpecial: () => void;
  cooldown?: number; disabled?: boolean;
  /** Botão INTERAGIR (entrar em locais, atividades, NPCs). */
  onInteract?: () => void; interactReady?: boolean;
};

/** One pointer owns the stick; other fingers can hold/jump/attack independently. */
export function ExplorationControls({ onMove, onJump, onJumpEnd, onAttack, onSpecial, cooldown = 0, disabled, onInteract, interactReady }: Props) {
  const stick = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const [axis, setAxis] = useState({ x: 0, y: 0 });
  const moveRef = useRef(onMove); moveRef.current = onMove;
  const reset = () => { pointer.current = null; setAxis({ x: 0, y: 0 }); moveRef.current(0, 0); };
  useEffect(() => {
    window.addEventListener("blur", reset);
    const visibility = () => { if (document.hidden) reset(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("blur", reset); document.removeEventListener("visibilitychange", visibility); moveRef.current(0, 0); };
  }, []);
  useEffect(() => { if (disabled) reset(); }, [disabled]);
  const update = (clientX: number, clientY: number) => {
    const r = stick.current!.getBoundingClientRect();
    const radius = r.width * .34;
    let x = (clientX - r.left - r.width / 2) / radius;
    let y = (clientY - r.top - r.height / 2) / radius;
    const length = Math.hypot(x, y);
    if (length < .14) { x = 0; y = 0; }
    else if (length > 1) { x /= length; y /= length; }
    setAxis({ x, y }); moveRef.current(x, y);
  };
  return (
    <div className="exploration-controls" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "8px 12px max(12px, env(safe-area-inset-bottom))", zIndex: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end", pointerEvents: disabled ? "none" : "auto" }}>
      <div ref={stick} role="slider" aria-label="Joystick de movimento" aria-valuemin={-100} aria-valuemax={100} aria-valuenow={Math.round(axis.x * 100)} data-testid="joystick"
        onPointerDown={e => { if (pointer.current !== null) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); pointer.current = e.pointerId; update(e.clientX, e.clientY); }}
        onPointerMove={e => { if (e.pointerId === pointer.current) update(e.clientX, e.clientY); }}
        onPointerUp={e => { if (e.pointerId === pointer.current) reset(); }}
        onPointerCancel={reset} onLostPointerCapture={reset}
        style={{ position: "relative", width: 104, height: 104, flexShrink: 0, touchAction: "none", userSelect: "none", background: "rgba(4,14,27,.78)", border: "3px solid #3d7188", clipPath: "polygon(22% 0,78% 0,100% 22%,100% 78%,78% 100%,22% 100%,0 78%,0 22%)" }}>
        <span style={{ position: "absolute", inset: 8, border: "1px dashed #35e2f055", pointerEvents: "none" }} />
        <span style={{ position: "absolute", left: 29 + axis.x * 31, top: 29 + axis.y * 31, width: 40, height: 40, border: "3px solid #89f5ff", background: axis.x || axis.y ? "#238a9a" : "#143449", boxShadow: "3px 3px 0 #020813", pointerEvents: "none" }} />
        <span className="mk-title" style={{ position: "absolute", bottom: 3, left: 0, right: 0, textAlign: "center", fontSize: 5, pointerEvents: "none", color: "#b4e9f0" }}>{Math.abs(axis.x) > .75 ? "CORRIDA" : "MOVER"}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "52px 62px", gridTemplateRows: "48px 62px", gap: 7, alignItems: "end" }}>
        <Action label={cooldown > 0 ? `${cooldown.toFixed(1)}s` : "ESPECIAL"} name="Ataque especial" test="special-button" color="#35e2f0" disabled={cooldown > 0 || disabled} onDown={onSpecial} />
        <Action label="PULO" name="Pular" test="jump-button" color="#d7f9ff" onDown={onJump} onUp={onJumpEnd} disabled={disabled} />
        <Action label="ATAQUE" name="Atacar" test="attack-button" color="#ffb43a" onDown={onAttack} disabled={disabled} />
        {onInteract
          ? <Action label={interactReady ? "INTERAGIR!" : "INTERAGIR"} name="Interagir" test="interact-button" color={interactReady ? "#7dff8a" : "#6f8fa3"} onDown={onInteract} disabled={disabled} />
          : <div className="mk-title" style={{ fontSize: 5, color: "#c1dcea", lineHeight: 1.8, textAlign: "center", paddingBottom: 5 }}>2× PULO<br />↓ + PULO<br />DESCER</div>}
      </div>
    </div>
  );
}

function Action({ label, name, test, color, disabled, onDown, onUp = () => {} }: { label: string; name: string; test: string; color: string; disabled?: boolean; onDown: () => void; onUp?: () => void }) {
  const [pressed, setPressed] = useState(false);
  const owner = useRef<number | null>(null);
  const release = () => { if (owner.current === null) return; owner.current = null; setPressed(false); onUp(); };
  useEffect(() => { if (disabled) release(); }, [disabled]);
  useEffect(() => { window.addEventListener("blur", release); return () => { window.removeEventListener("blur", release); }; }, []);
  return <button className="mk-title" aria-label={name} data-testid={test} disabled={disabled}
    onPointerDown={e => { if (owner.current !== null) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); owner.current = e.pointerId; setPressed(true); onDown(); }}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
    onClick={e => { if (e.detail === 0 && !disabled) onDown(); }}
    style={{ width: "100%", height: test === "jump-button" ? 62 : 48, minWidth: 44, minHeight: 44, fontSize: test === "interact-button" ? 5 : 6, border: `3px solid ${color}`, color: pressed ? "#02101a" : color, background: pressed ? color : "rgba(4,14,27,.9)", boxShadow: "3px 3px 0 #020813", opacity: disabled ? .45 : 1, transform: pressed ? "translateY(2px)" : undefined, touchAction: "none", userSelect: "none", cursor: "pointer" }}>{label}</button>;
}