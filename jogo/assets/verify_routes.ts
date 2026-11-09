/* Verifica, com a fisica real do jogador (world-physics.ts), todas as rotas do mundo G5:
 *  - travessia da superficie inteira (28.600 tiles) andando para a direita;
 *  - subida ao ceu em cada uma das 205 regioes (escada externa, salto a salto);
 *  - descida ate as galerias profundas e subida de volta (zigue-zague);
 *  - acesso a cada porta de torneio (superficie, camara subterranea, ilha celeste);
 *  - corrente ascendente (segurar pulo) na torre e no poco.
 * Uso: bun assets/verify_routes.ts            (todas as regioes)
 *      bun assets/verify_routes.ts 0 10       (regioes 0..9)                     */
import { PLAT, T, WW, getWorld, liftAt, routeFor, tileAt, type Region } from "../packages/web/src/web/game/world";
import { BUFFER, RUN, stepBody, type Body } from "../packages/web/src/web/game/world-physics";

const w = getWorld();
const tile = (x: number, y: number) => tileAt(w, x, y);
const DT = 1 / 60;
type Pt = { x: number; y: number };

function body(p: Pt): Body {
  return { x: p.x * T + 16, y: p.y * T, vx: 0, vy: 0, face: 1, onGround: true, coyote: 0.1, jumps: 0, dropT: 0 };
}
type Act = { kind: "jump" | "drop" | "walk"; hold: number; dbl: boolean; delay: number };
const ACTS: Act[] = [{ kind: "walk", hold: 0, dbl: false, delay: 0 }, { kind: "drop", hold: 0, dbl: false, delay: 0 }];
for (const hold of [0.4, 0.2, 0.12]) for (const dbl of [false, true]) for (const delay of [0, 0.12]) ACTS.push({ kind: "jump", hold, dbl, delay });

/** Tenta ir de `a` ate ficar de pe na linha `b.y`, a <= tol tiles de `b.x`. */
function hop(a: Pt | Body, b: Pt, tol = 2.6, maxT = 7): Body | null {
  for (const act of ACTS) {
    const P: Body = "vx" in a ? { ...a } : body(a);
    const startRow = Math.round(P.y / T);
    const c = { amount: 0, maxSp: RUN, down: act.kind === "drop", jumpHeld: act.kind === "jump", jumpBuf: act.kind === "walk" ? 0 : BUFFER, lift: false };
    let t = 0, idle = 0, second = false;
    while (t < maxT) {
      t += DT;
      if (act.kind === "jump" && t > act.hold) c.jumpHeld = false;
      if (act.dbl && !second && act.kind === "jump" && P.vy >= -60 && t > 0.1) { second = true; c.jumpBuf = BUFFER; c.jumpHeld = true; }
      if (second && t > act.hold + 0.45) c.jumpHeld = false;
      if (t > 0.05) c.down = false;
      const dx = (b.x * T + 16 - P.x) / 24;
      c.amount = t < act.delay ? 0 : Math.max(-1, Math.min(1, dx));
      if (Math.abs(c.amount) < 0.05) c.amount = 0;
      c.maxSp = RUN * Math.max(0.25, Math.abs(c.amount));
      stepBody(P, c, DT, tile);
      if (P.onGround && t > 0.06) {
        const row = Math.round(P.y / T);
        if (row === b.y && Math.abs(P.x / T - 0.5 - b.x) <= tol) return P;
        if (row !== b.y || Math.abs(P.vx) < 1) idle += DT;
        if (idle > 0.5 && (row === startRow || row !== b.y)) break;
      } else idle = 0;
    }
  }
  return null;
}

function walkRoute(pts: Pt[]): string | null {
  let P: Body | null = null;
  for (let i = 1; i < pts.length; i++) {
    const from: Pt | Body = P ?? pts[i - 1];
    // A hop may legitimately overshoot a 1-2 tile step and land on the next rung.
    P = hop(from, pts[i]);
    if (!P && i + 1 < pts.length && (P = hop(from, pts[i + 1]))) i++;
    if (!P) return `salto ${pts[i - 1].x},${pts[i - 1].y} -> ${pts[i].x},${pts[i].y}`;
  }
  return null;
}

function lift(r: Region, kind: "sky" | "deep"): string | null {
  const x = kind === "sky" ? r.skyX : r.shaftX;
  const P = body({ x, y: kind === "sky" ? w.surf[x] : 2160 });
  const goal = kind === "sky" ? 100 : w.surf[x] + 1;
  const c = { amount: 0, maxSp: RUN, down: false, jumpHeld: true, jumpBuf: BUFFER, lift: true };
  for (let t = 0; t < 400; t += DT) {
    c.lift = liftAt(w, Math.floor(P.x / T), Math.floor((P.y - 28) / T));
    c.amount = Math.max(-1, Math.min(1, (x * T + 16 - P.x) / 24));
    stepBody(P, c, DT, tile);
    if (P.y / T <= goal) return null;
  }
  return `corrente parou em y=${Math.round(P.y / T)}`;
}

function surfaceWalk(): string | null {
  const P = body({ x: 6, y: w.surf[6] });
  const c = { amount: 1, maxSp: RUN, down: false, jumpHeld: false, jumpBuf: 0 };
  let best = P.x, stuck = 0, held = 0;
  for (let t = 0; P.x < (WW - 6) * T; t += DT) {
    if (P.onGround && Math.abs(P.vx) < 5 && held <= 0) { c.jumpBuf = BUFFER; c.jumpHeld = true; held = 0.35; }
    held -= DT;
    if (held <= 0) c.jumpHeld = false;
    stepBody(P, c, DT, tile);
    if (Math.round(P.y / T) > w.surf[Math.floor(P.x / T)] + 3) return `caiu do caminho em x=${Math.floor(P.x / T)}`;
    if (P.x > best + 1) { best = P.x; stuck = 0; } else if ((stuck += DT) > 5) return `travou em x=${Math.floor(P.x / T)}`;
  }
  return null;
}

const from = Number(process.argv[2] ?? 0), to = Number(process.argv[3] ?? w.regions.length);
const fails: string[] = [];
const t0 = performance.now();
if (from === 0) { const e = surfaceWalk(); if (e) fails.push(`superficie: ${e}`); }
let hops = 0;
for (const r of w.regions.slice(from, to)) {
  const sky = routeFor(w, r, "sky"), deep = routeFor(w, r, "deep"), climb = routeFor(w, r, "climb");
  hops += sky.length + deep.length + climb.length;
  for (const [name, pts] of [["ceu", sky], ["descida", deep], ["subida", climb]] as const) {
    const e = walkRoute(pts);
    if (e) fails.push(`${r.index} ${r.id} ${name}: ${e}`);
  }
  const s = r.site;
  if (s.kind === "sky") {
    if (!hop({ x: r.skyX + 6, y: s.ty }, { x: s.tx, y: s.ty }, 1)) fails.push(`${r.index} porta celeste`);
  } else if (s.kind === "cave") {
    const near = climb.filter((p) => p.y >= s.ty && p.y <= s.ty + 6);
    if (!near.some((p) => { const q = hop(p, { x: r.shaftX - 3, y: s.ty }); return !!q && !!hop(q, { x: s.tx, y: s.ty }, 1); })) fails.push(`${r.index} porta subterranea y=${s.ty}`);
  } else if (tile(s.tx, s.ty) !== PLAT && w.surf[s.tx] !== s.ty) fails.push(`${r.index} porta de superficie fora do chao`);
  for (const k of ["sky", "deep"] as const) { const e = lift(r, k); if (e) fails.push(`${r.index} corrente ${k}: ${e}`); }
}
console.log(JSON.stringify({ regions: to - from, hops, chunksGenerated: w.generated, ms: Math.round(performance.now() - t0), fails: fails.length }));
for (const f of fails.slice(0, 40)) console.log("FALHA", f);
process.exit(fails.length ? 1 : 0);
