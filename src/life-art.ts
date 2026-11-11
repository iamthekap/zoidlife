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
 const h=(a:number,b:number,c:number,d:number,color=base)=>draw.push(r(a,b,c,d,color));
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
 const rr=(a:number,b:number,c:number,d:number,color:string)=>draw.push(r(a,b,c,d,color));
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
   rr(x+Math.round(w*.3),y+h-11,Math.round(w*.4),5,shadow);
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
export function portraitLife(p:CharacterProfile,age:number,size='card'):string {
 const stage=lifeStage(age),seed=hash(avatarFingerprint(p));
 const [skin,shade]=skins[p.skin],shirt=shirts[seed%shirts.length];
 const draw:string[]=[];
 const backdrop=backdrops[(seed>>>7)%backdrops.length];
 draw.push(r(0,0,144,176,backdrop),r(6,7,132,161,tint(backdrop,.44)));
 // Stylized square block backdrop, changing for phases without altering identity.
 draw.push(r(15,25,115,124,backdrop,' opacity=".8"'));
 for(let i=0;i<14;i++)draw.push(r(13+((i*37)%116),40+((i*19)%107),3,3,'#ffffff',' opacity=".24"'));
 const baby=stage==='baby',child=stage==='child',teen=stage==='teen';
 const headWidth=baby?67:child?61:teen?56:52;
 const headHeight=baby?70:child?64:teen?61:60;
 const headX=Math.floor((144-headWidth)/2),headY=baby?34:child?32:31;
 // Back hair drawn before body/face so shoulder length stays visible.
 if(p.hair==='long'||p.hair==='curls'){
   const hc=hairs[p.hairColor],extra=baby?25:child?49:69;
   draw.push(r(headX-10,headY+14,headWidth+20,headHeight+extra,hc));
 }
 wardrobe(draw,stage,seed,shade);
 draw.push(r(61,100,22,22,skin));
 face(draw,p,headX,headY,headWidth,headHeight,stage,seed);
 hairPixels(draw,p,headX,headY,headWidth,stage,seed);
 // Infant hands rest against the onesie, adult hands are lowered.
 if(stage==='baby'){
   draw.push(r(31,129,14,14,skin),r(100,129,14,14,skin));
   draw.push(r(35,140,13,9,shade),r(97,140,13,9,shade));
 }else{
   draw.push(r(28,157,13,20,skin),r(103,157,13,20,skin));
   if(stage==='child'){draw.push(r(31,146,11,14,skin),r(101,146,11,14,skin));}
 }
 const classes=['portrait','portrait-'+(size==='scene'?'scene':size),'stage-'+stage].join(' ');
 return '<svg class="'+classes+'" viewBox="0 0 144 176" xmlns="http://www.w3.org/2000/svg" '+
   'role="img" aria-label="Zoid Life avatar '+stage+'" shape-rendering="crispEdges">'+draw.join('')+'</svg>';
}
