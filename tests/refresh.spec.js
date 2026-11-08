// Phase 1 of the refresh: a set row that fits a phone, RPE hidden until turned on, exercise tools behind ⋯,
// notes behind "Add note", the Nutrition day bar, tabs that fit, one row of recipe filters, the slim backup
// reminder, calories left as the big number, and 44px fields and buttons on touch screens.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const APP = pathToFileURL(path.resolve('index.html')).href;
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('dialog', d => d.accept());
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  await page.evaluate(() => A.helpDismiss({ dataset: { what: 'tour' } }));
  return errors;
}
// Two made-up past workouts so the logger has a Previous column to show.
const history = async () => {
  const s = new Date(); s.setDate(s.getDate() - 2); s.setHours(7, 0, 0, 0);
  const sets = Array.from({ length: 3 }, () => ({ type: 'normal', weight: 82.5, reps: 8 }));
  Store.set('workouts', [{ id: 'w1', name: 'Push', start: s.toISOString(), end: new Date(s.getTime() + 36e5).toISOString(), exercises: [{ name: 'Bench Press (Barbell)', sets }, { name: 'Overhead Press (Barbell)', sets }] }]);
  S.unit = 'kg';
  await startWorkout({ name: 'Push', exercises: ['Bench Press (Barbell)', 'Overhead Press (Barbell)'].map(name => ({ id: uid(), name, notes: '', ss: false, rest: 90, targetReps: '', sets: [blankSet(), blankSet(), blankSet()] })) });
};

test('the set row fits a phone: no RPE column until it is turned on, Previous on one line, nothing clipped', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(history);
  const card = page.locator('#view .card').filter({ hasText: 'Bench Press (Barbell)' }).first();
  await expect(card.locator('[data-f="rpe"]')).toHaveCount(0);
  await expect(card.locator('[data-action="awFillPrev"]').first()).toContainText('82.5×8');
  // A weight like 182.5 shows in full, and every row control is at least 44px tall.
  const fit = await card.locator('[data-f="weight"]').first().evaluate(el => { el.value = '182.5'; return { fits: el.scrollWidth <= el.clientWidth, h: el.getBoundingClientRect().height }; });
  expect(fit.fits).toBe(true);
  expect(fit.h).toBeGreaterThanOrEqual(44);
  expect((await card.locator('[data-action="awSetDone"]').first().boundingBox()).height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.querySelector('#view').scrollWidth <= document.querySelector('#view').clientWidth)).toBe(true);
  // Ticking a set still copies last time's numbers.
  await card.locator('[data-action="awSetDone"]').first().click();
  await expect.poll(() => page.evaluate(() => { const s = Store.get('activeWorkout').exercises[0].sets[0]; return [s.weight, s.reps, s.done]; })).toEqual([82.5, 8, true]);
  // RPE appears when it is turned on, and always for an exercise that already has one.
  await page.evaluate(() => { S.rpe = true; render(); });
  await expect(card.locator('[data-f="rpe"]')).toHaveCount(3);
  await page.evaluate(() => { S.rpe = false; Store.get('activeWorkout').exercises[1].sets[0].rpe = 8; render(); });
  await expect(page.locator('#view [data-f="rpe"]')).toHaveCount(3);
  await expect(card.locator('[data-f="rpe"]')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('exercise tools live behind ⋯, and notes open from Add note', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(history);
  const names = () => page.evaluate(() => Store.get('activeWorkout').exercises.map(e => e.name));
  await expect(page.locator('#view [data-action="awMoveEx"]')).toHaveCount(0);
  await page.click('#view [data-action="awExMenu"][data-i="0"]');
  await expect(page.locator('#modal [data-do="awMoveEx"][data-d="-1"]')).toHaveCount(0); // the first one can't move up
  await page.click('#modal [data-do="awMoveEx"][data-d="1"]');
  await expect(page.locator('#modal')).toBeHidden();
  expect(await names()).toEqual(['Overhead Press (Barbell)', 'Bench Press (Barbell)']);
  await page.click('#view [data-action="awExMenu"][data-i="0"]');
  await page.click('#modal [data-do="awLink"]');
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].ss)).toBe(true);
  await page.click('#view [data-action="awExMenu"][data-i="1"]');
  await page.click('#modal [data-do="awDelEx"]');
  expect(await names()).toEqual(['Overhead Press (Barbell)']);
  // Notes: a link until there is one, then the field, focused.
  await expect(page.locator('#view [data-input="awExNote"]')).toHaveCount(0);
  await page.click('#view [data-action="awNoteOpen"][data-i="0"]');
  await expect(page.locator('#view [data-input="awExNote"][data-i="0"]')).toBeFocused();
  await page.keyboard.type('Pause at the bottom');
  await page.click('#view [data-action="awNoteOpen"]:not([data-i])');
  await expect(page.locator('#view textarea[data-f="notes"]')).toBeFocused();
  await page.evaluate(() => render());
  await expect(page.locator('#view [data-input="awExNote"][data-i="0"]')).toHaveValue('Pause at the bottom');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('the Nutrition day bar names the day, and copying days lives behind ⋯', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    const y = addDays(ymd(), -1);
    Store.set('nutrition', { [y]: { entries: [{ id: 'e1', name: 'Oats', cal: 300, p: 10, c: 54, f: 5, meal: 'breakfast' }] } });
    go('nutrition');
  });
  const bar = page.locator('#view label:has([data-change="nutDate"])');
  await expect(bar).toContainText('Today ·');
  const row = await bar.evaluate(el => { const r = el.parentElement; return r.scrollWidth <= r.clientWidth; });
  expect(row).toBe(true);
  await page.click('#view [data-action="nutDayMenu"]');
  await expect(page.locator('#modal [data-do="dayCopy"]')).toBeDisabled(); // nothing logged today yet
  await page.click('#modal [data-do="nutCopyPrev"]');
  await expect(page.locator('#modal')).toBeHidden();
  expect(await page.evaluate(() => day(ymd()).entries.map(e => e.name))).toEqual(['Oats']);
  // Copy this day, go back a day, paste it there.
  await page.click('#view [data-action="nutDayMenu"]');
  await page.click('#modal [data-do="dayCopy"]');
  await page.click('#view [data-action="nutShift"][data-d="-1"]');
  await expect(bar).toContainText('Yesterday ·');
  await page.click('#view [data-action="clipPaste"]');
  expect(await page.evaluate(() => day(addDays(ymd(), -1)).entries.length)).toBe(2);
  // Choosing a date in the picker moves to it.
  await page.locator('#view [data-change="nutDate"]').fill('2026-01-15');
  await expect(bar).toContainText('Jan 15');
  await page.click('#view [data-action="nutToday"]');
  await expect(bar).toContainText('Today ·');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('tabs fit a phone, the Workouts row fades while there is more, and recipe filters take one row', async ({ page }) => {
  const errors = await open(page);
  const tabRow = () => page.evaluate(() => { const g = document.querySelector('#view .tabs-row'); return { fits: g.scrollWidth <= g.clientWidth, fade: g.classList.contains('tabs-fade') }; });
  for (const v of ['nutrition', 'recipes']) { await page.evaluate(v => go(v), v); expect(await tabRow()).toEqual({ fits: true, fade: false }); }
  await page.evaluate(() => go('fitness'));
  expect(await tabRow()).toEqual({ fits: false, fade: true });
  await page.evaluate(() => { const g = document.querySelector('#view .tabs-row'); g.scrollLeft = g.scrollWidth; g.dispatchEvent(new Event('scroll')); });
  expect((await tabRow()).fade).toBe(false);
  // The short phone label shows, the full label is there for wider screens.
  await page.evaluate(() => go('nutrition'));
  await expect(page.locator('#view [data-action="setTab"][data-val="trend"]')).toHaveText(/Body/);
  // Recipes: the filters scroll sideways in one row next to the sort menu.
  await page.evaluate(() => { Store.get('recipes').forEach((r, i) => { r.tags = ['Quick', 'High Protein', `Tag ${i}`, 'Batch', 'Spicy', 'Comfort']; }); go('recipes'); });
  const chips = await page.evaluate(() => { const g = document.querySelector('#view [aria-label="Filter recipes"]'); const tops = new Set([...g.querySelectorAll('.chip')].map(c => Math.round(c.getBoundingClientRect().top))); return tops.size; });
  expect(chips).toBe(1);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('the backup reminder is one line, and Later puts it off for a week', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => { Store.set('nutrition', { [ymd()]: { weight: 80, entries: [] } }); go('dashboard'); });
  const note = page.locator('#view [role="note"]');
  await expect(note).toContainText('No backup yet');
  expect((await note.boundingBox()).height).toBeLessThan(80);
  await note.locator('[data-action="backupLater"]').click();
  await expect(note).toHaveCount(0);
  expect(await page.evaluate(() => S.backupLater)).toBe(await page.evaluate(() => ymd()));
  await page.evaluate(() => { S.backupLater = addDays(ymd(), -8); render(); });
  await expect(note).toHaveCount(1);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('calories left is the big number by default, and Settings can switch it to eaten', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => { S.targets.cal = 2000; Store.set('nutrition', { [ymd()]: { entries: [{ id: 'e1', name: 'Rice bowl', cal: 650, p: 40, c: 80, f: 15, meal: 'lunch' }] } }); go('nutrition'); });
  const ring = page.locator('#view div.relative.shrink-0').first();
  await expect(ring).toContainText('1,350');
  await expect(ring).toContainText('kcal left');
  await expect(ring).toContainText('650 eaten');
  await page.evaluate(() => openSettings());
  await page.selectOption('#modal select[name="calBig"]', 'eaten');
  await page.selectOption('#modal select[name="rpe"]', '1');
  await page.click('#modal button:has-text("Save settings")');
  expect(await page.evaluate(() => [S.calBig, S.rpe])).toEqual(['eaten', true]);
  await expect(ring).toContainText('of 2,000 kcal');
  await expect(ring).toContainText('1,350 left');
  // Over the target, the big number says so.
  await page.evaluate(() => { S.calBig = 'left'; day(ymd()).entries[0].cal = 2300; render(); });
  await expect(ring).toContainText('300');
  await expect(ring).toContainText('kcal over');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('on a touch screen, fields and buttons are 44px tall, with 16px text in fields', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => go('nutrition'));
  const sizes = await page.evaluate(() => {
    const f = document.querySelector('#view input.input:not([type=checkbox])'), b = document.querySelector('#view .btn-sm, #view .btn');
    return { font: parseFloat(getComputedStyle(f).fontSize), field: f.getBoundingClientRect().height, button: b.getBoundingClientRect().height };
  });
  expect(sizes.font).toBeGreaterThanOrEqual(16);
  expect(sizes.field).toBeGreaterThanOrEqual(44);
  expect(sizes.button).toBeGreaterThanOrEqual(44);
  expect(errors, errors.join('\n')).toEqual([]);
});
