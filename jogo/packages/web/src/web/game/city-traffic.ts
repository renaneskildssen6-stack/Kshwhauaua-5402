import { CITY_WIDTH, TRAFFIC_LANES } from './connected-city';

export type TrafficCar={sprite:'car'|'taxi'|'truck';lane:0|1;x:number;speed:number;cruise:number;w:number;h:number;phase:number};
const SIZE={car:[118,50],taxi:[116,53],truck:[150,85]} as const;

/** Deterministic set of hover cars spread along both avenue lanes. */
export function createTraffic():TrafficCar[]{
 const kinds:TrafficCar['sprite'][]=['car','taxi','car','truck','taxi','car','car','truck'];
 return Array.from({length:16},(_,i)=>{
  const sprite=kinds[i%kinds.length],lane=(i%2) as 0|1,[w,h]=SIZE[sprite];
  const cruise=(sprite==='truck'?120:sprite==='taxi'?170:200)+(i*37%40);
  return {sprite,lane,x:(i*1093+lane*420)%CITY_WIDTH,speed:cruise,cruise,w,h,phase:i*1.7};
 });
}

/** Cars cruise, keep distance from the car ahead and brake for a robot standing in their lane. */
export function stepTraffic(cars:TrafficCar[],dt:number,robot:{x:number;z:number;height:number;underground:boolean}){
 for(const car of cars){
  const lane=TRAFFIC_LANES[car.lane];
  let target=car.cruise;
  if(!robot.underground&&robot.height<70&&Math.abs(robot.z-lane.z)<50){
   const gap=(robot.x-car.x)*lane.dir-car.w/2;
   if(gap>-car.w*.4&&gap<150)target=0;else if(gap>=150&&gap<320)target=Math.min(target,(gap-150)*1.1);
  }
  for(const other of cars){
   if(other===car||other.lane!==car.lane)continue;
   const gap=(other.x-car.x)*lane.dir-(car.w+other.w)/2;
   if(gap>0&&gap<70)target=Math.min(target,other.speed*.9);
   if(gap>-10&&gap<=0)target=0;
  }
  const accel=target<car.speed?520:150;
  car.speed=target<car.speed?Math.max(target,car.speed-accel*dt):Math.min(target,car.speed+accel*dt);
  car.x+=lane.dir*car.speed*dt;car.phase+=dt;
  if(car.x>CITY_WIDTH+260)car.x=-260;else if(car.x< -260)car.x=CITY_WIDTH+260;
 }
}
