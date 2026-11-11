/** Reusable Zoid Life visual scenes, originally authored in SVG. No third-party assets. */
import type {CharacterProfile} from './characters';
import {portraitLife} from './life-art';
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
export function eventScene(eventId:string,character:CharacterProfile,language:'pt-BR'|'en',age=20,category?:string):string {
  const scene=category && Object.prototype.hasOwnProperty.call(SCENES,category)?SCENES[category as SceneKind]:SCENES[sceneType(eventId)];
  const label=language==='en'?scene.labelEn:scene.labelPt;
  return '<div class="scene-visual scene-'+scene.kind+'" aria-label="'+label+'">'+
    '<div class="scene-decoration" aria-hidden="true"><span class="scene-grid"></span><span class="scene-orbit"></span></div>'+
    '<div class="scene-avatar">'+portraitLife(character,age,'scene')+'</div>'+
    '<div class="scene-props"><div>'+iconSvg(scene.props[0],46)+'</div><div>'+iconSvg(scene.props[1],46)+'</div></div>'+
    '<span class="scene-label">'+label+'</span></div>';
}
