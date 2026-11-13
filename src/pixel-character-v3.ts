/** Independently drawn age-accurate pixel character rig v3.
 * Designed from body/face proportions, not a cropped adult avatar.
 * Immutable genetics across ages: complexion, eyes, and hair pigment.
 * Every shape is a crisp, editable SVG primitive; no reference-game assets.
 */
import type {CharacterProfile,OutfitStyle} from './characters.ts';
export type MatureStage='child'|'teen'|'adult'|'senior';
export type FaceMood='cheerful'|'curious'|'determined'|'thoughtful';
type Pal={light:string;mid:string;dark:string};
const SKIN:Record<CharacterProfile['skin'],Pal>={
 light:{light:'#f6d3b4',mid:'#e9af91',dark:'#ac735f'},
 tan:{light:'#e5b487',mid:'#ce956f',dark:'#925e4c'},
 brown:{light:'#ba8362',mid:'#9a654c',dark:'#694434'},
 deep:{light:'#916048',mid:'#73462f',dark:'#492f29'}
};
const HAIR:Record<CharacterProfile['hairColor'],Pal>={
 black:{light:'#464550',mid:'#252735',dark:'#151827'},
 brown:{light:'#856151',mid:'#614234',dark:'#3b2a28'},
 blonde:{light:'#f5d180',mid:'#d3a45b',dark:'#987244'},
 red:{light:'#cf8b60',mid:'#a65b41',dark:'#6e3934'}
};
const IRIS:Record<CharacterProfile['eyes'],string>={blue:'#397cc0',green:'#38836b',brown:'#74452e'};
const CLOTH:Record<string,Pal>={
 blue:{light:'#8fc0f7',mid:'#4383d0',dark:'#234e8b'},
 red:{light:'#f7a8a8',mid:'#dc6471',dark:'#8c4052'},
 mint:{light:'#a5d9d4',mid:'#62a5a0',dark:'#387274'},
 ochre:{light:'#f2d397',mid:'#c29662',dark:'#8b633f'},
 purple:{light:'#c7b7ef',mid:'#8c78c5',dark:'#604b95'},
 rose:{light:'#f6b4bd',mid:'#d47c8c',dark:'#985166'}
};
type Rig={x:number;y:number;w:number;h:number;torso:number;torsoW:number;leg:number};
// Successive stages gain longer visible torsos and legs while the head scales
// down. All dimensions are measured on the same 96x118 SVG grid.
const RIG:Record<MatureStage,Rig>={
 // Larger rounded face and shorter limbs yield a visibly child-specific 1:2.5 silhouette.
 child:{x:30,y:12,w:36,h:37,torso:49,torsoW:30,leg:83},
 teen:{x:34,y:7,w:28,h:23,torso:32,torsoW:33,leg:78},
 adult:{x:35,y:7,w:26,h:21,torso:30,torsoW:37,leg:77},
 senior:{x:34,y:8,w:28,h:24,torso:34,torsoW:36,leg:80}
};
export function characterStageProportions(stage:MatureStage):{head:number;total:number;headsTall:number}{
 const rig=RIG[stage],head=rig.h+6,total=112-(rig.y-6);
 return {head,total,headsTall:Math.round(total/head*100)/100};
}
const hash=(s:string):number=>[...s].reduce((v,c)=>(Math.imul(v,31)+c.charCodeAt(0))>>>0,2166136261);
const rect=(x:number,y:number,w:number,h:number,c:string,extra='')=>
 '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"'+extra+'/>';
class Canvas{
 d:string[]=[];
 r(x:number,y:number,w:number,h:number,c:string,attr=''):void{if(w>0&&h>0)this.d.push(rect(x,y,w,h,c,attr));}
 g(name:string,fn:()=>void):void{this.d.push('<g data-part="'+name+'">');fn();this.d.push('</g>');}
}
function backdrop(d:Canvas,key:number):void{
 const pal=['#e6f1fc','#f5e8ef','#edf3e9','#f6eee2','#eeebf8'];
 const base=pal[key%pal.length];
 d.g('background',()=>{
  d.r(0,0,96,118,base);d.r(5,5,86,108,'#ffffff',' opacity=".37"');
  d.r(8,8,80,100,base,' opacity=".57"');
  for(let i=0;i<12;i++)d.r(10+(i*13)%72,11+(i*23)%89,1,1,'#ffffff',' opacity=".38"');
  d.r(15,113,65,2,'#a7afc4',' opacity=".42"');
 });
}
function trousers(d:Canvas,stage:MatureStage,cloth:Pal,skin:Pal,key:number,legY:number):void{
 const pants=stage==='child'?
  {light:'#9bc0d6',mid:'#6087ac',dark:'#3b5b81'}:
  {light:'#7799b5',mid:'#445e7d',dark:'#293c58'};
 const left=stage==='child'?32:31,right=stage==='child'?51:52;
 const w=stage==='child'?12:12,feet=112;
 d.g('legs',()=>{
  for(const x of [left,right]){
   if(stage==='child'){
     d.r(x-1,legY,14,10,cloth.dark);
     d.r(x,legY+1,12,8,cloth.mid);
     d.r(x,legY+9,12,feet-legY-15,skin.mid);
     d.r(x+1,legY+10,10,feet-legY-16,skin.light);
     d.r(x,feet-10,12,5,'#f6f3ee');
   }else{
     d.r(x-1,legY,14,feet-legY-2,pants.dark);
     d.r(x,legY,12,feet-legY-4,pants.mid);
     d.r(x+2,legY+4,4,Math.max(2,feet-legY-11),pants.light,' opacity=".52"');
   }
   d.r(x-2,feet-7,16,7,'#4a5267');
   d.r(x-1,feet-6,17,5,key%3===0?'#8d99b2':'#e4e5eb');
   d.r(x,feet-5,15,2,'#f5f5f3');
   d.r(x-2,feet-2,18,2,'#44536c');
  }
  if(stage==='child'){
   d.r(left-1,legY-1,14,8,cloth.dark);d.r(left,legY,12,6,cloth.mid);
   d.r(right-1,legY-1,14,8,cloth.dark);d.r(right,legY,12,6,cloth.mid);
  }
 });
}
function outfit(d:Canvas,stage:MatureStage,cloth:Pal,skin:Pal,key:number,style?:OutfitStyle):void{
 const rig=RIG[stage],x=Math.floor(48-rig.torsoW/2),w=rig.torsoW,y=rig.torso;
 trousers(d,stage,cloth,skin,key,rig.leg);
 d.g('body-outfit',()=>{
  // Rounded shoulders, two independent arms, tapered torso.
  d.r(x+2,y-2,w-4,4,cloth.dark);d.r(x,y+1,w,rig.leg-y,cloth.dark);
  d.r(x+1,y+2,w-2,rig.leg-y-3,cloth.mid);
  d.r(x+3,y+3,w-6,4,cloth.light);
  if(stage==='child'){
   d.r(x,rig.leg-9,2,7,cloth.light);
   d.r(x+w-2,rig.leg-9,2,7,cloth.light);
  }
  const pose=stage==='senior'?0:key%3;
  d.g('age-pose-'+(['neutral','thoughtful','greeting'][pose]),()=>{
    const leftArm=()=>{
      d.r(x-6,y+6,8,19,cloth.dark);d.r(x-5,y+7,7,17,cloth.mid);
      d.r(x-5,y+25,7,8,skin.dark);d.r(x-4,y+25,5,7,skin.light);
    };
    const rightArm=()=>{
      d.r(x+w-1,y+6,8,19,cloth.dark);d.r(x+w,y+7,7,17,cloth.mid);
      d.r(x+w,y+25,7,8,skin.dark);d.r(x+w+1,y+25,5,7,skin.light);
    };
    if(pose===1){
      // Bent elbow and hand visible across chest, without creating a third arm.
      d.r(x-6,y+6,8,13,cloth.dark);d.r(x-5,y+7,7,11,cloth.mid);
      d.r(x-5,y+17,14,7,cloth.dark);d.r(x-4,y+18,13,5,cloth.mid);
      d.r(x+7,y+17,7,7,skin.dark);d.r(x+8,y+18,5,5,skin.light);
      rightArm();
    }else if(pose===2){
      leftArm();
      // Raised right arm, bent at the elbow and waving beside the head.
      d.r(x+w-1,y+6,8,11,cloth.dark);d.r(x+w,y+7,7,9,cloth.mid);
      d.r(x+w+3,y-7,7,18,cloth.dark);d.r(x+w+4,y-6,5,16,cloth.mid);
      d.r(x+w+3,y-15,8,10,skin.dark);d.r(x+w+4,y-14,6,8,skin.light);
      d.r(x+w+5,y-17,2,5,skin.light);d.r(x+w+8,y-16,2,5,skin.light);
    }else{leftArm();rightArm();}
  });
  // Shirt collar and neck keep the face independent from wardrobe.
  d.r(44,y-5,9,6,skin.dark);d.r(45,y-5,7,5,skin.light);
  if(stage==='child'){
   // Separate tee + shorts, embroidered playful motif and tiny cuff.
   d.r(x+5,y+4,w-10,4,cloth.light);
   d.r(x+5,rig.leg-4,w-10,4,cloth.dark);
   // More varied everyday silhouettes, regardless of gender or skin tone.
   // Child A: graphic tee, B: longer tunic, C: banded sporty pullover.
   const childStyle=style?({casual:0,classic:1,sporty:2} as const)[style]:key%3;
   if(childStyle===1){
     d.g('child-tunic',()=>{
       d.r(x+3,y+18,w-6,rig.leg-y-20,cloth.dark);
       d.r(x+5,y+19,w-10,rig.leg-y-22,cloth.mid);
       d.r(x+8,y+21,w-16,3,cloth.light);
       d.r(x+5,rig.leg-4,w-10,2,cloth.light);
     });
   }else if(childStyle===2){
     d.g('child-sporty-pullover',()=>{
       for(const line of [y+12,y+18,y+24])d.r(x+4,line,w-8,3,cloth.light);
       d.r(x+2,rig.leg-6,w-4,4,cloth.dark);
       d.r(x+5,rig.leg-5,w-10,2,cloth.mid);
     });
   }else d.g('child-graphic-tee',()=>{
   const emblem=key%4;
   if(emblem===0){d.r(46,y+14,5,5,'#fff3d5');d.r(47,y+15,3,3,'#e18186');}
   if(emblem===1){d.r(43,y+14,10,3,'#fff9ef');d.r(46,y+12,4,8,'#fff9ef');}
   if(emblem===2){d.r(44,y+12,9,8,'#ffe4c4');d.r(47,y+14,3,3,'#e8a96f');}
   if(emblem===3){for(const k of [0,6,12])d.r(x+7,y+11+k,Math.max(4,w-14),2,'#e8f5fc');}
   });
  }else if(stage==='teen'){
   // Hoodie with contrasting hood, drawstrings, kangaroo pouch and optional phone.
   d.r(x+7,y-1,w-14,8,cloth.dark);
   d.r(x+10,y+1,w-20,5,cloth.light);
   d.r(x+11,y+4,2,13,'#f0eee9');d.r(x+w-13,y+4,2,13,'#f0eee9');
   d.r(x+8,y+23,w-16,9,cloth.dark);d.r(x+10,y+24,w-20,7,cloth.light,' opacity=".42"');
   d.r(x+3,rig.leg-5,w-6,3,cloth.dark);
   if(style==='classic')d.g('teen-smart-cardigan',()=>{
     d.r(x+9,y+6,w-18,rig.leg-y-12,'#f2e9dc');
     d.r(x+4,y+8,8,rig.leg-y-14,cloth.dark);
     d.r(x+w-12,y+8,8,rig.leg-y-14,cloth.dark);
     d.r(x+8,y+7,8,4,cloth.light);d.r(x+w-16,y+7,8,4,cloth.light);
     d.r(47,y+10,2,16,'#b7a494');
   });
   else if(style==='sporty')d.g('teen-varsity-jacket',()=>{
     d.r(x+3,y+6,w-6,7,cloth.dark);
     d.r(x+9,y+8,w-18,5,cloth.light);
     d.r(x+3,rig.leg-8,w-6,5,cloth.dark);
     d.r(x+6,rig.leg-7,w-12,2,cloth.light);
     d.r(x-6,y+13,7,4,cloth.light);d.r(x+w+1,y+13,7,4,cloth.light);
     d.r(x+7,y+19,6,8,cloth.light);d.r(x+w-13,y+19,6,8,cloth.light);
   });
   else if(key%2===0){d.r(x+w+2,y+26,7,12,'#293345');d.r(x+w+3,y+27,5,9,'#6a8dbe');}
  }else if(stage==='adult'){
   // Three independent everyday styles — no more universal identical suit.
   // Stable from the person's identity, including after outfit-color changes.
   const adultStyle=style?({classic:0,casual:1,sporty:2} as const)[style]:key%3;
   if(adultStyle===0)d.g('adult-blazer',()=>{
     d.r(x+Math.floor(w*.33),y+3,Math.floor(w*.34),rig.leg-y-5,'#fff8f0');
     d.r(x+5,y+5,10,5,cloth.light);d.r(x+w-15,y+5,10,5,cloth.light);
     d.r(x+7,y+10,5,19,cloth.dark);d.r(x+w-12,y+10,5,19,cloth.dark);
     d.r(47,y+7,2,6,cloth.dark);d.r(48,y+12,2,13,cloth.mid);
     d.r(52,y+25,3,2,'#eee0c5');
     d.r(x+4,rig.leg-4,w-8,4,cloth.dark);
   });
   else if(adultStyle===1)d.g('adult-casual-jacket',()=>{
     d.r(x+Math.floor(w*.34),y+4,Math.floor(w*.32),rig.leg-y-9,'#f5f1eb');
     d.r(x+4,y+5,10,rig.leg-y-10,cloth.dark);
     d.r(x+w-14,y+5,10,rig.leg-y-10,cloth.dark);
     d.r(x+5,y+6,7,rig.leg-y-12,cloth.mid);
     d.r(x+w-12,y+6,7,rig.leg-y-12,cloth.mid);
     d.r(x+6,y+7,8,4,cloth.light);d.r(x+w-14,y+7,8,4,cloth.light);
     d.r(x+7,y+22,6,5,cloth.dark);d.r(x+w-13,y+22,6,5,cloth.dark);
     d.r(47,y+13,2,4,'#ded7cf');
     d.r(x+5,rig.leg-5,w-10,4,cloth.light);
   });
   else d.g('adult-streetwear',()=>{
     d.r(x+8,y-3,w-16,8,cloth.dark);
     d.r(x+10,y,Math.max(1,w-20),7,cloth.light);
     d.r(x+11,y+6,2,14,'#f3f2ea');
     d.r(x+w-13,y+6,2,14,'#f3f2ea');
     d.r(x+7,y+24,w-14,10,cloth.dark);
     d.r(x+9,y+25,w-18,8,cloth.light,' opacity=".55"');
     d.r(x+2,rig.leg-5,w-4,4,cloth.dark);
   });
  }else{
   // Cardigan over a warm shirt, short sleeves and a gentle posture.
   d.r(x+Math.floor(w*.33),y+4,Math.floor(w*.34),rig.leg-y-5,'#f8e5d3');
   d.r(x+7,y+8,7,rig.leg-y-13,cloth.dark);
   d.r(x+w-14,y+8,7,rig.leg-y-13,cloth.dark);
   d.r(47,y+10,2,12,'#dfbc9e');
   d.r(x+5,rig.leg-6,w-10,4,cloth.light);
   d.r(x+5,y+3,w-10,2,cloth.light);
   if(style==='sporty')d.g('senior-track-jacket',()=>{
     d.r(x+3,y+9,w-6,4,cloth.dark);
     d.r(x+3,rig.leg-9,w-6,5,cloth.dark);
     d.r(x+7,y+13,4,rig.leg-y-25,cloth.light);
     d.r(x+w-11,y+13,4,rig.leg-y-25,cloth.light);
   });
   else if(style==='casual')d.g('senior-soft-shirt',()=>{
     d.r(x+8,y+6,w-16,15,cloth.light);
     d.r(x+6,y+12,w-12,3,cloth.mid);
     d.r(x+4,rig.leg-6,w-8,4,cloth.mid);
   });
  }
 });
}
function scalpBehind(d:Canvas,stage:MatureStage,p:CharacterProfile,h:Pal):void{
 const z=RIG[stage],{x,y,w}=z;
 if(p.hair==='long'){
  d.g('hair-behind',()=>{
   const strands=stage==='child'?27:stage==='teen'?36:stage==='adult'?48:42;
   d.r(x-4,y+10,7,strands,h.dark);
   d.r(x+w-3,y+10,7,strands,h.dark);
   d.r(x-3,y+14,4,strands-4,h.mid);
   d.r(x+w-1,y+14,4,strands-4,h.mid);
   if(stage==='child'){
     d.r(x-5,y+29,9,5,h.dark);
     d.r(x+w-4,y+29,9,5,h.dark);
   }
   d.r(x+3,y+6,w-6,12,h.dark);
  });
 }
 if(p.hair==='curls'){
  d.g('hair-behind',()=>{
   d.r(x-6,y+14,8,17,h.dark);d.r(x+w-2,y+14,8,17,h.dark);
   d.r(x-4,y+17,6,14,h.mid);d.r(x+w-2,y+17,6,14,h.mid);
  });
 }
}
function face(d:Canvas,stage:MatureStage,p:CharacterProfile,skin:Pal,hair:Pal,seed:number,mood?:FaceMood):void{
 const {x,y,w,h}=RIG[stage],cx=Math.round(x+w/2);
 const eyeY=y+(stage==='child'?13:stage==='teen'?9:stage==='adult'?7:9),size=stage==='child'?5:4;
 const left=x+6,right=x+w-6-size;
 d.g('age-face',()=>{
  // Stepped oval rather than the old block head, narrow chin and soft cheeks.
  d.r(x+9,y,w-18,2,skin.dark);d.r(x+5,y+2,w-10,4,skin.dark);
  d.r(x+3,y+5,w-6,h-13,skin.dark);d.r(x+1,y+10,w-2,h-21,skin.dark);
  d.r(x+6,y+h-8,w-12,5,skin.dark);d.r(x+10,y+h-3,w-20,2,skin.dark);
  d.r(x+9,y+1,w-18,3,skin.mid);d.r(x+5,y+4,w-10,4,skin.mid);
  d.r(x+3,y+8,w-6,h-16,skin.mid);d.r(x+6,y+h-8,w-12,4,skin.mid);
  d.r(x+6,y+5,w-12,5,skin.light);d.r(x+4,y+10,w-8,h-19,skin.light);
  d.r(x+8,y+h-9,w-16,5,skin.light);
  d.r(x-1,y+14,4,7,skin.dark);d.r(x,y+15,3,5,skin.mid);
  d.r(x+w-3,y+14,4,7,skin.dark);d.r(x+w-2,y+15,3,5,skin.mid);
  // Brow and expressive oval eyes with one-pixel internal glint.
  for(const ex of [left,right]){
   d.r(ex,eyeY-3,size+1,1,hair.dark);
   d.r(ex,eyeY,size,6,'#fff7e8');
   d.r(ex+1,eyeY+1,size-2,5,IRIS[p.eyes]);
   d.r(ex+2,eyeY+1,1,2,'#ffffff');
   d.r(ex,eyeY+6,size,1,skin.mid);
  }
  d.r(x+4,eyeY+8,4,2,'#eb8e93',' opacity=".51"');
  d.r(x+w-8,eyeY+8,4,2,'#eb8e93',' opacity=".51"');
  d.r(cx,eyeY+7,1,2,skin.mid);
  const expression=mood??(['cheerful','curious','determined','thoughtful'][seed%4] as FaceMood);
  const expressionIndex=['cheerful','curious','determined','thoughtful'].indexOf(expression);
  d.g('age-expression-'+expression,()=>{
   const mouthY=Math.min(y+h-5,eyeY+(stage==='child'?11:10));
   if(expressionIndex===0){
     d.r(cx-4,mouthY,2,1,'#a45e67');
     d.r(cx+3,mouthY,2,1,'#a45e67');
     d.r(cx-3,mouthY+1,7,1,'#9b5060');
     d.r(cx-1,mouthY+2,3,1,'#f5dfd9');
   }else if(expressionIndex===1){
     d.r(cx-3,mouthY,6,2,'#a95862');
     d.r(cx-2,mouthY+2,4,1,'#e88f9d');
     d.r(left-1,eyeY-5,size+2,1,hair.mid);
     d.r(right-1,eyeY-5,size+2,1,hair.mid);
   }else if(expressionIndex===2){
     d.r(cx-3,mouthY,7,1,'#79475a');
     d.r(cx-3,eyeY-4,5,1,hair.dark);
     d.r(right,eyeY-4,5,1,hair.dark);
   }else{
     d.r(cx-2,mouthY,5,1,'#9a616c');
     d.r(cx+1,mouthY+1,2,1,'#be8288');
     d.r(left,eyeY-5,size+1,1,hair.dark);
     d.r(right,eyeY-4,size+1,1,hair.dark);
   }
  });
 });
 if(stage==='senior')d.g('senior-details',()=>{
  d.r(x+3,eyeY+7,4,1,skin.mid);d.r(x+w-7,eyeY+7,4,1,skin.mid);
  d.r(x+6,eyeY-6,5,1,skin.mid);d.r(x+w-11,eyeY-6,5,1,skin.mid);
  d.r(x+9,y+h-5,w-18,1,skin.mid);
  // Walking cane alongside the body; not an accessory on the face.
  d.r(80,66,3,46,'#5b4a44');d.r(77,64,7,4,'#82624e');
  d.r(77,66,2,4,'#82624e');d.r(79,112,6,2,'#5b4a44');
 });
}
function hairstyle(d:Canvas,stage:MatureStage,p:CharacterProfile,h:Pal,seed:number):void{
 const {x,y,w}=RIG[stage],top=y-6,senior=stage==='senior';
 d.g('age-hair',()=>{
  // The contour is broken into hair tufts, never one giant rectangular cap.
  if(p.hair==='short'){
   d.r(x+5,top+3,w-10,5,h.dark);d.r(x+10,top,w-18,4,h.dark);
   d.r(x+3,top+6,w-6,5,h.mid);d.r(x+1,top+10,6,7,h.dark);
   d.r(x+w-7,top+10,6,7,h.dark);d.r(x+8,top+3,w-17,3,h.light);
   d.r(x+11,top+10,8,2,h.mid);
  }else if(p.hair==='waves'){
   d.r(x+3,top+6,w-6,8,h.dark);
   d.r(x+6,top+2,8,8,h.mid);d.r(x+13,top-1,9,9,h.dark);
   d.r(x+20,top+1,7,7,h.mid);d.r(x+w-8,top+5,7,11,h.dark);
   d.r(x+7,top+3,5,2,h.light);d.r(x+16,top+1,6,2,h.light);
   d.r(x+8,top+12,w-17,3,h.mid);
  }else if(p.hair==='curls'){
   // Graduated, connected ringlets avoid the tall separated box-crown look.
   // Hair, face and body keep independent layers for genetic continuity.
   d.r(x+5,top+8,w-10,10,h.dark);
   const clusters=[[1,11],[4,5],[10,2],[16,1],[22,5],[24,12]] as const;
   for(const [i,offset] of clusters.entries()){
    const [dx,dy]=offset,px=x+Math.min(dx,w-8),py=top+dy;
    d.r(px,py,7,6,h.dark);
    d.r(px+1,py+1,5,4,h.mid);
    if(i%2===0)d.r(px+2,py+1,2,2,h.light);
   }
   d.r(x+7,top+15,w-14,3,h.mid);
   d.r(x+10,top+16,Math.max(2,w-21),2,h.dark);
  }else{
   // Hair grows in staggered tufts; child's cut is a bob, not a giant adult helmet.
   d.r(x+8,top+3,w-16,4,h.dark);
   d.r(x+4,top+7,w-8,6,h.dark);
   d.r(x+3,top+11,6,6,h.mid);
   d.r(x+w-9,top+11,6,6,h.mid);
   d.r(x+9,top+5,w-18,4,h.mid);
   d.r(x+12,top+2,6,2,h.light);
   d.r(x+19,top+5,5,2,h.light);
   d.r(x+7,top+11,10,4,h.mid);
   d.r(x+10,top+13,8,3,h.dark); // deliberate curved fringe above left brow
   const length=stage==='child'?11:stage==='teen'?16:stage==='adult'?23:20;
   d.r(x+1,top+15,4,length,h.dark);
   d.r(x+w-5,top+15,4,length,h.dark);
   d.r(x+2,top+17,2,Math.max(3,length-3),h.mid);
   d.r(x+w-4,top+17,2,Math.max(3,length-3),h.mid);
   if(stage==='child'){
     d.r(x-2,top+23,7,4,h.dark);d.r(x+w-5,top+23,7,4,h.dark);
   }
  }
  // A few gray strands signify aging without replacing inherited hair pigment.
  if(senior){
   d.r(x+6,top+8,4,2,'#bfc2c9');
   d.r(x+w-12,top+11,4,2,'#d7d5d6');
   if(seed%2===0)d.r(x+14,top+3,3,2,'#c4c4c9');
  }
 });
}
export function renderMatureCharacter(p:CharacterProfile,stage:MatureStage,size='card',seed?:number,mood?:FaceMood):string{
 const key=seed??hash([p.name,p.gender,p.country,p.skin,p.hair,p.hairColor,p.eyes].join('|'));
 const d=new Canvas(),skin=SKIN[p.skin],hair=HAIR[p.hairColor];
 const cloth=CLOTH[p.outfit??'']??CLOTH.blue;
 if(size!=='story-actor')backdrop(d,key);
 scalpBehind(d,stage,p,hair);
 outfit(d,stage,cloth,skin,key,p.outfitStyle);
 face(d,stage,p,skin,hair,key,mood);
 hairstyle(d,stage,p,hair,key);
 return '<svg class="portrait portrait-'+size+' stage-'+stage+' mature-v3" viewBox="0 0 96 118" '+
  'xmlns="http://www.w3.org/2000/svg" role="img" '+
  'aria-label="Original Zoid Life '+stage+' pixel art" data-renderer="mature-v3" '+
  'data-style="clean-pixel-simulation-v3" data-outfit-cut="'+(p.outfitStyle??'legacy')+'" data-pose="'+(stage==='senior'?'neutral':['neutral','thoughtful','greeting'][key%3])+
  '" shape-rendering="crispEdges">'+d.d.join('')+'</svg>';
}
