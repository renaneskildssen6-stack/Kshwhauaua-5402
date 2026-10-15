import { useState } from "react";
import { acceptMission, activeMissions, claimMission, missionProgress, missionsFor } from "@/game/world-activities";
import type { Region, WorldSave } from "@/game/world";

export function WorldJournal({ region, save, onClose, onPersist }: { region: Region; save: WorldSave; onClose: () => void; onPersist: () => void }) {
  const [tab, setTab] = useState<"local" | "active" | "guide">("local");
  const [, refresh] = useState(0);
  const missions = tab === "active" ? activeMissions(save) : missionsFor(region);
  return <div data-testid="world-journal" style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(3,8,16,.97)", padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div className="mk-title" style={{ fontSize: 10, color: "#35e2f0" }}>DIARIO DE EXPEDICAO</div><button className="mk-btn" data-testid="close-journal" onClick={onClose}>FECHAR</button></header>
    <div className="mk-title" style={{ fontSize: 7, color: region.color }}>{region.name}<br /><span style={{ color: "#8da9be", lineHeight: 2 }}>REGIAO {region.index + 1}/205 · {save.relics.length} RELIQUIAS · {save.completed.length} FEITOS</span></div>
    <nav style={{ display: "flex", gap: 6 }}>{(["local", "active", "guide"] as const).map(t => <button className="mk-btn" key={t} onClick={() => setTab(t)} style={{ fontSize: 7, color: tab === t ? "#35e2f0" : "#b8cbd9" }}>{t === "local" ? "MISSOES" : t === "active" ? "ATIVAS" : "GUIA"}</button>)}</nav>
    <div className="mk-scroll" style={{ overflow: "auto", flex: 1, paddingBottom: 20 }}>
      {tab === "guide" ? <div style={{ color: "#c5dfec", fontSize: 12, lineHeight: 1.8 }}>
        <h3 className="mk-title" style={{ fontSize: 9, color: "#ffd23a" }}>ROTAS E ATIVIDADES</h3>
        <p>Joystick: intensidade controla a velocidade. Teclado: A/D ou setas, Shift para corrida. Espaço: pulo; dois pulos alcançam patamares mais altos. F/X: ataque em combo. R/C: onda especial, três pontos de dano em área e proteção breve, recarga de quatro segundos.</p>
        <p>Céu: procure a torre a oeste da entrada das galerias. Patamares separados por três tiles e ilhas de descanso permitem subir até o santuário superior. Nas montanhas, degraus de um tile podem ser escalados andando.</p>
        <p>Profundezas: use os poços sinalizados. Joystick para baixo + pulo atravessa plataformas. Galerias com lanternas a cada 180 tiles levam à relíquia primordial. Não há dano de queda.</p>
        <p>Missões: aceite até oito, cumpra objetivos e resgate ouro/XP aqui. Duelo rápido: uma batalha por turnos ajustada ao nível, separada do torneio. Corrida: alcance o marco do cume em 90 segundos. Cerco: resista 35 segundos e derrote cinco guardiões antes de 60 segundos. Oficinas restauram vida e especial gratuitamente. Relíquias profundas rendem recompensas únicas.</p>
        <p>O mapa mostra apenas trechos explorados. Lanternas acesas permitem teleporte. Regiões já descobertas podem ser selecionadas no mapa para visualizar suas rotas. O progresso é salvo automaticamente.</p>
      </div> : <>
        {missions.length === 0 && <p style={{ color: "#9fbccc" }}>Nenhuma missão ativa. Aceite uma na aba MISSÕES.</p>}
        {missions.map(m => {
          const q = save.quests[m.id], progress = missionProgress(save, m);
          return <article key={m.id} style={{ border: "2px solid #284859", padding: 12, marginBottom: 10, background: "#0a1625" }}>
            <div className="mk-title" style={{ color: q?.done ? "#57d76a" : "#ffb43a", fontSize: 8 }}>{m.name}</div>
            <p style={{ color: "#b4cddc", fontSize: 12 }}>{m.desc}</p>
            <div className="mk-title" style={{ fontSize: 7, color: "#35e2f0", marginBottom: 10 }}>{q ? `${progress}/${m.target}` : `META ${m.target}`} · {m.gold}$ + {m.xp}XP</div>
            <button className="mk-btn" data-testid={`mission-${m.kind}`} disabled={q?.done || (!!q && progress < m.target)} onClick={() => {
              if (q) claimMission(save, m); else acceptMission(save, m);
              onPersist(); refresh(v => v + 1);
            }}>{q?.done ? "CONCLUIDA" : q ? progress >= m.target ? "RESGATAR" : "EM ANDAMENTO" : "ACEITAR"}</button>
          </article>;
        })}
      </>}
    </div>
  </div>;
}