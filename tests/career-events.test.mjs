import test from 'node:test';
import assert from 'node:assert/strict';
import {CAREERS} from '../src/careers.ts';
import {careerEvents,careerEventCapacity} from '../src/career-events.ts';
import {createSimulation,applyNarrativeChoice} from '../src/simulation.ts';
const stats={health:70,happiness:65,smarts:70,looks:60};
test('all 45 professions have three individually keyed contextual story variants',()=>{
 const ids=new Set();
 for(const role of CAREERS){
  const state={...createSimulation(),job:role.job,occupation:role.id};
  const list=careerEvents('pt-BR',state);
  assert.equal(list.length,3);
  for(const e of list){
   assert.equal(e.choices.length,3);
   assert.ok(e.title.includes(role.pt));
   ids.add(e.id);
  }
 }
 assert.equal(ids.size,135);
 assert.equal(careerEventCapacity(),135);
});
test('career events vanish when unemployed, retired, or when the occupation does not match the category',()=>{
 const state=createSimulation();
 assert.deepEqual(careerEvents('en',state),[]);
 assert.deepEqual(careerEvents('en',{...state,job:'retired',occupation:'doctor'}),[]);
 assert.deepEqual(careerEvents('en',{...state,job:'service',occupation:'doctor'}),[]);
});
test('different career choices alter momentum and experience independently',()=>{
 const state={...createSimulation(),job:'professional',occupation:'doctor'};
 const e=careerEvents('en',state)[0];
 const first=applyNarrativeChoice(state,stats,30,e.id,0,e.choices[0].effects,e.choices[0].world);
 const third=applyNarrativeChoice(state,stats,30,e.id,2,e.choices[2].effects,e.choices[2].world);
 assert.equal(first.state.careerMomentum,13);
 assert.equal(first.state.experience,2);
 assert.equal(third.state.careerMomentum,0);
 assert.equal(state.careerMomentum,0);
});
