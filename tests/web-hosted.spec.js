import { test, expect, webkit, chromium } from '@playwright/test';
import { serveRepo, stopServer } from './serve.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
let photoContext, photoDir;
let server, base;
test.beforeEach(async ({ page }) => {
  server = await serveRepo({ prefix: '/body-dashboard-/' });
  base = `http://localhost:${server.address().port}/body-dashboard-/index.html?pwa`;
  await page.goto(base);
  await page.waitForFunction(() => typeof WebWrites !== 'undefined' && Store.ready && Store.data.recipes);
  await page.evaluate(async () => { await Store.flushDirty(); A.helpDismiss({ dataset: { what: 'tour' } }); });
});
test.afterEach(async () => { if (photoContext) { await photoContext.close(); photoContext = null; await fs.rm(photoDir, { recursive: true, force: true }); } await stopServer(server); });
const training = (id = 'import-a') => ({ app: 'body-dashboard', type: 'fitness', workouts: [{ id, name: 'Synthetic mixed training', start: '2026-10-25T07:00:00-04:00', end: '2026-10-25T08:00:00-04:00', notes: 'Synthetic only', customSource: { precision: 1.23456789 }, exercises: [
  { name: 'Squat', ss: true, sets: [{ type: 'warmup', weight: 42.125123456, reps: 5, rpe: 7 }] },
  { name: 'Squat', ss: false, sets: [{ type: 'drop', weight: 30, reps: 6 }] },
  { name: 'Pull Up', sets: [{ type: 'normal', reps: 8 }] },
  { name: 'Weighted Pull Up', sets: [{ type: 'normal', weight: 10, reps: 5 }] },
  { name: 'Assisted Pull Up', sets: [{ type: 'failure', weight: 5, reps: 0 }] },
  { name: 'Plank', sets: [{ type: 'normal', duration: 45 }] },
  { name: "Farmer's Carry", sets: [{ type: 'normal', weight: 20, duration: 30 }] },
  { name: 'Running', sets: [{ type: 'normal', distance: 1.2345678, duration: 456.789 }] },
] }], routines: [], exMeta: { squat: { type: 'weight_reps', primary: 'Quads' } }, programs: {} });
async function prepare(page, source) { return page.evaluate(source => prepareWorkoutImport(JSON.stringify(source)), source); }
async function commit(page) { return page.evaluate(async () => { ui.workoutImport.timezoneReviewed = true; return commitWorkoutImport(); }); }
async function start(page) { await page.evaluate(() => startWorkout({ id: 'hosted-active', name: 'Synthetic session', exercises: [{ id: 'ex-a', name: 'Squat', rest: 90, sets: [{ id: 's-a', weight: 40, reps: 5, type: 'normal', done: false }, { id: 's-b', weight: 40, reps: 5, type: 'normal', done: false }] }] })); }

test('fitness import preserves raw history/all tracking types, imports twice without duplicates and reconciles counts', async ({ page }) => {
  const source = training();
  await prepare(page, source);
  const result = await commit(page);
  expect(result).toMatchObject({ source: 2, added: 2, updated: 0, skipped: 0, quarantined: 0, addedSets: 8, setsInUpdatedWorkouts: 0 });
  expect(await page.evaluate(() => W()[0])).toEqual(source.workouts[0]);
  await prepare(page, source); await commit(page);
  expect(await page.evaluate(() => W().map(w => w.id))).toEqual(['import-a']);
  source.workouts[0].notes = 'Changed source';
  const job = await prepare(page, source);
  expect(job.rows[0]).toMatchObject({ status: 'conflict', choice: 'skip' });
  expect(job.rows[0].reason).toContain('Source changed');
  expect((await commit(page)).updated).toBe(0); // nothing commits; return undefined on no-op
});

for (const app of ['body-dashboard', 'life-dashboard']) for (const version of [1, 2]) test(`training-only extraction from ${app} v${version} keeps unrelated records/settings/photos out`, async ({ page }) => {
  const source = training();
  const full = { app, version, data: { ...source, recipes: [{ id: 'unrelated-recipe', title: 'Excluded synthetic recipe' }], journal: [{ id: 'unrelated', body: 'Excluded synthetic note' }] }, settings: { name: 'Excluded synthetic name', fdcKey: 'synthetic-not-a-secret' }, assets: { photos: [] } };
  await prepare(page, full); await commit(page);
  expect(await page.evaluate(() => W().map(w => w.id))).toEqual(['import-a']);
  expect(await page.evaluate(async () => JSON.stringify(await LocalDb.get('bd.web.import-preview')))).toBeUndefined();
  const exported = await page.evaluate(() => buildBackupPayload());
  expect(JSON.stringify(exported)).not.toContain('Excluded synthetic');
  expect(JSON.stringify(exported)).not.toContain('synthetic-not-a-secret');
});

test('quarantine retains malformed/missing identity records; equal titles/dates are separate IDs', async ({ page }) => {
  const source = training();
  source.workouts.push({ ...source.workouts[0], id: 'import-b' }, { name: 'Missing identity', start: '2026-01-01', exercises: [] }, { ...source.workouts[0], id: 'invalid', exercises: [{ name: 'Unknown', type: 'unknown-kind', sets: [] }] });
  const job = await prepare(page, source);
  expect(job.rows.filter(r => r.status === 'quarantine')).toHaveLength(2);
  const result = await commit(page);
  expect(result.source).toBe(result.added + result.updated + result.skipped + result.quarantined);
  expect(await page.evaluate(() => W().map(w => w.id).sort())).toEqual(['import-a', 'import-b']);
  expect(await page.evaluate(async () => (await idbEntries('local')).filter(([key]) => key.startsWith('bd.web.receipt.')).flatMap(([, receipt]) => receipt.quarantine || []).length)).toBe(2);
  await page.evaluate(() => A.workoutImportArchive());
  await expect(page.getByRole('dialog')).toContainText('Missing source ID');
  expect(await page.evaluate(async () => !!validateBackup(await buildBackupPayload()))).toBe(true);
});

test('aborted import is atomic; restart retry commits its ledger and deletes the preview once', async ({ page }) => {
  const source = training(); await prepare(page, source);
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value, key) { const q = put.apply(this, arguments); if (this.name === 'kv' && key === 'workouts') this.transaction.abort(); return q; };
  });
  await page.evaluate(async () => { ui.workoutImport.timezoneReviewed = true; try { await commitWorkoutImport(); } catch {} });
  expect(await page.evaluate(() => W().length)).toBe(0);
  expect(await page.evaluate(async () => (await Store.read('workouts'))?.length || 0)).toBe(0);
  await page.reload(); await page.waitForFunction(() => typeof WebWrites !== 'undefined' && Store.ready && WebWrites.pending.size === 1);
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  expect(await page.evaluate(async () => [W().length, await LocalDb.get('bd.web.import-preview'), (await idbEntries('local')).filter(([, r]) => r.purpose === 'import-workouts').length])).toEqual([1, undefined, 1]);
  await prepare(page, source); await commit(page);
  expect(await page.evaluate(() => W().length)).toBe(1);
});

test('stale tab and stale import review reject rather than overwrite another tab', async ({ page, context }) => {
  await start(page);
  const other = await context.newPage(); await other.goto(base);
  await other.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.get('activeWorkout'));
  await other.evaluate(() => Store.flushDirty());
  await prepare(page, training());
  await other.evaluate(async () => { Store.set('workouts', [{ id: 'other-tab', name: 'Synthetic other', start: '2026-01-01T12:00:00Z', exercises: [] }]); await Store.flushDirty(); });
  const rejected = await page.evaluate(async () => { ui.workoutImport.timezoneReviewed = true; try { await commitWorkoutImport(); return false; } catch { return true; } });
  expect(rejected).toBe(true);
  expect(await page.evaluate(async () => (await Store.read('workouts')).map(w => w.id))).toEqual(['other-tab']);
  await page.evaluate(() => refreshWorkoutImport()); await commit(page);
  expect(await page.evaluate(() => W().map(w => w.id).sort())).toEqual(['import-a', 'other-tab']);
  // Active completion in one tab prevents the stale other tab from completing its old snapshot.
  await page.evaluate(() => { ui.workoutImport = null; Modal.close(); });
  await page.getByRole('button', { name: 'Complete set', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toHaveCount(1);
  await other.getByRole('button', { name: 'Complete set', exact: true }).last().click();
  await expect(other.locator('#save-recovery')).toBeVisible();
  expect(await other.evaluate(async () => (await Store.read('activeWorkout')).exercises[0].sets.map(s => s.done))).toEqual([true, false]);
  await other.close();
});

test('project-path offline shell reopens, accepts/edits/undoes sets and finishes offline with owned timers', async ({ page, context }) => {
  await expect(page.locator('#offline-state')).toHaveText(/Ready offline/);
  await start(page);
  await context.setOffline(true);
  const reopened = await context.newPage(); await page.close();
  await reopened.goto(base); await reopened.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.get('activeWorkout'));
  await reopened.getByRole('button', { name: 'Complete set', exact: true }).first().click();
  await expect(reopened.getByRole('button', { name: 'Undo completed set', exact: true })).toHaveCount(1);
  expect(await reopened.evaluate(() => Timer.source)).toBe('s-a');
  await reopened.getByRole('button', { name: 'Complete set', exact: true }).click();
  await expect(reopened.getByRole('button', { name: 'Undo completed set', exact: true })).toHaveCount(2);
  await reopened.getByRole('button', { name: 'Undo completed set', exact: true }).first().click();
  await expect(reopened.getByRole('button', { name: 'Undo completed set', exact: true })).toHaveCount(1);
  expect(await reopened.evaluate(() => Timer.source)).toBe('s-b'); // undoing another set does not cancel the newest timer
  await reopened.evaluate(() => WorkoutCommands.finish());
  expect(await reopened.evaluate(() => [W()[0].exercises[0].sets.map(s => s.id), Store.get('activeWorkout')])).toEqual([['s-b'], null]);
  await reopened.reload(); await reopened.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.workouts?.length);
  expect(await reopened.evaluate(() => W()[0].id)).toBe('hosted-active');
  expect(await reopened.evaluate(async () => { await loadScript(ZXING_SCRIPT); await loadScript(XLSX_SCRIPT); return !!window.ZXing && !!window.XLSX; })).toBe(true);
});

test('metadata and byte-identical local photos survive full backup restoration and offline access', async ({ page, context, browserName }) => {
  if (browserName === 'webkit') {
    // WebKit ephemeral sessions cannot persist Blobs: microsoft/playwright#42795.
    // A brand-new, test-owned persistent profile exercises the real photos store without changing its format.
    photoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bd-synthetic-webkit-photos-'));
    photoContext = await webkit.launchPersistentContext(photoDir, { headless: true, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    context = photoContext; page = await context.newPage(); await page.goto(base);
    await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.recipes);
    await page.evaluate(() => Store.flushDirty());
  }
  await start(page);
  const result = await page.evaluate(async () => {
    let stage = 'photo put'; try {
    const bytes = new Uint8Array(await (await fetch('./assets/icons/icon-192.png')).arrayBuffer());
    await Photos.put('synthetic-photo', new Blob([bytes], { type: 'image/png' }));
    stage = 'photo metadata'; Store.set('photoMeta', [{ id: 'synthetic-photo', date: '2026-01-01' }]); await Store.flushDirty();
    stage = 'build payload'; const backup = await buildBackupPayload();
    stage = 'plan'; const plan = planBackupImport(validateBackup(backup), 'replace'); stage = 'commit'; await commitBackupImport(plan); stage = 'read restored blob';
    const q = Store.db.transaction('photos', 'readonly').objectStore('photos').get('synthetic-photo');
    const blob = await new Promise((res, rej) => { q.onsuccess = () => res(q.result); q.onerror = rej; });
    return { original: [...bytes], bytes: [...new Uint8Array(await blob.arrayBuffer())], metadata: backup.extensions.bdWeb.entries.length };
    } catch (e) { throw new Error(stage + ': ' + String(e) + ' ' + e?.name); }
  });
  expect(result.bytes).toEqual(result.original); expect(result.metadata).toBeGreaterThan(0);
  await expect(page.locator('#offline-state')).toHaveText(/Ready offline/);
  await context.setOffline(true); await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.photoMeta?.length);
  expect(await page.evaluate(async () => { const img = new Image(); img.src = await Photos.url('synthetic-photo'); await img.decode(); return [img.naturalWidth, img.naturalHeight]; })).toEqual([192, 192]);
});

test('worker update waits through an active workout and failed shell installation keeps old shell', async ({ page, context }) => {
  await expect(page.locator('#offline-state')).toHaveText(/Ready offline/); await start(page);
  server.revision = 3;
  await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()).waiting);
  expect(await page.evaluate(() => Store.get('activeWorkout').id)).toBe('hosted-active');
  expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).active.state)).toBe('activated');
  await expect(page.locator('#offline-state')).toHaveText(/Update ready/);
  // The waiting update must not take over this controlled page.
  expect(await page.evaluate(async () => { const c = await caches.keys(); return c.some(k => k.endsWith('-v2')); })).toBe(true);
  await context.setOffline(true); await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.get('activeWorkout'));
  expect(await page.evaluate(() => Store.get('activeWorkout').id)).toBe('hosted-active');
});

test('failed shell update retains the activated generation', async ({ page, context }) => {
  await expect(page.locator('#offline-state')).toHaveText(/Ready offline/);
  server.revision = 4; server.failPaths = ['/assets/app.css'];
  await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); await new Promise(resolve => { if (!r.installing) return resolve(); const worker = r.installing; worker.addEventListener('statechange', () => { if (worker.state === 'redundant' || worker.state === 'installed') resolve(); }); }); });
  expect(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting)).toBe(false);
  await context.setOffline(true); await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.recipes);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.btn')).borderRadius)).not.toBe('0px');
});

test('analytics vectors keep estimates, gaps and baseline policy explicit', async ({ page }) => {
  const vectors = JSON.parse(await fs.readFile('docs/mobile-rebuild/outputs/C_ANALYTICS_VECTORS.json', 'utf8'));
  const result = await page.evaluate(v => ({ e: v.e1rm.map(row => estimatedStrength(row)), w: v.ewma.map(row => weightEWMA(row.readings, { ...row, through: row.through || '2026-12-31' }).map(r => r.trendKg)), d: strengthDelta(v.comparison.currentKg, v.comparison.baselineKg) }), vectors);
  result.e.forEach((value, i) => vectors.e1rm[i].expectedKg == null ? expect(value).toBeNull() : expect(value).toBeCloseTo(vectors.e1rm[i].expectedKg, 9));
  result.w.forEach((values, i) => { expect(values).toHaveLength(vectors.ewma[i].expectedTrendKg.length); values.forEach((value, j) => expect(value).toBeCloseTo(vectors.ewma[i].expectedTrendKg[j], 9)); });
  expect(result.d.percent).toBeCloseTo(vectors.comparison.expectedPercent, 9);
});

test('phone rows support themes, enlarged text, accessible controls and stable numeric focus', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await start(page);
  await page.addScriptTag({ content: await fs.readFile('node_modules/axe-core/axe.min.js', 'utf8') });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => { S.theme = theme; applyTheme(); render(); }, theme);
    const failures = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
    expect(failures).toEqual([]);
    await page.screenshot({ path: `output/playwright/web-${browserName}-390-${theme}.png`, fullPage: true });
    const sizes = await page.locator('[data-wctx="active"] button').evaluateAll(buttons => buttons.map(b => ({ action: b.dataset.action, w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height })));
    expect(sizes.filter(b => ['awSetDone', 'awDelSet', 'awSetType'].includes(b.action)).every(b => b.w >= 44 && b.h >= 44)).toBe(true);
  }
  const field = page.locator('[data-input="awSet"][data-f="weight"]').first(); await field.fill('42.125');
  await expect(field).toBeFocused(); await page.evaluate(() => Store.flushDirty()); await expect(field).toHaveValue('42.125');
  await field.press('Enter'); await expect(page.locator('[data-input="awSet"][data-f="reps"]').first()).toBeFocused();
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; render(); });
  expect(await page.locator('#view').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(await page.locator('#view').getAttribute('class')).toContain('workout-large-type');
  await page.screenshot({ path: `output/playwright/web-${browserName}-390-dark-large.png`, fullPage: true });
  await page.locator('[data-input="awSet"][data-f="weight"]').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `output/playwright/web-${browserName}-390-dark-large-row.png`, fullPage: true });
  const complete = page.getByRole('button', { name: 'Complete set', exact: true }).first(); await complete.scrollIntoViewIfNeeded();
  const target = await complete.boundingBox(), view = await page.locator('#view').boundingBox();
  await expect(page.locator('#bottom-bar')).toBeHidden();
  expect(Math.round(target.y + target.height)).toBeLessThanOrEqual(Math.round(view.y + view.height));
  expect(await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => v.id))).toEqual([]);
});

test('an intent checkpoint failure keeps draft text unacknowledged and exportable', async ({ page }) => {
  await start(page);
  await page.locator('[data-input="awSet"][data-f="weight"]').first().fill('47.125'); await page.evaluate(() => Store.flushDirty());
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    window.restoreIntentPut = () => { IDBObjectStore.prototype.put = put; };
    IDBObjectStore.prototype.put = function(value, key) { if (this.name === 'local' && String(key).startsWith('bd.web.intent.')) throw new DOMException('Synthetic quota', 'QuotaExceededError'); return put.apply(this, arguments); };
  });
  await page.getByRole('button', { name: 'Complete set', exact: true }).first().click();
  await expect(page.locator('#save-state')).toHaveText('Not saved');
  const exported = await page.evaluate(() => buildBackupPayload());
  expect(exported.data.activeWorkout.exercises[0].sets[0]).toMatchObject({ done: false, draft: { weight: '47.125' } });
  await page.evaluate(() => window.restoreIntentPut());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toHaveCount(1);
});

test('100k synthetic sets and 10k food entries: separate editing feedback from durable receipts', async ({ page }) => {
  const metrics = await page.evaluate(async () => {
    const sets = Array.from({ length: 100 }, (_, i) => ({ id: 'synthetic-set-' + i, weight: 40, reps: 5, type: 'normal' }));
    const workouts = Array.from({ length: 1000 }, (_, i) => ({ id: 'synthetic-history-' + i, name: 'Synthetic history', start: new Date(Date.UTC(2025, 0, 1 + i % 300)).toISOString(), exercises: [{ name: 'Squat', sets: structuredClone(sets) }] }));
    const entries = Array.from({ length: 10000 }, (_, i) => ({ id: 'synthetic-food-' + i, name: 'Synthetic food', cal: 100, p: 10, c: 10, f: 2, meal: 'lunch' }));
    Store.set('workouts', workouts); Store.set('nutrition', { '2025-01-01': { entries } }); await Store.flushDirty();
    await startWorkout({ id: 'synthetic-scale-active', name: 'Synthetic scale session', exercises: [{ name: 'Squat', sets: [{ id: 'scale-set', type: 'normal', weight: 40, reps: 5, done: false }] }] });
    const feedback = [], frame = [], receipts = [], completed = [];
    for (let i = 0; i < 20; i++) {
      const field = document.querySelector('[data-input="awSet"][data-f="weight"]'); const started = performance.now();
      field.value = String(40 + i / 10); field.dispatchEvent(new Event('input', { bubbles: true })); feedback.push(performance.now() - started);
      await new Promise(requestAnimationFrame); frame.push(performance.now() - started);
      const beforeReceipt = performance.now(); await Store.flushDirty(); receipts.push(performance.now() - beforeReceipt);
      const beforeComplete = performance.now(); await WorkoutCommands.complete(document.querySelector('[data-action="awSetDone"]')); completed.push(performance.now() - beforeComplete);
    }
    const stats = values => { const sorted = [...values].sort((a, b) => a - b); return { p50: sorted[Math.ceil(sorted.length * .5) - 1], p95: sorted[Math.ceil(sorted.length * .95) - 1] }; };
    const lookupStart = performance.now(); const comparableSessions = exerciseHistory('Squat').length; const lookupMs = performance.now() - lookupStart;
    const finishStart = performance.now(); await WorkoutCommands.finish(); const finishMs = performance.now() - finishStart;
    return { comparableSessions, lookupMs, finishMs, syntheticSets: 100000, foodEntries: 10000, samples: 20, feedback: stats(feedback), nextFrameOpportunity: stats(frame), draftReceipt: stats(receipts), completeOrAmend: stats(completed), userAgent: navigator.userAgent };
  });
  console.log('SYNTHETIC_PERFORMANCE ' + JSON.stringify(metrics));
  await test.info().attach('synthetic-performance', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
  // Correctness under scale is the gate; timing targets remain measurements, not a flaky wall-clock assertion.
  expect(await page.evaluate(() => W().reduce((n, w) => n + w.exercises.reduce((m, e) => m + e.sets.length, 0), 0))).toBe(100001);
  expect(await page.evaluate(() => Store.get('activeWorkout'))).toBeNull();
});

test('375px fallback keeps rows reachable; double taps, amendments and timer denial remain safe', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await start(page);
  await page.evaluate(() => { S.unit = 'kg'; render(); });
  expect(await page.locator('#view').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.getByRole('button', { name: 'Complete set', exact: true }).first().dblclick();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toHaveCount(1);
  const weight = page.locator('[data-input="awSet"][data-f="weight"]').first(); await weight.fill('45.125');
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0].weight)).toBe(40);
  await page.getByRole('button', { name: 'Save set changes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo completed set', exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => Store.get('activeWorkout').exercises[0].sets[0].weight)).toBe(45.125);
  await page.evaluate(async () => {
    window.Notification = class { static permission = 'denied'; constructor() { throw new Error('Notifications must not be required'); } };
    Timer.done();
    await WebWrites.tail;
    await LocalDb.put('bd.web.timer', { end: Date.now() - 1000, total: 90, source: 's-a', at: Date.now() + 1 });
  });
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.get('activeWorkout'));
  await expect(page.locator('#toasts')).toContainText('Rest ended while the app was away');
  await page.evaluate(() => WorkoutCommands.finish());
  expect(await page.evaluate(() => W()[0].exercises[0].sets.length)).toBe(1);
});

test('an explicit changed-source replacement preserves identity and reports sets in updated workouts', async ({ page }) => {
  const source = training(); await prepare(page, source); await commit(page);
  source.workouts[0].notes = 'Synthetic source correction';
  source.workouts[0].exercises[0].sets.push({ type: 'normal', weight: 50.12345678, reps: 6 });
  await prepare(page, source);
  await page.evaluate(async () => { ui.workoutImport.rows[0].choice = 'update'; await LocalDb.put('bd.web.import-preview', ui.workoutImport); });
  const result = await commit(page);
  expect(result).toMatchObject({ updated: 1, added: 0, addedSets: 0, setsInUpdatedWorkouts: 9 });
  expect(await page.evaluate(() => W()[0])).toEqual(source.workouts[0]);
});

test('historical amendments acknowledge a saved snapshot, retain date precision and recover after abort', async ({ page }) => {
  const source = training(); source.workouts[0].start = '2026-10-25T07:00:12.345-04:00'; source.workouts[0].end = '2026-10-25T08:02:34.567-04:00';
  await prepare(page, source); await commit(page);
  await page.evaluate(() => { A.workoutEdit({ dataset: { id: 'import-a' } }); ui.editW.notes = 'Synthetic amended notes'; const put = IDBObjectStore.prototype.put; window.restoreHistoricalPut = () => { IDBObjectStore.prototype.put = put; }; IDBObjectStore.prototype.put = function(value, key) { const q = put.apply(this, arguments); if (this.name === 'kv' && key === 'workouts') this.transaction.abort(); return q; }; });
  await page.evaluate(() => A.editSave());
  expect(await page.evaluate(() => W()[0].notes)).toBe('Synthetic only');
  expect(await page.evaluate(() => !!ui.editW)).toBe(true);
  await page.evaluate(() => window.restoreHistoricalPut());
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('#save-recovery')).toBeHidden();
  expect(await page.evaluate(() => [W()[0].id, W()[0].start, W()[0].end, W()[0].notes])).toEqual(['import-a', source.workouts[0].start, source.workouts[0].end, 'Synthetic amended notes']);
});

test('editing legacy history does not invent an unknown workout end time', async ({ page }) => {
  const source = training(); delete source.workouts[0].end;
  await prepare(page, source); await commit(page);
  await page.evaluate(async () => { A.workoutEdit({ dataset: { id: 'import-a' } }); ui.editW.notes = 'Synthetic correction'; await A.editSave(); });
  expect(await page.evaluate(() => [W()[0].notes, W()[0].end, Object.hasOwn(W()[0], 'end')])).toEqual(['Synthetic correction', undefined, false]);
});

test('a fresh test browser process reopens its durable draft and pending completion offline', async ({ browserName }) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bd-synthetic-relaunch-'));
  const engine = browserName === 'webkit' ? webkit : chromium;
  let owned;
  try {
    owned = await engine.launchPersistentContext(dir, { headless: true, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    let page = await owned.newPage(); await page.goto(base);
    await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready);
    await expect(page.locator('#offline-state')).toHaveText(/Ready offline/); await start(page);
    await page.locator('[data-input="awSet"][data-f="weight"]').first().fill('90.125'); await page.evaluate(() => Store.flushDirty());
    await page.evaluate(() => { const put = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function(value, key) { const q = put.apply(this, arguments); if (this.name === 'kv' && key === 'activeWorkout' && value?.exercises?.[0]?.sets?.[0]?.done) this.transaction.abort(); return q; }; });
    await page.getByRole('button', { name: 'Complete set', exact: true }).first().click();
    await expect(page.locator('#save-recovery')).toBeVisible();
    await owned.close(); owned = null;
    owned = await engine.launchPersistentContext(dir, { headless: true, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await owned.setOffline(true); page = await owned.newPage(); await page.goto(base);
    await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready);
    expect(await page.evaluate(() => [WebWrites.pending.size, Store.get('activeWorkout').id, Store.get('activeWorkout').exercises[0].sets[0].draft.weight])).toEqual([1, 'hosted-active', '90.125']);
    await page.getByRole('button', { name: 'Retry save', exact: true }).click(); await expect(page.locator('#save-recovery')).toBeHidden();
    await page.evaluate(() => WorkoutCommands.finish());
    expect(await page.evaluate(() => [W()[0].id, W()[0].exercises[0].sets.map(s => s.id), Store.get('activeWorkout')])).toEqual(['hosted-active', ['s-a'], null]);
  } finally { if (owned) await owned.close(); await fs.rm(dir, { recursive: true, force: true }); }
});

test('backup metadata rejects unknown namespaces and invalid operation payloads before writes', async ({ page }) => {
  const rejected = await page.evaluate(async () => {
    const payload = await buildBackupPayload(); const valid = structuredClone(payload);
    const cases = [
      ['life-dashboard.sync', { version: 1 }],
      ['bd.web.context', { version: 2, actorId: 'synthetic' }],
      ['bd.web.intent.synthetic', { version: 1, id: 'synthetic', purpose: 'snapshot', values: { scripture: [] }, expected: { scripture: '0'.repeat(64) }, extra: {} }],
    ];
    return cases.map(entry => { const copy = structuredClone(valid); copy.extensions.bdWeb.entries.push(entry); try { planBackupImport(copy, 'replace'); return false; } catch { return true; } });
  });
  expect(rejected).toEqual([true, true, true]);
  expect(await page.evaluate(async () => await Store.read('scripture'))).toBeUndefined();
});
