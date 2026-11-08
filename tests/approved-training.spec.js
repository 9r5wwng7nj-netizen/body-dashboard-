import {test,expect} from '@playwright/test';
import {serveRepo,stopServer} from './serve.js';
let server;
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
test.beforeEach(async({page})=>{server=await serveRepo();await page.goto(`http://localhost:${server.address().port}/index.html?pwa`);await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);await page.evaluate(async()=>{A.helpDismiss({dataset:{what:'tour'}});S.unit='kg';await Store.flushDirty();});});
test.afterEach(async()=>stopServer(server));
async function start(page){await page.evaluate(()=>startWorkout({id:'synthetic-picker-session',name:'Synthetic session',exercises:[{id:'old-block',name:'Bench Press (Barbell)',rest:90,sets:[{id:'accepted-slot',type:'normal',weight:60,reps:8,done:false},{id:'draft-slot',type:'normal',weight:null,reps:null,rpe:null,done:false,draft:{weight:'72.',reps:'9'},draftUnits:{weight:'lbs',reps:'lbs'}}]}]}));}
async function chooseSwap(page,name='Leg Press'){await page.evaluate(()=>openExercisePicker('session-replace',0));await page.locator('#exercise-picker-search').fill(name);await page.getByRole('button',{name:`Choose ${name}`,exact:true}).click();await page.getByRole('button',{name:'Use for this workout',exact:true}).click();await expect(page.locator('#modal')).toBeHidden();}
test('routine picker browses and multi-adds while keeping unsaved parent edits',async({page})=>{
 await page.evaluate(()=>{ui.rDraft={id:null,name:'Synthetic draft',folder:'',notes:'Keep these notes',exercises:[]};drawRoutineModal();});
 await page.getByRole('button',{name:'Add exercises',exact:true}).click();
 await expect(page.locator('#modal')).toContainText('Recent exercises first');
 await page.locator('#exercise-picker-search').fill('bench');await page.getByRole('button',{name:'Select Bench Press (Barbell)',exact:true}).click();
 await page.locator('#exercise-picker-search').fill('leg press');await page.getByRole('button',{name:'Select Leg Press',exact:true}).click();
 await page.getByRole('button',{name:'Add selected (2)',exact:true}).click();
 expect(await page.evaluate(()=>[ui.rDraft.name,ui.rDraft.notes,ui.rDraft.exercises.map(e=>e.name)])).toEqual(['Synthetic draft','Keep these notes',['Bench Press (Barbell)','Leg Press']]);
 await page.getByRole('button',{name:'Add exercises',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();
 await expect(page.locator('#modal')).toContainText('Save routine');expect(await page.evaluate(()=>ui.rDraft.exercises.length)).toBe(2);
});
test('partial swap preserves accepted identity, raw drafts in receipt, timer and undo after reload',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Complete set',exact:true}).first().click();await expect(page.getByRole('button',{name:'Undo completed set',exact:true})).toBeVisible();
 const original=await page.evaluate(()=>structuredClone(Store.get('activeWorkout'))),timer=await page.evaluate(()=>Timer.source);
 await chooseSwap(page);
 const after=await page.evaluate(()=>structuredClone(Store.get('activeWorkout')));
 expect(after.exercises.map(e=>e.name)).toEqual(['Bench Press (Barbell)','Leg Press']);expect(after.exercises[0].sets).toEqual([original.exercises[0].sets[0]]);
 expect(after.exercises[1].sets[0]).toMatchObject({id:'draft-slot',weight:null,reps:null,rpe:null,done:false});expect(after.exercises[1].sets[0].draft).toBeUndefined();expect(await page.evaluate(()=>Timer.source)).toBe(timer);
 expect(await page.evaluate(async()=>{const r=(await idbEntries('local')).find(([k,v])=>k.startsWith('bd.web.receipt.')&&v.purpose==='swap-exercise')[1];return r.beforeWorkout.exercises[0].sets[1].draftUnits.weight;})).toBe('lbs');
 await page.reload();await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);await page.getByRole('button',{name:'Undo last swap',exact:true}).click();
 await expect(page.locator('.workout-exercise')).toHaveCount(1);expect(await page.evaluate(()=>Store.get('activeWorkout'))).toEqual(original);
});
test('all completed and partial-superset swaps never relabel or merge original work',async({page})=>{
 await page.evaluate(async()=>{await startWorkout({id:'synthetic-group',name:'Synthetic superset',exercises:[{id:'a',name:'Bench Press (Barbell)',ss:true,rest:90,sets:[{id:'a-done',weight:40,reps:5,type:'normal',done:true},{id:'a-next',weight:null,reps:null,type:'normal',done:false}]},{id:'b',name:'Row',ss:false,rest:90,sets:[{id:'b-done',weight:30,reps:8,type:'normal',done:true}]}]});});
 await chooseSwap(page);
 expect(await page.evaluate(()=>Store.get('activeWorkout').exercises.map(e=>[e.id,e.name,e.ss]))).toEqual([['a','Bench Press (Barbell)',true],['b','Row',false],[expect.any(String),'Leg Press',false]]);
 await page.evaluate(async()=>{await undoExerciseSwap();const aw=structuredClone(Store.get('activeWorkout'));aw.exercises[0].sets=aw.exercises[0].sets.filter(s=>s.done);await WebWrites.command({activeWorkout:aw},'amend-set');render();});
 await chooseSwap(page);
 const info=await page.evaluate(()=>Store.get('activeWorkout').exercises.map(e=>({id:e.id,ids:e.sets.map(s=>s.id),done:e.sets.map(s=>s.done)})));
 expect(info[0].ids).toEqual(['a-done']);expect(info[2].ids).not.toContain('a-done');expect(info[2].done).toEqual([false,false,false]);
});
test('failed swap recovers exactly once through existing durable intents and full backup',async({page,context})=>{
 await start(page);await page.evaluate(()=>{window.failSwap=true;const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(window.failSwap&&this.name==='kv'&&key==='activeWorkout'&&value?.swapToken){queueMicrotask(()=>{try{this.transaction.abort();}catch{}});}return put.apply(this,arguments);};});
 await page.evaluate(()=>openExercisePicker('session-replace',0));await page.locator('#exercise-picker-search').fill('Plank');await page.getByRole('button',{name:'Choose Plank',exact:true}).click();await page.getByRole('button',{name:'Use for this workout',exact:true}).click();
 await expect(page.locator('#modal')).toContainText('selection is retained');expect(await page.evaluate(()=>Store.get('activeWorkout').exercises[0].name)).toBe('Bench Press (Barbell)');
 expect(await page.evaluate(async()=>{const b=await buildBackupPayload();return !!b.extensions.bdWeb.entries.find(([k,v])=>k.startsWith('bd.web.intent.')&&v.purpose==='swap-exercise');})).toBe(true);
 await page.evaluate(()=>{window.failSwap=false;});await page.reload();await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);await page.getByRole('button',{name:'Retry save',exact:true}).click();
 await expect(page.locator('.workout-exercise')).toContainText('Plank');expect(await page.evaluate(()=>Store.get('activeWorkout').exercises.length)).toBe(1);
 await page.evaluate(()=>WebWrites.retry());expect(await page.evaluate(()=>Store.get('activeWorkout').exercises.length)).toBe(1);
 await page.waitForFunction(()=>document.querySelector('#offline-state')?.textContent.includes('Ready offline'));await context.setOffline(true);await page.reload();await page.waitForFunction(()=>typeof Store!=='undefined'&&Store.ready);expect(await page.evaluate(()=>Store.get('activeWorkout').exercises[0].sets[0].weight)).toBeNull();
});
test('all repeated blocks contribute to bests and dated Previous uses a comparable recorded basis',async({page})=>{
 const result=await page.evaluate(async()=>{const w={id:'synthetic-repeat',name:'Synthetic',start:'2026-11-01T12:00:00Z',exercises:[{id:'one',name:'Row',sets:[{weight:40,reps:8,type:'normal'}]},{id:'two',name:'Row',sets:[{weight:50,reps:12,type:'normal'}]}]};Store.set('workouts',[w]);await Store.flushDirty();return {blocks:exerciseHistory('Row').map(r=>r.ex.id),previous:previousExercise({name:'Row'}).ex.id,best:allTimeBests('Row','weight_reps').weight.v};});
 expect(result).toEqual({blocks:['two','one'],previous:'two',best:50});
 await start(page);await page.getByRole('button',{name:'Complete set',exact:true}).first().click();await expect(page.getByRole('button',{name:'Undo completed set',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>{const ex=Store.get('activeWorkout').exercises[0];Store.get('exMeta')[ex.name.toLowerCase()]={type:'duration',primary:'Other',secondary:[],equipment:'Other',howto:'https://example.com/synthetic-howto'};return {type:exerciseInfo(ex).type,howto:exerciseInfo(ex).howto};})).toEqual({type:'weight_reps',howto:'https://example.com/synthetic-howto'});
});
test('routine coverage keeps scalar plans, primary/secondary, sparse metadata and frequency explicit',async({page})=>{
 const r=await page.evaluate(()=>{const routine={name:'Synthetic coverage',exercises:[{name:'Bench Press (Barbell)',sets:3},{name:'Triceps Pushdown (Cable)',sets:2},{name:'Plank',sets:4},{name:'Custom unknown',sets:2},{name:'Leg Press',sets:null}]};const report=routineCoverage(routine,.5,1);ui.rDraft={...routine,id:null,folder:'',notes:''};showRoutineCoverage(true);return report;});
 expect(r.total).toBe(7);expect(r.invalid).toBe(1);expect(r.separate).toEqual([{name:'Plank',sets:4}]);expect(r.unknown).toHaveLength(1);
 expect(r.rows.find(m=>m.muscle==='Triceps')).toMatchObject({primary:2,secondary:3,credited:3.5});
 await expect(page.locator('#modal')).toContainText('frequency not specified');await page.locator('[data-f="frequency"]').fill('2');await expect(page.locator('#modal')).toContainText('Planned week scenario · 2 repeats/week');await expect(page.locator('#modal')).toContainText('14');
});
test('custom creation confirms metadata, selects locally and keeps parent draft on cancel',async({page})=>{
 await page.evaluate(()=>{ui.rDraft={id:null,name:'Synthetic routine',folder:'',notes:'Do not lose',exercises:[]};drawRoutineModal();openExercisePicker('routine-add');});
 await page.locator('#exercise-picker-search').fill('Synthetic timed movement');await page.getByRole('button',{name:'Create a custom exercise: Synthetic timed movement',exact:true}).click();
 await page.locator('#modal [name="type"]').selectOption('duration');await page.locator('#modal [name="primary"]').selectOption('Other');await page.locator('#modal [name="equipment"]').selectOption('Other');await page.getByRole('button',{name:'Save and select',exact:true}).click();
 await expect(page.getByRole('button',{name:'Select Synthetic timed movement',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Cancel',exact:true}).click();expect(await page.evaluate(()=>[ui.rDraft.notes,ui.rDraft.exercises.length])).toEqual(['Do not lose',0]);
 expect(await page.evaluate(()=>Store.get('exMeta')['synthetic timed movement'])).toEqual({type:'duration',primary:'Other',secondary:[],equipment:'Other'});
 await page.evaluate(()=>openExercisePicker('routine-add'));await page.locator('#exercise-picker-search').fill('synthetic timed');await page.getByRole('button',{name:'Select Synthetic timed movement',exact:true}).click();await page.getByRole('button',{name:'Add selected (1)',exact:true}).click();expect(await page.evaluate(()=>ui.rDraft.exercises[0].reps)).toBe('0:45');
});
test('undo after newer accepted replacement work refuses to erase that work',async({page})=>{
 await start(page);await chooseSwap(page);await page.locator('input[data-f="weight"]').first().fill('90');await page.locator('input[data-f="reps"]').first().fill('10');await page.getByRole('button',{name:'Complete set',exact:true}).first().click();await expect(page.getByRole('button',{name:'Undo completed set',exact:true})).toBeVisible();
 const before=await page.evaluate(()=>structuredClone(Store.get('activeWorkout')));await page.getByRole('button',{name:'Undo last swap',exact:true}).click();await expect(page.locator('#toasts')).toContainText('workout changed after the swap');expect(await page.evaluate(()=>Store.get('activeWorkout'))).toEqual(before);
});
test('routine start preserves zero counts and rejects invalid or all-zero prescriptions',async({page})=>{
 const result=await page.evaluate(()=>{
 const valid={id:'synthetic-scalar',name:'Synthetic scalar',exercises:[{name:'Bench Press (Barbell)',sets:0},{name:'Leg Press',sets:2}]};
 const zero=workoutFromRoutine(valid).exercises.map(e=>e.sets.length);
 const errors=[undefined,null,-1,1.5,'3'].map(sets=>{try{workoutFromRoutine({...valid,exercises:[{name:'Leg Press',sets}]});return null;}catch(e){return e.message;}});
 let allZero;try{workoutFromRoutine({...valid,exercises:[{name:'Leg Press',sets:0}]});}catch(e){allZero=e.message;}
 Store.set('routines',[{...valid,exercises:[{name:'Leg Press',sets:null}]}]);A.startRoutine({dataset:{id:valid.id}});
 return {zero,errors,allZero,active:Store.get('activeWorkout')};
 });
 expect(result.zero).toEqual([0,2]);expect(result.errors.every(e=>e?.includes('Review set counts'))).toBe(true);expect(result.allZero).toContain('at least one planned working set');expect(result.active).toBeNull();await expect(page.locator('#toasts')).toContainText('Review set counts');
});
test('empty replacement blocks retain zero slots and empty routine input is not explicit zero',async({page})=>{
 const result=await page.evaluate(()=>{const before={id:'synthetic-empty',exercises:[{id:'empty',name:'Leg Press',rest:90,sets:[]}]};const swap=prepareExerciseSwap(before,0,'Plank');ui.rDraft={exercises:[{name:'Leg Press',sets:3}]};A.rdEx({dataset:{i:'0',f:'sets'},value:''});const empty=ui.rDraft.exercises[0].sets;A.rdEx({dataset:{i:'0',f:'sets'},value:'0'});return {slots:swap.next.exercises[0].sets.length,id:swap.next.exercises[0].id,empty,zero:ui.rDraft.exercises[0].sets};});
 expect(result).toEqual({slots:0,id:'empty',empty:null,zero:0});
});
test('custom definition acknowledges an already recovered receipt without a second save',async({page})=>{
 await page.evaluate(()=>{ui.rDraft={id:null,name:'Synthetic draft',folder:'',notes:'',exercises:[]};drawRoutineModal();openExercisePicker('routine-add');window.failCustom=true;const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(window.failCustom&&this.name==='kv'&&key==='exMeta'&&value?.['synthetic recovered exercise'])queueMicrotask(()=>{try{this.transaction.abort();}catch{}});return put.apply(this,arguments);};});
 await page.locator('#exercise-picker-search').fill('Synthetic recovered exercise');await page.getByRole('button',{name:'Create a custom exercise: Synthetic recovered exercise',exact:true}).click();await page.locator('#modal [name="type"]').selectOption('duration');await page.getByRole('button',{name:'Save and select',exact:true}).click();
 await expect(page.locator('#modal')).toContainText('Changes could not be saved');await page.evaluate(async()=>{window.failCustom=false;await WebWrites.retry();});await page.locator('#modal').getByRole('button',{name:'Retry save',exact:true}).click();
 await expect(page.getByRole('button',{name:'Select Synthetic recovered exercise',exact:true})).toHaveAttribute('aria-pressed','true');
 const result=await page.evaluate(async()=>({names:Store.get('exercises').filter(n=>n==='Synthetic recovered exercise').length,receipts:(await idbEntries('local')).filter(([k,v])=>k.startsWith('bd.web.receipt.')&&v.purpose==='save-custom-exercise').length,pending:WebWrites.pending.size}));expect(result).toEqual({names:1,receipts:1,pending:0});
});
