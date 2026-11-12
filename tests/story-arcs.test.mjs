import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation} from '../src/simulation.ts';
import {STORY_ARC_IDS,normalizeStoryArc,startStoryArc,storyArcEvent,afterStoryArcChoice,storyArcAllowed} from '../src/story-arcs.ts';
test('every authored arc starts only from its real originating decision and has two localized phases',()=>{
 const triggers=[['school-new-class',0],['computer-club',0],['best-friend-message',0],
   ['family-difficult-talk',1],['work-project-lead',0],['medical-prevention',0]];
 assert.equal(STORY_ARC_IDS.length,triggers.length);
 for(const [id,index] of triggers){
  const origin=['school-new-class','computer-club'].includes(id)?12:25;
  const first=startStoryArc(id,index,origin,null);
  assert.ok(first,id);assert.equal(first.phase,1);assert.equal(first.dueAge,origin+1);
  assert.equal(startStoryArc(id,index,origin,first),first);
  assert.equal(startStoryArc(id,(index+1)%3,origin,null),null);
  const pt=storyArcEvent(first,'pt-BR'),en=storyArcEvent(first,'en');
  assert.ok(pt);assert.ok(en);assert.equal(pt.id,en.id);
  assert.equal(pt.choices.length,3);assert.equal(en.choices.length,3);
  assert.notEqual(pt.title,en.title);
  const next=afterStoryArcChoice(first,pt.id,0,origin+1);
  assert.equal(next.phase,2);assert.equal(next.dueAge,origin+2);
  assert.equal(storyArcEvent(next,'pt-BR').choices.length,3);
  assert.equal(afterStoryArcChoice(next,storyArcEvent(next,'en').id,1,origin+2),null);
  assert.equal(afterStoryArcChoice(first,pt.id,2,origin+1),null);
 }
});
test('arc identity, phase and due age are validated against forged or stale save data',()=>{
 const valid={id:'coding-club',phase:1,originAge:11,dueAge:12};
 assert.deepEqual(normalizeStoryArc(valid,11),valid);
 assert.deepEqual(normalizeStoryArc(valid,12),valid);
 for(const attempt of [
  {...valid,id:'forged'}, {...valid,phase:4}, {...valid,dueAge:50},
  {...valid,originAge:20},{...valid,dueAge:11},{...valid,dueAge:9}
 ])assert.equal(normalizeStoryArc(attempt,12),null);
 assert.equal(startStoryArc('computer-club',0,110,null),null);
 assert.equal(afterStoryArcChoice(valid,'arc-other-1',0,12),valid);
});

test('career arc cannot promise leadership after unemployment and school arcs end before graduation',()=>{
 assert.equal(startStoryArc('school-new-class',0,17,null),null);
 assert.equal(startStoryArc('computer-club',0,16,null),null);
 assert.equal(startStoryArc('work-project-lead',0,64,null),null);
 const school=startStoryArc('school-new-class',0,15,null);
 const enrolled={...createSimulation(),education:'school'};
 assert.equal(storyArcAllowed(school,enrolled,16),true);
 assert.equal(storyArcAllowed(school,{...enrolled,education:'secondary'},16),false);
 const career=startStoryArc('work-project-lead',0,40,null);
 assert.equal(storyArcAllowed(career,{...createSimulation(),job:'office'},41),true);
 assert.equal(storyArcAllowed(career,createSimulation(),41),false);
 assert.equal(normalizeStoryArc({id:'coding-club',phase:2,originAge:10,dueAge:11},11),null);
});

test('stale overdue stories are rejected rather than resurfacing one year late',()=>{
 const phase1={id:'school-team',phase:1,originAge:7,dueAge:8};
 assert.equal(normalizeStoryArc(phase1,7)?.phase,1);
 assert.equal(normalizeStoryArc(phase1,8)?.phase,1);
 assert.equal(normalizeStoryArc(phase1,9),null);
 const phase2={id:'coding-club',phase:2,originAge:12,dueAge:14};
 assert.equal(normalizeStoryArc(phase2,13)?.phase,2);
 assert.equal(normalizeStoryArc(phase2,14)?.phase,2);
 assert.equal(normalizeStoryArc(phase2,15),null);
});
