import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNEYS,DESTINATIONS,createTravelState,normalizeTravelState,canTravel,recordTravel,destination} from '../src/travel.ts';
import {createSimulation,loadSimulation,takeJourney,passYear,canTakeAction} from '../src/simulation.ts';
import {validateLifeSave,serializeLife} from '../src/save-io.ts';

const stats={happiness:65,health:75,smarts:60,looks:50};

test('six original trip types have distinct rules, costs, descriptions and effects',()=>{
 assert.equal(JOURNEYS.length,6);
 assert.deepEqual(DESTINATIONS.map(x=>x.id),[...JOURNEYS]);
 assert.equal(new Set(DESTINATIONS.map(x=>x.pt)).size,6);
 assert.equal(new Set(DESTINATIONS.map(x=>x.en)).size,6);
 for(const x of DESTINATIONS){
  assert.ok(x.ptDescription.length>=12&&x.enDescription.length>=12);
  assert.ok(x.cost>=100&&x.minAge>=18&&x.minAge<=25);
  assert.equal(destination(x.id)?.id,x.id);
 }
 assert.equal(destination('__prototype__'),null);
 assert.equal(destination({id:'coast'}),null);
});

test('travel is only available to adults who can pay and have not traveled that year',()=>{
 const state=createSimulation();
 const s={...state,balance:20000};
 const tooYoung=takeJourney(s,stats,17,'family');
 assert.equal(tooYoung.ok,false);
 assert.equal(canTravel(s.travel,18,'expedition',s.balance),false);
 assert.equal(takeJourney({...s,balance:120},stats,20,'coast').ok,false);
 assert.equal(takeJourney(s,stats,20,'fabricated').ok,false);
 const first=takeJourney(s,stats,20,'family');
 assert.equal(first.ok,true);
 assert.equal(first.state.balance,18200);
 assert.equal(first.state.family,83);
 assert.equal(first.state.friends,30);
 assert.equal(first.stats.happiness,72);
 assert.deepEqual(first.state.travel,{lastAge:20,visits:[{id:'family',age:20}]});
 assert.equal(first.state.actionLedger.travel,20);
 assert.equal(s.balance,20000,'original input must remain unmodified');
 assert.equal(s.travel.visits.length,0,'travel history must be immutable');
 assert.equal(takeJourney(first.state,first.stats,20,'coast').ok,false);
 assert.equal(canTakeAction(first.state,20,'travel'),false);
 const age21=passYear(first.state,first.stats,21);
 assert.equal(age21.ok,true);
 const next=takeJourney({...age21.state,balance:10000},age21.stats,21,'coast');
 assert.equal(next.ok,true);
 assert.equal(next.state.travel.visits.length,2);
 assert.deepEqual(next.state.travel.visits.map(x=>x.id),['family','coast']);
});
test('legal restrictions, retirement and death are respected when traveling',()=>{
 const s={...createSimulation(),balance:12000};
 assert.equal(takeJourney({...s,ended:true},stats,42,'history').ok,false);
 assert.equal(takeJourney({...s,justice:{...s.justice,incarceratedUntil:55}},stats,46,'history').ok,false);
 assert.equal(takeJourney(s,stats,111,'coast').ok,false);
 const old=takeJourney({...s,job:'retired'},stats,78,'history');
 assert.equal(old.ok,true);
 assert.equal(old.state.credits,2);
 assert.equal(old.stats.smarts,67);
});
test('travel history normalization rejects duplicate ages and invalid forged destinations',()=>{
 const x=normalizeTravelState({lastAge:108,visits:[
  {id:'coast',age:25},{id:'family',age:25},{id:'nope',age:33},
  {id:'mountains',age:19},{id:'coast',age:17},{id:'history',age:110},
  {id:'family',age:28},{id:'expedition',age:'30'},{id:'metropolis',age:NaN}
 ]});
 assert.deepEqual(x,{lastAge:28,visits:[
  {id:'mountains',age:19},{id:'coast',age:25},
  {id:'family',age:28}
 ]});
 assert.deepEqual(normalizeTravelState(null),createTravelState());
 assert.equal(recordTravel(x,110,'coast'),x);
});
test('travel remains portable in JSON saves and retained on schema 2 migration',()=>{
 const first=takeJourney({...createSimulation(),balance:10000},stats,32,'metropolis');
 const saved=loadSimulation(JSON.parse(JSON.stringify(first.state)));
 assert.equal(saved.balance,6900);
 assert.deepEqual(saved.travel.visits,[{id:'metropolis',age:32}]);
 const old=loadSimulation({...createSimulation(),travel:undefined});
 assert.deepEqual(old.travel,createTravelState());
 const exported=serializeLife({name:'Joana Silva',age:32,stats,simulation:saved,history:[]});
 const parsed=validateLifeSave(exported);
 assert.equal(parsed.ok,true);
 if(parsed.ok){
  const imported=loadSimulation(parsed.value.simulation);
  assert.equal(imported.travel.visits[0].id,'metropolis');
  assert.equal(imported.travel.lastAge,32);
 }
});
