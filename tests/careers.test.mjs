import test from 'node:test';
import assert from 'node:assert/strict';
import {CAREERS,careerById,careerAvailable,careerLabel} from '../src/careers.ts';
import {createSimulation,loadSimulation,applyCareer,annualSalary,passYear,takeAction,selectStudyTrack} from '../src/simulation.ts';
const stats={happiness:70,health:82,smarts:75,looks:60};
test('every job has a unique identifier, a salary and a translated name',()=>{
 assert.equal(new Set(CAREERS.map(x=>x.id)).size,CAREERS.length);
 assert.ok(CAREERS.length>=10);
 assert.ok(CAREERS.every(x=>x.salary>0 && x.pt && x.en));
 assert.equal(careerById('does-not-exist'),null);
 assert.equal(careerLabel(careerById('nurse'),'pt-BR'),'Enfermeiro(a)');
});
test('age, education, credits and capital enforce actual eligibility',()=>{
 const basic=createSimulation();
 assert.equal(careerAvailable(basic,15,careerById('barista')),false);
 assert.equal(careerAvailable(basic,16,careerById('barista')),true);
 assert.equal(careerAvailable(basic,20,careerById('developer')),false);
 const skilled={...basic,education:'college',credits:12};
 assert.equal(careerAvailable(skilled,20,careerById('developer')),true);
 const founder={...skilled,experience:3,balance:14000};
 assert.equal(careerAvailable(founder,23,careerById('founder')),true);
 assert.equal(careerAvailable({...founder,balance:300},23,careerById('founder')),false);
});
test('a successful application persists the occupation and its distinct salary',()=>{
 const before={...createSimulation(),education:'college',credits:20};
 const hired=applyCareer(before,stats,25,'developer');
 assert.equal(hired.ok,true);
 assert.equal(hired.state.job,'professional');
 assert.equal(hired.state.occupation,'developer');
 assert.equal(hired.state.actionLedger.job,25);
 assert.equal(annualSalary(hired.state),52500+360);
 assert.equal(passYear(hired.state,hired.stats,26).state.occupation,'developer');
 assert.equal(testsSafe(hired.state),true);
});
function testsSafe(s){return s.balance>=0&&s.debt>=0;}
test('cannot apply twice in the same year or fake qualifications',()=>{
 const before=createSimulation();
 assert.equal(applyCareer(before,stats,16,'developer').ok,false);
 const first=applyCareer(before,stats,18,'retail');
 assert.equal(first.ok,true);
 assert.equal(applyCareer(first.state,first.stats,18,'courier').ok,false);
 assert.equal(applyCareer(first.state,first.stats,19,'courier').ok,true);
});
test('existing saves without occupations retain their original wage category',()=>{
 const saved={...createSimulation(),job:'office',experience:2};
 delete saved.occupation;
 const migrated=loadSimulation(JSON.parse(JSON.stringify(saved)));
 assert.equal(migrated.occupation,null);
 assert.equal(annualSalary(migrated),26000+720);
});
test('startup capital is paid once, then salary reflects entrepreneurial work',()=>{
 const s={...createSimulation(),education:'secondary',credits:12,experience:3,balance:15000};
 const result=applyCareer(s,stats,24,'founder');
 assert.equal(result.ok,true);
 assert.equal(result.state.balance,3000);
 assert.equal(result.state.occupation,'founder');
 assert.ok(annualSalary(result.state)>35000);
});

test('work effort unlocks promotions and increasing annual pay over multiple years',()=>{
 let state={...createSimulation(),job:'professional',occupation:'doctor',experience:3};
 const stats={happiness:75,health:95,smarts:82,looks:60};
 const baseline=annualSalary(state);
 state=takeAction(state,stats,30,'work').state;
 const first=passYear(state,stats,31);
 state=takeAction(first.state,first.stats,31,'work').state;
 const result=passYear(state,stats,32);
 assert.equal(result.state.careerLevel,1);
 assert.ok(annualSalary(result.state)>baseline);
 assert.ok(result.notes.some(n=>n.startsWith('career-promotion:')));
});
test('a sports season cannot award a victory without earned training',()=>{
 const base={...createSimulation(),job:'professional',occupation:'footballer'};
 const stats={health:95,happiness:70,smarts:60,looks:55};
 assert.equal(passYear(base,stats,22).state.sportsVictories,0);
 let wins=0;
 for(let age=19;age<35;age++){
  const result=passYear({...base,training:80,careerMomentum:21},stats,age);
  wins+=result.state.sportsVictories;
 }
 assert.ok(wins>0);
});

test('medical, legal and science professions require corresponding academic tracks',()=>{
 const s={...createSimulation(),age:28,education:'college',credits:50,experience:12};
 assert.equal(careerAvailable(s,28,careerById('doctor')),false);
 assert.equal(careerAvailable({...s,studyTrack:'medicine'},28,careerById('doctor')),true);
 assert.equal(careerAvailable({...s,studyTrack:'law'},28,careerById('lawyer')),true);
 assert.equal(careerAvailable({...s,studyTrack:'medicine'},28,careerById('lawyer')),false);
 assert.equal(careerAvailable({...s,studyTrack:'science'},28,careerById('scientist')),true);
 assert.equal(careerAvailable({...s,studyTrack:'general'},28,careerById('developer')),true);
});
test('study specialization is limited by education, age and annual cooldown and persists',()=>{
 const seed={...createSimulation(),education:'college',credits:20};
 assert.equal(selectStudyTrack(seed,stats,17,'medicine').ok,false);
 const result=selectStudyTrack(seed,stats,20,'medicine');
 assert.equal(result.ok,true);
 assert.equal(result.state.studyTrack,'medicine');
 assert.equal(result.state.actionLedger.study,20);
 assert.equal(selectStudyTrack(result.state,result.stats,20,'law').ok,false);
 assert.equal(loadSimulation(result.state).studyTrack,'medicine');
 assert.equal(loadSimulation({...seed,studyTrack:'<script>'}).studyTrack,'general');
 const switched=selectStudyTrack(result.state,result.stats,21,'law');
 assert.equal(switched.ok,true);
 assert.equal(switched.state.studyTrack,'law');
});
