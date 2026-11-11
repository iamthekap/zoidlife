import test from 'node:test';
import assert from 'node:assert/strict';
import {lifeStage,portraitLife,avatarFingerprint} from '../src/life-art.ts';
const character={
 name:'Isabela Costa',gender:'woman',country:'BR',city:'Recife',
 skin:'tan',hair:'waves',hairColor:'blonde',eyes:'green',birthday:19,birthMonth:4
};
test('characters visibly grow from infant to senior',()=>{
 assert.equal(lifeStage(0),'baby');assert.equal(lifeStage(2),'baby');
 assert.equal(lifeStage(3),'child');assert.equal(lifeStage(12),'teen');
 assert.equal(lifeStage(18),'adult');assert.equal(lifeStage(65),'senior');
});
test('genetic fingerprint does not change when the character ages',()=>{
 const key=avatarFingerprint(character);
 for(const age of [0,3,10,14,18,44,85]){
  const image=portraitLife(character,age,'card');
  assert.ok(image.includes('role="img"'));
  assert.ok(image.includes('shape-rendering="crispEdges"'));
  assert.ok((image.match(/<rect/g)||[]).length>=45);
  assert.equal(key,avatarFingerprint(character));
 }
});
test('one baby portrait is a full-body seated character',()=>{
 const svg=portraitLife(character,0,'card');
 assert.ok(svg.includes('viewBox="0 0 144 176"'));
 assert.ok(svg.includes('stage-baby'));
 assert.ok(svg.includes('y="163"'));
 assert.ok(svg.includes('y="129"'));
});
test('distinct features produce distinct yet deterministic sprites',()=>{
 const original=portraitLife(character,0);
 assert.equal(original,portraitLife(character,0));
 assert.notEqual(original,portraitLife({...character,hair:'curls'},0));
 assert.notEqual(original,portraitLife({...character,skin:'deep'},0));
 assert.notEqual(original,portraitLife({...character,eyes:'blue'},0));
 assert.notEqual(original,portraitLife({...character,name:'André Souza'},0));
});
test('no external sprite sources or embedded scripts',()=>{
 const svg=portraitLife(character,32);
 assert.ok(!svg.includes('<script'));
 assert.ok(!svg.includes('<image'));
 assert.ok(!svg.includes('href='));
 assert.ok(!svg.includes('http:')&&!svg.includes('https:'));
});
