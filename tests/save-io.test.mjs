import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLifeSave,saveFilename,serializeLife} from '../src/save-io.ts';
const life={name:'Alex Silva',age:22,stats:{happiness:70,health:80,smarts:60,looks:50},
 history:['0: Nascimento.'],seenEventIds:[],pendingEvent:null};
test('valid saves roundtrip without passwords or accounts',()=>{
 const result=validateLifeSave(serializeLife(life));
 assert.equal(result.ok,true);
 if(result.ok){assert.equal(result.value.name,'Alex Silva');assert.equal(result.value.age,22);}
});
test('malformed JSON and oversized data are rejected safely',()=>{
 assert.equal(validateLifeSave('{').ok,false);
 assert.equal(validateLifeSave('x'.repeat(1_000_001)).ok,false);
 assert.equal(validateLifeSave(JSON.stringify({...life,age:9999})).ok,false);
 assert.equal(validateLifeSave(JSON.stringify({...life,stats:{...life.stats,health:Infinity}})).ok,false);
});
test('untrusted event effects and injected scripts are not accepted as active decisions',()=>{
 const bad={...life,pendingEvent:{id:'x',title:'x',description:'x',choices:[
  {label:'a',result:'a',effects:{happiness:999}}, {label:'b',result:'b',effects:{}},
  {label:'c',result:'c',effects:{}}]}};
 assert.equal(validateLifeSave(JSON.stringify(bad)).ok,false);
});
test('safe filenames discard path and formatting tricks',()=>{
 assert.equal(saveFilename('João Silva'),'zoid-life-joao-silva.json');
 assert.ok(!saveFilename('../../hello?').includes('/'));
});
test('older data without new nested systems is still accepted for migration',()=>{
 const old={name:'Vida Antiga',age:14,stats:life.stats,history:['2: bom']};
 assert.equal(validateLifeSave(JSON.stringify(old)).ok,true);
});
