// Milestone 1 safety regressions; synthetic browser profiles and an intercepted provider only.
// No request leaves the machine; Google sign-in and the Drive API are both intercepted.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';import os from 'node:os';
import { serveRepo, stopServer } from './serve.js';

const TOKEN = 'test-token';
let server, base;const ownedProfiles=[];
test.afterEach(async()=>{for(const {context,dir} of ownedProfiles.splice(0)){await context.close().catch(()=>{});await fs.rm(dir,{recursive:true,force:true});}});
test.beforeAll(async () => { server = await serveRepo(); base = `http://localhost:${server.address().port}`; });
test.afterAll(() => stopServer(server));

// The hidden app folder: the sync file, with the version number Drive bumps on every save, and the
// dated daily copies (`copies`, newest last), which can be listed, downloaded and deleted.
function fakeDrive() {
  const drive = { file: null, saves: 0, copies: [], made: 0, writes:[], markers:[], gauth: { ready: false, refuse: false, calls: [] } };
  // Google v3 need not provide a browser-readable ETag; v2 returns its documented JSON field.
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
  const json = (route, body, status = 200, extra={}) => route.fulfill({ status, headers: { ...cors, 'Content-Type': 'application/json',...extra }, body: JSON.stringify(body) });
  drive.copy = (name, body = '{}') => { const c = { id: 'copy-' + (++drive.made), name, body,version:'1', size: String(body.length), createdTime: new Date().toISOString() }; drive.copies.push(c); return c; };
  // The dedicated Body broker: off unless a test turns `gauth.ready` on.
  const reader = context => context.route('https://body-dashboard-auth.lifedashboard-9r5w.workers.dev/**', route => {
    const req = route.request(), url = new URL(req.url());
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (url.pathname === '/google/ready') return json(route, { ready: drive.gauth.ready, clientId:'test-client' });
    const body = JSON.parse(req.postData() || '{}'); drive.gauth.calls.push({ path: url.pathname, body });
    if (url.pathname === '/google/token') return json(route, { access_token: TOKEN, expires_in: 3599, refresh_token: 'refresh-1' });
    if (url.pathname === '/google/refresh') return drive.gauth.refuse ? json(route, { error: 'invalid_grant' }, 400) : json(route, { access_token: TOKEN, expires_in: 3599, refresh_token: null });
    if (url.pathname === '/google/revoke') return json(route, { revoked: true });
    return json(route, { error: 'not found' }, 404);
  });
  drive.attach = context => reader(context).then(() => context.route('https://www.googleapis.com/**', async route => {
    const req = route.request(), url = new URL(req.url()), method = req.method();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (req.headers().authorization !== `Bearer ${TOKEN}`) return json(route, { error: 'unauthorized' }, 401);
    const save = text => { drive.saves++; drive.file = { id: 'file-1', version: String(+(drive.file?.version || 0) + 1), body: text }; if(drive.corruptWrite) drive.file.body = drive.corruptWrite(text); return json(route, { id: drive.file.id, version: drive.file.version }); };
    if (url.pathname === '/drive/v3/files') {
      const sync = drive.file ? [{ id: drive.file.id, name: 'body-dashboard-sync.json', version: drive.file.version }] : [];
      return json(route, { files: (url.searchParams.get('q') || '').includes("name='") ? [...sync,...(drive.duplicates||[])] : [...sync, ...drive.copies.map(({ id, name, size, createdTime }) => ({ id, name, size, createdTime }))] });
    }
    if (url.pathname === '/upload/drive/v3/files' && method === 'POST') {
      const buf = req.postDataBuffer(), text = buf.toString('latin1'), first = text.indexOf('\r\n\r\n') + 4, second = text.indexOf('\r\n\r\n', first) + 4;
      const meta = JSON.parse(text.slice(first, text.indexOf('\r\n--', first))), bytes = buf.subarray(second, text.lastIndexOf('\r\n--'));
      if (meta.name.startsWith('body-dashboard-photo-')) { const c = drive.copy(meta.name, bytes); return json(route, { id: c.id }); }
      const body = bytes.toString('utf8');
      if (meta.name !== 'body-dashboard-sync.json') { const c = drive.copy(meta.name, body); return json(route, { id: c.id, version: '1' }); }
      return save(body);
    }
    if(url.pathname.startsWith('/drive/v2/files/')){const id=decodeURIComponent(url.pathname.split('/').pop()),f=id==='file-1'?drive.file:drive.copies.find(c=>c.id===id);drive.markers.push({id,fields:url.searchParams.get('fields')});if(!f)return json(route,{error:'notFound'},404);return json(route,{id:f.id,title:f.name||'body-dashboard-sync.json',version:f.version,...(drive.omitEtag?{}:{etag:drive.weakEtag?`W/\"bd-${f.version}\"`:`\"bd-${f.version}\"`})});}
    const updated = drive.copies.find(c => url.pathname === '/upload/drive/v2/files/' + c.id);
    if (updated && method === 'PUT') {drive.writes.push({id:updated.id,method,etag:req.headers()['if-match'],body:req.postData()});if(updated.name.startsWith('body-dashboard-probe-')&&!drive.ignoreIfMatch&&req.headers()['if-match']!==`\"bd-${updated.version}\"`)return json(route,{error:'conditionNotMet'},412);updated.version=String(+updated.version+1); updated.body = req.postData(); updated.updates = (updated.updates || 0) + 1; return json(route, { id: updated.id,version:updated.version }); }
    const copy = drive.copies.find(c => url.pathname === '/drive/v3/files/' + c.id);
    if (copy && method === 'DELETE') { drive.copies = drive.copies.filter(c => c !== copy); return route.fulfill({ status: 204, headers: cors }); }
    if(copy&&url.searchParams.get('alt')!=='media')return json(route,{id:copy.id,name:copy.name,version:copy.version});
    if (copy) return route.fulfill({ status: 200, headers: { ...cors, 'Content-Type': copy.name.startsWith('body-dashboard-photo-') ? 'image/png' : 'application/json' }, body: copy.body });
    if (url.pathname === '/upload/drive/v2/files/file-1' && method === 'PUT') {drive.writes.push({id:'file-1',method,etag:req.headers()['if-match'],body:req.postData()});if(drive.beforePatch)await drive.beforePatch();if(req.headers()['if-match']!==`"bd-${drive.file.version}"`)return json(route,{error:'conditionNotMet'},412);return save(req.postData());}
    if (url.pathname === '/drive/v3/files/file-1' && url.searchParams.get('alt') === 'media' && drive.beforeLoad) await drive.beforeLoad();
    if (url.pathname === '/drive/v3/files/file-1') return url.searchParams.get('alt') === 'media' ? route.fulfill({ status: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: drive.file.body }) : json(route, { id:drive.file.id,name:'body-dashboard-sync.json',version: drive.file.version });
    return json(route, { error: 'not found' }, 404);
  }));
  return drive;
}

// A tab of the app. `answer` decides each confirm dialog; by default every one is accepted.
async function tab(context, { connected = true, answer = () => true } = {}) {
  const page = await context.newPage(), errors = [], asked = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('dialog', d => { asked.push(d.message()); return answer(d.message()) ? d.accept() : d.dismiss(); });
  await page.goto(`${base}/index.html`);
  await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready && Store.data && Array.isArray(Store.data.recipes));
  await page.evaluate(([token, on]) => { DRIVE.clientId = 'test-client'; if (on) localStorage.setItem('bd.sync', JSON.stringify({ on: true, token, exp: Date.now() + 3600e3, ...JSON.parse(localStorage.getItem('bd.sync') || '{}') })); }, [TOKEN, connected]);
  return { page, errors, asked, context };
}
// Each device starts empty (no sample routines or recipes), with addRecipe(title) for quick records.
const quickRecords = () => {
  try { localStorage.setItem('bd.seeded', '1'); } catch (e) {}
  window.addRecipe = title => { const r = { id: uid(), title, ingredients: '', steps: '', created: new Date().toISOString() }; Store.get('recipes').push(r); Store.save('recipes'); return r; };
};
async function device(browser, drive, options) {
  let context;if(browser.browserType().name()==='webkit'){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'bd-sync-synthetic-'));context=await browser.browserType().launchPersistentContext(dir,{headless:true,viewport:{width:390,height:844},isMobile:true,hasTouch:true});ownedProfiles.push({context,dir});}else context=await browser.newContext(options?.touch?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{});
  await context.addInitScript(quickRecords);
  // Isolate the public production client configuration with a synthetic ID,
  // also after a sign-in redirect reloads the page.
  await context.route(url => url.pathname === '/index.html', async route => {
    const res = await route.fetch(), body = (await res.text()).replace(/const DRIVE = \{ clientId: '[^']*'/, "const DRIVE = { clientId: 'test-client'");
    return route.fulfill({ response: res, body });
  });
  await drive.attach(context);
  return tab(context, options);
}
// A tab that loads already connected starts its own sync; let that finish before asking for another.
const sync = async page => {
  await page.waitForFunction(() => !Sync.busy);
  return page.evaluate(async () => { await Store.flushDirty(); await Sync.run({ announce: true }); return syncMeta(); });
};
const titles = page => page.evaluate(() => Store.get('recipes').map(t => t.title).sort());

const syntheticRoutine = { id: 'synthetic-m1-routine', name: 'Synthetic original day', notes: '', exercises: [{ name: 'Bench Press (Barbell)', sets: 3, reps: '5', rest: 90 }] };
const syntheticHistory = { id: 'synthetic-m1-history', name: 'Synthetic completed workout', start: '2026-10-19T12:00:00.000Z', end: '2026-10-19T13:00:00.000Z', notes: '', exercises: [{ name: 'Bench Press (Barbell)', sets: [{ id: 'synthetic-m1-set', weight: 62.5123456, reps: 6, done: true }] }] };
async function linkSecondDevice(drive, desktop, phone) {
  expect((await sync(desktop.page)).error).toBe('');
  await sync(phone.page);
  await phone.page.click('[data-action="syncFirst"][data-mode="theirs"]');
  await phone.page.waitForFunction(() => !Sync.busy && syncMeta().last);
  expect(await phone.page.evaluate(() => syncMeta().error)).toBe('');
}

test('concurrent changes to the same routine field pause without choosing a timestamp winner', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(r => Store.set('routines', [r]), syntheticRoutine);
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic desktop choice'; await Store.save('routines'); await Store.flushDirty(); });
    await phone.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic phone choice'; await Store.save('routines'); await Store.flushDirty(); setSyncMeta({ changed: new Date(Date.now()+60000).toISOString() }); });
    expect((await sync(desktop.page)).error).toBe('');
    const remote = drive.file.body, writes = drive.writes.length;
    expect((await sync(phone.page)).error.toLowerCase()).toContain('conflict');
    expect(await phone.page.evaluate(() => Store.get('routines')[0].name)).toBe('Synthetic phone choice');
    expect(drive.file.body).toBe(remote);
    expect(drive.writes).toHaveLength(writes);
    await phone.page.reload(); await phone.page.waitForFunction(() => Store.ready);
    expect(await phone.page.evaluate(() => Store.get('routines')[0].name)).toBe('Synthetic phone choice');
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('deletion versus concurrent history edit requires review and preserves both versions', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(w => Store.set('workouts', [w]), syntheticHistory);
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(async () => { Store.set('workouts', []); await Store.flushDirty(); });
    await phone.page.evaluate(async () => { Store.get('workouts')[0].notes = 'Synthetic note entered offline'; await Store.save('workouts'); await Store.flushDirty(); });
    expect((await sync(desktop.page)).error).toBe('');
    const remote = drive.file.body, writes = drive.writes.length;
    expect((await sync(phone.page)).error.toLowerCase()).toContain('conflict');
    expect(await phone.page.evaluate(() => Store.get('workouts')[0].notes)).toBe('Synthetic note entered offline');
    expect(drive.file.body).toBe(remote);
    expect(drive.writes).toHaveLength(writes);
    await phone.page.reload(); await phone.page.waitForFunction(() => Store.ready);
    expect(await phone.page.evaluate(() => Store.get('workouts')[0].exercises[0].sets[0].weight)).toBe(syntheticHistory.exercises[0].sets[0].weight);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('a referenced photo absent locally and in Drive prevents a complete photo status', async ({ browser }) => {
  const drive = fakeDrive(), d = await device(browser, drive);
  try {
    await d.page.evaluate(async () => { Store.set('recipes', [{ id: 'synthetic-missing-image-record', title: 'Synthetic meal without bytes', photo: 'rp_synthetic_missing_bytes' }]); await Store.flushDirty(); });
    const m = await sync(d.page);
    expect(m.error || '').toBe('');
    expect(m.photosMissing).toBe(1);
    expect(m.photosLeft).toBeGreaterThan(0);
    expect(await d.page.evaluate(() => Sync.status().toLowerCase())).toContain('photo');
    expect(await d.page.evaluate(() => photoKeys())).toEqual([]);
    expect(JSON.parse(drive.file.body).data.recipes[0].photo).toBe('rp_synthetic_missing_bytes');
  } finally { await d.context.close(); }
});

test('local input saved during a remote download survives sync and reload', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(() => addRecipe('Synthetic agreed record'));
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(() => addRecipe('Synthetic remote addition'));
    expect((await sync(desktop.page)).error).toBe('');
    let release, entered;
    const enteredGate = new Promise(resolve => { entered = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    drive.beforeLoad = async () => { drive.beforeLoad = null; entered(); await gate; };
    const running = sync(phone.page);
    await enteredGate;
    await phone.page.evaluate(async () => { addRecipe('Synthetic typing during download'); await Store.flushDirty(); });
    release(); await running;
    expect(await titles(phone.page)).toContain('Synthetic typing during download');
    await phone.page.reload(); await phone.page.waitForFunction(() => Store.ready && !Sync.busy);
    expect(await titles(phone.page)).toContain('Synthetic typing during download');
    expect((await sync(phone.page)).error).toBe('');
    expect((await sync(desktop.page)).error).toBe('');
    expect(await titles(desktop.page)).toEqual(['Synthetic agreed record', 'Synthetic remote addition', 'Synthetic typing during download']);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('a local save after merge planning cannot be overwritten by the prepared download', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(() => addRecipe('Synthetic agreed record'));
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(() => addRecipe('Synthetic remote addition'));
    expect((await sync(desktop.page)).error).toBe('');
    // Gate the existing persistence boundary after exchange has prepared its merge, rather than
    // inventing a network timing that occurs before mine is captured. No production code changes.
    await phone.page.evaluate(() => {
      const original = commitBackupImport;
      window.syntheticApplyEntered = false;
      const gate = new Promise(resolve => { window.syntheticApplyRelease = resolve; });
      commitBackupImport = async plan => {
        commitBackupImport = original;
        window.syntheticApplyEntered = true;
        await gate;
        return original(plan);
      };
    });
    const running = sync(phone.page);
    await phone.page.waitForFunction(() => window.syntheticApplyEntered);
    await phone.page.evaluate(async () => { addRecipe('Synthetic save after merge planning'); await Store.flushDirty(); window.syntheticApplyRelease(); });
    await running;
    expect(await titles(phone.page)).toContain('Synthetic save after merge planning');
    await phone.page.reload(); await phone.page.waitForFunction(() => Store.ready && !Sync.busy);
    expect(await titles(phone.page)).toContain('Synthetic save after merge planning');
    expect((await sync(phone.page)).error).toBe('');
    expect((await sync(desktop.page)).error).toBe('');
    expect(await titles(desktop.page)).toEqual(['Synthetic agreed record', 'Synthetic remote addition', 'Synthetic save after merge planning']);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('successful HTTP write with different readback is not reported as verified sync', async ({ browser }) => {
  const drive = fakeDrive(), d = await device(browser, drive);
  try {
    await d.page.evaluate(() => addRecipe('Synthetic baseline record'));
    expect((await sync(d.page)).error).toBe('');
    await d.page.evaluate(async () => { addRecipe('Synthetic protected new record'); await Store.flushDirty(); });
    drive.corruptWrite = text => { const payload = JSON.parse(text); payload.data.recipes = payload.data.recipes.filter(r => r.title !== 'Synthetic protected new record'); return JSON.stringify(payload); };
    const last = await d.page.evaluate(() => syncMeta().last);
    const m = await sync(d.page);
    expect(m.error || '').toMatch(/verif|match|read|changed/i);
    expect(m.last).toBe(last);
    expect(await titles(d.page)).toContain('Synthetic protected new record');
    await d.page.reload(); await d.page.waitForFunction(() => Store.ready);
    expect(await titles(d.page)).toContain('Synthetic protected new record');
  } finally { await d.context.close(); }
});

test('an aborted local agreement commits neither the downloaded records nor the new base', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(() => addRecipe('Synthetic agreed record'));
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(() => addRecipe('Synthetic remote addition'));
    expect((await sync(desktop.page)).error).toBe('');
    await phone.page.evaluate(async () => { addRecipe('Synthetic local addition'); await Store.flushDirty(); });
    const before = await phone.page.evaluate(async () => ({ recipes: await Store.read('recipes'), base: await LocalDb.get(SYNC_BASE), last: syncMeta().last }));
    await phone.page.evaluate(() => {
      const put = IDBObjectStore.prototype.put;
      window.syntheticRestorePut = () => { IDBObjectStore.prototype.put = put; };
      IDBObjectStore.prototype.put = function (value, key) {
        const request = put.apply(this, arguments);
        if (this.name === 'local' && key === SYNC_BASE) this.transaction.abort();
        return request;
      };
    });
    const result = await sync(phone.page);
    expect(result.error || '').not.toBe('');
    expect(result.last).toBe(before.last);
    expect(await phone.page.evaluate(async () => ({ recipes: await Store.read('recipes'), base: await LocalDb.get(SYNC_BASE) }))).toEqual({ recipes: before.recipes, base: before.base });
    expect(await titles(phone.page)).toEqual(['Synthetic agreed record', 'Synthetic local addition']);
    await phone.page.evaluate(() => window.syntheticRestorePut());
    await phone.page.reload(); await phone.page.waitForFunction(() => Store.ready && !Sync.busy);
    expect(await titles(phone.page)).toContain('Synthetic local addition');
    expect((await sync(phone.page)).error).toBe('');
    expect((await sync(desktop.page)).error).toBe('');
    expect(await titles(desktop.page)).toEqual(['Synthetic agreed record', 'Synthetic local addition', 'Synthetic remote addition']);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('backup restoration rejects a stale prepared plan instead of replacing a later local save', async ({ browser }) => {
  const drive = fakeDrive(), d = await device(browser, drive, { connected: false });
  try {
    await d.page.evaluate(async () => { addRecipe('Synthetic original local'); await Store.flushDirty(); });
    await d.page.evaluate(() => {
      window.syntheticBackup = { app: 'body-dashboard', version: 1, settings: {}, data: { recipes: [{ id: 'synthetic-backup-import', title: 'Synthetic imported recipe' }] } };
      window.syntheticPlan = planBackupImport(window.syntheticBackup, 'merge');
    });
    await d.page.evaluate(async () => { addRecipe('Synthetic saved after backup preview'); await Store.flushDirty(); });
    const result = await d.page.evaluate(async () => { try { await commitBackupImport(window.syntheticPlan); return ''; } catch (e) { return e.message; } });
    expect(result).toMatch(/changed|conflict|review/i);
    expect(await titles(d.page)).toEqual(['Synthetic original local', 'Synthetic saved after backup preview']);
    expect(await d.page.evaluate(async () => (await Store.read('recipes')).map(x => x.title).sort())).toEqual(['Synthetic original local', 'Synthetic saved after backup preview']);
    await d.page.evaluate(async () => { await commitBackupImport(planBackupImport(window.syntheticBackup, 'merge')); });
    expect(await titles(d.page)).toEqual(['Synthetic imported recipe', 'Synthetic original local', 'Synthetic saved after backup preview']);
    await d.page.reload(); await d.page.waitForFunction(() => Store.ready);
    expect(await titles(d.page)).toEqual(['Synthetic imported recipe', 'Synthetic original local', 'Synthetic saved after backup preview']);
  } finally { await d.context.close(); }
});

test('independent edits to different fields of the same routine still combine', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(r => Store.set('routines', [r]), syntheticRoutine);
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic renamed day'; await Store.save('routines'); await Store.flushDirty(); });
    await phone.page.evaluate(async () => { Store.get('routines')[0].notes = 'Synthetic cue from phone'; await Store.save('routines'); await Store.flushDirty(); });
    expect((await sync(desktop.page)).error).toBe('');
    expect((await sync(phone.page)).error).toBe('');
    expect((await sync(desktop.page)).error).toBe('');
    for (const d of [desktop, phone]) expect(await d.page.evaluate(() => ({ name: Store.get('routines')[0].name, notes: Store.get('routines')[0].notes }))).toEqual({ name: 'Synthetic renamed day', notes: 'Synthetic cue from phone' });
  } finally { await desktop.context.close(); await phone.context.close(); }
});

for (const choice of ['mine', 'drive']) test(`an explicit ${choice} conflict choice applies only after review`, async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(r => Store.set('routines', [r]), syntheticRoutine);
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic desktop choice'; await Store.save('routines'); await Store.flushDirty(); });
    await phone.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic phone choice'; await Store.save('routines'); await Store.flushDirty(); });
    expect((await sync(desktop.page)).error).toBe('');
    expect((await sync(phone.page)).error).toMatch(/conflict/i);
    await expect(phone.page.getByRole('heading', { name: 'Review sync conflicts', exact: true })).toBeVisible();
    await expect(phone.page.locator('#modal')).toContainText('Synthetic desktop choice');
    await expect(phone.page.locator('#modal')).toContainText('Synthetic phone choice');
    await phone.page.click(`[data-action="syncReview"][data-choice="${choice}"]`);
    await phone.page.waitForFunction(() => !Sync.busy && !syncMeta().error);
    expect((await sync(desktop.page)).error).toBe('');
    const expected = choice === 'mine' ? 'Synthetic phone choice' : 'Synthetic desktop choice';
    expect(await desktop.page.evaluate(() => Store.get('routines')[0].name)).toBe(expected);
    expect(await phone.page.evaluate(() => Store.get('routines')[0].name)).toBe(expected);
    expect(JSON.parse(drive.file.body).data.routines[0].name).toBe(expected);
    await phone.page.reload(); await phone.page.waitForFunction(() => Store.ready);
    expect(await phone.page.evaluate(() => Store.get('routines')[0].name)).toBe(expected);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('a conflict choice from an older review cannot overwrite a newer remote version', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(r => Store.set('routines', [r]), syntheticRoutine);
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic desktop first revision'; await Store.save('routines'); await Store.flushDirty(); });
    await phone.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic retained phone revision'; await Store.save('routines'); await Store.flushDirty(); });
    expect((await sync(desktop.page)).error).toBe('');
    expect((await sync(phone.page)).error).toMatch(/conflict/i);
    const signature = await phone.page.evaluate(() => Sync.review.signature);
    await desktop.page.evaluate(async () => { Store.get('routines')[0].name = 'Synthetic desktop newer revision'; await Store.save('routines'); await Store.flushDirty(); });
    expect((await sync(desktop.page)).error).toBe('');
    const remote = drive.file.body, writes = drive.writes.length;
    await phone.page.click('[data-action="syncReview"][data-choice="mine"]');
    await phone.page.waitForFunction(() => !Sync.busy);
    expect(await phone.page.evaluate(() => syncMeta().error)).toMatch(/conflict|review/i);
    expect(await phone.page.evaluate(() => Sync.review.signature)).not.toBe(signature);
    expect(await phone.page.evaluate(() => Store.get('routines')[0].name)).toBe('Synthetic retained phone revision');
    expect(drive.file.body).toBe(remote);
    expect(drive.writes).toHaveLength(writes);
    await expect(phone.page.locator('#modal')).toContainText('Synthetic desktop newer revision');
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('removing one completed workout requires an explicit reviewed removal', async ({ browser }) => {
  let allow = false;
  const drive = fakeDrive(), d = await device(browser, drive, { answer: () => allow });
  try {
    await d.page.evaluate(w => Store.set('workouts', [w]), syntheticHistory);
    expect((await sync(d.page)).error).toBe('');
    const remote = drive.file.body;
    await d.page.evaluate(async () => { Store.set('workouts', []); await Store.flushDirty(); });
    expect((await sync(d.page)).error).toMatch(/remove|review|paused/i);
    expect(d.asked).toHaveLength(1);
    expect(d.asked[0]).toContain('1 record');
    expect(drive.file.body).toBe(remote);
    allow = true;
    expect((await sync(d.page)).error).toBe('');
    expect(JSON.parse(drive.file.body).data.workouts).toEqual([]);
    expect(await d.page.evaluate(async () => [Store.get('workouts'), (await LocalDb.get(SYNC_BASE)).data.workouts])).toEqual([[], []]);
  } finally { await d.context.close(); }
});

test('removing a nested completed set requires review even when its workout ID remains', async ({ browser }) => {
  let allow = false;
  const drive = fakeDrive(), d = await device(browser, drive, { answer: () => allow });
  try {
    await d.page.evaluate(w => { const copy = structuredClone(w); copy.exercises[0].sets.push({ id: 'synthetic-m1-second-set', weight: 63.123456, reps: 5, done: true }); Store.set('workouts', [copy]); }, syntheticHistory);
    expect((await sync(d.page)).error).toBe('');
    const remote = drive.file.body;
    await d.page.evaluate(async () => { Store.get('workouts')[0].exercises[0].sets.pop(); await Store.save('workouts'); await Store.flushDirty(); });
    expect((await sync(d.page)).error).toMatch(/remove|review|paused/i);
    expect(d.asked).toHaveLength(1);
    expect(drive.file.body).toBe(remote);
    allow = true;
    expect((await sync(d.page)).error).toBe('');
    expect(JSON.parse(drive.file.body).data.workouts[0].exercises[0].sets).toEqual(syntheticHistory.exercises[0].sets);
  } finally { await d.context.close(); }
});

test('a committed settings checkpoint recovers after a localStorage update fails and the page reloads', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(() => addRecipe('Synthetic agreed record'));
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(async () => { addRecipe('Synthetic remote addition with settings'); S.unit = 'kg'; saveSettings(); await Store.flushDirty(); });
    expect((await sync(desktop.page)).error).toBe('');
    const oldRaw = await phone.page.evaluate(() => localStorage.getItem('bd.settings'));
    await phone.page.evaluate(() => {
      const setItem = Storage.prototype.setItem;
      window.syntheticRestoreStorage = () => { Storage.prototype.setItem = setItem; };
      Storage.prototype.setItem = function (key, value) {
        if (this === localStorage && key === 'bd.settings') throw new DOMException('Synthetic settings storage failure', 'QuotaExceededError');
        return setItem.apply(this, arguments);
      };
    });
    expect((await sync(phone.page)).error).toMatch(/settings|storage|Synthetic/i);
    expect(await phone.page.evaluate(() => localStorage.getItem('bd.settings'))).toBe(oldRaw);
    expect(await phone.page.evaluate(() => LocalDb.get('sync.settings-checkpoint'))).toMatchObject({ version: 1, previousRaw: oldRaw, settings: { unit: 'kg' } });
    expect(await phone.page.evaluate(async () => (await Store.read('recipes')).map(x => x.title).sort())).toEqual(['Synthetic agreed record', 'Synthetic remote addition with settings']);
    await phone.page.evaluate(() => window.syntheticRestoreStorage());
    await phone.page.reload(); await phone.page.waitForFunction(() => Store.ready);
    expect(await phone.page.evaluate(() => [S.unit, JSON.parse(localStorage.getItem('bd.settings')).unit])).toEqual(['kg', 'kg']);
    expect(await phone.page.evaluate(() => LocalDb.get('sync.settings-checkpoint'))).toBeUndefined();
    expect(await titles(phone.page)).toEqual(['Synthetic agreed record', 'Synthetic remote addition with settings']);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('a queued workout command cannot be hidden by an older adoption read', async ({ browser }) => {
  const drive = fakeDrive(), d = await device(browser, drive, { connected: false });
  try {
    await d.page.evaluate(async () => {
      await Store.flushDirty();
      const readMany = Store.readMany;
      const gate = new Promise(resolve => { window.syntheticAdoptRelease = resolve; });
      window.syntheticAdoptEntered = false;
      Store.readMany = async function (keys) {
        const saved = await readMany.call(this, keys);
        if (keys.length === Object.keys(COLLECTIONS).length && !window.syntheticAdoptEntered) {
          window.syntheticAdoptEntered = true;
          await gate;
        }
        return saved;
      };
      window.syntheticAdoptPromise = Sync.adopt();
    });
    await d.page.waitForFunction(() => window.syntheticAdoptEntered);
    await d.page.evaluate(() => {
      window.syntheticStartPromise = WebWrites.command({ activeWorkout: { id: 'synthetic-start-during-adopt', name: 'Synthetic new workout', start: '2026-11-09T12:00:00.000Z', notes: 'Synthetic acknowledged start', exercises: [] } }, 'start');
    });
    // Give the competing command an opportunity to acknowledge while the old read remains held.
    // A serialized writer keeps it queued; a command completing early must still not be hidden.
    await d.page.evaluate(() => Promise.race([window.syntheticStartPromise, new Promise(resolve => setTimeout(resolve, 100))]));
    await d.page.evaluate(() => window.syntheticAdoptRelease());
    await d.page.evaluate(() => Promise.all([window.syntheticAdoptPromise, window.syntheticStartPromise]));
    expect(await d.page.evaluate(async () => [Store.get('activeWorkout').id, (await Store.read('activeWorkout')).id, WebWrites.bases.activeWorkout.id])).toEqual(['synthetic-start-during-adopt', 'synthetic-start-during-adopt', 'synthetic-start-during-adopt']);
    await d.page.reload(); await d.page.waitForFunction(() => Store.ready);
    expect(await d.page.evaluate(() => Store.get('activeWorkout').id)).toBe('synthetic-start-during-adopt');
  } finally { await d.context.close(); }
});

for (const theme of ['light', 'dark']) test(`sync conflict review fits 390px enlarged ${theme} mode and keeps keyboard actions reachable`, async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive, { touch: true });
  try {
    await desktop.page.evaluate(r => Store.set('routines', [r]), syntheticRoutine);
    await linkSecondDevice(drive, desktop, phone);
    await desktop.page.evaluate(async () => { Store.get('routines')[0].notes = 'Synthetic desktop detail '.repeat(15); await Store.save('routines'); await Store.flushDirty(); });
    await phone.page.evaluate(async () => { Store.get('routines')[0].notes = 'Synthetic phone detail '.repeat(15); await Store.save('routines'); await Store.flushDirty(); });
    expect((await sync(desktop.page)).error).toBe('');
    expect((await sync(phone.page)).error).toMatch(/conflict/i);
    await phone.page.evaluate(async theme => { S.theme = theme; applyTheme(); document.documentElement.style.fontSize = '200%'; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, theme);
    const dialog = phone.page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Review sync conflicts', exact: true })).toBeVisible();
    await dialog.getByText('View both complete values',{exact:true}).first().click();
    await expect(dialog.locator('details').first()).toHaveAttribute('open','');
    expect(await dialog.evaluate(el => ({ overflow: el.scrollWidth - el.clientWidth, page: document.documentElement.scrollWidth - document.documentElement.clientWidth })) ).toEqual({ overflow: 0, page: 0 });
    for (const name of ['Keep paused', 'Use Drive conflicting values', 'Use this device conflicting values']) {
      const button = dialog.getByRole('button', { name, exact: true });
      await expect(button).toBeVisible();
      const box = await button.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await dialog.getByRole('button', { name: 'Keep paused', exact: true }).focus();
    await phone.page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Use Drive conflicting values', exact: true })).toBeFocused();
    await phone.page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Use this device conflicting values', exact: true })).toBeFocused();
    await phone.page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Use Drive conflicting values', exact: true })).toBeFocused();
    await phone.page.addScriptTag({ content: await fs.readFile('node_modules/axe-core/axe.min.js', 'utf8') });
    const violations = await phone.page.evaluate(async () => (await axe.run(document.querySelector('#modal'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.failureSummary) })));
    expect(violations).toEqual([]);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('a no-op sync retains the pre-adoption recovery copy and excludes API credentials', async ({ browser }) => {
  const drive = fakeDrive(), desktop = await device(browser, drive), phone = await device(browser, drive);
  try {
    await desktop.page.evaluate(() => addRecipe('Synthetic Drive record'));
    expect((await sync(desktop.page)).error).toBe('');
    await phone.page.evaluate(async () => { addRecipe('Synthetic prior local record'); S.fdcKey = 'synthetic-key-never-export'; saveSettings(); await Store.flushDirty(); });
    await sync(phone.page);
    await phone.page.click('[data-action="syncFirst"][data-mode="theirs"]');
    await phone.page.waitForFunction(() => !Sync.busy && !syncMeta().error);
    const recovery = await phone.page.evaluate(() => LocalDb.get('sync.recovery'));
    expect(recovery.data.recipes.map(r => r.title)).toEqual(['Synthetic prior local record']);
    expect(recovery.settings.fdcKey).toBeUndefined();
    expect(JSON.stringify(recovery)).not.toContain('synthetic-key-never-export');
    expect(await titles(phone.page)).toEqual(['Synthetic Drive record']);
    expect((await sync(phone.page)).error).toBe('');
    expect(await phone.page.evaluate(() => LocalDb.get('sync.recovery'))).toEqual(recovery);
    await phone.page.evaluate(async()=>{await Sync.disconnect();openSettings();});
    await expect(phone.page.getByRole('button',{name:'Download retained local records',exact:true})).toBeVisible();
    expect(await phone.page.evaluate(()=>Sync.connected())).toBe(false);
  } finally { await desktop.context.close(); await phone.context.close(); }
});

test('a committed domain command schedules sync and invalidates current verification without dirty flags', async ({ browser }) => {
  const drive = fakeDrive(), d = await device(browser, drive);
  try {
    await d.page.evaluate(() => addRecipe('Synthetic baseline'));
    expect((await sync(d.page)).error).toBe('');
    expect(await d.page.evaluate(() => Sync.status())).toMatch(/verified/i);
    await d.page.evaluate(async () => {
      clearTimeout(Sync.timer); Sync.timer = null;
      await WebWrites.command({ activeWorkout: { id: 'synthetic-command-after-verification', name: 'Synthetic offline-ready session', start: '2026-11-09T12:00:00.000Z', notes: '', exercises: [] } }, 'start');
    });
    expect(await d.page.evaluate(() => Store.dirty.size)).toBe(0);
    expect(await d.page.evaluate(() => !!Sync.timer)).toBe(true);
    expect(await d.page.evaluate(() => Sync.status())).toMatch(/local changes|waiting|pending|need verification/i);
    expect(JSON.parse(drive.file.body).data.activeWorkout).toBeNull();
    expect((await sync(d.page)).error).toBe('');
    expect(JSON.parse(drive.file.body).data.activeWorkout.id).toBe('synthetic-command-after-verification');
    expect(await d.page.evaluate(() => Sync.status())).toMatch(/verified/i);
  } finally { await d.context.close(); }
});

test('a stale tab adopts settings already saved by another tab before it publishes', async ({ browser }) => {
  const drive = fakeDrive(), stale = await device(browser, drive);
  try {
    await stale.page.evaluate(() => addRecipe('Synthetic preserved history placeholder'));
    expect((await sync(stale.page)).error).toBe('');
    const current = await tab(stale.context);
    await current.page.waitForFunction(() => !Sync.busy);
    await current.page.evaluate(() => { S.unit = 'kg'; saveSettings(); });
    expect(await stale.page.evaluate(() => S.unit)).toBe('lbs');
    expect(await stale.page.evaluate(() => JSON.parse(localStorage.getItem('bd.settings')).unit)).toBe('kg');
    expect((await sync(stale.page)).error).toBe('');
    expect(await stale.page.evaluate(() => [S.unit, JSON.parse(localStorage.getItem('bd.settings')).unit])).toEqual(['kg', 'kg']);
    expect(JSON.parse(drive.file.body).settings.unit).toBe('kg');
    await stale.page.reload(); await stale.page.waitForFunction(() => Store.ready);
    expect(await stale.page.evaluate(() => S.unit)).toBe('kg');
    expect(await titles(stale.page)).toEqual(['Synthetic preserved history placeholder']);
  } finally { await stale.context.close(); }
});

test('input arriving at the final agreement transaction stays recoverable without reverting incoming records',async({browser})=>{
  const drive=fakeDrive(),desktop=await device(browser,drive),phone=await device(browser,drive);
  try{
    await desktop.page.evaluate(()=>addRecipe('Synthetic baseline'));
    await linkSecondDevice(drive,desktop,phone);
    await desktop.page.evaluate(()=>addRecipe('Synthetic incoming record'));
    expect((await sync(desktop.page)).error).toBe('');
    await phone.page.evaluate(()=>{
      const put=IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put=function(value,key){const request=put.apply(this,arguments);if(this.name==='local'&&key==='sync.verified'){IDBObjectStore.prototype.put=put;queueMicrotask(()=>addRecipe('Synthetic late input'));}return request;};
    });
    expect((await sync(phone.page)).error).toContain('input is retained');
    const state=await phone.page.evaluate(async()=>({memory:Store.get('recipes').map(r=>r.title),saved:(await Store.read('recipes')).map(r=>r.title),retained:(await LocalDb.get('sync.late-input')).data.recipes.map(r=>r.title),blocked:!!WebWrites.blocked}));
    expect(state.memory).toContain('Synthetic late input');expect(state.retained).toContain('Synthetic late input');expect(state.saved).toContain('Synthetic incoming record');expect(state.saved).not.toContain('Synthetic late input');expect(state.blocked).toBe(true);
    expect(await phone.page.evaluate(async()=>{try{await Store.flushDirty();return false;}catch{return true;}})).toBe(true);
    await phone.page.reload();await phone.page.waitForFunction(()=>Store.ready);
    expect(await titles(phone.page)).toContain('Synthetic incoming record');expect(await phone.page.evaluate(async()=>(await LocalDb.get('sync.late-input')).data.recipes.some(r=>r.title==='Synthetic late input'))).toBe(true);
  }finally{await desktop.context.close();await phone.context.close();}
});

test('a restore review preserves the already approved Drive conflict choice',async({browser})=>{
  const drive=fakeDrive(),desktop=await device(browser,drive),phone=await device(browser,drive);
  try{
    await desktop.page.evaluate(r=>Store.set('routines',[r]),syntheticRoutine);await linkSecondDevice(drive,desktop,phone);
    await desktop.page.evaluate(()=>{Store.get('routines')[0].notes='Synthetic chosen Drive value';Store.save('routines');});expect((await sync(desktop.page)).error).toBe('');
    await phone.page.evaluate(async()=>{Store.get('routines')[0].notes='Synthetic conflicting device value';Store.save('routines');await Store.flushDirty();await LocalDb.put('sync.restore-review',{at:'2026-11-09T12:00:00.000Z'});});
    expect((await sync(phone.page)).error).toMatch(/conflict/i);
    await phone.page.click('[data-action="syncReview"][data-choice="drive"]');await phone.page.waitForFunction(()=>!Sync.busy&&Sync.review?.kind==='restore');
    await phone.page.getByRole('button',{name:'Review and continue',exact:true}).click();await phone.page.waitForFunction(()=>!Sync.busy&&!syncMeta().error);
    expect(await phone.page.evaluate(()=>Store.get('routines')[0].notes)).toBe('Synthetic chosen Drive value');expect(JSON.parse(drive.file.body).data.routines[0].notes).toBe('Synthetic chosen Drive value');
  }finally{await desktop.context.close();await phone.context.close();}
});

test('late settings changes withhold verification and are explicitly reconciled without changing hidden preferences',async({browser})=>{
  const drive=fakeDrive(),desktop=await device(browser,drive),phone=await device(browser,drive);
  try{
    await desktop.page.evaluate(()=>addRecipe('Synthetic baseline'));await linkSecondDevice(drive,desktop,phone);
    const previous=await phone.page.evaluate(()=>syncMeta().last);
    await desktop.page.evaluate(()=>{S.unit='kg';saveSettings();});expect((await sync(desktop.page)).error).toBe('');
    await phone.page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){const request=put.apply(this,arguments);if(this.name==='local'&&key==='sync.verified'){IDBObjectStore.prototype.put=put;queueMicrotask(()=>{S.targets.cal=2107;S.theme='dark';saveSettings();});}return request;};});
    const meta=await sync(phone.page);expect(meta.error).toMatch(/settings.*review/i);expect(meta.last).toBe(previous);
    await expect(phone.page.getByRole('heading',{name:'Review interrupted settings',exact:true})).toBeVisible();
    await phone.page.getByRole('button',{name:'Use saved operation settings',exact:true}).click();await phone.page.waitForFunction(()=>!Sync.busy&&Sync.review?.kind==='restore');
    await phone.page.getByRole('button',{name:'Review and continue',exact:true}).click();await phone.page.waitForFunction(()=>!Sync.busy&&!syncMeta().error);
    expect(await phone.page.evaluate(async()=>({unit:S.unit,theme:S.theme,pending:await LocalDb.get('sync.settings-checkpoint')}))).toEqual({unit:'kg',theme:'dark',pending:undefined});
  }finally{await desktop.context.close();await phone.context.close();}
});
