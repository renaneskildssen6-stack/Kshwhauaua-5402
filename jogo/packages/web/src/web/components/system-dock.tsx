import { useState } from "react";
import type { Screen } from "@/screens/menu";
import { useGame } from "@/game/save";
import { systemUnlocked, UNLOCK_LEVEL } from "@/game/progression";
import "./system-dock.css";

const GROUPS: {label:string;tag:string;items:[Screen,string][]}[]=[
  {label:"OPERAÇÕES",tag:"EQUIPE E RECURSOS",items:[["shop","Loja"],["engineer","Oficina"],["drones","Drones"],["pets","Pets"],["cards","Cards"],["mine","Mina"],["lab","Laboratório"]]},
  {label:"DISTRITOS",tag:"CIDADE E MISSÕES",items:[["observatory","Observatório"],["academy","Academia"],["contracts","Contratos"],["power","Usina"],["museum","Museu"],["portal","Portal"]]},
  {label:"COMPETIÇÃO",tag:"PILOTO E ARENA",items:[["online","Online PvP"],["profile","Perfil"],["ranked","Ranqueado"],["mastery","Maestria"],["skins","Skins"],["tournaments","Coliseu"]]},
];
export function SystemDock({onEnter,disabled}:{onEnter:(id:Exclude<Screen,"menu">)=>void;disabled:boolean}) {
 const g=useGame();const [open,setOpen]=useState(false);
 const go=(id:Screen)=>{if(!disabled&&id!=="menu"&&systemUnlocked(g,id)){setOpen(false);onEnter(id);}};
 const next=Object.entries(UNLOCK_LEVEL).filter(([id])=>!systemUnlocked(g,id as Screen)).sort((a,b)=>a[1]-b[1])[0];
 return <nav className="mc-system-dock" aria-label="Sistemas da cidade">
  <div className="mc-system-primary"><div className="mc-system-primary-label">COMANDO RÁPIDO</div>{([["story","story","HISTÓRIA"],["roster","hangar","HANGAR"],["modes","arena","ARENA"],["online","arena","ONLINE"]] as const).map(([id,art,label])=><button key={id} className={id==="story"?"mc-system-story":undefined} data-testid={`dock-${id}`} disabled={disabled} onClick={()=>go(id)}><img src={`/overhaul/${art}.webp`} alt=""/><span>{label}</span></button>)}
  <button className="mc-system-all" disabled={disabled} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><img src="/overhaul/systems.webp" alt=""/><span>{open?"FECHAR":"TODOS OS SISTEMAS"}</span></button></div>
  {open&&<div className="mc-system-menu"><button className="mc-system-close" onClick={()=>setOpen(false)}>FECHAR PAINEL ×</button>{GROUPS.map(group=>{
   const available=group.items.filter(([id])=>systemUnlocked(g,id));
   return available.length>0?<section key={group.label}><h3><span>{group.tag}</span>{group.label}</h3><div>{available.map(([id,label])=><button key={id} onClick={()=>go(id)} disabled={disabled}><img src={`/overhaul/${id==="profile"?"pilot":id==="ranked"||id==="online"||id==="tournaments"?"arena":id==="engineer"||id==="lab"?"repair":id==="shop"?"items":"star"}.webp`} alt=""/><span>{label}</span></button>)}</div></section>:null;
  })}{next&&<p>Próximo distrito no nível {next[1]} de piloto.</p>}</div>}
 </nav>;
}
