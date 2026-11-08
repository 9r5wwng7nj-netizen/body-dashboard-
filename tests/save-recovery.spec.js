import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const APP = pathToFileURL(path.resolve('index.html')).href;
async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Array.isArray(Store.data.recipes));
  await page.evaluate(async () => { A.helpDismiss({ dataset: { what: 'tour' } }); await Store.flushDirty(); });
  return errors;
}

// Abort real IndexedDB transactions for one synthetic collection, while other writes still work.
async function failNutrition(page) {
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    window.restorePut = () => { IDBObjectStore.prototype.put = put; };
    IDBObjectStore.prototype.put = function (value, key) {
      const request = put.apply(this, arguments);
      if (this.name === 'kv' && key === 'nutrition') this.transaction.abort();
      return request;
    };
  });
}

test('an aborted save retains only failed keys, blocks stale adoption, and retry persists across reload', async ({ page }) => {
  const errors = await open(page);
  await failNutrition(page);
  const failed = await page.evaluate(async () => {
    Store.set('nutrition', { '2026-01-15': { weight: 80, entries: [] } });
    Store.set('recipes', [{ id: 'recovery-recipe', title: 'Synthetic soup' }]);
    let rejected = false; try { await Store.flushDirty(); } catch { rejected = true; }
    let adopted = false; const readMany = Store.readMany;
    Store.readMany = function (...args) { adopted = true; return readMany.apply(this, args); };
    let adoptionRejected = false; try { await Sync.adopt(); } catch { adoptionRejected = true; }
    Store.readMany = readMany;
    return { rejected, dirty: [...Store.dirty], failed: [...Store.failed], adoptionRejected, adopted, recipes: await Store.read('recipes') };
  });
  expect(failed).toEqual({ rejected: true, dirty: ['nutrition'], failed: ['nutrition'], adoptionRejected: true, adopted: false, recipes: [{ id: 'recovery-recipe', title: 'Synthetic soup' }] });
  await expect(page.locator('#save-recovery')).toContainText('Keep this tab open');
  await page.evaluate(() => window.restorePut());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.nutrition);
  expect(await page.evaluate(() => [day('2026-01-15').weight, Store.get('recipes')[0].id])).toEqual([80, 'recovery-recipe']);
  expect(errors).toEqual([]);
});

test('a newer edit made during a write is not acknowledged or overwritten by the older snapshot', async ({ page }) => {
  const errors = await open(page);
  const saved = await page.evaluate(async () => {
    const write = Store.write.bind(Store), snapshots = [];
    let unblock, entered;
    const started = new Promise(r => { entered = r; });
    const gate = new Promise(r => { unblock = r; });
    Store.write = async (key, value) => {
      if (key === 'recipes') { snapshots.push(structuredClone(value)); if (snapshots.length === 1) { entered(); await gate; } }
      return write(key, value);
    };
    Store.set('recipes', [{ id: 'r', title: 'First edit' }]);
    const first = Store.flushDirty(); await started;
    Store.get('recipes')[0].title = 'Newest edit'; Store.save('recipes');
    const second = Store.flushDirty(); unblock(); await Promise.all([first, second]);
    Store.write = write;
    return { snapshots, persisted: await Store.read('recipes'), dirty: [...Store.dirty] };
  });
  expect(saved).toEqual({ snapshots: [[{ id: 'r', title: 'First edit' }], [{ id: 'r', title: 'Newest edit' }]], persisted: [{ id: 'r', title: 'Newest edit' }], dirty: [] });
  await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.recipes?.[0]?.id === 'r');
  expect(await page.evaluate(() => Store.get('recipes')[0].title)).toBe('Newest edit');
  expect(errors).toEqual([]);
});

test('failed background and lifecycle saves remain exportable, without unhandled rejections', async ({ page }) => {
  const errors = await open(page);
  await failNutrition(page);
  await page.evaluate(() => Store.set('nutrition', { '2026-01-15': { weight: 81, entries: [{ id: 'entry', name: 'Synthetic oats', cal: 200 }] } }));
  await expect(page.locator('#save-recovery')).toBeVisible(); // debounced save failed
  await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.getByRole('button', { name: 'Retry save', exact: true })).toBeEnabled();
  const downloading = page.waitForEvent('download');
  await page.locator('#save-recovery').getByRole('button', { name: 'Export backup' }).click();
  const downloaded = await downloading;
  const backup = JSON.parse(await fs.readFile(await downloaded.path(), 'utf8'));
  expect(backup.data.nutrition['2026-01-15'].entries[0].id).toBe('entry');
  expect(backup.settings.fdcKey).toBeUndefined();
  await expect(page.locator('#save-recovery')).toBeVisible();
  await page.evaluate(() => window.restorePut());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  expect(errors).toEqual([]);
});

test('localStorage quota failure rejects flushAll, preserves pending edits, and retries in fallback mode', async ({ page }) => {
  await page.addInitScript(() => { indexedDB.open = () => { throw new Error('Synthetic IndexedDB unavailable'); }; });
  const errors = await open(page);
  const failed = await page.evaluate(async () => {
    const setItem = Storage.prototype.setItem;
    window.restoreSetItem = () => { Storage.prototype.setItem = setItem; };
    Storage.prototype.setItem = function (key, value) { if (key === 'bd.data.nutrition') throw new DOMException('Synthetic quota', 'QuotaExceededError'); return setItem.apply(this, arguments); };
    Store.set('nutrition', { '2026-01-15': { weight: 82, entries: [] } });
    let rejected = false; try { await Store.flushAll(); } catch { rejected = true; }
    return { rejected, dirty: [...Store.dirty], failed: [...Store.failed] };
  });
  expect(failed).toEqual({ rejected: true, dirty: ['nutrition'], failed: ['nutrition'] });
  await page.evaluate(() => window.restoreSetItem());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.nutrition);
  expect(await page.evaluate(() => [Store.db, day('2026-01-15').weight])).toEqual([null, 82]);
  expect(errors).toEqual([]);
});

test('recovery controls fit a phone in dark mode and remain large touch targets', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await open(page); await failNutrition(page);
  await page.evaluate(() => { S.theme = 'dark'; applyTheme(); Store.set('nutrition', { '2026-01-15': { weight: 80, entries: [] } }); });
  const banner = page.locator('#save-recovery'); await expect(banner).toBeVisible();
  const layout = await banner.evaluate(el => ({ fits: el.scrollWidth <= el.clientWidth, controls: [...el.querySelectorAll('button')].map(b => b.getBoundingClientRect().height), dark: document.documentElement.classList.contains('dark') }));
  expect(layout.fits).toBe(true); expect(layout.dark).toBe(true);
  expect(layout.controls.every(h => h >= 44)).toBe(true);
  await page.evaluate(() => window.restorePut()); await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(banner).toBeHidden(); await context.close();
});

test('a sync bookkeeping quota error retains pending edits with recovery controls until retry', async ({ page }) => {
  const errors = await open(page);
  const result = await page.evaluate(async () => {
    localStorage.setItem('bd.sync', JSON.stringify({ on: true }));
    const setItem = Storage.prototype.setItem;
    window.restoreSyncStorage = () => { Storage.prototype.setItem = setItem; };
    Storage.prototype.setItem = function (key, value) { if (key === 'bd.sync') throw new DOMException('Synthetic quota', 'QuotaExceededError'); return setItem.apply(this, arguments); };
    Store.set('nutrition', { '2026-01-15': { weight: 83, entries: [] } });
    let rejected = false; try { await Store.flushDirty(); } catch { rejected = true; }
    return { rejected, persisted: await Store.read('nutrition'), dirty: [...Store.dirty], failed: [...Store.failed] };
  });
  expect(result.rejected).toBe(true); expect(result.persisted?.['2026-01-15']).toBeUndefined();
  expect(result.dirty).toEqual(['nutrition']); expect(result.failed).toEqual(['nutrition']);
  await expect(page.locator('#save-recovery')).toBeVisible();
  await page.evaluate(() => window.restoreSyncStorage());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  expect(await page.evaluate(() => !!syncMeta().changed)).toBe(true);
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.nutrition);
  expect(await page.evaluate(() => day('2026-01-15').weight)).toBe(83);
  expect(errors).toEqual([]);
});

test('returning to a visible synced tab catches a failed save without adopting stale data', async ({ page }) => {
  const { serveRepo, stopServer } = await import('./serve.js');
  const server = await serveRepo(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(`http://localhost:${server.address().port}/index.html`);
    await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.recipes);
    await page.evaluate(async () => { A.helpDismiss({ dataset: { what: 'tour' } }); await Store.flushDirty(); });
    await failNutrition(page);
    await page.evaluate(async () => {
      DRIVE.clientId = 'synthetic'; localStorage.setItem('bd.sync', JSON.stringify({ on: true }));
      Store.set('nutrition', { '2026-01-15': { weight: 84, entries: [] } });
      try { await Store.flushDirty(); } catch {}
      window.adoptFinished = false; const adopt = Sync.adopt.bind(Sync);
      Sync.adopt = async () => { try { return await adopt(); } finally { window.adoptFinished = true; } };
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => window.adoptFinished && !Store.flushing);
    await expect(page.locator('#toasts')).toContainText('Could not resume sync');
    await expect(page.locator('#save-recovery')).toBeVisible();
    expect(await page.evaluate(() => day('2026-01-15').weight)).toBe(84);
    expect(errors).toEqual([]);
    await page.evaluate(async () => { window.restorePut(); await Store.flushDirty(); clearTimeout(Sync.timer); });
  } finally { await stopServer(server); }
});

test('a failed keyboard retry retains focus on the retry control', async ({ page }) => {
  const errors = await open(page); await failNutrition(page);
  await page.evaluate(async () => {
    Store.set('nutrition', { '2026-01-15': { weight: 85, entries: [] } });
    try { await Store.flushDirty(); } catch {}
  });
  const retry = page.getByRole('button', { name: 'Retry save', exact: true });
  await retry.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#toasts')).toContainText('Changes could not be saved');
  await expect(retry).toBeFocused();
  await expect(retry).toHaveAttribute('aria-disabled', 'false');
  await page.evaluate(() => window.restorePut());
  await page.keyboard.press('Enter'); await expect(page.locator('#save-recovery')).toBeHidden();
  expect(errors).toEqual([]);
});

test('a failed workout finish preserves the saved active workout and retries history plus active state together', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(async () => {
    await startWorkout({ id: 'synthetic-finish', name: 'Synthetic training', exercises: [{ name: 'Squat', notes: '', sets: [{ weight: 40, reps: 5, type: 'normal', done: true }] }] });
    await Store.flushDirty();
    const put = IDBObjectStore.prototype.put;
    window.restoreWorkoutPut = () => { IDBObjectStore.prototype.put = put; };
    IDBObjectStore.prototype.put = function(value, key) {
      const request = put.apply(this, arguments);
      if (this.name === 'kv' && key === 'workouts') this.transaction.abort();
      return request;
    };
    await A.awFinish(); try { await Store.flushDirty(); } catch {}
  });
  const failed = await page.evaluate(async () => ({ active: (await Store.read('activeWorkout')).id, history: await Store.read('workouts'), dirty: [...Store.dirty].sort(), memoryHistory: W().map(w => w.id), memoryActive: Store.get('activeWorkout') }));
  expect(failed.active).toBe('synthetic-finish'); expect(failed.history || []).toEqual([]);
  expect(failed.dirty).toEqual([]);
  expect(await page.evaluate(() => [...WebWrites.pending.values()].map(p => p.purpose))).toEqual(['finish-workout']);
  expect(failed.memoryHistory).toEqual([]); expect(failed.memoryActive.id).toBe('synthetic-finish');
  await page.keyboard.press('Escape');
  await expect(page.locator('#save-recovery')).toBeVisible();
  await page.evaluate(() => window.restoreWorkoutPut());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.workouts?.length);
  expect(await page.evaluate(() => [W().map(w => w.id), Store.get('activeWorkout')])).toEqual([['synthetic-finish'], null]);
  expect(errors).toEqual([]);
});

test('weight logging never announces saved before a failed write has recovered', async ({ page }) => {
  const errors = await open(page); await failNutrition(page);
  await page.evaluate(() => { S.unit = 'kg'; render(); });
  await page.locator('[data-dash-card="today"]').getByRole('button', { name: 'Log weight', exact: true }).click();
  await page.getByRole('spinbutton', { name: /Scale weight/ }).fill('80');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeVisible();
  await expect(page.locator('#save-state')).toHaveText('Not saved');
  await expect(page.locator('#toasts')).not.toContainText('Weight saved');
  expect(await page.evaluate(() => day(ymd()).weight)).toBe(80);
  await page.evaluate(() => window.restorePut());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-state')).toHaveText('Saved on device');
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.nutrition);
  expect(await page.evaluate(() => day(ymd()).weight)).toBe(80);
  expect(errors).toEqual([]);
});
