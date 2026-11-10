/** Original Zoid Life narrative library, independent of all third-party game data. */
import type { Stats, Simulation } from './simulation';
export type GameLanguage = 'pt-BR' | 'en';
export type StoryChoice = { label: string; result: string; effects: Partial<Stats> };
export type StoryEvent = { id:string; minAge:number; maxAge:number; title:string; description:string; choices:StoryChoice[] };
type Pair = [string,string];
type SeedChoice = { pt:Pair; en:Pair; effects: Partial<Stats> };
type Seed = {id:string; ages:[number,number]; pt:Pair; en:Pair; choices:[SeedChoice,SeedChoice,SeedChoice]};
const make = (id:string, ages:[number,number], pt:Pair, en:Pair, choices:[SeedChoice,SeedChoice,SeedChoice]):Seed =>
  ({id,ages,pt,en,choices});
const c=(pt:Pair,en:Pair,effects:Partial<Stats>):SeedChoice=>({pt,en,effects});
const catalog:Seed[] = [
  make('playground',[3,7],['Um encontro no parque','Você encontra outras crianças brincando. Uma delas oferece um lugar na equipe.'],
    ['A day at the park','You meet other kids playing together. One invites you to join their team.'],[
      c(['Entrar na brincadeira','Você fez amigos e se divertiu.'],['Join the game','You made friends and had fun.'],{happiness:6}),
      c(['Inventar outra atividade','Você descobriu que tem boas ideias.'],['Invent a new game','You discovered your creativity.'],{smarts:5}),
      c(['Ficar com a família','Você passou a tarde perto de quem cuida de você.'],['Stay with family','You spent the afternoon with loved ones.'],{happiness:4})]),
  make('science-fair',[8,15],['A feira de ciências','A escola propõe um projeto de pesquisa. Você pode se destacar ou apenas participar.'],
    ['The science fair','Your school announces a research project. You can aim high or keep it simple.'],[
      c(['Criar um projeto ousado','A investigação ensinou muito.'],['Build an ambitious project','You learned a lot from the research.'],{smarts:9}),
      c(['Trabalhar com colegas','O trabalho conjunto fortaleceu amizades.'],['Work with classmates','Teamwork brought you closer.'],{happiness:6,smarts:3}),
      c(['Fazer o mínimo','Você entregou o trabalho sem grandes novidades.'],['Keep it simple','You submitted the project without much effort.'],{happiness:2})]),
  make('team-sport',[9,17],['Um time precisa de você','Um time do bairro procura novos integrantes. A rotina exige treinos regulares.'],
    ['A local team needs you','A neighborhood team is recruiting new players, with regular practice required.'],[
      c(['Entrar e treinar','A disciplina trouxe mais energia.'],['Join and practice','Training gave you more energy.'],{health:6,happiness:4}),
      c(['Ajudar na organização','Você conheceu muita gente.'],['Help organize it','You met new people.'],{smarts:4,happiness:3}),
      c(['Recusar o convite','Você preferiu outros hobbies.'],['Turn it down','You focused on other interests.'],{happiness:1})]),
  make('online-learning',[12,20],['Aprender pela internet','Você encontra aulas abertas sobre uma área que nunca explorou.'],
    ['Learning online','You find free lessons about a subject you have never explored.'],[
      c(['Seguir o curso inteiro','Sua dedicação aumentou seu conhecimento.'],['Finish the full course','Your dedication improved your skills.'],{smarts:7}),
      c(['Explorar por curiosidade','Você descobriu novos interesses.'],['Explore casually','You discovered new interests.'],{happiness:4,smarts:3}),
      c(['Deixar para depois','Você não aproveitou a oportunidade.'],['Save it for later','You missed the opportunity.'],{happiness:1})]),
  make('first-budget',[15,23],['Aprendendo a lidar com dinheiro','Um valor inesperado chega às suas mãos. Você precisa decidir como utilizá-lo.'],
    ['Your first budget','An unexpected amount of money comes your way. How will you use it?'],[
      c(['Guardar boa parte','Você criou uma reserva financeira.'],['Save most of it','You started a savings cushion.'],{smarts:4}),
      c(['Comprar algo que queria','A compra trouxe satisfação imediata.'],['Buy something nice','The purchase felt rewarding.'],{happiness:7}),
      c(['Ajudar alguém próximo','Você ofereceu apoio financeiro a uma pessoa.'],['Help someone out','You offered financial support.'],{happiness:5})]),
  make('scholarship',[17,26],['Uma bolsa de estudos','Uma instituição abre inscrições para uma formação que pode mudar seu futuro.'],
    ['A scholarship opportunity','An institution is offering financial aid for a course that could change your future.'],[
      c(['Preparar a candidatura','Você investiu tempo em novas qualificações.'],['Apply seriously','You invested in new qualifications.'],{smarts:8,happiness:2}),
      c(['Fazer o curso por conta própria','Você avançou no seu ritmo.'],['Learn independently','You moved forward on your own terms.'],{smarts:5}),
      c(['Continuar trabalhando','Sua rotina seguiu sem mudanças.'],['Keep working','You chose the stability of your current routine.'],{happiness:2})]),
  make('first-rent',[18,33],['Morar por conta própria','Você começa a pensar em sair de casa. A independência tem seus custos.'],
    ['A place of your own','You are thinking about moving out. Independence comes with expenses.'],[
      c(['Alugar um lugar','A liberdade trouxe novas responsabilidades.'],['Rent a place','Independence came with new responsibilities.'],{happiness:6,smarts:2}),
      c(['Dividir moradia','Você reduziu custos e fez novas amizades.'],['Share a home','You kept costs down and met people.'],{happiness:4}),
      c(['Guardar dinheiro por enquanto','Você decidiu fortalecer as finanças.'],['Save for later','You decided to improve your finances first.'],{smarts:3})]),
  make('mentor',[18,55],['Uma conversa sobre carreira','Uma pessoa experiente oferece orientação e pergunta o que você pretende construir.'],
    ['Career advice','An experienced person offers guidance and asks what you want to build.'],[
      c(['Pedir orientação','Você ganhou uma visão mais clara de oportunidades.'],['Ask for guidance','You gained a clearer view of opportunities.'],{smarts:5}),
      c(['Propor um projeto conjunto','Você fez um contato importante.'],['Propose a collaboration','You built a valuable connection.'],{happiness:5,smarts:3}),
      c(['Seguir sozinho','Você decidiu confiar na própria experiência.'],['Go your own way','You chose to rely on your own judgment.'],{happiness:2})]),
  make('work-pressure',[20,65],['Pressão no trabalho','Sua rotina profissional ficou intensa, e você precisa reorganizar as prioridades.'],
    ['Pressure at work','Your workload has increased and your priorities need attention.'],[
      c(['Aceitar mais responsabilidades','Você ganhou experiência, mas terminou cansado.'],['Take on extra work','You gained experience but felt exhausted.'],{smarts:5,health:-6}),
      c(['Estabelecer limites','Você protegeu sua saúde e rotina.'],['Set boundaries','You protected your health and personal time.'],{health:5,happiness:3}),
      c(['Pedir apoio','Colegas ajudaram a equilibrar as tarefas.'],['Ask for support','Your colleagues helped share the load.'],{happiness:4})]),
  make('friend-conflict',[14,70],['Um desentendimento','Uma pessoa próxima se sentiu ignorada por você. Como pretende resolver isso?'],
    ['A disagreement','Someone close to you feels ignored. How will you handle it?'],[
      c(['Conversar e ouvir','O diálogo ajudou a reconstruir a confiança.'],['Listen and talk','Talking helped rebuild trust.'],{happiness:5}),
      c(['Dar um tempo','O espaço ajudou a esfriar a situação.'],['Take some space','Some distance helped everyone calm down.'],{health:2}),
      c(['Ignorar o conflito','O vínculo ficou mais distante.'],['Ignore it','The relationship grew colder.'],{happiness:-5})]),
  make('checkup',[21,95],['Um lembrete de saúde','Você percebe que faz tempo desde seu último cuidado preventivo.'],
    ['A health reminder','It has been a while since your last preventive health check.'],[
      c(['Fazer uma consulta','Você priorizou seus cuidados de saúde.'],['Get a checkup','You prioritized your health.'],{health:7}),
      c(['Melhorar os hábitos','Mudanças simples trouxeram benefícios.'],['Improve your routine','Small changes helped you feel better.'],{health:5,happiness:2}),
      c(['Deixar para depois','Você adiou os cuidados.'],['Put it off','You delayed taking care of yourself.'],{health:-3})]),
  make('side-project',[19,58],['Uma ideia de negócio','Você identifica um problema e pensa em criar um pequeno serviço próprio.'],
    ['A business idea','You spot a problem and consider starting a small service.'],[
      c(['Investir em um projeto','Você arriscou economias para iniciar algo.'],['Invest in your idea','You put some savings into a new venture.'],{smarts:7,happiness:3}),
      c(['Fazer testes baratos','Você validou sua ideia com menos risco.'],['Run small experiments','You tested the concept while limiting risk.'],{smarts:5}),
      c(['Permanecer no trabalho atual','Você escolheu a estabilidade.'],['Stay with your current job','You chose stability.'],{happiness:1})]),
  make('family-care',[25,75],['Alguém precisa de apoio','Uma pessoa próxima precisa de ajuda para atravessar uma fase difícil.'],
    ['Family needs help','Someone close to you needs support during a difficult period.'],[
      c(['Ajudar pessoalmente','Sua presença fortaleceu os laços.'],['Help in person','Being present strengthened your bonds.'],{happiness:5}),
      c(['Apoiar financeiramente','Você ajudou com despesas inesperadas.'],['Offer financial help','You helped cover urgent expenses.'],{happiness:3}),
      c(['Dizer que não pode','Você preservou sua rotina, mas a relação esfriou.'],['Say you cannot help','You protected your schedule, but the bond suffered.'],{happiness:-3})]),
  make('career-switch',[28,64],['Mudar de profissão','Depois de anos na mesma área, você considera explorar uma carreira diferente.'],
    ['A career change','After years in one field, you consider changing directions.'],[
      c(['Tentar outra área','Você enfrentou um período de transição.'],['Try another field','You entered a period of transition.'],{smarts:6,happiness:5}),
      c(['Buscar promoção','Você focou em crescer onde está.'],['Seek a promotion','You focused on growing in your role.'],{smarts:5}),
      c(['Manter o emprego','A estabilidade trouxe tranquilidade.'],['Stay in your job','Stability gave you peace of mind.'],{health:2})]),
  make('old-friend',[45,90],['Uma amizade antiga','Uma mensagem traz notícias de alguém importante do seu passado.'],
    ['An old friend','A message reconnects you with someone who mattered years ago.'],[
      c(['Marcar um reencontro','A conversa trouxe novas lembranças.'],['Meet again','The reunion brought good memories.'],{happiness:8}),
      c(['Responder por mensagem','Você retomou contato aos poucos.'],['Write back','You reconnected gradually.'],{happiness:4}),
      c(['Não responder','Você preferiu preservar as lembranças.'],['Do not reply','You left the past behind.'],{happiness:-2})]),
  make('retirement-choice',[58,80],['Planos para a aposentadoria','Você começa a pensar em como deseja viver a próxima fase.'],
    ['Retirement plans','You start considering what your next stage of life might look like.'],[
      c(['Preparar as finanças','Você se organizou para reduzir incertezas.'],['Plan your finances','You reduced uncertainty by planning ahead.'],{smarts:5}),
      c(['Dedicar tempo à família','Você aproximou pessoas queridas.'],['Make time for family','You grew closer to loved ones.'],{happiness:6}),
      c(['Continuar ativo','Você decidiu preservar sua rotina.'],['Stay active','You kept your usual routine.'],{health:4})]),
  make('community',[65,100],['Uma iniciativa comunitária','Pessoas do bairro convidam você para participar de encontros regulares.'],
    ['A community project','People in your neighborhood invite you to join regular gatherings.'],[
      c(['Participar ativamente','Você encontrou novos amigos e propósito.'],['Join regularly','You found friends and purpose.'],{happiness:8}),
      c(['Apoiar ocasionalmente','Você contribuiu dentro do seu tempo.'],['Help occasionally','You contributed when you could.'],{happiness:4}),
      c(['Continuar sua rotina','Você manteve o próprio ritmo.'],['Keep your routine','You chose your usual pace.'],{health:2})])
];
export const extraEvents = (language:GameLanguage): StoryEvent[] => catalog.map(seed=>({
  id:seed.id,minAge:seed.ages[0],maxAge:seed.ages[1],
  title:seed[language==='en'?'en':'pt'][0],
  description:seed[language==='en'?'en':'pt'][1],
  choices:seed.choices.map(ch=>({
    label:ch[language==='en'?'en':'pt'][0],
    result:ch[language==='en'?'en':'pt'][1],
    effects:{...ch.effects}
  }))
}));
/** Disallow narrative situations that don't match the current life. */
export function eventAllowed(event: StoryEvent, s: Simulation): boolean {
  if(event.id==='work-pressure' && ['none','retired'].includes(s.job))return false;
  if(event.id==='career-switch' && ['none','retired'].includes(s.job))return false;
  if(event.id==='scholarship' && s.education==='college')return false;
  if(event.id==='retirement-choice' && s.job==='none')return false;
  return true;
}
