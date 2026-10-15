/* ---------------------------------------------------------------------------
 * Fase G5 — Mundo dos Torneios expandido.
 *
 * Mundo 2D em tiles, estilo Terraria / Hollow Knight Silksong:
 *   28.600 x 6.400 tiles de 32px (100x a area do mundo G4 de 2860 x 640).
 *   Gerado sob demanda em chunks de 64x64 (cache LRU de 80 chunks).
 *
 * 205 regioes (uma por torneio) com bioma derivado, 6 estratos subterraneos,
 * torre de ascensao ate o ceu alto e poco de mina ate o nucleo por regiao.
 * Cada um dos torneios vira um predio fisico: na superficie, numa camara
 * subterranea (com poco de acesso) ou numa ilha no ceu (com escadaria).
 *
 * Toda a arte (tiles, props, predios, inimigos, itens, fundos) foi gerada
 * por IA em pixel art — ver assets/process_map_g4.py.
 * ------------------------------------------------------------------------- */

import { TOURNAMENTS, type TournamentDef } from "./tournaments";

export const T = 32; // tamanho do tile em px de mundo
export const WW = 28600; // largura em tiles
export const WH = 6400; // altura em tiles
export const BIOME_W = 2384; // largura de cada bioma em tiles (12 * 238 = 2856)

export const AIR = 0;
export const SOLID = 1;
export const PLAT = 2; // plataforma de mao unica (so colide caindo)
export const BRICK = 3; // estrutura construida

export type BiomeId =
  | "dojo"
  | "jungle"
  | "desert"
  | "city"
  | "frozen"
  | "toxic"
  | "foundry"
  | "storm"
  | "abyss"
  | "volcano"
  | "sky"
  | "nebula";

export type TileSet = BiomeId | "ruin" | "crystal";

export interface TileRoles {
  top: number;
  body: number[];
  deep: number[];
  brick: number[];
}

/** Papeis de cada quadro do atlas de 16 tiles gerado por IA. */
export const TILE_ROLES: Record<TileSet, TileRoles> = {
  dojo: { top: 0, body: [1, 9, 15], deep: [15, 1], brick: [2, 4, 12] },
  jungle: { top: 0, body: [1, 8, 2], deep: [2, 3, 6], brick: [14, 15] },
  desert: { top: 6, body: [0, 1, 4], deep: [5, 10, 9], brick: [2, 7, 3] },
  city: { top: 7, body: [0, 8, 6], deep: [5, 11, 4], brick: [1, 3, 9] },
  frozen: { top: 1, body: [6, 9, 7], deep: [2, 3, 8], brick: [4, 14] },
  toxic: { top: 4, body: [1, 5, 9], deep: [11, 15, 8], brick: [6, 13] },
  foundry: { top: 5, body: [0, 6, 9, 11], deep: [8, 12, 14], brick: [1, 7, 3] },
  storm: { top: 1, body: [0, 4, 8], deep: [9, 13, 10], brick: [4, 12] },
  abyss: { top: 4, body: [0, 5, 1, 9], deep: [10, 13, 8], brick: [2, 8, 12] },
  volcano: { top: 3, body: [0, 2, 11], deep: [8, 1, 7], brick: [5, 12] },
  sky: { top: 1, body: [0, 4, 15], deep: [2, 14], brick: [11, 8] },
  nebula: { top: 5, body: [0, 8, 1], deep: [6, 9, 4], brick: [3, 10, 11] },
  ruin: { top: 7, body: [6, 8, 0, 1], deep: [8, 6, 13], brick: [1, 15, 4] },
  crystal: { top: 4, body: [5, 1, 8, 14], deep: [6, 10, 0], brick: [8, 2] },
};

export interface BiomeDef {
  id: BiomeId;
  name: string;
  sub: string;
  /** altura base da superficie (tiles a partir do topo). */
  base: number;
  /** amplitude do relevo. */
  amp: number;
  /** cor do mapa (minimapa). */
  color: string;
  /** cor do ceu (fallback / neblina). */
  sky: string;
  /** particulas ambiente. */
  fx: "petals" | "spores" | "sand" | "neon" | "snow" | "toxic" | "embers" | "rain" | "bubbles" | "ash" | "feathers" | "stars";
  /** quadros do atlas de inimigos. */
  mobs: number[];
  /** predios: [atlas, quadro][] */
  builds: [string, number][];
}

export const BIOMES: BiomeDef[] = [
  { id: "dojo", name: "VALE DOJO", sub: "ONDE TODO CAMPEAO COMECA", base: 200, amp: 10, color: "#5d9c4a", sky: "#f2b9a0", fx: "petals", mobs: [15, 0], builds: [["c", 0], ["c", 1], ["c", 2], ["c", 3]] },
  { id: "jungle", name: "SELVA ESMERALDA", sub: "RAIZES MAIS ANTIGAS QUE O METAL", base: 196, amp: 22, color: "#2f8a3c", sky: "#7fb58a", fx: "spores", mobs: [5, 6], builds: [["a", 0], ["a", 1], ["a", 2], ["a", 3]] },
  { id: "desert", name: "DUNAS DE OCRE", sub: "O SOL FORJA OS FORTES", base: 206, amp: 12, color: "#d4a04a", sky: "#f0c27a", fx: "sand", mobs: [7, 1], builds: [["a", 4], ["a", 5], ["a", 6], ["a", 7]] },
  { id: "city", name: "METROPOLE NEON", sub: "A ARENA NUNCA DORME", base: 192, amp: 6, color: "#3fc7d8", sky: "#1b1840", fx: "neon", mobs: [2, 1], builds: [["a", 8], ["a", 9], ["a", 10], ["a", 11]] },
  { id: "frozen", name: "TUNDRA GLACIAL", sub: "SO OS CIRCUITOS FRIOS SOBREVIVEM", base: 186, amp: 30, color: "#b6e4f5", sky: "#c8dff0", fx: "snow", mobs: [4, 9], builds: [["c", 4], ["c", 5], ["c", 6], ["c", 7]] },
  { id: "toxic", name: "ERMO TOXICO", sub: "O AR CORROI ATE O TITANIO", base: 204, amp: 16, color: "#8fc23a", sky: "#6f8a3a", fx: "toxic", mobs: [13, 6], builds: [["b", 8], ["b", 9], ["b", 10], ["b", 11]] },
  { id: "foundry", name: "FUNDICAO TITANICA", sub: "ONDE NASCEM OS CHASSIS", base: 198, amp: 10, color: "#b0643a", sky: "#6a3a24", fx: "embers", mobs: [12, 0], builds: [["b", 4], ["b", 5], ["b", 6], ["b", 7]] },
  { id: "storm", name: "PLANALTO DA TEMPESTADE", sub: "RAIOS ESCOLHEM SEUS CAMPEOES", base: 180, amp: 34, color: "#6c7f9c", sky: "#3c4660", fx: "rain", mobs: [14, 11], builds: [["b", 14], ["b", 15], ["b", 12], ["b", 13]] },
  { id: "abyss", name: "FOSSA ABISSAL", sub: "A PRESSAO ESMAGA OS FRACOS", base: 236, amp: 18, color: "#2a5a8a", sky: "#0c2440", fx: "bubbles", mobs: [8, 10], builds: [["a", 12], ["a", 13], ["a", 14], ["a", 15]] },
  { id: "volcano", name: "CALDEIRA VULCANICA", sub: "O CHAO RESPIRA FOGO", base: 196, amp: 26, color: "#d2452a", sky: "#4a1a14", fx: "embers", mobs: [3, 12], builds: [["c", 8], ["c", 9], ["c", 10], ["c", 11]] },
  { id: "sky", name: "SANTUARIO CELESTE", sub: "ACIMA DAS NUVENS, OS LENDARIOS", base: 160, amp: 20, color: "#f3e7c4", sky: "#a8d4f0", fx: "feathers", mobs: [9, 2], builds: [["c", 12], ["c", 13], ["c", 14], ["c", 15]] },
  { id: "nebula", name: "VAZIO NEBULAR", sub: "O ULTIMO TORNEIO DO UNIVERSO", base: 190, amp: 24, color: "#8a4ad8", sky: "#140a30", fx: "stars", mobs: [10, 2], builds: [["d", 0], ["d", 1], ["d", 2], ["d", 3], ["d", 4], ["d", 5], ["d", 6], ["d", 7]] },
];

export interface DepthLayer {
  set: TileSet;
  name: string;
  sub: string;
  /** profundidade (tiles abaixo da superficie) onde comeca. */
  from: number;
  bg: string;
  color: string;
  mobs: number[];
  builds: [string, number][];
}

export const DEPTHS: DepthLayer[] = [
  { set: "ruin", name: "CATACUMBAS ANTIGAS", sub: "UM REINO ESQUECIDO SOB A AREIA", from: 34, bg: "ruin", color: "#4c6a64", mobs: [0, 11, 1], builds: [["b", 12], ["b", 13]] },
  { set: "crystal", name: "GRUTAS DE CRISTAL", sub: "A LUZ AQUI E VIVA", from: 190, bg: "crystal", color: "#9a5ad0", mobs: [10, 11], builds: [["b", 0], ["b", 1], ["b", 2], ["b", 3]] },
  { set: "volcano", name: "NUCLEO DE MAGMA", sub: "O CORACAO DO PLANETA", from: 330, bg: "volcano", color: "#a8321c", mobs: [3, 12], builds: [["c", 8], ["c", 10]] },
];

export const CHAMPION_BUILDS: [string, number][] = [["d", 8], ["d", 9], ["d", 10], ["d", 11]];
export const OUTPOST_BUILDS: [string, number][] = [["d", 12], ["d", 13], ["d", 14], ["d", 15]];

/* ------------------------------ ruido ------------------------------ */

function hash(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
export function hash2(x: number, y: number, s = 0): number {
  return hash(Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s + 1, 1442695041));
}
const smooth = (t: number) => t * t * (3 - 2 * t);
export function noise1(x: number, s: number): number {
  const i = Math.floor(x);
  const f = smooth(x - i);
  const a = hash2(i, 0, s);
  const b = hash2(i + 1, 0, s);
  return a + (b - a) * f;
}
function noise2(x: number, y: number, s: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash2(ix, iy, s);
  const b = hash2(ix + 1, iy, s);
  const c = hash2(ix, iy + 1, s);
  const d = hash2(ix + 1, iy + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** gerador pseudo-aleatorio deterministico. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------ tipos ------------------------------ */

export type SiteKind = "surface" | "cave" | "sky";

export interface Site {
  t: TournamentDef;
  /** centro da porta, em tiles. */
  tx: number;
  /** linha do chao (primeiro tile solido sob a porta). */
  ty: number;
  kind: SiteKind;
  art: [string, number];
  champion: boolean;
}

export interface Prop {
  set: TileSet;
  f: number;
  x: number; // px mundo (centro)
  y: number; // px mundo (base)
  s: number; // escala
}

export interface Spawn {
  id: number;
  f: number; // quadro do atlas de inimigos
  x: number;
  y: number;
  fly: boolean;
}

export type ItemKind = "core" | "heal" | "chest" | "lantern";
export interface Pickup {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
}

export interface Outpost {
  tx: number;
  ty: number;
  art: [string, number];
}

export interface Region {
  index: number; id: string; name: string; start: number; end: number;
  family: number; secondary: number; color: string; hue: number; terrain: string;
  skyX: number; shaftX: number; peak: number; site: Site;
  /** row of the one-way bridge over the mine entrance (lowest ground around it). */
  bridge: number;
}
export interface Chunk { x: number; y: number; tiles: Uint8Array; props: Prop[]; spawns: Spawn[]; items: Pickup[] }
export interface ActivityPoint { id: string; region: number; kind: "mission" | "quick" | "race" | "survival" | "repair" | "relic"; x: number; y: number; name: string }
export interface World {
  surf: Int16Array; sites: Site[]; regions: Region[]; props: Prop[]; spawns: Spawn[]; items: Pickup[];
  outposts: Outpost[]; lanterns: Pickup[]; activities: ActivityPoint[];
  chunks: Map<number, Chunk>; generated: number; lastKey: number; lastChunk: Chunk | null;
  /** lanterns grouped by region: per-frame checks only scan the neighbourhood. */
  regionLanterns: Pickup[][];
}
export const CHUNK = 64;
export const MAX_CHUNKS = 80;
export const REGION_W = WW / TOURNAMENTS.length;
export const idx = (x: number, y: number) => y * WW + x;
export function regionAt(tx: number): number { return Math.max(0, Math.min(TOURNAMENTS.length - 1, Math.floor(tx / REGION_W))); }
export function biomeAt(tx: number): number { return getWorld().regions[regionAt(tx)].family; }
export function depthLayerAt(depth: number): DepthLayer | null {
  let d: DepthLayer | null = null;
  for (const l of DEPTHS) if (depth >= l.from) d = l;
  return d;
}
export function tileSetAt(w: World, tx: number, ty: number): TileSet {
  const r = w.regions[regionAt(tx)];
  const depth = ty - w.surf[Math.max(0, Math.min(WW - 1, tx))];
  if (depth < -180) return hash2(tx >> 4, ty >> 4, r.index) < .2 ? BIOMES[r.secondary].id : "sky";
  const l = depthLayerAt(depth);
  if (l) return l.set;
  return BIOMES[hash2(tx >> 3, ty >> 3, r.index) < .24 ? r.secondary : r.family].id;
}
// Six strata use existing atlases: no extra texture calls or generation credits.
DEPTHS.splice(0, DEPTHS.length,
  { ...DEPTHS[0], from: 35 }, { ...DEPTHS[1], from: 420 }, { ...DEPTHS[2], from: 1100 },
  { ...DEPTHS[0], name: "NECROPOLE MECANICA", sub: "OS GUARDIOES AINDA VIGIAM", from: 1900, bg: "abyss", set: "abyss", color: "#2a5a8a" },
  { ...DEPTHS[1], name: "GEODOS PRIMORDIAIS", sub: "RELIQUIAS DO PRIMEIRO MUNDO", from: 2800 },
  { ...DEPTHS[2], name: "FORJA DO NUCLEO", sub: "O LIMITE INFERIOR DO COLOSSO", from: 3700 });
let cache: World | null = null;
export function getWorld(): World { if (!cache) cache = generate(); return cache; }
function familyFor(t: TournamentDef, i: number): number {
  const e = (t.element ?? "").toUpperCase();
  const words = ["TERRA|SAMURAI|DOJO", "BIO|SELVA|RAIZ", "AREIA|DUNA|DESERTO", "PLASMA|NEON|METAL", "GELO|POLAR|CRIO", "VENENO|TOX|ACIDO", "FERRO|FORJA|FERRUGEM", "TROVAO|RAIO|TEMPESTADE", "AGUA|ABISS|OCEANO", "FOGO|CHAMA|MAGMA", "VENTO|CEU|LUZ", "COSMI|VAZIO|SOMBRA|TEMPO"];
  const f = words.findIndex(w => new RegExp(w).test(e));
  return f >= 0 ? f : Math.floor(i * 12 / TOURNAMENTS.length);
}
function generate(): World {
  const surf = new Int16Array(WW);
  const ordered = [...TOURNAMENTS].sort((a,b)=>a.requiredLevel-b.requiredLevel||a.id.localeCompare(b.id));
  const sites: Site[] = [], regions: Region[] = [], lanterns: Pickup[] = [], outposts: Outpost[] = [], activities: ActivityPoint[] = [];
  const terrain = ["BOSQUE", "ESCARPAS", "JARDINS", "DESFILADEIRO", "RUINAS", "TERRACOS", "PLANALTO", "VALE"];
  const kindFor = (i:number): SiteKind => i===0||i>=ordered.length-4 ? "surface" : ["surface","cave","sky"][i%3] as SiteKind;
  // Surface pass: mountain per region, flat door plaza, then a Lipschitz clamp so
  // every step is at most one tile (the player's automatic step height).
  for(let x=0;x<WW;x++){const i=regionAt(x),local=x-Math.ceil(i*REGION_W);
    surf[x]=1960+Math.round(Math.sin(x/180)*28)-Math.max(0,36-Math.abs(local-65));}
  ordered.forEach((_,i)=>{if(kindFor(i)!=="surface")return;const tx=Math.ceil(i*REGION_W)+24;for(let x=tx-5;x<=tx+5;x++)surf[x]=surf[tx];});
  for(let x=1;x<WW;x++)surf[x]=Math.max(surf[x-1]-1,Math.min(surf[x-1]+1,surf[x]));
  ordered.forEach((t,i)=>{
    const start = Math.ceil(i * REGION_W), end = Math.ceil((i+1)*REGION_W)-1;
    const family = familyFor(t,i), secondary = (family + 1 + i % 5) % 12;
    const ground = 1960 + Math.round(Math.sin(i*.6)*28);
    const skyX = start+76, shaftX=start+112, peak=surf[skyX];
    const kind = kindFor(i);
    const tx = kind === "sky" ? skyX : kind === "cave" ? shaftX-15 : start+24;
    const ty = kind === "sky" ? 180+Math.floor(hash2(i,1)*1250) : kind === "cave" ? ground+210+Math.floor(hash2(i,2)*2900) : surf[tx];
    const builds=kind==="cave"?(depthLayerAt(ty-ground)??DEPTHS[0]).builds:BIOMES[family].builds;
    const site:Site={t,tx,ty,kind,champion:i>=ordered.length-4,art:builds[i%builds.length]};
    const hue=(i*137.508)%360;
    // Unique hex color, safe for minimap image data.
    const rgb=[0,120,240].map(k=>Math.round(130+90*Math.cos((hue+k)*Math.PI/180)));
    const color="#"+rgb.map(v=>v.toString(16).padStart(2,"0")).join("");
    const r:Region={index:i,id:t.id,name:terrain[i%terrain.length]+" · "+t.name.replace(/^COPA /,""),start,end,family,secondary,color,hue:(i%7-3)*8,terrain:terrain[i%terrain.length],skyX,shaftX,peak,site,bridge:0};
    regions.push(r);sites.push(site);
    const camp=start+8;
    outposts.push({tx:camp,ty:surf[camp],art:OUTPOST_BUILDS[i%4]});
    let lid=i*100;
    lanterns.push({id:++lid,kind:"lantern",x:camp*T,y:surf[camp]*T});
    lanterns.push({id:++lid,kind:"lantern",x:(tx-4)*T,y:ty*T});
    // Tower landings and mine galleries have checkpoints every 180 tiles.
    for(let y=180;y<peak-30;y+=180)lanterns.push({id:++lid,kind:"lantern",x:skyX*T,y:y*T});
    for(let y=2160;y<WH-80;y+=180)lanterns.push({id:++lid,kind:"lantern",x:(shaftX-4)*T,y:y*T});
    const kinds:ActivityPoint["kind"][]=["mission","quick","race","survival","repair","relic"];
    kinds.forEach((kind,k)=>{
      const x=kind==="relic"?shaftX-4:start+10+k*17;
      const y=kind==="relic"?WH-100:surf[x];
      activities.push({id:`${t.id}:${kind}`,region:i,kind,x:x*T,y:y*T,name:{mission:"POSTO DE MISSOES",quick:"DUELO RAPIDO",race:"TRILHA DOS CUMES",survival:"CERCO DOS GUARDIOES",repair:"OFICINA DE CAMPO",relic:"RELIQUIA PRIMORDIAL"}[kind]});
    });
  });
  for(const r of regions){let b=0;for(let x=r.shaftX-6;x<=r.shaftX+6;x++)b=Math.max(b,surf[x]);r.bridge=b;}
  const regionLanterns:Pickup[][]=regions.map(()=>[]);
  for(const L of lanterns)regionLanterns[regionAt(L.x/T)].push(L);
  return {surf,sites,regions,lanterns,outposts,activities,regionLanterns,props:[],spawns:[],items:[],chunks:new Map(),generated:0,lastKey:-1,lastChunk:null};
}
/** Analytic terrain + guaranteed route overrides, independent of chunk order.
 *  Every vertical route is a ladder of one-way platforms spaced 3 tiles apart
 *  (a single jump reaches 4.3 tiles), verified by assets/verify_routes.ts. */
export function terrainTile(w:World,x:number,y:number):number {
  if(x<3||x>=WW-3||y<0||y>=WH-3)return SOLID;
  const r=w.regions[regionAt(x)],s=w.surf[x],site=r.site,dx=x-site.tx;
  if(site.kind==="sky"){
    // Island door: wide landing, side ladders keep the tower climb continuous.
    if(Math.abs(dx)<=9&&y>=site.ty-10&&y<=site.ty+2)return y===site.ty?PLAT:y<site.ty&&Math.abs(dx)>=6&&y%3===0?PLAT:AIR;
  } else if(site.kind==="cave"&&Math.abs(dx)<=9&&y>=site.ty-10&&y<=site.ty+2)return y>=site.ty?SOLID:AIR;
  // Mine shaft: a one-way bridge at the surface, alternating side ledges every 3 tiles
  // (the centre column stays free for a quick fall / updraft), gallery landing every 180.
  if(Math.abs(x-r.shaftX)<=5&&y>=s&&y<WH-20){
    if(y<r.bridge)return AIR;
    if(y===r.bridge||(y>=2160&&y%180===0))return PLAT;
    if(y<r.bridge+3)return AIR;
    if(site.kind==="cave"&&y===site.ty&&x<r.shaftX)return PLAT; // porch to the cave arena
    if(y%3!==0)return AIR;
    const off=Math.floor(y/3)%2===0?-3:3;
    return Math.abs(x-r.shaftX-off)<=2?PLAT:AIR;
  }
  // Ascension tower: only carves open sky (never the mountain). Alternating ledges,
  // an outer ladder on both edges, rest landing every 90 and a free updraft column.
  if(Math.abs(x-r.skyX)<=7&&y>=81&&y<s){
    if(y%90===0)return PLAT;
    if(y%3!==0)return AIR;
    const d=x-r.skyX,off=Math.floor(y/3)%2===0?-3:3;
    return Math.abs(d-off)<=2||Math.abs(d)>=6?PLAT:AIR;
  }
  // Top sanctuary, mine galleries and relic chamber.
  if(Math.abs(x-r.skyX)<=14&&y>=72&&y<=82)return y===80?PLAT:AIR;
  if(y>=2160&&Math.abs(x-r.shaftX)<=26&&y%180>=171)return AIR;
  if(y>=2160&&Math.abs(x-r.shaftX)<=26&&y%180===0)return SOLID;
  if(Math.abs(x-(r.shaftX-4))<=7&&y>=WH-111&&y<=WH-98)return y>=WH-100?SOLID:AIR;
  if(y<s)return AIR;
  if(y<s+8||y>=WH-12)return SOLID;
  const big=noise2(x/24,y/17,11), worm=noise2(x/11,y/8,12);
  return big>.57||Math.abs(worm-.5)<.065?AIR:SOLID;
}
function makeChunk(w:World,cx:number,cy:number):Chunk {
  const tiles=new Uint8Array(CHUNK*CHUNK),props:Prop[]=[],spawns:Spawn[]=[],items:Pickup[]=[];
  for(let ly=0;ly<CHUNK;ly++)for(let lx=0;lx<CHUNK;lx++)tiles[ly*CHUNK+lx]=terrainTile(w,cx*CHUNK+lx,cy*CHUNK+ly);
  for(let ly=3;ly<CHUNK;ly++)for(let lx=1;lx<CHUNK-1;lx++) {
    const x=cx*CHUNK+lx,y=cy*CHUNK+ly;
    const v=tiles[ly*CHUNK+lx];
    if(v!==SOLID&&v!==PLAT)continue;
    if(terrainTile(w,x,y-1)!==AIR||terrainTile(w,x,y-2)!==AIR)continue;
    const r=w.regions[regionAt(x)],set=tileSetAt(w,x,y),id=idx(x,y)*4;
    const safe=Math.abs(x-r.site.tx)<12&&Math.abs(y-r.site.ty)<15||x<40||Math.abs(x-r.skyX)<8||Math.abs(x-r.shaftX)<6;
    const h=hash2(x,y,40);
    if(h<.13&&!safe)props.push({set,f:Math.floor(hash2(x,y,41)*16),x:x*T+16,y:y*T,s:1+hash2(x,y,42)*.5});
    if(h>.82&&!safe){
      const pool=(depthLayerAt(y-w.surf[x])?.mobs??BIOMES[r.family].mobs);
      const f=pool[Math.floor(hash2(x,y,43)*pool.length)];
      const fly=[2,6,8,9,11,14].includes(f);
      spawns.push({id:id+1,f,x:x*T+16,y:y*T-(fly?65:0),fly});
    }
    if(h>.30&&h<.38)items.push({id:id+2,kind:h<.32?"chest":h>.365?"heal":"core",x:x*T+16,y:y*T});
  }
  return {x:cx,y:cy,tiles,props,spawns,items};
}
export function chunkAt(w:World,cx:number,cy:number):Chunk {
  const key=cy*Math.ceil(WW/CHUNK)+cx;
  // Fast path: consecutive tile reads almost always hit the same chunk.
  if(key===w.lastKey&&w.lastChunk)return w.lastChunk;
  let c=w.chunks.get(key);
  if(c){w.chunks.delete(key);w.chunks.set(key,c);}
  else {
    c=makeChunk(w,cx,cy);w.generated++;w.chunks.set(key,c);
    if(w.chunks.size>MAX_CHUNKS)w.chunks.delete(w.chunks.keys().next().value!);
  }
  w.lastKey=key;w.lastChunk=c;
  return c;
}
export function tileAt(w:World,x:number,y:number):number {
  if(x<0||x>=WW||y<0||y>=WH)return SOLID;
  const cx=Math.floor(x/CHUNK),cy=Math.floor(y/CHUNK);
  return chunkAt(w,cx,cy).tiles[(y-cy*CHUNK)*CHUNK+x-cx*CHUNK];
}
/** Only nearby chunks contribute actors; bounded independently of world area. */
export function streamWorld(w:World,px:number,py:number):void {
  const cx=Math.floor(px/T/CHUNK),cy=Math.floor(py/T/CHUNK);
  const chunks:Chunk[]=[];
  for(let yy=Math.max(0,cy-1);yy<=Math.min(Math.ceil(WH/CHUNK)-1,cy+1);yy++)
    for(let xx=Math.max(0,cx-1);xx<=Math.min(Math.ceil(WW/CHUNK)-1,cx+1);xx++)chunks.push(chunkAt(w,xx,yy));
  w.props=chunks.flatMap(c=>c.props);w.spawns=chunks.flatMap(c=>c.spawns);w.items=chunks.flatMap(c=>c.items);
}
/** Updraft columns: holding jump inside them lifts the player (tower and mine). */
export function liftAt(w:World,tx:number,ty:number):boolean {
  const r=w.regions[regionAt(tx)];
  if(Math.abs(tx-r.skyX)<=1&&ty>=78&&ty<w.surf[tx])return true;
  return Math.abs(tx-r.shaftX)<=1&&ty>r.bridge&&ty<WH-20;
}

export type RouteKind = "sky" | "deep" | "climb";
/** Guaranteed standing waypoints (tile x, floor row). Shared by the atlas and
 *  assets/verify_routes.ts, which replays every hop with the real player physics. */
export function routeFor(w:World,r:Region,kind:RouteKind): {x:number;y:number}[] {
  const pts:{x:number;y:number}[]=[];
  if(kind==="sky"){
    const x=r.skyX+6,s=w.surf[x];
    const rows=new Set<number>([80]);
    for(let y=81;y<s;y++)if(y%3===0)rows.add(y);
    if(r.site.kind==="sky")rows.add(r.site.ty);
    pts.push({x,y:s});
    for(const y of [...rows].sort((a,b)=>b-a))pts.push({x,y});
    return pts;
  }
  const off=(y:number)=>r.shaftX+(Math.floor(y/3)%2===0?-3:3);
  if(kind==="deep"){
    pts.push({x:r.shaftX,y:r.bridge});
    for(let y=2160;y<=WH-100;y+=180)pts.push({x:r.shaftX,y});
    return pts;
  }
  let last=r.shaftX;
  for(let y=WH-100;y>=r.bridge+3;y-=3){last=off(y);pts.push({x:last,y});}
  pts.push({x:last,y:r.bridge});
  return pts;
}

/* ------------------------------ save do mundo ------------------------------ */

export const EXPLORE_CELL = 64; // tiles por celula de exploracao
export const EX_W = Math.ceil(WW / EXPLORE_CELL);
export const EX_H = Math.ceil(WH / EXPLORE_CELL);

export interface WorldSave {
  x: number;
  y: number;
  lantern: number;
  lanterns: number[];
  chests: number[];
  explored: string; // bitmap compacto EX_W*EX_H em base36 por blocos
  cores: number;
  kills: number;
  biomes: number[];
  collected: number[];
  relics: string[];
  completed: string[];
  quests: Record<string, { start: number; value: number; done: boolean }>;
  quickWins: number;
}

const KEY = "mc_world_g5";

export function loadWorldSave(): WorldSave {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<WorldSave>;
      return {
        x: p.x ?? 40 * T,
        y: p.y ?? 0,
        lantern: p.lantern ?? 0,
        lanterns: p.lanterns ?? [],
        chests: p.chests ?? [],
        explored: p.explored ?? "",
        cores: p.cores ?? 0,
        kills: p.kills ?? 0,
        biomes: p.biomes ?? [],
        collected: p.collected ?? [], relics: p.relics ?? [], completed: p.completed ?? [], quests: p.quests ?? {}, quickWins: p.quickWins ?? 0,
      };
    }
  } catch {
    /* save corrompido -> novo */
  }
  // Preserve economic progress from G4; coordinates/checkpoints changed topology.
  let old:Partial<WorldSave>={};
  try { old=JSON.parse(localStorage.getItem("mc_world_g4")??"{}"); } catch { /* no legacy save */ }
  return { x: 24*T, y: 0, lantern: 0, lanterns: [], chests: [], explored: "", cores: old.cores??0, kills: old.kills??0, biomes: [], collected: [], relics: [], completed: [], quests: {}, quickWins: 0 };
}

export function saveWorld(s: WorldSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* sem espaco */
  }
}

export function decodeExplored(s: string): Uint8Array {
  const out = new Uint8Array(EX_W * EX_H);
  for (let i = 0; i < s.length && i < out.length; i++) out[i] = s.charCodeAt(i) === 49 ? 1 : 0;
  return out;
}
export function encodeExplored(a: Uint8Array): string {
  let s = "";
  for (let i = 0; i < a.length; i++) s += a[i] ? "1" : "0";
  return s;
}

/** sitio de cada torneio (para a busca do minimapa). */
export function siteFor(w: World, id: string): Site | undefined {
  return w.sites.find((s) => s.t.id === id);
}
