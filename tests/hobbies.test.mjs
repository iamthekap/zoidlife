import test from 'node:test';
import assert from 'node:assert/strict';
import {HOBBY_IDS,createHobbyBook,normalizeHobbyBook,canPracticeHobby,progressHobby,hobbyCreditAlternative} from '../src/hobbies.ts';
import {createSimulation,loadSimulation,practiceHobby,passYear} from '../src/simulation.ts';
import {careerAvailable,careerById} from '../src/careers.ts';
const stats={happiness:75,health:75,smarts:50,looks:55};
test('six genuine skills survive old saves and sanitize invalid imported records',()=>{
 assert.equal(HOBBY_IDS.length,6);
 assert.deepEqual(loadSimulation(createSimulation()).hobbies,createHobbyBook());
 assert.deepEqual(loadSimulation({...createSimulation(),hobbies:undefined}).hobbies,createHobbyBook());
 const broken={music:{xp:4000,awards:700,lastAge:10000},
  art:{xp:-50,awards:3,lastAge:10},
  coding:{xp:30,awards:4,lastAge:10},
  injected:{xp:100,awards:4,lastAge:10}};
 const saved=normalizeHobbyBook(broken);
 assert.equal(saved.music.xp,100);
 assert.equal(saved.music.awards,4);
 assert.equal(saved.music.lastAge,-1);
 assert.equal(saved.art.xp,0);
 assert.equal(saved.art.awards,0);
 assert.equal(saved.coding.awards,1);
 assert.ok(!Object.hasOwn(saved,'injected'));
});
test('hobbies are real once-yearly actions, with at most two different sessions per year',()=>{
 const s=createSimulation();
 assert.equal(practiceHobby(s,stats,4,'music').ok,false);
 assert.equal(practiceHobby(s,stats,12,'music').ok,true);
 const a=practiceHobby(s,stats,12,'music');
 assert.equal(s.hobbies.music.xp,0,'input must remain immutable');
 assert.equal(practiceHobby(a.state,a.stats,12,'music').ok,false);
 const b=practiceHobby(a.state,a.stats,12,'coding');
 assert.equal(b.ok,true);
 assert.equal(practiceHobby(b.state,b.stats,12,'writing').ok,false);
 assert.equal(practiceHobby(b.state,b.stats,13,'writing').ok,true);
 assert.equal(b.state.hobbies.music.xp,10);
 assert.equal(b.state.hobbies.coding.xp,10);
});
test('awards require real repeated progress and never grant unlimited cash',()=>{
 let s={...createSimulation(),balance:1000},v={...stats};
 for(let age=18;age<=20;age++){
  const result=practiceHobby(s,v,age,'music');
  assert.equal(result.ok,true);
  s=result.state;v=result.stats;
 }
 assert.ok(s.hobbies.music.xp>=25);
 assert.equal(s.hobbies.music.awards,1);
 assert.ok(s.balance>=1000-3*250);
 const again=practiceHobby(s,v,20,'music');
 assert.equal(again.ok,false);
 assert.equal(again.state.balance,s.balance);
});
test('coding talent unlocks credits equivalence but does not bypass formal degree or age',()=>{
 let s={...createSimulation(),education:'secondary',credits:0,experience:2},v={...stats};
 for(let age=18;age<26;age++){
  const next=practiceHobby(s,v,age,'coding');assert.equal(next.ok,true);
  s=next.state;v=next.stats;
 }
 assert.ok(s.hobbies.coding.xp>=65);
 assert.equal(hobbyCreditAlternative('designer',s.hobbies),false);
 assert.equal(hobbyCreditAlternative('developer',s.hobbies),true);
 const dev=careerById('developer');
 assert.equal(careerAvailable(s,26,dev),false,'college qualification still required');
 s={...s,education:'college'};
 assert.equal(careerAvailable(s,26,dev),true);
});
test('sport and community activities change athletic qualifications and family bonds',()=>{
 const first=practiceHobby(createSimulation(),stats,16,'sports');
 assert.equal(first.state.training,3);
 assert.ok(first.stats.health>stats.health);
 const second=practiceHobby(first.state,first.stats,16,'volunteering');
 assert.equal(second.state.family,75);
 assert.ok(second.state.friends>30);
});
test('hobby and annual salary interaction is part of the real career state',()=>{
 const s={...createSimulation(),job:'professional',occupation:'musician',careerMomentum:0,experience:4};
 const result=practiceHobby(s,stats,25,'music');
 assert.equal(result.ok,true);
 assert.ok(result.state.careerMomentum>=7);
 assert.equal(result.state.experience,s.experience+1);
 const grown=passYear(result.state,result.stats,26);
 assert.equal(grown.ok,true);
 assert.ok(grown.state.hobbies.music.xp>=10);
});
