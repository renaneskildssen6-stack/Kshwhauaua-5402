import { SystemDock } from "./system-dock";
import { ExplorationControls } from "@/components/exploration-controls";
import { systemUnlocked } from "@/game/progression";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Screen } from "@/screens/menu";
import { useGate } from "@/components/gate";
import { HERO_CLIPS, HERO_FRAME, clipFrame, heroFace, heroSheet, type HeroClip } from "@/game/hero";
import { ROBOT_MAP } from "@/game/robots";
import { explorerId, setExplorer, useGame } from "@/game/save";
import { SKY_SHEET, TRAFFIC_ATLAS, drawSearchlights, drawSky, drawTraffic, type BackdropCam } from "./city-backdrop";

/* ---------------------------------------------------------------------------
 * Hub da cidade — plataforma 2D em canvas com física real.
 * Pulo com gravidade, pulo duplo, coyote time, jump buffer, corrida,
 * plataformas flutuantes (algumas móveis), núcleos de energia colecionáveis,
 * partículas, parallax em 3 camadas e câmera suave.
 * ------------------------------------------------------------------------- */

const WORLD_W = 8600;
const GROUND_Y = 620; // y do chão em coordenadas de mundo
const SKY_TOP = -260; // topo do mundo

const GRAVITY = 2600;
const JUMP_V = 860;
const JUMP_CUT = 0.42; // corte do pulo ao soltar o botão
const MAX_FALL = 1500;
const WALK = 165;
const RUN = 305;
const ACCEL = 2200;
const AIR_ACCEL = 1500;
const FRICTION = 2600;
const COYOTE = 0.11;
const BUFFER = 0.13;

const SPR = 112; // tamanho desenhado do robô

type Building = {
  id: Exclude<Screen, "menu">;
  label: string;
  art: string;
  x: number;
  w: number;
  h: number;
};

const BUILDINGS: Building[] = [
  { id: "roster", label: "HANGAR", art: "/city/b_hangar.png", x: 300, w: 320, h: 381 },
  { id: "shop", label: "LOJA", art: "/city/b_shop.png", x: 780, w: 300, h: 357 },
  { id: "modes", label: "ARENA", art: "/city/b_arena.png", x: 1300, w: 340, h: 405 },
  { id: "ranked", label: "TORRE RANQUEADA", art: "/city/b_ranked.png", x: 1830, w: 260, h: 429 },
  { id: "tournaments", label: "COLISEU", art: "/city/b_tourney.png", x: 2320, w: 360, h: 360 },
  { id: "engineer", label: "OFICINA DO ENGENHEIRO", art: "/city/b_engineer.png", x: 2820, w: 300, h: 372 },
  { id: "pets", label: "RANCHO DOS PETS", art: "/city/b_pets.png", x: 3320, w: 300, h: 360 },
  { id: "cards", label: "SALAO DE CARDS", art: "/city/b_cards.png", x: 3800, w: 300, h: 372 },
  { id: "mine", label: "MINA PROFUNDA", art: "/city/b_mine.png", x: 4320, w: 340, h: 372 },
  { id: "lab", label: "LABORATORIO", art: "/city/b_lab.png", x: 4840, w: 320, h: 384 },
  { id: "observatory", label: "OBSERVATORIO", art: "/city/b_observatory.png", x: 5370, w: 330, h: 380 },
  { id: "academy", label: "ACADEMIA", art: "/city/b_academy.png", x: 5890, w: 330, h: 360 },
  { id: "contracts", label: "CENTRAL DE CONTRATOS", art: "/city/b_contracts.png", x: 6410, w: 310, h: 350 },
  { id: "power", label: "USINA", art: "/city/b_power.png", x: 6930, w: 340, h: 370 },
  { id: "museum", label: "MUSEU", art: "/city/b_museum.png", x: 7470, w: 340, h: 360 },
  { id: "portal", label: "PORTAL DIMENSIONAL", art: "/city/b_portal.png", x: 8020, w: 350, h: 390 },
];

type Platform = { x: number; y: number; w: number; range?: number; speed?: number };
const PLATFORMS: Platform[] = [
  { x: 520, y: 470, w: 150 },
  { x: 700, y: 350, w: 130 },
  { x: 950, y: 430, w: 160, range: 120, speed: 0.6 },
  { x: 1150, y: 300, w: 120 },
  { x: 1480, y: 460, w: 170 },
  { x: 1660, y: 340, w: 130, range: 90, speed: 0.85 },
  { x: 1980, y: 420, w: 150 },
  { x: 2150, y: 290, w: 140 },
  { x: 2380, y: 440, w: 160 },
  { x: 380, y: 330, w: 120, range: 140, speed: 0.5 },
  { x: 2620, y: 470, w: 150 },
  { x: 2780, y: 340, w: 140, range: 110, speed: 0.7 },
  { x: 2960, y: 430, w: 130 },
  { x: 3620, y: 460, w: 150 },
  { x: 4120, y: 380, w: 140, range: 120, speed: 0.6 },
  { x: 5220, y: 440, w: 150 },
  { x: 5740, y: 360, w: 140, range: 100, speed: .6 },
  { x: 6240, y: 450, w: 140 },
  { x: 6770, y: 340, w: 140, range: 90, speed: .8 },
  { x: 7310, y: 430, w: 150 },
  { x: 7850, y: 370, w: 150, range: 80, speed: .65 },
];

type Core = { x: number; y: number; taken: number };
const CORES: Core[] = PLATFORMS.map((p) => ({ x: p.x + p.w / 2, y: p.y - 34, taken: 0 })).concat([
  { x: 640, y: GROUND_Y - 40, taken: 0 },
  { x: 1420, y: GROUND_Y - 40, taken: 0 },
  { x: 2050, y: GROUND_Y - 40, taken: 0 },
  { x: 2700, y: GROUND_Y - 40, taken: 0 },
  { x: 2980, y: GROUND_Y - 40, taken: 0 },
]);

/* ------------------------- parallax (Fase B) -------------------------
 * Camadas independentes geradas por IA. `speed` = fator de rolagem
 * (0 = fixo no fundo, 1 = colado no mundo). `anchor` = distancia do
 * chao ate a base da camada; `scale` = altura relativa a tela.        */
type Layer = {
  src: string;
  speed: number;
  scale: number;
  anchor: number;
  alpha: number;
  bob?: number;
  /** parallax vertical (1 = sobe/desce junto com o mundo). */
  fy?: number;
  /** cor da base da imagem: preenche ate o fim da tela quando a camada sobe. */
  base?: string;
};
/* O ceu nao e mais uma camada: e desenhado preso a tela (city-backdrop) e cobre
 * sempre a tela inteira. As camadas abaixo tem o topo transparente, entao subir
 * revela mais ceu em vez de uma borda reta. */
const LAYERS: Layer[] = [
  { src: "/city/pl_mountains.png", speed: 0.12, scale: 0.5, anchor: 96, alpha: 0.75, fy: 0.55, base: "#111347" },
  { src: "/city/pl_skyline.png", speed: 0.24, scale: 0.72, anchor: 70, alpha: 0.85, fy: 0.68, base: "#011043" },
  { src: "/city/pl_far_city.png", speed: 0.36, scale: 0.56, anchor: 54, alpha: 0.5, fy: 0.8, base: "#040919" },
  { src: "/city/pl_near_city.png", speed: 0.52, scale: 0.9, anchor: 30, alpha: 0.8, fy: 0.92, base: "#000307" },
  { src: "/city/pl_mid.png", speed: 0.7, scale: 0.62, anchor: 8, alpha: 0.9 },
];
/** camada desenhada na frente de tudo, colada no chao. */
const FG_LAYER: Layer = {
  src: "/city/pl_fg.png",
  speed: 1.25,
  scale: 0.075,
  anchor: -2,
  alpha: 0.92,
};

type Decor = { src: string; x: number; w: number; h: number; speed: number; flip?: boolean };
const DECOR_SRC = [
  "/city/prop_lamp.png",
  "/city/prop_sign.png",
  "/city/prop_crates.png",
  "/city/prop_vending.png",
  "/city/prop_antenna.png",
  "/city/prop_trash.png",
];
const DECOR_SIZE: Record<string, [number, number]> = {
  "/city/prop_lamp.png": [43, 96],
  "/city/prop_sign.png": [63, 104],
  "/city/prop_crates.png": [77, 84],
  "/city/prop_vending.png": [66, 92],
  "/city/prop_antenna.png": [55, 132],
  "/city/prop_trash.png": [44, 68],
};
/** decoracoes espalhadas pelo mundo: metade no plano do jogador, metade atras. */
const DECOR: Decor[] = (() => {
  const out: Decor[] = [];
  let seed = 20260831;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let x = 150; x < WORLD_W - 80; x += 118) {
    const src = DECOR_SRC[Math.floor(rnd() * DECOR_SRC.length)];
    const near = BUILDINGS.some((b) => Math.abs(b.x - x) < 90);
    if (near) continue;
    const [w, h] = DECOR_SIZE[src];
    const back = rnd() < 0.45;
    const sc = back ? 0.75 : 1;
    out.push({
      src,
      x: x + Math.round(rnd() * 40 - 20),
      w: Math.round(w * sc),
      h: Math.round(h * sc),
      speed: back ? 0.88 : 1,
      flip: rnd() < 0.35,
    });
  }
  return out;
})();

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string };

export function HubCity({ onEnter, enabled=true }: { onEnter: (s: Exclude<Screen, "menu">) => void; enabled?:boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const { transition, busy } = useGate();
  const st = useGame();
  const stateRef=useRef(st);stateRef.current=st;
  const hero = explorerId(st);
  const heroRef = useRef(hero);
  heroRef.current = hero;
  const landT = useRef(0);
  const [picker, setPicker] = useState(false);

  const [near, setNear] = useState<Building | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // entradas
  const input = useRef({ left: false, right: false, run: false, jumpHeld: false });
  // joystick analogico (controles G5): -1..1, proporcional a velocidade
  const analog = useRef({ x: 0, y: 0 });
  const specialUntil = useRef(0);
  const [cooldown, setCooldown] = useState(0);
  const jumpBuf = useRef(0);
  const actRef = useRef<{ clip: HeroClip; until: number } | null>(null);
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;
  const nearRef = useRef<Building | null>(null);
  const busyRef = useRef(busy);
  busyRef.current = busy || !enabled || picker;
  const transitionRef = useRef(transition);
  transitionRef.current = transition;

  const player = useRef({
    x: 160,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    face: 1 as 1 | -1,
    onGround: true,
    coyote: 0,
    jumps: 0,
    squash: 0,
    frame: 0,
    clip: "idle" as HeroClip,
    clipT: 0,
  });
  const cam = useRef({ x: 0, y: 0 });
  const parts = useRef<Particle[]>([]);
  const cores = useRef<Core[]>(CORES.map((c) => ({ ...c })));
  const comboT = useRef(0);

  const spawn = (x: number, y: number, n: number, c: string, up = false) => {
    for (let i = 0; i < n; i++) {
      parts.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: up ? -Math.random() * 260 : -Math.random() * 120,
        life: 0,
        max: 0.35 + Math.random() * 0.4,
        c,
      });
    }
  };

  const doSpecial = () => {
    const now = performance.now();
    if (busyRef.current || now < specialUntil.current) return;
    specialUntil.current = now + 4000;
    setCooldown(4);
    actRef.current = { clip: "attack", until: now + 600 };
    spawn(player.current.x, player.current.y - 40, 36, "#35e2f0", true);
    // ima de campo: puxa nucleos de energia proximos
    for (const c of cores.current) if (c.taken <= 0 && Math.hypot(c.x - player.current.x, c.y - player.current.y) < 220) { c.taken = 15; setScore((v) => v + 10); }
  };

  const doJump = useCallback(() => {
    if(busyRef.current)return;
    jumpBuf.current = BUFFER;
    input.current.jumpHeld = true;
  }, []);

  const enter = useCallback(() => {
    const b = nearRef.current;
    if (!b || busyRef.current || !systemUnlocked(stateRef.current,b.id)) return;
    actRef.current = { clip: "interact", until: performance.now() + 420 };
    transitionRef.current(() => onEnterRef.current(b.id));
  }, []);

  /* --------------------------- teclado --------------------------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if(busyRef.current)return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.current.left = true;
      else if (k === "arrowright" || k === "d") input.current.right = true;
      else if (k === "shift") input.current.run = true;
      else if (k === " " || k === "arrowup" || k === "w" || k === "z") {
        e.preventDefault();
        doJump();
      } else if (k === "f") actRef.current = { clip: "attack", until: performance.now() + 420 };
      else if (k === "enter" || k === "e") enter();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.current.left = false;
      if (k === "arrowright" || k === "d") input.current.right = false;
      if (k === "shift") input.current.run = false;
      if (k === " " || k === "arrowup" || k === "w" || k === "z") input.current.jumpHeld = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [doJump, enter]);

  /* --------------------------- loop --------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgs: Record<string, HTMLImageElement> = {};
    const get = (src: string) => {
      let im = imgs[src];
      if (!im) {
        im = new Image();
        im.src = src;
        imgs[src] = im;
      }
      return im;
    };
    [
      heroSheet(heroRef.current),
      ...LAYERS.map((l) => l.src),
      SKY_SHEET,
      TRAFFIC_ATLAS,
      FG_LAYER.src,
      ...DECOR_SRC,
      ...BUILDINGS.map((b) => b.art),
    ].forEach(get);

    let w = 480;
    let h = 800;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const motionQ = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let still = !!motionQ?.matches;
    const onMotion = (e: MediaQueryListEvent) => { still = e.matches; };
    motionQ?.addEventListener?.("change", onMotion);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let lastNearId: string | null = null;

    const platY = (p: Platform, time: number) =>
      p.range && p.speed ? p.y + Math.sin(time * p.speed) * 0 : p.y;
    const platX = (p: Platform, time: number) =>
      p.range && p.speed ? p.x + Math.sin(time * p.speed) * p.range : p.x;

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if(busyRef.current){input.current={left:false,right:false,run:false,jumpHeld:false};raf=requestAnimationFrame(tick);return;}
      t += dt;
      const P = player.current;
      const acting = actRef.current && actRef.current.until > now ? actRef.current.clip : null;
      if (actRef.current && actRef.current.until <= now) actRef.current = null;

      /* ---------------- física ---------------- */
      const keyboard = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
      const dir = Math.sign(keyboard || analog.current.x);
      const maxSp = keyboard ? (input.current.run ? RUN : WALK) : Math.max(WALK * 0.5, Math.abs(analog.current.x) * RUN);
      if (specialUntil.current > now && Math.floor(t * 5) !== Math.floor((t - dt) * 5)) setCooldown(Math.max(0, (specialUntil.current - now) / 1000));
      else if (specialUntil.current && specialUntil.current <= now) { specialUntil.current = 0; setCooldown(0); }
      const accel = P.onGround ? ACCEL : AIR_ACCEL;
      if (dir !== 0 && !(acting === "interact")) {
        P.vx += dir * accel * dt;
        P.vx = Math.max(-maxSp, Math.min(maxSp, P.vx));
        P.face = dir as 1 | -1;
      } else {
        const f = FRICTION * dt * (P.onGround ? 1 : 0.35);
        P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f;
      }

      jumpBuf.current = Math.max(0, jumpBuf.current - dt);
      P.coyote = P.onGround ? COYOTE : Math.max(0, P.coyote - dt);

      if (jumpBuf.current > 0 && (P.coyote > 0 || P.jumps < 2)) {
        const dbl = P.coyote <= 0;
        P.vy = -JUMP_V * (dbl ? 0.86 : 1);
        P.jumps = dbl ? 2 : 1;
        P.coyote = 0;
        P.onGround = false;
        jumpBuf.current = 0;
        P.squash = -0.28;
        spawn(P.x, P.y, dbl ? 10 : 6, dbl ? "#ff5fd0" : "#8fe9ff", dbl);
      }

      if (!input.current.jumpHeld && P.vy < 0) P.vy += JUMP_V * JUMP_CUT * dt * 6;
      P.vy = Math.min(MAX_FALL, P.vy + GRAVITY * dt);

      const prevY = P.y;
      P.x = Math.max(60, Math.min(WORLD_W - 60, P.x + P.vx * dt));
      P.y += P.vy * dt;

      // colisões: plataformas (só de cima) e chão
      let grounded = false;
      if (P.vy >= 0) {
        for (const p of PLATFORMS) {
          const px = platX(p, t);
          const py = platY(p, t);
          if (P.x > px - 8 && P.x < px + p.w + 8 && prevY <= py + 4 && P.y >= py) {
            P.y = py;
            P.vy = 0;
            grounded = true;
            break;
          }
        }
      }
      if (P.y >= GROUND_Y) {
        P.y = GROUND_Y;
        P.vy = 0;
        grounded = true;
      }
      if (grounded && !P.onGround) {
        P.squash = 0.3;
        landT.current = 0.16;
        spawn(P.x, P.y, 8, "#cfe9ff");
        P.jumps = 0;
      }
      P.onGround = grounded;
      P.squash += (0 - P.squash) * Math.min(1, dt * 12);

      /* ---------------- núcleos ---------------- */
      comboT.current = Math.max(0, comboT.current - dt);
      if (comboT.current === 0 && combo > 0) setCombo(0);
      for (const c of cores.current) {
        if (c.taken > 0) {
          c.taken -= dt;
          continue;
        }
        if (Math.abs(c.x - P.x) < 30 && Math.abs(c.y - (P.y - 40)) < 44) {
          c.taken = 14;
          spawn(c.x, c.y, 14, "#ffe36a", true);
          setScore((s) => s + 10);
          comboT.current = 2.5;
          setCombo((k) => k + 1);
        }
      }

      /* ---------------- prédio próximo ---------------- */
      const b = BUILDINGS.find((bb) => systemUnlocked(stateRef.current,bb.id) && Math.abs(bb.x - P.x) < bb.w * 0.45 && P.y >= GROUND_Y - 4) ?? null;
      if ((b?.id ?? null) !== lastNearId) {
        lastNearId = b?.id ?? null;
        nearRef.current = b;
        setNear(b);
      }

      /* ---------------- câmera ---------------- */
      const targetX = Math.max(0, Math.min(WORLD_W - w, P.x - w / 2 + P.face * 40));
      const targetY = Math.max(SKY_TOP, Math.min(GROUND_Y + 120 - h, P.y - h * 0.68));
      cam.current.x += (targetX - cam.current.x) * Math.min(1, dt * 7);
      cam.current.y += (targetY - cam.current.y) * Math.min(1, dt * 5);

      /* ---------------- partículas ---------------- */
      parts.current = parts.current.filter((p) => {
        p.life += dt;
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life < p.max;
      });

      /* ------------- animação por ação (Fase C) ------------- */
      const clip: HeroClip = acting
        ? acting
        : !P.onGround
          ? P.vy < -40
            ? "jump"
            : "fall"
          : landT.current > 0
            ? "land"
            : Math.abs(P.vx) > WALK + 12
              ? "run"
              : Math.abs(P.vx) > 8
                ? "walk"
                : "idle";
      if (clip !== P.clip) {
        P.clip = clip;
        P.clipT = 0;
      }
      P.clipT += dt;
      P.frame = clipFrame(P.clip, P.clipT);
      landT.current = Math.max(0, landT.current - dt);

      /* ---------------- render ---------------- */
      const cx = cam.current.x;
      const cy = cam.current.y;
      ctx.clearRect(0, 0, w, h);

      // câmera "no chão" e no topo: referência do parallax vertical
      const cyGround = GROUND_Y + 120 - h;
      const lift = cyGround - cy; // > 0 quando a câmera sobe
      const bcam: BackdropCam = { w, h, cx, cy, cyGround, cyTop: SKY_TOP, t, still };

      // céu animado (50 quadros) preso à tela — nunca acaba ao subir
      drawSky(ctx, imgs[SKY_SHEET], bcam);
      const atlas = imgs[TRAFFIC_ATLAS];
      drawTraffic(ctx, atlas, "far", bcam);

      // parallax multicamadas (Fase B)
      const drawLayer = (l: Layer) => {
        const im = imgs[l.src];
        if (!im?.complete || !im.naturalWidth) return;
        const lh = h * l.scale;
        const lw = lh * (im.naturalWidth / im.naturalHeight);
        const off = -(((cx * l.speed) % lw) + lw) % lw;
        const fy = l.fy ?? 1;
        const y = GROUND_Y - cyGround - lh + l.anchor + lift * fy;
        ctx.globalAlpha = l.alpha;
        for (let i = 0; i < Math.ceil(w / lw) + 2; i++) {
          ctx.drawImage(im, off + i * lw, y, lw, lh);
        }
        // a camada subiu em relação ao chão: continua a base dela até o fim da tela
        const bottom = y + lh - 1;
        if (l.base && bottom < h) {
          ctx.fillStyle = l.base;
          ctx.fillRect(0, bottom, w, h - bottom);
        }
        ctx.globalAlpha = 1;
      };
      drawLayer(LAYERS[0]);
      drawSearchlights(ctx, bcam, GROUND_Y - cy);
      drawLayer(LAYERS[1]);
      drawTraffic(ctx, atlas, "mid", bcam);
      drawLayer(LAYERS[2]);
      drawLayer(LAYERS[3]);
      drawTraffic(ctx, atlas, "near", bcam);
      drawLayer(LAYERS[4]);

      // decoracoes atras dos predios
      for (const d of DECOR) {
        if (d.speed >= 1) continue;
        const im = imgs[d.src];
        const dx = (d.x - cx) * d.speed + w * (1 - d.speed) * 0;
        if (dx > w + 80 || dx + d.w < -80) continue;
        if (!im?.complete || !im.naturalWidth) continue;
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.filter = "brightness(0.7)";
        ctx.translate(dx, GROUND_Y - cy + 10 - d.h);
        if (d.flip) {
          ctx.translate(d.w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(im, 0, 0, d.w, d.h);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // prédios
      for (const bd of BUILDINGS) {
        if(!systemUnlocked(stateRef.current,bd.id))continue;
        const im = get(bd.art);
        const dx = bd.x - bd.w / 2 - cx;
        const dy = GROUND_Y + 14 - bd.h - cy;
        if (dx > w || dx + bd.w < 0) continue;
        const active = nearRef.current?.id === bd.id;
        if (im?.complete && im.naturalWidth) {
          ctx.save();
          ctx.filter = active ? "brightness(1.15)" : "brightness(0.85)";
          ctx.drawImage(im, dx, dy, bd.w, bd.h);
          ctx.restore();
        }
        // porta
        ctx.fillStyle = active ? "rgba(53,226,240,0.35)" : "rgba(53,226,240,0.12)";
        ctx.fillRect(bd.x - 26 - cx, GROUND_Y - 58 - cy, 52, 58);
        ctx.strokeStyle = active ? "#35e2f0" : "rgba(53,226,240,0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(bd.x - 26 - cx, GROUND_Y - 58 - cy, 52, 58);
        // placa
        ctx.font = "8px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = active ? "#35e2f0" : "#8fa8bd";
        ctx.fillText(bd.label, bd.x - cx, dy - 8);
      }

      // chão
      const gy = GROUND_Y - cy;
      const grd = ctx.createLinearGradient(0, gy, 0, gy + 200);
      grd.addColorStop(0, "#16233f");
      grd.addColorStop(1, "#070c18");
      ctx.fillStyle = grd;
      ctx.fillRect(0, gy, w, h - gy + 200);
      ctx.fillStyle = "rgba(53,226,240,0.55)";
      ctx.fillRect(0, gy, w, 3);
      ctx.fillStyle = "rgba(53,226,240,0.12)";
      for (let i = 0; i < WORLD_W; i += 64) {
        const px = i - cx;
        if (px < -8 || px > w) continue;
        ctx.fillRect(px, gy + 12, 30, 3);
      }

      // plataformas
      for (const p of PLATFORMS) {
        const px = platX(p, t) - cx;
        const py = platY(p, t) - cy;
        if (px > w || px + p.w < 0) continue;
        ctx.fillStyle = "#101c33";
        ctx.fillRect(px, py, p.w, 16);
        ctx.fillStyle = "#35e2f0";
        ctx.fillRect(px, py, p.w, 3);
        ctx.fillStyle = "rgba(53,226,240,0.18)";
        ctx.fillRect(px + 4, py + 16, p.w - 8, 4);
      }

      // decoracoes no plano do jogador
      for (const d of DECOR) {
        if (d.speed < 1) continue;
        const im = imgs[d.src];
        const dx = d.x - cx;
        if (dx > w + 80 || dx + d.w < -80) continue;
        if (!im?.complete || !im.naturalWidth) continue;
        ctx.save();
        ctx.translate(dx, GROUND_Y - cy + 12 - d.h);
        if (d.flip) {
          ctx.translate(d.w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(im, 0, 0, d.w, d.h);
        ctx.restore();
      }

      // núcleos
      for (const c of cores.current) {
        if (c.taken > 0) continue;
        const px = c.x - cx;
        const py = c.y - cy + Math.sin(t * 3 + c.x) * 5;
        if (px < -20 || px > w + 20) continue;
        ctx.fillStyle = "rgba(255,227,106,0.22)";
        ctx.fillRect(px - 12, py - 12, 24, 24);
        ctx.fillStyle = "#ffe36a";
        ctx.fillRect(px - 6, py - 6, 12, 12);
        ctx.fillStyle = "#fff8d0";
        ctx.fillRect(px - 2, py - 6, 4, 12);
      }

      // partículas
      for (const p of parts.current) {
        const a = 1 - p.life / p.max;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x - cx - 2, p.y - cy - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      // robô do jogador — tira de 16 quadros do próprio robô (Fase C)
      const sheet = get(heroSheet(heroRef.current));
      if (sheet?.complete && sheet.naturalWidth) {
        const def = HERO_CLIPS[P.clip];
        const sx = P.frame * HERO_FRAME;
        const sq = 1 + P.squash;
        const dw = (SPR * def.scale) / sq;
        const dh = SPR * def.scale * sq;
        const bob = def.bob ? Math.sin(t * def.fps * 1.6) * def.bob : 0;
        // sombra (encolhe no ar)
        const air = Math.max(0, Math.min(1, (GROUND_Y - P.y) / 220));
        ctx.globalAlpha = 0.35 * (1 - air * 0.6);
        ctx.fillStyle = "#000";
        ctx.fillRect(P.x - cx - 22 + air * 6, GROUND_Y - cy - 4, 44 - air * 12, 6);
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.translate(P.x - cx, P.y - cy + bob);
        ctx.scale(P.face, 1);
        if (def.tilt) ctx.rotate(def.tilt);
        ctx.drawImage(sheet, sx, 0, HERO_FRAME, HERO_FRAME, -dw / 2, -dh, dw, dh);
        ctx.restore();
        // brilho de impulso ao correr
        if (P.clip === "run" && Math.random() < 0.4) {
          spawn(P.x - P.face * 14, P.y - 4, 1, "#8fe9ff");
        }
      }

      // camada de sucata em primeiro plano (parallax > 1)
      drawLayer(FG_LAYER);

      // névoa em primeiro plano
      const fog = ctx.createLinearGradient(0, h - 90, 0, h);
      fog.addColorStop(0, "rgba(10,20,40,0)");
      fog.addColorStop(1, "rgba(10,20,40,0.55)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, h - 90, w, 90);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      motionQ?.removeEventListener?.("change", onMotion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#050a16" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, imageRendering: "pixelated" }} />

      {/* HUD */}
      <div
        className="mk-title"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 8,
          color: "#ffe36a",
          background: "rgba(3,8,16,0.7)",
          border: "2px solid rgba(255,227,106,0.4)",
          padding: "6px 8px",
          zIndex: 6,
        }}
      >
        PILOTO NV {st.playerLevel}
        <div style={{fontSize:5,color:"#86b0c5",marginTop:5}}>NÚCLEOS {score}{combo>1?` ×${combo}`:""}</div>
      </div>

      <SystemDock disabled={busy||!enabled} onEnter={id=>{
        if(systemUnlocked(stateRef.current,id))transition(()=>onEnter(id));
      }}/>

      {/* Trocar robô de exploração (Fase C) */}
      <button
        className="mk-title"
        onClick={() => setPicker(true)}
        style={{
          position: "absolute",
          top: 60,
          right: 8,
          zIndex: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 6,
          padding: "5px 7px",
          color: "#dff6ff",
          background: "rgba(6,14,26,0.8)",
          border: "2px solid rgba(53,226,240,0.35)",
          cursor: "pointer",
        }}
      >
        <img
          src={heroFace(hero)}
          alt=""
          width={22}
          height={22}
          style={{ imageRendering: "pixelated", maxWidth: "none" }}
        />
        TROCAR
      </button>

      {picker && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background: "rgba(3,8,16,0.9)",
            display: "flex",
            flexDirection: "column",
            padding: 12,
          }}
        >
          <div
            className="mk-title"
            style={{ fontSize: 9, color: "var(--mk-accent)", marginBottom: 4 }}
          >
            EXPLORAR COM
          </div>
          <div className="mk-title" style={{ fontSize: 6, color: "#7fa8c4", marginBottom: 10 }}>
            {st.robots.length} ROBOS NO HANGAR • O ESCOLHIDO ANDA, CORRE, PULA E ATACA NA CIDADE
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              alignContent: "start",
            }}
          >
            {st.robots.map((r) => {
              const def = ROBOT_MAP[r.id];
              const on = r.id === hero;
              return (
                <button
                  key={r.id}
                  className="mk-title"
                  onClick={() => {
                    setExplorer(r.id);
                    setPicker(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 4px",
                    fontSize: 5,
                    color: on ? "#03121a" : "#dff6ff",
                    background: on ? "var(--mk-accent)" : "rgba(8,18,32,0.9)",
                    border: `2px solid ${on ? "#03121a" : "rgba(53,226,240,0.3)"}`,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={heroFace(r.id)}
                    alt=""
                    width={44}
                    height={44}
                    style={{ imageRendering: "pixelated", maxWidth: "none" }}
                  />
                  <span style={{ lineHeight: 1.4, textAlign: "center" }}>
                    {def?.name ?? r.id}
                  </span>
                  <span style={{ opacity: 0.75 }}>NV {r.level}</span>
                </button>
              );
            })}
          </div>
          <button
            className="mk-title"
            onClick={() => setPicker(false)}
            style={{
              marginTop: 10,
              fontSize: 8,
              padding: "10px 12px",
              color: "#dff6ff",
              background: "rgba(8,18,32,0.9)",
              border: "2px solid rgba(53,226,240,0.4)",
              cursor: "pointer",
            }}
          >
            FECHAR
          </button>
        </div>
      )}

      {near && (
        <button
          className="mk-title"
          onClick={enter}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 126,
            fontSize: 9,
            padding: "10px 14px",
            color: "#03121a",
            background: "var(--mk-accent)",
            border: "2px solid #03121a",
            boxShadow: "0 0 18px rgba(53,226,240,0.5)",
            cursor: "pointer",
            zIndex: 6,
          }}
        >
          ENTRAR • {near.label}
        </button>
      )}

      {/* Controles touch G5: joystick + ataque/especial/pulo multitoque */}
      <ExplorationControls
        onMove={(x, y) => { analog.current = { x, y }; }}
        onJump={doJump}
        onJumpEnd={() => (input.current.jumpHeld = false)}
        onAttack={() => (actRef.current = { clip: "attack", until: performance.now() + 420 })}
        onSpecial={doSpecial}
        cooldown={cooldown}
        onInteract={enter}
        interactReady={!!near}
        disabled={picker || busy || !enabled}
      />
    </div>
  );
}
