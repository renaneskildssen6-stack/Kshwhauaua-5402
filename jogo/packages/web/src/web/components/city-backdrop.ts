/* Fundo animado da cidade (hub).
 * - Ceu com 50 quadros (folha /city/sky_anim.webp, 5x10 de 480x270), preso a tela:
 *   sempre cobre a tela inteira, entao nunca "acaba" quando a camera sobe.
 * - Trafego aereo em parallax: dirigiveis, cargueiros, trem aereo, porta-mechas,
 *   carros voadores, taxis, caminhoes, drones e caças, em varias profundidades.
 * Tudo deterministico (depende so de t e da camera) e sem alocacao por quadro. */

export const SKY_SHEET = "/city/sky_anim.webp";
export const TRAFFIC_ATLAS = "/city/traffic.png";
export const SKY_FRAMES = 50;
const SKY_COLS = 5;
const SKY_FW = 480;
const SKY_FH = 270;
const SKY_FPS = 10;

type Sprite = { x: number; y: number; w: number; h: number; right: boolean };
/** recortes do atlas gerado por scripts/build-city-backdrop.py (2x o tamanho base). */
const ATLAS: Record<string, Sprite> = {
  carrier: { x: 0, y: 0, w: 560, h: 299, right: true },
  blimp: { x: 562, y: 0, w: 480, h: 232, right: true },
  cargo: { x: 0, y: 301, w: 500, h: 208, right: false },
  train: { x: 502, y: 301, w: 540, h: 170, right: true },
  truck: { x: 0, y: 511, w: 280, h: 158, right: true },
  jets: { x: 282, y: 511, w: 170, h: 120, right: true },
  drone: { x: 454, y: 511, w: 104, h: 108, right: true },
  taxi: { x: 560, y: 511, w: 196, h: 89, right: true },
  car: { x: 758, y: 511, w: 200, h: 84, right: true },
};

export type TrafficSlot = "far" | "mid" | "near";

type Mover = {
  sprite: keyof typeof ATLAS;
  slot: TrafficSlot;
  /** 0 = colado ao ceu, 1 = colado ao mundo (horizontal e vertical). */
  depth: number;
  /** altura na tela (fracao de h) com a camera no chao. */
  alt: number;
  /** escala relativa ao tamanho base (base = metade do atlas, para h=800). */
  scale: number;
  /** px/s no espaco da camada; sinal = direcao. */
  v: number;
  x0: number;
  alpha: number;
  bob: number;
  trail?: string;
  blink?: boolean;
};

const MOVERS: Mover[] = [
  // ao fundo: naves grandes e lentas
  { sprite: "blimp", slot: "far", depth: 0.08, alt: 0.12, scale: 0.55, v: 9, x0: 200, alpha: 0.78, bob: 3, blink: true },
  { sprite: "cargo", slot: "far", depth: 0.1, alt: 0.22, scale: 0.5, v: -13, x0: 1500, alpha: 0.7, bob: 2, blink: true },
  { sprite: "carrier", slot: "far", depth: 0.06, alt: 0.05, scale: 0.42, v: 5, x0: 2300, alpha: 0.62, bob: 1.5, blink: true },
  { sprite: "train", slot: "far", depth: 0.14, alt: 0.3, scale: 0.42, v: -46, x0: 900, alpha: 0.72, bob: 0, trail: "rgba(53,226,240,0.5)" },
  { sprite: "jets", slot: "far", depth: 0.18, alt: 0.08, scale: 0.4, v: 210, x0: 600, alpha: 0.8, bob: 0, trail: "rgba(120,180,255,0.55)" },
  // meio: faixas de transito entre o skyline e a cidade proxima
  { sprite: "car", slot: "mid", depth: 0.32, alt: 0.34, scale: 0.42, v: 95, x0: 100, alpha: 0.85, bob: 1.5, trail: "rgba(53,226,240,0.45)" },
  { sprite: "taxi", slot: "mid", depth: 0.32, alt: 0.36, scale: 0.42, v: 80, x0: 1300, alpha: 0.85, bob: 1.5, trail: "rgba(255,200,80,0.4)" },
  { sprite: "truck", slot: "mid", depth: 0.36, alt: 0.41, scale: 0.42, v: -62, x0: 700, alpha: 0.85, bob: 1, trail: "rgba(255,150,60,0.35)" },
  { sprite: "car", slot: "mid", depth: 0.36, alt: 0.42, scale: 0.4, v: -110, x0: 2000, alpha: 0.85, bob: 1.5, trail: "rgba(255,95,208,0.45)" },
  { sprite: "taxi", slot: "mid", depth: 0.4, alt: 0.3, scale: 0.46, v: -88, x0: 400, alpha: 0.9, bob: 1.5, trail: "rgba(255,200,80,0.4)" },
  // perto: drones e carros maiores na frente da cidade proxima
  { sprite: "car", slot: "near", depth: 0.55, alt: 0.24, scale: 0.6, v: 150, x0: 1700, alpha: 1, bob: 2, trail: "rgba(53,226,240,0.55)" },
  { sprite: "drone", slot: "near", depth: 0.6, alt: 0.2, scale: 0.55, v: 34, x0: 300, alpha: 1, bob: 6 },
  { sprite: "drone", slot: "near", depth: 0.62, alt: 0.28, scale: 0.5, v: -28, x0: 1200, alpha: 1, bob: 5 },
  { sprite: "truck", slot: "near", depth: 0.58, alt: 0.16, scale: 0.55, v: -95, x0: 2400, alpha: 1, bob: 1.5, trail: "rgba(255,150,60,0.45)" },
];

/** periodo horizontal (em px de camada) apos o qual cada objeto reaparece. */
const SPAN_MIN = 2800;

export type BackdropCam = {
  w: number;
  h: number;
  cx: number;
  cy: number;
  /** cy com a camera no chao e no topo do mundo. */
  cyGround: number;
  cyTop: number;
  t: number;
  still: boolean;
};

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** fracao 0..1 do quanto a camera subiu. */
export const climbOf = (c: BackdropCam) =>
  c.cyGround <= c.cyTop ? 0 : Math.max(0, Math.min(1, (c.cyGround - c.cy) / (c.cyGround - c.cyTop)));

/** Ceu: cobre sempre [0,h]. Sobe a camera -> o ceu desce de leve (parallax vertical travado). */
export function drawSky(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement | undefined, c: BackdropCam) {
  const { w, h } = c;
  // base de seguranca, com a mesma cor do topo da folha
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#0b0d3a");
  g.addColorStop(0.6, "#1a1c63");
  g.addColorStop(1, "#3b1d7a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (!sheet?.complete || !sheet.naturalWidth) return;

  const extra = 0.22;
  const dh = Math.ceil(h * (1 + extra));
  const dw = Math.ceil(dh * (SKY_FW / SKY_FH));
  const y = Math.round(-h * extra * (1 - climbOf(c)));
  const f = c.still ? 0 : Math.floor(c.t * SKY_FPS) % SKY_FRAMES;
  const sx = (f % SKY_COLS) * SKY_FW;
  const sy = Math.floor(f / SKY_COLS) * SKY_FH;
  const off = -mod(c.cx * 0.03, dw * 2);
  // ladrilhos espelhados alternados: sem emenda visivel
  for (let i = 0, x = off; x < w; i++, x += dw) {
    if (x + dw < 0) continue;
    if (i % 2 === 0) {
      ctx.drawImage(sheet, sx, sy, SKY_FW, SKY_FH, x, y, dw, dh);
    } else {
      ctx.save();
      ctx.translate(x + dw, y);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, sx, sy, SKY_FW, SKY_FH, 0, 0, dw, dh);
      ctx.restore();
    }
  }
}

/** Desenha os objetos de uma faixa de profundidade. */
export function drawTraffic(
  ctx: CanvasRenderingContext2D,
  atlas: HTMLImageElement | undefined,
  slot: TrafficSlot,
  c: BackdropCam,
) {
  if (!atlas?.complete || !atlas.naturalWidth) return;
  const { w, h } = c;
  const unit = Math.max(0.55, Math.min(1.4, h / 800));
  const span = Math.max(SPAN_MIN, w + 1400);
  const lift = c.cyGround - c.cy; // > 0 quando subiu
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = true;
  for (const m of MOVERS) {
    if (m.slot !== slot) continue;
    const sp = ATLAS[m.sprite];
    const dw = (sp.w / 2) * m.scale * unit;
    const dh = (sp.h / 2) * m.scale * unit;
    const t = c.still ? 0 : c.t;
    const sx = mod(m.x0 + m.v * t - c.cx * m.depth, span) - 600;
    if (sx > w + 20 || sx + dw < -20) continue;
    const fy = 0.25 + 0.75 * m.depth;
    const bob = m.bob ? Math.sin(t * 1.7 + m.x0) * m.bob * unit : 0;
    const sy = h * m.alt + lift * fy + bob;
    if (sy > h + 20 || sy + dh < -20) continue;
    const goingRight = m.v >= 0;
    const flip = goingRight !== sp.right;
    // rastro de luz atras do veiculo
    if (m.trail && !c.still) {
      const len = Math.min(220, Math.abs(m.v) * 0.9) * unit;
      const ty = sy + dh * 0.62;
      const tx0 = goingRight ? sx + dw * 0.08 : sx + dw * 0.92;
      const tx1 = goingRight ? tx0 - len : tx0 + len;
      const gr = ctx.createLinearGradient(tx0, 0, tx1, 0);
      gr.addColorStop(0, m.trail);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = m.alpha;
      ctx.fillStyle = gr;
      ctx.fillRect(Math.min(tx0, tx1), ty, len, Math.max(1.5, 2 * unit * m.scale * 2));
    }
    ctx.globalAlpha = m.alpha;
    if (flip) {
      ctx.save();
      ctx.translate(sx + dw, sy);
      ctx.scale(-1, 1);
      ctx.drawImage(atlas, sp.x, sp.y, sp.w, sp.h, 0, 0, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(atlas, sp.x, sp.y, sp.w, sp.h, sx, sy, dw, dh);
    }
    // luzes de navegacao piscando
    if (m.blink && !c.still) {
      const on = Math.sin(t * 4 + m.x0) > 0.55;
      if (on) {
        const s = Math.max(2, 3 * unit * m.scale * 2);
        ctx.fillStyle = "#ff4a5a";
        ctx.fillRect(sx + dw * 0.04, sy + dh * 0.45, s, s);
        ctx.fillStyle = "#4affb4";
        ctx.fillRect(sx + dw * 0.94, sy + dh * 0.45, s, s);
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = prevSmooth;
}

/** Holofotes varrendo o ceu a partir da cidade (atras do skyline). */
export function drawSearchlights(ctx: CanvasRenderingContext2D, c: BackdropCam, groundScreenY: number) {
  if (c.still) return;
  const { w, h } = c;
  const baseY = groundScreenY - h * 0.18;
  if (baseY < 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const beams = [
    { x: 0.22, ph: 0, sp: 0.35, col: "rgba(53,226,240,0.10)" },
    { x: 0.71, ph: 2.1, sp: 0.28, col: "rgba(255,95,208,0.08)" },
  ];
  for (const b of beams) {
    const bx = mod(w * b.x - c.cx * 0.2, w + 400) - 200;
    const ang = Math.sin(c.t * b.sp + b.ph) * 0.45;
    const len = h * 1.2;
    const half = 0.07;
    const x1 = bx + Math.sin(ang - half) * len;
    const y1 = baseY - Math.cos(ang - half) * len;
    const x2 = bx + Math.sin(ang + half) * len;
    const y2 = baseY - Math.cos(ang + half) * len;
    const gr = ctx.createLinearGradient(bx, baseY, (x1 + x2) / 2, (y1 + y2) / 2);
    gr.addColorStop(0, b.col);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(bx, baseY);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
