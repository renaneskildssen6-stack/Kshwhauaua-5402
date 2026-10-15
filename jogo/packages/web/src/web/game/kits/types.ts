/**
 * Fase H1 — vocabulario dos 256 kits autorais.
 *
 * Este arquivo e a fonte unica de verdade dos IDs usados pelos kits:
 *   MECH_IDS      -> mecanicas nomeadas (efeitos resolvidos em mechanics.ts)
 *   PASSIVE_IDS   -> passivas nomeadas (hooks resolvidos em passives.ts)
 *   RESOURCE_IDS  -> recursos alternativos por chassi
 *   POSITIONS     -> formacao (guarda / flanco / suporte / nucleo)
 *
 * `Skill` e `SkillEffect` vem de skills.ts e sao ESTENDIDOS (nunca alterados
 * de forma incompativel), para que os 256 kits sejam um superconjunto do
 * formato que o jogo ja consumia.
 */

import type { Skill, SkillEffect, DefenseKind } from "../skills";

/* --------------------------------------------------------------- posicoes */

export type Position = "guarda" | "flanco" | "suporte" | "nucleo";

export const POSITIONS: Position[] = ["guarda", "flanco", "suporte", "nucleo"];

export interface PositionDef {
  id: Position;
  label: string;
  abbr: string;
  /** Multiplicador de dano recebido. */
  takenMult: number;
  /** Multiplicador de dano causado. */
  dealtMult: number;
  /** Peso de ameaca: quanto o foco da IA puxa para esta posicao. */
  threat: number;
  desc: string;
}

export const POSITION_MAP: Record<Position, PositionDef> = {
  guarda: {
    id: "guarda",
    label: "GUARDA",
    abbr: "GDA",
    takenMult: 1.25,
    dealtMult: 1.0,
    threat: 1.6,
    desc: "Linha de frente: recebe 25% mais dano. Não oferece interceptação automática; a ação COBRIR é separada.",
  },
  flanco: {
    id: "flanco",
    label: "FLANCO",
    abbr: "FLC",
    takenMult: 1.05,
    dealtMult: 1.12,
    threat: 1.2,
    desc: "Ataque lateral. Ganha +12% de dano e +8% de critico contra alvos que nao sao a GUARDA inimiga.",
  },
  suporte: {
    id: "suporte",
    label: "SUPORTE",
    abbr: "SUP",
    takenMult: 0.92,
    dealtMult: 0.95,
    threat: 0.85,
    desc: "Meio de campo: recebe 8% menos dano e causa 5% menos dano. Curas seguem os efeitos próprios do kit.",
  },
  nucleo: {
    id: "nucleo",
    label: "NUCLEO",
    abbr: "NUC",
    takenMult: 0.85,
    dealtMult: 1.2,
    threat: 0.6,
    desc: "Retaguarda: recebe 15% menos dano e causa 20% mais dano. A carga de ultimate segue a mesma regra individual das demais posições.",
  },
};

export function positionDef(p: string): PositionDef {
  return POSITION_MAP[(p as Position)] ?? POSITION_MAP.guarda;
}

/* --------------------------------------------------------------- recursos */

export type ResourceId =
  | "heat"
  | "overcharge"
  | "circuit"
  | "ammo"
  | "charge"
  | "sync"
  | "toxin"
  | "echo"
  | "bloodlust"
  | "luck"
  | "flow"
  | "corrosion";

export interface ResourceDef {
  id: ResourceId;
  label: string;
  abbr: string;
  max: number;
  color: string;
  desc: string;
}

export const RESOURCES: Record<ResourceId, ResourceDef> = {
  heat: {
    id: "heat",
    label: "CALOR",
    abbr: "CAL",
    max: 10,
    color: "#ff6a2a",
    desc: "Sobe 1 por golpe e 2 por golpe de fogo. No maximo libera +45% de dano ate esfriar (perde 3 por turno sem atacar).",
  },
  overcharge: {
    id: "overcharge",
    label: "SOBRECARGA",
    abbr: "SCR",
    max: 12,
    color: "#ffe94d",
    desc: "Enche ao usar defesa e ao ser atingido. Cada 4 pontos devolve 1 de acao extra no proximo turno.",
  },
  circuit: {
    id: "circuit",
    label: "CIRCUITO",
    abbr: "CIR",
    max: 8,
    color: "#8fd6ff",
    desc: "Enche ao acertar alvos marcados e ao analisar. 4 pontos reduzem em 1 o custo de MP de todas as skills.",
  },
  ammo: {
    id: "ammo",
    label: "MUNICAO",
    abbr: "MUN",
    max: 6,
    color: "#f2c14e",
    desc: "Cada tiro gasta 1. Skills de rajada gastam 2 e fazem dano dobrado; zerada, so resta recarregar.",
  },
  charge: {
    id: "charge",
    label: "CARGA",
    abbr: "CRG",
    max: 3,
    color: "#ff5bd0",
    desc: "Acumula 1 por turno parado ou defendendo. Gasta a carga toda numa skill carregada para dano massivo.",
  },
  sync: {
    id: "sync",
    label: "SINC",
    abbr: "SYN",
    max: 10,
    color: "#57d76a",
    desc: "Sobe quando aliados acertam o mesmo alvo. Em 10 o time inteiro age junto no proximo turno.",
  },
  toxin: {
    id: "toxin",
    label: "TOXINA",
    abbr: "TOX",
    max: 12,
    color: "#9dff6a",
    desc: "Enche ao aplicar veneno/corrosao. Gastar em Toxina concentrada converte metade em dano direto ignorando defesa.",
  },
  echo: {
    id: "echo",
    label: "ECO",
    abbr: "ECO",
    max: 5,
    color: "#b07aff",
    desc: "Guarda a ultima skill usada pelo inimigo. Gastar 3 pontos replica aquele golpe sem custo de MP.",
  },
  bloodlust: {
    id: "bloodlust",
    label: "SEDE",
    abbr: "SED",
    max: 10,
    color: "#ff5b6e",
    desc: "Sobe com dano recebido e passado. A 6+ da +25% de dano e converte 15% do golpe em cura.",
  },
  luck: {
    id: "luck",
    label: "SORTE",
    abbr: "SRT",
    max: 5,
    color: "#fff2b8",
    desc: "Sobra quando um ataque erra ou um efeito e resistido. Cada ponto pode ser gasto para forcar um critico.",
  },
  flow: {
    id: "flow",
    label: "FLUXO",
    abbr: "FLX",
    max: 8,
    color: "#7cf0e0",
    desc: "Sobe com esquiva e parry bem sucedidos. 5+ pontos dão uma reacao extra por turno.",
  },
  corrosion: {
    id: "corrosion",
    label: "CORROSAO",
    abbr: "COR",
    max: 10,
    color: "#c99a5b",
    desc: "Enche ao corroer blindagem inimiga. Cada 3 pontos reduzem 5% da defesa do alvo pelo resto da luta.",
  },
};

export type ResourcePolicy = {
  /** ganho por golpe desferido */
  onHit?: number;
  /** ganho por golpe recebido */
  onTakeHit?: number;
  /** ganho ao derrubar um alvo */
  onKill?: number;
  /** ganho por turno */
  onTurn?: number;
  /** ganho ao acertar critico */
  onCrit?: number;
  /** reducao por turno */
  decay?: number;
};

export const RESOURCE_POLICY: Record<ResourceId, ResourcePolicy> = {
  heat: { onHit: 1, onTurn: -3, decay: 0 },
  overcharge: { onHit: 0, onTakeHit: 1, onTurn: 0 },
  circuit: { onHit: 1, onTurn: 0 },
  ammo: { onTurn: 0 },
  charge: { onTurn: 1 },
  sync: { onHit: 1, onCrit: 2 },
  toxin: { onHit: 1, onKill: 2 },
  echo: { onTakeHit: 1 },
  bloodlust: { onHit: 1, onTakeHit: 1 },
  luck: { onTurn: 0 },
  flow: { onTurn: 0 },
  corrosion: { onHit: 1 },
};

/* -------------------------------------------------------------- mecanicas */

export const MECH_IDS = [
  /* --- penetracao e dano direto --- */
  "execute",
  "pierce",
  "armorpen",
  "ignoredef",
  "trueDamage",
  "shieldbreak",
  "overkill",
  "executeThreshold",
  "lastStand",
  "missingHpScaling",
  "stackScaling",
  "critUp",
  "critMark",
  "firstStrike",
  "backstab",
  "aimedShot",
  "beam",
  "detonate",
  /* --- multiplicidade --- */
  "multihit",
  "chain",
  "splash",
  "spread",
  "echoStrike",
  "relentless",
  /* --- sustentacao --- */
  "drainHp",
  "drainMp",
  "lifesteal",
  "lifelink",
  "bloodPact",
  "hpCost",
  "mpCost",
  "overload",
  "enrage",
  "gainTurn",
  "extraAction",
  /* --- status ofensivos --- */
  "burnApply",
  "poisonApply",
  "bleedApply",
  "corrodeApply",
  "freezeApply",
  "stunApply",
  "fearApply",
  "silenceApply",
  "exposeApply",
  "markApply",
  "weakenApply",
  "blindApply",
  "shatterApply",
  "curseApply",
  "hexApply",
  "doomApply",
  "paralyzeApply",
  "rootApply",
  "confuseApply",
  "slowApply",
  "hasteApply",
  "dotSpread",
  "statusEcho",
  "reflectStatus",
  /* --- defesa e reacao --- */
  "reflect",
  "thorns",
  "barrierMake",
  "absorb",
  "cover",
  "intercept",
  "redirect",
  "counter",
  "parryStance",
  "riposte",
  "taunt",
  "cleanse",
  "purge",
  "reviveOnce",
  "guardStance",
  "regenField",
  /* --- campo e invocacao --- */
  "summon",
  "zone",
  "trap",
  "terrainShift",
  "weather",
  "hazardSpawn",
  "coverMake",
  "aura",
  "auraHeal",
  "auraStr",
  "auraDef",
  "auraAgi",
  "auraRegen",
  /* --- informacao e manipulacao --- */
  "stealth",
  "reveal",
  "swapForced",
  "transformPhase",
  "copybuff",
  "copyStat",
  "mimic",
  "steal",
  "cleanseAll",
  /* --- tempo e caos --- */
  "timeStop",
  "quantumSkip",
  "mirrorDamage",
  "karma",
  "countdown",
  "lucky",
  "positionShift",
  "ultimateCharge",
] as const;

export type MechId = (typeof MECH_IDS)[number];

export const MECH_SET = new Set<string>(MECH_IDS);

/** Categoria da mecanica, usada para agrupar no codex. */
export const MECH_GROUP: Record<string, string> = {
  execute: "penetracao",
  pierce: "penetracao",
  armorpen: "penetracao",
  ignoredef: "penetracao",
  trueDamage: "penetracao",
  shieldbreak: "penetracao",
  overkill: "penetracao",
  executeThreshold: "penetracao",
  lastStand: "penetracao",
  missingHpScaling: "penetracao",
  stackScaling: "penetracao",
  critUp: "penetracao",
  critMark: "penetracao",
  firstStrike: "penetracao",
  backstab: "penetracao",
  aimedShot: "penetracao",
  beam: "penetracao",
  detonate: "penetracao",
  multihit: "multiplicidade",
  chain: "multiplicidade",
  splash: "multiplicidade",
  spread: "multiplicidade",
  echoStrike: "multiplicidade",
  relentless: "multiplicidade",
  drainHp: "sustentacao",
  drainMp: "sustentacao",
  lifesteal: "sustentacao",
  lifelink: "sustentacao",
  bloodPact: "sustentacao",
  hpCost: "sustentacao",
  mpCost: "sustentacao",
  overload: "sustentacao",
  enrage: "sustentacao",
  gainTurn: "sustentacao",
  extraAction: "sustentacao",
  burnApply: "status",
  poisonApply: "status",
  bleedApply: "status",
  corrodeApply: "status",
  freezeApply: "status",
  stunApply: "status",
  fearApply: "status",
  silenceApply: "status",
  exposeApply: "status",
  markApply: "status",
  weakenApply: "status",
  blindApply: "status",
  shatterApply: "status",
  curseApply: "status",
  hexApply: "status",
  doomApply: "status",
  paralyzeApply: "status",
  rootApply: "status",
  confuseApply: "status",
  slowApply: "status",
  hasteApply: "status",
  dotSpread: "status",
  statusEcho: "status",
  reflectStatus: "status",
  reflect: "defesa",
  thorns: "defesa",
  barrierMake: "defesa",
  absorb: "defesa",
  cover: "defesa",
  intercept: "defesa",
  redirect: "defesa",
  counter: "defesa",
  parryStance: "defesa",
  riposte: "defesa",
  taunt: "defesa",
  cleanse: "defesa",
  purge: "defesa",
  reviveOnce: "defesa",
  guardStance: "defesa",
  regenField: "defesa",
  summon: "campo",
  zone: "campo",
  trap: "campo",
  terrainShift: "campo",
  weather: "campo",
  hazardSpawn: "campo",
  coverMake: "campo",
  aura: "campo",
  auraHeal: "campo",
  auraStr: "campo",
  auraDef: "campo",
  auraAgi: "campo",
  auraRegen: "campo",
  stealth: "informacao",
  reveal: "informacao",
  swapForced: "informacao",
  transformPhase: "informacao",
  copybuff: "informacao",
  copyStat: "informacao",
  mimic: "informacao",
  steal: "informacao",
  cleanseAll: "informacao",
  timeStop: "tempo",
  quantumSkip: "tempo",
  mirrorDamage: "tempo",
  karma: "tempo",
  countdown: "tempo",
  lucky: "tempo",
  positionShift: "tempo",
  ultimateCharge: "tempo",
};

export const MECH_GROUPS = [
  "penetracao",
  "multiplicidade",
  "sustentacao",
  "status",
  "defesa",
  "campo",
  "informacao",
  "tempo",
];

/* ---------------------------------------------------------------- passivas */

export const PASSIVE_IDS = [
  "openingStrike",
  "vanguardWall",
  "rearSight",
  "flankerInstinct",
  "firstBlood",
  "predator",
  "opportunist",
  "executioner",
  "duelist",
  "berserker",
  "revengeDrive",
  "painConverter",
  "unyielding",
  "secondWind",
  "phoenixCore",
  "regenerator",
  "symbiote",
  "leechField",
  "energySiphon",
  "reactorSurge",
  "heatSink",
  "ammoFeeder",
  "chargeKeeper",
  "echoChamber",
  "luckyCharm",
  "flowState",
  "corroder",
  "toxinBloom",
  "pyromaniac",
  "cryomancer",
  "stormChaser",
  "earthshaker",
  "windReader",
  "tideCaller",
  "lightBearer",
  "shadowStep",
  "starGazer",
  "quantumGhost",
  "photosynth",
  "ironskin",
  "prismGuard",
  "runeWeaver",
  "terrainMaster",
  "hazardWalker",
  "zoneLord",
  "teamPlayer",
  "comboKeeper",
  "ultimateBattery",
  "guardianAngel",
  "auraAnchor",
  "statusWeaver",
  "purgeAura",
  "mirrorCore",
  "karmaWeaver",
  "doomKeeper",
  "timekeeper",
  "phaseWalker",
  "leader",
  "loneWolf",
  "lastMan",
  "counterMind",
  "parryMaster",
  "evasiveFrame",
  "thornsAura",
  "reflector",
  "shieldEngineer",
  "cleanSlate",
  "silentHunter",
  "spotter",
  "analyst",
  "scavenger",
  "thief",
  "mimicFrame",
  "copycat",
  "undyingCore",
  "soulTether",
  "bloodTithe",
  "overclocker",
  "clockwork",
  "adaptation",
  "escalation",
  "patience",
  "teslaCoil",
  "magneticField",
  "gravityWell",
  "sandstorm",
  "toxicCloud",
  "emberTrail",
  "frostAura",
  "staticField",
  "thornMine",
  "spikeFloor",
  "battleRhythm",
] as const;

export type PassiveId = (typeof PASSIVE_IDS)[number];

export const PASSIVE_SET = new Set<string>(PASSIVE_IDS);

/** ~30 hooks onde as passivas se penduram. */
export const PASSIVE_HOOKS = [
  "onBattleStart",
  "onRoundStart",
  "onTurnStart",
  "onEndTurn",
  "onAction",
  "onBeforeAttack",
  "onAfterAttack",
  "onHit",
  "onCrit",
  "onMiss",
  "onEvade",
  "onTakeHit",
  "onDamageCalc",
  "onKill",
  "onFaint",
  "onAllyFaint",
  "onEnemyFaint",
  "onStatusApply",
  "onStatusTick",
  "onHeal",
  "onMpSpend",
  "onSwapIn",
  "onLowHp",
  "onDeathAvoid",
  "onUltimateCharge",
  "onUltReady",
  "onTerrain",
  "onResource",
  "onResourceFull",
  "onShieldBreak",
  "onPurge",
  "onBossPhase",
] as const;

export type PassiveHook = (typeof PASSIVE_HOOKS)[number];

export interface FiredPassive {
  uid: string;
  side: "player" | "enemy";
  passive: PassiveId;
  hook: PassiveHook;
  label: string;
  text: string;
}

/* --------------------------------------------------------------------- kit */

export type SkillTag =
  | "corpo"
  | "corte"
  | "contundente"
  | "perfurante"
  | "projetil"
  | "explosao"
  | "area"
  | "carga"
  | "instantaneo"
  | "canalizado"
  | "reacao"
  | "ultimate"
  | "aura"
  | "campo"
  | "invocacao"
  | "suporte"
  | "controle"
  | "defesa";

export interface KitStatusApply {
  /** id de status.ts */
  s: string;
  /** chance em % */
  p: number;
  /** turnos */
  t: number;
  /** intensidade (quando o status usa valor numerico) */
  v?: number;
}

export interface KitSkill extends Skill {
  /** tags livres para o codex e para sinergias */
  tags?: SkillTag[];
  /** mecanicas nomeadas, resolvidas em mechanics.ts */
  mech?: MechId | MechId[];
  /** status aplicados por este golpe */
  status?: KitStatusApply[];
  /** status aplicado em si mesmo (buffs de postura) */
  self?: KitStatusApply[];
  /** custo em recurso alternativo */
  cost?: Partial<Record<ResourceId, number>>;
  /** ganho de recurso alternativo */
  gain?: Partial<Record<ResourceId, number>>;
  /** turnos de carregamento antes de resolver */
  charge?: number;
  /** iniciativa que a acao consome/cede */
  speed?: number;
  /** golpes por uso (dano dividido, salvo se `each: true`) */
  hits?: number;
  /** quando true, cada golpe usa o dano cheio (multiplicador perigoso) */
  each?: boolean;
  /** prioridade de resolucao dentro do round */
  priority?: number;
  /** Metadado legado de kit; carga real é fixa por ação no motor, nunca por hit. */
  meter?: number;
  /** custo de HP em % do maximo */
  hpCost?: number;
  /** exige pelo menos X% de HP para ser usada */
  requires?: number;
  /** uso unico na batalha */
  once?: boolean;
  /** so pode ser usada na posicao indicada */
  only?: Position;
}

export interface KitPassive {
  id: PassiveId;
  hook: PassiveHook;
  name: string;
  /** parametro numerico livre (percentual/contador) */
  val?: number;
  /** id de status aplicado pelo hook, quando aplicavel */
  status?: string;
  desc: string;
}

export type TalentKind = "stat" | "grant" | "ultimate" | "field" | "shift" | "phase";

export interface KitTalent {
  id: string;
  name: string;
  kind: TalentKind;
  /** mecanica concedida (grant/shift/field) */
  mech?: MechId;
  /** status concedido (grant) */
  status?: string;
  /** atributo reforcado (stat): str/def/agl/hp/mp/crit/evade */
  stat?: string;
  /** percentual do ganho */
  val?: number;
  desc: string;
}

export type AiRole =
  | "agressor"
  | "guarda"
  | "artilheiro"
  | "controlador"
  | "sanguessuga"
  | "oportunista"
  | "tatico"
  | "suporte"
  | "tanque"
  | "assassino";

export interface AiProfile {
  role: AiRole;
  /** 0-100: quanto foca em alvo de menor HP */
  finishPriority: number;
  /** 0-100: quanto guarda recurso/MP */
  conservation: number;
  /** 0-100: quanto arrisca skills de custo alto */
  gambit: number;
  /** 0-100: quanto prioriza defesa e cura */
  selfCare: number;
  /** posicao preferida de foco */
  focusPosition?: Position;
  /** tendencia a reagir com parry/contra em vez de guardar */
  reactivity?: number;
}

export interface BossPhase {
  /** limiar de HP (fracao 0..1) que dispara a fase */
  at: number;
  name: string;
  /** transformacao: nome da forma exibida */
  form: string;
  /** mecanicas que passam a valer nesta fase */
  mech?: MechId[];
  /** aura visual (cor) */
  color: string;
  /** multiplicadores temporarios */
  mods?: { str?: number; def?: number; agl?: number; crit?: number };
  /** substitui o conjunto de skills, se informado */
  skills?: string[];
  desc: string;
}

export interface Kit {
  robotId: string;
  /** familia defensiva (elements.ts) */
  element: string;
  /** familia do golpe quando difere da defensiva */
  attackElement?: string;
  /** recurso alternativo exclusivo */
  resource?: ResourceId;
  ai: AiProfile;
  skills: KitSkill[];
  passives: KitPassive[];
  talent: KitTalent;
  boss?: BossPhase[];
  /** frase de apresentacao no codex */
  creed?: string;
}

/** Kit vazio usado quando algo der errado — nunca deve ser servido ao jogo. */
export function emptyKit(robotId: string): Kit {
  return {
    robotId,
    element: "IMPACTO",
    ai: { role: "agressor", finishPriority: 50, conservation: 50, gambit: 50, selfCare: 40 },
    skills: [],
    passives: [],
    talent: { id: "noop", name: "SEM TALENTO", kind: "stat", desc: "" },
  };
}

/* ------------------------------------------------------------------ helper */

/** Normaliza o campo `mech` (aceita id solto ou lista). */
export function mechList(s: KitSkill): MechId[] {
  if (!s.mech) return [];
  return Array.isArray(s.mech) ? s.mech : [s.mech];
}

export const DEFENSE_KINDS: DefenseKind[] = [
  "guard",
  "repair",
  "purge",
  "overcharge",
  "counter",
];

export type { Skill, SkillEffect, DefenseKind };
