/** Original, offline Web Audio sound design.
 * No audio files, third-party music, tracking, network access or paid services.
 * Audio is always silent until the player explicitly enables it by interacting.
 */
export const SOUND_KEY='zoid-life-sound-v1';
export type SoundCue='start'|'year'|'choice'|'success'|'career'|'social'|'finance'|'hobby'|'travel'|'warning'|'ending'|'open';
export type SoundSettings={enabled:boolean;volume:number;music:boolean};
export type Note={frequency:number;start:number;length:number;gain:number;wave:'sine'|'triangle'|'square'};
export const DEFAULT_SOUND:SoundSettings={enabled:false,volume:0.32,music:false};
const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n);
export function normalizeSoundSettings(raw:unknown):SoundSettings{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_SOUND};
 const v=raw as Record<string,unknown>;
 return {enabled:v.enabled===true,volume:finite(v.volume)?Math.max(0,Math.min(1,Math.round((v.volume as number)*100)/100)):DEFAULT_SOUND.volume,
   music:v.music===true};
}
export function readSoundSettings(storage?:Pick<Storage,'getItem'>):SoundSettings{
 try {const store=storage??(typeof localStorage==='undefined'?null:localStorage);
  return store?normalizeSoundSettings(JSON.parse(store.getItem(SOUND_KEY)??'null')):{...DEFAULT_SOUND};
 }catch{return {...DEFAULT_SOUND};}
}
export function soundNotes(cue:SoundCue):readonly Note[]{
 const n=(frequency:number,start:number,length:number,gain:number,wave:Note['wave']='triangle'):Note=>
  ({frequency,start,length,gain,wave});
 switch(cue){
  case 'start':return [n(262,0,.16,.21),n(330,.11,.17,.19),n(392,.23,.19,.22),n(523,.36,.31,.24)];
  case 'year':return [n(330,0,.11,.18),n(494,.105,.17,.18)];
  case 'choice':return [n(330,0,.07,.16,'sine'),n(392,.075,.11,.19,'sine')];
  case 'career':return [n(330,0,.1,.21),n(440,.1,.12,.19),n(554,.2,.21,.18)];
  case 'social':return [n(392,0,.13,.18,'sine'),n(494,.13,.16,.17,'sine')];
  case 'finance':return [n(554,0,.09,.15,'square'),n(660,.09,.11,.12,'sine')];
  case 'hobby':return [n(440,0,.12,.13),n(587,.12,.17,.18)];
  case 'travel':return [n(330,0,.11,.14,'sine'),n(440,.095,.14,.14),n(587,.23,.26,.16,'sine')];
  case 'success':return [n(392,0,.12,.17),n(494,.11,.13,.16),n(659,.23,.24,.2)];
  case 'warning':return [n(262,0,.22,.2,'sine'),n(220,.2,.31,.2,'sine')];
  case 'ending':return [n(392,0,.29,.16,'sine'),n(330,.28,.33,.15,'sine'),n(262,.58,.66,.15,'sine')];
  case 'open':return [n(440,0,.065,.10,'sine')];
 }
}
/** Original, low-volume atmospheric notes, with deliberate gaps and no borrowed melody. */
export function ambienceNotes(beat:number):readonly Note[]{
 const progression=[196,220,174,164];
 const root=progression[((beat%4)+4)%4];
 return [{frequency:root,start:0,length:1.4,gain:.055,wave:'sine'},
  {frequency:root*1.5,start:.36,length:.95,gain:.037,wave:'sine'},
  {frequency:root*2,start:.93,length:.65,gain:.026,wave:'triangle'}];
}
export class GameSound{
 private ctx:AudioContext|null=null;
 private active=false;
 private loop:ReturnType<typeof setInterval>|null=null;
 private beat=0;
 private failed=false;
 private voices=new Set<OscillatorNode>();
 settings:SoundSettings;
 constructor(settings=readSoundSettings()){this.settings=normalizeSoundSettings(settings);}
 private getContext():AudioContext|null{
  if(this.failed||typeof window==='undefined'||typeof window.AudioContext!=='function')return null;
  if(!this.ctx){
   try{this.ctx=new window.AudioContext();}
   catch{this.failed=true;return null;}
  }
  return this.ctx;
 }
 private schedule(notes:readonly Note[]):void{
  const ctx=this.getContext();
  if(!ctx||!this.settings.enabled||this.settings.volume<=0)return;
  try{
   if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
   const start=ctx.currentTime+.015;
   for(const n of notes){
    if(!Number.isFinite(n.frequency)||n.frequency<40||n.frequency>4000)continue;
    const oscillator=ctx.createOscillator(),envelope=ctx.createGain();
    oscillator.type=n.wave;oscillator.frequency.setValueAtTime(n.frequency,start+n.start);
    const peak=Math.min(.32,n.gain*this.settings.volume);
    envelope.gain.setValueAtTime(0,start+n.start);
    envelope.gain.linearRampToValueAtTime(peak,start+n.start+.012);
    envelope.gain.exponentialRampToValueAtTime(.001,start+n.start+n.length);
    oscillator.connect(envelope);envelope.connect(ctx.destination);
    this.voices.add(oscillator);
    oscillator.start(start+n.start);oscillator.stop(start+n.start+n.length+.018);
    oscillator.onended=()=>{this.voices.delete(oscillator);oscillator.disconnect();envelope.disconnect();};
   }
  }catch{this.failed=true;this.stopMusic();this.silence();}
 }
 play(cue:SoundCue):void{
  if(!this.settings.enabled)return;
  this.active=true; // Playback permission originates from a user gesture, never page load.
  this.schedule(soundNotes(cue));
  this.syncMusic();
 }
 configure(next:Partial<SoundSettings>):SoundSettings{
  const previous=this.settings;
  this.settings=normalizeSoundSettings({...previous,...next});
  try{localStorage.setItem(SOUND_KEY,JSON.stringify(this.settings));}catch{}
  if(this.settings.enabled&&!previous.enabled){
   this.active=true;this.schedule(soundNotes('success'));
  }
  if(!this.settings.enabled){this.stopMusic();this.silence();}
  else if(!this.settings.music)this.stopMusic();
  else if(this.active)this.syncMusic();
  return this.settings;
 }
 private syncMusic():void{
  if(!this.active||this.loop!==null||!this.settings.enabled||!this.settings.music||
    (typeof document!=='undefined'&&document.hidden))return;
  this.schedule(ambienceNotes(this.beat++));
  this.loop=setInterval(()=>{
   if(typeof document!=='undefined'&&document.hidden)return;
   this.schedule(ambienceNotes(this.beat++));
  },3300);
 }
 private silence():void{
  for(const voice of this.voices){try{voice.stop();}catch{}}
  this.voices.clear();
 }
 stopMusic():void{
  if(this.loop!==null){clearInterval(this.loop);this.loop=null;}
 }
 visibilityChanged():void{
  if(typeof document!=='undefined'&&document.hidden)this.stopMusic();
  else if(this.active)this.syncMusic();
 }
 destroy():void{
  this.stopMusic();this.silence();this.active=false;
  const ctx=this.ctx;this.ctx=null;if(ctx)void ctx.close().catch(()=>{});
 }
}
