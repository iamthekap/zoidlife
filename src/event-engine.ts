/** Context-aware event scheduling: original reusable scenarios and lifetime memory. */
export type LedgerEntry={ lastAge:number; count:number };
export type EventLedger=Record<string,LedgerEntry>;
export type Schedulable={id:string;minAge:number;maxAge:number};
const ONCE=new Set([
 'school','first-job','relationship','playground','science-fair','scholarship','first-rent','first-budget'
]);
const cooldown=(id:string):number=>id==='quiet-year'?1:ONCE.has(id)?999:4;
/** Backward-compatible migration for characters created before the event ledger existed. */
export function migrateLedger(raw:unknown,seenIds:unknown):EventLedger {
  const result:EventLedger=Object.create(null) as EventLedger;
  if(raw && typeof raw==='object' && !Array.isArray(raw)){
    for(const [id,entry] of Object.entries(raw)){
      if(!/^[a-z0-9-]{1,60}$/.test(id) || !entry || typeof entry!=='object')continue;
      const e=entry as Partial<LedgerEntry>;
      if(typeof e.lastAge!=='number' || !Number.isInteger(e.lastAge) ||
         e.lastAge < -1000 || e.lastAge>110 ||
         typeof e.count!=='number' || !Number.isInteger(e.count) || e.count<0 || e.count>10000)continue;
      result[id]={lastAge:e.lastAge,count:e.count};
    }
  }
  if(Array.isArray(seenIds))for(const id of seenIds){
    if(typeof id==='string' && /^[a-z0-9-]{1,60}$/.test(id) && !result[id])
      result[id]={lastAge:-1000,count:1};
  }
  return result;
}
export function recordEvent(ledger:EventLedger,id:string,age:number):EventLedger {
  if(!/^[a-z0-9-]{1,60}$/.test(id) || !Number.isInteger(age))return ledger;
  const old=ledger[id];
  return {...ledger,[id]:{lastAge:age,count:Math.min(10000,(old?.count??0)+1)}};
}
export function eligibleEvents<T extends Schedulable>(catalog:readonly T[],age:number,ledger:EventLedger,previousId:string|null=null):T[] {
  return catalog.filter(event=>{
    if(age<event.minAge || age>event.maxAge) return false;
    const played=ledger[event.id];
    if(!played)return true;
    if(ONCE.has(event.id))return false;
    if(event.id===previousId)return false;
    return age-played.lastAge>=cooldown(event.id);
  });
}
/** Use novelty and context weighting, but allow reusable events in new life phases. */
export function selectEvent<T extends Schedulable>(catalog:readonly T[],age:number,ledger:EventLedger,previousId:string|null=null,random:()=>number=Math.random):T|null {
  const available=eligibleEvents(catalog,age,ledger,previousId);
  if(!available.length)return null;
  const weights=available.map(event=>{
    const played=ledger[event.id];
    if(!played)return 9;
    const hiatus=Math.min(12,Math.max(0,age-played.lastAge));
    return Math.max(1,6-played.count)+Math.floor(hiatus/3);
  });
  const total=weights.reduce((s,w)=>s+w,0);
  let roll=Math.max(0,Math.min(.999999,random()))*total;
  for(let i=0;i<available.length;i++){roll-=weights[i];if(roll<0)return available[i];}
  return available[available.length-1];
}
