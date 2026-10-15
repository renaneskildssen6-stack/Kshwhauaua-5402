import { worldEffectFor } from "@/game/anim";

/** Partículas do clima e vinheta de perigo, sobre a arena e abaixo do HUD. */
export function Atmosphere({ arena, weather, danger }: { arena: string; weather: string; danger: number }) {
  const effect = worldEffectFor(arena, weather);
  return <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.16, backgroundImage: `url(/vfx/wld_${effect}.png)`, backgroundSize: "400% 100%", backgroundPosition: "0% 0", animation: "mk-atmo 1s steps(4) infinite", imageRendering: "pixelated" }} />
    <div className={danger < 0.25 ? "mk-danger" : undefined} style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 ${danger < 0.25 ? 100 : 55}px ${danger < 0.25 ? "rgba(226,69,58,0.65)" : "rgba(0,0,0,0.35)"}` }} />
  </div>;
}
