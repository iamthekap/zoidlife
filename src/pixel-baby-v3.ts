/** Original, layered newborn portrait 3.0 (72×88 pixel grid).
 * Baby-specific anatomy: small round cranium, seated limbs, soft eyes, natural hair tufts.
 * Never scales down an adult and never uses a third-party sprite.
 */
import type {CharacterProfile} from './characters.ts';
const skins={light:['#f6d3b4','#e9af91','#ac735f'],tan:['#e5b487','#ce956f','#925e4c'],
 brown:['#ba8362','#9a654c','#694434'],deep:['#916048','#73462f','#492f29']} as const;
const hair={black:['#464550','#252735','#151827'],brown:['#856151','#614234','#3b2a28'],
 blonde:['#f5d180','#d3a45b','#987244'],red:['#cf8b60','#a65b41','#6e3934']} as const;
const eyes={blue:'#397cc0',green:'#38836b',brown:'#74452e'} as const;
const wardrobe={
 blue:['#83b5f2','#3976c9','#214b87'],red:['#ff9cb0','#dc536d','#99394c'],
 mint:['#98d4d0','#539c9d','#336a70'],ochre:['#e6c38c','#b88963','#7b5949'],
 purple:['#baacf1','#8675bd','#605184'],rose:['#e1a0a2','#bf5a62','#8a414b']
} as const;
function hash(s:string):number{return [...s].reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,2166136261);}
const rect=(x:number,y:number,w:number,h:number,c:string,extra='')=>
 '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"'+extra+'/>';
class Draw{
 parts:string[]=[];
 r(x:number,y:number,w:number,h:number,c:string,attr=''){this.parts.push(rect(x,y,w,h,c,attr));}
 group(name:string,fn:()=>void,extra=''){this.parts.push('<g data-part="'+name+'"'+extra+'>');fn();this.parts.push('</g>');}
}
export function renderPixelBaby(p:CharacterProfile,size='card'):string{
 const d=new Draw(),seed=hash([p.name,p.gender,p.skin,p.hair,p.eyes,p.hairColor,p.city].join('|'));
 const skin=skins[p.skin],h=hair[p.hairColor];
 const outfit=p.outfit??(['blue','red','mint','ochre','purple','rose'] as const)[seed%6];
 const cloth=wardrobe[outfit],eye=eyes[p.eyes];
 const style=seed%4,blinkDelay=(seed%5)*-.8;
 if(size!=='story-actor')d.group('background',()=>{
   const bg=['#e8f0fb','#f6eaf0','#e9f4f1','#eeeaf7'][seed%4];
   d.r(0,0,72,88,bg);d.r(4,4,64,80,'#ffffff',' opacity=".27"');
   d.r(7,7,58,69,bg,' opacity=".65"');
   d.r(8,79,56,2,'#97acc5',' opacity=".30"');
 });
 d.group('seated-onesie',()=>{
   // Flexible feet are outside the romper; tiny toes are rounded in pixel steps.
   for(const side of [0,1]){
     const x=side?44:13;
     d.r(x+3,69,13,12,skin[2]);d.r(x+1,72,18,6,skin[1]);
     d.r(x+4,70,12,10,skin[0]);d.r(x+3,75,15,4,skin[0]);
     d.r(x+6,78,3,2,skin[1]);d.r(x+11,78,3,2,skin[1]);
   }
   // Plump baby outfit silhouette, white neckline and collar.
   d.r(24,52,24,6,cloth[2]);d.r(20,55,32,20,cloth[2]);
   d.r(22,54,28,21,cloth[1]);d.r(25,55,22,6,cloth[0]);
   d.r(25,70,22,7,cloth[1]);d.r(29,75,14,5,cloth[2]);
   d.r(30,53,12,3,'#fff8f0');
   // Soft asymmetrical sleeves; poses vary without changing the anatomy.
   d.r(17,56,8,11,cloth[2]);d.r(18,56,7,10,cloth[1]);
   d.r(47,56,8,11,cloth[2]);d.r(47,56,7,10,cloth[1]);
   const lifted=seed%4===0;
   if(lifted){d.r(13,53,7,9,skin[2]);d.r(13,52,6,8,skin[0]);d.r(15,49,5,6,skin[0]);}
   else{d.r(12,64,9,9,skin[2]);d.r(13,64,8,8,skin[0]);}
   d.r(53,64,9,9,skin[2]);d.r(53,64,8,8,skin[0]);
   // Four distinctive onesie emblems.
   if(style===0){d.r(33,61,6,5,'#fff9f4');d.r(35,62,2,2,'#f48da7');}
   if(style===1)for(const y of [61,66,71])d.r(27,y,18,2,'#fff2e9');
   if(style===2){d.r(32,61,8,6,'#fff5da');d.r(35,62,2,3,'#edb35b');}
   if(style===3){d.r(34,61,4,7,'#fff7ec');d.r(32,63,8,3,'#fff7ec');}
 });
 d.group('infant-face',()=>{
   // Soft stepped contour, radically narrower than the old square 46x42 face.
   d.r(29,16,14,3,skin[2]);d.r(26,18,20,3,skin[2]);
   d.r(23,21,26,4,skin[2]);d.r(21,25,30,4,skin[2]);
   d.r(19,29,34,14,skin[2]);d.r(21,43,30,5,skin[2]);
   d.r(24,48,24,4,skin[2]);d.r(27,52,18,3,skin[2]);
   d.r(29,18,14,2,skin[1]);d.r(25,21,22,4,skin[1]);
   d.r(23,25,26,4,skin[1]);d.r(21,29,30,15,skin[1]);
   d.r(23,44,26,4,skin[1]);d.r(26,48,20,3,skin[1]);
   d.r(26,25,20,3,skin[0]);d.r(23,29,26,15,skin[0]);
   d.r(25,44,22,5,skin[0]);d.r(29,49,14,3,skin[0]);
   // Baby ears + cheeks. NO jawline shading.
   d.r(18,34,3,8,skin[1]);d.r(51,34,3,8,skin[1]);
   d.r(24,40,7,3,'#eb9ea7',' opacity=".50"');
   d.r(42,40,7,3,'#eb9ea7',' opacity=".50"');
   d.r(31,43,3,2,skin[0]);d.r(39,43,3,2,skin[0]);
   // Expressive eyes (light lashes and 1-pixel iris highlights).
   d.group('eyes-open',()=>{
     for(const x of [27,41]){
       d.r(x,33,7,7,'#fff9f0');d.r(x+2,34,3,6,eye);
       d.r(x+3,35,1,2,'#ffffff');d.r(x,32,7,1,h[1]);
     }
   },' style="animation-delay:'+blinkDelay+'s"');
   d.group('eyes-closed',()=>{
     d.r(27,37,7,1,h[1]);d.r(41,37,7,1,h[1]);
   },' style="animation-delay:'+blinkDelay+'s"');
   d.r(36,42,2,2,skin[1]);d.r(34,46,5,1,'#b36a72');d.r(35,47,3,1,'#e99da0');
 });
 d.group('infant-hair',()=>{
   // Tufts are shaped by genetics but never grow an adult haircut.
   if(p.hair==='short'){
     d.r(29,14,14,4,h[2]);d.r(26,17,20,3,h[1]);
     d.r(32,12,7,4,h[1]);d.r(34,12,3,2,h[0]);
   }else if(p.hair==='waves'){
     d.r(26,16,19,5,h[2]);d.r(28,13,9,5,h[1]);
     d.r(37,11,8,6,h[1]);d.r(23,19,6,4,h[2]);d.r(40,16,8,4,h[0]);
   }else if(p.hair==='curls'){
     for(const [x,y] of [[23,18],[29,13],[35,12],[41,15],[46,20]]){
       d.r(x,y,7,6,h[2]);d.r(x+1,y,5,4,h[1]);d.r(x+2,y+1,2,2,h[0]);
     }
     d.r(19,14,8,8,h[2]);d.r(20,13,7,6,h[1]);
     d.r(45,14,8,8,h[2]);d.r(46,13,7,6,h[1]);
   }else{
     d.r(25,15,22,6,h[2]);d.r(27,13,18,4,h[1]);
     d.r(22,21,5,12,h[1]);d.r(45,21,5,12,h[1]);
     d.r(30,12,8,3,h[0]);
   }
 });
 // A pacifier appears on a subset, remaining animated but purely cosmetic.
 if(seed%3===0)d.group('pacifier',()=>{
   d.r(31,43,10,6,'#fff5ed');d.r(33,44,6,5,'#f5adc0');
   d.r(35,45,2,2,'#a65483');d.r(34,49,4,3,'#f1bfd0');
 });
 const classes=['portrait','portrait-'+size,'stage-baby','newborn-v3'].join(' ');
 return '<svg class="'+classes+'" viewBox="0 0 144 176" xmlns="http://www.w3.org/2000/svg" '+
 'role="img" aria-label="Zoid Life original newborn pixel art" data-style="clean-pixel-simulation-v2" '+
 'data-generator="baby-v3" data-age-visual="infant" shape-rendering="crispEdges">'+
 '<g transform="scale(2)">'+d.parts.join('')+'</g></svg>';
}
