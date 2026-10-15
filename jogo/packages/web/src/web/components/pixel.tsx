import { useEffect, useRef, useState } from "react";
import { ANIM, FRAME, FRAMES, spriteUrl } from "@/game/robots";

type Clip = keyof typeof ANIM;

export function RobotSprite({
  robotId,
  clip = "idle",
  size = 128,
  flip = false,
  fps = 4,
  loop = true,
  onDone,
  dim = false,
  skin = null,
}: {
  robotId: string;
  clip?: Clip;
  size?: number;
  flip?: boolean;
  fps?: number;
  loop?: boolean;
  onDone?: () => void;
  dim?: boolean;
  skin?: { filter: string; aura?: string } | null;
}) {
  const frames = ANIM[clip];
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const n = frames.length;
  const first = frames[0];
  const scale = size / FRAME;
  const w = FRAME * scale;

  // Clipes de uma vez: avisa onDone por timer (não depende de re-render por frame).
  useEffect(() => {
    if (loop) return;
    const id = window.setTimeout(() => doneRef.current?.(), (n * 1000) / fps);
    return () => window.clearTimeout(id);
  }, [robotId, clip, fps, loop, n]);

  // Animação 100% CSS (steps) no compositor: zero setState por frame.
  const anim = `mk-rsprite ${n / fps}s steps(${n}) ${loop ? "infinite" : "1"}`;
  return (
    <div
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        position: "relative",
        transform: flip ? "scaleX(-1)" : undefined,
        filter: dim
          ? "grayscale(1) brightness(0.5)"
          : skin
            ? `${skin.filter}${skin.aura ? ` drop-shadow(0 0 5px ${skin.aura}) drop-shadow(0 0 10px ${skin.aura})` : ""}`
            : undefined,
      }}
    >
      <img
        key={`${clip}-${fps}-${loop ? 1 : 0}`}
        src={spriteUrl(robotId)}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: FRAME * FRAMES * scale,
          height: FRAME * scale,
          maxWidth: "none",
          ["--rs-a" as string]: `${-first * w}px`,
          ["--rs-b" as string]: `${-(first + n) * w}px`,
          transform: `translateX(${-(loop ? first : first + n - 1) * w}px)`,
          animation: anim,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

export function VfxSprite({
  url,
  size = 160,
  onDone,
}: {
  url: string;
  size?: number;
  onDone?: () => void;
}) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const id = window.setTimeout(() => doneRef.current?.(), 320);
    return () => window.clearTimeout(id);
  }, [url]);

  const cell = 96;
  const scale = size / cell;
  return (
    <div style={{ width: size, height: size, overflow: "hidden", position: "relative" }}>
      <img
        key={url}
        src={url}
        alt=""
        style={{
          position: "absolute",
          width: cell * 4 * scale,
          height: cell * scale,
          maxWidth: "none",
          ["--rs-a" as string]: "0px",
          ["--rs-b" as string]: `${-4 * cell * scale}px`,
          transform: `translateX(${-3 * cell * scale}px)`,
          animation: "mk-rsprite .32s steps(4) 1",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

export function PixelButton({
  children,
  onClick,
  disabled,
  variant = "wide",
  className = "",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "wide" | "square";
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`mk-btn ${variant === "square" ? "mk-btn-sq" : ""} ${className}`}
      style={{ fontSize: 10, lineHeight: "1.4" }}
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className = "",
  variant = "large",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "large" | "strip" | "card";
  style?: React.CSSProperties;
}) {
  const cls =
    variant === "large" ? "mk-panel" : variant === "strip" ? "mk-panel-sm" : "mk-card";
  return (
    <div className={`${cls} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <img
      src={`/ui/icon_${name}.png`}
      alt=""
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export function StatBar({
  kind,
  value,
  max,
  width = 140,
  showText = true,
}: {
  kind: "hp" | "mp" | "xp";
  value: number;
  max: number;
  width?: number;
  showText?: boolean;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const height = Math.round((22 / 151) * width);
  return (
    <div style={{ position: "relative", width, height }}>
      <img
        src="/ui/bar_frame.png"
        alt=""
        style={{ position: "absolute", inset: 0, width, height, imageRendering: "pixelated" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: width * pct,
          height,
          overflow: "hidden",
          transition: "width 220ms steps(6)",
        }}
      >
        <img
          src={`/ui/bar_${kind}.png`}
          alt=""
          style={{ width, height, imageRendering: "pixelated" }}
        />
      </div>
      {showText && (
        <span
          className="mk-title"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontSize: Math.max(6, Math.round(height * 0.42)),
            textShadow: "1px 1px 0 #000",
          }}
        >
          {Math.ceil(value)}/{max}
        </span>
      )}
    </div>
  );
}

export function Frame({
  rarity,
  children,
  size = 72,
}: {
  rarity: "bronze" | "silver" | "gold";
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", inset: size * 0.12 }}>{children}</div>
      <img
        src={`/ui/frame_${rarity}.png`}
        alt=""
        style={{ position: "absolute", inset: 0, width: size, height: size }}
      />
    </div>
  );
}

/** Fundos de arena: todos os frames vivem num unico spritesheet vertical. */
const ARENA_W = 480;
const ARENA_H = 272;
const ARENA_FRAMES = 4;

function strHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function ArenaBackdrop({
  arena,
  round,
  children,
}: {
  arena: string;
  round?: number;
  children?: React.ReactNode;
}) {
  // Telas pequenas/touch: sem vídeo decodificando atrás da luta (fluidez).
  const [lite] = useState(() => typeof window === "undefined" || !!window.matchMedia?.("(pointer: coarse), (max-width: 900px)").matches);
  /* O video de round e apenas uma CAMADA ATMOSFERICA por cima da arena.
     Antes ele vinha opaco com objectFit:cover e cobria o spritesheet inteiro,
     entao so os videos apareciam — e como a maioria das lutas dura poucos
     rounds, `round % 5` caia quase sempre nos dois primeiros arquivos.
     Agora: a escolha mistura arena + round (todos os 5 entram em rotacao) e
     ele entra em `screen` com opacidade baixa, deixando a arena dominar. */
  const videoSrc =
    round === undefined || lite
      ? null
      : `/videos/round${(strHash(arena) + Math.max(0, round)) % 5 + 1}.mp4`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#050910",
      }}
    >
      {/* spritesheet unico: 480 x (272*4), um frame por faixa.
          O bloco interno tem 400% da altura do palco, entao cada frame
          cobre exatamente o palco (cover) e o translateY troca o frame. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          height: `${ARENA_FRAMES * 100}%`,
          aspectRatio: `${ARENA_W} / ${ARENA_H * ARENA_FRAMES}`,
          minWidth: "100%",
          backgroundImage: `url(/arenas/${arena}_sheet.png)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          transform: "translateX(-50%)",
          animation: `mk-arena ${ARENA_FRAMES * 0.25}s steps(${ARENA_FRAMES}) infinite`,
          imageRendering: "pixelated",
        }}
      />
      {videoSrc && (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "pixelated",
            opacity: 0.16,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(rgba(4,9,18,0.28), rgba(4,9,18,0.05) 45%, rgba(4,9,18,0.55))",
        }}
      />
      {/* scanlines finas: dao textura de CRT sem esconder a arte da arena */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.55) 3px)",
        }}
      />
      <div style={{ position: "relative", height: "100%" }}>{children}</div>
    </div>
  );
}
