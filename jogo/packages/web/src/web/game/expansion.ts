import type { RobotSave, FullStats } from "./engine";
import type { GameState } from "./save";
import { ROBOT_MAP } from "./robots";
import { initialCityDevelopment, normalizeCityDevelopment, type CityDevelopment, type ExpeditionApproach } from "./city-development";

export type DimensionId = "draft" | "caravan" | "rift" | "mirror" | "siege" | "hunt" | "reactors" | "mono" | "stakes" | "maze";
export type CitySystem = "observatory" | "academy" | "contracts" | "power" | "museum" | "portal";
export interface BattleRules { deadline?: number; targetId?: string; core?: number; borrowed?: boolean }
export type Carry = Record<string, { hp: number; mp: number }>;
export interface DimensionRun {
  uid: number; mode: DimensionId; stage: number; length: number;
  phase: "ready" | "battle" | "choice" | "won" | "lost" | "cashed";
  team: RobotSave[]; carry: Carry; items: Record<string, number>;
  bank: number; bonus: Partial<FullStats>; core: number; path: string[];
  route: "safe" | "risky"; campaign?: string; enemyScale: number;
  challenge?: number; rewardScale?: number; blessing?: string;
}
export interface Expedition { route: string; step: number; supply: number; cargo: number; log: string[]; seed: number; approach?: ExpeditionApproach }
export interface ExpansionState {
  development: CityDevelopment;
  energy: number; plant: number; distribution: Record<string, number>;
  talents: Record<string, string[]>; relics: string[]; discoveries: string[];
  expedition: Expedition | null; reputation: number; missionsClaimed: string[];
  counters: Record<string, number>; campaigns: Record<string, number>; storyChoices: Record<string, string>;
  run: DimensionRun | null; runSeq: number;
}
export const CITY_LABELS: Record<CitySystem, string> = { observatory: "OBSERVATÓRIO", academy: "ACADEMIA", contracts: "CENTRAL DE CONTRATOS", power: "USINA", museum: "MUSEU", portal: "PORTAL DIMENSIONAL" };
export function initialExpansion(): ExpansionState {
  return { development: initialCityDevelopment(), energy: 40, plant: 1, distribution: { observatory: 1, academy: 1, museum: 1, portal: 1, contracts: 0, power: 0 }, talents: {}, relics: [], discoveries: [], expedition: null, reputation: 0, missionsClaimed: [], counters: {}, campaigns: {}, storyChoices: {}, run: null, runSeq: 1 };
}
export function normalizeExpansion(p?: Partial<ExpansionState>): ExpansionState {
  const b = initialExpansion();
  if (!p) return b;
  const plant = Number.isFinite(p.plant) ? Math.max(1, Math.min(10, Math.floor(p.plant!))) : 1;
  const dist = { ...b.distribution, ...p.distribution };
  let capacity = 4 + plant * 2;
  for (const k of Object.keys(dist)) {
    if (!Object.prototype.hasOwnProperty.call(b.distribution, k)) { delete dist[k]; continue; }
    const value = Number.isFinite(dist[k]) ? Math.max(0, Math.min(6, Math.floor(dist[k]))) : 0;
    dist[k] = Math.min(capacity, value); capacity -= dist[k];
  }
  const run = p.run && DIMENSIONS.some((m) => m.id === p.run?.mode) && p.run.team?.length && p.run.team.every((r) => ROBOT_MAP[r.id]) ? p.run : null;
  const development = normalizeCityDevelopment(p.development);
  development.capacitor = Math.min(development.capacitor, 20 + plant * 5 + (dist.power ?? 0) * 3);
  development.tracked = development.tracked.filter((id) => MISSION_MAP[id] && !(p.missionsClaimed ?? []).includes(id));
  return { ...b, ...p, development, plant, distribution: dist, energy: Number.isFinite(p.energy) ? Math.max(0, Math.min(energyCap(plant), p.energy!)) : 40, talents: p.talents ?? {}, relics: [...new Set(p.relics ?? [])].filter((id) => RELICS.some((r) => r.id === id)), discoveries: p.discoveries ?? [], counters: p.counters ?? {}, campaigns: p.campaigns ?? {}, storyChoices: p.storyChoices ?? {}, missionsClaimed: [...new Set(p.missionsClaimed ?? [])].filter((id) => MISSION_MAP[id]), run, runSeq: Math.max(p.runSeq ?? 1, (run?.uid ?? 0) + 1) };
}
export function energyCap(plant: number) { return 60 + plant * 20; }
export function bump(e: ExpansionState, key: string, amount = 1): ExpansionState { return { ...e, counters: { ...e.counters, [key]: (e.counters[key] ?? 0) + amount } }; }
export function hashText(s: string): number { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

export const DIMENSIONS: { id: DimensionId; name: string; desc: string; length: number; boss: string }[] = [
  { id: "draft", name: "DRAFT DE SUCATA", desc: "Escolha 4 de 8 chassis emprestados. A coleção fica intacta; sua equipe temporária encara o Rei da Sucata.", length: 3, boss: "npc_scrapking" },
  { id: "caravan", name: "CARAVANA", desc: "HP e MP persistem por 5 combates. Só 3 reparos e 2 células iniciais. Compre suprimentos com o banco do percurso.", length: 5, boss: "npc_scrapking" },
  { id: "rift", name: "FENDA ROGUELIKE", desc: "Cinco encontros, sem cura automática. Escolha melhorias de HP, força ou agilidade após cada vitória.", length: 5, boss: "npc_voidarchon" },
  { id: "mirror", name: "DUELO DE ESPELHOS", desc: "Sua equipe, níveis e treinamento se tornam os adversários. Enfrente três configurações do seu reflexo.", length: 3, boss: "npc_mirrorduelist" },
  { id: "siege", name: "CERCO", desc: "Proteja o núcleo de 100 pontos em quatro ondas. Golpes inimigos causam vazamento; guardar reduz a perda. Núcleo zerado = derrota.", length: 4, boss: "npc_siegetank" },
  { id: "hunt", name: "CAÇA AO ALVO", desc: "Derrube o alvo marcado sem precisar derrotar os escoltas. Ataques podem mirar diretamente o alvo na reserva.", length: 4, boss: "npc_voidarchon" },
  { id: "reactors", name: "CORRIDA DE REATORES", desc: "Elimine cada equipe em até 12 rounds. O prazo cai para 10 e 8 nos encontros finais; exceder perde a corrida.", length: 3, boss: "npc_chronoguard" },
  { id: "mono", name: "LIGA MONOELEMENTAL", desc: "Monte uma equipe de uma única família elemental. Mudanças de campo e adversários exploram sua afinidade.", length: 4, boss: "npc_chronoguard" },
  { id: "stakes", name: "ARENA DE APOSTAS", desc: "Guarde o banco ou arrisque tudo em inimigos mais fortes e recompensas dobradas. Só ouro do percurso; nunca dinheiro real.", length: 5, boss: "npc_dicelord" },
  { id: "maze", name: "LABIRINTO", desc: "Escolha rotas, santuários ou tesouros. HP persiste e atalhos tornam o próximo combate mais perigoso. O Minotauro guarda a saída.", length: 5, boss: "npc_minotaur" },
];

export const ROUTES = [
  { id: "ruins", name: "RUÍNAS DO TEMPO", desc: "Cronômetros e bibliotecas abandonadas", length: 4, cost: 8, risk: 15, set: 0 },
  { id: "reef", name: "RECIFE MECÂNICO", desc: "Relíquias sob pressão abissal", length: 5, cost: 12, risk: 25, set: 1 },
  { id: "embers", name: "TRILHA DE BRASAS", desc: "Ruínas da antiga forja imperial", length: 5, cost: 14, risk: 35, set: 2 },
  { id: "roots", name: "JARDIM SEM SOL", desc: "Ecossistemas de metal e musgo", length: 6, cost: 16, risk: 40, set: 3 },
  { id: "astral", name: "ANEL ASTRAL", desc: "Sinais além da órbita conhecida", length: 6, cost: 18, risk: 45, set: 4 },
  { id: "royal", name: "TRONO PERDIDO", desc: "O tesouro do primeiro campeão", length: 7, cost: 20, risk: 50, set: 5 },
];
const RELIC_SETS = ["CRONAL", "ABISSAL", "FORJA", "RAÍZES", "ASTRAL", "REGAL"];
const RELIC_PARTS = ["NÚCLEO", "SELO", "LÂMINA", "MEMÓRIA"];
export const RELICS = RELIC_SETS.flatMap((set, s) => RELIC_PARTS.map((part, p) => ({ id: `relic_${s}_${p}`, name: `${part} ${set}`, set: s, icon: s * 4 + p, desc: ["Fragmento de um reator ancestral.", "Insígnia de uma civilização desaparecida.", "Instrumento de um guardião não recrutável.", "Registro vivo da era dos primeiros mechas."][p] })));
export function relicSetCount(e: ExpansionState, set: number) { return RELICS.filter((r) => r.set === set && e.relics.includes(r.id)).length; }

export interface TalentNode { id: string; branch: number; tier: number; name: string; stat: keyof FullStats; value: number }
export const TALENT_NODES: TalentNode[] = [
  ...["IGNIÇÃO", "LÂMINA VIVA", "FOCO TOTAL", "SUPREMACIA"].map((name, i) => ({ id: `atk_${i}`, branch: 0, tier: i, name, stat: "str" as const, value: 2 + i * 2 })),
  ...["REVESTIMENTO", "CASCO DUPLO", "EGIDE", "FORTALEZA"].map((name, i) => ({ id: `def_${i}`, branch: 1, tier: i, name, stat: (i % 2 ? "hp" : "def") as keyof FullStats, value: i % 2 ? 15 + i * 5 : 3 + i * 2 })),
  ...["PASSO LEVE", "RESERVA", "SINCRONIA", "PONTEIRO ZERO"].map((name, i) => ({ id: `tech_${i}`, branch: 2, tier: i, name, stat: (i % 2 ? "mp" : "agl") as keyof FullStats, value: i % 2 ? 5 + i * 3 : 3 + i * 2 })),
];
export function talentBudget(g: GameState, robotId: string): number { return Math.min(8, 2 + Math.floor((g.robots.find((r) => r.id === robotId)?.level ?? 1) / 5) + Math.floor((g.mastery[robotId]?.pts ?? 0) / 500)); }
export function cityBonus(g: GameState, robotId: string): FullStats {
  const b: FullStats = { hp: 0, mp: 0, str: 0, def: 0, agl: 0 };
  for (const id of g.expansion.talents[robotId] ?? []) { const n = TALENT_NODES.find((t) => t.id === id); if (n) b[n.stat] += n.value; }
  const drills = g.expansion.development.drills[robotId] ?? {};
  for (const stat of ["str", "def", "agl"] as const) b[stat] += Math.min(4, Math.floor((drills[stat] ?? 0) / 5));
  const museum = g.expansion.distribution.museum ?? 0;
  if (museum > 0) for (let s = 0; s < 6; s++) {
    const n = relicSetCount(g.expansion, s);
    const stat = (["agl", "hp", "str", "def", "mp", "str"] as (keyof FullStats)[])[s];
    if (n >= 2) b[stat] += stat === "hp" ? 20 : 3;
    if (n >= 4) b[stat] += (stat === "hp" ? 30 : 5) + museum;
    if (n >= 2) b[stat] += (g.expansion.development.resonance[String(s)] ?? 0) * (stat === "hp" ? 10 : 2);
  }
  return b;
}

export const CAMPAIGNS = [
  { id: "echoes", name: "ECOS DA PRIMEIRA CIDADE", nodes: ["Sinal na sucata", "Bifurcação cronológica", "Cerco ao passado", "Relógio partido", "Trono de refugos", "O primeiro campeão"], modes: ["draft", "mirror", "siege", "reactors", "caravan", "hunt"] as DimensionId[] },
  { id: "void", name: "ALÉM DO ECLIPSE", nodes: ["Porta sem luz", "Dois futuros", "O preço da sombra", "Raízes no vazio", "A torre invertida", "Coração do arconte"], modes: ["rift", "mono", "stakes", "maze", "mirror", "rift"] as DimensionId[] },
  { id: "roots", name: "MAPA DAS RAÍZES", nodes: ["Comboio desaparecido", "Oásis ou ruínas", "Rastro ácido", "A aposta do guardião", "Reator selvagem", "Saída do minotauro"], modes: ["caravan", "maze", "hunt", "stakes", "reactors", "maze"] as DimensionId[] },
];

// 24 chains x 15 chapters. Objective values read real save/event counters, never random progress.
type Metric = "wins" | "robots" | "cards" | "tourneys" | "mastery" | "mined" | "ranked" | "equip" | "xpLevel" | "ach" | "pets" | "chips" | "expeditions" | "discoveries" | "talents" | "relics" | "energyEarned" | "contracts" | "campaigns" | "draftWins" | "caravanWins" | "riftWins" | "siegeWins" | "mazeWins";
const CHAINS: [string, Metric, string, number, Metric, string, number][] = [
  ["LINHA DE FRENTE", "wins", "vitórias de batalha", 8, "mastery", "pontos de maestria", 80],
  ["CHASSIS DO AMANHÃ", "robots", "robôs na coleção", 3, "wins", "vitórias", 4],
  ["ARQUIVISTA TÁTICO", "cards", "cards possuídos", 4, "wins", "vitórias", 5],
  ["COPAS DA CIDADE", "tourneys", "torneios distintos vencidos", 2, "wins", "vitórias", 6],
  ["DISCIPLINA DE AÇO", "mastery", "pontos de maestria", 400, "wins", "vitórias", 5],
  ["MINERADOR VETERANO", "mined", "minérios coletados", 120, "robots", "robôs na coleção", 2],
  ["LIGA DE PILOTOS", "ranked", "partidas ranqueadas", 5, "wins", "vitórias", 4],
  ["OFICINA DE RELÍQUIAS", "equip", "equipamentos possuídos", 3, "mastery", "pontos de maestria", 100],
  ["ASCENSÃO DO PILOTO", "xpLevel", "nível do jogador", 4, "wins", "vitórias", 5],
  ["MURAL DOS CAMPEÕES", "ach", "conquistas resgatadas", 10, "mastery", "pontos de maestria", 120],
  ["ALIADOS MECÂNICOS", "pets", "pets possuídos", 1, "wins", "vitórias", 6],
  ["CIRCUITOS CONECTADOS", "chips", "chips possuídos", 3, "cards", "cards possuídos", 2],
  ["CARTÓGRAFOS", "expeditions", "expedições concluídas", 2, "discoveries", "descobertas distintas", 1],
  ["SINAIS NO HORIZONTE", "discoveries", "descobertas distintas", 2, "expeditions", "expedições concluídas", 2],
  ["LEGADO DA ACADEMIA", "talents", "talentos aprendidos", 4, "mastery", "pontos de maestria", 100],
  ["CURADOR DO MUSEU", "relics", "relíquias distintas", 1, "expeditions", "expedições concluídas", 3],
  ["REDE VIVA", "energyEarned", "energia gerada em jogo", 40, "wins", "vitórias", 4],
  ["REPUTAÇÃO DE CAMPO", "contracts", "outros contratos resgatados", 5, "wins", "vitórias", 4],
  ["CRÔNICAS DIMENSIONAIS", "campaigns", "capítulos de campanha", 1, "wins", "vitórias", 5],
  ["REIS DO REFUGO", "draftWins", "percursos Draft vencidos", 1, "mastery", "pontos de maestria", 50],
  ["COMBOIO INABALÁVEL", "caravanWins", "Caravanas concluídas", 1, "mined", "minérios coletados", 50],
  ["EXPLORADORES DO VAZIO", "riftWins", "Fendas concluídas", 1, "relics", "relíquias", 1],
  ["GUARDIÕES DO NÚCLEO", "siegeWins", "Cercos vencidos", 1, "energyEarned", "energia gerada", 30],
  ["SAÍDA ENTRE RAÍZES", "mazeWins", "Labirintos vencidos", 1, "discoveries", "descobertas", 1],
];
const CAPS: Partial<Record<Metric, number>> = { robots: 256, cards: 100, tourneys: 25, xpLevel: 40, ach: 250, pets: 15, chips: 48, discoveries: 48, relics: 24, campaigns: 18 };
export interface Mission { id: string; chain: number; chapter: number; name: string; prev?: string; goals: { metric: Metric; label: string; target: number }[]; gold: number; diamonds: number; reputation: number }
export const MISSIONS: Mission[] = CHAINS.flatMap(([name, metric, label, step, second, label2, step2], chain) => Array.from({ length: 15 }, (_, i) => ({
  id: `contract_${chain}_${i}`, chain, chapter: i + 1, name: `${name} · ${String(i + 1).padStart(2, "0")}`, prev: i ? `contract_${chain}_${i - 1}` : undefined,
  goals: [{ metric, label, target: Math.min(CAPS[metric] ?? Infinity, step * (i + 1)) }, { metric: second, label: label2, target: Math.min(CAPS[second] ?? Infinity, step2 * (i + 1)) }],
  gold: 150 + i * 100 + chain * 10, diamonds: i % 3 === 2 ? 2 + Math.floor(i / 3) : 0, reputation: 5 + i,
})));
export const MISSION_MAP: Record<string, Mission> = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
export const CONTRACT_CHAINS = CHAINS.map((c) => c[0]);
export function metricValue(g: GameState, key: Metric): number {
  const e = g.expansion;
  switch (key) {
    case "wins": return g.battlesWon;
    case "robots": return g.robots.length;
    case "cards": return g.cards.length;
    case "tourneys": return g.wonTournaments.length;
    case "mastery": return Object.values(g.mastery).reduce((a, m) => a + m.pts, 0);
    case "mined": return g.mining.totalMined;
    case "ranked": return g.ranked.wins + g.ranked.losses;
    case "equip": return g.equipment.length;
    case "xpLevel": return g.playerLevel;
    case "ach": return g.achClaimed.length;
    case "pets": return Object.values(g.pets).filter((n) => n > 0).length;
    case "chips": return g.chips.length;
    case "discoveries": return e.discoveries.length;
    case "talents": return Object.values(e.talents).reduce((a, list) => a + list.length, 0);
    case "relics": return e.relics.length;
    case "contracts": return e.missionsClaimed.length;
    case "campaigns": return Object.values(e.campaigns).reduce((a, n) => a + n, 0);
    default: return e.counters[key] ?? 0;
  }
}
export function missionReady(g: GameState, m: Mission): boolean {
  return !g.expansion.missionsClaimed.includes(m.id) && (!m.prev || g.expansion.missionsClaimed.includes(m.prev)) && m.goals.every((o) => metricValue(g, o.metric) >= o.target);
}