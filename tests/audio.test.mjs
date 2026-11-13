import test from 'node:test';
import assert from 'node:assert/strict';
import {SOUND_KEY,DEFAULT_SOUND,normalizeSoundSettings,readSoundSettings,soundNotes,ambienceNotes,GameSound} from '../src/audio.ts';
test('sound is silent and music disabled unless player explicitly opts in',()=>{
 assert.deepEqual(readSoundSettings(),DEFAULT_SOUND);
 assert.deepEqual(normalizeSoundSettings({enabled:false,volume:.8,music:true}),{enabled:false,volume:.8,music:true});
 assert.deepEqual(readSoundSettings({getItem:()=>'{invalid'}),DEFAULT_SOUND);
 assert.equal(SOUND_KEY,'zoid-life-sound-v1');
});
test('volume is bounded, invalid values are sanitized and settings do not affect life save',()=>{
 assert.deepEqual(normalizeSoundSettings({enabled:true,volume:Infinity,music:false}),{enabled:true,volume:.32,music:false});
 assert.equal(normalizeSoundSettings({volume:-200}).volume,0);
 assert.equal(normalizeSoundSettings({volume:18}).volume,1);
 assert.equal(normalizeSoundSettings({volume:.236}).volume,.24);
 const player=new GameSound({enabled:true,volume:.75,music:false});
 assert.equal(player.settings.volume,.75);
 player.configure({enabled:false,volume:.42});
 assert.equal(player.settings.enabled,false);
 assert.equal(player.settings.volume,.42);
 player.destroy();
});
test('all sounds are bounded, distinct, locally synthesized and free of external media',()=>{
 const names=['start','year','choice','success','career','social','finance','hobby','travel','dog','cat','rabbit','bird','warning','ending','open'];
 assert.equal(names.length,16);
 const sequences=names.map(cue=>soundNotes(cue));
 assert.equal(new Set(sequences.map(s=>JSON.stringify(s))).size,names.length);
 for(const list of [...sequences,...Array.from({length:4},(_,i)=>ambienceNotes(i))]){
  assert.ok(list.length>=1&&list.length<=5);
  for(const note of list){
   assert.ok(note.frequency>=40&&note.frequency<=4000);
   assert.ok(note.start>=0&&note.length>0&&note.length<=2);
   assert.ok(note.gain>0&&note.gain<=.32);
   assert.ok(['sine','triangle','square'].includes(note.wave));
  }
 }
});
