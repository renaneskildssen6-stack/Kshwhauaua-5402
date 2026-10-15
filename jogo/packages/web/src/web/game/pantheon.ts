/**
 * Panteão — regras puras do modo exclusivo de 27 chassis do catálogo.
 *
 * Para despertar um chassi do Panteão o piloto precisa, nesta ordem lógica:
 *  1. vencer as 3 provações (batalhas) daquele deus, em sequência;
 *  2. cumprir as 3 missões do deus (nível, vitórias e um desafio próprio);
 *  3. ofertar diamantes — no mínimo 100 por robô (100…300).
 * Esses chassis não são prêmio de torneio, cápsula, loja ou contrato:
 * esta é a única fonte (ver `summonPantheon` em save.ts).
 */
import type { RobotSave } from "./engine";
import { randomEnemyTeam, teamAverageLevel } from "./modes";
import {
  PANTHEON_IDS,
  PANTHEON_OF,
  PANTHEONS,
  isPantheonRobot,
  robotsOf,
  type PantheonDef,
  type PantheonId,
} from "./pantheon-roster";

export const TRIAL_STAGES = 3;
export const MIN_OFFERING = 100;

export interface PantheonState {
  /** provações vencidas por deus (0…3). */
  wins: Record<string, number>;
  /** deuses cuja provação final foi vencida sem perder nenhum robô. */
  flawless: string[];
}

export const initialPantheon = (): PantheonState => ({ wins: {}, flawless: [] });

/** Aceita save vazio/antigo/corrompido; só mantém ids do Panteão válidos. */
export function normalizePantheon(raw: unknown): PantheonState {
  const out = initialPantheon();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Partial<PantheonState>;
  if (r.wins && typeof r.wins === "object") {
    for (const [id, v] of Object.entries(r.wins)) {
      const n = Math.floor(Number(v));
      if (isPantheonRobot(id) && Number.isFinite(n) && n > 0) out.wins[id] = Math.min(TRIAL_STAGES, n);
    }
  }
  if (Array.isArray(r.flawless)) out.flawless = [...new Set(r.flawless.filter((id) => typeof id === "string" && isPantheonRobot(id)))];
  return out;
}

export type MissionKind = "level" | "wins" | "collection" | "tournaments" | "flawless";

export interface MissionDef {
  id: string;
  kind: MissionKind;
  n: number;
  label: string;
}

export interface MythicTrial {
  id: string;
  pantheon: PantheonId;
  tier: number;
  cost: number;
  missions: MissionDef[];
}

export interface PantheonProgressView {
  playerLevel: number;
  battlesWon: number;
  robots: { id: string }[];
  wonTournaments: string[];
  diamonds: number;
  pantheon: PantheonState;
}

function third(id: string, tier: number): MissionDef {
  switch (tier % 3) {
    case 0:
      return { id: `${id}_col`, kind: "collection", n: 8 + tier * 4, label: `Possua ${8 + tier * 4} robôs no hangar` };
    case 1:
      return { id: `${id}_tour`, kind: "tournaments", n: 1 + Math.floor(tier / 2), label: `Vença ${1 + Math.floor(tier / 2)} torneio(s) do Coliseu` };
    default:
      return { id: `${id}_flaw`, kind: "flawless", n: 1, label: "Vença a provação final sem perder nenhum robô" };
  }
}

export const TRIALS: Record<string, MythicTrial> = {};
for (const p of PANTHEONS) {
  robotsOf(p.id).forEach((id, tier) => {
    TRIALS[id] = {
      id,
      pantheon: p.id,
      tier,
      cost: MIN_OFFERING + tier * 25,
      missions: [
        { id: `${id}_lvl`, kind: "level", n: 6 + tier, label: `Alcance o nível ${6 + tier} de piloto` },
        { id: `${id}_win`, kind: "wins", n: 15 + tier * 10, label: `Acumule ${15 + tier * 10} vitórias em batalha` },
        third(id, tier),
      ],
    };
  });
}

export function pantheonDef(id: PantheonId): PantheonDef {
  return PANTHEONS.find((p) => p.id === id) ?? PANTHEONS[0];
}

export function trialOf(id: string): MythicTrial | null {
  return TRIALS[id] ?? null;
}

export function trialWins(s: PantheonProgressView, id: string): number {
  return Math.max(0, Math.min(TRIAL_STAGES, s.pantheon.wins[id] ?? 0));
}

export function missionProgress(s: PantheonProgressView, trialId: string, m: MissionDef): number {
  switch (m.kind) {
    case "level":
      return s.playerLevel;
    case "wins":
      return s.battlesWon;
    case "collection":
      return s.robots.length;
    case "tournaments":
      return s.wonTournaments.length;
    case "flawless":
      return s.pantheon.flawless.includes(trialId) ? 1 : 0;
  }
}

export function missionDone(s: PantheonProgressView, trialId: string, m: MissionDef): boolean {
  return missionProgress(s, trialId, m) >= m.n;
}

export function ownsMythic(s: PantheonProgressView, id: string): boolean {
  return s.robots.some((r) => r.id === id);
}

export type SummonBlock = "unknown" | "owned" | "battles" | "missions" | "diamonds" | null;

/** Por que ainda não dá para despertar (null = pode). */
export function summonBlock(s: PantheonProgressView, id: string): SummonBlock {
  const t = trialOf(id);
  if (!t) return "unknown";
  if (ownsMythic(s, id)) return "owned";
  if (trialWins(s, id) < TRIAL_STAGES) return "battles";
  if (!t.missions.every((m) => missionDone(s, id, m))) return "missions";
  if (s.diamonds < t.cost) return "diamonds";
  return null;
}

export function canSummon(s: PantheonProgressView, id: string): boolean {
  return summonBlock(s, id) === null;
}

export interface TrialStage {
  label: string;
  arena: string;
  enemies: RobotSave[];
  reward: number;
  boss: boolean;
}

/** Provação `stage` (0…2) do deus: guardiões ouro e, na última, o próprio chassi. */
export function trialStage(id: string, stage: number, team: RobotSave[]): TrialStage {
  const t = trialOf(id);
  const tier = t?.tier ?? 0;
  const pan = pantheonDef(t?.pantheon ?? "norse");
  const base = Math.max(teamAverageLevel(team), 8 + tier * 3) + stage * 2;
  const trained = 2 + tier + stage * 2;
  const save = (rid: string, lv: number, tr: number): RobotSave => ({ id: rid, level: lv, xp: 0, trained: { str: tr, def: tr, agl: tr } });
  if (stage >= TRIAL_STAGES - 1) {
    return {
      label: `PROVAÇÃO FINAL · ${pan.name}`,
      arena: pan.arena,
      enemies: [save(id, base + 3, trained + 3), ...randomEnemyTeam({ level: base, count: 2, trained, rarity: "gold" })],
      reward: 3 + tier * 0.25,
      boss: true,
    };
  }
  return {
    label: `PROVAÇÃO ${stage + 1}/${TRIAL_STAGES} · ${pan.name}`,
    arena: pan.arena,
    enemies: randomEnemyTeam({ level: base, count: 2 + stage, trained, rarity: "gold" }),
    reward: 1.6 + stage * 0.6,
    boss: false,
  };
}

export const PANTHEON_COUNT = PANTHEON_IDS.length;
export { PANTHEON_IDS, PANTHEON_OF, PANTHEONS, isPantheonRobot, robotsOf };
export type { PantheonDef, PantheonId };
