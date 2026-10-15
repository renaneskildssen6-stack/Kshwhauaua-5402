import { useEffect, useState, type CSSProperties } from "react";
import { RobotSprite } from "./pixel";
import { decodeImage } from "@/game/preload";
import "./battle-commands.css";

const READY = new Set(["aurorion","ferrovax","cryolance","voltronin","pyrokaiser","terrabyte","zephyrblade","nullshade","acidra","gravitus"]);
const cache=new Map<string,Promise<boolean>>();
export function preloadUltimateArt(robotId:string):Promise<boolean> {
  if(!READY.has(robotId))return Promise.resolve(false);
  const hit=cache.get(robotId);if(hit)return hit;
  const pending=Promise.all(["ultimate","special"].map(kind=>decodeImage(`/overhaul/ultimates/${robotId}-${kind}.webp`))).then(result=>result.every(Boolean));
  cache.set(robotId,pending);return pending;
}
export interface ArenaUltimate {robotId:string;label:string;side:"player"|"enemy";uid:string;targetUid:string;key:number;startedAt:number;vfx:string}

/** The same event clock drives the actor and projectile, within the actual arena. */
export function UltimateArenaEffect({event,size,reduced}:{event:ArenaUltimate;size:number;reduced:boolean}) {
  const {robotId,label}=event;
  const [frame,setFrame]=useState(0);
  const [artReady,setArtReady]=useState(false);
  useEffect(()=>{let alive=true;void preloadUltimateArt(robotId).then(ready=>{if(alive)setArtReady(ready);});return()=>{alive=false;};},[robotId]);
  useEffect(()=>{
    if(reduced){setFrame(6);return;}
    let raf=0;
    const tick=(now:number)=>{setFrame(Math.max(0,Math.min(9,Math.floor((now-event.startedAt-150)/125))));if(now-event.startedAt<1500)raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[event.startedAt,reduced]);
  const strip=(kind:string,pixels:number):CSSProperties=>({width:pixels,height:pixels,backgroundImage:`url(/overhaul/ultimates/${robotId}-${kind}.webp)`,backgroundSize:"1000% 100%",backgroundPosition:`${frame/9*100}% 0`,imageRendering:"pixelated"});
  const from=event.side==="player"?"var(--mk-player-x)":"var(--mk-enemy-x)";
  const travel=reduced?1:Math.min(1,Math.max(0,(frame-2)/4));
  const dir=event.side==="player"?1:-1;
  return <div className="mc-arena-ultimate" aria-label={`${label} — especial na arena`} role="status">
    <div className="mc-ultimate-actor" style={{left:from,width:size,height:size,transform:`translateX(-50%) scaleX(${dir})`}}>
      {artReady?<div style={strip("ultimate",size)}/>:<RobotSprite robotId={robotId} size={size} clip={reduced?"idle":"attack"}/>}
    </div>
    <div className="mc-ultimate-projectile" style={{left:from,width:size*1.6,height:size*1.6,
      marginLeft:-size*.8,bottom:-size*.3,opacity:frame===9?.3:1,
      transform:`translateX(calc(var(--mk-travel) * ${dir*travel})) scaleX(${dir})`}}>
      {artReady?<div style={strip("special",size*1.6)}/>:<div style={{width:size*1.6,height:size*1.6,backgroundImage:`url(${event.vfx})`,backgroundSize:"400% 100%",backgroundPosition:`${(reduced?2:Math.min(3,Math.floor(frame/2))) /3*100}% 0`,imageRendering:"pixelated"}}/>}
    </div>
    <div className="mc-ultimate-callout" style={{left:from}}><span>REATOR LIBERADO</span><strong>{label}</strong></div>
  </div>;
}