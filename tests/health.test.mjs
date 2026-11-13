import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeConditions,advanceHealth,treatHealth,healthLabel} from '../src/health.ts';
import {createSimulation,passYear,takeAction,loadSimulation} from '../src/simulation.ts';
const stats={happiness:65,health:42,smarts:70,looks:70};
test('legacy saves migrate without conditions and invalid entries are sanitized',()=>{
 const old={...createSimulation(),schema:2};delete old.conditions;
 assert.deepEqual(loadSimulation(old).conditions,[]);
 assert.deepEqual(loadSimulation({schema:2,conditions:[{id:'evil',severity:9,since:9}]}).conditions,[]);
});
test('conditions have age and contextual gates',()=>{
 assert.deepEqual(advanceHealth([],6,30,60,true).conditions,[]);
 assert.deepEqual(advanceHealth([],30,42,65,false).conditions,[]);
 assert.equal(advanceHealth([],30,42,65,true).conditions[0].id,'fatigue');
 assert.equal(advanceHealth([],70,40,65,false).conditions[0].id,'mobility');
});
test('persistent conditions reduce health deterministically without mutating previous state',()=>{
 const initial={...createSimulation(),job:'office',conditions:[{id:'fatigue',severity:2,since:24}]};
 const a=passYear(initial,stats,31),b=passYear(initial,stats,31);
 assert.deepEqual(a,b);assert.equal(a.state.conditions.length,1);
 assert.ok(a.stats.health<=40);assert.equal(initial.conditions[0].severity,2);
});
test('care reduces severity and yearly action cannot be repeated',()=>{
 const seeded={...createSimulation(),conditions:[{id:'fatigue',severity:2,since:24},{id:'strain',severity:1,since:29}]};
 const first=takeAction(seeded,stats,32,'care');
 assert.equal(first.state.conditions[0].severity,1);
 assert.equal(takeAction(first.state,first.stats,32,'care').ok,false);
 const second=takeAction(first.state,first.stats,33,'care');
 assert.equal(second.state.conditions.length,1);
});
test('valid names and invalid duplicate conditions are handled safely',()=>{
 const x=normalizeConditions([{id:'fatigue',severity:1,since:12},{id:'fatigue',severity:2,since:13},
 {id:'strain',severity:3,since:35},{id:'bad<script>',severity:2,since:34}]);
 assert.equal(x.length,2);
 assert.equal(healthLabel('fatigue','pt-BR'),'Cansaço persistente');
 assert.equal(healthLabel('fatigue','en'),'Persistent fatigue');
 assert.equal(treatHealth([]).healthBonus,0);
});
