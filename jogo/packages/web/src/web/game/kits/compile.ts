/**
 * Fase H1 — compilador do dossiê autoral de um chassi em um `Kit` completo.
 *
 * O dossiê (b01..b08) traz o que é escrito à mão, robô por robô: família
 * elemental, recurso exclusivo, posição de formação, papel de IA, as duas
 * passivas, o talento, o punhado de mecânicas que assinam o kit, os status
 * temáticos e três palavras que batizam os golpes. Este arquivo só expande
 * isso em 10 ataques + 5 defesas coerentes — nunca inventa identidade.
 *
 * Os ids das skills são os mesmos do gerador antigo (`<id>_basic`, `<id>_def_guard`
 * ...), então loadouts já salvos continuam válidos.
 */

import { ROBOT_MAP } from "../robots";
import { detectElement, type ElementId } from "../elements";
import { STATUS_MAP } from "../status";
import { VFX } from "../skills";
import {
  MECH_SET,
  PASSIVE_SET,
  type AiProfile,
  type AiRole,
  type BossPhase,
  type Kit,
  type KitPassive,
  type KitSkill,
  type KitStatusApply,
  type KitTalent,
  type MechId,
  type Position,
  type ResourceId,
  type SkillTag,
  type TalentKind,
} from "./types";

/* ------------------------------------------------------------------ dossie */

export interface Dossier {
  id: string;
  /** família defensiva; omitida = derivada do elemento do blueprint. */
  el?: ElementId;
  /** família ofensiva quando difere. */
  atk?: ElementId;
  res: ResourceId;
  pos: Position;
  role: AiRole;
  /** duas passivas exclusivas. */
  pv: [string, string];
  /** [nome do talento, tipo, alvo (stat/status/mech), valor]. */
  tal: [string, TalentKind, string, number];
  /** mecânicas que assinam o kit. */
  mech: string[];
  /** status temáticos aplicados pelos golpes. */
  st: string[];
  /** três palavras autorais para batizar os golpes. */
  v: [string, string, string];
  /**
   * Nomes autorais dos quatro primeiros golpes (os três de abertura + a
   * defesa de guarda). Quando ausente, herda o pacote de fábrica do blueprint.
   */
  nm?: [string, string, string, string];
  /** true nos chassis ápice: ganha fases de chefe. */
  boss?: boolean;
  creed: string;
}

/* --------------------------------------------------------------- utilidades */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** VFX por família elemental (reuso puro dos 28 de public/vfx). */
export const ELEMENT_VFX: Record<string, string> = {
  IMPACTO: VFX.impact,
  LAMINA: VFX.slash,
  PERFURACAO: VFX.laser,
  FOGO: VFX.inferno,
  GELO: VFX.frost,
  ELETRICO: VFX.thunder,
  TOXICO: VFX.toxic,
  TERRA: VFX.quake,
  VENTO: VFX.cyclone,
  AGUA: VFX.torrent,
  LUZ: VFX.laser,
  SOMBRA: VFX.curse,
  COSMICO: VFX.cosmos,
  QUANTICO: VFX.plasma,
  BIO: VFX.bloom,
  METAL: VFX.clang,
  CRISTAL: VFX.prism,
  ARCANO: VFX.ward,
};

const SECONDARY = [
  VFX.explosion,
  VFX.shockwave,
  VFX.sonic,
  VFX.meteor,
  VFX.bloom,
  VFX.cosmos,
  VFX.chrono,
  VFX.siphon,
  VFX.prism,
  VFX.void,
  VFX.quake,
  VFX.torrent,
  VFX.cyclone,
  VFX.plasma,
  VFX.levelup,
  VFX.buffup,
];

function elementVfx(el: string, salt: number): string {
  const base = ELEMENT_VFX[el] ?? VFX.impact;
  if (salt % 3 === 0) return base;
  return SECONDARY[(salt + hash(el)) % SECONDARY.length] ?? base;
}

/* ------------------------------------------------------------------ tiers */

interface Tier {
  key: string;
  power: number;
  mp: number;
  role: "raw" | "effect" | "drain" | "buff" | "ultimate" | "burst";
  /** golpes por uso. */
  hits: number;
  /** cada golpe com dano cheio. */
  each?: boolean;
  /** turnos de carga. */
  charge?: number;
  /** prioridade na agenda do round. */
  priority?: number;
  /** alimenta o medidor de combo. */
  meter: number;
  /** true quando a skill gasta recurso alternativo. */
  spends: boolean;
  tag: SkillTag[];
}

const ATK_TIERS: Tier[] = [
  { key: "basic", power: 4, mp: 0, role: "raw", hits: 1, priority: 1, meter: 1, spends: false, tag: ["instantaneo"] },
  { key: "strong", power: 7, mp: 7, role: "raw", hits: 1, priority: 2, meter: 2, spends: false, tag: ["corpo"] },
  { key: "special", power: 5.5, mp: 12, role: "effect", hits: 1, priority: 3, meter: 2, spends: false, tag: ["controle"] },
  { key: "quick", power: 3.2, mp: 0, role: "raw", hits: 2, priority: 5, meter: 1, spends: false, tag: ["instantaneo", "corte"] },
  { key: "heavy", power: 8.4, mp: 17, role: "burst", hits: 1, charge: 1, priority: 1, meter: 3, spends: true, tag: ["carga", "explosao"] },
  { key: "elemental", power: 6.1, mp: 13, role: "effect", hits: 1, priority: 3, meter: 2, spends: false, tag: ["area"] },
  { key: "pierce", power: 6.7, mp: 15, role: "effect", hits: 1, priority: 4, meter: 2, spends: true, tag: ["perfurante", "projetil"] },
  { key: "siphon", power: 5.2, mp: 11, role: "drain", hits: 1, priority: 2, meter: 2, spends: false, tag: ["canalizado"] },
  { key: "overdrive", power: 4.8, mp: 10, role: "buff", hits: 1, priority: 6, meter: 2, spends: true, tag: ["suporte"] },
  { key: "ultimate", power: 10.6, mp: 28, role: "ultimate", hits: 1, priority: 8, meter: 5, spends: true, tag: ["ultimate", "area"] },
];

interface DefTier {
  key: string;
  kind: "guard" | "repair" | "purge" | "overcharge" | "counter";
  power: number;
  mp: number;
  pct?: number;
  turns: number;
  meter: number;
  tag: SkillTag[];
}

const DEF_TIERS: DefTier[] = [
  { key: "guard", kind: "guard", power: 48, mp: 6, turns: 2, meter: 1, tag: ["defesa"] },
  { key: "repair", kind: "repair", power: 18, mp: 11, pct: 30, turns: 3, meter: 1, tag: ["suporte", "defesa"] },
  { key: "purge", kind: "purge", power: 22, mp: 8, turns: 2, meter: 1, tag: ["defesa", "reacao"] },
  { key: "overcharge", kind: "overcharge", power: 0, mp: 0, pct: 32, turns: 3, meter: 2, tag: ["defesa", "suporte"] },
  { key: "counter", kind: "counter", power: 32, mp: 12, turns: 2, meter: 2, tag: ["reacao", "defesa"] },
];

/* ------------------------------------------------------------- vocabulario */

const SUF_QUICK = ["LAMPEJO", "SURTIDA", "AGULHADA", "SOPRO", "ESTALO", "CHICOTE", "PISCA", "FLECHA"];
const SUF_HEAVY = ["CICLONE", "MARTELO", "AVALANCHE", "CATACLISMA", "ESMAGADOR", "DILÚVIO", "ROMPANTE", "CRAVEIRA"];
const SUF_ELEM = ["TEMPESTADE", "VÓRTICE", "COROA", "SINFONIA", "MARÉ", "ECLIPSE", "TORMENTA", "AURORA"];
const SUF_PIERCE = ["LANÇA", "ESPETO", "AGULHA", "FURADEIRA", "VERTICAL", "CRAVO", "COSTURA", "SUTURA"];
const SUF_SIPHON = ["SIFÃO", "SUCÇÃO", "TRIBUTO", "COLHEITA", "DÍZIMO", "ESPONJA", "SEIVA", "SEDE"];
const SUF_OVER = ["RITUAL", "PROTOCOLO", "SOBRECARGA", "CÂNONE", "SELO", "GATILHO", "MANTRA", "CÓDIGO"];
const SUF_ULT = ["JULGAMENTO", "APOCALIPSE", "SENTENÇA", "ÚLTIMA ORDEM", "PROTOCOLO ÔMEGA", "DIA ZERO", "SINFONIA FINAL", "VEREDITO"];

const SUF_REPAIR = ["REGENERAÇÃO", "REPARO", "SUTURA", "RESSURREIÇÃO", "REMANUFATURA"];
const SUF_PURGE = ["PURGA", "LIMPEZA", "ABLUÇÃO", "MÁSCARA", "DEGELO"];
const SUF_OVERCH = ["RECARGA", "SOBRECARGA", "REATOR", "IGNIÇÃO", "TORRENTE"];
const SUF_COUNTER = ["CONTRA", "RÉPLICA", "REVANCHE", "PUNIÇÃO", "ECO"];

const FORMS = ["FORMA", "ESTÁGIO", "MODO", "NÍVEL", "FASE"];
const FORM_ROOTS = ["DESPERTA", "RASGA", "DEVORA", "COROA", "SELA", "ROMPE"];

function pool<T>(list: T[], salt: number, n: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(list[(salt + i * 3) % list.length]);
  return out;
}

/* --------------------------------------------------------------------- IA */

const ROLE_PROFILE: Record<AiRole, Omit<AiProfile, "role">> = {
  agressor: { finishPriority: 70, conservation: 25, gambit: 75, selfCare: 20, reactivity: 30 },
  guarda: { finishPriority: 35, conservation: 55, gambit: 35, selfCare: 70, reactivity: 65, focusPosition: "guarda" },
  artilheiro: { finishPriority: 75, conservation: 60, gambit: 65, selfCare: 25, focusPosition: "nucleo", reactivity: 25 },
  controlador: { finishPriority: 45, conservation: 50, gambit: 45, selfCare: 45, focusPosition: "suporte", reactivity: 55 },
  sanguessuga: { finishPriority: 60, conservation: 35, gambit: 55, selfCare: 60, reactivity: 35 },
  oportunista: { finishPriority: 85, conservation: 30, gambit: 60, selfCare: 30, reactivity: 45 },
  tatico: { finishPriority: 55, conservation: 65, gambit: 40, selfCare: 55, reactivity: 70 },
  suporte: { finishPriority: 25, conservation: 70, gambit: 30, selfCare: 85, focusPosition: "suporte", reactivity: 75 },
  tanque: { finishPriority: 30, conservation: 60, gambit: 25, selfCare: 80, focusPosition: "guarda", reactivity: 60 },
  assassino: { finishPriority: 90, conservation: 20, gambit: 80, selfCare: 15, focusPosition: "nucleo", reactivity: 20 },
};

/* -------------------------------------------------------------- compilador */

const ATK_SUFFIX: Record<string, string[]> = {
  quick: SUF_QUICK,
  heavy: SUF_HEAVY,
  elemental: SUF_ELEM,
  pierce: SUF_PIERCE,
  siphon: SUF_SIPHON,
  overdrive: SUF_OVER,
  ultimate: SUF_ULT,
};

const DEF_SUFFIX: Record<string, string[]> = {
  repair: SUF_REPAIR,
  purge: SUF_PURGE,
  overcharge: SUF_OVERCH,
  counter: SUF_COUNTER,
};

function statusApply(kit: Dossier, index: number, strong: boolean): KitStatusApply | undefined {
  const id = kit.st[index % kit.st.length];
  const def = STATUS_MAP[id];
  if (!def) return undefined;
  const magnitude = def.kind === "debuff" ? strong : true;
  return {
    s: id,
    p: strong ? 100 : 55 + (index % 4) * 10,
    t: 2 + (index % 3),
    v: magnitude ? 8 + index * 3 : undefined,
  };
}

export function compileKit(d: Dossier): Kit {
  const def = ROBOT_MAP[d.id];
  const seed = hash(d.id);
  const fallbackEl = detectElement(def?.element ?? "") as ElementId;
  const el = (d.el ?? fallbackEl) as string;
  const atkEl = (d.atk ?? el) as string;
  const names = d.nm ?? def?.names ?? ["GOLPE", "IMPACTO", "SENTENÇA", "MURALHA"];
  const mechs = d.mech.filter((m) => MECH_SET.has(m));

  const skills: KitSkill[] = [];

  ATK_TIERS.forEach((t, i) => {
    const mech = t.key === "basic"
      ? ([mechs[i % Math.max(1, mechs.length)]] as MechId[])
      : ([mechs[i % mechs.length], mechs[(i + 1) % mechs.length]] as MechId[]);
    const vfx = t.key === "basic" ? VFX.impact : elementVfx(atkEl, seed + i);
    const line = t.key === "ultimate" ? 0 : (seed + i) % 3;
    const st = t.role === "raw" && t.key !== "strong" ? undefined : statusApply(d, i, t.role === "ultimate" || t.role === "burst");
    let name: string;
    if (i === 0) name = names[0];
    else if (i === 1) name = names[1];
    else if (i === 2) name = names[2];
    else {
      const poolList = ATK_SUFFIX[t.key] ?? SUF_QUICK;
      const suf = poolList[(seed + i) % poolList.length];
      name = `${d.v[line]} ${suf}`;
    }
    skills.push({
      id: `${d.id}_${t.key}`,
      name,
      kind: "attack",
      power: t.power,
      mp: t.mp,
      vfx,
      desc: t.role === "ultimate"
        ? `Golpe definitivo de ${atkEl.toLowerCase()} com ${d.mech.length} sistemas acoplados.`
        : t.role === "buff"
          ? "Golpe de apoio que reconfigura o chassi em pleno combate."
          : t.role === "drain"
            ? "Sifão vivo: converte o dano em energia para o próprio reator."
            : `Ataque de ${atkEl.toLowerCase()} acoplado ao dossiê ${d.id.toUpperCase()}.`,
      effect: st
        ? { type: legacyEffectOf(st.s), power: 14, turns: st.t, chance: 0.8 }
        : undefined,
      tags: t.tag,
      mech,
      status: st ? [st] : undefined,
      self: t.role === "buff" ? [{ s: "adrenalin", p: 100, t: 3, v: 20 + (seed % 20) }] : undefined,
      hits: t.hits > 1 ? t.hits : undefined,
      charge: t.charge,
      priority: t.priority,
      speed: t.priority,
      meter: t.meter,
      cost: t.spends ? { [d.res]: 2 } : undefined,
      gain: t.role === "raw" && t.key !== "basic" ? { [d.res]: 1 } : undefined,
      requires: t.role === "ultimate" ? 10 : undefined,
    });
  });

  DEF_TIERS.forEach((t, i) => {
    const mech = [mechs[(i + 3) % mechs.length]] as MechId[];
    const name = i === 0
      ? names[3]
      : `${(DEF_SUFFIX[t.key] ?? SUF_PURGE)[(seed + i) % 5]} ${d.v[i % 3]}`;
    skills.push({
      id: `${d.id}_def_${t.key}`,
      name,
      kind: "defense",
      power: t.power,
      mp: t.mp,
      vfx: t.key === "repair" ? VFX.heal : t.key === "counter" ? VFX.thunder : VFX.ward,
      desc: `${t.tag.includes("suporte") ? "Defesa de suporte" : "Defesa"} do dossiê ${d.id.toUpperCase()}.`,
      defense: { kind: t.kind, percent: t.pct, turns: t.turns },
      tags: t.tag,
      mech,
      meter: t.meter,
      gain: { [d.res]: 1 },
    });
  });

  const passives: KitPassive[] = d.pv.map((id) => ({
    id: id as KitPassive["id"],
    hook: "onTurnStart",
    name: id,
    desc: id,
  }));

  const [talName, talKind, talTarget, talVal] = d.tal;
  const talent: KitTalent = {
    id: `${d.id}_tal`,
    name: talName,
    kind: talKind,
    stat: talKind === "stat" ? talTarget : undefined,
    status: talKind === "grant" && STATUS_MAP[talTarget] ? talTarget : undefined,
    mech: talKind !== "stat" && MECH_SET.has(talTarget) ? (talTarget as MechId) : undefined,
    val: talVal,
    desc: `${talName}: ${talKind === "stat" ? `+${talVal}% de ${talTarget}` : talKind === "ultimate" ? "reforça a ultimate do chassi" : `concede ${talTarget}`}.`,
  };

  const ai: AiProfile = { role: d.role, ...ROLE_PROFILE[d.role] };

  const kit: Kit = {
    robotId: d.id,
    element: el,
    attackElement: atkEl,
    resource: d.res,
    ai,
    skills,
    passives,
    talent,
    creed: d.creed,
  };

  if (d.boss) kit.boss = bossPhases(d, mechs, atkEl);
  return kit;
}

/** Fases de chefe de um chassi ápice — derivadas do próprio dossiê. */
function bossPhases(d: Dossier, mechs: string[], el: string): BossPhase[] {
  const seed = hash(d.id);
  const forms = pool(FORM_ROOTS, seed, 3).map((r, i) => `${r}-SE ${FORMS[i % FORMS.length]}`);
  const cuts = [0.66, 0.33, 0.1];
  return cuts.map((at, i) => ({
    at,
    name: `FASE ${i + 1} — ${forms[i]}`,
    form: `${d.v[i % 3]} ${forms[i]}`,
    mech: [
      (mechs[(i * 2) % mechs.length] ?? "enrage") as MechId,
      (mechs[(i * 2 + 1) % mechs.length] ?? "enrage") as MechId,
    ],
    color: ["#35e2f0", "#ffb43a", "#ff5b6e"][i],
    mods: {
      str: 1 + i * 0.15,
      def: 1 - i * 0.08,
      agl: 1 + i * 0.12,
      crit: i * 0.08,
    },
    desc: `A ${el.toLowerCase()} responde: ${d.v[i % 3]} assume o controle do chassi.`,
  }));
}

/** Converte um status avançado no efeito legado equivalente (compatibilidade). */
export function legacyEffectOf(id: string): "burn" | "poison" | "paralyze" | "blind" | "weakening" | "drain" | "damage_reduction" | "adrenalin" | "hp_regen" | "trapped" {
  switch (id) {
    case "poison":
    case "corrode":
    case "decay":
      return "poison";
    case "bleed":
      return "drain";
    case "freeze":
    case "stun":
    case "paralyze":
      return "paralyze";
    case "blind":
    case "confuse":
      return "blind";
    case "weakening":
    case "curse":
    case "shatter":
      return "weakening";
    case "root":
    case "trapped":
      return "trapped";
    case "burn":
      return "burn";
    case "hp_regen":
    case "adrenalin":
    case "damage_reduction":
    case "shield":
    case "barrier":
      return id as "hp_regen";
    default:
      return "burn";
  }
}

/* ---------------------------------------------------------------- validador */

export interface KitIssue {
  robotId: string;
  problem: string;
}

/** Checa coerência de um lote de dossiês (usado pelo validador de kits). */
export function auditDossier(d: Dossier): string[] {
  const issues: string[] = [];
  if (!ROBOT_MAP[d.id]) issues.push(`robô inexistente: ${d.id}`);
  for (const m of d.mech) if (!MECH_SET.has(m)) issues.push(`mecânica desconhecida: ${m}`);
  for (const p of d.pv) if (!PASSIVE_SET.has(p)) issues.push(`passiva desconhecida: ${p}`);
  for (const s of d.st) if (!STATUS_MAP[s]) issues.push(`status desconhecido: ${s}`);
  if (d.el && !ELEMENT_VFX[d.el]) issues.push(`família sem vfx: ${d.el}`);
  if (d.atk && !ELEMENT_VFX[d.atk]) issues.push(`família ofensiva sem vfx: ${d.atk}`);
  if (d.mech.length < 6) issues.push(`poucas mecânicas: ${d.mech.length}`);
  if (d.st.length < 2) issues.push(`poucos status: ${d.st.length}`);
  return issues;
}
