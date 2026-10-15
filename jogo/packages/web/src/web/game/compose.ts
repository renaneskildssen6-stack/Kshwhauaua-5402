/* ---------------------------------------------------------------------------
 * Compositor de sprites modulares.
 * Monta, em canvas offscreen, a mesma tira canonica usada pelos 220 robos
 * desenhados a mao: 2048x128 = 16 quadros de 128px.
 *   quadros 0-3   idle
 *   quadros 4-7   ataque
 *   quadros 8-11  dano / guarda
 *   quadros 12-15 teleporte
 * O resultado vira um data URL cacheado por id, entao cada robo e composto
 * uma unica vez por sessao.
 * ------------------------------------------------------------------------- */

import { ALL_PARTS, partsFor, type PartSet } from "./parts";

export const FRAME = 128;
export const FRAMES = 16;
const GROUND = 124;

const EMPTY =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

const imgs = new Map<string, HTMLImageElement>();
let ready = false;
let loading: Promise<void> | null = null;

export function partLoadFailures():string[] {return ALL_PARTS.filter(src=>!imgs.has(src));}

function load(src: string): Promise<void> {
  return new Promise((resolve) => {
    if(imgs.has(src)){resolve();return;}
    const img = new Image();
    const timer=window.setTimeout(()=>{img.onload=null;img.onerror=null;img.src="";resolve();},12000);
    img.onload = () => {
      clearTimeout(timer);
      imgs.set(src, img);
      resolve();
    };
    img.onerror = () => {clearTimeout(timer);resolve();};
    img.src = src;
  });
}

/** Pre-carrega as 56 pecas. Chamado pela tela de carregamento. */
export function preloadParts(): Promise<void> {
  if (loading) return loading;
  loading = Promise.all(partLoadFailures().map(load)).then(() => {
    ready = true;
    stripCache.clear();faceCache.clear();
    loading = null;
  });
  return loading;
}

export function partsReady(): boolean {
  return ready;
}

/* Conjuntos de pecas definidos pelo jogador (laboratorio, Fase F).
 * Quando um id tem set customizado, ele tem prioridade sobre o set
 * deterministico gerado por partsFor(). */
const customSets = new Map<string, PartSet>();

export function setCustomSet(id: string, set: PartSet): void {
  customSets.set(id, set);
  stripCache.delete(id);
  faceCache.delete(id);
}

export function clearCustomSet(id: string): void {
  customSets.delete(id);
  stripCache.delete(id);
  faceCache.delete(id);
}

function setFor(id: string): PartSet {
  return customSets.get(id) ?? partsFor(id);
}

interface Pose {
  dx: number;
  dy: number;
  lean: number; // graus
  arm: number; // graus
  alpha: number;
  flash: number; // 0..1 clarao branco
  hit: number; // 0..1 tinta vermelha
}

const P = (
  dx: number,
  dy: number,
  lean: number,
  arm: number,
  alpha = 1,
  flash = 0,
  hit = 0,
): Pose => ({ dx, dy, lean, arm, alpha, flash, hit });

const POSES: Pose[] = [
  // idle
  P(0, 0, 0, 2),
  P(0, -1, 1, 5),
  P(0, -2, 0, 8),
  P(0, -1, -1, 4),
  // ataque
  P(2, -1, -2, -14),
  P(6, -2, -5, -30),
  P(10, 0, 4, 24, 1, 0.3),
  P(4, 1, 2, 8),
  // dano / guarda
  P(-4, -1, -5, 14, 1, 0, 0.5),
  P(-6, 1, -7, 18, 1, 0, 0.3),
  P(-3, 0, -3, 26),
  P(-1, 0, -1, 30),
  // teleporte
  P(0, -7, 0, 10, 0.22, 0.6),
  P(0, -5, 0, 8, 0.45, 0.4),
  P(0, -3, 0, 5, 0.7, 0.2),
  P(0, 0, 0, 2, 1, 0),
];

function drawPart(
  ctx: CanvasRenderingContext2D,
  src: string,
  cx: number,
  bottom: number,
  s: number,
  rot = 0,
  pivot = 0,
) {
  const img = imgs.get(src);
  if (!img || !img.naturalWidth) return;
  const w = Math.max(1, Math.round(img.naturalWidth * s));
  const h = Math.max(1, Math.round(img.naturalHeight * s));
  if (rot) {
    ctx.save();
    ctx.translate(cx, bottom - h * pivot);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.drawImage(img, -w / 2, -h * (1 - pivot), w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, Math.round(cx - w / 2), Math.round(bottom - h), w, h);
  }
}

function partW(src: string, s: number): number {
  const img = imgs.get(src);
  return img ? Math.round(img.naturalWidth * s) : 0;
}

function partH(src: string, s: number): number {
  const img = imgs.get(src);
  return img ? Math.round(img.naturalHeight * s) : 0;
}

function drawBody(ctx: CanvasRenderingContext2D, p: PartSet, pose: Pose) {
  const s = p.scale;
  const cx = 64 + pose.dx;
  const legH = partH(p.leg, s);
  const torsoH = partH(p.torso, s);
  const headH = partH(p.head, s);
  const torsoW = partW(p.torso, s);
  const legTop = GROUND - legH + pose.dy;
  const torsoBottom = legTop + Math.round(legH * 0.3);
  const torsoTop = torsoBottom - torsoH;
  const headBottom = torsoTop + Math.round(headH * 0.22);
  const shoulder = torsoTop + Math.round(torsoH * 0.24);

  ctx.save();
  ctx.globalAlpha = pose.alpha;
  // leve inclinacao do corpo inteiro
  if (pose.lean) {
    ctx.translate(cx, GROUND);
    ctx.rotate((pose.lean * Math.PI) / 180);
    ctx.translate(-cx, -GROUND);
  }

  const armH = partH(p.arm, s);
  const shoulderX = Math.round(torsoW * 0.42);
  if (p.deco) drawPart(ctx, p.deco, cx - shoulderX, torsoBottom - Math.round(torsoH * 0.15), s * 0.78);
  // braco de tras
  drawPart(ctx, p.arm, cx - shoulderX, shoulder + armH, s * 0.88, -pose.arm * 0.35, 0.88);
  drawPart(ctx, p.leg, cx, GROUND + pose.dy, s);
  drawPart(ctx, p.torso, cx, torsoBottom, s);
  drawPart(ctx, p.head, cx, headBottom, s);
  // braco da frente
  drawPart(ctx, p.arm, cx + shoulderX, shoulder + armH, s, pose.arm, 0.88);
  ctx.restore();
}

function composeStrip(id: string): string {
  const p = setFor(id);
  const cv = document.createElement("canvas");
  cv.width = FRAME * FRAMES;
  cv.height = FRAME;
  const ctx = cv.getContext("2d");
  if (!ctx) return EMPTY;
  ctx.imageSmoothingEnabled = false;

  const cell = document.createElement("canvas");
  cell.width = FRAME;
  cell.height = FRAME;
  const cctx = cell.getContext("2d");
  if (!cctx) return EMPTY;
  cctx.imageSmoothingEnabled = false;

  for (let f = 0; f < FRAMES; f++) {
    const pose = POSES[f];
    cctx.clearRect(0, 0, FRAME, FRAME);
    drawBody(cctx, p, pose);

    // tintas por quadro (clarao de ataque / flash de dano)
    if (pose.flash || pose.hit) {
      cctx.save();
      cctx.globalCompositeOperation = "source-atop";
      cctx.fillStyle = pose.hit
        ? `rgba(255,64,64,${pose.hit})`
        : `rgba(255,255,255,${pose.flash})`;
      cctx.fillRect(0, 0, FRAME, FRAME);
      cctx.restore();
    }

    ctx.save();
    ctx.filter = `hue-rotate(${p.hue}deg) saturate(${p.sat}) brightness(${p.bright})`;
    ctx.drawImage(cell, f * FRAME, 0);
    ctx.restore();
  }

  return cv.toDataURL("image/png");
}

const stripCache = new Map<string, string>();
const faceCache = new Map<string, string>();

/** Tira de 16 quadros (2048x128) do robo modular. */
export function modularStrip(id: string): string {
  const hit = stripCache.get(id);
  if (hit) return hit;
  if (!ready || typeof document === "undefined") return EMPTY;
  const url = composeStrip(id);
  stripCache.set(id, url);
  return url;
}

/** Retrato 64x64 (cabeca + torso) do robo modular. */
export function modularFace(id: string): string {
  const hit = faceCache.get(id);
  if (hit) return hit;
  if (!ready || typeof document === "undefined") return EMPTY;
  const strip = modularStrip(id);
  const src = imgs.get(strip) ?? null;
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 64;
  const ctx = cv.getContext("2d");
  if (!ctx) return EMPTY;
  ctx.imageSmoothingEnabled = false;

  // recompoe o quadro 0 em 128x128 e recorta a metade de cima
  const cell = document.createElement("canvas");
  cell.width = FRAME;
  cell.height = FRAME;
  const cctx = cell.getContext("2d");
  if (!cctx) return EMPTY;
  cctx.imageSmoothingEnabled = false;
  const p = setFor(id);
  drawBody(cctx, p, POSES[0]);
  ctx.filter = `hue-rotate(${p.hue}deg) saturate(${p.sat}) brightness(${p.bright})`;
  // zoom no torso/cabeca: origem y 8..72 do quadro
  ctx.drawImage(cell, 24, 4, 80, 80, 0, 0, 64, 64);
  void src;
  const url = cv.toDataURL("image/png");
  faceCache.set(id, url);
  return url;
}
