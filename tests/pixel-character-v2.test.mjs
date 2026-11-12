import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPixelCharacter} from '../src/pixel-character-v2.ts';
import {portraitLife,lifeStage,avatarFingerprint} from '../src/life-art.ts';
import {randomCandidates} from '../src/characters.ts';
const p={name:'Samira Almeida',gender:'woman',country:'BR',city:'Recife',skin:'deep',
 hair:'curls',hairColor:'black',eyes:'green',birthday:8,birthMonth:8};
const stages={baby:0,child:6,teen:15,adult:32,senior:75};
test('all five silhouettes are original and anatomically different',()=>{
 const outputs=Object.entries(stages).map(([stage,age])=>{
  const svg=portraitLife(p,age,'card');
  assert.ok(svg.includes('stage-'+stage));
  assert.ok(svg.includes('data-style="clean-pixel-simulation-v2"'));
  assert.ok(svg.includes('<g transform="scale(2)">'));
  assert.ok(svg.includes('shape-rendering="crispEdges"'));
  assert.ok((svg.match(/<rect /g)||[]).length>=45);
  assert.ok(!svg.includes('href=')&&!svg.includes('<script'));
  return svg;
 });
 assert.equal(new Set(outputs).size,5);
 assert.equal(lifeStage(0),'baby');assert.equal(lifeStage(65),'senior');
});
test('the baby has a baby-only face and a seated outfit',()=>{
 const svg=portraitLife({...p,gender:'man'},0);
 assert.ok(svg.includes('data-age-visual="infant"'));
 assert.ok(svg.includes('data-part="seated-onesie"'));
 assert.ok(svg.includes('data-part="infant-face"'));
 assert.ok(svg.includes('data-part="infant-hair"'));
 assert.ok(!svg.includes('data-part="facial-hair"'));
 for(const stage of ['child','teen','adult','senior']){
  const grown=renderPixelCharacter(p,stage);
  assert.ok(grown.includes('data-part="body-outfit"'));
  assert.ok(!grown.includes('data-part="seated-onesie"'));
 }
});
test('genes stay constant through five age stages',()=>{
 const key=avatarFingerprint(p);
 const originals=[0,4,12,18,65].map(age=>portraitLife(p,age));
 for(const svg of originals){
  assert.ok(svg.includes('#38836b')); // iris is the same gene
  assert.ok(svg.includes('#252735')); // hair keeps same base, even as a senior
  assert.ok(svg.includes('#916048')); // skin base
 }
 assert.equal(avatarFingerprint(p),key);
});
test('four hairstyles and distinct eye colors change anatomy, not just background',()=>{
 for(const hair of ['short','waves','curls','long']){
  const outputs=['brown','green','blue'].map(eyes=>portraitLife({...p,hair,eyes},14,'story-actor'));
  assert.equal(new Set(outputs).size,3);
  assert.ok(outputs.every(svg=>!svg.includes('data-part="background"')));
 }
 const set=['short','waves','curls','long'].map(hair=>portraitLife({...p,hair},0));
 assert.equal(new Set(set).size,4);
});
test('entry trio intentionally offers distinct visual silhouettes',()=>{
 for(let k=0;k<20;k++){
   const trio=randomCandidates(3);
   assert.equal(new Set(trio.map(p=>p.name)).size,3);
   assert.equal(new Set(trio.map(p=>p.skin)).size,3);
   assert.equal(new Set(trio.map(p=>p.hair)).size,3);
 }
});
test('the same profile always draws the same pixels, while changing a gene changes appearance',()=>{
 const svg=portraitLife(p,0);
 assert.equal(portraitLife(p,0),svg);
 for(const change of [{eyes:'blue'},{skin:'tan'},{hairColor:'red'},{hair:'long'}]){
  assert.notEqual(portraitLife({...p,...change},0),svg);
 }
});

test('outfit choice changes actual sprite clothing across growth but preserves genetics',()=>{
 const baby=portraitLife({...p,outfit:'red'},0);
 const blue=portraitLife({...p,outfit:'blue'},0);
 assert.notEqual(baby,blue);
 assert.ok(baby.includes('#dc536d'));
 assert.ok(blue.includes('#3976c9'));
 for(const age of [0,3,12,18,65]){
  const svg=portraitLife({...p,outfit:'red'},age);
  assert.ok(svg.includes('#dc536d'));
  assert.ok(svg.includes('#38836b'));
 }
});
test('newborn face is round with a lighter brow and infant hair never forms an adult hair cap',()=>{
 for(const hair of ['short','waves','curls','long']){
  const svg=portraitLife({...p,hair},0);
  const face=svg.split('<g data-part="infant-face">')[1]?.split('</g>')[0]||'';
  const infantHair=svg.split('<g data-part="infant-hair">')[1]?.split('</g>')[0]||'';
  assert.ok(face.includes('x="26"')); // central rounded face cap
  assert.ok(!face.includes('data-part="facial-hair"'));
  assert.ok(infantHair.length>100);
  assert.equal(svg.includes('data-part="age-hair"'),false);
 }
});
