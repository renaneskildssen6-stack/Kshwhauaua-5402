import { getState, setState } from "./save";
import { ROUTES, DIMENSIONS, MISSIONS, MISSION_MAP, missionReady, relicSetCount, bump, energyCap } from "./expansion";
import { PROTOCOLS, capacitorCap, type PowerProtocol, type DrillBranch } from "./city-development";

export function setPowerProtocol(protocol: PowerProtocol): boolean {
  if (!PROTOCOLS.some((p) => p.id === protocol)) return false;
  setState((s) => ({ ...s, expansion: { ...s.expansion, development: { ...s.expansion.development, protocol } } }));
  return true;
}
export function dischargeCapacitor(): number {
  let amount = 0;
  setState((s) => {
    const e = s.expansion;
    amount = Math.min(e.development.capacitor, energyCap(e.plant) - e.energy);
    if (amount <= 0) return s;
    return { ...s, expansion: { ...bump(e, "energyEarned", amount), energy: e.energy + amount,
      development: { ...e.development, capacitor: e.development.capacitor - amount } } };
  });
  return amount;
}
export function powerPreset(preset: "balanced" | "exploration" | "combat"): boolean {
  if (!["balanced", "exploration", "combat"].includes(preset)) return false;
  setState((s) => {
    const order = preset === "exploration" ? ["observatory", "portal", "power", "museum", "contracts", "academy"] : preset === "combat" ? ["academy", "museum", "portal", "power", "contracts", "observatory"] : ["observatory", "academy", "museum", "portal", "contracts", "power"];
    const distribution = Object.fromEntries(order.map((key) => [key, 0]));
    for (let i = 0; i < 4 + s.expansion.plant * 2; i++) distribution[order[i % order.length]]++;
    return { ...s, expansion: { ...s.expansion, distribution, development: { ...s.expansion.development, capacitor: Math.min(s.expansion.development.capacitor, capacitorCap({ ...s.expansion, distribution })) } } };
  });
  return true;
}
export function upgradeRoute(id: string): boolean {
  const s = getState(), e = s.expansion, level = e.development.routeResearch[id] ?? 0;
  const cost = 250 * (level + 1);
  if (!ROUTES.some((r) => r.id === id) || level >= 3 || s.gold < cost || e.energy < 5 || !e.distribution.observatory || e.expedition) return false;
  setState((s) => ({ ...s, gold: s.gold - cost, expansion: { ...s.expansion, energy: s.expansion.energy - 5,
    development: { ...s.expansion.development, routeResearch: { ...s.expansion.development.routeResearch, [id]: level + 1 } } } }));
  return true;
}
export function runSimulation(robotId: string, branch: DrillBranch): boolean {
  const s = getState(), e = s.expansion, records = e.development.drills[robotId] ?? {}, n = records[branch] ?? 0;
  if (!["str", "def", "agl"].includes(branch) || !s.robots.some((r) => r.id === robotId) || n >= 20 || !e.development.drillCharges || !e.distribution.academy || e.energy < 2 || s.gold < 80) return false;
  const m = s.mastery[robotId] ?? { pts: 0, wins: 0, claimed: 0, winClaimed: 0 };
  setState((s) => ({ ...s, gold: s.gold - 80, mastery: { ...s.mastery, [robotId]: { ...m, pts: m.pts + 25 + e.distribution.academy * 3 } }, expansion: {
    ...bump(s.expansion, "simulations"), energy: s.expansion.energy - 2,
    development: { ...e.development, drillCharges: e.development.drillCharges - 1, drills: { ...e.development.drills, [robotId]: { ...records, [branch]: n + 1 } } },
  } }));
  return true;
}
export function upgradeResonance(set: number): boolean {
  const s = getState(), e = s.expansion, level = e.development.resonance[set] ?? 0;
  if (!Number.isInteger(set) || set < 0 || set > 5 || level >= 3 || relicSetCount(e, set) < 2 || !e.distribution.museum || s.gold < 400 * (level + 1) || e.energy < 6) return false;
  setState((s) => ({ ...s, gold: s.gold - 400 * (level + 1), expansion: { ...s.expansion, energy: s.expansion.energy - 6, development: { ...e.development, resonance: { ...e.development.resonance, [set]: level + 1 } } } }));
  return true;
}
export function calibrateGate(id: string): boolean {
  const s = getState(), e = s.expansion, level = e.development.attunement[id] ?? 0;
  if (!DIMENSIONS.some((m) => m.id === id) || level >= 3 || !e.distribution.portal || s.gold < 350 * (level + 1) || e.energy < 5) return false;
  setState((s) => ({ ...s, gold: s.gold - 350 * (level + 1), expansion: { ...s.expansion, energy: s.expansion.energy - 5, development: { ...e.development, attunement: { ...e.development.attunement, [id]: level + 1 } } } }));
  return true;
}
export function toggleTrackedContract(id: string): boolean {
  const s = getState(), e = s.expansion, tracked = e.development.tracked;
  if (!MISSION_MAP[id] || e.missionsClaimed.includes(id)) return false;
  if (!tracked.includes(id) && tracked.length >= 3) return false;
  setState((s) => ({ ...s, expansion: { ...s.expansion, development: { ...e.development, tracked: tracked.includes(id) ? tracked.filter((p) => p !== id) : [...tracked, id] } } }));
  return true;
}
/** A single atomic transaction, including newly unlocked ready chapters. */
export function claimContractChain(chain = -1): number {
  let claimed = 0;
  setState((s) => {
    let next = s;
    for (const m of MISSIONS) {
      if (chain >= 0 && m.chain !== chain || !missionReady(next, m)) continue;
      claimed++;
      next = { ...next, gold: next.gold + m.gold, diamonds: next.diamonds + m.diamonds, diamondsEarned: next.diamondsEarned + m.diamonds,
        expansion: { ...next.expansion, reputation: next.expansion.reputation + m.reputation + (next.expansion.distribution.contracts ?? 0), missionsClaimed: [...next.expansion.missionsClaimed, m.id] } };
    }
    if (!claimed) return s;
    return { ...next, expansion: { ...next.expansion, development: { ...next.expansion.development, tracked: next.expansion.development.tracked.filter((id) => !next.expansion.missionsClaimed.includes(id)) } } };
  });
  return claimed;
}
export const CONTRACT_MILESTONES = [15, 45, 90, 180, 360];
export function claimContractMilestone(count: number): boolean {
  const s = getState(), e = s.expansion;
  if (!CONTRACT_MILESTONES.includes(count) || e.missionsClaimed.length < count || e.development.milestones.includes(count)) return false;
  const diamonds = Math.max(3, Math.floor(count / 15));
  setState((s) => ({ ...s, gold: s.gold + count * 30, diamonds: s.diamonds + diamonds, diamondsEarned: s.diamondsEarned + diamonds,
    expansion: { ...s.expansion, development: { ...e.development, milestones: [...e.development.milestones, count] } } }));
  return true;
}