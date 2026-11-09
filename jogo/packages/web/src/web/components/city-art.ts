/* Asset manifest + cache for the connected city.
 * - one Image per URL, load/error tracking and progress for the loading veil
 * - canvas patterns and glow sprites are created once and reused every frame */
import { CITY_BUILDINGS, CITY_PLACES, PROP_ART } from '@/game/connected-city';

export const PREMIUM = {
 skylineCentral:'/city-premium/skyline-central.webp',
 skylineIndustrial:'/city-premium/skyline-industrial.webp',
 metroWall:'/city-premium/metro-wall.webp',
 entrance:'/city-premium/metro-entrance.png',
 pavement:'/city-premium/pavement.png',
 asphalt:'/city-premium/asphalt.png',
 platform:'/city-premium/platform.png',
 ballast:'/city-premium/ballast.png',
 traffic:'/city/traffic.png',
} as const;

/** Atlas crops from the original `/city/traffic.png` (all sprites face right). */
export const TRAFFIC_SPRITES = {
 carrier:{x:0,y:0,w:560,h:299}, blimp:{x:562,y:0,w:480,h:232}, cargo:{x:0,y:301,w:500,h:208},
 train:{x:502,y:301,w:540,h:170}, truck:{x:0,y:511,w:280,h:158}, jets:{x:282,y:511,w:170,h:120},
 drone:{x:454,y:511,w:104,h:108}, taxi:{x:560,y:511,w:196,h:89}, car:{x:758,y:511,w:200,h:84},
} as const;
export type TrafficSprite = keyof typeof TRAFFIC_SPRITES;

/** Needed before the first frame looks right; the rest streams in behind the veil timeout. */
export const CRITICAL_ART:string[]=[
 ...Object.values(PREMIUM),
 ...CITY_BUILDINGS.map(b=>b.art),
];
export const STREAMED_ART:string[]=[
 ...new Set([...Object.values(PROP_ART).map(p=>p.art),...CITY_PLACES.map(p=>p.art)]),
];

export type Glow='cyan'|'amber'|'white'|'magenta';
const GLOW_RGB:Record<Glow,string>={cyan:'72,226,240',amber:'255,190,92',white:'220,248,255',magenta:'255,95,208'};

export class CityArt {
 private imgs=new Map<string,HTMLImageElement>();
 private failed=new Set<string>();
 private patterns=new Map<string,CanvasPattern|null>();
 private glows=new Map<Glow,HTMLCanvasElement>();
 get(src:string){
  let im=this.imgs.get(src);
  if(!im){im=new Image();im.decoding='async';im.onerror=()=>this.failed.add(src);im.src=src;this.imgs.set(src,im);}
  return im;
 }
 ready(src:string){const im=this.get(src);return im.complete&&im.naturalWidth>0;}
 settled(src:string){const im=this.get(src);return this.failed.has(src)||(im.complete&&im.naturalWidth>0);}
 preload(list:string[]){list.forEach(src=>this.get(src));}
 progress(list:string[]){return list.length?list.filter(s=>this.settled(s)).length/list.length:1;}
 failures(){return [...this.failed];}
 /** World-anchored pattern; `scale` = world units per texture pixel. Null until the image has loaded. */
 pattern(ctx:CanvasRenderingContext2D,src:string,scale:number){
  const key=src+'@'+scale;
  if(this.patterns.has(key))return this.patterns.get(key)!;
  if(!this.ready(src))return null;
  const p=ctx.createPattern(this.get(src),'repeat');
  if(p&&scale!==1)p.setTransform(new DOMMatrix().scale(scale));
  this.patterns.set(key,p);return p;
 }
 glow(color:Glow){
  let c=this.glows.get(color);
  if(!c){
   c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
   const r=g.createRadialGradient(64,64,0,64,64,64);const rgb=GLOW_RGB[color];
   r.addColorStop(0,`rgba(${rgb},.85)`);r.addColorStop(.25,`rgba(${rgb},.42)`);r.addColorStop(.6,`rgba(${rgb},.12)`);r.addColorStop(1,`rgba(${rgb},0)`);
   g.fillStyle=r;g.fillRect(0,0,128,128);this.glows.set(color,c);
  }
  return c;
 }
}
