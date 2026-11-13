import {createJustice,loadJustice,judgeOffense,type JusticeState,type OffenseId} from './justice.ts';
import {normalizeConditions,advanceHealth,treatHealth,type Condition} from './health.ts';
import {careerById,careerAvailable,type OccupationId} from './careers.ts';
import type {CharacterProfile} from './characters.ts';
import {HOBBY_IDS,normalizeHobbyBook,progressHobby,hobbyCost,hobbyCareer,type HobbyBook,type HobbyId} from './hobbies.ts';
import {destination,canTravel,normalizeTravelState,recordTravel,type TravelState,type JourneyId} from './travel.ts';
import {normalizePetHousehold,adoptPet,careForPet,advancePets,canAdoptPet,PET_COST,
 type PetHousehold,type PetSpecies} from './pets.ts';
/** Original Zoid Life simulation engine; independent of third-party game code or assets. */
export type Stats = Record<'happiness' | 'health' | 'smarts' | 'looks', number>;
export type Job = 'none' | 'parttime' | 'service' | 'office' | 'professional' | 'retired';
export type Education = 'none' | 'school' | 'secondary' | 'college';
export type StudyTrack='general'|'medicine'|'law'|'science'|'arts';
export const STUDY_TRACKS:readonly StudyTrack[]=['general','medicine','law','science','arts'];
export type Relation = 'single' | 'dating' | 'married';
export type Action = 'study' | 'job' | 'socialize' | 'care' | 'budget' | 'retire' | 'invest' | 'home' | 'child' | 'crime' | 'train' | 'mystic' | 'work' | 'style' | 'resign' | 'withdraw' | 'travel';
export type Simulation = {
  schema: 2; balance: number; debt: number; education: Education; credits: number; studyTrack:StudyTrack;
  job: Job; occupation:OccupationId|null; experience: number; family: number; friends: number; partner: number;
  relationship: Relation; lastActionAge: number; lastYearNotes: string[]; ended: boolean;
  /** Most recent age that each activity was performed. Allows different activities in one year. */
  actionLedger: Partial<Record<Action,number>>;
  investments: number; homeOwned: boolean; homeValue: number; children: number; training:number;mysticMastery:number;careerLevel:number;careerTenure:number;careerMomentum:number;sportsVictories:number; conditions:Condition[];justice:JusticeState;hobbies:HobbyBook;travel:TravelState;pets:PetHousehold;
};
export type WorldImpact={cash?:number;debt?:number;investments?:number;family?:number;friends?:number;partner?:number;credits?:number;experience?:number;careerMomentum?:number;training?:number;mysticMastery?:number;relationship?:Relation};
export type Outcome = { state: Simulation; stats: Stats; notes: string[]; ok: boolean };
const bound = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
const money = (n: number) => Math.max(0, Math.round(Number.isFinite(n) ? n : 0));
export const annualSalary=(s:Simulation):number=>{
 const role=careerById(s.occupation);
 const fallback=({none:0,parttime:4200,service:15000,office:26000,professional:43000,retired:s.experience>=5?11000:6500})[s.job];
 const amount=role&&role.job===s.job?role.salary:fallback;
 const bonus=(s.job==='none'||s.job==='retired')?0:Math.round(amount*.12*Math.min(5,s.careerLevel??0));
 return amount+bonus+(s.job==='none'||s.job==='retired'?0:Math.min(s.experience,30)*360);
};
export const ALL_ACTIONS: Action[]=['study','job','socialize','care','budget','retire','invest','home','child','crime','train','mystic','work','style','resign','withdraw','travel'];
function normalizeActionLedger(raw:unknown,lastActionAge:unknown):Partial<Record<Action,number>> {
  const ledger:Partial<Record<Action,number>>={};
  if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
    for(const action of ALL_ACTIONS){
      const value=(raw as Partial<Record<Action,unknown>>)[action];
      if(Number.isInteger(value)&&typeof value==='number'&&value>=0&&value<=110)
        ledger[action]=value;
    }
  }else if(Number.isInteger(lastActionAge)&&typeof lastActionAge==='number'&&lastActionAge>=0){
    // Legacy versions permitted only one activity in a year. Respect that year's lock.
    for(const action of ALL_ACTIONS)ledger[action]=lastActionAge;
  }
  return ledger;
}
/** Central source of truth for legal age restrictions. UI filters are presentation only;
 * imported saves and direct simulation calls MUST respect the same rules.
 */
export function actionAgeAllowed(age:number,action:Action):boolean {
 if(!Number.isInteger(age)||age<0||age>110||!ALL_ACTIONS.includes(action))return false;
 switch(action){
  case 'study':case 'train':return age>=6;
  case 'style':case 'mystic':case 'crime':return age>=12;
  case 'job':case 'work':case 'budget':case 'resign':return age>=16&&age<65;
  case 'invest':case 'withdraw':case 'travel':return age>=18;
  case 'home':return age>=21;
  case 'child':return age>=20&&age<=55;
  case 'retire':return age>=60;
  case 'socialize':case 'care':return true;
 }
}
export function canTakeAction(s:Simulation,age:number,action:Action):boolean {
 if(s.ended||!actionAgeAllowed(age,action))return false;
 return s.actionLedger?.[action]!==age && !(loadJustice(s.justice).incarceratedUntil>age&&action!=='care'&&action!=='study');
}
export function createSimulation(): Simulation {
  return { schema: 2, balance: 0, debt: 0, education: 'none', credits: 0, studyTrack:'general',job: 'none', occupation:null,
    experience: 0, family: 70, friends: 30, partner: 0, relationship: 'single',
    lastActionAge: -1, actionLedger: {}, lastYearNotes: [], ended: false,
    investments: 0, homeOwned: false, homeValue: 0, children: 0,training:0,mysticMastery:0,careerLevel:0,careerTenure:0,careerMomentum:0,sportsVictories:0,conditions:[],justice:createJustice(),hobbies:normalizeHobbyBook(null),travel:normalizeTravelState(null),pets:normalizePetHousehold(null) };
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
  const track=STUDY_TRACKS.includes(r.studyTrack as StudyTrack)?r.studyTrack!:'general';
  return { ...initial, balance: money(r.balance ?? 0), debt: money(r.debt ?? 0),
    education: degrees.includes(r.education as Education) ? r.education! : initial.education,
    credits: money(r.credits ?? 0),studyTrack:track, job: jobs.includes(r.job as Job) ? r.job! : initial.job,
    occupation:(r.job==='none'||r.job==='retired'||!jobs.includes(r.job as Job))?null:
      (careerById(r.occupation)?.job===r.job?careerById(r.occupation)?.id??null:null),
    experience: money(r.experience ?? 0), family: bound(r.family ?? 70), friends: bound(r.friends ?? 30),
    partner: bound(r.partner ?? 0), relationship: relations.includes(r.relationship as Relation) ? r.relationship! : initial.relationship,
    lastActionAge: Number.isInteger(r.lastActionAge) ? r.lastActionAge! : -1,
    actionLedger: normalizeActionLedger(r.actionLedger,r.lastActionAge),
    lastYearNotes: Array.isArray(r.lastYearNotes) ? r.lastYearNotes.filter((x): x is string => typeof x === 'string').slice(-6) : [],
    ended: r.ended === true,
    investments: money(r.investments ?? 0), homeOwned: r.homeOwned===true,
    homeValue: r.homeOwned===true ? money(r.homeValue??0) : 0,
    children: Math.min(20,money(r.children??0)),training:Math.min(100,money(r.training??0)),mysticMastery:Math.min(100,money(r.mysticMastery??0)),
 careerLevel:Math.min(5,money(r.careerLevel??0)),careerTenure:Math.min(110,money(r.careerTenure??0)),
 careerMomentum:Math.min(100,money(r.careerMomentum??0)),sportsVictories:Math.min(1000,money(r.sportsVictories??0)),conditions:normalizeConditions(r.conditions),justice:loadJustice(r.justice),hobbies:normalizeHobbyBook(r.hobbies),travel:normalizeTravelState(r.travel),pets:normalizePetHousehold(r.pets) };
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
  const s = { ...raw,conditions:normalizeConditions(raw.conditions),justice:loadJustice(raw.justice), lastYearNotes: [] as string[] };
  let stats = { ...rawStats };
  const notes: string[] = [];
  if(s.justice.incarceratedUntil===age&&s.justice.lastConvictionAge>=0)notes.push('justice-released');
  if (age === 6) { s.education = 'school'; notes.push('school-start'); }
  if (age === 18 && s.education === 'school') {
    if (s.credits >= 4) { s.education = 'secondary'; notes.push('graduated'); }
    else notes.push('no-diploma');
  }
  if (age === 65 && s.job !== 'none' && s.job !== 'retired') {
    s.job = 'retired'; s.occupation=null; notes.push('retirement');
  }
  if (s.job !== 'none' && s.justice.incarceratedUntil<=age) {
    const income = annualSalary(s);
    receive(s, income);
    if(s.job!=='retired'){
      s.experience+=1;s.careerTenure=Math.min(110,s.careerTenure+1);
      if(s.careerMomentum>=25&&s.careerTenure>=2&&s.careerTenure%2===0&&s.careerLevel<5){
        s.careerLevel++;s.careerMomentum=Math.max(0,s.careerMomentum-22);
        notes.push('career-promotion:'+s.careerLevel);
      }else s.careerMomentum=Math.max(0,s.careerMomentum-2);
      if(['footballer','basketballer','athlete'].includes(s.occupation??'')&&s.training>=36&&stats.health>=40&&
       ((s.training+s.careerMomentum+age*7)%10)>=7){
        s.sportsVictories=Math.min(1000,s.sportsVictories+1);
        const prize=Math.round(1200+s.training*25);
        receive(s,prize);notes.push('sport-win:'+prize);
      }
    }
    notes.push('income:' + income);
  }
  if (age >= 18) {
    const livingCost = (age >= 65 ? 8500 : 10500) + (s.homeOwned ? 1800 : 0);
    charge(s, livingCost);
    notes.push('expenses:' + livingCost);
  }
  if (s.investments > 0) s.investments=money(s.investments*1.03);
  if (s.homeOwned) s.homeValue=money(s.homeValue*1.02);
  if (s.children > 0 && age >= 18) {
    const childcare=2000*s.children;
    charge(s,childcare);
    notes.push('childcare:'+childcare);
  }
  const companionYear=advancePets(normalizePetHousehold(s.pets),age);
  s.pets=companionYear.state;
  if(companionYear.maintenance){
    charge(s,companionYear.maintenance);
    notes.push('pet-upkeep:'+companionYear.maintenance);
  }
  if(companionYear.companionship)
    stats=updatedStats(stats,{happiness:Math.min(2,companionYear.companionship)});
  for(const pet of companionYear.deaths){
    notes.push('pet-farewell:'+pet.name);
    stats=updatedStats(stats,{happiness:-7});
  }
  if (s.debt > 0) {
    s.debt = money(s.debt * 1.04);
    if (s.debt > 0) stats = updatedStats(stats, { happiness: -2 });
  }
  if(age>=55)s.training=Math.max(0,s.training-1);
  if (age >= 35) stats = updatedStats(stats, { health: age >= 75 ? -3 : age >= 60 ? -2 : -1 });
  const health=advanceHealth(s.conditions,age,stats.health,stats.happiness,s.job!=='none'&&s.job!=='retired');
  s.conditions=health.conditions;
  stats={...stats,health:health.health,happiness:health.happiness};
  notes.push(...health.notes);
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
/** Each voluntary activity can occur once per year, independently of other activities. */
export function takeAction(raw: Simulation, rawStats: Stats, age: number, action: Action): Outcome {
  if (!canTakeAction(raw,age,action)) return { state: raw, stats: rawStats, notes: [], ok: false };
  const s = { ...raw,conditions:normalizeConditions(raw.conditions),justice:loadJustice(raw.justice), lastYearNotes: [...raw.lastYearNotes] };
  let stats = { ...rawStats };
  const notes: string[] = [];
  if (action === 'study' && age >= 6) {
    s.credits += 2;
    stats = updatedStats(stats, { smarts: 4, happiness: -1 });
    if (age >= 18 && age <= 30 && s.education === 'secondary' && s.credits >= 12) {
      s.education = 'college'; charge(s, 4000); notes.push('college-completed');
    }
  } else if(action==='train'&&age>=6&&age<85){
    s.training=Math.min(100,s.training+4);
    stats=updatedStats(stats,{health:3,happiness:2});
    notes.push('training:'+s.training);
  } else if(action==='style'&&age>=12){
    if(age>=18)charge(s,250);
    stats=updatedStats(stats,{happiness:3,looks:2});
    notes.push('style-changed');
  } else if(action==='work'&&age>=16&&s.job!=='none'&&s.job!=='retired'){
    s.careerMomentum=Math.min(100,s.careerMomentum+17);
    s.experience=Math.min(110,s.experience+1);
    stats=updatedStats(stats,{health:-3,smarts:2,happiness:-1});
    notes.push('career-effort:'+s.careerMomentum);
  } else if(action==='mystic'){
    return {state:raw,stats:rawStats,notes:[],ok:false};
  } else if (action === 'resign' && age >= 16 && age < 65 && !['none','retired'].includes(s.job)) {
    s.job='none';s.occupation=null;s.careerLevel=0;s.careerTenure=0;s.careerMomentum=0;
    stats=updatedStats(stats,{happiness:2,health:1});notes.push('career-resigned');
  } else if (action === 'job' && age >= 16 && age < 65) {
    const next = eligibility(age, s.education);
    s.job = next;s.occupation=null;s.careerLevel=0;s.careerTenure=0;s.careerMomentum=0;
    stats = updatedStats(stats, { happiness: 2, health: -1 });
    notes.push('job:' + next);
  } else if (action === 'socialize') {
    if (age >= 18 && s.relationship !== 'single') {
      s.partner = bound(s.partner + 12);
      // Marriage is a deliberate proposal via a named partner interaction,
      // never an accidental side effect of generic socializing.
    } else { s.friends = bound(s.friends + 12); }
    s.family = bound(s.family + 4);
    stats = updatedStats(stats, { happiness: 5 });
  } else if (action === 'care') {
    const treated=treatHealth(s.conditions);s.conditions=treated.conditions;
    stats = updatedStats(stats, { health: 7+treated.healthBonus, happiness: 2 });
    notes.push(...treated.notes);
    if (age >= 18) charge(s, 300);
  } else if (action === 'budget' && age >= 16) {
    const paid = Math.min(s.balance, s.debt, 1500);
    s.balance -= paid; s.debt -= paid;
    stats = updatedStats(stats, { smarts: 2 });
    notes.push('debt-paid:' + paid);
  } else if (action === 'invest' && age >= 18 && s.balance >= 1000) {
    const amount = Math.min(s.balance, 3000);
    s.balance -= amount;
    s.investments += amount;
    notes.push('investment:'+amount);
  } else if (action === 'withdraw' && age >= 18 && s.investments > 0) {
    // Redeeming an owned investment is not income: don't automatically repay debt.
    const amount=Math.min(s.investments,5000);
    s.investments-=amount;s.balance=money(s.balance+amount);
    notes.push('withdrawal:'+amount);
  } else if (action === 'home' && age >= 21 && !s.homeOwned && s.balance >= 25000) {
    s.balance -= 25000;
    s.debt += 105000;
    s.homeOwned = true;
    s.homeValue = 130000;
    notes.push('home-bought');
  } else if (action === 'child' && age >= 20 && age <= 55 && s.relationship !== 'single' && s.partner >= 50 && s.children < 8) {
    s.children += 1;
    s.family = bound(s.family+7);
    stats=updatedStats(stats,{happiness:5,health:-1});
    notes.push('child-born');
  } else if (action === 'retire' && age >= 60 && s.job !== 'none' && s.job !== 'retired') {
    s.job = 'retired'; s.occupation=null; notes.push('retirement');
  } else return { state: raw, stats: rawStats, notes: [], ok: false };
  s.lastActionAge = age;
  s.actionLedger = {...raw.actionLedger,[action]:age};
  return { state: s, stats, notes, ok: true };
}

/** Hobby sessions are deliberate choices with a two-session/year opportunity cost.
 * Progress, awards and career benefits are earned, never cosmetic-only.
 */
export function practiceHobby(raw:Simulation,rawStats:Stats,age:number,id:HobbyId):Outcome{
 const book=normalizeHobbyBook(raw.hobbies);
 if(raw.ended||!HOBBY_IDS.includes(id)||age<6||age>110||
  loadJustice(raw.justice).incarceratedUntil>age)
  return {state:raw,stats:rawStats,notes:[],ok:false};
 const progress=progressHobby(book,age,id);
 if(!progress.ok)return {state:raw,stats:rawStats,notes:[],ok:false};
 const s:Simulation={...raw,hobbies:progress.book,lastYearNotes:[...raw.lastYearNotes]};
 const effects:Partial<Stats>=id==='music'?{happiness:4,smarts:2}:
  id==='art'?{looks:3,happiness:3}:
  id==='coding'?{smarts:4,happiness:1}:
  id==='sports'?{health:4,happiness:2}:
  id==='writing'?{smarts:3,happiness:2}:{happiness:3,health:1};
 let stats=updatedStats(rawStats,effects);
 const notes=['hobby:'+id+':'+progress.level];
 if(age>=18&&hobbyCost(id)>0)charge(s,hobbyCost(id));
 if(id==='sports')s.training=Math.min(100,s.training+3);
 if(id==='volunteering'){s.family=bound(s.family+5);s.friends=bound(s.friends+3);}
 if(s.occupation&&hobbyCareer[id]?.includes(s.occupation)&&
   !['none','retired'].includes(s.job)){
  s.careerMomentum=Math.min(100,s.careerMomentum+7);
  s.experience=Math.min(110,s.experience+1);
  notes.push('hobby-career:'+id);
 }
 if(progress.newAwards>0){
  // A real milestone event, awarded once upon crossing each 25-point tier.
  const tier=Math.floor(progress.level/25);
  if(age>=18&&id!=='volunteering')receive(s,tier*650);
  else if(id==='volunteering')s.family=bound(s.family+7);
  notes.push('hobby-award:'+id+':'+tier);
 }
 return {state:s,stats,notes,ok:true};
}

/** Adopt at most two living companions; parents cover costs for minors. */
export function adoptCompanion(raw:Simulation,rawStats:Stats,age:number,
 species:PetSpecies,name:string):Outcome{
 const pets=normalizePetHousehold(raw.pets);
 const cost=age>=18?PET_COST[species]:0;
 if(raw.ended||loadJustice(raw.justice).incarceratedUntil>age||
  !canAdoptPet(pets,age,species,name)||raw.balance<cost)
  return {state:raw,stats:rawStats,notes:[],ok:false};
 const adopted=adoptPet(pets,age,species,name);
 if(!adopted.ok||!adopted.pet)return {state:raw,stats:rawStats,notes:[],ok:false};
 const s:Simulation={...raw,pets:adopted.state,lastYearNotes:[...raw.lastYearNotes]};
 if(cost>0)charge(s,cost);
 s.family=bound(s.family+3);
 return {state:s,stats:updatedStats(rawStats,{happiness:6}),
  notes:['pet-adopted:'+species+':'+adopted.pet.name],ok:true};
}
/** Each living pet can be cared for once in a year, with real wellness/bond effects. */
export function careForCompanion(raw:Simulation,rawStats:Stats,age:number,id:string):Outcome{
 if(raw.ended||loadJustice(raw.justice).incarceratedUntil>age)return {state:raw,stats:rawStats,notes:[],ok:false};
 const pets=normalizePetHousehold(raw.pets),cared=careForPet(pets,age,id);
 if(!cared.ok||!cared.pet)return {state:raw,stats:rawStats,notes:[],ok:false};
 const s:Simulation={...raw,pets:cared.state,lastYearNotes:[...raw.lastYearNotes]};
 if(age>=18)charge(s,120);
 return {state:s,stats:updatedStats(rawStats,{happiness:3,health:1}),
  notes:['pet-cared:'+cared.pet.id],ok:true};
}

/** Optional yearly journey: actually charge the fare, update bonds and remember the trip. */
export function takeJourney(raw:Simulation,rawStats:Stats,age:number,id:JourneyId):Outcome{
 const trip=destination(id),diary=normalizeTravelState(raw.travel);
 if(!trip||!canTakeAction(raw,age,'travel')||!canTravel(diary,age,id,raw.balance))
  return {state:raw,stats:rawStats,notes:[],ok:false};
 const s:Simulation={...raw,travel:recordTravel(diary,age,id),
  lastYearNotes:[...raw.lastYearNotes],actionLedger:{...raw.actionLedger,travel:age},lastActionAge:age};
 charge(s,trip.cost);
 s.family=bound(s.family+trip.family);s.friends=bound(s.friends+trip.friends);
 s.credits=Math.max(0,s.credits+trip.credits);
 const stats=updatedStats(rawStats,trip.effects);
 return {state:s,stats,notes:['trip:'+id,'trip-cost:'+trip.cost],ok:true};
}

/** Selecting an academic specialization consumes the yearly study activity;
 * a graduate may retrain in another subject in later years.
 */
export function selectStudyTrack(raw:Simulation,stats:Stats,age:number,track:StudyTrack):Outcome{
 if(raw.ended||age<18||age>65||raw.education!=='college'||!STUDY_TRACKS.includes(track)||
  !canTakeAction(raw,age,'study'))return {state:raw,stats,notes:[],ok:false};
 const result=takeAction(raw,stats,age,'study');
 if(!result.ok)return result;
 return {...result,state:{...result.state,studyTrack:track},notes:[...result.notes,'study-track:'+track]};
}

/** Persistent effects use original Zoid Life story IDs, not third-party code. */
/** A chosen vacancy uses the same annual cooldown as finding work. */
export function applyCareer(raw:Simulation,rawStats:Stats,age:number,id:OccupationId,profile?:CharacterProfile):Outcome{
 const role=careerById(id);
 if(!role||!canTakeAction(raw,age,'job')||!careerAvailable(raw,age,role,profile))
  return {state:raw,stats:rawStats,notes:[],ok:false};
 const s:Simulation={...raw,job:role.job,occupation:role.id,careerLevel:0,careerTenure:0,careerMomentum:0,actionLedger:{...raw.actionLedger,job:age},
  lastActionAge:age,lastYearNotes:[...raw.lastYearNotes]};
 if(role.capital>0)charge(s,role.capital);
 s.experience=money(s.experience+1);
 return {state:s,stats:updatedStats(rawStats,{happiness:4,health:-Math.round(role.stress/2)}),
  notes:['job:'+role.job,'occupation:'+role.id],ok:true};
}
/** A voluntary illegal choice consumes the crime action for this year. */
export function applyOffense(raw:Simulation,rawStats:Stats,age:number,id:OffenseId):Outcome{
 if(!canTakeAction(raw,age,'crime'))return {state:raw,stats:rawStats,notes:[],ok:false};
 const result=judgeOffense(raw.justice,age,rawStats.smarts,id);
 if(!result)return {state:raw,stats:rawStats,notes:[],ok:false};
 const s:Simulation={...raw,justice:result.justice,actionLedger:{...raw.actionLedger,crime:age},lastActionAge:age};
 if(result.fine)charge(s,result.fine);
 if(result.reward)receive(s,result.reward);
 if(result.sentence){s.job='none';s.occupation=null;}
 const stats=updatedStats(rawStats,{happiness:result.caught?-10:result.reward?3:-2,
  health:result.sentence?-3:0,smarts:result.caught?0:-1});
 const notes=[(result.caught?'justice-convicted:':'justice-avoided:')+id];
 if(result.fine)notes.push('justice-fine:'+result.fine);
 if(result.sentence)notes.push('justice-sentence:'+result.sentence);
 return {state:s,stats,notes,ok:true};
}
export function applyNarrativeChoice(raw: Simulation, rawStats: Stats, age: number, eventId: string, index: number, statEffects: Partial<Stats>, world:WorldImpact={}): Outcome {
  if (raw.ended || !Number.isInteger(index) || index < 0) return { state: raw, stats: rawStats, notes: [], ok: false };
  const s = { ...raw,conditions:normalizeConditions(raw.conditions),justice:loadJustice(raw.justice), lastYearNotes: [...raw.lastYearNotes] };
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
      if(index===0 && age>=16 && age<=19){
        if(s.job==='none'){
          s.job='parttime';
          notes.push('job:parttime');
        }
        // A teen with an existing job earns extra pay without losing that job.
        receive(s,600);
        notes.push('first-paycheck');
      }
      if(index===1)s.credits+=2;
      break;
    case 'work':
      if (index === 0 && age >= 18 && age < 65) {
        if(s.job==='none'){s.job=eligibility(age,s.education);s.occupation=null;notes.push('job:'+s.job);}
        else if(s.job!=='retired')s.careerMomentum=Math.min(100,s.careerMomentum+5);
        s.experience+=1;
      }
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
      if (index===0) {s.job='service';s.occupation=null;s.experience=0;
        s.careerLevel=0;s.careerTenure=0;s.careerMomentum=0;notes.push('job:service');}
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
  // Data-driven world changes allow reusable original stories without huge switch tables.
  const finite=(value:unknown):number => typeof value==='number' && Number.isFinite(value)
    ?Math.max(-1_000_000,Math.min(1_000_000,Math.round(value))):0;
  const cash=finite(world.cash);
  if(cash>0){receive(s,cash);notes.push('story-income:'+cash);}
  if(cash<0){charge(s,-cash);notes.push('story-expense:'+(-cash));}
  s.debt=money(s.debt+finite(world.debt));
  s.investments=money(s.investments+finite(world.investments));
  s.family=bound(s.family+finite(world.family));
  s.friends=bound(s.friends+finite(world.friends));
  s.partner=bound(s.partner+finite(world.partner));
  s.credits=money(s.credits+finite(world.credits));
  s.experience=money(s.experience+finite(world.experience));
  s.careerMomentum=Math.min(100,money(s.careerMomentum+finite(world.careerMomentum)));
  s.training=Math.min(100,money(s.training+finite(world.training)));
  s.mysticMastery=Math.min(100,money(s.mysticMastery+finite(world.mysticMastery)));
  if(world.relationship==='single'){s.relationship='single';s.partner=0;}
  if(world.relationship==='dating' && age>=18){s.relationship='dating';s.partner=Math.max(s.partner,55);}
  if(world.relationship==='married' && age>=21 && s.relationship!=='single'){
    s.relationship='married';s.partner=Math.max(s.partner,65);
  }
  return { state: s, stats, notes, ok: true };
}
