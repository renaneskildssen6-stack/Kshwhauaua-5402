/* ---------------------------------------------------------------------------
 * Biblioteca modular de pecas de robo (pixel art).
 * 56 pecas em /public/parts sao combinadas em runtime para gerar milhares de
 * robos distintos sem precisar de um spritesheet por robo.
 *   16 cabecas x 16 torsos x 8 bracos x 8 pernas x 8 decos = 131.072 corpos
 *   x 12 matizes de paleta = mais de 1,5 milhao de aparencias possiveis.
 * ------------------------------------------------------------------------- */

const N = 8;
const idx = (n: number) => Array.from({ length: n }, (_, i) => i);

export const HEADS: string[] = [
  ...idx(N).map((i) => `/parts/head${i}.png`),
  ...idx(N).map((i) => `/parts/headb${i}.png`),
];
export const TORSOS: string[] = [
  ...idx(N).map((i) => `/parts/torso${i}.png`),
  ...idx(N).map((i) => `/parts/torsob${i}.png`),
];
export const ARMS: string[] = idx(N).map((i) => `/parts/arm${i}.png`);
export const LEGS: string[] = idx(N).map((i) => `/parts/leg${i}.png`);
export const DECOS: string[] = idx(N).map((i) => `/parts/deco${i}.png`);

export const ALL_PARTS: string[] = [...HEADS, ...TORSOS, ARMS, LEGS, DECOS]
  .flat()
  .filter((v, i, a) => a.indexOf(v) === i);

export interface PartSet {
  head: string;
  torso: string;
  arm: string;
  leg: string;
  deco: string | null;
  /** rotacao de matiz aplicada ao corpo inteiro, em graus */
  hue: number;
  /** saturacao extra (1 = original) */
  sat: number;
  /** brilho (1 = original) */
  bright: number;
  /** escala geral do corpo */
  scale: number;
}

/** hash estavel de string (FNV-1a 32 bits) */
export function hashId(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// matizes suaves: mantem a leitura metalica das pecas, apenas troca o tom
const HUES = [0, 0, 14, 28, 194, 208, 222, 236, 320, 336, 350, 46];

/** Escolha deterministica de pecas a partir do id do robo. */
export function partsFor(id: string): PartSet {
  const r = mulberry(hashId(id));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(r() * arr.length) % arr.length];
  return {
    head: pick(HEADS),
    torso: pick(TORSOS),
    arm: pick(ARMS),
    leg: pick(LEGS),
    deco: r() < 0.62 ? pick(DECOS) : null,
    hue: pick(HUES),
    sat: 0.94 + Math.round(r() * 4) * 0.06,
    bright: 0.92 + Math.round(r() * 4) * 0.05,
    scale: 0.78 + Math.round(r() * 4) * 0.03,
  };
}
