import test from 'node:test';
import assert from 'node:assert/strict';
import {STORY_ARC_IDS,normalizeStoryArc,startStoryArc,storyArcEvent,afterStoryArcChoice} from '../src/story-arcs.ts';
test('every authored arc starts only from its real originating decision and has two localized phases',()=>{
 const triggers=[['school-new-class',0],['computer-club',0],['best-friend-message',0],
   ['family-difficult-talk',1],['work-project-lead',0],['medical-prevention',0]];
 assert.equal(STORY_ARC_IDS.length,triggers.length);
 for(const [id,index] of triggers){
  const first=startStoryArc(id,index,25,null);
  assert.ok(first,id);assert.equal(first.phase,1);assert.equal(first.dueAge,26);
  assert.equal(startStoryArc(id,index,25,first),first);
  assert.equal(startStoryArc(id,(index+1)%3,25,null),null);
  const pt=storyArcEvent(first,'pt-BR'),en=storyArcEvent(first,'en');
  assert.ok(pt);assert.ok(en);assert.equal(pt.id,en.id);
  assert.equal(pt.choices.length,3);assert.equal(en.choices.length,3);
  assert.notEqual(pt.title,en.title);
  const next=afterStoryArcChoice(first,pt.id,0,26);
  assert.equal(next.phase,2);assert.equal(next.dueAge,27);
  assert.equal(storyArcEvent(next,'pt-BR').choices.length,3);
  assert.equal(afterStoryArcChoice(next,storyArcEvent(next,'en').id,1,27),null);
  assert.equal(afterStoryArcChoice(first,pt.id,2,26),null);
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
