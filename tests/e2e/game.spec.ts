import {test,expect} from '@playwright/test';
async function chooseBaby(page,index=0){
 await page.goto('/');
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 await page.locator('[data-do="preset-'+index+'"]').click();
 await expect(page.locator('.game-layout')).toBeVisible();
}
async function advance(page,count=1){
 for(let i=0;i<count;i++){
  const age=page.locator('.dock-age');
  await expect(age).toBeEnabled();
  await age.click();
  await expect(page.locator('.decision-card')).toBeVisible();
  await page.locator('[data-choice="0"]').click();
 }
}
test('loading leads directly to three distinct full-body babies without login',async ({page})=>{
 await page.goto('/');
 await expect(page.locator('.welcome-logo')).toContainText('ZOID');
 await expect(page.getByRole('heading',{name:'Quem você vai ser nesta vida?'})).toBeVisible();
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 await expect(page.locator('.newborn-art svg.stage-baby')).toHaveCount(3);
 const sprites=await page.locator('.newborn-art svg').evaluateAll(nodes=>nodes.map(n=>n.outerHTML));
 expect(new Set(sprites).size).toBe(3);
 await expect(page.locator('input[type="password"]')).toHaveCount(0);
 await expect(page.locator('.newborn-tools [data-do="custom"]')).toBeVisible();
 await page.locator('[data-do="reroll"]').click();
 await expect(page.locator('.newborn-card')).toHaveCount(3);
});
test('choose a baby, age up with the central bottom button and restore the save',async ({page})=>{
 await chooseBaby(page);
 await expect(page.locator('.identity-portrait .stage-baby')).toBeVisible();
 await expect(page.locator('.game-dock .dock-age')).toBeVisible();
 await expect(page.locator('.game-dock .dock-tab')).toHaveCount(4);
 await expect(page.locator('.game-dock')).toHaveCSS('grid-template-columns',/.+/);
 await expect(page.locator('.dock-age')).toBeEnabled();
 await page.locator('.dock-age').click();
 await expect(page.locator('.dock-age')).toBeDisabled();
 await expect(page.locator('.decision-card .scene-avatar .stage-baby')).toBeVisible();
 await page.locator('[data-choice="0"]').click();
 await expect(page.locator('.life-journal .life-entry').first()).toBeVisible();
 await expect(page.locator('.identity-copy')).toContainText('1 ano');
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.identity-copy')).toContainText('1 ano');
});
test('free character creator retains identity and remains a baby at birth',async ({page})=>{
 await page.goto('/');
 await page.locator('[data-do="custom"]').click();
 await expect(page.locator('#creator-form')).toBeVisible();
 await expect(page.locator('.creator-preview .stage-baby')).toBeVisible();
 await page.locator('input[name="name"]').fill('Marina Oliveira');
 await page.locator('select[name="country"]').selectOption('US');
 await page.locator('select[name="city"]').selectOption('Chicago');
 await page.locator('select[name="gender"]').selectOption('woman');
 await page.locator('select[name="skin"]').selectOption('deep');
 await page.locator('select[name="hair"]').selectOption('curls');
 await page.locator('input[name="smarts"]').evaluate((el)=>{
   el.value='90';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await page.getByRole('button',{name:'Iniciar essa vida'}).click();
 await expect(page.locator('.identity-copy strong')).toHaveText('Marina Oliveira');
 await expect(page.locator('.identity-portrait svg.stage-baby')).toBeVisible();
 await expect(page.locator('.identity-copy')).toContainText('Chicago');
 await page.locator('[data-tab="career"]').first().click();
 await expect(page.locator('.data-list')).toBeVisible();
 await page.locator('.game-identity').click();
 await expect(page.locator('.game-feed')).toBeVisible();
});
test('age phases change the body while genetic traits persist',async ({page})=>{
 await chooseBaby(page,1);
 const baby=await page.locator('.identity-portrait svg').getAttribute('class');
 await advance(page,3);
 await expect(page.locator('.identity-portrait .stage-child')).toBeVisible();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(state.age).toBe(3);
 expect(state.profile.hairColor).toMatch(/black|blonde|brown|red/);
 expect(baby).toContain('stage-baby');
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.identity-portrait .stage-child')).toBeVisible();
});
test('scene illustrations and journal use original pixel visual language',async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await chooseBaby(page);
 await page.locator('.dock-age').click();
 const scene=page.locator('.scene-visual');
 await expect(scene).toBeVisible();
 await expect(scene.locator('.scene-avatar svg.stage-baby')).toBeVisible();
 await expect(scene.locator('.scene-props .pixel-icon')).toHaveCount(2);
 await page.locator('[data-choice="0"]').click();
 await expect(page.locator('.entry-glyph svg')).toHaveCount(2);
 await page.locator('[data-tab="finances"]').click();
 await expect(page.getByText('Patrimônio líquido',{exact:true})).toBeVisible();
 // Childhood finance controls are intentionally absent, not merely disabled.
 await expect(page.locator('[data-action="home"]')).toHaveCount(0);
 await page.locator('[data-tab="people"]').click();
 await expect(page.getByText('Filhos',{exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});
test('responsive mobile has a centered age button and no horizontal overflow',async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
 await page.locator('[data-do="language"]').click();
 await expect(page.getByRole('heading',{name:'Who will you be in this life?'})).toBeVisible();
 await page.locator('[data-do="preset-0"]').click();
 await expect(page.locator('.game-dock .dock-tab')).toHaveCount(4);
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('.content-panel h2')).toHaveText('Activities');
 const dock=await page.locator('.game-dock').boundingBox();
 const age=await page.locator('.game-dock .dock-age').boundingBox();
 expect(dock&&age).toBeTruthy();
 if(dock&&age)expect(Math.abs((dock.x+dock.width/2)-(age.x+age.width/2))).toBeLessThan(6);
 await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
});
test('desktop shows a balanced central journal and right-side stats',async ({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await chooseBaby(page);
 await expect(page.locator('.game-side')).toBeVisible();
 await expect(page.locator('.game-dock')).toBeVisible();
 await expect(page.locator('.game-side .vitals')).toBeVisible();
 const main=await page.locator('.game-main').boundingBox();
 const side=await page.locator('.game-side').boundingBox();
 expect(main&&side&&main.width>side.width).toBeTruthy();
});
test('decades of event sequences keep the app responsive and consistent',async ({page})=>{
 test.setTimeout(90_000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await chooseBaby(page);
 await advance(page,35);
 await expect(page.locator('.identity-copy')).toContainText('35 anos');
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(save.simulation.balance).toBeGreaterThanOrEqual(0);
 expect(save.simulation.debt).toBeGreaterThanOrEqual(0);
 expect(save.eventLedger&&Object.keys(save.eventLedger).length).toBeGreaterThan(7);
 expect(save.stats.health).toBeGreaterThanOrEqual(0);
 expect(errors).toEqual([]);
});
test('legacy saved game migrates and can keep progressing',async ({page})=>{
 await page.goto('/');
 await page.evaluate(()=>localStorage.setItem('zoid-life-save-v1',JSON.stringify({
  name:'Pessoa Original',age:12,birthYear:2014,stats:{happiness:70,health:82,smarts:45,looks:60},
  pendingEvent:null,seenEventIds:['school'],history:['12: Ano importante.']
 })));
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.identity-copy strong')).toHaveText('Pessoa Original');
 await expect(page.locator('.identity-portrait .stage-teen')).toBeVisible();
 await advance(page,1);
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(s.simulation.schema).toBe(2);
 expect(s.profile.name).toBe('Pessoa Original');
 expect(s.history[0]).toContain('Ano importante');
 expect(s.eventLedger.school.count).toBe(1);
});

test('family members have identity, portraits, age and persistent bonds',async ({page})=>{
 await chooseBaby(page);
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('.person-card')).toHaveCount(2);
 await expect(page.locator('.person-card .person-art .stage-adult')).toHaveCount(2);
 const before=await page.locator('.person-card').first().locator('.person-details small').textContent();
 await page.locator('.person-card').first().locator('[data-kind="talk"]').click();
 const after=await page.locator('.person-card').first().locator('.person-details small').textContent();
 expect(before).not.toBe(after);
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('.person-card').first().locator('.person-details small')).toHaveText(after||'');
 await expect(page.locator('.person-card').first().locator('[data-kind="talk"]')).toBeDisabled();
});

test('game entry remains within common narrow-to-wide viewport widths',async ({page})=>{
 test.setTimeout(70_000);
 for(const width of [320,360,375,390,768,1024,1440]){
  await page.setViewportSize({width,height:850});
  await page.goto('/');
  await expect(page.locator('.newborn-card')).toHaveCount(3);
  const horizontal=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth}));
  expect(horizontal.doc,'overflow on entry width '+width).toBeLessThanOrEqual(horizontal.inner+2);
 }
 await page.setViewportSize({width:320,height:720});
 await page.locator('[data-do="preset-0"]').click();
 const measured=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth}));
 expect(measured.doc).toBeLessThanOrEqual(measured.inner+2);
});
test('a pending event changes language without losing its persistent choices',async ({page})=>{
 await chooseBaby(page);
 await page.locator('.dock-age').click();
 const first=await page.locator('.decision-card h2').textContent();
 const before=await page.locator('[data-choice]').count();
 await page.locator('.game-language').click();
 const after=await page.locator('.decision-card h2').textContent();
 expect(after).not.toBe(first);
 expect(before).toBe(3);
 await expect(page.locator('[data-choice]')).toHaveCount(3);
 await page.locator('[data-choice="1"]').click();
 await expect(page.locator('.dock-age')).toBeEnabled();
});

test('the in-game menu never resets a life without confirmation',async ({page})=>{
 await chooseBaby(page);
 await advance(page,2);
 await page.locator('.game-menu').click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.locator('.identity-copy')).toContainText('2 anos');
 await page.locator('[data-do="close-menu"]').click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.identity-copy')).toContainText('2 anos');
});
test('download a save and import a validated offline life safely',async ({page})=>{
 await chooseBaby(page);
 await page.locator('.game-menu').click();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('[data-do="export-save"]').click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/^zoid-life-.*\.json$/);
 const input=page.locator('#life-save-file');
 const file={name:'vida.json',mimeType:'application/json',
  buffer:Buffer.from(JSON.stringify({name:'Vida Importada',age:19,birthYear:2007,
   stats:{happiness:69,health:83,smarts:63,looks:50},history:['0: Meu nascimento.'],seenEventIds:[],pendingEvent:null}))};
 await input.setInputFiles(file);
 await expect(page.locator('.identity-copy strong')).toHaveText('Vida Importada');
 await expect(page.locator('.identity-portrait .stage-adult')).toBeVisible();
 await page.locator('.game-menu').click();
 await page.locator('#life-save-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});
 await expect(page.getByRole('alert')).toContainText('preservada');
 await expect(page.locator('.identity-copy strong')).toHaveText('Vida Importada');
});

test('several distinct actions are allowed in one year without duplicate rewards',async ({page})=>{
 await chooseBaby(page);
 await advance(page,6);
 await page.locator('.game-dock [data-tab="actions"]').click();
 const study=page.locator('[data-action="study"]'),care=page.locator('[data-action="care"]');
 await expect(study).toBeEnabled();
 await expect(care).toBeEnabled();
 await study.click();
 await expect(study).toBeDisabled();
 await expect(study).toContainText('Realizada neste ano');
 await expect(care).toBeEnabled();
 await care.click();
 await expect(care).toBeDisabled();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(stored.simulation.actionLedger.study).toBe(6);
 expect(stored.simulation.actionLedger.care).toBe(6);
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('[data-action="study"]')).toBeDisabled();
 await page.locator('.dock-age').click();
 await page.locator('[data-choice="0"]').click();
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('[data-action="study"]')).toBeEnabled();
 await expect(page.locator('[data-action="care"]')).toBeEnabled();
});
test('starting another life does not overwrite the saved game without confirmation',async ({page})=>{
 await chooseBaby(page);
 const first=await page.locator('.identity-copy strong').textContent();
 await page.locator('.game-menu').click();
 await page.locator('[data-do="home"]').click();
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('[data-do="preset-1"]').click();
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.identity-copy strong')).toHaveText(first||'');
});

test('newborn graphics have infant face, romper and no adult facial hair',async ({page})=>{
 await page.goto('/');
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 for(const card of await page.locator('.newborn-card').all()){
   await expect(card.locator('.stage-baby[data-age-visual="infant"]')).toBeVisible();
   await expect(card.locator('g[data-part="seated-onesie"]')).toHaveCount(1);
   await expect(card.locator('g[data-part="infant-face"]')).toHaveCount(1);
   await expect(card.locator('[data-part="facial-hair"]')).toHaveCount(0);
 }
 await page.locator('[data-do="preset-0"]').click();
 await expect(page.locator('.identity-portrait svg[data-age-visual="infant"]')).toBeVisible();
 await page.locator('.dock-age').click();
 await expect(page.locator('.scene-avatar svg[data-age-visual="infant"]')).toBeVisible();
});

test('storyboard appears at birth, grows with age and never reveals future chapters',async ({page})=>{
 await chooseBaby(page);
 await expect(page.locator('.storyboard-timeline')).toBeVisible();
 await expect(page.locator('.storyboard-milestone')).toHaveCount(1);
 await expect(page.locator('.storyboard-baby .storyboard-scene')).toBeVisible();
 await expect(page.locator('.storyboard-baby .storyboard-actor .stage-baby')).toBeVisible();
 await expect(page.locator('.storyboard-baby .storyboard-actor [data-part="background"]')).toHaveCount(0);
 await advance(page,3);
 await expect(page.locator('.storyboard-milestone')).toHaveCount(2);
 await expect(page.locator('.storyboard-child .storyboard-actor .stage-child')).toBeVisible();
 await expect(page.locator('.storyboard-teen')).toHaveCount(0);
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.storyboard-child')).toBeVisible();
 await expect(page.locator('.storyboard-baby')).toBeVisible();
});
test('storyboard has blue Zoid, red Life and a red age CTA on mobile',async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const colors=await page.locator('.welcome-logo').evaluate(el=>{
  const word=getComputedStyle(el).color;
  const life=getComputedStyle(el.querySelector('span')).color;
  const css=getComputedStyle(document.documentElement);
  return {word,life,blue:css.getPropertyValue('--brand-blue').trim(),
   red:css.getPropertyValue('--brand-red').trim()};
 });
 expect(colors.blue).toBe('#3A86FF');
 expect(colors.red).toBe('#FF0044');
 expect(colors.word).toBe('rgb(58, 134, 255)');
 expect(colors.life).toBe('rgb(255, 0, 68)');
 await page.locator('[data-do="preset-0"]').click();
 await expect(page.locator('.storyboard-timeline')).toBeVisible();
 const ageBackground=await page.locator('.dock-age').evaluate(el=>getComputedStyle(el).backgroundImage);
 expect(ageBackground).toContain('rgb(255, 0, 68)');
 await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
});
test('a legacy adult life shows phase scenes without changing saved genetic traits',async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await chooseBaby(page);
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 await page.evaluate(()=>{
  const stored=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  stored.age=18;
  stored.history.push('18: Começou a trabalhar em um novo projeto.');
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(stored));
 });
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.storyboard-milestone')).toHaveCount(4);
 await expect(page.locator('.storyboard-adult .stage-adult')).toBeVisible();
 await expect(page.locator('.storyboard-teen .stage-teen')).toBeVisible();
 await expect(page.locator('.storyboard-child .stage-child')).toBeVisible();
 await expect(page.locator('.storyboard-baby .stage-baby')).toBeVisible();
 await expect(page.locator('.storyboard-senior')).toHaveCount(0);
 await expect(page.locator('.storyboard-adult')).toContainText('Começou a trabalhar');
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(after.profile).toEqual(before.profile);
 await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
});

test('new pixel art silhouettes preserve visible genetics and phase differences',async ({page})=>{
 await page.goto('/');
 await expect(page.locator('.newborn-art svg[data-style="clean-pixel-simulation-v2"]')).toHaveCount(3);
 const styles=await page.locator('.newborn-card').evaluateAll(cards=>cards.map(c=>c.querySelector('svg')?.outerHTML||''));
 expect(new Set(styles).size).toBe(3);
 const hues=await page.locator('.newborn-card').evaluateAll(cards=>cards.map(c=>{
   const svg=c.querySelector('svg')!;
   const face=svg.querySelector('[data-part="infant-face"]');
   return Array.from(face?.querySelectorAll('rect')||[]).map(x=>x.getAttribute('fill')).find(x=>['#f6d3b4','#e5b487','#ba8362','#916048'].includes(x||''));
 }));
 expect(new Set(hues).size).toBe(3);
 await page.locator('[data-do="preset-0"]').click();
 await expect(page.locator('.identity-portrait svg[data-style="clean-pixel-simulation-v2"]')).toBeVisible();
 await advance(page,3);
 await expect(page.locator('.identity-portrait .stage-child')).toBeVisible();
 await expect(page.locator('.storyboard-baby svg[data-style="clean-pixel-simulation-v2"]')).toBeVisible();
 await expect(page.locator('.storyboard-child .stage-child')).toBeVisible();
});

test('career board requires qualifications, changes salary and persists job selection',async ({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const data=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  data.age=21;data.simulation.education='college';data.simulation.credits=16;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(data));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('.career-vacancy')).toHaveCount(45);
 await expect(page.locator('[data-career="developer"]')).toBeEnabled();
 await page.locator('[data-career="developer"]').click();
 await expect(page.locator('[data-career="developer"]')).toBeDisabled();
 await expect(page.locator('.career-vacancy.current')).toContainText('Desenvolvedor');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.simulation.occupation).toBe('developer');
 expect(saved.simulation.job).toBe('professional');
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('.career-vacancy.current')).toContainText('Desenvolvedor');
 await expect(page.locator('[data-career="developer"]')).toBeDisabled();
});

test('family interactions persist chosen bond and gift cost while limiting yearly interaction',async ({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=20;s.simulation.balance=1200;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('.person-card')).toHaveCount(2);
 const first=page.locator('.person-card').first();
 await expect(first.locator('[data-kind="gift"]')).toBeEnabled();
 await first.locator('[data-kind="gift"]').click();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(s.simulation.balance).toBe(1000);
 expect(s.simulation.actionLedger.socialize).toBe(20);
 await expect(page.locator('.person-card').first().locator('[data-kind="talk"]')).toBeDisabled();
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('.person-card').first().locator('[data-kind="gift"]')).toBeDisabled();
});

test('life ending generates accurate original recap and downloadable text summary',async ({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const saved=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  saved.age=88;
  saved.simulation.ended=true;
  saved.simulation.education='college';
  saved.simulation.balance=9000;
  saved.simulation.debt=1000;
  saved.simulation.investments=3000;
  saved.history.push('80: Comprou uma motocicleta.');
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(saved));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.life-recap')).toBeVisible();
 await expect(page.locator('.life-recap')).toContainText('Uma vida inteira');
 await expect(page.locator('.life-recap')).toContainText('Concluiu faculdade');
 await expect(page.locator('.life-recap')).toContainText('Comprou uma motocicleta.');
 await expect(page.locator('.life-recap')).toContainText('Patrimônio líquido');
 const download=page.waitForEvent('download');
 await page.locator('[data-do="download-recap"]').click();
 expect((await download).suggestedFilename()).toMatch(/\.txt$/);
 await expect(page.locator('.dock-age')).toBeDisabled();
});

test('the three newborns have distinct outfits and custom clothing survives save and reload',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 const outfits=await page.locator('.newborn-card').evaluateAll(cards=>cards.map(card=>
  [...(card.querySelector('[data-part="seated-onesie"]')?.querySelectorAll('rect')||[])]
   .map(x=>x.getAttribute('fill')).find(fill=>['#3976c9','#dc536d','#539c9d','#b88963','#8675bd','#bf5a62'].includes(fill||''))
 ));
 expect(new Set(outfits).size).toBe(3);
 await page.locator('[data-do="custom"]').click();
 const choice=page.locator('select[data-custom="outfit"]');
 await expect(choice).toBeVisible();
 await choice.selectOption('red');
 await expect(page.locator('#creator-portrait svg')).toHaveAttribute('data-style','clean-pixel-simulation-v2');
 const selected=await page.locator('#creator-portrait [data-part="seated-onesie"]').innerHTML();
 expect(selected).toContain('#dc536d');
 await page.locator('[name="name"]').fill('Mariana Costa');
 await page.locator('#creator-form button[type="submit"]').click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(stored.profile.outfit).toBe('red');
 await page.reload();
 await page.locator('[data-do="continue"]').click();
 const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(persisted.profile.outfit).toBe('red');
});

test('health condition timeline persists and a self-care action reduces severity',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  state.age=30;state.stats.health=45;
  state.simulation.conditions=[{id:'fatigue',severity:2,since:24}];
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(state));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.health-condition').first()).toContainText('Cansaço persistente');
 await expect(page.locator('.health-condition').first()).toContainText('2/3');
 await page.locator('.game-dock [data-tab="actions"]').click();
 await page.locator('[data-action="care"]').click();
 await expect(page.locator('.health-condition').first()).toContainText('1/3');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.simulation.conditions[0].severity).toBe(1);
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.health-condition').first()).toContainText('1/3');
});

test('legal choices record outcomes, use annual cooldown and survive reload',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');s.age=25;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('.justice-option')).toHaveCount(3);
 await page.locator('[data-offense="petty-theft"]').click();
 await expect(page.locator('.justice-history li')).toHaveCount(1);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.simulation.justice.history).toHaveLength(1);
 expect(saved.simulation.actionLedger.crime).toBe(25);
 await expect(page.locator('[data-offense="petty-theft"]')).toBeDisabled();
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('.justice-history li')).toHaveCount(1);
});

test('descendant inherits appearance and starts a second playable generation after death',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=78;s.simulation.ended=true;
  s.simulation.children=1;s.simulation.balance=100000;
  s.simulation.investments=0;s.simulation.debt=0;
  s.social.people.push({
   id:'child-40-0',role:'child',bornAtPlayerAge:40,alive:true,lastSharedAge:-1,closeness:88,
   profile:{...s.profile,name:'Ana Costa',hair:'waves',outfit:'red'}
  });
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.recap-descendants button')).toHaveCount(1);
 page.once('dialog',d=>d.accept());
 await page.locator('[data-descendant="child-40-0"]').click();
 await expect(page.locator('.life-recap')).toHaveCount(0);
 await expect(page.locator('.game-identity')).toContainText('Ana Costa');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.age).toBe(38);
 expect(saved.profile.outfit).toBe('red');
 expect(saved.simulation.balance).toBe(15000);
 expect(saved.ancestors).toHaveLength(1);
 expect(saved.ancestors[0].age).toBe(78);
 expect(saved.social.people.some(p=>!p.alive&&p.profile.name===saved.ancestors[0].name)).toBe(true);
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.game-identity')).toContainText('Ana Costa');
});

test('random newborns stay human while only the custom creator offers supernatural destiny',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-custom="nature"]')).toHaveCount(0);
 await page.locator('[data-do="preset-0"]').click();
 const generated=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(generated.profile.nature).toBe('human');
 expect(generated.profile.origin).toBe('generated');
 await page.locator('.game-menu').click();await page.locator('[data-do="home"]').click();
 await page.locator('[data-do="custom"]').click();
 await expect(page.locator('[data-custom="nature"]')).toBeVisible();
 await page.locator('[data-custom="nature"]').selectOption('vampire');
 await page.locator('[name="name"]').fill('Luna Sombria');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#creator-form button[type="submit"]').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.profile.origin).toBe('custom');expect(saved.profile.nature).toBe('vampire');
});
test('newborn v3 draw uses lively baby anatomy and accessible reduced-motion behavior',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.newborn-v3')).toHaveCount(3);
 for(const n of await page.locator('.newborn-v3').all()){
  await expect(n.locator('[data-part="infant-face"]')).toHaveCount(1);
  await expect(n.locator('[data-part="eyes-open"]')).toHaveCount(1);
  await expect(n.locator('[data-part="seated-onesie"]')).toHaveCount(1);
  await expect(n.locator('[data-part="facial-hair"]')).toHaveCount(0);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('.newborn-v3 [data-part="eyes-open"]').first()).toHaveCSS('animation-name','none');
});

test('custom-created vampire trains powers while random presets never receive them',async({page})=>{
 await page.goto('/');
 await page.locator('[data-do="custom"]').click();
 await page.locator('[data-custom="nature"]').selectOption('vampire');
 await page.locator('[name="name"]').fill('Mara Noturna');
 await page.locator('#creator-form button[type="submit"]').click();
 await page.evaluate(()=>{
  const life=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  life.age=15;localStorage.setItem('zoid-life-save-v1',JSON.stringify(life));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('[data-action="mystic"]')).toBeEnabled();
 await page.locator('[data-action="mystic"]').click();
 await expect(page.locator('.special-origin')).toContainText('Vampiro');
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(s.simulation.mysticMastery).toBe(5);
});

test('profession search filters 45 entries and can be reset without changing progress',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=22;localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('.career-vacancy')).toHaveCount(45);
 const filter=page.locator('[data-career-search]');
 await filter.fill('dentista');
 await expect(page.locator('.career-vacancy:visible')).toHaveCount(1);
 await expect(page.locator('.career-vacancy:visible')).toContainText('Dentista');
 await filter.fill('');
 await expect(page.locator('.career-vacancy:visible')).toHaveCount(45);
});
test('senior is visually distinct from adult while inheriting the same profile',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=69;s.stats.health=85;s.simulation.ended=false;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.identity-portrait .stage-senior')).toBeVisible();
 await expect(page.locator('.identity-portrait [data-part="senior-details"]')).toHaveCount(1);
 await expect(page.locator('.storyboard-senior')).toBeVisible();
});

test('dedicated work action persists momentum and appears in the career dashboard',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=28;s.simulation.job='professional';s.simulation.occupation='doctor';
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="actions"]').click();
 await page.locator('[data-action="work"]').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.simulation.careerMomentum).toBe(17);
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('.career-page')).toContainText('Dedicação');
});

test('candidate pixel characters occupy the card art region on narrow viewports',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 const metrics=await page.locator('.newborn-art').evaluateAll(items=>items.map(x=>{
  const b=x.getBoundingClientRect();return {w:b.width,h:b.height};
 }));
 for(const m of metrics){
  expect(m.h/m.w).toBeGreaterThan(1.1);
  expect(m.h/m.w).toBeLessThan(1.5);
 }
 await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
});

test('player can change appearance without modifying custom destiny or genetic skin/eyes',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');s.age=18;s.simulation.balance=500;s.profile.hairColor='black';s.profile.outfit='blue';
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('.style-studio')).toBeVisible();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 await page.locator('[data-style-field="hairColor"]').selectOption('red');
 await page.locator('[data-style-field="outfit"]').selectOption('purple');
 await page.locator('[data-do="style-apply"]').click();
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(after.profile.hairColor).toBe('red');
 expect(after.profile.outfit).toBe('purple');
 expect(after.profile.skin).toBe(before.profile.skin);
 expect(after.profile.eyes).toBe(before.profile.eyes);
 expect(after.profile.nature).toBe('human');
 expect(after.simulation.balance).toBe(250);
 await expect(page.locator('[data-do="style-apply"]')).toBeDisabled();
 await page.reload();await page.locator('[data-do="continue"]').click();
 const again=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(again.profile.outfit).toBe('purple');
});

test('new relationship choices persist, change the correct NPC, and respect annual social cooldown',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const life=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  life.age=17;life.simulation.balance=400;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(life));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 const chosen=page.locator('[data-person="mother-primary"][data-kind="compliment"]');
 await expect(chosen).toBeEnabled();
 const prior=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 await chosen.click();
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(after.social.people[0].closeness).toBeGreaterThan(prior.social.people[0].closeness);
 expect(after.social.people[1].closeness).toBe(prior.social.people[1].closeness);
 expect(after.simulation.friends).toBe(prior.simulation.friends);
 expect(after.simulation.partner).toBe(prior.simulation.partner);
 expect(after.social.people[0].memories.at(-1).kind).toBe('compliment');
 await expect(page.locator('[data-person="mother-primary"][data-kind="compliment"]')).toBeDisabled();
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('.person-last-memory').first()).toContainText('Elogiar');
 await expect(page.locator('[data-person="mother-primary"][data-kind="argue"]')).toBeDisabled();
});
test('arguments reduce a specific bond and gifts cannot overspend',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const life=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  life.age=17;life.simulation.balance=50;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(life));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('[data-person="mother-primary"][data-kind="gift"]')).toBeDisabled();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 await page.locator('[data-person="mother-primary"][data-kind="argue"]').click();
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(after.social.people[0].closeness).toBeLessThan(before.social.people[0].closeness);
 expect(after.simulation.balance).toBe(50);
 expect(after.stats.happiness).toBeLessThan(before.stats.happiness);
});

test('conflict can be reconciled next year only, and history persists through reloads',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=17;localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('[data-person="mother-primary"][data-kind="reconcile"]')).toBeDisabled();
 await page.locator('[data-person="mother-primary"][data-kind="argue"]').click();
 const conflict=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');s.age=18;
   localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('[data-person="mother-primary"][data-kind="reconcile"]')).toBeEnabled();
 await page.locator('[data-person="mother-primary"][data-kind="reconcile"]').click();
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(after.social.people[0].closeness).toBeGreaterThan(conflict.social.people[0].closeness);
 expect(after.social.people[0].memories.at(-1).kind).toBe('reconcile');
 await expect(page.locator('[data-person="mother-primary"][data-kind="reconcile"]')).toBeDisabled();
});

test('medical degree requires choosing a college specialization before applying',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const saved=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  saved.age=28;saved.simulation.education='college';saved.simulation.credits=50;
  saved.simulation.experience=12;saved.simulation.studyTrack='general';
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(saved));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('[data-career="doctor"]')).toBeDisabled();
 await page.locator('[data-study-track]').selectOption('medicine');
 await page.locator('[data-do="track-apply"]').click();
 await expect(page.locator('.career-page')).toContainText('Medicina e Saúde');
 await expect(page.locator('[data-career="doctor"]')).toBeEnabled();
 await page.locator('[data-career="doctor"]').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.simulation.studyTrack).toBe('medicine');
 expect(saved.simulation.occupation).toBe('doctor');
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('.career-vacancy.current')).toContainText('Médico');
});

test('at birth, jobs are absent and the game opens with the interactive storyboard',async({page})=>{
 await chooseBaby(page);
 await expect(page.locator('.game-dock [data-tab="career"]')).toContainText('Crescer');
 const layout=await page.locator('.game-feed > *').evaluateAll(nodes=>nodes.map(n=>n.className));
 expect(layout[0]).toContain('storyboard-timeline');
 await expect(page.locator('.game-feed > .story-intro')).toHaveCount(0);
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('[data-age-mode="early"]')).toBeVisible();
 await expect(page.locator('.career-vacancy')).toHaveCount(0);
 await expect(page.locator('[data-career="doctor"]')).toHaveCount(0);
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('[data-action="job"]')).toHaveCount(0);
 await expect(page.locator('.justice-board')).toHaveCount(0);
});
test('age-appropriate school and first jobs grow naturally instead of showing adult careers to children',async({page})=>{
 await chooseBaby(page);
 const at=async(age)=>{
  await page.evaluate(age=>{
   const save=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
   save.age=age;save.simulation.ended=false;
   localStorage.setItem('zoid-life-save-v1',JSON.stringify(save));
  },age);
  await page.reload();await page.locator('[data-do="continue"]').click();
  await page.locator('.game-dock [data-tab="career"]').click();
 };
 await at(8);
 await expect(page.locator('.game-dock [data-tab="career"]')).toContainText('Escola');
 await expect(page.locator('[data-age-mode="school"]')).toBeVisible();
 await expect(page.locator('[data-action="study"]')).toBeEnabled();
 await expect(page.locator('.career-vacancy')).toHaveCount(0);
 await at(15);
 await expect(page.locator('.career-vacancy')).toHaveCount(0);
 await at(16);
 await expect(page.locator('.career-vacancy')).toHaveCount(1);
 await expect(page.locator('[data-career="barista"]')).toBeVisible();
 await expect(page.locator('[data-career="surgeon"]')).toHaveCount(0);
 await at(18);
 await expect(page.locator('.career-vacancy')).toHaveCount(45);
});
test('new events are rendered inside the first timeline section and remain clickable',async({page})=>{
 await chooseBaby(page);
 await page.locator('.dock-age').click();
 await expect(page.locator('.storyboard-timeline [data-storyboard-current] .decision-card')).toBeVisible();
 await expect(page.locator('.storyboard-timeline [data-choice="0"]')).toBeEnabled();
 await page.locator('.storyboard-timeline [data-choice="0"]').click();
 await expect(page.locator('.storyboard-timeline .storyboard-track')).toBeVisible();
 await expect(page.locator('.life-journal .life-entry').first()).toBeVisible();
});

test('child, teen, adult and senior have new independent body anatomy and stage-specific faces',async({page})=>{
 await chooseBaby(page);
 for(const [age,stage] of [[4,'child'],[14,'teen'],[28,'adult'],[72,'senior']]){
  await page.evaluate(n=>{
   const saved=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
   saved.age=n;saved.simulation.ended=false;
   localStorage.setItem('zoid-life-save-v1',JSON.stringify(saved));
  },age);
  await page.reload();await page.locator('[data-do="continue"]').click();
  const avatar=page.locator('.identity-portrait .stage-'+stage);
  await expect(avatar).toHaveAttribute('data-renderer','mature-v3');
  await expect(avatar.locator('[data-part="age-face"]')).toHaveCount(1);
  await expect(avatar.locator('[data-part="age-hair"]')).toHaveCount(1);
  await expect(avatar.locator('[data-part="body-outfit"]')).toHaveCount(1);
  await expect(avatar.locator('[data-part="facial-hair"]')).toHaveCount(0);
  if(stage==='senior')await expect(avatar.locator('[data-part="senior-details"]')).toHaveCount(1);
 }
 await expect(page.locator('.storyboard-senior .stage-senior')).toBeVisible();
});

test('desktop uses available width for the life timeline without losing the inspector column',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await chooseBaby(page);
 const box=await page.locator('.game-content-layout').boundingBox();
 const sidebar=await page.locator('.game-side').boundingBox();
 const story=await page.locator('.storyboard-timeline').boundingBox();
 expect(box&&sidebar&&story).toBeTruthy();
 expect(box.width).toBeGreaterThan(1210);
 expect(story.width).toBeGreaterThan(850);
 expect(sidebar.width).toBeLessThan(330);
 await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1442);
});

test('children see their money but not adult finance operations or mortgage buttons',async({page})=>{
 await chooseBaby(page);
 await page.locator('.game-dock [data-tab="finances"]').click();
 await expect(page.locator('[data-finances-mode="youth"]')).toBeVisible();
 await expect(page.locator('[data-action="home"]')).toHaveCount(0);
 await expect(page.locator('[data-action="invest"]')).toHaveCount(0);
 await expect(page.locator('.youth-finances .data-list')).toBeVisible();
 await page.evaluate(()=>{
  const saved=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  saved.age=17;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(saved));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="finances"]').click();
 await expect(page.locator('[data-finances-mode="adult"]')).toBeVisible();
 await expect(page.locator('[data-action="budget"]')).toHaveCount(1);
 await expect(page.locator('[data-action="home"]')).toHaveCount(0);
 await page.evaluate(()=>{
  const saved=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  saved.age=18;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(saved));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="finances"]').click();
 await expect(page.locator('[data-action="home"]')).toHaveCount(1);
});

test('timeline branding and loading wordmark never paint both brand words the same color',async({page})=>{
 await chooseBaby(page);
 const colors=await page.locator('.storyboard-eyebrow').evaluate(el=>({
  blue:getComputedStyle(el.querySelector('.brand-zoid')).color,
  red:getComputedStyle(el.querySelector('.brand-life')).color
 }));
 expect(colors.blue).toBe('rgb(58, 134, 255)');
 expect(colors.red).toBe('rgb(255, 0, 68)');
});

test('an idle life starts directly with the illustrated chronology, never a generic readiness banner',async({page})=>{
 await chooseBaby(page);
 await expect(page.locator('.storyboard-timeline')).toBeVisible();
 await expect(page.locator('.storyboard-timeline .storyboard-track')).toBeVisible();
 await expect(page.locator('.age-ready')).toHaveCount(0);
 await expect(page.locator('[data-storyboard-current]')).toHaveCount(0);
 await expect(page.locator('.storyboard-baby .storyboard-scene')).toBeVisible();
});

test('a real schoolmate appears on entering school and remembers chosen social interactions',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const life=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  life.age=5;life.simulation.ended=false;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(life));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('.person-card')).toHaveCount(2);
 await page.locator('.dock-age').click();
 await page.locator('[data-choice="0"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('.person-card')).toHaveCount(3);
 await expect(page.locator('.people-panel')).toContainText('Colega da escola');
 await expect(page.locator('[data-person="classmate-school"][data-kind="compliment"]')).toBeEnabled();
 await page.locator('[data-person="classmate-school"][data-kind="compliment"]').click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 const peer=state.social.people.find(p=>p.id==='classmate-school');
 expect(peer.memories.at(-1).kind).toBe('compliment');
 expect(state.simulation.friends).toBeGreaterThan(30);
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await expect(page.locator('[data-person="classmate-school"][data-kind="compliment"]')).toBeDisabled();
});

test('adult partner proposal is explicit and never available to children or parents',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=24;s.simulation.relationship='dating';s.simulation.partner=85;s.simulation.balance=500;
  localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 const p=page.locator('[data-kind="propose"]');
 await expect(p).toHaveCount(1);
 await expect(p).toBeEnabled();
 await expect(page.locator('[data-person="mother-primary"][data-kind="propose"]')).toHaveCount(0);
 await p.click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.simulation.relationship).toBe('married');
 expect(saved.simulation.balance).toBe(250);
 await expect(page.locator('[data-kind="propose"]')).toBeDisabled();
});

test('school friend retains the same identity and encounter memory after turning eighteen',async({page})=>{
 await chooseBaby(page);
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=14;localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await page.locator('.game-dock [data-tab="people"]').click();
 await page.locator('[data-person="classmate-school"][data-kind="compliment"]').click();
 const before=await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  return s.social.people.find(p=>p.id==='classmate-school');
 });
 await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  s.age=18;localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 const after=await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
  return s.social.people.find(p=>p.id==='classmate-school');
 });
 expect(after.role).toBe('friend');
 expect(after.profile.name).toBe(before.profile.name);
 expect(after.memories).toEqual(before.memories);
});
