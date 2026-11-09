import { drones } from '../drones-data';
export interface DroneState { levels:Record<string,number>; enabled:Record<string,boolean> }
export const freshDrones=():DroneState=>({levels:{},enabled:{}});
export function normalizeDrones(raw:Partial<DroneState>|undefined):DroneState {
 const levels:Record<string,number>={};
 for(const [id,n] of Object.entries(raw?.levels??{}))if(drones[id]&&Number.isFinite(n))levels[id]=Math.max(1,Math.min(10,Math.floor(n)));
 return {levels,enabled:Object.fromEntries(Object.keys(levels).map(id=>[id,raw?.enabled?.[id]!==false]))};
}
export const droneCost=(level:number)=>level===0?250:Math.round(180*Math.pow(1.6,level));
export const droneOreCost=(level:number)=>level===0?0:level*5;
export function droneLevel(s:{drones:DroneState;robots:{id:string}[]},id:string):number {
 return s.robots.some(r=>r.id===id)&&s.drones.enabled[id]!==false?s.drones.levels[id]??0:0;
}
export function droneStats(id:string,level:number) {
 const out={hp:0,mp:0,str:0,def:0,agl:0};if(!level)return out;
 const role=drones[id]?.role;
 if(['Sentinela','Interditor','Resgatista'].includes(role))out.def=level*2;
 else if(['Batedor','Amplificador'].includes(role))out.str=level*2;
 else if(role==='Navegador')out.agl=level*2;
 else if(['Condutor','Coletor'].includes(role))out.mp=level*3;
 else out.hp=level*8;
 return out;
}
export function droneEffect(id:string,level:number):string {
 const b=droneStats(id,level);const text=Object.entries(b).filter(([,n])=>n).map(([k,n])=>`+${n} ${k.toUpperCase()}`).join(' · ');
 const role=drones[id]?.role;
 const special=role==='Mecânico'?`Repara ${1+level*.2}% HP a cada 3 rodadas.`:role==='Condutor'?`Recupera ${2+level*.2}% MP a cada 3 rodadas.`:role==='Purificador'?'Remove veneno ou queimadura a cada 4 rodadas.':role==='Resgatista'?`Escudo inicial de ${3+level*.3}% HP por 2 rodadas.`:'Bônus passivo exclusivo do dono.';
 return `${text}. ${special} Mineração: +${level*2}% de dano manual. Sem bônus no PvP.`;
}