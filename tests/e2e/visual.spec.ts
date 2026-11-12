import {test,expect} from '@playwright/test';
test('save visual acceptance captures for newborns, growth and life journal',async({page})=>{
 test.setTimeout(60_000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 await expect(page.locator('.newborn-card [data-style="clean-pixel-simulation-v2"]')).toHaveCount(3);
 await page.screenshot({path:'test-results/visual/01-three-newborns-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:900});
 await page.screenshot({path:'test-results/visual/02-three-newborns-desktop.png',fullPage:true});
 await page.locator('[data-do="preset-0"]').click();
 await expect(page.locator('.storyboard-baby')).toBeVisible();
 await page.screenshot({path:'test-results/visual/03-life-journal-newborn.png',fullPage:true});
 await page.evaluate(()=>{
   const saved=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
   saved.age=24;saved.simulation.education='college';saved.simulation.credits=16;
   saved.history.push('24: Construiu uma nova carreira.');
   localStorage.setItem('zoid-life-save-v1',JSON.stringify(saved));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.storyboard-adult')).toBeVisible();
 await page.screenshot({path:'test-results/visual/04-life-journal-adult.png',fullPage:true});
 await page.locator('.game-dock [data-tab="career"]').click();
 await expect(page.locator('.career-vacancy')).toHaveCount(45);
 await page.screenshot({path:'test-results/visual/05-career-board.png',fullPage:true});
 await page.locator('.game-dock [data-tab="actions"]').click();
 await expect(page.locator('.justice-board')).toBeVisible();
 await page.screenshot({path:'test-results/visual/06-legal-choices.png',fullPage:true});
 await page.evaluate(()=>{
   const state=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
   state.simulation.conditions=[{id:'fatigue',severity:2,since:23}];
   localStorage.setItem('zoid-life-save-v1',JSON.stringify(state));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.health-condition').first()).toContainText('Cansaço persistente');
 await page.screenshot({path:'test-results/visual/07-health.png',fullPage:true});
 await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}');
   s.age=78;s.simulation.ended=true;s.simulation.children=1;
   s.social.people.push({id:'child-41-0',role:'child',bornAtPlayerAge:41,alive:true,
     lastSharedAge:-1,closeness:88,profile:{...s.profile,name:'Lucia Costa',outfit:'red'}});
   localStorage.setItem('zoid-life-save-v1',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('[data-descendant]')).toHaveCount(1);
 await page.screenshot({path:'test-results/visual/08-descendant-choices.png',fullPage:true});
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('[data-descendant="child-41-0"]').click();
 await expect(page.locator('.game-identity')).toContainText('Lucia Costa');
 await page.screenshot({path:'test-results/visual/09-second-generation.png',fullPage:true});
});
