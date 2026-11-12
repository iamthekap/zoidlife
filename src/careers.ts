/** Distinct, original careers for the Zoid Life simulation. */
import type {Job,Education,Simulation} from './simulation.ts';
export type OccupationId='barista'|'retail'|'courier'|'assistant'|'designer'|'developer'|'nurse'|'teacher'|'manager'|'engineer'|'founder';
export type Career={id:OccupationId;job:Job;salary:number;age:number;education:Education;credits:number;xp:number;capital:number;stress:number;pt:string;en:string};
export const CAREERS:readonly Career[]=[
 {id:'barista',job:'parttime',salary:6500,age:16,education:'none',credits:0,xp:0,capital:0,stress:1,pt:'Barista',en:'Barista'},
 {id:'retail',job:'service',salary:17200,age:18,education:'none',credits:0,xp:0,capital:0,stress:2,pt:'Vendedor(a)',en:'Retail associate'},
 {id:'courier',job:'service',salary:19600,age:18,education:'none',credits:0,xp:0,capital:0,stress:4,pt:'Entregador(a)',en:'Delivery courier'},
 {id:'assistant',job:'office',salary:27300,age:18,education:'secondary',credits:0,xp:0,capital:0,stress:2,pt:'Assistente administrativo',en:'Office assistant'},
 {id:'designer',job:'office',salary:29600,age:18,education:'secondary',credits:5,xp:0,capital:0,stress:2,pt:'Designer',en:'Designer'},
 {id:'developer',job:'professional',salary:52500,age:20,education:'college',credits:12,xp:0,capital:0,stress:3,pt:'Desenvolvedor(a)',en:'Software developer'},
 {id:'nurse',job:'professional',salary:46200,age:20,education:'college',credits:12,xp:0,capital:0,stress:5,pt:'Enfermeiro(a)',en:'Nurse'},
 {id:'teacher',job:'professional',salary:41000,age:20,education:'college',credits:12,xp:0,capital:0,stress:3,pt:'Professor(a)',en:'Teacher'},
 {id:'manager',job:'professional',salary:63500,age:23,education:'college',credits:10,xp:4,capital:0,stress:5,pt:'Gerente',en:'Manager'},
 {id:'engineer',job:'professional',salary:60100,age:21,education:'college',credits:14,xp:1,capital:0,stress:4,pt:'Engenheiro(a)',en:'Engineer'},
 {id:'founder',job:'professional',salary:35000,age:22,education:'secondary',credits:8,xp:2,capital:12000,stress:6,pt:'Empreendedor(a)',en:'Entrepreneur'}
];
const edu:Record<Education,number>={none:0,school:0,secondary:1,college:2};
export function careerById(raw:unknown):Career|null{
 return typeof raw==='string'?CAREERS.find(c=>c.id===raw)??null:null;
}
export function careerAvailable(s:Simulation,age:number,role:Career):boolean{
 return !s.ended&&Number.isInteger(age)&&age>=role.age&&age<65&&
 (s.justice?.incarceratedUntil??0)<=age&&edu[s.education]>=edu[role.education]&&
 s.credits>=role.credits&&s.experience>=role.xp&&s.balance>=role.capital;
}
export function careerLabel(role:Career,language:'pt-BR'|'en'):string{
 return language==='en'?role.en:role.pt;
}
export function careerRequirements(role:Career,language:'pt-BR'|'en'):string{
 const items:string[]=[];
 if(role.education==='secondary')items.push(language==='en'?'Secondary diploma':'Ensino médio');
 if(role.education==='college')items.push(language==='en'?'College degree':'Ensino superior');
 if(role.credits)items.push((language==='en'?'Study points ':'Pontos de estudo ')+role.credits);
 if(role.xp)items.push((language==='en'?'Experience ':'Experiência ')+role.xp);
 if(role.capital)items.push((language==='en'?'Capital ':'Capital ')+role.capital);
 return items.join(' · ')||(language==='en'?'No formal degree required':'Sem diploma obrigatório');
}
