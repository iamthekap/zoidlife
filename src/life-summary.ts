/** Original ending report and chapter synopsis for Zoid Life. No invented achievements. */
import type {Simulation,Stats} from './simulation.ts';
import type {SocialState} from './social.ts';
import {careerById,careerLabel} from './careers.ts';
export type Locale='pt-BR'|'en';
export type LifeReportInput={
 name:string;age:number;birthYear:number;stats:Stats;simulation:Simulation;social:SocialState;
 history:readonly string[];
};
export type LifeReport={
 name:string;age:number;birthYear:number;endYear:number;profession:string;
 education:string;children:number;friends:number;netWorth:number;
 balance:number;debt:number;investments:number;property:number;events:string[];
 achievements:string[];stats:Stats;
};
const txt=(lang:Locale,pt:string,en:string)=>lang==='en'?en:pt;
const edu=(s:Simulation,lang:Locale)=>{
 const names:Record<Simulation['education'],[string,string]>={
  none:['Sem escolaridade formal','No formal education'],school:['Ensino básico','Primary school'],
  secondary:['Ensino médio','High school'],college:['Ensino superior','College degree']};
 return names[s.education][lang==='en'?1:0];
};
const sanitize=(line:string)=>{
 const m=/^(\d{1,3}):\s*(.+)$/.exec(line);
 return m?m[2]:line;
};
export function makeLifeReport(input:LifeReportInput,lang:Locale):LifeReport{
 const s=input.simulation;
 const role=s.job==='retired'||s.job==='none'?null:careerById(s.occupation);
 const profession=role&&role.job===s.job?careerLabel(role,lang):
  ({none:txt(lang,'Sem emprego','Unemployed'),parttime:txt(lang,'Meio período','Part-time'),
   service:txt(lang,'Serviços','Service work'),office:txt(lang,'Escritório','Office work'),
   professional:txt(lang,'Profissional','Professional'),retired:txt(lang,'Aposentado(a)','Retired')})[s.job];
 const achievements:string[]=[];
 if(s.education==='secondary'||s.education==='college')achievements.push(txt(lang,'Concluiu o ensino médio','Finished high school'));
 if(s.education==='college')achievements.push(txt(lang,'Concluiu faculdade','Graduated college'));
 if(s.homeOwned)achievements.push(txt(lang,'Conquistou imóvel','Became a homeowner'));
 if(s.children>0)achievements.push(txt(lang,'Criou uma família','Raised a family'));
 if(s.relationship==='married')achievements.push(txt(lang,'Construiu um casamento','Built a marriage'));
 if(s.investments>0)achievements.push(txt(lang,'Construiu investimentos','Built investments'));
 if(s.experience>=10)achievements.push(txt(lang,'Carreira de longa duração','Long professional career'));
 // Imported history may contain notes from future ages: never report them as lived events.
 const news=input.history.filter(x=>{
  if(typeof x!=='string'||!x.trim())return false;
  const match=/^(\d{1,3}):\s*(.*)$/.exec(x);
  return !match||(Number(match[1])<=input.age&&!!match[2].trim());
 }).map(sanitize);
 const events=[...new Set(news)].slice(-12).reverse();
 const children=input.social?.people.filter(p=>p.role==='child').length??s.children;
 const friends=input.social?.people.filter(p=>p.role==='friend'&&p.alive).length??0;
 const balanced=(n:number)=>Number.isFinite(n)?Math.round(n):0;
 return {name:input.name,age:input.age,birthYear:input.birthYear,endYear:input.birthYear+input.age,
  profession,education:edu(s,lang),children:Math.max(children,s.children),friends,
  netWorth:balanced(s.balance+s.investments+s.homeValue-s.debt),
  balance:balanced(s.balance),debt:balanced(s.debt),investments:balanced(s.investments),
  property:balanced(s.homeValue),events,achievements,stats:{...input.stats}};
}
export function reportAsText(report:LifeReport,lang:Locale):string{
 const pt=lang==='pt-BR';
 const lines=[
  'ZOID LIFE — '+(pt?'RESUMO DE VIDA':'LIFE SUMMARY'),report.name,
  (pt?'Idade final':'Final age')+': '+report.age,
  (pt?'Nascimento':'Born')+': '+report.birthYear,
  (pt?'Último ano':'Last year')+': '+report.endYear,
  (pt?'Profissão':'Occupation')+': '+report.profession,
  (pt?'Educação':'Education')+': '+report.education,
  (pt?'Filhos':'Children')+': '+report.children,
  (pt?'Amigos próximos':'Friends')+': '+report.friends,
  (pt?'Patrimônio líquido':'Net worth')+': '+report.netWorth,
  (pt?'Saldo':'Balance')+': '+report.balance,
  (pt?'Dívidas':'Debt')+': '+report.debt,
  (pt?'Investimentos':'Investments')+': '+report.investments,
  (pt?'Imóveis':'Property')+': '+report.property,
  (pt?'Felicidade':'Happiness')+': '+report.stats.happiness+'%',
  (pt?'Saúde':'Health')+': '+report.stats.health+'%',
  (pt?'Inteligência':'Smarts')+': '+report.stats.smarts+'%',
  (pt?'Aparência':'Looks')+': '+report.stats.looks+'%',
  '',(pt?'CONQUISTAS':'ACHIEVEMENTS'),...report.achievements.map(x=>'- '+x),
  '',(pt?'ACONTECIMENTOS':'LIFE EVENTS'),...report.events.map(x=>'- '+x),''
 ];
 return lines.join('\n');
}
