/** Original scenario pack: data-driven effects, conditional access and bilingual writing. */
import type { Stats,WorldImpact,Simulation } from './simulation';
export type ScenarioCategory='family'|'school'|'work'|'money'|'health'|'city'|'friend'|'leisure'|'retirement';
export type Condition='any'|'employed'|'unemployed'|'college'|'dating'|'parent'|'hasHome'|'invested'|'retired'|'hasDebt';
export type ScenarioChoice={label:string;result:string;effects:Partial<Stats>;world?:WorldImpact};
export type Scenario={
 id:string;minAge:number;maxAge:number;title:string;description:string;
 choices:ScenarioChoice[];category:ScenarioCategory;condition:Condition;
};
type LangText=[string,string];
type ChoiceSeed={pt:LangText;en:LangText;effects:Partial<Stats>;world:WorldImpact};
type Seed={
 id:string;ages:[number,number];category:ScenarioCategory;condition:Condition;
 pt:LangText;en:LangText;choices:[ChoiceSeed,ChoiceSeed,ChoiceSeed]
};
const c=(pt:LangText,en:LangText,effects:Partial<Stats>={},world:WorldImpact={}):ChoiceSeed=>
  ({pt,en,effects,world});
const s=(id:string,ages:[number,number],category:ScenarioCategory,condition:Condition,pt:LangText,en:LangText,
  a:ChoiceSeed,b:ChoiceSeed,d:ChoiceSeed):Seed=>({id,ages,category,condition,pt,en,choices:[a,b,d]});
const seeds:Seed[]=[
s('first-words',[1,4],'family','any',
 ['As primeiras palavras','Sua família está tentando descobrir qual palavra você vai aprender primeiro.'],
 ['Your first words','Your family is eager to hear your first word.'],
 c(['Brincar com os sons','Você arrancou risadas de toda a casa.'],['Play with sounds','You made everyone laugh.'],{happiness:5},{family:7}),
 c(['Tentar imitar uma voz','Você começou a reconhecer palavras novas.'],['Imitate a voice','You began recognizing new words.'],{smarts:5},{credits:1}),
 c(['Observar em silêncio','Você passou o dia atento ao movimento da casa.'],['Observe quietly','You watched everyone around you.'],{health:2},{family:2})),
s('daycare-morning',[2,6],'school','any',
 ['Uma manhã diferente','Você vai passar o dia com outras crianças pela primeira vez.'],
 ['A different morning','You spend the day with other children for the first time.'],
 c(['Brincar com o grupo','Novas amizades começaram a nascer.'],['Join the others','New friendships began.'],{happiness:6},{friends:10}),
 c(['Explorar os brinquedos','Você passou horas descobrindo coisas novas.'],['Explore the toys','You spent hours learning through play.'],{smarts:5},{credits:1}),
 c(['Pedir para voltar para casa','Sua família acolheu você com carinho.'],['Ask to go home','Your family comforted you.'],{happiness:2},{family:7})),
s('missing-toy',[3,9],'family','any',
 ['O brinquedo desaparecido','Seu brinquedo favorito sumiu pouco antes de uma viagem.'],
 ['The missing toy','Your favorite toy disappeared just before a trip.'],
 c(['Procurar com calma','Você acabou encontrando o brinquedo.'],['Search carefully','You eventually found it.'],{smarts:3,happiness:4}),
 c(['Pedir ajuda','Um familiar ajudou você a procurar.'],['Ask for help','A family member joined the search.'],{happiness:3},{family:6}),
 c(['Aceitar a perda','Você aprendeu a lidar com pequenas frustrações.'],['Let it go','You learned to handle a small disappointment.'],{smarts:2,happiness:-2})),
s('new-neighbor',[5,16],'friend','any',
 ['Alguém novo na rua','Uma família se mudou para perto e você conhece uma criança da sua idade.'],
 ['A new neighbor','A family moved nearby, and you met a kid your age.'],
 c(['Convidar para brincar','Vocês começaram uma amizade.'],['Invite them to play','You started a friendship.'],{happiness:5},{friends:11}),
 c(['Apresentar a vizinhança','Seu gesto deixou uma ótima impressão.'],['Show them around','You made a great impression.'],{smarts:2},{friends:7}),
 c(['Manter distância','Vocês mal conversaram.'],['Keep your distance','You hardly spoke.'],{happiness:-1},{friends:-2})),
s('school-mistake',[7,17],'school','any',
 ['Um erro na prova','Você percebe que cometeu um erro importante na avaliação.'],
 ['A mistake on the exam','You realize you made a major error on a test.'],
 c(['Revisar seu método','O estudo ficou mais organizado.'],['Review your method','Your studies became more organized.'],{smarts:6},{credits:2}),
 c(['Pedir orientação','Um professor explicou o assunto de outra forma.'],['Ask for help','A teacher explained it differently.'],{smarts:4},{credits:1}),
 c(['Ignorar o resultado','O assunto ficou para depois.'],['Ignore the result','You put off dealing with it.'],{happiness:1},{credits:-1})),
s('computer-club',[10,20],'school','any',
 ['Um clube de tecnologia','Você encontra pessoas construindo pequenos projetos digitais na escola.'],
 ['A technology club','You find a group building small digital projects at school.'],
 c(['Criar um jogo simples','Você aprendeu a transformar ideias em código.'],['Build a simple game','You learned how ideas become code.'],{smarts:8},{credits:3}),
 c(['Montar uma equipe','O projeto aproximou várias pessoas.'],['Build a team','The project brought people together.'],{happiness:5},{friends:10}),
 c(['Assistir às demonstrações','Você conheceu novas possibilidades.'],['Watch demonstrations','You discovered new possibilities.'],{smarts:3},{credits:1})),
s('sports-recovery',[12,35],'health','any',
 ['Uma lesão inesperada','Durante uma atividade física, você torceu o tornozelo.'],
 ['An unexpected injury','You twisted your ankle while exercising.'],
 c(['Buscar atendimento','Você recebeu orientação e se recuperou.'],['Get medical care','You got advice and recovered.'],{health:6},{cash:-450}),
 c(['Descansar alguns dias','O repouso ajudou na recuperação.'],['Rest for a few days','Rest helped you recover.'],{health:3,happiness:-2}),
 c(['Continuar treinando','Você agravou a lesão.'],['Keep training','You made the injury worse.'],{health:-13})),
s('parttime-interview',[16,19],'work','unemployed',
 ['Uma entrevista de emprego','Uma empresa local chama você para uma conversa sobre trabalho.'],
 ['A part-time interview','A local business calls you in for an interview.'],
 c(['Preparar-se com cuidado','Você causou uma boa impressão.'],['Prepare carefully','You made a good impression.'],{smarts:5},{experience:1}),
 c(['Pedir dicas à família','Os conselhos ajudaram bastante.'],['Ask your family for tips','Their advice helped.'],{happiness:3},{family:5}),
 c(['Desistir da entrevista','A oportunidade passou.'],['Skip the interview','The opportunity passed.'],{happiness:-4})),
s('college-team',[18,30],'school','college',
 ['Projeto de faculdade','Um trabalho coletivo vai contar para sua avaliação final.'],
 ['College team project','A group project will count toward your final grade.'],
 c(['Liderar o projeto','Você ganhou confiança e novas habilidades.'],['Lead the project','You gained confidence and new skills.'],{smarts:6},{credits:3,friends:4}),
 c(['Dividir responsabilidades','A equipe conseguiu colaborar bem.'],['Share responsibilities','The team worked well together.'],{happiness:4},{friends:7,credits:1}),
 c(['Entregar somente sua parte','O resultado não impressionou.'],['Only do your part','The result was unimpressive.'],{happiness:1},{credits:-1})),
s('salary-review',[21,64],'work','employed',
 ['Revisão de salário','Seu gestor convida você para conversar sobre remuneração.'],
 ['Salary review','Your manager invites you to discuss your compensation.'],
 c(['Mostrar resultados','Seu desempenho foi reconhecido.'],['Present your results','Your performance was recognized.'],{happiness:5},{cash:2200,experience:2}),
 c(['Negociar com calma','A conversa abriu novas oportunidades.'],['Negotiate calmly','The discussion opened new doors.'],{smarts:4},{cash:800,experience:1}),
 c(['Não negociar','Você preferiu manter a rotina.'],['Avoid the discussion','You kept things as they were.'],{happiness:-2})),
s('emergency-fund',[18,80],'money','any',
 ['Uma reserva de emergência','Você percebe que um imprevisto poderia comprometer suas contas.'],
 ['An emergency fund','You realize an unexpected expense could disrupt your finances.'],
 c(['Guardar dinheiro','Você organizou suas economias.'],['Save money','You organized your savings.'],{smarts:4},{cash:-250,investments:250}),
 c(['Buscar renda extra','Um serviço pontual trouxe dinheiro adicional.'],['Find extra income','A short job brought in extra cash.'],{health:-2},{cash:700,experience:1}),
 c(['Deixar para depois','Você decidiu não agir por enquanto.'],['Wait and see','You decided not to act yet.'],{happiness:1})),
s('relationship-talk',[20,80],'friend','dating',
 ['Uma conversa importante','Seu relacionamento chegou a um ponto em que vocês precisam conversar sobre o futuro.'],
 ['An important conversation','Your relationship has reached a moment to discuss your future.'],
 c(['Ouvir com atenção','A confiança cresceu.'],['Listen carefully','Trust between you grew.'],{happiness:4},{partner:14}),
 c(['Falar sobre seus planos','Vocês entenderam melhor as prioridades um do outro.'],['Share your plans','You understood each other better.'],{smarts:2},{partner:8}),
 c(['Evitar o assunto','O distanciamento aumentou.'],['Avoid the topic','Distance grew between you.'],{happiness:-4},{partner:-15})),
s('school-supplies',[25,65],'family','parent',
 ['Materiais escolares','Uma criança da família precisa de materiais para começar as aulas.'],
 ['School supplies','A child in your family needs supplies for the new term.'],
 c(['Comprar o necessário','Você ajudou a criança a se preparar.'],['Buy the essentials','You helped the child prepare.'],{happiness:4},{cash:-550,family:8}),
 c(['Pesquisar opções baratas','A economia fez diferença.'],['Find affordable options','Your careful shopping saved money.'],{smarts:3},{cash:-280,family:5}),
 c(['Adiar as compras','A família precisou improvisar.'],['Delay the purchase','The family had to improvise.'],{happiness:-4},{family:-6})),
s('apartment-maintenance',[23,90],'money','hasHome',
 ['Reparos na casa','Um problema hidráulico surge no imóvel que você comprou.'],
 ['Home repairs','A plumbing issue appears in your home.'],
 c(['Contratar ajuda','O problema foi resolvido rapidamente.'],['Hire a professional','The problem was fixed quickly.'],{happiness:4},{cash:-1500}),
 c(['Fazer um pequeno reparo','Você aprendeu mais sobre manutenção.'],['Do a small repair','You learned a practical skill.'],{smarts:5},{cash:-450}),
 c(['Ignorar por enquanto','O problema piorou.'],['Put it off','The issue became more serious.'],{health:-3,happiness:-5},{debt:2400})),
s('investment-volatility',[21,85],'money','invested',
 ['Oscilação dos investimentos','Você percebe uma variação no valor da sua carteira.'],
 ['Investment volatility','You notice a change in the value of your portfolio.'],
 c(['Reequilibrar a carteira','Você decidiu reduzir riscos.'],['Rebalance the portfolio','You reduced your exposure to risk.'],{smarts:4},{investments:-250,cash:250}),
 c(['Manter sua estratégia','Você seguiu seu planejamento de longo prazo.'],['Stay the course','You stuck to your long-term plan.'],{happiness:2},{investments:120}),
 c(['Vender por impulso','Você realizou uma perda desnecessária.'],['Sell impulsively','You realized an avoidable loss.'],{happiness:-6},{investments:-650})),
s('debt-letter',[20,92],'money','hasDebt',
 ['Uma carta de cobrança','Você recebe um aviso sobre uma dívida antiga.'],
 ['A debt collection letter','You receive a notice about an old debt.'],
 c(['Negociar parcelas','Você conseguiu um acordo mais administrável.'],['Negotiate payments','You reached a manageable agreement.'],{happiness:4},{debt:-900,credits:1}),
 c(['Rever o orçamento','Você identificou despesas desnecessárias.'],['Review your budget','You found unnecessary expenses.'],{smarts:5},{debt:-300}),
 c(['Ignorar o aviso','O saldo devedor aumentou.'],['Ignore the letter','Your outstanding balance increased.'],{happiness:-7},{debt:600})),
s('volunteer-day',[14,100],'friend','any',
 ['Um dia de voluntariado','Uma organização comunitária precisa de ajuda em um evento.'],
 ['A volunteer day','A local community organization needs help at an event.'],
 c(['Participar o dia inteiro','Você conheceu pessoas e contribuiu bastante.'],['Volunteer all day','You met people and made a difference.'],{happiness:8},{friends:10,family:4}),
 c(['Ajudar por algumas horas','Sua contribuição foi bem recebida.'],['Help for a few hours','Your help was appreciated.'],{happiness:4},{friends:5}),
 c(['Ficar em casa','Você preferiu descansar.'],['Stay home','You decided to rest.'],{health:2})),
s('family-reunion',[12,100],'family','any',
 ['Reencontro em família','Parentes organizam um almoço depois de muito tempo sem se ver.'],
 ['A family reunion','Relatives organize a gathering after spending a long time apart.'],
 c(['Comparecer ao encontro','Você reviveu lembranças e aproximou pessoas.'],['Attend the gathering','You shared memories and reconnected.'],{happiness:7},{family:14}),
 c(['Enviar uma mensagem','Sua lembrança foi recebida com carinho.'],['Send a message','Your family appreciated your thought.'],{happiness:3},{family:6}),
 c(['Recusar o convite','Algumas pessoas ficaram decepcionadas.'],['Decline the invitation','Some relatives were disappointed.'],{happiness:-1},{family:-9})),
s('retirement-learning',[60,105],'retirement','retired',
 ['Aprender depois da carreira','Você encontra um curso para pessoas que querem explorar novos interesses.'],
 ['Learning after retirement','You find a course for people exploring new interests.'],
 c(['Matricular-se no curso','O estudo trouxe motivação e propósito.'],['Enroll in the course','Learning brought purpose and motivation.'],{smarts:7,happiness:6},{credits:2,cash:-600}),
 c(['Participar como voluntário','Você compartilhou experiência com outras pessoas.'],['Volunteer as a mentor','You shared experience with others.'],{happiness:6},{friends:8}),
 c(['Continuar na sua rotina','Você decidiu preservar o próprio ritmo.'],['Stick with your routine','You kept a familiar pace.'],{health:2}))
];
export function extendedEvents(language:'pt-BR'|'en'):Scenario[]{
 const field=language==='en'?'en':'pt';
 return seeds.map(seed=>({
  id:seed.id,minAge:seed.ages[0],maxAge:seed.ages[1],
  title:seed[field][0],description:seed[field][1],category:seed.category,condition:seed.condition,
  choices:seed.choices.map(choice=>({
   label:choice[field][0],result:choice[field][1],effects:{...choice.effects},world:{...choice.world}
  }))
 }));
}
export function extendedAllowed(event:Scenario,s:Simulation):boolean {
 switch(event.condition){
  case 'employed':return s.job!=='none'&&s.job!=='retired';
  case 'unemployed':return s.job==='none';
  case 'college':return s.education==='college';
  case 'dating':return s.relationship!=='single';
  case 'parent':return s.children>0;
  case 'hasHome':return s.homeOwned;
  case 'invested':return s.investments>0;
  case 'retired':return s.job==='retired';
  case 'hasDebt':return s.debt>0;
  default:return true;
 }
}
