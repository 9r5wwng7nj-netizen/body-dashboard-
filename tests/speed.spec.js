// Step 2 of the refresh, logging speed: bottom sheets on phones, Log food with the meal on top, Recent and
// Usual lists, ticking several foods to add at once, portion chips, Same as yesterday per meal, +/− for the
// next set, the rest timer as a bar on phones, and the screen kept on during a workout.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const APP = pathToFileURL(path.resolve('index.html')).href;
const phone = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };

async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('dialog', d => d.accept());
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  await page.evaluate(() => A.helpDismiss({ dataset: { what: 'tour' } }));
  return errors;
}
// Made-up saved foods and yesterday's breakfast.
const foods = () => {
  const now = new Date().toISOString(), y = addDays(ymd(), -1);
  Store.set('foods', [
    { id: 'f1', name: 'Greek yogurt', basis: '100g', base: { cal: 88, p: 9, c: 4, f: 2 }, extra: [], uses: 9, lastUsed: now, lastQty: 170, lastUnit: 'g' },
    { id: 'f2', name: 'Oats', basis: '100g', base: { cal: 375, p: 13, c: 67, f: 7 }, extra: [], uses: 7, lastUsed: now, lastQty: 80, lastUnit: 'g' },
    { id: 'f3', name: 'Rice', basis: '100g', base: { cal: 130, p: 3, c: 28, f: 0 }, extra: [], uses: 3, lastUsed: new Date(Date.now() - 864e5).toISOString(), lastQty: 200, lastUnit: 'g' }]);
  Store.set('nutrition', { [y]: { entries: [
    { id: 'e1', name: 'Oats', cal: 300, p: 10, c: 54, f: 5, meal: 'breakfast', foodId: 'f2', qty: 80, unit: 'g' },
    { id: 'e2', name: 'Rice', cal: 260, p: 6, c: 56, f: 0, meal: 'lunch', foodId: 'f3', qty: 200, unit: 'g' },
    { id: 'e3', name: 'Rice', cal: 260, p: 6, c: 56, f: 0, meal: 'lunch', foodId: 'f3', qty: 200, unit: 'g' }] } });
  go('nutrition');
};

test.describe('on a phone', () => {
  test.use(phone);

  test('dialogs rise from the bottom, and dragging the handle down closes them', async ({ page }) => {
    const errors = await open(page);
    await page.evaluate(() => openSettings());
    const dialog = page.locator('#modal [role="dialog"]');
    await dialog.evaluate(d => Promise.all(d.getAnimations().map(a => a.finished))); // it slides up first
    const box = await dialog.boundingBox();
    expect(Math.round(box.y + box.height)).toBe(844);
    expect(Math.round(box.width)).toBe(390);
    await expect(page.locator('#modal .sheet-grab')).toBeVisible();
    // A short drag springs back; a long one closes.
    const drag = dy => page.evaluate(dy => {
      const h = document.querySelector('#modal .sheet-grab'), t = y => new Touch({ identifier: 1, target: h, clientX: 195, clientY: y });
      h.dispatchEvent(new TouchEvent('touchstart', { touches: [t(100)], bubbles: true }));
      h.dispatchEvent(new TouchEvent('touchmove', { touches: [t(100 + dy)], bubbles: true }));
      h.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
    }, dy);
    await drag(40);
    await expect(dialog).toBeVisible();
    await drag(160);
    await expect(page.locator('#modal')).toBeHidden();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('Log food: the meal on top, Recent and Usual lists, and ticking several foods adds them together', async ({ page }) => {
    const errors = await open(page);
    await page.evaluate(foods);
    await page.evaluate(() => lfOpen('breakfast'));
    const modal = page.locator('#modal');
    await expect(modal.locator('[data-action="lfMeal"][aria-pressed="true"]')).toHaveText('Breakfast');
    await modal.locator('[data-action="lfMeal"][data-v="lunch"]').click();
    await expect(modal.locator('h3').first()).toContainText('Add to Lunch');
    // Recent: most recently used first. Usual for lunch: what was logged for lunch most often.
    await expect(modal.locator('#lf-results [data-action="lfPick"]').first()).toContainText('Greek yogurt');
    await modal.locator('[data-action="lfList"][data-v="usual"]').click();
    await expect(modal.locator('#lf-results [data-action="lfPick"]').first()).toContainText('Rice');
    // Tick two, add both at their last amounts.
    await modal.locator('[data-action="lfTick"][data-id="f3"]').click();
    await expect(modal.locator('#lf-addn')).toHaveText('Add 1 to Lunch');
    await modal.locator('[data-action="lfList"][data-v="recent"]').click();
    await modal.locator('[data-action="lfTick"][data-id="f1"]').click();
    await expect(modal.locator('[data-action="lfTick"][data-id="f1"]')).toHaveAttribute('aria-pressed', 'true');
    await modal.locator('#lf-addn').click();
    await expect(modal).toBeHidden();
    expect(await page.evaluate(() => day(ymd()).entries.map(e => [e.name, e.meal, e.qty, e.unit, e.cal]))).toEqual([['Rice', 'lunch', 200, 'g', 260], ['Greek yogurt', 'lunch', 170, 'g', 150]]);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('portion chips set ½, 1, 1½ or 2 of the usual amount', async ({ page }) => {
    const errors = await open(page);
    await page.evaluate(foods);
    await page.evaluate(() => { lfOpen('breakfast'); A.lfTick({ dataset: { id: 'f2' } }); });
    await page.locator('#modal [data-action="lfPick"][data-id="f1"]').click();
    await expect(page.locator('#modal #lf-addn')).toBeHidden(); // choosing an amount, the multi-add button steps aside
    await expect(page.locator('#lf-portions')).toContainText('Portions of 170 g');
    await expect(page.locator('#lf-portions [data-m="1"]')).toHaveClass(/chip-on/);
    await page.locator('#lf-portions [data-m="1.5"]').click();
    await expect(page.locator('#lf-qty')).toHaveValue('255');
    await expect(page.locator('#lf-portions [data-m="1.5"]')).toHaveClass(/chip-on/);
    await expect(page.locator('#lf-preview')).toContainText('224'); // 255 g × 88 kcal / 100 g
    await page.locator('#lf-qty').fill('100');
    await expect(page.locator('#lf-portions .chip-on')).toHaveCount(0);
    await page.locator('#lf-portions [data-m="0.5"]').click();
    await page.click('#modal [data-action="lfAdd"]');
    expect(await page.evaluate(() => day(ymd()).entries.map(e => [e.name, e.qty]))).toEqual([['Greek yogurt', 85]]);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('an empty meal offers Same as yesterday', async ({ page }) => {
    const errors = await open(page);
    await page.evaluate(foods);
    const same = page.locator('#view [data-action="mealSamePrev"]');
    await expect(same).toHaveCount(2); // breakfast and lunch were logged yesterday
    await page.click('#view [data-action="mealSamePrev"][data-meal="lunch"]');
    expect(await page.evaluate(() => day(ymd()).entries.map(e => [e.name, e.meal]))).toEqual([['Rice', 'lunch'], ['Rice', 'lunch']]);
    await expect(same).toHaveCount(1);
    // Looking at an earlier day, it names the day before.
    await page.click('#view [data-action="nutShift"][data-d="-1"]');
    await page.evaluate(() => { const d = addDays(ymd(), -2); Store.get('nutrition')[d] = { entries: [{ id: 'x', name: 'Eggs', cal: 140, p: 12, c: 1, f: 10, meal: 'dinner' }] }; render(); });
    await expect(page.locator('#view [data-action="mealSamePrev"][data-meal="dinner"]')).toContainText('Same as');
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('+/− change the next set, starting from last time, and the rest timer is a bar above the menu', async ({ page }) => {
    const errors = await open(page);
    await page.evaluate(async () => {
      S.unit = 'lbs';
      const s = new Date(); s.setDate(s.getDate() - 2);
      Store.set('workouts', [{ id: 'w1', name: 'Push', start: s.toISOString(), end: new Date(s.getTime() + 36e5).toISOString(), exercises: [{ name: 'Bench Press (Barbell)', sets: [{ type: 'normal', weight: 175 * LB, reps: 8 }, { type: 'normal', weight: 175 * LB, reps: 8 }] }] }]);
      await startWorkout({ name: 'Push', exercises: [{ id: uid(), name: 'Bench Press (Barbell)', notes: '', ss: false, rest: 90, targetReps: '', sets: [blankSet(), blankSet()] }] });
    });
    const card = page.locator('#view .card').filter({ hasText: 'Bench Press (Barbell)' }).first();
    await card.locator('.set-adjustments > summary').click();
    const step = card.locator('[role="group"][aria-label^="Adjust set"]');
    await expect(step).toContainText('Next: set 1');
    await expect(step).toContainText('175');
    await step.locator('[data-f="weight"][data-d="5"]').click();
    await step.locator('[data-f="reps"][data-d="-1"]').click();
    expect(await page.evaluate(() => { const s = workoutDraftValues(Store.get('activeWorkout').exercises[0].sets[0]); return [round(toUnit(s.weight), 1), s.reps]; })).toEqual([180, 7]);
    await expect(card.locator('[data-f="weight"]').first()).toHaveValue('180');
    // Ticking the set moves the stepper on and starts the rest timer, shown across the screen above the menu.
    await card.locator('[data-action="awSetDone"]').first().click();
    await expect(step).toContainText('Next: set 2');
    const timer = await page.locator('#timer').boundingBox();
    await expect(page.locator('#bottom-bar')).toBeHidden();
    expect(timer.width).toBeGreaterThan(350);
    expect(timer.y + timer.height).toBeLessThanOrEqual(page.viewportSize().height);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test('the screen stays on while a workout in progress is on screen', async ({ page }) => {
  await page.addInitScript(() => {
    window.__wake = [];
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { const l = new EventTarget(); l.release = async () => { window.__wake.push('release'); l.dispatchEvent(new Event('release')); }; window.__wake.push('request'); return l; } } });
  });
  const errors = await open(page);
  await page.evaluate(() => startWorkout(workoutFromRoutine(Store.get('routines')[0])));
  await expect.poll(() => page.evaluate(() => window.__wake)).toEqual(['request']);
  await page.evaluate(() => go('dashboard'));
  await expect.poll(() => page.evaluate(() => window.__wake)).toEqual(['request', 'release']);
  await page.evaluate(() => go('fitness'));
  await expect.poll(() => page.evaluate(() => window.__wake)).toEqual(['request', 'release', 'request']);
  await page.evaluate(() => { Store.set('activeWorkout', null); render(); });
  await expect.poll(() => page.evaluate(() => window.__wake)).toEqual(['request', 'release', 'request', 'release']);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('on a wide screen, dialogs stay in the middle', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = await open(page);
  await page.evaluate(() => openSettings());
  const box = await page.locator('#modal [role="dialog"]').boundingBox();
  expect(box.width).toBeLessThan(900);
  await expect(page.locator('#modal .sheet-grab')).toBeHidden();
  expect(errors, errors.join('\n')).toEqual([]);
});
