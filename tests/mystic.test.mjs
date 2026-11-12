import test from 'node:test';
import assert from 'node:assert/strict';
import {mysticEvents,isMysticOrigin,practiceMystic} from '../src/mystic.ts';
import {randomCharacter,normalizeProfile} from '../src/characters.ts';
import {createSimulation,loadSimulation,takeAction} from '../src/simulation.ts';
import {CAREERS,careerById,careerAvailable} from '../src/careers.ts';
const stats={health:70,smarts:60,happiness:65,looks:55};
test('three random candidates are always human, without special events or powers',()=>{
 for(let i=0;i<30;i++){
  const p=randomCharacter();
  assert.equal(isMysticOrigin(p),false);
  assert.deepEqual(mysticEvents('pt-BR',p),[]);
  assert.equal(practiceMystic(createSimulation(),stats,20,p).ok,false);
 }
});
test('only custom characters have nine nature-gated original fantasy scenarios',()=>{
 const seen=[];
 for(const nature of ['vampire','werewolf','mage']){
  const p=normalizeProfile({...randomCharacter(),origin:'custom',nature});
  const stories=mysticEvents('pt-BR',p);
  assert.equal(stories.length,3);
  assert.ok(stories.every(x=>x.choices.length===3));
  seen.push(...stories.map(x=>x.id));
 }
 assert.equal(new Set(seen).size,9);
});
test('custom power use once annually advances persistent mystical mastery',()=>{
 const p=normalizeProfile({...randomCharacter(),origin:'custom',nature:'vampire'});
 const s=createSimulation();
 assert.equal(practiceMystic(s,stats,11,p).ok,false);
 const first=practiceMystic(s,stats,12,p);
 assert.equal(first.ok,true);
 assert.equal(first.state.mysticMastery,5);
 assert.equal(practiceMystic(first.state,first.stats,12,p).ok,false);
 assert.equal(practiceMystic(first.state,first.stats,13,p).ok,true);
 assert.equal(loadSimulation(first.state).mysticMastery,5);
});
test('catalogue features 45 distinct jobs and special ones require custom nature',()=>{
 assert.equal(CAREERS.length,45);
 assert.equal(new Set(CAREERS.map(x=>x.id)).size,45);
 for(const id of ['doctor','dentist','lawyer','surgeon','judge','footballer','basketballer']){
  assert.ok(careerById(id));
 }
 const s={...createSimulation(),education:'college',credits:50,experience:15,training:70,mysticMastery:90,balance:30000};
 const role=careerById('night-healer');
 assert.equal(careerAvailable(s,30,role,{origin:'generated',nature:'vampire'}),false);
 assert.equal(careerAvailable(s,30,role,{origin:'custom',nature:'human'}),false);
 assert.equal(careerAvailable(s,30,role,{origin:'custom',nature:'vampire'}),true);
});
test('sport qualification is earned via independent annual training action',()=>{
 let s={...createSimulation(),education:'secondary',credits:12};
 const job=careerById('footballer');
 assert.equal(careerAvailable(s,21,job),false);
 for(let age=6;age<15;age++)s=(awaitNoop(s,age));
 assert.ok(s.training>=35);
 assert.equal(careerAvailable(s,21,job),true);
});
function awaitNoop(s,age){
 // Use the real state transition; no special manipulation of profile or saves.
 const result=takeSports(s,age);return result;
}
function takeSports(s,age){
 const stats={happiness:70,health:80,smarts:60,looks:50};
 return takeAction(s,stats,age,'train').state;
}
