import {test,expect} from '@playwright/test';
import {serveRepo,stopServer} from './serve.js';
import fs from 'node:fs/promises';
test.use({ viewport: { width: 390, height: 660 }, isMobile: true, hasTouch: true });
let server,base;
test.beforeEach(async({page})=>{
 server=await serveRepo();base=`http://localhost:${server.address().port}/index.html`;
 await page.goto(base);await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);
 await page.evaluate(async()=>{A.helpDismiss({dataset:{what:'tour'}});await Store.flushDirty();});
});
test.afterEach(async()=>await stopServer(server));
async function session(page,{previous=false,unit='lbs',theme='dark'}={}){
 await page.evaluate(async({previous,unit,theme})=>{
 S.unit=unit;S.theme=theme;applyTheme();
 if(previous){Store.set('workouts',[{id:'synthetic-previous',name:'Synthetic history',start:'2026-11-01T12:00:00Z',end:'2026-11-01T12:30:00Z',exercises:[{name:'Bench Press (Barbell)',sets:Array.from({length:4},()=>({type:'normal',weight:182.5,reps:8}))}]}]);await Store.flushDirty();}
 await startWorkout({id:'synthetic-spacing',name:'Synthetic session',exercises:[{id:'ex-1',name:'Bench Press (Barbell)',notes:'',rest:150,targetReps:'6-8',sets:Array.from({length:4},()=>blankSet())}]});
 },{previous,unit,theme});
 // Theme changes refresh section markup after paint; measure the current row, not a replaced node.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
for(const width of [390,393]) for(const theme of ['light','dark'])test(`${width}px ${theme}: first-time sets have clear cells and an unobscured exercise header`,async({page,browserName})=>{
 await page.setViewportSize({width,height:660});await session(page,{theme});
 const table=page.locator('.workout-matrix');await expect(table.locator('[data-col="previous"]')).toHaveCount(0);
 await expect(table.locator('caption')).toHaveText('Check a set to log it. Tap its number for options.');
 expect(await page.locator('.workout-summary').evaluate(el=>getComputedStyle(el).position)).toBe('static');
 const first=table.locator('tbody tr').first();
 const metrics=await first.evaluate(row=>{
 const b=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height,scroll:el.scrollWidth,client:el.clientWidth};};
 return {weight:b(row.querySelector('[data-f="weight"]')),reps:b(row.querySelector('[data-f="reps"]')),done:b(row.querySelector('[data-action="awSetDone"]')),set:b(row.querySelector('[data-action="awSetType"]'))};});
 expect(metrics.reps.left-metrics.weight.right).toBeGreaterThanOrEqual(6);
 expect(metrics.done.left-metrics.reps.right).toBeGreaterThanOrEqual(4);
 for(const action of [metrics.done,metrics.set]){expect(action.width).toBeGreaterThanOrEqual(44);expect(action.height).toBeGreaterThanOrEqual(44);}
 expect(metrics.weight.width).toBeGreaterThan(70);expect(metrics.reps.width).toBeGreaterThan(70);
 await page.locator('.workout-exercise-head').scrollIntoViewIfNeeded();
 const header=await page.locator('.workout-exercise-head').boundingBox();
 const top=await page.locator('#view').evaluate(el=>el.getBoundingClientRect().top);
 expect(header.y).toBeGreaterThanOrEqual(top-1);
 expect(await page.locator('#view').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.screenshot({path:`output/playwright/workout-spacing-${browserName}-${width}-${theme}.png`});
});
test('previous performance remains usable and full decimal values fit',async({page})=>{
 await page.setViewportSize({width:390,height:680});await session(page,{previous:true,unit:'kg'});
 const table=page.locator('.workout-matrix');await expect(table.locator('[data-col="previous"]')).toHaveCount(1);
 await expect(table.locator('[data-action="awFillPrev"]').first()).toContainText('182.5×8');
 const weight=table.locator('[data-f="weight"]').first();await weight.fill('182.5');
 const previous=table.locator('[data-action="awFillPrev"]').first();
 expect(await previous.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 expect((await previous.boundingBox()).x+(await previous.boundingBox()).width).toBeLessThanOrEqual((await weight.boundingBox()).x);
 expect(await weight.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await table.locator('[data-action="awSetDone"]').first().click();
 await expect(table.getByRole('button',{name:'Undo completed set',exact:true})).toHaveCount(1);
 expect(await page.evaluate(()=>Store.get('activeWorkout').exercises[0].sets[0].weight)).toBe(182.5);
});
test('labeled load/reps controls fit narrow and enlarged layouts',async({page,browserName})=>{
 await page.setViewportSize({width:375,height:660});await session(page,{unit:'kg'});
 await page.locator('.set-adjustments > summary').click();
 await expect(page.locator('.workout-stepper')).toContainText('Load (kg)');await expect(page.locator('.workout-stepper')).toContainText('Reps');
 for(const size of ['100%','200%']){
  await page.evaluate(size=>{document.documentElement.style.fontSize=size;render();document.querySelector('.set-adjustments').open=true;},size);
  const sizes=await page.locator('.workout-stepper button').evaluateAll(buttons=>buttons.map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,fits:el.scrollWidth<=el.clientWidth})));
  expect(sizes.every(b=>b.width>=44&&b.height>=44&&b.fits),JSON.stringify(sizes)).toBe(true);
  expect(await page.locator('#view').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 }
 await page.locator('.workout-stepper').scrollIntoViewIfNeeded();
 await page.screenshot({path:`output/playwright/workout-spacing-${browserName}-375-large.png`});
 await page.addScriptTag({content:await fs.readFile('node_modules/axe-core/axe.min.js','utf8')});
 const issues=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id));expect(issues).toEqual([]);
});
