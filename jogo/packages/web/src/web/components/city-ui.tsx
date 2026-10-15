import type { ReactNode } from "react";
import { TopBar } from "@/screens/roster";
import { useGame } from "@/game/save";
import { CITY_LABELS, energyCap, type CitySystem } from "@/game/expansion";

export function CityPage({ system, onBack, children }: { system: CitySystem; onBack: () => void; children: ReactNode }) {
  const g = useGame();
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
    <TopBar title={CITY_LABELS[system]} gold={g.gold} onBack={onBack} />
    <div className="mk-scroll mk-exp-body">
      <header style={{ display: "flex", alignItems: "center", gap: 12, background: "#070b14", padding: 8, flexShrink: 0 }}>
        <img src={`/city/b_${system}.png`} alt="" style={{ width: 70, height: 76, objectFit: "contain", imageRendering: "pixelated" }} />
        <div><div className="mk-title mk-exp-title">{CITY_LABELS[system]}</div>
          <div className="mk-exp-copy">ENERGIA {g.expansion.energy}/{energyCap(g.expansion.plant)}<br />REPUTAÇÃO {g.expansion.reputation}</div>
        </div>
      </header>
      {children}
    </div>
  </div>;
}
export function Progress({ value, max }: { value: number; max: number }) {
  return <div className="mk-exp-progress" role="progressbar" aria-valuenow={Math.min(value, max)} aria-valuemin={0} aria-valuemax={max}><div style={{ width: `${Math.min(100, value / Math.max(1, max) * 100)}%` }} /></div>;
}
export function CityNotice({ children }: { children: ReactNode }) { return <div role="status" className="mk-exp-copy" style={{ color: "var(--mk-accent2)", padding: 6 }}>{children}</div>; }