/**
 * Fase H1 — registro dos 256 kits autorais.
 *
 * `KITS` e a fonte de verdade das habilidades de cada chassi. O jogo sempre
 * pergunta por `kitOf(id)`: quando o lote autoral daquele robô ainda não
 * existe, ele recebe um kit derivado do gerador antigo (skills.ts/buildKit)
 * — assim nada quebra e o jogo nunca fica sem skills.
 */

import { ROBOT_MAP } from "../robots";
import { buildKit, defaultLoadout } from "../skills";
import { detectElement } from "../elements";
import { B01 } from "./b01";
import { B02 } from "./b02";
import { B03 } from "./b03";
import { B04 } from "./b04";
import { B05 } from "./b05";
import { B06 } from "./b06";
import { B07 } from "./b07";
import { B08 } from "./b08";
import { ENEMY_KITS } from "./enemies";
import {
  emptyKit,
  mechList,
  type AiProfile,
  type Kit,
  type KitSkill,
  type MechId,
} from "./types";

const BATCHES: Kit[][] = [B01, B02, B03, B04, B05, B06, B07, B08, ENEMY_KITS];

export const KITS: Record<string, Kit> = {};
for (const batch of BATCHES) {
  for (const kit of batch) {
    if (!kit?.robotId) continue;
    KITS[kit.robotId] = kit;
  }
}

export const KIT_IDS: string[] = Object.keys(KITS);
export const KIT_COUNT = KIT_IDS.length;

/** Kits existentes, na ordem dos lotes (usado no codex). */
export const KIT_LIST: Kit[] = KIT_IDS.map((id) => KITS[id]);

const DEFAULT_AI: AiProfile = {
  role: "agressor",
  finishPriority: 55,
  conservation: 45,
  gambit: 50,
  selfCare: 35,
};

/** Kit derivado do gerador antigo, para robôs ainda sem lote autoral. */
function legacyKit(robotId: string): Kit {
  const def = ROBOT_MAP[robotId];
  const element = detectElement(def?.element ?? "");
  const raw = buildKit({
    id: robotId,
    element: def?.element ?? element,
    names: [
      `${def?.name ?? "CHASSI"} · GOLPE`,
      `${def?.name ?? "CHASSI"} · IMPACTO`,
      `${def?.name ?? "CHASSI"} · SENTENÇA`,
      `${def?.name ?? "CHASSI"} · MURALHA`,
    ],
    effect: { type: "burn", power: 12, turns: 2, chance: 0.5 },
    vfxStrong: "/vfx/impact.png",
    vfxSpecial: "/vfx/explosion.png",
  });
  const kit = emptyKit(robotId);
  return {
    ...kit,
    element,
    attackElement: element,
    ai: DEFAULT_AI,
    skills: raw as KitSkill[],
    creed: "Chassi sem dossiê autoral — opera com o pacote padrão de fábrica.",
  };
}

const cache: Record<string, Kit> = {};

/** Kit de um robô: o autoral quando existe, senão o derivado. */
export function kitOf(robotId: string): Kit {
  const hit = cache[robotId];
  if (hit) return hit;
  const kit = KITS[robotId] ?? legacyKit(robotId);
  cache[robotId] = kit;
  return kit;
}

/** Skill de um kit pelo id, com fallback para a primeira do kit. */
export function kitSkill(robotId: string, skillId: string): KitSkill | null {
  const kit = kitOf(robotId);
  return kit.skills.find((s) => s.id === skillId) ?? null;
}

/** Skills de um robô (kit autoral ou derivado). Sempre devolve o objeto Skill. */
export function skillsOf(robotId: string): KitSkill[] {
  return kitOf(robotId).skills as KitSkill[];
}

/** Four attacks + two defenses; ultimate separate. */
export function defaultKitLoadout(robotId:string):string[] { return defaultLoadout(skillsOf(robotId)); }

/** Todas as mecanicas citadas por um kit (codex + validador). */
export function kitMechs(kit: Kit): MechId[] {
  const set = new Set<MechId>();
  for (const s of kit.skills) for (const m of mechList(s)) set.add(m);
  for (const p of kit.boss ?? []) for (const m of p.mech ?? []) set.add(m);
  if (kit.talent.mech) set.add(kit.talent.mech);
  return [...set];
}

export type { Kit, KitSkill };
export { emptyKit, mechList };
