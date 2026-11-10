import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, loadSimulation, annualSalary, takeAction, passYear, applyNarrativeChoice } from '../src/simulation.ts';
const base = { happiness: 70, health: 85, smarts: 50, looks: 60 };
test('migrates legacy lives without losing state', () => {
  assert.deepEqual(loadSimulation(undefined), createSimulation());
  assert.deepEqual(loadSimulation({schema:1, balance:900}), createSimulation());
  assert.equal(loadSimulation({schema:2, job:'hacker', balance:-900, family:500}).job, 'none');
  assert.equal(loadSimulation({schema:2, job:'hacker', balance:-900, family:500}).family, 100);
});
test('age gates study and jobs', () => {
  assert.equal(takeAction(createSimulation(),base,4,'study').ok,false);
  assert.equal(takeAction(createSimulation(),base,12,'job').ok,false);
  assert.equal(takeAction(createSimulation(),base,16,'job').state.job,'parttime');
});
test('the player has one voluntary action per year', () => {
  const studied = takeAction(createSimulation(),base,12,'study');
  assert.equal(studied.state.credits,2);
  assert.equal(takeAction(studied.state,studied.stats,12,'study').ok,false);
  assert.equal(takeAction(studied.state,studied.stats,13,'study').ok,true);
});
test('school decisions change the odds of graduating', () => {
  let s = createSimulation();
  s = passYear(s,base,6).state;
  assert.equal(s.education,'school');
  s = applyNarrativeChoice(s,base,14,'study',0,{}).state;
  assert.equal(passYear(s,base,18).state.education,'secondary');
  assert.equal(passYear(createSimulation(),base,18).state.education,'none');
});
test('job, salary and expenses change persistent finance values', () => {
  const qualified = { ...createSimulation(), education:'secondary' };
  const employed = takeAction(qualified,base,20,'job');
  assert.equal(employed.state.job,'office');
  const next = passYear(employed.state, employed.stats,21);
  assert.equal(next.state.balance,annualSalary(employed.state)-10500);
  assert.equal(next.state.experience,1);
  assert.equal(next.state.debt,0);
});
test('unemployment causes debt and interest, debt never becomes negative', () => {
  const result = passYear(createSimulation(),base,18);
  assert.equal(result.state.debt,10920);
  assert.equal(result.state.balance,0);
  assert.ok(result.stats.happiness < base.happiness);
});
test('event affects relationships and careers, not just visual stats', () => {
  const dating = applyNarrativeChoice(createSimulation(),base,22,'relationship',0,{happiness:9});
  assert.equal(dating.state.relationship,'dating');
  assert.equal(dating.state.partner,55);
  assert.equal(dating.stats.happiness,79);
  const job = applyNarrativeChoice(createSimulation(),base,18,'first-job',0,{});
  assert.equal(job.state.job,'parttime');
  assert.ok(job.state.balance>0);
});
test('ageing and care clamp health and end-of-life is terminal', () => {
  const critical = passYear(createSimulation(),{...base,health:0},40);
  assert.equal(critical.state.ended,true);
  assert.equal(takeAction(critical.state,critical.stats,40,'care').ok,false);
  assert.equal(passYear(critical.state,critical.stats,41).ok,false);
  const cared = takeAction(createSimulation(),{...base,health:99},20,'care');
  assert.equal(cared.stats.health,100);
});
test('higher education opens a professional career and a family bond is persistent', () => {
  let s = {...createSimulation(), education:'secondary',credits:10,balance:10000};
  s = takeAction(s,base,22,'study').state;
  assert.equal(s.education,'college');
  assert.equal(s.balance,6000);
  const hired=takeAction(s,base,23,'job');
  assert.equal(hired.state.job,'professional');
  const family=applyNarrativeChoice(s,base,24,'family',0,{});
  assert.equal(family.state.family,88);
});
