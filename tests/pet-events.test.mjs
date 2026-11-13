import test from 'node:test';
import assert from 'node:assert/strict';
import {PET_STORY_COUNT,petStoryEvents,applyPetStoryChoice} from '../src/pet-events.ts';
import {createSimulation,applyNarrativeChoice} from '../src/simulation.ts';
import {createPetHousehold} from '../src/pets.ts';
const stats={happiness:67,health:77,smarts:62,looks:53};
const species=['dog','cat','rabbit','bird'];
const fixture=(speciesName,age=25,affection=77)=>{
 const pet={id:'pet-1',species:speciesName,name:'Pipoca',
  adoptedAt:age-4,ageYears:4,affection,energy:81,alive:true,
  lastCareAge:age-1,lastUpdatedAge:age};
 return {...createSimulation(),pets:{...createPetHousehold(),nextId:2,lastAdoptionAge:age-4,pets:[pet]}};
};
test('all four animal species have two original contextual stories with 24 meaningful choices',()=>{
 assert.equal(PET_STORY_COUNT,8);
 const pairs=[];
 for(const animal of species){
  const s=fixture(animal);
  const pt=petStoryEvents('pt-BR',s,25),en=petStoryEvents('en',s,25);
  assert.equal(pt.length,2,animal);
  assert.equal(en.length,2,animal);
  for(let i=0;i<pt.length;i++){
   const e=pt[i],enEvent=en[i];
   assert.equal(e.id,enEvent.id);
   assert.notEqual(e.title,enEvent.title);
   assert.notEqual(e.description,enEvent.description);
   assert.equal(e.choices.length,3);
   assert.ok(e.description.includes('Pipoca'));
   // Pet IDs are local to a life; include the species when checking seed diversity.
   pairs.push(animal+':'+e.id);
   for(let choice=0;choice<3;choice++){
    const selected=e.choices[choice];
    assert.ok(selected.label&&selected.result);
    const impact=applyNarrativeChoice(s,stats,25,e.id,choice,selected.effects,selected.world);
    assert.equal(impact.ok,true);
    const changed=applyPetStoryChoice(impact.state,25,e.id,choice);
    assert.equal(changed.ok,true);
    assert.equal(changed.state.pets.pets.length,1);
    assert.notEqual(changed.state.pets.pets[0].affection,s.pets.pets[0].affection);
    assert.equal(s.pets.pets[0].affection,77,'source pet must stay immutable');
    for(const v of Object.values(impact.stats))assert.ok(v>=0&&v<=100);
   }
  }
 }
 assert.equal(new Set(pairs).size,8);
});
test('a newly adopted companion cannot immediately generate a maturity story',()=>{
 const s=fixture('dog',22);
 s.pets.pets[0].ageYears=0;
 s.pets.pets[0].adoptedAt=22;
 assert.deepEqual(petStoryEvents('pt-BR',s,22),[]);
 s.pets.pets[0].ageYears=1;s.pets.pets[0].adoptedAt=21;
 assert.deepEqual(petStoryEvents('pt-BR',s,22).map(e=>e.id),['pet-story-pet-1-bond']);
});
test('low affection and dead companions cannot be used to replay imported fantasy story events',()=>{
 const s=fixture('cat',30,10);
 assert.equal(petStoryEvents('pt-BR',s,30).length,0);
 assert.equal(applyPetStoryChoice(s,30,'pet-story-pet-1-bond',0).ok,false);
 s.pets.pets[0].affection=77;s.pets.pets[0].alive=false;
 assert.equal(petStoryEvents('pt-BR',s,30).length,0);
 assert.equal(applyPetStoryChoice(s,30,'pet-story-pet-1-milestone',2).ok,false);
});
test('foreign IDs, invalid years and invalid choice indexes cannot mutate saved pets',()=>{
 const s=fixture('bird',31);
 for(const [age,id,index] of [
  [31,'pet-story-pet-2-bond',1],
  [31,'pet-story-pet-1-not-real',1],
  [31,'pet-story-pet-1-bond',3],
  [31,'pet-story-pet-1-milestone',-1],
  [13,'pet-story-pet-1-bond',0],
 ]){
  const result=applyPetStoryChoice(s,age,id,index);
  assert.equal(result.ok,false,String(id)+String(index));
  assert.equal(result.state,s);
 }
});
test('companion story choices persist both bond and real finances across serialized saves',()=>{
 const s={...fixture('cat',35),balance:3300};
 const e=petStoryEvents('pt-BR',s,35).find(e=>e.id.endsWith('milestone'));
 assert.ok(e);
 const selection=e.choices[0];
 const world=applyNarrativeChoice(s,stats,35,e.id,0,selection.effects,selection.world);
 const applied=applyPetStoryChoice(world.state,35,e.id,0);
 assert.equal(applied.ok,true);
 assert.equal(applied.state.balance,2900);
 assert.equal(applied.state.pets.pets[0].affection,88);
 assert.equal(applied.state.pets.pets[0].energy,96);
 const restored=JSON.parse(JSON.stringify(applied.state));
 assert.deepEqual(restored.pets.pets[0],applied.state.pets.pets[0]);
});
