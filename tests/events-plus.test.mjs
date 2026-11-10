import test from 'node:test';
import assert from 'node:assert/strict';
import {extraEvents,eventAllowed} from '../src/events-plus.ts';
import {createSimulation,applyNarrativeChoice} from '../src/simulation.ts';
const stats={happiness:65,health:85,smarts:55,looks:60};
test('all original story events have both languages and three meaningful choices',()=>{
  const pt=extraEvents('pt-BR'), en=extraEvents('en');
  assert.ok(pt.length>=16);
  assert.deepEqual(pt.map(x=>x.id),en.map(x=>x.id));
  assert.equal(new Set(pt.map(x=>x.id)).size,pt.length);
  for(const event of pt){
    assert.ok(event.minAge>=0 && event.maxAge>=event.minAge);
    assert.equal(event.choices.length,3);
    assert.ok(event.title.length>3);
    assert.ok(event.choices.every(c=>c.label.length>2 && c.result.length>2));
  }
  assert.ok(pt.some((ev,i)=>ev.title!==en[i].title));
});
test('events obey career and educational conditions',()=>{
  const base=createSimulation();
  const events=extraEvents('en');
  assert.equal(eventAllowed(events.find(e=>e.id==='work-pressure'),base),false);
  assert.equal(eventAllowed(events.find(e=>e.id==='career-switch'),{...base,job:'service'}),true);
  assert.equal(eventAllowed(events.find(e=>e.id==='scholarship'),{...base,education:'college'}),false);
});
test('education choices create durable credits',()=>{
  const event=applyNarrativeChoice(createSimulation(),stats,17,'scholarship',0,{smarts:8});
  assert.equal(event.state.credits,5);
  assert.equal(event.stats.smarts,63);
});
test('finance choices have consequences beyond happiness scores',()=>{
  const base=createSimulation();
  const earned=applyNarrativeChoice(base,stats,18,'first-budget',0,{smarts:4});
  const spent=applyNarrativeChoice(base,stats,18,'first-budget',1,{happiness:7});
  assert.ok(earned.state.balance>spent.state.balance);
  assert.equal(earned.state.balance,1200);
  assert.equal(spent.state.balance,350);
});
test('conflicts can alter future relationship strengths',()=>{
  const good=applyNarrativeChoice(createSimulation(),stats,27,'friend-conflict',0,{});
  const bad=applyNarrativeChoice(createSimulation(),stats,27,'friend-conflict',2,{});
  assert.equal(good.state.friends,42);
  assert.equal(bad.state.friends,10);
});
test('financial decisions can cause debts that persist over time',()=>{
  const rent=applyNarrativeChoice(createSimulation(),stats,21,'first-rent',0,{happiness:6});
  assert.equal(rent.state.debt,5000);
});
