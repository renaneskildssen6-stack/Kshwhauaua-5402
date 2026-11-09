import { useGame, setTeam } from "@/game/save";
import { totalStats } from "@/game/engine";
import { ROBOT_MAP, portraitUrl } from "@/game/robots";
import "./pilot-polish.css";

export function TeamWorkbench({onInspect}:{onInspect:(id:string)=>void}) {
 const g=useGame();
 const machines=g.team.map(id=>g.robots.find(r=>r.id===id)).filter(r=>r!==undefined);
 const stats=machines.map(r=>totalStats(ROBOT_MAP[r.id],r));
 const sum=(key:"hp"|"str"|"def"|"agl")=>stats.reduce((n,s)=>n+s[key],0);
 const elements=new Set(machines.map(r=>ROBOT_MAP[r.id].element));
 const move=(index:number,delta:number)=>{const ids=[...g.team];const to=index+delta;if(to<0||to>=ids.length)return;
   [ids[index],ids[to]]=[ids[to],ids[index]];setTeam(ids);};
 return <section className="mc-team-workbench" aria-label="Preparação do esquadrão">
   <header><small>PRONTIDÃO DE CAMPO</small><strong>{machines.length}/4 CHASSIS · {elements.size} ELEMENTOS</strong></header>
   <div className="mc-team-slots">{Array.from({length:4},(_,index)=>{const r=machines[index];return <div key={r?.id??index} className="mc-team-slot" data-empty={!r}>
     <span>{index===0?"ATIVO":"RESERVA"} · 0{index+1}</span>
     {r?<><button className="mc-team-inspect" onClick={()=>onInspect(r.id)} aria-label={`Inspecionar ${ROBOT_MAP[r.id].name}`}><img src={portraitUrl(r.id)} alt="" width={48} height={48}/><strong>{ROBOT_MAP[r.id].name}</strong><small>LV {r.level}</small></button>
     <div className="mc-team-reorder"><button disabled={index===0} aria-label={`Mover ${ROBOT_MAP[r.id].name} para a posição anterior`} onClick={()=>move(index,-1)}>←</button><button disabled={index===machines.length-1} aria-label={`Mover ${ROBOT_MAP[r.id].name} para a próxima posição`} onClick={()=>move(index,1)}>→</button></div></>:<div className="mc-team-empty">VAGA<br/>LIVRE</div>}
   </div>;})}</div>
   <div className="mc-team-metrics"><span>HP <b>{sum("hp")}</b></span><span>FOR <b>{sum("str")}</b></span><span>DEF <b>{sum("def")}</b></span><span>AGI <b>{sum("agl")}</b></span></div>
   <p>A posição 01 inicia em campo. Reordene sem custo. Atributos somados são uma visão do esquadrão, não dano combinado.</p>
 </section>;
}