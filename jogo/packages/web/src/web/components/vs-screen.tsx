import { useEffect } from "react";
import { RobotSprite } from "@/components/pixel";
import { AchIcon, AnimBg, RankSeal } from "@/components/meta-ui";
import { CARD_BGS, MASTERY_RANKS, rankIndexOf, skinOfRobot } from "@/game/meta";
import { ROBOT_MAP } from "@/game/robots";
import { useGame } from "@/game/save";

const TOP = "polygon(0 0, 100% 0, 100% 46%, 0 54%)";
const BOTTOM = "polygon(0 54%, 100% 46%, 100% 100%, 0 100%)";

function hashBg(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CARD_BGS[h % CARD_BGS.length].id;
}

/** Tela de pre-batalha estilo jogo de luta: cortada ao meio, robo do jogador em cima e o oponente embaixo. */
export function VsScreen({
  playerId,
  enemyId,
  enemyLevel,
  label,
  onDone,
}: {
  playerId: string;
  enemyId: string;
  enemyLevel: number;
  label: string;
  onDone: () => void;
}) {
  const g = useGame();
  useEffect(() => {
    const id = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(id);
  }, [onDone]);
  const pm = g.mastery[playerId];
  const prk = rankIndexOf(pm?.pts ?? 0);
  const pdef = ROBOT_MAP[playerId];
  const edef = ROBOT_MAP[enemyId];

  return (
    <div
      onClick={onDone}
      style={{ position: "absolute", inset: 0, zIndex: 40, background: "#02060c", overflow: "hidden", cursor: "pointer" }}
    >
      {/* metade de cima: jogador */}
      <div className="mk-vs-top" style={{ position: "absolute", inset: 0, clipPath: TOP }}>
        <AnimBg bg={g.profile.bg} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55))" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "3%", height: "47%", display: "grid", placeItems: "center" }}>
          <RobotSprite robotId={playerId} size={300} skin={skinOfRobot(g, playerId)} fps={5} />
        </div>
        <div style={{ position: "absolute", left: 10, top: 10, display: "flex", gap: 4 }}>
          {g.profile.pins.map((id) => (
            <AchIcon key={id} id={id} size={34} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 10, bottom: "52%", textShadow: "0 2px 0 #000" }}>
          <div className="mk-title" style={{ fontSize: 13, color: "#fff" }}>{g.profile.name}</div>
          <div className="mk-title" style={{ fontSize: 7, color: "#ffe36a" }}>
            {pdef?.name} · {MASTERY_RANKS[prk].name}
          </div>
        </div>
        <div style={{ position: "absolute", right: 10, top: 8 }}>
          <RankSeal rank={prk} size={48} />
        </div>
      </div>

      {/* metade de baixo: oponente principal */}
      <div className="mk-vs-bottom" style={{ position: "absolute", inset: 0, clipPath: BOTTOM }}>
        <AnimBg bg={hashBg(enemyId)} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(40,0,0,0.5), rgba(0,0,0,0.15))" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "3%", height: "47%", display: "grid", placeItems: "center" }}>
          <RobotSprite robotId={enemyId} size={300} flip fps={5} />
        </div>
        <div style={{ position: "absolute", right: 10, top: "52%", textAlign: "right", textShadow: "0 2px 0 #000" }}>
          <div className="mk-title" style={{ fontSize: 13, color: "#ff8a8a" }}>{edef?.name ?? enemyId}</div>
          <div className="mk-title" style={{ fontSize: 7, color: "#fff" }}>
            NIVEL {enemyLevel} · {edef?.element?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* corte central */}
      <div
        style={{
          position: "absolute",
          left: "-5%",
          right: "-5%",
          top: "50%",
          height: 6,
          marginTop: -3,
          transform: "rotate(-1.8deg)",
          background: "linear-gradient(90deg, transparent, #fff 20%, #fff 80%, transparent)",
          boxShadow: "0 0 18px #fff, 0 0 40px #35e2f0",
        }}
      />
      <div
        className="mk-title mk-vs-badge"
        style={{ position: "absolute", left: "50%", top: "50%", fontSize: 44, color: "#ffe36a", textShadow: "0 4px 0 #b02a1a, 0 0 22px #ff5a2a", zIndex: 3 }}
      >
        VS
      </div>
      <div className="mk-title" style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", fontSize: 6, color: "#fff", textShadow: "0 1px 0 #000", zIndex: 3 }}>
        {label} — TOQUE PARA LUTAR
      </div>
    </div>
  );
}
