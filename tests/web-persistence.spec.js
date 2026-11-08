import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const APP = pathToFileURL(path.resolve('index.html')).href;
async function open(page) {
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.recipes && typeof WebWrites !== 'undefined');
  await page.evaluate(async () => { await Store.flushDirty(); A.helpDismiss({ dataset: { what: 'tour' } }); });
}
async function workout(page) {
  await page.evaluate(async () => {
    S.unit = 'kg';
    await startWorkout({ id: 'synthetic-web', name: 'Synthetic session', exercises: [{ id: 'exercise-a', name: 'Squat', rest: 90, sets: [{ id: 'set-a', type: 'normal', weight: 40, reps: 5, done: false }] }] });
  });
}
test('completion intent survives abort and reopening, then retries exactly once before finish', async ({ page }) => {
  await open(page); await workout(page);
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value, key) {
      const request = put.apply(this, arguments);
      if (this.name === 'kv' && key === 'activeWorkout' && value?.exercises?.[0]?.sets?.[0]?.done) this.transaction.abort();
      return request;
    };
  });
  await page.getByRole('button', { name: 'Complete set', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeVisible();
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0].done)).toBe(false);
  expect(await page.evaluate(async () => (await Store.read('activeWorkout')).exercises[0].sets[0].done)).toBe(false);
  await page.reload(); await page.waitForFunction(() => typeof WebWrites !== 'undefined' && Store.ready && WebWrites.pending.size === 1);
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0].done)).toBe(false);
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets.map(s => [s.id, s.done]))).toEqual([['set-a', true]]);
  await page.evaluate(async () => { await WebWrites.retry(); await WorkoutCommands.finish(); });
  expect(await page.evaluate(() => [W().map(w => w.id), Store.get('activeWorkout')])).toEqual([['synthetic-web'], null]);
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.workouts?.length);
  expect(await page.evaluate(() => W()[0].exercises[0].sets[0].id)).toBe('set-a');
});
test('unchecked populated sets cannot enter history, drafts stay separate from completed facts', async ({ page }) => {
  await open(page); await workout(page);
  await page.evaluate(() => WorkoutCommands.finish());
  expect(await page.evaluate(() => W().length)).toBe(0);
  await page.getByRole('textbox', { name: 'kg', exact: true }).fill('42.5');
  await page.evaluate(() => Store.flushDirty());
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0])).toMatchObject({ weight: 40, done: false, draft: { weight: '42.5' } });
  await page.getByRole('button', { name: 'Complete set', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toBeVisible();
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0].weight)).toBe(42.5);
});
test('a failed read stops startup without reseeding data', async ({ page }) => {
  await page.addInitScript(() => { const get = IDBObjectStore.prototype.get; IDBObjectStore.prototype.get = function() { if (this.name === 'kv') throw new Error('Synthetic read failure'); return get.apply(this, arguments); }; });
  await page.goto(APP);
  await expect(page.getByRole('heading', { name: 'Could not read saved data' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('bd.seeded'))).toBeNull();
});

test('an unavailable existing IndexedDB is not presented as a fresh fallback install', async ({ page }) => {
  await open(page); await workout(page);
  await page.addInitScript(() => { indexedDB.open = () => { throw new Error('Synthetic blocked saved database'); }; });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Could not read saved data' })).toBeVisible();
});

test('draft values retain their original units when display preferences change', async ({ page }) => {
  await open(page); await workout(page);
  await page.evaluate(async () => {
    const set = Store.get('activeWorkout').exercises[0].sets[0];
    S.unit = 'lbs'; setWorkoutDraft(set, 'weight', '100.125'); Store.save('activeWorkout'); await Store.flushDirty();
    S.unit = 'kg'; saveSettings(); render();
  });
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.get('activeWorkout'));
  await page.getByRole('button', { name: 'Complete set', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toBeVisible();
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0].weight)).toBeCloseTo(100.125 * .45359237, 10);
});

test('a surviving receipt prevents replay of an older acknowledged candidate over newer data', async ({ page }) => {
  await open(page); await workout(page);
  await page.getByRole('button', { name: 'Complete set', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toBeVisible();
  await page.evaluate(async () => {
    const old = structuredClone(Store.get('activeWorkout'));
    const [, receipt] = (await idbEntries('local')).find(([key, value]) => key.startsWith('bd.web.receipt.') && value.purpose === 'complete-set');
    const changed = structuredClone(old); changed.exercises[0].sets[0].weight = 45.125;
    await WebWrites.command({ activeWorkout: changed }, 'amend-set');
    await LocalDb.put('bd.web.intent.' + receipt.id, { version: 1, id: receipt.id, purpose: 'complete-set', values: { activeWorkout: old }, expected: {}, extra: {} });
  });
  await page.reload(); await page.waitForFunction(() => typeof WebWrites !== 'undefined' && Store.ready && WebWrites.pending.size === 1);
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0].weight)).toBe(45.125);
});

test('a superseded operation cannot acknowledge its older candidate as current data', async ({ page }) => {
  await open(page); await workout(page);
  const result = await page.evaluate(async () => {
    const saved = structuredClone(Store.get('activeWorkout')), candidate = structuredClone(saved); candidate.name = 'Superseded synthetic candidate';
    const intent = { version: 1, id: 'synthetic-superseded', purpose: 'start', values: { activeWorkout: candidate }, expected: { activeWorkout: await webDigest(saved) }, extra: {} };
    await LocalDb.put('bd.web.receipt.' + intent.id, { version: 1, id: intent.id, purpose: intent.purpose, canceled: true, at: new Date().toISOString() }); WebWrites.pending.set(intent.id, intent);
    let rejected = false; try { await WebWrites.command(intent.values, intent.purpose); } catch { rejected = true; }
    return [rejected, Store.get('activeWorkout').name, (await Store.read('activeWorkout')).name, WebWrites.pending.size];
  });
  expect(result).toEqual([true, 'Synthetic session', 'Synthetic session', 0]);
});
