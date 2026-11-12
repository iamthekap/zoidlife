/** Original persistent people and family simulation for Zoid Life. */
import {randomCharacter, normalizeProfile, type CharacterProfile} from './characters.ts';
export type SocialRole='mother'|'father'|'parent'|'partner'|'child'|'friend';
export type SocialInteractionKind='talk'|'gift'|'help'|'compliment'|'argue'|'invite';
export type SocialMemory={age:number;kind:SocialInteractionKind;bondChange:number};
export type SocialPerson={
 id:string; role:SocialRole; profile:CharacterProfile; bornAtPlayerAge:number;
 closeness:number; alive:boolean; lastSharedAge:number; memories?:SocialMemory[];
};
export type SocialState={schema:1;people:SocialPerson[]};
export type SocialUpdate={social:SocialState;notes:string[]};
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
const validId=(id:string)=>/^(mother|father|parent|partner|child|friend)-[a-z0-9-]{1,40}$/.test(id);
const roleLabels:Record<SocialRole,string>={mother:'Mãe',father:'Pai',parent:'Responsável',partner:'Parceria',child:'Filho(a)',friend:'Amizade'};
const englishLabels:Record<SocialRole,string>={mother:'Mother',father:'Father',parent:'Parent',partner:'Partner',child:'Child',friend:'Friend'};
export const personLabel=(role:SocialRole,language:'pt-BR'|'en')=>
 language==='en'?englishLabels[role]:roleLabels[role];
export function personAge(person:SocialPerson,playerAge:number):number {
 return Math.max(0,Math.floor(playerAge-person.bornAtPlayerAge));
}
const sameRegion=(source:CharacterProfile,player:CharacterProfile):CharacterProfile=>
 ({...source,country:player.country,city:player.city});
function addName(original:CharacterProfile,name:string):CharacterProfile {return {...original,name};}
function familyLastName(player:CharacterProfile):string {
 const parts=player.name.trim().split(/\s+/);return parts.length>1?parts[parts.length-1]:'Costa';
}
export function initialSocial(player:CharacterProfile):SocialState {
 const name=familyLastName(player), mother=randomCharacter(),father=randomCharacter();
 return {schema:1,people:[
  {id:'mother-primary',role:'mother',profile:addName(sameRegion({...mother,gender:'woman',skin:player.skin},player),
     mother.name.split(' ')[0]+' '+name),bornAtPlayerAge:-(26+Math.floor(Math.random()*12)),
     closeness:72,alive:true,lastSharedAge:-1},
  {id:'father-primary',role:'father',profile:addName(sameRegion({...father,gender:'man',skin:player.skin},player),
     father.name.split(' ')[0]+' '+name),bornAtPlayerAge:-(27+Math.floor(Math.random()*12)),
     closeness:70,alive:true,lastSharedAge:-1}
 ]};
}
export function normalizeSocial(raw:unknown,player:CharacterProfile,age:number,children=0,legacyParents?:{name:string;kind:'mother'|'father';birthAge:number}[]):SocialState {
 if(!raw||typeof raw!=='object'||(raw as Partial<SocialState>).schema!==1||
    !Array.isArray((raw as Partial<SocialState>).people)) {
   const base=initialSocial(player);
   if(Array.isArray(legacyParents))for(const parent of base.people){
     const previous=legacyParents.find(e=>e?.kind===parent.role);
     if(previous && typeof previous.name==='string' && previous.name.trim()){
       parent.profile={...parent.profile,name:previous.name.trim().slice(0,52)};
       if(Number.isInteger(previous.birthAge)&&previous.birthAge>=18&&previous.birthAge<=70)
         parent.bornAtPlayerAge=-previous.birthAge;
     }
   }
   // Restore old lives where only the number of children was saved.
   for(let i=0;i<Math.min(8,children);i++)base.people.push(makeChild(base,player,Math.max(0,age-4-i*3),i));
   return base;
 }
 const data=raw as SocialState;
 const people:SocialPerson[]=[];
 const used=new Set<string>();
 for(const entry of data.people.slice(0,60)){
   if(!entry||!validId(entry.id)||used.has(entry.id)||!['mother','father','parent','partner','child','friend'].includes(entry.role))continue;
   used.add(entry.id);
   const birth=Number.isInteger(entry.bornAtPlayerAge) && Math.abs(entry.bornAtPlayerAge)<=140?entry.bornAtPlayerAge:0;
   people.push({
     id:entry.id,role:entry.role,profile:normalizeProfile(entry.profile,entry.profile?.name||'Personagem'),
     bornAtPlayerAge:birth,closeness:clamp(Number(entry.closeness)),
     alive:entry.alive!==false,lastSharedAge:Number.isInteger(entry.lastSharedAge)&&entry.lastSharedAge>=-1&&entry.lastSharedAge<=110?entry.lastSharedAge:-1,
     memories:Array.isArray(entry.memories)?entry.memories.slice(-6).filter((m):m is SocialMemory=>
      Boolean(m)&&Number.isInteger(m.age)&&m.age>=0&&m.age<=110&&
      ['talk','gift','help','compliment','argue','invite'].includes(m.kind)&&
      Number.isInteger(m.bondChange)&&m.bondChange>=-40&&m.bondChange<=40):[]
   });
 }
 if(!people.some(p=>p.role==='mother'||p.role==='parent') || !people.some(p=>p.role==='father')){
   const fallback=initialSocial(player);
   for(const parent of fallback.people)if(!people.some(p=>p.role===parent.role))people.push(parent);
 }
 return {schema:1,people};
}
function makeChild(s:SocialState,player:CharacterProfile,playerAge:number,index:number):SocialPerson {
 const partner=s.people.find(p=>p.role==='partner'&&p.alive);
 const sample=randomCharacter();
 const skin=Math.random()<.6?player.skin:(partner?.profile.skin??player.skin);
 const hairColor=Math.random()<.65?player.hairColor:(partner?.profile.hairColor??player.hairColor);
 const eyes=Math.random()<.65?player.eyes:(partner?.profile.eyes??player.eyes);
 const last=familyLastName(player);
 return {id:'child-'+(playerAge+'-'+index),role:'child',
  profile:{...sameRegion(sample,player),skin,hairColor,eyes,name:sample.name.split(' ')[0]+' '+last},
  bornAtPlayerAge:playerAge,closeness:86,alive:true,lastSharedAge:-1};
}
/** Create/destroy named people only when the persistent simulation changes. */
export function syncSocial(state:SocialState,player:CharacterProfile,playerAge:number,
  relationship:'single'|'dating'|'married',children:number,partnerBond:number,friendsBond=0):SocialUpdate {
 const next=state.people.map(p=>({...p})),notes:string[]=[];
 if(relationship!=='single'&&!next.some(p=>p.role==='partner'&&p.alive)){
   const partner= sameRegion(randomCharacter(),player);
   next.push({id:'partner-'+playerAge,role:'partner',profile:partner,
     bornAtPlayerAge:-(Math.max(0,playerAge-18)),closeness:clamp(partnerBond),
     alive:true,lastSharedAge:-1});
   notes.push('partner-introduced');
 }
 if(relationship==='single'&&next.some(p=>p.role==='partner'&&p.alive)){
   for(const p of next)if(p.role==='partner'&&p.alive){p.role='friend';p.closeness=Math.min(p.closeness,20);}
 }
 const existing=next.filter(p=>p.role==='child').length;
 for(let i=existing;i<Math.min(8,children);i++){
   next.push(makeChild({schema:1,people:next},player,playerAge,i));
   notes.push('child-added');
 }
 // Social choices turn global friendship into actual, named people over time.
 // Three milestones can introduce up to three distinct friends.
 if(playerAge>=6){
   const target=[40,65,85].filter(threshold=>friendsBond>=threshold).length;
   let count=next.filter(p=>p.role==='friend'&&p.alive).length;
   while(count<target&&next.length<58){
     const sample=sameRegion(randomCharacter(),player);
     const id='friend-'+playerAge+'-'+count;
     if(next.some(p=>p.id===id))break;
     next.push({id,role:'friend',profile:sample,bornAtPlayerAge:count%3-1,
       closeness:clamp(Math.max(35,Math.round(friendsBond*.72))),alive:true,lastSharedAge:-1});
     notes.push('friend-introduced');count++;
   }
 }
 for(const p of next){
   if(p.role==='partner'&&relationship!=='single')p.closeness=clamp(partnerBond);
   if((p.role==='mother'||p.role==='father')&&p.alive&&personAge(p,playerAge)>=103){
     p.alive=false;p.closeness=0;notes.push('relative-passed');
   }
 }
 return {social:{schema:1,people:next},notes};
}
export function spendSocialTime(state:SocialState,id:string,playerAge:number,amount=12):SocialState {
 return {schema:1,people:state.people.map(person=>person.id===id&&person.alive
   ?{...person,closeness:clamp(person.closeness+amount),lastSharedAge:playerAge}:person)};
}
