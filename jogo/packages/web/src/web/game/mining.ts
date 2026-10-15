/**
 * Fase E — Mineração em tempo real.
 *
 * Modelo puro (sem React, sem localStorage): definições de minério, camadas de
 * profundidade, perfuratrizes automáticas, silo, refinaria e o cálculo de
 * produção offline. O estado vive em `save.ts` (`GameState.mining`).
 */

export interface OreDef {
  id: string;
  name: string;
  /** icone 48x48 em /ui/ore_N.png */
  icon: string;
  /** valor em ouro do minério bruto */
  value: number;
  /** dureza: HP do veio (multiplica a dureza da camada) */
  hardness: number;
  color: string;
}

export const ORES: OreDef[] = [
  { id: "ferro", name: "FERRO", icon: "/ui/ore_0.png", value: 3, hardness: 1, color: "#b9c3cc" },
  { id: "cobre", name: "COBRE", icon: "/ui/ore_1.png", value: 6, hardness: 1.3, color: "#e08a3c" },
  { id: "titanio", name: "TITANIO", icon: "/ui/ore_2.png", value: 14, hardness: 1.8, color: "#dfe7ef" },
  { id: "cristal", name: "CRISTAL", icon: "/ui/ore_3.png", value: 30, hardness: 2.4, color: "#35e2f0" },
  { id: "ametista", name: "AMETISTA", icon: "/ui/ore_4.png", value: 62, hardness: 3.1, color: "#a161ff" },
  { id: "magma", name: "MAGMA", icon: "/ui/ore_5.png", value: 120, hardness: 4, color: "#ff5a3c" },
  { id: "aurita", name: "AURITA", icon: "/ui/ore_6.png", value: 230, hardness: 5.2, color: "#ffd23c" },
  { id: "prisma", name: "PRISMA", icon: "/ui/ore_7.png", value: 440, hardness: 6.6, color: "#f0f4ff" },
];

export const ORE_MAP: Record<string, OreDef> = Object.fromEntries(
  ORES.map((o) => [o.id, o]),
);

export interface DepthDef {
  level: number;
  name: string;
  /** custo em ouro para descer até aqui */
  cost: number;
  /** minérios que aparecem nos veios, do mais comum ao mais raro */
  ores: string[];
  /** multiplicador de HP dos veios */
  hardness: number;
}

/** 8 camadas: cada descida abre um minério novo e endurece os veios. */
export const DEPTHS: DepthDef[] = [
  { level: 1, name: "GALERIA SUPERIOR", cost: 0, ores: ["ferro", "cobre"], hardness: 1 },
  { level: 2, name: "POCO DE ESCORIA", cost: 1200, ores: ["ferro", "cobre", "titanio"], hardness: 1.5 },
  { level: 3, name: "VEIO DE TITANIO", cost: 4500, ores: ["cobre", "titanio", "cristal"], hardness: 2.2 },
  { level: 4, name: "CAVERNA DE CRISTAL", cost: 14000, ores: ["titanio", "cristal", "ametista"], hardness: 3.1 },
  { level: 5, name: "FENDA VIOLETA", cost: 40000, ores: ["cristal", "ametista", "magma"], hardness: 4.3 },
  { level: 6, name: "CAMARA DE MAGMA", cost: 110000, ores: ["ametista", "magma", "aurita"], hardness: 5.8 },
  { level: 7, name: "VEIA AURIFERA", cost: 300000, ores: ["magma", "aurita", "prisma"], hardness: 7.6 },
  { level: 8, name: "NUCLEO PRISMATICO", cost: 800000, ores: ["aurita", "prisma"], hardness: 10 },
];

export const MAX_DEPTH = DEPTHS.length;

/** Pesos por posição na lista de minérios da camada (comum → raro). */
const WEIGHTS = [58, 30, 12];

export function rollOre(depth: number, rnd: number): string {
  const d = DEPTHS[Math.min(depth, MAX_DEPTH) - 1];
  const ws = d.ores.map((_, i) => WEIGHTS[i] ?? 6);
  const total = ws.reduce((a, b) => a + b, 0);
  let acc = rnd * total;
  for (let i = 0; i < d.ores.length; i++) {
    acc -= ws[i];
    if (acc <= 0) return d.ores[i];
  }
  return d.ores[0];
}

// ------------------------------------------------------------------ picareta
export const PICK_MAX = 30;

/** Dano por golpe da picareta do robô. */
export function pickDamage(level: number): number {
  return 8 + (level - 1) * 6;
}

export function pickCost(level: number): number {
  return Math.round(320 * Math.pow(1.42, level - 1));
}

// ---------------------------------------------------------------------- silo
export const SILO_MAX = 30;

/** Capacidade total de minério bruto guardado. */
export function siloCapacity(level: number): number {
  return 250 + (level - 1) * 220;
}

export function siloCost(level: number): number {
  return Math.round(400 * Math.pow(1.38, level - 1));
}

// -------------------------------------------------------------- perfuratriz
export const DRILL_MAX = 20;

/** Perfuratriz automática de uma camada: minérios por minuto. */
export function drillRate(depth: number, level: number): number {
  if (level <= 0) return 0;
  return +(level * (0.9 + depth * 0.35)).toFixed(2);
}

export function drillCost(depth: number, level: number): number {
  const base = 600 * Math.pow(2.15, depth - 1);
  return Math.round(base * Math.pow(1.34, level));
}

/** Teto de acúmulo offline: 8 horas. */
export const OFFLINE_CAP_MS = 8 * 3600 * 1000;

// --------------------------------------------------------------- refinaria
export const REFINERY_MAX = 20;

/** Lingote vale 3.5x o minério bruto. */
export function barValue(oreId: string): number {
  return Math.round((ORE_MAP[oreId]?.value ?? 1) * 3.5);
}

/** Quantos minérios brutos cada lingote consome. */
export const BAR_COST = 10;

/** Tempo real (ms) para refinar um lote de N lingotes. */
export function refineMs(bars: number, refineryLevel: number): number {
  const per = 26000 / (1 + (refineryLevel - 1) * 0.28);
  return Math.round(per * bars);
}

export function refineryCost(level: number): number {
  return Math.round(900 * Math.pow(1.4, level - 1));
}

/** Lote máximo por vez cresce com a refinaria. */
export function refineBatch(level: number): number {
  return 5 + (level - 1) * 3;
}

// ------------------------------------------------------------------ veios
export interface Vein {
  id: number;
  ore: string;
  hp: number;
  maxHp: number;
  /** posição relativa na parede de rocha (0..1) */
  x: number;
  y: number;
  /** timestamp de quando o veio volta (0 = ativo) */
  respawnAt: number;
}

export const VEIN_SLOTS = 6;
export const VEIN_RESPAWN_MS = 9000;

export function veinHp(oreId: string, depth: number): number {
  const d = DEPTHS[Math.min(depth, MAX_DEPTH) - 1];
  return Math.round(34 * (ORE_MAP[oreId]?.hardness ?? 1) * d.hardness);
}

/** Quantidade de minério que um veio entrega ao quebrar. */
export function veinYield(oreId: string, depth: number): number {
  const rare = ORE_MAP[oreId]?.hardness ?? 1;
  return Math.max(1, Math.round((5 + depth) / rare));
}

// ------------------------------------------------------- estado persistido
export interface MiningState {
  depth: number;
  ores: Record<string, number>;
  bars: Record<string, number>;
  pick: number;
  silo: number;
  refinery: number;
  /** nível da perfuratriz de cada camada, indexado por número da camada */
  drills: Record<string, number>;
  job: { ore: string; bars: number; endsAt: number } | null;
  lastTick: number;
  totalMined: number;
  totalGold: number;
}

export function initialMining(): MiningState {
  return {
    depth: 1,
    ores: {},
    bars: {},
    pick: 1,
    silo: 1,
    refinery: 1,
    drills: {},
    job: null,
    lastTick: Date.now(),
    totalMined: 0,
    totalGold: 0,
  };
}

export function normalizeMining(m: Partial<MiningState> | undefined): MiningState {
  const base = initialMining();
  if (!m) return base;
  return {
    ...base,
    ...m,
    depth: Math.min(MAX_DEPTH, Math.max(1, Math.round(m.depth ?? 1))),
    pick: Math.min(PICK_MAX, Math.max(1, Math.round(m.pick ?? 1))),
    silo: Math.min(SILO_MAX, Math.max(1, Math.round(m.silo ?? 1))),
    refinery: Math.min(REFINERY_MAX, Math.max(1, Math.round(m.refinery ?? 1))),
    ores: m.ores ?? {},
    bars: m.bars ?? {},
    drills: m.drills ?? {},
    job: m.job ?? null,
    lastTick: m.lastTick ?? Date.now(),
  };
}

export function storedTotal(m: MiningState): number {
  return Object.values(m.ores).reduce((a, b) => a + b, 0);
}

/** Produção somada de todas as perfuratrizes, em minérios por minuto. */
export function totalDrillRate(m: MiningState): number {
  let sum = 0;
  for (const d of DEPTHS) {
    if (d.level > m.depth) break;
    sum += drillRate(d.level, m.drills[String(d.level)] ?? 0);
  }
  return +sum.toFixed(2);
}

/**
 * Produção acumulada desde `m.lastTick` (inclusive offline, com teto de 8h).
 * Devolve os minérios ganhos já limitados pela capacidade do silo.
 */
export function collectProduction(
  m: MiningState,
  now: number,
): { ores: Record<string, number>; gained: number; ms: number } {
  const ms = Math.min(OFFLINE_CAP_MS, Math.max(0, now - m.lastTick));
  const minutes = ms / 60000;
  const room = Math.max(0, siloCapacity(m.silo) - storedTotal(m));
  const out: Record<string, number> = {};
  let gained = 0;
  if (minutes <= 0 || room <= 0) return { ores: out, gained: 0, ms };

  for (const d of DEPTHS) {
    if (d.level > m.depth) break;
    const lvl = m.drills[String(d.level)] ?? 0;
    if (lvl <= 0) continue;
    const amount = drillRate(d.level, lvl) * minutes;
    if (amount < 1) continue;
    // reparte a produção da camada entre os minérios dela, do comum ao raro
    const ws = d.ores.map((_, i) => WEIGHTS[i] ?? 6);
    const total = ws.reduce((a, b) => a + b, 0);
    d.ores.forEach((ore, i) => {
      const q = Math.floor((amount * ws[i]) / total);
      if (q > 0) {
        out[ore] = (out[ore] ?? 0) + q;
        gained += q;
      }
    });
  }

  if (gained > room) {
    // corta proporcionalmente para caber no silo
    const scale = room / gained;
    let left = room;
    for (const k of Object.keys(out)) {
      const q = Math.min(left, Math.floor(out[k] * scale));
      out[k] = q;
      left -= q;
    }
    gained = room - left;
  }
  return { ores: out, gained, ms };
}

export function sellValue(m: MiningState): number {
  let gold = 0;
  for (const [id, q] of Object.entries(m.ores)) gold += (ORE_MAP[id]?.value ?? 0) * q;
  for (const [id, q] of Object.entries(m.bars)) gold += barValue(id) * q;
  return gold;
}

export function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
