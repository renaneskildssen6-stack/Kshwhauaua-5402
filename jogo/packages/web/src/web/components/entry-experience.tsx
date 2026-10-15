import { useEffect, useRef, useState } from "react";
import { LAUNCH_ASSETS } from "@/game/launch-assets";
import { preloadParts, partLoadFailures } from "@/game/compose";
import { decodeImage, preloadQueue, type PreloadProgress } from "@/game/preload";
import "./entry-experience.css";

const SCENES=[{id:"hangar",name:"HANGAR",sub:"O primeiro sinal nasce aqui"},
  {id:"city",name:"CIDADE NOTURNA",sub:"Milhares de luzes. Um novo piloto."},
  {id:"orbit",name:"ÓRBITA",sub:"Um mundo inteiro espera seu esquadrão"}] as const;
const TIPS=["Ataques carregam +18%. Defesas, +14%. Cada robô tem seu próprio reator.",
  "O ultimate exige 100% de carga e não consome MP nem recurso do chassi.",
  "No Hangar, equipe quatro ataques e duas defesas. O ultimate é separado.",
  "A cidade libera novos sistemas conforme seu nível de piloto sobe.",
  "Derrotas no tutorial não avançam a missão. Cada vitória salva um checkpoint.",
  "Trocar de robô mantém a carga individual. A reserva não age junto no ultimate."];
const PRIORITY_ASSETS=["/launch/loader-a.webp","/launch/loader-b.webp",...SCENES.map(s=>`/launch/loader-${s.id}.webp`)];

function useReducedMotion() {
  const [reduced,setReduced]=useState(()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(()=>{const q=window.matchMedia("(prefers-reduced-motion: reduce)");const change=()=>setReduced(q.matches);
    q.addEventListener("change",change);return()=>q.removeEventListener("change",change);},[]);
  return reduced;
}
function preferredScene(){try{return SCENES.find(s=>s.id===localStorage.getItem("mecha-loading-scene"))?.id??"hangar";}catch{return "hangar";}}

export function StudioSplash({onDone}:{onDone:()=>void}) {
  const callback=useRef(onDone);callback.current=onDone;
  const reduced=useReducedMotion();
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{const abort=new AbortController();
    void decodeImage("/launch/remulu-logo.webp",abort.signal,4000).then(ok=>{if(!abort.signal.aborted){setFailed(!ok);setLoaded(true);}});
    return()=>abort.abort();},[]);
  useEffect(()=>{if(!loaded)return;const timer=setTimeout(()=>callback.current(),reduced?1200:3200);return()=>clearTimeout(timer);},[loaded,reduced]);
  return <section className="mc-studio" aria-label="Remulu Games">
    {loaded&&<div className="mc-studio-mark" data-reduced={reduced}>
      {failed?<h1 className="mk-title">Remulu Games</h1>:<img src="/launch/remulu-logo.webp" alt="Remulu Games" width={1024} height={1024}/>}
      <p>UM UNIVERSO FORJADO EM PIXELS</p><small>ARTE CRIADA COM IA</small>
    </div>}
    <button className="mc-entry-skip" onClick={()=>callback.current()}>PULAR ABERTURA</button>
  </section>;
}

export function LoadingScreen({onDone}:{onDone:()=>void}) {
  const [scene,setScene]=useState<string>(preferredScene);
  const [progress,setProgress]=useState<PreloadProgress>({completed:0,total:LAUNCH_ASSETS.length,failed:[],current:""});
  const [frame,setFrame]=useState(0);
  const [tipIndex,setTipIndex]=useState(0);
  const [elapsed,setElapsed]=useState(false);
  const [prepared,setPrepared]=useState(false);
  const [animationReady,setAnimationReady]=useState(false);
  const [done,setDone]=useState(false);
  const [retry,setRetry]=useState(0);
  const [retrying,setRetrying]=useState(false);
  const failedRef=useRef<string[]>([]);
  const callback=useRef(onDone);callback.current=onDone;
  const reduced=useReducedMotion();
  useEffect(()=>{if(!animationReady)return;if(reduced){setFrame(24);setElapsed(true);return;}
    const start=performance.now();let raf=0;
    const tick=(now:number)=>{setFrame(Math.floor((now-start)/80)%50);setTipIndex(Math.floor((now-start)/6500)%TIPS.length);if(now-start>=4000)setElapsed(true);raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);},[reduced,animationReady]);
  useEffect(()=>{
    const controller=new AbortController();
    const urls=retry?failedRef.current:[...PRIORITY_ASSETS,...LAUNCH_ASSETS];
    if(retry){setRetrying(true);setPrepared(false);}
    let priorityCompleted=0;
    void preloadQueue(urls,async url=>{
      const ok=await decodeImage(url,controller.signal);
      if(PRIORITY_ASSETS.includes(url)&&!controller.signal.aborted){priorityCompleted++;if(priorityCompleted>=PRIORITY_ASSETS.length)setAnimationReady(true);}
      return ok;
    },state=>{
      if(retry)setProgress(old=>({...old,current:state.current}));
      else setProgress(state);
    },controller.signal).then(async result=>{
      if(controller.signal.aborted)return;
      setAnimationReady(true);
      await preloadParts();
      if(controller.signal.aborted)return;
      const failed=[...new Set([...result.failed,...partLoadFailures()])];
      failedRef.current=failed;
      setProgress(old=>({...old,failed}));setPrepared(true);setRetrying(false);
    });
    return()=>controller.abort();
  },[retry]);
  const canFinish=prepared&&elapsed&&!retrying;
  useEffect(()=>{if(!canFinish||progress.failed.length||done)return;
    const timer=setTimeout(()=>setDone(true),400);return()=>clearTimeout(timer);
  },[canFinish,progress.failed.length,done]);
  useEffect(()=>{if(!done)return;const timer=setTimeout(()=>callback.current(),reduced?30:650);return()=>clearTimeout(timer);},[done,reduced]);
  const pct=Math.min(100,Math.floor(progress.completed/Math.max(1,progress.total)*100));
  const drawing=frame%25;
  const currentScene=SCENES.find(s=>s.id===scene)??SCENES[0];
  const tip=TIPS[tipIndex];
  return <section className="mc-loader" data-done={done} data-reduced={reduced} aria-label="Carregamento de MECHA CHAMPIONS">
    {SCENES.map(s=><img key={s.id} className="mc-loader-scene" data-active={scene===s.id} src={`/launch/loader-${s.id}.webp`} alt="" width={576} height={1024}/>)}
    <div className="mc-loader-shade"/>
    <header className="mc-loader-heading"><small>REMULU GAMES APRESENTA</small><h1>MECHA<br/><em>CHAMPIONS</em></h1><span>{currentScene.sub}</span></header>
    <div className="mc-loader-core" aria-hidden style={{backgroundImage:`url(/launch/loader-${frame<25?"a":"b"}.webp)`,backgroundPosition:`${drawing%5*25}% ${Math.floor(drawing/5)*25}%`}}/>
    <div className="mc-loader-orbit" aria-hidden/>
    <div className="mc-loader-bottom">
      <div className="mc-loader-number"><span>{prepared?progress.failed.length?"SINAL INCOMPLETO":"SISTEMAS PRONTOS":retrying?"RECUPERANDO SINAL":"SINCRONIZANDO O UNIVERSO"}</span><strong>{pct}<small>%</small></strong></div>
      <div className="mc-load-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Arquivos processados"><span style={{width:`${pct}%`}}/></div>
      <div className="mc-load-stats"><span>{progress.completed-progress.failed.length} OK · {progress.failed.length} FALHAS</span><span>{progress.completed}/{progress.total} ARQUIVOS</span></div>
      <p className="mc-load-tip">{tip}</p>
      <div className="mc-scene-choice" aria-label="Fundo de carregamento">{SCENES.map(s=><button key={s.id} aria-pressed={s.id===scene} onClick={()=>{setScene(s.id);try{localStorage.setItem("mecha-loading-scene",s.id);}catch{/* Storage may be unavailable. */}}}>{s.name}</button>)}</div>
      {prepared&&progress.failed.length>0&&<div className="mc-load-errors" role="status"><p>{progress.failed.length} imagens não responderam. Seu progresso está preservado.</p>
        <button disabled={retrying} onClick={()=>setRetry(n=>n+1)}>TENTAR NOVAMENTE</button><button disabled={!canFinish} onClick={()=>setDone(true)}>CONTINUAR COM FALLBACKS</button>
        <details><summary>DIAGNÓSTICO</summary>{progress.failed.slice(0,20).map(url=><div key={url}>{url}</div>)}</details>
      </div>}
      <small className="mc-loader-footer">50 FRAMES · ARTE IA · PROGRESSO REAL</small>
    </div>
  </section>;
}