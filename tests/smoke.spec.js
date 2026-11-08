// Smoke tests: open index.html from disk, visit every named page, and make sure nothing throws.
// Runtime dependencies are local. Network is blocked so tests stay deterministic.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const APP = pathToFileURL(path.resolve('index.html')).href;

// Explicit inventory: disappearing section-tab buttons must not silently shrink coverage.
const NAMED_PAGES = [
  { label: 'Today', home: 'dashboard' },
  { label: 'Train', home: 'fitness' },
  { label: 'Workout history', train: 'history' },
  { label: 'Routines', train: 'routines' },
  { label: 'Exercise library', train: 'library' },
  { label: 'Training progress', train: 'progress' },
  { label: 'Nutrition log', home: 'nutrition', title: 'Nutrition' },
  { label: 'Nutrition library', nutrition: 'library', title: 'Library' },
  { label: 'Meal plan', nutrition: 'mealplan' },
  { label: 'Weight & measurements', nutrition: 'body' },
  { label: 'Targets & check-ins', nutrition: 'targets' }
];
async function openNamedPage(page, route) {
  await page.evaluate(route => {
    Modal.close(); ui.editW = null;
    if (route.train) A.trainPage({ dataset: { page: route.train } });
    else if (route.nutrition) A.nutPage({ dataset: { page: route.nutrition } });
    else A.pageHome({ dataset: { view: route.home } });
  }, route);
  await expect(page.locator('#view-title')).toHaveText(route.title || route.label);
}


async function prepare(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`); });
  page.on('dialog', d => d.accept());
  await page.route('**/*', route => {
    const u = route.request().url();
    if (/^(file|data|blob):/.test(u)) return route.continue();
    return route.abort(); // Bible downloads, APIs, embeds: not needed for a smoke test
  });
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  return errors;
}

async function visitEverything(page, perPage) {
  for (const route of NAMED_PAGES) {
    await openNamedPage(page, route);
    if (perPage) await perPage(route.label);
  }
  return NAMED_PAGES.map(route => route.label);
}

test('every named landing and detail page renders without errors', async ({ page }) => {
  const errors = await prepare(page);
  const views = await visitEverything(page, async () => { await expect(page.locator('#view')).not.toBeEmpty(); });
  expect(views).toEqual(['Today', 'Train', 'Workout history', 'Routines', 'Exercise library', 'Training progress', 'Nutrition log', 'Nutrition library', 'Meal plan', 'Weight & measurements', 'Targets & check-ins']);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('data is saved and survives a reload', async ({ page }) => {
  const errors = await prepare(page);
  await page.evaluate(() => { ensureDay(ymd()).weight = 80; Store.save('nutrition'); Store.get('recipes').push({ id: 'smoke-recipe', title: 'Smoke test chili', ingredients: '', steps: '' }); Store.save('recipes'); Store.flushDirty(); });
  await page.waitForTimeout(300);
  await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  const got = await page.evaluate(() => ({ weight: day(ymd()).weight, recipe: Store.get('recipes').some(r => r.title === 'Smoke test chili') }));
  expect(got).toEqual({ weight: 80, recipe: true });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('phone width: no view scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await prepare(page);
  const wide = [];
  await visitEverything(page, async where => {
    const [sw, cw] = await page.evaluate(() => [$('#view').scrollWidth, $('#view').clientWidth]);
    if (sw > cw + 1) wide.push(`${where} (${sw}px > ${cw}px)`);
  });
  expect(wide, wide.join('\n')).toEqual([]);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('version 2 backup includes and restores personal photos', async ({ page }) => {
  const errors = await prepare(page);
  const got = await page.evaluate(async () => {
    const id = 'test-photo', blob = new Blob(['photo bytes'], { type: 'text/plain' });
    await Photos.put(id, blob);
    Store.get('photoMeta').push({ id, date: '2026-10-12', pose: 'front' });
    const backup = await buildBackupPayload();
    await idbClear('photos');
    await restoreBackupPhotos(backup.assets.photos, 'replace');
    const restored = await Photos.get(id);
    return { version: backup.version, photos: backup.assets.photos.length, meta: backup.data.photoMeta.some(x => x.id === id), text: await restored.text() };
  });
  expect(got).toEqual({ version: 2, photos: 1, meta: true, text: 'photo bytes' });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('full reset clears personal stores, libraries, settings and API keys', async ({ page }) => {
  const errors = await prepare(page);
  const got = await page.evaluate(async () => {
    await Photos.put('secret-photo', new Blob(['x']));
    await LocalDb.put('test-library', { private: true });
    localStorage.setItem('bd.test-secret', 'present');
    S.fdcKey = 'secret'; saveSettings();
    await resetAllData();
    return {
      photoMissing: !(await Photos.get('secret-photo')),
      libraryMissing: !(await LocalDb.get('test-library')),
      secret: localStorage.getItem('bd.test-secret'),
      key: S.fdcKey || ''
    };
  });
  expect(got).toEqual({ photoMissing: true, libraryMissing: true, secret: null, key: '' });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('runtime libraries are local and work with the network blocked', async ({ page }) => {
  const externalCode = [];
  page.on('request', req => {
    if (/^https?:/.test(req.url()) && ['script', 'stylesheet'].includes(req.resourceType())) externalCode.push(req.url());
  });
  const errors = await prepare(page);
  const got = await page.evaluate(async () => {
    const sheets = await readSpreadsheet(new TextEncoder().encode('name,value\nTest,42'));
    return {
      icon: typeof lucide?.createIcons === 'function',
      xlsx: XLSX.version,
      row: sheets.Sheet1[1]
    };
  });
  expect(got).toEqual({ icon: true, xlsx: '0.20.3', row: ['Test', 42] });
  expect(externalCode).toEqual([]);
  expect(errors, errors.join('\n')).toEqual([]);
});

// Body Dashboard and Life Dashboard are hosted on the same origin, so they must never share a storage name.
test('every storage name is Body Dashboard’s own, never Life Dashboard’s', async ({ page }) => {
  const errors = await prepare(page);
  await page.evaluate(async () => { ensureDay(ymd()).weight = 80; Store.save('nutrition'); await Store.flushDirty(); saveSettings(); Timer.start(5); Timer.stop(); });
  const got = await page.evaluate(async () => ({
    keys: Object.keys(localStorage).filter(k => !k.startsWith('bd.')),
    dbs: (await indexedDB.databases()).map(d => d.name).sort(),
    backup: (await buildBackupPayload()).app
  }));
  expect(got).toEqual({ keys: [], dbs: ['body-dashboard'], backup: 'body-dashboard' });
  expect(errors, errors.join('\n')).toEqual([]);
});
