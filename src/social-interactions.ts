/** Original role-aware, age-gated relationship encounters.
 * One social action per game year across all NPCs. Fully deterministic, offline.
 */
import type {SocialState,SocialRole,SocialInteractionKind,SocialMemory} from './social.ts';
import type {Simulation,Stats} from './simulation.ts';
import {takeAction,canTakeAction} from './simulation.ts';
export type Lang='pt-BR'|'en';
export const SOCIAL_KINDS: readonly SocialInteractionKind[]=['talk','compliment','invite','gift','help','argue','reconcile'];
const bounds=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
const definitions:Record<SocialInteractionKind,{age:number;cost:number;delta:number;happiness:number;
  label:[string,string];verb:[string,string]}> = {
 talk:{age:0,cost:0,delta:12,happiness:0,label:['Conversar','Talk'],verb:['conversou com','talked to']},
 compliment:{age:4,cost:0,delta:15,happiness:2,label:['Elogiar','Compliment'],verb:['elogiou','complimented']},
 invite:{age:6,cost:90,delta:18,happiness:3,label:['Convidar','Invite out'],verb:['convidou para passear','invited out']},
 gift:{age:8,cost:200,delta:22,happiness:2,label:['Presentear','Give gift'],verb:['presenteou','gave a gift to']},
 help:{age:12,cost:0,delta:17,happiness:1,label:['Ajudar','Help'],verb:['ajudou','helped']},
 argue:{age:6,cost:0,delta:-20,happiness:-11,label:['Discutir','Argue'],verb:['discutiu com','argued with']},
 reconcile:{age:6,cost:0,delta:24,happiness:4,label:['Fazer as pazes','Make amends'],verb:['fez as pazes com','made amends with']}
};
export function interactionLabel(kind:SocialInteractionKind,language:Lang):string{
 return definitions[kind].label[language==='en'?1:0];
}
export function interactionCost(kind:SocialInteractionKind):number{return definitions[kind].cost;}
export function canInteract(social:SocialState,s:Simulation,age:number,id:string,kind:SocialInteractionKind):boolean{
 const def=definitions[kind];
 const target=social.people.find(x=>x.id===id);
 if(!def||!target||!target.alive||age<def.age||s.balance<def.cost||!canTakeAction(s,age,'socialize'))
   return false;
 if(kind==='reconcile'){
   const memories=target.memories??[];
   const argument=[...memories].reverse().find(m=>m.kind==='argue');
   const peace=[...memories].reverse().find(m=>m.kind==='reconcile');
   return !!argument&&argument.age<age&&(!peace||peace.age<argument.age);
 }
 return true;
}
export type SocialEncounter={
 ok:boolean;social:SocialState;simulation:Simulation;stats:Stats;
 label?:string;bondChange?:number;notes?:string[];
};
export function resolveSocialEncounter(social:SocialState,s:Simulation,stats:Stats,
 age:number,id:string,kind:SocialInteractionKind,language:Lang):SocialEncounter {
 if(!canInteract(social,s,age,id,kind))
  return {ok:false,social,simulation:s,stats};
 const person=social.people.find(p=>p.id===id)!;
 const def=definitions[kind];
 const attempt=takeAction(s,stats,age,'socialize');
 if(!attempt.ok)return {ok:false,social,simulation:s,stats};
 const context=person.role==='child'&&age-person.bornAtPlayerAge<=10?2:
  person.closeness>=80?3:person.closeness<=25?-3:0;
 const bondChange=kind==='argue'?-20+(context===3?2:0):def.delta+context;
 const newBond=bounds(person.closeness+bondChange);
 const memory:SocialMemory={age,kind,bondChange:newBond-person.closeness};
 const updated:SocialState={...social,people:social.people.map(p=>p.id!==id?p:{
  ...p,closeness:newBond,lastSharedAge:age,memories:[...(p.memories??[]),memory].slice(-6)})};
 // Social totals track the chosen relationship. Partner's value is synchronized
 // to the actual NPC after an encounter, avoiding an overwritten bond.
 const simulation:Simulation={...attempt.state,balance:attempt.state.balance-def.cost};
 const role:SocialRole=person.role;
 if(role==='partner')simulation.partner=newBond;
 else if(role==='friend')simulation.friends=bounds(simulation.friends+
   (kind==='argue'?-14:kind==='compliment'?7:kind==='invite'?9:kind==='gift'?6:kind==='help'?5:kind==='reconcile'?9:0));
 else simulation.family=bounds(simulation.family+
   (kind==='argue'?-19:kind==='compliment'?7:kind==='invite'?8:kind==='gift'?6:kind==='help'?6:kind==='reconcile'?10:0));
 const updatedStats:Stats={...attempt.stats,happiness:bounds(attempt.stats.happiness+def.happiness),
  health:bounds(attempt.stats.health+(kind==='help'?-2:kind==='invite'?1:0))};
 const pt=language==='pt-BR',name=person.profile.name;
 const narrative=(pt?'Você ':'You ')+def.verb[pt?0:1]+' '+name+'.';
 const notes=[narrative];
 if(kind==='argue'&&newBond<=20)notes.push(pt?'A relação ficou abalada.':'The relationship is strained.');
 else if(kind==='reconcile')notes.push(pt?'Vocês decidiram reconstruir a confiança.':'You decided to rebuild trust.');
 else if(kind!=='argue'&&newBond>=85)notes.push(pt?'Os laços ficaram mais fortes.':'Your bond grew stronger.');
 return {ok:true,social:updated,simulation,stats:updatedStats,
  label:narrative,bondChange:memory.bondChange,notes};
}
export function recentSocialMemory(social:SocialState,id:string):SocialMemory|null{
 return social.people.find(p=>p.id===id)?.memories?.at(-1)??null;
}
