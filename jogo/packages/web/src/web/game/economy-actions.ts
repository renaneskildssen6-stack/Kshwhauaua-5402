import { ITEM_MAP, TRAIN_COST_PER_POINT } from "./config";
import { getState, setState, lockedRobotIds } from "./save";
import { ROBOT_MAP } from "./robots";
import { maxTrained } from "./engine";

export type PurchaseResult = {ok:true;cost:number;quantity:number;robotId?:string}|{ok:false;reason:string};

/** Validate against live state and charge/grant together, never against stale UI props. */
export function purchaseSupplies(itemId:string,quantity=1,rng:()=>number=Math.random):PurchaseResult {
 const item=ITEM_MAP[itemId];
 if(!item||!Number.isInteger(quantity)||quantity<1||quantity>5)return {ok:false,reason:"COMPRA INVÁLIDA"};
 if(itemId==="capsule"&&quantity!==1)return {ok:false,reason:"RECRUTE UM CHASSI POR VEZ"};
 const g=getState();const cost=item.price*quantity;
 if(g.gold<cost)return {ok:false,reason:`FALTAM ${cost-g.gold} OURO`};
 let robotId:string|undefined;
 if(itemId==="capsule"){
  const locked=lockedRobotIds();
  if(!locked.length)return {ok:false,reason:"COLEÇÃO COMPLETA · NENHUM OURO GASTO"};
  const random=rng();
  if(!Number.isFinite(random))return {ok:false,reason:"SINAL DE RECRUTAMENTO INVÁLIDO"};
  robotId=locked[Math.min(locked.length-1,Math.max(0,Math.floor(random*locked.length)))];
 }
 const id=robotId;
 const average=g.robots.length?Math.max(1,Math.round(g.robots.reduce((sum,r)=>sum+r.level,0)/g.robots.length)-1):1;
 setState(s=>({...s,gold:s.gold-cost,
   robots:id?[...s.robots,{id,level:average,xp:0,trained:{str:0,def:0,agl:0}}]:s.robots,
   team:id&&!s.team.length?[id]:s.team,
   items:id?s.items:{...s.items,[itemId]:(s.items[itemId]??0)+quantity}}));
 return {ok:true,cost,quantity,robotId};
}

export function trainRobotStat(robotId:string,stat:"str"|"def"|"agl",points=1):PurchaseResult {
 if(!["str","def","agl"].includes(stat)||!Number.isInteger(points)||points<1||points>5)return {ok:false,reason:"TREINO INVÁLIDO"};
 const g=getState();const robot=g.robots.find(r=>r.id===robotId);const def=ROBOT_MAP[robotId];
 if(!robot||!def)return {ok:false,reason:"CHASSI NÃO RECRUTADO"};
 const cap=maxTrained(def.ratios,robot.level)[stat];
 if(robot.trained[stat]+points>cap)return {ok:false,reason:"LIMITE DE TREINO ATINGIDO"};
 const cost=TRAIN_COST_PER_POINT*robot.level*points;
 if(g.gold<cost)return {ok:false,reason:`FALTAM ${cost-g.gold} OURO`};
 setState(s=>({...s,gold:s.gold-cost,robots:s.robots.map(r=>r.id===robotId?
   {...r,trained:{...r.trained,[stat]:r.trained[stat]+points}}:r)}));
 return {ok:true,cost,quantity:points};
}