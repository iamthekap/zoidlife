import test from 'node:test';
import assert from 'node:assert/strict';
import {initialSocial,normalizeSocial,syncSocial} from '../src/social.ts';
import {canInteract,resolveSocialEncounter,interactionLabel,SOCIAL_KINDS} from '../src/social-interactions.ts';
import {createSimulation} from '../src/simulation.ts';
const profile={name:'Luana Costa',gender:'woman',country:'BR',city:'Recife',
 skin:'tan',hair:'waves',hairColor:'black',eyes:'green',birthday:2,birthMonth:4};
const stats={happiness:60,health:85,smarts:63,looks:58};
test('the six interaction choices are bilingual and available contextually',()=>{
 assert.deepEqual(SOCIAL_KINDS,['talk','compliment','invite','gift','help','argue','reconcile']);
 assert.equal(interactionLabel('compliment','pt-BR'),'Elogiar');
 assert.equal(interactionLabel('argue','en'),'Argue');
 const soc=initialSocial(profile),s=createSimulation(),id='mother-primary';
 assert.equal(canInteract(soc,s,0,id,'talk'),true);
 assert.equal(canInteract(soc,s,0,id,'compliment'),false);
 assert.equal(canInteract(soc,s,5,id,'compliment'),true);
 assert.equal(canInteract(soc,s,7,id,'invite'),false);
 assert.equal(canInteract(soc,{...s,balance:250},9,id,'gift'),true);
 assert.equal(canInteract(soc,s,9,id,'help'),false);
 assert.equal(canInteract(soc,s,14,id,'help'),true);
 assert.equal(canInteract(soc,s,14,id,'reconcile'),false);
});
test('compliments raise target bond and remember exact encounter without changing other NPC',()=>{
 const soc=initialSocial(profile),initial=createSimulation();
 const before=soc.people[0].closeness;
 const event=resolveSocialEncounter(soc,initial,stats,15,'mother-primary','compliment','pt-BR');
 assert.equal(event.ok,true);
 assert.ok(event.social.people[0].closeness>before);
 assert.equal(event.social.people[1].closeness,soc.people[1].closeness);
 assert.equal(event.social.people[0].memories.length,1);
 assert.equal(event.social.people[0].memories[0].kind,'compliment');
 assert.ok(event.notes[0].includes('Luana')===false || event.notes[0].includes(soc.people[0].profile.name));
 assert.equal(event.simulation.actionLedger.socialize,15);
 assert.equal(resolveSocialEncounter(event.social,event.simulation,event.stats,15,'father-primary','talk','pt-BR').ok,false);
 assert.equal(soc.people[0].memories,undefined);
});
test('argument causes bond loss and happiness penalty; no dead-person interaction',()=>{
 const soc=initialSocial(profile),base=createSimulation();
 const event=resolveSocialEncounter(soc,base,stats,18,'father-primary','argue','en');
 assert.equal(event.ok,true);
 assert.ok(event.social.people[1].closeness<soc.people[1].closeness);
 assert.ok(event.stats.happiness<stats.happiness);
 const deceased={...soc,people:soc.people.map(p=>p.id==='father-primary'?{...p,alive:false}:p)};
 assert.equal(resolveSocialEncounter(deceased,base,stats,18,'father-primary','talk','en').ok,false);
});
test('invitation and gift require enough actual balance and never create debt',()=>{
 const soc=initialSocial(profile),base=createSimulation();
 assert.equal(resolveSocialEncounter(soc,base,stats,19,'mother-primary','gift','pt-BR').ok,false);
 const gifted=resolveSocialEncounter(soc,{...base,balance:200},stats,19,'mother-primary','gift','pt-BR');
 assert.equal(gifted.ok,true);assert.equal(gifted.simulation.balance,0);
 assert.equal(gifted.simulation.debt,0);
 const visit=resolveSocialEncounter(soc,{...base,balance:90},stats,19,'mother-primary','invite','en');
 assert.equal(visit.ok,true);assert.equal(visit.simulation.balance,0);
});
test('partner bond survives syncSocial instead of reverting to old aggregate',()=>{
 const withPartner=syncSocial(initialSocial(profile),profile,24,'dating',0,60).social;
 const partner=withPartner.people.find(p=>p.role==='partner');
 const result=resolveSocialEncounter(withPartner,{...createSimulation(),relationship:'dating',partner:60},stats,24,partner.id,'compliment','pt-BR');
 assert.equal(result.ok,true);
 const synced=syncSocial(result.social,profile,24,'dating',0,result.simulation.partner);
 assert.equal(synced.social.people.find(p=>p.role==='partner').closeness,result.social.people.find(p=>p.role==='partner').closeness);
});
test('recent encounters persist through normalized saves and retain limited bounded history',()=>{
 const soc=initialSocial(profile),s=createSimulation();
 const a=resolveSocialEncounter(soc,s,stats,12,'mother-primary','talk','pt-BR');
 const saved=normalizeSocial(a.social,profile,12);
 assert.deepEqual(saved.people[0].memories,a.social.people[0].memories);
 assert.equal(saved.people[0].lastSharedAge,12);
});

test('fighting creates an inter-year reconciliation path, not available immediately or twice',()=>{
 const social=initialSocial(profile),s=createSimulation();
 const dispute=resolveSocialEncounter(social,s,stats,19,'mother-primary','argue','pt-BR');
 assert.equal(dispute.ok,true);
 assert.equal(canInteract(dispute.social,dispute.simulation,19,'mother-primary','reconcile'),false);
 const newYear=resolveSocialEncounter(dispute.social,dispute.simulation,dispute.stats,20,'mother-primary','reconcile','pt-BR');
 assert.equal(newYear.ok,true);
 assert.ok(newYear.social.people[0].closeness>dispute.social.people[0].closeness);
 assert.equal(newYear.social.people[0].memories.at(-1).kind,'reconcile');
 assert.ok(newYear.notes.some(n=>n.includes('confiança')));
 assert.equal(canInteract(newYear.social,newYear.simulation,21,'mother-primary','reconcile'),false);
 const persisted=normalizeSocial(newYear.social,profile,21);
 assert.equal(persisted.people[0].memories.at(-1).kind,'reconcile');
});
