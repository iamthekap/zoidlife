import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,loadSimulation,canTakeAction,takeAction} from '../src/simulation.ts';
const stats={happiness:70,health:84,smarts:50,looks:55};
test('each activity has its own annual cooldown and next year resets it',()=>{
 const initial=createSimulation();
 const study=takeAction(initial,stats,12,'study');
 assert.equal(study.ok,true);
 assert.equal(canTakeAction(study.state,12,'study'),false);
 assert.equal(canTakeAction(study.state,12,'care'),true);
 const care=takeAction(study.state,study.stats,12,'care');
 assert.equal(care.ok,true);
 assert.equal(takeAction(care.state,care.stats,12,'care').ok,false);
 assert.equal(canTakeAction(care.state,13,'study'),true);
 assert.equal(canTakeAction(care.state,13,'care'),true);
 assert.equal(care.state.actionLedger.study,12);
 assert.equal(care.state.actionLedger.care,12);
});
test('new action ledger survives save migrations',()=>{
 const base={...createSimulation(),lastActionAge:35,actionLedger:{care:35,study:34},balance:2400};
 const loaded=loadSimulation(JSON.parse(JSON.stringify(base)));
 assert.equal(canTakeAction(loaded,35,'care'),false);
 assert.equal(canTakeAction(loaded,35,'study'),true);
 assert.equal(loaded.balance,2400);
});
test('old saves retain the old annual lock until the next age',()=>{
 const base={...createSimulation(),lastActionAge:25};
 delete base.actionLedger;
 const migrated=loadSimulation(base);
 for(const action of ['care','study','job','socialize','budget','invest','home','child','retire'])
   assert.equal(canTakeAction(migrated,25,action),false);
 assert.equal(canTakeAction(migrated,26,'care'),true);
});
test('unknown or malformed ledgers cannot create arbitrary keys',()=>{
 const base={...createSimulation(),actionLedger:{care:33, __proto__:100, invest:10000, extra:'x'}};
 const loaded=loadSimulation(base);
 assert.equal(loaded.actionLedger.care,33);
 assert.equal(loaded.actionLedger.invest,undefined);
 assert.equal(Object.hasOwn(loaded.actionLedger,'extra'),false);
});
