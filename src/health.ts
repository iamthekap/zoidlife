/** Original deterministic health conditions for fictional Zoid Life. Not medical advice. */
export type ConditionId='fatigue'|'strain'|'mobility';
export type Condition={id:ConditionId;severity:1|2|3;since:number};
const valid=['fatigue','strain','mobility'] as const;
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(Number.isFinite(n)?n:0)));
export function normalizeConditions(raw:unknown):Condition[]{
 if(!Array.isArray(raw))return [];
 const seen=new Set<string>();const result:Condition[]=[];
 for(const item of raw.slice(0,20)){
  if(!item||typeof item!=='object')continue;
  const o=item as Record<string,unknown>;
  if(typeof o.id!=='string'||!valid.includes(o.id as ConditionId)||seen.has(o.id))continue;
  if(typeof o.severity!=='number'||!Number.isInteger(o.severity)||o.severity<1||o.severity>3)continue;
  if(typeof o.since!=='number'||!Number.isInteger(o.since)||o.since<0||o.since>110)continue;
  seen.add(o.id);result.push({id:o.id as ConditionId,severity:o.severity as 1|2|3,since:o.since});
 }
 return result;
}
export function healthLabel(id:ConditionId,locale:'pt-BR'|'en'):string{
 const names:Record<ConditionId,[string,string]>={
  fatigue:['Cansaço persistente','Persistent fatigue'],strain:['Sobrecarga','Overexertion'],
  mobility:['Mobilidade reduzida','Reduced mobility']};
 return names[id][locale==='en'?1:0];
}
export function advanceHealth(raw:unknown,age:number,health:number,happiness:number,employed:boolean){
 let conditions=normalizeConditions(raw);const notes:string[]=[];
 const add=(id:ConditionId,severity:1|2)=>{
  if(conditions.some(c=>c.id===id))return;
  conditions=[...conditions,{id,severity,since:age}];notes.push('health-start:'+id);
 };
 if(age>=18&&age<=64&&employed&&health<=65&&age%6===0)add('fatigue',1);
 if(age>=12&&health<=40&&age%11===0)add('strain',2);
 if(age>=65&&health<=65&&age%7===0)add('mobility',1);
 const loss=Math.min(6,conditions.reduce((sum,c)=>sum+c.severity,0));
 return {conditions,health:clamp(health-loss),
  happiness:clamp(happiness-(conditions.length?1:0)),notes};
}
export function treatHealth(raw:unknown){
 const conditions=normalizeConditions(raw);
 if(!conditions.length)return {conditions,notes:[] as string[],healthBonus:0};
 const active=[...conditions].sort((a,b)=>b.severity-a.severity||a.since-b.since)[0];
 const next=conditions.flatMap(c=>c.id!==active.id?[c]:
  c.severity===1?[]:[{...c,severity:(c.severity-1) as 1|2}]);
 return {conditions:next,healthBonus:3,notes:[(active.severity===1?'health-recovered:':'health-treated:')+active.id]};
}
