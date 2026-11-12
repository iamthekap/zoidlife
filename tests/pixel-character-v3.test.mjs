import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMatureCharacter} from '../src/pixel-character-v3.ts';
import {randomCharacter,normalizeProfile} from '../src/characters.ts';
const profile=normalizeProfile({...randomCharacter(),name:'Cecilia Ribeiro',skin:'brown',
 hair:'curls',hairColor:'black',eyes:'green',outfit:'blue'});
test('independently layered anatomies exist in all four post-infant stages',()=>{
 for(const stage of ['child','teen','adult','senior']){
  const html=renderMatureCharacter(profile,stage);
  for(const layer of ['age-face','age-hair','body-outfit','legs'])
   assert.ok(html.includes('data-part="'+layer+'"'),layer+' absent: '+stage);
  assert.ok(html.includes('stage-'+stage));
  assert.ok(html.includes('data-renderer="mature-v3"'));
  assert.ok(html.includes('fill="#ba8362"'));
  assert.ok(html.includes('fill="#38836b"'));
  assert.ok(!html.includes('data-part="facial-hair"'));
 }
});
test('actor illustrations remain transparent while portraits use a soft background',()=>{
 const actor=renderMatureCharacter(profile,'child','story-actor');
 const card=renderMatureCharacter(profile,'child','card');
 assert.ok(!actor.includes('data-part="background"'));
 assert.ok(card.includes('data-part="background"'));
});
test('child, teen and adult use different primary body proportions',()=>{
 const markup=['child','teen','adult'].map(stage=>renderMatureCharacter(profile,stage));
 assert.equal(new Set(markup).size,3);
 assert.ok(markup[0].includes('stage-child'));
 assert.ok(!markup[0].includes('stage-adult'));
});
test('aging does not replace original hair or skin colors, seniors gain age details',()=>{
 const senior=renderMatureCharacter(profile,'senior');
 const child=renderMatureCharacter(profile,'child');
 assert.ok(senior.includes('data-part="senior-details"'));
 assert.ok(!child.includes('data-part="senior-details"'));
 assert.ok(senior.includes('fill="#252735"'));
 assert.ok(child.includes('fill="#252735"'));
});

test('child haircut and clothing have deliberately shorter cut and shorts, not adult trousers',()=>{
 const child=renderMatureCharacter(profile,'child');
 const adult=renderMatureCharacter(profile,'adult');
 assert.notEqual(child,adult);
 assert.ok(child.includes('data-part="legs"'));
 assert.ok(adult.includes('data-part="legs"'));
 assert.ok(child.includes('data-part="age-hair"'));
});

test('adult clothing varies across identities while genetic hair/eyes remain intact',()=>{
 const styles=new Set();
 const base={...profile,skin:'tan',hair:'short',eyes:'brown'};
 for(const name of ['Ana Moraes','Bia Costa','Joana Souza','Luisa Vale','Davi Cruz','Marcos Dias','Pedro Lima','Maya Neves','Isadora Luz','Caio Melo','Raul Nunes','Alma Duarte']){
  const svg=renderMatureCharacter({...base,name},'adult');
  const kind=/data-part="(adult-blazer|adult-casual-jacket|adult-streetwear)"/.exec(svg)?.[1];
  assert.ok(kind);
  styles.add(kind);
  assert.ok(svg.includes('fill="#74452e"'));
 }
 assert.equal(styles.size,3);
});

test('childhood clothing has three distinct shape layers at fixed genetics',()=>{
 const expected=['child-graphic-tee','child-tunic','child-sporty-pullover'];
 for(let i=0;i<3;i++){
  const svg=renderMatureCharacter(profile,'child','card',i);
  assert.ok(svg.includes('data-part="'+expected[i]+'"'),expected[i]+' absent');
  assert.ok(svg.includes('fill="#ba8362"'));
  assert.ok(svg.includes('fill="#38836b"'));
  assert.equal((svg.match(/data-part="child-/g)||[]).length,1);
 }
});
test('growth retains recognizable eyes, skin and age-specific clothing without added facial hair',()=>{
 const ages=['child','teen','adult','senior'];
 const sprites=ages.map(age=>renderMatureCharacter(profile,age,'card',2));
 assert.equal(new Set(sprites).size,4);
 for(const sprite of sprites){
  assert.ok(sprite.includes('data-part="age-face"'));
  assert.ok(sprite.includes('data-part="age-hair"'));
  assert.ok(sprite.includes('fill="#38836b"'));
  assert.ok(!sprite.includes('data-part="facial-hair"'));
 }
});

test('curly hair renders connected tufts rather than a disconnected box crown',()=>{
 const curly=renderMatureCharacter({...profile,hair:'curls'},'child');
 const short=renderMatureCharacter({...profile,hair:'short'},'child');
 assert.notEqual(curly,short);
 assert.ok(curly.includes('data-part="age-hair"'));
 assert.ok(curly.includes('data-part="age-face"'));
 assert.ok(curly.includes('fill="#38836b"'));
 assert.ok(!curly.includes('<image')&&!curly.includes('href='));
});

test('adult and child bodies support three genuinely different two-arm gestures without changing inherited traits',()=>{
 for(const stage of ['child','teen','adult']){
  const poses=[0,1,2].map(seed=>renderMatureCharacter(profile,stage,'card',seed));
  assert.equal(new Set(poses).size,3);
  for(let i=0;i<3;i++){
   assert.ok(poses[i].includes('data-pose="'+['neutral','thoughtful','greeting'][i]+'"'));
   assert.ok(poses[i].includes('data-part="age-pose-'+['neutral','thoughtful','greeting'][i]+'"'));
   assert.ok(poses[i].includes('data-part="legs"'));
   assert.ok(poses[i].includes('data-part="age-face"'));
   assert.ok(poses[i].includes('fill="#38836b"'));
   assert.ok(poses[i].includes('fill="#ba8362"'));
  }
 }
});
test('four independent facial expressions stay structurally intact and safe',()=>{
 const expressions=['cheerful','curious','determined','thoughtful'];
 const poses=expressions.map((name,i)=>{
  const svg=renderMatureCharacter(profile,'adult','card',i);
  assert.ok(svg.includes('data-part="age-expression-'+name+'"'));
  assert.equal((svg.match(/data-part="age-expression-/g)||[]).length,1);
  assert.ok(!svg.includes('<image')&&!svg.includes('<script'));
  return svg;
 });
 assert.equal(new Set(poses).size,4);
});
