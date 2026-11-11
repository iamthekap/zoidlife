import "./style.css";
import { randomCandidates, randomCharacter, normalizeProfile, portraitSvg, CITIES, COUNTRIES, GENDERS, SKINS, HAIRS, HAIR_COLORS, EYES, type Country, type CharacterProfile } from "./characters";
import { extraEvents, eventAllowed } from "./events-plus";
import { extendedEvents, extendedAllowed } from "./events-extended";
import { selectEvent, recordEvent, migrateLedger, type EventLedger } from "./event-engine";
import { eventScene, iconSvg } from "./event-scenes";
import { portraitLife, lifeStage } from "./life-art";
import { validateLifeSave, serializeLife, saveFilename } from "./save-io";
import { initialSocial, normalizeSocial, syncSocial, spendSocialTime, personAge, personLabel, type SocialState } from "./social";

import { createSimulation, loadSimulation, annualSalary, takeAction, passYear, applyNarrativeChoice, type Simulation, type Action, type WorldImpact, canTakeAction } from "./simulation";

type Language = "pt-BR" | "en";
type StatKey = "happiness" | "health" | "smarts" | "looks";
type Stats = Record<StatKey, number>;
type Choice = { label: string; result: string; effects: Partial<Stats>; world?: WorldImpact };
type LifeEvent = { id: string; minAge: number; maxAge: number; title: string; description: string; choices: Choice[]; category?: string };
type Life = {
  name: string;
  birthYear: number;
  age: number;
  stats: Stats;
  pendingEvent: LifeEvent | null;
  history: string[];
  seenEventIds: string[];
  eventLedger: EventLedger;
  lastEventId: string | null;
  simulation: Simulation;
  profile: CharacterProfile;
  familyMembers: {name:string; kind:"mother" | "father"; birthAge:number}[];
  social: SocialState;
};

const copy = {
  "pt-BR": {
    eyebrow: "SIMULADOR DE VIDA", title: "Sua vida. Suas escolhas.", intro: "Uma história é construída ano após ano. Decida como viver cada capítulo.",
    newLife: "Começar uma vida", continue: "Ver minha vida", continueText: "Sua próxima história está esperando para acontecer.",
    name: "Nome do personagem", namePlaceholder: "Digite um nome", start: "Começar", back: "Voltar",
    age: "anos", born: "Sua história", year: "Próximo ano", happiness: "Felicidade", health: "Saúde", smarts: "Inteligência", looks: "Aparência",
    nextYear: "Envelhecer", eventLabel: "ACONTECEU NA SUA VIDA", firstYear: "Um novo começo", firstYearText: "Sua jornada começa agora. Avance um ano para descobrir o que a vida reserva.",
    history: "Histórico de vida", noHistory: "Suas experiências aparecerão aqui conforme sua vida avançar.",
    saved: "Salvo neste dispositivo", language: "EN", footer: "ZOID LIFE • EM DESENVOLVIMENTO",
    nameRequired: "Digite um nome para continuar.", ageLabel: "IDADE", birth: "Nascimento",
    events: [
      { id: "school", minAge: 5, maxAge: 12, title: "O primeiro dia de aula", description: "Você chega à escola e percebe que ainda não conhece ninguém. Algumas crianças parecem querer fazer amizade.", choices: [
        { label: "Puxar conversa com outras crianças", result: "Você fez novas amizades e se sentiu mais à vontade na escola.", effects: { happiness: 9, looks: 1 } },
        { label: "Ficar mais quieto e observar", result: "Você passou o dia observando. Aos poucos, começou a entender como tudo funciona.", effects: { smarts: 5, happiness: -2 } },
        { label: "Participar de todas as atividades", result: "Você se envolveu nas atividades e descobriu coisas de que gosta.", effects: { smarts: 4, happiness: 4 } }
      ]},
      { id: "study", minAge: 13, maxAge: 17, title: "Uma prova importante", description: "Uma prova difícil está chegando. Você ainda não estudou o suficiente e precisa decidir como usar seu tempo.", choices: [
        { label: "Estudar durante a semana", result: "O esforço valeu a pena. Você se saiu melhor do que esperava.", effects: { smarts: 10, happiness: 2 } },
        { label: "Sair com os amigos", result: "Foi uma noite divertida, mas você não se preparou para a prova.", effects: { happiness: 8, smarts: -5 } },
        { label: "Tentar equilibrar estudo e descanso", result: "Você conseguiu revisar o conteúdo sem abrir mão de descansar.", effects: { smarts: 5, health: 3 } }
      ]},
      { id: "work", minAge: 18, maxAge: 64, title: "Uma oportunidade de trabalho", description: "Você encontra uma oportunidade que pode abrir portas, mas ela exige dedicação e algum sacrifício do seu tempo livre.", choices: [
        { label: "Aceitar o desafio", result: "Você decidiu investir nessa oportunidade e ganhou experiência.", effects: { smarts: 7, happiness: 2, health: -3 } },
        { label: "Priorizar sua vida pessoal", result: "Você escolheu preservar seu tempo e cuidar do próprio bem-estar.", effects: { happiness: 7, health: 4 } },
        { label: "Pesquisar melhor antes de decidir", result: "Você reuniu informações e aprendeu a avaliar oportunidades com mais cuidado.", effects: { smarts: 5 } }
      ]},
      { id: "hobby", minAge: 6, maxAge: 15, title: "Um novo interesse", description: "Você descobriu uma atividade que parece muito interessante. Talvez seja a chance de encontrar algo que realmente gosta de fazer.", choices: [
        { label: "Entrar em um curso ou clube", result: "Você começou a praticar regularmente e encontrou algo que faz seus dias mais interessantes.", effects: { happiness: 7, smarts: 3 } },
        { label: "Praticar por conta própria", result: "Você aprendeu no seu ritmo e desenvolveu disciplina.", effects: { smarts: 5, happiness: 3 } },
        { label: "Deixar para outra hora", result: "Você preferiu manter sua rotina como estava.", effects: { happiness: 1 } }
      ]},
      { id: "first-job", minAge: 15, maxAge: 19, title: "Seu primeiro dinheiro", description: "Surge a oportunidade de fazer um trabalho temporário e ganhar seu próprio dinheiro. Isso pode exigir abrir mão de parte do seu tempo livre.", choices: [
        { label: "Aceitar o trabalho", result: "Você ganhou experiência e sentiu orgulho de conquistar seu próprio dinheiro.", effects: { happiness: 5, smarts: 4, health: -2 } },
        { label: "Continuar focando nos estudos", result: "Você decidiu priorizar sua formação neste momento.", effects: { smarts: 6 } },
        { label: "Aproveitar o tempo livre", result: "Você escolheu descansar e passar mais tempo com amigos.", effects: { happiness: 6, health: 2 } }
      ]},
      { id: "relationship", minAge: 18, maxAge: 45, title: "Alguém especial", description: "Você conhece alguém com quem a conversa flui naturalmente. Parece existir uma conexão, mas relacionamentos exigem tempo e cuidado.", choices: [
        { label: "Convidar para sair", result: "Vocês começaram a se conhecer melhor e viveram bons momentos juntos.", effects: { happiness: 9 } },
        { label: "Manter apenas a amizade", result: "Vocês construíram uma amizade leve e respeitosa.", effects: { happiness: 5 } },
        { label: "Seguir caminhos diferentes", result: "Você decidiu não iniciar algo novo agora.", effects: { happiness: -1, smarts: 1 } }
      ]},
      { id: "family", minAge: 25, maxAge: 75, title: "Um momento em família", description: "Uma pessoa da sua família propõe um encontro. Sua agenda está cheia, mas esse momento pode fazer diferença.", choices: [
        { label: "Reservar um tempo para a família", result: "O encontro fortaleceu os laços e criou boas lembranças.", effects: { happiness: 8 } },
        { label: "Fazer uma ligação rápida", result: "Mesmo com pouco tempo, você conseguiu demonstrar carinho.", effects: { happiness: 4 } },
        { label: "Adiar o encontro", result: "Você deixou para outra ocasião e manteve o foco nas tarefas.", effects: { smarts: 1, happiness: -2 } }
      ]},
      { id: "wellness", minAge: 65, maxAge: 110, title: "Hora de cuidar de si", description: "Você percebe que sua rotina mudou. É uma boa oportunidade para pensar no que realmente importa nesta fase da vida.", choices: [
        { label: "Fazer uma caminhada e cuidar da saúde", result: "Uma rotina mais ativa fez bem ao seu corpo e ao seu humor.", effects: { health: 8, happiness: 3 } },
        { label: "Visitar pessoas queridas", result: "O encontro trouxe boas lembranças e aproximou você de quem ama.", effects: { happiness: 9 } },
        { label: "Aprender algo novo", result: "Você descobriu que sempre existe espaço para aprender.", effects: { smarts: 5, happiness: 3 } }
      ]}
    ] as LifeEvent[]
  },
  en: {
    eyebrow: "LIFE SIMULATOR", title: "Your life. Your choices.", intro: "A story unfolds one year at a time. Decide how to live each chapter.",
    newLife: "Start a life", continue: "View my life", continueText: "Your next chapter is waiting to happen.",
    name: "Character name", namePlaceholder: "Enter a name", start: "Begin", back: "Back",
    age: "years old", born: "Your story", year: "Next year", happiness: "Happiness", health: "Health", smarts: "Smarts", looks: "Looks",
    nextYear: "Age up", eventLabel: "SOMETHING HAPPENED", firstYear: "A new beginning", firstYearText: "Your journey starts now. Age up to discover what life has in store.",
    history: "Life history", noHistory: "Your experiences will appear here as your life unfolds.",
    saved: "Saved on this device", language: "PT", footer: "ZOID LIFE • IN DEVELOPMENT",
    nameRequired: "Enter a name to continue.", ageLabel: "AGE", birth: "Born",
    events: [
      { id: "school", minAge: 5, maxAge: 12, title: "The first day of school", description: "You arrive at school and realize you don't know anyone yet. Some children seem interested in making friends.", choices: [
        { label: "Start talking to other kids", result: "You made new friends and felt more comfortable at school.", effects: { happiness: 9, looks: 1 } },
        { label: "Stay quiet and observe", result: "You spent the day watching. Little by little, you learned how things work.", effects: { smarts: 5, happiness: -2 } },
        { label: "Join every activity", result: "You got involved and discovered new things you enjoy.", effects: { smarts: 4, happiness: 4 } }
      ]},
      { id: "study", minAge: 13, maxAge: 17, title: "An important exam", description: "A difficult exam is coming up. You haven't studied enough and need to decide how to spend your time.", choices: [
        { label: "Study throughout the week", result: "Your hard work paid off. You did better than expected.", effects: { smarts: 10, happiness: 2 } },
        { label: "Go out with friends", result: "You had a great night, but didn't prepare for the exam.", effects: { happiness: 8, smarts: -5 } },
        { label: "Balance study and rest", result: "You reviewed the material while still making time to rest.", effects: { smarts: 5, health: 3 } }
      ]},
      { id: "work", minAge: 18, maxAge: 64, title: "A work opportunity", description: "You find an opportunity that could open doors, but it requires dedication and some of your free time.", choices: [
        { label: "Take on the challenge", result: "You invested in the opportunity and gained experience.", effects: { smarts: 7, happiness: 2, health: -3 } },
        { label: "Prioritize your personal life", result: "You chose to protect your time and well-being.", effects: { happiness: 7, health: 4 } },
        { label: "Research before deciding", result: "You gathered information and learned to assess opportunities carefully.", effects: { smarts: 5 } }
      ]},
      { id: "hobby", minAge: 6, maxAge: 15, title: "A new interest", description: "You discover an activity that seems fascinating. Maybe this is a chance to find something you truly enjoy.", choices: [
        { label: "Join a class or club", result: "You started practicing regularly and found something that makes your days more interesting.", effects: { happiness: 7, smarts: 3 } },
        { label: "Practice on your own", result: "You learned at your own pace and developed discipline.", effects: { smarts: 5, happiness: 3 } },
        { label: "Leave it for another time", result: "You decided to keep your routine as it was.", effects: { happiness: 1 } }
      ]},
      { id: "first-job", minAge: 15, maxAge: 19, title: "Your first earnings", description: "A temporary job opportunity comes up. It could mean earning your own money, but giving up some free time.", choices: [
        { label: "Take the job", result: "You gained experience and felt proud to earn your own money.", effects: { happiness: 5, smarts: 4, health: -2 } },
        { label: "Focus on your studies", result: "You decided to prioritize your education for now.", effects: { smarts: 6 } },
        { label: "Enjoy your free time", result: "You chose to rest and spend more time with friends.", effects: { happiness: 6, health: 2 } }
      ]},
      { id: "relationship", minAge: 18, maxAge: 45, title: "Someone special", description: "You meet someone you can talk to effortlessly. There may be a connection, but relationships take time and care.", choices: [
        { label: "Ask them out", result: "You started getting to know each other and shared some great moments.", effects: { happiness: 9 } },
        { label: "Keep it as friendship", result: "You built a relaxed and respectful friendship.", effects: { happiness: 5 } },
        { label: "Go separate ways", result: "You decided not to start anything new right now.", effects: { happiness: -1, smarts: 1 } }
      ]},
      { id: "family", minAge: 25, maxAge: 75, title: "A family moment", description: "A family member suggests getting together. Your schedule is busy, but this moment could matter.", choices: [
        { label: "Make time for family", result: "The gathering strengthened bonds and created good memories.", effects: { happiness: 8 } },
        { label: "Make a quick call", result: "Even with little time, you managed to show you care.", effects: { happiness: 4 } },
        { label: "Postpone the visit", result: "You left it for another time and stayed focused on your tasks.", effects: { smarts: 1, happiness: -2 } }
      ]},
      { id: "wellness", minAge: 65, maxAge: 110, title: "Time to take care of yourself", description: "You notice your routine has changed. It's a good time to think about what matters most at this stage of life.", choices: [
        { label: "Go for walks and care for your health", result: "A more active routine helped your body and mood.", effects: { health: 8, happiness: 3 } },
        { label: "Visit people you care about", result: "The visit brought back good memories and brought you closer.", effects: { happiness: 9 } },
        { label: "Learn something new", result: "You discovered there is always room to learn.", effects: { smarts: 5, happiness: 3 } }
      ]}
    ] as LifeEvent[]
  }
} satisfies Record<Language, any>;


const STORAGE_KEY = "zoid-life-save-v1";
const LANG_KEY = "zoid-life-language";
type Scene = "welcome" | "selection" | "custom" | "playing";
type Tab = "story" | "actions" | "people" | "career" | "finances";
let language: Language = localStorage.getItem(LANG_KEY) === "en" ? "en" : "pt-BR";
let life: Life | null = loadLife();
let scene: Scene = "welcome";
let tab: Tab = "story";
let menuOpen=false;
let menuError="";
let candidates = randomCandidates(3);
let custom = { ...randomCharacter(), name: "" };
let customStats: Stats = {happiness: 70, health: 80, smarts: 55, looks: 60};
const titles: Record<Language, Record<string,string>> = {
  "pt-BR": {
    begin:"Sua próxima vida começa aqui.", tagline:"Mil caminhos possíveis. Uma história escrita por você.",
    menu:"Menu", newLife:"Nova vida", continue:"Continuar minha vida", start:"Começar a jogar",
    quick:"Escolher personagem", create:"Criar do zero", free:"Criação totalmente livre",
    noLogin:"Sem login. Sem cadastro. Apenas jogue.", select:"Escolha sua próxima história",
    selectSub:"Três pessoas com nomes, cidades e aparências sorteadas para você. Ou crie a sua.",
    reroll:"Sortear outros personagens", choose:"Viver esta vida", customIntro:"Crie seu personagem",
    customSub:"Você define quem nasce. O resto da história depende de suas escolhas.",
    preview:"Prévia do personagem", fullName:"Nome completo", gender:"Identidade", country:"País",
    city:"Cidade de nascimento", skin:"Tom de pele", hair:"Estilo de cabelo",
    hairColor:"Cor do cabelo", eyes:"Cor dos olhos", birthday:"Dia", month:"Mês",
    happiness:"Felicidade", health:"Saúde", smarts:"Inteligência", looks:"Aparência",
    startStory:"Iniciar essa vida", back:"Voltar", new:"Nova vida",
    story:"História", actions:"Atividades", people:"Relações", career:"Carreira", finances:"Finanças",
    yourStory:"A vida de", age:"anos", born:"Nasceu em", year:"Ano", life:"Sua vida",
    awaiting:"O que acontecerá neste ano?", ageUp:"Avançar um ano", birthdayLabel:"Um novo capítulo",
    event:"Acontecimento", choice:"Escolha como reagir", timeline:"Linha do tempo", noTimeline:"Sua história começa agora.",
    overview:"Indicadores", actionOnce:"Você pode fazer uma atividade por ano.",
    blockedEvent:"Resolva o acontecimento atual antes de realizar uma atividade.",
    actionDone:"Você já escolheu uma atividade neste ano.",
    study:"Estudar", job:"Procurar emprego", socialize:"Socializar",
    invest:"Investir", home:"Comprar imóvel", child:"Ter um filho",
    care:"Cuidar da saúde", budget:"Organizar finanças", retire:"Aposentar",
    studyInfo:"Aprenda e avance na formação.", jobInfo:"Tente conseguir uma ocupação compatível com sua experiência.",
    socializeInfo:"Fortaleça os vínculos que importam.", careInfo:"Melhore o bem-estar, com custos quando adulto.",
    budgetInfo:"Use dinheiro disponível para quitar dívidas.", retireInfo:"Encerre a carreira e viva outra fase.",
    investInfo:"Aplique parte de seu saldo e acompanhe o crescimento anual.",
    homeInfo:"Use uma entrada de 25 mil para financiar um imóvel.",
    childInfo:"Amplie sua família e assuma novas responsabilidades.",
    currentJob:"Ocupação", degree:"Escolaridade", credits:"Progresso acadêmico",
    experience:"Experiência", income:"Renda anual", balance:"Saldo", debt:"Dívidas",
    investments:"Investimentos", homeValue:"Valor do imóvel", netWorth:"Patrimônio líquido",
    children:"Filhos", homeOwned:"Imóvel próprio", yes:"Sim", no:"Não",
    expenses:"Despesas anuais previstas", family:"Família", friends:"Amizades", partner:"Parceria",
    relationship:"Situação afetiva", parents:"Pessoas da sua família",
    warningDebt:"Suas dívidas estão afetando sua qualidade de vida.",
    ended:"Fim da jornada", endedText:"Toda vida tem uma história. Esta chegou ao fim.",
    resetTitle:"Iniciar uma nova vida? O histórico atual será substituído.",
    saved:"Progresso salvo neste navegador", languages:"Idioma", infant:"Recém-nascido",
    none:"Nenhum", school:"Ensino fundamental", secondary:"Ensino médio", college:"Faculdade",
    parttime:"Meio período", service:"Serviços", office:"Escritório", professional:"Profissional", retired:"Aposentado",
    single:"Solteiro", dating:"Namorando", married:"Casado",
    woman:"Mulher", man:"Homem", nonbinary:"Não binário",
    light:"Claro", tan:"Médio", brown:"Moreno", deep:"Escuro",
    short:"Curto", waves:"Ondulado", curls:"Cacheado", long:"Comprido",
    black:"Preto", blonde:"Loiro", red:"Ruivo", blue:"Azuis", green:"Verdes",
    nameError:"Informe um nome para começar.",
    "school-start":"Você começou a frequentar a escola.",
    graduated:"Você concluiu o ensino médio.",
    "no-diploma":"Você não concluiu o ensino médio.",
    retirement:"Você se aposentou.", "relationship-ended":"Seu relacionamento chegou ao fim.",
    "financial-stress":"Dívidas elevadas afetam seu bem-estar.",
    "end-of-life":"Sua vida chegou ao fim.", "college-completed":"Você concluiu a faculdade.",
    "started-dating":"Um namoro começou.", "got-married":"Você se casou.",
    "first-paycheck":"Seu primeiro pagamento chegou.",
    incomeNote:"Renda recebida", expenseNote:"Despesas pagas", newJob:"Novo trabalho", debtPaid:"Dívida quitada", childcare:"Custos familiares",
    investmentNote:"Valor investido", "home-bought":"Você comprou seu imóvel.", "child-born":"Uma criança nasceu na família.",
    birthNote:"Você nasceu em", mother:"Mãe", father:"Pai",
    advanceBlocked:"Escolha uma resposta para continuar.", gameLabel:"SIMULADOR DE VIDA"
  },
  en: {
    begin:"Your next life begins here.", tagline:"Endless paths. One story written by you.",
    menu:"Menu", newLife:"New life", continue:"Continue my life", start:"Start playing",
    quick:"Choose a character", create:"Create from scratch", free:"Fully custom characters",
    noLogin:"No login. No signup. Just play.", select:"Choose your next story",
    selectSub:"Three randomly generated people, with names, cities, and appearances. Or create your own.",
    reroll:"Generate new characters", choose:"Live this life", customIntro:"Create your character",
    customSub:"You decide who is born. What happens next depends on your choices.",
    preview:"Character preview", fullName:"Full name", gender:"Identity", country:"Country",
    city:"Birthplace", skin:"Skin tone", hair:"Hair style", hairColor:"Hair color", eyes:"Eye color",
    birthday:"Day", month:"Month", happiness:"Happiness", health:"Health", smarts:"Smarts", looks:"Looks",
    startStory:"Begin this life", back:"Back", new:"New life",
    story:"Story", actions:"Activities", people:"Relationships", career:"Career", finances:"Finances",
    yourStory:"The life of", age:"years old", born:"Born in", year:"Year", life:"Your life",
    awaiting:"What will happen this year?", ageUp:"Age up one year", birthdayLabel:"A new chapter",
    event:"Life event", choice:"Choose how to respond", timeline:"Life timeline", noTimeline:"Your story begins here.",
    overview:"Vitals", actionOnce:"You can take one activity per year.",
    blockedEvent:"Resolve your current event before taking an activity.",
    actionDone:"You've already completed an activity this year.",
    study:"Study", job:"Find work", socialize:"Socialize",
    invest:"Invest", home:"Buy a home", child:"Have a child", care:"Look after health", budget:"Manage finances", retire:"Retire",
    studyInfo:"Keep learning and work toward your degree.", jobInfo:"Find work that matches your experience.",
    socializeInfo:"Strengthen bonds with people who matter.", careInfo:"Improve well-being, with costs for adults.",
    budgetInfo:"Use savings to pay down debts.", retireInfo:"Leave your job behind and enter a new chapter.",
    investInfo:"Invest part of your balance and grow it over time.",
    homeInfo:"Pay a 25k down payment to purchase a home.",
    childInfo:"Grow your family and take on new responsibilities.",
    currentJob:"Occupation", degree:"Education", credits:"Academic progress", experience:"Experience",
    income:"Yearly income", balance:"Balance", debt:"Debt", expenses:"Expected annual expenses",
    investments:"Investments", homeValue:"Home value", netWorth:"Net worth",
    children:"Children", homeOwned:"Owned home", yes:"Yes", no:"No",
    family:"Family", friends:"Friends", partner:"Partner", relationship:"Relationship status",
    parents:"Your family", warningDebt:"Your debt is affecting your quality of life.",
    ended:"End of the road", endedText:"Every life tells a story. This one has reached its ending.",
    resetTitle:"Start a new life? Your current story will be replaced.",
    saved:"Progress saved in this browser", languages:"Language", infant:"Newborn",
    none:"None", school:"Primary school", secondary:"High school", college:"College",
    parttime:"Part time", service:"Service", office:"Office", professional:"Professional", retired:"Retired",
    single:"Single", dating:"Dating", married:"Married", woman:"Woman", man:"Man", nonbinary:"Nonbinary",
    light:"Light", tan:"Tan", brown:"Brown", deep:"Deep",
    short:"Short", waves:"Wavy", curls:"Curly", long:"Long",
    black:"Black", blonde:"Blonde", red:"Red", blue:"Blue", green:"Green",
    nameError:"Enter a name to continue.",
    "school-start":"You started attending school.", graduated:"You graduated from high school.",
    "no-diploma":"You did not finish high school.", retirement:"You retired.",
    "relationship-ended":"Your relationship ended.", "financial-stress":"Debt is hurting your well-being.",
    "end-of-life":"Your life has ended.", "college-completed":"You graduated from college.",
    "started-dating":"A new relationship began.", "got-married":"You got married.",
    "first-paycheck":"You received your first paycheck.", incomeNote:"Income", expenseNote:"Living costs",
    newJob:"New job", debtPaid:"Paid down debt", childcare:"Family expenses",
    investmentNote:"Invested amount", "home-bought":"You bought your home.", "child-born":"A child was born in your family.",
    birthNote:"You were born in",
    mother:"Mother", father:"Father", advanceBlocked:"Choose a response to continue.", gameLabel:"LIFE SIMULATOR"
  }
};
function u(key: string): string { return titles[language][key] || key; }
function ageText(age:number):string {return age+" "+(language==="pt-BR"?(age===1?"ano":"anos"):(age===1?"year old":"years old"));}
function safe(value: string): string {
  return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char] || char));
}
function clamp(n: number): number { return Math.max(0,Math.min(100,Math.round(n))); }
function loadLife(): Life|null {
  try {
    const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return null;
    const r=JSON.parse(raw) as Partial<Life>;
    if(typeof r.name!=='string' || !r.name.trim() || typeof r.age!=='number' || !Number.isInteger(r.age) || !r.stats) return null;
    const stats=Object.fromEntries((['happiness','health','smarts','looks'] as StatKey[]).map(k => [k,clamp(Number(r.stats?.[k]??50))])) as Stats;
    const name=r.name.trim().slice(0,52);
    const fallbackFamily=makeFamily(name);
    const profile=normalizeProfile(r.profile,name);
    const simulation=loadSimulation(r.simulation);
    return { name,birthYear:Number.isInteger(r.birthYear)?Number(r.birthYear):new Date().getFullYear(),
      age:Math.min(110,Math.max(0,r.age)),stats,
      pendingEvent:r.pendingEvent && typeof r.pendingEvent==='object' ? r.pendingEvent:null,
      history:Array.isArray(r.history)?r.history.filter((x):x is string=>typeof x==='string').slice(-300):[],
      seenEventIds:Array.isArray(r.seenEventIds)?r.seenEventIds.filter((x):x is string=>typeof x==='string'):[],
      eventLedger:migrateLedger(r.eventLedger,r.seenEventIds),
      lastEventId:typeof r.lastEventId==='string'?r.lastEventId:null,
      simulation,profile,
      social:normalizeSocial(r.social,profile,r.age,simulation.children,Array.isArray(r.familyMembers)?r.familyMembers:fallbackFamily),
      familyMembers:Array.isArray(r.familyMembers) && r.familyMembers.length>0 ? r.familyMembers : fallbackFamily
    };
  } catch { return null; }
}
function saveLife(): void { try { if(life) localStorage.setItem(STORAGE_KEY,JSON.stringify(life)); } catch { /* Browser may restrict local saves */ } }
function makeFamily(name: string): Life['familyMembers'] {
  const last=name.trim().split(/\s+/).slice(-1)[0]||"Costa";
  return [{name:"Ana "+last,kind:"mother",birthAge:26+Math.floor(Math.random()*13)},
    {name:"Daniel "+last,kind:"father",birthAge:29+Math.floor(Math.random()*13)}];
}
function createLife(profile: CharacterProfile, stats: Stats): void {
  // Prevent accidental overwrites when someone picks a new baby or submits the editor.
  if(life && !window.confirm(language==='pt-BR'?
    'Começar uma nova vida vai substituir o progresso salvo neste navegador. Exporte seu save no menu antes, se quiser guardá-lo. Continuar?':
    'A new life will replace this browser save. Export it from the menu first if you want to keep it. Continue?'))return;
  const normalized=normalizeProfile(profile,profile.name);
  life={ name:normalized.name, profile:normalized, familyMembers:makeFamily(normalized.name),
    social:initialSocial(normalized),
    birthYear:new Date().getFullYear(),age:0,
    stats:{...stats},pendingEvent:null,history:[u("birthNote")+" "+normalized.city+", "+countryName(normalized.country)+"."],
    seenEventIds:[],eventLedger:{},lastEventId:null,simulation:createSimulation() };
  tab="story";scene="playing";saveLife();render();
}
function countryName(c: Country): string {
  return ({BR:"Brasil",US:language==="pt-BR"?"Estados Unidos":"United States",
    PT:"Portugal",UK:language==="pt-BR"?"Reino Unido":"United Kingdom",CA:language==="pt-BR"?"Canadá":"Canada"})[c];
}
function cash(amount: number): string {
  if (!life) return String(amount);
  const code=({BR:"BRL",US:"USD",PT:"EUR",UK:"GBP",CA:"CAD"} as const)[life.profile.country];
  return new Intl.NumberFormat(language==="pt-BR"?"pt-BR":"en-US",{style:"currency",currency:code,maximumFractionDigits:0}).format(amount);
}
function caption(s: string): string {
  if(s.startsWith("job:"))return u("newJob")+": "+u(s.slice(4));
  if(s.startsWith("income:"))return u("incomeNote")+": "+cash(Number(s.slice(7)));
  if(s.startsWith("expenses:"))return u("expenseNote")+": "+cash(Number(s.slice(9)));
  if(s.startsWith("debt-paid:"))return u("debtPaid")+": "+cash(Number(s.slice(10)));
  if(s.startsWith("investment:"))return u("investmentNote")+": "+cash(Number(s.slice(11)));
  if(s.startsWith("childcare:"))return u("childcare")+": "+cash(Number(s.slice(10)));
  if(s.startsWith("story-income:"))return (language==="pt-BR"?"Recebeu":"Received")+": "+cash(Number(s.slice(13)));
  if(s.startsWith("story-expense:"))return (language==="pt-BR"?"Gastou":"Spent")+": "+cash(Number(s.slice(14)));
  return u(s);
}
function button(label: string, action: string, extra=""): string {
  return '<button type="button" class="button '+extra+'" data-do="'+safe(action)+'">'+safe(label)+'</button>';
}
function brand(): string {
  return '<a href="#" class="brand" data-do="home" aria-label="Zoid Life"><span class="brand-glyph">Z</span><span>Zoid <b>Life</b></span></a>';
}
function render(): void {
  document.documentElement.lang=language;
  const app=document.querySelector<HTMLDivElement>("#app"); if(!app) return;
  const header=(scene==='playing'||scene==='welcome'||scene==='selection')?'':
    '<header class="topbar">'+brand()+
   '<div class="header-right"><span class="header-caption">'+safe(u("gameLabel"))+'</span>'+
   '<button class="lang-switch" type="button" data-do="language" aria-label="'+safe(u("languages"))+'">'+
   (language==="pt-BR"?"EN":"PT")+'</button></div></header>';
  const shell='<div class="app-shell">'+header+
   (scene==="welcome"?renderWelcome():scene==="selection"?renderSelection():
     scene==="custom"?renderCustom():renderPlay())+
   '<footer class="global-footer"><span>ZOID LIFE</span><span>GAME BUILD 0.5.0 · PT / EN</span></footer></div>';
  app.innerHTML=shell;
}
function renderWelcome(): string {
  const hasSave=Boolean(life);
  return '<main class="welcome-screen" data-screen="candidates">'+
    '<section class="welcome-headline"><button type="button" class="welcome-language" data-do="language" aria-label="'+safe(u("languages"))+'">'+(language==='pt-BR'?'EN':'PT')+'</button>'+ 
    '<div class="eyebrow"><span class="dot"></span>'+safe(u("gameLabel"))+'</div>'+
    '<div class="welcome-logo">ZOID<span>LIFE</span></div>'+
    '<h1>'+safe(language==="pt-BR"?"Quem você vai ser nesta vida?":"Who will you be in this life?")+'</h1>'+
    '<p>'+safe(language==="pt-BR"?"Três novos destinos. Escolha um bebê ou crie seu personagem — sem pagar e sem cadastro.":"Three new beginnings. Choose a baby or create your own — no signup or payment.")+'</p></section>'+
    '<section class="newborn-choice" aria-label="'+safe(u("select"))+'">'+
    '<div class="newborn-list">'+candidates.map((p,i)=>
      '<button type="button" class="newborn-card" data-do="preset-'+i+'" aria-label="'+safe(u("choose"))+': '+safe(p.name)+'">'+
      '<span class="newborn-art">'+portraitLife(p,0,"card")+'</span>'+
      '<span class="newborn-number">0'+(i+1)+' · '+safe(u("infant"))+'</span>'+
      '<strong>'+safe(p.name)+'</strong><small>'+safe(p.city)+' · '+safe(countryName(p.country))+'</small>'+
      '<span class="newborn-select">'+safe(u("choose"))+'</span></button>').join('')+'</div>'+
    '<div class="newborn-tools">'+button(language==="pt-BR"?"↻ Sortear outros três":"↻ Reroll three","reroll","secondary")+
    button(language==="pt-BR"?"+ Criar meu personagem":"+ Create my own","custom","outline")+'</div>'+
    (hasSave?'<div class="continue-life">'+button(u("continue"),"continue","primary")+
      '<span>'+safe(life!.name)+' · '+safe(ageText(life!.age))+'</span></div>':'')+'</section>'+
    '<div class="entry-footer"><span>'+safe(u("noLogin"))+'</span><span>BLUE EDITION · 0.5</span></div></main>';
}
function renderSelection(): string { return renderWelcome(); }
function option(value: string,label: string, selected: boolean): string {
  return '<option value="'+safe(value)+'"'+(selected?' selected':'')+'>'+safe(label)+'</option>';
}
function selectField(name: string,label: string, options: string[]): string {
  const current=String((custom as unknown as Record<string,string|number>)[name]);
  return '<label class="form-field"><span>'+safe(label)+'</span><select name="'+safe(name)+'" data-custom="'+safe(name)+'">'+
   options.map(v=>option(v,name==='country'?countryName(v as Country):u(v),v===current)).join('')+
   '</select></label>';
}
function renderCustom(): string {
  const profile=custom;
  const sliders: StatKey[]=["happiness","health","smarts","looks"];
  const numeric='<label class="form-field"><span>'+safe(u("birthday"))+'</span><input name="birthday" data-custom="birthday" type="number" min="1" max="28" value="'+profile.birthday+'"/></label>'+
    '<label class="form-field"><span>'+safe(u("month"))+'</span><input name="birthMonth" data-custom="birthMonth" type="number" min="1" max="12" value="'+profile.birthMonth+'"/></label>';
  return '<main class="custom-page">'+button(u("back"),"selection","ghost")+
    '<div class="page-heading"><div><h1>'+safe(u("customIntro"))+'</h1><p>'+safe(u("customSub"))+'</p></div></div>'+
    '<div class="creator-layout"><aside class="creator-preview"><span class="subtle-label">'+safe(u("preview"))+'</span>'+
    '<div id="creator-portrait">'+portraitLife(custom,0,"large")+'</div><h2 id="creator-preview-name">'+safe(custom.name||"Seu personagem")+'</h2>'+
    '<p>'+safe(custom.city)+' · '+safe(countryName(custom.country))+'</p></aside>'+
    '<form class="creator-form" id="creator-form">'+
    '<label class="form-field wide"><span>'+safe(u("fullName"))+'</span><input name="name" data-custom="name" type="text" minlength="2" maxlength="52" required placeholder="'+safe(u("fullName"))+'" value="'+safe(custom.name)+'" autocomplete="off"/></label>'+
    selectField("gender",u("gender"),GENDERS)+selectField("country",u("country"),COUNTRIES)+
    selectField("city",u("city"),[...CITIES[custom.country]])+
    selectField("skin",u("skin"),SKINS)+selectField("hair",u("hair"),HAIRS)+
    selectField("hairColor",u("hairColor"),HAIR_COLORS)+selectField("eyes",u("eyes"),EYES)+numeric+
    '<fieldset class="stats-editor wide"><legend>'+safe(u("overview"))+'</legend>'+
    sliders.map(k=>'<label class="slider-field"><span>'+safe(u(k))+'</span><input data-stat="'+k+'" name="'+k+
      '" type="range" min="10" max="100" step="5" value="'+customStats[k]+'"/><output data-value="'+k+'">'+customStats[k]+'%</output></label>').join('')+
    '</fieldset><div class="form-footer wide"><p id="form-error" role="alert"></p>'+
    '<button class="button primary fill" type="submit">'+safe(u("startStory"))+'</button></div></form></div></main>';
}
const tabIcons: Record<Tab,string>={story:"◷",actions:"✦",people:"♡",career:"▣",finances:"▤"};
const allTabs: Tab[]=["story","actions","people","career","finances"];
function tabs(): string {
  return allTabs.map(t=>'<button type="button" data-tab="'+t+'" class="nav-item'+(tab===t?' active':'')+
   '" aria-current="'+(tab===t?'page':'false')+'"><span class="nav-icon">'+tabIcons[t]+'</span><span>'+safe(u(t))+'</span></button>').join('');
}
function gameDock():string {
  if(!life)return '';
  const dockTab=(key:Tab,symbol:string)=>
    '<button type="button" data-tab="'+key+'" class="dock-tab'+(tab===key?' active':'')+
    '" aria-label="'+safe(u(key))+'"><span aria-hidden="true" class="dock-icon">'+iconSvg(symbol,29)+
    '</span><span>'+safe(u(key))+'</span></button>';
  const locked=Boolean(life.pendingEvent||life.simulation.ended);
  const age='<button type="button" data-do="age-up" class="dock-age"'+(locked?' disabled':'')+
   ' aria-label="'+safe(u("ageUp"))+'" title="'+safe(locked?u("advanceBlocked"):u("ageUp"))+'">'+
   '<span class="dock-plus" aria-hidden="true">+</span><span>'+safe(language==='pt-BR'?'Idade':'Age')+'</span></button>';
  return '<nav class="game-dock" aria-label="'+safe(u("menu"))+'">'+
    dockTab('career','book')+dockTab('finances','wallet')+age+
    dockTab('people','heart')+dockTab('actions','star')+'</nav>';
}
function renderPlay(): string {
  if(!life){scene="welcome";return renderWelcome();}
  const p=life.profile,s=life.simulation,stage=lifeStage(life.age);
  const phase=stage==='baby'?(language==='pt-BR'?'Bebê':'Baby'):
    stage==='child'?(language==='pt-BR'?'Infância':'Childhood'):
    stage==='teen'?(language==='pt-BR'?'Adolescência':'Teenager'):
    stage==='adult'?(language==='pt-BR'?'Vida adulta':'Adulthood'):
    (language==='pt-BR'?'Terceira idade':'Senior');
  return '<main class="game-layout" data-screen="playing">'+
    '<header class="game-status">'+
     '<button type="button" class="game-identity" data-tab="story" aria-label="'+safe(u("story"))+'">'+
     '<span class="identity-portrait">'+portraitLife(p,life.age,"tiny")+'</span>'+
     '<span class="identity-copy"><strong>'+safe(life.name)+'</strong>'+
     '<span>'+safe(p.city)+', '+safe(countryName(p.country))+' · '+safe(ageText(life.age))+'</span></span></button>'+
     '<div class="game-status-money"><small>'+safe(u("balance"))+'</small><strong>'+safe(cash(s.balance))+'</strong></div>'+ 
     '<button type="button" class="game-language" data-do="language" aria-label="'+safe(u("languages"))+'">'+(language==='pt-BR'?'EN':'PT')+'</button>'+
     '<button type="button" data-do="toggle-menu" class="game-menu" title="'+safe(u("newLife"))+'" aria-label="'+safe(u("newLife"))+'">☰</button>'+
    '</header>'+
    '<div class="game-content-layout"><section class="game-main">'+
      '<div class="current-phase"><span class="subtle-label">'+safe(language==='pt-BR'?'SUA HISTÓRIA':'YOUR STORY')+'</span>'+
      '<span>'+safe(phase)+'</span></div>'+
      (tab==='story'?renderStory():tab==='actions'?renderActions():
        tab==='people'?renderPeople():tab==='career'?renderCareer():renderFinances())+
      '<div class="mobile-vitals">'+renderVitals()+'</div></section>'+
      '<aside class="game-side">'+renderVitals()+
        '<div class="inspector-card side-profile">'+portraitLife(p,life.age,"medium")+
        '<strong>'+safe(life.name)+'</strong><span>'+safe(ageText(life.age))+'</span></div></aside>'+
    '</div>'+gameDock()+(menuOpen?renderGameMenu():'')+'</main>';
}

function renderVitals(): string {
  if (!life)return '';
  const icons:Record<StatKey,string>={happiness:"♡",health:"+",smarts:"✧",looks:"◈"};
  return '<section class="inspector-card vitals"><h2>'+safe(u("overview"))+'</h2>'+
   (["happiness","health","smarts","looks"] as StatKey[]).map(k=>'<div class="vital">'+
    '<div class="vital-label"><span>'+icons[k]+' '+safe(u(k))+'</span><b>'+life!.stats[k]+'%</b></div>'+
    '<div class="bar"><span style="width:'+clamp(life!.stats[k])+'%"></span></div></div>').join('')+'</section>';
}
/** Timeline is a chronological record, not a random event card with no history. */
function timelineEntries():string {
  if(!life)return '';
  const entries=life.history.slice(-100).reverse();
  const item=(line:string)=>{
    const parsed=/^(\d{1,3}):\s*(.*)$/.exec(line);
    const age=parsed?Number(parsed[1]):0,text=parsed?parsed[2]:line;
    const icon=/escol|estud|schol|faculdade|educa|curso|gradua|univer|aprend/i.test(text)?'book':
      /trabal|empreg|carreira|job|work|profiss/i.test(text)?'briefcase':
      /dinheiro|saldo|receb|dívida|invest|income|debt|cash|financ/i.test(text)?'wallet':
      /saúde|health|médic|doença|hospital/i.test(text)?'medkit':
      /amig|famíl|relacion|casou|namor|child|partner|friend/i.test(text)?'heart':'star';
    return '<li class="life-entry"><span class="entry-glyph">'+iconSvg(icon,24)+'</span>'+
      '<div class="entry-content"><span class="entry-age">'+safe(u("age"))+': '+age+'</span>'+
      '<p>'+safe(text)+'</p></div></li>';
  };
  return '<section class="life-journal"><div class="journal-heading"><h2>'+safe(u("timeline"))+'</h2>'+
    '<span>'+entries.length+' '+safe(language==='pt-BR'?'registros':'entries')+'</span></div>'+
    (entries.length?'<ol>'+entries.map(item).join('')+'</ol>':'<p>'+safe(u("noTimeline"))+'</p>')+'</section>';
}
function renderStory():string {
  if(!life)return '';
  const event=life.pendingEvent;
  const eventHtml=event?'<section class="story-event decision-card">'+
      eventScene(event.id,life.profile,language,life.age,event.category)+
      '<div class="decision-body"><span class="story-label">'+safe(u("event"))+' · '+safe(ageText(life.age))+'</span>'+
      '<h2>'+safe(event.title)+'</h2><p>'+safe(event.description)+'</p>'+
      '<div class="event-choices">'+event.choices.map((c,i)=>'<button type="button" data-choice="'+i+
      '" class="choice"><span>'+safe(c.label)+'</span><span class="choice-index">'+(i+1)+'</span></button>').join('')+
      '</div></div></section>':
    life.simulation.ended?'<section class="story-event end-event"><h2>'+safe(u("ended"))+'</h2><p>'+safe(u("endedText"))+'</p>'+
     button(u("newLife"),"new-life","primary")+'</section>':
    '<div class="age-ready"><span class="ready-spark">✦</span>'+
     '<span>'+safe(language==='pt-BR'?'Um novo ano espera por você. Use + Idade no centro da barra inferior.':
      'A new year is waiting. Press + Age in the center below.')+'</span></div>';
  return '<section class="story-layout game-feed">'+
    '<div class="story-intro"><div><strong>'+safe(language==='pt-BR'?'Diário de vida':'Life journal')+'</strong>'+
    '<span>'+safe(u("year"))+' '+(life.birthYear+life.age)+'</span></div>'+
    '<button type="button" data-tab="actions" class="subtle-link">'+safe(u("actions"))+'</button></div>'+
    eventHtml+timelineEntries()+'</section>';
}

const actionTypes: Action[]=['study','job','socialize','care','budget','invest','home','child','retire'];
function canAction(action: Action): boolean {
  if (!life || life.simulation.ended || life.pendingEvent || !canTakeAction(life.simulation,life.age,action))return false;
  return action==='study'?life.age>=6:action==='job'?life.age>=16&&life.age<65:
    action==='budget'?life.age>=16:action==='invest'?life.age>=18&&life.simulation.balance>=1000:
    action==='home'?life.age>=21&&!life.simulation.homeOwned&&life.simulation.balance>=25000:
    action==='child'?life.age>=20&&life.age<=55&&life.simulation.relationship!=='single'&&life.simulation.partner>=50&&life.simulation.children<8:
    action==='retire'?life.age>=60&&!['none','retired'].includes(life.simulation.job):true;
}
function actionButton(action: Action): string {
 const used=Boolean(life && life.simulation.actionLedger?.[action]===life.age);
 return '<button type="button" data-action="'+action+'" class="activity-card"'+(canAction(action)?'':' disabled')+'>'+
   '<strong>'+safe(u(action))+'</strong><span>'+safe(used?
     (language==='pt-BR'?'Realizada neste ano':'Done this year'):u(action+'Info'))+'</span>'+
   '<i aria-hidden="true">›</i></button>';
}
function renderActions(): string {
  if(!life)return '';
  const note=life.pendingEvent?u("blockedEvent"):(language==="pt-BR"?"Você pode fazer atividades diferentes no mesmo ano. Cada uma pode ser realizada uma vez por ano.":"Do different activities in the same year. Each activity is available once per year.");
  return '<section class="content-panel"><div class="panel-heading"><h2>'+safe(u("actions"))+'</h2><p>'+safe(note)+'</p></div>'+
    '<div class="activity-grid">'+actionTypes.map(actionButton).join('')+'</div></section>';
}
function progress(label: string, amount: number): string {
  return '<div class="relationship-progress"><div><span>'+safe(label)+'</span><b>'+clamp(amount)+'%</b></div>'+
  '<div class="bar"><span style="width:'+clamp(amount)+'%"></span></div></div>';
}
function renderPeople(): string {
  if(!life)return '';
  const s=life.simulation;
  const social=life.social.people;
  const bondRow=(p:typeof social[number])=>{
    const age=personAge(p,life!.age);
    const canVisit=p.alive&&!life!.pendingEvent&&!s.ended&&canTakeAction(s,life!.age,"socialize");
    return '<article class="person-card"><div class="person-art">'+portraitLife(p.profile,age,"tiny")+'</div>'+
      '<div class="person-details"><strong>'+safe(p.profile.name)+'</strong>'+
      '<span>'+safe(personLabel(p.role,language))+' · '+safe(ageText(age))+
      (p.alive?'':(language==="pt-BR"?" · Falecido":" · Deceased"))+'</span>'+
      '<div class="person-bond"><span style="width:'+p.closeness+'%"></span></div>'+
      '<small>'+safe(language==="pt-BR"?"Vínculo":"Bond")+': '+p.closeness+'%</small></div>'+
      '<button type="button" data-person="'+safe(p.id)+'"'+(canVisit?'':' disabled')+
       ' class="person-visit">'+safe(language==="pt-BR"?"Conversar":"Spend time")+'</button></article>';
  };
  return '<section class="content-panel people-panel"><div class="panel-heading"><h2>'+safe(u("people"))+'</h2>'+
   '<p>'+safe(u("relationship"))+': '+safe(u(s.relationship))+' · '+safe(language==="pt-BR"?"Cada pessoa tem uma história e um vínculo próprio.":"Every person has their own story and bond.")+'</p></div>'+
   '<div class="relation-grid">'+progress(u("family"),s.family)+progress(u("friends"),s.friends)+
   (s.relationship!=="single"?progress(u("partner"),s.partner):'')+'</div>'+
   '<div class="people-list">'+social.map(bondRow).join('')+'</div>'+
   '<div class="data-list">'+pair(u("children"),String(s.children))+'</div>'+
   '<div class="context-action activity-grid">'+actionButton("child")+'</div></section>';
}
function pair(label: string,value:string): string {return '<div class="data-row"><span>'+safe(label)+'</span><strong>'+safe(value)+'</strong></div>';}
function renderCareer(): string {
  if(!life)return '';
  const s=life.simulation;
  return '<section class="content-panel"><div class="panel-heading"><h2>'+safe(u("career"))+'</h2></div>'+
    '<div class="data-list">'+pair(u("degree"),u(s.education))+pair(u("credits"),String(s.credits))+
    pair(u("currentJob"),u(s.job))+pair(u("experience"),String(s.experience))+
    pair(u("income"),cash(annualSalary(s)))+'</div>'+
    '<div class="activity-grid">'+actionButton("study")+actionButton("job")+'</div></section>';
}
function renderFinances(): string {
  if(!life)return '';
  const s=life.simulation;
  return '<section class="content-panel"><div class="panel-heading"><h2>'+safe(u("finances"))+'</h2></div>'+
    '<div class="money-headline"><div><span>'+safe(u("balance"))+'</span><strong>'+safe(cash(s.balance))+'</strong></div>'+
    '<div><span>'+safe(u("debt"))+'</span><strong>'+safe(cash(s.debt))+'</strong></div></div>'+
    '<div class="data-list">'+pair(u("income"),cash(annualSalary(s)))+
    pair(u("investments"),cash(s.investments))+pair(u("homeValue"),cash(s.homeValue))+
    pair(u("netWorth"),cash(s.balance+s.investments+s.homeValue-s.debt))+
    pair(u("expenses"),cash((life.age>=65?8500:10500)+(s.homeOwned?1800:0)+2000*s.children))+'</div>'+
    (s.debt>=30000?'<p class="debt-warning">'+safe(u("warningDebt"))+'</p>':'')+
    '<div class="activity-grid">'+actionButton("budget")+actionButton("invest")+actionButton("home")+'</div></section>';
}
function quietEvent(): LifeEvent {
  const pt=language==="pt-BR";
  return {id:"quiet-year",minAge:0,maxAge:110,title:pt?"Um ano de pequenas escolhas":"A year of small choices",
    description:pt?"Até os anos tranquilos podem mudar sua história. Como você quer viver este período?":"Even quieter years shape your story. What will you prioritize?",
    choices:[
      {label:pt?"Aproveitar a companhia das pessoas queridas":"Spend time with loved ones",
        result:pt?"Você fortaleceu os laços com as pessoas próximas.":"You strengthened your bonds.",
        effects:{happiness:5}},
      {label:pt?"Explorar algo novo":"Try something new",
        result:pt?"Você descobriu um interesse que pode crescer com o tempo.":"You discovered a new interest.",
        effects:{smarts:4}},
      {label:pt?"Cuidar do corpo e da mente":"Care for body and mind",
        result:pt?"Você investiu no seu bem-estar.":"You invested in your well-being.",
        effects:{health:5}}
    ]};
}
function activeEventForLanguage(): void {
  if(!life?.pendingEvent)return;
  const id=life.pendingEvent.id;
  if(id==="quiet-year"){life.pendingEvent=quietEvent();return;}
  const localized=([...(copy[language].events as LifeEvent[]), ...extraEvents(language),...extendedEvents(language)] as LifeEvent[]).find(e=>e.id===id);
  if(localized)life.pendingEvent=localized;
}
function syncLifePeople():void {
 if(!life)return;
 const result=syncSocial(life.social,life.profile,life.age,life.simulation.relationship,life.simulation.children,life.simulation.partner);
 life.social=result.social;
 for(const note of result.notes){
   const words=note==='partner-introduced'?
     (language==='pt-BR'?'Você conheceu uma pessoa especial.':'You met someone special.'):
     note==='child-added'?
     (language==='pt-BR'?'Um novo membro entrou para a família.':'A new member joined the family.'):
     (language==='pt-BR'?'Uma pessoa da família faleceu.':'A family member passed away.');
   life.history.push(life.age+': '+words);
 }
}
function visitPerson(id:string):void {
 if(!life||life.pendingEvent||life.simulation.ended)return;
 const person=life.social.people.find(p=>p.id===id&&p.alive);
 if(!person)return;
 const result=takeAction(life.simulation,life.stats,life.age,'socialize');
 if(!result.ok)return;
 life.simulation=result.state;life.stats=result.stats;
 life.social=spendSocialTime(life.social,id,life.age);
 life.history.push(life.age+': '+(language==='pt-BR'?'Você passou um tempo com ':'You spent time with ')+person.profile.name+'.');
 syncLifePeople();saveLife();render();
}

function ageUp(): void {
  if (!life || life.pendingEvent || life.simulation.ended)return;
  const age=life.age+1;
  const transition=passYear(life.simulation,life.stats,age);
  if(!transition.ok)return;
  life.age=age;life.simulation=transition.state;life.stats=transition.stats;
  syncLifePeople();
  transition.notes.forEach(n=>life!.history.push(age+": "+caption(n)));
  if (!transition.state.ended) {
    const eligible=([...(copy[language].events as LifeEvent[]),...extraEvents(language),...extendedEvents(language).filter(e=>extendedAllowed(e,life!.simulation))] as LifeEvent[]).filter(e=>eventAllowed(e,life!.simulation));
    life.pendingEvent=selectEvent(eligible,age,life.eventLedger,life.lastEventId)??quietEvent();
  }
  saveLife();tab="story";render();
}
function choose(index:number): void {
  if (!life?.pendingEvent)return;
  const event=life.pendingEvent;const choice=event.choices[index];if(!choice)return;
  const result=applyNarrativeChoice(life.simulation,life.stats,life.age,event.id,index,choice.effects,choice.world);
  if(!result.ok)return;
  life.simulation=result.state;life.stats=result.stats;
  syncLifePeople();
  life.history.push(life.age+": "+choice.result);
  for(const n of result.notes)life.history.push(life.age+": "+caption(n));
  if(event.id!=="quiet-year"){
    if(!life.seenEventIds.includes(event.id))life.seenEventIds.push(event.id);
    life.eventLedger=recordEvent(life.eventLedger,event.id,life.age);
  }
  life.lastEventId=event.id;
  life.pendingEvent=null;saveLife();render();
}
function act(action:Action): void {
  if(!life || !canAction(action))return;
  const result=takeAction(life.simulation,life.stats,life.age,action);
  if(!result.ok)return;
  life.simulation=result.state;life.stats=result.stats;
  syncLifePeople();
  life.history.push(life.age+": "+u(action));
  for(const n of result.notes)life.history.push(life.age+": "+caption(n));
  saveLife();render();
}
function changeLanguage(): void {
  language=language==="pt-BR"?"en":"pt-BR";
  try{localStorage.setItem(LANG_KEY,language);}catch{}
  activeEventForLanguage();render();
}
function renderGameMenu():string {
 return '<div class="game-menu-backdrop"><section class="game-menu-panel" role="dialog" aria-modal="true" aria-label="'+
  safe(language==='pt-BR'?'Menu da vida':'Life menu')+'">'+
  '<div class="menu-title"><div><span class="subtle-label">ZOID LIFE</span><h2>'+
  safe(language==='pt-BR'?'Sua vida está salva':'Your life is saved')+'</h2></div>'+
  '<button type="button" data-do="close-menu" class="menu-close" aria-label="'+safe(u("back"))+'">×</button></div>'+
  '<p>'+safe(language==='pt-BR'?'Sem cadastro: o jogo salva neste navegador. Faça uma cópia para jogar em outro dispositivo.':
  'No account needed: this browser saves your progress. Export a copy for another device.')+'</p>'+
  '<div class="menu-buttons">'+
   button(language==='pt-BR'?'Baixar meu save (.json)':'Download my save (.json)','export-save','secondary fill')+
   button(language==='pt-BR'?'Importar um save':'Import a save','import-save','outline fill')+
   button(language==='pt-BR'?'Voltar à escolha de personagens':'Back to character selection','home','outline fill')+
   button(language==='pt-BR'?'Começar outra vida':'Start a new life','new-life','outline fill')+'</div>'+
   '<input id="life-save-file" type="file" accept=".json,application/json" hidden />'+
   (menuError?'<p class="menu-error" role="alert">'+safe(menuError)+'</p>':'')+
   '<small>'+safe(language==='pt-BR'?'Importar substitui a vida atual somente depois que o arquivo for validado.':
    'Import replaces the current life only after the file is validated.')+'</small>'+
 '</section></div>';
}
function downloadLife():void {
 if(!life)return;
 const data=serializeLife(life);
 const url=URL.createObjectURL(new Blob([data],{type:'application/json;charset=utf-8'}));
 const a=document.createElement('a');
 a.href=url;a.download=saveFilename(life.name);
 document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1200);
}
async function importLife(file:File):Promise<void> {
 try {
  if(file.size>1_000_000)throw Error('too-large');
  const parsed=validateLifeSave(await file.text());
  if(!parsed.ok)throw Error(parsed.error);
  const original=localStorage.getItem(STORAGE_KEY);
  try {
   localStorage.setItem(STORAGE_KEY,JSON.stringify(parsed.value));
   const restored=loadLife();
   if(!restored)throw Error('invalid-life');
   life=restored;tab='story';scene='playing';menuOpen=false;menuError='';render();
  }catch(error){
   if(original===null)localStorage.removeItem(STORAGE_KEY);
   else localStorage.setItem(STORAGE_KEY,original);
   throw error;
  }
 }catch{
  menuError=language==='pt-BR'?'O arquivo não é um save válido do Zoid Life. Sua vida atual foi preservada.':
    'This is not a valid Zoid Life save. Your existing life was kept.';
  menuOpen=true;render();
 }
}

function newLife(): void {
  if(life && !window.confirm(u("resetTitle")))return;
  life=null;try{localStorage.removeItem(STORAGE_KEY);}catch{}
  candidates=randomCandidates(3);scene="welcome";menuOpen=false;render();
}
function handleAction(value:string):void {
  if(value==="language"){changeLanguage();return;}
  if(value==="toggle-menu"){menuOpen=!menuOpen;menuError="";render();return;}
  if(value==="close-menu"){menuOpen=false;menuError="";render();return;}
  if(value==="export-save"){downloadLife();return;}
  if(value==="import-save"){appEl?.querySelector<HTMLInputElement>("#life-save-file")?.click();return;}
  if(value==="home"){scene="welcome";menuOpen=false;render();return;}
  if(value==="new-life"){newLife();return;}
  if(value==="selection"){scene="welcome";render();return;}
  if(value==="reroll"){candidates=randomCandidates(3);scene="welcome";render();return;}
  if(value==="custom"){custom={...randomCharacter(),name:""};customStats={happiness:70,health:80,smarts:55,looks:60};scene="custom";render();return;}
  if(value==="continue"){scene="playing";tab="story";render();return;}
  if(value==="age-up"){ageUp();return;}
  if(value.startsWith("preset-")){
    const i=Number(value.slice(7));const profile=candidates[i];
    if(profile)createLife(profile,{happiness:45+Math.floor(Math.random()*40),health:60+Math.floor(Math.random()*35),
      smarts:35+Math.floor(Math.random()*55),looks:40+Math.floor(Math.random()*55)});
  }
}
const appEl=document.querySelector<HTMLDivElement>("#app");
appEl?.addEventListener("click",e=>{
  const target=e.target as HTMLElement;
  const person=target.closest<HTMLButtonElement>("[data-person]");
  if(person){visitPerson(person.dataset.person||'');return;}
  const nav=target.closest<HTMLButtonElement>("[data-tab]");
  if(nav){tab=nav.dataset.tab as Tab;render();return;}
  const choice=target.closest<HTMLButtonElement>("[data-choice]");
  if(choice){choose(Number(choice.dataset.choice));return;}
  const action=target.closest<HTMLButtonElement>("[data-action]");
  if(action){act(action.dataset.action as Action);return;}
  const btn=target.closest<HTMLButtonElement>("[data-do]");
  if(btn){e.preventDefault();handleAction(btn.dataset.do||"");}
});
appEl?.addEventListener("input",e=>{
  const target=e.target as HTMLInputElement;
  if(target.dataset.stat){
    const k=target.dataset.stat as StatKey;customStats[k]=clamp(Number(target.value));
    const output=appEl.querySelector<HTMLOutputElement>('[data-value="'+k+'"]');
    if(output)output.textContent=customStats[k]+"%";
  }
  if(target.name==="name" && scene==="custom"){
    custom.name=target.value;
    const display=appEl.querySelector("#creator-preview-name");
    if(display)display.textContent=target.value||u("preview");
  }
});
appEl?.addEventListener("change",e=>{
  const fileInput=e.target as HTMLInputElement;
  if(fileInput.id==="life-save-file"){
    const chosen=fileInput.files?.[0];
    if(chosen)void importLife(chosen);
    return;
  }

  if(scene!=="custom")return;
  const input=e.target as HTMLInputElement|HTMLSelectElement;
  const name=input.dataset.custom; if(!name)return;
  if(name==="name"){custom.name=input.value;return;}
  if(name==="birthday"||name==="birthMonth"){
    const val=Number(input.value);
    if(Number.isFinite(val)) (custom as unknown as Record<string,number>)[name]=val;
    return;
  }
  (custom as unknown as Record<string,string>)[name]=input.value;
  if(name==="country")custom.city=CITIES[custom.country][0];
  custom=normalizeProfile(custom,custom.name||"");
  render();
});
appEl?.addEventListener("submit",e=>{
  const form=(e.target as HTMLElement).closest<HTMLFormElement>("#creator-form");
  if(!form)return;
  e.preventDefault();
  const data=new FormData(form);
  const name=String(data.get("name")||"").trim();
  if(name.length<2){const alert=appEl.querySelector("#form-error");if(alert)alert.textContent=u("nameError");return;}
  const result=normalizeProfile({...custom,name,birthday:Number(data.get("birthday")),birthMonth:Number(data.get("birthMonth"))},name);
  createLife(result,customStats);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&menuOpen){menuOpen=false;menuError="";render();}
});
/** Visible app boot state, removed once the game model is ready. */
appEl!.innerHTML='<div class="boot-screen"><span class="boot-mark">Z</span><strong>ZOID LIFE</strong><div class="boot-progress"></div></div>';
window.setTimeout(render,380);
