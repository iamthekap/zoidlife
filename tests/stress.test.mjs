import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,passYear,takeAction,applyNarrativeChoice} from '../src/simulation.ts';
import {selectEvent,recordEvent} from '../src/event-engine.ts';
import {extraEvents,eventAllowed} from '../src/events-plus.ts';
import {extendedEvents,extendedAllowed} from '../src/events-extended.ts';
import {advancedEvents} from '../src/events-advanced.ts';
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
