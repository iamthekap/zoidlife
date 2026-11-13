/** Original fantasy rules, available ONLY for custom-created Zoid Life characters. */
import type {CharacterProfile,Nature} from './characters.ts';
import type {Simulation,Stats,Outcome} from './simulation.ts';
import {canTakeAction} from './simulation.ts';
import type {Scenario} from './events-extended.ts';
type SpecialNature='vampire'|'werewolf'|'mage';
export function isMysticOrigin(p:CharacterProfile|undefined|null):p is CharacterProfile&{origin:'custom';nature:SpecialNature}{
 return !!p&&p.origin==='custom'&&(p.nature==='vampire'||p.nature==='werewolf'||p.nature==='mage');
}
export function mysticNatureLabel(n:Nature,lang:'pt-BR'|'en'):string{
 const l:Record<Nature,[string,string]>={human:['Humano','Human'],vampire:['Vampiro','Vampire'],
 werewolf:['Lobisomem','Werewolf'],mage:['Mago(a)','Mage']};
 return l[n][lang==='en'?1:0];
}
const bound=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
export function practiceMystic(s:Simulation,stats:Stats,age:number,p:CharacterProfile):Outcome{
 if(!isMysticOrigin(p)||age<12||!canTakeAction(s,age,'mystic'))
  return {state:s,stats,ok:false,notes:[]};
 const gains={vampire:5,werewolf:7,mage:6};
 const strength=bound(s.mysticMastery+gains[p.nature]);
 const health=p.nature==='werewolf'?4:p.nature==='vampire'?3:0;
 const smarts=p.nature==='mage'?4:0;
 const happiness=p.nature==='vampire'?-1:2;
 return {ok:true,notes:['mystic-mastery:'+strength],
  state:{...s,mysticMastery:strength,lastActionAge:age,actionLedger:{...s.actionLedger,mystic:age}},
  stats:{...stats,health:bound(stats.health+health),smarts:bound(stats.smarts+smarts),
   happiness:bound(stats.happiness+happiness)}};
}
type S={id:string;nature:SpecialNature;min:number;max:number;category:Scenario['category'];
 pt:[string,string];en:[string,string];ptOptions:[string,string,string];enOptions:[string,string,string];
 ptResults:[string,string,string];enResults:[string,string,string];effects:[Partial<Stats>,Partial<Stats>,Partial<Stats>]};
const seeds:S[]=[
 {id:'vampire-first-dusk',nature:'vampire',min:12,max:35,category:'health',
 pt:['O primeiro crepúsculo','Ao anoitecer, seus sentidos parecem mudar.'],en:['First dusk','At sunset, your senses begin to change.'],
 ptOptions:['Praticar autocontrole','Pedir ajuda','Seguir o impulso'],enOptions:['Practice self-control','Ask for help','Follow your impulse'],
 ptResults:['Você aprendeu a controlar seus sentidos.','Você recebeu apoio.','A noite foi exaustiva.'],
 enResults:['You learned to control your senses.','You received support.','The night left you exhausted.'],
 effects:[{smarts:5},{happiness:6},{health:-7}]},
 {id:'vampire-sunrise',nature:'vampire',min:16,max:100,category:'health',
 pt:['Amanhecer inesperado','Um evento importante acontece sob o sol forte.'],en:['Unexpected sunrise','An important event takes place in bright sunlight.'],
 ptOptions:['Buscar abrigo','Alterar os planos','Enfrentar o desconforto'],enOptions:['Seek shelter','Adjust your plans','Face the discomfort'],
 ptResults:['Você se protegeu.','Você se adaptou.','Você saiu exausto(a).'],
 enResults:['You found protection.','You adapted.','You were exhausted.'],
 effects:[{health:5},{smarts:4},{health:-9}]},
 {id:'vampire-night-shift',nature:'vampire',min:18,max:88,category:'work',
 pt:['Trabalho noturno','Um desconhecido oferece uma oportunidade depois da meia-noite.'],en:['A night shift','A stranger offers an opportunity after midnight.'],
 ptOptions:['Investigar a oferta','Aceitar a mudança','Recusar'],enOptions:['Investigate','Accept','Decline'],
 ptResults:['Você descobriu pistas.','Você abraçou a rotina noturna.','Você ficou em paz.'],
 enResults:['You found clues.','You embraced nocturnal life.','You kept your peace.'],
 effects:[{smarts:5},{happiness:4,health:-3},{happiness:2}]},
 {id:'wolf-first-moon',nature:'werewolf',min:12,max:35,category:'health',
 pt:['Lua cheia','Um brilho no céu desencadeia uma transformação inesperada.'],en:['Full moon','Moonlight triggers an unexpected transformation.'],
 ptOptions:['Controlar a respiração','Pedir orientação','Correr sem pensar'],enOptions:['Breathe slowly','Seek guidance','Run impulsively'],
 ptResults:['Você aprendeu a se controlar.','Você encontrou apoio.','Você terminou ferido(a).'],
 enResults:['You practiced self-control.','You found help.','You ended up hurt.'],
 effects:[{smarts:5},{happiness:5},{health:-8}]},
 {id:'wolf-new-pack',nature:'werewolf',min:17,max:90,category:'friend',
 pt:['A alcateia','Você encontra pessoas que compreendem sua transformação.'],en:['The pack','You meet people who understand your transformation.'],
 ptOptions:['Conhecê-los','Manter independência','Convidar um amigo'],enOptions:['Join them','Stay independent','Bring a friend'],
 ptResults:['Você encontrou companhia.','Você desenvolveu confiança.','O vínculo cresceu.'],
 enResults:['You found company.','You gained confidence.','Your bond grew.'],
 effects:[{happiness:6},{smarts:4},{happiness:5}]},
 {id:'wolf-family',nature:'werewolf',min:20,max:95,category:'family',
 pt:['Instinto e família','Seus instintos provocam tensão em uma reunião familiar.'],en:['Family instincts','Your instincts cause tension at a family gathering.'],
 ptOptions:['Pedir desculpas','Se afastar um pouco','Buscar autocontrole'],enOptions:['Apologize','Take time alone','Practice restraint'],
 ptResults:['Você reconstruiu a confiança.','Você teve tempo para pensar.','Você encontrou equilíbrio.'],
 enResults:['You rebuilt trust.','You had time to think.','You found balance.'],
 effects:[{happiness:6},{smarts:3},{smarts:5}]},
 {id:'mage-first-spark',nature:'mage',min:12,max:35,category:'school',
 pt:['Primeira centelha','Um objeto reage de forma impossível ao seu toque.'],en:['First spark','An object reacts impossibly to your touch.'],
 ptOptions:['Estudar o fenômeno','Pedir conselho','Experimentar sozinho(a)'],enOptions:['Study it','Ask for advice','Experiment alone'],
 ptResults:['Você identificou padrões.','Você recebeu conselhos.','O experimento saiu errado.'],
 enResults:['You found patterns.','You received advice.','The experiment backfired.'],
 effects:[{smarts:7},{smarts:4,happiness:2},{health:-5}]},
 {id:'mage-hidden-books',nature:'mage',min:18,max:97,category:'school',
 pt:['Livros ocultos','Você encontra uma pequena biblioteca escondida.'],en:['Hidden books','You find a small secret library.'],
 ptOptions:['Ler com atenção','Compartilhar a descoberta','Fechar a passagem'],enOptions:['Read carefully','Share the discovery','Close the passage'],
 ptResults:['Você aumentou seu conhecimento.','Você aproximou seus amigos.','Você evitou riscos.'],
 enResults:['You learned more.','You brought friends closer.','You avoided risk.'],
 effects:[{smarts:7},{happiness:5},{health:3}]},
 {id:'mage-healing',nature:'mage',min:24,max:100,category:'health',
 pt:['Dilema arcano','Alguém pede ajuda para um problema misterioso.'],en:['Arcane dilemma','Someone asks for help with a mysterious problem.'],
 ptOptions:['Usar conhecimento','Trabalhar em equipe','Ignorar o pedido'],enOptions:['Use your knowledge','Work together','Ignore the request'],
 ptResults:['Você ajudou com cuidado.','Vocês encontraram uma solução.','A oportunidade passou.'],
 enResults:['You helped carefully.','You found a shared solution.','The chance passed.'],
 effects:[{smarts:6,happiness:4},{happiness:6},{happiness:-4}]}
];
export function mysticEvents(lang:'pt-BR'|'en',p:CharacterProfile|undefined|null):Scenario[]{
 if(!isMysticOrigin(p))return [];
 const en=lang==='en';
 return seeds.filter(x=>x.nature===p.nature).map(x=>({
  id:x.id,minAge:x.min,maxAge:x.max,category:x.category,condition:'any',
  title:(en?x.en:x.pt)[0],description:(en?x.en:x.pt)[1],
  choices:x.effects.map((effects,i)=>({label:(en?x.enOptions:x.ptOptions)[i],
   result:(en?x.enResults:x.ptResults)[i],effects,world:{}}))
 }));
}
