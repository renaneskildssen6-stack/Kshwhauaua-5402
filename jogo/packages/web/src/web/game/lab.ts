/* ---------------------------------------------------------------------------
 * Fase F — Laboratório de construção de robôs.
 * O jogador monta o próprio chassi escolhendo cabeça, torso, braços, pernas,
 * módulo extra, paleta e núcleo elemental. Cada peça carrega stats fixos
 * (derivados de um hash estável do arquivo), então o mesmo conjunto sempre
 * resulta no mesmo robô — e o sprite é composto em runtime pelo compose.ts.
 * ------------------------------------------------------------------------- */

import { clearCustomSet, modularFace, modularStrip, setCustomSet } from "./compose";
import { ARMS, DECOS, HEADS, LEGS, TORSOS, hashId, type PartSet } from "./parts";
import {
  registerCustom,
  setFaceResolver,
  setSpriteResolver,
  unregisterCustom,
  type Ratios,
  type Rarity,
  type RobotDef,
} from "./robots";
import { buildKit, VFX, type SkillEffect } from "./skills";

export const LAB_PREFIX = "lab_";
export const isCustom = (id: string): boolean => id.startsWith(LAB_PREFIX);

// ------------------------------------------------------------------ paletas
export const LAB_HUES: { hue: number; name: string }[] = [
  { hue: 0, name: "AÇO CRU" },
  { hue: 14, name: "FERRUGEM" },
  { hue: 28, name: "ÂMBAR" },
  { hue: 46, name: "OURO" },
  { hue: 96, name: "CLOROFILA" },
  { hue: 140, name: "JADE" },
  { hue: 194, name: "CIANO" },
  { hue: 208, name: "COBALTO" },
  { hue: 222, name: "ABISSAL" },
  { hue: 236, name: "ÍNDIGO" },
  { hue: 278, name: "VIOLETA" },
  { hue: 320, name: "MAGENTA" },
  { hue: 336, name: "CARMIM" },
  { hue: 350, name: "SANGUE" },
];

// ------------------------------------------------------------------ núcleos
export interface CoreDef {
  id: string;
  element: string;
  desc: string;
  vfxStrong: string;
  vfxSpecial: string;
  effect: SkillEffect;
  bonus: Partial<Ratios>;
}

export const CORES: CoreDef[] = [
  {
    id: "chama",
    element: "CHAMA",
    desc: "Queima o alvo por 3 turnos.",
    vfxStrong: VFX.explosion,
    vfxSpecial: VFX.explosion,
    effect: { type: "burn", power: 16, turns: 3, chance: 0.75 },
    bonus: { str: 6, hp: -2 },
  },
  {
    id: "toxina",
    element: "TOXINA",
    desc: "Veneno corrói o chassi inimigo.",
    vfxStrong: VFX.void,
    vfxSpecial: VFX.void,
    effect: { type: "poison", power: 14, turns: 4, chance: 0.72 },
    bonus: { mp: 6, ag: 2 },
  },
  {
    id: "raio",
    element: "RAIO",
    desc: "Paralisa os servos do oponente.",
    vfxStrong: VFX.thunder,
    vfxSpecial: VFX.thunder,
    effect: { type: "paralyze", power: 22, turns: 2, chance: 0.6 },
    bonus: { ag: 8, def: -3 },
  },
  {
    id: "prisma",
    element: "PRISMA",
    desc: "Cega sensores com luz refratada.",
    vfxStrong: VFX.slash,
    vfxSpecial: VFX.levelup,
    effect: { type: "blind", power: 26, turns: 3, chance: 0.7 },
    bonus: { mp: 5, str: 3 },
  },
  {
    id: "gravidade",
    element: "GRAVIDADE",
    desc: "Prende o alvo no lugar.",
    vfxStrong: VFX.impact,
    vfxSpecial: VFX.void,
    effect: { type: "trapped", power: 20, turns: 2, chance: 0.55 },
    bonus: { def: 7, ag: -3 },
  },
  {
    id: "vampiro",
    element: "VAMPIRO",
    desc: "Drena energia a cada golpe.",
    vfxStrong: VFX.void,
    vfxSpecial: VFX.heal,
    effect: { type: "drain", power: 18, turns: 3, chance: 0.7 },
    bonus: { mp: 8, hp: 2 },
  },
  {
    id: "bastiao",
    element: "BASTIAO",
    desc: "Blindagem reduz o dano recebido.",
    vfxStrong: VFX.shield,
    vfxSpecial: VFX.shield,
    effect: { type: "damage_reduction", power: 24, turns: 3, chance: 1 },
    bonus: { def: 9, hp: 5, ag: -4 },
  },
  {
    id: "adrenalina",
    element: "ADRENALINA",
    desc: "Sobrecarrega os próprios sistemas.",
    vfxStrong: VFX.levelup,
    vfxSpecial: VFX.levelup,
    effect: { type: "adrenalin", power: 22, turns: 3, chance: 1 },
    bonus: { str: 7, ag: 4, def: -3 },
  },
  {
    id: "nanite",
    element: "NANITE",
    desc: "Auto-reparo contínuo do chassi.",
    vfxStrong: VFX.heal,
    vfxSpecial: VFX.heal,
    effect: { type: "hp_regen", power: 15, turns: 4, chance: 1 },
    bonus: { hp: 8, mp: 3, str: -3 },
  },
  {
    id: "ruina",
    element: "RUINA",
    desc: "Enfraquece a força do oponente.",
    vfxStrong: VFX.impact,
    vfxSpecial: VFX.explosion,
    effect: { type: "weakening", power: 26, turns: 3, chance: 0.75 },
    bonus: { str: 5, def: 3 },
  },
];

export const CORE_MAP: Record<string, CoreDef> = Object.fromEntries(
  CORES.map((c) => [c.id, c]),
);

// ------------------------------------------------------------- stats da peça
export type StatKey = "hp" | "mp" | "str" | "def" | "ag";

export interface PartStats {
  hp: number;
  mp: number;
  str: number;
  def: number;
  ag: number;
}

export type Slot = "head" | "torso" | "arm" | "leg" | "deco";

/** Peso de cada slot: quanto ele empurra em cada stat. */
const SLOT_BIAS: Record<Slot, PartStats> = {
  head: { hp: 2, mp: 12, str: 3, def: 3, ag: 7 },
  torso: { hp: 14, mp: 4, str: 4, def: 12, ag: 1 },
  arm: { hp: 2, mp: 3, str: 14, def: 4, ag: 4 },
  leg: { hp: 6, mp: 2, str: 3, def: 5, ag: 13 },
  deco: { hp: 3, mp: 6, str: 5, def: 5, ag: 5 },
};

const STAT_KEYS: StatKey[] = ["hp", "mp", "str", "def", "ag"];

/** Stats fixos de uma peça — determinísticos pelo nome do arquivo. */
export function partStats(slot: Slot, url: string): PartStats {
  const h = hashId(`${slot}:${url}`);
  const bias = SLOT_BIAS[slot];
  const out = {} as PartStats;
  STAT_KEYS.forEach((k, i) => {
    const roll = (h >>> (i * 5)) % 11; // 0..10
    const base = bias[k];
    out[k] = Math.round(base * (0.55 + roll * 0.09));
  });
  return out;
}

export function partLabel(slot: Slot, url: string): string {
  const file = url.split("/").pop() ?? url;
  const n = file.replace(/\.png$/, "");
  const num = n.replace(/[^0-9]/g, "");
  const alt = /b\d+$/.test(n) ? "MK-II" : "MK-I";
  const names: Record<Slot, string> = {
    head: "CRANIO",
    torso: "CHASSI",
    arm: "BRACO",
    leg: "PERNAS",
    deco: "MODULO",
  };
  return `${names[slot]} ${alt}-${String(Number(num) + 1).padStart(2, "0")}`;
}

export const SLOT_OPTIONS: Record<Slot, string[]> = {
  head: HEADS,
  torso: TORSOS,
  arm: ARMS,
  leg: LEGS,
  deco: DECOS,
};

export const SLOT_LABEL: Record<Slot, string> = {
  head: "CABECA",
  torso: "TORSO",
  arm: "BRACOS",
  leg: "PERNAS",
  deco: "MODULO",
};

// --------------------------------------------------------- robô customizado
export interface CustomRobot {
  id: string;
  name: string;
  core: string;
  head: string;
  torso: string;
  arm: string;
  leg: string;
  deco: string | null;
  hue: number;
  createdAt: number;
}

export interface LabDraft {
  name: string;
  core: string;
  head: string;
  torso: string;
  arm: string;
  leg: string;
  deco: string | null;
  hue: number;
}

export function emptyDraft(): LabDraft {
  return {
    name: "",
    core: CORES[0].id,
    head: HEADS[0],
    torso: TORSOS[0],
    arm: ARMS[0],
    leg: LEGS[0],
    deco: null,
    hue: LAB_HUES[6].hue,
  };
}

/** Soma dos stats das peças escolhidas. */
export function draftStats(d: LabDraft): PartStats {
  const parts: [Slot, string | null][] = [
    ["head", d.head],
    ["torso", d.torso],
    ["arm", d.arm],
    ["leg", d.leg],
    ["deco", d.deco],
  ];
  const total: PartStats = { hp: 0, mp: 0, str: 0, def: 0, ag: 0 };
  for (const [slot, url] of parts) {
    if (!url) continue;
    const s = partStats(slot, url);
    for (const k of STAT_KEYS) total[k] += s[k];
  }
  return total;
}

/** Converte stats brutos + núcleo nos ratios usados pela engine. */
export function draftRatios(d: LabDraft): Ratios {
  const s = draftStats(d);
  const core = CORE_MAP[d.core] ?? CORES[0];
  const mix = (v: number, bonus = 0) => Math.max(70, Math.min(140, 74 + v + bonus));
  return {
    hp: mix(s.hp, core.bonus.hp ?? 0),
    mp: mix(s.mp, core.bonus.mp ?? 0),
    str: mix(s.str, core.bonus.str ?? 0),
    def: mix(s.def, core.bonus.def ?? 0),
    ag: mix(s.ag, core.bonus.ag ?? 0),
    mv: 10,
    xv: 11,
  };
}

/** Potência total — usada para raridade e custo. */
export function draftPower(d: LabDraft): number {
  const r = draftRatios(d);
  return Math.round(r.hp + r.mp + r.str + r.def + r.ag);
}

export function draftRarity(d: LabDraft): Rarity {
  const p = draftPower(d);
  if (p >= 540) return "gold";
  if (p >= 480) return "silver";
  return "bronze";
}

/** Custo de construção: ouro + lingotes refinados da mina (Fase E). */
export function buildCost(d: LabDraft): { gold: number; bars: number } {
  const p = draftPower(d);
  return { gold: 900 + Math.max(0, p - 400) * 26, bars: 4 + Math.floor(Math.max(0, p - 400) / 24) };
}

/** Valor de ouro devolvido ao desmontar. */
export function scrapValue(c: CustomRobot): number {
  return Math.round(buildCost(toDraft(c)).gold * 0.45);
}

export function toDraft(c: CustomRobot): LabDraft {
  return {
    name: c.name,
    core: c.core,
    head: c.head,
    torso: c.torso,
    arm: c.arm,
    leg: c.leg,
    deco: c.deco,
    hue: c.hue,
  };
}

export function partSetOf(d: LabDraft): PartSet {
  return {
    head: d.head,
    torso: d.torso,
    arm: d.arm,
    leg: d.leg,
    deco: d.deco,
    hue: d.hue,
    sat: 1,
    bright: 1,
    scale: 0.86,
  };
}

const CHASSIS_BIO = [
  "Chassi montado à mão no laboratório da cidade.",
  "Protótipo experimental saído da bancada do jogador.",
  "Unidade única, soldada peça por peça no laboratório.",
  "Projeto autoral: cada módulo escolhido a dedo.",
];

/** Converte um robô customizado na definição que a engine entende. */
export function customToDef(c: CustomRobot): RobotDef {
  const d = toDraft(c);
  const core = CORE_MAP[c.core] ?? CORES[0];
  const ratios = draftRatios(d);
  return {
    id: c.id,
    name: c.name || "PROTOTIPO",
    element: core.element,
    rarity: draftRarity(d),
    ratios,
    bio: CHASSIS_BIO[hashId(c.id) % CHASSIS_BIO.length],
    names: [
      `GOLPE ${core.element}`,
      `IMPACTO ${core.element}`,
      `SENTENCA ${core.element}`,
      `NUCLEO ${core.element}`,
    ],
    skills: buildKit({
      id: c.id,
      element: core.element,
      names: [
        `GOLPE ${core.element}`,
        `IMPACTO ${core.element}`,
        `SENTENCA ${core.element}`,
        `NUCLEO ${core.element}`,
      ],
      effect: core.effect,
      vfxStrong: core.vfxStrong,
      vfxSpecial: core.vfxSpecial,
    }),
  };
}

/** Registra o robô no roster em runtime e liga o sprite composto. */
export function activateCustom(c: CustomRobot): RobotDef {
  setCustomSet(c.id, partSetOf(toDraft(c)));
  const def = customToDef(c);
  registerCustom(def);
  return def;
}

/** Desliga um robô customizado (desmonte). */
export function deactivateCustom(id: string): void {
  clearCustomSet(id);
  unregisterCustom(id);
}

/* Liga o compositor: ids "lab_" usam a tira montada em runtime. */
setSpriteResolver((id) => (isCustom(id) ? modularStrip(id) : null));
setFaceResolver((id) => (isCustom(id) ? modularFace(id) : null));

export function normalizeCustoms(list: unknown): CustomRobot[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((c): c is CustomRobot => Boolean(c) && typeof (c as CustomRobot).id === "string")
    .map((c) => ({
      id: c.id,
      name: String(c.name ?? "PROTOTIPO").slice(0, 14),
      core: CORE_MAP[c.core] ? c.core : CORES[0].id,
      head: HEADS.includes(c.head) ? c.head : HEADS[0],
      torso: TORSOS.includes(c.torso) ? c.torso : TORSOS[0],
      arm: ARMS.includes(c.arm) ? c.arm : ARMS[0],
      leg: LEGS.includes(c.leg) ? c.leg : LEGS[0],
      deco: c.deco && DECOS.includes(c.deco) ? c.deco : null,
      hue: typeof c.hue === "number" ? c.hue : 194,
      createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now(),
    }));
}

export function nextCustomId(existing: CustomRobot[]): string {
  let n = existing.length + 1;
  const taken = new Set(existing.map((c) => c.id));
  while (taken.has(`${LAB_PREFIX}${n}`)) n++;
  return `${LAB_PREFIX}${n}`;
}

export const LAB_MAX = 12;
