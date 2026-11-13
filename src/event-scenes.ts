/** Reusable Zoid Life visual scenes, originally authored in SVG. No third-party assets. */
import type {CharacterProfile} from './characters';
import {portraitLife} from './life-art.ts';
import type {FaceMood} from './pixel-character-v3.ts';
import {petPortrait,type Companion} from './pets.ts';
import {destination,type JourneyId} from './travel.ts';
type SceneKind = 'family'|'school'|'work'|'money'|'health'|'city'|'friend'|'leisure'|'retirement';
type Scene = {kind:SceneKind; props:[string,string]; labelPt:string;labelEn:string};
const SCENES:Record<SceneKind,Scene>={
 family:{kind:'family',props:['heart','home'],labelPt:'FAMÍLIA',labelEn:'FAMILY'},
 school:{kind:'school',props:['book','idea'],labelPt:'EDUCAÇÃO',labelEn:'EDUCATION'},
 work:{kind:'work',props:['briefcase','calendar'],labelPt:'CARREIRA',labelEn:'CAREER'},
 money:{kind:'money',props:['wallet','coins'],labelPt:'FINANÇAS',labelEn:'FINANCES'},
 health:{kind:'health',props:['medkit','heart'],labelPt:'SAÚDE',labelEn:'HEALTH'},
 city:{kind:'city',props:['home','coins'],labelPt:'COTIDIANO',labelEn:'EVERYDAY LIFE'},
 friend:{kind:'friend',props:['people','heart'],labelPt:'RELAÇÕES',labelEn:'RELATIONSHIPS'},
 leisure:{kind:'leisure',props:['star','idea'],labelPt:'LAZER',labelEn:'LEISURE'},
 retirement:{kind:'retirement',props:['sun','home'],labelPt:'NOVA FASE',labelEn:'NEW CHAPTER'}
};
const groups:Record<string,SceneKind>={
 school:'school',study:'school',hobby:'leisure','first-job':'work',work:'work',
 relationship:'friend',family:'family',wellness:'health',playground:'friend',
 'science-fair':'school','team-sport':'leisure','online-learning':'school',
 'first-budget':'money',scholarship:'school','first-rent':'city',
 mentor:'work','work-pressure':'work','friend-conflict':'friend',
 checkup:'health','side-project':'money','family-care':'family',
 'career-switch':'work','old-friend':'friend','retirement-choice':'retirement',
 community:'friend','quiet-year':'city'
};
/** Block pixels draw recognizable objects at a fixed resolution. */
const grids:Record<string,readonly string[]>={
 heart:["..##..##.","########","########",".######.","..####..","...##..."],
 home:["....##....","...####...","..######..",".########.","##########","..######..","..##..##..","..##..##.."],
 book:["##########","##.....###","##......##","##......##","##......##","##......##","##########"],
 idea:["...####...","..######..","..######..","...####...","....##....","...####...","...####..."],
 briefcase:["...####...","...#..#...","##########","##########","####..####","##########","##########"],
 calendar:["##########","##.##.##.#","##########","##..##..##","##..##..##","##########"],
 wallet:["##########","##########","####.....#","####.#...#","####.....#","##########","##########"],
 coins:["......####","......####","..####..##","..####..##","..##..####","..########","..########"],
 medkit:[".########.","##..##..##","##..##..##","##########","####..####","####..####","##..##..##",".########."],
 people:[".###..###.","#####.####","##########","..##..##..",".########.","##########"],
 star:["....##....","....##....","##########",".########.","..######..","..##..##..",".##....##."],
 sun:["....##....",".#..##..#.","..######..","##########","..######..",".#..##..#.","....##...."]
};
const iconColors:Record<string,string>={
 heart:'#d66a77',home:'#7099cf',book:'#557ab4',idea:'#e2b459',
 briefcase:'#557dab',calendar:'#668bb3',wallet:'#8d6daa',coins:'#b8a055',
 medkit:'#bc697b',people:'#768db6',star:'#e2ae51',sun:'#e6bd66'
};
export function sceneType(eventId:string):SceneKind {return groups[eventId]||'city';}
export function iconSvg(icon:string,scale=38):string {
  const rows=grids[icon]??grids.star;
  const color=iconColors[icon]||'#5b7fb5';
  const grid=rows.map((line,y)=>[...line].map((c,x)=>c==='#'?'<rect x="'+(x*4)+'" y="'+(y*4)+'" width="4" height="4" />':'').join('')).join('');
  return '<svg class="pixel-icon" viewBox="0 0 40 40" role="img" aria-label="'+icon+
    '" width="'+Math.max(16,Math.min(64,Math.round(scale)))+'" height="'+Math.max(16,Math.min(64,Math.round(scale)))+
    '" xmlns="http://www.w3.org/2000/svg" fill="'+color+'" shape-rendering="crispEdges">'+grid+'</svg>';
}
/** Independent scenery per category; real environmental context, not a generic gradient for every scene. */
const svgRect=(x:number,y:number,w:number,h:number,c:string)=>
 '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>';
export function sceneBackdrop(kind:SceneKind):string {
 const layers:string[]=[];
 const r=(x:number,y:number,w:number,h:number,c:string)=>layers.push(svgRect(x,y,w,h,c));
 const wall:Record<SceneKind,[string,string]>={
  family:['#eee4dc','#cbaea1'],school:['#dfe7df','#acbca5'],work:['#dce8f4','#a9bccc'],
  money:['#e5e7f0','#b0b9d6'],health:['#e0f1ec','#b3d7cf'],city:['#dce7f1','#a8bacd'],
  friend:['#f0e6dc','#cbb29e'],leisure:['#d9ecf0','#9fc3a4'],retirement:['#e6eee5','#afcca7']
 };
 const palette=wall[kind];r(0,0,240,140,palette[0]);r(0,112,240,28,palette[1]);
 const window=(x:number,y:number,w:number,h:number)=>{
   r(x,y,w,h,'#668cae');r(x+4,y+4,w-8,h-8,'#c0def0');
   r(x+Math.floor(w/2)-2,y+4,4,h-8,'#8bb5cc');r(x+4,y+Math.floor(h/2),w-8,3,'#8bb5cc');
 };
 switch(kind){
 case 'family':
  window(12,12,60,72);r(110,17,68,39,'#c5ad9b');r(115,22,58,29,'#f0c4ae');
  r(13,86,89,31,'#a67e6d');r(19,79,81,12,'#d4aa9b');r(22,107,8,13,'#76554d');r(92,107,7,13,'#76554d');
  r(194,30,22,58,'#b1b6a4');r(188,28,34,6,'#d1d5c5');r(189,84,32,5,'#8b9b7b');break;
 case 'school':
  r(11,14,106,76,'#82684d');r(17,20,94,64,'#397559');r(27,32,72,4,'#c4e1cb');r(27,45,58,3,'#a8c3ae');
  window(157,12,62,69);r(4,103,222,9,'#be9368');r(13,112,9,23,'#8f6e51');r(210,112,8,23,'#8f6e51');break;
 case 'work':
  window(11,9,108,90);r(17,63,14,32,'#779ab3');r(38,47,13,48,'#87acba');r(60,59,18,36,'#638eab');
  r(130,100,95,8,'#ad7c5e');r(137,108,10,29,'#735448');r(207,108,8,29,'#735448');
  r(165,69,35,28,'#405a7a');r(169,73,27,20,'#afcce7');r(162,96,42,4,'#455b73');break;
 case 'money':
  r(9,22,99,68,'#b6c5dd');r(16,28,85,55,'#edf5fc');r(22,49,20,8,'#86a7cf');r(45,40,20,17,'#5e8ab9');
  r(138,105,83,9,'#627f9f');r(145,114,6,20,'#405a7d');r(213,114,6,20,'#405a7d');
  for(let i=0;i<3;i++)r(164+i*14,82-i*7,12,7,'#d5ae61');break;
 case 'health':
  r(13,12,76,78,'#b6d5d0');r(21,19,60,65,'#f9fdfb');r(44,35,12,34,'#dc7883');r(34,46,32,11,'#dc7883');
  r(145,33,74,69,'#9bbeba');r(152,40,60,55,'#eff9f5');r(157,68,48,4,'#bed3cb');
  r(7,105,226,8,'#d5e4df');break;
 case 'city':
  r(0,75,240,44,'#bdd5df');r(9,34,60,79,'#7c9db6');r(17,46,15,23,'#cfe5f1');r(41,46,15,23,'#cfe5f1');
  r(150,45,74,68,'#af8c7c');r(160,54,17,22,'#e5c3ac');r(188,54,17,22,'#e5c3ac');
  r(0,118,240,22,'#a7b0b6');for(let x=8;x<230;x+=36)r(x,129,20,4,'#eff5ef');break;
 case 'friend':
  window(12,10,76,80);r(104,108,127,8,'#a7785f');r(116,116,8,22,'#725346');r(216,116,8,22,'#725346');
  r(166,66,23,35,'#fff6e9');r(169,69,18,26,'#be9980');r(188,75,6,15,'#be9980');
  r(24,95,33,17,'#9e7865');r(30,112,5,21,'#725548');break;
 case 'leisure':
  r(0,0,240,101,'#d0e8f0');r(0,101,240,39,'#9fc6a2');r(170,15,24,24,'#e6cb7c');
  r(20,37,21,74,'#755c4b');r(8,29,46,28,'#629a77');r(13,13,37,25,'#7ba987');
  r(135,104,91,9,'#a98161');r(143,113,7,24,'#785847');r(211,113,7,24,'#785847');break;
 case 'retirement':
  r(0,0,240,100,'#dcece5');r(0,100,240,40,'#8fb89a');
  r(14,35,17,73,'#735745');r(4,23,40,28,'#80af84');r(12,10,30,23,'#6c9d75');
  r(135,102,89,9,'#a58165');r(143,111,8,25,'#725747');r(209,111,8,25,'#725747');
  r(180,24,36,16,'#e8d8a4');r(188,16,20,10,'#f2e7bf');break;
 }
 return '<svg class="scene-world" viewBox="0 0 240 140" preserveAspectRatio="xMidYMid slice"'+
   ' xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">'+
   layers.join('')+'</svg>';
}

/** Six destination-specific story scenes (pixel rectangles, no network images). */
export function journeySceneBackdrop(id:JourneyId):string{
 const pieces:string[]=[];
 const r=(x:number,y:number,w:number,h:number,c:string)=>pieces.push(svgRect(x,y,w,h,c));
 const sky:Record<JourneyId,string>={
  coast:'#c6e8ff',mountains:'#b6d4e6',history:'#f0dbba',
  metropolis:'#bbd0f5',family:'#e7ead9',expedition:'#b9e4d4'
 };
 r(0,0,240,140,sky[id]);
 if(id==='coast'){
  r(0,76,240,64,'#68b5d0');r(0,100,240,40,'#f1d69c');
  for(let i=0;i<6;i++)r(i*42,85+i%2*7,30,4,'#d7f8fb');
  r(175,14,27,27,'#f6e8a1');r(179,18,19,19,'#fff4b5');
  r(18,67,6,68,'#876f49');r(9,36,21,31,'#579770');r(29,44,19,24,'#65aa7c');
  r(14,40,14,4,'#418f72');r(5,49,17,5,'#418f72');
  r(163,100,51,3,'#fff4e0');r(181,107,16,18,'#cda66a');
 }else if(id==='mountains'){
  r(0,88,240,52,'#73a98d');
  for(const [x,peak,width] of [[0,38,90],[71,14,101],[165,36,83]]){
   for(let step=0;step<6;step++){
    const yy=peak+step*10,ww=Math.min(width,(step+1)*17);
    r(x+Math.max(0,Math.floor((width-ww)/2)),yy,ww,11,step<2?'#e1ebec':'#617e91');
   }
  }
  r(0,112,240,28,'#668c7b');r(25,116,160,9,'#b7d5bb');r(185,116,55,11,'#a0c8d1');
 }else if(id==='history'){
  r(0,103,240,37,'#c6a77b');r(17,39,95,67,'#b68b65');
  r(25,31,79,14,'#e4bd89');r(19,45,12,57,'#855b46');r(95,45,12,57,'#855b46');
  r(49,57,39,49,'#80584a');r(57,66,23,40,'#ae8b76');
  r(144,33,80,74,'#d6b68c');r(155,23,59,14,'#f0d8ac');
  for(const col of [154,173,192,211])r(col,47,7,55,'#987754');
  r(138,101,92,8,'#89684c');r(15,108,209,5,'#f4e3c7');
 }else if(id==='metropolis'){
  r(0,103,240,37,'#a2adbf');r(10,30,48,74,'#607d9e');r(69,7,56,96,'#5875a2');
  r(135,19,35,84,'#778db7');r(181,39,48,64,'#456b8e');
  for(let i=0;i<5;i++)for(const x of [19,36,78,96,146,189,206])r(x,46+i*12,9,5,'#d9e9ed');
  r(0,116,240,24,'#627389');for(let x=4;x<230;x+=39)r(x,127,22,3,'#f0f2ec');
 }else if(id==='family'){
  r(0,94,240,46,'#80ad81');r(19,49,115,49,'#f2dbb8');
  r(9,41,135,13,'#9e674c');r(35,28,86,16,'#b77f65');
  r(37,61,19,23,'#85b3c1');r(70,61,23,37,'#86684f');r(106,61,18,22,'#85b3c1');
  r(176,59,9,54,'#6e644c');r(154,40,52,32,'#76a88a');
  r(182,82,31,15,'#e0c0a2');r(156,108,58,8,'#b99464');
 }else{
  r(0,91,240,49,'#79b492');
  for(const [x,y] of [[5,21],[39,10],[76,30],[171,11],[207,27]]){
   r(x+10,y+32,8,82-y,'#755d48');r(x,y+5,35,33,'#3a8b6d');
   r(x+5,y,26,25,'#63a883');r(x+10,y+12,12,12,'#7bc398');
  }
  r(93,81,73,18,'#b29b71');r(102,97,56,17,'#c8b58a');
  r(0,116,240,24,'#517d72');r(112,116,20,24,'#ded0a5');
 }
 return '<svg class="scene-world journey-world" data-destination="'+id+
  '" viewBox="0 0 240 140" preserveAspectRatio="xMidYMid slice" '+
  'xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">'+
  pieces.join('')+'</svg>';
}

export function eventScene(eventId:string,character:CharacterProfile,language:'pt-BR'|'en',age=20,category?:string,mood?:FaceMood,pet?:Pick<Companion,'species'|'name'>|null):string {
  const scene=category && Object.prototype.hasOwnProperty.call(SCENES,category)?SCENES[category as SceneKind]:SCENES[sceneType(eventId)];
  const trip=eventId.startsWith('travel-')?destination(eventId.slice(7)):null;
  const label=trip?(language==='en'?'TRAVEL':'VIAGEM'):(language==='en'?scene.labelEn:scene.labelPt);
  return '<div class="scene-visual scene-'+scene.kind+'" aria-label="'+label+'">'+
    (trip?journeySceneBackdrop(trip.id):sceneBackdrop(scene.kind))+
    '<div class="scene-avatar">'+portraitLife(character,age,'scene',mood)+'</div>'+
    (pet&&eventId.startsWith('pet-story-')?
      '<div class="scene-pet-actor" data-pet-species="'+pet.species+'">'+
        petPortrait(pet.species)+'</div>':'')+
    '<div class="scene-props"><div>'+iconSvg(scene.props[0],46)+'</div><div>'+iconSvg(scene.props[1],46)+'</div></div>'+
    '<span class="scene-label">'+label+'</span></div>';
}
