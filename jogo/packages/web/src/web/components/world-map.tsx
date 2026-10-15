import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGate } from "@/components/gate";
import { HERO_CLIPS, HERO_FRAME, clipFrame, heroSheet, type HeroClip } from "@/game/hero";
import { explorerId, useGame } from "@/game/save";
import { ExplorationControls } from "@/components/exploration-controls";
import { WorldAtlas } from "@/components/world-atlas";
import { WorldJournal } from "@/components/world-journal";
import { TournamentAccess } from "@/components/tournament-access";
import { collectedCore, quickBattle, rewardActivity } from "@/game/world-activities";
import type { TournamentDef } from "@/game/tournaments";
import { BUFFER, JUMP_V, RUN, WALK, stepBody } from "@/game/world-physics";
import {
  AIR,
  BIOMES,
  EXPLORE_CELL,
  EX_H,
  EX_W,
  PLAT,
  T,
  TILE_ROLES,
  WH,
  WW,
  liftAt,
  decodeExplored,
  depthLayerAt,
  encodeExplored,
  getWorld,
  hash2,
  tileAt as worldTileAt,
  streamWorld,
  regionAt,
  type ActivityPoint,
  loadWorldSave,
  saveWorld,
  tileSetAt,
  type Site,
  type TileSet,
} from "@/game/world";

/* ---------------------------------------------------------------------------
 * Fase G4 — Mundo dos Torneios (render + gameplay).
 * Canvas 2D, fisica de plataforma do hub, camera seguindo o heroi,
 * paralaxe de 2 camadas por bioma, tiles/props/predios/inimigos gerados por IA.
 * ------------------------------------------------------------------------- */

// sprite do robo desenhado para que o corpo visivel ocupe ~1 bloco (T=32)
const SPR = 46;
const RACE_RISE = 120; // tiles acima do pe da torre
const RACE_TIME = 75;
const MAX_HP = 6;

type Mob = { variant: number; maxHp: number; shoot: number; id: number; f: number; x: number; y: number; hx: number; hy: number; fly: boolean; dir: number; hp: number; dead: number; hit: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; g: number };
type Toast = { text: string; sub?: string; until: number; color: string };

const FX_COLORS: Record<string, string[]> = {
  petals: ["#ffb7d0", "#ff8fb8"],
  spores: ["#c8ff7a", "#7fffb0"],
  sand: ["#f0c27a", "#d4a04a"],
  neon: ["#35e2f0", "#ff4fd8"],
  snow: ["#ffffff", "#d8f0ff"],
  toxic: ["#b6ff3a", "#7aff5a"],
  embers: ["#ff9a3a", "#ffd23a"],
  rain: ["#9ab8e0", "#c8dcff"],
  bubbles: ["#7fd8ff", "#b0fff0"],
  ash: ["#8a8a8a", "#5a5a5a"],
  feathers: ["#fff8e0", "#ffe9a8"],
  stars: ["#ffffff", "#c89aff"],
};

interface Props {
  playerLevel: number;
  won: string[];
  teamEmpty: boolean;
  gold: number;
  onBack: () => void;
  onEnter: (t: TournamentDef) => void;
}

export function WorldMap({ playerLevel, won, teamEmpty, gold, onBack, onEnter }: Props) {
  const world = useMemo(() => getWorld(), []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const { transition, busy } = useGate();
  const g = useGame();
  const hero = explorerId(g);
  const heroRef = useRef(hero);
  heroRef.current = hero;

  const save = useRef(loadWorldSave());
  const explored = useRef(decodeExplored(save.current.explored));
  const chests = useRef(new Set(save.current.chests));
  const litLanterns = useRef(new Set(save.current.lanterns));
  const visitedBiomes = useRef(new Set(save.current.biomes));

  const [journalOpen, setJournalOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const accessRef = useRef(false); accessRef.current = accessOpen;
  const journalRef = useRef(false); journalRef.current = journalOpen;
  const [activity, setActivity] = useState<ActivityPoint | null>(null);
  const activityRef = useRef<ActivityPoint | null>(null);
  const challenge = useRef<{ id: string; kind: "race" | "survival"; start: number; x: number; y: number; kills: number; time: number; region: number } | null>(null);
  const [challengeHud, setChallengeHud] = useState("");
  const [near, setNear] = useState<Site | null>(null);
  const [hud, setHud] = useState({ hp: MAX_HP, cores: save.current.cores, kills: save.current.kills, region: 0, special: 0, biome: 0, depth: "SUPERFICIE", depthM: 0 });
  const [toast, setToast] = useState<Toast | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [found, setFound] = useState(0);

  const wonRef = useRef(won);
  wonRef.current = won;
  const lvRef = useRef(playerLevel);
  lvRef.current = playerLevel;
  const nearRef = useRef<Site | null>(null);
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;
  const mapOpenRef = useRef(mapOpen);
  mapOpenRef.current = mapOpen;

  const input = useRef({ left: false, right: false, run: false, jumpHeld: false, down: false });
  const jumpBuf = useRef(0);
  const attackReq = useRef(false);
  const specialReq = useRef(false);
  const analog = useRef({ x: 0, y: 0 });
  const toastRef = useRef<Toast | null>(null);
  const showToast = useCallback((t: Toast) => {
    toastRef.current = t;
    setToast(t);
  }, []);

  // ponto inicial: save -> ou primeira lanterna
  const startPos = useMemo(() => {
    const s = save.current;
    if (s.y > 0) return { x: s.x, y: s.y };
    const first = world.sites.find((site) => site.kind === "surface")!;
    return { x: first.tx * T, y: first.ty * T };
  }, [world]);

  const player = useRef({
    x: startPos.x,
    y: startPos.y,
    vx: 0,
    vy: 0,
    face: 1 as 1 | -1,
    onGround: false,
    coyote: 0,
    jumps: 0,
    squash: 0,
    clip: "idle" as HeroClip,
    clipT: 0,
    frame: 0,
    hp: MAX_HP,
    inv: 0,
    atk: 0,
    special: 0,
    specialFx: 0,
    combo: 0,
    dropT: 0,
    spawnX: world.lanterns.find((l) => l.id === save.current.lantern)?.x ?? startPos.x,
    spawnY: world.lanterns.find((l) => l.id === save.current.lantern)?.y ?? startPos.y,
  });

  const doJump = useCallback(() => {
    jumpBuf.current = BUFFER;
    input.current.jumpHeld = true;
  }, []);

  /** Entrada em torneio: basta ter o nivel requerido (e uma equipe). */
  const enterTournament = useCallback((t: TournamentDef) => {
    if (busyRef.current) return;
    if (lvRef.current < t.requiredLevel) {
      showToast({ text: "PORTAO SELADO", sub: `REQUER NIVEL ${t.requiredLevel}`, until: performance.now() + 1800, color: "#ff6a5a" });
      return;
    }
    if (teamEmpty) {
      showToast({ text: "SEM EQUIPE", sub: "MONTE SEU TIME NO HANGAR", until: performance.now() + 1800, color: "#ff6a5a" });
      return;
    }
    const P = player.current;
    save.current.x = P.x;
    save.current.y = P.y;
    persistRef.current();
    setAccessOpen(false);
    transition(() => onEnterRef.current(t));
  }, [teamEmpty, transition, showToast]);

  const enter = useCallback(() => {
    if (busyRef.current) return;
    const s = nearRef.current;
    if (!s) { interactRef.current(); return; }
    enterTournament(s.t);
  }, [enterTournament]);

  const interactActivity = () => {
    const a = activityRef.current; if (!a) return;
    const P = player.current, r = world.regions[a.region];
    if (a.kind === "mission") { setJournalOpen(true); return; }
    if (a.kind === "quick") {
      if (teamEmpty) { showToast({text:"SEM EQUIPE",sub:"MONTE SEU TIME NO HANGAR",until:performance.now()+1800,color:"#ff6a5a"}); return; }
      save.current.x=P.x; save.current.y=P.y; persist();
      transition(() => onEnterRef.current(quickBattle(r, lvRef.current))); return;
    }
    if (a.kind === "repair") { P.hp=MAX_HP; P.special=0; showToast({text:"REPARO CONCLUIDO",sub:"VIDA E ESPECIAL RESTAURADOS",until:performance.now()+1600,color:"#7fe9ff"}); return; }
    if (a.kind === "relic") {
      if(!save.current.relics.includes(a.id)){save.current.relics.push(a.id);rewardActivity(save.current,a.id,r.site.t.requiredLevel);persist();}
      showToast({text:"RELIQUIA RECUPERADA",sub:"REGISTRADA NO DIARIO",until:performance.now()+2200,color:"#ffd23a"});return;
    }
    if(save.current.completed.includes(a.id)) { showToast({text:"DESAFIO CONCLUIDO",until:performance.now()+1600,color:"#ffd23a"});return; }
    challenge.current={id:a.id,kind:a.kind,start:performance.now(),x:P.x,y:P.y,kills:save.current.kills,time:0,region:a.region};
    showToast({text:a.kind==="race"?"CORRIDA AO CUME":"CERCO INICIADO",sub:a.kind==="race"?`SUBA ${RACE_RISE*2}M NA TORRE EM ${RACE_TIME}S`:"RESISTA 35S E DERROTE 5 GUARDIOES",until:performance.now()+2200,color:"#ffd23a"});
  };

  const interactRef = useRef(interactActivity);
  interactRef.current = interactActivity;
  const persistRef = useRef(() => {});

  const persist = () => {
    const s = save.current;
    s.explored = encodeExplored(explored.current);
    s.chests = [...chests.current];
    s.lanterns = [...litLanterns.current];
    s.biomes = [...visitedBiomes.current];
    saveWorld(s);
  };
  persistRef.current = persist;

  /* ---------------- teletransporte do minimapa (lanternas acesas) ---------------- */
  const warpTo = useCallback((x: number, y: number) => {
    const P = player.current;
    P.x = x;
    P.y = y;
    P.vx = 0;
    P.vy = 0;
    setMapOpen(false);
  }, []);

  /* --------------------------- teclado --------------------------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowdown", "arrowup", " "].includes(k)) e.preventDefault();
      if (k === "q" && !e.repeat) { setJournalOpen(v=>!v); return; }
      if (k === "t" && !e.repeat) { setAccessOpen(v=>!v); return; }
      if (k === "escape") { setMapOpen(false); setJournalOpen(false); setAccessOpen(false); return; }
      if (k === "m") {
        if (e.repeat) return;
        setMapOpen((v) => !v);
        return;
      }
      if (mapOpenRef.current || journalRef.current || accessRef.current) return;
      if (k === "arrowleft" || k === "a") input.current.left = true;
      else if (k === "arrowright" || k === "d") input.current.right = true;
      else if (k === "arrowdown" || k === "s") input.current.down = true;
      else if (k === "shift") input.current.run = true;
      else if (k === " " || k === "arrowup" || k === "w" || k === "z") {
        e.preventDefault();
        doJump();
      } else if (k === "f" || k === "x" || k === "j") attackReq.current = true;
      else if (k === "r" || k === "c") specialReq.current = true;
      else if (k === "enter" || k === "e") enter();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.current.left = false;
      if (k === "arrowright" || k === "d") input.current.right = false;
      if (k === "arrowdown" || k === "s") input.current.down = false;
      if (k === "shift") input.current.run = false;
      if (k === " " || k === "arrowup" || k === "w" || k === "z") input.current.jumpHeld = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const reset = () => { input.current = { left: false, right: false, run: false, jumpHeld: false, down: false }; };
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
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
    const ok = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    get(heroSheet(heroRef.current));
    get("/world/mobs.png");
    get("/world/items.png");
    ["a", "b", "c", "d"].forEach((k) => get(`/world/build_${k}.png`));

    // atlas de tiles escurecido (parede de fundo das cavernas)
    const darkCache: Record<string, HTMLCanvasElement> = {};
    const darkTiles = (set: TileSet) => {
      const c = darkCache[set];
      if (c) return c;
      const im = get(`/world/tiles/${set}.png`);
      if (!ok(im)) return null;
      const cv = document.createElement("canvas");
      cv.width = im.naturalWidth;
      cv.height = im.naturalHeight;
      const x = cv.getContext("2d");
      if (!x) return null;
      x.drawImage(im, 0, 0);
      x.globalCompositeOperation = "source-atop";
      x.fillStyle = "rgba(4,6,14,0.66)";
      x.fillRect(0, 0, cv.width, cv.height);
      darkCache[set] = cv;
      return cv;
    };

    const mobCache = new Map<number,Mob>();
    let mobs: Mob[] = [];
    // Challenge waves live outside the chunk stream, so restreaming never erases them.
    let waves: Mob[] = [];
    const taken = new Set<number>(save.current.collected);
    const projectiles: {x:number;y:number;vx:number;vy:number;life:number}[]=[];
    const parts: Particle[] = [];
    const ambient: Particle[] = [];

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

    const tileAt = (tx: number, ty: number) => {
      if (tx < 0 || tx >= WW || ty < 0) return 1;
      if (ty >= WH) return 1;
      return worldTileAt(world, tx, ty);
    };
    const solidAt = (px: number, py: number) => {
      const v = tileAt(Math.floor(px / T), Math.floor(py / T));
      return v !== AIR && v !== PLAT;
    };

    const spawn = (x: number, y: number, n: number, c: string, sp = 200, gr = 900) => {
      for (let i = 0; i < n; i++)
        parts.push({ x, y, vx: (Math.random() - 0.5) * sp, vy: -Math.random() * sp * 0.9, life: 0, max: 0.35 + Math.random() * 0.45, c, g: gr });
    };

    // Old saves may point inside rock after a topology change: lift to free space.
    for (let i = 0; i < 400 && solidAt(player.current.x, player.current.y - 2); i++) player.current.y -= T;
    const cam = { x: player.current.x - w / 2, y: player.current.y - h * 0.6 };
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let lastNear: string | null = null;
    let hudT = 0;
    let saveT = 0;
    let lastBiome = -1;
    let lastLayer = "";
    let landT = 0;
    let streamT = 0;
    let activityId = "";

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      t += dt;
      const P = player.current;
      const paused = mapOpenRef.current || journalRef.current || accessRef.current || busyRef.current;
      // Only the current region and its neighbours can be on screen (a region is 139 tiles wide).
      const pr = regionAt(P.x / T);
      const nearR = world.regions.slice(Math.max(0, pr - 1), pr + 2);
      const nearActs = nearR.flatMap((r) => world.activities.slice(r.index * 6, r.index * 6 + 6));
      streamT -= dt;
      if(streamT<=0){
        streamT=.25; streamWorld(world,P.x,P.y);
        const streamed=world.spawns.map(s=>{
          let m=mobCache.get(s.id);
          if(!m){const variant=Math.floor(hash2(s.id,3)*5); const hp=variant===4?5:variant===2?3:2;
            m={...s,hx:s.x,hy:s.y,dir:1,hp,maxHp:hp,variant,shoot:1+hash2(s.id,4)*2,dead:0,hit:0};mobCache.set(s.id,m);}
          return m;
        });
        waves=waves.filter(m=>m.dead<=0&&challenge.current!==null);
        mobs=streamed.concat(waves);
        if(mobCache.size>1500)for(const [id,m] of mobCache)if(Math.abs(m.x-P.x)>6000||Math.abs(m.y-P.y)>6000)mobCache.delete(id);
      }

      if (!paused) {
        /* ---------------- fisica (compartilhada com assets/verify_routes.ts) ---------------- */
        const keyboard = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
        const amount = keyboard || analog.current.x;
        const ctl = {
          amount,
          maxSp: keyboard ? (input.current.run ? RUN : WALK) : Math.abs(amount) * RUN,
          down: input.current.down || analog.current.y > 0.55,
          jumpHeld: input.current.jumpHeld,
          jumpBuf: jumpBuf.current,
          lift: liftAt(world, Math.floor(P.x / T), Math.floor((P.y - 16) / T)),
        };
        const res = stepBody(P, ctl, dt, tileAt);
        jumpBuf.current = ctl.jumpBuf;
        if (res.jumped) {
          P.squash = -0.25;
          spawn(P.x, P.y, res.jumped === 2 ? 10 : 6, res.jumped === 2 ? "#ff5fd0" : "#8fe9ff");
        }
        if (ctl.lift && ctl.jumpHeld && Math.random() < 0.5) spawn(P.x + (Math.random() - 0.5) * 30, P.y, 1, "#8fe9ff", 60, -300);
        if (res.landed && res.impact > 300) {
          P.squash = 0.28;
          landT = 0.14;
          spawn(P.x, P.y, 8, "#cfe9ff");
        }
        P.squash += (0 - P.squash) * Math.min(1, dt * 12);
        if (P.y > WH * T) P.hp = 0;

        /* ---------------- ataque ---------------- */
        P.atk = Math.max(0, P.atk - dt);
        P.special=Math.max(0,P.special-dt); P.specialFx=Math.max(0,P.specialFx-dt);
        if(specialReq.current){specialReq.current=false;
          if(P.special<=0){P.special=4;P.specialFx=.55;P.inv=Math.max(P.inv,.5);spawn(P.x,P.y - 16,44,"#35e2f0",650,0);
            for(const m of mobs)if(m.dead<=0&&Math.hypot(m.x-P.x,m.y-P.y)<185){m.hp-=3;m.hit=.3;m.x+=Math.sign(m.x-P.x)*35;
              if(m.hp<=0){m.dead=60;save.current.kills++;save.current.cores+=m.variant===4?8:3;}}
          }
        }
        if (attackReq.current) {
          attackReq.current = false;
          if (P.atk <= 0.05) {
            P.atk = 0.27; P.combo=(P.combo+1)%3;
            const ax = P.x + P.face * 42;
            spawn(ax, P.y - 16, 6, "#ffffff", 260, 0);
            for (const m of mobs) {
              if (m.dead > 0) continue;
              if (Math.abs(m.x - ax) < 46 && Math.abs(m.y - 24 - (P.y - 16)) < 52) {
                m.hp -= P.combo===0?2:1;
                m.hit = 0.18;
                m.x += P.face * 26;
                spawn(m.x, m.y - 24, 10, "#ffe36a");
                if (m.hp <= 0) {
                  m.dead = 40;
                  save.current.kills += 1;
                  save.current.cores += 3;
                  spawn(m.x, m.y - 24, 22, "#ff5fd0", 360);
                }
              }
            }
          }
        }

        /* ---------------- inimigos (so os proximos) ---------------- */
        P.inv = Math.max(0, P.inv - dt);
        for (const m of mobs) {
          if (Math.abs(m.x - P.x) > 1400 || Math.abs(m.y - P.y) > 1000) continue;
          if (m.dead > 0) {
            m.dead -= dt;
            if (m.dead <= 0) {
              m.hp = m.maxHp;
              m.x = m.hx;
              m.y = m.hy;
            }
            continue;
          }
          m.hit = Math.max(0, m.hit - dt);
          const sp = m.variant===1?95:m.variant===4?38:m.fly?65:50;
          const chase = Math.abs(m.x - P.x) < 260 && Math.abs(m.y - P.y) < 140;
          if (chase) m.dir = P.x > m.x ? 1 : -1;
          const nmx = m.x + m.dir * sp * (chase ? 1.6 : 1) * dt;
          if (m.fly) {
            m.x = nmx;
            m.y = m.hy + Math.sin(t * 2 + m.id) * 24;
            if (Math.abs(m.x - m.hx) > 180) m.dir = m.x > m.hx ? -1 : 1;
          } else {
            const ahead = nmx + m.dir * 16;
            const wall = solidAt(ahead, m.y - 10);
            const gap = !solidAt(ahead, m.y + 4) && tileAt(Math.floor(ahead / T), Math.floor((m.y + 4) / T)) !== PLAT;
            if (wall || gap || Math.abs(nmx - m.hx) > 220) m.dir *= -1;
            else m.x = nmx;
          }
          // Sentinelas atiram; saltadores atacam por arco; elites resistem mais.
          m.shoot-=dt;
          if(chase&&m.shoot<=0){m.shoot=m.variant===3?1.8:2.6;
            if(m.variant===3) {const dx=P.x-m.x,dy=P.y - 16-(m.y-30),len=Math.max(1,Math.hypot(dx,dy));projectiles.push({x:m.x,y:m.y-30,vx:dx/len*220,vy:dy/len*220,life:3});}
            if(m.variant===2&&!m.fly)m.y=m.hy-45;
          }
          if(!m.fly&&m.y<m.hy)m.y=Math.min(m.hy,m.y+160*dt);
          // dano por contato
          if (P.inv <= 0 && Math.abs(m.x - P.x) < 30 && Math.abs(m.y - 22 - (P.y - 16)) < 40) {
            // pisao
            if (P.vy > 150 && P.y < m.y - 24) {
              m.hp = 0;
              m.dead = 40;
              P.vy = -JUMP_V * 0.7;
              save.current.kills += 1;
              save.current.cores += 3;
              spawn(m.x, m.y - 20, 22, "#ff5fd0", 360);
            } else {
              P.hp -= 1;
              P.inv = 1.1;
              P.vx = (P.x > m.x ? 1 : -1) * 420;
              P.vy = -420;
              spawn(P.x, P.y - 16, 14, "#ff4a4a");
            }
          }
        }

        for(let i=projectiles.length-1;i>=0;i--){const q=projectiles[i];q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
          if(q.life<=0||solidAt(q.x,q.y)){projectiles.splice(i,1);continue;}
          if(P.inv<=0&&Math.hypot(q.x-P.x,q.y-(P.y - 16))<24){P.hp--;P.inv=1;projectiles.splice(i,1);}
        }
        if(P.hp<=0){P.hp=MAX_HP;P.x=P.spawnX;P.y=P.spawnY;P.vx=P.vy=0;P.inv=1.2;if(challenge.current){challenge.current=null;waves=[];}showToast({text:"SISTEMA REINICIADO",sub:"VOCE VOLTOU A ULTIMA LANTERNA",until:now+2200,color:"#ff6a5a"});}
        const ch=challenge.current;
        if(ch){ch.time+=dt;
          const elapsed=ch.time, r=world.regions[ch.region];
          const success=ch.kind==="race"?Math.abs(P.x-r.skyX*T)<300&&P.y<=(r.peak-RACE_RISE)*T:elapsed>=35&&save.current.kills-ch.kills>=5;
          if(success){rewardActivity(save.current,ch.id,r.site.t.requiredLevel);persist();challenge.current=null;showToast({text:"DESAFIO VENCIDO",sub:"OURO + XP + KIT DE REPARO",until:now+2400,color:"#ffd23a"});}
          else if(elapsed>=(ch.kind==="race"?RACE_TIME:60)||regionAt(P.x/T)!==ch.region){challenge.current=null;waves=[];showToast({text:"TENTE NOVAMENTE",sub:"DESAFIO ENCERRADO",until:now+1800,color:"#ff6a5a"});}
          else if(ch.kind==="survival"&&Math.floor(elapsed/4)>Math.floor((elapsed-dt)/4)){
            const side=Math.floor(elapsed/4)%2?1:-1, mx=P.x+side*190, my=world.surf[Math.floor(mx/T)]*T;
            const m:Mob={id:-Math.floor(now),f:BIOMES[r.family].mobs[0],x:mx,y:my,hx:mx,hy:my,fly:false,dir:-side,hp:2,maxHp:2,variant:1,shoot:3,dead:0,hit:0};
            if(waves.length<8){waves.push(m);mobs.push(m);}
          }
        }

        /* ---------------- coletaveis ---------------- */
        const near2 = (x: number, y: number, r: number) => Math.abs(x - P.x) < r && Math.abs(y - (P.y - 16)) < r + 10;
        for (const it of world.items) {
          if (Math.abs(it.x - P.x) > 60) continue;
          if (it.kind === "chest") {
            if (chests.current.has(it.id)) continue;
            if (near2(it.x, it.y - 16, 30)) {
              chests.current.add(it.id);
              const v = 10 + Math.floor(hash2(it.id, 1, 3) * 40);
              save.current.cores += v;
              spawn(it.x, it.y - 20, 30, "#ffd23a", 380);
              showToast({ text: "BAU ABERTO", sub: `+${v} NUCLEOS`, until: now + 1400, color: "#ffd23a" });
            }
            continue;
          }
          if (taken.has(it.id)) continue;
          if (near2(it.x, it.y - 12, 24)) {
            taken.add(it.id); save.current.collected.push(it.id);
            if (it.kind === "heal") {
              P.hp = Math.min(MAX_HP, P.hp + 2);
              spawn(it.x, it.y - 10, 14, "#ff6a8a");
            } else {
              save.current.cores += 1; collectedCore(save.current);
              spawn(it.x, it.y - 10, 8, "#7fe9ff");
            }
          }
        }
        for (const L of nearR.flatMap((r) => world.regionLanterns[r.index])) {
          if (Math.abs(L.x - P.x) < 34 && Math.abs(L.y - P.y) < 50) {
            if (!litLanterns.current.has(L.id) || (P.spawnX !== L.x)) {
              const first = !litLanterns.current.has(L.id);
              litLanterns.current.add(L.id);
              save.current.lantern = L.id;
              P.spawnX = L.x;
              P.spawnY = L.y;
              P.hp = MAX_HP;
              if (first) {
                spawn(L.x, L.y - 40, 26, "#7fe9ff", 300);
                showToast({ text: "LANTERNA ACESA", sub: "PONTO DE RETORNO + TELEPORTE NO MAPA", until: now + 1800, color: "#7fe9ff" });
                persist();
              }
            }
          }
        }
      }

      /* ---------------- exploracao / bioma ---------------- */
      const ptx = Math.floor(P.x / T);
      const pty = Math.floor(P.y / T);
      const R = 2;
      const ex = Math.floor(ptx / EXPLORE_CELL);
      const ey = Math.floor(pty / EXPLORE_CELL);
      for (let yy = ey - R; yy <= ey + R; yy++)
        for (let xx = ex - R - 1; xx <= ex + R + 1; xx++)
          if (xx >= 0 && yy >= 0 && xx < EX_W && yy < EX_H) explored.current[yy * EX_W + xx] = 1;

      const ri=regionAt(ptx), region=world.regions[ri];
      const bi = region.family;
      const depth = pty - world.surf[Math.max(0, Math.min(WW - 1, ptx))];
      const layer = depthLayerAt(depth);
      const layerKey = layer ? layer.name : "";
      if (ri !== lastBiome || layerKey !== lastLayer) {
        const first = lastBiome !== -1;
        lastBiome = ri;
        lastLayer = layerKey;
        if (!visitedBiomes.current.has(ri)) visitedBiomes.current.add(ri);
        save.current.biomes=[...visitedBiomes.current];
        if (first || toastRef.current === null) {
          const b = BIOMES[bi];
          showToast(
            layer
              ? { text: layer.name, sub: layer.sub, until: now + 2600, color: layer.color }
              : { text: region.name, sub: b.name, until: now + 2600, color: b.color },
          );
        }
      }

      /* ---------------- predio proximo ---------------- */
      let ns: Site | null = null;
      for (const s of nearR.map((r) => r.site)) {
        if (Math.abs(s.tx * T - P.x) < 70 && Math.abs(s.ty * T - P.y) < 40) {
          ns = s;
          break;
        }
      }
      if ((ns?.t.id ?? null) !== lastNear) {
        lastNear = ns?.t.id ?? null;
        nearRef.current = ns;
        setNear(ns);
      }

      let na:ActivityPoint|null=null;
      for(const a of nearActs)if(Math.abs(a.x-P.x)<62&&Math.abs(a.y-P.y)<44){na=a;break;}
      if((na?.id??"")!==activityId){activityId=na?.id??"";activityRef.current=na;setActivity(na);}

      /* ---------------- camera ---------------- */
      const tx = Math.max(0, Math.min(WW * T - w, P.x - w / 2 + P.face * 50));
      const ty = Math.max(0, Math.min(WH * T - h, P.y - h * 0.58));
      cam.x += (tx - cam.x) * Math.min(1, dt * 6);
      cam.y += (ty - cam.y) * Math.min(1, dt * 6);
      const cx = Math.round(cam.x);
      const cy = Math.round(cam.y);

      /* ---------------- animacao ---------------- */
      const clip: HeroClip = P.atk > 0.05
        ? "attack"
        : P.inv > 0.8
          ? "hurt"
          : !P.onGround
            ? P.vy < -40
              ? "jump"
              : "fall"
            : landT > 0
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
      landT = Math.max(0, landT - dt);

      /* ================= RENDER ================= */
      const b0=bi, b1=region.secondary;
      const blend=.18;
      const surfY = world.surf[Math.max(0, Math.min(WW - 1, Math.floor((cx + w / 2) / T)))] * T;
      const under = Math.max(0, Math.min(1, (cy + h * 0.5 - surfY - 8 * T) / (12 * T)));

      ctx.fillStyle = BIOMES[b0].sky;
      ctx.fillRect(0, 0, w, h);

      const drawBg = (key: string, alpha: number) => {
        const far = get(`/world/bg/${key}_far.jpg`);
        const mid = get(`/world/bg/${key}_mid.png`);
        ctx.globalAlpha = alpha;
        const H = Math.max(h, 560);
        if (ok(far)) {
          const lh = H;
          const lw = lh * (far.naturalWidth / far.naturalHeight);
          const off = -((((cx * 0.12) % lw) + lw) % lw);
          const y = Math.min(0, (surfY - cy) * 0.25 + h * 0.62 - lh * 0.82);
          for (let i = 0; i < Math.ceil(w / lw) + 2; i++) ctx.drawImage(far, off + i * lw, y, lw, lh);
        }
        if (ok(mid)) {
          const lh = H * 0.86;
          const lw = lh * (mid.naturalWidth / mid.naturalHeight);
          const off = -((((cx * 0.32) % lw) + lw) % lw);
          const y = (surfY - cy) * 0.55 + h * 0.6 - lh * 0.86 + 40;
          for (let i = 0; i < Math.ceil(w / lw) + 2; i++) ctx.drawImage(mid, off + i * lw, y, lw, lh);
        }
        ctx.globalAlpha = 1;
      };
      if (under < 1) {
        drawBg(BIOMES[b0].id, 1 - blend);
        if (blend > 0) drawBg(BIOMES[b1].id, blend);
      }
      if (under > 0) {
        const L = layer ?? { bg: "ruin" };
        ctx.globalAlpha = under;
        const far = get(`/world/bg/${L.bg}_far.jpg`);
        if (ok(far)) {
          const lh = h;
          const lw = lh * (far.naturalWidth / far.naturalHeight);
          const off = -((((cx * 0.1) % lw) + lw) % lw);
          const oy = -((((cy * 0.1) % lh) + lh) % lh);
          for (let i = 0; i < Math.ceil(w / lw) + 2; i++) {
            ctx.drawImage(far, off + i * lw, oy, lw, lh);
            ctx.drawImage(far, off + i * lw, oy + lh, lw, lh);
          }
        }
        ctx.fillStyle = "rgba(3,4,12,0.55)";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      /* ---- tiles ---- */
      const x0 = Math.max(0, Math.floor(cx / T) - 1);
      const x1 = Math.min(WW - 1, Math.ceil((cx + w) / T) + 1);
      const y0 = Math.max(0, Math.floor(cy / T) - 1);
      const y1 = Math.min(WH - 1, Math.ceil((cy + h) / T) + 1);
      for (let ty2 = y0; ty2 <= y1; ty2++) {
        for (let tx2 = x0; tx2 <= x1; tx2++) {
          const v = tileAt(tx2, ty2);
          const sx = tx2 * T - cx;
          const sy = ty2 * T - cy;
          const s = world.surf[tx2];
          const set = tileSetAt(world, tx2, ty2);
          const roles = TILE_ROLES[set];
          const hv = hash2(tx2, ty2, 77);
          if (v === AIR || v === PLAT) {
            // parede de fundo nas cavernas
            if (ty2 > s + 1) {
              const dk = darkTiles(set);
              if (dk) {
                const f = roles.body[Math.floor(hv * roles.body.length)];
                ctx.drawImage(dk, f * T, 0, T, T, sx, sy, T, T);
              }
            }
            if (v === PLAT) {
              const im = get(`/world/tiles/${set}.png`);
              if (ok(im)) ctx.drawImage(im, roles.brick[0] * T, 0, T, 10, sx, sy, T, 10);
              ctx.fillStyle = "rgba(255,255,255,0.18)";
              ctx.fillRect(sx, sy, T, 2);
            }
            continue;
          }
          const im = get(`/world/tiles/${set}.png`);
          if (!ok(im)) {
            ctx.fillStyle = "#222";
            ctx.fillRect(sx, sy, T, T);
            continue;
          }
          const above = ty2 > 0 ? tileAt(tx2, ty2 - 1) : 0;
          const depthT = ty2 - s;
          let f: number;
          if (above === AIR && depthT < 120) f = roles.top;
          else if (depthT < 6) f = roles.body[Math.floor(hv * roles.body.length)];
          else if (hv < 0.06) f = roles.brick[Math.floor(hv * 100) % roles.brick.length];
          else f = roles.deep[Math.floor(hv * roles.deep.length)];
          ctx.drawImage(im, f * T, 0, T, T, sx, sy, T, T);
          if(regionAt(tx2)===ri){ctx.fillStyle=region.color+"0c";ctx.fillRect(sx,sy,T,T);}
          // borda de contorno onde encosta no ar
          if (above === AIR) {
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            ctx.fillRect(sx, sy - 2, T, 2);
          }
        }
      }

      /* ---- props ---- */
      for (const p of world.props) {
        if (p.x < cx - 80 || p.x > cx + w + 80 || p.y < cy - 10 || p.y > cy + h + 140) continue;
        const im = get(`/world/props/${p.set}.png`);
        if (!ok(im)) continue;
        const sz = 64 * p.s;
        const flip = hash2(Math.floor(p.x), 0, 4) > 0.5;
        ctx.save();
        ctx.translate(p.x - cx, p.y - cy);
        if (flip) ctx.scale(-1, 1);
        ctx.drawImage(im, p.f * 64, 0, 64, 64, -sz / 2, -sz + 2, sz, sz);
        ctx.restore();
      }

      /* ---- postos avancados ---- */
      for (const o of nearR.map((r) => world.outposts[r.index])) {
        const ox = o.tx * T - cx;
        if (ox < -260 || ox > w + 260) continue;
        const im = get(`/world/build_${o.art[0]}.png`);
        if (ok(im)) ctx.drawImage(im, o.art[1] * 192, 0, 192, 192, ox - 96 - 70, o.ty * T - cy - 182, 192, 192);
      }

      /* ---- predios de torneio ---- */
      ctx.textAlign = "center";
      for (const s of nearR.map((r) => r.site)) {
        const sx = s.tx * T - cx;
        const sy = s.ty * T - cy;
        if (sx < -260 || sx > w + 260 || sy < -60 || sy > h + 300) continue;
        const im = get(`/world/build_${s.art[0]}.png`);
        const size = s.champion ? 300 : 224;
        const done = wonRef.current.includes(s.t.id);
        const locked = lvRef.current < s.t.requiredLevel;
        const active = nearRef.current?.t.id === s.t.id;
        if (ok(im)) {
          ctx.save();
          if (locked) ctx.filter = "grayscale(0.7) brightness(0.6)";
          else if (active) ctx.filter = "brightness(1.18)";
          ctx.drawImage(im, s.art[1] * 192, 0, 192, 192, sx - size / 2, sy - size + 10, size, size);
          ctx.restore();
        }
        // halo da porta
        const pulse = 0.5 + Math.sin(t * 3 + s.tx) * 0.5;
        if (!locked) {
          const gr = ctx.createRadialGradient(sx, sy - 30, 4, sx, sy - 30, 70);
          const col = done ? "255,210,58" : "53,226,240";
          gr.addColorStop(0, `rgba(${col},${0.25 + pulse * 0.2 + (active ? 0.25 : 0)})`);
          gr.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = gr;
          ctx.fillRect(sx - 70, sy - 100, 140, 100);
        }
        // placa
        const label = s.t.name;
        ctx.font = "7px 'Press Start 2P', monospace";
        const tw = ctx.measureText(label).width + 12;
        const py = sy - size + 2;
        ctx.fillStyle = "rgba(3,8,16,0.82)";
        ctx.fillRect(sx - tw / 2, py - 12, tw, 16);
        ctx.fillStyle = locked ? "#ff6a5a" : done ? "#ffd23a" : active ? "#35e2f0" : "#dff6ff";
        ctx.fillText(label, sx, py);
        ctx.font = "6px 'Press Start 2P', monospace";
        ctx.fillStyle = locked ? "#ff6a5a" : "#8fa8bd";
        ctx.fillText(locked ? `NV ${s.t.requiredLevel}` : done ? "* CONQUISTADO" : `NV ${s.t.requiredLevel}`, sx, py + 12);
      }

      /* ---- lanternas ---- */
      const itemsIm = get("/world/items.png");
      for (const L of nearR.flatMap((r) => world.regionLanterns[r.index])) {
        const lx = L.x - cx;
        const ly = L.y - cy;
        if (lx < -40 || lx > w + 40 || ly < -80 || ly > h + 40) continue;
        const lit = litLanterns.current.has(L.id);
        if (ok(itemsIm)) {
          ctx.save();
          if (!lit) ctx.filter = "grayscale(1) brightness(0.6)";
          ctx.drawImage(itemsIm, 12 * 48, 0, 48, 48, lx - 30, ly - 60, 60, 60);
          ctx.restore();
        }
        if (lit) {
          const gr = ctx.createRadialGradient(lx, ly - 36, 2, lx, ly - 36, 60);
          gr.addColorStop(0, "rgba(127,233,255,0.35)");
          gr.addColorStop(1, "rgba(127,233,255,0)");
          ctx.fillStyle = gr;
          ctx.fillRect(lx - 60, ly - 96, 120, 120);
        }
      }

      /* ---- itens ---- */
      if (ok(itemsIm)) {
        for (const it of world.items) {
          const ix = it.x - cx;
          const iy = it.y - cy;
          if (ix < -30 || ix > w + 30 || iy < -40 || iy > h + 40) continue;
          if (it.kind === "chest") {
            const open = chests.current.has(it.id);
            ctx.drawImage(itemsIm, (open ? 4 : 3) * 48, 0, 48, 48, ix - 20, iy - 38, 40, 40);
            continue;
          }
          if (taken.has(it.id)) continue;
          const bob = Math.sin(t * 3 + it.id) * 4;
          const f = it.kind === "heal" ? 2 : 0;
          const sz = it.kind === "heal" ? 28 : 22;
          ctx.drawImage(itemsIm, f * 48, 0, 48, 48, ix - sz / 2, iy - sz + bob, sz, sz);
        }
      }

      // Camp activity markers use existing item/prop pixel art.
      for(const a of nearActs){const ax=a.x-cx,ay=a.y-cy;if(ax< -80||ax>w+80||ay< -40||ay>h+100)continue;
        const im=get(a.kind==="quick"?"/world/props/city.png":a.kind==="relic"?"/world/props/crystal.png":"/world/props/dojo.png");
        const frame={mission:9,quick:8,race:3,survival:12,repair:8,relic:5}[a.kind];
        if(ok(im))ctx.drawImage(im,frame*64,0,64,64,ax-26,ay-54,52,54);
        ctx.font="6px 'Press Start 2P', monospace";ctx.textAlign="center";ctx.fillStyle=save.current.completed.includes(a.id)?"#57d76a":"#ffd23a";ctx.fillText(a.name,ax,ay-60);
      }
      // Route labels make exits visible even before the world atlas is opened.
      ctx.font="7px 'Press Start 2P', monospace";ctx.fillStyle="#8fe9ff";
      for(const r of nearR){
        const gy=world.surf[r.skyX]*T-cy;ctx.fillText("↑ ROTA DO CEU · SEGURE PULO NA CORRENTE",r.skyX*T-cx,gy-80);
        ctx.fillText("↓ GALERIAS · BAIXO + PULO",r.shaftX*T-cx,r.bridge*T-cy-70);
      }
      for(const q of projectiles){ctx.fillStyle="#ff6a5a";ctx.fillRect(q.x-cx-4,q.y-cy-4,8,8);}

      /* ---- inimigos ---- */
      const mobIm = get("/world/mobs.png");
      if (ok(mobIm)) {
        for (const m of mobs) {
          if (m.dead > 0) continue;
          const mx = m.x - cx;
          const my = m.y - cy;
          if (mx < -60 || mx > w + 60 || my < -80 || my > h + 60) continue;
          ctx.save();
          ctx.translate(mx, my + (m.fly ? 0 : Math.abs(Math.sin(t * 8 + m.id)) * -2));
          if (m.dir < 0) ctx.scale(-1, 1);
          ctx.filter=m.hit>0?"brightness(2.4)":`hue-rotate(${m.variant*35}deg)`;
          ctx.drawImage(mobIm, m.f * 64, 0, 64, 64, -26, -50, 52, 52);
          ctx.restore();
          ctx.fillStyle="#17121a";ctx.fillRect(mx-18,my-57,36,4);ctx.fillStyle=m.variant===4?"#ffb43a":"#e2453a";ctx.fillRect(mx-18,my-57,36*Math.max(0,m.hp)/m.maxHp,4);
        }
      }

      /* ---- particulas ---- */
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life >= p.max) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x - cx - 2), Math.round(p.y - cy - 2), 4, 4);
      }
      ctx.globalAlpha = 1;

      /* ---- heroi ---- */
      const sheet = get(heroSheet(heroRef.current));
      if (ok(sheet) && !(P.inv > 0 && Math.floor(t * 20) % 2 === 0)) {
        const def = HERO_CLIPS[P.clip];
        const sq = 1 + P.squash;
        const dw = (SPR * def.scale) / sq;
        const dh = SPR * def.scale * sq;
        const bob = def.bob ? Math.sin(t * def.fps * 1.6) * def.bob : 0;
        ctx.save();
        ctx.translate(Math.round(P.x - cx), Math.round(P.y - cy + bob * 0.5 + 3));
        ctx.scale(P.face, 1);
        if (def.tilt) ctx.rotate(def.tilt);
        ctx.drawImage(sheet, P.frame * HERO_FRAME, 0, HERO_FRAME, HERO_FRAME, -dw / 2, -dh, dw, dh);
        ctx.restore();
      }
      if (P.atk > 0.1) {
        // arco do golpe
        ctx.strokeStyle = `rgba(255,255,255,${P.atk * 2.4})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(P.x - cx + P.face * 12, P.y - cy - 16, 24, P.face > 0 ? -1.2 : Math.PI - 0.6, P.face > 0 ? 0.6 : Math.PI + 1.2);
        ctx.stroke();
      }

      if(P.specialFx>0){ctx.strokeStyle="#35e2f0";ctx.lineWidth=5;ctx.beginPath();ctx.arc(P.x-cx,P.y-cy-28,(.55-P.specialFx)*330+12,0,Math.PI*2);ctx.stroke();}

      /* ---- particulas ambiente do bioma ---- */
      const fxKind = layer ? (layer.set === "volcano" ? "embers" : layer.set === "crystal" ? "stars" : "spores") : BIOMES[bi].fx;
      const cols = FX_COLORS[fxKind];
      if (ambient.length < 70 && Math.random() < 0.7) {
        const rain = fxKind === "rain";
        ambient.push({
          x: cx + Math.random() * w,
          y: cy + (rain || fxKind === "snow" || fxKind === "petals" || fxKind === "feathers" ? -10 : Math.random() * h),
          vx: fxKind === "sand" ? 160 : rain ? -60 : (Math.random() - 0.5) * 30,
          vy: rain ? 700 : fxKind === "embers" || fxKind === "bubbles" ? -40 - Math.random() * 40 : fxKind === "stars" || fxKind === "spores" || fxKind === "neon" || fxKind === "toxic" ? (Math.random() - 0.5) * 20 : 40 + Math.random() * 40,
          life: 0,
          max: 3 + Math.random() * 3,
          c: cols[Math.floor(Math.random() * cols.length)],
          g: 0,
        });
      }
      for (let i = ambient.length - 1; i >= 0; i--) {
        const p = ambient[i];
        p.life += dt;
        p.x += (p.vx + Math.sin(t + i) * 12) * dt;
        p.y += p.vy * dt;
        if (p.life > p.max) {
          ambient.splice(i, 1);
          continue;
        }
        const a = Math.sin((p.life / p.max) * Math.PI);
        ctx.globalAlpha = a * 0.8;
        ctx.fillStyle = p.c;
        if (fxKind === "rain") ctx.fillRect(p.x - cx, p.y - cy, 1, 8);
        else ctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), 3, 3);
      }
      ctx.globalAlpha = 1;

      /* ---- iluminacao subterranea (Terraria) ---- */
      if (depth > 6) {
        const dark = Math.min(0.88, 0.25 + depth / 160);
        const hx = P.x - cx;
        const hy = P.y - cy - 30;
        const gr = ctx.createRadialGradient(hx, hy, 60, hx, hy, Math.max(w, h) * 0.6);
        gr.addColorStop(0, "rgba(2,3,10,0)");
        gr.addColorStop(0.45, `rgba(2,3,10,${dark * 0.6})`);
        gr.addColorStop(1, `rgba(2,3,10,${dark})`);
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
      }
      // vinheta
      const vg = ctx.createLinearGradient(0, h - 120, 0, h);
      vg.addColorStop(0, "rgba(3,6,14,0)");
      vg.addColorStop(1, "rgba(3,6,14,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, h - 120, w, 120);

      /* ---- HUD throttled ---- */
      hudT -= dt;
      if (hudT <= 0) {
        hudT = 0.15;
        setHud({
          hp: P.hp,
          cores: save.current.cores,
          kills: save.current.kills,
          biome: bi, region:ri, special:P.special,
          depth: layer ? layer.name : "SUPERFICIE",
          depthM: depth,
        });
        const ch=challenge.current;setChallengeHud(ch?`${ch.kind==="race"?"CUME":"CERCO"} · ${Math.ceil((ch.kind==="race"?RACE_TIME:60)-ch.time)}S${ch.kind==="survival"?` · ${save.current.kills-ch.kills}/5`:""}`:"");
      }
      saveT -= dt;
      if (saveT <= 0) {
        saveT = 4;
        save.current.x = P.x;
        save.current.y = P.y;
        persist();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      const P = player.current;
      save.current.x = P.x;
      save.current.y = P.y;
      persist();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  // limpa toast expirado
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => {
      if (toastRef.current === toast) {
        toastRef.current = null;
        setToast(null);
      }
    }, Math.max(0, toast.until - performance.now()));
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (mapOpen || journalOpen || accessOpen || busy) {
      setFound(explored.current.reduce((a, v) => a + v, 0));
      input.current = { left: false, right: false, run: false, jumpHeld: false, down: false };
      jumpBuf.current = 0;
      attackReq.current = false;
    }
  }, [mapOpen, journalOpen, accessOpen, busy]);

  const wonCount = won.filter((id) => world.sites.some((s) => s.t.id === id)).length;
  const biome = BIOMES[hud.biome];
  const region = world.regions[hud.region];

  return (
    <div ref={wrapRef} data-testid="world-map" style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#050a16" }}>
      <canvas ref={canvasRef} data-testid="world-canvas" style={{ position: "absolute", inset: 0, imageRendering: "pixelated" }} />

      {/* topo */}
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 6, pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, pointerEvents: "auto" }}>
          <button className="mk-title" onClick={onBack} style={hudBtn}>
            ◀ CIDADE
          </button>
          <div style={{ display: "flex", gap: 2 }} data-testid="hp">
            {Array.from({ length: MAX_HP }).map((_, i) => (
              <span key={i} style={{ width: 12, height: 12, background: i < hud.hp ? "#ff4a6a" : "rgba(255,74,106,0.18)", border: "2px solid #12030a", boxShadow: i < hud.hp ? "0 0 6px #ff4a6a" : "none" }} />
            ))}
          </div>
        </div>
        <div className="mk-title" style={{ ...hudBox, textAlign: "right", pointerEvents: "auto" }}>
          <div style={{ color: biome.color, fontSize: 7 }}>{region.name}</div>
          <div style={{ color: "#8fa8bd", fontSize: 6, marginTop: 3 }}>
            {hud.depth}
            {hud.depthM!==0?` · ${hud.depthM<0?"ALT +":"PROF "}${Math.abs(hud.depthM)*2}M`:""}
          </div>
          <div style={{ color: "#7fe9ff", fontSize: 7, marginTop: 4 }}>⬢ {hud.cores} · ✦ {hud.kills}</div>
          <div style={{ color: "#ffd23a", fontSize: 6, marginTop: 3 }}>
            🏆 {wonCount}/{world.sites.length} · $ {gold}
          </div>
          <button className="mk-title" data-testid="open-access" onClick={()=>setAccessOpen(true)} style={{...hudBtn,marginTop:5,width:"100%",color:"#ffd23a"}}>TORNEIOS [T]</button>
          <button className="mk-title" data-testid="open-journal" onClick={()=>setJournalOpen(true)} style={{...hudBtn,marginTop:5}}>DIARIO [Q]</button>
          <button className="mk-title" onClick={() => setMapOpen(true)} style={{ ...hudBtn, marginTop: 5, width: "100%" }} data-testid="open-map">
            MAPA [M]
          </button>
        </div>
      </div>

      {toast && (
        <div style={{ position: "absolute", top: "20%", left: 0, right: 0, textAlign: "center", zIndex: 7, pointerEvents: "none" }} className="mk-title">
          <div style={{ fontSize: 14, color: toast.color, textShadow: "3px 3px 0 #000, 0 0 18px " + toast.color, letterSpacing: 2 }}>{toast.text}</div>
          {toast.sub && <div style={{ fontSize: 7, color: "#dff6ff", marginTop: 8, textShadow: "2px 2px 0 #000" }}>{toast.sub}</div>}
        </div>
      )}

      {near && (
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 132, zIndex: 6, width: "min(92%, 340px)" }}>
          <div className="mk-title" style={{ ...hudBox, padding: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 8, color: playerLevel < near.t.requiredLevel ? "#ff6a5a" : "#35e2f0" }}>{near.t.name}</div>
            <div style={{ fontSize: 6, color: "#8fa8bd", marginTop: 4, lineHeight: 1.6 }}>
              {near.t.fights.length} LUTAS · NV {near.t.requiredLevel} · {near.t.element ?? ""}
              {near.kind === "cave" ? " · CAMARA SUBTERRANEA" : near.kind === "sky" ? " · ILHA CELESTE" : ""}
            </div>
            <div style={{ fontSize: 6, color: "#ffd23a", marginTop: 3 }}>
              PREMIO {near.t.reward.gold}$ · {near.t.reward.xp}XP{near.t.reward.robot ? " · NOVO ROBO" : ""}
            </div>
          </div>
          <button
            className="mk-title"
            data-testid="enter-site"
            onClick={enter}
            style={{ width: "100%", fontSize: 9, padding: "10px 14px", color: "#03121a", background: playerLevel < near.t.requiredLevel ? "#8a5a5a" : "var(--mk-accent)", border: "2px solid #03121a", boxShadow: "0 0 18px rgba(53,226,240,0.5)", cursor: "pointer" }}
          >
            {playerLevel < near.t.requiredLevel ? `SELADO · NV ${near.t.requiredLevel}` : won.includes(near.t.id) ? "REVANCHE [E]" : "ENTRAR [E]"}
          </button>
        </div>
      )}

      {challengeHud&&<div className="mk-title" data-testid="challenge-hud" style={{position:"absolute",top:140,left:10,color:"#ffd23a",fontSize:8,zIndex:7}}>{challengeHud}</div>}
      {activity && !near && <div style={{position:"absolute",bottom:146,left:12,right:12,zIndex:7}}>
        <button className="mk-title" data-testid="activity-action" onClick={interactActivity} style={{...hudBtn,width:"100%",minHeight:44,color:"#ffd23a",fontSize:8}}>{activity.name} [E]</button>
      </div>}
      <ExplorationControls onMove={(x,y)=>{analog.current={x,y};}} onJump={doJump} onJumpEnd={()=>input.current.jumpHeld=false}
        onAttack={()=>attackReq.current=true} onSpecial={()=>specialReq.current=true} cooldown={hud.special} disabled={mapOpen||journalOpen||accessOpen||busy}
        onInteract={enter} interactReady={!!near||!!activity} />
      {accessOpen && <TournamentAccess playerLevel={playerLevel} won={won} teamEmpty={teamEmpty} onClose={()=>setAccessOpen(false)}
        onEnter={(s)=>enterTournament(s.t)} onTravel={(s)=>{warpTo(s.tx*T,s.ty*T);setAccessOpen(false);}} />}
      {journalOpen && <WorldJournal region={region} save={save.current} onClose={()=>setJournalOpen(false)} onPersist={persist} />}

      {mapOpen && (
        <WorldMinimap
          explored={explored.current}
          found={found}
          px={player.current.x}
          py={player.current.y}
          won={won}
          playerLevel={playerLevel}
          lit={litLanterns.current}
          onWarp={warpTo}
          onEnterSite={(s) => { setMapOpen(false); enterTournament(s.t); }}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}

function WorldMinimap(props: {explored:Uint8Array;found:number;px:number;py:number;won:string[];playerLevel:number;lit:Set<number>;onWarp:(x:number,y:number)=>void;onEnterSite:(s:Site)=>void;onClose:()=>void}) {
  return <WorldAtlas {...props}/>;
}

const hudBox: React.CSSProperties = {
  background: "rgba(3,8,16,0.78)",
  border: "2px solid rgba(53,226,240,0.35)",
  padding: "6px 8px",
};
const hudBtn: React.CSSProperties = {
  fontSize: 7,
  padding: "6px 8px",
  color: "#dff6ff",
  background: "rgba(6,14,26,0.85)",
  border: "2px solid rgba(53,226,240,0.4)",
  cursor: "pointer",
};

