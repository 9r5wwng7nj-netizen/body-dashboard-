// Day-to-day behavior: projected navigation counts, retained old preferences and phone input.
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
  await page.evaluate(() => A.helpDismiss({ dataset: { what: 'tour' } })); // the start-here card has its own test
  return errors;
}
test('projected navigation retains today-only attention counts without a fourth Meals root', async ({ page }) => {
  const errors = await open(page);
  const chip = view => page.locator(`#bottom-bar [data-view="${view}"] .nav-count`);
  await expect(page.locator('#bottom-bar .nav-count')).toHaveCount(0);
  // Every menu item can carry a count, whether or not it has anything to count yet.
  expect(await page.evaluate(() => VIEWS.filter(v => v.id).every(v => typeof NAV_COUNTS[v.id] === 'function'))).toBe(true);
  await expect(page.locator('#help-dot')).toBeHidden();

  // A workout in progress shows a dot.
  await page.evaluate(() => { Store.set('activeWorkout', { id: 'w', name: 'Workout', start: new Date().toISOString(), exercises: [] }); render(); });
  await expect(page.locator('#bottom-bar [data-view="fitness"]')).toContainText('workout in progress');

  // Daily checks: quiet until that part of the app has been used, then about today only.
  for (const view of ['nutrition', 'recipes', 'dashboard']) await expect(chip(view)).toHaveCount(0);
  await page.evaluate(() => {
    const y = addDays(ymd(), -1), old = addDays(ymd(), -5);
    Store.set('nutrition', { [old]: { weight: 80, entries: [] }, [y]: { entries: [{ id: 'e', name: 'Oats', kcal: 300 }] } });
    Store.set('mealPlan', { [y]: [{ id: 'm', text: 'Soup' }], [ymd()]: [{ id: 'l', text: 'Sandwiches', slot: 'lunch' }] }); render();
  });
  await expect(chip('nutrition')).toHaveText('2');
  await expect(page.locator('#bottom-bar [data-view="recipes"]')).toHaveCount(0);
  expect(await page.evaluate(() => NAV_COUNTS.recipes().n)).toBe(1);
  // Several missed days still count once: nothing carries over.
  expect(await page.evaluate(() => NAV_COUNTS.nutrition().n + NAV_COUNTS.recipes().n)).toBe(3);
  await page.evaluate(() => {
    const n = Store.get('nutrition'); n[ymd()] = { weight: 79.5, entries: [{ id: 'e2', name: 'Eggs', kcal: 150 }] };
    Store.get('mealPlan')[ymd()].push({ id: 'd', text: 'Tacos' }); render();
  });
  for (const view of ['nutrition', 'recipes']) await expect(chip(view)).toHaveCount(0);

  // On a phone the menu is closed, so its button carries the dot.
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#bottom-bar [data-view="fitness"] .bar-badge')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Settings & Sync', exact: true })).toBeVisible();
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

test('legacy hidden page preferences remain intact while named pages and retired notices stay reachable', async ({ page }) => {
  const errors = await open(page);
  const hidden = await page.evaluate(() => {
    S.hiddenTabs = { fitTab: ['history', 'library'], nutTab: ['foods', 'trend'], recTab: ['grocery', 'pantry'] };
    saveSettings(); return structuredClone(S.hiddenTabs);
  });
  for (const route of [
    { action: 'trainPage', page: 'history', title: 'Workout history' },
    { action: 'trainPage', page: 'library', title: 'Exercise library' },
    { action: 'nutPage', page: 'library', title: 'Library' },
    { action: 'nutPage', page: 'body', title: 'Weight & measurements' }
  ]) {
    await page.evaluate(route => A[route.action]({ dataset: { page: route.page } }), route);
    await expect(page.locator('#view-title')).toHaveText(route.title);
    await expect(page.locator('#view .tabs-row')).toHaveCount(0);
  }
  for (const tab of ['grocery', 'pantry', 'freezer']) {
    await page.evaluate(tab => { ui.recTab = tab; go('recipes'); }, tab);
    await expect(page.locator('#view')).toContainText('retired');
  }
  expect(await page.evaluate(() => S.hiddenTabs)).toEqual(hidden);
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready);
  expect(await page.evaluate(() => S.hiddenTabs)).toEqual(hidden);
  await expect(page.locator('#view')).not.toBeEmpty();
  expect(errors, errors.join('\n')).toEqual([]);
});
