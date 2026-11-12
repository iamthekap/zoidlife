/** Original bilingual multi-year decision chains; only actual player choices schedule continuations. */
import type {Stats,WorldImpact,Simulation} from './simulation.ts';
export type StoryArcId='school-team'|'coding-club'|'old-friend'|'family-plan'|'career-lead'|'health-routine';
export type StoryArc={id:StoryArcId;phase:1|2;originAge:number;dueAge:number};
type Text=[string,string];
type Option={words:Text;result:Text;effects:Partial<Stats>;world:WorldImpact};
type Episode={title:Text;description:Text;category:string;options:[Option,Option,Option]};
type ArcInfo={trigger:string;choice:number;episodes:[Episode,Episode]};
const c=(pt:string,en:string,resultPt:string,resultEn:string,effects:Partial<Stats>={},world:WorldImpact={}):Option=>({words:[pt,en],result:[resultPt,resultEn],effects,world});
const e=(pt:string,en:string,descPt:string,descEn:string,category:string,a:Option,b:Option,d:Option):Episode=>({title:[pt,en],description:[descPt,descEn],category,options:[a,b,d]});
const story:Record<StoryArcId,ArcInfo>={
 'school-team':{trigger:'school-new-class',choice:0,episodes:[
  e('Um trabalho em dupla','A class project','O colega que você conheceu convida você para apresentar um projeto.','Your new classmate asks you to present a project together.','school',
   c('Estudar juntos','Study together','Vocês aprenderam mais e apresentaram um bom trabalho.','You learned together and presented a strong project.',{smarts:5},{friends:7,credits:2}),
   c('Dividir as tarefas','Split the work','Vocês terminaram o projeto de maneira equilibrada.','You completed the project fairly.',{happiness:3},{friends:4,credits:1}),
   c('Deixar tudo para o colega','Leave it to them','O colega ficou sobrecarregado.','Your classmate felt overwhelmed.',{happiness:-3},{friends:-9})),
  e('O reencontro no recreio','Meeting again at recess','Um ano depois, aquele colega quer conversar sobre a amizade de vocês.','The following year, your classmate wants to talk about your friendship.','friend',
   c('Pedir desculpas e conversar','Talk and apologize','Vocês se entenderam e ficaram mais próximos.','You worked things out and became closer.',{happiness:6},{friends:11}),
   c('Continuar como estão','Keep things as they are','A amizade seguiu seu ritmo.','Your friendship continued at its own pace.',{happiness:2},{friends:3}),
   c('Seguir outro caminho','Move on','Vocês decidiram se afastar.','You drifted apart.',{happiness:-2},{friends:-7}))
 ]},
 'coding-club':{trigger:'computer-club',choice:0,episodes:[
  e('Seu jogo recebe atenção','Your game gets noticed','O projeto de tecnologia é convidado para uma mostra da escola.','Your technology project is invited to a school showcase.','school',
   c('Mostrar o protótipo','Show the prototype','As pessoas gostaram do que você criou.','Visitors enjoyed what you made.',{smarts:5,happiness:3},{credits:3,friends:5}),
   c('Melhorar antes de apresentar','Polish it first','Você ganhou técnica, mas perdeu parte da mostra.','You improved your skills but missed part of the showcase.',{smarts:6},{credits:2}),
   c('Abandonar o projeto','Drop the project','A mostra aconteceu sem seu jogo.','The showcase went ahead without your game.',{happiness:-5},{friends:-3})),
  e('Uma parceria para criar','A creative partnership','Alguém da mostra oferece ajuda no próximo projeto.','Someone from the showcase offers to help with your next project.','school',
   c('Criar em equipe','Build together','Vocês criaram outro projeto e aprenderam muito.','You built another project and learned a lot.',{smarts:7,happiness:4},{credits:4,friends:6}),
   c('Trocar ideias','Exchange ideas','Você conheceu novas técnicas.','You learned new techniques.',{smarts:5},{credits:2}),
   c('Trabalhar sozinho','Work alone','Você seguiu seu próprio caminho.','You continued on your own.',{smarts:3},{credits:1}))
 ]},
 'old-friend':{trigger:'best-friend-message',choice:0,episodes:[
  e('Um convite de última hora','A last-minute invitation','A amizade retomada se transforma em um convite para um encontro.','Your renewed friendship brings an invitation to meet.','friend',
   c('Encontrar pessoalmente','Meet in person','Vocês compartilharam boas lembranças.','You shared happy memories.',{happiness:8},{friends:8,cash:-150}),
   c('Fazer uma chamada','Make a video call','Vocês conversaram até tarde.','You talked late into the night.',{happiness:4},{friends:5}),
   c('Desmarcar','Cancel','A amizade perdeu um pouco do impulso.','The friendship lost momentum.',{happiness:-3},{friends:-6})),
  e('Um amigo precisa de apoio','A friend needs support','No ano seguinte, seu amigo passa por uma fase difícil.','The next year, your friend goes through a difficult time.','friend',
   c('Estar presente','Be there','Sua presença fez diferença.','Your support meant a lot.',{happiness:5},{friends:13}),
   c('Oferecer ajuda à distância','Support from afar','Você ajudou como pôde.','You helped as best you could.',{smarts:2},{friends:6}),
   c('Evitar a conversa','Avoid the conversation','O silêncio criou distância.','The silence created distance.',{happiness:-5},{friends:-11}))
 ]},
 'family-plan':{trigger:'family-difficult-talk',choice:1,episodes:[
  e('Um acordo em família','A family agreement','A solução que você propôs começa a ser colocada em prática.','Your proposed solution starts taking shape.','family',
   c('Dividir responsabilidades','Share responsibilities','A família encontrou um equilíbrio.','Your family found a fairer balance.',{smarts:4},{family:11}),
   c('Ajudar financeiramente','Help financially','Sua ajuda trouxe alívio, mas custou dinheiro.','Your help eased the burden but cost money.',{happiness:4},{cash:-800,family:9}),
   c('Descumprir o combinado','Break the agreement','A confiança ficou abalada.','Trust was shaken.',{happiness:-5},{family:-13})),
  e('Reavaliar o plano','Revisit the plan','Um ano depois, todos querem saber o que mudou.','A year later, everyone wants to discuss what changed.','family',
   c('Escutar cada pessoa','Hear everyone out','Vocês renovaram a confiança.','You renewed the trust.',{happiness:5},{family:14}),
   c('Defender suas prioridades','Stand by your priorities','O diálogo trouxe algum equilíbrio.','The discussion found some balance.',{smarts:3},{family:4}),
   c('Evitar o assunto','Avoid the discussion','O problema continuou.','The problem continued.',{happiness:-5},{family:-9}))
 ]},
 'career-lead':{trigger:'work-project-lead',choice:0,episodes:[
  e('O prazo do projeto','The project deadline','Sua equipe enfrenta um obstáculo no projeto que você lidera.','Your team hits a major obstacle on the project you lead.','work',
   c('Replanejar a entrega','Replan the delivery','Sua equipe entregou um bom resultado.','Your team delivered a good result.',{smarts:5,health:-2},{careerMomentum:15,experience:2}),
   c('Contratar apoio','Bring in support','O projeto avançou com custo adicional.','The project progressed at an extra cost.',{happiness:3},{cash:-1200,careerMomentum:9}),
   c('Trabalhar até a exaustão','Work through exhaustion','Você cumpriu o prazo, mas ficou esgotado.','You met the deadline but felt exhausted.',{health:-12},{careerMomentum:8,experience:1})),
  e('Avaliação da liderança','Leadership review','O projeto terminou e chegou a hora do feedback profissional.','The project ended and it is time for professional feedback.','work',
   c('Apresentar resultados','Present the results','Seu trabalho recebeu reconhecimento.','Your work was recognized.',{happiness:8},{careerMomentum:19,experience:3,cash:2500}),
   c('Valorizar a equipe','Credit the team','O reconhecimento foi compartilhado.','Recognition was shared.',{happiness:5},{careerMomentum:10,friends:6}),
   c('Evitar a avaliação','Avoid the review','Você perdeu uma oportunidade de crescer.','You missed an opportunity to grow.',{happiness:-4},{careerMomentum:-10}))
 ]},
 'health-routine':{trigger:'medical-prevention',choice:0,episodes:[
  e('Resultado dos exames','Your test results','Depois dos exames, você precisa decidir como ajustar seus hábitos.','After your checkup, you must decide how to adjust your habits.','health',
   c('Criar uma rotina saudável','Build a healthy routine','Você cuidou melhor da própria saúde.','You took better care of your health.',{health:8,happiness:3},{training:4}),
   c('Pedir orientação','Seek guidance','Você entendeu melhor os cuidados necessários.','You learned more about preventive care.',{health:5,smarts:3},{cash:-200}),
   c('Ignorar recomendações','Ignore the advice','Seu bem-estar ficou em segundo plano.','Your well-being took a back seat.',{health:-7})),
  e('Uma nova avaliação','A follow-up appointment','Um ano depois, chegou a hora de rever a rotina de saúde.','A year later, it is time to review your health routine.','health',
   c('Manter a rotina','Stay consistent','A consistência trouxe uma melhora duradoura.','Consistency brought lasting improvement.',{health:8,happiness:5},{training:5}),
   c('Fazer ajustes possíveis','Make small changes','Pequenas mudanças ajudaram.','Small changes helped.',{health:5},{training:2}),
   c('Desistir dos cuidados','Give up the routine','O autocuidado deixou de ser prioridade.','Self-care slipped down your priorities.',{health:-9,happiness:-2}))
 ]}
};
export const STORY_ARC_IDS=Object.keys(story) as StoryArcId[];
/** Story resolutions cannot refer to a school or job that no longer exists. */
const latestOrigin:Record<StoryArcId,number>={
 'school-team':15,'coding-club':15,'old-friend':107,
 'family-plan':85,'career-lead':62,'health-routine':107
};
export function storyArcAllowed(arc:StoryArc|null,state:Simulation,age:number):boolean {
 if(!arc||!Number.isInteger(age)||age<arc.originAge||age>110)return false;
 if((arc.id==='school-team'||arc.id==='coding-club')&&
    (age>=18||(age>=6&&state.education!=='school')))return false;
 if(arc.id==='career-lead'&&['none','retired'].includes(state.job))return false;
 return true;
}
const local=(line:Text,language:'pt-BR'|'en')=>line[language==='en'?1:0];
export function normalizeStoryArc(raw:unknown,age:number):StoryArc|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Partial<StoryArc>;
 if(!STORY_ARC_IDS.includes(r.id as StoryArcId)||(r.phase!==1&&r.phase!==2)||
  !Number.isInteger(r.originAge)||!Number.isInteger(r.dueAge)||!Number.isInteger(age)||
  age<0||age>110||!(r.originAge!>=0&&r.originAge!<=age)||
  !(r.dueAge===r.originAge!+r.phase!&&r.dueAge<=110)||r.dueAge!>age+1||age-r.dueAge!>1)return null;
 return {id:r.id!,phase:r.phase!,originAge:r.originAge!,dueAge:r.dueAge!};
}
export function startStoryArc(id:string,index:number,age:number,current:StoryArc|null):StoryArc|null {
 if(current||!Number.isInteger(age)||age<0||age>=108)return current;
 const key=STORY_ARC_IDS.find(k=>story[k].trigger===id&&story[k].choice===index);
 return key&&age<=latestOrigin[key]?{id:key,phase:1,originAge:age,dueAge:age+1}:null;
}
export function storyArcEvent(state:StoryArc|null,language:'pt-BR'|'en'):{
 id:string;minAge:number;maxAge:number;title:string;description:string;category:string;
 choices:{label:string;result:string;effects:Partial<Stats>;world:WorldImpact}[];
}|null {
 if(!state||!STORY_ARC_IDS.includes(state.id)||(state.phase!==1&&state.phase!==2))return null;
 const episode=story[state.id].episodes[state.phase-1];
 return {id:'arc-'+state.id+'-'+state.phase,minAge:state.dueAge,maxAge:110,
  title:local(episode.title,language),description:local(episode.description,language),
  category:episode.category,choices:episode.options.map(o=>({
   label:local(o.words,language),result:local(o.result,language),effects:o.effects,world:o.world
  }))};
}
export function afterStoryArcChoice(current:StoryArc|null,id:string,index:number,age:number):StoryArc|null {
 if(!current||id!=='arc-'+current.id+'-'+current.phase)return current;
 if(current.phase===2||index===2||age>=110)return null;
 return {...current,phase:2,dueAge:age+1};
}
