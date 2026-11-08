// Phone-first: dashboard cards in the person's order, the bottom bar and its + button, the Today card,
// and on a phone the Log food button and recent foods come before everything else in Nutrition.
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

test('dashboard cards follow the order chosen in the card picker, and the order is kept and synced', async ({ page }) => {
  const errors = await open(page);
  const first = () => page.$$eval('#view .card > div:first-child > h3', hs => hs.map(h => h.textContent.trim()));
  expect((await first()).slice(0, 2)).toEqual(['Today', 'Nutrition today']);

  await page.click('#view [data-action="dashCardsEdit"]');
  // Meals moves up four places, to the top; the button keeps focus while it moves.
  for (let i = 0; i < 4; i++) await page.click('#modal [data-action="dashCardMove"][data-val="meals"][data-d="-1"]');
  await expect(page.locator('#modal [data-action="dashCardMove"][data-val="meals"][data-d="-1"]')).toBeDisabled();
  expect(await page.evaluate(() => document.activeElement?.dataset?.val)).toBe('meals');
  await page.locator('#modal [data-change="dashCardToggle"][data-val="weight"]').uncheck();
  await page.click('#modal button:has-text("Done")');
  expect((await first()).slice(0, 4)).toEqual(['Meals', 'Today', 'Nutrition today', 'Training']);

  await page.reload();
  await page.waitForFunction(() => typeof S !== 'undefined' && Store.data);
  expect(await page.evaluate(() => [S.cardOrder.slice(0, 2), S.hiddenCards, SYNC_SETTINGS.includes('cardOrder')])).toEqual([['meals', 'today'], ['weight'], true]);
  // A card the saved order doesn't know yet (from a newer version) still appears, at the end.
  expect(await page.evaluate(() => { S.cardOrder = ['meals', 'gone']; return dashOrder(); })).toEqual(['meals', 'today', 'nutrition', 'weight', 'training']);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('on a phone, Nutrition starts with Log food and one-tap recent foods', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await open(page);
  await page.evaluate(() => {
    Store.set('foods', [{ id: 'f-oats', name: 'Rolled oats', basis: '100g', base: { cal: 380, p: 13, c: 67, f: 7 }, extra: [], uses: 3, lastUsed: new Date().toISOString(), lastQty: 1, lastUnit: '100g' }]);
    go('nutrition');
  });
  const log = page.locator('#view [data-action="lfOpen"]').first();
  await expect(log).toHaveText(/Log food/);
  expect((await log.boundingBox()).y).toBeLessThan(300);
  await page.click('#view [aria-label="Add Rolled oats again"]');
  expect(await page.evaluate(() => (Store.get('nutrition')[ymd()]?.entries || []).map(e => e.name))).toEqual(['Rolled oats']);
  await log.click();
  await expect(page.locator('#modal')).toBeVisible();

  // On a wide screen the Quick add card on the right already does this, so the phone bar is hidden.
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator('#view [data-action="lfOpen"]:has-text("Log food")')).toBeHidden();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('on a phone, the bottom bar holds four sections with quick adds in the header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await open(page);
  const bar = page.locator('#bottom-bar');
  await expect(bar).toBeVisible();
  expect(await bar.locator('.bar-item').allInnerTexts()).toEqual(['Dashboard', 'Workouts', 'Nutrition', 'Meals']);
  await expect(bar.locator('[aria-current="page"]')).toHaveText('Dashboard');
  await bar.locator('[data-view="recipes"]').click();
  await expect(bar.locator('[aria-current="page"]')).toHaveText('Meals');
  // The bar sits below the scrolling view, so it never covers the last thing on the page.
  const [viewBox, barBox] = await Promise.all([page.locator('#view').boundingBox(), bar.boundingBox()]);
  expect(viewBox.y + viewBox.height).toBeLessThanOrEqual(barBox.y + 1);

  await page.locator('#header-tools [data-action="quickAdd"]').click();
  expect(await page.locator('#modal [data-action="qaPick"]').allInnerTexts()).toEqual(['Food', 'Weight', 'Workout', 'Recipe from a link']);
  await page.click('#modal [data-what="weight"]');
  await page.fill('#qa-weight', '181.4');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => round(toUnit(Store.get('nutrition')[ymd()].weight), 1))).toBe(181.4);

  // Food, a workout and a recipe link open their usual screens; food goes to today.
  await page.locator('#header-tools [data-action="quickAdd"]').click();
  await page.click('#modal [data-what="food"]');
  await expect(page.locator('#modal')).toContainText('Add to');
  expect(await page.evaluate(() => ui.lf.date === ymd())).toBe(true);
  await page.keyboard.press('Escape');
  await page.locator('#header-tools [data-action="quickAdd"]').click();
  await page.click('#modal [data-what="workout"]');
  await expect(bar.locator('[aria-current="page"]')).toHaveText('Workouts');
  await page.locator('#header-tools [data-action="quickAdd"]').click();
  await page.click('#modal [data-what="link"]');
  await expect(page.locator('#modal h3')).toHaveText('Save a recipe from a link');
  await page.keyboard.press('Escape');

  // The chosen order is preserved at every width.
  await page.evaluate(() => { S.bar = ['recipes', 'nutrition', 'fitness', 'dashboard']; render(); });
  expect(await bar.locator('.bar-item').allInnerTexts()).toEqual(['Meals', 'Nutrition', 'Workouts', 'Dashboard']);
  await page.evaluate(() => { S.bar = ['tasks', 'tasks', 'nope', 'family']; render(); });
  expect(await bar.locator('.bar-item').allInnerTexts()).toEqual(['Dashboard', 'Workouts', 'Nutrition', 'Meals']);
  expect(await page.evaluate(() => SYNC_SETTINGS.includes('bar'))).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(bar).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('the Today card gathers the workout, food so far, the weigh-in and dinner', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    const t = ymd(), s = new Date(); s.setHours(7, 0, 0, 0);
    Store.set('workouts', [{ id: 'w1', name: 'Push', start: s.toISOString(), end: new Date(s.getTime() + 36e5).toISOString(), exercises: [{ name: 'Bench Press', sets: [{ type: 'normal', weight: 60, reps: 8 }] }] }]);
    Store.set('nutrition', { [t]: { weight: 80, entries: [{ id: 'e1', name: 'Oats', cal: 500, p: 30, c: 60, f: 10, meal: 'breakfast' }] } });
    Store.set('mealPlan', { [t]: [{ id: 'p1', text: 'Chicken tacos', slot: 'dinner' }] });
    sortWorkouts(); go('dashboard');
  });
  const card = page.locator('#view .card').filter({ has: page.locator('h3', { hasText: /^Today$/ }) });
  await expect(card).toContainText('Push ✓');
  // Calories left is the default; Settings can switch to calories eaten.
  await expect(card).toContainText('1,900 kcal left', { useInnerText: true });
  await expect(card).toContainText('150 g protein to go');
  await page.evaluate(() => { S.calBig = 'eaten'; render(); });
  await expect(card).toContainText('500 of', { useInnerText: true });
  await expect(card).toContainText('30 of');
  await expect(card).toContainText('✓', { useInnerText: true });
  await expect(card).toContainText('Chicken tacos');
  await page.evaluate(() => { Store.set('nutrition', {}); render(); });
  await expect(card).toContainText('Nothing logged yet');
  await expect(card).toContainText('No weigh-in logged today');
  // The card can be hidden like any other.
  await page.evaluate(() => { S.hiddenCards = ['today']; render(); });
  await expect(page.locator('#view h3', { hasText: /^Today$/ })).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('a long food name never makes a page wider than a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const errors = await open(page);
  const wide = await page.evaluate(() => {
    const name = 'Pork, fresh, shoulder, (boston butt), blade (steaks), separable lean and fat, raw';
    Store.set('foods', [{ id: 'long', name, basis: '100g', base: { cal: 250, p: 20, c: 0, f: 18 }, extra: [], uses: 9, lastUsed: new Date().toISOString(), lastQty: 1, lastUnit: '100g' }]);
    Store.set('nutrition', { [ymd()]: { entries: [{ id: 'e1', name, cal: 250, p: 20, c: 0, f: 18, meal: 'lunch' }] } });
    const out = {};
    for (const v of VIEWS.filter(x => x.id)) { go(v.id); renderNow(); const m = document.querySelector('#view'); out[v.id] = m.scrollWidth - m.clientWidth; }
    return out;
  });
  expect(Object.entries(wide).filter(([, n]) => n > 0)).toEqual([]);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('in a workout on a phone, times type like a microwave, and the top bar and rest timer stay small', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await open(page);
  expect(await page.evaluate(() => ['45', '90', '130', '0130', '1500', '10000', '1:30', '2 min', '90s', '1h', '', '0'].map(parseTimeEntry)))
    .toEqual([45, 90, 90, 90, 900, 3600, 90, 120, 90, 3600, null, null]);
  await page.evaluate(async () => {
    await A.startEmpty(); const aw = Store.get('activeWorkout');
    aw.exercises.push({ id: uid(), name: 'Plank', notes: '', sets: [blankSet()] }); Store.save('activeWorkout'); render();
  });
  const time = page.locator('#view input[data-f="duration"]').first();
  await time.fill('130');
  expect(await page.evaluate(() => workoutDraftValues(Store.get('activeWorkout').exercises[0].sets[0]).duration)).toBe(90);
  await page.evaluate(() => render());
  await expect(time).toHaveValue('130'); // draft text stays intact until explicit acceptance
  await page.getByRole('button', { name: 'Complete set', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toBeVisible();
  await expect(time).toHaveValue('1:30');
  const bar = page.locator('[data-wctx="active"] > .card').first();
  expect((await bar.boundingBox()).height).toBeLessThan(120);
  await page.locator('[data-action="workoutOptions"]').click();
  await expect(page.locator('#modal [data-do="awDiscard"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.evaluate(() => Timer.start(90));
  const timer = page.locator('#timer > div');
  expect((await timer.boundingBox()).height).toBeLessThan(60);
  await expect(timer.locator('[data-action="timerStop"]')).toBeVisible();
  await page.evaluate(() => { Timer.stop(); Timer.visible = false; Timer.draw(); });
  expect(errors, errors.join('\n')).toEqual([]);
});
