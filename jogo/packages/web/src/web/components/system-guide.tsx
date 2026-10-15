import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/save";
import { playerMaxXP } from "@/game/engine";
import { SYSTEM_GUIDES } from "@/game/system-guides";
import { UNLOCK_LEVEL, systemUnlocked } from "@/game/progression";
import type { Screen } from "@/screens/menu";
import { useDialogFocus } from "./dialog-focus";
import "./pilot-polish.css";

export function SystemGuide({screen,open,onClose,onEnter}:{screen:Screen;open:boolean;onClose:()=>void;onEnter:(screen:Screen)=>void}) {
 const g=useGame();const [selected,setSelected]=useState(screen);
 const [tab,setTab]=useState<"briefing"|"route">("briefing");
 const panel=useRef<HTMLDivElement>(null);
 useEffect(()=>setSelected(screen),[screen]);
 useDialogFocus(panel,open,onClose);
 if(!open)return null;
 const definition=SYSTEM_GUIDES[selected];
 const level=UNLOCK_LEVEL[selected];const unlocked=systemUnlocked(g,selected);
 const upcoming=(Object.keys(UNLOCK_LEVEL) as Screen[]).filter(id=>!systemUnlocked(g,id)).sort((a,b)=>UNLOCK_LEVEL[a]-UNLOCK_LEVEL[b]);
 const nextLevel=upcoming.length?UNLOCK_LEVEL[upcoming[0]]:null;
 const atNext=upcoming.filter(id=>UNLOCK_LEVEL[id]===nextLevel);
 const maxXP=playerMaxXP(g.playerLevel);
 return <div className="mc-guide-backdrop" onPointerDown={event=>{if(event.target===event.currentTarget)onClose();}}>
  <div className="mc-pilot-guide" ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Central do piloto">
   <header><div><small>REMULU GAMES · MANUAL DE CAMPO</small><h1>CENTRAL DO PILOTO</h1></div><button onClick={onClose} aria-label="Fechar central do piloto">×</button></header>
   <div className="mc-guide-pilot"><img src="/overhaul/pilot.webp" alt="" width={48} height={48}/><div><strong>PILOTO NÍVEL {g.playerLevel}</strong><div className="mc-guide-xp" aria-label={`${g.playerXP} de ${maxXP} XP de piloto`}><span style={{width:`${Math.min(100,g.playerXP/maxXP*100)}%`}}/></div><small>{g.playerXP}/{maxXP} XP · {g.robots.length} CHASSIS · {g.battlesWon} VITÓRIAS</small></div></div>
   <nav className="mc-guide-tabs" aria-label="Seções da central"><button aria-pressed={tab==="briefing"} onClick={()=>setTab("briefing")}>BRIEFING</button><button aria-pressed={tab==="route"} onClick={()=>setTab("route")}>ROTA DE DESBLOQUEIOS</button></nav>
   <div className="mc-guide-scroll">
    {tab==="briefing"?<>
     <label className="mc-guide-picker">DOSSIÊ DO SISTEMA<select value={selected} onChange={event=>setSelected(event.target.value as Screen)}>{(Object.keys(SYSTEM_GUIDES) as Screen[]).map(id=><option key={id} value={id}>{SYSTEM_GUIDES[id].name}{systemUnlocked(g,id)?"":` · NÍVEL ${UNLOCK_LEVEL[id]}`}</option>)}</select></label>
     <div className="mc-guide-system"><img src={`/overhaul/${definition.art}.webp`} alt="" width={68} height={68}/><div><small>{definition.tag}</small><h2>{definition.name}</h2><span>{unlocked?"SINAL DISPONÍVEL":`SINAL BLOQUEADO · NÍVEL ${level}`}</span></div></div>
     <p className="mc-guide-mission">{definition.mission}</p>
     <ol className="mc-guide-steps">{definition.steps.map((text,i)=><li key={text}><span>0{i+1}</span>{text}</li>)}</ol>
     <section className="mc-guide-rules"><h3>O QUE IMPORTA</h3>{definition.rules.map(rule=><p key={rule}>{rule}</p>)}</section>
     {selected!=="menu"&&<button className="mc-guide-go" disabled={!unlocked} onClick={()=>{onClose();onEnter(selected);}}>{unlocked?`ABRIR ${definition.name.toUpperCase()}`:`LIBERA NO NÍVEL ${level}`}</button>}
    </>:<div className="mc-unlock-road">{[...new Set(Object.values(UNLOCK_LEVEL))].sort((a,b)=>a-b).map(tier=>{
     const ids=(Object.keys(UNLOCK_LEVEL) as Screen[]).filter(id=>id!=="menu"&&UNLOCK_LEVEL[id]===tier);
     return <section key={tier} data-unlocked={g.tutorial.legacyAccess||g.playerLevel>=tier} data-next={tier===nextLevel}><div className="mc-road-level">{String(tier).padStart(2,"0")}</div><div><h3>{tier===nextLevel?"PRÓXIMO SINAL":g.tutorial.legacyAccess||g.playerLevel>=tier?"DISTRITO ABERTO":"DISTRITO FUTURO"}</h3>{ids.map(id=><button key={id} onClick={()=>{setSelected(id);setTab("briefing");}}>{SYSTEM_GUIDES[id].name}<small>{systemUnlocked(g,id)?"CONSULTAR":"VER REQUISITOS"}</small></button>)}</div></section>;
    })}</div>}
   </div>
   <footer>{nextLevel?`Próximo nível de distrito: ${nextLevel} · ${atNext.map(id=>SYSTEM_GUIDES[id].name).join(" / ")}`:"Todos os distritos disponíveis para este piloto."}<small>Dados do save · consultar não consome recursos</small></footer>
  </div>
 </div>;
}