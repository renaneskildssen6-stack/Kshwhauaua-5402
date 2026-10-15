// Meta-progressão: diamantes, perfil, conquistas, maestria, equipamentos e skins.
// Módulo puro (sem importar o save em runtime) para evitar ciclos.
import type { GameState } from "./save";
import type { FullStats } from "./engine";

// ----------------------------------------------------------------- estado
export interface EquipItem {
  uid: number;
  type: string;
  rarity: number; // 0..4
  level: number; // 1..EQUIP_MAX
}

export interface MasteryEntry {
  pts: number;
  wins: number;
  /** maior rank já resgatado (0 = nenhum). */
  claimed: number;
  /** marcos de vitórias já resgatados. */
  winClaimed: number;
}

export interface Profile {
  name: string;
  bg: string;
  pins: string[];
  title: string;
}

export interface MetaState {
  diamonds: number;
  diamondsEarned: number;
  profile: Profile;
  bgOwned: string[];
  achClaimed: string[];
  mastery: Record<string, MasteryEntry>;
  equipment: EquipItem[];
  equipped: Record<string, number[]>;
  equipSeq: number;
  skinsOwned: string[];
  skinOf: Record<string, string>;
}

export function initialMeta(): MetaState {
  return {
    diamonds: 0,
    diamondsEarned: 0,
    profile: { name: "CAMPEAO", bg: "neon", pins: [], title: "" },
    bgOwned: ["neon", "storm"],
    achClaimed: [],
    mastery: {},
    equipment: [],
    equipped: {},
    equipSeq: 1,
    skinsOwned: [],
    skinOf: {},
  };
}

export function normalizeMeta(p: Partial<MetaState> | undefined): MetaState {
  const b = initialMeta();
  if (!p) return b;
  const bgOwned = [...new Set([...(p.bgOwned ?? []), ...b.bgOwned])].filter((id) => !!CARD_BG_MAP[id]);
  const equipment = (p.equipment ?? []).filter((e) => !!EQUIP_MAP[e.type]);
  const uids = new Set(equipment.map((e) => e.uid));
  const equipped: Record<string, number[]> = {};
  for (const [rid, list] of Object.entries(p.equipped ?? {})) {
    equipped[rid] = list.filter((u) => uids.has(u)).slice(0, EQUIP_SLOTS);
  }
  const profile = { ...b.profile, ...(p.profile ?? {}) };
  if (!bgOwned.includes(profile.bg)) profile.bg = "neon";
  return {
    diamonds: Math.max(0, p.diamonds ?? 0),
    diamondsEarned: Math.max(0, p.diamondsEarned ?? 0),
    profile: { ...profile, pins: (profile.pins ?? []).slice(0, 3) },
    bgOwned,
    achClaimed: p.achClaimed ?? [],
    mastery: p.mastery ?? {},
    equipment,
    equipped,
    equipSeq: Math.max(p.equipSeq ?? 1, ...equipment.map((e) => e.uid + 1), 1),
    skinsOwned: (p.skinsOwned ?? []).filter((id) => !!SKIN_MAP[id]),
    skinOf: p.skinOf ?? {},
  };
}

// --------------------------------------------------------- planos de fundo
/** Cada imagem tem 9 frames (grade 3x3) da MESMA cena. */
export interface CardBg {
  id: string;
  name: string;
  /** custo em diamantes (0 = liberado de início). */
  cost: number;
}
export const CARD_BGS: CardBg[] = [
  { id: "neon", name: "CIDADE NEON", cost: 0 },
  { id: "storm", name: "TEMPESTADE", cost: 0 },
  { id: "lava", name: "VULCAO", cost: 30 },
  { id: "abyss", name: "ABISMO", cost: 40 },
  { id: "galaxy", name: "GALAXIA", cost: 60 },
  { id: "gold", name: "ARENA DOURADA", cost: 90 },
  { id: "garden", name: "JARDIM MECANICO", cost: 20 },
  { id: "moonpalace", name: "PALACIO LUNAR", cost: 25 },
  { id: "ironforge", name: "FORJA DE FERRO", cost: 30 },
  { id: "polar", name: "OBSERVATORIO POLAR", cost: 35 },
  { id: "coral", name: "TEMPLO DE CORAL", cost: 40 },
  { id: "dunes", name: "DUNAS DA CARAVANA", cost: 45 },
  { id: "dimension", name: "PORTAL INFINITO", cost: 50 },
  { id: "rooftop", name: "TELHADO CHUVOSO", cost: 55 },
  { id: "relics", name: "MUSEU DE RELIQUIAS", cost: 60 },
  { id: "reactor", name: "REATORE DE CRISTAL", cost: 65 },
  { id: "labyrinth", name: "LABIRINTO VERDE", cost: 70 },
  { id: "victory", name: "PRACA DA VITORIA", cost: 75 },

];
export const CARD_BG_MAP: Record<string, CardBg> = Object.fromEntries(CARD_BGS.map((b) => [b.id, b]));
export function cardBgUrl(id: string): string {
  return `/ui/card_${CARD_BG_MAP[id] ? id : "neon"}.png`;
}

// ------------------------------------------------------------- conquistas
export const ACH_TIERS = ["BRONZE", "PRATA", "OURO", "PLATINA", "DIAMANTE"];
const ACH_GOLD = [200, 500, 1200, 3000, 8000];
const ACH_DIAM = [0, 0, 0, 2, 5];

export type StatKey =
  | "wins" | "level" | "robots" | "tourneys" | "rank" | "babel" | "surv" | "quick" | "boss"
  | "chaos" | "gaunt" | "trials" | "raid" | "night" | "cards" | "pets" | "gold" | "mpts"
  | "mrank" | "mrobots" | "skins" | "equips" | "elvl" | "maxlvl" | "chips" | "dia";

export function statOf(g: GameState, k: StatKey): number {
  switch (k) {
    case "wins": return g.battlesWon;
    case "level": return g.playerLevel;
    case "robots": return g.robots.length;
    case "tourneys": return g.wonTournaments.length;
    case "rank": return g.ranked.rankIndex;
    case "babel": return g.modes.babelBest;
    case "surv": return g.modes.survivalBest;
    case "quick": return g.modes.quickWins;
    case "boss": return g.modes.bossRushBest;
    case "chaos": return g.modes.chaosWins;
    case "gaunt": return g.modes.gauntletBest;
    case "trials": return g.modes.trialsBest;
    case "raid": return g.modes.raidWins;
    case "night": return g.modes.nightmareBest;
    case "cards": return g.cards.length;
    case "pets": return Object.keys(g.pets).length;
    case "gold": return g.gold;
    case "mpts": return Object.values(g.mastery).reduce((a, m) => a + m.pts, 0);
    case "mrank": return Math.max(0, ...Object.values(g.mastery).map((m) => rankIndexOf(m.pts)));
    case "mrobots": return Object.values(g.mastery).filter((m) => rankIndexOf(m.pts) >= 3).length;
    case "skins": return g.skinsOwned.length;
    case "equips": return g.equipment.length;
    case "elvl": return Math.max(0, ...g.equipment.map((e) => e.level));
    case "maxlvl": return Math.max(0, ...g.robots.map((r) => r.level));
    case "chips": return g.chips.length;
    case "dia": return g.diamondsEarned;
  }
}

type Chain = [name: string, stat: StatKey, targets: [number, number, number, number, number], what: string];

// 5 imagens x 10 cadeias x 5 niveis = 250 conquistas, cada uma com icone proprio.
const SHEETS: Chain[][] = [
  [
    ["Lamina Inicial", "wins", [1, 10, 50, 150, 500], "vencer batalhas"],
    ["Escudo Firme", "quick", [1, 5, 20, 60, 150], "vencer lutas rapidas"],
    ["Duelista", "tourneys", [1, 3, 6, 10, 15], "vencer torneios"],
    ["Punho de Ferro", "chaos", [1, 5, 15, 40, 100], "vencer no modo caos"],
    ["Cacador de Chefes", "boss", [1, 3, 8, 15, 30], "chegar longe no Boss Rush"],
    ["Explosao Total", "raid", [1, 5, 15, 40, 100], "vencer raides"],
    ["Elmo de Guerra", "rank", [1, 3, 6, 10, 14], "subir de patente no ranqueado"],
    ["Coroa da Torre", "babel", [5, 15, 30, 60, 100], "subir andares da Torre de Babel"],
    ["Estandarte Vivo", "surv", [3, 8, 15, 30, 60], "sobreviver a ondas"],
    ["Trofeu do Circuito", "gaunt", [3, 8, 15, 30, 60], "vencer etapas do Gauntlet"],
  ],
  [
    ["Colecionador", "robots", [3, 8, 15, 30, 60], "ter robos"],
    ["Engrenagem Mestra", "level", [3, 8, 15, 25, 40], "alcancar nivel de jogador"],
    ["Programador", "chips", [1, 3, 6, 10, 20], "coletar chips"],
    ["Baralho Cheio", "cards", [2, 6, 12, 24, 40], "coletar cards"],
    ["Domador", "pets", [1, 2, 4, 6, 10], "adotar pets"],
    ["Projetista", "equips", [1, 5, 15, 30, 60], "forjar equipamentos"],
    ["Estrela Ascendente", "maxlvl", [5, 10, 20, 30, 40], "levar um robo ao nivel"],
    ["Veterano", "wins", [20, 100, 300, 800, 2000], "vencer batalhas"],
    ["Guarda-Roupa", "skins", [1, 2, 4, 7, 12], "ter skins"],
    ["Arquiteto", "elvl", [2, 4, 6, 8, 10], "evoluir um equipamento ao nivel"],
  ],
  [
    ["Cofrinho", "gold", [1000, 5000, 20000, 100000, 500000], "guardar ouro"],
    ["Ourives", "equips", [3, 10, 25, 45, 80], "forjar equipamentos"],
    ["Fundidor", "elvl", [3, 5, 7, 9, 10], "refinar equipamentos ao nivel"],
    ["Cacador de Gemas", "dia", [1, 10, 30, 80, 200], "ganhar diamantes"],
    ["Mercador", "wins", [10, 60, 200, 500, 1200], "vencer batalhas"],
    ["Banqueiro", "gold", [5000, 25000, 100000, 300000, 1000000], "guardar ouro"],
    ["Tesouro Vivo", "mpts", [50, 300, 1500, 6000, 20000], "somar pontos de maestria"],
    ["Joalheiro", "skins", [1, 3, 5, 8, 14], "ter skins"],
    ["Ladrao de Cofres", "robots", [5, 12, 25, 45, 80], "ter robos"],
    ["Balanca Justa", "cards", [4, 10, 20, 32, 48], "coletar cards"],
  ],
  [
    ["Torre do Ceu", "babel", [3, 10, 25, 50, 90], "subir na Torre de Babel"],
    ["Copa dos Campeoes", "tourneys", [2, 4, 7, 11, 16], "vencer torneios"],
    ["Insignia Elite", "rank", [2, 4, 7, 10, 14], "alcancar patentes"],
    ["Cacador de Monstros", "boss", [2, 5, 10, 20, 40], "avancar no Boss Rush"],
    ["Quebra-Portoes", "raid", [2, 8, 20, 50, 120], "vencer raides"],
    ["Provas de Fogo", "trials", [2, 5, 10, 20, 40], "completar provas"],
    ["Sobrevivente", "surv", [2, 6, 12, 25, 50], "sobreviver a ondas"],
    ["Corredor de Espinhos", "gaunt", [2, 6, 12, 25, 50], "vencer o Gauntlet"],
    ["Olho do Pesadelo", "night", [1, 4, 10, 20, 40], "vencer no Pesadelo"],
    ["Rei do Caos", "chaos", [2, 8, 20, 50, 120], "vencer no Caos"],
  ],
  [
    ["Chama Eterna", "wins", [2, 15, 75, 250, 700], "vencer batalhas"],
    ["Mare Alta", "mpts", [30, 200, 1000, 4000, 15000], "somar maestria"],
    ["Rocha Firme", "mrobots", [1, 2, 4, 7, 12], "robos com maestria Ouro ou mais"],
    ["Vento Cortante", "mrank", [1, 3, 5, 8, 11], "levar um robo ao rank de maestria"],
    ["Raio Rapido", "level", [2, 6, 12, 20, 32], "nivel de jogador"],
    ["Gelo Eterno", "robots", [4, 10, 20, 35, 70], "ter robos"],
    ["Luz Sagrada", "tourneys", [1, 2, 5, 9, 14], "vencer torneios"],
    ["Sombra Densa", "skins", [1, 2, 3, 6, 10], "ter skins"],
    ["Veneno Lento", "equips", [2, 8, 20, 40, 70], "forjar equipamentos"],
    ["Engrenagem Dourada", "dia", [2, 15, 50, 120, 300], "ganhar diamantes"],
  ],
];

export interface Achievement {
  id: string;
  sheet: number;
  /** indice na imagem (0..49) */
  idx: number;
  name: string;
  desc: string;
  stat: StatKey;
  target: number;
  tier: number;
  gold: number;
  diamonds: number;
}

export const ACHIEVEMENTS: Achievement[] = SHEETS.flatMap((chains, s) =>
  chains.flatMap(([name, stat, targets, what], c) =>
    targets.map((target, t): Achievement => ({
      id: `a${s}_${c * 5 + t}`,
      sheet: s,
      idx: c * 5 + t,
      name: `${name} ${ACH_TIERS[t]}`,
      desc: `${what[0].toUpperCase()}${what.slice(1)}: ${target.toLocaleString("pt-BR")}`,
      stat,
      target,
      tier: t,
      gold: ACH_GOLD[t],
      diamonds: ACH_DIAM[t],
    })),
  ),
);
export const ACH_MAP: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function achUnlocked(g: GameState, a: Achievement): boolean {
  return statOf(g, a.stat) >= a.target;
}

// ---------------------------------------------------------------- maestria
export interface MasteryRank {
  name: string;
  pts: number;
  gold: number;
  diamonds: number;
  /** 0 = sem bau; 1..4 = raridade minima do equipamento. */
  chest: number;
  title?: string;
}
// 12 ranks (o Brawl Stars tem 9 etapas), com bau de equipamento e titulo.
export const MASTERY_RANKS: MasteryRank[] = [
  { name: "PARAFUSO", pts: 0, gold: 0, diamonds: 0, chest: 0 },
  { name: "BRONZE", pts: 40, gold: 300, diamonds: 0, chest: 0 },
  { name: "PRATA", pts: 120, gold: 600, diamonds: 0, chest: 1, title: "Aprendiz" },
  { name: "OURO", pts: 280, gold: 1200, diamonds: 1, chest: 0 },
  { name: "PLATINA", pts: 560, gold: 2000, diamonds: 1, chest: 2, title: "Veterano" },
  { name: "ESMERALDA", pts: 1000, gold: 3200, diamonds: 2, chest: 0 },
  { name: "RUBI", pts: 1700, gold: 4800, diamonds: 2, chest: 3, title: "Implacavel" },
  { name: "SAFIRA", pts: 2800, gold: 7000, diamonds: 3, chest: 0 },
  { name: "AMETISTA", pts: 4400, gold: 10000, diamonds: 4, chest: 3, title: "Lenda Viva" },
  { name: "OBSIDIANA", pts: 6800, gold: 15000, diamonds: 5, chest: 0 },
  { name: "CELESTIAL", pts: 10500, gold: 22000, diamonds: 8, chest: 4, title: "Ascendido" },
  { name: "MITICO", pts: 16000, gold: 40000, diamonds: 15, chest: 4, title: "Mitico" },
];
export function rankIndexOf(pts: number): number {
  let r = 0;
  MASTERY_RANKS.forEach((m, i) => {
    if (pts >= m.pts) r = i;
  });
  return r;
}
/** Marcos extras por vitorias com o robo. */
export const WIN_MILESTONES = [
  { wins: 10, gold: 500, diamonds: 0 },
  { wins: 30, gold: 1500, diamonds: 1 },
  { wins: 75, gold: 4000, diamonds: 2 },
  { wins: 150, gold: 9000, diamonds: 4 },
  { wins: 300, gold: 20000, diamonds: 8 },
];
export const MASTERY_WIN_PTS = 12;
export const MASTERY_LOSE_PTS = 4;
/** bonus de maestria: cada rank da +1% HP e +1 em um atributo. */
export function masteryBonus(pts: number): Partial<FullStats> {
  const r = rankIndexOf(pts);
  return { hp: r * 6, str: Math.floor(r / 2), def: Math.floor(r / 2), agl: Math.floor(r / 3) };
}
export function ensureMastery(m: MasteryEntry | undefined): MasteryEntry {
  return m ?? { pts: 0, wins: 0, claimed: 0, winClaimed: 0 };
}

// ------------------------------------------------------------ equipamentos
export const EQUIP_MAX = 10;
export const EQUIP_SLOTS = 3;
type StatName = "hp" | "mp" | "str" | "def" | "agl";
export interface EquipType {
  id: string;
  name: string;
  icon: number;
  main: StatName;
  sub: StatName;
}
export const EQUIP_TYPES: EquipType[] = [
  { id: "visor", name: "VISOR TATICO", icon: 0, main: "def", sub: "hp" },
  { id: "chest", name: "PEITORAL", icon: 1, main: "hp", sub: "def" },
  { id: "core", name: "NUCLEO REATOR", icon: 2, main: "mp", sub: "str" },
  { id: "boots", name: "BOTAS A JATO", icon: 3, main: "agl", sub: "hp" },
  { id: "glove", name: "LUVA DE IMPACTO", icon: 4, main: "str", sub: "agl" },
  { id: "shieldgen", name: "GERADOR DE ESCUDO", icon: 5, main: "def", sub: "mp" },
  { id: "scope", name: "MIRA OTICA", icon: 6, main: "str", sub: "agl" },
  { id: "cloak", name: "MANTO REATIVO", icon: 7, main: "agl", sub: "def" },
  { id: "pack", name: "MOCHILA PROPULSORA", icon: 8, main: "agl", sub: "mp" },
  { id: "nano", name: "MODULO NANOBOT", icon: 9, main: "hp", sub: "mp" },
  { id: "pauldron", name: "OMBREIRA FARPADA", icon: 10, main: "str", sub: "def" },
  { id: "amulet", name: "AMULETO DE CIRCUITO", icon: 11, main: "mp", sub: "hp" },
];
export const EQUIP_MAP: Record<string, EquipType> = Object.fromEntries(EQUIP_TYPES.map((e) => [e.id, e]));
export const RARITIES = [
  { name: "COMUM", color: "#b8c4d0", mult: 1, weight: 58 },
  { name: "INCOMUM", color: "#5fe08a", mult: 1.5, weight: 25 },
  { name: "RARO", color: "#4aa8ff", mult: 2.1, weight: 11 },
  { name: "EPICO", color: "#c06bff", mult: 3, weight: 5 },
  { name: "LENDARIO", color: "#ffc43a", mult: 4.3, weight: 1 },
];
const BASE: Record<StatName, number> = { hp: 24, mp: 12, str: 3, def: 3, agl: 3 };

export function equipStats(e: EquipItem): Partial<FullStats> {
  const t = EQUIP_MAP[e.type];
  const k = RARITIES[e.rarity].mult * (1 + 0.22 * (e.level - 1));
  const out: Partial<FullStats> = {};
  out[t.main] = Math.max(1, Math.round(BASE[t.main] * k));
  out[t.sub] = (out[t.sub] ?? 0) + Math.max(1, Math.round(BASE[t.sub] * k * 0.4));
  return out;
}
export function equipUpgradeCost(e: EquipItem): number {
  return Math.round(80 * RARITIES[e.rarity].mult * e.level ** 1.5);
}
export function equipSellValue(e: EquipItem): number {
  return Math.round(40 * RARITIES[e.rarity].mult * e.level);
}
export const FORGE_GOLD = 600;
export const FORGE_DIAMONDS = 25;

export function rollRarity(rand: () => number, min = 0, premium = false): number {
  const w = RARITIES.map((r, i) => (i < min ? 0 : premium ? (i === 3 ? 80 : i === 4 ? 20 : 0) : r.weight));
  const tot = w.reduce((a, b) => a + b, 0);
  let x = rand() * tot;
  for (let i = 0; i < w.length; i++) {
    x -= w[i];
    if (x < 0) return i;
  }
  return Math.max(min, 0);
}

// ------------------------------------------------------------------- skins
export interface Skin {
  id: string;
  name: string;
  cost: number;
  /** filtro CSS que recolore o chassi. */
  filter: string;
  /** brilho/aura; presente = skin com detalhes novos. */
  aura?: string;
  /** indice do desenho de previa em misc.png */
  preview?: number;
}
export const SKINS: Skin[] = [
  { id: "bronze", name: "BRONZE ANTIGO", cost: 40, filter: "sepia(0.9) saturate(1.6) brightness(0.85)" },
  { id: "carmesim", name: "CARMESIM", cost: 60, filter: "hue-rotate(140deg) saturate(1.4)" },
  { id: "esmeralda", name: "ESMERALDA", cost: 60, filter: "hue-rotate(255deg) saturate(1.2)" },
  { id: "violeta", name: "VIOLETA", cost: 60, filter: "hue-rotate(60deg) saturate(1.3)" },
  { id: "gelo", name: "GELO POLAR", cost: 80, filter: "hue-rotate(185deg) brightness(1.2) saturate(0.8)" },
  { id: "sombra", name: "SOMBRA", cost: 90, filter: "grayscale(0.8) brightness(0.55) contrast(1.3)" },
  { id: "platina", name: "PLATINA", cost: 110, filter: "grayscale(1) brightness(1.3) contrast(1.1)" },
  { id: "neon", name: "NEON", cost: 130, filter: "saturate(2.6) contrast(1.15) hue-rotate(300deg)" },
  { id: "ouro", name: "OURO PURO", cost: 180, filter: "sepia(1) saturate(3.2) hue-rotate(5deg) brightness(1.1)" },
  { id: "chama", name: "CORACAO DE CHAMA", cost: 260, filter: "hue-rotate(150deg) saturate(1.6)", aura: "#ff7a1a", preview: 4 },
  { id: "anjo", name: "ANJO MECANICO", cost: 320, filter: "grayscale(0.4) brightness(1.25)", aura: "#bfe8ff", preview: 5 },
  { id: "demonio", name: "DEMONIO", cost: 360, filter: "hue-rotate(150deg) saturate(1.3) brightness(0.8)", aura: "#ff2a3a", preview: 6 },
  { id: "halo", name: "SANTO", cost: 400, filter: "sepia(0.6) saturate(2) brightness(1.2)", aura: "#ffe36a", preview: 7 },
  { id: "tempestade", name: "TEMPESTADE", cost: 480, filter: "hue-rotate(40deg) saturate(1.6)", aura: "#ffe14a", preview: 8 },
  { id: "cristal", name: "CRISTAL GELADO", cost: 560, filter: "hue-rotate(190deg) saturate(1.1) brightness(1.2)", aura: "#7fe4ff", preview: 9 },
  { id: "cosmico", name: "MANTO COSMICO", cost: 700, filter: "hue-rotate(250deg) saturate(1.5) brightness(0.9)", aura: "#b36bff", preview: 10 },
  { id: "dourado", name: "VISOR DOURADO", cost: 900, filter: "sepia(1) saturate(3) brightness(1.15)", aura: "#ffc43a", preview: 11 },
];
export const SKIN_MAP: Record<string, Skin> = Object.fromEntries(SKINS.map((s) => [s.id, s]));
export function skinOfRobot(g: Pick<GameState, "skinOf" | "skinsOwned">, robotId: string): Skin | null {
  const id = g.skinOf[robotId];
  return id && g.skinsOwned.includes(id) ? (SKIN_MAP[id] ?? null) : null;
}

// diamantes: fontes deliberadamente raras
export const DIAMOND_SOURCES =
  "Conquistas Platina/Diamante, ranks de maestria, marcos de vitorias e torneios inéditos.";
export const TOURNAMENT_DIAMONDS = 3;
