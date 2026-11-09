import { getState,setState } from './save';
import { drones } from '../drones-data';
import { droneCost,droneOreCost } from './drone-system';
export function upgradeDrone(id:string):boolean {
 const s=getState();const level=s.drones.levels[id]??0;
 if(!drones[id]||!s.robots.some(r=>r.id===id)||s.playerLevel<3&&!s.tutorial.legacyAccess||level>=10)return false;
 const cost=droneCost(level),iron=droneOreCost(level);
 if(s.gold<cost||(s.mining.ores.ferro??0)<iron)return false;
 setState(g=>({...g,gold:g.gold-cost,mining:{...g.mining,ores:{...g.mining.ores,ferro:(g.mining.ores.ferro??0)-iron}},drones:{levels:{...g.drones.levels,[id]:level+1},enabled:{...g.drones.enabled,[id]:true}}}));
 return true;
}
export function toggleDrone(id:string) {
 const s=getState();if(!s.drones.levels[id]||!s.robots.some(r=>r.id===id))return;
 setState(g=>({...g,drones:{...g.drones,enabled:{...g.drones.enabled,[id]:g.drones.enabled[id]===false}}}));
}