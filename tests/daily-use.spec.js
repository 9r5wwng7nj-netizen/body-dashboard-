// Day-to-day behaviour: the counts beside menu items, hiding tabs, and typing on a phone.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const APP = pathToFileURL(path.resolve('index.html')).href;
async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('dialog', d => d.accept());
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.data && Array.isArray(Store.data.recipes));
  await page.evaluate(() => A.helpDismiss({ dataset: { what: 'tour' } })); // the start-here card has its own test
  return errors;
}
test('menu items show what needs attention today', async ({ page }) => {
  const errors = await open(page);
  const chip = view => page.locator(`#nav [data-view="${view}"] .nav-count`);
  await expect(page.locator('#nav .nav-count')).toHaveCount(0);
  // Every menu item can carry a count, whether or not it has anything to count yet.
  expect(await page.evaluate(() => VIEWS.filter(v => v.id).every(v => typeof NAV_COUNTS[v.id] === 'function'))).toBe(true);
  await expect(page.locator('#menu-dot')).toBeHidden();

  // A workout in progress shows a dot.
  await page.evaluate(() => { Store.set('activeWorkout', { id: 'w', name: 'Workout', start: new Date().toISOString(), exercises: [] }); render(); });
  await expect(page.locator('#nav [data-view="fitness"]')).toContainText('workout in progress');

  // Daily checks: quiet until that part of the app has been used, then about today only.
  for (const view of ['nutrition', 'recipes', 'dashboard']) await expect(chip(view)).toHaveCount(0);
  await page.evaluate(() => {
    const y = addDays(ymd(), -1), old = addDays(ymd(), -5);
    Store.set('nutrition', { [old]: { weight: 80, entries: [] }, [y]: { entries: [{ id: 'e', name: 'Oats', kcal: 300 }] } });
    Store.set('mealPlan', { [y]: [{ id: 'm', text: 'Soup' }], [ymd()]: [{ id: 'l', text: 'Sandwiches', slot: 'lunch' }] }); render();
  });
  await expect(chip('nutrition')).toHaveText('2 no food logged and no weigh-in today');
  await expect(chip('recipes')).toHaveText('1 no dinner planned today');
  // Several missed days still count once: nothing carries over.
  expect(await page.evaluate(() => NAV_COUNTS.nutrition().n + NAV_COUNTS.recipes().n)).toBe(3);
  await page.evaluate(() => {
    const n = Store.get('nutrition'); n[ymd()] = { weight: 79.5, entries: [{ id: 'e2', name: 'Eggs', kcal: 150 }] };
    Store.get('mealPlan')[ymd()].push({ id: 'd', text: 'Tacos' }); render();
  });
  for (const view of ['nutrition', 'recipes']) await expect(chip(view)).toHaveCount(0);

  // On a phone the menu is closed, so its button carries the dot.
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#menu-dot')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open menu (items need attention)' })).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('on a touch screen every field is large enough that the phone does not zoom in', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  const page = await context.newPage();
  await open(page);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  const views = await page.evaluate(() => VIEWS.filter(v => v.id).map(v => v.id));
  const small = [];
  for (const id of [...views, 'settings']) {
    await page.evaluate(v => (v === 'settings' ? openSettings() : go(v)), id);
    small.push(...await page.evaluate(v => [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden]), select, textarea')]
      .filter(el => parseFloat(getComputedStyle(el).fontSize) < 16).map(el => `${v}: ${el.name || el.id || el.placeholder || el.tagName}`), id));
    if (id !== 'settings') expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id} scrolls sideways`).toBe(true);
  }
  expect(small).toEqual([]);
  await context.close();
});

test('on a touch screen, buttons and tabs are finger-sized and no text is under 12px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await open(page);
  const problems = [];
  for (const id of await page.evaluate(() => VIEWS.filter(v => v.id).map(v => v.id))) {
    await page.evaluate(v => go(v), id);
    problems.push(...await page.evaluate(v => {
      const shown = [...document.querySelectorAll('#view .btn, #view .tab, #view button.chip, header .btn')].filter(e => e.getBoundingClientRect().height > 0);
      const small = shown.filter(e => e.getBoundingClientRect().height < (e.matches('.chip') ? 34 : 36) - 0.5).map(e => `${v}: "${e.textContent.trim().slice(0, 30)}" ${Math.round(e.getBoundingClientRect().height)}px`);
      const tiny = [...document.querySelectorAll('#view *')].filter(e => !e.childElementCount && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 12).map(e => `${v}: text "${e.textContent.trim().slice(0, 30)}"`);
      return [...small, ...tiny];
    }, id));
  }
  expect(problems).toEqual([]);
  await context.close();
});

test('section tabs can be hidden and shown again, but never all of them', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => { ui.recTab = 'grocery'; go('recipes'); });
  const tab = id => page.locator(`#view [data-action="setTab"][data-key="recTab"][data-val="${id}"]`);
  await expect(tab('grocery')).toHaveAttribute('aria-pressed', 'true');
  await page.click('#view [data-action="tabsEdit"][data-key="recTab"]');
  const box = id => page.locator(`#modal [data-change="tabsToggle"][data-val="${id}"]`);
  await box('grocery').uncheck();
  await page.click('#modal button:has-text("Done")');
  await expect(tab('grocery')).toHaveCount(0);
  await expect(tab('recipes')).toHaveAttribute('aria-pressed', 'true'); // a hidden tab that was open falls back to the first
  expect(await page.evaluate(() => S.hiddenTabs.recTab)).toEqual(['grocery']);

  // Every tab cannot be hidden.
  await page.click('#view [data-action="tabsEdit"][data-key="recTab"]');
  for (const id of ['recipes', 'plan']) await box(id).uncheck();
  await box('pantry').click(); // refused: it is the last one
  await expect(box('pantry')).toBeChecked();
  await box('grocery').check();
  await page.click('#modal button:has-text("Done")');
  await expect(tab('grocery')).toHaveCount(1);
  expect(errors, errors.join('\n')).toEqual([]);
});
