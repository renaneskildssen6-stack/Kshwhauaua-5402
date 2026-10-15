import { useEffect, useState } from "react";
import { RobotSprite } from "@/components/pixel";
import { ACH_MAP, cardBgUrl, MASTERY_RANKS, rankIndexOf, skinOfRobot } from "@/game/meta";
import { ROBOT_MAP } from "@/game/robots";
import { useGame } from "@/game/save";

/** Recorta uma celula de uma folha de sprites (grade cols x rows). */
export function Cell({
  src,
  cols,
  rows,
  index,
  size,
  style,
}: {
  src: string;
  cols: number;
  rows: number;
  index: number;
  size: number;
  style?: React.CSSProperties;
}) {
  const cx = index % cols;
  const cy = Math.floor(index / cols);
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${cols > 1 ? (cx / (cols - 1)) * 100 : 0}% ${rows > 1 ? (cy / (rows - 1)) * 100 : 0}%`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
}

export function AchIcon({ id, size = 44, locked = false }: { id: string; size?: number; locked?: boolean }) {
  const a = ACH_MAP[id];
  if (!a) return null;
  return (
    <Cell
      src={`/ui/ach${a.sheet}.png`}
      cols={10}
      rows={5}
      index={a.idx}
      size={size}
      style={locked ? { filter: "grayscale(1) brightness(0.45)" } : undefined}
    />
  );
}

export function RankSeal({ rank, size = 48 }: { rank: number; size?: number }) {
  return <Cell src="/ui/ranks.png" cols={4} rows={3} index={Math.min(11, Math.max(0, rank))} size={size} />;
}

export function DiamondIcon({ size = 14 }: { size?: number }) {
  return <Cell src="/ui/misc.png" cols={4} rows={3} index={0} size={size} />;
}

export function Diamonds({ n }: { n: number }) {
  return (
    <span className="mk-title" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, color: "#7fe4ff" }}>
      <DiamondIcon size={16} />
      {n.toLocaleString("pt-BR")}
    </span>
  );
}

/** Plano de fundo animado: 9 frames (3x3) na mesma imagem. */
export function AnimBg({ bg, style }: { bg: string; style?: React.CSSProperties }) {
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setF((p) => (p + 1) % 9), 140);
    return () => window.clearInterval(id);
  }, []);
  const cx = f % 3;
  const cy = Math.floor(f / 3);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${cardBgUrl(bg)})`,
        backgroundSize: "300% 300%",
        backgroundPosition: `${cx * 50}% ${cy * 50}%`,
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
}

/** Card de batalha do jogador: fundo animado, robo, nome, rank e ate 3 conquistas. */
export function BattleCard({
  robotId,
  height = 220,
  bg,
  name,
  pins,
  title,
  big = false,
}: {
  robotId: string;
  height?: number;
  bg?: string;
  name?: string;
  pins?: string[];
  title?: string;
  big?: boolean;
}) {
  const g = useGame();
  const skin = skinOfRobot(g, robotId);
  const m = g.mastery[robotId];
  const rk = rankIndexOf(m?.pts ?? 0);
  const pinList = pins ?? g.profile.pins;
  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden", border: "2px solid rgba(255,255,255,0.35)" }}>
      <AnimBg bg={bg ?? g.profile.bg} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: big ? 30 : 22, display: "grid", placeItems: "center" }}>
        <RobotSprite robotId={robotId} size={big ? height * 1.05 : height * 0.8} skin={skin} fps={4} />
      </div>
      <div style={{ position: "absolute", left: 6, top: 6, display: "flex", gap: 4 }}>
        {pinList.map((id) => (
          <AchIcon key={id} id={id} size={30} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 6, top: 6 }}>
        <RankSeal rank={rk} size={36} />
      </div>
      <div style={{ position: "absolute", left: 8, bottom: 6 }}>
        <div className="mk-title" style={{ fontSize: 9, color: "#fff", textShadow: "0 2px 0 #000" }}>
          {name ?? g.profile.name}
        </div>
        <div className="mk-title" style={{ fontSize: 6, color: "#ffe36a", textShadow: "0 1px 0 #000" }}>
          {(title ?? g.profile.title) || `${ROBOT_MAP[robotId]?.name ?? ""} · ${MASTERY_RANKS[rk].name}`}
        </div>
      </div>
    </div>
  );
}
