// Save a recipe from a link: a link (or a post's caption) becomes a recipe, and Android's share menu opens the sheet.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const APP = pathToFileURL(path.resolve('index.html')).href;
async function open(page, query = '') {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  await page.route('**/*', route => (/^(file|data|blob):/.test(route.request().url()) ? route.continue() : route.abort()));
  await page.goto(APP + query);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  await page.evaluate(() => { S.tour = 'done'; saveSettings(); });
  return errors;
}
const openSheet = async page => { await page.evaluate(() => { Modal.close(); quickAddForm('link'); }); await expect(page.locator('#sh-text')).toBeVisible(); };

test('a recipe link becomes a recipe that keeps its link and note', async ({ page }) => {
  const errors = await open(page);
  await openSheet(page);
  await page.fill('#sh-text', 'Try this one https://www.allrecipes.com/recipe/12345/easy-chili/');
  await page.fill('#sh-title', 'Easy chili');
  await page.click('#modal [data-action="shareSave"]');
  expect(await page.evaluate(() => Store.get('recipes').filter(r => r.title === 'Easy chili').map(r => [r.source, r.notes]))).toEqual([['https://www.allrecipes.com/recipe/12345/easy-chili/', 'Try this one']]);

  // A video post works the same way: it is saved as a recipe with its link.
  await openSheet(page);
  await page.fill('#sh-text', 'https://www.instagram.com/reel/C8abc123/');
  await page.fill('#sh-title', 'Aldi sheet-pan dinner');
  await page.click('#modal [data-action="shareSave"]');
  expect(await page.evaluate(() => Store.get('recipes').some(r => r.title === 'Aldi sheet-pan dinner' && r.source === 'https://www.instagram.com/reel/C8abc123/'))).toBe(true);
  expect(errors, errors.join('\n')).toEqual([]);
});

test("Android's share menu opens the sheet already filled in", async ({ page }) => {
  await open(page, '?share_title=Weeknight%20chili&share_text=Looks%20easy&share_url=https%3A%2F%2Fwww.budgetbytes.com%2Fchili%2F');
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#sh-text')).toHaveValue('Looks easy https://www.budgetbytes.com/chili/');
  await expect(page.locator('#sh-title')).toHaveValue('Weeknight chili');
  expect(await page.evaluate(() => location.search)).toBe('');
  const manifest = await page.evaluate(() => fetch('./manifest.webmanifest').then(r => r.json()).catch(() => null));
  if (manifest) expect(manifest.share_target.params).toEqual({ title: 'share_title', text: 'share_text', url: 'share_url' });
});

test('a pasted caption with a recipe fills in the ingredients and steps', async ({ page }) => {
  const errors = await open(page);
  const caption = `https://www.facebook.com/share/r/1AbCdEf/
Easy Aldi Sheet-Pan Chicken 🍗🔥
Feeds 4 in 30 minutes!
🛒 Ingredients:
- 1.5 lb chicken thighs
- 1 lb baby potatoes
- 2 bell peppers
- 2 tbsp olive oil
📝 Instructions:
1. Heat oven to 425°F.
2. Toss everything with oil and salt on a sheet pan.
3. Roast 25 minutes until golden.
#easydinner #aldifinds #mealprep`;
  await openSheet(page);
  await page.fill('#sh-text', caption);
  await expect(page.locator('#sh-hint')).toHaveText(/Found 4 ingredients and 3 steps/);
  await page.click('#modal [data-action="shareSave"]');
  const r = await page.evaluate(() => Store.get('recipes').find(x => (x.source || '').includes('facebook.com')));
  expect(r.title).toBe('Easy Aldi Sheet-Pan Chicken 🍗🔥');
  expect(r.ingredients.split('\n')).toEqual(['1.5 lb chicken thighs', '1 lb baby potatoes', '2 bell peppers', '2 tbsp olive oil']);
  expect(r.steps.split('\n')).toEqual(['Heat oven to 425°F.', 'Toss everything with oil and salt on a sheet pan.', 'Roast 25 minutes until golden.']);
  expect(r.notes).toBe('');

  // A caption that lists ingredients on one line works too.
  expect(await page.evaluate(() => parseRecipeText('Quick tacos\nIngredients: 1 lb ground beef, 8 tortillas, 1 cup salsa\nDirections: Brown the beef. Fill the tortillas.'))).toMatchObject({ title: 'Quick tacos', ingredients: '1 lb ground beef\n8 tortillas\n1 cup salsa', steps: 'Brown the beef.\nFill the tortillas.' });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('with the link reader, a recipe page fills in the whole recipe', async ({ browser }) => {
  // The reader only answers the hosted app, so this runs from a local server with the reader faked.
  const { serveRepo, stopServer } = await import('./serve.js');
  const server = await serveRepo(), base = `http://localhost:${server.address().port}`;
  const context = await browser.newContext(), page = await context.newPage(), asked = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await context.route('https://life-dashboard-reader.lifedashboard-9r5w.workers.dev/**', route => {
    const url = new URL(route.request().url()).searchParams.get('url'); asked.push(url);
    const body = { url, title: 'Best Chili', image: 'https://blog.example/chili.jpg', siteName: 'blog.example', author: 'Pat', recipe: { title: 'Best Chili', ingredients: ['2 lb ground beef', '2 cans beans'], steps: ['Brown the beef.', 'Simmer.'], servings: 6, time: 75, image: 'https://blog.example/chili.jpg', category: ['Dinner'], cuisine: [], calories: 420 }, text: '' };
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': base }, body: JSON.stringify(body) });
  });
  try {
    await page.goto(`${base}/index.html`);
    await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
    await page.evaluate(() => { S.tour = 'done'; saveSettings(); Store.set('recipes', []); });
    await openSheet(page);
    await page.fill('#sh-text', 'https://blog.example/recipes/best-chili');
    await expect(page.locator('#sh-hint')).toContainText('read from the page');
    await page.click('#modal [data-action="shareSave"]');
    await expect(page.locator('#modal')).toBeHidden();
    expect(await page.evaluate(() => Store.get('recipes').map(r => [r.title, r.ingredients, r.steps, r.servings, r.time, r.cal, r.img, r.tags]))).toEqual([['Best Chili', '2 lb ground beef\n2 cans beans', 'Brown the beef.\nSimmer.', 6, 75, 420, 'https://blog.example/chili.jpg', ['Dinner']]]);
    expect(asked).toEqual(['https://blog.example/recipes/best-chili']);
    expect(errors).toEqual([]);
  } finally { await context.close(); await stopServer(server); }
});

test('Facebook and Instagram links are never sent to the reader', async ({ page }) => {
  await open(page);
  expect(await page.evaluate(() => ['https://www.facebook.com/share/r/1Ab/', 'https://fb.watch/xyz/', 'https://www.instagram.com/reel/C8/', 'https://www.budgetbytes.com/x/'].map(readerSkips))).toEqual([true, true, true, false]);
});
