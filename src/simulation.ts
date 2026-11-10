/** Original Zoid Life simulation engine; independent of third-party game code or assets. */
export type Stats = Record<'happiness' | 'health' | 'smarts' | 'looks', number>;
export type Job = 'none' | 'parttime' | 'service' | 'office' | 'professional' | 'retired';
export type Education = 'none' | 'school' | 'secondary' | 'college';
export type Relation = 'single' | 'dating' | 'married';
export type Action = 'study' | 'job' | 'socialize' | 'care' | 'budget' | 'retire';
export type Simulation = {
  schema: 2; balance: number; debt: number; education: Education; credits: number;
  job: Job; experience: number; family: number; friends: number; partner: number;
  relationship: Relation; lastActionAge: number; lastYearNotes: string[]; ended: boolean;
};
export type Outcome = { state: Simulation; stats: Stats; notes: string[]; ok: boolean };
const bound = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
const money = (n: number) => Math.max(0, Math.round(Number.isFinite(n) ? n : 0));
export const annualSalary = (s: Simulation): number => ({
  none: 0, parttime: 4200, service: 15000, office: 26000,
  professional: 43000, retired: s.experience >= 5 ? 11000 : 6500,
})[s.job] + (s.job === 'none' || s.job === 'retired' ? 0 : Math.min(s.experience, 30) * 360);
export function createSimulation(): Simulation {
  return { schema: 2, balance: 0, debt: 0, education: 'none', credits: 0, job: 'none',
    experience: 0, family: 70, friends: 30, partner: 0, relationship: 'single',
    lastActionAge: -1, lastYearNotes: [], ended: false };
}
/** Migrate v1 saves safely without rewriting older life history. */
export function loadSimulation(raw: unknown): Simulation {
  const initial = createSimulation();
  if (!raw || typeof raw !== 'object') return initial;
  const r = raw as Partial<Simulation>;
  if (r.schema !== 2) return initial;
  const jobs: Job[] = ['none', 'parttime', 'service', 'office', 'professional', 'retired'];
  const degrees: Education[] = ['none', 'school', 'secondary', 'college'];
  const relations: Relation[] = ['single', 'dating', 'married'];
  return { ...initial, balance: money(r.balance ?? 0), debt: money(r.debt ?? 0),
    education: degrees.includes(r.education as Education) ? r.education! : initial.education,
    credits: money(r.credits ?? 0), job: jobs.includes(r.job as Job) ? r.job! : initial.job,
    experience: money(r.experience ?? 0), family: bound(r.family ?? 70), friends: bound(r.friends ?? 30),
    partner: bound(r.partner ?? 0), relationship: relations.includes(r.relationship as Relation) ? r.relationship! : initial.relationship,
    lastActionAge: Number.isInteger(r.lastActionAge) ? r.lastActionAge! : -1,
    lastYearNotes: Array.isArray(r.lastYearNotes) ? r.lastYearNotes.filter((x): x is string => typeof x === 'string').slice(-6) : [],
    ended: r.ended === true };
}
const updatedStats = (stats: Stats, effects: Partial<Stats>): Stats => ({
  happiness: bound(stats.happiness + (effects.happiness ?? 0)),
  health: bound(stats.health + (effects.health ?? 0)),
  smarts: bound(stats.smarts + (effects.smarts ?? 0)),
  looks: bound(stats.looks + (effects.looks ?? 0)),
});
function charge(s: Simulation, amount: number): void {
  const cost = money(amount);
  const spent = Math.min(s.balance, cost);
  s.balance -= spent;
  s.debt += cost - spent;
}
function receive(s: Simulation, amount: number): void {
  const income = money(amount);
  const paid = Math.min(s.debt, Math.round(income * 0.3));
  s.debt -= paid;
  s.balance += income - paid;
}
function eligibility(age: number, education: Education): Job {
  if (age < 16) return 'none';
  if (age < 18) return 'parttime';
  if (education === 'college') return 'professional';
  if (education === 'secondary') return 'office';
  return 'service';
}
/** Deterministic transitions: decisions create reproducible long-term consequences. */
export function passYear(raw: Simulation, rawStats: Stats, age: number): Outcome {
  if (raw.ended || age < 1 || age > 110) return { state: raw, stats: rawStats, notes: [], ok: false };
  const s = { ...raw, lastYearNotes: [] as string[] };
  let stats = { ...rawStats };
  const notes: string[] = [];
  if (age === 6) { s.education = 'school'; notes.push('school-start'); }
  if (age === 18 && s.education === 'school') {
    if (s.credits >= 4) { s.education = 'secondary'; notes.push('graduated'); }
    else notes.push('no-diploma');
  }
  if (age === 65 && s.job !== 'none' && s.job !== 'retired') {
    s.job = 'retired'; notes.push('retirement');
  }
  if (s.job !== 'none') {
    const income = annualSalary(s);
    receive(s, income);
    if (s.job !== 'retired') s.experience += 1;
    notes.push('income:' + income);
  }
  if (age >= 18) {
    const livingCost = age >= 65 ? 8500 : 10500;
    charge(s, livingCost);
    notes.push('expenses:' + livingCost);
  }
  if (s.debt > 0) {
    s.debt = money(s.debt * 1.04);
    if (s.debt > 0) stats = updatedStats(stats, { happiness: -2 });
  }
  if (age >= 35) stats = updatedStats(stats, { health: age >= 75 ? -3 : age >= 60 ? -2 : -1 });
  if (age >= 18) {
    s.family = bound(s.family - 1);
    s.friends = bound(s.friends - 1);
    if (s.relationship !== 'single') {
      s.partner = bound(s.partner - 1);
      if (s.partner === 0) { s.relationship = 'single'; notes.push('relationship-ended'); }
    }
  }
  if (s.debt > 30000) { stats = updatedStats(stats, { happiness: -3, health: -1 }); notes.push('financial-stress'); }
  if (age >= 110 || stats.health === 0) { s.ended = true; notes.push('end-of-life'); }
  s.lastYearNotes = notes;
  return { state: s, stats, notes, ok: true };
}
/** One optional deliberate action per age, separate from the narrative event. */
export function takeAction(raw: Simulation, rawStats: Stats, age: number, action: Action): Outcome {
  if (raw.ended || raw.lastActionAge === age) return { state: raw, stats: rawStats, notes: [], ok: false };
  const s = { ...raw, lastYearNotes: [...raw.lastYearNotes] };
  let stats = { ...rawStats };
  const notes: string[] = [];
  if (action === 'study' && age >= 6) {
    s.credits += 2;
    stats = updatedStats(stats, { smarts: 4, happiness: -1 });
    if (age >= 18 && age <= 30 && s.education === 'secondary' && s.credits >= 12) {
      s.education = 'college'; charge(s, 4000); notes.push('college-completed');
    }
  } else if (action === 'job' && age >= 16 && age < 65) {
    const next = eligibility(age, s.education);
    s.job = next;
    stats = updatedStats(stats, { happiness: 2, health: -1 });
    notes.push('job:' + next);
  } else if (action === 'socialize') {
    if (age >= 18 && s.relationship !== 'single') {
      s.partner = bound(s.partner + 12);
      if (s.partner >= 80 && age >= 21 && s.relationship === 'dating') { s.relationship = 'married'; notes.push('got-married'); }
    } else { s.friends = bound(s.friends + 12); }
    s.family = bound(s.family + 4);
    stats = updatedStats(stats, { happiness: 5 });
  } else if (action === 'care') {
    stats = updatedStats(stats, { health: 7, happiness: 2 });
    if (age >= 18) charge(s, 300);
  } else if (action === 'budget' && age >= 16) {
    const paid = Math.min(s.balance, s.debt, 1500);
    s.balance -= paid; s.debt -= paid;
    stats = updatedStats(stats, { smarts: 2 });
    notes.push('debt-paid:' + paid);
  } else if (action === 'retire' && age >= 60 && s.job !== 'none' && s.job !== 'retired') {
    s.job = 'retired'; notes.push('retirement');
  } else return { state: raw, stats: rawStats, notes: [], ok: false };
  s.lastActionAge = age;
  return { state: s, stats, notes, ok: true };
}
/** Persistent effects use original Zoid Life story IDs, not third-party code. */
export function applyNarrativeChoice(raw: Simulation, rawStats: Stats, age: number, eventId: string, index: number, statEffects: Partial<Stats>): Outcome {
  if (raw.ended || !Number.isInteger(index) || index < 0) return { state: raw, stats: rawStats, notes: [], ok: false };
  const s = { ...raw, lastYearNotes: [...raw.lastYearNotes] };
  const stats = updatedStats(rawStats, statEffects);
  const notes: string[] = [];
  switch (eventId) {
    case 'school':
      if (index === 0) s.friends = bound(s.friends + 15);
      if (index === 2) s.credits += 1;
      break;
    case 'study':
      if (index === 0) s.credits += 4;
      if (index === 2) s.credits += 2;
      break;
    case 'hobby':
      if (index <= 1) s.credits += 1;
      if (index === 0) s.friends = bound(s.friends + 8);
      break;
    case 'first-job':
      if (index === 0 && age >= 15) { s.job = 'parttime'; receive(s, 600); notes.push('first-paycheck'); }
      if (index === 1) s.credits += 2;
      break;
    case 'work':
      if (index === 0 && age >= 18 && age < 65) { s.job = eligibility(age, s.education); s.experience += 1; notes.push('job:' + s.job); }
      if (index === 1) s.family = bound(s.family + 6);
      break;
    case 'relationship':
      if (index === 0 && age >= 18) { s.relationship = 'dating'; s.partner = 55; notes.push('started-dating'); }
      if (index === 1) s.friends = bound(s.friends + 14);
      break;
    case 'family':
      s.family = bound(s.family + (index === 0 ? 18 : index === 1 ? 7 : -6));
      break;

    case 'playground':
      if (index === 0) s.friends=bound(s.friends+12);
      if (index === 2) s.family=bound(s.family+10);
      break;
    case 'science-fair':
      if (index === 0) s.credits += 3;
      if (index === 1) { s.credits += 1; s.friends=bound(s.friends+8); }
      break;
    case 'team-sport':
      if (index === 0) s.friends=bound(s.friends+13);
      if (index === 1) s.friends=bound(s.friends+8);
      break;
    case 'online-learning':
      s.credits+= index === 0 ? 3 : index === 1 ? 1 : 0;
      break;
    case 'first-budget':
      receive(s,1200);
      if (index === 1) charge(s,850);
      if (index === 2) { charge(s,650); s.family=bound(s.family+8); }
      break;
    case 'scholarship':
      if (index === 0) s.credits+=5;
      if (index === 1) s.credits+=3;
      break;
    case 'first-rent':
      if (index === 0) { charge(s,5000); s.family=bound(s.family-4); }
      if (index === 1) { charge(s,1800); s.friends=bound(s.friends+10); }
      break;
    case 'mentor':
      if (index === 0) {s.credits+=2; s.experience+=1;}
      if (index === 1) s.friends=bound(s.friends+12);
      break;
    case 'work-pressure':
      if (index === 0) {s.experience+=2;receive(s,2000);}
      if (index === 2) s.friends=bound(s.friends+8);
      break;
    case 'friend-conflict':
      s.friends=bound(s.friends+(index===0?12:index===1?-3:-20));
      break;
    case 'checkup':
      if (index===0) charge(s,500);
      if (index===1) charge(s,130);
      break;
    case 'side-project':
      if (index===0) {charge(s,3000);receive(s,2500);s.experience+=1;}
      if (index===1) {receive(s,650);s.credits+=1;}
      break;
    case 'family-care':
      if (index===0) s.family=bound(s.family+18);
      if (index===1) {charge(s,1500);s.family=bound(s.family+14);}
      if (index===2) s.family=bound(s.family-15);
      break;
    case 'career-switch':
      if (index===0) {s.job='service';s.experience=0;notes.push('job:service');}
      if (index===1) s.experience+=2;
      break;
    case 'old-friend':
      s.friends=bound(s.friends+(index===0?18:index===1?8:-4));
      break;
    case 'retirement-choice':
      if (index===0) {const payment=Math.min(s.balance,s.debt,1000);s.balance-=payment;s.debt-=payment;}
      if (index===1) s.family=bound(s.family+12);
      break;
    case 'community':
      if (index===0) s.friends=bound(s.friends+18);
      if (index===1) s.friends=bound(s.friends+8);
      break;
    case 'wellness':
      if (index === 1) { s.family = bound(s.family + 8); s.friends = bound(s.friends + 6); }
      if (index === 2) s.credits += 1;
      break;
  }
  return { state: s, stats, notes, ok: true };
}
