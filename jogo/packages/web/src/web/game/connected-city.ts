import type { Screen } from '@/screens/menu';
import { METRO_STOPS } from './city-life';

export const CITY_WIDTH = 8600;
export const SUBWAY_LEVEL = 720;
export type Point = { x: number; z: number };
/** `z` is the solid footprint edge facing the avenue; `faceZ` is where the facade art stands. */
export type CityBuilding = Point & { id: Exclude<Screen,'menu'>; label: string; art: string; w: number; h: number; front: boolean; faceZ: number; doorZ: number };
const definitions: [Exclude<Screen,'menu'>, string, string, number][] = [
 ['roster','HANGAR','hangar',300], ['shop','LOJA','shop',780], ['modes','ARENA','arena',1300],
 ['ranked','TORRE RANQUEADA','ranked',1830], ['tournaments','COLISEU','tourney',2320],
 ['engineer','FORJA','engineer',2820], ['pets','RANCHO DOS PETS','pets',3320],
 ['cards','SALÃO DE CARDS','cards',3800], ['mine','MINA PROFUNDA','mine',4320],
 ['lab','LABORATÓRIO','lab',4840], ['observatory','OBSERVATÓRIO','observatory',5370],
 ['academy','ACADEMIA','academy',5890], ['contracts','CONTRATOS','contracts',6410],
 ['power','USINA','power',6930], ['museum','MUSEU','museum',7470], ['portal','PORTAL','portal',8020],
];
export const CITY_BUILDINGS: CityBuilding[] = definitions.map(([id,label,art,x],i)=>{
 const front=!!(i%2),z=front?280:-240;
 return {id,label,art:`/city/b_${art}.png`,x,z,w:220,h:230+(i%3)*15,front,faceZ:front?z+22:z,doorZ:front?z-26:z+26};
});
/** Each stair leaves the south pavement and lands on the same district's platform.
 *  The portal stop sits east of its building so the canopy never overlaps a facade. */
export const STATIONS = METRO_STOPS.map(stop=>{
 const entryX=stop.id==='portal'?8250:stop.x+190;
 const exitX=stop.id==='portal'?8380:entryX+150;
 const trainX=stop.id==='portal'?8470:entryX+320;
 return {...stop,entryX,entryZ:185,exitX,trainX};
});
export type Station = (typeof STATIONS)[number];
export const CITY_PLACES = [
 {id:'supermarket',name:'SUPERMERCADO ÓRBITA',x:1040,z:-230,art:'/city-sprites/009.png'},
 {id:'npc',name:'PRAÇA / LYRA',x:1550,z:190,art:'/overhaul/pilot.webp'},
 {id:'construction',name:'CANTEIRO / NARA',x:3050,z:-180,art:'/city-sprites/280.png'},
 {id:'museum',name:'MUSEU DE MINERAIS',x:7740,z:-230,art:'/city-sprites/010.png'},
];

/* ---------- Street furniture: AI props + original props, only on the curb band ---------- */
export type PropKind='lamp'|'bench'|'vending'|'terminal'|'planter'|'crates'|'signal'|'trash'|'sign'|'antenna'|'oldVending';
export const PROP_ART:Record<PropKind,{art:string;w:number;h:number;hit:number}>={
 lamp:{art:'/city-premium/lamp.png',w:92,h:112,hit:8},
 bench:{art:'/city-premium/bench.png',w:92,h:45,hit:40},
 vending:{art:'/city-premium/vending.png',w:56,h:96,hit:24},
 terminal:{art:'/city-premium/route-terminal.png',w:58,h:84,hit:20},
 planter:{art:'/city-premium/planter.png',w:84,h:74,hit:38},
 crates:{art:'/city-premium/crates.png',w:84,h:51,hit:38},
 signal:{art:'/city-premium/signal.png',w:22,h:104,hit:6},
 trash:{art:'/city/prop_trash.png',w:30,h:46,hit:12},
 sign:{art:'/city/prop_sign.png',w:44,h:72,hit:8},
 antenna:{art:'/city/prop_antenna.png',w:38,h:92,hit:8},
 oldVending:{art:'/city/prop_vending.png',w:52,h:72,hit:22},
};
export type CityProp=Point&{kind:PropKind};
const CURB_NORTH=-112,CURB_SOUTH=110;
const nearCrossing=(x:number)=>Math.abs(x-Math.round(x/500)*500)<72;
function curbClear(x:number,south:boolean,margin=0){
 if(x<120||x>CITY_WIDTH-120||nearCrossing(x))return false;
 if(Math.abs(x-300)<60)return false;                                   // spawn column stays open
 if(CITY_BUILDINGS.some(b=>b.front===south&&Math.abs(x-b.x)<78+margin))return false;
 if(south&&STATIONS.some(s=>Math.abs(x-s.entryX)<135+margin))return false;
 if(CITY_PLACES.some(p=>(p.z>0)===south&&Math.abs(x-p.x)<95+margin))return false;
 return true;
}
const hash=(n:number)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
function buildProps():CityProp[]{
 const out:CityProp[]=[];
 // Lamps light both pavements; signals guard every crossing.
 for(let x=230;x<CITY_WIDTH;x+=330){
  const south=Math.round(x/330)%2===1;
  for(const dx of [0,40,-40,80,-80]){if(curbClear(x+dx,south)){out.push({kind:'lamp',x:x+dx,z:south?CURB_SOUTH:CURB_NORTH});break;}}
 }
 for(let x=500;x<CITY_WIDTH;x+=500){out.push({kind:'signal',x:x-88,z:CURB_NORTH+4});out.push({kind:'signal',x:x+88,z:CURB_SOUTH-4});}
 const cycle:PropKind[]=['bench','vending','planter','trash','terminal','crates','sign','oldVending','planter','antenna','bench','trash'];
 let k=0;
 for(let x=170;x<CITY_WIDTH;x+=96){
  if(hash(x*.37)<.12)continue;
  for(const south of hash(x)>.5?[true,false]:[false,true]){
   const z=south?CURB_SOUTH:CURB_NORTH;
   if(!curbClear(x,south,10)||out.some(p=>Math.abs(p.z-z)<20&&Math.abs(p.x-x)<62))continue;
   out.push({kind:cycle[k++%cycle.length],x,z});break;
  }
 }
 return out.sort((a,b)=>a.x-b.x);
}
export const CITY_PROPS=buildProps();
/** Furniture placed against the back wall of the underground platform (never on the walking strip). */
export const SUBWAY_PROPS:CityProp[]=STATIONS.flatMap(s=>[
 {kind:'terminal' as PropKind,x:s.trainX-110,z:-74},{kind:'bench' as PropKind,x:s.trainX+95,z:-74},
 {kind:'vending' as PropKind,x:s.exitX-170,z:-74},{kind:'trash' as PropKind,x:s.trainX+170,z:-74},
]);

/* ---------- Avenue traffic lanes (purely visual vehicles that brake for the robot) ---------- */
export const TRAFFIC_LANES=[{z:-44,dir:-1},{z:40,dir:1}] as const;

export const distance = (a:Point,b:Point)=>Math.hypot(a.x-b.x,a.z-b.z);
export function canWalk(x:number,z:number,underground:boolean):boolean {
 if(x<35||x>CITY_WIDTH-35)return false;
 if(underground)return z>=-75&&z<=115;
 if(z< -430||z>465)return false;
 if(CITY_PROPS.some(p=>Math.abs(z-p.z)<13&&Math.abs(x-p.x)<PROP_ART[p.kind].hit+9))return false;
 return !CITY_BUILDINGS.some(b=>Math.abs(x-b.x)<b.w/2+15&&(b.front?z>b.z-13&&z<455:z<b.z+13&&z> -425));
}
export function moveOnGround(p:Point,dx:number,dz:number,underground:boolean):Point {
 const out={...p};
 if(canWalk(p.x+dx,p.z,underground))out.x+=dx;
 if(canWalk(out.x,p.z+dz,underground))out.z+=dz;
 return out;
}
export const DISTRICTS=[
 {until:1600,name:'CENTRAL / COMÉRCIO',industry:0},
 {until:3500,name:'ARENA / INDÚSTRIA',industry:1},
 {until:5100,name:'MINA / TECNOLOGIA',industry:.65},
 {until:7200,name:'PESQUISA / ENERGIA',industry:.35},
 {until:Infinity,name:'CULTURA / PORTAL',industry:0},
];
export const district = (x:number)=>DISTRICTS.find(d=>x<d.until)!.name;
/** 0 = central skyline, 1 = industrial skyline; smooth across district borders. */
export function industryBlend(x:number){
 let prev=0;for(let i=0;i<DISTRICTS.length;i++){const d=DISTRICTS[i];const start=i?DISTRICTS[i-1].until:0;
  if(x<d.until){const u=Math.min(1,Math.max(0,(x-start)/420));return prev+(d.industry-prev)*(u*u*(3-2*u));}
  prev=d.industry;}
 return 0;
}
