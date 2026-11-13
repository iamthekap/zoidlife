import test from 'node:test';
import assert from 'node:assert/strict';
import {milestonesUntil,readHistory,storyboardPanel,renderStoryboardTimeline,currentStoryboardStage} from '../src/storyboard.ts';
const profile={name:'Samira Costa',country:'BR',city:'Salvador',gender:'woman',skin:'deep',hair:'curls',hairColor:'black',eyes:'green',birthday:5,birthMonth:9};
test('timeline unlocks only lived phases and preserves chronology',()=>{
 assert.deepEqual(milestonesUntil(0,[], 'pt-BR').map(m=>m.stage),['baby']);
 assert.deepEqual(milestonesUntil(3,[], 'pt-BR').map(m=>m.stage),['baby','child']);
 assert.deepEqual(milestonesUntil(12,[], 'pt-BR').map(m=>m.stage),['baby','child','teen']);
 assert.deepEqual(milestonesUntil(18,[], 'pt-BR').map(m=>m.stage),['baby','child','teen','adult']);
 assert.deepEqual(milestonesUntil(65,[], 'pt-BR').map(m=>m.stage),['baby','child','teen','adult','senior']);
 assert.equal(currentStoryboardStage(65),'senior');
});
test('storyboards summarize actual history instead of fabricated future events',()=>{
 const h=['Você nasceu em Salvador.','4: Entrou em uma nova escola.','8: Fez amizade com Tiago.','14: Começou um novo curso.'];
 const parts=milestonesUntil(15,h,'pt-BR');
 assert.equal(parts[0].summary,'Você nasceu em Salvador.');
 assert.equal(parts[1].summary,'Fez amizade com Tiago.');
 assert.equal(parts[2].summary,'Começou um novo curso.');
 assert.equal(parts.length,3);
 assert.equal(parts.some(p=>p.stage==='adult'),false);
});
test('legacy birth lines without age prefixes are preserved',()=>{
 assert.deepEqual(readHistory('Nasceu na cidade.'),{age:0,text:'Nasceu na cidade.'});
 assert.deepEqual(readHistory('18: Começou a trabalhar.'),{age:18,text:'Começou a trabalhar.'});
 assert.equal(readHistory('130: valor inválido'),null);
});
test('each phase draws a distinct pixel environment around the same identity',()=>{
 for(const stage of ['baby','child','teen','adult','senior']){
   const s=storyboardPanel(profile,stage,'pt-BR');
   assert.ok(s.includes('storyboard-scene-'+stage));
   assert.ok(s.includes('storyboard-scenery'));
   assert.ok(s.includes('storyboard-actor'));
   assert.ok(s.includes('storyboard-foreground'));
   assert.ok(s.includes('stage-'+stage));
   assert.ok(!s.includes('data-part="background"'));
 }
});
test('rendered timeline is escaped and mobile-safe html',()=>{
 const html=renderStoryboardTimeline(profile,18,['0: <img onerror=alert(1)>','18: "Evento"'],'pt-BR');
 assert.equal((html.match(/class="storyboard-milestone/g)||[]).length,4);
 assert.ok(html.includes('&lt;img onerror=alert(1)&gt;'));
 assert.ok(!html.includes('<img onerror'));
 assert.ok(!html.includes('storyboard-senior '));
 assert.ok(html.indexOf('data-stage="adult"')<html.indexOf('data-stage="baby"'));
});
test('timeline localizes labels without rewriting user history',()=>{
 const html=renderStoryboardTimeline(profile,5,['4: A primeira prova.'],'en');
 assert.ok(html.includes('Life chapters'));
 assert.ok(html.includes('Child'));
 assert.ok(html.includes('A primeira prova.'));
});

test('long real lives keep earliest stage-specific memories despite thousands of newer events',()=>{
 const history=['0: Primeiros dias em Recife.'];
 for(let i=0;i<750;i++)history.push('25: Registro profissional '+i+'.');
 history.push('69: Visitou a família.');
 history.push('99: Este acontecimento ainda não aconteceu.');
 const chapters=milestonesUntil(70,history,'pt-BR');
 assert.equal(chapters.find(x=>x.stage==='baby')?.summary,'Primeiros dias em Recife.');
 assert.equal(chapters.find(x=>x.stage==='adult')?.summary,'Registro profissional 749.');
 assert.equal(chapters.find(x=>x.stage==='senior')?.summary,'Visitou a família.');
 assert.ok(chapters.every(x=>!x.summary.includes('ainda não aconteceu')));
});
