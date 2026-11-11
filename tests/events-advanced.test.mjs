import test from 'node:test';
import assert from 'node:assert/strict';
import {advancedEvents} from '../src/events-advanced.ts';
import {extendedAllowed} from '../src/events-extended.ts';
import {createSimulation,applyNarrativeChoice} from '../src/simulation.ts';
const stats={happiness:60,health:60,smarts:60,looks:60};
test('advanced events add 15 original bilingual situations and unique ids',()=>{
 const pt=advancedEvents('pt-BR'),en=advancedEvents('en');
 assert.equal(pt.length,15);
 assert.equal(new Set(pt.map(e=>e.id)).size,pt.length);
 assert.deepEqual(pt.map(e=>e.id),en.map(e=>e.id));
 assert.ok(pt.every(e=>e.choices.length===3&&e.minAge<e.maxAge));
 assert.ok(pt.every(e=>e.choices.some(c=>Object.keys(c.world||{}).length>0)));
});
test('conditional stories do not show in the wrong life circumstances',()=>{
 const events=advancedEvents('en');
 const job=events.find(e=>e.id==='work-project-lead');
 const child=events.find(e=>e.id==='support-child-school');
 const investment=events.find(e=>e.id==='investment-tough-year');
 const s=createSimulation();
 assert.equal(extendedAllowed(job,s),false);
 assert.equal(extendedAllowed(job,{...s,job:'office'}),true);
 assert.equal(extendedAllowed(child,s),false);
 assert.equal(extendedAllowed(child,{...s,children:1}),true);
 assert.equal(extendedAllowed(investment,{...s,investments:100}),true);
});
test('scenario choices persist measurable effects in the existing engine',()=>{
 const e=advancedEvents('pt-BR').find(e=>e.id==='work-project-lead');
 const choice=e.choices[0];
 const state={...createSimulation(),job:'office',balance:100};
 const result=applyNarrativeChoice(state,stats,30,e.id,0,choice.effects,choice.world);
 assert.equal(result.ok,true);
 assert.equal(result.state.experience,3);
 assert.ok(result.state.balance>100);
 assert.equal(result.stats.health,57);
});
