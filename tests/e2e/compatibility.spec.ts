import {test,expect} from '@playwright/test';
// Run in Chromium, Firefox and WebKit against the same real UI and local save.
test('cross-engine mobile first life, mandatory annual event and persistent result',async({page,browserName})=>{
 test.setTimeout(60_000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.newborn-card')).toHaveCount(3);
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(393);
 await page.locator('[data-do="preset-0"]').click();
 await expect(page.locator('.identity-portrait .stage-baby')).toBeVisible();
 await page.locator('.dock-age').click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.locator('.event-modal-overlay [data-choice]')).toHaveCount(3);
 await expect(page.locator('.game-dock')).toHaveAttribute('inert','');
 await page.locator('.event-modal-overlay [data-choice="0"]').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('zoid-life-save-v1')||'{}'));
 expect(saved.age).toBe(1);
 expect(saved.chronicle).toHaveLength(1);
 await page.reload();await page.locator('[data-do="continue"]').click();
 await expect(page.locator('.chronicle-result')).toContainText(saved.chronicle[0].result);
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(393);
});
