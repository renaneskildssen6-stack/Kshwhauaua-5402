import { useEffect, useState } from "react";
import { RobotSprite } from "@/components/pixel";

/**
 * Busto animado (anime pixel art) usado no cartão de foco do hangar.
 * Cada arquivo /robots/bust/{id}.webp é uma tira horizontal de frames quadrados;
 * o número de frames = largura / altura (9 ou 12). O loop dura sempre 1 s.
 * Fallback: sprite idle antigo (ids de laboratório, npc_ ou erro de carga).
 */

const STYLE_ID = "mk-bust-style";
function ensureStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent =
    "@keyframes mk-bust-play{from{transform:translateX(0)}to{transform:translateX(-100%)}}" +
    "@media (prefers-reduced-motion:reduce){.mk-bust-strip{animation:none!important}}";
  document.head.appendChild(s);
}

export function bustUrl(id: string): string {
  return `/robots/bust/${id}.webp`;
}

export function hasBust(id: string): boolean {
  return !id.startsWith("lab_") && !id.startsWith("npc_") && !id.startsWith("custom_");
}

export function RobotBust({
  robotId,
  size = 184,
  fallbackSize = 132,
}: {
  robotId: string;
  size?: number;
  fallbackSize?: number;
}) {
  const [frames, setFrames] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    ensureStyle();
    setFrames(0);
    setFailed(false);
  }, [robotId]);

  if (!hasBust(robotId) || failed) {
    return <RobotSprite robotId={robotId} clip="idle" size={fallbackSize} fps={4} />;
  }

  return (
    <div
      aria-hidden
      style={{ width: size, height: size, overflow: "hidden", position: "relative" }}
    >
      <img
        key={robotId}
        className="mk-bust-strip"
        src={bustUrl(robotId)}
        alt=""
        draggable={false}
        onLoad={(e) => {
          const im = e.currentTarget;
          setFrames(Math.max(1, Math.round(im.naturalWidth / Math.max(1, im.naturalHeight))));
        }}
        onError={() => setFailed(true)}
        style={{
          display: "block",
          height: size,
          width: frames ? size * frames : "auto",
          maxWidth: "none",
          imageRendering: "pixelated",
          opacity: frames ? 1 : 0,
          animation: frames > 1 ? `mk-bust-play 1s steps(${frames}) infinite` : undefined,
          filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.45))",
        }}
      />
    </div>
  );
}
