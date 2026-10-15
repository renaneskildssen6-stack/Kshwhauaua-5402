import { useMemo, useState } from "react";
import { getWorld, type Site } from "@/game/world";

/** Acesso direto: qualquer torneio cujo nivel requerido ja foi atingido pode ser
 *  disputado daqui, sem precisar atravessar o mundo ate o predio. */
export function TournamentAccess({ playerLevel, won, teamEmpty, onEnter, onTravel, onClose }: {
  playerLevel: number;
  won: string[];
  teamEmpty: boolean;
  onEnter: (s: Site) => void;
  onTravel: (s: Site) => void;
  onClose: () => void;
}) {
  const world = getWorld();
  const [filter, setFilter] = useState("");
  const [showDone, setShowDone] = useState(true);
  const open = useMemo(() => world.sites.filter((s) => playerLevel >= s.t.requiredLevel), [world, playerLevel]);
  const locked = world.sites.length - open.length;
  const next = world.sites.filter((s) => playerLevel < s.t.requiredLevel).reduce((m, s) => Math.min(m, s.t.requiredLevel), Infinity);
  const q = filter.trim().toLowerCase();
  const list = open
    .filter((s) => showDone || !won.includes(s.t.id))
    .filter((s) => !q || s.t.name.toLowerCase().includes(q) || (s.t.element ?? "").toLowerCase().includes(q))
    .sort((a, b) => Number(won.includes(a.t.id)) - Number(won.includes(b.t.id)) || b.t.requiredLevel - a.t.requiredLevel);

  return (
    <div data-testid="tournament-access" role="dialog" aria-label="Torneios disponiveis" style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(3,8,16,.97)", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div className="mk-title" style={{ fontSize: 9, color: "#ffd23a", lineHeight: 1.8 }}>
          TORNEIOS LIBERADOS
          <br />
          <span style={{ fontSize: 6, color: "#93b1c8" }}>
            {open.length} DISPONIVEIS · NIVEL {playerLevel}
            {locked > 0 && Number.isFinite(next) ? ` · PROXIMO NO NV ${next}` : ""}
          </span>
        </div>
        <button className="mk-btn" data-testid="close-access" onClick={onClose} style={{ minHeight: 40 }}>FECHAR</button>
      </header>
      <div style={{ display: "flex", gap: 6 }}>
        <input aria-label="Buscar torneio" placeholder="Buscar torneio / elemento" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: 1, minHeight: 38, background: "#0d2033", color: "#e0f4ff", border: "2px solid #345569", padding: 8 }} />
        <button className="mk-btn" onClick={() => setShowDone((v) => !v)} style={{ fontSize: 7, minHeight: 38 }}>{showDone ? "OCULTAR VENCIDOS" : "MOSTRAR TODOS"}</button>
      </div>
      {teamEmpty && <div className="mk-title" style={{ fontSize: 7, color: "#ff6a5a" }}>MONTE SUA EQUIPE NO HANGAR PARA LUTAR</div>}
      <div className="mk-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto", display: "grid", gap: 6, alignContent: "start" }}>
        {list.length === 0 && <div className="mk-title" style={{ fontSize: 7, color: "#93b1c8", padding: 12 }}>NENHUM TORNEIO ENCONTRADO</div>}
        {list.map((s) => {
          const done = won.includes(s.t.id);
          return (
            <div key={s.t.id} data-testid="access-row" style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, border: `2px solid ${done ? "rgba(255,210,58,.45)" : "rgba(53,226,240,.4)"}`, background: "rgba(8,18,32,.8)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mk-title" style={{ fontSize: 7, color: done ? "#ffd23a" : "#dff6ff", lineHeight: 1.6 }}>{s.t.name}</div>
                <div className="mk-title" style={{ fontSize: 6, color: "#8fa8bd", marginTop: 3, lineHeight: 1.6 }}>
                  NV {s.t.requiredLevel} · {s.t.fights.length} LUTAS · {s.kind === "cave" ? "SUBTERRANEO" : s.kind === "sky" ? "CELESTE" : "SUPERFICIE"}
                  {done ? " · CONQUISTADO" : ` · ${s.t.reward.gold}$`}
                </div>
              </div>
              <button className="mk-btn" data-testid="access-travel" onClick={() => onTravel(s)} style={{ fontSize: 7, minHeight: 44 }}>IR</button>
              <button className="mk-btn" data-testid="access-enter" disabled={teamEmpty} onClick={() => onEnter(s)} style={{ fontSize: 7, minHeight: 44, color: "#03121a", background: teamEmpty ? "#5a6a78" : done ? "#ffd23a" : "var(--mk-accent)" }}>{done ? "REVANCHE" : "ENTRAR"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
