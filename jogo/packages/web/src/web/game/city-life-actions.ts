import { getState, setState, miningTick, startRefine } from './save';
import { ORE_MAP, refineBatch, refineMs, BAR_COST } from './mining';

export function scanRobot(id:string):boolean {
 const s=getState();if(!s.robots.some(r=>r.id===id)||s.cityLife.scans.includes(id))return false;
 setState(g=>({...g,cityLife:{...g.cityLife,scans:[...g.cityLife.scans,id],research:g.cityLife.research+5}}));return true;
}
export function analyzeOre(id:string):boolean {
 const s=getState();if(!ORE_MAP[id]||(s.mining.ores[id]||0)<10||s.cityLife.specimens.includes(id))return false;
 setState(g=>({...g,mining:{...g.mining,ores:{...g.mining.ores,[id]:g.mining.ores[id]-10}},cityLife:{...g.cityLife,specimens:[...g.cityLife.specimens,id],research:g.cityLife.research+10}}));return true;
}
export function startHomeProject(job:'scanner'|'decor'):boolean {
 const s=getState();const cost=job==='scanner'?15:10;
 if(s.cityLife.workshop.job||s.cityLife.blueprints.includes(job)||s.cityLife.research<cost||s.gold<150)return false;
 setState(g=>({...g,gold:g.gold-150,cityLife:{...g.cityLife,research:g.cityLife.research-cost,workshop:{job,endsAt:Date.now()+60000}}}));return true;
}
export function collectHomeProject():boolean {
 const s=getState(),j=s.cityLife.workshop;if(!j.job||j.endsAt>Date.now())return false;
 setState(g=>({...g,cityLife:{...g.cityLife,blueprints:[...g.cityLife.blueprints,j.job!],workshop:{job:null,endsAt:0}}}));return true;
}
export function setHomeStyle(style:number){if(!Number.isInteger(style)||style<0||style>2||style>0&&!getState().cityLife.blueprints.includes('decor'))return;setState(g=>({...g,cityLife:{...g.cityLife,homeStyle:style}}))}
export function donateOre(id:string):boolean {
 const s=getState();if(!ORE_MAP[id]||s.cityLife.museumDonations.includes(id)||(s.mining.ores[id]||0)<20)return false;
 setState(g=>({...g,mining:{...g.mining,ores:{...g.mining.ores,[id]:g.mining.ores[id]-20}},cityLife:{...g.cityLife,museumDonations:[...g.cityLife.museumDonations,id]}}));return true;
}
export function recordMetro(id:string){setState(g=>g.cityLife.metroVisits.includes(id)?g:{...g,cityLife:{...g.cityLife,metroVisits:[...g.cityLife.metroVisits,id]}})}
export function recordMineHit(broken:boolean){setState(g=>({...g,cityLife:{...g.cityLife,mineHits:g.cityLife.mineHits+1,mineBreaks:g.cityLife.mineBreaks+Number(broken)}}))}
export const MINE_CONTRACTS=[{id:'break25',name:'ABRIR A GALERIA',desc:'Quebre 25 veios',target:25,reward:300},{id:'break100',name:'ESPECIALISTA DE CAMPO',desc:'Quebre 100 veios',target:100,reward:1200},{id:'break300',name:'MESTRE DO SUBSOLO',desc:'Quebre 300 veios',target:300,reward:3000}];
export function claimMineContract(id:string):boolean {
 const s=getState(),c=MINE_CONTRACTS.find(c=>c.id===id);if(!c||s.cityLife.contracts.includes(id)||s.cityLife.mineBreaks<c.target)return false;
 setState(g=>({...g,gold:g.gold+c.reward,cityLife:{...g.cityLife,contracts:[...g.cityLife.contracts,id]}}));return true;
}
export function sellOreOnly(id:string,qty:number):boolean {
 const s=getState();if(!ORE_MAP[id]||!Number.isInteger(qty)||qty<=0||(s.mining.ores[id]||0)<qty)return false;
 const value=ORE_MAP[id].value*qty;
 setState(g=>({...g,gold:g.gold+value,mining:{...g.mining,ores:{...g.mining.ores,[id]:g.mining.ores[id]-qty},totalGold:g.mining.totalGold+value}}));return true;
}
export function travelMine(depth:number):boolean {
 const s=getState();if(!Number.isInteger(depth)||depth<1||depth>s.mining.highestDepth)return false;
 miningTick();setState(g=>({...g,mining:{...g.mining,depth}}));return true;
}
export function enqueueRefine(id:string):boolean {
 const s=getState(),m=s.mining;if(!ORE_MAP[id]||m.queue.length>=3)return false;
 const qty=Math.min(refineBatch(m.refinery),Math.floor((m.ores[id]||0)/BAR_COST));if(qty<=0)return false;
 if(!m.job)return startRefine(id,qty);
 const last=m.queue[m.queue.length-1]||m.job;
 const endsAt=Math.max(Date.now(),last.endsAt)+refineMs(qty,m.refinery);
 setState(g=>({...g,mining:{...g.mining,ores:{...g.mining.ores,[id]:(g.mining.ores[id]||0)-qty*BAR_COST},queue:[...g.mining.queue,{ore:id,bars:qty,endsAt}]}}));return true;
}