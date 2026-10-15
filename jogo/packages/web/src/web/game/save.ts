import { useSyncExternalStore } from "react";
import { freshTutorial, normalizeTutorial, type TutorialProgress } from "./progression";
import { initialExpansion, normalizeExpansion, cityBonus, type ExpansionState } from "./expansion";
import { GENERAL } from "./config";
import { playerMaxXP, statHooks, type RobotSave } from "./engine";
import { initialMeta, normalizeMeta, masteryBonus, equipStats, TOURNAMENT_DIAMONDS, type MetaState } from "./meta";
import { ROBOT_MAP, ROBOTS } from "./robots";
import { isPantheonRobot } from "./pantheon-roster";
import { TRIAL_STAGES, canSummon, initialPantheon, normalizePantheon, trialOf, type PantheonState } from "./pantheon";
import {
  applyMatch,
  claimMission,
  claimReward,
  initialRanked,
  newSeason,
  normalizeRanked,
  type MatchPerf,
  type RankedOpponent,
  type RankedOutcome,
  type RankedState,
} from "./ranked";
import { defaultLoadout, normalizeLoadout } from "./skills";
import { skillsOf } from "./kits";
import {
  BAR_COST,
  DEPTHS,
  DRILL_MAX,
  MAX_DEPTH,
  PICK_MAX,
  REFINERY_MAX,
  SILO_MAX,
  barValue,
  collectProduction,
  drillCost,
  initialMining,
  normalizeMining,
  ORE_MAP,
  pickCost,
  refineBatch,
  refineMs,
  refineryCost,
  siloCapacity,
  siloCost,
  storedTotal,
  type MiningState,
} from "./mining";
import {
  LAB_MAX,
  CORE_MAP,
  SLOT_OPTIONS,
  activateCustom,
  buildCost,
  deactivateCustom,
  isCustom,
  nextCustomId,
  normalizeCustoms,
  scrapValue,
  type CustomRobot,
  type LabDraft,
} from "./lab";
import {
  PET_MAP,
  PET_MAX_LEVEL,
  petSlots,
  petUpgradeBars,
  petUpgradeCost,
  petValue,
  petValue2,
  type PetKind,
} from "./pets";
import {
  CHIP_MAP,
  GADGET_MAP,
  GADGET_MAX_LEVEL,
  GADGET_MAX_SOCKETS,
  GADGET_ROBOT_LEVEL,
  gadgetSockets,
  gadgetTotals,
  gadgetUpgradeBars,
  upgradeCost,
  type GadgetKind,
} from "./gadgets";
import {
  CARD_MAP,
  CARD_MAX_REFINE,
  cardModsAt,
  cardSlots,
  deckBudget,
  refineBars,
  refineCost,
  resolveDeck,
  type CardStat,
  type DeckResult,
} from "./cards";

export interface GameState extends MetaState {
  tutorial: TutorialProgress;
  expansion: ExpansionState;
  version: number;
  gold: number;
  playerLevel: number;
  playerXP: number;
  robots: RobotSave[];
  team: string[];
  items: Record<string, number>;
  wonTournaments: string[];
  battlesWon: number;
  /** 4 habilidades escolhidas por robô. */
  loadouts: Record<string, string[]>;
  /** nivel do gadget de cada robo (0/ausente = nao comprado). */
  gadgets: Record<string, number>;
  /** nivel de cada pet possuido (0/ausente = nao comprado). */
  pets: Record<string, number>;
  /** pets levados pela equipe (ate PET_SLOT_MAX, liberados por nivel). */
  activePets: string[];
  /** ids dos cards possuidos. */
  cards: string[];
  /** ate 5 cards equipados no deck de combate (slots liberados por nivel). */
  deck: string[];
  /** nivel de refino de cada card possuido (1..CARD_MAX_REFINE). */
  cardRefine: Record<string, number>;
  /** ids dos chips de gadget possuidos pelo jogador. */
  chips: string[];
  /** chips encaixados nos sockets do gadget de cada robo. */
  gadgetChips: Record<string, (string | null)[]>;
  /** robo usado na exploracao do hub (Fase C). null = lider da equipe. */
  explorer: string | null;
  /** progresso do modo ranqueado. */
  ranked: RankedState;
  /** mineração em tempo real (Fase E). */
  mining: MiningState;
  /** robôs montados no laboratório (Fase F). */
  customs: CustomRobot[];
  /** Panteão: provações vencidas por chassi exclusivo. */
  pantheon: PantheonState;
  /** progresso dos modos de jogo. */
  modes: {
    babelFloor: number;
    babelBest: number;
    survivalBest: number;
    quickWins: number;
    bossRushBest: number;
    chaosWins: number;
    gauntletBest: number;
    trialsBest: number;
    raidWins: number;
    nightmareBest: number;
  };
}

const KEY = "campeoes-mecha-save-v1";
const VERSION = 3;

function initialState(): GameState {
  return {
    version: VERSION,
    pantheon: initialPantheon(),
    tutorial: freshTutorial(),
    expansion: initialExpansion(),
    gold: 0,
    playerLevel: 1,
    playerXP: 0,
    robots: [],
    team: [],
    items: {},
    wonTournaments: [],
    ...initialMeta(),
    battlesWon: 0,
    loadouts: {},
    gadgets: {},
    pets: {},
    activePets: [],
    cards: [],
    deck: [],
    cardRefine: {},
    chips: [],
    gadgetChips: {},
    explorer: null,
    ranked: initialRanked(),
    mining: initialMining(),
    customs: [],
    modes: {
      babelFloor: 1,
      babelBest: 0,
      survivalBest: 0,
      quickWins: 0,
      bossRushBest: 0,
      chaosWins: 0,
      gauntletBest: 0,
      trialsBest: 0,
      raidWins: 0,
      nightmareBest: 0,
    },
  };
}

/** Aceita o save antigo (activePet: string|null) e o novo (activePets: string[]). */
function normalizeActivePets(parsed: GameState): string[] {
  const legacy = (parsed as GameState & { activePet?: string | null }).activePet;
  const raw = Array.isArray(parsed.activePets)
    ? parsed.activePets
    : legacy
      ? [legacy]
      : [];
  const owned = parsed.pets ?? {};
  const out: string[] = [];
  for (const id of raw) {
    if (!PET_MAP[id]) continue;
    if ((owned[id] ?? 0) <= 0) continue;
    if (out.includes(id)) continue;
    out.push(id);
  }
  return out.slice(0, petSlots(parsed.playerLevel ?? 1));
}

/** Refino valido apenas para cards possuidos, dentro do teto. */
function normalizeRefine(parsed: GameState, owned: string[]): Record<string, number> {
  const raw = parsed.cardRefine ?? {};
  const out: Record<string, number> = {};
  for (const id of owned) {
    const lvl = Math.floor(raw[id] ?? 1);
    if (!Number.isFinite(lvl) || lvl <= 1) continue;
    out[id] = Math.min(CARD_MAX_REFINE, lvl);
  }
  return out;
}

/** Chips encaixados: ids validos, possuidos e dentro dos sockets liberados. */
function normalizeGadgetChips(
  parsed: GameState,
  chips: string[],
): Record<string, (string | null)[]> {
  const raw = parsed.gadgetChips ?? {};
  const out: Record<string, (string | null)[]> = {};
  for (const [robotId, slots] of Object.entries(raw)) {
    if (!GADGET_MAP[robotId]) continue;
    const max = gadgetSockets(parsed.gadgets?.[robotId] ?? 0);
    if (max <= 0) continue;
    const used = new Set<string>();
    const row: (string | null)[] = [];
    for (const id of (Array.isArray(slots) ? slots : []).slice(0, max)) {
      if (id && CHIP_MAP[id] && chips.includes(id) && !used.has(id)) {
        used.add(id);
        row.push(id);
      } else {
        row.push(null);
      }
    }
    if (row.some(Boolean)) out[robotId] = row;
  }
  return out;
}

function read(): GameState {
  if (typeof localStorage === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as GameState;
    if (!Array.isArray(parsed.robots)) return initialState();
    const base = initialState();
    // Fase F: registra os robôs do laboratório antes de qualquer tela montar.
    const customs = normalizeCustoms(parsed.customs);
    for (const c of customs) activateCustom(c);
    const ownedCards = (parsed.cards ?? []).filter((id) => Boolean(CARD_MAP[id]));
    const ownedChips = [...new Set(parsed.chips ?? [])].filter((id) => Boolean(CHIP_MAP[id]));
    return {
      ...base,
      ...parsed,
      version: VERSION,
      tutorial: normalizeTutorial(parsed.tutorial, parsed.robots.length),
      loadouts: parsed.loadouts ?? {},
      gadgets: parsed.gadgets ?? {},
      pets: parsed.pets ?? {},
      // migração G1: o save antigo tinha um único pet ativo.
      activePets: normalizeActivePets(parsed),
      cards: ownedCards,
      deck: (parsed.deck ?? [])
        .filter((id) => Boolean(CARD_MAP[id]))
        .slice(0, cardSlots(parsed.playerLevel ?? 1)),
      // G2: refino de cards e chips de gadget
      cardRefine: normalizeRefine(parsed, ownedCards),
      chips: ownedChips,
      gadgetChips: normalizeGadgetChips(parsed, ownedChips),
      explorer:
        parsed.explorer && (parsed.robots ?? []).some((r) => r.id === parsed.explorer)
          ? parsed.explorer
          : null,
      // migração v1 -> v2: saves antigos não tinham modo ranqueado
      ranked: normalizeRanked(parsed.ranked),
      mining: normalizeMining(parsed.mining),
      customs,
      modes: { ...base.modes, ...(parsed.modes ?? {}) },
      pantheon: normalizePantheon((parsed as { pantheon?: unknown }).pantheon),
      ...normalizeMeta(parsed),
      expansion: normalizeExpansion(parsed.expansion),
    };
  } catch {
    return initialState();
  }
}

let state: GameState = read();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* modo privado — segue só em memória */
  }
}

export function getState(): GameState {
  return state;
}

export function setState(updater: (s: GameState) => GameState) {
  state = updater(state);
  persist();
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useGame(): GameState {
  return useSyncExternalStore(subscribe, getState, getState);
}

// ------------------------------------------------------------------ ações
export function resetGame() {
  state = initialState();
  persist();
  emit();
}

export function addGold(amount: number) {
  setState((s) => ({ ...s, gold: Math.max(0, s.gold + amount) }));
}

export function addPlayerXP(amount: number) {
  setState((s) => {
    let level = s.playerLevel;
    let xp = s.playerXP + amount;
    while (level < GENERAL.max_level && xp >= playerMaxXP(level)) {
      xp -= playerMaxXP(level);
      level += 1;
    }
    return { ...s, playerLevel: level, playerXP: xp };
  });
}

export function unlockRobot(id: string): boolean {
  // chassis do Panteão só são recrutados lá (summonPantheon) — nunca por loja/contrato/cápsula.
  if (isPantheonRobot(id)) return false;
  if (!ROBOT_MAP[id] || state.robots.some((r) => r.id === id)) return false;
  const avgLevel = Math.max(
    1,
    state.robots.length ? Math.round(state.robots.reduce((a, r) => a + r.level, 0) / state.robots.length) - 1 : 1,
  );
  setState((s) => ({
    ...s,
    robots: [...s.robots, { id, level: avgLevel, xp: 0, trained: { str: 0, def: 0, agl: 0 } }],
  }));
  return true;
}

/** Registra uma provação vencida do Panteão (só avança em sequência). */
export function recordTrialWin(id: string, stage: number, flawless: boolean): boolean {
  if (!trialOf(id)) return false;
  const cur = state.pantheon.wins[id] ?? 0;
  if (stage !== cur || cur >= TRIAL_STAGES) return false;
  setState((s) => ({
    ...s,
    pantheon: {
      wins: { ...s.pantheon.wins, [id]: cur + 1 },
      flawless:
        flawless && stage === TRIAL_STAGES - 1 && !s.pantheon.flawless.includes(id)
          ? [...s.pantheon.flawless, id]
          : s.pantheon.flawless,
    },
  }));
  return true;
}

/** Desperta um chassi do Panteão: exige provações + missões e cobra a oferenda em diamantes. */
export function summonPantheon(id: string): boolean {
  const t = trialOf(id);
  if (!t || !canSummon(state, id)) return false;
  const level = Math.max(1, ...state.robots.map((r) => r.level));
  setState((s) => ({
    ...s,
    diamonds: s.diamonds - t.cost,
    robots: [...s.robots, { id, level, xp: 0, trained: { str: 0, def: 0, agl: 0 } }],
  }));
  return true;
}

export function lockedRobotIds(): string[] {
  const owned = new Set(state.robots.map((r) => r.id));
  return ROBOTS.filter((r) => !owned.has(r.id) && !isCustom(r.id) && !isPantheonRobot(r.id)).map((r) => r.id);
}

export function addItem(id: string, qty: number) {
  setState((s) => ({ ...s, items: { ...s.items, [id]: (s.items[id] ?? 0) + qty } }));
}

export function spendItem(id: string, qty = 1) {
  setState((s) => ({
    ...s,
    items: { ...s.items, [id]: Math.max(0, (s.items[id] ?? 0) - qty) },
  }));
}

/** robo que o jogador controla no hub (Fase C). */
export function explorerId(s: GameState = state): string {
  if (s.explorer && s.robots.some((r) => r.id === s.explorer)) return s.explorer;
  return s.team[0] ?? s.robots[0]?.id ?? "";
}

export function setExplorer(id: string) {
  setState((s) => (s.robots.some((r) => r.id === id) ? { ...s, explorer: id } : s));
}

export function setTeam(team: string[]) {
  setState((s) => {
    const owned=new Set(s.robots.map(r=>r.id));
    const valid=[...new Set(team)].filter(id=>owned.has(id)).slice(0,4);
    return {...s,team:valid.length?valid:s.robots.length?[s.team.find(id=>owned.has(id))??s.robots[0].id]:[]};
  });
}

export function updateRobots(robots: RobotSave[]) {
  setState((s) => ({ ...s, robots }));
}

export function markTournamentWon(id: string) {
  setState((s) => {
    if (s.wonTournaments.includes(id)) return s;
    return {
      ...s,
      wonTournaments: [...s.wonTournaments, id],
      diamonds: s.diamonds + TOURNAMENT_DIAMONDS,
      diamondsEarned: s.diamondsEarned + TOURNAMENT_DIAMONDS,
    };
  });
}

// bonus de maestria + equipamentos entram em totalStats (so robos do jogador).
statHooks.bonus = (robotId: string) => {
  const g = state;
  const out = { hp: 0, mp: 0, str: 0, def: 0, agl: 0 };
  const add = (b: Partial<typeof out>) => {
    out.hp += b.hp ?? 0;
    out.mp += b.mp ?? 0;
    out.str += b.str ?? 0;
    out.def += b.def ?? 0;
    out.agl += b.agl ?? 0;
  };
  const m = g.mastery[robotId];
  if (g.robots.some((r) => r.id === robotId)) add(cityBonus(g, robotId));
  if (m) add(masteryBonus(m.pts));
  for (const uid of g.equipped[robotId] ?? []) {
    const it = g.equipment.find((e) => e.uid === uid);
    if (it) add(equipStats(it));
  }
  return out;
};

export function incBattlesWon() {
  setState((s) => ({ ...s, battlesWon: s.battlesWon + 1 }));
}

export function teamSaves(s: GameState): RobotSave[] {
  return s.team
    .map((id) => s.robots.find((r) => r.id === id))
    .filter((r): r is RobotSave => Boolean(r))
    .map((r) => ({ ...r, loadout: loadoutOf(s, r.id), gadgetLevel: s.gadgets[r.id] ?? 0 }));
}

// ------------------------------------------------------------- loadouts
export function loadoutOf(s: GameState, robotId: string): string[] {
  const def = ROBOT_MAP[robotId];
  if (!def) return [];
  return normalizeLoadout(skillsOf(robotId),s.loadouts[robotId] ?? []);
}

export function setLoadout(robotId: string, skillIds: string[]) {
  const def = ROBOT_MAP[robotId];
  if (!def) return;
  const clean=normalizeLoadout(skillsOf(robotId),skillIds);
  setState(st=>({...st,loadouts:{...st.loadouts,[robotId]:clean}}));
}

/** Reseta o kit de um robô para o padrão do chassi. */
export function resetLoadout(robotId: string) {
  const def = ROBOT_MAP[robotId];
  if (!def) return;
  setLoadout(robotId, defaultLoadout(skillsOf(robotId)));
}

// ------------------------------------------------------------- ranqueado
/** Registra o resultado de uma partida ranqueada, paga o ouro e devolve o resumo. */
export function applyRankedMatch(
  win: boolean,
  opp: RankedOpponent,
  perf?: MatchPerf,
): RankedOutcome {
  const outcome = applyMatch(state.ranked, win, opp, perf);
  setState((s) => ({
    ...s,
    ranked: outcome.state,
    gold: Math.max(0, s.gold + outcome.gold),
  }));
  return outcome;
}

/** Coleta a recompensa de ouro de um rank já alcançado. */
export function claimRankReward(rankIndex: number): number {
  const res = claimReward(state.ranked, rankIndex);
  if (res.gold <= 0) return 0;
  setState((s) => ({ ...s, ranked: res.state, gold: s.gold + res.gold }));
  return res.gold;
}

/** Coleta a recompensa de uma missão de temporada concluída. */
export function claimRankedMission(id: string): number {
  const res = claimMission(state.ranked, id);
  if (res.gold <= 0) return 0;
  setState((s) => ({ ...s, ranked: res.state, gold: s.gold + res.gold }));
  return res.gold;
}

/** Encerra a temporada atual e inicia a próxima com reset suave. */
export function startNewSeason() {
  setState((s) => ({ ...s, ranked: newSeason(s.ranked) }));
}

// ------------------------------------------------------------- gadgets
export function gadgetLevelOf(s: GameState, robotId: string): number {
  return s.gadgets[robotId] ?? 0;
}

/** Compra o gadget do robo (nivel 1). Retorna false se nao for possivel. */
export function buyGadget(robotId: string): boolean {
  const def = GADGET_MAP[robotId];
  if (!def) return false;
  const robot = state.robots.find((r) => r.id === robotId);
  if (!robot || robot.level < GADGET_ROBOT_LEVEL) return false;
  if ((state.gadgets[robotId] ?? 0) > 0) return false;
  if (state.gold < def.price) return false;
  setState((s) => ({
    ...s,
    gold: s.gold - def.price,
    gadgets: { ...s.gadgets, [robotId]: 1 },
  }));
  return true;
}

/** Sobe um nivel do gadget. Marcos de MK cobram lingotes. */
export function upgradeGadget(robotId: string): boolean {
  const def = GADGET_MAP[robotId];
  if (!def || !state.robots.some(r => r.id === robotId)) return false;
  const cur = state.gadgets[robotId] ?? 0;
  if (cur <= 0 || cur >= GADGET_MAX_LEVEL) return false;
  const cost = upgradeCost(def, cur);
  const bars = gadgetUpgradeBars(def, cur);
  if (state.gold < cost) return false;
  if (bars > 0 && totalBars(state) < bars) return false;
  setState((s) => ({
    ...s,
    gold: s.gold - cost,
    gadgets: { ...s.gadgets, [robotId]: cur + 1 },
    mining:
      bars > 0 ? { ...s.mining, bars: spendBars(s.mining.bars, bars) } : s.mining,
  }));
  return true;
}

// --------------------------------------------------------- chips (G2)
/** Sockets liberados pelo nivel atual do gadget do robo. */
export function gadgetSocketCount(s: GameState, robotId: string): number {
  return gadgetSockets(s.gadgets[robotId] ?? 0);
}

/** Chips encaixados no gadget do robo, ja limitados aos sockets liberados. */
export function gadgetChipsOf(s: GameState, robotId: string): (string | null)[] {
  const max = gadgetSocketCount(s, robotId);
  const row = s.gadgetChips[robotId] ?? [];
  return Array.from({ length: max }, (_, i) => {
    const id = row[i];
    return id && CHIP_MAP[id] ? id : null;
  });
}

export function ownsChip(s: GameState, chipId: string): boolean {
  return s.chips.includes(chipId);
}

/** Compra um chip (ouro + lingotes). Chips servem para qualquer robo. */
export function buyChip(chipId: string): boolean {
  const def = CHIP_MAP[chipId];
  if (!def) return false;
  if (state.chips.includes(chipId)) return false;
  if (state.gold < def.price) return false;
  if (def.bars > 0 && totalBars(state) < def.bars) return false;
  setState((s) => ({
    ...s,
    gold: s.gold - def.price,
    chips: [...s.chips, chipId],
    mining:
      def.bars > 0
        ? { ...s.mining, bars: spendBars(s.mining.bars, def.bars) }
        : s.mining,
  }));
  return true;
}

/** Encaixa (ou remove, com chipId null) um chip num socket do gadget. */
export function equipChip(robotId: string, slot: number, chipId: string | null): boolean {
  if (!GADGET_MAP[robotId] || !state.robots.some(r => r.id === robotId) || !Number.isInteger(slot)) return false;
  const max = gadgetSocketCount(state, robotId);
  if (slot < 0 || slot >= max) return false;
  if (chipId !== null) {
    if (!CHIP_MAP[chipId] || !state.chips.includes(chipId)) return false;
  }
  const row = gadgetChipsOf(state, robotId);
  // o mesmo chip nao pode ocupar dois sockets do mesmo gadget
  const next = row.map((id, i) => {
    if (i === slot) return chipId;
    return chipId !== null && id === chipId ? null : id;
  });
  setState((s) => ({
    ...s,
    gadgetChips: { ...s.gadgetChips, [robotId]: next.slice(0, GADGET_MAX_SOCKETS) },
  }));
  return true;
}

/** Efeitos totais do gadget do robo (efeito principal + chips). */
export function gadgetBonusTable(
  robotId: string,
  s: GameState = state,
): Partial<Record<GadgetKind, number>> {
  return gadgetTotals(GADGET_MAP[robotId], s.gadgets[robotId] ?? 0, gadgetChipsOf(s, robotId));
}

export function setModeProgress(patch: Partial<GameState["modes"]>) {
  setState((st) => ({ ...st, modes: { ...st.modes, ...patch } }));
}

// ------------------------------------------------------------- pets
export function petLevelOf(s: GameState, petId: string): number {
  return s.pets[petId] ?? 0;
}

/** Slots de pet liberados pelo nivel atual do jogador. */
export function petSlotCount(s: GameState = state): number {
  return petSlots(s.playerLevel);
}

/** Compra o pet (nivel 1). Retorna false se nao for possivel. */
export function buyPet(petId: string): boolean {
  const def = PET_MAP[petId];
  if (!def) return false;
  if ((state.pets[petId] ?? 0) > 0) return false;
  if (state.playerLevel < def.requiredLevel) return false;
  if (state.gold < def.price) return false;
  setState((s) => ({
    ...s,
    gold: s.gold - def.price,
    pets: { ...s.pets, [petId]: 1 },
    activePets:
      s.activePets.length < petSlots(s.playerLevel)
        ? [...s.activePets, petId]
        : s.activePets,
  }));
  return true;
}

/** Sobe um nivel do pet. Cruzar um estagio tambem consome lingotes. */
export function upgradePet(petId: string): boolean {
  const def = PET_MAP[petId];
  if (!def) return false;
  const cur = state.pets[petId] ?? 0;
  if (cur <= 0 || cur >= PET_MAX_LEVEL) return false;
  const cost = petUpgradeCost(def, cur);
  const bars = petUpgradeBars(def, cur);
  if (state.gold < cost) return false;
  if (bars > 0 && totalBars(state) < bars) return false;
  setState((s) => ({
    ...s,
    gold: s.gold - cost,
    pets: { ...s.pets, [petId]: cur + 1 },
    mining:
      bars > 0 ? { ...s.mining, bars: spendBars(s.mining.bars, bars) } : s.mining,
  }));
  return true;
}

/** Soma dos bonus de todos os pets levados (principal + metade do secundario). */
export function activePetBonus(kind: PetKind): number {
  let total = 0;
  for (const id of state.activePets) {
    const def = PET_MAP[id];
    if (!def) continue;
    const lvl = state.pets[id] ?? 0;
    if (lvl <= 0) continue;
    if (def.kind === kind) total += petValue(def, lvl);
    if (def.kind2 === kind) total += petValue2(def, lvl);
  }
  return Math.round(total * 10) / 10;
}

/** Tabela completa de bonus dos pets levados, usada pela batalha. */
export function petBonusTable(): Partial<Record<PetKind, number>> {
  const out: Partial<Record<PetKind, number>> = {};
  for (const id of state.activePets) {
    const def = PET_MAP[id];
    if (!def) continue;
    const lvl = state.pets[id] ?? 0;
    if (lvl <= 0) continue;
    out[def.kind] = Math.round(((out[def.kind] ?? 0) + petValue(def, lvl)) * 10) / 10;
    out[def.kind2] =
      Math.round(((out[def.kind2] ?? 0) + petValue2(def, lvl)) * 10) / 10;
  }
  return out;
}

/** Aplica os bonus de ouro (scavenger) e XP (mentor) do pet ativo. */
export function applyPetRewards(r: { gold: number; xp: number }): {
  gold: number;
  xp: number;
} {
  const g = activePetBonus("scavenger");
  const x = activePetBonus("mentor");
  return {
    gold: Math.round(r.gold * (1 + g / 100)),
    xp: Math.round(r.xp * (1 + x / 100)),
  };
}

/** Coloca ou tira o pet da equipe. Retorna false quando nao ha slot livre. */
export function togglePetSlot(petId: string): boolean {
  if ((state.pets[petId] ?? 0) <= 0) return false;
  if (state.activePets.includes(petId)) {
    setState((s) => ({ ...s, activePets: s.activePets.filter((p) => p !== petId) }));
    return true;
  }
  if (state.activePets.length >= petSlots(state.playerLevel)) return false;
  setState((s) => ({ ...s, activePets: [...s.activePets, petId] }));
  return true;
}

/** Tira todos os pets da equipe. */
export function clearPetSlots() {
  setState((s) => ({ ...s, activePets: [] }));
}

// ------------------------------------------------------------- cards
export function ownsCard(s: GameState, cardId: string): boolean {
  return s.cards.includes(cardId);
}

/** Compra um card. Retorna false quando nao for possivel. */
export function buyCard(cardId: string): boolean {
  const def = CARD_MAP[cardId];
  if (!def) return false;
  if (state.cards.includes(cardId)) return false;
  if (state.playerLevel < def.requiredLevel) return false;
  if (state.gold < def.price) return false;
  setState((s) => ({
    ...s,
    gold: s.gold - def.price,
    cards: [...s.cards, cardId],
  }));
  return true;
}

/** Equipa ou desequipa um card, respeitando slots e orcamento de energia. */
export function toggleCard(cardId: string): boolean {
  const def = CARD_MAP[cardId];
  if (!def) return false;
  if (state.deck.includes(cardId)) {
    setState((s) => ({ ...s, deck: s.deck.filter((id) => id !== cardId) }));
    return true;
  }
  if (!state.cards.includes(cardId)) return false;
  if (state.deck.length >= cardSlots(state.playerLevel)) return false;
  const cost = resolveDeck(state.deck, state.cardRefine).cost + def.cost;
  if (cost > deckBudget(state.playerLevel)) return false;
  setState((s) => ({ ...s, deck: [...s.deck, cardId] }));
  return true;
}

export function clearDeck() {
  setState((s) => ({ ...s, deck: [] }));
}

/** Slots de card liberados pelo nivel atual do jogador. */
export function cardSlotCount(s: GameState = state): number {
  return cardSlots(s.playerLevel);
}

/** Nivel de refino de um card possuido (1 = sem refino). */
export function cardRefineOf(s: GameState, cardId: string): number {
  return Math.max(1, s.cardRefine[cardId] ?? 1);
}

/** Refina um card possuido (ouro + lingotes nos marcos). */
export function refineCard(cardId: string): boolean {
  const def = CARD_MAP[cardId];
  if (!def) return false;
  if (!state.cards.includes(cardId)) return false;
  const cur = cardRefineOf(state, cardId);
  if (cur >= CARD_MAX_REFINE) return false;
  const cost = refineCost(def, cur);
  const bars = refineBars(def, cur);
  if (state.gold < cost) return false;
  if (bars > 0 && totalBars(state) < bars) return false;
  setState((s) => ({
    ...s,
    gold: s.gold - cost,
    cardRefine: { ...s.cardRefine, [cardId]: cur + 1 },
    mining:
      bars > 0 ? { ...s.mining, bars: spendBars(s.mining.bars, bars) } : s.mining,
  }));
  return true;
}

/** Mods efetivos de um card possuido, com refino aplicado. */
export function cardModsOwned(cardId: string, s: GameState = state) {
  const def = CARD_MAP[cardId];
  if (!def) return {};
  return cardModsAt(def, cardRefineOf(s, cardId));
}

/** Deck resolvido do jogador (cards + refino + sinergias ativas). */
export function playerDeck(s: GameState = state): DeckResult {
  return resolveDeck(s.deck, s.cardRefine);
}

/** Modificador do deck do jogador para um atributo. */
export function deckBonus(stat: CardStat): number {
  return playerDeck().mods[stat] ?? 0;
}

// ------------------------------------------------------------ mineração (E)
function withMining(s: GameState, patch: Partial<MiningState>): GameState {
  return { ...s, mining: { ...s.mining, ...patch } };
}

/** Espaço livre no silo. */
export function siloRoom(m: MiningState): number {
  return Math.max(0, siloCapacity(m.silo) - storedTotal(m));
}

/**
 * Recolhe a produção das perfuratrizes desde o último tick (funciona offline,
 * com teto de 8h). Devolve quanto foi ganho para a UI avisar o jogador.
 */
export function miningTick(now = Date.now()): { gained: number; ms: number } {
  if (!Number.isFinite(now) || now < state.mining.lastTick) return { gained: 0, ms: 0 };
  const res = collectProduction(state.mining, now);
  setState((s) => {
    const ores = { ...s.mining.ores };
    for (const [id, q] of Object.entries(res.ores)) ores[id] = (ores[id] ?? 0) + q;
    return withMining(s, { ores, lastTick: now, totalMined: s.mining.totalMined + res.gained });
  });
  return { gained: res.gained, ms: res.ms };
}

/** Minério arrancado de um veio pelo robô. Respeita a capacidade do silo. */
export function mineOre(oreId: string, qty: number): number {
  if (!ORE_MAP[oreId] || !Number.isFinite(qty) || qty <= 0) return 0;
  const room = siloRoom(state.mining);
  const got = Math.max(0, Math.min(room, Math.floor(qty)));
  if (got <= 0) return 0;
  setState((s) =>
    withMining(s, {
      ores: { ...s.mining.ores, [oreId]: (s.mining.ores[oreId] ?? 0) + got },
      totalMined: s.mining.totalMined + got,
    }),
  );
  return got;
}

export function upgradePick(): boolean {
  const m = state.mining;
  if (m.pick >= PICK_MAX) return false;
  const cost = pickCost(m.pick);
  if (state.gold < cost) return false;
  setState((s) => withMining({ ...s, gold: s.gold - cost }, { pick: s.mining.pick + 1 }));
  return true;
}

export function upgradeSilo(): boolean {
  const m = state.mining;
  if (m.silo >= SILO_MAX) return false;
  const cost = siloCost(m.silo);
  if (state.gold < cost) return false;
  setState((s) => withMining({ ...s, gold: s.gold - cost }, { silo: s.mining.silo + 1 }));
  return true;
}

export function upgradeRefinery(): boolean {
  const m = state.mining;
  if (m.refinery >= REFINERY_MAX) return false;
  const cost = refineryCost(m.refinery);
  if (state.gold < cost) return false;
  setState((s) => withMining({ ...s, gold: s.gold - cost }, { refinery: s.mining.refinery + 1 }));
  return true;
}

export function upgradeDrill(depth: number): boolean {
  const m = state.mining;
  if (!Number.isInteger(depth) || depth < 1 || depth > MAX_DEPTH || depth > m.depth) return false;
  const lvl = m.drills[String(depth)] ?? 0;
  if (lvl >= DRILL_MAX) return false;
  const cost = drillCost(depth, lvl);
  if (state.gold < cost) return false;
  miningTick();
  setState((s) =>
    withMining(
      { ...s, gold: s.gold - cost },
      { drills: { ...s.mining.drills, [String(depth)]: lvl + 1 } },
    ),
  );
  return true;
}

export function descendMine(): boolean {
  const m = state.mining;
  if (m.depth >= MAX_DEPTH) return false;
  const next = DEPTHS[m.depth];
  if (state.gold < next.cost) return false;
  setState((s) => withMining({ ...s, gold: s.gold - next.cost }, { depth: s.mining.depth + 1 }));
  return true;
}

/** Manda um lote de minério bruto para a refinaria (leva tempo real). */
export function startRefine(oreId: string, bars: number): boolean {
  const m = state.mining;
  if (!ORE_MAP[oreId] || !Number.isInteger(bars) || bars <= 0) return false;
  if (m.job) return false;
  const max = Math.min(refineBatch(m.refinery), Math.floor((m.ores[oreId] ?? 0) / BAR_COST));
  const n = Math.max(0, Math.min(bars, max));
  if (n <= 0) return false;
  const endsAt = Date.now() + refineMs(n, m.refinery);
  setState((s) =>
    withMining(s, {
      ores: { ...s.mining.ores, [oreId]: (s.mining.ores[oreId] ?? 0) - n * BAR_COST },
      job: { ore: oreId, bars: n, endsAt },
    }),
  );
  return true;
}

/** Retira os lingotes prontos da refinaria. */
export function collectRefine(now = Date.now()): number {
  const job = state.mining.job;
  if (!Number.isFinite(now) || !job || now < job.endsAt) return 0;
  setState((s) =>
    withMining(s, {
      bars: { ...s.mining.bars, [job.ore]: (s.mining.bars[job.ore] ?? 0) + job.bars },
      job: null,
    }),
  );
  return job.bars;
}

/** Vende todo o estoque (bruto + lingotes) e devolve o ouro recebido. */
export function sellMining(): number {
  const m = state.mining;
  let gold = 0;
  for (const [id, q] of Object.entries(m.ores)) gold += (ORE_MAP[id]?.value ?? 0) * q;
  for (const [id, q] of Object.entries(m.bars)) gold += barValue(id) * q;
  if (gold <= 0) return 0;
  setState((s) => ({
    ...s,
    gold: s.gold + gold,
    mining: { ...s.mining, ores: {}, bars: {}, totalGold: s.mining.totalGold + gold },
  }));
  return gold;
}

// ---------------------------------------------------------- laboratório (F)
/** Total de lingotes refinados disponíveis, somando todos os minérios. */
export function totalBars(s: GameState = state): number {
  return Object.values(s.mining.bars).reduce((a, q) => a + q, 0);
}

/** Gasta N lingotes, começando pelos minérios mais baratos. */
function spendBars(bars: Record<string, number>, n: number): Record<string, number> {
  const out = { ...bars };
  let left = n;
  const order = Object.keys(out).sort(
    (a, b) => (ORE_MAP[a]?.value ?? 0) - (ORE_MAP[b]?.value ?? 0),
  );
  for (const id of order) {
    if (left <= 0) break;
    const take = Math.min(out[id] ?? 0, left);
    out[id] = (out[id] ?? 0) - take;
    left -= take;
  }
  return out;
}

/** Constrói um robô customizado. Devolve o id criado ou null. */
export function buildCustom(draft: LabDraft): string | null {
  const s = state;
  if (!draft || typeof draft.name !== "string" || !CORE_MAP[draft.core] ||
      !Number.isFinite(draft.hue) || draft.hue < 0 || draft.hue >= 360 ||
      !SLOT_OPTIONS.head.includes(draft.head) || !SLOT_OPTIONS.torso.includes(draft.torso) ||
      !SLOT_OPTIONS.arm.includes(draft.arm) || !SLOT_OPTIONS.leg.includes(draft.leg) ||
      (draft.deco !== null && !SLOT_OPTIONS.deco.includes(draft.deco))) return null;
  if (s.customs.length >= LAB_MAX) return null;
  const cost = buildCost(draft);
  if (s.gold < cost.gold || totalBars(s) < cost.bars) return null;
  const id = nextCustomId(s.customs);
  const custom: CustomRobot = {
    id,
    name: (draft.name || "PROTOTIPO").slice(0, 14).toUpperCase(),
    core: draft.core,
    head: draft.head,
    torso: draft.torso,
    arm: draft.arm,
    leg: draft.leg,
    deco: draft.deco,
    hue: draft.hue,
    createdAt: Date.now(),
  };
  activateCustom(custom);
  setState((st) => ({
    ...st,
    gold: st.gold - cost.gold,
    mining: { ...st.mining, bars: spendBars(st.mining.bars, cost.bars) },
    customs: [...st.customs, custom],
    robots: [...st.robots, { id, level: 1, xp: 0, trained: { str: 0, def: 0, agl: 0 } }],
  }));
  return id;
}

export function renameCustom(id: string, name: string): boolean {
  if (typeof name !== "string") return false;
  if (!state.customs.some((c) => c.id === id)) return false;
  const clean = (name || "PROTOTIPO").slice(0, 14).toUpperCase();
  setState((s) => {
    const customs = s.customs.map((c) => (c.id === id ? { ...c, name: clean } : c));
    const target = customs.find((c) => c.id === id);
    if (target) activateCustom(target);
    return { ...s, customs };
  });
  return true;
}

/** Desmonta um robô customizado e devolve parte do ouro. */
export function scrapCustom(id: string): number {
  const c = state.customs.find((x) => x.id === id);
  if (!c) return 0;
  const gold = scrapValue(c);
  setState((s) => ({
    ...s,
    gold: s.gold + gold,
    customs: s.customs.filter((x) => x.id !== id),
    robots: s.robots.filter((r) => r.id !== id),
    team: s.team.some(t => t !== id) ? s.team.filter(t => t !== id) : s.robots.filter(r => r.id !== id).slice(0, 1).map(r => r.id),
    explorer: s.explorer === id ? null : s.explorer,
    gadgets: Object.fromEntries(Object.entries(s.gadgets).filter(([key]) => key !== id)),
    gadgetChips: Object.fromEntries(Object.entries(s.gadgetChips).filter(([key]) => key !== id)),
    equipped: Object.fromEntries(Object.entries(s.equipped).filter(([key]) => key !== id)),
  }));
  deactivateCustom(id);
  return gold;
}
