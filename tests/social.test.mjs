import test from 'node:test';
import assert from 'node:assert/strict';
import {initialSocial,normalizeSocial,syncSocial,personAge,spendSocialTime} from '../src/social.ts';
const player={name:'Alex Costa',country:'BR',city:'Recife',gender:'nonbinary',
 skin:'brown',hair:'waves',hairColor:'black',eyes:'brown',birthday:1,birthMonth:4};
test('every newborn has two named living parents with believable ages',()=>{
 const state=initialSocial(player);
 assert.equal(state.people.length,2);
 assert.deepEqual(state.people.map(p=>p.role),['mother','father']);
 for(const p of state.people){
  assert.ok(personAge(p,0)>=26&&personAge(p,0)<=38);
  assert.ok(p.profile.name.endsWith('Costa'));
  assert.equal(p.alive,true);
 }
});
test('a relationship adds exactly one unique persistent partner',()=>{
 const base=initialSocial(player);
 const first=syncSocial(base,player,21,'dating',0,60);
 const second=syncSocial(first.social,player,22,'married',0,88);
 assert.equal(first.social.people.filter(p=>p.role==='partner').length,1);
 assert.equal(second.social.people.filter(p=>p.role==='partner').length,1);
 assert.equal(second.social.people.find(p=>p.role==='partner').closeness,88);
});
test('children keep the protagonist family name and age naturally',()=>{
 const initial=initialSocial(player);
 const once=syncSocial(initial,player,24,'dating',1,65);
 const after=syncSocial(once.social,player,27,'married',2,88);
 const kids=after.social.people.filter(p=>p.role==='child');
 assert.equal(kids.length,2);
 assert.ok(kids.every(p=>p.profile.name.endsWith('Costa')));
 assert.equal(personAge(kids[0],30),6);
 assert.equal(personAge(kids[1],30),3);
 assert.equal(syncSocial(after.social,player,31,'married',2,90).social.people.filter(p=>p.role==='child').length,2);
});
test('old saves migrate without corrupting child counts',()=>{
 const migrated=normalizeSocial(null,player,38,2);
 assert.equal(migrated.people.filter(p=>p.role==='child').length,2);
 assert.equal(migrated.people.filter(p=>p.role==='mother').length,1);
});
test('family time adds bond and each person has an independent history',()=>{
 const base=initialSocial(player);
 const mother=base.people[0];
 const next=spendSocialTime(base,mother.id,12);
 assert.equal(next.people[0].closeness,Math.min(100,mother.closeness+12));
 assert.equal(next.people[0].lastSharedAge,12);
 assert.equal(next.people[1].closeness,base.people[1].closeness);
});
test('old parent can pass naturally but is not removed from history',()=>{
 const base=initialSocial(player);
 const older=syncSocial(base,player,110,'single',0,0);
 assert.equal(older.social.people.filter(p=>['mother','father'].includes(p.role)).length,2);
 assert.ok(older.social.people.filter(p=>['mother','father'].includes(p.role)).every(p=>!p.alive));
});
test('garbage social records are rejected',()=>{
 const bad={schema:1,people:[{id:'bad<script>',role:'mother',profile:player,bornAtPlayerAge:-32,closeness:300,alive:true}]};
 const result=normalizeSocial(bad,player,10);
 assert.equal(result.people.some(p=>p.id==='bad<script>'),false);
 assert.equal(result.people.filter(p=>p.role==='mother').length,1);
});

test('migration honors existing legacy parent names and ages',()=>{
 const previous=[
  {kind:'mother',name:'Ana Costa',birthAge:33},
  {kind:'father',name:'Daniel Costa',birthAge:36}
 ];
 const state=normalizeSocial(null,player,16,0,previous);
 assert.equal(state.people[0].profile.name,'Ana Costa');
 assert.equal(state.people[1].profile.name,'Daniel Costa');
 assert.equal(personAge(state.people[0],16),49);
});
test('after a breakup a later relationship introduces a different partner',()=>{
 const before=syncSocial(initialSocial(player),player,23,'dating',0,70);
 const after=syncSocial(before.social,player,25,'single',0,0);
 const next=syncSocial(after.social,player,29,'dating',0,55);
 assert.equal(next.social.people.filter(p=>p.role==='partner').length,1);
 assert.equal(next.social.people.filter(p=>p.role==='friend').length,1);
});

test('friendship milestones create persistent named friends with consistent local identity',()=>{
 const fresh=initialSocial(player);
 const first=syncSocial(fresh,player,12,'single',0,0,42);
 const friends=first.social.people.filter(p=>p.role==='friend');
 assert.equal(friends.length,1);
 assert.equal(friends[0].profile.city,player.city);
 assert.equal(friends[0].profile.country,player.country);
 assert.equal(first.notes.includes('friend-introduced'),true);
 const again=syncSocial(first.social,player,13,'single',0,0,42);
 assert.equal(again.social.people.filter(p=>p.role==='friend').length,1);
 const advanced=syncSocial(again.social,player,20,'single',0,0,90);
 assert.equal(advanced.social.people.filter(p=>p.role==='friend').length,3);
 assert.equal(new Set(advanced.social.people.map(p=>p.id)).size,advanced.social.people.length);
});
test('different social actions change one person without replacing anybody else',()=>{
 const initial=initialSocial(player);
 const first=initial.people[0],other=initial.people[1];
 const gifted=spendSocialTime(initial,first.id,10,22);
 assert.equal(gifted.people[0].closeness,Math.min(100,first.closeness+22));
 assert.equal(gifted.people[1].closeness,other.closeness);
 assert.equal(gifted.people[0].lastSharedAge,10);
});

test('normalized relationship memories survive save migration but invalid records do not',()=>{
 const social=initialSocial(player);
 social.people[0].memories=[
  {age:13,kind:'compliment',bondChange:12},
  {age:13,kind:'<script>',bondChange:999}
 ];
 const loaded=normalizeSocial(social,player,15);
 assert.deepEqual(loaded.people[0].memories,[{age:13,kind:'compliment',bondChange:12}]);
 assert.equal(loaded.people[1].memories?.length,0);
});
