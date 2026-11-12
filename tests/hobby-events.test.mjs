import test from 'node:test';
import assert from 'node:assert/strict';
import {HOBBY_IDS,createHobbyBook} from '../src/hobbies.ts';
import {HOBBY_STORY_COUNT,hobbyEvents} from '../src/hobby-events.ts';
import {createSimulation,applyNarrativeChoice} from '../src/simulation.ts';
const stats={happiness:74,health:81,smarts:70,looks:66};
test('twelve unique original stories remain locked without the underlying practiced skill',()=>{
 const s=createSimulation();
 assert.equal(HOBBY_STORY_COUNT,12);
 assert.deepEqual(hobbyEvents('pt-BR',s),[]);
 assert.equal(HOBBY_IDS.length,6);
});
test('real milestones unlock exactly two original scenarios per talent with three consequential options each',()=>{
 const skills=createHobbyBook();
 for(const id of HOBBY_IDS)skills[id]={xp:70,awards:2,lastAge:24};
 const s={...createSimulation(),hobbies:skills};
 const pt=hobbyEvents('pt-BR',s),en=hobbyEvents('en',s);
 assert.equal(pt.length,12);assert.equal(en.length,12);
 assert.equal(new Set(pt.map(x=>x.id)).size,12);
 for(let i=0;i<12;i++){
  const a=pt[i],b=en[i];
  assert.equal(a.id,b.id);
  assert.notEqual(a.title,b.title);
  assert.notEqual(a.description,b.description);
  assert.equal(a.choices.length,3);
  assert.equal(b.choices.length,3);
  assert.ok(a.minAge>=12&&a.maxAge<=110);
  assert.ok(['leisure','school','health','work','family'].includes(a.category));
  for(let j=0;j<3;j++){
   assert.ok(a.choices[j].label.length>3);
   const outcome=applyNarrativeChoice(s,stats,30,a.id,j,a.choices[j].effects,a.choices[j].world);
   assert.equal(outcome.ok,true);
   for(const k of Object.keys(stats))assert.ok(outcome.stats[k]>=0&&outcome.stats[k]<=100);
   for(const k of ['balance','debt','investments','friends','family','training','credits'])
    assert.ok(Number.isFinite(outcome.state[k])&&outcome.state[k]>=0);
  }
 }
});
test('one skill at tier 1 cannot reveal an unrelated higher tier or hidden career story',()=>{
 const s=createSimulation();
 s.hobbies.coding={xp:36,awards:1,lastAge:15};
 const list=hobbyEvents('pt-BR',s);
 assert.deepEqual(list.map(e=>e.id),['hobby-story-coding-1']);
 s.hobbies.coding={xp:61,awards:2,lastAge:17};
 assert.deepEqual(hobbyEvents('pt-BR',s).map(e=>e.id),
  ['hobby-story-coding-1','hobby-story-coding-2']);
});
