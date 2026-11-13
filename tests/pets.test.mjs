import test from 'node:test';
import assert from 'node:assert/strict';
import {PET_SPECIES,PET_COST,PET_LIFESPAN,createPetHousehold,normalizePetHousehold,
 canAdoptPet,adoptPet,careForPet,advancePets,petPortrait,petLabel} from '../src/pets.ts';
import {createSimulation,loadSimulation,adoptCompanion,careForCompanion,passYear} from '../src/simulation.ts';
const stats={happiness:68,health:72,smarts:54,looks:58};

test('four unique animal portraits and bilingual identities use only original local SVG shapes',()=>{
 assert.equal(PET_SPECIES.length,4);
 const images=PET_SPECIES.map(id=>{
  assert.ok(petLabel(id,'pt-BR')!==petLabel(id,'en'));
  assert.ok(PET_LIFESPAN[id]>=10&&PET_LIFESPAN[id]<=20);
  assert.ok(PET_COST[id]>=200);
  const svg=petPortrait(id);
  assert.ok(svg.includes('viewBox="0 0 64 64"'));
  assert.ok(svg.includes('pet-'+id));
  assert.ok((svg.match(/<rect /g)||[]).length>=9);
  assert.ok(!svg.includes('<script')&&!svg.includes('<image')&&!svg.includes('href='));
  return svg;
 });
 assert.equal(new Set(images).size,4);
});
test('adoption has an authentic price, one annual adoption and max two living pets',()=>{
 const s={...createSimulation(),balance:20000};
 assert.equal(adoptCompanion(s,stats,7,'dog','Rex').ok,false);
 assert.equal(adoptCompanion({...s,balance:50},stats,20,'dog','Rex').ok,false);
 assert.equal(adoptCompanion(s,stats,20,'dog','').ok,false);
 const first=adoptCompanion(s,stats,20,'dog','Rex');
 assert.equal(first.ok,true);
 assert.equal(first.state.balance,19350);
 assert.equal(first.state.family,73);
 assert.equal(first.state.pets.pets[0].name,'Rex');
 assert.equal(first.stats.happiness,74);
 assert.equal(s.pets.pets.length,0,'input never mutates');
 assert.equal(adoptCompanion(first.state,first.stats,20,'cat','Luna').ok,false);
 const second=adoptCompanion(first.state,first.stats,21,'cat','Luna');
 assert.equal(second.ok,true);
 assert.equal(second.state.pets.pets.length,2);
 assert.equal(adoptCompanion(second.state,second.stats,22,'rabbit','Pipoca').ok,false);
});
test('children can welcome a family pet at no cost and caring is once per companion each year',()=>{
 const start=createSimulation();
 const pet=adoptCompanion(start,stats,9,'rabbit','Pipoca');
 assert.equal(pet.ok,true);
 assert.equal(pet.state.balance,0);
 assert.equal(careForCompanion(pet.state,pet.stats,9,'pet-1').ok,false,
  'adoption includes care in its own year');
 const care=careForCompanion(pet.state,pet.stats,10,'pet-1');
 assert.equal(care.ok,true);
 assert.ok(care.state.pets.pets[0].affection>pet.state.pets.pets[0].affection);
 assert.ok(care.stats.happiness>pet.stats.happiness);
 assert.equal(careForCompanion(care.state,care.stats,10,'pet-1').ok,false);
 assert.equal(careForCompanion(care.state,care.stats,10,'pet-unknown').ok,false);
});
test('companions age, require yearly maintenance and eventually leave memorial entries',()=>{
 const pet=adoptCompanion({...createSimulation(),balance:90000},stats,20,'rabbit','Mimo');
 assert.equal(pet.ok,true);
 let state=pet.state,st=pet.stats,last=20;
 for(let age=21;age<=31;age++){
  const before=state.balance;
  const outcome=passYear(state,st,age);
  assert.equal(outcome.ok,true);
  state=outcome.state;st=outcome.stats;last=age;
  if(age===21){
   assert.equal(state.pets.pets[0].ageYears,1);
   assert.ok(before>state.balance);
   assert.ok(outcome.notes.includes('pet-upkeep:170'));
  }
 }
 assert.equal(last,31);
 assert.equal(state.pets.pets[0].alive,false);
 assert.equal(state.pets.pets[0].ageYears,11);
 assert.equal(state.pets.pets.length,1,'deceased pets remain in the memorial');
 const noMoreCare=careForCompanion(state,st,31,'pet-1');
 assert.equal(noMoreCare.ok,false);
});
test('pet migration removes forged entries, invalid ages, duplicate IDs and unsafe shapes',()=>{
 const clean=createPetHousehold();
 assert.deepEqual(normalizePetHousehold(null),clean);
 assert.deepEqual(loadSimulation({...createSimulation(),pets:undefined}).pets,clean);
 const normalized=normalizePetHousehold({schema:1,nextId:2,pets:[
  {id:'pet-2',species:'cat',name:'Luna',adoptedAt:18,lastCareAge:20,lastUpdatedAge:20,
   ageYears:2,affection:102,energy:-5,alive:true},
  {id:'pet-2',species:'dog',name:'Clone',adoptedAt:18,lastCareAge:20,alive:true},
  {id:'pet-3',species:'dragon',name:'Spy',adoptedAt:20,lastCareAge:20,alive:true},
  {id:'pet-4',species:'bird',name:'',adoptedAt:20,lastCareAge:20,alive:true},
  {id:'bad',species:'cat',name:'Escape',adoptedAt:20,lastCareAge:20,alive:true}
 ]});
 assert.equal(normalized.pets.length,1);
 assert.deepEqual(normalized.pets[0],{id:'pet-2',species:'cat',name:'Luna',
   adoptedAt:18,lastCareAge:20,lastUpdatedAge:20,ageYears:2,affection:100,energy:0,alive:true});
 assert.equal(normalized.nextId,3);
 assert.equal(normalized.lastAdoptionAge,18);
 assert.equal(canAdoptPet(normalized,18,'bird','Tico'),false);
 assert.equal(canAdoptPet(normalized,19,'bird','Tico'),true);
});
test('pure companion helpers reject invalid duplicate care without changing saved state',()=>{
 const s=createPetHousehold();
 const first=adoptPet(s,11,'bird','Tico');
 assert.equal(first.ok,true);
 assert.deepEqual(s,createPetHousehold());
 assert.equal(adoptPet(first.state,11,'cat','Lua').ok,false);
 const care=careForPet(first.state,12,'pet-1');
 assert.equal(care.ok,true);
 assert.equal(careForPet(care.state,12,'pet-1').ok,false);
 const grown=advancePets(care.state,13);
 assert.equal(grown.state.pets[0].ageYears,2);
 assert.equal(grown.maintenance,0);
 assert.equal(grown.state.pets[0].alive,true);
});
