import { test, expect } from '@playwright/test';
import { serveRepo, stopServer } from './serve.js';
import fs from 'node:fs/promises';
test.use({ viewport: { width: 390, height: 720 }, isMobile: true, hasTouch: true });
let server;
test.beforeEach(async ({page}) => {
 server = await serveRepo();
 await page.goto(`http://localhost:${server.address().port}/index.html?pwa`);
 await page.waitForFunction(() => typeof Store !== 'undefined' && Store.ready);
 await page.evaluate(async () => { A.helpDismiss({dataset:{what:'tour'}}); await Store.flushDirty(); });
});
test.afterEach(async () => stopServer(server));
async function training(page) {
 await page.evaluate(async () => {
 S.unit='kg';
 await startWorkout({id:'synthetic-focused',name:'Synthetic training',exercises:[{id:'synthetic-exercise',name:'Bench Press (Barbell)',rest:90,sets:Array.from({length:4},(_,i)=>({id:`synthetic-set-${i}`,type:'normal',weight:60,reps:8,done:false}))}]});
 });
}
for (const theme of ['light','dark']) test(`${theme}: focused training is flat, readable and accessible`, async ({page,browserName}) => {
 await page.evaluate(theme=>{S.theme=theme;applyTheme();},theme); await training(page);
 await expect(page.locator('#sidebar')).toHaveCount(0);
 await expect(page.locator('#bottom-bar')).toBeHidden();
 await expect(page.locator('#view .tabs-row')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Finish',exact:true})).toBeVisible();
 await expect(page.locator('.workout-matrix [data-col="remove"]')).toHaveCount(0);
 expect(await page.locator('.workout-exercise').evaluate(el=>getComputedStyle(el).boxShadow)).toBe('none');
 expect(await page.locator('input[data-f="weight"]').first().evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(90);
 await expect(page.locator('.set-adjustments')).not.toHaveAttribute('open','');
 await page.addScriptTag({content:await fs.readFile('node_modules/axe-core/axe.min.js','utf8')});
 expect(await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id))).toEqual([]);
 await page.screenshot({path:`output/playwright/simple-training-${browserName}-${theme}.png`});
});
test('minimize, browse, resume and reopen offline retain the same draft and accepted sets', async ({page,context}) => {
 await training(page);
 await page.locator('input[data-f="weight"]').first().fill('62.5');
 await page.getByRole('button',{name:'Complete set',exact:true}).first().click();
 await expect(page.getByRole('button',{name:'Undo completed set',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Minimize workout',exact:true}).click();
 await expect(page.locator('#bottom-bar')).toBeVisible();
 await expect(page.locator('#resume-workout')).toContainText('Synthetic training');
 await page.locator('#bottom-bar [data-view="nutrition"]').click();
 await page.locator('#resume-workout button').click();
 await expect(page.getByRole('button',{name:'Undo completed set',exact:true})).toBeVisible();
 await page.waitForFunction(()=>document.querySelector('#offline-state')?.textContent.includes('Ready offline'));
 await context.setOffline(true); await page.reload(); await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);
 expect(await page.evaluate(()=>({id:Store.get('activeWorkout').id,weight:Store.get('activeWorkout').exercises[0].sets[0].weight,done:Store.get('activeWorkout').exercises[0].sets[0].done}))).toEqual({id:'synthetic-focused',weight:62.5,done:true});
 await page.evaluate(()=>{S.hiddenTabs.fitTab=['history'];});
 await page.getByRole('button',{name:'Minimize workout',exact:true}).click();
 expect(await page.evaluate(()=>S.view)).toBe('dashboard');
 await expect(page.locator('#resume-workout')).toBeVisible();
 expect(await page.evaluate(()=>S.hiddenTabs.fitTab)).toEqual(['history']);
});
test('set options preserve explicit acceptance and adjustment expansion through edits', async ({page}) => {
 await training(page);
 await page.getByRole('button',{name:'Options for set 1',exact:true}).click();
 await page.getByRole('button',{name:'Warm-up',exact:true}).click();
 expect(await page.evaluate(()=>Store.get('activeWorkout').exercises[0].sets[0].done)).toBe(false);
 await expect(page.getByRole('button',{name:'Options for set W',exact:true})).toBeVisible();
 await page.locator('.set-adjustments summary').click();
 await page.getByRole('button',{name:'One rep more',exact:true}).click();
 await expect(page.locator('.set-adjustments')).toHaveAttribute('open','');
 await page.getByRole('button',{name:'Options for set W',exact:true}).click();
 await page.getByRole('button',{name:'Delete set',exact:true}).click();
 expect(await page.evaluate(()=>Store.get('activeWorkout').exercises[0].sets.length)).toBe(3);
});
test('history previews exercises before expansion and retains full details', async ({page,browserName}) => {
 await page.evaluate(async()=>{
 Store.set('workouts',[{id:'synthetic-history-feed',name:'Synthetic full body',start:'2026-11-01T12:00:00Z',end:'2026-11-01T12:40:00Z',exercises:['Squat','Bench Press','Row','Plank'].map(name=>({name,sets:[{type:'normal',weight:40,reps:8}]}))}]);await Store.flushDirty();ui.fitTab='history';go('fitness');
 });
 const feed=page.locator('.workout-feed');
 await expect(feed.locator('summary')).toContainText('Synthetic full body');
 await expect(feed.locator('.feed-preview > span')).toHaveCount(4);
 await expect(feed.locator('.feed-preview')).toContainText('1 more exercise');
 await page.screenshot({path:`output/playwright/simple-history-${browserName}.png`});
 await feed.locator('summary').click();await expect(feed.getByRole('button',{name:'Repeat',exact:true})).toBeVisible();
 await expect(feed).toContainText('Plank');
});
