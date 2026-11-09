import { CITY_WIDTH, SUBWAY_LEVEL, CITY_BUILDINGS, CITY_PLACES, STATIONS, CITY_PROPS, SUBWAY_PROPS, PROP_ART, TRAFFIC_LANES, industryBlend, type Point, type CityProp } from '@/game/connected-city';
import { HERO_FRAME, HERO_CLIPS, clipFrame, heroSheet, type HeroClip } from '@/game/hero';
import { systemUnlocked, UNLOCK_LEVEL } from '@/game/progression';
import { droneLevel } from '@/game/drone-system';
import type { GameState } from '@/game/save';
import type { TrafficCar } from '@/game/city-traffic';
import { PREMIUM, TRAFFIC_SPRITES, type CityArt, type Glow, type TrafficSprite } from './city-art';

export type CityAvatar = Point & { elevation:number; height:number; face:number; clip:HeroClip; clipTime:number };
export type CityView = { w:number;h:number;cameraX:number;cameraY:number;time:number;avatar:CityAvatar;hero:string;game:GameState;near:string;mode:string;trainX:number|null;still:boolean;cores:{x:number;z:number;available:number}[];traffic:TrafficCar[] };

/* Fixed world geometry shared by every layer (z: north < 0 < south). */
const SURFACE_BACK=-440,SURFACE_FRONT=465,ROAD_N=-85,ROAD_S=85;
const WALL_BASE_Z=-80,PLATFORM_EDGE=118,TRACK_DROP=26;
const SLAB=46;                                   // cut-away thickness between street and station ceiling
const WALL_H=SUBWAY_LEVEL+WALL_BASE_Z*.62-SURFACE_FRONT*.62-SLAB; // wall art fills the rest exactly
const WALL_TILE=WALL_H*1280/725;
const HERO_SIZE=96;
const SKY_MOVERS:{s:TrafficSprite;depth:number;alt:number;scale:number;v:number;x0:number;a:number;bob:number}[]=[
 {s:'carrier',depth:.05,alt:.78,scale:.34,v:6,x0:300,a:.55,bob:1.5},
 {s:'blimp',depth:.08,alt:.62,scale:.4,v:10,x0:1700,a:.75,bob:3},
 {s:'cargo',depth:.11,alt:.46,scale:.36,v:-15,x0:900,a:.7,bob:2},
 {s:'jets',depth:.2,alt:.7,scale:.3,v:190,x0:200,a:.8,bob:0},
 {s:'drone',depth:.45,alt:.3,scale:.36,v:30,x0:1300,a:.95,bob:5},
 {s:'drone',depth:.5,alt:.38,scale:.32,v:-26,x0:600,a:.9,bob:4},
];

export function renderConnectedCity(ctx:CanvasRenderingContext2D,v:CityView,art:CityArt){
 const {w,h,cameraX:cx,cameraY:cy,avatar:p,time:t,still}=v;
 const project=(x:number,z:number,elevation=0)=>({x:x-cx+z*.16,y:elevation+z*.62-cy});
 const X0=cx-140,X1=cx+w+140;                       // world-x culling window (covers the depth shear)
 const visible=(x:number,pad=0)=>x>X0-pad&&x<X1+pad;
 const pulse=(speed:number,phase=0)=>still?1:.82+.18*Math.sin(t*speed+phase);
 /** Run `draw` in world units on the ground plane at `elev`: x→x, y→z. Patterns stay anchored to the world. */
 const plane=(elev:number,draw:()=>void)=>{ctx.save();ctx.transform(1,0,.16,.62,-cx,elev-cy);draw();ctx.restore();};
 const tex=(src:string,scale:number,fallback:string)=>art.pattern(ctx,src,scale)??fallback;
 const quad=(x:number,z:number,width:number,depth:number,fill:string|CanvasPattern)=>{ctx.fillStyle=fill;ctx.fillRect(x,z,width,depth);};
 const sprite=(src:string,x:number,z:number,width:number,height:number,elevation=0,alpha=1,flip=false)=>{
  if(!art.ready(src))return;const pt=project(x,z,elevation);if(pt.x< -width||pt.x>w+width)return;
  ctx.globalAlpha=alpha;
  if(flip){ctx.save();ctx.translate(pt.x,0);ctx.scale(-1,1);ctx.drawImage(art.get(src),-width/2,pt.y-height,width,height);ctx.restore();}
  else ctx.drawImage(art.get(src),pt.x-width/2,pt.y-height,width,height);
  ctx.globalAlpha=1;
 };
 const atlas=(name:TrafficSprite,sx:number,sy:number,width:number,flip:boolean,alpha=1)=>{
  if(!art.ready(PREMIUM.traffic))return;const c=TRAFFIC_SPRITES[name],height=width*c.h/c.w;
  ctx.globalAlpha=alpha;ctx.save();ctx.translate(sx,sy);if(flip)ctx.scale(-1,1);
  ctx.drawImage(art.get(PREMIUM.traffic),c.x,c.y,c.w,c.h,-width/2,-height,width,height);ctx.restore();ctx.globalAlpha=1;
 };
 const glowAt=(color:Glow,sx:number,sy:number,rw:number,rh:number,alpha:number)=>{
  if(sx< -rw||sx>w+rw||sy< -rh||sy>h+rh)return;
  ctx.globalAlpha=alpha;ctx.drawImage(art.glow(color),sx-rw,sy-rh,rw*2,rh*2);
 };
 const sign=(text:string,x:number,z:number,elev=0,color='#97e7ee',big=false)=>{
  const pt=project(x,z,elev);if(pt.x< -200||pt.x>w+200)return;
  ctx.font=`${big?10:8}px 'Silkscreen',monospace`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
  const width=ctx.measureText(text).width+(big?22:14),hh=big?24:19;
  ctx.fillStyle='#04111ef0';ctx.fillRect(pt.x-width/2,pt.y-hh+4,width,hh);
  ctx.fillStyle=color;ctx.fillRect(pt.x-width/2,pt.y-hh+4,width,2);ctx.globalAlpha=.55;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(pt.x-width/2+.5,pt.y-hh+4.5,width-1,hh-1);ctx.globalAlpha=1;
  ctx.fillStyle=color;ctx.fillText(text,pt.x,pt.y-(big?3:1));
 };
 ctx.clearRect(0,0,w,h);

 /* ---------------- 1. Sky: AI skyline plates (central ↔ industrial) + original air traffic ---------------- */
 const horizon=project(0,SURFACE_BACK).y;
 const sky=ctx.createLinearGradient(0,0,0,Math.max(h,1));sky.addColorStop(0,'#050b1d');sky.addColorStop(.5,'#0a1a36');sky.addColorStop(1,'#061224');
 ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 if(horizon>-40){
  const H=Math.min(1100,Math.max(440,horizon+80)),W=H*1280/725,top=horizon+80-H,par=.22;
  const tiles=(src:string,alpha:number)=>{
   if(alpha<=.01||!art.ready(src))return;const im=art.get(src);ctx.globalAlpha=alpha;
   const shift=cx*par,first=Math.floor(shift/W)-1;
   for(let i=first;i<=first+Math.ceil(w/W)+2;i++){const sx=i*W-shift;
    if(i%2){ctx.save();ctx.translate(sx+W,0);ctx.scale(-1,1);ctx.drawImage(im,0,top,W,H);ctx.restore();}
    else ctx.drawImage(im,sx,top,W,H);}
   ctx.globalAlpha=1;
  };
  const blend=industryBlend(cx+w/2);
  tiles(PREMIUM.skylineCentral,1);tiles(PREMIUM.skylineIndustrial,blend);
  if(top>0){ctx.fillStyle='#050b1d';ctx.fillRect(0,0,w,top+1);}
  for(const m of SKY_MOVERS){
   const c=TRAFFIC_SPRITES[m.s],width=c.w*m.scale*(H/700),span=w+width*2+900;
   let sx=((m.x0+(still?0:t*m.v)-cx*m.depth)%span+span)%span-width;
   const sy=horizon+80-H*m.alt+(still?0:Math.sin(t*1.3+m.x0)*m.bob);
   atlas(m.s,sx,sy,width,m.v<0,m.a*.85);
  }
  // Horizon haze knits the plate into the street.
  const haze=ctx.createLinearGradient(0,horizon-120,0,horizon+40);haze.addColorStop(0,'#0b2d4a00');haze.addColorStop(1,'#0e3552c8');
  ctx.fillStyle=haze;ctx.fillRect(0,horizon-120,w,160);
 }

 /* ---------------- 2. Street level: textured plaza, pavements, avenue, crossings ---------------- */
 const surfaceFrontY=project(0,SURFACE_FRONT).y;
 if(surfaceFrontY>0&&horizon<h){
  plane(0,()=>{
   const L=X0-80,R=X1+80,span=R-L;
   quad(L,SURFACE_BACK,span,ROAD_N-SURFACE_BACK,tex(PREMIUM.pavement,.7,'#26404f'));
   quad(L,SURFACE_BACK,span,-240-SURFACE_BACK,'#020a1499');               // back plaza sits in building shadow
   quad(L,ROAD_S,span,SURFACE_FRONT-ROAD_S,tex(PREMIUM.pavement,.7,'#26404f'));
   quad(L,280,span,SURFACE_FRONT-280,'#020a1488');
   quad(L,-240,span,ROAD_N+240,'#7fb4cc14');quad(L,ROAD_S,span,280-ROAD_S,'#7fb4cc14');
   quad(L,ROAD_N,span,ROAD_S-ROAD_N,tex(PREMIUM.asphalt,.75,'#0c1c2b'));
   quad(L,ROAD_N,span,ROAD_S-ROAD_N,'#03091266');
   // curbs with lit edge
   for(const z of [ROAD_N-6,ROAD_S]){quad(L,z,span,6,'#6f93a6');quad(L,z+(z<0?5:0),span,1.5,'#b7f1ff');}
   quad(L,ROAD_N,span,3,'#00000088');
   // lane markings
   for(let x=Math.floor(L/130)*130;x<R;x+=130){quad(x,-2,64,4,'#d8b25ccc');}
   for(const z of [-46,44])for(let x=Math.floor(L/90)*90;x<R;x+=90)quad(x,z,38,2.5,'#9fc7d455');
   // crossings
   for(let x=500;x<CITY_WIDTH;x+=500){if(x<L-80||x>R+80)continue;
    for(let z=ROAD_N+6;z<ROAD_S-8;z+=18)quad(x-34,z,68,10,'#c8dfe4b8');
    quad(x-40,ROAD_N-14,80,6,'#e3b95b');quad(x-40,ROAD_S+8,80,6,'#e3b95b');}
   // building plinths + door mats
   for(const b of CITY_BUILDINGS){if(!visible(b.x,260))continue;
    const z0=b.front?b.z:-418,d=b.front?175:178;quad(b.x-b.w/2-8,z0,b.w+16,d,'#040e18d0');quad(b.x-b.w/2-8,b.front?z0:z0+d-3,b.w+16,3,'#3d8fa3');
    const active=v.near===`building:${b.id}`;quad(b.x-30,b.doorZ-12,60,24,active?'#ffd77c':'#2c8496');quad(b.x-26,b.doorZ-9,52,18,active?'#ffeab8':'#0b2d3e');
   }
   // open stairwell cut into the south pavement at every metro entrance
   for(const s of STATIONS){if(!visible(s.entryX,200))continue;
    quad(s.entryX-50,s.entryZ-26,100,SURFACE_FRONT-s.entryZ+26,'#5fd5dd');
    quad(s.entryX-46,s.entryZ-22,92,SURFACE_FRONT-s.entryZ+22,'#030b14');
    quad(s.entryX-50,s.entryZ-30,100,5,'#e3b95b');
   }
  });
 }

 /* ---------------- 3. Cut-away: slab, AI station wall, platform, track bed ---------------- */
 const slabTop=surfaceFrontY,wallTop=slabTop+SLAB,wallBase=project(0,WALL_BASE_Z,SUBWAY_LEVEL).y;
 if(slabTop<h&&wallBase+260>0){
  // street slab in section: asphalt core, pipes, conduit lights
  const slab=ctx.createLinearGradient(0,slabTop,0,wallTop);slab.addColorStop(0,'#1b3546');slab.addColorStop(1,'#08131f');
  ctx.fillStyle=slab;ctx.fillRect(0,slabTop,w,SLAB);
  ctx.fillStyle='#8fd8e8';ctx.fillRect(0,slabTop,w,2);
  ctx.fillStyle='#2c4c5f';ctx.fillRect(0,slabTop+14,w,6);ctx.fillStyle='#b88a3c';ctx.fillRect(0,slabTop+25,w,4);
  const off=-((cx)%160+160)%160;for(let x=off;x<w;x+=160){ctx.fillStyle='#3c6478';ctx.fillRect(x,slabTop+12,8,10);ctx.fillStyle=`rgba(90,230,240,${.5*pulse(3,x)})`;ctx.fillRect(x+60,slabTop+33,22,3);}
  // station wall — AI module repeated at world coordinates, mirrored on odd modules to hide seams
  const wallImg=art.ready(PREMIUM.metroWall)?art.get(PREMIUM.metroWall):null;
  const wx=project(0,WALL_BASE_Z,SUBWAY_LEVEL).x;
  if(wallImg){const first=Math.floor((-wx)/WALL_TILE)-1;
   for(let i=first;i<first+Math.ceil(w/WALL_TILE)+3;i++){const sx=wx+i*WALL_TILE;
    if(i%2){ctx.save();ctx.translate(sx+WALL_TILE,0);ctx.scale(-1,1);ctx.drawImage(wallImg,0,wallTop,WALL_TILE,WALL_H);ctx.restore();}
    else ctx.drawImage(wallImg,sx,wallTop,WALL_TILE,WALL_H);}
  }else{ctx.fillStyle='#0e2536';ctx.fillRect(0,wallTop,w,WALL_H);}
  const wallShade=ctx.createLinearGradient(0,wallTop,0,wallTop+60);wallShade.addColorStop(0,'#02070dcc');wallShade.addColorStop(1,'#02070d00');ctx.fillStyle=wallShade;ctx.fillRect(0,wallTop,w,60);
  // platform + track bed share the world projection
  plane(SUBWAY_LEVEL,()=>{
   const L=X0-80,span=X1-X0+160;
   quad(L,WALL_BASE_Z,span,PLATFORM_EDGE-WALL_BASE_Z,tex(PREMIUM.platform,.62,'#263f50'));
   quad(L,WALL_BASE_Z,span,14,'#00000080');
   for(let x=Math.floor(L/26)*26;x<X1+80;x+=26)quad(x,PLATFORM_EDGE-8,13,8,(Math.floor(x/26)%2)?'#e3b95b':'#1a1a12');
   quad(L,PLATFORM_EDGE-9,span,1.5,'#fff0b0');
  });
  plane(SUBWAY_LEVEL+TRACK_DROP,()=>{
   const L=X0-80,span=X1-X0+160;
   quad(L,PLATFORM_EDGE,span,150,tex(PREMIUM.ballast,.6,'#07111d'));
   quad(L,PLATFORM_EDGE,span,150,'#02060c55');
   for(const z of [158,202]){quad(L,z,span,4,'#8eb3c4');quad(L,z+4,span,2,'#2d4553');}
   quad(L,178,span,2,'#48e2f055');
  });
  // platform lip (vertical drop to the track bed)
  const lip=project(0,PLATFORM_EDGE,SUBWAY_LEVEL).y;ctx.fillStyle='#0a1622';ctx.fillRect(0,lip,w,TRACK_DROP);ctx.fillStyle='#40e0ee66';ctx.fillRect(0,lip+TRACK_DROP-3,w,2);
  const bedEnd=project(0,PLATFORM_EDGE+150,SUBWAY_LEVEL+TRACK_DROP).y;
  if(bedEnd<h){const g=ctx.createLinearGradient(0,bedEnd,0,bedEnd+200);g.addColorStop(0,'#050d17');g.addColorStop(1,'#01040a');ctx.fillStyle=g;ctx.fillRect(0,bedEnd,w,h-bedEnd);}
  // boarding zones + staircase landings
  plane(SUBWAY_LEVEL,()=>{for(const s of STATIONS){if(!visible(s.trainX,300))continue;
   const active=v.near===`train:${s.id}`;quad(s.trainX-56,40,112,70,active?'#ffd77c40':'#4be6e026');quad(s.trainX-56,40,112,2.5,active?'#ffd77c':'#6effdf');quad(s.trainX-56,108,112,2.5,active?'#ffd77c':'#6effdf');
   const up=v.near===`up:${s.id}`;quad(s.exitX-34,-20,68,30,up?'#ffd77c55':'#8fe8df22');}});
 }

 /* ---------------- 4. Staircases: one continuous flight from pavement to platform ---------------- */
 for(const s of STATIONS){
  const a=project(s.entryX,s.entryZ+8),b=project(s.exitX,0,SUBWAY_LEVEL);
  if(Math.max(a.x,b.x)< -120||Math.min(a.x,b.x)>w+120||b.y<0||a.y>h)continue;
  const half=40,steps=34;
  ctx.beginPath();ctx.moveTo(a.x-half,a.y);ctx.lineTo(a.x+half,a.y);ctx.lineTo(b.x+half,b.y);ctx.lineTo(b.x-half,b.y);ctx.closePath();
  ctx.fillStyle='#061420';ctx.fill();
  for(let i=0;i<steps;i++){const u=i/steps,u2=(i+.55)/steps;const x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u,y2=a.y+(b.y-a.y)*u2;
   ctx.fillStyle=i%2?'#28485b':'#355d73';ctx.fillRect(x-half+4,y,half*2-8,Math.max(2,y2-y));
   ctx.fillStyle='#0a1c29';ctx.fillRect(x-half+4,y2,half*2-8,1.5);}
  ctx.lineWidth=2;for(const side of [-1,1]){ctx.strokeStyle=`rgba(98,226,236,${.8*pulse(2,s.entryX)})`;ctx.beginPath();ctx.moveTo(a.x+side*half,a.y);ctx.lineTo(b.x+side*half,b.y);ctx.stroke();
   ctx.strokeStyle='#e3b95b';ctx.beginPath();ctx.moveTo(a.x+side*(half-5),a.y-18);ctx.lineTo(b.x+side*(half-5),b.y-18);ctx.stroke();}
 }

 /* ---------------- 5. Depth-sorted actors ---------------- */
 type Actor={z:number;draw:()=>void};const actors:Actor[]=[];
 const walking=p.elevation<80;
 for(const b of CITY_BUILDINGS){
  if(!visible(b.x,260))continue;
  const unlocked=systemUnlocked(v.game,b.id),active=v.near===`building:${b.id}`;
  actors.push({z:b.faceZ,draw:()=>{
   const ghost=walking&&b.front&&p.z<b.faceZ&&Math.abs(p.x-b.x)<170;
   sprite(b.art,b.x,b.faceZ,b.w,b.h,0,ghost?.32:unlocked?1:.62);
   sign(unlocked?b.label:`${b.label} · NV ${UNLOCK_LEVEL[b.id]}`,b.x,b.faceZ,-b.h-8,active?'#ffe1a0':unlocked?'#86e3f0':'#7d97a6',true);
   if(active){const d=project(b.x,b.doorZ);ctx.font="8px 'Silkscreen',monospace";ctx.textAlign='center';ctx.fillStyle='#ffe7a8';ctx.fillText(unlocked?'▼ ENTRADA':'▼ BLOQUEADO',d.x,d.y-10);}
  }});
 }
 for(const place of CITY_PLACES){if(!visible(place.x,180))continue;actors.push({z:place.z,draw:()=>{sprite(place.art,place.x,place.z,80,90);sign(place.name,place.x,place.z,-104,v.near===`place:${place.id}`?'#ffde87':'#94d2d9');}});}
 const drawProp=(prop:CityProp,elev:number)=>{const a=PROP_ART[prop.kind];
  const ghost=elev===0&&walking&&p.z<prop.z&&prop.z-p.z<70&&Math.abs(p.x-prop.x)<a.w/2+20;
  sprite(a.art,prop.x,prop.z,a.w,a.h,elev,ghost?.5:1);};
 for(const prop of CITY_PROPS){if(!visible(prop.x,80))continue;actors.push({z:prop.z,draw:()=>drawProp(prop,0)});}
 for(const s of STATIONS){if(!visible(s.entryX,200))continue;actors.push({z:s.entryZ-16,draw:()=>{
  sprite(PREMIUM.entrance,s.entryX,s.entryZ-16,156,145,0,1);
  sign(`METRÔ · ${s.name}`,s.entryX,s.entryZ-16,-150,v.near===`down:${s.id}`?'#ffe195':'#ffd27a');
 }});}
 for(const car of v.traffic){if(!visible(car.x,200))continue;const lane=TRAFFIC_LANES[car.lane];
  actors.push({z:lane.z,draw:()=>{const pt=project(car.x,lane.z);const bob=still?0:Math.sin(car.phase*3)*2;
   ctx.globalAlpha=.45;ctx.fillStyle='#01060c';ctx.beginPath();ctx.ellipse(pt.x,pt.y,car.w*.42,7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
   atlas(car.sprite,pt.x,pt.y-5+bob,car.w,lane.dir<0);}});}
 for(const core of v.cores){if(core.available>t||!visible(core.x))continue;actors.push({z:core.z,draw:()=>{const pt=project(core.x,core.z);const bob=still?0:Math.sin(t*3+core.x)*3;
  ctx.fillStyle='#ffdf8955';ctx.fillRect(pt.x-9,pt.y-26+bob,18,18);ctx.fillStyle='#ffe2a0';ctx.fillRect(pt.x-4,pt.y-21+bob,8,8);ctx.fillStyle='#fff8dc';ctx.fillRect(pt.x-2,pt.y-19+bob,3,3);}});}
 // underground actors (their screen band never overlaps the street band)
 for(const prop of SUBWAY_PROPS){if(!visible(prop.x,80))continue;actors.push({z:prop.z,draw:()=>drawProp(prop,SUBWAY_LEVEL)});}
 for(const s of STATIONS){if(!visible(s.trainX,400))continue;actors.push({z:-60,draw:()=>{
  sign(s.name,s.trainX,-60,SUBWAY_LEVEL-128,'#ffdd8b',true);
  sign('↑ SUPERFÍCIE',s.exitX,-30,SUBWAY_LEVEL-70,v.near===`up:${s.id}`?'#ffe195':'#8fe8df');
 }});}
 const drawTrain=(x:number,moving:boolean)=>{const pt=project(x,184,SUBWAY_LEVEL+TRACK_DROP);const bob=still||!moving?0:Math.sin(t*9)*1.2;
  atlas('train',pt.x,pt.y-6+bob,390,false,1);};
 if(v.trainX===null){for(const s of STATIONS)if(visible(s.trainX,300))actors.push({z:184,draw:()=>drawTrain(s.trainX,false)});}
 const drawPlayer=()=>{
  const pt=project(p.x,p.z,p.elevation);ctx.globalAlpha=.5;ctx.fillStyle='#020a10';ctx.beginPath();ctx.ellipse(pt.x,pt.y-1,18,5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  if(v.mode==='ride')return;
  const sheet=heroSheet(v.hero),def=HERO_CLIPS[p.clip],size=HERO_SIZE*def.scale;
  if(art.ready(sheet)){ctx.save();ctx.translate(pt.x,pt.y-p.height);ctx.scale(p.face,1);ctx.drawImage(art.get(sheet),clipFrame(p.clip,p.clipTime)*HERO_FRAME,0,HERO_FRAME,HERO_FRAME,-size/2,-size,size,size);ctx.restore();}
  else art.get(sheet);
  ctx.fillStyle='#b1ffff';ctx.fillRect(pt.x-6,pt.y+7,12,2);
  if(droneLevel(v.game,v.hero)>0)sprite(`/drones/${v.hero}_drone.png?v=3`,p.x+40,p.z,40,40,p.elevation-p.height-92+(still?0:Math.sin(t*3)*4));
 };
 if(p.elevation<100)actors.push({z:p.z,draw:drawPlayer});
 actors.sort((a,b)=>a.z-b.z).forEach(actor=>actor.draw());
 if(v.trainX!==null)drawTrain(v.trainX,true);
 if(p.elevation>=100)drawPlayer();

 /* ---------------- 6. Light: additive pools, halos, headlights, station lamps ---------------- */
 ctx.save();ctx.globalCompositeOperation='lighter';
 if(surfaceFrontY>0&&horizon<h){
  for(const prop of CITY_PROPS){if(prop.kind!=='lamp'&&prop.kind!=='vending'&&prop.kind!=='terminal')continue;if(!visible(prop.x,120))continue;
   const base=project(prop.x,prop.z),a=PROP_ART[prop.kind];
   if(prop.kind==='lamp'){glowAt('cyan',base.x,base.y,120,46,.55*pulse(1.7,prop.x));glowAt('cyan',base.x,base.y-a.h*.86,46,30,.65*pulse(2.3,prop.x));}
   else glowAt(prop.kind==='vending'?'amber':'cyan',base.x,base.y-10,60,26,.4);
  }
  for(const b of CITY_BUILDINGS){if(!visible(b.x,200))continue;const d=project(b.x,b.doorZ);glowAt(v.near===`building:${b.id}`?'amber':'cyan',d.x,d.y,90,30,.42);}
  for(const s of STATIONS){if(!visible(s.entryX,200))continue;const e=project(s.entryX,s.entryZ);glowAt('amber',e.x,e.y,110,40,.5*pulse(2,s.entryX));}
  for(const car of v.traffic){if(!visible(car.x,200))continue;const lane=TRAFFIC_LANES[car.lane],pt=project(car.x,lane.z);
   glowAt('cyan',pt.x,pt.y,car.w*.55,12,.5);glowAt('white',pt.x+lane.dir*(car.w*.5+50),pt.y-4,70,16,.35);glowAt('magenta',pt.x-lane.dir*car.w*.5,pt.y-14,16,10,.6);}
 }
 if(wallBase+260>0&&slabTop<h){
  const wx=project(0,WALL_BASE_Z,SUBWAY_LEVEL).x,first=Math.floor((-wx)/WALL_TILE)-1;
  for(let i=first;i<first+Math.ceil(w/WALL_TILE)+3;i++)for(const fx of [.122,.5,.878]){const lx=wx+i*WALL_TILE+WALL_TILE*fx;
   glowAt('amber',lx,wallTop+WALL_H*.3,54,38,.55*pulse(1.4,i*3+fx*7));glowAt('amber',lx,wallBase+16,110,26,.32);}
  for(const s of STATIONS){if(!visible(s.trainX,300))continue;const bz=project(s.trainX,75,SUBWAY_LEVEL);glowAt('cyan',bz.x,bz.y,90,28,.45*pulse(2.6,s.trainX));}
  if(v.trainX!==null){const tp=project(v.trainX,184,SUBWAY_LEVEL+TRACK_DROP);glowAt('cyan',tp.x,tp.y-30,260,44,.55);}
 }
 ctx.restore();ctx.globalAlpha=1;

 /* ---------------- 7. Atmosphere: drizzle on the street, dust under it (off with reduced motion) ---------------- */
 if(!still){
  if(horizon<h&&surfaceFrontY>0){ctx.strokeStyle='#9be8ff2e';ctx.lineWidth=1;ctx.beginPath();
   for(let i=0;i<70;i++){const sx=((i*97.3-cx*.9+t*40)%(w+40)+w+40)%(w+40)-20,sy=((i*53.7+t*520)%(Math.min(h,surfaceFrontY)+60))-30;ctx.moveTo(sx,sy);ctx.lineTo(sx-3,sy+11);}ctx.stroke();}
  if(wallBase>0&&slabTop<h){for(let i=0;i<26;i++){const sx=((i*151.7-cx+t*12)%(w+20)+w+20)%(w+20),sy=wallTop+((i*71.3+Math.sin(t+i)*20)%(Math.max(40,wallBase-wallTop)));ctx.fillStyle=`rgba(255,214,140,${.25+.2*Math.sin(t*2+i)})`;ctx.fillRect(sx,sy,2,2);}}
 }
 const vignette=ctx.createLinearGradient(0,h-150,0,h);vignette.addColorStop(0,'#03111a00');vignette.addColorStop(1,'#03111ae0');ctx.fillStyle=vignette;ctx.fillRect(0,h-150,w,150);
 const topV=ctx.createLinearGradient(0,0,0,110);topV.addColorStop(0,'#030a14b0');topV.addColorStop(1,'#030a1400');ctx.fillStyle=topV;ctx.fillRect(0,0,w,110);
}
