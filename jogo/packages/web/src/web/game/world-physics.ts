/* ---------------------------------------------------------------------------
 * Fisica de plataforma do Mundo dos Torneios.
 * Compartilhada entre o jogo (world-map.tsx) e o verificador de rotas
 * (assets/verify_routes.ts), para que a validacao use exatamente as mesmas
 * regras de salto, gravidade e colisao do jogador real.
 * ------------------------------------------------------------------------- */

import { AIR, PLAT, T, WW } from "./world";

export const GRAVITY = 2400;
export const JUMP_V = 820;
export const MAX_FALL = 1400;
export const WALK = 200;
export const RUN = 360;
export const ACCEL = 2400;
export const FRICTION = 2800;
export const COYOTE = 0.1;
export const BUFFER = 0.13;
/** Jogador do Coliseu ocupa exatamente 1 bloco (tile T=32). */
export const HALF_W = 15;
export const BODY_H = 32;
export const LIFT_V = 580;

export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: 1 | -1;
  onGround: boolean;
  coyote: number;
  jumps: number;
  dropT: number;
}

export interface Control {
  /** -1..1: teclado (+-1) ou joystick proporcional. */
  amount: number;
  /** velocidade maxima para este quadro. */
  maxSp: number;
  down: boolean;
  jumpHeld: boolean;
  /** buffer de pulo (s); consumido pelo passo. */
  jumpBuf: number;
  /** dentro de uma corrente ascendente (torre / poco). */
  lift?: boolean;
}

export interface StepResult {
  jumped: 0 | 1 | 2;
  landed: boolean;
  /** velocidade vertical no momento do pouso. */
  impact: number;
}

export type TileFn = (tx: number, ty: number) => number;

export function stepBody(P: Body, c: Control, dt: number, tile: TileFn): StepResult {
  const solidAt = (px: number, py: number) => {
    const v = tile(Math.floor(px / T), Math.floor(py / T));
    return v !== AIR && v !== PLAT;
  };
  const res: StepResult = { jumped: 0, landed: false, impact: 0 };
  const dir = Math.sign(c.amount);
  if (dir !== 0) {
    P.vx += dir * ACCEL * dt * (P.onGround ? 1 : 0.7);
    P.vx = Math.max(-c.maxSp, Math.min(c.maxSp, P.vx));
    P.face = dir as 1 | -1;
  } else {
    const f = FRICTION * dt * (P.onGround ? 1 : 0.3);
    P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f;
  }
  c.jumpBuf = Math.max(0, c.jumpBuf - dt);
  P.coyote = P.onGround ? COYOTE : Math.max(0, P.coyote - dt);
  P.dropT = Math.max(0, P.dropT - dt);
  if (c.down && P.onGround && c.jumpBuf > 0) {
    // Baixo + pulo atravessa so a plataforma atual; no chao solido vira pulo normal.
    const under = tile(Math.floor(P.x / T), Math.floor(P.y / T));
    if (under === PLAT) {
      P.dropT = 0.3;
      P.y += 2;
      P.onGround = false;
      c.jumpBuf = 0;
    }
  }
  if (c.jumpBuf > 0 && (P.coyote > 0 || P.jumps < 2)) {
    const dbl = P.coyote <= 0;
    P.vy = -JUMP_V * (dbl ? 0.85 : 1);
    P.jumps = dbl ? 2 : 1;
    P.coyote = 0;
    P.onGround = false;
    c.jumpBuf = 0;
    res.jumped = dbl ? 2 : 1;
  }
  if (!c.jumpHeld && P.vy < 0) P.vy += JUMP_V * 2.4 * dt;
  P.vy = Math.min(MAX_FALL, P.vy + GRAVITY * dt);
  // Corrente ascendente: segurar pulo dentro da coluna sobe a ~18 tiles/s.
  if (c.lift && c.jumpHeld) P.vy = Math.max(-LIFT_V, P.vy - (GRAVITY + 3600) * dt);

  // eixo X
  let nx = P.x + P.vx * dt;
  const top = P.y - BODY_H + 4;
  const side = nx + Math.sign(P.vx || 1) * HALF_W;
  if (P.vx !== 0 && (solidAt(side, top) || solidAt(side, P.y - T / 2) || solidAt(side, P.y - 2))) {
    // degrau automatico de 1 tile
    if (P.onGround && !solidAt(side, P.y - T - 2) && !solidAt(side, top - T)) {
      P.y = Math.floor((P.y - 2) / T) * T;
    } else {
      nx = P.vx > 0 ? Math.floor(side / T) * T - HALF_W - 0.01 : Math.floor(side / T) * T + T + HALF_W + 0.01;
      P.vx = 0;
    }
  }
  P.x = Math.max(4 * T, Math.min((WW - 4) * T, nx));

  // eixo Y
  const prevY = P.y;
  let ny = P.y + P.vy * dt;
  let grounded = false;
  if (P.vy >= 0) {
    const ty0 = Math.floor(prevY / T);
    const ty1 = Math.floor(ny / T);
    for (let ty = ty0; ty <= ty1 && !grounded; ty++) {
      for (const ox of [-HALF_W + 2, 0, HALF_W - 2]) {
        const v = tile(Math.floor((P.x + ox) / T), ty);
        const yTop = ty * T;
        if (v === AIR) continue;
        if (v === PLAT && (P.dropT > 0 || prevY > yTop + 1)) continue;
        if (ny >= yTop && prevY <= yTop + 1) {
          ny = yTop;
          grounded = true;
          break;
        }
      }
    }
  } else {
    const hy = ny - BODY_H;
    if (solidAt(P.x - HALF_W + 2, hy) || solidAt(P.x + HALF_W - 2, hy)) {
      ny = Math.floor(hy / T) * T + T + BODY_H;
      P.vy = 0;
    }
  }
  P.y = Math.max(BODY_H + 2, ny);
  if (grounded) {
    res.landed = !P.onGround;
    res.impact = P.vy;
    P.vy = 0;
    P.jumps = 0;
  }
  P.onGround = grounded;
  return res;
}
