import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,applyNarrativeChoice} from '../src/simulation.ts';
const stats={happiness:60,health:80,smarts:55,looks:50};
test('choice world effects persist, including income and education',()=>{
 const s=createSimulation();
 const result=applyNarrativeChoice(s,stats,19,'independent-event',0,{smarts:6},{cash:2300,credits:3,family:5});
 assert.equal(result.state.balance,2300);assert.equal(result.state.credits,3);
 assert.equal(result.state.family,75);assert.equal(result.stats.smarts,61);
});
test('financial losses become debt rather than negative balances',()=>{
 const s={...createSimulation(),balance:300};
 const out=applyNarrativeChoice(s,stats,22,'independent-event',1,{}, {cash:-1000});
 assert.equal(out.state.balance,0);
 assert.equal(out.state.debt,700);
});
test('world impacts are bounded even when a story is malformed',()=>{
 const out=applyNarrativeChoice(createSimulation(),stats,30,'independent-event',1,{},{
  family:Infinity,friends:-1000,credits:NaN,experience:-120,investments:-10000,
  partner:1000
 });
 assert.equal(out.state.family,70);
 assert.equal(out.state.friends,0);
 assert.equal(out.state.partner,100);
 assert.equal(out.state.credits,0);
 assert.equal(out.state.experience,0);
 assert.equal(out.state.investments,0);
});
test('adult relationship choices create compatible state',()=>{
 const dating=applyNarrativeChoice(createSimulation(),stats,25,'independent-event',0,{},{relationship:'dating'});
 assert.equal(dating.state.relationship,'dating');
 assert.ok(dating.state.partner>=55);
 const breakup=applyNarrativeChoice(dating.state,stats,27,'independent-event',0,{},{relationship:'single'});
 assert.equal(breakup.state.relationship,'single');
 assert.equal(breakup.state.partner,0);
});
