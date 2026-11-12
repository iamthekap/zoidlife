/** Persistent, evidence-only life chronicle. Each rich card is attached to an actual history line. */
export type ChronicleEvent = {
  historyIndex:number; age:number; eventId:string; title:string; description:string;
  choice:string; result:string; category?:string;
};
export type HistoryEntry={historyIndex:number;age:number;text:string};
const isRecord=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const boundedText=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max;
/** Trust saved choices only if they are attached to a valid, already-lived record. */
export function normalizeChronicle(raw:unknown,history:readonly string[],age:number):ChronicleEvent[]{
  if(!Array.isArray(raw))return [];
  const seen=new Set<number>(),entries:ChronicleEvent[]=[];
  for(const e of raw.slice(-6000)){
    if(!isRecord(e)||!Number.isInteger(e.historyIndex)||Number(e.historyIndex)<0||
       Number(e.historyIndex)>=history.length||seen.has(Number(e.historyIndex))||
       !Number.isInteger(e.age)||Number(e.age)<0||Number(e.age)>age||
       !boundedText(e.eventId,80)||!/^[a-z0-9-]+$/.test(e.eventId)||
       !boundedText(e.title,300)||!boundedText(e.description,2000)||
       !boundedText(e.choice,500)||!boundedText(e.result,3000))continue;
    const line=readHistoryEntry(history[e.historyIndex],e.historyIndex);
    if(!line||line.age!==e.age||!line.text.includes(e.result))continue;
    seen.add(e.historyIndex);
    entries.push({historyIndex:Number(e.historyIndex),age:Number(e.age),
      eventId:e.eventId,title:e.title,description:e.description,
      choice:e.choice,result:e.result,
      ...(boundedText(e.category,64)?{category:e.category}:{})});
  }
  return entries.sort((a,b)=>a.historyIndex-b.historyIndex);
}
export function readHistoryEntry(line:unknown,index:number):HistoryEntry|null {
  if(typeof line!=='string'||!line.trim()||!Number.isInteger(index)||index<0)return null;
  const hit=/^(\d{1,3}):\s*(.*)$/.exec(line);
  if(hit){
    const age=Number(hit[1]);
    if(age>110||!hit[2].trim())return null;
    return {historyIndex:index,age,text:hit[2].trim()};
  }
  // Older saves store a birth line without an explicit age.
  return {historyIndex:index,age:0,text:line.trim()};
}
export function livedHistory(history:readonly string[],age:number):HistoryEntry[]{
  const current=Math.max(0,Math.min(110,Math.floor(Number.isFinite(age)?age:0)));
  return history.map(readHistoryEntry).filter((entry):entry is HistoryEntry=>!!entry&&entry.age<=current);
}
