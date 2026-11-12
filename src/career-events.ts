/** Independently written, profession-specific story variations.
 * 45 occupations × 3 life dilemmas = 135 contextual event variants,
 * but only three from the current profession are eligible at any moment.
 */
import {careerById,CAREERS,careerLabel} from './careers.ts';
import type {Simulation} from './simulation.ts';
import type {Scenario} from './events-extended.ts';
const sector=(id:string):'sport'|'health'|'law'|'creative'|'technical'|'special'|'general'=> {
 const sport=['footballer','basketballer','athlete','trainer','coach'];
 const health=['doctor','surgeon','dentist','nurse','veterinarian','pharmacist','paramedic','psychologist'];
 const law=['lawyer','judge','police','diplomat','politician'];
 const creative=['musician','actor','photographer','streamer','influencer','designer','journalist'];
 const technical=['developer','scientist','engineer','architect','pilot'];
 const special=['night-healer','moon-guardian','arcane-healer'];
 return sport.includes(id)?'sport':health.includes(id)?'health':law.includes(id)?'law':
 creative.includes(id)?'creative':technical.includes(id)?'technical':special.includes(id)?'special':'general';
};
const prompt={
 sport:['A equipe enfrenta uma partida decisiva.','Your team faces a decisive contest.'],
 health:['Um caso complexo exige cuidado redobrado.','A complex case demands extra care.'],
 law:['Uma situação delicada exige julgamento e responsabilidade.','A difficult situation calls for judgment and responsibility.'],
 creative:['Uma nova ideia pode mudar sua trajetória profissional.','A new idea might change your creative career.'],
 technical:['Um projeto importante apresenta um desafio inesperado.','A major project poses an unexpected challenge.'],
 special:['Um acontecimento extraordinário testa seu preparo.','An extraordinary event tests your readiness.'],
 general:['Um desafio inesperado aparece durante sua jornada profissional.','An unexpected challenge arises at work.']
} as const;
export function careerEvents(lang:'pt-BR'|'en',sim:Simulation):Scenario[]{
 if(sim.ended||sim.job==='none'||sim.job==='retired'||!sim.occupation)return [];
 const role=careerById(sim.occupation);
 if(!role||role.job!==sim.job)return [];
 const en=lang==='en',name=careerLabel(role,lang),family=sector(role.id);
 const events:Scenario[]=[];
 const format=(suffix:string,title:string,description:string,
 options:{pt:string;en:string;ptResult:string;enResult:string;world:Scenario['choices'][number]['world']}[]):Scenario=>({
  id:'career-'+role.id+'-'+suffix,minAge:Math.max(role.age,16),maxAge:64,
  category:'work',condition:'employed',title,description,
  choices:options.map(x=>({label:en?x.en:x.pt,result:en?x.enResult:x.ptResult,effects:{},
    world:x.world}))
 });
 events.push(format('challenge',(en?'A challenge as ':'Um desafio para ')+name,
  prompt[family][en?1:0],[
  {pt:'Assumir a responsabilidade',en:'Take responsibility',ptResult:'Você mostrou iniciativa e conquistou respeito.',
   enResult:'You showed initiative and earned respect.',world:{careerMomentum:13,experience:2}},
  {pt:'Reunir a equipe',en:'Bring the team together',ptResult:'O trabalho em conjunto fortaleceu os vínculos.',
   enResult:'Collaboration strengthened your bonds.',world:{careerMomentum:7,friends:6}},
  {pt:'Evitar o risco',en:'Avoid the risk',ptResult:'Você preservou seu tempo, mas perdeu impulso.',
   enResult:'You saved time but lost momentum.',world:{careerMomentum:-7}}]));
 events.push(format('offer',(en?'A new offer for ':'Uma proposta para ')+name,
  en?'Someone makes you a tempting professional offer.':'Alguém apresenta uma proposta profissional tentadora.',[
  {pt:'Negociar condições',en:'Negotiate terms',ptResult:'Você conseguiu condições mais justas.',
   enResult:'You secured fairer terms.',world:{cash:1600,careerMomentum:4}},
  {pt:'Aceitar um projeto exigente',en:'Take a demanding project',ptResult:'Você ganhou experiência, embora tenha trabalhado muito.',
   enResult:'You gained experience through hard work.',world:{experience:3,careerMomentum:11}},
  {pt:'Recusar educadamente',en:'Decline politely',ptResult:'Você decidiu manter a estabilidade.',
   enResult:'You chose stability.',world:{friends:2}}]));
 events.push(format('mentor',(en?'Mentoring in ':'Mentoria na carreira de ')+name,
  en?'A newcomer asks you to share your experience.':'Uma pessoa iniciante pede conselhos sobre sua profissão.',[
  {pt:'Orientar a pessoa',en:'Offer guidance',ptResult:'Sua orientação gerou confiança.',
   enResult:'Your guidance built trust.',world:{friends:8,careerMomentum:8}},
  {pt:'Criar uma atividade prática',en:'Create a practical exercise',ptResult:'A experiência ensinou algo a vocês dois.',
   enResult:'You both learned something.',world:{credits:2,careerMomentum:5}},
  {pt:'Dizer que não tem tempo',en:'Say you are too busy',ptResult:'Você voltou às tarefas pendentes.',
   enResult:'You returned to other tasks.',world:{careerMomentum:-3}}]));
 return events;
}
export const careerEventCapacity=()=>CAREERS.length*3;
