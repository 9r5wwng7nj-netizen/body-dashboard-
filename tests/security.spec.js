import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

async function openApp(page) {
  await page.route('**/*', route => /^(file|data|blob|about):/.test(route.request().url()) ? route.continue() : route.abort());
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.db && Array.isArray(Store.data.recipes));
}

test('invalid backups cannot change records or photos', async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(async () => {
    Store.data.recipes = [{ id: 'keep', title: 'Keep me' }];
    await Store.flushAll();
    await Photos.put('keep-photo', new Blob(['keep']));
    const bad = [
      { app: 'body-dashboard', version: 1, data: null },
      { app: 'other', version: 1, data: { recipes: [] } },
      { app: 'body-dashboard', version: 3, data: { recipes: [] } },
      { app: 'body-dashboard', version: 1, data: { recipes: {} } },
      { app: 'life-dashboard', version: 1, data: { recipes: {} } },
      { app: 'body-dashboard', version: 1, data: { nutrition: { '2026-10-12': { entries: 'bad' } } } },
      { app: 'body-dashboard', version: 1, data: { recipes: [{ id: 'x', title: 'x' }, { id: 'x', title: 'duplicate' }] } },
      { app: 'body-dashboard', version: 2, data: { recipes: [] }, assets: { photos: [{ id: 'bad', data: 'data:image/png;base64,!!!' }] } },
      { app: 'life-dashboard', version: 1, data: { tasks: [] } }, // nothing this app keeps
      JSON.parse('{"app":"body-dashboard","version":1,"data":{"gkit":{"__proto__":{"polluted":true}}}}')
    ];
    const stopped = bad.map(d => { try { planBackupImport(d, 'replace'); return false; } catch (e) { return true; } });
    return { stopped, recipes: Store.data.recipes, persisted: await Store.read('recipes'), photo: await (await Photos.get('keep-photo')).text(), polluted: {}.polluted === true };
  });
  expect(result.stopped.every(Boolean)).toBe(true);
  expect(result.recipes).toEqual([{ id: 'keep', title: 'Keep me' }]);
  expect(result.persisted).toEqual(result.recipes);
  expect(result.photo).toBe('keep');
  expect(result.polluted).toBe(false);
});

test('restore saves records and photos together and preserves legacy photos and keys', async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(async () => {
    S.fdcKey = 'device-key'; saveSettings();
    await Photos.put('old-photo', new Blob(['old']));
    const backup = await buildBackupPayload();
    backup.data.recipes = [{ id: 'new-recipe', title: 'Restored' }];
    backup.assets.photos = [{ id: 'new-photo', data: 'data:text/plain;base64,bmV3' }];
    backup.data.photoMeta = [{ id: 'new-photo' }];
    await commitBackupImport(planBackupImport(backup, 'replace'));
    const restored = { recipe: (await Store.read('recipes'))[0].title, photo: await (await Photos.get('new-photo')).text(), oldMissing: !(await Photos.get('old-photo')) };
    await commitBackupImport(planBackupImport({ app: 'body-dashboard', version: 1, data: { recipes: [] }, settings: { fdcKey: 'untrusted-key' } }, 'replace'));
    return { restored, legacyPhoto: await (await Photos.get('new-photo')).text(), meta: Store.data.photoMeta[0].id, key: S.fdcKey };
  });
  expect(result).toEqual({ restored: { recipe: 'Restored', photo: 'new', oldMissing: true }, legacyPhoto: 'new', meta: 'new-photo', key: 'device-key' });
});

test('storage failure rolls back a restore', async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(async () => {
    Store.data.recipes = [{ id: 'keep', title: 'Keep' }]; await Store.flushAll();
    S.name = 'Before'; saveSettings();
    await Photos.put('keep-photo', new Blob(['keep']));
    const backup = await buildBackupPayload(); backup.settings.name = 'After'; backup.data.recipes = [{ id: 'new', title: 'New' }]; backup.assets.photos = [];
    const plan = planBackupImport(backup, 'replace'), original = Store.db.transaction.bind(Store.db);
    Store.db.transaction = function(stores, mode) {
      const tx = original(stores, mode);
      if (Array.isArray(stores) && mode === 'readwrite') {
        const objectStore = tx.objectStore.bind(tx); let puts = 0;
        tx.objectStore = function(name) {
          const store = objectStore(name);
          if (name === 'kv') {
            const put = store.put.bind(store);
            store.put = function(...args) { if (++puts === 2) throw new Error('Simulated storage failure'); return put(...args); };
          }
          return store;
        };
      }
      return tx;
    };
    let failed = false;
    try { await commitBackupImport(plan); } catch (e) { failed = true; }
    Store.db.transaction = original;
    return { failed, recipe: Store.data.recipes[0].title, persisted: (await Store.read('recipes'))[0].title, photo: await (await Photos.get('keep-photo')).text(), name: S.name, storedName: JSON.parse(localStorage.getItem('bd.settings')).name };
  });
  expect(result).toEqual({ failed: true, recipe: 'Keep', persisted: 'Keep', photo: 'keep', name: 'Before', storedName: 'Before' });
});

test('unsafe URLs are blocked', async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(() => ({
    rejected: ['javascript:alert(1)', 'data:text/html,test', 'https://user:password@example.com', 'java\nscript:alert(1)'].map(webUrl),
    valid: webUrl('https://example.com/article')
  }));
  expect(result.rejected).toEqual(['', '', '', '']);
  expect(result.valid).toBe('https://example.com/article');
});

test('recipe clips reject malformed structured data', async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(() => ({
    recipe: parseRecipeClip('{"ldRecipe":1,"ingredients":"not a list"}'),
    validRecipe: !!parseRecipeClip('{"ldRecipe":1,"ingredients":["1 cup flour"],"steps":["Mix"]}')
  }));
  expect(result).toEqual({ recipe: null, validRecipe: true });
});
