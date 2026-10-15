/**
 * Fase H1 — Sistema de status avançado.
 *
 * 36 condições nomeadas, cada uma com:
 *   - modificadores de stat (str/def/agl/dano dado/dano tomado/crit/esquiva)
 *   - dano ou cura por turno
 *   - reações (quebra ao levar dano, silencia, confunde, prende, condena...)
 *   - pilha máxima, regra de limpeza e assinatura visual (VFX + animação)
 *
 * Nada aqui gera arte nova: cada status reaproveita os 28 sprite sheets de
 * /vfx com recolor por filtro CSS e um keyframe do catálogo de anim.ts.
 */

/** Ids antigos (skills.ts) mantidos para compatibilidade dos blueprints. */
export type LegacyEffectType =
  | "burn"
  | "poison"
  | "paralyze"
  | "blind"
  | "weakening"
  | "drain"
  | "damage_reduction"
  | "adrenalin"
  | "hp_regen"
  | "trapped";

export type StatusId =
  // --- debuffs de dano continuo
  | "burn"
  | "poison"
  | "bleed"
  | "corrode"
  | "decay"
  // --- debuffs de controle
  | "paralyze"
  | "freeze"
  | "root"
  | "trapped"
  | "silence"
  | "confuse"
  | "fear"
  | "stun"
  // --- debuffs de stat
  | "blind"
  | "weakening"
  | "shatter"
  | "slow"
  | "marked"
  | "curse"
  | "glass"
  | "doom"
  | "drain"
  // --- buffs
  | "adrenalin"
  | "hp_regen"
  | "damage_reduction"
  | "shield"
  | "haste"
  | "focus"
  | "evade_up"
  | "barrier"
  | "thorns"
  | "reflect"
  | "lifelink"
  | "charge"
  | "overheat"
  | "frenzy";

export type StatusKind = "buff" | "debuff";

export interface StatusMods {
  str?: number; // % somado
  def?: number;
  agl?: number;
  dmgOut?: number; // % de dano causado
  dmgIn?: number; // % de dano recebido
  crit?: number; // pontos % de critico
  evade?: number; // pontos % de esquiva
  healIn?: number; // % de cura recebida (pode ser negativo)
  hpRegen?: number; // % de HP por turno
  mpRegen?: number; // MP por turno
}

export interface StatusDef {
  id: StatusId;
  label: string; // nome PT-BR completo
  abbr: string; // 3-4 letras para o HUD
  kind: StatusKind;
  max: number; // pilhas máximas (power acumula até aqui)
  powerUnit: "flat" | "pct";
  /** Dano/cura por turno. `power` é lido em % do HP máx (pct) ou flat. */
  tick?: { dmg?: number; heal?: number; mp?: number };
  mods?: StatusMods;
  /** Regras especiais resolvidas pelo motor. */
  rule?: {
    skipTurnChance?: number; // % de perder o turno
    silenceSkills?: boolean; // só golpes sem MP
    randomTarget?: boolean; // pode bater no próprio time
    noSwap?: boolean; // não pode trocar
    breakOnHit?: boolean; // sai do efeito ao levar dano
    doom?: boolean; // morre ao acabar
    mpBurn?: number; // % de MP perdido por turno (somado em tick)
    extraDmgTaken?: number; // % extra recebido escalando com pilhas
    consumesStacks?: boolean; // some uma pilha ao agir
    forcedSwapOnEnd?: boolean;
  };
  color: string;
  vfx: string;
  anim: string;
  /** Como o status entra/sai; usado no log e na análise pós-luta. */
  note: string;
}

const V = "/vfx";

/** Todos os status do jogo. A ordem define a exibição no HUD. */
export const STATUSES: StatusDef[] = [
  {
    id: "burn",
    label: "Queimando",
    abbr: "QUE",
    kind: "debuff",
    max: 99,
    powerUnit: "pct",
    tick: { dmg: 0.5 },
    mods: { healIn: -20 },
    color: "#ff7a2a",
    vfx: `${V}/inferno.png`,
    anim: "status_tick_burn",
    note: "dano de fogo por turno e cura reduzida",
  },
  {
    id: "poison",
    label: "Envenenado",
    abbr: "VEN",
    kind: "debuff",
    max: 5,
    powerUnit: "pct",
    tick: { dmg: 0.42 },
    mods: { def: -8 },
    color: "#9ee04a",
    vfx: `${V}/toxic.png`,
    anim: "status_tick_burn",
    note: "veneno acumulativo que ignora blindagem",
  },
  {
    id: "bleed",
    label: "Sangrando",
    abbr: "SAN",
    kind: "debuff",
    max: 8,
    powerUnit: "flat",
    tick: { dmg: 0 },
    mods: { dmgIn: 5 },
    rule: { extraDmgTaken: 3 },
    color: "#e2453a",
    vfx: `${V}/siphon.png`,
    anim: "status_tick_poison",
    note: "cada pilha amplia o dano recebido e sangra ao agir",
  },
  {
    id: "corrode",
    label: "Corroído",
    abbr: "COR",
    kind: "debuff",
    max: 4,
    powerUnit: "pct",
    tick: { dmg: 0.3 },
    mods: { def: -14, dmgOut: -10 },
    color: "#c9a227",
    vfx: `${V}/toxic.png`,
    anim: "status_tick_burn",
    note: "ácido que derrete blindagem e força de ataque",
  },
  {
    id: "decay",
    label: "Decadência",
    abbr: "DEC",
    kind: "debuff",
    max: 3,
    powerUnit: "pct",
    tick: { dmg: 0.35 },
    mods: { healIn: -60 },
    color: "#7f5bd6",
    vfx: `${V}/curse.png`,
    anim: "status_tick_poison",
    note: "apodrece o reparo; cura recebida quase anulada",
  },
  {
    id: "paralyze",
    label: "Paralisado",
    abbr: "PAR",
    kind: "debuff",
    max: 3,
    powerUnit: "flat",
    mods: { agl: -30 },
    rule: { skipTurnChance: 35 },
    color: "#ffe14a",
    vfx: `${V}/thunder.png`,
    anim: "status_tick_paralyze",
    note: "chance de perder o turno totalmente",
  },
  {
    id: "freeze",
    label: "Congelado",
    abbr: "GEL",
    kind: "debuff",
    max: 3,
    powerUnit: "flat",
    mods: { agl: -40, def: -10 },
    rule: { skipTurnChance: 60, breakOnHit: true },
    color: "#7fe3ff",
    vfx: `${V}/frost.png`,
    anim: "status_tick_paralyze",
    note: "congela os servos; o gelo quebra no primeiro golpe",
  },
  {
    id: "root",
    label: "Ancorado",
    abbr: "ANC",
    kind: "debuff",
    max: 2,
    powerUnit: "flat",
    mods: { agl: -25, evade: -10 },
    rule: { noSwap: true },
    color: "#b58a4a",
    vfx: `${V}/quake.png`,
    anim: "status_tick_trapped",
    note: "não pode trocar de robô e esquiva pior",
  },
  {
    id: "trapped",
    label: "Preso",
    abbr: "PRE",
    kind: "debuff",
    max: 3,
    powerUnit: "flat",
    mods: { evade: -15 },
    rule: { noSwap: true },
    color: "#8d6e3a",
    vfx: `${V}/ward.png`,
    anim: "status_tick_trapped",
    note: "preso em campo, sem troca",
  },
  {
    id: "silence",
    label: "Silenciado",
    abbr: "SIL",
    kind: "debuff",
    max: 2,
    powerUnit: "flat",
    rule: { silenceSkills: true },
    color: "#b9c7ff",
    vfx: `${V}/sonic.png`,
    anim: "status_tick_silence",
    note: "só pode usar golpes que não gastam energia",
  },
  {
    id: "confuse",
    label: "Confuso",
    abbr: "CON",
    kind: "debuff",
    max: 2,
    powerUnit: "flat",
    mods: { crit: -10 },
    rule: { randomTarget: true },
    color: "#ff8ad6",
    vfx: `${V}/prism.png`,
    anim: "status_tick_blind",
    note: "pode acertar o próprio time",
  },
  {
    id: "fear",
    label: "Apavorado",
    abbr: "MED",
    kind: "debuff",
    max: 2,
    powerUnit: "flat",
    mods: { dmgOut: -20 },
    rule: { skipTurnChance: 25, forcedSwapOnEnd: true },
    color: "#8f6bd6",
    vfx: `${V}/curse.png`,
    anim: "status_tick_blind",
    note: "hesita e pode recuar para a retaguarda",
  },
  {
    id: "stun",
    label: "Atordoado",
    abbr: "ATO",
    kind: "debuff",
    max: 1,
    powerUnit: "flat",
    rule: { skipTurnChance: 100, breakOnHit: true },
    color: "#ffd166",
    vfx: `${V}/impact.png`,
    anim: "status_tick_paralyze",
    note: "perde o turno inteiro até ser atingido",
  },
  {
    id: "blind",
    label: "Cego",
    abbr: "CEG",
    kind: "debuff",
    max: 4,
    powerUnit: "flat",
    mods: { evade: -25 },
    color: "#cfe4ff",
    vfx: `${V}/bloom.png`,
    anim: "status_tick_blind",
    note: "aumenta muito a chance do alvo errar",
  },
  {
    id: "weakening",
    label: "Enfraquecido",
    abbr: "ENF",
    kind: "debuff",
    max: 70,
    powerUnit: "pct",
    mods: { str: 0 },
    color: "#a0b4c8",
    vfx: `${V}/chrono.png`,
    anim: "status_tick_weakening",
    note: "reduz a força em % (o poder é a própria redução)",
  },
  {
    id: "shatter",
    label: "Blindagem Quebrada",
    abbr: "BLQ",
    kind: "debuff",
    max: 70,
    powerUnit: "pct",
    mods: { def: 0 },
    color: "#ff9a6b",
    vfx: `${V}/clang.png`,
    anim: "status_tick_shatter",
    note: "reduz a defesa em %",
  },
  {
    id: "slow",
    label: "Lento",
    abbr: "LEN",
    kind: "debuff",
    max: 60,
    powerUnit: "pct",
    mods: { agl: 0 },
    color: "#6e88a8",
    vfx: `${V}/chrono.png`,
    anim: "status_tick_weakening",
    note: "reduz a agilidade em %",
  },
  {
    id: "marked",
    label: "Marcado",
    abbr: "MAR",
    kind: "debuff",
    max: 3,
    powerUnit: "pct",
    mods: { dmgIn: 0 },
    color: "#ff5b4d",
    vfx: `${V}/laser.png`,
    anim: "status_tick_marked",
    note: "recebe dano extra em % por pilha",
  },
  {
    id: "curse",
    label: "Amaldiçoado",
    abbr: "MAL",
    kind: "debuff",
    max: 3,
    powerUnit: "pct",
    mods: { dmgIn: 0, healIn: -50 },
    color: "#7a4dd6",
    vfx: `${V}/curse.png`,
    anim: "status_tick_curse",
    note: "dano extra e cura reduzida; propaga ao cair",
  },
  {
    id: "glass",
    label: "Frágil",
    abbr: "FRA",
    kind: "debuff",
    max: 1,
    powerUnit: "flat",
    mods: { def: -100, str: 25 },
    color: "#8fe6ff",
    vfx: `${V}/prism.png`,
    anim: "status_tick_shatter",
    note: "defesa zerada em troca de força",
  },
  {
    id: "doom",
    label: "Condenado",
    abbr: "CMN",
    kind: "debuff",
    max: 1,
    powerUnit: "flat",
    rule: { doom: true },
    color: "#ff3b6b",
    vfx: `${V}/curse.png`,
    anim: "status_tick_curse",
    note: "é desativado quando o contador chega a zero",
  },
  {
    id: "drain",
    label: "Drenado",
    abbr: "DRE",
    kind: "debuff",
    max: 6,
    powerUnit: "pct",
    tick: { mp: 0 },
    color: "#57d7c8",
    vfx: `${V}/siphon.png`,
    anim: "status_tick_drain",
    note: "perde energia por turno (poder = % do MP máx)",
  },
  {
    id: "adrenalin",
    label: "Adrenalina",
    abbr: "ADR",
    kind: "buff",
    max: 120,
    powerUnit: "pct",
    mods: { str: 0 },
    color: "#ffb43a",
    vfx: `${V}/buffup.png`,
    anim: "status_on_adrenalin",
    note: "força aumentada em %",
  },
  {
    id: "hp_regen",
    label: "Auto-reparo",
    abbr: "REP",
    kind: "buff",
    max: 15,
    powerUnit: "pct",
    color: "#57d76a",
    vfx: `${V}/heal.png`,
    anim: "status_tick_hp_regen",
    note: "recupera % do HP máx por turno",
  },
  {
    id: "damage_reduction",
    label: "Blindado",
    abbr: "BLI",
    kind: "buff",
    max: 85,
    powerUnit: "pct",
    color: "#35a9f0",
    vfx: `${V}/shield.png`,
    anim: "status_on_damage_reduction",
    note: "reduz o dano recebido em %",
  },
  {
    id: "shield",
    label: "Escudo",
    abbr: "ESC",
    kind: "buff",
    max: 400,
    powerUnit: "flat",
    color: "#6fd8ff",
    vfx: `${V}/ward.png`,
    anim: "status_on_damage_reduction",
    note: "absorve dano bruto antes do HP",
  },
  {
    id: "haste",
    label: "Acelerado",
    abbr: "ACE",
    kind: "buff",
    max: 90,
    powerUnit: "pct",
    mods: { agl: 0 },
    color: "#7dff9a",
    vfx: `${V}/sonic.png`,
    anim: "status_on_haste",
    note: "agilidade aumentada em % (ordem de turno)",
  },
  {
    id: "focus",
    label: "Focado",
    abbr: "FOC",
    kind: "buff",
    max: 60,
    powerUnit: "flat",
    mods: { crit: 0 },
    color: "#ffd166",
    vfx: `${V}/laser.png`,
    anim: "status_on_focus",
    note: "chance de crítico aumentada em pontos %",
  },
  {
    id: "evade_up",
    label: "Esquivo",
    abbr: "ESQ",
    kind: "buff",
    max: 45,
    powerUnit: "flat",
    mods: { evade: 0 },
    color: "#a8f0ff",
    vfx: `${V}/sonic.png`,
    anim: "status_on_evade_up",
    note: "esquiva aumentada em pontos %",
  },
  {
    id: "barrier",
    label: "Barreira",
    abbr: "BAR",
    kind: "buff",
    max: 3,
    powerUnit: "flat",
    color: "#9ad4ff",
    vfx: `${V}/ward.png`,
    anim: "status_on_barrier",
    note: "anula por completo os próximos golpes (pilhas)",
  },
  {
    id: "thorns",
    label: "Repulsor",
    abbr: "REP2",
    kind: "buff",
    max: 80,
    powerUnit: "pct",
    color: "#ff9a3a",
    vfx: `${V}/slash.png`,
    anim: "status_on_thorns",
    note: "devolve % do dano corpo a corpo recebido",
  },
  {
    id: "reflect",
    label: "Refletor",
    abbr: "REF",
    kind: "buff",
    max: 70,
    powerUnit: "pct",
    color: "#c8b4ff",
    vfx: `${V}/prism.png`,
    anim: "status_on_reflect",
    note: "devolve % de qualquer dano recebido",
  },
  {
    id: "lifelink",
    label: "Sifão Vital",
    abbr: "SIF",
    kind: "buff",
    max: 60,
    powerUnit: "pct",
    color: "#ff6b8a",
    vfx: `${V}/siphon.png`,
    anim: "status_on_lifelink",
    note: "rouba % do dano causado como HP",
  },
  {
    id: "charge",
    label: "Carga",
    abbr: "CGA",
    kind: "buff",
    max: 8,
    powerUnit: "flat",
    color: "#ffe14a",
    vfx: `${V}/levelup.png`,
    anim: "status_on_charge",
    rule: { consumesStacks: true },
    note: "pilhas que ampliam o próximo ataque (são consumidas)",
  },
  {
    id: "overheat",
    label: "Superaquecido",
    abbr: "SOA",
    kind: "buff",
    max: 6,
    powerUnit: "pct",
    tick: { dmg: 0.6 },
    mods: { str: 0 },
    color: "#ff7043",
    vfx: `${V}/inferno.png`,
    anim: "status_tick_burn",
    note: "força sobe a cada turno mas o chassi queima",
  },
  {
    id: "frenzy",
    label: "Fúria",
    abbr: "FUR",
    kind: "buff",
    max: 5,
    powerUnit: "pct",
    mods: { str: 0, def: 0, crit: 0 },
    color: "#ff4d4d",
    vfx: `${V}/buffup.png`,
    anim: "status_on_frenzy",
    note: "ganha força e crítico e perde blindagem por pilha",
  },
];

export const STATUS_MAP: Record<string, StatusDef> = Object.fromEntries(
  STATUSES.map((s) => [s.id, s]),
);
export const STATUS_COUNT = STATUSES.length;

/** Ids que representam vantagem para quem os carrega. */
export const BUFF_IDS = new Set<StatusId>(
  STATUSES.filter((s) => s.kind === "buff").map((s) => s.id),
);

export function isBuff(id: StatusId): boolean {
  return STATUS_MAP[id]?.kind === "buff";
}

export function statusLabel(id: string): string {
  return STATUS_MAP[id]?.label ?? id.toUpperCase();
}

export function statusAbbr(id: string): string {
  return STATUS_MAP[id]?.abbr ?? id.slice(0, 3).toUpperCase();
}

export function statusDef(id: string): StatusDef | null {
  return STATUS_MAP[id] ?? null;
}

/** Efeitos que limpam condições negativas. */
export const PURGE_KEEPS: StatusId[] = STATUSES.filter((s) => s.kind === "buff").map(
  (s) => s.id,
);

/**
 * Soma dos modificadores de todas as pilhas de um lutador.
 * `power` é a magnitude; a regra de soma muda por status:
 *   pct  -> mods somam power (ou power * pilhas quando max > 1)
 *   flat -> mods somam power direto (pontos percentuais)
 */
export interface StatusModTotal {
  str: number;
  def: number;
  agl: number;
  dmgOut: number;
  dmgIn: number;
  crit: number;
  evade: number;
  healIn: number;
  hpRegen: number;
  mpRegen: number;
}

export function emptyMods(): StatusModTotal {
  return {
    str: 0,
    def: 0,
    agl: 0,
    dmgOut: 0,
    dmgIn: 0,
    crit: 0,
    evade: 0,
    healIn: 0,
    hpRegen: 0,
    mpRegen: 0,
  };
}

/**
 * Aplica um status às somas. `special` cobre os status cujo poder NÃO é
 * um modificador bruto: weakening (reduz força), shatter (reduz defesa),
 * slow (reduz agilidade), marked (dano recebido) etc — todos entram como
 * valores negativos na soma final.
 */
export function accumulateMods(
  out: StatusModTotal,
  id: StatusId,
  power: number,
  stacks: number,
): void {
  const def = STATUS_MAP[id];
  if (!def) return;
  const total = power * Math.max(1, Math.floor(stacks));
  const m = def.mods;
  if (m?.str) out.str += m.str > 0 ? total : -total;
  if (m?.def) out.def += m.def > 0 ? total : -total;
  if (m?.agl) out.agl += m.agl > 0 ? total : -total;
  if (m?.dmgOut) out.dmgOut += m.dmgOut > 0 ? total : -total;
  if (m?.crit) out.crit += m.crit > 0 ? total : -total;
  if (m?.evade) out.evade += m.evade > 0 ? total : -total;
  if (m?.healIn) out.healIn += m.healIn > 0 ? total : -total;
  // status cujo proprio poder E a magnitude do modificador
  if (id === "weakening") out.str -= total;
  if (id === "shatter") out.def -= total;
  if (id === "slow") out.agl -= total;
  if (id === "marked") out.dmgIn += total;
  if (id === "curse") out.dmgIn += total;
  if (id === "bleed") out.dmgIn += total;
  if (id === "overheat") out.str += total;
  if (id === "frenzy") {
    out.str += total;
    out.crit += total * 0.6;
    out.def -= total * 0.8;
  }
  if (id === "hp_regen") out.hpRegen += total;
  if (id === "drain") out.mpRegen -= total;
}

export function modsOf(effects: { type: string; power: number; turns: number }[]): StatusModTotal {
  const out = emptyMods();
  for (const e of effects) {
    accumulateMods(out, e.type as StatusId, e.power, 1);
  }
  return out;
}
