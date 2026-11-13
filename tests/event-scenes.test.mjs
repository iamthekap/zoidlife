import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneBackdrop,eventScene,sceneType,journeySceneBackdrop} from '../src/event-scenes.ts';
const profile={name:'Alex Costa',country:'BR',city:'Recife',gender:'nonbinary',skin:'tan',
 hair:'waves',hairColor:'brown',eyes:'green',birthday:7,birthMonth:4};
test('nine original categorical scenes have unique pixel environments and no external images',()=>{
 const kinds=['family','school','work','money','health','city','friend','leisure','retirement'];
 const all=kinds.map(k=>sceneBackdrop(k));
 assert.equal(new Set(all).size,9);
 for(const svg of all){
  assert.ok(svg.includes('shape-rendering="crispEdges"'));
  assert.ok(svg.includes('viewBox="0 0 240 140"'));
  assert.ok((svg.match(/<rect/g)||[]).length>=8);
  assert.ok(!svg.includes('<script')&&!svg.includes('href=')&&!svg.includes('<image'));
 }
});
test('scenarios keep the actual avatar and environment of the chosen category',()=>{
 const result=eventScene('arc-career-lead-1',profile,'pt-BR',30,'work');
 assert.ok(result.includes('scene-work'));
 assert.ok(result.includes('scene-world'));
 assert.ok(result.includes('stage-adult'));
 assert.ok(result.includes('CARREIRA'));
 assert.equal(sceneType('quiet-year'),'city');
});

test('companion scenes show actual species without interpolating potentially unsafe pet names',()=>{
 const p=profile;
 const scene=eventScene('pet-story-pet-1-bond',p,'pt-BR',24,'family',undefined,
  {species:'dog',name:'<img src=x onerror=alert(1)>'});
 assert.ok(scene.includes('data-pet-species="dog"'));
 assert.ok(scene.includes('scene-pet-actor'));
 assert.ok(scene.includes('pet-dog'));
 assert.ok(!scene.includes('onerror')&&!scene.includes('<img'));
 const other=eventScene('pet-story-pet-2-milestone',p,'en',36,'family',undefined,
  {species:'cat',name:'Luna'});
 assert.ok(other.includes('pet-cat'));assert.notEqual(other,scene);
 const unrelated=eventScene('school',p,'pt-BR',12,'school',undefined,{species:'bird',name:'Tico'});
 assert.ok(!unrelated.includes('scene-pet-actor'));
});

test('six travel destinations render unique actual scene worlds rather than the same generic leisure drawing',()=>{
 const ids=['coast','mountains','history','metropolis','family','expedition'];
 const scenes=ids.map(id=>journeySceneBackdrop(id));
 assert.equal(new Set(scenes).size,6);
 for(let i=0;i<ids.length;i++){
  const scene=scenes[i];
  assert.ok(scene.includes('data-destination="'+ids[i]+'"'));
  assert.ok(scene.includes('viewBox="0 0 240 140"'));
  assert.ok((scene.match(/<rect/g)||[]).length>=8);
  assert.ok(!scene.includes('<image')&&!scene.includes('<script'));
  const lived=eventScene('travel-'+ids[i],profile,'pt-BR',31,'leisure');
  assert.ok(lived.includes('VIAGEM'));
  assert.ok(lived.includes('data-destination="'+ids[i]+'"'));
  assert.ok(lived.includes('stage-adult'));
 }
 assert.ok(!eventScene('quiet-year',profile,'pt-BR',31,'city').includes('journey-world'));
});
