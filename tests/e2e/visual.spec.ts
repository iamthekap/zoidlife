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
 await expect(page.locator('.career-vacancy')).toHaveCount(11);
 await page.screenshot({path:'test-results/visual/05-career-board.png',fullPage:true});
});
