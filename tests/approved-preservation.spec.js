import { test, expect } from '@playwright/test';
import { serveRepo, stopServer } from './serve.js';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
let server;
test.beforeEach(async ({ page }) => {
  server = await serveRepo({ prefix: '/body-dashboard-/' });
  page.on('dialog', dialog => dialog.dismiss());
  await page.goto(`http://localhost:${server.address().port}/body-dashboard-/index.html?pwa`);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready);
  await page.evaluate(async () => { A.helpDismiss({ dataset: { what: 'tour' } }); await Store.flushDirty(); });
});
test.afterEach(async () => stopServer(server));

// These are deliberately retained legacy shapes, not a proposed new inventory model.
async function seedRetiredRecords(page) {
  await page.evaluate(async () => {
    const today = ymd();
    Store.set('pantry', [{ id: 'synthetic-pantry', name: 'Synthetic rice', low: false, added: '2026-10-01', custom: { provenance: 'synthetic' } }]);
    Store.set('grocery', [{ id: 'synthetic-grocery', name: 'Synthetic beans', qty: 2.125, unit: 'can', checked: true, source: 'plan', section: 'pantry', store: 'Synthetic store', note: 'Keep exact source fields' }]);
    Store.set('freezer', [{ id: 'synthetic-freezer', name: 'Synthetic stew batch', recipeId: 'synthetic-recipe', portions: 3.75, date: '2026-10-01', created: '2026-10-01T12:00:00Z' }]);
    Store.set('gkit', { stores: ['Synthetic store'], staples: [{ id: 'synthetic-staple', text: 'Synthetic oats', every: 7, last: '2026-01-01' }], sectionMap: { 'synthetic beans': 'pantry' }, spend: [{ id: 'synthetic-spend', date: '2026-10-01', amount: 12.345 }], budget: 100.125, basics: ['salt', 'synthetic rice'], planPrefs: { people: 2, maxTime: 30 }, customRetained: { keep: true } });
    Store.set('recipes', [{ id: 'synthetic-recipe', title: 'Synthetic stew', ingredients: '1 cup synthetic rice\n2 cans synthetic beans', steps: 'Synthetic preparation.', servings: 4, cal: 450, p: 25, c: 60, f: 12, tags: ['Dinner', 'Freezer-friendly'], freezer: true, made: [] }]);
    Store.set('mealPlan', { [today]: [{ id: 'synthetic-plan', recipeId: 'synthetic-recipe', text: 'Synthetic stew batch', freezerId: 'synthetic-freezer', slot: 'dinner', portions: 1.25 }] });
    await Store.flushDirty();
  });
}
async function retained(page) {
  return page.evaluate(() => Object.fromEntries(['pantry', 'grocery', 'freezer', 'gkit'].map(key => [key, structuredClone(Store.get(key))])));
}

const retiredActions = '[data-action^="groc"], [data-action^="pan"], [data-action^="fz"], [data-action^="staple"], [data-action="cookFreeze"], [data-action="cmGroc"], [data-action="recGroc"], [data-action="recToGroc"]';

test('retired records and legacy freezer references round-trip exactly without returning active controls', async ({ page }) => {
  await seedRetiredRecords(page);
  const original = await retained(page);
  const restored = await page.evaluate(async () => {
    const payload = await buildBackupPayload();
    const plan = planBackupImport(validateBackup(payload), 'replace');
    await commitBackupImport(plan);
    return { backup: Object.fromEntries(['pantry', 'grocery', 'freezer', 'gkit'].map(key => [key, payload.data[key]])), reference: Store.get('mealPlan')[ymd()][0].freezerId, version: Store.db.version, database: Store.db.name };
  });
  expect(restored.backup).toEqual(original);
  expect(await retained(page)).toEqual(original);
  expect(restored.reference).toBe('synthetic-freezer');
  expect([restored.database, restored.version]).toEqual(['body-dashboard', 1]);

  for (const tab of ['recipes', 'plan', 'grocery', 'pantry', 'freezer']) {
    await page.evaluate(tab => { ui.recTab = tab; go('recipes'); }, tab);
    await expect(page.locator('#view')).not.toBeEmpty();
    await expect(page.locator(retiredActions.split(', ').map(selector => `#view ${selector}:visible`).join(', '))).toHaveCount(0);
  }
  await page.evaluate(() => Modal.close());
  expect(await retained(page)).toEqual(original);
  await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready);
  expect(await retained(page)).toEqual(original);
});

test('marking a legacy freezer-linked plan made changes the plan fact but never inventory', async ({ page }) => {
  await seedRetiredRecords(page);
  const original = await retained(page);
  await page.evaluate(async () => { A.mealMade({ dataset: { date: ymd(), id: 'synthetic-plan' } }); await Store.flushDirty(); });
  expect(await page.evaluate(() => Store.get('mealPlan')[ymd()][0].made)).toBe(true);
  expect(await page.evaluate(() => Store.get('mealPlan')[ymd()][0].freezerId)).toBe('synthetic-freezer');
  expect(await retained(page)).toEqual(original);
  expect(await page.evaluate(() => day(ymd()).entries.length)).toBe(0);
  await page.evaluate(async () => { A.mealMade({ dataset: { date: ymd(), id: 'synthetic-plan' } }); await Store.flushDirty(); });
  expect(await page.evaluate(() => Store.get('mealPlan')[ymd()][0].made)).toBe(false);
  expect(await retained(page)).toEqual(original);
});

test('legacy retired mutation handlers are inert and cannot recreate inventory or shopping flows', async ({ page }) => {
  await seedRetiredRecords(page);
  const original = await retained(page);
  await page.evaluate(async () => {
    for (const name of ['groceryBuild', 'grocPutAway', 'grocClearDone', 'grocClearAll', 'stapleAddDue', 'fzUse', 'fzDel', 'panDel', 'panLow', 'cookFreeze', 'cmGroc']) {
      if (typeof A[name] !== 'function') continue;
      const id = name.startsWith('fz') ? 'synthetic-freezer' : name.startsWith('pan') ? 'synthetic-pantry' : 'synthetic-recipe';
      await A[name]({ dataset: { id, date: ymd() } });
      Modal.close();
    }
    await Store.flushDirty();
  });
  expect(await retained(page)).toEqual(original);
});

test('three-root navigation projects old order while retaining all old preference values', async ({ page }) => {
  const original = await page.evaluate(() => {
    Object.assign(S, { bar: ['recipes', 'nutrition', 'fitness', 'dashboard'], hiddenTabs: { fitTab: ['progress'], nutTab: ['foods'], recTab: ['pantry'] }, hiddenCards: ['weight'], cardOrder: ['meals', 'today'] });
    saveSettings(); go('dashboard');
    return structuredClone({ bar: S.bar, hiddenTabs: S.hiddenTabs, hiddenCards: S.hiddenCards, cardOrder: S.cardOrder });
  });
  expect(await page.locator('#bottom-bar [data-view]').evaluateAll(items => items.map(el => el.dataset.view))).toEqual(['nutrition', 'fitness', 'dashboard']);
  for (const tab of ['grocery', 'pantry', 'freezer']) {
    await page.evaluate(tab => { ui.recTab = tab; go('recipes'); }, tab);
    await expect(page.locator('#view')).not.toBeEmpty();
  }
  expect(await page.evaluate(() => ({ bar: S.bar, hiddenTabs: S.hiddenTabs, hiddenCards: S.hiddenCards, cardOrder: S.cardOrder }))).toEqual(original);
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready);
  expect(await page.locator('#bottom-bar [data-view]').evaluateAll(items => items.map(el => el.dataset.view))).toEqual(['nutrition', 'fitness', 'dashboard']);
  expect(await page.evaluate(() => ({ bar: S.bar, hiddenTabs: S.hiddenTabs, hiddenCards: S.hiddenCards, cardOrder: S.cardOrder }))).toEqual(original);
});
