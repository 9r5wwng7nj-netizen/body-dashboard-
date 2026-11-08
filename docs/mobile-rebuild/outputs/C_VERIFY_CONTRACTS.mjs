// Architecture arithmetic/schema smoke checks; no native/application acceptance claim.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { TABLES, LOCAL_ONLY_TABLES, IMMUTABLE_TABLES, RELATIONS } from './C_DOMAIN_CONTRACTS.ts';
const vectors = JSON.parse(readFileSync(new URL('./C_ANALYTICS_VECTORS.json', import.meta.url)));
const close = (a,b) => assert.ok(Math.abs(a-b) <= vectors.tolerance, `${a} != ${b}`);
let assertions = 0;
for (const [name, columns] of Object.entries(TABLES)) {
  assert.match(name,/^[a-z][a-z0-9_]*$/);
  for (const [key,col] of Object.entries(columns)) {
    assert.ok(!['id','_status','_changed'].includes(key));
    assert.ok(['string','number','boolean'].includes(col.type));
    assert.equal(typeof col.isOptional,'boolean'); assert.equal(typeof col.isIndexed,'boolean');
  }
  if ('athlete_id' in columns) assert.ok('workspace_id' in columns);
  assertions++;
}
for (const [child,key,parent] of RELATIONS) {
  assert.equal(TABLES[child][key].type,'string'); assert.ok(TABLES[parent]); assertions++;
}
for (const table of [...LOCAL_ONLY_TABLES,...IMMUTABLE_TABLES]) assert.ok(TABLES[table]);
for (const [table,fields] of Object.entries({set_observations:['load_kg','reps','duration_s','distance_m','rpe'],
 food_entry_versions:['energy_kcal','protein_g','carbs_g','fat_g'],weigh_in_versions:['weight_kg']})) {
  for(const field of fields) assert.equal(TABLES[table][field].isOptional,true);
}
for (const v of vectors.e1rm) {
  const eligible = (v.kind ?? 'working')==='working' && (v.state ?? 'completed')==='completed'
    && (v.loadBasis ?? 'external_total')!=='unknown' && (v.trackingType ?? 'weight_reps')==='weight_reps'
    && typeof v.loadKg==='number' && v.loadKg>0 && Number.isInteger(v.reps) && v.reps>=1 && v.reps<=10;
  const actual = eligible ? (v.reps===1 ? v.loadKg : v.loadKg*(1+v.reps/30)) : null;
  v.expectedKg===null ? assert.equal(actual,null) : close(actual,v.expectedKg); assertions++;
}
const c=vectors.comparison;close(c.currentKg-c.baselineKg,c.expectedDeltaKg);
close(100*(c.currentKg-c.baselineKg)/c.baselineKg,c.expectedPercent);
const ordinal = day => Date.parse(`${day}T00:00:00Z`)/86400000;
for (const v of vectors.calendarDays) close(ordinal(v.to)-ordinal(v.from),v.expected);
for (const v of vectors.ewma) {
  const grouped = new Map();
  for (const w of v.readings) {
    if(v.through && w.day>v.through) continue;
    if(!grouped.has(w.day)) grouped.set(w.day,[]);
    grouped.get(w.day).push(w);
  }
  let lastDay=null, trend=null;const actual=[];
  for (const day of [...grouped.keys()].sort()) {
    const readings=grouped.get(day).sort((a,b)=>a.at-b.at || (a.id<b.id ? -1 : a.id>b.id ? 1 : 0));
    const selected=readings.find(w=>w.id===v.primary?.[day]) ?? readings.at(-1);
    const alpha=lastDay===null ? 1 : 1-2**(-(ordinal(day)-ordinal(lastDay))/7);
    trend=trend===null ? selected.kg : alpha*selected.kg+(1-alpha)*trend;
    actual.push(trend);lastDay=day;
  }
  assert.equal(actual.length,v.expectedTrendKg.length);
  actual.forEach((x,i)=>close(x,v.expectedTrendKg[i]));assertions++;
}
const w=vectors.week;
assert.deepEqual(w.sessions.filter(s=>s.state==='completed' && s.performedSets>0 &&
  s.day>=w.monday && s.day<=w.sunday && s.day<=w.today).map(s=>s.id),w.expectedIds);
const values=vectors.unknownNutrients.values;
close(180*0.45359237,81.6466266);close(1.25*1000,1250);
assert.equal(values.filter(x=>x!==null).reduce((a,b)=>a+b,0),vectors.unknownNutrients.expectedKnown);
assert.equal(values.filter(x=>x===null).length,vectors.unknownNutrients.expectedUnknownContributors);
// Deterministic logical import identity is independent of key order and file export time.
const canonical = value => Array.isArray(value) ? value.map(canonical) :
  value && typeof value==='object' ? Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
assert.equal(hash({id:'synthetic',sets:[{reps:5,weight:80}]}),hash({sets:[{weight:80,reps:5}],id:'synthetic'}));
assert.notEqual(hash({id:'synthetic',reps:5}),hash({id:'synthetic',reps:6}));
const logicalKey=(source,workout,path)=>hash([source,'workout',workout,path]);
assert.equal(logicalKey('source-a','w1','e/0/s/0'),logicalKey('source-a','w1','e/0/s/0'));
assert.notEqual(logicalKey('source-a','w1','e/0/s/0'),logicalKey('source-a','w1','e/1/s/0'));
assert.notEqual(logicalKey('source-a','w1','e/0/s/0'),logicalKey('source-b','w1','e/0/s/0'));
console.log(JSON.stringify({kind:'architecture-contract-smoke',tables:Object.keys(TABLES).length,
  declaredColumns:Object.values(TABLES).reduce((sum,t)=>sum+Object.keys(t).length,0),
  relationshipChecks:RELATIONS.length,e1rmVectors:vectors.e1rm.length,ewmaVectors:vectors.ewma.length,
  checkedGroups:assertions,nativeCompatibilityProven:false,status:'passed'},null,2));
