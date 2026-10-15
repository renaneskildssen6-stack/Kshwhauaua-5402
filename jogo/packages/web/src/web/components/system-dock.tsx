import { useState } from "react";
import type { Screen } from "@/screens/menu";
import { useGame } from "@/game/save";
import { systemUnlocked, UNLOCK_LEVEL } from "@/game/progression";
import "./system-dock.css";

const GROUPS: {label:string;items:[Screen,string][]}[]=[
  {label:"CHASSI & SUPRIMENTOS",items:[["shop","Loja"],["engineer","Oficina"],["pets","Pets"],["cards","Cards"],["mine","Mina"],["lab","Laboratório"]]},
  {label:"CIDADE & MISSÕES",items:[["observatory","Observatório"],["academy","Academia"],["contracts","Contratos"],["power","Usina"],["museum","Museu"],["portal","Portal"]]},
  {label:"PILOTO",items:[["online","Online PvP"],["profile","Perfil"],["ranked","Ranqueado"],["mastery","Maestria"],["skins","Skins"]]},
];
export function SystemDock({onEnter,disabled}:{onEnter:(id:Exclude<Screen,"menu">)=>void;disabled:boolean}) {
 const g=useGame();const [open,setOpen]=useState(false);
 const go=(id:Screen)=>{if(!disabled&&id!=="menu"&&systemUnlocked(g,id)){setOpen(false);onEnter(id);}};
 const next=Object.entries(UNLOCK_LEVEL).filter(([id])=>!systemUnlocked(g,id as Screen)).sort((a,b)=>a[1]-b[1])[0];
 return <nav className="mc-system-dock" aria-label="Sistemas da cidade">
  <div className="mc-system-primary">{([["roster","hangar","HANGAR"],["modes","arena","ARENA"],["tournaments","coliseum","COLISEU"]] as const).map(([id,art,label])=><button key={id} disabled={disabled} onClick={()=>go(id)}><img src={`/overhaul/${art}.webp`} alt=""/><span>{label}</span></button>)}
  <button disabled={disabled} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><img src="/overhaul/systems.webp" alt=""/><span>SISTEMAS</span></button></div>
  {open&&<div className="mc-system-menu"><button className="mc-system-close" onClick={()=>setOpen(false)}>FECHAR ×</button>{GROUPS.map(group=>{
   const available=group.items.filter(([id])=>systemUnlocked(g,id));
   return available.length>0?<section key={group.label}><h3>{group.label}</h3><div>{available.map(([id,label])=><button key={id} onClick={()=>go(id)} disabled={disabled}><img src={`/overhaul/${id==="profile"?"pilot":id==="ranked"||id==="online"?"arena":id==="engineer"||id==="lab"?"repair":id==="shop"?"items":"star"}.webp`} alt=""/><span>{label}</span></button>)}</div></section>:null;
  })}{next&&<p>Próximo distrito no nível {next[1]} de piloto.</p>}</div>}
 </nav>;
}