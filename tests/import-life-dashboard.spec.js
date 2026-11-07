// Bringing records across from a Life Dashboard backup: only the fitness and diet collections come in,
// only the photos those records use, and only settings that mean something here.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const APP = pathToFileURL(path.resolve('index.html')).href;
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const today = new Date().toLocaleDateString('en-CA');

// A made-up Life Dashboard backup, in the shape Life Dashboard writes (app life-dashboard, version 2).
const ldBackup = () => ({
  app: 'life-dashboard', version: 2, exportedAt: '2026-11-01T12:00:00.000Z',
  settings: { name: 'Sam', unit: 'kg', theme: 'dark', familyName: 'Example', translation: 'esv', tour: 'done', bar: ['dashboard', 'tasks', 'nutrition', 'fitness'], hiddenTabs: { taskTab: ['stats'], fitTab: ['library'] }, targets: { cal: 2200, p: 170, c: 220, f: 70 } },
  data: {
    workouts: [{ id: 'w1', name: 'Made-up push day', start: `${today}T12:00:00.000Z`, end: `${today}T13:00:00.000Z`, exercises: [{ name: 'Bench Press (Barbell)', sets: [{ type: 'normal', weight: 60, reps: 8 }] }] }],
    routines: [{ id: 'rt1', name: 'Made-up routine', exercises: [] }],
    nutrition: { [today]: { weight: 80, entries: [{ id: 'e1', name: 'Made-up lunch', cal: 600, p: 40, c: 60, f: 20, meal: 'lunch' }] } },
    photoMeta: [{ id: 'pp_progress', date: today, pose: 'front' }],
    recipes: [{ id: 'r1', title: 'Made-up chili', ingredients: '1 lb beans', steps: 'Simmer.', photo: 'rp_recipe' }],
    tasks: [{ id: 't1', title: 'Made-up task', status: 'todo' }],
    journal: [{ id: 'j1', type: 'journal', date: today, title: 'Made-up entry', body: 'x', photos: ['jp_journal'] }],
    memories: [{ id: 'm1', date: today, text: 'Made-up memory', photos: ['fm_family'] }],
    prayers: [{ id: 'p1', title: 'Made-up prayer' }]
  },
  assets: { photos: ['pp_progress', 'rp_recipe', 'jp_journal', 'fm_family'].map(id => ({ id, data: PNG })) }
});

async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  await page.route('**/*', route => (/^(file|data|blob):/.test(route.request().url()) ? route.continue() : route.abort()));
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.data && Array.isArray(Store.data.recipes));
  return errors;
}

test('a Life Dashboard backup brings in workouts, food, weight, recipes and their photos, and nothing else', async ({ page }) => {
  const errors = await open(page);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bd-import-')), 'life-dashboard-backup.json');
  fs.writeFileSync(file, JSON.stringify(ldBackup()));
  await page.evaluate(() => openSettings());
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#modal [data-action="importAll"]')]);
  await chooser.setFiles(file);
  const modal = page.locator('#modal');
  await expect(modal.locator('h3')).toHaveText('Bring in your Life Dashboard records');
  await expect(modal).toContainText('with 2 of their photos');
  await expect(modal).toContainText('sample routines and recipes are replaced with yours');
  await modal.getByRole('button', { name: 'Bring in my records' }).click();
  await page.waitForFunction(() => Store.get('workouts').length === 1);

  const got = await page.evaluate(async () => ({
    keys: Object.keys(Store.data).filter(k => !Object.hasOwn(COLLECTIONS, k)),
    workouts: Store.get('workouts').map(w => w.name), routines: Store.get('routines').map(r => r.name), recipes: Store.get('recipes').map(r => r.title),
    weight: Object.values(Store.get('nutrition'))[0].weight, photos: (await idbEntries('photos')).map(([k]) => k).sort(),
    stored: (await Store.read('recipes')).map(r => r.title),
    settings: { name: S.name, unit: S.unit, theme: S.theme, cal: S.targets.cal, familyName: S.familyName, translation: S.translation, tour: S.tour, bar: barViews(), hiddenTabs: S.hiddenTabs }
  }));
  expect(got).toEqual({
    keys: [], workouts: ['Made-up push day'], routines: ['Made-up routine'], recipes: ['Made-up chili'], weight: 80,
    photos: ['pp_progress', 'rp_recipe'], stored: ['Made-up chili'],
    settings: { name: 'Sam', unit: 'kg', theme: 'dark', cal: 2200, familyName: undefined, translation: undefined, tour: 'new', bar: ['dashboard', 'fitness', 'nutrition', 'recipes'], hiddenTabs: { fitTab: ['library'] } }
  });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('once Body Dashboard has records of its own, a Life Dashboard backup offers Merge or Replace', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(b => { ensureDay(ymd()).weight = 79; Store.save('nutrition'); importChoice(parseBackup(b)); }, JSON.stringify(ldBackup()));
  const modal = page.locator('#modal');
  await expect(modal.getByRole('button', { name: 'Merge' })).toBeVisible();
  await modal.getByRole('button', { name: 'Merge' }).click();
  await page.waitForFunction(() => Store.get('workouts').length === 1);
  expect(await page.evaluate(() => ({ recipes: Store.get('recipes').some(r => r.title === 'Made-up chili'), tasks: Object.hasOwn(Store.data, 'tasks') }))).toEqual({ recipes: true, tasks: false });
  expect(errors, errors.join('\n')).toEqual([]);
});
