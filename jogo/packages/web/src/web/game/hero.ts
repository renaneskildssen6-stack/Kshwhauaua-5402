import { faceUrl, spriteUrl } from "./robots";
/* ---------------------------------------------------------------------------
 * Fase C — sprites de exploracao por acao.
 *
 * Todo robo do jogo usa o mesmo padrao de sprite sheet: uma tira de
 * 2048x128 com 16 quadros de 128px (grade 4x4 achatada):
 *   quadros  0-3  -> ocioso
 *   quadros  4-7  -> ataque
 *   quadros  8-11 -> dano / guarda
 *   quadros 12-15 -> teleporte (usado para pulo, queda e interacao)
 *
 * Isso deixa QUALQUER um dos 220 robos jogavel no hub, sem arte extra.
 * ------------------------------------------------------------------------- */

export const HERO_FRAME = 128;
export const HERO_FRAMES = 16;

export type HeroClip =
  | "idle"
  | "walk"
  | "run"
  | "jump"
  | "fall"
  | "land"
  | "attack"
  | "interact"
  | "hurt";

export type ClipDef = {
  /** indices de quadro na tira. */
  frames: number[];
  /** quadros por segundo. */
  fps: number;
  /** false = congela no ultimo quadro em vez de repetir. */
  loop: boolean;
  /** deslocamento vertical senoidal (px) aplicado ao desenhar. */
  bob: number;
  /** inclinacao em radianos aplicada ao sprite. */
  tilt: number;
  /** escala extra do sprite. */
  scale: number;
};

export const HERO_CLIPS: Record<HeroClip, ClipDef> = {
  idle: { frames: [0, 1, 2, 3], fps: 5, loop: true, bob: 1.5, tilt: 0, scale: 1 },
  walk: { frames: [0, 1, 2, 3], fps: 9, loop: true, bob: 3.5, tilt: 0.03, scale: 1 },
  run: { frames: [0, 1, 2, 3], fps: 15, loop: true, bob: 5.5, tilt: 0.1, scale: 1.02 },
  jump: { frames: [12, 13], fps: 9, loop: false, bob: 0, tilt: -0.06, scale: 1.04 },
  fall: { frames: [14, 15], fps: 8, loop: false, bob: 0, tilt: 0.06, scale: 0.98 },
  land: { frames: [8], fps: 10, loop: false, bob: 0, tilt: 0, scale: 1 },
  attack: { frames: [4, 5, 6, 7], fps: 14, loop: false, bob: 0, tilt: 0, scale: 1.05 },
  interact: { frames: [12, 13, 14, 15], fps: 12, loop: false, bob: 0, tilt: 0, scale: 1 },
  hurt: { frames: [8, 9, 10, 11], fps: 10, loop: false, bob: 0, tilt: -0.08, scale: 0.98 },
};

/** duracao total de um clipe em ms. */
export function clipMs(c: HeroClip): number {
  const d = HERO_CLIPS[c];
  return (d.frames.length / d.fps) * 1000;
}

/** quadro atual do clipe a partir do tempo decorrido (segundos). */
export function clipFrame(c: HeroClip, elapsed: number): number {
  const d = HERO_CLIPS[c];
  const i = Math.floor(elapsed * d.fps);
  const idx = d.loop ? i % d.frames.length : Math.min(i, d.frames.length - 1);
  return d.frames[idx];
}

/** tira de exploracao do robo (desenhada a mao ou composta em runtime). */
export function heroSheet(robotId: string): string {
  return spriteUrl(robotId);
}

/** retrato 64x64 do robo. */
export function heroFace(robotId: string): string {
  return faceUrl(robotId);
}
