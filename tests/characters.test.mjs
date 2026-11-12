import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, COUNTRIES, SKINS, HAIRS, HAIR_COLORS, EYES, GENDERS,
  normalizeProfile, randomCharacter, randomCandidates, portraitSvg } from '../src/characters.ts';
test('random characters have valid names, countries and compatible cities', () => {
  for(let i=0;i<100;i++){
    const p=randomCharacter();
    assert.ok(p.name.split(' ').length>=2);
    assert.ok(COUNTRIES.includes(p.country));
    assert.ok(CITIES[p.country].includes(p.city));
    assert.ok(SKINS.includes(p.skin));
    assert.ok(HAIRS.includes(p.hair));
    assert.ok(HAIR_COLORS.includes(p.hairColor));
    assert.ok(EYES.includes(p.eyes));
    assert.ok(GENDERS.includes(p.gender));
    assert.ok(p.birthday>=1&&p.birthday<=28);
    assert.ok(p.birthMonth>=1&&p.birthMonth<=12);
  }
});
test('candidate lists have unique names', ()=>{
  const batch=randomCandidates(8);
  assert.equal(batch.length,8);
  assert.equal(new Set(batch.map(p=>p.name)).size,8);
});
test('character normalization never echoes arbitrary values into SVG inputs',()=>{
  const p=normalizeProfile({name:' <script>alert(1)</script> ', country:'BR',city:'Invalid City',
    skin:'javascript:alert(1)',gender:'unknown',hair:'bad', hairColor:'bad',eyes:'bad',birthday:34,birthMonth:99},'Fallback');
  assert.equal(p.country,'BR');
  assert.equal(p.city,CITIES.BR[0]);
  assert.ok(SKINS.includes(p.skin));
  assert.ok(HAIRS.includes(p.hair));
  assert.ok(p.birthday>=1&&p.birthday<=28);
  const svg=portraitSvg(p);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(!svg.includes('javascript:'));
  assert.ok(!svg.includes('<script>'));
});
test('portrait contains fully self-contained original vector art',()=>{
  const svg=portraitSvg(randomCharacter(),'card');
  assert.ok(svg.includes('viewBox="0 0 128 144"'));
  assert.ok(svg.includes('aria-label='));
  assert.ok(!svg.includes('<image'));
  assert.ok(!svg.includes('<image')&&!svg.includes('href='));
  assert.ok((svg.match(/<rect/g)||[]).length>=25);
});
test('legacy name can migrate to a generated visual profile',()=>{
  const p=normalizeProfile(null,'Carolina Marques');
  assert.equal(p.name,'Carolina Marques');
  assert.ok(CITIES[p.country].includes(p.city));
});

test('three default newborns receive distinct outfits and user appearance survives profile normalization',()=>{
 for(let i=0;i<24;i++){
  const triple=randomCandidates(3);
  assert.equal(new Set(triple.map(p=>p.outfit)).size,3);
 }
 const original=randomCharacter();
 const normalized=normalizeProfile({...original,outfit:'red'},original.name);
 assert.equal(normalized.outfit,'red');
 assert.equal(normalizeProfile({...original,outfit:'javascript:alert(1)'},original.name).outfit,undefined);
 const legacy={...original};delete legacy.outfit;
 assert.equal(normalizeProfile(legacy,legacy.name).outfit,undefined);
});

test('special destiny is exclusively available to custom-created characters',()=>{
 for(let i=0;i<60;i++){
  const trio=randomCandidates(3);
  assert.ok(trio.every(p=>p.origin==='generated'&&p.nature==='human'));
 }
 const human=normalizeProfile({...randomCharacter(),origin:'generated',nature:'vampire'});
 assert.equal(human.nature,'human');
 const special=normalizeProfile({...randomCharacter(),origin:'custom',nature:'vampire'});
 assert.equal(special.nature,'vampire');
 assert.equal(special.origin,'custom');
 assert.equal(normalizeProfile({...special,nature:'scripting'}).nature,'human');
});
