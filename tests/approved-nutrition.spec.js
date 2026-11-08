import {test,expect} from '@playwright/test';
import {serveRepo,stopServer} from './serve.js';
import fs from 'node:fs/promises';
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
let server;
test.beforeEach(async({page})=>{server=await serveRepo();if(process.env.BD_NUT_SOURCE)await page.route('**/index.html',async route=>route.fulfill({contentType:'text/html',body:await fs.readFile(process.env.BD_NUT_SOURCE,'utf8')}));await page.goto(`http://localhost:${server.address().port}/index.html`);await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);await page.evaluate(async()=>{A.helpDismiss({dataset:{what:'tour'}});await Store.flushDirty();});});
test.afterEach(async()=>stopServer(server));
test('three projected roots preserve legacy order and hidden preferences',async({page})=>{
 const state=await page.evaluate(()=>{S.bar=['recipes','nutrition','fitness','dashboard'];S.hiddenTabs={nutTab:['foods'],fitTab:['history']};render();return {bar:S.bar,roots:navRoots(),hidden:S.hiddenTabs};});
 expect(state.roots).toEqual(['nutrition','fitness','dashboard']);expect(state.bar).toEqual(['recipes','nutrition','fitness','dashboard']);
 await expect(page.locator('#bottom-bar .bar-item')).toHaveCount(3);
 await page.evaluate(()=>A.nutPage({dataset:{page:'library'}}));await expect(page.locator('#view-title')).toHaveText('Library');await expect(page.locator('#view .tabs-row')).toHaveCount(0);
 await page.evaluate(()=>A.trainPage({dataset:{page:'history'}}));await expect(page.locator('#view-title')).toHaveText('Workout history');
 expect(await page.evaluate(()=>S.hiddenTabs)).toEqual(state.hidden);
 await page.evaluate(()=>{A.nutPage({dataset:{page:'library'}});ui.nutTab='body';go('nutrition');});await expect(page.locator('#view-title')).toHaveText('Weight & measurements');
 await page.evaluate(()=>{A.nutPage({dataset:{page:'mealplan'}});ui.nutTab='plan';go('nutrition');});await expect(page.locator('#view-title')).toHaveText('Targets & check-ins');
 await page.evaluate(()=>{ui.recTab='recipes';go('recipes');});await page.locator('[data-action="libraryFilters"]').click();await page.locator('#modal select[name="kind"]').selectOption('food');await page.locator('#modal button:has-text("Apply filter")').click();expect(await page.evaluate(()=>ui.libraryType)).toBe('food');
});
test('all retired entry points are inert and original inventory survives ordinary use',async({page})=>{
 await page.evaluate(async()=>{Store.set('pantry',[{id:'p1',name:'Rice',low:false}]);Store.set('grocery',[{id:'g1',name:'Rice',checked:true}]);Store.set('freezer',[{id:'z1',name:'Synthetic dinner',portions:3}]);Store.set('gkit',{budget:123,basics:['rice'],custom:'keep'});Store.set('recipes',[{id:'r1',title:'Synthetic dinner',ingredients:'100 g rice',steps:'Cook rice.',freezer:true,tags:['Dinner','Freezer'],servings:1,cal:450,p:null,c:60,f:8}]);Store.set('mealPlan',{[ymd()]:[{id:'mp1',recipeId:'r1',freezerId:'z1',slot:'dinner'}]});await Store.flushDirty();});
 const before=await page.evaluate(()=>JSON.stringify(['pantry','grocery','freezer','gkit'].map(k=>Store.get(k))));
 for(const pageName of ['library','mealplan','body','targets']){await page.evaluate(p=>A.nutPage({dataset:{page:p}}),pageName);expect(await page.locator('#view [data-action]').evaluateAll(els=>els.some(e=>retiredAction(e.dataset.action)))).toBe(false);}
 await page.evaluate(()=>{A.mealMade({dataset:{date:ymd(),id:'mp1'}});A.groceryBuild();A.grocPutAway();A.cookFreeze({dataset:{id:'r1'}});A.fzUse({dataset:{id:'z1'}});});
 expect(await page.evaluate(()=>JSON.stringify(['pantry','grocery','freezer','gkit'].map(k=>Store.get(k))))).toBe(before);
 await page.evaluate(()=>{ui.recTab='pantry';go('recipes');});await expect(page.locator('#view')).toContainText('This feature has been retired');
 await page.evaluate(()=>recViewModal(recFind('r1')));await expect(page.locator('#modal [data-action="recToGrocery"],#modal [data-action="cookFreeze"],#modal [name="freezer"]')).toHaveCount(0);
});
test('typed library filters, favorites and portion logging retain unknown nutrients',async({page})=>{
 await page.evaluate(async()=>{Store.set('foods',[{id:'food1',name:'Synthetic yogurt',basis:'serving',servingLabel:'pot',base:{cal:100,p:10,c:null,f:0},extra:[]}]);Store.set('meals',[{id:'meal1',name:'Synthetic bowl',cal:300,p:20,c:null,f:5}]);Store.set('recipes',[{id:'recipe1',title:'Synthetic soup',servings:1,cal:200,p:null,c:20,f:5,tags:[]}]);await Store.flushDirty();A.nutPage({dataset:{page:'library'}});});
 await expect(page.locator('[data-action="libraryLog"]')).toHaveCount(3);
 await page.locator('[data-action="libraryFavorite"][data-kind="meal"]').click();await page.locator('[data-action="libraryFavorites"]').click();await expect(page.locator('[data-action="libraryLog"]')).toHaveCount(1);
 await page.locator('[data-action="libraryLog"]').click();await page.locator('#modal input[name="qty"]').fill('1.5');await page.locator('#modal button:has-text("Log portion")').click();await expect(page.locator('#modal')).toBeHidden();
 expect(await page.evaluate(()=>Store.get('nutrition')[ymd()].entries.map(e=>({name:e.name,cal:e.cal,p:e.p,c:e.c,f:e.f})))).toEqual([{name:'Synthetic bowl',cal:450,p:30,c:null,f:7.5}]);
});
test('old food-linked entry edits scale its own snapshot after food-definition changes',async({page})=>{
 await page.evaluate(async()=>{Store.set('foods',[{id:'food1',name:'Current food',basis:'serving',servingLabel:'pot',base:{cal:999,p:50,c:20,f:20},extra:[]}]);Store.set('nutrition',{[ymd()]:{entries:[{id:'entry1',foodId:'food1',name:'Original logged food',qty:1,unit:'pot',meal:'breakfast',cal:100,p:null,c:15,f:0}]}});await Store.flushDirty();ui.nutDate=ymd();A.entryEdit({dataset:{id:'entry1'}});});
 await expect(page.locator('#modal')).toContainText('original logged nutrition');await page.locator('#modal input[name="qty"]').fill('2');await page.locator('#modal button:has-text("Save portion")').click();await expect(page.locator('#modal')).toBeHidden();
 expect(await page.evaluate(()=>Store.get('nutrition')[ymd()].entries[0])).toMatchObject({id:'entry1',foodId:'food1',name:'Original logged food',qty:2,cal:200,p:null,c:30,f:0});
});
test('meal generator changes plan preferences only and never builds shopping inventory',async({page})=>{
 const result=await page.evaluate(async()=>{Store.set('gkit',{budget:123,stores:['A'],staples:[{id:'s1',text:'Rice'}],spend:[{id:'sp1',amount:5}],basics:['rice']});Store.set('grocery',[{id:'g1',name:'Keep'}]);Store.set('freezer',[{id:'z1',portions:4}]);Store.set('recipes',[{id:'r1',title:'Synthetic dinner',servings:2,ingredients:'Rice',tags:['Dinner'],cal:300}]);await Store.flushDirty();const before=structuredClone(Store.get('gkit'));ui.mpw={ws:startOfWeek(),people:2,budget:90,slots:['dinner'],maxTime:0,library:false,picks:{[ymd()+'|dinner']:'r1'},replace:false};mpwApply();await Store.flushDirty();return {before,after:Store.get('gkit'),grocery:Store.get('grocery'),freezer:Store.get('freezer'),items:Store.get('mealPlan')[ymd()]};});
 for(const k of Object.keys(result.before))expect(result.after[k]).toEqual(result.before[k]);expect(result.after.planPrefs.budget).toBe(90);expect(result.grocery).toEqual([{id:'g1',name:'Keep'}]);expect(result.freezer).toEqual([{id:'z1',portions:4}]);expect(result.items).toHaveLength(1);
});
