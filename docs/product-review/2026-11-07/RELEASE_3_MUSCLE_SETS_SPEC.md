# Release 3 — Muscle sets engine and UI implementation specification

November 7, 2026 (America/New_York) · Prepared while Release 1 owns shared runtime files

Companions: [approved iteration plan](NEXT_ITERATION_PLAN.md), [counting audit/redesign](NEXT_VOLUME_REDESIGN.md). This file is an implementation handoff, not runtime code. No application files, data, branches or deployment were changed to prepare it. Recheck symbol locations after Releases 1–2 merge.

## Boundaries and ship result

Ship a named **Muscle sets** page with **Plan / Performed**, shared role accounting and explainable body-area drilldown. Keep Cobalt Air, 375/390px, 44px controls, offline operation, current record identities and backups. Do not add a database, stored aggregate counters, physiological volume score, universal dose targets or AI programming in this release.

Plan reads the selected draft/saved routines and explicit occurrence counts. Performed reads saved history, with current local Monday-through-today as default. Nothing changes routine scheduling, active workouts, source exercise classifications or library definitions merely because a report opens.

## Exact existing consumers: what to replace and what to leave alone

All symbols are in `index.html`.

| Existing symbol / consumers | Release 3 change |
| --- | --- |
| `muscleSets(ws)` → `fitStatsTab()` monthly bar/4-week table and `workoutSummaryModal(w)` | Replace all visible consumers with the new report/role rows. Do not leave an unexplained half-credit report beside the new workspace. Remove the old function if no consumer remains, or retain only a deliberately named compatibility adapter for tests/advanced model use; no default UI calls it. |
| `routineCoverage`, `showRoutineCoverage`, `drawRoutineCoverage`, actions `routineCoverageDraft`, `routineCoverageSaved`, `coverageSetting` | Preserve both entry actions, but open the new Plan workspace. Adapt `routineCoverage` temporarily to the new engine if existing direct query tests need compatibility. Its old fractional-credit modal and frequency control become the explicit scenario controls described below. |
| `completedWorkoutHistory`, `completedWorkoutsThisWeek`, `workoutWeekRange` → Dashboard Today/training, Train count, workout options and finish weekly count | Preserve external signatures. Reuse the same saved-history/date eligibility in the new model; do not introduce another week definition. A saved legacy workout with no `end` remains history, as it already does. |
| `fitStatsTab()` | Separate calendar rows (`W()`, all saved records for editing, including visibly future-dated entries) from performed statistics (`completedWorkoutHistory(today)` in selected month). Month/week sets use the new engine. Future saved workouts remain accessible but cannot inflate completed statistics. Four-week muscle table can become a link to Performed, or a role-separated compact view built from the same engine. |
| `workSets(ex)` → `workoutVolume`, `workoutSets`, `bestSet`, `allTimeBests`, `checkPR`, `metricDefs`, exercise Progress/Recent table, monthly Top exercises, `workoutToRoutine` | **Do not globally redefine `workSets` as part of this report.** It is also a PR/performance and template-conversion helper. Its broad behavior is a separate compatibility surface. Introduce eligibility for the new report explicitly. |
| `workoutSets(w)` → Train recent, History cards, calendar day list, finish Sets, monthly Working sets, `workoutToRoutine` | For finish/monthly report, use the new report totals and name their units. History/Train cards may retain existing “sets” temporarily, or adopt “logged rows” from `muscleSetReportForWorkout`; do not silently call timed/cardio segments resistance sets. Do not change workout-to-routine derivation without its own explicit regression. |
| `exerciseInfo(ex)`, `exerciseClassification(name)` | Reuse snapshot-first resolution. New read-model functions must never backfill or edit classification. Current `exInfo(name)` is appropriate only for Plan or legacy fallback. |
| `renderFitness` → named pages `history/routines/library/progress` and `fitProgressTab` | Add `muscles` to page-title/render maps. Add one named link on Training progress, not a new scrolling tab strip. Add the routine shortcuts described below. |

Root integration choice: retaining the old general `workoutSets` display elsewhere is safe only with explicit unit labels. The required Release 3 gates are the workspace, finish muscle breakdown and monthly/weekly performed-date correction; unrelated PR/E1RM arithmetic remains unchanged.

## Minimal data flow

```text
saved history / selected routine draft
             ↓
resolve existing classification + normalize read-only labels
             ↓
validate required values and attach source-row/slot provenance
             ↓
partition rep-based / timed / conditioning / warm-up / invalid
             ↓
aggregate primary + secondary separately by muscle
             ↓
aggregate body areas by unique fact references, primary precedence
             ↓
render overview → muscle → contributing workout/routine rows
```

No Store mutation is permitted in any function below. UI selection lives on `ui`. Exports/backups continue to contain original records only.

## Suggested pure function contracts

Use these names only after a fresh collision search; they are unused in the reviewed checkout. The shapes below are JavaScript documentation, not a request for a separate TypeScript runtime.

### 1. `muscleSetPeriod({ mode='week', anchor=ymd(), start, end, today=ymd() }={})`

Return:

```js
{
  mode, start, requestedEnd, through, today,
  label,                 // e.g. "Nov 2–8 · through Nov 7"
  futureOnly: false,     // true when start > today; empty Performed, never reversed range
  invalid: false,
  error: ''
}
```

- Validate date strings by regex plus `ymd(parseYmd(value)) === value`, because `parseYmd` otherwise rolls February 31 into another date.
- Week start uses `startOfWeek(anchor)`; requestedEnd is `addDays(start,6)`; through is the earlier of requestedEnd and today.
- Month uses local first/last calendar days. Custom range requires valid start ≤ end. No UTC `toISOString().slice(0,10)` date classification.
- A future-only period returns an empty report with a future-date explanation, not a mutated source record or an error crash.

### 2. `muscleSetMapping(ex, { planned=false }={})`

Return:

```js
{
  type, primary: 'Chest' | null, secondary: ['Triceps', 'Shoulders'],
  mode: 'recorded' | 'current',
  origin: 'user' | 'builtin' | 'catalog' | 'inferred' | 'unknown',
  confidence: 'mapped' | 'inferred' | 'unmapped',
  broadUnallocated: false,    // e.g. Full Body is not one set for every muscle
  issues: []                 // unknown labels, malformed secondary array, unsupported type
}
```

Resolution:

1. Performed: valid version-1 `ex.classification` takes precedence (`exerciseInfo`), with `mode:'recorded'`. A missing/invalid snapshot is a visible current-mapping fallback, never a fabricated snapshot.
2. Plan: `exInfo(ex.name)` with `mode:'current'`, even if a routine was derived from history. Plan means today's definition, not a claim about past work.
3. Normalize known muscle labels case-insensitively for the projection only. Filter duplicate secondary names, remove primary self-overlap and reject anatomical values not in the final Release 2 vocabulary. Preserve raw strings in source records.
4. Other, missing primary and Full Body are unallocated distribution, not zero work. Cardio is an activity classification. Secondary Other/Cardio/Full Body are not anatomical targets.
5. Classify inferred origin separately even when its heuristic primary looks plausible. **Recommended default:** inferred mappings are available as tentative contributions, but are excluded from the main mapped body/muscle bars and disclosed as “needs mapping review.” Do not hide them inside confident totals. If root chooses to include them, UI must show their own subtotal rather than silently merge them.
6. Do not label an empty secondary array “no other muscles worked”; label “No secondary groups mapped.”

Keep provenance dimensions orthogonal: a recorded snapshot can itself have origin `inferred`. “Recorded” does not mean independently anatomically validated.

### 3. `muscleSetRow(set, mapping, ref)`

Resolve a **saved history row**, not an active draft. Return one of:

```js
{ eligible:true, fact:{ key, ref, weight:1, category, kind,
  type, primary, secondary, mappingMode, origin, confidence,
  durationSec:null, distanceKm:null, reps:null } }
{ eligible:false, reason:'explicit-unaccepted'|'invalid-required-values'|
  'unsupported-tracking-type', ref, issues:[] }
```

Required-field policy must mirror the existing accepted-value contract for supported tracking types:

| Type | Required values | Main partition |
| --- | --- | --- |
| `weight_reps`, `weighted_bw`, `assisted_bw` | finite weight ≥ 0; integer reps > 0, or zero only when kind is failure | Rep-based working row unless primary is Cardio |
| `bodyweight` | integer reps > 0, or zero only when kind is failure; no invented weight requirement | Rep-based working row unless primary is Cardio |
| `duration` | finite duration > 0 | Timed segment; primary Cardio makes conditioning |
| `weight_duration` | finite weight ≥ 0 and duration > 0 | Timed segment |
| `distance_duration` | finite distance > 0 and duration > 0 | Conditioning segment |

- **Absent `done` is valid saved-history convention.** `WorkoutCommands.finish` strips the `done` property before storing canonical history, and Hevy imports omit it. Requiring `done:true` would erase most legitimate analysis.
- Explicit `done:false` is a reviewable unaccepted flag; exclude from performed totals. This does not delete the row. If a known historical exporter used explicit false as its completed convention, add a format-specific reviewed adapter rather than treating every false as accepted.
- Never call `workoutDraftValues` here: a row's canonical base may be valid while `draft` contains an uncommitted amendment. Do not count the amendment or add a second row. For an unusual stored history row with draft fields, count only a valid canonical base and disclose a pending-draft issue.
- Optional RPE, notes, PR flags or missing exercise photo cannot make a valid required-value row disappear. RPE is not an eligibility/intensity threshold.
- Use canonical stored numeric fields. A numeric string outside the documented canonical schema should be reviewable; do not coerce empty strings to zero or parse `"20kg"` as 20 silently. A read-only strict numeric-string adapter is possible only if root verifies an actual supported legacy format that requires it.
- Missing kind behaves as normal. Case-fold exact known kinds (`normal`, `warmup`, `drop`, `failure`) for this projection only. Unknown kind remains a labeled valid working row when values are valid; do not infer warm-up from light load.
- Valid warm-up rows partition to `warmup`; they never contribute primary/secondary working counts. No drop/failure/side multiplier. A recorded failure with zero reps follows today's accepted contract and is disclosed as a recorded failure attempt, not positive completed repetitions.

### 4. `muscleSetFacts({ workouts=W(), period=muscleSetPeriod(), active=Store.get('activeWorkout') }={})`

Return an iterator or compact array of eligible facts plus diagnostics:

```js
{
  facts,
  scope: period,
  sessions: [{workoutId, date, name, mappingIssueCount}],
  excluded: {
    invalidDateRecords: [], futureInRequestedPeriod: [], outsidePeriodCount: 0,
    futureHistoryCount: 0, explicitUnacceptedRows: [], invalidRows: []
  },
  active: active ? { id:active.id, name:active.name } : null
}
```

- W() is saved-history membership; do not require an `end`, infer a missing end, or inspect the separately stored active session as completed work.
- Validate finite start date, then compute `wDate(w)` using the app's current local timezone. Include only start ≤ through and start ≥ start. New records/edits/backdating are reflected on every fresh query.
- Keep all saved future records accessible in History. `futureInRequestedPeriod` explains current selected-window exclusions; `futureHistoryCount` is a separate all-history fact, never described as if every future record belongs to the selected week.
- A source reference includes original workout ID, block ID if present, set ID if present, and current block/set positions. Prefer canonical IDs for navigation; never create or persist new IDs for a report.

**Physical identity rule:** `key` is a unique source-row reference, not just `set.id`. Missing IDs and repeated IDs occur in old/imported shapes. Two distinct stored rows are two rows even if an imported ID happens to collide. Use a key based on workout identity plus block and set positions, with raw IDs retained alongside it; within one report, every role contribution references that same key. The key is a transient projection reference, not a replacement record identity. Re-resolve by real IDs plus checked position when opening detail after an edit; if the source changed, rebuild the report instead of opening an unrelated row.

### 5. `muscleSetPlanFacts({ selections, draft=null, scope='rotation' })`

Input:

```js
{
  selections: [ {routineId:'a', occurrences:1}, {routineId:'b', occurrences:1} ],
  draft: null | { token:'transient-ui-token', routine:ui.rDraft },
  scope: 'routine' | 'rotation' | 'week-scenario'
}
```

- Resolve saved routines by original ID. No folder/program frequency inference.
- Draft keeps the actual `ui.rDraft` reference untouched so Back restores edits. It is not inserted into Store and no generated draft token becomes a stored record ID.
- Each selected occurrence count must be a finite nonnegative whole number; duplicate selected IDs are consolidated into one explicit count. Blank is invalid in week-scenario mode, not silently 1. Zero is a deliberate omitted occurrence.
- Routine slot count must be an actual nonnegative integer. Zero stays zero; null/blank/negative/decimal is a review error. Do not use `parseInt` or `|| 3` to repair it.
- For one routine / one rotation, occurrences default visibly to 1 per selected routine. That is an explicitly stated rotation count, **not** a weekly frequency.
- Use weighted facts per routine slot (`weight = plannedSets * occurrences`) rather than expanding thousands of artificial set rows. Two same-name slots stay separate by slotId/position. No set IDs are invented.
- Supported rep-based types contribute planned working slots; duration/carry/cardio contribute separate planned segments. Their actual time is unknown unless a valid scalar target can be read; do not fabricate duration from a rep-range string.
- Invalid routine slots remain in diagnostics and source data. A partial known total is labeled “known planned slots,” not an exact full prescription.

### 6. `muscleSetAggregate(facts, { includeInferred=false }={})`

Return:

```js
{
  totals: {
    repWorkingRows:0, timedSegments:0, conditioningSegments:0, warmupRows:0,
    validNonWarmupRows:0, durationSec:0, distanceKm:0
  },
  coverage: {
    mappedRows:0, inferredRows:0, unmappedRows:0,
    recordedRows:0, currentMappingRows:0
  },
  muscles: [ {id:'Chest',primary:0,secondary:0,
    inferredPrimary:0,inferredSecondary:0,contributors:[]} ],
  areas: [ {id:'Chest',label:'Chest',primary:0,secondary:0,
    inferredPrimary:0,inferredSecondary:0,contributors:[]} ],
  otherWork: {timed:[],conditioning:[],warmup:[]},
  review: [],
  scope, sessions
}
```

Aggregation:

1. Physical working totals count eligible rep-based facts once, including anatomically unmapped facts. Timed/conditioning/warmup have separate totals and never inflate muscle working-set bars.
2. For each rep-based fact, apply one mapped primary target and deduplicated secondary targets. The current schema has one primary; this release must not invent multiple primary targets.
3. Compute body-area memberships **from that fact**, not from the sum of per-muscle counts. If any primary target maps into an area, area role is primary; otherwise any secondary target in that area makes its role secondary. Multiply once by fact weight. Thus Row primary Upper Back + secondary Lats produces Back primary 1 / additional secondary 0.
4. Unknown/inferred work remains in global physical totals but is not silently allocated to a confirmed-looking bar. Tentative subtotals are separate and reviewable. Coverage dimensions recorded/current and mapped/inferred/unmapped overlap; do not sum all five fields as though they were five disjoint sets.
5. Every contributor carries category, role, weight, source name/ID/date/slot, row references and mapping provenance. Group UI contributors by workout/block or routine slot, but retain the real reconciliation count.

Area map at reviewed baseline:

```js
Chest: ['Chest']
Back: ['Lats','Upper Back','Lower Back']
Shoulders: ['Shoulders']
Arms: ['Biceps','Triceps','Forearms']
Legs: ['Quads','Hamstrings','Calves']
Glutes: ['Glutes']
Core: ['Abs']
```

Release 2 may expand the enum (e.g. Adductors/Abductors). Require a test that every shipped anatomical label maps to exactly one area, or is deliberately reported unallocated. Do not silently put an unhandled new group into zero/Other. Preserve broad legacy Shoulders rather than inventing delt-head detail.

### 7. Report wrappers / text

- `muscleSetPerformedReport({period, workouts, active}={})` → facts + aggregate + scope diagnostics.
- `muscleSetPlanReport({selections,draft,scope})` → weighted plan facts + same aggregate.
- `muscleSetReportForWorkout(w)` → same saved-row engine, limited to that one supplied committed workout. This is for the finish summary; it need not filter a just-finished workout out because a general page selection happens to show another period. It must still disclose a future-dated supplied workout.
- `muscleSetSummaryText(report)` → one readable sentence plus role/coverage summary, e.g. “16 rep-based working rows across 3 saved workouts. Chest: 4 primary; Shoulders: 2 primary and 4 secondary. Two rows need muscle mapping. One timed segment is separate.”
- Optional `muscleSetCredits(report, secondaryFactor)` is an explicitly labeled advanced adapter only. Do not make it a prerequisite or default rendering path. The approved default is separate roles.

## UI state and actions

Suggested transient state:

```js
ui.muscleSets = {
  mode:'performed',
  period:{mode:'week',anchor:ymd()},
  planScope:'rotation',
  selectedRoutineIds:[],
  occurrences:{},
  draft:null,              // {token, routine:ui.rDraft}
  area:null,
  muscle:null,
  showReview:false,
  contributorLimit:30,
  returnTo:null            // {page:'progress'|'routines',draft:true,focus:selector}
}
```

Do not persist it into S or a new collection in this release. No scenario automatically becomes a saved program/calendar.

| Action | Event contract / behavior |
| --- | --- |
| `muscleSetsOpen` | Optional `data-mode`, `data-routine-id`; initialize state, close the invoking modal without deleting its draft, set `ui.fitTab='muscles'`, `go('fitness')`. |
| `muscleSetsMode` | `data-mode=plan/performed`; preserve each view's transient selection, reset area/muscle drilldown, render; no Store save. |
| `muscleSetsPeriod` | `data-direction=-1/0/1` or named week/month/range; validate dates, update scope and render. Current/week capping stays visible. |
| `muscleSetsPlanScope` | `data-scope=routine/rotation/week-scenario`; week-scenario requires deliberate per-routine counts and shows its hypothetical label. |
| `muscleSetsRoutine` | `data-id`; checkbox selection state, ordered by saved routine order. Do not duplicate a routine merely because its name appears twice. IDs, not names, select sources. |
| `muscleSetsOccurrences` | `data-id`, numeric input string. Keep raw blank/invalid UI text so a rerender does not turn it into 1 or erase an edit; query receives validation state. |
| `muscleSetsArea` | `data-area`; push area drilldown with primary/secondary figures and muscle rows. |
| `muscleSetsMuscle` | `data-muscle`; contributor list with provenance and type labels; no scientific stimulus score. |
| `muscleSetsReview` | Open mapping/invalid-row review list. Editing a legacy library mapping is separate from changing recorded snapshots. Do not promise library edits will rewrite recorded snapshots. |
| `muscleSetsContributor` | Ref key resolves current source; saved work opens existing workout detail/editor path only after correct record lookup. Plan opens the correct routine/draft. Do not route to global rename. |
| `muscleSetsMore` | Increase contributor page limit by 30; complete counts remain visible. Do not render 100,000 buttons at once. |
| `muscleSetsBack` | Pop muscle→area→overview, then restore `returnTo`; when from draft, reopen `drawRoutineModal()` on the same draft object and restore invoking focus. |
| `muscleSetsRules` | Simple counting-rules sheet with primary/secondary overlap, units, date rule, source coverage and no side/failure multiplier. |

Keep `routineCoverageDraft` and `routineCoverageSaved` as thin compatibility entry adapters. Update old direct-query tests deliberately rather than deleting their math/unknown/frequency assertions. `coverageSetting` can disappear only after no DOM/action references remain.

## Page structure and safe integration

1. Add `muscles:'Muscle sets'` / `muscles:fitMuscleSetsPage` to `renderFitness` maps. Existing `ui.editW` takes priority, so contributor editing must retain a return descriptor or reopen the workspace after closing the editor deliberately.
2. Training progress gets one “Muscle sets” named-page link. Routine cards retain Set coverage entry. Do not add a fourth bottom root or scrolling subnav.
3. `fitMuscleSetsPage` renders Plan/Performed as two local buttons with `aria-pressed`, not hidden overflow tabs. Below: scope controls, concise physical totals, mapping review count, body areas, other-work details and Counting rules.
4. Overview anatomical order is stable; each row has text Primary / Secondary. Bars are not stacked into a fictitious physical total or percentages of all sets. At 200% text, counts become labeled stacked lines.
5. Explicit zero is “0 mapped primary” when data exists; no records is “No completed history in this period.” Unknown/inferred work is visible before a zero is interpreted.
6. Plan displays selected routine names and one-rotation or hypothetical-week label. Draft panel says “Unsaved routine”; all selectors leave the draft unchanged.
7. Finish summary uses `muscleSetReportForWorkout` role breakdown and category units. Replace “Estimated muscle-set credits” chips; do not leave the old 0.5 estimate as the headline.
8. Monthly report uses completed saved records through today for stats. Calendar can still show/edit future records with a future label. Replace old muscle bars/table with role-separated output or named workspace links; no UI needs two competing count models.

All new text must be escaped, normal actions delegated, icons local, and Cobalt semantic tokens reused. Do not add per-element listeners or remote assets.

## Essential deterministic fixtures

| Fixture | Expected result |
| --- | --- |
| Bench 3 + Pushdown 2 | Physical rep rows 5; Chest P3/S0; Triceps P2/S3; Shoulders P0/S3; Arms area P2/S3. No default 3.5 label. |
| Same plus Plank 1 | Rep rows remain 5; timedSegments1; Core timed exposure separately. |
| Row 3 with primary Upper Back/secondary Lats+Biceps | Back area P3/S0; Lats muscle S3; Upper Back P3; Biceps S3. Never Back6. |
| Duplicate secondary Biceps/Biceps/Upper Back | Biceps receives 3, not 6; primary Upper Back cannot also receive secondary credit. |
| Repeated same-name blocks and repeated imported set IDs | Both physical rows count once each; their multiple muscle roles never create extra physical rows. Missing IDs remain unmodified. |
| Saved valid row without done | Included. New canonical finish rows are in this case. |
| Explicit done:false, or empty normal row | Excluded/reviewed; original records unchanged/exportable. |
| Accepted canonical base + draft amendment | Canonical base counts once; draft value is not used. |
| Failure reps0 / normal reps0 | Failure follows recorded-attempt convention and is labeled; normal invalid. Neither invents positive reps or a bonus. |
| Warm-up/drop/failure/zero load | Warm-up separate; valid drop/failure each 1; zero load with positive reps valid; no automatic unit conversion for counts. |
| Timed/carry/cardio | Separate segment/time/distance categories; rowing's Upper Back mapping does not add resistance muscle rows. |
| Legacy current mapping changed | Legacy interpretation changes with visible source label, source records untouched. |
| Recorded snapshot after library edit | Snapshot role counts remain unchanged. Recorded inference remains marked inference. |
| Monday and Sunday / DST / month boundary | Local calendar rules; current week through today; custom invalid date rejected, not normalized to another month. |
| Future-only selected period | No performed rows, explicit future explanation, saved records still editable in History. |
| Backdated/edit workout | Contribution moves exactly once to correct interval, no stored aggregate update required. |
| Plan A7 + B7 once | One rotation14. No “week” label. A×2/B×1 week-scenario21 only after explicit selection. |
| Null/blank/negative/decimal routine set count | Review error; known counts labeled partial; no implicit fallback. Zero remains zero. |
| Inferred/unmapped rep rows | Included physical total, separate review/tentative counts, not hidden in mapped bars. |
| Coarse enum completeness | Every Release 2 anatomical group has one deliberate area mapping; Other/Full Body/Cardio handled explicitly. |

Use the full 16-working-row/1-segment actual-week fixture in `NEXT_VOLUME_REDESIGN.md` as a reconciliation test, including backdated legacy Bench, future session, active drafts and two unmapped rep rows.

## Test/integration order

1. Pure read-model fixtures in a new relevant spec using fresh browser state. Assert original JSON equality before/after every report call.
2. Cross-consumer parity: same one-workout report feeds finish and Performed; same plan facts feed draft shortcut and selected saved routine. Monthly/week date eligibility matches completed-week counters.
3. Route/layout: add all overview/drilldown/review paths to existing named-page accessibility inventory, both themes and 375/390/200%. Keyboard back/focus, VoiceOver names and 44px targets.
4. Offline reload and full backup/photo restore/import twice: derived totals recompute identically; no new stored shape is required. Include source classification and legacy missing-ID cases.
5. Performance: date-filter workouts before constructing facts; represent scalar plans as weighted facts; do not deep-clone entire history on each render. Paginate contributor DOM. Probe 100k stored rows with a narrow current-week query and an all-time query, reporting observed figures rather than asserting a new unmeasured target.
6. Full Chromium/WebKit and exact-source CI, staged package, live synthetic checks, release note/tour and publication gates as in prior releases.

No shared runtime edits or new runtime files were made for this specification. Root remains implementation/release owner after Release 2.
