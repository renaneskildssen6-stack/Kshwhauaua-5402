import type { GameState } from "./save";
import type { DimensionId, ExpansionState } from "./expansion";

export type PowerProtocol = "balanced" | "surge" | "reserve";
export type ExpeditionApproach = "balanced" | "survey" | "cargo";
export type DrillBranch = "str" | "def" | "agl";
export type GateBlessing = "vital" | "power" | "supplies";
export interface CityDevelopment {
  protocol: PowerProtocol;
  capacitor: number;
  routeResearch: Record<string, number>;
  drillCharges: number;
  drills: Record<string, Partial<Record<DrillBranch, number>>>;
  resonance: Record<string, number>;
  attunement: Record<string, number>;
  tracked: string[];
  milestones: number[];
}
export const PROTOCOLS: { id: PowerProtocol; name: string; desc: string }[] = [
  { id: "balanced", name: "EQUILÍBRIO", desc: "Geração normal; +2 de carga por batalha." },
  { id: "surge", name: "SOBRECARGA", desc: "+3 energia por batalha; não carrega o capacitor." },
  { id: "reserve", name: "RESERVA", desc: "−1 energia por batalha; +5 de carga armazenada." },
];
export const APPROACHES: { id: ExpeditionApproach; name: string; desc: string }[] = [
  { id: "balanced", name: "EXPLORAÇÃO", desc: "Provisões e recompensas equilibradas." },
  { id: "survey", name: "CARTOGRAFIA", desc: "+4 provisões, −8% risco; carga −20%; escanear custa 1 provisão." },
  { id: "cargo", name: "RECUPERAÇÃO", desc: "+35% carga, +10% risco; −2 provisões iniciais." },
];
export const BLESSINGS: { id: GateBlessing; name: string; desc: string }[] = [
  { id: "vital", name: "ÂNCORA VITAL", desc: "+20 HP máximo por nível de calibração." },
  { id: "power", name: "LÂMINA ASTRAL", desc: "+3 STR e +2 AGL por nível de calibração." },
  { id: "supplies", name: "CARGA DE RESGATE", desc: "+1 reparo e +1 célula por nível de calibração." },
];
export const CHALLENGES = [
  { tier: 0, name: "EXPLORAÇÃO", scale: 1, reward: 1, cost: 10 },
  { tier: 1, name: "VETERANO", scale: 1.18, reward: 1.35, cost: 14 },
  { tier: 2, name: "CATACLISMO", scale: 1.4, reward: 1.8, cost: 18 },
] as const;
export const SET_NAMES = ["CRONAL", "ABISSAL", "FORJA", "RAÍZES", "ASTRAL", "REGAL"];
export const SET_STATS = ["AGL", "HP", "STR", "DEF", "MP", "STR"];
export function initialCityDevelopment(): CityDevelopment {
  return { protocol: "balanced", capacitor: 0, routeResearch: {}, drillCharges: 2, drills: {}, resonance: {}, attunement: {}, tracked: [], milestones: [] };
}
const clamp = (value: unknown, max: number, fallback = 0): number => typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : fallback;
function levels(raw: Record<string, number> | undefined, max: number) {
  return Object.fromEntries(Object.entries(raw ?? {}).map(([key, value]) => [key, clamp(value, max)]));
}
export function normalizeCityDevelopment(raw?: Partial<CityDevelopment>): CityDevelopment {
  const base = initialCityDevelopment();
  return { ...base, protocol: PROTOCOLS.some((p) => p.id === raw?.protocol) ? raw!.protocol! : "balanced",
    capacitor: clamp(raw?.capacitor, 100), drillCharges: clamp(raw?.drillCharges, 5, 2),
    routeResearch: levels(raw?.routeResearch, 3), resonance: levels(raw?.resonance, 3), attunement: levels(raw?.attunement, 3),
    drills: Object.fromEntries(Object.entries(raw?.drills ?? {}).map(([id, values]) => [id, { str: clamp(values?.str, 20), def: clamp(values?.def, 20), agl: clamp(values?.agl, 20) }])),
    tracked: [...new Set(raw?.tracked ?? [])].filter((id) => /^contract_\d+_\d+$/.test(id)).slice(0, 3),
    milestones: [...new Set(raw?.milestones ?? [])].filter((n) => [15, 45, 90, 180, 360].includes(n)),
  };
}
export function capacitorCap(e: ExpansionState) { return 20 + e.plant * 5 + (e.distribution.power ?? 0) * 3; }
export function generation(e: ExpansionState) { return Math.max(1, 3 + e.plant + Math.floor((e.distribution.power ?? 0) / 2) + (e.development.protocol === "surge" ? 3 : e.development.protocol === "reserve" ? -1 : 0)); }
export function capacitorGain(e: ExpansionState) { return e.development.protocol === "reserve" ? 5 : e.development.protocol === "surge" ? 0 : 2; }
export function talentCost(e: ExpansionState, tier: number) { return Math.ceil((120 + tier * 180) * (1 - Math.max(0, (e.distribution.academy ?? 0) - 1) * .05)); }
export function routeCost(e: ExpansionState, id: string, base: number) { return Math.max(4, base - (e.development.routeResearch[id] ?? 0) * 2); }
export function routeDanger(e: ExpansionState, id: string, base: number, approach: ExpeditionApproach = "balanced", salvage = false) {
  return Math.max(0, Math.min(95, base + (salvage ? 20 : 0) - (e.distribution.observatory ?? 0) * 3 - (e.development.routeResearch[id] ?? 0) * 5 + (approach === "survey" ? -8 : approach === "cargo" ? 10 : 0)));
}
export function gateTierUnlocked(g: GameState, id: DimensionId, tier: number) { return tier === 0 || (g.expansion.counters[`${id}Wins`] ?? 0) >= (tier === 1 ? 1 : 3); }
export function contractRank(count: number) { return count >= 180 ? "LENDA" : count >= 90 ? "COMANDANTE" : count >= 45 ? "VETERANO" : count >= 15 ? "AGENTE" : "RECRUTA"; }