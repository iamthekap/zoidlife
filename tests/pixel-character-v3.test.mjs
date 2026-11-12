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
