import test from 'node:test';
import assert from 'node:assert/strict';
import {migrateLedger,recordEvent,eligibleEvents,selectEvent} from '../src/event-engine.ts';
const e=(id,minAge,maxAge)=>({id,minAge,maxAge});
const cat=[e('playground',3,8),e('family-care',25,75),e('work-pressure',18,64)];
test('no events occur outside their age window',()=>{
  assert.equal(selectEvent(cat,2,migrateLedger(null,[])),null);
  assert.deepEqual(eligibleEvents(cat,30,migrateLedger(null,[])).map(x=>x.id),['family-care','work-pressure']);
});
test('a non-repeatable event never reappears',()=>{
  const led=recordEvent(migrateLedger(null,[]),'playground',4);
  assert.equal(selectEvent([cat[0]],7,led),null);
});
test('repeatable events have a multi-year cooldown',()=>{
  const s=recordEvent(migrateLedger(null,[]),'family-care',28);
  assert.equal(selectEvent([cat[1]],30,s),null);
  assert.equal(selectEvent([cat[1]],32,s)?.id,'family-care');
});
test('the immediately previous event is blocked even after cooldown',()=>{
  const s=recordEvent(migrateLedger(null,[]),'work-pressure',22);
  assert.equal(selectEvent([cat[2]],40,s,'work-pressure'),null);
});
test('legacy seen IDs migrate to ledger without data loss',()=>{
  const ledger=migrateLedger(undefined,['school','family-care']);
  assert.equal(ledger.school.count,1);
  assert.equal(ledger['family-care'].lastAge,-1000);
  assert.equal(selectEvent([e('school',5,12)],7,ledger),null);
  assert.ok(selectEvent([e('family-care',25,75)],40,ledger));
});
test('handles corrupt entries and refuses unsafe keys',()=>{
  const d=migrateLedger({'__proto__':{lastAge:8,count:1}, 'study':{lastAge:'a',count:2},'work':{lastAge:30,count:1}},[]);
  assert.equal(d.work.count,1);
  assert.ok(!Object.hasOwn(d,'study'));
  assert.ok(!Object.hasOwn(d,'__proto__'));
});
test('records a history and samples reproducibly with injected random generator',()=>{
  const d=recordEvent({},'family-care',30);
  assert.equal(d['family-care'].count,1);
  const x=selectEvent(cat,40,d,null,()=>0);
  const y=selectEvent(cat,40,d,null,()=>0);
  assert.equal(x?.id,y?.id);
  assert.equal(selectEvent(cat,40,d,null,()=>1)?.id,'work-pressure');
});
