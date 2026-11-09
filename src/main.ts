import "./style.css";

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
};

const copy = {
  "pt-BR": {
    eyebrow: "SIMULADOR DE VIDA", title: "Sua vida. Suas escolhas.", intro: "Uma história é construída ano após ano. Decida como viver cada capítulo.",
    newLife: "Começar uma vida", continue: "Continuar sua vida", continueText: "Sua próxima história está esperando para acontecer.",
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
      { id: "wellness", minAge: 65, maxAge: 110, title: "Hora de cuidar de si", description: "Você percebe que sua rotina mudou. É uma boa oportunidade para pensar no que realmente importa nesta fase da vida.", choices: [
        { label: "Fazer uma caminhada e cuidar da saúde", result: "Uma rotina mais ativa fez bem ao seu corpo e ao seu humor.", effects: { health: 8, happiness: 3 } },
        { label: "Visitar pessoas queridas", result: "O encontro trouxe boas lembranças e aproximou você de quem ama.", effects: { happiness: 9 } },
        { label: "Aprender algo novo", result: "Você descobriu que sempre existe espaço para aprender.", effects: { smarts: 5, happiness: 3 } }
      ]}
    ] as LifeEvent[]
  },
  en: {
    eyebrow: "LIFE SIMULATOR", title: "Your life. Your choices.", intro: "A story unfolds one year at a time. Decide how to live each chapter.",
    newLife: "Start a life", continue: "Continue your life", continueText: "Your next chapter is waiting to happen.",
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
    return { ...parsed, pendingEvent: parsed.pendingEvent ?? null, history: parsed.history ?? [] };
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
  document.querySelector("#new-life")?.addEventListener("click", showCharacterForm);
  document.querySelector("#next-year")?.addEventListener("click", advanceYear);
  document.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((button) => button.addEventListener("click", () => chooseEvent(Number(button.dataset.choice))));
}
function renderLife(): string {
  if (!life) return "";
  const stats: [StatKey, string][] = [["happiness", "☺"], ["health", "＋"], ["smarts", "◆"], ["looks", "◇"]];
  const event = life.pendingEvent;
  return `
    <div class="life-card">
      <div class="life-heading"><div><p class="eyebrow">${t("born")}</p><h2>${escapeHtml(life.name)}</h2><p class="muted">${t("birth")} ${life.birthYear}</p></div><div class="age-box"><span>${t("ageLabel")}</span><b>${life.age}</b></div></div>
      <div class="stats-grid">${stats.map(([key, symbol]) => `<div class="stat"><div class="stat-top"><span>${symbol} ${t(key)}</span><b>${life!.stats[key]}%</b></div><div class="stat-track"><span style="width:${clamp(life!.stats[key])}%"></span></div></div>`).join("")}</div>
      ${event ? `
        <article class="event-card"><p class="event-kicker">${t("eventLabel")} • ${life.age} ${t("age")}</p><h3>${escapeHtml(event.title)}</h3><p class="event-description">${escapeHtml(event.description)}</p>
          <div class="choice-list">${event.choices.map((choice, index) => `<button class="choice-button" data-choice="${index}" type="button"><span>${escapeHtml(choice.label)}</span><span class="choice-number">${index + 1}</span></button>`).join("")}</div>
        </article>` : `
        <article class="event-card"><p class="event-kicker">${t("year")} ${life.age + 1}</p><h3>${t("firstYear")}</h3><p class="event-description">${t("firstYearText")}</p><button class="primary-button compact" id="next-year" type="button">${t("nextYear")}</button></article>`}
      <section class="history"><h3>${t("history")}</h3>${life.history.length ? `<ol>${life.history.slice(-5).reverse().map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : `<p class="muted">${t("noHistory")}</p>`}</section>
      <div class="life-actions"><span class="saved-note">● ${t("saved")}</span><button class="text-button" id="reset-life" type="button">${language === "pt-BR" ? "Nova vida" : "New life"}</button></div>
    </div>`;
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
    life = { name, birthYear: new Date().getFullYear(), age: 0, stats: { happiness: 70, health: 85, smarts: 50, looks: 60 }, pendingEvent: null, history: [] };
    saveLife(); render();
  });
}
function advanceYear(): void {
  if (!life || life.pendingEvent) return;
  life.age += 1;
  const pool = copy[language].events.filter((event: LifeEvent) => life!.age >= event.minAge && life!.age <= event.maxAge);
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
  for (const key of Object.keys(choice.effects) as StatKey[]) life.stats[key] = clamp(life.stats[key] + (choice.effects[key] ?? 0));
  life.history.push(`${life.age}: ${choice.result}`);
  life.pendingEvent = null;
  saveLife(); render();
}
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (target.closest("#reset-life")) { life = null; localStorage.removeItem(STORAGE_KEY); render(); }
});
render();
