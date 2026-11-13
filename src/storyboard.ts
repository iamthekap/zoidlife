/**
 * Original storyboard compositor for Zoid Life.
 * Real, attained life phases only; no invented future achievements.
 * Portrait colors/traits are always derived from the existing player profile.
 * Uses crisp SVG environments and layered transparent life-art sprites.
 */
import type {CharacterProfile} from './characters.ts';
import {portraitLife,lifeStage,type LifeStage} from './life-art.ts';

export type Locale='pt-BR'|'en';
export type LifeMilestone={
 stage:LifeStage; age:number; title:string; location:string;
 summary:string; notes:string[];
};
const stages=[
 {stage:'baby',age:0,pt:'Bebê',en:'Baby',ptPlace:'Em casa',enPlace:'At home',ptDefault:'Os primeiros dias da sua história.',enDefault:'The first days of your story.'},
 {stage:'child',age:3,pt:'Criança',en:'Child',ptPlace:'Escola e descobertas',enPlace:'Learning and discovery',ptDefault:'A infância começa a ganhar novas histórias.',enDefault:'Your childhood unfolds into new stories.'},
 {stage:'teen',age:12,pt:'Adolescente',en:'Teen',ptPlace:'Novos caminhos',enPlace:'New paths',ptDefault:'Uma fase de mudanças e escolhas.',enDefault:'A time of changes and choices.'},
 {stage:'adult',age:18,pt:'Adulto',en:'Adult',ptPlace:'Independência',enPlace:'Independence',ptDefault:'Um novo capítulo da vida adulta.',enDefault:'A new chapter of adulthood.'},
 {stage:'senior',age:65,pt:'Idoso',en:'Senior',ptPlace:'Memórias e novos planos',enPlace:'Memories and new plans',ptDefault:'Mais uma etapa da sua trajetória.',enDefault:'Another chapter of your journey.'}
] as const satisfies ReadonlyArray<{
 stage:LifeStage;age:number;pt:string;en:string;ptPlace:string;enPlace:string;ptDefault:string;enDefault:string;
}>;
export function readHistory(line:string):{age:number;text:string}|null {
 if(typeof line!=='string'||!line.trim())return null;
 const parsed=/^(\d{1,3}):\s*(.*)$/.exec(line);
 if(parsed){const age=Number(parsed[1]);if(age>110||!parsed[2].trim())return null;return {age,text:parsed[2].trim()};}
 // Older saves store the birth line without an "0:" prefix.
 return {age:0,text:line.trim()};
}
export function milestonesUntil(age:number,history:readonly string[],locale:Locale):LifeMilestone[] {
 const current=Math.max(0,Math.min(110,Math.floor(Number.isFinite(age)?age:0)));
 const parsed=history.map(readHistory).filter((x):x is {age:number;text:string}=>x!==null && x.age<=current);
 return stages.filter(s=>s.age<=current).map((s,i)=>{
   const next=stages[i+1]?.age??111;
   const notes=parsed.filter(x=>x.age>=s.age&&x.age<next).map(x=>x.text);
   const fallback=locale==='en'?s.enDefault:s.ptDefault;
   return {
     stage:s.stage,age:s.age,title:locale==='en'?s.en:s.pt,
     location:locale==='en'?s.enPlace:s.ptPlace,
     summary:notes.at(-1)??fallback,notes:notes.slice(-3)
   };
 });
}
const rect=(x:number,y:number,w:number,h:number,fill:string)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';
function scenery(stage:LifeStage):{back:string;front:string}{
 const pieces:string[]=[];
 const r=(x:number,y:number,w:number,h:number,c:string)=>pieces.push(rect(x,y,w,h,c));
 // Pixel aligned 240x160 original scenes; dark outlines are derived from local colors.
 if(stage==='baby'){
   r(0,0,240,160,'#f5e8db');r(0,106,240,54,'#96acc7');
   r(16,14,74,73,'#b7d2eb');r(22,20,62,61,'#d9e9f5');
   r(28,24,50,5,'#f7fafc');r(40,20,6,61,'#b7d2eb');
   r(144,15,75,30,'#e6d0bb');r(150,21,63,18,'#e9a4a6');
   r(37,91,166,51,'#af7950');r(43,97,154,39,'#d0a076');
   r(50,104,140,25,'#e4eff8');r(53,106,134,15,'#f6fafb');
   const back=pieces.join('');
   pieces.length=0;
   r(38,123,166,7,'#855638');r(42,128,8,22,'#9c6542');
   for(let x=58;x<=189;x+=16)r(x,127,6,21,'#b47a51');
   r(194,128,8,22,'#9c6542');r(37,147,166,8,'#744c36');
   return {back,front:pieces.join('')};
 }
 if(stage==='child'){
   r(0,0,240,160,'#e6e9e2');r(0,129,240,31,'#b5a58d');
   r(12,14,112,74,'#8b654a');r(18,20,100,62,'#3b745a');
   r(30,29,72,4,'#d5e2cf');r(30,43,61,3,'#b6cfba');
   r(144,8,84,81,'#99bad2');r(150,14,72,69,'#cce2ee');
   r(184,14,5,69,'#a0bdd1');
   r(35,109,168,10,'#bf8d5b');r(42,119,8,35,'#956b4c');
   r(190,119,8,35,'#956b4c');
   const back=pieces.join('');pieces.length=0;
   r(62,114,126,10,'#b98655');r(69,124,8,31,'#876445');
   r(178,124,8,31,'#876445');r(75,118,94,3,'#deb38a');
   return {back,front:pieces.join('')};
 }
 if(stage==='teen'){
   r(0,0,240,160,'#f5e7d8');r(0,125,240,35,'#b9a29c');
   r(9,10,106,77,'#916b57');r(16,17,93,63,'#bad8df');
   r(23,23,38,57,'#e6eff0');r(68,23,34,57,'#d7e8ee');
   r(130,10,97,39,'#a65d5d');r(137,16,83,27,'#d58b70');
   r(144,21,63,12,'#fff6e1');r(6,86,85,33,'#ad7a5a');
   r(8,91,81,5,'#d2a57f');r(21,100,17,16,'#6c4d3d');
   r(167,66,33,42,'#6b929e');r(174,73,19,26,'#aed4dc');
   const back=pieces.join('');pieces.length=0;
   r(116,122,99,7,'#956c54');r(129,129,8,24,'#6c4c3e');
   r(197,129,8,24,'#6c4c3e');
   return {back,front:pieces.join('')};
 }
 if(stage==='adult'){
   r(0,0,240,160,'#e0e9f5');r(0,129,240,31,'#9facb7');
   r(11,9,95,100,'#6386a8');r(18,16,81,86,'#b5cde0');
   r(27,23,30,79,'#dfeaf5');r(66,23,26,79,'#ecf3fa');
   r(130,15,98,57,'#8b9eb7');r(137,22,84,44,'#d3e1ed');
   r(144,36,15,30,'#94b7c4');r(166,29,13,37,'#aac9d3');
   r(196,35,17,31,'#8eb4bf');r(52,102,152,12,'#b27e60');
   r(64,114,10,35,'#795b4f');r(180,114,10,35,'#795b4f');
   const back=pieces.join('');pieces.length=0;
   r(119,119,101,10,'#a97659');r(125,129,9,27,'#78574b');
   r(204,129,9,27,'#78574b');r(166,105,31,5,'#434b63');
   return {back,front:pieces.join('')};
 }
 r(0,0,240,160,'#e3edf0');r(0,111,240,49,'#8daf8a');
 r(10,17,60,79,'#a9cfa6');r(20,21,37,71,'#6b996a');
 r(174,16,59,80,'#b0d2a7');r(188,25,34,69,'#6e9a72');
 r(34,111,183,12,'#a07b61');r(48,123,10,31,'#7f5e4a');
 r(195,123,10,31,'#7f5e4a');
 const back=pieces.join('');pieces.length=0;
 r(55,121,132,7,'#9b7352');r(63,128,9,26,'#765b48');
 r(173,128,9,26,'#765b48');
 return {back,front:pieces.join('')};
}
const esc=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function storyboardPanel(profile:CharacterProfile,stage:LifeStage,locale:Locale):string {
 const age=stages.find(s=>s.stage===stage)?.age??0;
 const art=scenery(stage);
 const title=locale==='en'?'Life scene':'Cena da vida';
 const svg=(content:string,cls:string)=>'<svg class="'+cls+'" viewBox="0 0 240 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">'+content+'</svg>';
 return '<div class="storyboard-scene storyboard-scene-'+stage+'" aria-label="'+esc(title)+' — '+esc(stage)+'">'+
  svg(art.back,'storyboard-scenery')+
  '<div class="storyboard-actor">'+portraitLife(profile,age,'story-actor')+'</div>'+
  (art.front?svg(art.front,'storyboard-foreground'):'')+'</div>';
}
export function renderStoryboardTimeline(profile:CharacterProfile,age:number,history:readonly string[],locale:Locale,currentHtml=''):string {
 const milestones=milestonesUntil(age,history,locale);
 const title=locale==='en'?'Life chapters':'Capítulos da vida';
 const lead=locale==='en'?'Your story, scene by scene':'Sua história, quadro a quadro';
 const yearLabel=locale==='en'?'Age':'Idade';
 const items=milestones.slice().reverse().map((m,i)=>{
   const position=(milestones.length-1-i)%2===0?'odd':'even';
   return '<li class="storyboard-milestone storyboard-'+m.stage+' '+position+'" data-stage="'+m.stage+'" data-age="'+m.age+'">'+
     '<span class="storyboard-node" aria-hidden="true"></span>'+
     '<div class="storyboard-copy"><span class="storyboard-age">'+esc(yearLabel)+': '+m.age+'</span>'+
      '<h3>'+esc(m.title)+'</h3><span class="storyboard-location">'+esc(m.location)+'</span>'+
      '<p>'+esc(m.summary)+'</p></div>'+
     storyboardPanel(profile,m.stage,locale)+'</li>';
 }).join('');
 return '<section class="storyboard-timeline" aria-label="'+esc(title)+'">'+
  '<header class="storyboard-heading"><div><span class="storyboard-eyebrow"><b class="brand-zoid">Zoid</b><b class="brand-life">Life</b></span><h2>'+esc(title)+'</h2>'+
   '<p>'+esc(lead)+'</p></div><span class="storyboard-count">'+milestones.length+'/'+stages.length+'</span></header>'+
  (currentHtml?'<div class="storyboard-current" data-storyboard-current="true">'+currentHtml+'</div>':'')+
  '<ol class="storyboard-track">'+items+'</ol></section>';
}
export function currentStoryboardStage(age:number):LifeStage {return lifeStage(age);}
