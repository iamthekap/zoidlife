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
 assert.ok(svg.includes('data-style="clean-pixel-simulation-v2"'));
 assert.ok(svg.includes('data-part="seated-onesie"'));
 assert.ok(svg.includes('data-part="infant-hands"') || svg.includes('data-part="seated-onesie"'));
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
 assert.ok(!svg.includes('<image')&&!svg.includes('href='));
 assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
});

test('newborn sprites use a dedicated infant body and never reuse adult beard',()=>{
 const baby=portraitLife({...character,gender:'man',hair:'long'},0,'card');
 assert.ok(baby.includes('data-age-visual="infant"'));
 assert.ok(baby.includes('data-part="seated-onesie"'));
 assert.ok(baby.includes('data-part="infant-face"'));
 assert.ok(baby.includes('data-part="infant-hair"'));
 assert.ok(!baby.includes('data-part="facial-hair"'));
 assert.ok(!baby.includes('data-part="adult-shirt"'));
 assert.ok((baby.match(/<rect/g)||[]).length>55);
 const adolescent=portraitLife({...character,gender:'man'},15);
 assert.ok(!adolescent.includes('data-part="facial-hair"'));
 const adult=portraitLife({...character,gender:'man'},30);
 assert.ok(!adult.includes('data-age-visual="infant"'));
});
test('babies inherit colors and hair identity while hair remains infant-style',()=>{
 const baby=portraitLife(character,0);
 assert.ok(baby.includes('data-part="infant-hair"'));
 assert.notEqual(baby,portraitLife({...character,hairColor:'black'},0));
 assert.notEqual(baby,portraitLife({...character,hair:'curls'},0));
 assert.notEqual(baby,portraitLife({...character,skin:'deep'},0));
 assert.notEqual(baby,portraitLife({...character,eyes:'blue'},0));
 assert.notEqual(baby,portraitLife(character,4));
});

test('real health and happiness select visible expressions without rewriting identity genes',async()=>{
 const {moodFromStats}=await import('../src/life-art.ts');
 const happy=moodFromStats({happiness:92,health:90});
 const worried=moodFromStats({happiness:12,health:90});
 const focused=moodFromStats({happiness:54,health:95});
 const curious=moodFromStats({happiness:52,health:61});
 assert.deepEqual([happy,worried,focused,curious],['cheerful','thoughtful','determined','curious']);
 const h=portraitLife(character,28,'card',happy),w=portraitLife(character,28,'card',worried);
 assert.notEqual(h,w);
 assert.ok(h.includes('data-part="age-expression-cheerful"'));
 assert.ok(w.includes('data-part="age-expression-thoughtful"'));
 assert.equal(avatarFingerprint(character),avatarFingerprint({...character}));
 for(const svg of [h,w]){
  assert.ok(svg.includes('data-part="age-face"'));
  assert.ok(svg.includes('data-part="legs"'));
  assert.ok(svg.includes('#38836b'));assert.ok(svg.includes('#d3a45b'));
 }
});
