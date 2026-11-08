import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import axe from 'axe-core';
import { serveRepo, stopServer } from './serve.js';

const APP = pathToFileURL(path.resolve('index.html')).href;
test.use({ timezoneId: 'America/New_York' });
async function open(page, url = APP) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-11-04T12:00:00-05:00'));
  await page.goto(url);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Array.isArray(Store.data.recipes));
  await page.evaluate(async () => { A.helpDismiss({ dataset: { what: 'tour' } }); S.newsSeen = RELEASES[0].id; S.backupLater = ymd(); await Store.flushDirty(); render(); });
  return errors;
}

test('Today opens existing food, weight and workout flows and preserves calorie/card preferences', async ({ page }) => {
  const errors = await open(page);
  const today = page.locator('[data-dash-card="today"]');
  await expect(today).toContainText('Nothing logged yet');
  await expect(today).toContainText('No weigh-in logged today');
  await today.getByRole('button', { name: 'Log food', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => ui.lf.date)).toBe('2026-11-04');
  await page.keyboard.press('Escape');
  await today.getByRole('button', { name: 'Log weight', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('spinbutton', { name: /Scale weight/ }).fill('180');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('#save-state')).toHaveText('Saved on device');
  expect(await page.evaluate(() => day(ymd()).weight)).toBeCloseTo(180 * .45359237);
  await expect(today).not.toContainText('No weigh-in logged today');
  await today.getByRole('button', { name: 'Start workout', exact: true }).click();
  await expect(page.locator('#view-title')).toHaveText('Workouts');
  await page.locator('#view [data-action="startEmpty"]').click();
  await expect(page.locator('[data-wctx="active"]')).toBeVisible();
  const id = await page.evaluate(() => Store.get('activeWorkout').id);
  await page.evaluate(() => go('dashboard'));
  await today.getByRole('button', { name: 'Resume workout', exact: true }).click();
  await expect(page.locator('[data-wctx="active"]')).toBeVisible();
  expect(await page.evaluate(() => Store.get('activeWorkout').id)).toBe(id);
  await page.evaluate(() => {
    ensureDay(ymd()).entries.push({ id: 'zero', name: 'Synthetic zero calorie drink', cal: 0, p: 0, c: 0, f: 0 });
    S.calBig = 'eaten'; S.hiddenCards = ['nutrition']; S.cardOrder = ['weight', 'today', 'training', 'meals', 'nutrition'];
    Store.save('nutrition'); saveSettings(); go('dashboard');
  });
  await expect(today.locator('.text-3xl')).toHaveText('0');
  await expect(today).toContainText(/of [\d,]+ kcal/);
  await expect(today).not.toContainText('Nothing logged yet');
  expect(await page.locator('[data-dash-card]').evaluateAll(els => els.map(el => el.dataset.dashCard))).toEqual(['weight', 'today', 'training']);
  await page.evaluate(async () => { S.hiddenCards.push('today'); saveSettings(); await Store.flushDirty(); });
  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.nutrition);
  await expect(page.locator('[data-dash-card="today"]')).toHaveCount(0);
  expect(await page.evaluate(() => [S.calBig, day(ymd()).entries[0].id, S.cardOrder[0]])).toEqual(['eaten', 'zero', 'weight']);
  expect(errors).toEqual([]);
});

test('completed week counts use local Monday boundaries, exclude future dates and follow edits', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    const w = (id, start) => ({ id, name: id, start, end: new Date(new Date(start).getTime() + 60000).toISOString(), exercises: [{ name: 'Squat', sets: [{ weight: 40, reps: 5, type: 'normal' }] }] });
    Store.set('workouts', [w('Sunday local, Monday UTC', '2026-11-01T23:50:00-05:00'), w('Monday', '2026-11-02T00:10:00-05:00'), w('Tuesday', '2026-11-03T08:00:00-05:00'), w('Tomorrow', '2026-11-05T08:00:00-05:00'), w('Next week', '2026-11-09T08:00:00-05:00')]);
    sortWorkouts(); render();
  });
  await expect(page.locator('[data-dash-card="today"]')).toContainText('2 completed this week');
  await expect(page.locator('[data-dash-card="training"]')).toContainText('2 completed this week');
  await page.evaluate(() => { ui.fitTab = 'workout'; go('fitness'); });
  await expect(page.locator('.stat').filter({ hasText: 'Completed this week' })).toContainText('2');
  await page.evaluate(async () => {
    A.workoutEdit({ dataset: { id: 'Tuesday' } }); ui.editW._date = '2026-10-31'; await A.editSave();
  });
  expect(await page.evaluate(() => completedWorkoutsThisWeek().map(w => w.id))).toEqual(['Monday']);
  await page.evaluate(async () => {
    A.workoutEdit({ dataset: { id: 'Tomorrow' } }); ui.editW._date = '2026-11-04'; await A.editSave();
    workoutSummaryModal(W().find(w => w.id === 'Tomorrow'));
  });
  await expect(page.getByRole('dialog')).toContainText('2 completed this week');
  await page.keyboard.press('Escape');
  await page.evaluate(() => startWorkout({ name: 'Synthetic active', exercises: [] }));
  await expect(page.locator('[data-wctx="active"]')).toContainText('2 completed this week');
  expect(await page.evaluate(() => completedWorkoutsThisWeek().length)).toBe(2);
  await page.evaluate(() => { ui.fitTab = 'history'; render(); });
  await expect(page.locator('#view')).toContainText('Future-dated');
  expect(await page.evaluate(() => W().map(w => w.id).sort())).toEqual(['Monday', 'Next week', 'Sunday local, Monday UTC', 'Tomorrow', 'Tuesday']);
  expect(errors).toEqual([]);
});

test('weight chart handles empty, one reading, sparse dates, units and the existing seven-day mean', async ({ page }) => {
  const errors = await open(page);
  const card = page.locator('[data-dash-card="weight"]');
  await expect(card).toContainText('No weigh-ins logged yet');
  await page.evaluate(() => { S.unit = 'kg'; Store.set('nutrition', { '2026-11-04': { weight: 80, entries: [] } }); render(); });
  await expect(card).toContainText('One reading so far');
  await expect(card.locator('[data-weight-reading]')).toHaveCount(1);
  await expect(card.locator('polyline')).toHaveCount(0);
  await page.evaluate(() => {
    Store.set('nutrition', { '2026-10-20': { weight: 90, entries: [] }, '2026-11-01': { weight: 82, entries: [] }, '2026-11-04': { weight: 80, entries: [] }, '2026-11-06': { weight: 70, entries: [] } }); render();
  });
  await expect(card).toContainText('Seven-day average: 81 kg, using 2 readings');
  await expect(card).toContainText('Latest measurement: 80 kg on Nov 4, 2026');
  await expect(card.locator('[data-weight-reading]')).toHaveCount(3);
  await expect(card.locator('polyline[data-weight-trend]')).toHaveCount(1);
  const x = await card.locator('[data-weight-reading]').evaluateAll(els => els.map(el => +el.getAttribute('cx')));
  expect((x[1] - x[0]) / (x[2] - x[1])).toBeCloseTo(12 / 3);
  await page.evaluate(() => { S.unit = 'lbs'; render(); });
  await expect(card).toContainText('178.6 lbs');
  expect(await page.evaluate(() => Object.values(N()).filter(x => x.weight != null).map(x => x.weight))).toEqual([90, 82, 80, 70]);
  await card.screenshot({ path: 'output/playwright/weight-trend.png' });
  expect(errors).toEqual([]);
});

test('recipe cards keep access and known zero nutrition with missing, broken and unavailable local photos', async ({ page }) => {
  const errors = await open(page);
  await page.route('https://example.invalid/**', route => route.abort());
  await page.evaluate(async () => {
    await Photos.put('rp_broken', new Blob(['synthetic invalid photo'], { type: 'image/png' }));
    Store.set('recipes', [
      { id: 'missing', title: 'Synthetic missing photo', cal: 0, p: 0, ingredients: 'Water', steps: 'Serve', servings: 1 },
      { id: 'remote', title: 'Synthetic remote photo', img: 'https://example.invalid/image.jpg', ingredients: '', steps: '' },
      { id: 'local', title: 'Synthetic unavailable local', photo: 'rp_not_here', ingredients: '', steps: '' },
      { id: 'broken', title: 'Synthetic broken blob', photo: 'rp_broken', ingredients: '', steps: '' }
    ]); ui.recTab = 'recipes'; go('recipes');
  });
  const missing = page.locator('[data-action="recView"][data-id="missing"]');
  await expect(missing).toContainText('Per serving: 0 kcal · 0 g protein');
  await expect(missing).toContainText('No photo yet');
  await expect(page.locator('[data-id="remote"] img')).toBeHidden();
  await expect(page.locator('[data-id="broken"] img')).toBeHidden();
  for (const id of ['missing', 'remote', 'local', 'broken']) {
    await page.locator(`[data-action="recView"][data-id="${id}"]`).focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toContainText('Synthetic');
    await page.keyboard.press('Escape');
    await expect(page.locator(`[data-action="recView"][data-id="${id}"]`)).toBeFocused();
  }
  expect(await page.evaluate(() => Store.get('recipes').find(r => r.id === 'remote').img)).toBe('https://example.invalid/image.jpg');
  expect(errors).toEqual([]);
});

for (const theme of ['light', 'dark']) test(`390px ${theme}: enlarged text, touch targets and accessible dashboard semantics`, async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'America/New_York' });
  const page = await context.newPage();
  try {
    const errors = await open(page);
    await page.evaluate(theme => {
      S.theme = theme; S.unit = 'kg'; applyTheme(); ensureDay(ymd()).weight = 80;
      ensureDay(ymd()).entries.push({ id: 'food', name: 'Synthetic meal', cal: 600, p: 25, c: 50, f: 10 });
      document.documentElement.style.fontSize = '200%'; render();
    }, theme);
    // Reserve a scrollbar and use a portable font to catch the Linux runner's narrower content area.
    await page.addStyleTag({ content: '#view { scrollbar-gutter: stable; } html { font-family: Arial, sans-serif; }' });
    const dimensions = await page.evaluate(() => ({ page: document.documentElement.scrollWidth <= innerWidth, main: $('#view').scrollWidth <= $('#view').clientWidth, buttons: $$('[data-dash-card="today"] button').map(b => ({ h: b.getBoundingClientRect().height, w: b.getBoundingClientRect().width, fits: b.scrollWidth <= b.clientWidth })) }));
    expect(dimensions.page, JSON.stringify(dimensions)).toBe(true); expect(dimensions.main, JSON.stringify(dimensions)).toBe(true);
    expect(dimensions.buttons.every(b => b.h >= 44 && b.w >= 44 && b.fits)).toBe(true);
    // A tall card must remain scrollable: every action can be brought fully above the phone bar.
    for (const button of await page.locator('[data-dash-card="today"] button').all()) {
      await button.scrollIntoViewIfNeeded();
      const bounds = await button.evaluate(el => { const b = el.getBoundingClientRect(), main = document.querySelector('#view').getBoundingClientRect(); return { top: b.top, bottom: b.bottom, mainTop: main.top, mainBottom: main.bottom }; });
      expect(bounds.top).toBeGreaterThanOrEqual(bounds.mainTop - 1);
      expect(bounds.bottom).toBeLessThanOrEqual(bounds.mainBottom + 1);
    }
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.html) })));
    expect(violations).toEqual([]);
    await page.locator('#view').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: `output/playwright/dashboard-${theme}-390-enlarged.png` });
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; render(); });
    await page.locator('#view').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: `output/playwright/dashboard-${theme}-390.png`, fullPage: true });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
      Store.set('recipes', [{ id: 'layout', title: 'Synthetic lentil soup with a long descriptive recipe name', servings: 4, cal: 250, p: 15, ingredients: 'Lentils', steps: 'Cook' }]);
      ui.recTab = 'recipes'; go('recipes');
    });
    for (const view of ['recipes', 'fitness']) {
      await page.evaluate(view => { ui.fitTab = 'workout'; go(view); }, view);
      expect(await page.locator('#view').evaluate(el => el.scrollWidth <= el.clientWidth), `${view} fits at 200%`).toBe(true);
      const issues = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => v.id));
      expect(issues, view).toEqual([]);
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; ui.recTab = 'recipes'; go('recipes'); });
    await page.screenshot({ path: `output/playwright/recipes-${theme}-390.png`, fullPage: true });
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

test('backup restores identifiers, units, recipe and progress photo bytes, then loads local photos offline', async ({ page, context }) => {
  const server = await serveRepo();
  try {
    const errors = await open(page, `http://localhost:${server.address().port}/index.html?pwa`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    const restored = await page.evaluate(async () => {
      const canvas = document.createElement('canvas'); canvas.width = 12; canvas.height = 12;
      canvas.getContext('2d').fillRect(0, 0, 12, 12);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      await Photos.put('rp_synthetic', blob); await Photos.put('progress_synthetic', blob);
      Store.set('recipes', [{ id: 'recipe-stable-id', title: 'Synthetic offline soup', photo: 'rp_synthetic', img: 'https://example.invalid/original.jpg', cal: 200, p: 10, servings: 4, ingredients: 'Water', steps: 'Serve' }]);
      Store.set('photoMeta', [{ id: 'progress_synthetic', date: ymd(), pose: 'front' }]);
      Store.set('nutrition', { [ymd()]: { weight: 80, entries: [{ id: 'entry-stable-id', name: 'Synthetic meal', cal: 200 }] } });
      S.unit = 'kg'; saveSettings(); await Store.flushDirty();
      const backup = parseBackup(JSON.stringify(await buildBackupPayload()));
      await idbClear('photos'); Store.set('recipes', []); Store.set('nutrition', {}); await Store.flushDirty();
      await commitBackupImport(planBackupImport(backup, 'replace'));
      const photoBytes = await Promise.all(backup.assets.photos.map(async p => ({ id: p.id, before: p.data, after: await blobToDataUrl(await Photos.get(p.id)) })));
      return { version: backup.version, photoBytes, unit: S.unit, recipe: Store.get('recipes')[0], entry: day(ymd()).entries[0].id };
    });
    expect(restored.version).toBe(2); expect(restored.unit).toBe('kg'); expect(restored.entry).toBe('entry-stable-id');
    expect(restored.recipe.id).toBe('recipe-stable-id'); expect(restored.recipe.photo).toBe('rp_synthetic');
    expect(restored.recipe.img).toBe('https://example.invalid/original.jpg');
    expect(restored.photoBytes).toHaveLength(2);
    for (const photo of restored.photoBytes) expect(photo.after).toBe(photo.before);
    await context.setOffline(true);
    await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data.recipes?.[0]?.id === 'recipe-stable-id');
    await page.evaluate(() => { ui.recTab = 'recipes'; go('recipes'); });
    const img = page.locator('[data-id="recipe-stable-id"] img');
    await expect(img).toHaveJSProperty('naturalWidth', 12);
    await page.locator('[data-id="recipe-stable-id"]').click();
    await expect(page.getByRole('dialog')).toContainText('Synthetic offline soup');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { ui.nutTab = 'body'; go('nutrition'); });
    await page.evaluate(() => A.photoView({ dataset: { id: 'progress_synthetic' } }));
    await expect(page.locator('#modal img[data-photo="progress_synthetic"]')).toHaveJSProperty('naturalWidth', 12);
    expect(await page.evaluate(async () => (await Photos.get('progress_synthetic')).size)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  } finally { await context.setOffline(false); await stopServer(server); }
});
