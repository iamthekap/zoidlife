/**
 * Original Zoid Life modular pixel avatars.
 * Age changes the body silhouette; genetic features remain consistent.
 * No raster files, no outside image requests and no copyrighted sprite assets.
 */
import type { CharacterProfile } from './characters';

export type LifeStage = 'baby' | 'child' | 'teen' | 'adult' | 'senior';
export function lifeStage(age:number):LifeStage {
  const value=Math.max(0,Math.floor(Number.isFinite(age)?age:0));
  return value<3?'baby':value<12?'child':value<18?'teen':value<65?'adult':'senior';
}
export function avatarFingerprint(p:CharacterProfile):string {
  return [p.name,p.gender,p.country,p.skin,p.hair,p.hairColor,p.eyes].join('|');
}
const skins={
 light:['#efc6a6','#d89978','#b5765b'],
 tan:['#dca078','#b57655','#8b533f'],
 brown:['#a87254','#805038','#5e392d'],
 deep:['#704737','#543225','#3a221e']
} as const;
const hairs={black:'#242331',brown:'#593d34',blonde:'#c49b57',red:'#a4563d'} as const;
const eyes={brown:'#594333',blue:'#38699c',green:'#407b5d'} as const;
const shirts=[
 ['#5079aa','#2e567f','#cddfec'],['#9a6486','#794966','#f6c8b0'],
 ['#508c8c','#39706c','#deefe9'],['#ad8154','#7e5d3c','#f1c98a'],
 ['#7c76af','#5a5889','#d8d3f6'],['#b36c6f','#874d52','#efc5bc'],
 ['#5980ad','#385d87','#e4edf8']
] as const;
const backdrops=['#d9e5f3','#dbece9','#e8e1ee','#f1e0d6','#e2e9d7','#e3e4f3'];
const r=(x:number,y:number,w:number,h:number,color:string,attrs='')=>
  '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+color+'"'+attrs+'/>';
const line=(points:string,c:string,w=3)=>
  '<polyline points="'+points+'" stroke="'+c+'" stroke-width="'+w+'" fill="none" stroke-linejoin="miter"/>';
const hash=(s:string)=>[...s].reduce((v,c)=>(Math.imul(v,33)^c.charCodeAt(0))>>>0,5381);
const tint=(hex:string,mix=0.3):string=>{
 const h=hex.replace('#',''),rgb=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
 return '#'+rgb.map(v=>Math.max(0,Math.min(255,Math.round(v*(1-mix)+250*mix))).toString(16).padStart(2,'0')).join('');
};
function hairPixels(draw:string[],p:CharacterProfile,x:number,y:number,w:number,stage:LifeStage,seed:number):void {
 const base=hairs[p.hairColor], light=tint(base,0.22), dark=tint(base,-0.17);
 const h=(a:number,b:number,c:number,d:number,color:string=base)=>draw.push(r(a,b,c,d,color));
 const baby=stage==='baby';
 const topY=y-(baby?8:14), topW=w+(baby?0:10);
 if(p.hair==='short'){
   h(x-3,topY+5,topW+6,baby?8:13);
   h(x+3,topY,topW-8,8);
   h(x-5,y+1,9,baby?11:18);h(x+w-4,y+1,10,baby?11:15);
 } else if(p.hair==='waves'){
   h(x-5,topY+5,topW+9,9);h(x+1,topY,13,10);h(x+18,topY-5,18,11);
   h(x+36,topY-2,18,8);h(x+w-10,topY+4,16,14);
   h(x-7,y+3,9,23);h(x+w-1,y+5,10,21);
 }else if(p.hair==='curls'){
   for(const [dx,dy] of [[-8,8],[4,1],[18,-6],[34,-9],[50,-4],[w-1,6],[-9,23],[w,21],[2,-9]]){
     h(x+dx,y+dy-12,13,13,base);
   }
   h(x-3,topY+6,topW+4,9);
   if(!baby){h(x-9,y+31,11,21);h(x+w-1,y+29,13,24);}
 }else{
   h(x-6,topY+5,topW+12,11);h(x,topY,topW,8);
   h(x-9,y+8,12,baby?38:78);
   h(x+w-2,y+9,13,baby?38:78);
   h(x+4,y-5,topW-3,10);
 }
 // Hair continues over decades but begins with lower volume in infancy.
 h(x+9,topY+7,Math.max(9,Math.floor(w*.28)),3,light);
 if(stage==='senior'){
   for(let k=0;k<5;k++)h(x+2+k*10,topY+5+(k%2)*4,4,5,tint(base,.57));
 }
 if(seed%7===0 && stage!=='baby' && stage!=='child') {
   h(x+Math.floor(w*.56),topY+7,4,7,light);
 }
}
function face(draw:string[],p:CharacterProfile,x:number,y:number,w:number,h:number,stage:LifeStage,seed:number):void {
 const [skin,shade,shadow]=skins[p.skin];
 const rr=(a:number,b:number,c:number,d:number,color:string,attrs='')=>draw.push(r(a,b,c,d,color,attrs));
 const baby=stage==='baby', child=stage==='child';
 const eyeY=y+Math.round(h*(baby?.50:.45));
 const eyeDist=Math.round(w*.25);
 const eyeL=x+Math.round(w*.29)-4,eyeR=x+Math.round(w*.72)-4;
 rr(x+5,y,w-10,h-7,skin);rr(x,y+12,w,h-25,skin);rr(x+8,y+h-12,w-16,10,skin);
 rr(x+1,y+Math.floor(h*.64),5,16,shade);rr(x+w-6,y+Math.floor(h*.64),5,15,shade);
 rr(x+4,y+h-14,6,9,shade);rr(x+w-11,y+h-14,5,9,shade);
 rr(eyeL-1,eyeY-6,10,3,hairs[p.hairColor]);
 rr(eyeR-1,eyeY-6,10,3,hairs[p.hairColor]);
 for(const eyeX of [eyeL,eyeR]){
   rr(eyeX,eyeY,10,7,'#fff7ef');
   rr(eyeX+4,eyeY,4,7,eyes[p.eyes]);rr(eyeX+5,eyeY+1,2,2,'#f9fafb');
 }
 rr(x+Math.floor(w*.5),eyeY+8,3,9,shade);
 rr(x+Math.floor(w*.5)-3,eyeY+15,10,3,shade);
 rr(x+Math.floor(w*.36),y+h-15,Math.round(w*.3),2,shadow);
 rr(x+Math.floor(w*.39),y+h-13,Math.round(w*.24),2,stage==='senior'?'#9e6c6b':'#b86f70');
 if(baby||child){rr(x+5,eyeY+12,11,5,'#ce8275',' opacity=".38"');rr(x+w-16,eyeY+12,11,5,'#ce8275',' opacity=".38"');}
 if(stage==='senior'){
   for(const dx of [6,w-18]){rr(x+dx,eyeY+10,10,2,shade);rr(x+dx,eyeY+17,8,2,shade);}
 }
 if(stage==='adult' && p.gender==='man' && seed%4<2){
   rr(x+Math.round(w*.3),y+h-11,Math.round(w*.4),5,shadow,' data-part="facial-hair"');
 }
 if(stage!=='baby' && (seed%6===0||seed%11===0)){
   const gy=eyeY-3;
   rr(eyeL-3,gy-2,16,2,'#283a50');rr(eyeR-3,gy-2,16,2,'#283a50');
   rr(eyeL-4,gy,2,12,'#283a50');rr(eyeL+12,gy,2,12,'#283a50');
   rr(eyeR-4,gy,2,12,'#283a50');rr(eyeR+12,gy,2,12,'#283a50');
   rr(eyeL+13,gy+1,eyeR-eyeL-16,2,'#283a50');
 }
}
function wardrobe(draw:string[],stage:LifeStage,seed:number,shade:string):void {
 const shirt=shirts[seed%shirts.length], baby=stage==='baby',child=stage==='child';
 const collar=shirt[2],top=shirt[0],dark=shirt[1];
 if(baby){
   // Seated baby: onesie, small hands and both legs (full body).
   draw.push(r(38,114,66,31,top),r(30,121,14,22,top),r(99,121,14,22,top));
   draw.push(r(42,139,58,21,top),r(37,154,31,15,dark),r(74,154,31,15,dark));
   draw.push(r(35,145,13,12,shade),r(97,144,13,12,shade));
   draw.push(r(38,163,30,9,'#f2eee9'),r(74,163,30,9,'#f2eee9'));
   draw.push(r(51,117,40,6,collar));
   draw.push(r(67,125,6,24,dark));
   for(const k of [130,142])draw.push(r(69,k,3,3,'#eff7ff'));
   return;
 }
 const start=child?115:109,armY=child?120:115;
 draw.push(r(38,start,65,67,top),r(26,armY,17,61,dark),r(100,armY,17,61,dark));
 draw.push(r(37,start+1,10,10,dark),r(94,start+1,10,10,dark));
 draw.push(r(39,130,7,43,dark),r(97,130,7,43,dark));
 draw.push(r(55,start,31,10,collar));
 if(seed%4===0){
   for(let py=130;py<173;py+=11)draw.push(r(47,py,48,4,collar));
 }else if(seed%4===1){
   draw.push(r(67,start+12,6,56,collar));for(let py=133;py<170;py+=12)draw.push(r(69,py,3,3,dark));
 }else if(seed%4===2){
   draw.push(r(45,start+10,10,50,dark),r(87,start+10,10,50,dark));
   draw.push(r(61,start+12,18,8,collar));
 }else{
   draw.push(r(44,start+11,50,6,collar),r(48,start+17,40,5,dark));
 }
 if(stage==='senior')draw.push(r(52,136,37,4,tint(top,.45)));
}

/**
 * Dedicated newborn sprite. A baby is NOT an adult portrait scaled down:
 * an oversized rounder head, wide eyes, button nose, tiny mouth, softer cheeks,
 * short/sparse newborn hair and a seated romper replace all mature facial details.
 * Genes still read the exact same saved CharacterProfile as later stages.
 */
function infantPortrait(p:CharacterProfile,seed:number,size:string):string {
 const [skin,shade]=skins[p.skin];
 const hair=hairs[p.hairColor], iris=eyes[p.eyes];
 const background=backdrops[(seed>>>7)%backdrops.length];
 const outfit=shirts[seed%shirts.length],cloth=tint(outfit[0],.43),seam=tint(outfit[1],.39);
 const darkCheek=tint(shade,.67);
 const draw:string[]=[];
 const add=(x:number,y:number,w:number,h:number,color:string,attrs='')=>draw.push(r(x,y,w,h,color,attrs));
 if(size!=='story-actor'){
   draw.push('<g data-part="background">');
   add(0,0,144,176,background);
   add(8,8,128,160,tint(background,.48));
   add(16,23,112,118,background,' opacity=".68"');
   for(let i=0;i<18;i++)add(17+(i*31)%110,18+(i*37)%135,2,2,'#ffffff',' opacity=".40"');
   draw.push('</g>');
 }
 draw.push('<g data-part="seated-onesie">');
 // A single, loose baby onesie with bent knees and tiny booties, not adult clothes.
 add(42,107,60,43,cloth);
 add(34,117,13,30,cloth);add(98,117,13,30,cloth);
 add(43,142,60,18,cloth);
 add(38,149,31,13,seam);add(77,149,30,13,seam);
 add(36,159,34,12,'#fff8f3');add(76,159,34,12,'#fff8f3');
 add(37,164,34,4,tint(outfit[0],.68));add(76,164,34,4,tint(outfit[0],.68));
 add(49,110,48,7,seam);add(52,110,42,5,'#fffaf6');
 if(seed%3===0){
  // Rounded cotton bib.
  add(54,117,38,21,'#fffaf1');
  add(57,134,32,6,tint(outfit[0],.72));
  add(71,119,6,6,'#eab5b4');
 }else if(seed%3===1){
  add(72,118,4,25,seam);
  add(73,123,3,3,'#fff8f2');add(73,135,3,3,'#fff8f2');
 }else{
  add(53,121,7,5,tint(outfit[0],.65));
  add(86,121,7,5,tint(outfit[0],.65));
  add(61,134,24,5,'#fff5ea');
 }
 draw.push('</g><g data-part="infant-hands">');
 add(29,126,15,15,skin);add(100,126,15,15,skin);
 add(30,131,4,9,shade);add(111,131,4,9,shade);
 add(36,141,9,7,skin);add(100,141,9,7,skin);
 draw.push('</g><g data-part="infant-face">');
 // Square-pixel softened round face: giant cranium + little chin, no jaw stubble.
 add(45,25,54,78,skin);
 add(38,31,68,70,skin);
 add(33,40,78,50,skin);
 add(38,85,68,13,skin);
 add(45,96,54,8,skin);
 add(30,59,9,20,skin);add(106,59,9,20,skin);
 add(31,65,3,9,tint(shade,.64));add(111,65,3,9,tint(shade,.64));
 // Deliberately no beard, jaw shadow, eye bags or adult nose lines at this age.
 add(49,57,13,12,'#fff9f6');add(83,57,13,12,'#fff9f6');
 add(54,58,6,10,iris);add(86,58,6,10,iris);
 add(55,59,2,3,'#ffffff');add(87,59,2,3,'#ffffff');
 add(50,56,13,2,tint(hair,.50));add(82,56,13,2,tint(hair,.50));
 add(70,76,5,4,tint(shade,.58));
 add(48,77,10,6,'#e5a6a1',' opacity=".48"');
 add(88,77,10,6,'#e5a6a1',' opacity=".48"');
 add(63,88,18,4,'#b9797e');
 add(66,91,11,2,'#e4a7a6');
 // Dimple / chubby cheeks, not the shadow blocks of adult beard.
 add(40,84,5,5,darkCheek,' opacity=".32"');
 add(100,84,5,5,darkCheek,' opacity=".32"');
 if(seed%4===0){
   // A tiny pacifier variant makes the character visibly infant-aged.
   add(66,84,13,13,'#f5d4ba');add(69,87,7,7,'#e2a2a7');add(71,90,3,7,'#a86680');
 }
 draw.push('</g><g data-part="infant-hair">');
 // Early hair is a tuft/fringe, not the adult's full hairstyle.
 if(p.hair==='curls'){
   for(const [x,y] of [[42,28],[51,22],[63,19],[76,20],[87,24],[95,29]]){
     add(x,y,10,8,hair);add(x+2,y-3,5,5,tint(hair,.18));
   }
 }else if(p.hair==='waves'){
   add(45,28,17,7,hair);add(59,23,18,9,hair);add(76,26,21,7,hair);
   add(65,21,10,4,tint(hair,.20));add(44,33,7,6,hair);
 }else if(p.hair==='long'){
   add(46,23,51,8,hair);add(43,29,12,8,hair);add(92,29,10,8,hair);
   add(63,20,19,5,tint(hair,.19));
 }else{
   add(51,25,40,6,hair);add(62,21,20,6,hair);
   add(56,27,9,4,tint(hair,.20));
 }
 draw.push('</g>');
 const classes=['portrait','portrait-'+(size==='scene'?'scene':size),'stage-baby'].join(' ');
 return '<svg class="'+classes+'" viewBox="0 0 144 176" xmlns="http://www.w3.org/2000/svg" '+
   'role="img" aria-label="Zoid Life newborn" data-age-visual="infant" shape-rendering="crispEdges">'+draw.join('')+'</svg>';
}

export function portraitLife(p:CharacterProfile,age:number,size='card'):string {
 const stage=lifeStage(age),seed=hash(avatarFingerprint(p));
 if(stage==='baby')return infantPortrait(p,seed,size);
 const [skin,shade]=skins[p.skin],shirt=shirts[seed%shirts.length];
 const draw:string[]=[];
 const backdrop=backdrops[(seed>>>7)%backdrops.length];
 if(size!=='story-actor'){
   draw.push(r(0,0,144,176,backdrop),r(6,7,132,161,tint(backdrop,.44)));
   // Keep the existing character-card backdrop, but let storyboard scenes provide their own.
   draw.push(r(15,25,115,124,backdrop,' opacity=".8"'));
   for(let i=0;i<14;i++)draw.push(r(13+((i*37)%116),40+((i*19)%107),3,3,'#ffffff',' opacity=".24"'));
 }
 const child=stage==='child',teen=stage==='teen';
 const headWidth=child?61:teen?56:52;
 const headHeight=child?64:teen?61:60;
 const headX=Math.floor((144-headWidth)/2),headY=child?32:31;
 // Back hair drawn before body/face so shoulder length stays visible.
 if(p.hair==='long'||p.hair==='curls'){
   const hc=hairs[p.hairColor],extra=child?49:69;
   draw.push(r(headX-10,headY+14,headWidth+20,headHeight+extra,hc));
 }
 wardrobe(draw,stage,seed,shade);
 draw.push(r(61,100,22,22,skin));
 face(draw,p,headX,headY,headWidth,headHeight,stage,seed);
 hairPixels(draw,p,headX,headY,headWidth,stage,seed);
 // Children and adults use the upright body and lowered hands.
 draw.push(r(28,157,13,20,skin),r(103,157,13,20,skin));
 if(stage==='child'){draw.push(r(31,146,11,14,skin),r(101,146,11,14,skin));}
 const classes=['portrait','portrait-'+(size==='scene'?'scene':size),'stage-'+stage].join(' ');
 return '<svg class="'+classes+'" viewBox="0 0 144 176" xmlns="http://www.w3.org/2000/svg" '+
   'role="img" aria-label="Zoid Life avatar '+stage+'" shape-rendering="crispEdges">'+draw.join('')+'</svg>';
}
