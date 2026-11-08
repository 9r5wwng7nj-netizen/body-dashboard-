// Named pages: legacy links still resolve, workout import/export lives in Settings, and
// dashboard cards can be hidden.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const APP = pathToFileURL(path.resolve('index.html')).href;
async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('dialog', d => d.accept());
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  await page.evaluate(() => A.helpDismiss({ dataset: { what: 'tour' } }));
  return errors;
}

test('legacy section links open named History, Body and Targets pages without tab rows', async ({ page }) => {
  const errors = await open(page);
  const view = page.locator('#view');
  await page.evaluate(() => {
    const s = new Date(); s.setHours(7, 0, 0, 0);
    Store.set('workouts', [{ id: 'w1', name: 'Push', start: s.toISOString(), end: new Date(s.getTime() + 36e5).toISOString(), exercises: [{ name: 'Bench Press', sets: [{ type: 'normal', weight: 60, reps: 8 }] }] }]);
    ui.fitTab = 'stats'; go('fitness');
  });
  await expect(page.locator('#view-title')).toHaveText('Workout history');
  await expect(view.locator('.tabs-row')).toHaveCount(0);
  await expect(view.locator('[data-action="statMonth"]').first()).toBeVisible();
  await expect(view).toContainText('Push');
  await expect(view.locator('[data-action="pageHome"][data-view="fitness"]')).toBeVisible();

  await page.evaluate(() => { ui.nutTab = 'body'; ui.nutPage = null; go('nutrition'); });
  await expect(page.locator('#view-title')).toHaveText('Weight & measurements');
  await expect(view).toContainText('Log measurements');
  await page.evaluate(() => { ui.nutTab = 'history'; ui.nutPage = null; render(); });
  await expect(page.locator('#view-title')).toHaveText('Targets & check-ins');
  await expect(view).toContainText('Habits & adherence');
  await expect(view.locator('.tabs-row')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('workout import and export are in Settings', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => A.openSettings());
  const modal = page.locator('#modal');
  for (const a of ['hevyImport', 'hevyExport', 'fitJsonExport']) await expect(modal.locator(`[data-action="${a}"]`)).toHaveCount(1);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('dashboard cards can be hidden and shown again', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => go('dashboard'));
  const view = page.locator('#view');
  await expect(view).toContainText('Training');
  await view.locator('[data-action="dashCardsEdit"]').first().click();
  const box = id => page.locator(`#modal [data-change="dashCardToggle"][data-val="${id}"]`);
  await expect(box('training')).toBeChecked();
  await box('training').uncheck();
  await box('meals').uncheck();
  await page.click('#modal button:has-text("Done")');
  await expect(view).not.toContainText('Training');
  await expect(view).toContainText('Nutrition today');
  expect(await page.evaluate(() => S.hiddenCards)).toEqual(['training', 'meals']);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('bd.settings')).hiddenCards)).toEqual(['training', 'meals']);

  // Hiding every card leaves a way back.
  await page.evaluate(() => { S.hiddenCards = DASH_CARDS.map(c => c[0]); render(); });
  await expect(view).toContainText('Every card is hidden');
  await view.locator('[data-action="dashCardsEdit"]').last().click();
  await box('weight').check();
  await page.click('#modal button:has-text("Done")');
  await expect(view.locator('.card', { hasText: 'Body weight' }).first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});
