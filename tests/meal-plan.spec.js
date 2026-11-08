// Plan my week: a budget-aware week of meals from the user's recipes and a ready-made library,
// with swaps and recipe reuse; retired shopping and inventory records stay untouched.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const APP = pathToFileURL(path.resolve('index.html')).href;
async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  await page.goto(APP);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  await page.evaluate(() => { S.tour = 'done'; saveSettings(); Store.set('recipes', []); Store.set('mealPlan', {}); Store.set('grocery', []); ui.recTab = 'plan'; go('recipes'); });
  return errors;
}
const nextWeek = page => page.evaluate(() => addDays(startOfWeek(), 7));

test('the ready-made library is complete and usable', async ({ page }) => {
  await open(page);
  const lib = await page.evaluate(() => RECIPE_LIBRARY.map(L => ({ ...L, parsed: L.ingredients.split('\n').map(l => !!(parseIngredient(l) || {}).item) })));
  expect(lib.length).toBeGreaterThanOrEqual(30);
  expect(new Set(lib.map(L => L.key)).size).toBe(lib.length);
  for (const L of lib) {
    expect(['breakfast', 'lunch', 'dinner', 'snacks'], L.title).toContain(L.slot);
    expect(L.servings > 0 && L.time > 0 && L.cal > 0 && L.cost > 0, L.title).toBe(true);
    expect(L.parsed.every(Boolean), `${L.title} ingredients read as grocery items`).toBe(true);
    expect(L.steps.split('\n').length, L.title).toBeGreaterThanOrEqual(1);
  }
  for (const slot of ['breakfast', 'lunch', 'dinner']) expect(lib.filter(L => L.slot === slot).length, slot).toBeGreaterThanOrEqual(7);
});

test('a week is planned within budget, swapped and applied without shopping or inventory writes', async ({ page }) => {
  const errors = await open(page);
  const retained = await page.evaluate(() => {
    Store.set('grocery', [{ id: 'synthetic-retained-grocery', name: 'Synthetic rice', checked: true, qty: 1.25, source: 'plan' }]);
    Store.set('pantry', [{ id: 'synthetic-retained-pantry', name: 'Synthetic beans', low: true }]);
    Store.set('freezer', [{ id: 'synthetic-retained-freezer', name: 'Synthetic batch', portions: 3.5 }]);
    const k = gkit(); k.staples = [{ id: 'synthetic-due-staple', text: 'Synthetic oats', every: 7, last: null }]; k.spend = [{ date: '2026-10-01', amount: 12.125 }]; Store.set('gkit', k);
    return { grocery: structuredClone(Store.get('grocery')), pantry: structuredClone(Store.get('pantry')), freezer: structuredClone(Store.get('freezer')), staples: structuredClone(k.staples), spend: structuredClone(k.spend), budget: k.budget };
  });
  await page.click('[data-action="mpwOpen"]');
  const ws = await nextWeek(page);
  await page.click(`[data-action="mpwWeek"][data-v="${ws}"]`);
  await page.fill('#mpw-people', '2'); await page.locator('#mpw-people').dispatchEvent('change');
  await page.fill('#mpw-budget', '150'); await page.locator('#mpw-budget').dispatchEvent('change');
  await page.click('[data-action="mpwMake"]');
  await expect(page.locator('#view')).toContainText('Your week is ready');

  const W = await page.evaluate(() => ({ picks: { ...ui.mpw.picks }, total: mpwTotal(ui.mpw.picks, ui.mpw) }));
  expect(Object.keys(W.picks)).toHaveLength(21); // 7 days × breakfast, lunch, dinner
  expect(W.total).toBeLessThanOrEqual(150);
  expect(new Set(Object.values(W.picks)).size).toBe(21); // no meal repeats in the week
  await expect(page.locator('#view')).toContainText('21 meals');
  await expect(page.locator('#view')).not.toContainText('Grocery list');

  // Swap Monday's dinner, then leave Tuesday's lunch unplanned.
  const monDinner = `${ws}|dinner`, tueLunch = `${await page.evaluate(w => addDays(w, 1), ws)}|lunch`;
  await page.click(`[data-action="mpwSwap"][data-k="${monDinner}"]`);
  expect(await page.evaluate(k => ui.mpw.picks[k], monDinner)).not.toBe(W.picks[monDinner]);
  await page.click(`[data-action="mpwDrop"][data-k="${tueLunch}"]`);

  await page.click('[data-action="mpwApply"]');
  const after = await page.evaluate(w => {
    const plan = Store.get('mealPlan'), items = Array.from({ length: 7 }, (_, i) => plan[addDays(w, i)] || []).flat();
    return { items: items.length, slots: [...new Set(items.map(i => i.slot))].sort(), batches: [...new Set(items.map(i => i.batch || 1))], recipes: Store.get('recipes').length, libCopies: Store.get('recipes').filter(r => r.lib).length, retained: { grocery: Store.get('grocery'), pantry: Store.get('pantry'), freezer: Store.get('freezer'), staples: gkit().staples, spend: gkit().spend, budget: gkit().budget }, tab: ui.recTab, prefs: gkit().planPrefs };
  }, ws);
  expect(after.items).toBe(20);
  expect(after.slots).toEqual(['breakfast', 'dinner', 'lunch']);
  expect(after.libCopies).toBe(after.recipes); // every planned ready-made recipe now lives in the recipe box
  expect(after.retained).toEqual(retained);
  expect(after.tab).toBe('plan');
  expect(after.prefs).toMatchObject({ people: 2, budget: 150 });
  await expect(page.locator('#view-title')).toHaveText('Meal plan');

  // Planning again reuses the copies instead of duplicating them, and can replace what is planned.
  await page.evaluate(() => { ui.recTab = 'plan'; render(); });
  await page.click('[data-action="mpwOpen"]');
  await page.click(`[data-action="mpwWeek"][data-v="${ws}"]`);
  await page.click('[data-action="mpwMake"]');
  await page.check('[data-change="mpwReplace"]');
  await page.click('[data-action="mpwApply"]');
  const again = await page.evaluate(w => ({ items: Array.from({ length: 7 }, (_, i) => Store.get('mealPlan')[addDays(w, i)] || []).flat().length, dupes: Object.values(Store.get('recipes').reduce((a, r) => { if (r.lib) a[r.lib] = (a[r.lib] || 0) + 1; return a; }, {})).filter(n => n > 1).length }), ws);
  expect(again).toEqual({ items: 21, dupes: 0 });
  expect(await page.evaluate(() => ({ grocery: Store.get('grocery'), pantry: Store.get('pantry'), freezer: Store.get('freezer'), staples: gkit().staples, spend: gkit().spend, budget: gkit().budget }))).toEqual(retained);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('own recipes are used by their tags, and a tight budget shows as over', async ({ page }) => {
  await open(page);
  const pools = await page.evaluate(() => {
    Store.set('recipes', [{ id: 'own-b', title: 'Family Waffles', tags: ['Breakfast'], servings: 4, cost: 4 }, { id: 'own-d', title: 'Grandma Casserole', tags: [], servings: 6, cost: 12 }]);
    const P = { ...mpwPrefs(), library: false };
    return Object.fromEntries(MSLOTS.map(([k]) => [k, mpwPool(k, P).map(c => c.title)]));
  });
  expect(pools).toEqual({ breakfast: ['Family Waffles'], lunch: ['Grandma Casserole'], dinner: ['Grandma Casserole'], snacks: [] });

  await page.click('[data-action="mpwOpen"]');
  await page.fill('#mpw-budget', '20'); await page.locator('#mpw-budget').dispatchEvent('change');
  await page.click('[data-action="mpwMake"]');
  await expect(page.locator('#view .text-rose-700, #view .dark\\:text-rose-400').first()).toBeVisible();
});
