import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLifeSave,saveFilename,serializeLife,MAX_SAVE_BYTES} from '../src/save-io.ts';
const life={name:'Alex Silva',age:22,stats:{happiness:70,health:80,smarts:60,looks:50},
 history:['0: Nascimento.'],seenEventIds:[],pendingEvent:null};
test('valid saves roundtrip without passwords or accounts',()=>{
 const result=validateLifeSave(serializeLife(life));
 assert.equal(result.ok,true);
 if(result.ok){assert.equal(result.value.name,'Alex Silva');assert.equal(result.value.age,22);}
});
test('malformed JSON and oversized data are rejected safely',()=>{
 assert.equal(validateLifeSave('{').ok,false);
 assert.equal(validateLifeSave('x'.repeat(MAX_SAVE_BYTES+1)).ok,false);
 assert.equal(validateLifeSave(JSON.stringify({...life,age:9999})).ok,false);
 assert.equal(validateLifeSave(JSON.stringify({...life,stats:{...life.stats,health:Infinity}})).ok,false);
});
test('untrusted event effects and injected scripts are not accepted as active decisions',()=>{
 const bad={...life,pendingEvent:{id:'x',title:'x',description:'x',choices:[
  {label:'a',result:'a',effects:{happiness:999}}, {label:'b',result:'b',effects:{}},
  {label:'c',result:'c',effects:{}}]}};
 assert.equal(validateLifeSave(JSON.stringify(bad)).ok,false);
});
test('safe filenames discard path and formatting tricks',()=>{
 assert.equal(saveFilename('João Silva'),'zoid-life-joao-silva.json');
 assert.ok(!saveFilename('../../hello?').includes('/'));
});
test('older data without new nested systems is still accepted for migration',()=>{
 const old={name:'Vida Antiga',age:14,stats:life.stats,history:['2: bom']};
 assert.equal(validateLifeSave(JSON.stringify(old)).ok,true);
});

test('lineage data is retained on import/export and unrelated unknown keys discarded',()=>{
 const entry={name:'Alex Costa',age:30,stats:{happiness:60,health:70,smarts:60,looks:70},
  ancestors:[{name:'Samira Costa',age:85,birthYear:1980,career:'Professor(a)'}],
  unrelatedInjection:'discard'};
 const result=validateLifeSave(JSON.stringify(entry));
 assert.equal(result.ok,true);
 if(!result.ok)return;
 assert.equal(result.value.ancestors[0].name,'Samira Costa');
 assert.equal('unrelatedInjection' in result.value,false);
});

test('long-lived decisions and records are portable rather than silently truncated',()=>{
 const history=Array.from({length:1400},(_,i)=>'30: História '+i+'.');
 const chronicle=[{historyIndex:1399,age:30,eventId:'career-example',title:'Carreira',
   description:'Uma proposta diferente',choice:'Aceitar',result:'História 1399.'}];
 const result=validateLifeSave(JSON.stringify({...life,age:30,history,chronicle}));
 assert.equal(result.ok,true);
 if(result.ok){
   assert.equal(result.value.history.length,1400);
   assert.deepEqual(result.value.chronicle,chronicle);
 }
});
test('import rejects fabricated world-effects and malformed chronicle records',()=>{
 const event={id:'quiet-year',title:'Ano',description:'Escolha',choices:[
   {label:'A',result:'A',effects:{health:1},world:{cash:1e15}},
   {label:'B',result:'B',effects:{}},
   {label:'C',result:'C',effects:{}}]};
 assert.equal(validateLifeSave(JSON.stringify({...life,pendingEvent:event})).ok,false);
 assert.equal(validateLifeSave(JSON.stringify({...life,chronicle:[{historyIndex:-1}]})).ok,false);
 const validEvent={...event,choices:[{...event.choices[0],world:{cash:1200}},...event.choices.slice(1)]};
 assert.equal(validateLifeSave(JSON.stringify({...life,pendingEvent:validEvent})).ok,true);
});

test('UTF-8 byte limit includes multibyte text and does not confuse code units with bytes',()=>{
 const max=MAX_SAVE_BYTES;
 const text='🌱'.repeat(Math.ceil(max/4));
 assert.equal(validateLifeSave(text).ok,false);
 assert.equal(validateLifeSave('🌱'.repeat(Math.floor(max/4)+1)).ok,false);
});

test('portable saves keep legitimate future story callbacks and reject invented arcs',()=>{
 const arc={id:'school-team',phase:1,originAge:6,dueAge:7};
 const original={...life,age:6,storyArc:arc};
 const checked=validateLifeSave(JSON.stringify(original));
 assert.equal(checked.ok,true);
 if(checked.ok)assert.deepEqual(checked.value.storyArc,arc);
 assert.deepEqual(validateLifeSave(JSON.stringify({...original,storyArc:{...arc,id:'fake'}})),
  {ok:false,error:'invalid-story-arc'});
});

test('portable life keeps the previous route in an unfinished followup but rejects arbitrary branches',()=>{
 const completedFirst={id:'coding-club',phase:2,originAge:10,dueAge:12,branch:1};
 const data={...life,age:11,storyArc:completedFirst};
 const checked=validateLifeSave(JSON.stringify(data));
 assert.equal(checked.ok,true);
 if(checked.ok)assert.deepEqual(checked.value.storyArc,completedFirst);
 for(const broken of [
  {...completedFirst,branch:3},{...completedFirst,branch:-1},
  {...completedFirst,branch:'0'},{...completedFirst,phase:1},
  {...completedFirst,dueAge:11},{...completedFirst,dueAge:14}
 ]){
  const bad=validateLifeSave(JSON.stringify({...data,storyArc:broken}));
  assert.deepEqual(bad,{ok:false,error:'invalid-story-arc'});
 }
});
