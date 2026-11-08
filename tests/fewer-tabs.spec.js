// Fewer tabs: merged tabs still open from old links, workout import/export lives in Settings, and
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
const tab = (page, key, id) => page.locator(`#view [data-action="setTab"][data-key="${key}"][data-val="${id}"]`);

test('merged tabs show both parts, and links to the old tabs land in the right place', async ({ page }) => {
  const errors = await open(page);
  const view = page.locator('#view');

  // Workouts: History has the calendar on top; Import / Export is gone from the tabs.
  await page.evaluate(() => {
    const s = new Date(); s.setHours(7, 0, 0, 0);
    Store.set('workouts', [{ id: 'w1', name: 'Push', start: s.toISOString(), end: new Date(s.getTime() + 36e5).toISOString(), exercises: [{ name: 'Bench Press', sets: [{ type: 'normal', weight: 60, reps: 8 }] }] }]);
    ui.fitTab = 'stats'; go('fitness');
  });
  await expect(tab(page, 'fitTab', 'history')).toHaveAttribute('aria-pressed', 'true');
  await expect(tab(page, 'fitTab', 'stats')).toHaveCount(0);
  await expect(tab(page, 'fitTab', 'data')).toHaveCount(0);
  await expect(view.locator('[data-action="statMonth"]').first()).toBeVisible();
  await expect(view).toContainText('Push');

  // Nutrition: Body & weight holds measurements; Plan holds habits.
  await page.evaluate(() => { ui.nutTab = 'body'; go('nutrition'); });
  await expect(tab(page, 'nutTab', 'trend')).toHaveText(/Body & weight/);
  await expect(view).toContainText('Log measurements');
  await page.evaluate(() => { ui.nutTab = 'history'; render(); });
  await expect(tab(page, 'nutTab', 'plan')).toHaveAttribute('aria-pressed', 'true');
  await expect(view).toContainText('Habits & adherence');
  for (const id of ['body', 'history']) await expect(tab(page, 'nutTab', id)).toHaveCount(0);

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
