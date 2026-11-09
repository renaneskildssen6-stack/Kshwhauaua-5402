import { useCallback, useEffect, useRef, useState } from 'react';
import type { Screen } from '@/screens/menu';
import { explorerId, setExplorer, useGame } from '@/game/save';
import { systemUnlocked, UNLOCK_LEVEL } from '@/game/progression';
import { droneLevel } from '@/game/drone-system';
import { HERO_FRAME, clipFrame, heroFace, heroSheet, type HeroClip } from '@/game/hero';
import { ROBOT_MAP } from '@/game/robots';
import { ExplorationControls } from './exploration-controls';
import { useGate } from './gate';
import { HomeExclusive } from './home-exclusive';
import './home-lab.css';

const WORLD=2700, GRAVITY=2600, JUMP=860, WALK=165, RUN=305;
const PLATFORMS=[{x:365,h:125,w:140},{x:1010,h:175,w:155},{x:1390,h:135,w:140},{x:1980,h:160,w:165},{x:2290,h:110,w:120}];
const CORES=[{x:295,h:45},{x:435,h:175},{x:1085,h:225},{x:1490,h:185},{x:2050,h:210},{x:2350,h:160}];
const stations:{x:number;id:Exclude<Screen,'menu'>|'exit';label:string;sub:string;art:number}[]=[
 {x:190,id:'roster',label:'HANGAR',sub:'Esquadrão e chassis',art:4},
 {x:510,id:'mine',label:'DEPÓSITO',sub:'Minérios e expedições',art:156},
 {x:825,id:'engineer',label:'FORJA',sub:'Equipar e melhorar',art:167},
 {x:1170,id:'drones',label:'BAÍA DE DRONES',sub:'Construir e vincular',art:112},
 {x:1525,id:'lab',label:'LABORATÓRIO',sub:'Projetar chassis',art:183},
 {x:1835,id:'profile',label:'ARQUIVO',sub:'Registro do piloto',art:255},
 {x:2170,id:'shop',label:'SUPRIMENTOS',sub:'Loja e cápsulas',art:53},
 {x:2500,id:'exit',label:'SAÍDA',sub:'Explorar a cidade',art:207},
];
type Player={x:number;y:number;vx:number;vy:number;face:1|-1;grounded:boolean;coyote:number;jumps:number};
type Visual={clip:HeroClip;near:string|null;attack:boolean};

export function HomeLab({onEnter,onExit,enabled=true}:{onEnter:(id:Exclude<Screen,'menu'>)=>void;onExit:()=>void;enabled?:boolean}){
 const g=useGame();const hero=explorerId(g);const {transition,busy}=useGate();
 const root=useRef<HTMLElement>(null);const canvas=useRef<HTMLCanvasElement>(null);
 const worldNode=useRef<HTMLDivElement>(null);const avatarNode=useRef<HTMLDivElement>(null);const progressMeter=useRef<HTMLSpanElement>(null);
 const coreNodes=useRef<(HTMLSpanElement|null)[]>([]);
 const p=useRef<Player>({x:825,y:0,vx:0,vy:0,face:1,grounded:true,coyote:.11,jumps:0});
 const keys=useRef({left:false,right:false,run:false,jumpHeld:false});const analog=useRef(0);
 const jumpBuf=useRef(0);const actionUntil=useRef(0);const actionClip=useRef<HeroClip>('attack');
 const specialUntil=useRef(0);const lastCooldown=useRef(-1);const [cooldown,setCooldown]=useState(0);const [score,setScore]=useState(0);
 const collected=useRef<number[]>(CORES.map(()=>0));const [picker,setPicker]=useState(false);const [exclusive,setExclusive]=useState(false);
 const [v,setVisual]=useState<Visual>({clip:'idle',near:'engineer',attack:false});
 const visualRef=useRef(v);
 const active=enabled&&!busy&&!picker&&!exclusive;const activeRef=useRef(active);activeRef.current=active;
 const stateRef=useRef(g);stateRef.current=g;
 const enterRef=useRef(onEnter);enterRef.current=onEnter;
 const exitRef=useRef(onExit);exitRef.current=onExit;
 const image=useRef<HTMLImageElement|null>(null);
 const nearest=stations.reduce((a,b)=>Math.abs(b.x-p.current.x)<Math.abs(a.x-p.current.x)?b:a);
 const close=v.near!==null;

 useEffect(()=>{const im=new Image();image.current=im;im.src=heroSheet(hero);return()=>{if(image.current===im)image.current=null}},[hero]);
 const interact=useCallback(()=>{
  if(!activeRef.current)return;
  const P=p.current;const station=stations.find(s=>Math.abs(P.x-s.x)<115&&P.y<10);
  if(!station||station.id!=='exit'&&!systemUnlocked(stateRef.current,station.id))return;
  actionClip.current='interact';actionUntil.current=performance.now()+420;
  if(station.id==='exit')exitRef.current();else transition(()=>enterRef.current(station.id as Exclude<Screen,'menu'>));
 },[transition]);
 const action=useRef(interact);action.current=interact;
 const doJump=useCallback(()=>{if(!activeRef.current)return;jumpBuf.current=.13;keys.current.jumpHeld=true},[]);
 const attack=useCallback(()=>{if(!activeRef.current)return;actionClip.current='attack';actionUntil.current=performance.now()+420},[]);
 const special=useCallback(()=>{
  if(!activeRef.current||performance.now()<specialUntil.current)return;
  specialUntil.current=performance.now()+4000;
  actionClip.current='attack';actionUntil.current=performance.now()+650;
  CORES.forEach((c,i)=>{if(collected.current[i]<=performance.now()&&Math.hypot(c.x-p.current.x,c.h-(p.current.y+40))<220){collected.current[i]=performance.now()+14000;setScore(n=>n+10)}});
 },[]);
 const jumpRef=useRef(doJump);jumpRef.current=doJump;
 const attackRef=useRef(attack);attackRef.current=attack;
 const specialRef=useRef(special);specialRef.current=special;
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{if(!activeRef.current)return;const k=e.key.toLowerCase();
   if(k==='a'||k==='arrowleft')keys.current.left=true;
   else if(k==='d'||k==='arrowright')keys.current.right=true;
   else if(k==='shift')keys.current.run=true;
   else if(k===' '||k==='w'||k==='arrowup'||k==='z'){e.preventDefault();if(!e.repeat)jumpRef.current()}
   else if(k==='f')attackRef.current();else if(k==='q')specialRef.current();
   else if(k==='e'||k==='enter')action.current();
  };
  const up=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft')keys.current.left=false;if(k==='d'||k==='arrowright')keys.current.right=false;if(k==='shift')keys.current.run=false;if(k===' '||k==='w'||k==='arrowup'||k==='z')keys.current.jumpHeld=false};
  const reset=()=>{keys.current={left:false,right:false,run:false,jumpHeld:false};analog.current=0};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',reset);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',reset)};
 },[]);
 useEffect(()=>{
  if(!active){keys.current={left:false,right:false,run:false,jumpHeld:false};analog.current=0;p.current.vx=0;return}
  const ctx=canvas.current?.getContext('2d');if(!ctx)return;
  ctx.imageSmoothingEnabled=false;
  let raf=0,last=0,lastPaint=0,clipT=0,previousClip:HeroClip='idle',camera=585;
  const reset=()=>{keys.current={left:false,right:false,run:false,jumpHeld:false};analog.current=0;p.current.vx=0};
  const frame=(now:number)=>{
   const dt=Math.min(.033,(now-(last||now))/1000);last=now;
   const P=p.current;
   const input=(Number(keys.current.right)-Number(keys.current.left))||analog.current;
   const dir=Math.sign(input);const maxSpeed=(keys.current.left||keys.current.right)?keys.current.run?RUN:WALK:Math.max(WALK*.5,Math.abs(analog.current)*RUN);
   const accel=P.grounded?2200:1500;
   if(dir){P.vx=Math.max(-maxSpeed,Math.min(maxSpeed,P.vx+dir*accel*dt));P.face=dir as 1|-1}
   else{const friction=2600*dt*(P.grounded?1:.35);P.vx=Math.abs(P.vx)<=friction?0:P.vx-Math.sign(P.vx)*friction}
   jumpBuf.current=Math.max(0,jumpBuf.current-dt);
   P.coyote=P.grounded?.11:Math.max(0,P.coyote-dt);
   if(jumpBuf.current>0&&(P.coyote>0||P.jumps<2)){
    const double=P.coyote<=0;P.vy=JUMP*(double?.86:1);P.grounded=false;P.jumps=double?2:1;P.coyote=0;jumpBuf.current=0;
   }
   if(!keys.current.jumpHeld&&P.vy>0)P.vy-=JUMP*.42*dt*6;
   P.vy=Math.max(-1500,P.vy-GRAVITY*dt);
   const previousY=P.y;P.x=Math.max(55,Math.min(WORLD-55,P.x+P.vx*dt));P.y+=P.vy*dt;
   let landed=false;
   if(P.vy<=0)for(const platform of PLATFORMS)if(P.x>platform.x-8&&P.x<platform.x+platform.w+8&&previousY>=platform.h-2&&P.y<=platform.h){P.y=platform.h;P.vy=0;landed=true;break}
   if(P.y<=0){P.y=0;P.vy=0;landed=true}
   if(landed&&!P.grounded)P.jumps=0;
   P.grounded=landed;
   const actionNow=actionUntil.current>now;
   const clip:HeroClip=actionNow?actionClip.current:!P.grounded?P.vy>0?'jump':'fall':Math.abs(P.vx)>WALK+12?'run':Math.abs(P.vx)>8?'walk':'idle';
   if(previousClip!==clip){previousClip=clip;clipT=0}else clipT+=dt;
   ctx.clearRect(0,0,128,128);
   const im=image.current;if(im?.complete&&im.naturalWidth){const f=clipFrame(clip,clipT);ctx.drawImage(im,f*HERO_FRAME,0,HERO_FRAME,HERO_FRAME,0,0,128,128)}
   const viewport=root.current?.clientWidth||480;
   const target=Math.max(0,Math.min(WORLD-viewport,P.x-viewport*.46+P.face*26));
   camera+=(target-camera)*Math.min(1,dt*7);
   const worldTransform=`translate3d(${-camera}px,0,0)`;
   if(worldNode.current&&worldNode.current.style.transform!==worldTransform)worldNode.current.style.transform=worldTransform;
   const avatar=avatarNode.current;
   if(avatar){const left=`${P.x}px`;const transform=`translateX(-50%) translateY(${-P.y}px)`;if(avatar.style.left!==left)avatar.style.left=left;if(avatar.style.transform!==transform)avatar.style.transform=transform}
   const avatarCanvas=canvas.current;const facing=P.face<0?'scaleX(-1)':'none';
   if(avatarCanvas&&avatarCanvas.style.transform!==facing)avatarCanvas.style.transform=facing;
   if(progressMeter.current){const width=`${P.x/WORLD*100}%`;if(progressMeter.current.style.width!==width)progressMeter.current.style.width=width}
   CORES.forEach((core,i)=>{
    const available=collected.current[i]<=now;const node=coreNodes.current[i];
    if(node&&node.style.opacity!==(available?'1':'0'))node.style.opacity=available?'1':'0';
    if(available&&Math.abs(core.x-P.x)<28&&Math.abs(core.h-(P.y+40))<44){collected.current[i]=now+14000;if(node)node.style.opacity='0';setScore(n=>n+10)}
   });
   if(now-lastPaint>33){
    lastPaint=now;
    const station=stations.find(s=>Math.abs(s.x-P.x)<115&&P.y<10);
    const current=visualRef.current;
    if(current.clip!==clip||current.near!==(station?.id||null)||current.attack!==actionNow){
     const next={clip,near:station?.id||null,attack:actionNow};visualRef.current=next;setVisual(next);
    }
    const remaining=Math.ceil(Math.max(0,specialUntil.current-now)/1000);
    if(remaining!==lastCooldown.current){lastCooldown.current=remaining;setCooldown(remaining)}
   }
   raf=requestAnimationFrame(frame);
  };
  const start=()=>{if(!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}};
  const stop=()=>{if(raf){cancelAnimationFrame(raf);raf=0}last=0;reset()};
  const visibility=()=>document.hidden?stop():start();
  window.addEventListener('blur',reset);document.addEventListener('visibilitychange',visibility);start();
  return()=>{stop();window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',visibility)};
 },[active]);
 return <section className={`mc-home home-style-${g.cityLife.homeStyle}`} ref={root} aria-label="Casa-laboratório do piloto">
  <div ref={worldNode} className="mc-home-world" style={{width:WORLD,transform:'translate3d(-585px,0,0)'}}>
   <div className="mc-home-back"/><div className="mc-home-light a"/><div className="mc-home-light b"/>
   <div className="mc-home-floor"/><div className="mc-home-stripe"/>
   <div className="mc-home-room-label" style={{left:80}}>01 / QUARTO & HANGAR</div><div className="mc-home-room-label" style={{left:690}}>02 / FORJA</div><div className="mc-home-room-label" style={{left:1100}}>03 / PESQUISA</div><div className="mc-home-room-label" style={{left:1940}}>04 / ÁTRIO</div>
   {PLATFORMS.map((s,i)=><div key={i} className="mc-home-platform" style={{left:s.x,width:s.w,bottom:`calc(var(--home-ground) + ${s.h}px)`}}/>)}
   {CORES.map((c,i)=><span key={i} ref={node=>{coreNodes.current[i]=node}} className="mc-home-core" style={{left:c.x,bottom:`calc(var(--home-ground) + ${c.h}px)`,opacity:collected.current[i]>performance.now()?0:1}}/>)}
   {stations.map(s=>{const unlocked=s.id==='exit'||systemUnlocked(g,s.id);const nearby=v.near===s.id;
    return <button className={`mc-home-station ${s.id==='exit'?'exit':s.id==='engineer'?'forge':''}`} key={s.id} style={{left:s.x}} onClick={interact} disabled={!active||!unlocked||!nearby} aria-label={`${s.label}: ${s.sub}${!unlocked?` · desbloqueia no nível ${UNLOCK_LEVEL[s.id as Exclude<Screen,'menu'>]}`:''}`}>
     <span className="mc-home-station-icon"><img src={`/${s.id==='engineer'?'mining':'city'}-sprites/${String(s.art).padStart(3,'0')}.png`} alt=""/></span><strong>{s.label}</strong><small>{s.sub}</small><i>{!unlocked?`DESBLOQUEIA NV ${UNLOCK_LEVEL[s.id as Exclude<Screen,'menu'>]}`:nearby?'INTERAGIR →':'APROXIME-SE →'}</i>
    </button>})}
   <div ref={avatarNode} className="mc-home-avatar" style={{left:825,transform:'translateX(-50%)'}}><div className={`mc-home-hero ${v.clip} ${v.attack?'acting':''}`}><canvas ref={canvas} width={128} height={128} aria-label="Animação do piloto"/>{droneLevel(g,hero)>0&&<img className="mc-home-drone" src={`/drones/${hero}_drone.png?v=3`} alt=""/>}</div><span>VOCÊ</span></div>
  </div>
  <div className="mc-home-top"><span className="mc-home-mark">MC</span><div><small>BASE DO PILOTO · SETOR 01</small><strong>SEU LABORATÓRIO</strong></div><span className="mc-home-pilot">NV {g.playerLevel}<br/>NÚCLEOS {score}</span></div>
  <button className="mc-home-picker-trigger" onClick={()=>setPicker(true)} disabled={!enabled||busy}><img src={heroFace(hero)} alt=""/> TROCAR</button>
  <button className="mc-home-exclusive-trigger" onClick={()=>setExclusive(true)} disabled={!enabled||busy}>NÚCLEO PRIVADO · PESQUISA</button>
  <button className="mc-home-city-link" onClick={onExit} disabled={!enabled||busy}>SAIR PARA A CIDADE ↗</button>
  <div className="mc-home-footer"><div className="mc-home-progress"><span ref={progressMeter} style={{width:`${p.current.x/WORLD*100}%`}}/></div><div className="mc-home-help">A/D · ANDAR &nbsp; W/Z · 2× PULO &nbsp; F · ATAQUE &nbsp; Q · ESPECIAL &nbsp; E · ENTRAR <b>{close?`${nearest.label} AO ALCANCE`:'EXPLORE A CASA →'}</b></div></div>
  {close&&<button className="mc-home-near" onClick={interact} disabled={!active||nearest.id!=='exit'&&!systemUnlocked(g,nearest.id)}>{nearest.id!=='exit'&&!systemUnlocked(g,nearest.id)?`LIBERA NO NV ${UNLOCK_LEVEL[nearest.id]}`:`ENTRAR • ${nearest.label}`}</button>}
  <ExplorationControls onMove={(x)=>{analog.current=x}} onJump={doJump} onJumpEnd={()=>{keys.current.jumpHeld=false}} onAttack={attack} onSpecial={special} cooldown={cooldown} onInteract={interact} interactReady={close&&active} disabled={!active}/>
  {picker&&<div className="mc-home-picker"><h2>EXPLORAR COM</h2><p>O escolhido anda, corre, pula e ataca em casa e na cidade.</p><div>{g.robots.map(r=><button key={r.id} onClick={()=>{setExplorer(r.id);setPicker(false)}}><img src={heroFace(r.id)} alt=""/><span>{ROBOT_MAP[r.id]?.name||r.id}<small>NV {r.level}</small></span></button>)}</div><button onClick={()=>setPicker(false)}>FECHAR</button></div>}
  {exclusive&&<HomeExclusive onClose={()=>setExclusive(false)}/>}
 </section>;
}
