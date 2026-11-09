import {test,expect} from '@playwright/test';
import {serveRepo,stopServer} from './serve.js';
import fs from 'node:fs/promises';
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
let server;
test.beforeEach(async({page})=>{server=await serveRepo();await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`http://localhost:${server.address().port}/index.html`);await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);await page.evaluate(async()=>{A.helpDismiss({dataset:{what:'tour'}});Store.set('foods',[{id:'layout-food',name:'Synthetic breakfast food',basis:'serving',base:{cal:300,p:20,c:40,f:6},extra:[]}]);Store.set('recipes',[{id:'layout-recipe',title:'Synthetic recipe with a useful descriptive name',servings:4,cal:450,p:30,c:45,f:12,ingredients:'Water',steps:'Synthetic preparation'}]);await Store.flushDirty();});});
test.afterEach(async()=>stopServer(server));
const routes=[{home:'dashboard'},{home:'fitness'},{train:'history'},{train:'routines'},{train:'library'},{train:'progress'},{home:'nutrition'},{nutrition:'library'},{nutrition:'mealplan'},{nutrition:'body'},{nutrition:'targets'}];
for(const width of [375,390])for(const theme of ['light','dark'])for(const text of [100,200])test(`${width}px ${theme} ${text}%: named pages keep content and navigation reachable`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.evaluate(({theme,text})=>{S.theme=theme;applyTheme();document.documentElement.style.fontSize=text+'%';},{theme,text});
 for(const route of routes){await page.evaluate(route=>{if(route.train)A.trainPage({dataset:{page:route.train}});else if(route.nutrition)A.nutPage({dataset:{page:route.nutrition}});else A.pageHome({dataset:{view:route.home}});},route);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const dims=await page.evaluate(()=>({page:document.documentElement.scrollWidth<=innerWidth,main:document.querySelector('#view').scrollWidth<=document.querySelector('#view').clientWidth}));if(!dims.main)console.log('LAYOUT_OVERFLOW',JSON.stringify(route),await page.locator('#view').evaluate(root=>[...root.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,90),sw:e.scrollWidth,cw:e.clientWidth}))));expect(dims,JSON.stringify(route)).toEqual({page:true,main:true});
 await expect(page.locator('#bottom-bar')).toBeVisible();expect(await page.locator('#bottom-bar .bar-item').count()).toBe(3);}
});
test('picker and coverage have accessible controls in both themes and enlarged text',async({page,browserName})=>{
 await page.addScriptTag({content:await fs.readFile('node_modules/axe-core/axe.min.js','utf8')});
 for(const theme of ['light','dark'])for(const text of [100,200]){
  await page.evaluate(({theme,text})=>{S.theme=theme;applyTheme();document.documentElement.style.fontSize=text+'%';ui.rDraft={id:null,name:'Synthetic plan',folder:'',notes:'Retain draft',exercises:[{name:'Bench Press (Barbell)',sets:3,reps:'8',rest:90}]};drawRoutineModal();openExercisePicker('routine-add');},{theme,text});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const result=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))})));expect(result).toEqual([]);
  expect(await page.locator('[role="dialog"]').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.locator('#exercise-picker-search').fill('bench');await page.getByRole('button',{name:'Select Bench Press (Barbell)',exact:true}).click();
  const apply=page.getByRole('button',{name:'Add selected (1)',exact:true});await apply.scrollIntoViewIfNeeded();
  const target=await apply.boundingBox();expect(target.width).toBeGreaterThanOrEqual(44);expect(target.height).toBeGreaterThanOrEqual(44);expect(target.y+target.height).toBeLessThanOrEqual(844);
  if(theme==='dark'&&text===100)await page.screenshot({path:`output/playwright/mineral-picker-${browserName}.png`});
  await page.evaluate(()=>{ui.exercisePicker=null;Modal.close();showRoutineCoverage(true);});
  expect(await page.locator('#view').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const issues=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id));expect(issues).toEqual([]);
  await page.evaluate(()=>{ui.muscleSets=null;ui.fitTab='routines';Modal.close();render();});
 }
});
test('switching appearance updates inherited shell text as well as card surfaces',async({page})=>{
 for(const theme of ['light','dark','light']){
  await page.evaluate(theme=>{S.theme=theme;applyTheme();A.pageHome({dataset:{view:'fitness'}});},theme);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  // The theme rebuild is asynchronous; assert the rendered state rather than a fixed frame count.
  const expected=theme==='dark'?'rgb(244, 247, 253)':'rgb(23, 32, 51)';
  await expect.poll(()=>page.locator('#view h3').first().evaluate(e=>({heading:getComputedStyle(e).color,main:getComputedStyle(document.querySelector('#view')).color})),{timeout:1000,intervals:[16,32,64,100]}).toEqual({heading:expected,main:expected});
  expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe(theme==='dark'?'#10151f':'#f3f6fa');
 }
});
