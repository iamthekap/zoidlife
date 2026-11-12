import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,passYear,takeAction,applyNarrativeChoice} from '../src/simulation.ts';
import {selectEvent,recordEvent} from '../src/event-engine.ts';
import {extraEvents,eventAllowed} from '../src/events-plus.ts';
import {extendedEvents,extendedAllowed} from '../src/events-extended.ts';
import {advancedEvents} from '../src/events-advanced.ts';
import {startStoryArc,storyArcEvent,afterStoryArcChoice,storyArcAllowed,normalizeStoryArc} from '../src/story-arcs.ts';
const initial={happiness:70,health:83,smarts:55,looks:59};
test('500 deterministic multi-decade lives preserve financial and stat invariants',()=>{
  const all=[...extraEvents('pt-BR'),...extendedEvents('pt-BR'),...advancedEvents('pt-BR')];
  let contextualChoices=0;
  for(let seed=0;seed<500;seed++){
    let s=createSimulation(),stats={...initial},ledger={},lastId=null;
    let random=(seed+1)*1103515245>>>0;
    const rng=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
    for(let age=1;age<=100;age++){
      const next=passYear(s,stats,age);
      if(!next.ok)break;
      s=next.state;stats=next.stats;
      if(s.ended)break;
      const pool=all.filter(x=>eventAllowed(x,s)&&(!('condition' in x)||extendedAllowed(x,s)));
      const story=selectEvent(pool,age,ledger,lastId,rng);
      if(story){
        const index=Math.floor(rng()*story.choices.length);
        // Exercise the actual gameplay contract, including persistent world impacts.
        const consequence=story.choices[index];
        if(consequence.world&&Object.keys(consequence.world).length)contextualChoices++;
        const result=applyNarrativeChoice(s,stats,age,story.id,index,consequence.effects,consequence.world??{});
        assert.ok(result.ok);
        s=result.state;stats=result.stats;
        ledger=recordEvent(ledger,story.id,age);lastId=story.id;
      }
      const types=['study','job','socialize','care','budget','invest','home','child','retire'];
      const action=types[Math.floor(rng()*types.length)];
      const another=types[Math.floor(rng()*types.length)];
      for(const candidate of [action,another]){
        const result=takeAction(s,stats,age,candidate);
        if(result.ok){s=result.state;stats=result.stats;}
      }
      for(const k of Object.keys(stats))assert.ok(stats[k]>=0&&stats[k]<=100);
      for(const field of ['balance','debt','investments','homeValue','children','family','friends','partner'])
        assert.ok(Number.isFinite(s[field])&&s[field]>=0,field+' at age '+age);
      assert.ok(s.children<=8);
      assert.ok(s.balance<1000000000);
      assert.ok(s.debt<1000000000);
    }
  }
  assert.ok(contextualChoices>50,'long-run simulation must exercise world-changing choices');
});

test('500 deterministic three-year continuations preserve real state, choice identity and financial bounds',()=>{
 const seeds=[
  ['school-new-class',0,12,'school-team'],
  ['computer-club',0,12,'coding-club'],
  ['best-friend-message',0,30,'old-friend'],
  ['family-difficult-talk',1,30,'family-plan'],
  ['work-project-lead',0,30,'career-lead'],
  ['medical-prevention',0,30,'health-routine']
 ];
 let finished=0;
 for(let seed=0;seed<500;seed++){
  const [trigger,index,origin,arcId]=seeds[seed%seeds.length];
  let state=createSimulation(),stats={...initial};
  if(origin<18)state.education='school';
  if(arcId==='career-lead'){state.job='office';state.experience=9;}
  let arc=startStoryArc(trigger,index,origin,null);
  assert.equal(arc?.id,arcId);
  for(let phase=1;phase<=2;phase++){
   const next=passYear(state,stats,origin+phase);
   assert.equal(next.ok,true);
   state=next.state;stats=next.stats;
   assert.equal(storyArcAllowed(arc,state,origin+phase),true);
   const event=storyArcEvent(arc,seed%2?'en':'pt-BR');
   assert.ok(event);
   assert.equal(event.id,'arc-'+arcId+'-'+phase);
   const choice=seed%2;
   const outcome=applyNarrativeChoice(state,stats,origin+phase,event.id,choice,
    event.choices[choice].effects,event.choices[choice].world);
   assert.equal(outcome.ok,true);
   state=outcome.state;stats=outcome.stats;
   assert.ok(Object.values(stats).every(x=>x>=0&&x<=100));
   for(const field of ['balance','debt','investments','family','friends','credits','experience'])
    assert.ok(Number.isFinite(state[field])&&state[field]>=0,field+':'+seed);
   arc=afterStoryArcChoice(arc,event.id,choice,origin+phase);
   if(phase===1){
    assert.equal(arc?.phase,2);
    assert.equal(arc?.branch,choice);
    assert.deepEqual(normalizeStoryArc(JSON.parse(JSON.stringify(arc)),origin+phase),arc);
   }else assert.equal(arc,null);
  }
  finished++;
 }
 assert.equal(finished,500);
});
