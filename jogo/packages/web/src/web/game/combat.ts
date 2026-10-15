import type { BattleRules } from "./expansion";
/**
 * Fase H1 — motor de combate tático (o coração da "batalha 100x").
 *
 * O motor antigo (`battle.ts`, fase G3) resolvia UM golpe por lado, com um
 * lutador ativo por vez. Aqui o combate virou uma batalha de esquadrão:
 *
 *   - FORMACAO ......... a equipe inteira entra em campo, uma posicao por robô
 *                        (guarda / flanco / suporte / nucleo), cada posicao com
 *                        multiplicadores de dano dado, dano tomado e ameaca.
 *   - AGENDA ........... todos os lutadores vivos agem por round, ordenados por
 *                        agilidade + ritmo (a skill usada antes define o pace).
 *   - TIMING ........... parry, esquiva ativa, cobertura, contra-golpe e ataques
 *                        carregados (que resolvem no turno seguinte do dono).
 *   - RECURSO .......... cada chassi carrega um recurso exclusivo (12 tipos) que
 *                        enche, decai e paga skills caras.
 *   - ELEMENTOS ........ os 18 elementos com fraqueza / resistencia / imunidade
 *                        / absorcao entram de fato no dano e nos status.
 *   - STATUS ........... os 36 status avancados (status.ts) com modificadores,
 *                        dano por turno, pilhas, reacoes e limpeza.
 *   - MECANICAS ........ as 105 mecanicas nomeadas (mechanics.ts) assinam os
 *                        golpes de cada kit.
 *   - PASSIVAS ......... as 93 passivas (passives.ts) rodam nos 32 hooks.
 *   - CAMPO ............ clima em roda por arena + zonas por posicao (hazard,
 *                        cobertura, cura, crit, energia, vazio).
 *   - CHEFES ........... chassis apice tem fases multi-forma com bonus proprios.
 *   - IA TATICA ........ 10 papeis, com escolha de alvo por ameaca, fraqueza,
 *                        HP e posicao de foco, modulada por dificuldade.
 *   - ULTIMATE ......... reator individual 0–100%; exclusivo, sem MP ou recurso.
 *   - ANALISE .......... painel pos-luta com dano, curas, abates e cronologia.
 *
 * Nada aqui gera arte: todo VFX reusa os 28 sheets de `/vfx` e as animacoes do
 * catalogo de `anim.ts` (que ja cobre os 36 status).
 */

import {
  computeDamage,
  criticalChance,
  evasionChance,
  totalStats,
  type RobotSave,
} from "./engine";
import { ITEM_MAP } from "./config";
import { ROBOT_MAP, type Skill } from "./robots";
import { defaultLoadout, normalizeLoadout, exclusiveUltimate } from "./skills";
import { getState, gadgetChipsOf, petBonusTable } from "./save";
import {
  GADGET_MAP,
  aiChips,
  aiGadgetLevel,
  gadgetMkLabel,
  gadgetTotals,
  type GadgetKind,
} from "./gadgets";
import { aiDeck, aiRefine, resolveDeck, type CardMods, type CardStat } from "./cards";
import type { PetKind } from "./pets";
import { affinity } from "./elements";
import { burstAnimFor, decalAnimFor, hitAnimFor, projectileAnimFor, trailAnimFor, windupAnimFor, chassisAnimFor, glitchAnimFor, statusBurstFor } from "./anim";
import {
  PURGE_KEEPS,
  STATUS_MAP,
  accumulateMods,
  emptyMods,
  isBuff,
  statusAbbr,
  statusLabel,
  type StatusModTotal,
} from "./status";
import {
  arenaName,
  makeField,
  rotateWeather,
  weatherDamage,
  zoneFor,
  type FieldState,
  type Zone,
} from "./terrain";
import {
  POSITIONS,
  RESOURCE_POLICY,
  RESOURCES,
  mechList,
  positionDef,
  type AiProfile,
  type BossPhase,
  type KitSkill,
  type KitTalent,
  type MechId,
  type Position,
  type ResourceId,
} from "./kits/types";
import { kitOf, skillsOf } from "./kits";
import { resolveMechs, type MechActor, type MechCtx } from "./mechanics";
import { runPassives, type PassiveActor, type PassiveCtx, type PassiveResult } from "./passives";

/* ================================================================== tipos */

export type Side = "player" | "enemy";
export type Phase = "intro" | "menu" | "resolving" | "forced_swap" | "over";
export type CombatMode = "duel" | "team" | "raid" | "boss" | "survival";
export type Difficulty = "facil" | "normal" | "dificil" | "pesadelo";

export interface ActiveEffect {
  /** id de status.ts (aceita tambem os 10 efeitos legados de skills.ts). */
  type: string;
  /** magnitude: % de stat, % de dano, pilhas ou pontos de escudo. */
  power: number;
  /** turnos restantes. */
  turns: number;
  /** pilhas (intensidade). */
  stacks: number;
  /** origem do efeito, para o log. */
  from?: string;
}

/** Modificadores de status ja agregados (usado no preview e no dano). */
export interface StatusImpact {
  mods: StatusModTotal;
  /** % de dano recebido cortado por blindagem/status. */
  dr: number;
  /** pontos planos de escudo que absorvem dano antes do HP. */
  shield: number;
  /** golpes anulados por completo. */
  barrier: number;
  /** % devolvido em golpes corpo a corpo. */
  thorns: number;
  /** % devolvido em qualquer golpe. */
  reflect: number;
  /** % do dano causado roubado como HP. */
  lifelink: number;
  /** pilhas que ampliam o proximo golpe (consumidas). */
  chargeStacks: number;
  /** % de HP curado por turno. */
  regen: number;
  /** % de HP perdido por turno. */
  dot: number;
  /** % de MP perdido por turno. */
  mpBurn: number;
  /** chance de perder o turno. */
  skipTurn: number;
  silence: boolean;
  randomTarget: boolean;
  noSwap: boolean;
  breakOnHit: boolean;
  doom: boolean;
  forcedSwapOnEnd: boolean;
  consumesStacks: boolean;
  /** % extra de dano recebido escalando com pilhas. */
  extraTaken: number;
  /** tipos ativos, para o log. */
  types: string[];
}

/** Visao legada de um lutador — mantida para o HUD e o menu de combate. */
export interface FighterView {
  uid: string;
  robotId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  def: number;
  agl: number;
  effects: ActiveEffect[];
  ai: boolean;
  skillIds: string[];
  counter: number;
  gadgetLevel: number;
  gadgetMk: string;
  gadgetMods: Partial<Record<GadgetKind, number>>;
  pets: Partial<Record<PetKind, number>>;
  cardIds: string[];
  cards: CardMods;
  side: Side;
  slot: number;
  pos: Position;
  element: string;
  attackElement: string;
  resId: ResourceId | null;
  res: number;
  resMax: number;
  /** Independent charge, 0–100%, retained while benched. */
  ultimateCharge: number;
  /** Skill preparation shown by the command UI. */
  charged: string | null;
  chargeTurns: number;
  /** indice da fase de chefe ativa (0 = primeira). */
  bossPhase: number;
  /** true quando aguarda a ordem do jogador. */
  ready: boolean;
  /** true depois que o lutador caiu (controla a animacao de queda). */
  fainted: boolean;
}

/** Lutador completo do motor — a fonte de verdade de um combatente. */
export interface Combatant extends FighterView {
  /** stats de referencia, antes de buffs/status. */
  base: { str: number; def: number; agl: number };
  /** turnos de parry (anula o golpe). */
  parryTurns: number;
  /** turnos de esquiva ativa (corta o dano). */
  evadeTurns: number;
  /** turnos cobrindo um aliado (intercepta parte do dano). */
  coverTurns: number;
  /** aliado protegido por essa cobertura. */
  coverUid?: string;
  /** descanso forcado (perde o turno). */
  stunTurns: number;
  /** ritmo: prioridade da ultima skill usada (desempata a agenda). */
  pace: number;
  /** Chassis stacks, not a shared ultimate meter. */
  meter: number;
  passives: string[];
  passiveUsed: string[];
  roundHits: number;
  passiveMult: number;
  passiveGuard: number;
  lastActionKind?: "attack" | "defense";
  talent: KitTalent | null;
  aiProfile: AiProfile;
  boss: BossPhase[] | null;
  bossMods: { str: number; def: number; agl: number; crit: number };
  /* --- metricas de batalha (painel pos-luta) --- */
  hits: number;
  kills: number;
  damageDealt: number;
  damageTaken: number;
  healed: number;
  crits: number;
  parries: number;
  dodges: number;
  blocked: number;
  statusApplied: number;
  statusSuffered: number;
  roundsActive: number;
  skillUse: Record<string, number>;
  firstBlood: boolean;
}

export interface BattleSide {
  fighters: Combatant[];
  active: number;
  items: Record<string, number>;
}

export interface CombatTeam extends BattleSide {
  side: Side;

}

export interface Combat {
  rules: BattleRules;
  coreHp: number;
  coreShield: number;
  arena: string;
  arenaLabel: string;
  mode: CombatMode;
  difficulty: Difficulty;
  turn: number;
  phase: Phase;
  result: "win" | "lose" | null;
  player: CombatTeam;
  enemy: CombatTeam;
  field: FieldState;
  /** agenda do round corrente (uids, na ordem de acao). */
  order: string[];
  /** posicao na agenda. */
  cursor: number;
  /** uid que aguarda a ordem do jogador. */
  ready: string | null;
  /** golpes carregados aguardando resolver. */
  pending: { uid: string; skillId: string; targetUid: string; turns: number; spent?:number }[];
  log: string[];
  /** cronologia resumida para a analise pos-luta. */
  history: string[];
  /** uids que ja levaram dano no round (reacao breakOnHit). */
  struck: string[];
  /** true enquanto o round roda sem pedir ordem ao jogador. */
  autoResolve: boolean;
  /** PvP: ambos os lados aguardam ordens humanas; jamais executa IA. */
  pvp?: boolean;
  /** PvP: sal secreto do servidor para a sorte; removido antes de enviar ao cliente. */
  rngSalt?: number;
}

/** Visao consumida pelos ecras (superset do contrato antigo de `battle.ts`). */
export interface BattleView {
  arena: string;
  turn: number;
  phase: Phase;
  result: "win" | "lose" | null;
  player: BattleSide;
  enemy: BattleSide;
  log: string[];
  combat: Combat;
}

/** Nomes legados preservados para os consumidores existentes. */
export type Battle = BattleView;
export type Fighter = FighterView;

export interface BattleSideLite {
  fighters: Combatant[];
  active: number;
  items: Record<string, number>;
}

export type BattleAction =
  | { kind: "skill"; skillId: string }
  | { kind: "item"; itemId: string; targetIndex: number }
  | { kind: "swap"; index: number };

export type CombatAction =
  | { kind: "skill"; skillId: string; targetUid?: string }
  | { kind: "item"; itemId: string; targetUid?: string }
  | { kind: "reposition"; withUid: string }
  | { kind: "guard" }
  | { kind: "dodge" }
  | { kind: "cover"; withUid?: string }
  | { kind: "analyze"; targetUid?: string }
  | { kind: "ultimate"; targetUid?: string }
  | { kind: "auto" }
  | { kind: "pass" };

export type FloatTone = "dmg" | "crit" | "heal" | "miss" | "info";

export type BattleEvent =
  | { t: "msg"; text: string }
  | { t: "clip"; side: Side; clip: "attack" | "damage" | "guard" | "enter" | "idle"; uid?: string }
  | { t: "vfx"; side: Side; url: string; uid?: string }
  | { t: "float"; side: Side; text: string; tone: FloatTone; uid?: string }
  | { t: "sync"; combat: Combat; battle: BattleView }
  | { t: "faint"; side: Side; uid: string }
  | { t: "end"; result: "win" | "lose" }
  | { t: "anim"; side: Side; id: string; hold?: number; uid?: string }
  /* --- eventos H1: paineis, ordem, carga e fases de chefe --- */
  | { t: "order"; order: OrderEntry[] }
  | { t: "field"; label: string; desc: string; color: string }
  | { t: "charge"; side: Side; uid: string; value: number }
  | { t:"ultimate"; side:Side; uid:string; targetUid:string; robotId:string; label:string; vfx:string }
  | { t: "passive"; side: Side; label: string; text: string }
  | { t: "status"; side: Side; id: string; label: string; tone: "buff" | "debuff" }
  | { t: "phase"; side: Side; name: string; form: string; color: string }
  | { t: "dmg"; side: Side; value: number; element: string; tier: AffinityTier };

export type AffinityTier = "absorve" | "resiste" | "neutro" | "fraco";

export interface OrderEntry {
  uid: string;
  side: Side;
  name: string;
  robotId: string;
  pos: Position;
  agl: number;
  ready: boolean;
  alive: boolean;
}

/* ============================================================== ajustes */

export const DIFFICULTY: Record<
  Difficulty,
  {
    label: string;
    enemy: number;
    smart: number;
    focus: number;
    color: string;
    /** Quanto do equipamento "de fabrica" da IA esta ativo (0..1). */
    gear: number;
  }
> = {
  facil: { label: "FÁCIL", enemy: 0.86, smart: 0.45, focus: 0.4, color: "#8dff7a", gear: 0.35 },
  normal: { label: "NORMAL", enemy: 1, smart: 0.7, focus: 0.65, color: "#35e2f0", gear: 0.6 },
  dificil: { label: "DIFÍCIL", enemy: 1.16, smart: 0.88, focus: 0.85, color: "#ffb43a", gear: 0.85 },
  pesadelo: { label: "PESADELO", enemy: 1.34, smart: 1, focus: 1, color: "#ff5b6e", gear: 1 },
};

/**
 * Equipamento sintetico da IA reduzido pela dificuldade. O inimigo nao tem
 * progressao real (deck/refino/gadget/chips sao fabricados em `cards.ts` e
 * `gadgets.ts`), entao sem este corte a dificuldade FACIL entregava um deck de
 * refino maximo e o jogador perdia sem entender por que.
 */
function scaleKit<T>(list: T[], gear: number): T[] {
  const n = Math.max(list.length > 0 ? 1 : 0, Math.round(list.length * gear));
  return list.slice(0, n);
}

/** Carga individual necessária para o ultimate exclusivo. */
export const ULTIMATE_MAX = 100;

/**
 * Ritmo da batalha: multiplicador global do poder de golpe. O H1 tem 4 lutadores
 * por lado, agenda por round e varias camadas de mitigacao — sem este fator os
 * golpes caem no piso de 1 de dano e a luta vira atrito eterno. Calibrado para
 * ~8-16 rounds numa luta de 4v4 equilibrada.
 */
const PACE = 2.6;

/** Teto da mitigacao vinda de cartas, gadgets e pets (%). */
const DR_GEAR_MAX = 45;

/** Teto absoluto da mitigacao de um golpe (%). */
const DR_MAX = 70;

/** Mitigacao de equipamento de um alvo, ja com teto proprio. */
function gearDr(f: FighterView): number {
  return Math.min(
    DR_GEAR_MAX,
    gadgetBonus(f, "aegis") + petBonus(f, "bulwark") + cardBonus(f, "aegis"),
  );
}

/** Elemento tematico de cada status (imunidade elemental cobre o status). */
const STATUS_ELEMENT: Record<string, string> = {
  burn: "FOGO",
  overheat: "FOGO",
  poison: "TOXICO",
  corrode: "TOXICO",
  freeze: "GELO",
  paralyze: "ELETRICO",
  stun: "ELETRICO",
  root: "TERRA",
  trapped: "TERRA",
  bleed: "LAMINA",
  silence: "ARCANO",
  confuse: "SOMBRA",
  fear: "SOMBRA",
  curse: "SOMBRA",
  doom: "SOMBRA",
  blind: "SOMBRA",
  decay: "ARCANO",
  shatter: "IMPACTO",
  weakening: "ARCANO",
  slow: "GELO",
  marked: "LUZ",
  glass: "CRISTAL",
  drain: "COSMICO",
};

/** Nomes curtos dos 10 efeitos legados (usados no HUD). */
const LEGACY_LABEL: Record<string, string> = {
  burn: "QUEIMANDO",
  poison: "ENVENENADO",
  paralyze: "PARALISADO",
  blind: "CEGO",
  weakening: "ENFRAQUECIDO",
  drain: "DRENADO",
  damage_reduction: "BLINDADO",
  adrenalin: "ADRENALINA",
  hp_regen: "AUTO-REPARO",
  trapped: "PRESO",
};

export function effectLabel(type: string): string {
  const short = LEGACY_LABEL[type];
  if (short) return short;
  return STATUS_MAP[type] ? statusLabel(type) : type.toUpperCase();
}

export function effectAbbr(type: string): string {
  return STATUS_MAP[type] ? statusAbbr(type) : type.slice(0, 3).toUpperCase();
}

/** Cor de um status, para os selos do HUD. */
export function effectColor(type: string): string {
  return STATUS_MAP[type]?.color ?? "#8faecb";
}

/* ============================================================ utilidades */

function teamOf(c: Combat, side: Side): CombatTeam {
  return side === "player" ? c.player : c.enemy;
}

function other(side: Side): Side {
  return side === "player" ? "enemy" : "player";
}

function byUid(c: Combat, uid: string): Combatant | null {
  for (const m of c.player.fighters) if (m.uid === uid) return m;
  for (const m of c.enemy.fighters) if (m.uid === uid) return m;
  return null;
}

function alive(m: Combatant): boolean {
  return m.hp > 0;
}

function livingMembers(t: CombatTeam): Combatant[] {
  return t.fighters.filter(alive);
}

function livingRatio(t: CombatTeam): number {
  const max = t.fighters.reduce((s, m) => s + m.maxHp, 0) || 1;
  const hp = t.fighters.reduce((s, m) => s + Math.max(0, m.hp), 0);
  return hp / max;
}

function livingCount(c: Combat, side: Side): number {
  return teamOf(c, side).fighters.filter(alive).length;
}

/** Robo em campo de um lado: o ativo, ou o primeiro vivo se o ativo caiu. */
function fieldOf(c: Combat, side: Side): Combatant | null {
  const t = teamOf(c, side);
  const cur = t.fighters[t.active];
  if (cur && alive(cur)) return cur;
  return t.fighters.find(alive) ?? null;
}

/**
 * Golpes que alcancam robos fora de campo: area, corrente, respingo e leque.
 * Todo o resto so atinge o robo que esta em campo.
 */
export function reachesBench(skill: KitSkill): boolean {
  if (skill.kind === "defense") return false;
  if (skill.tags?.includes("area")) return true;
  const mechs = skill.mech ? (Array.isArray(skill.mech) ? skill.mech : [skill.mech]) : [];
  return mechs.some((x) => x === "chain" || x === "splash" || x === "spread");
}

/** Custo de MP efetivo de uma skill para um lutador (circuito corta MP). */
export function mpCostOf(m: Combatant, skill: KitSkill): number {
  const discount = m.resId === "circuit" ? Math.floor(m.res / 4) : 0;
  return Math.max(0, skill.mp - discount);
}

/** Skill do kit do lutador pelo id, com fallback na primeira. */
export function skillOf(m: Combatant, skillId: string): KitSkill {
  const kit = kitOf(m.robotId);
  return kit.skills.find((s) => s.id === skillId) ?? kit.skills[0];
}

/** Exclusive kit ultimate, independent of equipped skills. */
export function ultimateOf(m:FighterView):KitSkill { return exclusiveUltimate(kitOf(m.robotId).skills)!; }

/** Habilidades realmente disponiveis para o lutador (contrato do loadout). */
export function fighterSkills(f: FighterView): KitSkill[] {
  const kit = kitOf(f.robotId);
  return f.skillIds
    .map((id) => kit.skills.find((s) => s.id === id))
    .filter((s): s is KitSkill => Boolean(s));
}

export function cardBonus(f: FighterView, stat: CardStat): number {
  return f.cards[stat] ?? 0;
}

export function petBonus(f: FighterView, kind: PetKind): number {
  return f.pets[kind] ?? 0;
}

export function gadgetBonus(f: FighterView, kind: GadgetKind): number {
  return f.gadgetMods[kind] ?? 0;
}

/** Escolhe um kit de skills para um robo controlado pela IA. */
export function aiLoadout(robotId: string, seed: number): string[] {
  const skills=skillsOf(robotId);
  const ordinary=skills.filter(s=>s.id!==exclusiveUltimate(skills)?.id);
  const n=1+seed%3;
  return normalizeLoadout(skills,[ordinary.find(s=>s.kind==="attack"&&s.mp===0)?.id??"",...ordinary.slice(n).map(s=>s.id),...ordinary.slice(0,n).map(s=>s.id)]);
}

/* =================================================== status -> numeros */

function emptyImpact(): StatusImpact {
  return {
    mods: emptyMods(),
    dr: 0,
    shield: 0,
    barrier: 0,
    thorns: 0,
    reflect: 0,
    lifelink: 0,
    chargeStacks: 0,
    regen: 0,
    dot: 0,
    mpBurn: 0,
    skipTurn: 0,
    silence: false,
    randomTarget: false,
    noSwap: false,
    breakOnHit: false,
    doom: false,
    forcedSwapOnEnd: false,
    consumesStacks: false,
    extraTaken: 0,
    types: [],
  };
}

/**
 * Le todos os status ativos e devolve tudo que o motor precisa saber: mods de
 * stat (via accumulateMods), cortes de dano, escudo, regen, dot, reacoes.
 */
export function statusImpact(effects: ActiveEffect[]): StatusImpact {
  const out = emptyImpact();
  for (const e of effects) {
    const def = STATUS_MAP[e.type];
    const stacks = Math.max(1, e.stacks);
    out.types.push(e.type);
    if (!def) {
      // efeito legado fora do catalogo: trata como dano por turno
      out.dot += e.power / 100;
      continue;
    }
    accumulateMods(out.mods, def.id, e.power, stacks);
    /* status cuja `power` E a magnitude do proprio mod */
    if (e.type === "adrenalin") out.mods.str += e.power * stacks;
    if (e.type === "damage_reduction") out.dr += e.power * stacks;
    if (e.type === "shield") out.shield += e.power * stacks;
    if (e.type === "barrier") out.barrier += stacks;
    if (e.type === "thorns") out.thorns += e.power * stacks;
    if (e.type === "reflect") out.reflect += e.power * stacks;
    if (e.type === "lifelink") out.lifelink += e.power * stacks;
    if (e.type === "charge") out.chargeStacks += stacks;
    if (e.type === "hp_regen") out.regen += e.power * stacks;
    if (e.type === "drain") out.mpBurn += e.power * stacks;
    if (def.tick?.dmg) out.dot += (def.tick.dmg * e.power * stacks) / 100;
    if (def.tick?.heal) out.regen += def.tick.heal * stacks;
    if (def.tick?.mp) out.mpBurn += def.tick.mp * stacks;
    const rule = def.rule;
    if (rule) {
      if (rule.skipTurnChance) out.skipTurn += rule.skipTurnChance;
      if (rule.silenceSkills) out.silence = true;
      if (rule.randomTarget) out.randomTarget = true;
      if (rule.noSwap) out.noSwap = true;
      if (rule.breakOnHit) out.breakOnHit = true;
      if (rule.doom) out.doom = true;
      if (rule.mpBurn) out.mpBurn += rule.mpBurn;
      if (rule.extraDmgTaken) out.extraTaken += rule.extraDmgTaken * stacks;
      if (rule.consumesStacks) out.consumesStacks = true;
      if (rule.forcedSwapOnEnd) out.forcedSwapOnEnd = true;
    }
  }
  return out;
}

function statOf(base: number, pctMod: number, flatMod = 0): number {
  return Math.max(1, Math.round((base * (100 + pctMod)) / 100 + flatMod));
}

export interface EffStats {
  str: number;
  def: number;
  agl: number;
  crit: number;
  evade: number;
  dmgOut: number;
  dmgIn: number;
}

/** Stats efetivos de um lutador com status, zona e clima aplicados. */
export function effectiveStats(c: Combat, m: Combatant): EffStats {
  const imp = statusImpact(m.effects);
  const zone = zoneOf(c, m);
  const zoneStr = zone.kind === "buff" && zone.stat === "str" ? zone.val : 0;
  const zoneDef = zone.kind === "buff" && zone.stat === "def" ? zone.val : 0;
  const zoneAgi = zone.kind === "buff" && zone.stat === "agl" ? zone.val : 0;
  const zoneCrit = zone.kind === "crit" ? zone.val : 0;
  const bm = m.boss && m.bossPhase > 0 ? m.bossMods : { str: 1, def: 1, agl: 1, crit: 0 };
  return {
    str: statOf(Math.round(m.base.str * bm.str), imp.mods.str + zoneStr),
    def: statOf(Math.round(m.base.def * bm.def), imp.mods.def + zoneDef),
    agl: statOf(Math.round(m.base.agl * bm.agl), imp.mods.agl + zoneAgi),
    crit: imp.mods.crit + zoneCrit + bm.crit + (c.field.weather.crit ?? 0),
    evade: imp.mods.evade + (c.field.weather.evade ?? 0),
    dmgOut: imp.mods.dmgOut,
    dmgIn: imp.mods.dmgIn + imp.extraTaken,
  };
}

/* ================================================== projecoes de motor */

function mechActor(c: Combat, m: Combatant, res: number, charge: number): MechActor {
  return {
    hp: m.hp,
    maxHp: m.maxHp,
    mp: m.mp,
    maxMp: m.maxMp,
    str: m.base.str,
    def: m.base.def,
    agl: m.base.agl,
    level: m.level,
    effects: m.effects.map((e) => ({ type: e.type, power: e.power, turns: e.turns })),
    res,
    resMax: m.resMax,
    resId: m.resId ?? undefined,
    pos: m.pos,
    element: m.attackElement,
    turn: c.turn,
    kills: m.kills,
    hits: m.hits,
    stacks: m.meter,
    charge,
    robotId: m.robotId,
  };
}

function passiveActor(m: Combatant, charge: number, turn: number): PassiveActor {
  return {
    hp: m.hp,
    maxHp: m.maxHp,
    mp: m.mp,
    maxMp: m.maxMp,
    str: m.base.str,
    def: m.base.def,
    agl: m.base.agl,
    level: m.level,
    effects: m.effects.map((e) => ({ type: e.type, power: e.power, turns: e.turns })),
    res: m.res,
    resMax: m.resMax,
    turn,
    kills: m.kills,
    hits: m.hits,
    stacks: m.meter,
    charge,
    element: m.attackElement,
    robotId: m.robotId,
  };
}

/* ===================================================== montar lutador */

function talentPct(t: KitTalent | null, stat: string): number {
  if (!t || t.kind !== "stat" || t.stat !== stat) return 0;
  return t.val ?? 0;
}

function assignPositions(wanted: Position[], formation?: Position[]): Position[] {
  const used = new Set<Position>();
  const out: Position[] = [];
  wanted.forEach((w, i) => {
    let p = formation?.[i] ?? w;
    if (used.has(p)) {
      const free = POSITIONS.find((x) => !used.has(x));
      p = free ?? p;
    }
    used.add(p);
    out.push(p);
  });
  return out;
}

/** Cria um combatente completo a partir de um save de robo. */
export function makeCombatant(args: {
  save: RobotSave;
  side: Side;
  slot: number;
  ai: boolean;
  pos: Position;
  difficulty: Difficulty;
  formation?: Position;
}): Combatant {
  const { save, side, slot, ai, pos, difficulty } = args;
  const def = ROBOT_MAP[save.id];
  const st = totalStats(def, save, ai);
  const kit = kitOf(save.id);
  const gdef = GADGET_MAP[save.id];
  const gear=ai?DIFFICULTY[difficulty].gear:1;
  const glevel=ai?Math.round(aiGadgetLevel(save.id,save.level)*gear):Math.max(0,save.gadgetLevel??0);
  const st8 = getState();
  const chipIds = ai ? scaleKit(aiChips(save.id,save.level),gear) : save.borrowed ? [] : gadgetChipsOf(st8,save.id);
  const gadgetMods = gadgetTotals(gdef, glevel, chipIds);
  const pets: Partial<Record<PetKind, number>> = ai || save.borrowed ? {} : petBonusTable();
  const aiIds = ai ? scaleKit(aiDeck(save.id, save.level),gear) : [];
  const deck = ai
    ? resolveDeck(aiIds,Object.fromEntries(aiIds.map(id=>[id,Math.max(1,Math.round(aiRefine(save.level)*gear))])))
    : resolveDeck(save.borrowed ? [] : st8.deck, st8.cardRefine);
  const cmods = deck.mods;
  const cpct = (stat: CardStat) => cmods[stat] ?? 0;
  const ppct = (kind: PetKind) => pets[kind] ?? 0;
  const gpct = (kind: GadgetKind) => gadgetMods[kind] ?? 0;
  const diff = DIFFICULTY[difficulty];
  const dscale = ai ? diff.enemy : 1;

  const hp = Math.max(
    1,
    Math.round(
      st.hp *
        (1 + gpct("vitality") / 100 + cpct("hp") / 100 + talentPct(kit.talent, "hp") / 100) *
        dscale,
    ),
  );
  const mp = Math.max(
    1,
    Math.round(
      st.mp *
        (1 + gpct("reactor") / 100 + ppct("reactor") / 100 + cpct("mp") / 100) *
        dscale,
    ),
  );
  const str = Math.max(
    1,
    Math.round(
      st.str * (1 + gpct("power") / 100 + cpct("str") / 100 + talentPct(kit.talent, "str") / 100) * dscale,
    ),
  );
  const dfn = Math.max(
    1,
    Math.round(
      st.def * (1 + gpct("guard") / 100 + cpct("def") / 100 + talentPct(kit.talent, "def") / 100) * dscale,
    ),
  );
  const agl = Math.max(
    1,
    Math.round(
      st.agl *
        (1 + gpct("speed") / 100 + ppct("sprinter") / 100 + cpct("agl") / 100 + talentPct(kit.talent, "agl") / 100) *
        dscale,
    ),
  );

  const fallback=ai?aiLoadout(save.id,save.level*31+save.id.length*17):defaultLoadout(kit.skills);
  const skillIds=normalizeLoadout(kit.skills,save.loadout??fallback);

  const resId: ResourceId | null = kit.resource ?? null;
  const resMax = resId ? RESOURCES[resId].max : 0;

  return {
    uid: `${side}${slot}`,
    robotId: save.id,
    name: def.name,
    level: save.level,
    hp,
    maxHp: hp,
    mp,
    maxMp: mp,
    str,
    def: dfn,
    agl,
    base: { str, def: dfn, agl },
    effects: [],
    ai,
    skillIds,
    counter: 0,
    parryTurns: 0,
    evadeTurns: 0,
    coverTurns: 0,
    charged: null,
    chargeTurns: 0,
    stunTurns: 0,
    pace: 0,
    meter: 0,
    ultimateCharge: 0,
    gadgetLevel: glevel,
    gadgetMk: gdef && glevel > 0 ? gadgetMkLabel(glevel) : "",
    gadgetMods,
    pets,
    cardIds: deck.ids,
    cards: cmods,
    side,
    slot,
    pos,
    element: kit.element,
    attackElement: kit.attackElement ?? kit.element,
    resId,
    res: 0,
    resMax,
    fainted: false,
    bossPhase: 0,
    boss: kit.boss ?? null,
    bossMods: { str: 1, def: 1, agl: 1, crit: 0 },
    passives: kit.passives.map((p) => p.id),
    passiveUsed: [],
    roundHits: 0,
    passiveMult: 1,
    passiveGuard: 0,
    talent: kit.talent,
    aiProfile: kit.ai,
    ready: false,
    hits: 0,
    kills: 0,
    damageDealt: 0,
    damageTaken: 0,
    healed: 0,
    crits: 0,
    parries: 0,
    dodges: 0,
    blocked: 0,
    statusApplied: 0,
    statusSuffered: 0,
    roundsActive: 0,
    skillUse: {},
    firstBlood: false,
  };
}

/* ============================================================== eventos */

/** Contexto de uma resolucao de round: o combate, a fila de eventos e o RNG. */
interface Ctx {
  c: Combat;
  events: BattleEvent[];
  rng: () => number;
  /** uids que ja levaram dano neste round (status breakOnHit). */
  struck: Set<string>;
}

function makeRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function push(ctx: Ctx, ev: BattleEvent): void {
  ctx.events.push(ev);
}

function logLine(ctx: Ctx, text: string): void {
  ctx.c.log.push(text);
  if (ctx.c.log.length > 320) ctx.c.log.splice(0, ctx.c.log.length - 320);
}

function msg(ctx: Ctx, text: string): void {
  logLine(ctx, text);
  push(ctx, { t: "msg", text });
}

function hist(ctx: Ctx, text: string): void {
  ctx.c.history.push(text);
}

function syncEv(ctx: Ctx): void {
  push(ctx, { t: "sync", combat: ctx.c, battle: snapView(ctx.c) });
}

function clipEv(
  ctx: Ctx,
  side: Side,
  clip: "attack" | "damage" | "guard" | "enter" | "idle",
  uid?: string,
): void {
  push(ctx, { t: "clip", side, clip, uid });
}

function animEv(ctx: Ctx, side: Side, id: string, hold = 0, uid?: string): void {
  push(ctx, { t: "anim", side, id, hold, uid });
}

function vfxEv(ctx: Ctx, side: Side, url: string, uid?: string): void {
  push(ctx, { t: "vfx", side, url, uid });
}

function floatEv(ctx: Ctx, side: Side, text: string, tone: FloatTone, uid?: string): void {
  push(ctx, { t: "float", side, text, tone, uid });
}

function orderEv(ctx: Ctx): void {
  push(ctx, { t: "order", order: orderPreview(ctx.c) });
}

function passiveEv(ctx: Ctx, side: Side, label: string, text: string): void {
  push(ctx, { t: "passive", side, label, text });
}

function statusEv(ctx: Ctx, side: Side, id: string, tone: "buff" | "debuff"): void {
  push(ctx, { t: "status", side, id, label: effectLabel(id), tone });
}

function dmgEv(ctx: Ctx, side: Side, value: number, element: string, tier: AffinityTier): void {
  push(ctx, { t: "dmg", side, value, element, tier });
}

function fieldEv(ctx: Ctx): void {
  const w = ctx.c.field.weather;
  push(ctx, { t: "field", label: w.label, desc: w.desc, color: w.color });
}

function chargeEv(ctx:Ctx,m:Combatant):void { push(ctx,{t:"charge",side:m.side,uid:m.uid,value:m.ultimateCharge}); }

function phaseEv(ctx: Ctx, side: Side, name: string, form: string, color: string): void {
  push(ctx, { t: "phase", side, name, form, color });
}

/** Fila de eventos vazia (usada por quem so quer o estado). */
function newCtx(c: Combat, seed: number): Ctx {
  return { c, events: [], rng: makeRng(seed), struck: new Set<string>() };
}

/* ============================================================ recursos */

function resLabel(m: Combatant): string {
  return m.resId ? RESOURCES[m.resId].label : "RECURSO";
}

function gainRes(ctx: Ctx, m: Combatant, n: number, announce = false): void {
  if (!m.resId || n === 0 || !alive(m)) return;
  const max = RESOURCES[m.resId].max;
  const before = m.res;
  m.res = Math.max(0, Math.min(max, m.res + n));
  if (m.res === before) return;
  if (m.res === max && before < max) {
    msg(ctx, `${m.name}: ${resLabel(m)} em MAXIMO (${max}).`);
    passiveEv(ctx, m.side, resLabel(m), `recurso cheio ${max}/${max}`);
  } else if (announce) {
    passiveEv(ctx, m.side, resLabel(m), `${m.res}/${max}`);
  }
}

function spendRes(ctx: Ctx, m: Combatant, cost?: Partial<Record<ResourceId, number>>): number {
  if (!cost || !m.resId) return 0;
  let spent = 0;
  for (const key of Object.keys(cost) as ResourceId[]) {
    const need = cost[key] ?? 0;
    if (need <= 0) continue;
    m.res = Math.max(0, m.res - need);
    spent += need;
  }
  if (spent > 0) passiveEv(ctx, m.side, resLabel(m), `-${spent} de ${resLabel(m)}`);
  return spent;
}

function canPay(m: FighterView, cost?: Partial<Record<ResourceId, number>>): string {
  if (!cost) return "";
  for (const key of Object.keys(cost) as ResourceId[]) {
    const need = cost[key] ?? 0;
    if (need > 0 && m.res < need) return `${RESOURCES[key].label} insuficiente`;
  }
  return "";
}

/** Shared with the command UI: only normal skills pay MP/chassis resources. */
export function skillUnavailable(m:FighterView,skill:KitSkill):string {
 if(m.charged)return m.chargeTurns>0?"PREPARANDO GOLPE":"GOLPE PRONTO PARA LIBERAR";
 if(statusImpact(m.effects).silence&&skill.mp>0)return "SILENCIADO";
 if(m.mp<skill.mp)return "MP INSUFICIENTE";
 return canPay(m,skill.cost);
}

/** Aplica a politica de recurso do chassi num ponto do turno. */
function resPolicy(
  ctx: Ctx,
  m: Combatant,
  when: "onHit" | "onTakeHit" | "onKill" | "onTurn" | "onCrit",
): void {
  if (!m.resId) return;
  const pol = RESOURCE_POLICY[m.resId];
  const n = pol[when] ?? 0;
  if (n !== 0) gainRes(ctx, m, n);
  if (when === "onTurn" && pol.decay) gainRes(ctx, m, -pol.decay);
}

/* ======================================================== status ativo */

/** Aplica (ou reforca) um status. Devolve false quando o alvo e imune. */
function addStatus(
  ctx: Ctx,
  target: Combatant,
  id: string,
  power: number,
  turns: number,
  src?: string,
): boolean {
  if (!alive(target)) return false;
  const def = STATUS_MAP[id];
  if (!def) return false;
  const buf = isBuff(def.id);
  const el = STATUS_ELEMENT[id];
  if (!buf && el && affinity(el, target.element) <= 0) {
    msg(ctx, `${target.name} absorve ${def.label}: imune a ${el}.`);
    return false;
  }
  const existing = target.effects.find((e) => e.type === id);
  if (existing) {
    existing.turns = Math.max(existing.turns, turns);
    existing.power = Math.max(existing.power, power);
    existing.stacks = Math.min(def.max, existing.stacks + 1);
    return true;
  }
  target.effects.push({ type: id, power, turns, stacks: 1, from: src });
  if (!buf) target.statusSuffered += 1;
  else target.statusApplied += 1;
  animEv(ctx, target.side, `status_on_${id}`, 0, target.uid);
  animEv(ctx, target.side, statusBurstFor(id), 0, target.uid);
  statusEv(ctx, target.side, id, buf ? "buff" : "debuff");
  logLine(ctx, `${target.name} recebe ${def.label} por ${turns} turno(s).`);
  return true;
}

/** Remove condicoes negativas preservando os buffs (PURGE_KEEPS). */
function purgeEffects(ctx: Ctx, target: Combatant): number {
  const keeps = new Set<string>(PURGE_KEEPS as string[]);
  const before = target.effects.length;
  target.effects = target.effects.filter((e) => keeps.has(e.type));
  const removed = before - target.effects.length;
  if (removed > 0) {
    logLine(ctx, `${target.name} limpa ${removed} efeito(s) negativo(s).`);
    animEv(ctx, target.side, "support_coolant", 0, target.uid);
    applyPassiveOutput(ctx, target, foeOf(ctx, target), hook(ctx, target, foeOf(ctx, target), "onPurge", { value: removed }));
  }
  return removed;
}

function consumeBarrier(m: Combatant): void {
  const e = m.effects.find((x) => x.type === "barrier");
  if (!e) return;
  e.stacks -= 1;
  if (e.stacks <= 0) m.effects = m.effects.filter((x) => x !== e);
}

function consumeShield(m: Combatant, amount: number): void {
  let left = amount;
  for (const e of m.effects) {
    if (left <= 0) break;
    if (e.type !== "shield") continue;
    const stacks = Math.max(1, e.stacks);
    const total = e.power * stacks;
    const used = Math.min(total, left);
    left -= used;
    e.power = Math.max(0, Math.round((total - used) / stacks));
    if (e.power <= 0) m.effects = m.effects.filter((x) => x !== e);
  }
}

/* ================================================== mobilidade e cura */

function clampMp(m: Combatant, value: number): void {
  m.mp = Math.max(0, Math.min(m.maxMp, Math.round(value)));
}

function spendMp(ctx: Ctx, m: Combatant, amount: number): void {
  clampMp(m, m.mp - amount);
  applyPassiveOutput(ctx, m, foeOf(ctx, m), hook(ctx, m, foeOf(ctx, m), "onMpSpend", { value: amount }));
}

/** Multiplicador de cura recebida (status e clima). */
function healMult(ctx: Ctx, m: Combatant): number {
  const imp = statusImpact(m.effects);
  const w = ctx.c.field.weather;
  return Math.max(0, 1 + (imp.mods.healIn + (w.healIn ?? 0)) / 100);
}

function heal(ctx: Ctx, m: Combatant, amount: number, label = "REPARO"): number {
  if (!alive(m) || amount <= 0) return 0;
  const value = Math.round(amount * healMult(ctx, m));
  if (value <= 0) return 0;
  const before = m.hp;
  m.hp = Math.min(m.maxHp, m.hp + value);
  const real = m.hp - before;
  if (real <= 0) return 0;
  m.healed += real;
  floatEv(ctx, m.side, `+${real}`, "heal", m.uid);
  animEv(ctx, m.side, `support_${/regen/.test(label) ? "nanite" : /passiva/.test(label) ? "medic" : /ultimate/.test(label) ? "rally" : /sifao/.test(label) ? "patch" : "repair"}`, 0, m.uid);
  logLine(ctx, `${m.name} recupera ${real} de HP (${label}).`);
  const p = runPassives(m.passives, "onHeal", makePctx(ctx, m, foeOf(ctx, m), "onHeal", { value: real }));
  for (const f of p.fired) passiveEv(ctx, m.side, f.name, f.text);
  if (p.out.mp) clampMp(m, m.mp + p.out.mp);
  if (p.out.res) gainRes(ctx, m, p.out.res);
  return real;
}

/** Dano direto: ignora esquiva, parry e resistencia, mas nao escudo/barreira. */
function damageDirect(
  ctx: Ctx,
  src: Combatant,
  dst: Combatant,
  amount: number,
  label: string,
): number {
  if (!alive(dst) || amount <= 0) return 0;
  const imp = statusImpact(dst.effects);
  if (imp.barrier > 0) {
    consumeBarrier(dst);
    floatEv(ctx, dst.side, "ANULADO", "info", dst.uid);
    return 0;
  }
  let d = Math.round(amount);
  if (imp.shield > 0) {
    const absorbed = Math.min(imp.shield, d);
    consumeShield(dst, absorbed);
    d -= absorbed;
    if (absorbed > 0) floatEv(ctx, dst.side, `ESCUDO -${absorbed}`, "info", dst.uid);
  }
  if (d <= 0) return 0;
  const hpLost=Math.min(dst.hp,d);
  dst.hp = Math.max(0, dst.hp - d);
  avoidDeath(ctx, dst, src);
  if(src.uid!==dst.uid&&hpLost>0)gainUltimate(ctx,dst,Math.min(16,Math.max(4,Math.ceil(hpLost/dst.maxHp*40))));
  dst.damageTaken += d;
  if (src !== dst) src.damageDealt += d;
  ctx.struck.add(dst.uid);
  floatEv(ctx, dst.side, `${d}`, "dmg", dst.uid);
  logLine(ctx, `${dst.name} sofre ${d} de dano direto (${label}).`);
  if (src !== dst && dst.hp <= 0) src.kills += 1;
  return d;
}

/* ================================================== mecanicas e passivas */

function talentMech(m: Combatant): MechId | undefined {
  const t = m.talent;
  if (!t || t.kind === "stat" || t.kind === "ultimate") return undefined;
  return t.mech;
}

/** Mecanicas que valem neste golpe: skill + talento + fase de chefe. */
function mechIdsOf(m: Combatant, skill: KitSkill): MechId[] {
  const out: MechId[] = [...mechList(skill)];
  const tm = talentMech(m);
  if (tm) out.push(tm);
  if (m.boss && m.bossPhase > 0) {
    const phase = m.boss[m.bossPhase - 1];
    for (const id of phase?.mech ?? []) out.push(id);
  }
  return out;
}

function makePctx(
  ctx: Ctx,
  who: Combatant,
  foe: Combatant,
  hookId: PassiveCtx["hook"],
  v: { dmg?: number; crit?: boolean; value?: number },
): PassiveCtx {
  const c = ctx.c;
  return {
    who: passiveActor(who, who.ultimateCharge / 10, c.turn),
    foe: passiveActor(foe, foe.ultimateCharge / 10, c.turn),
    hook: hookId,
    dmg: v.dmg ?? 0,
    crit: v.crit ?? false,
    value: v.value ?? 0,
    rng: ctx.rng,
    allyHpPct: livingRatio(teamOf(c, who.side)),
    foeHpPct: foe.hp / Math.max(1, foe.maxHp),
    isPlayer: who.side === "player",
  };
}

/** Oponente "principal" de um lutador, para as passivas que olham para o outro. */
function foeOf(ctx: Ctx, m: Combatant): Combatant {
  return fieldOf(ctx.c, other(m.side)) ?? m;
}

/** Roda passivas de um hook e emite os disparos no log de combate. */
function hook(
  ctx: Ctx,
  holder: Combatant,
  foe: Combatant,
  pass: PassiveCtx["hook"],
  v: { dmg?: number; crit?: boolean; value?: number },
): PassiveResult {
  const once = new Set(["secondWind", "phoenixCore", "undyingCore", "firstBlood"]);
  let ids = holder.passives.filter(id => !once.has(id) || !(holder.passiveUsed ?? []).includes(id));
  if (pass === "onDeathAvoid") ids = ids.filter(id => id === "phoenixCore" || id === "undyingCore").slice(0, 1);
  // Este despacho é a conversão do dano de zona, não uma entrada inimiga.
  if (pass === "onTerrain") ids = ids.filter(id => id === "hazardWalker");
  const pctx = makePctx(ctx, holder, foe, pass, v);
  pctx.who.hits = holder.roundHits ?? 0;
  const res = runPassives(ids, pass, pctx);
  for (const f of res.fired) if (once.has(f.id)) (holder.passiveUsed ??= []).push(f.id);
  for (const f of res.fired) passiveEv(ctx, holder.side, f.name, f.text);
  return res;
}

/** Reaction damage never recursively invokes hit/crit passives or reserve actions. */
function applyPassiveOutput(ctx: Ctx, holder: Combatant, foe: Combatant, p: PassiveResult, scoped = false): void {
  if (p.out.heal) heal(ctx, holder, Math.round(p.out.heal), "passiva");
  if (p.out.mp) clampMp(holder, holder.mp + p.out.mp);
  if (p.out.res) gainRes(ctx, holder, p.out.res);
  if (p.out.flat && holder.uid !== foe.uid) damageDirect(ctx, holder, foe, p.out.flat, "reação passiva");
  if (scoped) {
    holder.passiveMult = Math.min(2, Math.max(holder.passiveMult ?? 1, p.out.mult ?? 1));
    holder.passiveGuard = Math.min(.4, Math.max(holder.passiveGuard ?? 0, p.out.guard ?? 0));
  }
}

/** Death avoidance is checked before kill rewards; each core is consumed once. */
function avoidDeath(ctx: Ctx, m: Combatant, foe: Combatant): boolean {
  if (m.hp > 0 || m.fainted) return false;
  const p = hook(ctx, m, foe, "onDeathAvoid", { value: 0 });
  if (!p.fired.length) return false;
  m.hp = Math.min(m.maxHp, Math.max(1, Math.round(p.out.heal ?? 1)));
  if (p.out.res) gainRes(ctx, m, p.out.res);
  floatEv(ctx, m.side, "NÚCLEO REATIVADO", "heal", m.uid);
  return true;
}

/* =============================================================== dano */

interface StrikeOpts {
  idx?: number;
  hits?: number;
  mult?: number;
  noMiss?: boolean;
  spent?: number;
  /** quando true nao gera eventos de impacto (dano em area derivado). */
  quiet?: boolean;
  /** Usado apenas na projeção isolada para comparar acerto normal/crítico. */
  critical?: boolean;
}

interface Strike {
  dmg: number;
  crit: boolean;
  miss: boolean;
  parry: boolean;
  el: string;
  tier: AffinityTier;
  killed: boolean;
}

function fullMiss(): Strike {
  return { dmg: 0, crit: false, miss: true, parry: false, el: "", tier: "neutro", killed: false };
}

/** Chance de erro do golpe (esquiva passiva + esquiva ativa + mechs sem erro). */
function missChanceFor(
  ctx: Ctx,
  vic: Combatant,
  aS: EffStats,
  vS: EffStats,
  mechs: MechId[],
): number {
  if (mechs.includes("beam") || mechs.includes("relentless") || mechs.includes("aimedShot")) return 0;
  let chance =
    evasionChance(aS.agl, vS.agl) +
    gadgetBonus(vic, "phase") / 100 +
    cardBonus(vic, "evade") / 100 +
    vS.evade / 100;
  if (vic.evadeTurns > 0) chance += 0.55;
  const zone = zoneOf(ctx.c, vic);
  if (zone.kind === "cover") chance += 0.04;
  return Math.max(0, Math.min(0.85, chance));
}

/**
 * Um golpe. Le exatamente as mesmas fontes do `damagePreview`: stats efetivos,
 * posicao, zona, clima, afinidade, mecanicas, passivas, status e escudo.
 */
function strike(
  ctx: Ctx,
  atk: Combatant,
  vic: Combatant,
  skill: KitSkill,
  o: StrikeOpts = {},
): Strike {
  const c = ctx.c;
  if (!alive(atk) || !alive(vic)) return fullMiss();
  const killsBefore = atk.kills;
  const impA = statusImpact(atk.effects);
  const impV = statusImpact(vic.effects);
  const aS = effectiveStats(c, atk);
  const vS = effectiveStats(c, vic);
  const el = skillElement(atk, skill);
  const aff = affinity(el, vic.element);
  const tier = tierOf(aff);
  const posA = positionDef(atk.pos);
  const posV = positionDef(vic.pos);
  const zoneA = zoneOf(c, atk);
  const zoneV = zoneOf(c, vic);
  const mechs = mechIdsOf(atk, skill);
  const hits = Math.max(1, Math.min(6, o.hits ?? skill.hits ?? 1));

  // barreira anula o golpe inteiro
  if (impV.barrier > 0) {
    consumeBarrier(vic);
    animEv(ctx, vic.side, "sup_resist", 0, vic.uid);
    floatEv(ctx, vic.side, "BARREIRA", "info", vic.uid);
    logLine(ctx, `${vic.name} bloqueia ${skill.name} com uma barreira.`);
    return { dmg: 0, crit: false, miss: false, parry: false, el, tier, killed: false };
  }

  // esquiva
  const miss = o.noMiss ? 0 : missChanceFor(ctx, vic, aS, vS, mechs);
  if (ctx.rng() < miss) {
    vic.dodges += 1;
    const p = hook(ctx, vic, atk, "onEvade", { value: 0 });
    applyPassiveOutput(ctx, vic, atk, p, true);
    applyPassiveOutput(ctx, atk, vic, hook(ctx, atk, vic, "onMiss", { value: 0 }));
    floatEv(ctx, vic.side, "ESQUIVA", "miss", vic.uid);
    animEv(ctx, vic.side, "wind_dash", 0, vic.uid);
    logLine(ctx, `${vic.name} esquiva de ${skill.name}.`);
    return { ...fullMiss(), el, tier };
  }

  // critico (posicao de flanco e o recurso SORTE tambem pesam)
  let critChance =
    criticalChance(aS.agl, vS.agl) +
    gadgetBonus(atk, "crit") / 100 +
    cardBonus(atk, "crit") / 100 +
    aS.crit / 100;
  if (atk.pos === "flanco" && vic.pos !== "guarda") critChance += 0.08;
  if (mechs.includes("critUp") || mechs.includes("critMark")) critChance += 0.1;
  critChance = Math.max(0, Math.min(0.78, critChance));
  let crit = o.critical ?? (ctx.rng() < critChance);
  if (o.critical === undefined && !crit && atk.resId === "luck" && atk.res > 0 && ctx.rng() < 0.4) {
    atk.res -= 1;
    crit = true;
    passiveEv(ctx, atk.side, "SORTE", "gastou 1 de SORTE para forcar o critico");
  }

  // potencia do golpe (PACE = ritmo global de batalha)
  let power = skill.power * PACE * posA.dealtMult * (o.mult ?? 1);
  power *= atk.passiveMult ?? 1;
  power *= 1 + aS.dmgOut / 100;
  power *= 1 + weatherDamage(c.field, el, skill.tags) / 100;
  const perHit = skill.each ? power : power / hits;

  // Afinidade zero é absorção, nunca dano mínimo, status hostil ou reação de acerto.
  if (aff <= 0) {
    const amount = computeDamage({
      attackerStr: aS.str, attackerLevel: atk.level,
      victimDef: (vS.def + aS.str) / 2,
      skillPower: perHit * posV.takenMult, critical: crit, damageReduction: 0,
    });
    heal(ctx, vic, amount, "absorção elemental");
    floatEv(ctx, vic.side, "ABSORVE", "heal", vic.uid);
    logLine(ctx, `${vic.name} absorve ${skill.name}: ${el} recupera HP em vez de ferir.`);
    return { dmg: 0, crit, miss: false, parry: false, el, tier, killed: false };
  }

  const preDmg = computeDamage({
    attackerStr: aS.str,
    attackerLevel: atk.level,
    victimDef: (vS.def + aS.str) / 2,
    skillPower: perHit * aff * posV.takenMult,
    critical: crit,
    damageReduction: 0,
  });

  const mctx: MechCtx = {
    atk: mechActor(c, atk, atk.res, atk.ultimateCharge / 10),
    vic: mechActor(c, vic, vic.res, vic.ultimateCharge / 10),
    skill,
    side: atk.side,
    dmg: preDmg,
    crit,
    hits,
    idx: o.idx ?? 0,
    rng: ctx.rng,
    allyHpPct: livingRatio(teamOf(c, atk.side)),
    foeHpPct: livingRatio(teamOf(c, vic.side)),
    weatherElement: c.field.weather.element,
    zone: zoneA.id,
    affinity: aff,
    offGuard: vic.pos !== "guarda",
    alliesAlive: livingCount(c, atk.side),
    spent: o.spent ?? 0,
  };
  const mech = resolveMechs(mechs, mctx);
  let dmg = Math.max(1, Math.round(preDmg * mech.mult + mech.flat));

  // passivas de ataque (atacante) e de calculo de dano (vitima)
  const pA = hook(ctx, atk, vic, "onBeforeAttack", { dmg, crit });
  dmg = Math.max(1, Math.round(dmg * (pA.out.mult ?? 1) + (pA.out.flat ?? 0)));
  if(atk.passives.includes("teamPlayer"))dmg=Math.max(1,Math.round(dmg*(1+Math.max(0,livingCount(c,atk.side)-1)*.06)));
  const pV = hook(ctx, vic, atk, "onDamageCalc", { dmg, crit, value: dmg });
  dmg = Math.max(1, Math.round(dmg * (pV.out.mult ?? 1)));
  if ((pV.out.guard ?? 0) >= 1) {
    floatEv(ctx, vic.side, "ANULADO", "info", vic.uid);
    return { dmg: 0, crit: false, miss: false, parry: true, el, tier, killed: false };
  }

  // mitigacao
  let dr =
    impV.dr +
    -vS.dmgIn +
    gearDr(vic) +
    (vic.passiveGuard ?? 0) * 100 +
    (pV.out.guard ?? 0) * 100 +
    mech.guard * 100;
  if (zoneV.kind === "cover") dr += zoneV.val;
  if (zoneV.kind === "void") dr -= zoneV.val;
  const shielder = coverGuard(ctx, vic);
  if (shielder) dr += 22;
  dmg = Math.max(1, Math.round((dmg * (100 - Math.max(-40, Math.min(DR_MAX, dr)))) / 100));
  if (shielder) {
    logLine(ctx, `${shielder.name} intercepta parte do golpe via posicao de GUARDA.`);
    floatEv(ctx, shielder.side, "INTERCEPTA", "info", shielder.uid);
  }

  // parry (postura de contra-golpe)
  if (vic.parryTurns > 0 && !crit) {
    vic.parryTurns -= 1;
    vic.parries += 1;
    vic.counter = Math.max(0, vic.parryTurns);
    const back = Math.max(1, Math.round(dmg * 0.6));
    msg(ctx, `${vic.name} APARA ${skill.name} e devolve o golpe!`);
    animEv(ctx, vic.side, "sup_counter", 0, vic.uid);
    floatEv(ctx, vic.side, "PARRY", "info", vic.uid);
    damageDirect(ctx, vic, atk, back, "contra-golpe");
    const pP = hook(ctx, vic, atk, "onHit", { dmg: back, crit: false });
    if (pP.out.heal) heal(ctx, vic, Math.round(pP.out.heal), "passiva");
    if (pP.out.res) gainRes(ctx, vic, pP.out.res);
    return { dmg: 0, crit: false, miss: false, parry: true, el, tier, killed: false };
  }

  // escudo
  if (impV.shield > 0) {
    const absorbed = Math.min(impV.shield, dmg);
    if (absorbed > 0) {
      consumeShield(vic, absorbed);
      dmg -= absorbed;
      floatEv(ctx, vic.side, `ESCUDO -${absorbed}`, "info", vic.uid);
    }
  }
  if (dmg <= 0) {
    logLine(ctx, `${vic.name} absorve ${skill.name} por completo.`);
    return { dmg: 0, crit: false, miss: false, parry: false, el, tier, killed: false };
  }

  // dano efetivo
  const hpLost=Math.min(vic.hp,dmg);
  vic.hp = Math.max(0, vic.hp - dmg);
  avoidDeath(ctx, vic, atk);
  if(hpLost>0)gainUltimate(ctx,vic,Math.min(16,Math.max(4,Math.ceil(hpLost/vic.maxHp*40))));
  if (atk.side === "enemy" && ctx.c.rules.core !== undefined) {
    const leak = Math.max(1, Math.ceil(dmg / Math.max(1, vic.maxHp) * 15));
    ctx.c.coreHp = Math.max(0, ctx.c.coreHp - (ctx.c.coreShield > 0 ? Math.max(1, Math.floor(leak * .35)) : leak));
    msg(ctx, `NUCLEO: ${Math.round(ctx.c.coreHp)}/100 — vazamento do golpe inimigo.`);
  }
  vic.damageTaken += dmg;
  atk.damageDealt += dmg;
  atk.hits += 1;
  atk.roundHits = (atk.roundHits ?? 0) + 1;
  atk.skillUse[skill.id] = (atk.skillUse[skill.id] ?? 0) + 1;
  ctx.struck.add(vic.uid);
  if (crit) atk.crits += 1;

  if (!o.quiet) {
    floatEv(ctx, vic.side, `${dmg}`, crit ? "crit" : "dmg", vic.uid);
    animEv(ctx, vic.side, hitAnimFor(dmg, vic.maxHp, crit), 0, vic.uid);
    animEv(ctx, vic.side, chassisAnimFor(vic.robotId), 0, vic.uid);
    if (crit) animEv(ctx, vic.side, glitchAnimFor(skill.id), 0, vic.uid);
    animEv(ctx, vic.side, burstAnimFor(el), 0, vic.uid);
    const decal = decalAnimFor(el);
    if (decal) animEv(ctx, vic.side, decal, 0, vic.uid);
    if (skill.tags?.includes("projetil") || skill.tags?.includes("perfurante")) {
      animEv(ctx, atk.side, projectileAnimFor(el, !!skill.tags?.includes("perfurante")), 0, atk.uid);
    } else if (skill.tags?.includes("corpo") || skill.tags?.includes("corte")) {
      animEv(ctx, atk.side, trailAnimFor(skill.id), 0, atk.uid);
    }
    dmgEv(ctx, vic.side, dmg, el, tier);
    if (crit) animEv(ctx, vic.side, "ban_crit", 0, vic.uid);
    logLine(
      ctx,
      `${atk.name} usa ${skill.name} em ${vic.name}: ${dmg}${crit ? " CRITICO" : ""}${
        aff > 1 ? " (fraqueza)" : aff < 1 && aff > 0 ? " (resistido)" : aff <= 0 ? " (absorvido)" : ""
      }.`,
    );
  }

  // reacoes defensivas
  applyPassiveOutput(ctx, vic, atk, { ...pV, out: { flat: pV.out.flat, heal: pV.out.heal, mp: pV.out.mp } });
  applyPassiveOutput(ctx, vic, atk, hook(ctx, vic, atk, "onTakeHit", { dmg, crit, value: hpLost }), true);
  if (vic.hp > 0 && vic.hp / vic.maxHp < .35) applyPassiveOutput(ctx, vic, atk, hook(ctx, vic, atk, "onLowHp", { value: vic.hp }));
  if (impV.thorns > 0 && isMelee(skill)) {
    damageDirect(ctx, vic, atk, Math.round((dmg * impV.thorns) / 100), "espinhos");
    animEv(ctx, vic.side, "sup_thorns", 0, vic.uid);
  }
  if (impV.reflect > 0) {
    damageDirect(ctx, vic, atk, Math.round((dmg * impV.reflect) / 100), "reflexo");
    animEv(ctx, vic.side, "sup_resist", 0, vic.uid);
  }

  // sustentacao
  const sip = (impA.lifelink / 100) * dmg + (mech.heal ?? 0) + (pA.out.heal ?? 0);
  if (sip > 0) {
    heal(ctx, atk, Math.round(sip), "sifao");
    animEv(ctx, atk.side, "sup_leech", 0, atk.uid);
  }
  const mpBack = (mech.mpGain ?? 0) + (pA.out.mp ?? 0);
  if (mpBack > 0) {
    clampMp(atk, atk.mp + mpBack);
    floatEv(ctx, atk.side, `+${mpBack} MP`, "info", atk.uid);
  }
  if (pA.out.res) gainRes(ctx, atk, pA.out.res);
  if (pV.out.res) gainRes(ctx, vic, pV.out.res);
  if (mech.selfDmg > 0) {
    damageDirect(ctx, atk, atk, Math.round(mech.selfDmg), "custo de sangue");
    animEv(ctx, atk.side, "scr_flash_red", 0, atk.uid);
  }
  for (const note of [...mech.notes, pA.out.text, pV.out.text]) {
    if (note) logLine(ctx, `  ${note}`);
  }

  // status do golpe
  applySkillStatus(ctx, atk, vic, skill);

  // recursos do golpe
  resPolicy(ctx, atk, "onHit");
  if (crit) resPolicy(ctx, atk, "onCrit");
  resPolicy(ctx, vic, "onTakeHit");

  if (skill.gain && atk.resId) {
    for (const key of Object.keys(skill.gain) as ResourceId[]) gainRes(ctx, atk, skill.gain[key] ?? 0);
  }
  const pH = hook(ctx, atk, vic, "onHit", { dmg, crit });
  applyPassiveOutput(ctx, atk, vic, pH, true);
  if (crit) applyPassiveOutput(ctx, atk, vic, hook(ctx, atk, vic, "onCrit", { dmg, crit, value: dmg }));
  applyPassiveOutput(ctx, atk, vic, hook(ctx, atk, vic, "onAfterAttack", { dmg, crit, value: dmg }));
  if (atk.hp / atk.maxHp < 0.35) {
    const pL = hook(ctx, atk, vic, "onLowHp", { value: atk.hp });
    if (pL.out.heal) heal(ctx, atk, Math.round(pL.out.heal), "passiva");
  }

  // abate
  let killed = false;
  if (vic.hp <= 0) {
    killed = true;
    const anyKill = [...c.player.fighters, ...c.enemy.fighters].some((m) => m.kills > 0);
    atk.kills = Math.max(atk.kills, killsBefore + 1);
    resPolicy(ctx, atk, "onKill");
    const pK = hook(ctx, atk, vic, "onKill", { value: 0 });
    if (pK.out.heal) heal(ctx, atk, Math.round(pK.out.heal), "abate");
    if (pK.out.mp) clampMp(atk, atk.mp + pK.out.mp);
    if (pK.out.res) gainRes(ctx, atk, pK.out.res);
    if (!anyKill) {
      atk.firstBlood = true;
      hist(ctx, `${atk.name} marca o primeiro sangue em ${vic.name}`);
      msg(ctx, `PRIMEIRO SANGUE para ${atk.name}!`);
      animEv(ctx, atk.side, "scr_flash_gold", 0, atk.uid);
    }
    hist(ctx, `${atk.name} derruba ${vic.name} (${dmg} de dano, ${skill.name})`);
  }
  return { dmg, crit, miss: false, parry: false, el, tier, killed };
}

/** Golpes de corpo a corpo sofrem espinhos; projeteis e area nao. */
function isMelee(skill: KitSkill): boolean {
  const tags = skill.tags ?? [];
  if (tags.includes("projetil") || tags.includes("area")) return false;
  return true;
}

/** Aplica os status do golpe no alvo e em si mesmo. */
function applySkillStatus(ctx: Ctx, atk: Combatant, vic: Combatant, skill: KitSkill): void {
  const apply = (target: Combatant, id: string, power: number, turns: number) => {
    const woven = atk.passives.includes("statusWeaver");
    const duration = turns + (woven ? 1 : 0) + (id === "burn" && atk.passives.includes("pyromaniac") ? 1 : 0);
    if (addStatus(ctx, target, id, woven ? power * 1.2 : power, duration, atk.name)) {
      applyPassiveOutput(ctx, atk, target, hook(ctx, atk, target, "onStatusApply", { value: power }));
    }
  };
  const legacy = skill.effect;
  if (legacy && ctx.rng() < legacy.chance) {
    apply(vic, legacy.type, legacy.power, legacy.turns);
  }
  for (const st of skill.status ?? []) {
    if (ctx.rng() * 100 < st.p) apply(vic, st.s, st.v ?? 12, st.t);
  }
  for (const st of skill.self ?? []) {
    if (ctx.rng() * 100 < st.p) apply(atk, st.s, st.v ?? 12, st.t);
  }
}

/** One charge increment per action, not per hit. */
function gainUltimate(ctx:Ctx,m:Combatant,amount:number):void {
 if(amount<=0||!alive(m))return;
 const before=m.ultimateCharge;
 m.ultimateCharge=Math.min(ULTIMATE_MAX,Math.round(before+amount));
 if(before!==m.ultimateCharge){
  chargeEv(ctx,m);
  const p=hook(ctx,m,foeOf(ctx,m),"onUltimateCharge",{value:m.ultimateCharge-before});
  if(p.out.res)gainRes(ctx,m,p.out.res);
  if(p.out.mp)clampMp(m,m.mp+p.out.mp);
  if(p.out.heal){
   if(p.fired.some(f=>f.id==="teamPlayer"))for(const ally of livingMembers(teamOf(ctx.c,m.side)))heal(ctx,ally,Math.round(ally.maxHp*.03),"passiva coletiva");
   else heal(ctx,m,Math.round(p.out.heal),"passiva");
  }
 }
 if(before<ULTIMATE_MAX&&m.ultimateCharge===ULTIMATE_MAX){
  msg(ctx,`${m.name}: ULTIMATE PRONTO — 100%.`);hist(ctx,`${m.name}: ultimate carregado`);
  const p=hook(ctx,m,foeOf(ctx,m),"onUltReady",{value:ULTIMATE_MAX});
  if(p.out.res)gainRes(ctx,m,p.out.res);
  if(p.out.mp)clampMp(m,m.mp+p.out.mp);
  if(p.out.heal)heal(ctx,m,Math.round(p.out.heal),"passiva");
  if(p.fired.some(f=>f.id==="ultimateBattery"))for(const ally of livingMembers(teamOf(ctx.c,m.side))){
   addStatus(ctx,ally,"adrenalin",25,2,m.name);
   addStatus(ctx,ally,"evade_up",12,2,m.name);
  }
 }
}

/** Only explicit COVER protects a teammate; reserve never attacks automatically. */
function coverGuard(ctx:Ctx,vic:Combatant):Combatant|null {
 return livingMembers(teamOf(ctx.c,vic.side)).find(m=>m.uid!==vic.uid&&m.coverTurns>0&&m.coverUid===vic.uid)??null;
}

/* ========================================================== virada de turno */

/** Roda as passivas de inicio de round e devolve o que elas somaram. */
function startRoundHooks(ctx: Ctx): void {
  for (const m of [...ctx.c.player.fighters, ...ctx.c.enemy.fighters]) {
    if (!alive(m)) continue;
    m.roundHits = 0;
    m.passiveMult = 1;
    m.passiveGuard = 0;
    const p = hook(ctx, m, foeOf(ctx, m), "onRoundStart", { value: ctx.c.turn });
    // Reserve may sustain/aura the team, but cannot deal passive attack damage.
    applyPassiveOutput(ctx, m, foeOf(ctx, m), m.uid === fieldOf(ctx.c, m.side)?.uid ? p : { ...p, out: { ...p.out, flat: 0 } }, true);
    m.roundsActive += 1;
    chainBossPhase(ctx, m);
  }
}

/**
 * Avanca a fase de um chefe quando o HP cruza os cortes do dossie e aplica os
 * multiplicadores da fase em `bossMods` (lidos por `effectiveStats`).
 */
function chainBossPhase(ctx: Ctx, m: Combatant): void {
  if (!m.boss) return;
  const ratio = m.hp / m.maxHp;
  let idx = 0;
  m.boss.forEach((ph, i) => {
    if (ratio <= ph.at) idx = i + 1;
  });
  if (idx <= m.bossPhase) return;
  m.bossPhase = idx;
  const phases = m.boss.slice(0, idx);
  const mods = { str: 1, def: 1, agl: 1, crit: 0 };
  for (let i = 0; i < phases.length; i += 1) {
    const ph = phases[i];
    mods.str *= 1 + (ph.mods?.str ?? 1 + i * 0.15) - 1 + (ph.mods?.str ? 0 : i * 0.15);
    mods.def *= ph.mods?.def ?? 1 - i * 0.08;
    mods.agl *= ph.mods?.agl ?? 1 + i * 0.12;
    mods.crit += ph.mods?.crit ?? i * 0.08;
  }
  m.bossMods = mods;
  const ph = m.boss[idx - 1];
  if (!ph) return;
  msg(ctx, `${m.name} entra na fase "${ph.name}" (${ph.form}).`);
  phaseEv(ctx, m.side, ph.name, ph.form, ph.color);
  animEv(ctx, m.side, "ban_phase", 0, m.uid);
  animEv(ctx, m.side, glitchAnimFor(m.robotId), 0, m.uid);
  vfxEv(ctx, m.side, "/vfx/levelup.png", m.uid);
  hist(ctx, `${m.name} muda para a forma ${ph.form} (${ph.name})`);
  const p = hook(ctx, m, foeOf(ctx, m), "onBossPhase", { value: idx });
  if (p.out.res) gainRes(ctx, m, p.out.res);
  if (p.out.heal) heal(ctx, m, Math.round(p.out.heal), "fase");
}

/** Aplica o status de fim de round: dot, regen, pilhas e reacoes de quebra. */
function tickStatus(ctx: Ctx, m: Combatant): void {
  for (const e of m.effects) animEv(ctx, m.side, `status_tick_${e.type}`, 0, m.uid);
  const imp = statusImpact(m.effects);
  if (imp.dot > 0) {
    const d = Math.max(1, Math.round((m.maxHp * imp.dot) / 100));
    damageDirect(ctx, m, m, d, "dano continuo");
    animEv(ctx, m.side, "scr_flash_red", 0, m.uid);
  }
  if (imp.regen > 0) heal(ctx, m, Math.max(1, Math.round((m.maxHp * imp.regen) / 100)), "regeneracao");
  if (imp.mpBurn > 0) clampMp(m, m.mp - Math.round(m.maxMp * imp.mpBurn / 100));
  const w = ctx.c.field.weather;
  if (w.mpDrain) clampMp(m, m.mp - Math.round(m.maxMp * w.mpDrain / 100));
  if (w.dot) damageDirect(ctx, m, m, Math.max(1, Math.round((m.maxHp * w.dot) / 100)), "clima");
  const zone = zoneOf(ctx.c, m);
  if (alive(m) && zone.kind === "hazard") {
    if (m.passives.includes("hazardWalker")) {
      applyPassiveOutput(ctx, m, foeOf(ctx, m), hook(ctx, m, foeOf(ctx, m), "onTerrain", { value: zone.val }));
    } else {
      damageDirect(ctx, m, m, Math.max(1, Math.round(m.maxHp * zone.val / 100)), zone.label);
    }
  }
  if (zone.kind === "heal" && !w.noTerrainHeal) heal(ctx, m, Math.round(m.maxHp * zone.val / 100), zone.label);
  if (alive(m) && zone.kind === "energy") clampMp(m, m.mp + zone.val);

  // reacoes de quebra de status
  for (const e of [...m.effects]) {
    const def = STATUS_MAP[e.type];
    if (!def) continue;
    if (def.rule?.breakOnHit && ctx.struck.has(m.uid)) {
      removeEffect(m, e.type);
      logLine(ctx, `${m.name} perde ${def.label} ao levar o primeiro golpe do round.`);
      continue;
    }
    if (def.rule?.consumesStacks) e.stacks = Math.max(0, e.stacks - 1);
    e.turns -= 1;
    if (e.turns <= 0 || (def.max > 1 && e.stacks <= 0)) removeEffect(m, e.type);
  }
}

function removeEffect(m: Combatant, id: string): void {
  m.effects = m.effects.filter((e) => e.type !== id);
}

/** Expiracao de pos-efeitos: posturas de timing e coberturas. */
function tickTiming(ctx: Ctx, m: Combatant): void {
  if (m.parryTurns > 0) {
    m.parryTurns -= 1;
    m.counter = Math.max(0, m.parryTurns);
  }
  if (m.evadeTurns > 0) m.evadeTurns -= 1;
  if (m.coverTurns > 0) {
    m.coverTurns -= 1;
    if (m.coverTurns <= 0) m.coverUid = undefined;
  }
  if (m.stunTurns > 0) m.stunTurns -= 1;
  if (m.chargeTurns > 0) {
    m.chargeTurns -= 1;

  }
  const imp = statusImpact(m.effects);
  if (imp.doom && m.hp / m.maxHp <= 0.12) {
    msg(ctx, `${m.name} e selado pela CONDENACAO.`);
    damageDirect(ctx, m, m, m.hp, "condenacao");
  }
}

/** Executa um golpe carregado que estava aguardando o turno do dono. */
function resolveCharged(ctx: Ctx, m: Combatant): void {
  const pend = ctx.c.pending.filter((p) => p.uid === m.uid);
  ctx.c.pending = ctx.c.pending.filter((p) => p.uid !== m.uid);
  m.charged = null;
  m.chargeTurns = 0;
  for (const p of pend) {
    const skill = skillOf(m, p.skillId);
    let vic = byUid(ctx.c, p.targetUid);
    if (!vic || !alive(vic)) vic = foeOf(ctx, m);
    clipEv(ctx, m.side, "attack", m.uid);
    animEv(ctx, m.side, windupAnimFor(skill.id, skill.mp), 0, m.uid);
    vfxEv(ctx, m.side, skill.vfx, m.uid);
    const hits=Math.max(1,skill.hits??1);
    for(let i=0;i<hits&&alive(m)&&alive(vic);i++){
      strike(ctx, m, vic, skill, { idx:i,hits,mult: 1.6, noMiss: skill.tags?.includes("projetil"),spent:p.spent??0 });
    }
  }
}


/* ================================================================ acoes */

/** Uma acao de um lutador resolvida pelo motor. */
interface TurnPlan {
  kind: CombatAction["kind"];
  skill?: KitSkill;
  target?: Combatant;
  itemId?: string;
}

/** Confere se o lutador pode agir agora (controle de turno dos status). */
function canAct(ctx: Ctx, m: Combatant): boolean {
  if (!alive(m)) return false;
  const imp = statusImpact(m.effects);
  if (imp.skipTurn > 0 && ctx.rng() < imp.skipTurn) {
    msg(ctx, `${m.name} perde o turno (${imp.types[0] ?? "status"}).`);
    animEv(ctx, m.side, "ban_stun", 0, m.uid);
    return false;
  }
  if (m.stunTurns > 0) {
    msg(ctx, `${m.name} esta atordoado e nao age.`);
    animEv(ctx, m.side, "ban_stun", 0, m.uid);
    return false;
  }
  return true;
}

/** Executa um plano ja decidido (jogador ou IA). */
function runPlan(ctx: Ctx, m: Combatant, plan: TurnPlan): void {
  try { executePlan(ctx, m, plan); }
  finally {
    if (alive(m)) applyPassiveOutput(ctx, m, foeOf(ctx, m), hook(ctx, m, foeOf(ctx, m), "onEndTurn", { value: m.roundHits }), true);
  }
}

function executePlan(ctx: Ctx, m: Combatant, plan: TurnPlan): void {
  const c = ctx.c;
  m.ready = false;
  if (!canAct(ctx,m)) return;
  if(m.charged&&m.chargeTurns<=0){resolveCharged(ctx,m);return;}
  if(m.charged){msg(ctx,`${m.name} mantém a carga do golpe (${m.chargeTurns} turno(s)).`);return;}
  const imp = statusImpact(m.effects);

  switch (plan.kind) {
    case "skill": {
      const skill = plan.skill;
      if (!skill || !m.skillIds.includes(skill.id) || skill.id===ultimateOf(m).id) return;
      if (imp.silence && skill.mp > 0) {
        msg(ctx, `${m.name} esta SILENCIADO e nao consegue usar ${skill.name}.`);
        return;
      }
      if (skill.mp > 0 && m.mp < skill.mp) {
        msg(ctx, `${m.name} nao tem MP para ${skill.name}.`);
        return;
      }
      const blocked = canPay(m, skill.cost);
      if (blocked) {
        msg(ctx, `${m.name} nao pode usar ${skill.name}: ${blocked}.`);
        return;
      }
      const reach = reachesBench(skill) || (m.side === "player" && !!c.rules.targetId);
      if (m.lastActionKind && m.lastActionKind !== skill.kind) applyPassiveOutput(ctx, m, foeOf(ctx, m), hook(ctx, m, foeOf(ctx, m), "onAction", { value: 1 }), true);
      m.lastActionKind = skill.kind;
      if (m.side === "player" && skill.defense?.kind === "guard") c.coreShield = 2;
      const vic =
        skill.kind === "defense"
          ? m
          : plan.target && alive(plan.target) && (reach || plan.target.uid === foeOf(ctx, m).uid)
            ? plan.target
            : foeOf(ctx, m);
      if (skill.charge && skill.kind === "attack") {
        m.charged = skill.id;
        m.chargeTurns = skill.charge;
        const spent=spendRes(ctx,m,skill.cost);
        const lote = { uid: m.uid, skillId: skill.id, targetUid: vic.uid, turns: skill.charge,spent };
        c.pending = c.pending.filter((p) => p.uid !== m.uid);
        c.pending.push(lote);
        msg(ctx, `${m.name} carrega ${skill.name} (${skill.charge} turno(s)).`);
        animEv(ctx, m.side, windupAnimFor(skill.id, skill.mp), 0, m.uid);
        vfxEv(ctx, m.side, "/vfx/chrono.png", m.uid);
        if (skill.mp > 0) spendMp(ctx, m, skill.mp);
        gainUltimate(ctx,m,18);
        return;
      }
      if (skill.mp > 0) spendMp(ctx, m, skill.mp);
      const spent = spendRes(ctx, m, skill.cost);
      gainUltimate(ctx,m,skill.kind==="defense"?14:18);
      if (skill.kind === "defense") {
        openDefense(ctx, m, skill, spent);
        return;
      }
      clipEv(ctx, m.side, "attack", m.uid);
      animEv(ctx, m.side, windupAnimFor(skill.id, skill.mp), 0, m.uid);
      vfxEv(ctx, m.side, skill.vfx, m.uid);
      const hits = skill.hits && skill.hits > 1 ? skill.hits : 1;
      for (let i = 0; i < hits; i += 1) {
        if (!alive(m) || !alive(vic)) break;
        const target = imp.randomTarget && hits === 1 ? randomFoe(ctx, m) : vic;
        strike(ctx, m, target, skill, { idx: i, hits, spent });
      }
      if(reach)for(const b of livingMembers(teamOf(c,other(m.side)))){
        if(!alive(m))break;
        if(b.uid===vic.uid||b.uid===foeOf(ctx,m).uid)continue;
        strike(ctx,m,b,skill,{mult:0.4,noMiss:true,spent:0});
      }
      return;
    }
    case "item": {
      applyItem(ctx, m, plan.itemId ?? "");
      return;
    }
    case "guard": {
      if (m.lastActionKind === "attack") applyPassiveOutput(ctx, m, foeOf(ctx, m), hook(ctx, m, foeOf(ctx, m), "onAction", { value: 1 }), true);
      m.lastActionKind = "defense";
      gainUltimate(ctx,m,14);
      if (m.side === "player") c.coreShield = 2;
      m.parryTurns = Math.max(m.parryTurns, 1);
      m.counter = m.parryTurns;
      msg(ctx, `${m.name} assume postura de GUARDA.`);
      clipEv(ctx, m.side, "guard", m.uid);
      animEv(ctx, m.side, "support_ward", 0, m.uid);
      vfxEv(ctx, m.side, "/vfx/shield.png", m.uid);
      return;
    }
    case "dodge": {
      gainUltimate(ctx,m,14);
      m.evadeTurns = Math.max(m.evadeTurns, 1);
      gainRes(ctx, m, 1, true);
      msg(ctx, `${m.name} entra em ESQUIVA ATIVA.`);
      clipEv(ctx, m.side, "guard", m.uid);
      animEv(ctx, m.side, "wind_dash", 0, m.uid);
      return;
    }
    case "cover": {
      const ally = plan.target && alive(plan.target) ? plan.target : lowestAlly(ctx, m);
      if (!ally || ally.uid === m.uid) {
        msg(ctx, `${m.name} nao encontra quem cobrir.`);
        return;
      }
      m.coverTurns = 2;
      m.coverUid = ally.uid;
      msg(ctx, `${m.name} cobre ${ally.name}.`);
      animEv(ctx, m.side, "sup_ward", 0, m.uid);
      vfxEv(ctx, m.side, "/vfx/ward.png", m.uid);
      return;
    }
    case "analyze": {
      const vic = plan.target && alive(plan.target) ? plan.target : foeOf(ctx, m);
      const f = damagePreview(c, m.uid, vic.uid, m.skillIds[0]);
      const txt = f
        ? `${vic.name}: ${f.min}-${f.max} por golpe, ${f.tier}, crit ${Math.round(f.crit * 100)}%`
        : `${vic.name}`;
      msg(ctx, `${m.name} ANALISA ${vic.name}.`);
      passiveEv(ctx, m.side, "ANALISE", txt);
      gainRes(ctx, m, 2, true);
      addStatus(ctx, vic, "marked", 12, 2, m.name);
      return;
    }
    case "ultimate": {
      fireUltimate(ctx,m,plan.target);
      return;
    }
    case "reposition": {
      const ally=plan.target;const team=teamOf(c,m.side);const idx=ally?team.fighters.indexOf(ally):-1;
      if(ally&&alive(ally)&&idx>=0&&idx!==team.active){team.active=idx;msg(ctx,`${m.name} recua e ${ally.name} entra em campo!`);clipEv(ctx,m.side,"enter",ally.uid);animEv(ctx,m.side,"enter_teleport",0,ally.uid);orderEv(ctx);}
      return;
    }
    default: {
      msg(ctx, `${m.name} passa o turno.`);
    }
  }
}

/** Abre uma das 5 defesas do kit (guard/repair/purge/overcharge/counter). */
function openDefense(ctx: Ctx, m: Combatant, skill: KitSkill, spent: number): void {
  const kind = skill.defense?.kind ?? "guard";
  const pct = skill.defense?.percent ?? 0;
  const turns = skill.defense?.turns ?? 2;
  clipEv(ctx, m.side, "guard", m.uid);
  vfxEv(ctx, m.side, skill.vfx, m.uid);
  msg(ctx, `${m.name} usa ${skill.name}.`);
  switch (kind) {
    case "guard": {
      addStatus(ctx, m, "damage_reduction", skill.power, turns, m.name);
      animEv(ctx, m.side, "support_aegis", 0, m.uid);
      break;
    }
    case "repair": {
      heal(ctx, m, Math.max(1, Math.round((m.maxHp * pct) / 100)), skill.name);
      addStatus(ctx, m, "hp_regen", Math.max(2, Math.round(pct / 6)), turns, m.name);
      break;
    }
    case "purge": {
      purgeEffects(ctx, m);
      gainRes(ctx, m, 2, true);
      break;
    }
    case "overcharge": {
      animEv(ctx, m.side, "support_recharge", 0, m.uid);
      animEv(ctx, m.side, "support_ammo", 0, m.uid);
      clampMp(m, m.mp + Math.round((m.maxMp * pct) / 100));
      addStatus(ctx, m, "focus", 8, turns, m.name);
      floatEv(ctx, m.side, `+MP`, "info", m.uid);
      break;
    }
    case "counter": {
      m.parryTurns = Math.max(m.parryTurns, turns);
      m.counter = m.parryTurns;
      addStatus(ctx, m, "thorns", Math.max(10, Math.round(skill.power / 2)), turns, m.name);
      animEv(ctx, m.side, "sup_counter", 0, m.uid);
      break;
    }
  }
  resPolicy(ctx, m, "onTakeHit");
  if (skill.gain && m.resId) {
    for (const key of Object.keys(skill.gain) as ResourceId[]) gainRes(ctx, m, skill.gain[key] ?? 0);
  }
  logLine(ctx, `  gastou ${spent} de recurso em ${skill.name}.`);
}

/** One actor, consumes charge, no MP/resource payment or teammate action. */
function fireUltimate(ctx:Ctx,m:Combatant,target?:Combatant):void {
 if(m.ultimateCharge<ULTIMATE_MAX)return;
 const skill=ultimateOf(m);
 const vic=target&&alive(target)&&target.side!==m.side&&reachesBench(skill)?target:foeOf(ctx,m);
 if(!vic||!alive(vic))return;
 m.ultimateCharge=0;chargeEv(ctx,m);
 msg(ctx,`${m.name} — ${skill.name}!`);hist(ctx,`${m.name} usa ultimate exclusivo ${skill.name}`);
 push(ctx,{t:"ultimate",side:m.side,uid:m.uid,targetUid:vic.uid,robotId:m.robotId,label:skill.name,vfx:skill.vfx});
 clipEv(ctx,m.side,"attack",m.uid);vfxEv(ctx,m.side,skill.vfx,m.uid);
 const hits=Math.max(1,skill.hits??1);
 for(let i=0;i<hits&&alive(m)&&alive(vic);i++)strike(ctx,m,vic,skill,{idx:i,hits,spent:0});
}

/** Foe aleatorio (status de confusao). */
function randomFoe(ctx: Ctx, m: Combatant): Combatant {
  return foeOf(ctx, m);
}

function lowestAlly(ctx: Ctx, m: Combatant): Combatant | null {
  const list = livingMembers(teamOf(ctx.c, m.side)).filter((x) => x.uid !== m.uid);
  if (!list.length) return null;
  let best = list[0];
  for (const f of list) if (f.hp / f.maxHp < best.hp / best.maxHp) best = f;
  return best;
}

/** Usa um item de batalha (config.ts). */
function applyItem(ctx: Ctx, m: Combatant, itemId: string): void {
  const item = ITEM_MAP[itemId];
  const side = teamOf(ctx.c, m.side);
  if (!item || (side.items[itemId] ?? 0) <= 0) {
    msg(ctx, `${m.name} tentou usar um item indisponivel.`);
    return;
  }
  side.items[itemId] -= 1;
  const e = item.effect;
  msg(ctx, `${m.name} usa ${item.name}.`);
  vfxEv(ctx, m.side, `/vfx/${item.id === "capsule" ? "cosmos" : "heal"}.png`, m.uid);
  switch (e.kind) {
    case "heal":
      heal(ctx, m, Math.round((m.maxHp * e.percent) / 100), item.name);
      break;
    case "mp":
      clampMp(m, m.mp + Math.round((m.maxMp * e.percent) / 100));
      floatEv(ctx, m.side, "+MP", "info", m.uid);
      break;
    case "revive": {
      const dead = side.fighters.find((f) => !alive(f));
      if (dead) {
        dead.hp = Math.round((dead.maxHp * e.percent) / 100);
        dead.fainted = false;
        animEv(ctx, dead.side, "sup_revive", 0, dead.uid);
        msg(ctx, `${dead.name} volta ao combate.`);
      } else {
        heal(ctx, m, Math.round((m.maxHp * e.percent) / 100), item.name);
      }
      break;
    }
    case "buff": {
      if (e.type === "adrenalin") addStatus(ctx, m, "adrenalin", e.power, e.turns, item.name);
      else addStatus(ctx, m, "damage_reduction", e.power, e.turns, item.name);
      break;
    }
    case "purify":
      purgeEffects(ctx, m);
      break;
    case "capsule": {
      for (const f of livingMembers(side)) {
        heal(ctx, f, Math.round((f.maxHp * 45) / 100), item.name);
        clampMp(f, f.mp + Math.round((f.maxMp * 45) / 100));
        purgeEffects(ctx, f);
      }
      break;
    }
  }
  hist(ctx, `${m.name} usou ${item.name}`);
}

/* ================================================================== agenda */

/** Reorganiza a agenda do round por agilidade efetiva + ritmo da skill. */
function buildOrder(ctx: Ctx): void {
  const c = ctx.c;
  const all = [fieldOf(c, "player"), fieldOf(c, "enemy")].filter((x): x is Combatant => !!x);
  const scored = all.map((m) => {
    const st = effectiveStats(c, m);
    const pace = m.pace > 0 ? m.pace : 0;
    const order = st.agl + pace;
    m.pace = 0;
    return { m, score: order + ctx.rng() * 4, prio: m.charged ? 99 : 0 };
  });
  scored.sort((a, b) => b.prio - a.prio || b.score - a.score);
  c.order = scored.map((s) => s.m.uid);
  c.cursor = 0;
  c.ready = null;
}

/** A luta terminou? (evita narrowing excessivo do discriminante). */
function isOver(c: Combat): boolean {
  return c.phase === "over";
}

/** Pausa a agenda: um aliado caiu e o jogador precisa escolher quem entra. */
function requestSwap(ctx: Ctx): void {
  ctx.c.phase = "forced_swap";
  ctx.c.ready = null;
  msg(ctx, "O lider caiu. Escolha quem entra.");
  orderEv(ctx);
  syncEv(ctx);
}

/** Avanca a agenda ate achar um jogador pronto ou resolver tudo. */
function stepOrder(ctx: Ctx): void {
  const c = ctx.c;
  if (c.phase === "over") return;
  while (c.cursor < c.order.length) {
    const uid = c.order[c.cursor];
    const m = byUid(c, uid);
    c.cursor += 1;
    if (!m || !alive(m)) continue;
    const slot = teamOf(c, m.side).fighters.indexOf(m);
    if (slot >= 0) teamOf(c, m.side).active = slot;
    // politica de recurso do chassi: exatamente uma vez por turno tomado
    resPolicy(ctx, m, "onTurn");
    applyPassiveOutput(ctx, m, foeOf(ctx, m), hook(ctx, m, foeOf(ctx, m), "onTurnStart", { value: c.turn }), true);
    if (m.passives.includes("purgeAura")) {
      const negative = m.effects.find(e => !(PURGE_KEEPS as readonly string[]).includes(e.type));
      if (negative) removeEffect(m, negative.type);
    }
    if ((m.side === "player" || c.pvp) && !c.autoResolve) {
      m.ready = true;
      c.ready = m.uid;
      c.phase = "menu";
      orderEv(ctx);
      syncEv(ctx);
      return;
    }
    const pField = fieldOf(c, "player");
    const plan = chooseAiAction(ctx, m);
    runPlan(ctx, m, plan);
    handleFaints(ctx);
    if (checkEnd(ctx)) return;
    // um aliado caiu no turno do inimigo: o jogador escolhe quem entra
    if (
      !c.pvp && !c.autoResolve &&
      pField &&
      !alive(pField) &&
      livingCount(c, "player") > 0
    ) {
      requestSwap(ctx);
      return;
    }
  }
  endRound(ctx);
}

/** Encerra o round: clima roda, status tickam, agenda renova. */
function endRound(ctx: Ctx): void {
  const c = ctx.c;
  for (const m of [...c.player.fighters, ...c.enemy.fighters]) {
    if (!alive(m)) continue;
    tickStatus(ctx, m);
    tickTiming(ctx, m);
  }
  if (c.rules.core !== undefined) {
    const bombard = Math.max(0, livingCount(c, "enemy") - (c.coreShield > 0 ? 2 : 0));
    c.coreHp = Math.max(0, c.coreHp - bombard);
    c.coreShield = Math.max(0, c.coreShield - 1);
  }
  const pFieldBefore = fieldOf(c, "player");
  handleFaints(ctx);
  if (checkEnd(ctx)) return;
  if (c.rules.deadline && c.turn >= c.rules.deadline) {
    finishObjective(ctx, "lose", "PRAZO ESGOTADO: o reator entrou em colapso.");
    return;
  }
  const needSwap = !!pFieldBefore && !alive(pFieldBefore);
  /* Trava de duracao: passado o limite, a luta e decidida por atrito para
   * que nenhum combate (IA ou script) possa travar indefinidamente. */
  if (c.turn >= MAX_ROUNDS) {
    decideByAttrition(ctx);
    return;
  }
  const rot = rotateWeather(c.field);
  c.field = rot.field;
  if (rot.changed) {
    msg(ctx, `O clima vira: ${c.field.weather.label}.`);
    fieldEv(ctx);
    hist(ctx, `clima: ${c.field.weather.label}`);
  }
  c.turn += 1;
  startRoundHooks(ctx);
  c.history.push(`-- round ${c.turn} --`);
  buildOrder(ctx);
  orderEv(ctx);
  if (needSwap && !c.pvp) {
    requestSwap(ctx);
    return;
  }
  syncEv(ctx);
}

/** Marca os que caíram, dispara o evento de queda e limpa o alvo ativo. */
function handleFaints(ctx: Ctx): void {
  const c = ctx.c;
  for (const side of ["player", "enemy"] as Side[]) {
    const team = teamOf(c, side);
    for (const m of team.fighters) {
      if (m.hp <= 0 && !m.fainted) {
        if (avoidDeath(ctx, m, foeOf(ctx, m))) continue;
        m.fainted = true;
        m.ready = false;
        m.charged = null;
        m.chargeTurns = 0;
        c.pending = c.pending.filter(p=>p.uid!==m.uid);
        push(ctx, { t: "faint", side, uid: m.uid });
        animEv(ctx, side, "sup_faint", 0, m.uid);
        vfxEv(ctx, side, "/vfx/void.png", m.uid);
        msg(ctx, `${m.name} cai.`);
        hist(ctx, `${m.name} cai no round ${c.turn}`);
        const p = hook(ctx, m, foeOf(ctx, m), "onFaint", { value: 0 });
        if (p.out.res) gainRes(ctx, m, p.out.res);
        for (const ally of livingMembers(team)) {
          const reaction = hook(ctx, ally, foeOf(ctx, ally), "onAllyFaint", { value: m.maxHp });
          if (reaction.fired.some(f => f.id === "guardianAngel")) {
            for (const living of livingMembers(team)) heal(ctx, living, Math.round(living.maxHp * .12), "anjo da guarda");
            applyPassiveOutput(ctx, ally, foeOf(ctx, ally), { ...reaction, out: { ...reaction.out, heal: reaction.fired.some(f => f.id === "soulTether") ? Math.round(m.maxHp * .2) : 0 } });
          } else applyPassiveOutput(ctx, ally, foeOf(ctx, ally), reaction);
        }
      }
    }
    if (!alive(team.fighters[team.active])) {
      const next = team.fighters.findIndex(alive);
      if (next >= 0) team.active = next;
    }
  }
}

/** Limite de rounds de um combate. */
export const MAX_ROUNDS = 80;

/** Decisao por atrito: quem mantem a maior fracao de HP leva o combate. */
function decideByAttrition(ctx: Ctx): void {
  const c = ctx.c;
  const share = (side: Side): number => {
    const team = teamOf(c, side);
    let hp = 0;
    let max = 0;
    for (const m of team.fighters) {
      hp += Math.max(0, m.hp);
      max += m.maxHp;
    }
    return max > 0 ? hp / max : 0;
  };
  const p = share("player");
  const e = share("enemy");
  c.phase = "over";
  c.result = p >= e ? "win" : "lose";
  c.ready = null;
  hist(
    ctx,
    `limite de rounds: ${c.result} por atrito (${Math.round(p * 100)}% x ${Math.round(e * 100)}% de HP)`,
  );
  msg(
    ctx,
    c.result === "win"
      ? "LIMITE DE ROUNDS. Seu esquadrao resiste melhor e vence por atrito."
      : "LIMITE DE ROUNDS. O inimigo resiste melhor e vence por atrito.",
  );
  push(ctx, { t: "end", result: c.result });
  syncEv(ctx);
}

function finishObjective(ctx: Ctx, result: "win" | "lose", text: string): void {
  ctx.c.phase = "over"; ctx.c.result = result; ctx.c.ready = null;
  msg(ctx, text); hist(ctx, text); push(ctx, { t: "end", result }); syncEv(ctx);
}

/** Confere a condicao de vitoria/derrota e fecha o combate. */
function checkEnd(ctx: Ctx): boolean {
  const c = ctx.c;
  if (c.phase === "over") return true;
  const pAlive = livingCount(c, "player");
  const eAlive = livingCount(c, "enemy");
  if (c.rules.core !== undefined && c.coreHp <= 0) { finishObjective(ctx, "lose", "NUCLEO DESTRUIDO. A cidade perdeu sua fonte de energia."); return true; }
  if (c.rules.targetId && pAlive > 0) {
    const target = c.enemy.fighters.find((f) => f.robotId === c.rules.targetId);
    if (target && !alive(target)) { finishObjective(ctx, "win", "ALVO ELIMINADO. Os escoltas recuam."); return true; }
  }
  if (pAlive > 0 && eAlive > 0) return false;
  c.phase = "over";
  c.result = pAlive > 0 ? "win" : "lose";
  c.ready = null;
  hist(ctx, `resultado: ${c.result} no round ${c.turn}`);
  push(ctx, { t: "end", result: c.result });
  msg(ctx, c.result === "win" ? "VITORIA. O esquadrao segura o campo." : "DERROTA. O esquadrao caiu.");
  syncEv(ctx);
  return true;
}

/* ====================================================================== IA */

/** Ameaca de um alvo: posicao + afinidade + HP baixo (foco de execucao). */
function threatOf(vic: Combatant, el: string): number {
  const pos = positionDef(vic.pos);
  const aff = affinity(el, vic.element);
  const hp = vic.hp / vic.maxHp;
  return pos.threat * (0.6 + aff) * (1.6 - hp);
}

/**
 * IA tatica: le o perfil do dossie (papel, prioridade de execucao, conservacao,
 * auto-cuidado, posicao de foco) e a dificuldade. Nao ha aleatoriedade na
 * escolha do alvo — o que muda por dificuldade e a profundidade da leitura.
 */
/** IA tatica de um lutador — devolve o plano que ele vai executar. */
function chooseAiAction(ctx: Ctx, m: Combatant): TurnPlan {
  const c = ctx.c;
  const prof: AiProfile = m.aiProfile;
  const diff = DIFFICULTY[c.difficulty];
  const smart = diff.smart;
  const imp = statusImpact(m.effects);
  const fieldFoe = fieldOf(c, other(m.side));
  const foes = fieldFoe ? [fieldFoe] : [];
  const self = m.hp / m.maxHp;

  if(m.ultimateCharge>=ULTIMATE_MAX&&foes.length)return {kind:"ultimate",target:pickTarget(ctx,m,foes)??undefined};

  // 1. auto-cuidado: HP baixo pede defesa (quanto maior a dificuldade, cedo)
  const known = m.skillIds.map((id) => skillOf(m, id));
  const defenses = known.filter((s) => s.id && s.kind === "defense" && m.mp>=s.mp && !canPay(m,s.cost) && !(imp.silence&&s.mp>0));
  if (self < 0.34 && smart > 0.4 && defenses.length) {
    const pick = defenses.find((s) => s.defense?.kind === "repair") ?? defenses[0];
    if (m.mp >= pick.mp) return { kind: "skill", skill: pick, target: m };
  }
  if (self < 0.18) return { kind: "guard" };

  // 2. limpeza: muitos debuffs pedem defesa de purge
  if (imp.types.length >= 3 && smart > 0.55) {
    const purge = defenses.find((s) => s.defense?.kind === "purge");
    if (purge && m.mp >= purge.mp) return { kind: "skill", skill: purge, target: m };
  }

  // 4. golpe: escolhe a skill com melhor relacao dano/custo entre as pagaveis
  const atkSkills = known.filter(
    (s) => s.id && s.kind === "attack" && m.mp >= s.mp && !canPay(m, s.cost) && !(imp.silence && s.mp > 0),
  );
  if (atkSkills.length && foes.length) {
    const vic = pickTarget(ctx, m, foes);
    if (vic) {
      const best = atkSkills
        .map((s) => {
          const aff = affinity(skillElement(m, s), vic.element);
          const value = (s.power * aff) / Math.max(1, s.mp + 3) + (smart > 0.7 ? (s.hits ?? 1) * 0.5 : 0);
          return { s, value };
        })
        .sort((a, b) => b.value - a.value)[0].s;
      return { kind: "skill", skill: best, target: vic };
    }
  }

  // 5. suporte: papel de suporte cobre/analisa quando nao vale atacar
  if (prof) {
    if (prof.role === "suporte" && smart > 0.5 && ctx.rng() < smart * 0.4) {
      return m.skillIds.length ? { kind: "analyze", target: foes[0] } : { kind: "pass" };
    }
    if (prof.selfCare > 0.6 && self < 0.5) return { kind: "guard" };
    if (prof.gambit > 0.7 && self > 0.6) return { kind: "dodge" };
  }

  // 6. conservacao: sem MP, guarda ou dodge
  if (m.mp < 6) return { kind: "guard" };
  return { kind: "pass" };
}

/** Escolhe o alvo por ameaca (posicao + fraqueza + HP) e foco do perfil. */
function pickTarget(ctx: Ctx, m: Combatant, foes: Combatant[]): Combatant | null {
  if (!foes.length) return null;
  const el = m.attackElement;
  const focus = m.aiProfile?.focusPosition;
  const smart = DIFFICULTY[ctx.c.difficulty].smart;
  let best = foes[0];
  let bestScore = -Infinity;
  for (const f of foes) {
    let score = threatOf(f, el) * smart + ctx.rng() * (1 - smart);
    if (focus && f.pos === focus) score *= 1.3;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return best;
}

/* ============================================================ montagem */

export interface CombatSetup {
  pvp?: boolean;
  arena: string;
  playerTeam: RobotSave[];
  enemyTeam: RobotSave[];
  items: Record<string, number>;
  mode?: CombatMode;
  difficulty?: Difficulty;
  /** formacao imposta pelo jogador (senao o padrao por slot). */
  formation?: Position[];
}

/** Semente estavel a partir da arena e dos times (replay deterministico). */
function seedOf(c: { arena: string; player: CombatTeam; enemy: CombatTeam; turn: number }): number {
  let h = c.turn * 7919 + c.arena.length * 131;
  for (const m of [...c.player.fighters, ...c.enemy.fighters]) h = (h * 31 + m.robotId.length + m.slot) | 0;
  return Math.abs(h) || 17;
}

/** Formacao padrao de um time, na ordem de linha de frente para retaguarda. */
const LINEUP: Position[] = ["guarda", "flanco", "suporte", "nucleo"];

/**
 * Cria um combate completo: formacao, campo (clima + zonas), kits, agenda e
 * log. Nada aqui e aleatorio sem semente — a mesma entrada da o mesmo turno 1.
 */
export function createCombat(args: CombatSetup): Combat {
  const arena = args.arena;
  const mode = args.mode ?? (args.playerTeam.length > 1 ? "team" : "duel");
  const difficulty = args.difficulty ?? "normal";
  const n = args.playerTeam.length;
  const pPos = assignPositions(LINEUP.slice(0, Math.max(1, n)), args.formation);
  const ePos = assignPositions(LINEUP.slice(0, Math.max(1, args.enemyTeam.length)));

  const combat: Combat = {
    pvp: args.pvp,
    rules: args.playerTeam[0]?.battleRules ?? {},
    coreHp: args.playerTeam[0]?.battleRules?.core ?? 100,
    coreShield: 0,
    arena,
    arenaLabel: arenaName(arena),
    mode,
    difficulty,
    turn: 1,
    phase: "intro",
    result: null,
    player: {
      side: "player",

      active: 0,
      items: { ...args.items },
      fighters: args.playerTeam.map((save, i) =>
        makeCombatant({ save, side: "player", slot: i, ai: false, pos: pPos[i] ?? "guarda", difficulty }),
      ),
    },
    enemy: {
      side: "enemy",

      active: 0,
      items: {},
      fighters: args.enemyTeam.map((save, i) =>
        makeCombatant({ save, side: "enemy", slot: i, ai: !args.pvp, pos: ePos[i] ?? "guarda", difficulty }),
      ),
    },
    field: makeField(arena),
    order: [],
    cursor: 0,
    ready: null,
    pending: [],
    log: [],
    history: [],
    struck: [],
    autoResolve: false,
  };

  const ctx = newCtx(combat, seedOf(combat));
  msg(
    ctx,
    `${combat.arenaLabel}: ${mode.toUpperCase()} em ${DIFFICULTY[difficulty].label} — ${combat.player.fighters.length}v${combat.enemy.fighters.length}.`,
  );
  fieldEv(ctx);
  for (const m of combat.enemy.fighters) {
    if (m.boss) passiveEv(ctx, "enemy", "APICE", `${m.name} manifesta ${m.boss.length} forma(s)`);
  }
  hist(ctx, `${combat.arenaLabel} — ${mode} / ${difficulty}`);
  startRoundHooks(ctx);
  buildOrder(ctx);
  orderEv(ctx);
  combat.struck = [...ctx.struck];
  return combat;
}

/* ============================================================ resolucao */

/** Converte uma acao da UI no plano interno de um lutador. */
function planFrom(ctx: Ctx, m: Combatant, action: CombatAction): TurnPlan {
  const c = ctx.c;
  const pick = (uid?: string): Combatant | undefined =>
    uid ? byUid(c, uid) ?? undefined : undefined;
  switch (action.kind) {
    case "skill": {
      if (!m.skillIds.includes(action.skillId)) return { kind: "skill" };
      const skill = skillOf(m, action.skillId);
      const wanted = pick(action.targetUid);
      const vic =
        wanted && alive(wanted) && wanted.side !== m.side && (reachesBench(skill) || (m.side === "player" && !!c.rules.targetId))
          ? wanted
          : fieldOf(c, other(m.side));
      return { kind: "skill", skill, target: vic ?? undefined };
    }
    case "item":
      return { kind: "item", itemId: action.itemId, target: pick(action.targetUid) };
    case "cover":
      return { kind: "cover", target: pick(action.withUid) };
    case "reposition":
      return { kind: "reposition", target: pick(action.withUid) };
    case "analyze":
      return { kind: "analyze", target: pick(action.targetUid) };
    case "ultimate":
      return { kind: "ultimate", target: pick(action.targetUid) };
    default:
      return { kind: action.kind };
  }
}

/**
 * Resolve o combate a partir do estado atual ate ele precisar de novo do
 * jogador (ou acabar). Sem `action`, apenas avanca a agenda — util para
 * `intro`, `auto` e para retomar um round interrompido.
 */
export function resolveRound(combat: Combat, action?: CombatAction): BattleEvent[] {
  const c = combat;
  const ctx = newCtx(c, (seedOf({ ...c, turn: c.turn * 31 + c.cursor }) ^ (c.rngSalt ?? 0)) >>> 0 || 17);
  if (isOver(c)) return ctx.events;
  // AUTO removido globalmente; nem um cliente alterado pode acioná-lo.
  c.autoResolve = false;
  if (action?.kind === "auto") return ctx.events;

  if (c.phase === "intro") c.phase = "menu";

  if (action) {
    // A agenda pode estar no inicio do round (`ready` vazio): avanca ate um
    // lutador do jogador estar pronto, para o plano cair em quem tem o turno.
    let pre = 0;
    while (!c.autoResolve && !c.ready && c.phase !== "over" && pre < 80) {
      pre += 1;
      stepOrder(ctx);
    }
    const actor = c.autoResolve ? null : c.ready ? byUid(c, c.ready) : null;
    if (actor && !actor.ai) {
      if (action.kind === "skill" && !actor.skillIds.includes(action.skillId)) return ctx.events;
      runPlan(ctx, actor, planFrom(ctx, actor, action));
      // consome o turno: sem isto `c.ready` ficaria apontando para o mesmo
      // lutador e stepOrder nunca chegaria ao lado oposto (a luta travava).
      c.ready = null;
    }
    handleFaints(ctx);
    checkEnd(ctx);
    if (
      c.phase !== "over" &&
      !c.pvp &&
      actor &&
      actor.side === "player" &&
      !alive(actor) &&
      livingCount(c, "player") > 0
    ) {
      requestSwap(ctx);
      return ctx.events;
    }
  }

  let guard = 0;
  while (c.phase !== "over" && c.phase !== "forced_swap" && !c.ready && guard < 80) {
    guard += 1;
    stepOrder(ctx);
  }

  c.autoResolve = false;
  c.struck = [...ctx.struck];
  orderEv(ctx);
  syncEv(ctx);
  return ctx.events;
}

/** Acao de combate do jogador (ou "auto" para assistir o round). */
export function applyCombatAction(combat: Combat, action: CombatAction): BattleEvent[] {
  return resolveRound(combat, action);
}

/** Autoridade PvP: só o lado dono do turno pode executar comandos válidos. */
export function applyPvpAction(c: Combat, side: Side, action: CombatAction): BattleEvent[] {
  if (!c.pvp || c.phase === "over") throw new Error("Partida encerrada ou não online.");
  if (action.kind === "auto" || action.kind === "item") throw new Error("Ação indisponível no competitivo.");
  const actor = c.ready ? byUid(c, c.ready) : null;
  if (!actor || actor.side !== side || !alive(actor)) throw new Error("Não é seu turno.");
  // Golpe carregado trava o turno: só manter/liberar (pass) é aceito, igual ao console.
  if (actor.charged && action.kind !== "pass") throw new Error(actor.chargeTurns > 0 ? "Golpe em preparação." : "Libere o golpe carregado.");
  if (action.kind === "skill") {
    if (!actor.skillIds.includes(action.skillId)) throw new Error("Golpe não equipado.");
    const blocked = skillUnavailable(actor, skillOf(actor, action.skillId));
    if (blocked) throw new Error(blocked);
  }
  if (action.kind === "ultimate" && actor.ultimateCharge < 100) throw new Error("Reator incompleto.");
  if ("targetUid" in action && action.targetUid) {
    const target = byUid(c, action.targetUid);
    if (!target || !alive(target) || target.side === side) throw new Error("Alvo inválido.");
    if (action.kind === "skill" && !reachesBench(skillOf(actor, action.skillId)) && target.uid !== fieldOf(c, other(side))?.uid) throw new Error("Alvo fora de alcance.");
  }
  if (action.kind === "reposition" || action.kind === "cover") {
    const ally = action.withUid ? byUid(c, action.withUid) : null;
    if (!ally || ally.side !== side || !alive(ally) || ally.uid === actor.uid) throw new Error("Aliado inválido.");
    if (statusImpact(actor.effects).noSwap && action.kind === "reposition") throw new Error("Deslocamento bloqueado.");
  }
  return resolveRound(c, action);
}

/** Plano que a IA executaria agora — usado pelo preview e pelo codex. */
export function aiPlanFor(combat: Combat, uid: string): TurnPlan | null {
  const m = byUid(combat, uid);
  if (!m || !alive(m)) return null;
  const ctx = newCtx(combat, seedOf({ ...combat, turn: combat.turn * 13 + combat.cursor }));
  return chooseAiAction(ctx, m);
}

/** Ficha resumida de um lutador para o painel pos-luta. */
export interface CombatSummary {
  uid: string;
  side: Side;
  name: string;
  robotId: string;
  pos: Position;
  alive: boolean;
  hp: number;
  maxHp: number;
  damageDealt: number;
  damageTaken: number;
  healed: number;
  kills: number;
  crits: number;
  parries: number;
  dodges: number;
  hits: number;
  statusApplied: number;
  statusSuffered: number;
  firstBlood: boolean;
  topSkills: { id: string; name: string; uses: number }[];
}

/** Metricas de um lutador, ordenadas por uso de skill (painel pos-luta). */
export function combatSummary(m: Combatant): CombatSummary {
  const top = Object.entries(m.skillUse)
    .map(([id, uses]) => ({ id, name: skillOf(m, id).name, uses }))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 4);
  return {
    uid: m.uid,
    side: m.side,
    name: m.name,
    robotId: m.robotId,
    pos: m.pos,
    alive: alive(m),
    hp: m.hp,
    maxHp: m.maxHp,
    damageDealt: m.damageDealt,
    damageTaken: m.damageTaken,
    healed: m.healed,
    kills: m.kills,
    crits: m.crits,
    parries: m.parries,
    dodges: m.dodges,
    hits: m.hits,
    statusApplied: m.statusApplied,
    statusSuffered: m.statusSuffered,
    firstBlood: m.firstBlood,
    topSkills: top,
  };
}

/** Painel completo: MVP, totais por lado e a cronologia da luta. */
export function battleReport(c: Combat): {
  result: "win" | "lose" | null;
  rounds: number;
  mvp: CombatSummary | null;
  player: CombatSummary[];
  enemy: CombatSummary[];
  timeline: string[];
  totals: { player: number; enemy: number };
} {
  const p = c.player.fighters.map(combatSummary);
  const e = c.enemy.fighters.map(combatSummary);
  const all = [...p, ...e];
  let mvp: CombatSummary | null = null;
  for (const s of all) {
    if (!mvp) {
      mvp = s;
      continue;
    }
    const a = s.damageDealt + s.healed + s.kills * 40;
    const b = mvp.damageDealt + mvp.healed + mvp.kills * 40;
    if (a > b) mvp = s;
  }
  return {
    result: c.result,
    rounds: c.turn,
    mvp,
    player: p,
    enemy: e,
    timeline: c.history,
    totals: {
      player: p.reduce((s, x) => s + x.damageDealt, 0),
      enemy: e.reduce((s, x) => s + x.damageDealt, 0),
    },
  };
}

/* ============================================== contrato legado (G3/H1) */

/** Uid do lutador de um lado pela posicao de slot (uso do HUD antigo). */
function uidAt(c: Combat, side: Side, index: number): string | null {
  const f = teamOf(c, side).fighters[index];
  return f ? f.uid : null;
}

/** Criacao compativel com `battle.ts` (usada pelas telas de modos/ranked). */
export function createBattle(args: {
  arena: string;
  playerTeam: RobotSave[];
  enemyTeam: RobotSave[];
  items: Record<string, number>;
  mode?: CombatMode;
  difficulty?: Difficulty;
  formation?: Position[];
}): BattleView {
  return combatView(createCombat(args));
}

/** Turno compativel com `battle.ts`: acao legada entra, luta volta. */
export function resolveTurn(
  battle: BattleView,
  playerAction: BattleAction,
): { battle: BattleView; events: BattleEvent[] } {
  const c = battle.combat;
  let action: CombatAction;
  if (playerAction.kind === "item") {
    action = { kind: "item", itemId: playerAction.itemId, targetUid: uidAt(c, "player", playerAction.targetIndex) ?? undefined };
  } else if (playerAction.kind === "swap") {
    action = { kind: "reposition", withUid: uidAt(c, "player", playerAction.index) ?? "" };
  } else {
    action = { kind: "skill", skillId: playerAction.skillId };
  }
  const events = resolveRound(c, action);
  return { battle: combatView(c), events };
}

/**
 * Turno do HUD H1: aceita a acao completa do motor (skill com alvo, item com
 * uid, guarda, esquiva, cobrir, analisar, ultimate, reposicionar).
 */
export function resolveCombatTurn(
  battle: BattleView,
  action: CombatAction,
): { battle: BattleView; events: BattleEvent[] } {
  const c = battle.combat;
  const events = resolveRound(c, action);
  return { battle: combatView(c), events };
}

/** Troca forcada da linha de frente (contrato legado). */
export function applyForcedSwap(
  battle: BattleView,
  index: number,
): { battle: BattleView; events: BattleEvent[] } {
  const c = battle.combat;
  const events: BattleEvent[] = [];
  const m = c.player.fighters[index];
  if (c.phase === "forced_swap" && Number.isInteger(index) && m && alive(m)) {
    c.player.active = index;
    // inicio de round: o escolhido assume a vaga do robo caido na agenda
    if (c.cursor === 0) c.order = c.order.map((u) => (byUid(c, u)?.side === "player" ? m.uid : u));
    const ctx = newCtx(c, seedOf({ ...c, turn: c.turn + index * 7 }));
    msg(ctx, `${m.name} entra em campo!`);
    clipEv(ctx, "player", "enter", m.uid);
    animEv(ctx, "player", "enter_teleport", 0, m.uid);
    c.phase = "menu";
    orderEv(ctx);
    syncEv(ctx);
    events.push(...ctx.events);
  }
  return { battle: combatView(c), events };
}

/* ====================================================== visao das telas */

export function combatView(c: Combat): BattleView {
  const ready = c.ready ? byUid(c, c.ready) : null;
  const pActive = ready && ready.side === "player" && alive(ready)
    ? c.player.fighters.findIndex((m) => m.uid === ready.uid)
    : alive(c.player.fighters[c.player.active]) ? c.player.active : Math.max(0, c.player.fighters.findIndex(alive));
  return {
    arena: c.arena,
    turn: c.turn,
    phase: c.phase,
    result: c.result,
    player: { fighters: c.player.fighters, active: pActive, items: c.player.items },
    enemy: c.enemy,
    log: c.log,
    combat: c,
  };
}

/** Lutador ativo de um lado (contrato legado do HUD). */
export function activeOf(b: BattleView, side: Side): Combatant {
  const s = b[side];
  const idx = s.fighters[s.active] && alive(s.fighters[s.active])
    ? s.active
    : Math.max(0, s.fighters.findIndex(alive));
  return s.fighters[idx];
}

/** Copia rasa de um lutador: o HUD guarda o retrato do momento. */
function snapFighter(f: Combatant): Combatant {
  return {
    ...f,
    effects: f.effects.map((e) => ({ ...e })),
    skillIds: [...f.skillIds],
    cardIds: [...f.cardIds],
  };
}

/** Instantaneo visual do combate (o `combat` interno segue vivo). */
function snapView(c: Combat): BattleView {
  const v = combatView(c);
  return {
    ...v,
    player: {
      fighters: v.player.fighters.map(snapFighter),
      active: v.player.active,
      items: { ...v.player.items },
    },
    enemy: {
      fighters: v.enemy.fighters.map(snapFighter),
      active: v.enemy.active,
      items: { ...v.enemy.items },
    },
    log: [...v.log],
  };
}

/** Lutador que aguarda a ordem do jogador (uso do HUD novo). */
export function readyOf(c: Combat): Combatant {
  const r = c.ready ? byUid(c, c.ready) : null;
  if (r) return r;
  const fallback = c.player.fighters.find(alive) ?? c.player.fighters[0];
  return fallback;
}

/** Agenda do round, pronta para a barra de ordem de turno. */
export function orderPreview(c: Combat): OrderEntry[] {
  const out: OrderEntry[] = [];
  for (const uid of c.order) {
    const m = byUid(c, uid);
    if (!m) continue;
    const st = effectiveStats(c, m);
    out.push({
      uid: m.uid,
      side: m.side,
      name: m.name,
      robotId: m.robotId,
      pos: m.pos,
      agl: st.agl,
      ready: m.ready,
      alive: alive(m),
    });
  }
  return out;
}

export function zoneOf(c: Combat, m: Combatant): Zone {
  const zone = zoneFor(c.field.arena, m.pos);
  const beneficial = zone.kind === "buff" || zone.kind === "cover" || zone.kind === "crit" || zone.kind === "heal" || zone.kind === "energy";
  return beneficial && m.passives.includes("terrainMaster") ? { ...zone, val: zone.val * 2 } : zone;
}

/** Selo de afinidade elemental para o HUD ("FRACO a FOGO"). */
export function affinityOf(attacker: Combatant, target: Combatant, skill?: KitSkill): AffinityTier {
  const el = skill ? skillElement(attacker, skill) : attacker.attackElement;
  return tierOf(affinity(el, target.element));
}

function tierOf(mult: number): AffinityTier {
  if (mult <= 0) return "absorve";
  if (mult < 1) return "resiste";
  if (mult > 1) return "fraco";
  return "neutro";
}

export function elementLabelOf(id: string): string {
  const def = STATUS_MAP[id];
  if (def) return def.label;
  return id;
}

/** Elemento efetivo de um golpe (o chassi pode ter ataque diferente). */
export function skillElement(m: Combatant, skill: Skill): string {
  const ks = skill as KitSkill;
  const mech = ks.mech;
  const list = Array.isArray(mech) ? mech : mech ? [mech] : [];
  if (list.includes("beam") || list.includes("trueDamage")) return "LUZ";
  if (list.length > 0 && m.attackElement) return m.attackElement;
  return m.chargeTurns > 0 ? "IMPACTO" : m.attackElement;
}

/* ====================================================== previsao de dano */

export interface Forecast {
  min: number;
  max: number;
  hits: number;
  tier: AffinityTier;
  element: string;
  crit: number;
  miss: number;
  notes: string[];
}

/**
 * Previsao de dano para a UI: faixa minima/maxima, chance de critico, chance
 * de erro e o selo elemental. Le exatamente as mesmas fontes do dano real —
 * nao ha numero magico aqui.
 */
export function damagePreview(
  c: Combat,
  attackerUid: string,
  targetUid: string,
  skillId: string,
): Forecast | null {
  const atk = byUid(c, attackerUid);
  const vic = byUid(c, targetUid);
  if (!atk || !vic || (!atk.skillIds.includes(skillId) && ultimateOf(atk).id !== skillId)) return null;
  const skill = skillOf(atk, skillId);
  const notes: string[] = [];
  const aStats = effectiveStats(c, atk);
  const vStats = effectiveStats(c, vic);
  const vimp = statusImpact(vic.effects);
  const el = skillElement(atk, skill);
  const mult = affinity(el, vic.element);
  const mech = mechIdsOf(atk, skill);
  if (mech.includes("firstStrike") && c.turn <= 1) notes.push("abertura +30%");
  const hits = Math.max(1, Math.min(6, skill.hits ?? 1));
  // Projeções executam o mesmo golpe em cópias: jamais consomem MP, escudos,
  // passivas únicas, HP ou RNG do combate que a interface está mostrando.
  const projected = (critical: boolean) => {
    if (skill.kind === "defense" || mult <= 0) return 0;
    const copy = structuredClone(c);
    const actor = byUid(copy, attackerUid)!;
    const target = byUid(copy, targetUid)!;
    const ctx = newCtx(copy, seedOf({ ...copy, turn: copy.turn * 31 + copy.cursor }));
    let total = 0;
    for (let idx = 0; idx < hits && alive(actor) && alive(target); idx++) {
      total += strike(ctx, actor, target, skill, { idx, hits, noMiss: true, critical, quiet: true }).dmg;
    }
    return total;
  };
  let critChance = criticalChance(aStats.agl, vStats.agl) + gadgetBonus(atk, "crit") / 100 + cardBonus(atk, "crit") / 100 + aStats.crit / 100;
  if (atk.pos === "flanco" && vic.pos !== "guarda") critChance += .08;
  if (mech.includes("critUp") || mech.includes("critMark")) critChance += .1;
  critChance = Math.max(0, Math.min(.78, critChance));
  const missChance = missChanceFor(newCtx(c, 1), vic, aStats, vStats, mech);
  const normal = projected(false);
  const critical = projected(true);
  if (mech.length) notes.push("Mecânicas probabilísticas podem alterar a projeção.");
  if (mult <= 0) notes.push("ABSORVE: o golpe cura o alvo");
  else if (mult < 1) notes.push(`resiste ${el}`);
  else if (mult > 1) notes.push(`fraco a ${el}`);
  if (vimp.barrier > 0) notes.push(`${vimp.barrier} barreira(s)`);
  if (vimp.shield > 0) notes.push(`escudo ${vimp.shield}`);
  if (skill.charge) notes.push(`carrega em ${skill.charge} turno(s)`);
  return {
    min: Math.min(normal, critical),
    max: Math.max(normal, critical),
    hits,
    tier: tierOf(mult),
    element: el,
    crit: critChance,
    miss: missChance,
    notes,
  };
}
