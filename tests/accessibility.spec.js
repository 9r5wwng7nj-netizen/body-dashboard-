import { test, expect } from '@playwright/test';
import axe from 'axe-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

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


async function prepare(page, theme) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (theme) await page.addInitScript(theme => localStorage.setItem('bd.settings', JSON.stringify({ theme })), theme);
  await page.route('**/*', route => /^(file|data|blob):/.test(route.request().url()) ? route.continue() : route.abort());
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.db && Array.isArray(Store.data.recipes));
  await page.addScriptTag({ content: axe.source });
}
async function violations(page) {
  // Scan a painted frame rather than the transient frame during a theme switch.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ rule: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary })) })));
}

for (const theme of ['light', 'dark']) test('accessible names and contrast across all named pages — ' + theme, async ({ page }) => {
  await prepare(page, theme);
  await page.evaluate(async () => {
    const start = new Date(); start.setHours(8, 0, 0, 0);
    Store.set('workouts', [{ id: 'synthetic-axe-history', name: 'Synthetic training', start: start.toISOString(), end: new Date(+start + 1800000).toISOString(), exercises: [{ name: 'Bench Press (Barbell)', sets: [{ type: 'normal', weight: 40, reps: 8 }] }] }]);
    Store.set('nutrition', { [ymd()]: { weight: 80, entries: [{ id: 'synthetic-axe-entry', name: 'Synthetic breakfast', qty: 1, unit: 'serving', cal: 450, p: 25, c: 50, f: 15, meal: 'breakfast' }] } });
    Store.set('recipes', [{ id: 'synthetic-axe-recipe', title: 'Synthetic stew', servings: 4, ingredients: '1 cup rice', steps: 'Synthetic preparation.', cal: 450, p: 25, c: 50, f: 15 }]);
    await Store.flushDirty();
  });
  const failures = [];
  for (const route of NAMED_PAGES) {
    await openNamedPage(page, route);
    const found = await violations(page);
    if (found.length) failures.push({ location: route.label, found });
  }
  await page.evaluate(() => openSettings());
  const settings = await violations(page); if (settings.length) failures.push({ location: 'Settings', found: settings });
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});

test('dialog focus wraps, background is inert, Escape returns to opener', async ({ page }) => {
  await prepare(page);
  const opener = page.locator('[data-action="openSettings"]');
  await opener.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Settings & Sync' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('#modal-title')).toBeFocused();
  await expect(page.locator('#app-shell')).toHaveAttribute('inert', '');
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Save settings', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('textbox', { name: 'Your name (for greeting)' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(await page.locator('#app-shell').evaluate(el => el.inert)).toBe(false);
});

test('visible labels focus their fields and repeated dialog rendering retains input focus', async ({ page }) => {
  await prepare(page);
  await page.locator('[data-action="openSettings"]').click();
  await page.getByText('Your name (for greeting)', { exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Your name (for greeting)' });
  await expect(input).toBeFocused();
  await input.fill('Sam');
  await page.evaluate(() => openSettings());
  await expect(page.getByRole('textbox', { name: 'Your name (for greeting)' })).toBeFocused();
});

test('bottom navigation and settings are reachable without a drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  await expect(page.locator('#sidebar')).toHaveCount(0);
  const settings = page.getByRole('button', { name: 'Settings & Sync', exact: true });
  await settings.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(settings).toBeFocused();
  const workouts = page.locator('#bottom-bar [data-view="fitness"]');
  await workouts.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#view-title')).toBeFocused();
});

test('named pages support keyboard entry/back focus and notices are announced', async ({ page }) => {
  await prepare(page);
  await page.locator('#bottom-bar [data-view="fitness"]').click();
  await expect(page.locator('#view-title')).toBeFocused();
  const history = page.locator('#view [data-action="trainPage"][data-page="history"]');
  await history.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#view-title')).toBeFocused();
  await expect(page.locator('#view-title')).toHaveText('Workout history');
  const back = page.locator('#view [data-action="pageHome"][data-view="fitness"]');
  await expect(back).toBeVisible(); await back.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#view-title')).toBeFocused();
  await expect(page.locator('#view-title')).toHaveText('Train');
  await expect(page.locator('#view [data-action="trainPage"][data-page="history"]')).toBeVisible();
  await page.evaluate(() => { toast('Saved successfully'); toast('Could not save', 'error'); });
  await expect(page.locator('#status-announcement')).toHaveText('Saved successfully');
  await expect(page.getByRole('alert')).toHaveText('Could not save');
});

test('custom actions and hidden file pickers can be used by keyboard', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    const el = document.createElement('span'); el.dataset.action = 'go'; el.dataset.view = 'recipes'; el.textContent = 'Open Recipes';
    document.querySelector('#view').appendChild(el); enhanceAccessibility();
  });
  await page.getByRole('button', { name: 'Open Recipes', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#view-title')).toHaveText('Library');
  const chooser = page.waitForEvent('filechooser'); // listen well before Enter: turning on file-chooser capture is not instant
  await page.evaluate(() => Modal.open(modalShell('Photo upload', '<label class="btn">Choose photo<input type="file" class="hidden"></label>')));
  const picker = page.getByRole('button', { name: 'Choose photo', exact: true });
  await picker.focus();
  await expect(picker).toBeFocused();
  await page.keyboard.press('Enter');
  expect((await chooser).isMultiple()).toBe(false);
});

test('common editing dialogs have accessible controls', async ({ page }) => {
  await prepare(page);
  const failures = [];
  for (const kind of ['exercise', 'recipe', 'food']) {
    await page.evaluate(kind => {
      if (kind === 'exercise') libModal(null);
      if (kind === 'recipe') recEditor(null);
      if (kind === 'food') foodEditor(null);
    }, kind);
    const found = await violations(page); if (found.length) failures.push({ kind, found });
    await page.keyboard.press('Escape');
  }
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
