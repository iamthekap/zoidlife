/** Distinct, original careers for the Zoid Life simulation. */
import type {Job,Education,Simulation} from './simulation.ts';
import type {CharacterProfile} from './characters.ts';
export type OccupationId='barista'|'retail'|'courier'|'assistant'|'designer'|'developer'|'nurse'|'teacher'|'manager'|'engineer'|'founder'|'paramedic'|'chef'|'police'|'firefighter'|'mechanic'|'pilot'|'musician'|'actor'|'journalist'|'photographer'|'architect'|'accountant'|'psychologist'|'dentist'|'doctor'|'surgeon'|'lawyer'|'judge'|'scientist'|'pharmacist'|'veterinarian'|'footballer'|'basketballer'|'athlete'|'trainer'|'coach'|'streamer'|'influencer'|'investor'|'politician'|'diplomat'|'arcane-healer'|'night-healer'|'moon-guardian';
export type Career={id:OccupationId;job:Job;salary:number;age:number;education:Education;credits:number;xp:number;capital:number;stress:number;pt:string;en:string;training?:number;nature?:'vampire'|'mage'|'werewolf';mastery?:number};
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
 {id:'founder',job:'professional',salary:35000,age:22,education:'secondary',credits:8,xp:2,capital:12000,stress:6,pt:'Empreendedor(a)',en:'Entrepreneur'},
 {id:'paramedic',job:'service',salary:27800,age:19,education:'secondary',credits:5,xp:1,capital:0,stress:3,pt:'Socorrista',en:'Paramedic'},
 {id:'chef',job:'professional',salary:39000,age:21,education:'secondary',credits:9,xp:2,capital:0,stress:4,pt:'Chef de cozinha',en:'Chef'},
 {id:'police',job:'professional',salary:36000,age:21,education:'secondary',credits:10,xp:2,capital:0,stress:4,pt:'Policial',en:'Police officer',training:8},
 {id:'firefighter',job:'professional',salary:37800,age:21,education:'secondary',credits:10,xp:2,capital:0,stress:5,pt:'Bombeiro(a)',en:'Firefighter',training:14},
 {id:'mechanic',job:'service',salary:32000,age:18,education:'secondary',credits:5,xp:1,capital:0,stress:3,pt:'Mecânico(a)',en:'Mechanic'},
 {id:'pilot',job:'professional',salary:94000,age:25,education:'college',credits:26,xp:3,capital:0,stress:5,pt:'Piloto(a) de aviação',en:'Airline pilot'},
 {id:'musician',job:'professional',salary:51000,age:20,education:'secondary',credits:8,xp:1,capital:0,stress:4,pt:'Músico(a)',en:'Musician'},
 {id:'actor',job:'professional',salary:48000,age:20,education:'secondary',credits:8,xp:1,capital:0,stress:4,pt:'Ator/Atriz',en:'Actor'},
 {id:'journalist',job:'professional',salary:42000,age:21,education:'college',credits:13,xp:1,capital:0,stress:3,pt:'Jornalista',en:'Journalist'},
 {id:'photographer',job:'office',salary:35000,age:18,education:'secondary',credits:7,xp:0,capital:1800,stress:2,pt:'Fotógrafo(a)',en:'Photographer'},
 {id:'architect',job:'professional',salary:61000,age:22,education:'college',credits:18,xp:2,capital:0,stress:3,pt:'Arquiteto(a)',en:'Architect'},
 {id:'accountant',job:'professional',salary:50500,age:21,education:'college',credits:17,xp:1,capital:0,stress:3,pt:'Contador(a)',en:'Accountant'},
 {id:'psychologist',job:'professional',salary:62000,age:23,education:'college',credits:23,xp:2,capital:0,stress:4,pt:'Psicólogo(a)',en:'Psychologist'},
 {id:'dentist',job:'professional',salary:85000,age:25,education:'college',credits:26,xp:2,capital:0,stress:3,pt:'Dentista',en:'Dentist'},
 {id:'doctor',job:'professional',salary:97000,age:26,education:'college',credits:28,xp:3,capital:0,stress:5,pt:'Médico(a)',en:'Physician'},
 {id:'surgeon',job:'professional',salary:160000,age:32,education:'college',credits:40,xp:8,capital:0,stress:7,pt:'Cirurgião/Cirurgiã',en:'Surgeon'},
 {id:'lawyer',job:'professional',salary:78000,age:24,education:'college',credits:24,xp:2,capital:0,stress:5,pt:'Advogado(a)',en:'Lawyer'},
 {id:'judge',job:'professional',salary:140000,age:35,education:'college',credits:34,xp:12,capital:0,stress:6,pt:'Juiz(a)',en:'Judge'},
 {id:'scientist',job:'professional',salary:82000,age:24,education:'college',credits:25,xp:2,capital:0,stress:4,pt:'Pesquisador(a) científico(a)',en:'Research scientist'},
 {id:'pharmacist',job:'professional',salary:66000,age:24,education:'college',credits:24,xp:2,capital:0,stress:4,pt:'Farmacêutico(a)',en:'Pharmacist'},
 {id:'veterinarian',job:'professional',salary:74000,age:24,education:'college',credits:24,xp:2,capital:0,stress:5,pt:'Veterinário(a)',en:'Veterinarian'},
 {id:'footballer',job:'professional',salary:91000,age:18,education:'secondary',credits:6,xp:0,capital:0,stress:6,pt:'Jogador(a) de futebol',en:'Football player',training:35},
 {id:'basketballer',job:'professional',salary:85000,age:18,education:'secondary',credits:6,xp:0,capital:0,stress:6,pt:'Jogador(a) de basquete',en:'Basketball player',training:35},
 {id:'athlete',job:'professional',salary:71000,age:18,education:'secondary',credits:5,xp:0,capital:0,stress:6,pt:'Atleta profissional',en:'Professional athlete',training:32},
 {id:'trainer',job:'professional',salary:39500,age:20,education:'secondary',credits:8,xp:1,capital:0,stress:3,pt:'Preparador(a) físico(a)',en:'Fitness trainer',training:22},
 {id:'coach',job:'professional',salary:65000,age:30,education:'secondary',credits:14,xp:8,capital:0,stress:4,pt:'Treinador(a) esportivo(a)',en:'Sports coach',training:23},
 {id:'streamer',job:'professional',salary:46000,age:18,education:'secondary',credits:5,xp:0,capital:4000,stress:4,pt:'Criador(a) de conteúdo',en:'Content creator'},
 {id:'influencer',job:'professional',salary:42000,age:18,education:'secondary',credits:5,xp:0,capital:2000,stress:3,pt:'Influenciador(a)',en:'Influencer'},
 {id:'investor',job:'professional',salary:74000,age:24,education:'secondary',credits:11,xp:3,capital:25000,stress:6,pt:'Investidor(a) profissional',en:'Professional investor'},
 {id:'politician',job:'professional',salary:79500,age:28,education:'college',credits:22,xp:6,capital:10000,stress:6,pt:'Político(a)',en:'Politician'},
 {id:'diplomat',job:'professional',salary:91000,age:27,education:'college',credits:26,xp:5,capital:0,stress:5,pt:'Diplomata',en:'Diplomat'},
 {id:'arcane-healer',job:'professional',salary:116000,age:24,education:'college',credits:16,xp:3,capital:0,stress:5,pt:'Curandeiro(a) arcano(a)',en:'Arcane healer',nature:'mage',mastery:22},
 {id:'night-healer',job:'professional',salary:108000,age:24,education:'college',credits:16,xp:3,capital:0,stress:5,pt:'Médico(a) noturno(a)',en:'Night healer',nature:'vampire',mastery:22},
 {id:'moon-guardian',job:'professional',salary:88000,age:22,education:'secondary',credits:12,xp:2,capital:0,stress:6,pt:'Guardião(ã) lunar',en:'Moon guardian',training:22,nature:'werewolf',mastery:20}
];
const edu:Record<Education,number>={none:0,school:0,secondary:1,college:2};
export function careerById(raw:unknown):Career|null{
 return typeof raw==='string'?CAREERS.find(c=>c.id===raw)??null:null;
}
export function careerAvailable(s:Simulation,age:number,role:Career,profile?:CharacterProfile):boolean{
 return !s.ended&&Number.isInteger(age)&&age>=role.age&&age<65&&
 (s.justice?.incarceratedUntil??0)<=age&&edu[s.education]>=edu[role.education]&&
 s.credits>=role.credits&&s.experience>=role.xp&&s.balance>=role.capital&&
 (s.training??0)>=(role.training??0)&&(s.mysticMastery??0)>=(role.mastery??0)&&
 (!role.nature||(profile?.origin==='custom'&&profile.nature===role.nature));
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
 if(role.training)items.push((language==='en'?'Athletic training ':'Treino esportivo ')+role.training);
 if(role.mastery)items.push((language==='en'?'Mystical mastery ':'Domínio místico ')+role.mastery);
 if(role.nature)items.push((language==='en'?'Custom origin: ':'Origem personalizada: ')+role.nature);
 return items.join(' · ')||(language==='en'?'No formal degree required':'Sem diploma obrigatório');
}
