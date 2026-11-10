import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,loadSimulation,passYear,takeAction} from '../src/simulation.ts';
const stats={happiness:70,health:82,smarts:50,looks:60};
test('legacy saves gain stable economy defaults without losing old data',()=>{
  const prior={...createSimulation(),balance:5000,job:'office',education:'secondary'};
  delete prior.investments;delete prior.homeOwned;delete prior.homeValue;delete prior.children;
  const s=loadSimulation(prior);
  assert.equal(s.balance,5000);assert.equal(s.job,'office');
  assert.equal(s.investments,0);assert.equal(s.children,0);assert.equal(s.homeOwned,false);
});
test('investment reduces cash, compounds annually and cannot draw from empty balance',()=>{
  const s={...createSimulation(),balance:5500};
  const invest=takeAction(s,stats,24,'invest');
  assert.equal(invest.state.investments,3000);assert.equal(invest.state.balance,2500);
  const next=passYear(invest.state,stats,25);
  assert.equal(next.state.investments,3090);
  assert.equal(takeAction(createSimulation(),stats,25,'invest').ok,false);
});
test('home purchase requires age and down payment and creates both asset and debt',()=>{
  const funded={...createSimulation(),balance:30000};
  assert.equal(takeAction(funded,stats,20,'home').ok,false);
  const bought=takeAction(funded,stats,25,'home');
  assert.equal(bought.ok,true);
  assert.equal(bought.state.homeOwned,true);
  assert.equal(bought.state.homeValue,130000);
  assert.equal(bought.state.debt,105000);
  assert.equal(bought.state.balance,5000);
  assert.equal(takeAction({...bought.state,lastActionAge:-1},stats,30,'home').ok,false);
});
test('children require a stable relationship and create recurring financial obligations',()=>{
  assert.equal(takeAction(createSimulation(),stats,24,'child').ok,false);
  const couple={...createSimulation(),relationship:'dating',partner:60,balance:30000};
  const born=takeAction(couple,stats,26,'child');
  assert.equal(born.state.children,1);
  const year=passYear(born.state,born.stats,27);
  assert.equal(year.notes.includes('childcare:2000'),true);
  assert.ok(year.state.balance<30000);
});
test('no repeated action within a year, even across different action types',()=>{
  const s={...createSimulation(),balance:5000};
  const first=takeAction(s,stats,26,'invest');
  assert.equal(takeAction(first.state,first.stats,26,'care').ok,false);
  assert.equal(takeAction(first.state,first.stats,27,'care').ok,true);
});
