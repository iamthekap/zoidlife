type Language = "pt-BR" | "en";

type Life = {
  name: string;
  birthYear: number;
  age: number;
  happiness: number;
  health: number;
  smarts: number;
  looks: number;
};

const translations = {
  "pt-BR": {
    eyebrow: "SIMULADOR DE VIDA • CONSTRUA SUA HISTÓRIA",
    title: "Uma vida inteira\nde possibilidades.",
    intro: "Cada escolha abre um caminho. Cada ano traz uma nova história.\nQue vida você vai construir?",
    newLife: "Começar uma nova vida",
    continue: "Sua história começa aqui",
    continueText: "Crie uma pessoa e descubra até onde as suas escolhas podem levar.",
    name: "Nome do personagem",
    namePlaceholder: "Como essa pessoa se chama?",
    start: "Criar personagem",
    back: "Voltar",
    age: "anos",
    year: "Ano de vida",
    happiness: "Felicidade",
    health: "Saúde",
    smarts: "Inteligência",
    looks: "Aparência",
    nextYear: "Avançar um ano",
    born: "Uma nova história começa",
    event: "Um novo capítulo",
    eventText: "O tempo passou. Novas oportunidades e desafios estão à sua espera.",
    language: "EN",
    footer: "UM UNIVERSO DE HISTÓRIAS • ZOID LIFE",
    nameRequired: "Digite um nome para continuar.",
    saved: "Progresso salvo neste dispositivo."
  },
  en: {
    eyebrow: "LIFE SIMULATOR • BUILD YOUR STORY",
    title: "A whole life\nof possibilities.",
    intro: "Every choice opens a path. Every year brings a new story.\nWhat kind of life will you build?",
    newLife: "Start a new life",
    continue: "Your story starts here",
    continueText: "Create a person and discover where your choices can take you.",
    name: "Character name",
    namePlaceholder: "What is this person's name?",
    start: "Create character",
    back: "Back",
    age: "years old",
    year: "Year of life",
    happiness: "Happiness",
    health: "Health",
    smarts: "Smarts",
    looks: "Looks",
    nextYear: "Age one year",
    born: "A new story begins",
    event: "A new chapter",
    eventText: "Time has passed. New opportunities and challenges are waiting for you.",
    language: "PT",
    footer: "A UNIVERSE OF STORIES • ZOID LIFE",
    nameRequired: "Enter a name to continue.",
    saved: "Progress saved on this device."
  }
} satisfies Record<Language, Record<string, string>>;

const STORAGE_KEY = "zoid-life-save-v1";
let language: Language = "pt-BR";
let life: Life | null = loadLife();

function loadLife(): Life | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Life) : null;
  } catch {
    return null;
  }
}

function saveLife(): void {
  if (life) localStorage.setItem(STORAGE_KEY, JSON.stringify(life));
}

function t(key: keyof typeof translations["pt-BR"]): string {
  return translations[language][key];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char] ?? char);
}

function render(): void {
  document.documentElement.lang = language;
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Zoid Life home">
          <span class="brand-mark">z</span><span>zoid<span class="brand-light">life</span></span>
        </a>
        <button class="language-button" id="language-toggle" type="button" aria-label="Change language">${t("language")}</button>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span class="status-dot"></span>${t("eyebrow")}</p>
          <h1>${t("title").replace("\\n", "<br />")}</h1>
          <p class="intro">${t("intro").replace("\\n", "<br />")}</p>
          <button class="primary-button" id="new-life" type="button">
            <span>${life ? t("continue") : t("newLife")}</span><span aria-hidden="true">↗</span>
          </button>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
          <div class="planet"><span class="planet-shine"></span></div>
          <div class="orbit-label label-top">YOUR STORY</div>
          <div class="orbit-label label-bottom">YOUR CHOICES</div>
          <span class="spark spark-one">✳</span><span class="spark spark-two">✦</span>
        </div>
      </section>

      <section class="workspace" id="workspace">
        ${life ? renderLife() : `
          <div class="welcome-card">
            <div class="welcome-icon">✳</div>
            <div><h2>${t("continue")}</h2><p>${t("continueText")}</p></div>
            <span class="card-arrow">↗</span>
          </div>`}
      </section>
      <footer><span>${t("footer")}</span><span>BUILD 0.1.0 <i></i> EARLY DEVELOPMENT</span></footer>
    </main>
  `;

  document.querySelector("#language-toggle")?.addEventListener("click", () => {
    language = language === "pt-BR" ? "en" : "pt-BR";
    render();
  });
  document.querySelector("#new-life")?.addEventListener("click", showCharacterForm);
  document.querySelector("#next-year")?.addEventListener("click", advanceYear);
}

function renderLife(): string {
  if (!life) return "";
  const stats = [
    ["happiness", life.happiness, "✳"],
    ["health", life.health, "＋"],
    ["smarts", life.smarts, "⌁"],
    ["looks", life.looks, "◇"]
  ] as const;
  return `
    <div class="life-card">
      <div class="life-heading"><div><p class="eyebrow">${t("born")}</p><h2>${escapeHtml(life.name)}</h2><p class="muted">${life.age} ${t("age")}</p></div><span class="life-year">${t("year")} <b>${life.age + 1}</b></span></div>
      <div class="stats-grid">${stats.map(([key, value, symbol]) => `
        <div class="stat"><div class="stat-top"><span>${symbol} ${t(key)}</span><b>${value}</b></div><div class="stat-track"><span style="width:${value}%"></span></div></div>
      `).join("")}</div>
      <div class="event-card"><span class="event-icon">✦</span><div><b>${t("event")}</b><p>${t("eventText")}</p></div></div>
      <div class="life-actions"><span class="saved-note">● ${t("saved")}</span><button class="primary-button compact" id="next-year" type="button">${t("nextYear")} <span>→</span></button></div>
    </div>
  `;
}

function showCharacterForm(): void {
  const workspace = document.querySelector<HTMLDivElement>("#workspace");
  if (!workspace) return;
  workspace.innerHTML = `
    <form class="create-card" id="character-form">
      <p class="eyebrow">${t("born")}</p><h2>${t("newLife")}</h2>
      <label for="character-name">${t("name")}</label>
      <input id="character-name" name="name" maxlength="32" placeholder="${t("namePlaceholder")}" autocomplete="off" required />
      <p class="form-error" id="form-error" role="alert"></p>
      <div class="form-actions"><button class="text-button" id="cancel-create" type="button">← ${t("back")}</button><button class="primary-button compact" type="submit">${t("start")} <span>→</span></button></div>
    </form>
  `;
  document.querySelector<HTMLInputElement>("#character-name")?.focus();
  document.querySelector("#cancel-create")?.addEventListener("click", render);
  document.querySelector("#character-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#character-name");
    const name = input?.value.trim() ?? "";
    if (!name) {
      const error = document.querySelector<HTMLParagraphElement>("#form-error");
      if (error) error.textContent = t("nameRequired");
      input?.focus();
      return;
    }
    life = {
      name, birthYear: new Date().getFullYear(), age: 0,
      happiness: 70, health: 85, smarts: 50, looks: 60
    };
    saveLife();
    render();
  });
}

function advanceYear(): void {
  if (!life) return;
  life.age += 1;
  const drift = () => Math.floor(Math.random() * 11) - 5;
  life.happiness = Math.max(0, Math.min(100, life.happiness + drift()));
  life.health = Math.max(0, Math.min(100, life.health + drift()));
  life.smarts = Math.max(0, Math.min(100, life.smarts + Math.floor(Math.random() * 5)));
  life.looks = Math.max(0, Math.min(100, life.looks + drift()));
  saveLife();
  render();
}

render();
