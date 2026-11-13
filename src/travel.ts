/** Real, deterministic yearly travel with paid fares and bounded memories.
 * Destinations are original themes rather than borrowed reference-game content.
 */
export const JOURNEYS=['coast','mountains','history','metropolis','family','expedition'] as const;
export type JourneyId=typeof JOURNEYS[number];
export type TravelDiary={id:JourneyId;age:number};
export type TravelState={lastAge:number;visits:TravelDiary[]};
export type Journey={id:JourneyId;pt:string;en:string;ptDescription:string;enDescription:string;
 cost:number;minAge:number;effects:{happiness?:number;health?:number;smarts?:number;looks?:number};
 family:number;friends:number;credits:number};
export const DESTINATIONS:readonly Journey[]=[
 {id:'coast',pt:'Costa do Atlântico',en:'Atlantic coast',
  ptDescription:'Descubra o litoral, descanse e conheça novas pessoas.',enDescription:'Explore the coast, relax and meet new people.',
  cost:2200,minAge:18,effects:{happiness:9,health:2},family:3,friends:4,credits:0},
 {id:'mountains',pt:'Trilhas nas montanhas',en:'Mountain trails',
  ptDescription:'Uma caminhada exigente entre montanhas e cachoeiras.',enDescription:'A demanding walk through mountains and waterfalls.',
  cost:1800,minAge:18,effects:{health:6,happiness:5},family:0,friends:3,credits:0},
 {id:'history',pt:'Circuito histórico',en:'Historic circuit',
  ptDescription:'Conheça museus, patrimônios e histórias locais.',enDescription:'Explore museums, heritage sites and local stories.',
  cost:2700,minAge:18,effects:{smarts:7,happiness:4},family:0,friends:2,credits:2},
 {id:'metropolis',pt:'Uma cidade vibrante',en:'A lively city',
  ptDescription:'Passeie por bairros, mercados e eventos culturais.',enDescription:'Explore neighborhoods, markets and cultural events.',
  cost:3100,minAge:18,effects:{smarts:3,happiness:7},family:0,friends:5,credits:1},
 {id:'family',pt:'Viagem em família',en:'Family getaway',
  ptDescription:'Dedique alguns dias à convivência com familiares.',enDescription:'Spend a few days reconnecting with family.',
  cost:1800,minAge:18,effects:{happiness:7},family:13,friends:0,credits:0},
 {id:'expedition',pt:'Aventura na natureza',en:'Nature expedition',
  ptDescription:'Uma jornada planejada com atividades ao ar livre.',enDescription:'A planned expedition with outdoor activities.',
  cost:4800,minAge:20,effects:{health:5,smarts:4,happiness:6},family:0,friends:4,credits:1}
];
export const destination=(v:unknown):Journey|null=>typeof v==='string'?DESTINATIONS.find(x=>x.id===v)??null:null;
export const createTravelState=():TravelState=>({lastAge:-1,visits:[]});
export function normalizeTravelState(raw:unknown):TravelState{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return createTravelState();
 const r=raw as Record<string,unknown>,ages=new Set<number>(),visits:TravelDiary[]=[];
 if(Array.isArray(r.visits))for(const item of r.visits.slice(-110)){
  if(!item||typeof item!=='object'||Array.isArray(item))continue;
  const p=item as Record<string,unknown>;
  const trip=destination(p.id);
  if(!trip||!Number.isInteger(p.age)||Number(p.age)<trip.minAge||Number(p.age)>105||ages.has(Number(p.age)))continue;
  ages.add(Number(p.age));visits.push({id:p.id as JourneyId,age:Number(p.age)});
 }
 visits.sort((a,b)=>a.age-b.age);
 const last=visits.at(-1)?.age??-1;
 return {lastAge:last,visits};
}
export function canTravel(state:TravelState,age:number,id:unknown,balance:number):boolean{
 const trip=destination(id);
 return !!trip&&Number.isInteger(age)&&age>=trip.minAge&&age<=105&&
  state.lastAge!==age&&balance>=trip.cost&&Number.isFinite(balance);
}
export function recordTravel(state:TravelState,age:number,id:JourneyId):TravelState{
 const trip=destination(id);
 if(state.lastAge===age||!trip||!Number.isInteger(age)||age<trip.minAge||age>105||
    state.visits.some(x=>x.age===age))return state;
 const next=normalizeTravelState({visits:[...state.visits,{id,age}]});
 return {lastAge:age,visits:next.visits};
}
