import {test,expect} from '@playwright/test';
test('start from a randomized character, choose a year event, and restore the life',async ({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Sua próxima vida começa aqui.'})).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await page.getByRole('button',{name:'Escolher personagem'}).click();
  await expect(page.locator('.candidate-card')).toHaveCount(4);
  await page.locator('[data-do="preset-0"]').click();
  await expect(page.locator('.play-layout')).toBeVisible();
  await expect(page.locator('.age-pill')).toHaveText('0');
  await page.locator('[data-do="age-up"]').click();
  await expect(page.locator('.age-pill')).toHaveText('1');
  await expect(page.locator('[data-choice]')).toHaveCount(3);
  await page.locator('[data-choice="0"]').click();
  await expect(page.locator('.timeline li').first()).toBeVisible();
  await page.reload();
  await page.locator('[data-do="continue"]').click();
  await expect(page.locator('.age-pill')).toHaveText('1');
});
test('full custom character editor works and retains birthplace and identity',async ({page})=>{
  await page.goto('/');
  await page.locator('[data-do="custom"]').click();
  await expect(page.locator('#creator-form')).toBeVisible();
  await page.locator('input[name="name"]').fill('Marina Oliveira');
  await page.locator('select[name="country"]').selectOption('US');
  await page.locator('select[name="city"]').selectOption('Chicago');
  await page.locator('select[name="gender"]').selectOption('woman');
  await page.locator('select[name="skin"]').selectOption('deep');
  await page.locator('select[name="hair"]').selectOption('curls');
  await page.locator('input[name="smarts"]').evaluate((el:HTMLInputElement)=>{el.value='90';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.getByRole('button',{name:'Iniciar essa vida'}).click();
  await expect(page.locator('.game-heading h1')).toHaveText('Marina Oliveira');
  await expect(page.locator('.game-heading p')).toContainText('Chicago');
  await page.locator('[data-tab="career"]').first().click();
  await expect(page.locator('.data-list')).toBeVisible();
  await page.locator('[data-tab="story"]').first().click();
  await expect(page.locator('.age-pill')).toHaveText('0');
});
test('mobile layout fits screen, changes language and navigates without login',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('.welcome-layout')).toBeVisible();
  await expect.poll(async ()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
  await page.locator('[data-do="language"]').click();
  await expect(page.getByRole('heading',{name:'Your next life begins here.'})).toBeVisible();
  await page.locator('[data-do="selection"]').click();
  await expect(page.locator('.candidate-card')).toHaveCount(4);
  await page.locator('[data-do="preset-0"]').click();
  await expect(page.locator('.mobile-tabs .nav-item')).toHaveCount(5);
  await page.locator('.mobile-tabs [data-tab="actions"]').click();
  await expect(page.locator('.content-panel h2')).toHaveText('Activities');
  await expect.poll(async ()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
});

test('visual life events have pixel-art protagonist and reusable pictogram props',async ({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.locator('[data-do="selection"]').click();
  await page.locator('[data-do="preset-0"]').click();
  await page.locator('[data-do="age-up"]').click();
  const scene=page.locator('.scene-visual');
  await expect(scene).toBeVisible();
  await expect(scene.locator('.scene-avatar .portrait')).toBeVisible();
  await expect(scene.locator('.scene-props .pixel-icon')).toHaveCount(2);
  await expect(scene.locator('.scene-avatar rect')).not.toHaveCount(0);
  await page.locator('[data-choice="0"]').click();
  await page.locator('[data-tab="finances"]').first().click();
  await expect(page.getByText('Patrimônio líquido',{exact:true})).toBeVisible();
  await expect(page.locator('[data-action="home"]').first()).toBeDisabled();
  await page.locator('[data-tab="people"]').first().click();
  await expect(page.getByText('Filhos',{exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
test('repeatable scheduler and year transitions remain playable for decades',async ({page})=>{
  test.setTimeout(60_000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.locator('[data-do="selection"]').click();
  await page.locator('[data-do="preset-1"]').click();
  for(let i=0;i<32;i++){
    const ageUp=page.locator('[data-do="age-up"]');
    if(await ageUp.count()){
      await ageUp.click();
      const choice=page.locator('[data-choice="0"]');
      if(await choice.count())await choice.click();
    }
  }
  await expect(page.locator('.age-pill')).toHaveText('32');
  const ledger=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}').eventLedger);
  expect(typeof ledger).toBe('object');
  expect(Object.keys(ledger).length).toBeGreaterThan(4);
  const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
  expect(save.simulation.balance).toBeGreaterThanOrEqual(0);
  expect(save.simulation.debt).toBeGreaterThanOrEqual(0);
  expect(save.stats.health).toBeGreaterThanOrEqual(0);
  expect(save.stats.health).toBeLessThanOrEqual(100);
  expect(errors).toEqual([]);
});
test('legacy localStorage life opens in the current game and preserves its name',async ({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    localStorage.setItem('zoid-life-save-v1',JSON.stringify({
      name:'Pessoa Original',age:12,birthYear:2014,stats:{happiness:70,health:82,smarts:45,looks:60},
      pendingEvent:null,seenEventIds:['school'],history:['12: Ano importante.']
    }));
  });
  await page.reload();
  await page.locator('[data-do="continue"]').click();
  await expect(page.locator('.game-heading h1')).toHaveText('Pessoa Original');
  await expect(page.locator('.age-pill')).toHaveText('12');
  const migration=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
  // Migrated in memory; persisted when the player makes a choice.
  await page.locator('[data-do="age-up"]').click();
  await page.locator('[data-choice="0"]').click();
  const migrated=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
  expect(migrated.simulation.schema).toBe(2);
  expect(migrated.profile.name).toBe('Pessoa Original');
  expect(migrated.history[0]).toContain('Ano importante');
  expect(migrated.eventLedger.school.count).toBe(1);
});
