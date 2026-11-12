import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,loadSimulation,applyOffense,passYear,canTakeAction} from '../src/simulation.ts';
import {judgeOffense,loadJustice,OFFENSES,legalStatus} from '../src/justice.ts';
const stats={happiness:60,health:85,smarts:75,looks:50};
test('legacy saves migrate legal state without fabricated convictions',()=>{
 const old=createSimulation();delete old.justice;
 assert.deepEqual(loadSimulation(old).justice,{convictions:0,lastConvictionAge:-1,incarceratedUntil:0,history:[]});
 assert.deepEqual(loadJustice({history:[{id:'<script>',age:21,caught:true}]}).history,[]);
});
test('minor and adult offense eligibility, age gate and jail state are enforced',()=>{
 for(const rule of OFFENSES){
  assert.equal(judgeOffense(createSimulation().justice,rule.age-1,65,rule.id),null);
  assert.ok(judgeOffense(createSimulation().justice,rule.age,65,rule.id));
 }
 const jailed={...createSimulation(),justice:{...createSimulation().justice,incarceratedUntil:27}};
 assert.equal(canTakeAction(jailed,23,'job'),false);
 assert.equal(canTakeAction(jailed,23,'care'),true);
 assert.equal(canTakeAction(jailed,27,'job'),true);
});
test('one crime choice per year writes a persistent legal case without mutating old state',()=>{
 const original=createSimulation();
 const first=applyOffense(original,stats,22,'vandalism');
 assert.equal(first.ok,true);
 assert.equal(first.state.justice.history.length,1);
 assert.equal(first.state.actionLedger.crime,22);
 assert.equal(applyOffense(first.state,first.stats,22,'petty-theft').ok,false);
 assert.deepEqual(original.justice.history,[]);
 const reloaded=loadSimulation(first.state);
 assert.deepEqual(reloaded.justice.history,first.state.justice.history);
});
test('judicial outcomes are deterministic; convictions cost money and block salary while incarcerated',()=>{
 const initial=createSimulation();
 let caught=null;
 for(let age=18;age<30;age++){
  const trial=applyOffense(initial,stats,age,'financial-fraud');
  if(trial.ok&&trial.state.justice.convictions>0){caught={age,trial};break;}
 }
 assert.ok(caught!==null);
 const {age,trial}=caught;
 assert.ok(trial.state.debt>0);
 assert.equal(trial.state.job,'none');
 assert.equal(trial.state.justice.incarceratedUntil,age+3);
 assert.equal(legalStatus(trial.state.justice,age,'pt-BR'),'Cumprindo pena');
 const year=passYear(trial.state,trial.stats,age+1);
 assert.ok(year.ok);
 assert.equal(year.state.justice.history.length,1);
});
