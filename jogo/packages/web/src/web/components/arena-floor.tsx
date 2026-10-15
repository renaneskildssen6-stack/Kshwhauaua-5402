import type { CSSProperties } from "react";

/**
 * Chao de batalha: cada arena tem material, cor e brilho proprios.
 * O `Ground` cobre a faixa inteira do palco e o `Plinth` e a plataforma
 * em perspectiva onde cada robo pisa (jogador e inimigo).
 */

type Kind = "planks" | "tiles" | "diamond" | "cracks" | "speckle" | "hex" | "carpet" | "waves";

interface FloorDef {
  kind: Kind;
  art?: string;
  base: string;
  light: string;
  dark: string;
  line: string;
  glow: string;
}

const FLOORS: Record<string, FloorDef> = {
  dojo: { kind: "planks", base: "#8a5a34", light: "#b98250", dark: "#4a2c18", line: "#3b2212", glow: "#f2c37a" },
  neodojo: { kind: "tiles", base: "#1b1440", light: "#2c2170", dark: "#0b0722", line: "#19e6ff", glow: "#ff3df0" },
  volcano: { kind: "cracks", base: "#3a2420", light: "#5b3a30", dark: "#170c0a", line: "#ff6a1a", glow: "#ff8a2a" },
  foundry: { kind: "diamond", base: "#5c6068", light: "#858a94", dark: "#25272c", line: "#33363c", glow: "#ffb04a" },
  orbital: { kind: "tiles", base: "#6d7a92", light: "#9aa8c4", dark: "#2d3548", line: "#3f4b66", glow: "#4fd6ff" },
  frozen: { kind: "cracks", base: "#9cc8e6", light: "#d4efff", dark: "#4d7ea3", line: "#e9f8ff", glow: "#bfeaff" },
  crystal: { kind: "hex", base: "#4b2f8a", light: "#7a55d0", dark: "#1f1245", line: "#c9a6ff", glow: "#b980ff" },
  sky: { kind: "tiles", base: "#e7e2d4", light: "#fffaf0", dark: "#9a93a8", line: "#c9b27a", glow: "#fff2b0" },
  storm: { kind: "speckle", base: "#2f3a52", light: "#4a5778", dark: "#111724", line: "#ffe45c", glow: "#9fc3ff" },
  sunken: { kind: "waves", base: "#2f7a73", light: "#52b3a6", dark: "#123e3b", line: "#7ff0d6", glow: "#6df5e0" },
  canyon: { kind: "cracks", base: "#c48a52", light: "#e6b274", dark: "#7a4a26", line: "#8c5a30", glow: "#ffd08a" },
  necroforge: { kind: "diamond", base: "#2b3b36", light: "#44594f", dark: "#0f1613", line: "#6cff9a", glow: "#4dff88" },
  biodome: { kind: "speckle", base: "#3c8a3c", light: "#68c056", dark: "#17441c", line: "#a8e86a", glow: "#c8ff8a" },
  necropolis: { kind: "tiles", base: "#5a5266", light: "#847a94", dark: "#24202c", line: "#b9a8d6", glow: "#c08cff" },
  spire: { kind: "tiles", base: "#d9c9a0", light: "#fff0c4", dark: "#8e7a4a", line: "#c7a24a", glow: "#ffe08a" },
  trench: { kind: "waves", base: "#10304f", light: "#1c5a86", dark: "#050f1d", line: "#2fe0c8", glow: "#30f0d0" },
  throne: { kind: "carpet", base: "#8a1626", light: "#b82a3c", dark: "#3c0610", line: "#f0c04a", glow: "#ffd35a" },
};

for (const [id, art] of Object.entries({ dojo: "wood", neodojo: "crystal", volcano: "lava", foundry: "steel", orbital: "steel", frozen: "ice", crystal: "crystal", sky: "ice", storm: "steel", sunken: "abyss", canyon: "wood", necroforge: "steel", biodome: "forest", necropolis: "abyss", spire: "royal", trench: "abyss", throne: "royal" })) FLOORS[id].art = art;

for (const [id, parent] of Object.entries({"archive": "neodojo", "aurora": "frozen", "crown": "throne", "forge": "foundry", "genesis": "biodome", "graveyard": "necropolis", "hangar": "foundry", "orbit": "orbital", "reactor": "storm", "rift": "orbital", "skyfall": "sky", "swarm": "biodome", "tundra": "frozen", "undercity": "neodojo", "m_draft": "foundry", "m_caravan": "canyon", "m_rift": "orbital", "m_mirror": "crystal", "m_siege": "foundry", "m_hunt": "neodojo", "m_reactors": "storm", "m_mono": "crystal", "m_stakes": "throne", "m_maze": "biodome"})) FLOORS[id] = { ...FLOORS[parent] };

const FALLBACK: FloorDef = FLOORS.dojo;

export function floorOf(arena: string): FloorDef {
  return FLOORS[arena] ?? FALLBACK;
}

/** IA-generated material; CSS supplies perspective and lighting only. */
function texture(f: FloorDef): string {
  return `url(/battle-floors/${f.art ?? "wood"}.webp)`;
}

export function preloadFloorArt(arena: string) {
  const image = new Image();
  image.src = `/battle-floors/${floorOf(arena).art ?? "wood"}.webp`;
  void image.decode().catch(() => undefined);
}

/** Faixa de chao que cobre todo o palco, com o material da arena. */
export function Ground({ arena }: { arena: string }) {
  const f = floorOf(arena);
  const style: CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -76,
    height: 160,
    zIndex: 0,
    pointerEvents: "none",
    imageRendering: "pixelated",
    borderTop: `3px solid ${f.glow}`,
    boxShadow: `0 -6px 18px ${f.glow}55`,
    backgroundImage: `linear-gradient(180deg, ${f.dark}88, transparent 45%, ${f.dark}aa), ${texture(f)}`,
    backgroundColor: f.base,
    backgroundSize: "auto, 256px 256px",
    transform: "perspective(600px) rotateX(48deg) scaleX(1.15)",
    opacity: 0.88,
    WebkitMaskImage: "linear-gradient(180deg, transparent, #000 20%, #000 60%, transparent)",
    maskImage: "linear-gradient(180deg, transparent, #000 20%, #000 60%, transparent)",
  };
  return <div className="mk-ground" aria-hidden data-floor={arena} style={style} />;
}

/** Plataforma em perspectiva sob um robo. */
export function Plinth({ arena, side, size = 132 }: { arena: string; side: "player" | "enemy"; size?: number }) {
  const f = floorOf(arena);
  const W = size * 1.4;
  const H = size * .88;
  const wrap: CSSProperties = {
    position: "absolute",
    left: "50%",
    bottom: -34,
    width: W,
    height: H * 0.5,
    marginLeft: -W / 2,
    zIndex: 0,
    pointerEvents: "none",
    perspective: 420,
  };
  const slab: CSSProperties = {
    position: "absolute",
    left: 0,
    top: -H * 0.25,
    width: W,
    height: H,
    transform: "rotateX(62deg)",
    transformOrigin: "50% 50%",
    borderRadius: "14%",
    imageRendering: "pixelated",
  };
  return (
    <div aria-hidden data-plinth={side} style={wrap}>
      <div
        style={{
          ...slab,
          transform: "rotateX(62deg) translateZ(-9px)",
          background: f.dark,
          boxShadow: `0 0 22px ${f.glow}66`,
        }}
      />
      <div
        style={{
          ...slab,
          backgroundImage: `linear-gradient(180deg, ${f.light}33, transparent 45%, ${f.dark}66), ${texture(f)}`,
          backgroundSize: "auto, 100% 100%",
          backgroundColor: f.base,
          border: `3px solid ${f.glow}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "36%",
          width: 88,
          height: 16,
          marginLeft: -44,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,0,0,0.5), rgba(0,0,0,0))",
        }}
      />
    </div>
  );
}
