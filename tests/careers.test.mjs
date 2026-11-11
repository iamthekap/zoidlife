import test from 'node:test';
import assert from 'node:assert/strict';
import {CAREERS,careerById,careerAvailable,careerLabel} from '../src/careers.ts';
import {createSimulation,loadSimulation,applyCareer,annualSalary,passYear} from '../src/simulation.ts';
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
