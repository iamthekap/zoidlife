/** Fictional original justice mechanics for Zoid Life: story outcomes only. */
export type OffenseId='petty-theft'|'vandalism'|'financial-fraud';
export type JusticeState={convictions:number;lastConvictionAge:number;incarceratedUntil:number;
 history:{id:OffenseId;age:number;caught:boolean;fine:number;reward:number}[]};
export const OFFENSES=[
 {id:'petty-theft',age:14,reward:300,fine:900,years:1,pt:'Pequeno furto',en:'Petty theft'},
 {id:'vandalism',age:14,reward:0,fine:1800,years:1,pt:'Vandalismo',en:'Vandalism'},
 {id:'financial-fraud',age:18,reward:2500,fine:7500,years:3,pt:'Fraude financeira',en:'Financial fraud'}
] as const;
const clamp=(n:unknown,limit:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(limit,Math.round(n))):0;
export function createJustice():JusticeState{return {convictions:0,lastConvictionAge:-1,incarceratedUntil:0,history:[]};}
export function loadJustice(raw:unknown):JusticeState{
 if(!raw||typeof raw!=='object')return createJustice();
 const r=raw as Partial<JusticeState>;
 const history:JusticeState['history']=[];
 for(const e of Array.isArray(r.history)?r.history.slice(-40):[]){
  if(!e||!OFFENSES.some(x=>x.id===e.id)||!Number.isInteger(e.age)||e.age<0||e.age>110)continue;
  history.push({id:e.id,age:e.age,caught:e.caught===true,fine:clamp(e.fine,100000),reward:clamp(e.reward,100000)});
 }
 return {history,convictions:clamp(r.convictions,100),
  incarceratedUntil:clamp(r.incarceratedUntil,110),
  lastConvictionAge:Number.isInteger(r.lastConvictionAge)&&r.lastConvictionAge!>=-1&&r.lastConvictionAge!<=110?r.lastConvictionAge!:-1};
}
export function justiceLabel(id:OffenseId,language:'pt-BR'|'en'):string{
 const offense=OFFENSES.find(x=>x.id===id);
 return offense?(language==='en'?offense.en:offense.pt):id;
}
export function legalStatus(s:JusticeState,age:number,language:'pt-BR'|'en'):string{
 if(s.incarceratedUntil>age)return language==='en'?'Serving sentence':'Cumprindo pena';
 if(s.convictions)return language==='en'?'Criminal record':'Antecedentes registrados';
 return language==='en'?'No convictions':'Sem condenações';
}
export function judgeOffense(raw:unknown,age:number,smarts:number,id:OffenseId){
 const rule=OFFENSES.find(o=>o.id===id),prev=loadJustice(raw);
 if(!rule||age<rule.age||age>=110||prev.incarceratedUntil>age)return null;
 const risk=id==='financial-fraud'?70:id==='vandalism'?57:46;
 const chance=Math.max(18,Math.min(88,risk-Math.floor(smarts/9)));
 const roll=(age*37+smarts*13+prev.convictions*17+rule.fine)%100;
 const caught=roll<chance, fine=caught?rule.fine:0,reward=caught?0:rule.reward;
 const sentence=caught&&age>=18?rule.years:0;
 const justice:JusticeState={...prev,convictions:prev.convictions+(caught?1:0),
  lastConvictionAge:caught?age:prev.lastConvictionAge,
  incarceratedUntil:Math.max(prev.incarceratedUntil,age+sentence),
  history:[...prev.history.slice(-39),{id,age,caught,fine,reward}]};
 return {caught,fine,reward,sentence,justice};
}
