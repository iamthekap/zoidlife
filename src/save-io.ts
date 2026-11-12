/** Import/export guard for user-created life saves; no cloud account required. */
export type ImportResult={ok:true;value:Record<string,unknown>}|{ok:false;error:string};
export const MAX_SAVE_BYTES=4_000_000;
const record=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==='object'&&!Array.isArray(v);
const range=(v:unknown,lo:number,hi:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const short=(v:unknown,max=250):v is string=>typeof v==='string'&&v.length<=max;
const stats=['happiness','health','smarts','looks'] as const;
export function validateLifeSave(json:string):ImportResult {
 if(typeof json!=='string'||new TextEncoder().encode(json).length>MAX_SAVE_BYTES)return {ok:false,error:'file-size'};
 let value:unknown;
 try{value=JSON.parse(json);}catch{return {ok:false,error:'invalid-json'};}
 if(!record(value)||!short(value.name,52)||!value.name.trim()||
    !Number.isInteger(value.age)||!range(value.age,0,110)||
    !record(value.stats))return {ok:false,error:'invalid-life'};
 for(const key of stats)if(!range(value.stats[key],0,100))return {ok:false,error:'invalid-stats'};
 if(value.history!==undefined && (!Array.isArray(value.history)||value.history.length>6000||
   !value.history.every(v=>short(v,3000))))return {ok:false,error:'invalid-history'};
 if(value.seenEventIds!==undefined && (!Array.isArray(value.seenEventIds)||value.seenEventIds.length>1000||
   !value.seenEventIds.every(v=>short(v,80))))return {ok:false,error:'invalid-events'};
 if(value.chronicle!==undefined && (!Array.isArray(value.chronicle)||value.chronicle.length>6000||
   !value.chronicle.every(e=>record(e)&&Number.isInteger(e.historyIndex)&&range(e.historyIndex,0,6000)&&
    Number.isInteger(e.age)&&range(e.age,0,110)&&short(e.eventId,80)&&short(e.title,300)&&
    short(e.description,2000)&&short(e.choice,500)&&short(e.result,3000)&&
    (e.category===undefined||short(e.category,64)))))return {ok:false,error:'invalid-chronicle'};
 if(value.pendingEvent!==undefined && value.pendingEvent!==null){
  const ev=value.pendingEvent;
  if(!record(ev)||!short(ev.id,80)||!short(ev.title,300)||!short(ev.description,2000)||
     !Array.isArray(ev.choices)||ev.choices.length!==3)return {ok:false,error:'invalid-pending-event'};
  for(const choice of ev.choices){
   if(!record(choice)||!short(choice.label,250)||!short(choice.result,2000)||!record(choice.effects))
     return {ok:false,error:'invalid-choice'};
   if(choice.world!==undefined){
    if(!record(choice.world))return {ok:false,error:'invalid-world'};
    const keys=['cash','debt','investments','family','friends','partner','credits','experience',
      'careerMomentum','training','mysticMastery','relationship'];
    for(const [key,impact] of Object.entries(choice.world)){
      if(!keys.includes(key))return {ok:false,error:'invalid-world'};
      if(key==='relationship'){
        if(!['single','dating','married'].includes(String(impact)))return {ok:false,error:'invalid-world'};
      }else if(!range(impact,-100000,100000))return {ok:false,error:'invalid-world'};
    }
   }
   for(const [key,effect] of Object.entries(choice.effects)){
    if(!stats.includes(key as typeof stats[number])||!range(effect,-100,100))
      return {ok:false,error:'invalid-choice-effect'};
   }
  }
 }
 // Sanitize only the entry-level shape; loadLife normalizes known nested data.
 const clean:Record<string,unknown>={name:value.name.trim(),age:value.age,stats:value.stats};
 for(const key of ['birthYear','history','chronicle','seenEventIds','eventLedger','lastEventId','pendingEvent','simulation','profile','social','familyMembers','ancestors'])
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
