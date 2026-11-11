import test from 'node:test';
import assert from 'node:assert/strict';
import {extendedEvents,extendedAllowed} from '../src/events-extended.ts';
import {createSimulation,applyNarrativeChoice} from '../src/simulation.ts';
const base={happiness:60,health:80,smarts:40,looks:70};
test('original events are uniquely authored, bilingual and have three consequences',()=>{
 const pt=extendedEvents('pt-BR'),en=extendedEvents('en');
 assert.ok(pt.length>=18);
 assert.equal(new Set(pt.map(x=>x.id)).size,pt.length);
 assert.deepEqual(pt.map(x=>x.id),en.map(x=>x.id));
 assert.ok(pt.every(e=>e.choices.length===3&&e.minAge>=0&&e.maxAge<=110));
 assert.ok(pt.every(e=>e.choices.some(c=>Object.keys(c.world||{}).length>0)));
 assert.ok(pt.some((e,i)=>e.title!==en[i].title));
});
test('scenario conditions eliminate invalid character situations',()=>{
 const all=extendedEvents('en');
 const find=id=>all.find(x=>x.id===id);
 const s=createSimulation();
 assert.equal(extendedAllowed(find('parttime-interview'),s),true);
 assert.equal(extendedAllowed(find('school-supplies'),s),false);
 assert.equal(extendedAllowed(find('apartment-maintenance'),s),false);
 assert.equal(extendedAllowed(find('investment-volatility'),s),false);
 assert.equal(extendedAllowed(find('relationship-talk'),{...s,relationship:'dating'}),true);
 assert.equal(extendedAllowed(find('debt-letter'),{...s,debt:1200}),true);
});
test('school and career story choices leave persistent world evidence',()=>{
 const story=extendedEvents('en').find(x=>x.id==='computer-club');
 const choice=story.choices[0];
 const outcome=applyNarrativeChoice(createSimulation(),base,15,story.id,0,choice.effects,choice.world);
 assert.equal(outcome.state.credits,3);
 assert.equal(outcome.stats.smarts,48);
});
test('financial events persist changes in money and debt',()=>{
 const story=extendedEvents('pt-BR').find(x=>x.id==='sports-recovery');
 const choice=story.choices[0];
 const outcome=applyNarrativeChoice(createSimulation(),base,16,story.id,0,choice.effects,choice.world);
 assert.equal(outcome.state.debt,450);
 assert.equal(outcome.stats.health,86);
});
