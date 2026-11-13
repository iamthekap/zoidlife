import test from 'node:test';
import assert from 'node:assert/strict';
import {makeLifeReport,reportAsText} from '../src/life-summary.ts';
import {createSimulation} from '../src/simulation.ts';
const stats={happiness:65,health:0,smarts:80,looks:70};
const input={name:'Samira Ferreira',age:83,birthYear:2000,stats,
 simulation:{...createSimulation(),ended:true,job:'retired',education:'college',children:1,
   homeOwned:true,homeValue:200000,debt:28000,balance:47000,investments:5000,experience:33},
 social:{schema:1,people:[{id:'child-1',role:'child',alive:true},{id:'friend-1',role:'friend',alive:true}]},
 history:['0: Nasceu em Salvador.','22: Iniciou uma carreira.','26: Teve um filho.','60: Comprou uma casa.']};
test('end of life compiles only verified state and real history',()=>{
 const report=makeLifeReport(input,'pt-BR');
 assert.equal(report.age,83);assert.equal(report.endYear,2083);
 assert.equal(report.netWorth,224000);
 assert.equal(report.children,1);assert.equal(report.friends,1);
 assert.equal(report.events[0],'Comprou uma casa.');
 assert.ok(report.achievements.includes('Concluiu faculdade'));
 assert.ok(report.achievements.includes('Criou uma família'));
 assert.equal(report.profession,'Aposentado(a)');
});
test('incomplete lives have no invented milestones',()=>{
 const s={...input,age:4,simulation:createSimulation(),social:{schema:1,people:[]},history:[]};
 const report=makeLifeReport(s,'pt-BR');
 assert.deepEqual(report.events,[]);
 assert.deepEqual(report.achievements,[]);
 assert.equal(report.children,0);
});
test('English report translates labels without erasing original player stories',()=>{
 const report=makeLifeReport(input,'en');
 const output=reportAsText(report,'en');
 assert.ok(output.includes('LIFE SUMMARY'));
 assert.ok(output.includes('Net worth'));
 assert.ok(output.includes('Comprou uma casa.'));
 assert.ok(output.includes('Samira Ferreira'));
});
test('financial debt creates negative net worth when warranted',()=>{
 const s={...input,simulation:{...createSimulation(),debt:12000,balance:500}};
 assert.equal(makeLifeReport(s,'pt-BR').netWorth,-11500);
});

test('a life recap never reports future-dated imported events as completed history',()=>{
 const compromised={...input,age:25,history:[
  '0: Nasceu em Salvador.','24: Fez sua primeira viagem.',
  '80: Recebeu um prêmio que nunca conquistou.','110: Construção de patrimônio futuro.'
 ]};
 const recap=makeLifeReport(compromised,'pt-BR');
 assert.ok(recap.events.includes('Fez sua primeira viagem.'));
 assert.ok(!recap.events.some(x=>x.includes('prêmio que nunca')||x.includes('patrimônio futuro')));
});

test('earned hobbies appear in the final report, while unused paths generate no fake achievements',()=>{
 const s={...createSimulation(),ended:true};
 s.hobbies.music={xp:100,awards:4,lastAge:65};
 s.hobbies.coding={xp:37,awards:1,lastAge:48};
 s.hobbies.sports={xp:18,awards:0,lastAge:22};
 const pt=makeLifeReport({...input,simulation:s},'pt-BR');
 assert.ok(pt.achievements.some(a=>a.includes('Talento desenvolvido: Música · 4 conquistas')));
 assert.ok(pt.achievements.some(a=>a.includes('Domínio completo: Música')));
 assert.ok(pt.achievements.some(a=>a.includes('Programação · 1 conquista')));
 assert.ok(!pt.achievements.some(a=>a.includes('Esporte')));
 const en=makeLifeReport({...input,simulation:s},'en');
 assert.ok(reportAsText(en,'en').includes('Developed talent: Music · 4 awards'));
 assert.ok(reportAsText(en,'en').includes('Mastered: Music'));
});

test('earned travel memories are counted by real distinct places without claiming a future journey',()=>{
 const s={...createSimulation(),travel:{lastAge:39,visits:[
   {id:'coast',age:23},{id:'history',age:33},{id:'history',age:39}
 ]}};
 const pt=makeLifeReport({...input,age:35,simulation:s},'pt-BR');
 assert.ok(pt.achievements.includes('Descobriu novos destinos: 2'));
 assert.ok(pt.achievements.includes('Última viagem: Circuito histórico'));
 const en=makeLifeReport({...input,age:35,simulation:s},'en');
 assert.ok(en.achievements.includes('Explored destinations: 2'));
 assert.ok(en.achievements.includes('Latest journey: Historic circuit'));
 const early=makeLifeReport({...input,age:18,simulation:s},'pt-BR');
 assert.ok(!early.achievements.some(a=>a.includes('destinos')||a.includes('viagem')));
});

test('end-of-life report names only pets truly adopted by that age',()=>{
 const s={...createSimulation(),pets:{schema:1,nextId:3,lastAdoptionAge:50,pets:[
  {id:'pet-1',species:'cat',name:'Luna',adoptedAt:20,ageYears:4,
   affection:85,energy:80,lastCareAge:24,lastUpdatedAge:24,alive:true},
  {id:'pet-2',species:'dog',name:'Rex',adoptedAt:50,ageYears:2,
   affection:60,energy:70,lastCareAge:52,lastUpdatedAge:52,alive:false}
 ]}};
 const early=makeLifeReport({...input,age:25,simulation:s},'pt-BR');
 assert.ok(early.achievements.includes('Acolheu animais: 1'));
 assert.ok(early.achievements.some(a=>a.includes('Luna (Gato)')));
 assert.ok(!early.achievements.some(a=>a.includes('Rex')));
 const old=makeLifeReport({...input,age:80,simulation:s},'en');
 assert.ok(old.achievements.includes('Adopted companions: 2'));
 assert.ok(old.achievements.some(a=>a.includes('Luna (Cat)')));
 assert.ok(!old.achievements.some(a=>a.includes('Rex (Dog)')));
});
