import "./style.css";
import { createSimulation, loadSimulation, annualSalary, takeAction, passYear, applyNarrativeChoice, type Simulation, type Action } from "./simulation";

type Language = "pt-BR" | "en";
type StatKey = "happiness" | "health" | "smarts" | "looks";
type Stats = Record<StatKey, number>;
type Choice = { label: string; result: string; effects: Partial<Stats> };
type LifeEvent = { id: string; minAge: number; maxAge: number; title: string; description: string; choices: Choice[] };
type Life = {
  name: string;
  birthYear: number;
  age: number;
  stats: Stats;
  pendingEvent: LifeEvent | null;
  history: string[];
  seenEventIds: string[];
  simulation: Simulation;
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
let language: Language = "pt-BR";
let life: Life | null = loadLife();

function loadLife(): Life | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Life;
    if (!parsed.name || !parsed.stats || typeof parsed.age !== "number") return null;
    return { ...parsed, pendingEvent: parsed.pendingEvent ?? null, history: parsed.history ?? [], seenEventIds: parsed.seenEventIds ?? [], simulation: loadSimulation(parsed.simulation) };
  } catch { return null; }
}
function saveLife(): void { if (life) localStorage.setItem(STORAGE_KEY, JSON.stringify(life)); }
function t(key: string): string { const dictionary: Record<string, any> = copy[language]; return dictionary[key] ?? key; }
function clamp(value: number): number { return Math.max(0, Math.min(100, value)); }
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] ?? char);
}
function render(): void {
  document.documentElement.lang = language;
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Zoid Life home"><span class="brand-mark">Z</span><span>zoid<span class="brand-light">life</span></span></a>
        <button class="language-button" id="language-toggle" type="button">${t("language")}</button>
      </header>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span class="status-dot"></span>${t("eyebrow")}</p>
          <h1>${t("title")}</h1><p class="intro">${t("intro")}</p>
          <button class="primary-button" id="new-life" type="button">${life ? t("continue") : t("newLife")}</button>
        </div>
        <div class="hero-note" aria-hidden="true"><span>01</span><p>EVERY YEAR<br/>IS A NEW CHAPTER</p></div>
      </section>
      <section class="workspace" id="workspace">${life ? renderLife() : `
        <div class="welcome-card"><div class="welcome-icon">Z</div><div><h2>${t("firstYear")}</h2><p>${t("firstYearText")}</p></div></div>`}</section>
      <footer><span>${t("footer")}</span><span>BUILD 0.2.0</span></footer>
    </main>`;
  document.querySelector("#language-toggle")?.addEventListener("click", () => { language = language === "pt-BR" ? "en" : "pt-BR"; render(); });
  document.querySelector("#new-life")?.addEventListener("click", () => { if (life) document.querySelector("#workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }); else showCharacterForm(); });
  document.querySelector("#next-year")?.addEventListener("click", advanceYear);
  document.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((button) => button.addEventListener("click", () => chooseEvent(Number(button.dataset.choice))));
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => button.addEventListener("click", () => applyPlayerAction(button.dataset.action as Action)));
}
function renderLife(): string {
  if (!life) return "";
  const stats: [StatKey, string][] = [["happiness", "☺"], ["health", "＋"], ["smarts", "◆"], ["looks", "◇"]];
  const event = life.simulation.ended ? null : life.pendingEvent;
  return `
    <div class="life-card">
      <div class="life-heading"><div><p class="eyebrow">${t("born")}</p><h2>${escapeHtml(life.name)}</h2><p class="muted">${t("birth")} ${life.birthYear}</p></div><div class="age-box"><span>${t("ageLabel")}</span><b>${life.age}</b></div></div>
      <div class="stats-grid">${stats.map(([key, symbol]) => `<div class="stat"><div class="stat-top"><span>${symbol} ${t(key)}</span><b>${life!.stats[key]}%</b></div><div class="stat-track"><span style="width:${clamp(life!.stats[key])}%"></span></div></div>`).join("")}</div>
      ${renderSimulation()}
      ${event ? `
        <article class="event-card"><p class="event-kicker">${t("eventLabel")} • ${life.age} ${t("age")}</p><h3>${escapeHtml(event.title)}</h3><p class="event-description">${escapeHtml(event.description)}</p>
          <div class="choice-list">${event.choices.map((choice, index) => `<button class="choice-button" data-choice="${index}" type="button"><span>${escapeHtml(choice.label)}</span><span class="choice-number">${index + 1}</span></button>`).join("")}</div>
        </article>` : life.simulation.ended ? `<article class="event-card"><p class="event-kicker">${escapeHtml(systemText("end-of-life"))}</p><h3>${escapeHtml(systemText("life-ended"))}</h3></article>` : `
        <article class="event-card"><p class="event-kicker">${t("year")} ${life.age + 1}</p><h3>${t("firstYear")}</h3><p class="event-description">${t("firstYearText")}</p><button class="primary-button compact" id="next-year" type="button">${t("nextYear")}</button></article>`}
      <section class="history"><h3>${t("history")}</h3>${life.history.length ? `<ol>${life.history.slice(-5).reverse().map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : `<p class="muted">${t("noHistory")}</p>`}</section>
      <div class="life-actions"><span class="saved-note">● ${t("saved")}</span><button class="text-button" id="reset-life" type="button">${language === "pt-BR" ? "Nova vida" : "New life"}</button></div>
    </div>`;
}

function systemText(key: string): string {
  const labels: Record<Language, Record<string,string>> = {
    "pt-BR": {
      systems:"Sua vida em números", balance:"Saldo", debt:"Dívidas", income:"Renda anual",
      education:"Formação", job:"Carreira", experience:"Experiência", family:"Família",
      friends:"Amizades", partner:"Parceria", relationships:"Relacionamento", credits:"Pontos de estudo",
      none:"Nenhum", school:"Na escola", secondary:"Ensino médio", college:"Faculdade",
      parttime:"Meio período", service:"Serviços", office:"Escritório", professional:"Profissional",
      retired:"Aposentado", single:"Solteiro", dating:"Namorando", married:"Casado",
      "action-study":"Estudar", "action-job":"Buscar trabalho", "action-socialize":"Conviver",
      "action-care":"Cuidar da saúde", "action-budget":"Organizar finanças", "action-retire":"Aposentar",
      "actions":"Ações deste ano", "actions-done":"Você já realizou sua ação deste ano.",
      "school-start":"Você começou a frequentar a escola.",
      graduated:"Você concluiu o ensino médio graças aos estudos.",
      "no-diploma":"Você não conseguiu concluir o ensino médio.",
      retirement:"Você se aposentou.", "relationship-ended":"Seu relacionamento chegou ao fim.",
      "financial-stress":"As dívidas estão afetando sua saúde e felicidade.",
      "end-of-life":"Fim da vida", "life-ended":"Esta história chegou ao fim. Você pode começar uma nova vida.",
      "college-completed":"Você concluiu a faculdade.", "started-dating":"Iniciou um namoro.",
      "got-married":"Você se casou.", "first-paycheck":"Você recebeu seu primeiro pagamento.",
      "new-job":"Novo trabalho: ", "debt-paid":"Pagamento de dívida: "
    },
    en: {
      systems:"Your life in numbers", balance:"Balance", debt:"Debt", income:"Yearly income",
      education:"Education", job:"Career", experience:"Experience", family:"Family",
      friends:"Friends", partner:"Partner", relationships:"Relationship", credits:"Study points",
      none:"None", school:"At school", secondary:"High school", college:"College",
      parttime:"Part-time", service:"Services", office:"Office", professional:"Professional",
      retired:"Retired", single:"Single", dating:"Dating", married:"Married",
      "action-study":"Study", "action-job":"Look for work", "action-socialize":"Spend time together",
      "action-care":"Look after health", "action-budget":"Manage finances", "action-retire":"Retire",
      "actions":"Actions this year", "actions-done":"You have already taken an action this year.",
      "school-start":"You started school.", graduated:"Your studies helped you graduate from high school.",
      "no-diploma":"You did not complete high school.", retirement:"You retired.",
      "relationship-ended":"Your relationship ended.",
      "financial-stress":"Debt is taking a toll on your health and happiness.",
      "end-of-life":"End of life", "life-ended":"This life has ended. You can start a new one.",
      "college-completed":"You graduated from college.", "started-dating":"Started dating.",
      "got-married":"You got married.", "first-paycheck":"You received your first paycheck.",
      "new-job":"New job: ", "debt-paid":"Debt payment: "
    }
  };
  if (key.startsWith("job:")) return labels[language]["new-job"] + systemText(key.slice(4));
  if (key.startsWith("debt-paid:")) return labels[language]["debt-paid"] + key.slice(10);
  return labels[language][key] ?? key;
}
function renderSimulation(): string {
  if (!life) return "";
  const s = life.simulation;
  const zMoney = (amount: number) => "Z$ " + amount.toLocaleString(language === "pt-BR" ? "pt-BR" : "en-US");
  const fields: [string, string][] = [
    ["balance", zMoney(s.balance)], ["debt", zMoney(s.debt)],
    ["income", zMoney(annualSalary(s))], ["job", systemText(s.job)],
    ["education", systemText(s.education)], ["credits", String(s.credits)],
    ["family", s.family + "%"], ["friends", s.friends + "%"],
    ["relationships", systemText(s.relationship)], ["partner", s.partner + "%"]
  ];
  const tiles = fields.map(([key,value]) =>
    '<div class="system-tile"><span>' + escapeHtml(systemText(key)) +
    '</span><strong>' + escapeHtml(value) + '</strong></div>').join("");
  const actions: Action[] = ["study", "job", "socialize", "care", "budget", "retire"];
  const actionEnabled = (a: Action) => !s.ended && !life!.pendingEvent && s.lastActionAge !== life!.age &&
    (a === "study" ? life!.age >= 6 : a === "job" ? life!.age >= 16 && life!.age < 65 :
    a === "budget" ? life!.age >= 16 : a === "retire" ? life!.age >= 60 && s.job !== "none" && s.job !== "retired" : true);
  const buttons = actions.map((a) => '<button class="system-action" type="button" data-action="' + a +
    '"' + (actionEnabled(a) ? '' : ' disabled') + '>' + escapeHtml(systemText('action-' + a)) + '</button>').join("");
  const done = s.lastActionAge === life.age ? '<p class="muted">' + escapeHtml(systemText("actions-done")) + '</p>' : '';
  return '<section class="simulation-panel"><h3>' + escapeHtml(systemText("systems")) +
    '</h3><div class="simulation-grid">' + tiles + '</div><h3>' + escapeHtml(systemText("actions")) +
    '</h3><div class="simulation-actions">' + buttons + '</div>' + done + '</section>';
}
function applyPlayerAction(action: Action): void {
  if (!life || life.pendingEvent) return;
  const outcome = takeAction(life.simulation, life.stats, life.age, action);
  if (!outcome.ok) return;
  life.simulation = outcome.state; life.stats = outcome.stats;
  life.history.push(life.age + ": " + systemText("action-" + action));
  for (const note of outcome.notes) life.history.push(life.age + ": " + systemText(note));
  saveLife(); render();
}

function showCharacterForm(): void {
  const workspace = document.querySelector<HTMLDivElement>("#workspace");
  if (!workspace) return;
  workspace.innerHTML = `<form class="create-card" id="character-form"><p class="eyebrow">${t("born")}</p><h2>${t("newLife")}</h2><label for="character-name">${t("name")}</label><input id="character-name" name="name" maxlength="32" placeholder="${t("namePlaceholder")}" autocomplete="off" required/><p class="form-error" id="form-error" role="alert"></p><div class="form-actions"><button class="text-button" id="cancel-create" type="button">${t("back")}</button><button class="primary-button compact" type="submit">${t("start")}</button></div></form>`;
  document.querySelector<HTMLInputElement>("#character-name")?.focus();
  document.querySelector("#cancel-create")?.addEventListener("click", render);
  document.querySelector("#character-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#character-name");
    const name = input?.value.trim() ?? "";
    if (!name) { const error = document.querySelector<HTMLParagraphElement>("#form-error"); if (error) error.textContent = t("nameRequired"); input?.focus(); return; }
    life = { name, birthYear: new Date().getFullYear(), age: 0, stats: { happiness: 70, health: 85, smarts: 50, looks: 60 }, pendingEvent: null, history: [], seenEventIds: [], simulation: createSimulation() };
    saveLife(); render();
  });
}
function advanceYear(): void {
  if (!life || life.pendingEvent) return;
  life.age += 1;
  const year = passYear(life.simulation, life.stats, life.age);
  if (!year.ok) { life.age -= 1; return; }
  life.simulation = year.state;
  life.stats = year.stats;
  for (const note of year.notes.filter((note) => !note.startsWith("income:") && !note.startsWith("expenses:"))) {
    life.history.push(life.age + ": " + systemText(note));
  }
  if (life.simulation.ended) { saveLife(); render(); return; }
  const pool = copy[language].events.filter((event: LifeEvent) => life!.age >= event.minAge && life!.age <= event.maxAge && !life!.seenEventIds.includes(event.id));
  if (pool.length) life.pendingEvent = pool[Math.floor(Math.random() * pool.length)];
  else {
    const smallEvent: LifeEvent = { id: "quiet-year", minAge: 0, maxAge: 110, title: language === "pt-BR" ? "Um ano tranquilo" : "A quiet year", description: language === "pt-BR" ? "Não aconteceu nada extraordinário neste ano. Como você quer aproveitar o tempo?" : "Nothing extraordinary happened this year. How would you like to spend your time?", choices: [
      { label: language === "pt-BR" ? "Cuidar da saúde" : "Focus on health", result: language === "pt-BR" ? "Você dedicou tempo ao próprio bem-estar." : "You spent time looking after yourself.", effects: { health: 5, happiness: 2 } },
      { label: language === "pt-BR" ? "Aprender algo" : "Learn something", result: language === "pt-BR" ? "Você terminou o ano com novos conhecimentos." : "You ended the year with new knowledge.", effects: { smarts: 5 } }
    ]};
    life.pendingEvent = smallEvent;
  }
  saveLife(); render();
}
function chooseEvent(index: number): void {
  if (!life?.pendingEvent) return;
  const choice = life.pendingEvent.choices[index];
  if (!choice) return;
  const applied = applyNarrativeChoice(life.simulation, life.stats, life.age, life.pendingEvent.id, index, choice.effects);
  if (!applied.ok) return;
  life.simulation = applied.state;
  life.stats = applied.stats;
  for (const note of applied.notes) life.history.push(life.age + ": " + systemText(note));
  life.history.push(`${life.age}: ${choice.result}`);
  life.seenEventIds.push(life.pendingEvent.id);
  life.pendingEvent = null;
  saveLife(); render();
}
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (target.closest("#reset-life")) { life = null; localStorage.removeItem(STORAGE_KEY); render(); }
});
render();
