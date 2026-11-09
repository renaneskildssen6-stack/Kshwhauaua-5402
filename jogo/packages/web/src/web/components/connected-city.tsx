import { useCallback, useEffect, useRef, useState } from 'react';
import { explorerId, setExplorer, useGame } from '@/game/save';
import { heroFace, type HeroClip } from '@/game/hero';
import { ROBOT_MAP } from '@/game/robots';
import { systemUnlocked } from '@/game/progression';
import { recordMetro } from '@/game/city-life-actions';
import { CITY_WIDTH, SUBWAY_LEVEL, CITY_BUILDINGS, CITY_PLACES, STATIONS, distance, moveOnGround, district, type Station } from '@/game/connected-city';
import { createTraffic, stepTraffic } from '@/game/city-traffic';
import { CityArt, CRITICAL_ART, STREAMED_ART } from './city-art';
import type { Screen } from '@/screens/menu';
import { useGate } from './gate';
import { SystemDock } from './system-dock';
import { ExplorationControls } from './exploration-controls';
import { CityDestination } from './city-destination';
import { renderConnectedCity, type CityAvatar } from './connected-city-renderer';
import './connected-city.css';

type Mode='surface'|'descending'|'underground'|'ascending'|'ride';
type Near={key:string;label:string;kind:'building'|'place'|'down'|'up'|'train';id:string;station?:Station};
type Journey={from:{x:number;z:number;elevation:number};to:{x:number;z:number;elevation:number};elapsed:number;duration:number;final:Mode;station:Station};
export function HubCity({onEnter,enabled=true}:{onEnter:(id:Exclude<Screen,'menu'>)=>void;enabled?:boolean}){
 const game=useGame(),hero=explorerId(game),{busy,transition}=useGate();
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const p=useRef<CityAvatar&{vx:number;vz:number;vy:number;jumps:number}>({x:300,z:-180,elevation:0,height:0,face:1,clip:'idle',clipTime:0,vx:0,vz:0,vy:0,jumps:0});
 const camera=useRef({x:100,y:-530});
 const input=useRef({left:false,right:false,back:false,front:false,run:false,jumpHeld:false});
 const analog=useRef({x:0,z:0}),jumpPending=useRef(false),actUntil=useRef(0),coolUntil=useRef(0);
 const mode=useRef<Mode>('surface'),journey=useRef<Journey|null>(null),nearRef=useRef<Near|null>(null);
 const [near,setNear]=useState<Near|null>(null),[picker,setPicker]=useState(false),[destination,setDestination]=useState<string|null>(null),[routes,setRoutes]=useState(false);
 const [hud,setHud]=useState({mode:'surface' as Mode,x:300,z:-180,progress:0,station:'',score:0,cooldown:0});
 const [loading,setLoading]=useState(1),[banner,setBanner]=useState<{name:string;key:number}|null>(null);
 const traffic=useRef(createTraffic());
 const state=useRef({game,hero,enabled,busy,picker,destination,routes,onEnter,transition});state.current={game,hero,enabled,busy,picker,destination,routes,onEnter,transition};
 const cores=useRef(Array.from({length:30},(_,i)=>({x:450+i*260,z:i%2?-155:155,available:0}))),score=useRef(0);
 const startJourney=(to:Journey['to'],final:Mode,station:Station,currentMode:Mode,duration:number)=>{
  const P=p.current;journey.current={from:{x:P.x,z:P.z,elevation:P.elevation},to,elapsed:0,duration,final,station};mode.current=currentMode;P.height=0;P.vy=0;P.vx=0;P.vz=0;P.jumps=0;input.current={left:false,right:false,back:false,front:false,run:false,jumpHeld:false};analog.current={x:0,z:0};setRoutes(false);
 };
 const free=()=>{const s=state.current;return s.enabled&&!s.busy&&!s.picker&&!s.destination&&!s.routes&&!journey.current;};
 const interact=useCallback(()=>{
  if(!free())return;const n=nearRef.current;if(!n||p.current.height>12)return;
  if(n.kind==='down'&&n.station)startJourney({x:n.station.exitX,z:0,elevation:SUBWAY_LEVEL},'underground',n.station,'descending',2.3);
  else if(n.kind==='up'&&n.station)startJourney({x:n.station.entryX,z:n.station.entryZ,elevation:0},'surface',n.station,'ascending',2.3);
  else if(n.kind==='train')setRoutes(true);
  else if(n.kind==='place')setDestination(n.id);
  else if(n.kind==='building'&&systemUnlocked(state.current.game,n.id as Screen))state.current.transition(()=>state.current.onEnter(n.id as Exclude<Screen,'menu'>));
 },[]);
 const jump=useCallback(()=>{if(free()){jumpPending.current=true;input.current.jumpHeld=true;}},[]);
 const attack=()=>{if(free())actUntil.current=performance.now()+430;};
 const special=()=>{const now=performance.now();if(!free()||now<coolUntil.current)return;coolUntil.current=now+4000;actUntil.current=now+650;if(mode.current==='surface')cores.current.forEach(c=>{if(c.available<=now/1000&&distance(c,p.current)<180){c.available=now/1000+14;score.current+=10;}});};
 const actions=useRef({interact,jump,attack,special});actions.current={interact,jump,attack,special};
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{
   if(!free()||(e.target as HTMLElement)?.closest('input,textarea,select'))return;
   const k=e.key.toLowerCase();
   if(['a','arrowleft'].includes(k)){e.preventDefault();input.current.left=true;}
   else if(['d','arrowright'].includes(k)){e.preventDefault();input.current.right=true;}
   else if(['w','i','arrowup'].includes(k)){e.preventDefault();input.current.back=true;}
   else if(['s','arrowdown'].includes(k)){e.preventDefault();input.current.front=true;}
   else if(k==='shift')input.current.run=true;
   else if([' ','z'].includes(k)){e.preventDefault();if(!e.repeat)actions.current.jump();}
   else if(k==='e'||k==='enter'){e.preventDefault();if(!e.repeat)actions.current.interact();}
   else if(k==='f')actions.current.attack();else if(k==='q')actions.current.special();
  };
  const up=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['a','arrowleft'].includes(k))input.current.left=false;if(['d','arrowright'].includes(k))input.current.right=false;if(['w','i','arrowup'].includes(k))input.current.back=false;if(['s','arrowdown'].includes(k))input.current.front=false;if(k==='shift')input.current.run=false;if([' ','z'].includes(k))input.current.jumpHeld=false;};
  const reset=()=>{input.current={left:false,right:false,back:false,front:false,run:false,jumpHeld:false};analog.current={x:0,z:0};jumpPending.current=false;};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',reset);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',reset);};
 },[]);
 useEffect(()=>{
  const c=canvas.current,wrap=root.current;if(!c||!wrap)return;const ctx=c.getContext('2d');if(!ctx)return;
  let w=480,h=844,raf=0,last=performance.now(),paint=0;
  const art=new CityArt();art.preload(CRITICAL_ART);art.preload(STREAMED_ART);
  const veilStart=performance.now();let veilOpen=true,lastDistrict='';
  // Reduced motion is read once and kept in sync instead of being queried per frame.
  const motion=matchMedia('(prefers-reduced-motion: reduce)');let still=motion.matches;const onMotion=()=>{still=motion.matches;};motion.addEventListener('change',onMotion);
  // Pause the loop while the tab is hidden; resume without a giant dt spike.
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}};document.addEventListener('visibilitychange',onVisibility);
  const STEP=1/120;let acc=0;
  const resize=()=>{w=wrap.clientWidth;h=wrap.clientHeight;const dpr=Math.min(2,devicePixelRatio||1);c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;};resize();const ro=new ResizeObserver(resize);ro.observe(wrap);
  const approach=(value:number,target:number,amount:number)=>value<target?Math.min(target,value+amount):Math.max(target,value-amount);
  const simulate=(dt:number,now:number)=>{
   const P=p.current,S=state.current;
   const blocked=!S.enabled||S.busy||S.picker||!!S.destination||S.routes;
   if(!blocked&&journey.current){
    const j=journey.current;j.elapsed=Math.min(j.duration,j.elapsed+dt);const u=j.elapsed/j.duration;const blend=u*u*(3-2*u);
    P.x=j.from.x+(j.to.x-j.from.x)*blend;P.z=j.from.z+(j.to.z-j.from.z)*blend;P.elevation=j.from.elevation+(j.to.elevation-j.from.elevation)*blend;P.face=Math.sign(j.to.x-j.from.x)||1;
    if(u>=1){mode.current=j.final;recordMetro(j.station.id);journey.current=null;}
   }else if(!blocked){
    const keyboardX=Number(input.current.right)-Number(input.current.left),keyboardZ=Number(input.current.front)-Number(input.current.back);
    let dx=keyboardX||analog.current.x,dz=keyboardZ||analog.current.z;const length=Math.hypot(dx,dz);if(length>1){dx/=length;dz/=length;}
    const keyboard=keyboardX||keyboardZ;const speed=keyboard?(input.current.run?305:165):305;
    const accel=P.height>0?1500:2200;P.vx=approach(P.vx,dx*speed,accel*dt);P.vz=approach(P.vz,dz*speed,accel*dt);
    const next=moveOnGround(P,P.vx*dt,P.vz*dt,mode.current==='underground');if(Math.abs(next.x-P.x)<.001)P.vx=0;if(Math.abs(next.z-P.z)<.001)P.vz=0;P.x=next.x;P.z=next.z;if(Math.abs(dx)>.05)P.face=Math.sign(dx);
    if(jumpPending.current&&P.jumps<2){P.vy=P.jumps?720:860;P.jumps++;}jumpPending.current=false;
    if(!input.current.jumpHeld&&P.vy>0)P.vy-=860*.42*dt*6;
    P.vy-=2600*dt;P.height+=P.vy*dt;if(P.height<=0){P.height=0;P.vy=0;P.jumps=0;}
    if(mode.current==='surface'&&P.height<65)cores.current.forEach(core=>{if(core.available<=now/1000&&distance(core,P)<25){core.available=now/1000+14;score.current+=10;}});
   }else {P.vx=0;P.vz=0;input.current={left:false,right:false,back:false,front:false,run:false,jumpHeld:false};analog.current={x:0,z:0};jumpPending.current=false;}
   stepTraffic(traffic.current,dt,{x:P.x,z:P.z,height:P.height,underground:mode.current!=='surface'||P.elevation>40});
  };
  function frame(now:number){
   const P=p.current,S=state.current;
   const elapsed=Math.min(.1,(now-last)/1000);last=now;acc+=elapsed;let steps=0;
   while(acc>=STEP&&steps<10){simulate(STEP,now);acc-=STEP;steps++;}if(steps>=10)acc=0;
   const dt=elapsed;
   if(veilOpen){const progress=art.progress(CRITICAL_ART);if(progress>=1||now-veilStart>6000){veilOpen=false;setLoading(0);}else setLoading(Math.max(.01,progress));}
   const districtName=district(P.x);if(districtName!==lastDistrict){if(lastDistrict)setBanner({name:districtName,key:now});lastDistrict=districtName;}
   const candidates:{item:Near;d:number}[]=[];
   if(!journey.current&&P.height<12){
    if(mode.current==='surface'){
     CITY_BUILDINGS.forEach(b=>{const d=distance(P,{x:b.x,z:b.front?b.z-26:b.z+26});if(d<65)candidates.push({d,item:{key:`building:${b.id}`,kind:'building',id:b.id,label:systemUnlocked(S.game,b.id)?`ENTRAR · ${b.label}`:`${b.label} · BLOQUEADO`}});});
     CITY_PLACES.forEach(place=>{const d=distance(P,place);if(d<65)candidates.push({d,item:{key:`place:${place.id}`,kind:'place',id:place.id,label:`ENTRAR · ${place.name}`}});});
     STATIONS.forEach(s=>{const d=distance(P,{x:s.entryX,z:s.entryZ});if(d<65)candidates.push({d,item:{key:`down:${s.id}`,kind:'down',id:s.id,label:'DESCER · METRÔ',station:s}});});
    }else if(mode.current==='underground')STATIONS.forEach(s=>{const exitDistance=distance(P,{x:s.exitX,z:0}),trainDistance=distance(P,{x:s.trainX,z:70});if(exitDistance<60)candidates.push({d:exitDistance,item:{key:`up:${s.id}`,kind:'up',id:s.id,label:'SUBIR · CIDADE',station:s}});if(trainDistance<70)candidates.push({d:trainDistance,item:{key:`train:${s.id}`,kind:'train',id:s.id,label:'EMBARCAR · LINHA AURORA',station:s}});});
   }
   candidates.sort((a,b)=>a.d-b.d);const nextNear=candidates[0]?.item??null;
   if(nextNear?.key!==nearRef.current?.key){nearRef.current=nextNear;setNear(nextNear);}
   const clip:HeroClip=journey.current?mode.current==='ride'?'idle':'walk':now<actUntil.current?'attack':P.height>0?P.vy>0?'jump':'fall':Math.hypot(P.vx,P.vz)>190?'run':Math.hypot(P.vx,P.vz)>8?'walk':'idle';
   if(P.clip!==clip){P.clip=clip;P.clipTime=0;}P.clipTime+=dt;
   const targetX=Math.max(-40,Math.min(CITY_WIDTH-w+40,P.x+P.z*.16-w*.5));const targetY=P.elevation+P.z*.62-h*.55-Math.min(90,P.height*.25);
   camera.current.x+=(targetX-camera.current.x)*Math.min(1,dt*7);camera.current.y+=(targetY-camera.current.y)*Math.min(1,dt*5);
   renderConnectedCity(ctx,{w,h,cameraX:camera.current.x,cameraY:camera.current.y,time:now/1000,avatar:P,hero:S.hero,game:S.game,near:nearRef.current?.key||'',mode:mode.current,trainX:mode.current==='ride'?P.x:null,still,cores:cores.current,traffic:traffic.current},art);
   if(now-paint>65){paint=now;const j=journey.current;setHud({mode:mode.current,x:P.x,z:P.z,score:score.current,progress:j?j.elapsed/j.duration:0,station:j?.station.name||'',cooldown:Math.max(0,(coolUntil.current-now)/1000)});}
   raf=document.hidden?0:requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);return()=>{cancelAnimationFrame(raf);ro.disconnect();motion.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',onVisibility);};
 },[]);
 const travelling=['descending','ascending','ride'].includes(hud.mode);
 const location=hud.mode==='surface'?Math.abs(hud.z)<85?'AVENIDA':hud.z<0?'CALÇADA NORTE':'CALÇADA SUL':'SUBSOLO / LINHA AURORA';
 return <div className="mc-connected-city" ref={root} data-mode={hud.mode} data-player-x={hud.x.toFixed(1)} data-player-z={hud.z.toFixed(1)} data-player-level={p.current.elevation.toFixed(1)} data-near={near?.key||''} data-art-ready={loading?'false':'true'}>
  <canvas ref={canvas} aria-label="Cidade e metrô no mesmo mapa"/>
  {loading>0&&<div className="mc-connected-veil" role="status"><strong>LINHA AURORA</strong><span>CARREGANDO DISTRITOS · {Math.round(loading*100)}%</span><i style={{width:`${Math.round(loading*100)}%`}}/></div>}
  {banner&&!loading&&<div className="mc-connected-banner" key={banner.key} onAnimationEnd={()=>setBanner(null)}><small>DISTRITO</small>{banner.name}</div>}
  <SystemDock disabled={busy||!enabled||picker||!!destination||routes||travelling} onEnter={id=>{if(systemUnlocked(game,id))transition(()=>onEnter(id));}}/>
  <div className="mc-connected-pilot">PILOTO NV {game.playerLevel}<small>NÚCLEOS {hud.score}</small></div>
  <button className="mc-connected-picker" onClick={()=>setPicker(true)} disabled={busy||!enabled||travelling}><img src={heroFace(hero)} alt=""/>TROCAR</button>
  <div className="mc-connected-location"><small>{district(hud.x)}</small><strong>{location}</strong><span>{hud.mode==='surface'?'WASD / SETAS · MOVER':'PLATAFORMA CONTÍNUA · −24 M'}<br/>ESPAÇO / Z · PULO &nbsp; E · INTERAGIR</span><div className="mc-connected-map"><i style={{left:`${hud.x/CITY_WIDTH*100}%`,top:hud.mode==='surface'?hud.z<0?'2px':'11px':'20px'}}/>{STATIONS.map(s=><b key={s.id} style={{left:`${s.entryX/CITY_WIDTH*100}%`}}/>)}</div></div>
  {near&&!routes&&!travelling&&!picker&&!destination&&<button className="mc-connected-use" onClick={interact} disabled={!enabled||busy}>{near.label} <small>E</small></button>}
  {travelling&&<div className="mc-connected-journey" role="status"><strong>{hud.mode==='descending'?'DESCENDO PELA ESCADARIA':hud.mode==='ascending'?'SUBINDO PARA A CIDADE':'EM VIAGEM · '+hud.station}</strong><progress value={hud.progress} max={1}/><span>Mesmo mapa · sem tela de carregamento</span></div>}
  {routes&&<section className="mc-connected-routes" aria-label="Destinos do trem"><header><strong>LINHA AURORA</strong><button onClick={()=>setRoutes(false)}>CANCELAR</button></header><p>Você desembarca no subsolo. Suba pela escadaria para chegar ao distrito.</p><div>{STATIONS.map(s=><button key={s.id} disabled={s.id===near?.id} onClick={()=>startJourney({x:s.trainX,z:70,elevation:SUBWAY_LEVEL},'underground',s,'ride',Math.max(2.5,Math.min(5,Math.abs(p.current.x-s.trainX)/900)))}>{s.name}<span>{s.id===near?.id?'ESTAÇÃO ATUAL':'VIAJAR →'}</span></button>)}</div></section>}
  {destination&&<CityDestination kind={destination} onClose={()=>setDestination(null)} onTravel={()=>{}} onEnter={id=>{if(systemUnlocked(game,id)){setDestination(null);transition(()=>onEnter(id));}}}/>}
  {picker&&<section className="mc-home-picker"><h2>EXPLORAR COM</h2><p>Mesmo robô na cidade, escadaria e plataforma.</p><div>{game.robots.map(r=><button key={r.id} onClick={()=>{setExplorer(r.id);setPicker(false);}}><img src={heroFace(r.id)} alt=""/><span>{ROBOT_MAP[r.id]?.name||r.id}<small>NV {r.level}</small></span></button>)}</div><button onClick={()=>setPicker(false)}>FECHAR</button></section>}
  <ExplorationControls onMove={(x,z)=>{analog.current={x,z};}} onJump={jump} onJumpEnd={()=>{input.current.jumpHeld=false;}} onAttack={attack} onSpecial={special} cooldown={hud.cooldown} onInteract={interact} interactReady={!!near} disabled={busy||!enabled||picker||!!destination||routes||travelling}/>
 </div>;
}