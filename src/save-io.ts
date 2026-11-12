/** Import/export guard for user-created life saves; no cloud account required. */
export type ImportResult={ok:true;value:Record<string,unknown>}|{ok:false;error:string};
const record=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==='object'&&!Array.isArray(v);
const range=(v:unknown,lo:number,hi:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const short=(v:unknown,max=250):v is string=>typeof v==='string'&&v.length<=max;
const stats=['happiness','health','smarts','looks'] as const;
export function validateLifeSave(json:string):ImportResult {
 if(typeof json!=='string'||json.length>1_000_000)return {ok:false,error:'file-size'};
 let value:unknown;
 try{value=JSON.parse(json);}catch{return {ok:false,error:'invalid-json'};}
 if(!record(value)||!short(value.name,52)||!value.name.trim()||
    !Number.isInteger(value.age)||!range(value.age,0,110)||
    !record(value.stats))return {ok:false,error:'invalid-life'};
 for(const key of stats)if(!range(value.stats[key],0,100))return {ok:false,error:'invalid-stats'};
 if(value.history!==undefined && (!Array.isArray(value.history)||value.history.length>1000||
   !value.history.every(v=>short(v,3000))))return {ok:false,error:'invalid-history'};
 if(value.seenEventIds!==undefined && (!Array.isArray(value.seenEventIds)||value.seenEventIds.length>500||
   !value.seenEventIds.every(v=>short(v,80))))return {ok:false,error:'invalid-events'};
 if(value.pendingEvent!==undefined && value.pendingEvent!==null){
  const ev=value.pendingEvent;
  if(!record(ev)||!short(ev.id,80)||!short(ev.title,300)||!short(ev.description,2000)||
     !Array.isArray(ev.choices)||ev.choices.length!==3)return {ok:false,error:'invalid-pending-event'};
  for(const choice of ev.choices){
   if(!record(choice)||!short(choice.label,250)||!short(choice.result,2000)||!record(choice.effects))
     return {ok:false,error:'invalid-choice'};
   for(const [key,effect] of Object.entries(choice.effects)){
    if(!stats.includes(key as typeof stats[number])||!range(effect,-100,100))
      return {ok:false,error:'invalid-choice-effect'};
   }
  }
 }
 // Sanitize only the entry-level shape; loadLife normalizes known nested data.
 const clean:Record<string,unknown>={name:value.name.trim(),age:value.age,stats:value.stats};
 for(const key of ['birthYear','history','seenEventIds','eventLedger','lastEventId','pendingEvent','simulation','profile','social','familyMembers','ancestors'])
  if(Object.hasOwn(value,key))clean[key]=value[key];
 return {ok:true,value:clean};
}
export function serializeLife(value:unknown):string {
 return JSON.stringify(value,null,2);
}
export function saveFilename(name:string):string {
 const slug=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
 return 'zoid-life-'+(slug.slice(0,45)||'personagem')+'.json';
}
