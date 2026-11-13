/** Original animal companions with truthful lifetimes and earned affection.
 * This module is pure: the simulation owns payments and its outcomes.
 */
export const PET_SPECIES=['dog','cat','rabbit','bird'] as const;
export type PetSpecies=typeof PET_SPECIES[number];
export type Companion={id:string;species:PetSpecies;name:string;adoptedAt:number;ageYears:number;
 affection:number;energy:number;alive:boolean;lastCareAge:number;lastUpdatedAge:number};
export type PetHousehold={schema:1;nextId:number;lastAdoptionAge:number;pets:Companion[]};
export const PET_LIFESPAN:Record<PetSpecies,number>={dog:14,cat:17,rabbit:11,bird:15};
export const PET_COST:Record<PetSpecies,number>={dog:650,cat:420,rabbit:250,bird:330};
const LABELS:Record<PetSpecies,[string,string]>={dog:['Cachorro','Dog'],cat:['Gato','Cat'],
 rabbit:['Coelho','Rabbit'],bird:['Pássaro','Bird']};
export const petLabel=(species:PetSpecies,lang:'pt-BR'|'en')=>LABELS[species][lang==='en'?1:0];
const cap=(v:unknown,max:number):number=>typeof v==='number'&&Number.isFinite(v)?
 Math.max(0,Math.min(max,Math.round(v))):0;
const speciesOf=(v:unknown):v is PetSpecies=>typeof v==='string'&&PET_SPECIES.includes(v as PetSpecies);
export const createPetHousehold=():PetHousehold=>({schema:1,nextId:1,lastAdoptionAge:-1,pets:[]});
export function normalizePetHousehold(raw:unknown):PetHousehold{
 const result=createPetHousehold();
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 const input=raw as Record<string,unknown>,ids=new Set<string>(),pets:Companion[]=[];
 if(Array.isArray(input.pets))for(const x of input.pets.slice(-30)){
  if(!x||typeof x!=='object'||Array.isArray(x))continue;
  const p=x as Record<string,unknown>;
  if(typeof p.id!=='string'||!/^pet-[1-9][0-9]{0,4}$/.test(p.id)||
   ids.has(p.id)||!speciesOf(p.species)||typeof p.name!=='string'||p.name.trim().length<1||
   p.name.length>28||!Number.isInteger(p.adoptedAt)||Number(p.adoptedAt)<8||
   Number(p.adoptedAt)>105||!Number.isInteger(p.lastCareAge)||
   Number(p.lastCareAge)<-1||Number(p.lastCareAge)>110)continue;
  ids.add(p.id);
  const adoptedAt=Number(p.adoptedAt),lastUpdatedAge=Number.isInteger(p.lastUpdatedAge)&&
   Number(p.lastUpdatedAge)>=adoptedAt&&Number(p.lastUpdatedAge)<=110?
   Number(p.lastUpdatedAge):adoptedAt;
  pets.push({id:p.id,species:p.species,name:p.name.trim(),adoptedAt,
   ageYears:Math.min(PET_LIFESPAN[p.species],cap(p.ageYears,40)),
   affection:cap(p.affection,100),energy:cap(p.energy,100),
   alive:p.alive===true,lastCareAge:Number(p.lastCareAge),
   lastUpdatedAge});
 }
 const maxId=Math.max(0,...pets.map(x=>Number(x.id.slice(4))));
 // Extra living pets in hand-edited saves are invalid, not proof of adoptions.
 // Retain the two most recent living companions and authentic older memorials.
 let living=0;
 result.pets=pets.slice(-12).reverse().filter(p=>!p.alive||++living<=2).reverse();
 result.nextId=Math.min(100000,Math.max(maxId+1,1,
  Number.isInteger(input.nextId)?Number(input.nextId):1));
 result.lastAdoptionAge=Math.max(-1,...result.pets.map(x=>x.adoptedAt));
 return result;
}
export function canAdoptPet(state:PetHousehold,age:number,species:unknown,name:string):boolean{
 return speciesOf(species)&&Number.isInteger(age)&&age>=8&&age<=105&&
  typeof name==='string'&&name.trim().length>=1&&name.trim().length<=28&&
  state.lastAdoptionAge!==age&&state.pets.filter(p=>p.alive).length<2&&
  state.nextId<=99999;
}
export function adoptPet(state:PetHousehold,age:number,species:PetSpecies,name:string):
 {ok:boolean;state:PetHousehold;pet:Companion|null}{
 if(!canAdoptPet(state,age,species,name))return {ok:false,state,pet:null};
 const pet:Companion={id:'pet-'+state.nextId,species,name:name.trim(),adoptedAt:age,
  ageYears:0,affection:65,energy:90,alive:true,lastCareAge:age,lastUpdatedAge:age};
 return {ok:true,state:{...state,nextId:state.nextId+1,lastAdoptionAge:age,
  pets:[...state.pets,pet].slice(-12)},pet};
}
export function careForPet(state:PetHousehold,age:number,id:string):
 {ok:boolean;state:PetHousehold;pet:Companion|null}{
 const pet=state.pets.find(x=>x.id===id);
 if(!pet||!pet.alive||!Number.isInteger(age)||age<8||age>110||
  age<pet.adoptedAt||pet.lastCareAge===age)return {ok:false,state,pet:null};
 const cared={...pet,lastCareAge:age,affection:Math.min(100,pet.affection+16),
  energy:Math.min(100,pet.energy+20)};
 return {ok:true,pet:cared,state:{...state,pets:state.pets.map(x=>x.id===id?cared:x)}};
}
export function advancePets(state:PetHousehold,age:number):
 {state:PetHousehold;maintenance:number;deaths:Companion[];companionship:number}{
 if(!Number.isInteger(age)||age<1||age>110)return {state,maintenance:0,deaths:[],companionship:0};
 let maintenance=0,companionship=0;
 const deaths:Companion[]=[];
 const pets=state.pets.map(p=>{
  if(!p.alive||age<=p.lastUpdatedAge)return p;
  const ageYears=Math.max(0,age-p.adoptedAt);
  const energy=Math.max(0,p.energy-(p.lastCareAge>=age-1?6:17));
  const affection=Math.max(0,p.affection-(p.lastCareAge>=age-1?1:5));
  const alive=ageYears<PET_LIFESPAN[p.species]&&energy>0;
  const next={...p,ageYears,energy,affection,alive,lastUpdatedAge:age};
  if(!alive)deaths.push(next);
  else{
   if(age>=18)maintenance+=170;
   if(affection>=60)companionship+=1;
  }
  return next;
 });
 return {state:{...state,pets},maintenance,deaths,companionship};
}
/** Four self-contained vector portraits (pixel geometry, zero remote assets). */
export function petPortrait(species:PetSpecies):string{
 const c:Record<PetSpecies,[string,string,string]>={
  dog:['#ab7856','#79513e','#f0c49d'],cat:['#9a9ca7','#565e73','#dfdce5'],
  rabbit:['#d7c0b9','#a88f94','#f9ecde'],bird:['#6cb6a9','#367b93','#d7f4e6']};
 const [body,shadow,light]=c[species];
 const r=(x:number,y:number,w:number,h:number,col:string)=>
  '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+col+'"/>';
 let shape=r(14,28,36,25,shadow)+r(17,29,30,20,body)+r(23,32,18,13,light);
 if(species==='dog')shape+=r(9,14,15,26,shadow)+r(40,14,15,26,shadow)+
  r(18,16,29,24,body)+r(26,35,12,7,light)+r(27,38,10,3,shadow);
 if(species==='cat')shape+=r(12,11,13,20,shadow)+r(39,11,13,20,shadow)+
  r(15,6,9,13,body)+r(40,6,9,13,body)+r(18,21,28,21,body)+
  r(2,31,15,7,shadow);
 if(species==='rabbit')shape+=r(16,2,10,30,shadow)+r(38,2,10,30,shadow)+
  r(18,4,6,24,light)+r(40,4,6,24,light)+r(18,24,28,21,body);
 if(species==='bird')shape+=r(7,32,16,14,body)+r(38,33,20,7,'#e2b25d')+
  r(15,18,34,30,body)+r(18,31,18,11,shadow)+r(27,16,5,7,light);
 shape+=r(22,29,5,5,'#1c2939')+r(38,29,5,5,'#1c2939')+
  r(23,30,2,2,'#ffffff')+r(39,30,2,2,'#ffffff');
 return '<svg class="pet-pixel-art pet-'+species+'" viewBox="0 0 64 64" role="img" '+
  'aria-label="Original Zoid Life '+species+' pixel portrait" '+
  'xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'+shape+'</svg>';
}
