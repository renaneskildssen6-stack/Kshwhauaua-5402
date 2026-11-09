export interface CityLife {
 research: number; scans: string[]; specimens: string[]; blueprints: string[];
 workshop: { job: 'scanner'|'decor'|null; endsAt: number }; homeStyle: number;
 metroVisits: string[]; museumDonations: string[]; purchases: number;
 mineHits: number; mineBreaks: number; contracts: string[];
}
export const freshCityLife=():CityLife=>({research:0,scans:[],specimens:[],blueprints:[],workshop:{job:null,endsAt:0},homeStyle:0,metroVisits:[],museumDonations:[],purchases:0,mineHits:0,mineBreaks:0,contracts:[]});
export function normalizeCityLife(raw:Partial<CityLife>|undefined):CityLife {
 const base=freshCityLife();if(!raw)return base;
 const strings=(v:unknown)=>Array.isArray(v)?[...new Set(v.filter((s):s is string=>typeof s==='string'))]:[];
 const num=(v:unknown)=>Math.max(0,Math.floor(Number(v)||0));
 return {...base,research:num(raw.research),scans:strings(raw.scans),specimens:strings(raw.specimens),blueprints:strings(raw.blueprints),homeStyle:Math.min(2,num(raw.homeStyle)),metroVisits:strings(raw.metroVisits),museumDonations:strings(raw.museumDonations),purchases:num(raw.purchases),mineHits:num(raw.mineHits),mineBreaks:num(raw.mineBreaks),contracts:strings(raw.contracts),workshop:{job:raw.workshop?.job==='scanner'||raw.workshop?.job==='decor'?raw.workshop.job:null,endsAt:num(raw.workshop?.endsAt)}};
}
export const METRO_STOPS=[{id:'hangar',name:'CENTRAL / HANGAR',x:300},{id:'arena',name:'ARENA / COMÉRCIO',x:1300},{id:'forge',name:'INDUSTRIAL / FORJA',x:2820},{id:'mine',name:'MINA / SUBSOLO',x:4320},{id:'research',name:'PESQUISA / ACADEMIA',x:5890},{id:'museum',name:'CULTURA / MUSEU',x:7470},{id:'portal',name:'PORTAL / TERMINAL',x:8020}];
export const CITY_SPOTS=[
 {id:'metro',name:'METRÔ SUBTERRÂNEO',x:480,z:120,art:203},
 {id:'supermarket',name:'SUPERMERCADO ÓRBITA',x:940,z:120,art:9},
 {id:'npc',name:'PRAÇA / LYRA',x:1550,z:-110,art:265},
 {id:'construction',name:'CANTEIRO / NARA',x:3040,z:120,art:184},
 {id:'metro',name:'METRÔ / MINA',x:4490,z:120,art:207},
 {id:'museum',name:'MUSEU DE MINERAIS',x:7520,z:-110,art:10},
];