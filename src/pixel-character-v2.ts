/**
 * Zoid Life original Clean Pixel Simulation character rig v2.
 * 72x88 logical pixel canvas, 2x integer scaling to the game 144x176 viewBox.
 * Five anatomically different age silhouettes; shared genetic palette and face map.
 * Local-color selective outlines, at most three solid tones per material.
 * No third party assets. Every sprite is a self-contained SVG.
 */
import type {CharacterProfile} from './characters.ts';

export type PixelStage='baby'|'child'|'teen'|'adult'|'senior';
type Palette={light:string;mid:string;dark:string};
type Rig={x:number;y:number;w:number;h:number;torsoY:number;torsoW:number;legY:number};
const skins:Record<CharacterProfile['skin'],Palette>={
 light:{light:'#f6d3b4',mid:'#e9af91',dark:'#ac735f'},
 tan:{light:'#e5b487',mid:'#ce956f',dark:'#925e4c'},
 brown:{light:'#ba8362',mid:'#9a654c',dark:'#694434'},
 deep:{light:'#916048',mid:'#73462f',dark:'#492f29'}
};
const hairColors:Record<CharacterProfile['hairColor'],Palette>={
 black:{light:'#464550',mid:'#252735',dark:'#151827'},
 brown:{light:'#856151',mid:'#614234',dark:'#3b2a28'},
 blonde:{light:'#f5d180',mid:'#d3a45b',dark:'#987244'},
 red:{light:'#cf8b60',mid:'#a65b41',dark:'#6e3934'}
};
const eyes:Record<CharacterProfile['eyes'],string>={blue:'#397cc0',green:'#38836b',brown:'#74452e'};
const outfits:Palette[]=[
 {light:'#83b5f2',mid:'#3976c9',dark:'#214b87'},
 {light:'#ff9cb0',mid:'#dc536d',dark:'#99394c'},
 {light:'#98d4d0',mid:'#539c9d',dark:'#336a70'},
 {light:'#e6c38c',mid:'#b88963',dark:'#7b5949'},
 {light:'#baacf1',mid:'#8675bd',dark:'#605184'},
 {light:'#e1a0a2',mid:'#bf5a62',dark:'#8a414b'}
];
const shoes:Palette={light:'#f8fafc',mid:'#c4cbd9',dark:'#657185'};
const rigs:Record<PixelStage,Rig>={
 baby:{x:13,y:9,w:46,h:42,torsoY:52,torsoW:35,legY:74},
 child:{x:20,y:7,w:33,h:33,torsoY:41,torsoW:27,legY:65},
 teen:{x:23,y:6,w:27,h:28,torsoY:35,torsoW:31,legY:65},
 adult:{x:24,y:5,w:25,h:27,torsoY:33,torsoW:33,legY:64},
 senior:{x:23,y:6,w:27,h:28,torsoY:35,torsoW:33,legY:65}
};
const fixedHash=(s:string)=>[...s].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,2166136261);
const rect=(x:number,y:number,w:number,h:number,color:string,extra='')=>
 '<rect x="'+Math.round(x)+'" y="'+Math.round(y)+'" width="'+Math.max(1,Math.round(w))+
 '" height="'+Math.max(1,Math.round(h))+'" fill="'+color+'"'+extra+'/>';
class Painter{
 chunks:string[]=[];
 rect(x:number,y:number,w:number,h:number,color:string,extra=''):void{this.chunks.push(rect(x,y,w,h,color,extra));}
 group(label:string,fn:()=>void):void{
  this.chunks.push('<g data-part="'+label+'">');fn();this.chunks.push('</g>');
 }
}
function background(d:Painter,seed:number):void{
 const bases=['#e7eef9','#f5e8ed','#e9f0ef','#f5ede4','#edeaf7'];
 const base=bases[seed%bases.length];
 d.group('background',()=>{
  d.rect(0,0,72,88,base);
  d.rect(4,4,64,80,'#ffffff',' opacity=".33"');
  d.rect(8,9,56,70,base,' opacity=".54"');
  for(let i=0;i<17;i++){
   d.rect(8+(i*17)%57,9+(i*19)%69,1,1,'#ffffff',' opacity=".43"');
  }
  d.rect(8,78,56,2,'#b1bfd2',' opacity=".40"');
 });
}
function leg(d:Painter,x:number,y:number,w:number,h:number,fill:Palette,foot:boolean):void{
 d.rect(x-1,y,w+2,h,fill.dark);d.rect(x,y,w,h-1,fill.mid);
 d.rect(x+2,y+3,Math.max(2,w-5),h-7,fill.light,' opacity=".30"');
 if(foot){
   d.rect(x-3,y+h-5,w+6,5,shoes.dark);
   d.rect(x-2,y+h-4,w+5,3,shoes.mid);
   d.rect(x+1,y+h-4,Math.max(3,w-3),1,shoes.light);
 }
}
function outfit(d:Painter,stage:PixelStage,p:CharacterProfile,seed:number,skin:Palette,cloth:Palette):void{
 const rig=rigs[stage],cx=36,w=rig.torsoW,x=Math.round(cx-w/2);
 d.group(stage==='baby'?'seated-onesie':'body-outfit',()=>{
  if(stage==='baby'){
   // Real infant: tucked torso, bent pudgy legs and seated diaper silhouette.
   d.rect(17,64,15,14,skin.dark);d.rect(40,64,15,14,skin.dark);
   d.rect(18,65,14,12,skin.mid);d.rect(41,65,13,12,skin.mid);
   d.rect(20,71,11,5,skin.light);d.rect(42,71,11,5,skin.light);
   d.rect(23,49,26,5,cloth.dark);
   d.rect(19,52,34,24,cloth.dark);
   d.rect(20,53,32,21,cloth.mid);
   d.rect(22,54,28,6,cloth.light);
   d.rect(19,60,5,13,cloth.mid);d.rect(48,60,5,13,cloth.mid);
   // Rounded knee and tiny ankle shapes, unmistakably sitting.
   d.rect(12,67,15,12,skin.dark);d.rect(45,67,15,12,skin.dark);
   d.rect(13,68,13,10,skin.light);d.rect(46,68,13,10,skin.light);
   d.rect(15,74,9,4,skin.mid);d.rect(48,74,9,4,skin.mid);
   d.rect(22,74,28,6,cloth.dark);d.rect(23,73,26,5,cloth.mid);
   // Sleeves, arms and rounded baby hands.
   d.rect(15,55,9,13,cloth.dark);d.rect(16,56,8,10,cloth.mid);
   d.rect(48,55,9,13,cloth.dark);d.rect(48,56,8,10,cloth.mid);
   d.rect(11,64,9,9,skin.dark);d.rect(12,65,8,8,skin.light);
   d.rect(52,64,9,9,skin.dark);d.rect(52,65,8,8,skin.light);
   // Soft onesie graphic: icon/pocket varies between babies.
   const emblem=seed%4;
   if(emblem===0){
     d.rect(33,59,7,5,'#fff7ec');d.rect(32,62,9,4,'#fff7ec');
     d.rect(35,63,3,3,'#e97185');
   }else if(emblem===1){
     for(const y of [58,64,70])d.rect(27,y,18,2,'#fff0eb');
   }else if(emblem===2){
     d.rect(32,60,8,8,'#fff0e0');d.rect(34,62,4,4,'#eaa36a');
   }else{
     d.rect(34,58,3,3,cloth.light);
     d.rect(37,61,3,3,'#f7d17e');d.rect(31,64,3,3,cloth.light);
   }
   d.rect(33,54,7,3,skin.light);d.rect(30,53,12,2,'#fff3e4');
   return;
  }
  // Separately constructed child/teen/adult proportions; never scale an adult down.
  const legY=rig.legY,torsoY=rig.torsoY;
  const pants:Palette=stage==='child'?
   {light:'#8cc7e6',mid:'#537dad',dark:'#385676'}:
   {light:'#698bad',mid:'#3e5a82',dark:'#283b5b'};
  const bodyBottom=legY+1;
  const leftLeg=stage==='child'?26:24,rightLeg=stage==='child'?39:41,legW=stage==='child'?8:9;
  leg(d,leftLeg,legY,legW,82-legY,pants,true);
  leg(d,rightLeg,legY,legW,82-legY,pants,true);
  d.rect(x-1,torsoY,w+2,bodyBottom-torsoY,cloth.dark);
  d.rect(x,torsoY+1,w,bodyBottom-torsoY-2,cloth.mid);
  d.rect(x+2,torsoY+2,w-4,4,cloth.light,' opacity=".65"');
  // Shoulder and distinct sleeves.
  d.rect(x-7,torsoY+3,9,stage==='child'?18:22,cloth.dark);
  d.rect(x-6,torsoY+4,7,stage==='child'?16:20,cloth.mid);
  d.rect(x+w-1,torsoY+3,9,stage==='child'?18:22,cloth.dark);
  d.rect(x+w,torsoY+4,7,stage==='child'?16:20,cloth.mid);
  d.rect(x-5,torsoY+(stage==='child'?19:23),6,7,skin.dark);
  d.rect(x-4,torsoY+(stage==='child'?19:23),5,6,skin.light);
  d.rect(x+w+1,torsoY+(stage==='child'?19:23),6,7,skin.dark);
  d.rect(x+w+1,torsoY+(stage==='child'?19:23),5,6,skin.light);
  d.rect(33,torsoY-2,6,5,skin.dark);d.rect(34,torsoY-1,5,4,skin.light);
  if(stage==='child'){
   // T-shirt with shorts and tiny embroidery.
   d.rect(x+2,legY-6,w-4,6,pants.mid);
   d.rect(x+4,torsoY+8,w-8,3,cloth.light);
   d.rect(x+Math.floor(w/2)-2,torsoY+13,5,5,'#ffe6a3');
   d.rect(x+Math.floor(w/2)-1,torsoY+14,3,3,'#ee8ca0');
  }else if(stage==='teen'){
   // Hoodie, pocket and characteristic contrasting sleeves.
   d.rect(x+4,torsoY+8,3,9,cloth.dark);
   d.rect(x+w-7,torsoY+8,3,9,cloth.dark);
   d.rect(x+9,torsoY+19,w-18,6,cloth.light,' opacity=".6"');
   d.rect(x+5,bodyBottom-4,w-10,3,cloth.dark);
   if(seed%3===0){
     d.rect(x+w+5,torsoY+18,4,8,'#35485e');d.rect(x+w+6,torsoY+18,2,6,'#a6c6e5');
   }
  }else{
   // Adult and senior jacket/blazer layered over clean inner shirt.
   d.rect(x+Math.round(w*.32),torsoY+1,Math.round(w*.36),bodyBottom-torsoY-4,'#f8f7f5');
   d.rect(x+Math.round(w*.32),torsoY+2,Math.round(w*.36),4,cloth.light);
   d.rect(x+4,torsoY+6,7,bodyBottom-torsoY-6,cloth.dark);
   d.rect(x+w-11,torsoY+6,7,bodyBottom-torsoY-6,cloth.dark);
   d.rect(x+Math.floor(w/2),torsoY+17,2,2,cloth.dark);
   d.rect(x+Math.floor(w/2),torsoY+23,2,2,cloth.dark);
   if(stage==='senior'){
     d.rect(x+5,torsoY+3,w-10,3,cloth.light);
     d.rect(x+w-6,torsoY+9,3,3,'#e5d7a8');
   }
  }
 });
}
function face(d:Painter,stage:PixelStage,p:CharacterProfile,skin:Palette,hair:Palette,seed:number):void{
 const rig=rigs[stage],{x,y,w,h}=rig;
 const baby=stage==='baby',young=stage==='baby'||stage==='child';
 const eyeY=y+Math.round(h*(baby ? 0.51 : stage==='child' ? 0.49 : 0.46));
 d.group(baby?'infant-face':'age-face',()=>{
  // Selective outline, stepped locally shaded rounded face.
  d.rect(x+6,y-1,w-12,h+1,skin.dark);
  d.rect(x+3,y+3,w-6,h-5,skin.dark);
  d.rect(x,y+9,w,h-16,skin.dark);
  d.rect(x+6,y+1,w-12,h-3,skin.mid);
  d.rect(x+3,y+5,w-6,h-10,skin.mid);
  d.rect(x+1,y+10,w-2,h-18,skin.mid);
  d.rect(x+7,y+2,w-14,h-6,skin.light);
  d.rect(x+4,y+7,w-8,h-13,skin.light);
  d.rect(x+2,y+12,w-4,h-20,skin.light);
  // Very small ears.
  d.rect(x-3,y+Math.round(h*.49),4,8,skin.dark);
  d.rect(x-2,y+Math.round(h*.49)+1,3,6,skin.mid);
  d.rect(x+w-1,y+Math.round(h*.49),4,8,skin.dark);
  d.rect(x+w,y+Math.round(h*.49)+1,3,6,skin.mid);
  if(young){
    // Chubby blush instead of angular beard-like face shadow.
    d.rect(x+3,eyeY+8,8,4,'#ed9b9f',' opacity=".40"');
    d.rect(x+w-11,eyeY+8,8,4,'#ed9b9f',' opacity=".40"');
    d.rect(x+4,eyeY+9,6,2,'#f5b1a8',' opacity=".46"');
    d.rect(x+w-10,eyeY+9,6,2,'#f5b1a8',' opacity=".46"');
  }
  const dist=baby?Math.round(w*.24):Math.round(w*.22);
  const cx=x+Math.round(w*.5),ex=[cx-dist-4,cx+dist-4];
  for(const eyeX of ex){
    // Large soft pixel eyes with invariant iris color and highlight.
    const eyeW=baby?9:stage==='child'?8:7;
    const eyeH=baby?8:7;
    d.rect(eyeX-1,eyeY-3,eyeW+2,2,hair.dark);
    d.rect(eyeX,eyeY,eyeW,eyeH,skin.dark);
    d.rect(eyeX+1,eyeY,eyeW-2,eyeH-1,'#fffaf2');
    d.rect(eyeX+Math.round(eyeW*.42),eyeY,3,eyeH-1,eyes[p.eyes]);
    d.rect(eyeX+Math.round(eyeW*.42)+1,eyeY+1,1,2,'#ffffff');
    d.rect(eyeX+1,eyeY+eyeH-1,eyeW-2,1,skin.mid);
  }
  // Two-pixel button nose and simple original expression.
  d.rect(cx,eyeY+(baby?11:10),2,2,skin.mid);
  d.rect(cx+1,eyeY+(baby?12:11),2,1,skin.dark,' opacity=".40"');
  const mouthY=y+h-(baby?9:stage==='child'?8:7);
  d.rect(cx-4,mouthY,8,2,'#ad606b');
  d.rect(cx-2,mouthY+2,4,1,'#da8892');
  if(stage==='senior'){
   d.rect(x+4,eyeY+11,5,1,skin.mid);
   d.rect(x+w-9,eyeY+11,5,1,skin.mid);
  }
  // Facial hair is only available to adults. Never draw it on babies, children or teenagers.
  if(stage==='adult'&&p.gender==='man'&&seed%5===0){
    d.rect(cx-5,y+h-5,10,2,hair.dark,' data-part="facial-hair"');
  }
 });
}
function hairstyle(d:Painter,stage:PixelStage,p:CharacterProfile,hair:Palette,seed:number):void {
 const rig=rigs[stage],{x,y,w}=rig,baby=stage==='baby';
 d.group(baby?'infant-hair':'age-hair',()=>{
  const h=(a:number,b:number,c:number,e:number,tone:string=hair.mid)=>d.rect(a,b,c,e,tone);
  // Hair options preserve gene while stage-specific geometry changes with age.
  const capY=y-(baby?0:3),crown=capY-(baby?2:4);
  if(p.hair==='short'){
   h(x+5,crown+1,w-10,6,hair.dark);h(x+3,capY+3,w-6,5);
   h(x+7,crown,w-15,4,hair.mid);h(x+2,capY+7,5,baby?5:7,hair.dark);
   h(x+w-7,capY+7,5,baby?5:7,hair.dark);
   h(x+8,crown+1,10,2,hair.light);
   h(x+Math.round(w*.45),capY+6,8,2,hair.mid);
  }else if(p.hair==='waves'){
   h(x+3,capY+1,w-6,8,hair.dark);
   h(x+8,crown-2,Math.round(w*.33),7);
   h(x+Math.round(w*.36),crown-4,Math.round(w*.33),8);
   h(x+Math.round(w*.68),crown-1,Math.round(w*.19),7);
   h(x+1,capY+5,7,8,hair.dark);h(x+w-8,capY+4,7,8,hair.dark);
   h(x+9,crown,9,2,hair.light);h(x+Math.round(w*.42),crown-2,8,2,hair.light);
  }else if(p.hair==='curls'){
   // Coiled-bun newborns, full bouncy curls in older stages.
   const curls=baby?[[0,3],[8,-1],[17,-4],[28,-3],[38,1],[44,6]]:
    [[1,4],[6,-3],[13,-6],[20,-8],[27,-4],[33,2],[0,11],[34,10]];
   for(const [dx,dy] of curls){
    h(x+dx,capY+dy,9,8,hair.dark);
    h(x+dx+1,capY+dy+1,7,5,hair.mid);
    h(x+dx+2,capY+dy+1,3,2,hair.light);
   }
   h(x+3,capY+6,w-6,baby?3:5);
   if(baby){
    h(x-2,capY-3,9,9,hair.dark);h(x+w-7,capY-3,9,9,hair.dark);
    h(x,capY-2,6,6,hair.mid);h(x+w-5,capY-2,6,6,hair.mid);
   }else{
    h(x-2,capY+14,8,12,hair.dark);h(x+w-6,capY+14,8,12,hair.dark);
   }
  }else{
   h(x+3,crown+1,w-6,7,hair.dark);h(x+5,crown-2,w-10,6,hair.mid);
   h(x,capY+5,baby?5:8,baby?11:Math.round(rig.h*.8),hair.dark);
   h(x+w-(baby?5:8),capY+5,baby?5:8,baby?11:Math.round(rig.h*.8),hair.dark);
   h(x+4,capY+4,w-8,5,hair.mid);
   h(x+9,crown,12,3,hair.light);
   if(!baby){
    h(x-2,capY+19,6,Math.round(rig.h*.67),hair.dark);
    h(x+w-4,capY+19,6,Math.round(rig.h*.67),hair.dark);
   }
  }
  // Stage can age the cut but not the genetically selected color.
  if(stage==='senior'&&seed%3===1){
   h(x+8,capY+5,3,2,hair.light);
   h(x+w-12,capY+7,3,2,hair.light);
  }
 });
}
export function renderPixelCharacter(p:CharacterProfile,stage:PixelStage,size='card',seed?:number):string{
 const skin=skins[p.skin],hair=hairColors[p.hairColor];
 const hash=seed??fixedHash([p.name,p.gender,p.country,p.skin,p.hair,p.hairColor,p.eyes].join('|'));
 const cloth=outfits[hash%outfits.length];
 const d=new Painter();
 if(size!=='story-actor')background(d,hash);
 // Back hair must sit behind face, body and foreground bangs.
 if((p.hair==='long'||p.hair==='curls')&&stage!=='baby'){
  const rig=rigs[stage];
  d.group('hair-behind',()=>{
   d.rect(rig.x-3,rig.y+15,rig.w+6,Math.min(44,rig.h+18),hair.dark);
   d.rect(rig.x,rig.y+13,rig.w,Math.min(39,rig.h+16),hair.mid);
  });
 }
 outfit(d,stage,p,hash,skin,cloth);
 face(d,stage,p,skin,hair,hash);
 hairstyle(d,stage,p,hair,hash);
 const classes=['portrait','portrait-'+size,'stage-'+stage].join(' ');
 return '<svg class="'+classes+'" viewBox="0 0 144 176" xmlns="http://www.w3.org/2000/svg" '+
  'role="img" aria-label="Zoid Life original pixel '+stage+'" data-style="clean-pixel-simulation-v2" '+
  (stage==='baby'?'data-age-visual="infant" ':'')+
  'shape-rendering="crispEdges"><g transform="scale(2)">'+d.chunks.join('')+'</g></svg>';
}
