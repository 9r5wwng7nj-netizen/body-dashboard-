# Training review: exercise discovery, substitution and routine overview

November 7, 2026 · Planning only · Source baseline `daf7699693d36183824f2f61ff4ebab515454b3c`

## Recommendation

Build **one reusable exercise picker**, then add a **session-only Swap remaining sets** command that preserves accepted work. Add a **routine set-distribution preview** using explicit muscle-attribution rules. The picker is primarily an integration improvement; substitution and planned-routine analysis are new capabilities. Correct duplicate-block history lookup and define metadata snapshots before claiming reliable comparisons after substitution.

This review changes no application code, browser records, deployment or database. Only synthetic examples were used. The web-first PRD, current focused interface and additive-storage rules remain authoritative; archived native schemas are not an implementation dependency.

## 1. Confirmed source findings

Line references refer to the baseline above; use symbols if later edits move them.

| Concern | Verified behavior | Classification / implication |
| --- | --- | --- |
| Discover exercises while building a routine | `drawRoutineModal()` uses name inputs and `#rd-new` with `ex-list-m`; `rdAdd` appends the typed name, three sets and inferred rep/time defaults. `index.html:1439–1454,1748–1759`. | Confirmed workflow friction. A person must know a name or discover a native datalist suggestion. There is no in-context browsable selector. Native suggestion behavior was not measured on the user's iPhone in this review. |
| Add an exercise during training | `fitActive()` and `fitEditor()` show a name input with `ex-list`; `awAddExercise` appends three blank sets. `index.html:1393–1406,1689`. | Same integration gap in a different context. The existing add flow also allows unrecognized names without a metadata review. |
| Existing library | `libNames()` unites saved library names and names in workout history. `fitLibraryTab()` already offers name substring search, primary/secondary muscle filtering and equipment filtering, plus New exercise. Tapping a result opens settings, not insertion. `index.html:1464–1480`. | Retain this capability and reuse its query logic. Do not build a second disconnected catalogue or require an online service. |
| Catalogue coverage | `DEFAULT_LIB` contains **56** entries with tracking type, primary muscle, optional secondaries and equipment. `DEFAULT_LIB_LC`, `exInfo()` and `inferMeta()` provide resolution/fallback. `index.html:974–1044`. Count confirmed by evaluating only the static literal. | Useful starter catalogue, not an exhaustive or independently validated anatomical database. Unknown/custom/imported names are expected. |
| Inconsistent list sources | `exDatalist()` reads only `Store.get('exercises')`, while `libNames()` also reads history. `index.html:1138,1464`. Seeds/add/import paths may populate the name collection, but these functions do not promise identical coverage for every legacy state. | Use one canonical **read query**, with case-insensitive deduplication for display only. Do not merge underlying exercise blocks or imported identities. |
| Mid-session swap | `awExMenu` offers move, superset, exercise settings and remove; no replacement action exists. `index.html:1724–1738`. | Requested new feature. Deleting and re-adding changes position and loses local context; do not treat that as the new substitution implementation. |
| Global rename is dangerous as a swap shortcut | `libModal` states renaming affects every workout/routine; `libSave` calls `renameExerciseEverywhere`, which rewrites history, routines and active work. `index.html:1482–1496,1648–1656,1786–1794`. | **Never implement substitution by editing/renaming the global exercise definition.** Label global catalogue editing separately from session replacement. |
| Repeated exercises | `exerciseHistory()` uses `w.exercises.find(...)`, returning only the first same-name block per workout. `index.html:1109–1113`. | Confirmed query defect for repeated blocks, important once a swap produces separate blocks. Source-extracted synthetic probe: two Row blocks with 8 and 12 reps returned one history entry, containing 8 reps. This was not a real-record/browser probe. |
| Current muscle volume | `workSets` excludes only `warmup`; `muscleSets` credits every remaining row as primary = 1 and each secondary = 0.5. It has no `done`/validity filter of its own. `index.html:1094,1173–1177`. Monthly/weekly history and finish summary reuse it (`1527–1575`). | Existing analytics can inform the new feature, but calling this function on active ghosts or a routine's numeric `sets` field is incorrect. Existing history has different completion semantics and must remain preserved. |
| Planned overview | Routines contain numeric set counts, target reps/time, rest and adjacency-based superset flags. Their editor has no muscle-distribution overview. `drawRoutineModal`, `workoutFromRoutine` (`1253–1255`) and `rd*` actions. | New query/presentation, not a new training database. Folder/program start and duration do **not** define a weekly frequency/calendar. |
| Metadata drift | Historical reporting resolves type/muscles through today's global `exInfo(name)`. History blocks generally store name/sets, not an immutable classification snapshot. | Updating a library type or muscle mapping can change old interpretation without changing raw records. New analytics must disclose this; never invent historical metadata. |

Existing relevant coverage: `tests/refresh.spec.js:53–80` checks move/superset/remove/notes; `tests/web-persistence.spec.js`, `tests/web-hosted.spec.js` and `tests/simple-navigation.spec.js` check accepted/draft/recovery semantics. These are regression foundations, not evidence that picker, swap or routine analysis already work. This planning review did not rerun the full application suite.

## 2. Shared exercise picker

### Entry points and screen contract

- Replace in-context typing-only add controls with **Add exercises** in routine editing, active training and past-workout editing. Keep direct custom naming available inside the picker.
- Use a full-height sheet on iPhone with a persistent heading, Close, Search and a bottom **Add selected (n)** action. Preserve the unsaved routine/workout draft when entering or closing the picker. Returning to the parent restores scroll and focus.
- Start with **Recent** and **Browse all**; favourites can be a later optional shortcut. Use a single Filters control for muscle/equipment, showing the active filter count and Clear. Do not fill the screen with many muscle chips.
- Result row: exercise name, equipment, primary muscle and tracking type. Tap selects; a distinct 44px Details action opens metadata/how-to information. Selection does not open global editing. Show selected count, and retain selection as search/filter changes.
- Add mode may select several exercises in display selection order. Swap mode is single-select with the existing exercise excluded or marked Current. Duplicate additions are allowed only explicitly, as separate blocks; no name-based record merging.
- Search should normalize case, whitespace and punctuation for matching. Start with whole-name/token matching and a small curated alias list where needed; no AI, remote search or automatic renaming. Show the actual saved name and distinguish custom variants/equipment.
- When there are no matches, show Clear filters and **Create exercise “…”**. Ask for tracking type; expose primary muscle/equipment with Unknown/Other available. Treat inferred fields as suggestions requiring confirmation, not facts. New custom exercise creation and return-to-selection should not erase the current query/draft.
- Reuse local catalogue/history names and metadata. No new image provider or required exercise photographs; text rows remain useful offline. User-supplied how-to links may be unavailable offline and cannot block insertion.

**Proposed, unmeasured targets:** add one visible exercise in three actions after reaching the parent (open picker, select, Add); multi-add uses one shared commit. No timing or tap count was measured on an iPhone. Instrument selection-to-acknowledgment separately from perceived input feedback.

### Accessibility and density

44px row/action targets; visible labels; search result count announced after a brief pause, not on every keystroke; keyboard search/select/Add/Close; logical VoiceOver selection state; close/back returns to the invoking control. At 200% text, metadata wraps below the name and filters occupy a separate row. Keep result rendering bounded for large imported libraries without skipping accessible results or dropping selections.

## 3. Safe exercise substitution

### Interaction

1. Exercise ⋯ → **Swap exercise** opens the same picker, with a quiet optional filter for the current primary muscle. This is a search convenience, never a claim that alternatives are mechanically or physiologically equivalent.
2. Selection previews **Current exercise → Replacement**, what remains, and the new tracking fields. Primary action: **Use for this workout**. Default scope is this session only; no routine/history/global rename occurs.
3. State the consequence where needed: completed sets stay under the original exercise; old loads and subjective observations will not be reused as new performance. A shorter confirmation is sufficient when nothing has been entered.
4. After durable acknowledgment, show the replacement and **Undo swap**. If persistence fails, keep the picker/choice and original committed workout, with Retry and existing recovery/export paths. Never claim a successful swap because the in-memory label changed.

### Case rules

| State | Proposed behavior |
| --- | --- |
| No accepted sets and no draft values | Change this planned block in place, preserving its instance ID, position, set-slot IDs/count, rest and superset position. Capture the old plan in the operation's before-image. New suggestions come only from the selected target's own comparable history. |
| Unaccepted drafts exist | Preserve their exact text, units and original context in the recoverable before-image. Default to clear **load/time/distance** for the replacement. Reps and planned set count can be retained as explicitly labelled planning targets when compatible. Offer a deliberate Keep entered compatible values choice if desired; values stay unchecked drafts. A selector must not silently throw away an incomplete decimal entry. |
| Some sets accepted | Keep the original block/name/accepted set IDs, values, PRs, notes and observations. Create a separate replacement block for remaining unchecked work. Do not rename accepted rows to the new movement. Unaccepted slot IDs can move to the replacement exactly once; new slots get new IDs. Before-image retains the original graph. No automatic merge with another block of the same exercise. |
| All sets accepted | Offer **Add replacement exercise** with fresh unchecked rows. Do not move or relabel completed work. |
| Accepted set has an uncommitted amendment | Keep its accepted base and pending amendment attached to the original block. Resolve pending write/uncertain outcome before committing substitution. Never transfer its RPE/joint observations to the target. |
| Different tracking type or load basis | Keep completed original work intact; create target rows with target columns. No rep↔duration, added↔assisted, kg↔machine-stack, bodyweight↔external-load conversion by guess. Preserve raw old fields in recovery metadata; require target values to be entered/accepted. |
| Routine editor | Replace only that draft routine slot. Preserve slot order, target set count/rest where meaningful; invalidate incompatible target reps/time and prompt for it. Nothing happens to old workouts or an active session. Saving the routine uses its original routine ID. |
| Update future routine | Separate later action: review the actual template slot and confirm. Do not silently change the routine that launched the session, particularly when it was edited since launch or has repeated same-name exercises. |

### Supersets, timers and undo

Supersets currently depend on adjacency plus `ss`; inserting a block can silently change their meaning. Before-work substitution can preserve the same slot and flags. **After accepted work in a superset, the first safe release should leave the original group unchanged and add the replacement after that group**, explaining its placement before commit. Joining it back into the group is a separate explicit edit. An alternative design with stable group/slot identities is possible, but requires an additive group contract and export/query audit; do not improvise boolean changes around accepted records.

Swapping does not restart or clear the existing rest deadline. A timer owned by an accepted original set remains owned by that set. New completions follow the replacement's configured rest. Do not copy prior RPE/joint/fatigue into target facts.

Undo must restore the exact pre-swap graph, including IDs, drafts, order, rest and grouping, through a compensating durable command. If replacement sets were accepted or another edit occurred after swap, do not overwrite them with a stale before-image: offer a reviewed reverse substitution that preserves those observations. A failure/retry/reload must not allocate a second replacement block. Retain operation identity, expected revision, before-image and receipt in the existing recovery architecture with an explicitly tested backup extension; no second writer or new database is needed.

## 4. Metadata and comparison safety

Before exposing progression after substitution:

- Introduce a shared resolver that prefers an **optional instance classification snapshot** for new accepted work, with existing `exInfo(name)` as the legacy fallback. Proposed snapshot content: tracking type, equipment/load basis, primary/secondary mapping, mapping source/version; exact optional shape needs the technical lead's contract review. Retain names and existing IDs. Do not backfill invented snapshots into old workouts.
- Distinguish Built-in mapping, User confirmed, Inferred and Unknown. A present `primary:'Other'` is not evidence of zero anatomical stimulus. Review mappings for custom/imported names in an exception list.
- Global library changes should affect future planned instances. Editing the historical interpretation must be an explicit, separately described reclassification, preserving raw observations and showing which analytics changed.
- Audit and replace the `.find` history contract before completed-set-preserving swaps. Retain every matching instance and its workout/block identity. This is not solved by replacing `.find` with `.filter` in one location: trace Previous, best-set, E1RM, PR, repeat, summary and import consumers. Session aggregates may combine comparable instances for a total or best, while Previous suggestions require a deterministic context policy. Prefer matching routine-slot/instance lineage when known; otherwise show an explicit dated source-block selection or a documented conservative fallback. Exact fallback ordering remains an architecture decision. Preserve stored order where useful, but never fabricate within-session timestamps or infer that order proves a performance time. Do not double-count or merge an instance.
- Machine, barbell, dumbbell, assistance and bodyweight variants remain separate comparisons. Same muscle group is not comparability. Never inherit old exercise PR status or E1RM baseline after substitution.
- Existing historic records with no known load basis remain readable. Unsupported/uncertain analytics show an explanation rather than a fabricated zero or increase.

These are additive semantic corrections, not a request for the archived native schema or a whole-database rewrite.

## 5. Routine overview: explain the plan without pretending to diagnose it

### Presentation

Within routine editing, offer **Exercises / Overview** with an Overview button available before saving. Show:

- Planned working sets for this routine, warm-ups if represented, exercises and unmapped items.
- A sorted **Primary sets** list, with a separate **Secondary exposure** value for each muscle group. Expand a row to see contributing exercises and set counts; edit a contributor without losing the routine draft.
- Optional **Include secondary credit: 0 / 0.5 / 1** model under Method, defaulting to the existing 0.5 convention only when viewing the credited total. Label it **estimated credited sets**, retain primary and secondary columns, and use the same chosen model in any comparison. Do not quietly change existing history totals.
- A clear statement that muscle totals can exceed the routine's physical set count because one set can involve several muscles. Do not use a pie chart implying mutually exclusive shares or a scientifically established balance score.
- Unknown/inferred mapping count near the total, with Review mappings. No body silhouette that implies more precision than the current broad groups support. The current catalogue has broad Shoulders and Upper Back categories, not validated head-by-head muscle data.

Default is a **per-routine** overview. A folder containing Push/Pull/Legs does not establish three sessions per week. A later **Week scenario** lets the user explicitly select each routine's frequency (including repeats) or schedule dates; label projected totals and frequency assumptions. Show actual completed Monday-through-today history separately. Keep a user-selected focus group as a filter/highlight, not a warning that other groups are unhealthy or the routine is deficient.

### Counting contract

| Input | Rule / disclosure |
| --- | --- |
| Planned routine | Count positive integer planned set counts. Invalid/missing counts are unresolved, not zero and not silently the logger's three-set fallback. Current routine shape has no per-set warm-up/drop tags: label its numeric count as planned working sets until optional set prescriptions exist. |
| Performed completed history | Count saved working sets under current legacy semantics; never require a newly invented `done` field on old imports. New sessions reach history through explicit acceptance. Show date range and future cutoff. |
| Active workout | Count only durably accepted, valid current observations, not suggestions or raw drafts. Keep active progress separate from completed-week totals. Do not pass the active object directly to `muscleSets`. |
| Warm-up | Excluded from working-set totals; optionally show separately. A warm-up changed to a working set counts only after the change is acknowledged. |
| Drop / failure | Count the existing stored set rows once each, excluding warm-ups. This is a **logged-row convention**, not proof that every drop segment is physiologically equivalent to a full rested set. Never multiply credit because a row is tagged failure. |
| Unilateral | Current records have no trustworthy per-side convention. Do not automatically double sets/reps. Display the recorded set count with “side convention not recorded” where relevant; optional future Left/Right/Each-side representation needs an explicit grouping rule. |
| Compound lifts | Primary count plus separately listed secondary exposures. Fractional credit is a selectable estimate, not exact stimulation. |
| Cardio / duration / carries | Preserve all seven tracking types. Keep Cardio/conditioning, time and distance in a separate summary by default; a timed plank is not assumed equivalent to a resistance working set without a disclosed inclusion rule. Avoid silently adding Rowing Machine to Upper Back hypertrophy volume via its secondary metadata. |
| Unknown/inferred muscles | Surface as Unmapped / inferred contribution. A true zero in a known mapped group differs from incomplete coverage. Do not assign a reassuring zero when metadata is missing. |
| Supersets | Grouping affects order/rest, not a multiplier on set count. Each physical logged row counts once. |
| Weekly forecast | Sum each routine's planned contribution × explicit frequency. Never infer frequency from folder order, program length or the number of saved routines. |

### Evidence boundary

A contemporary meta-regression explicitly compared indirect-set credit of 0, 0.5 and 1, with strongest relative evidence for fractional counting in its models. This supports exposing the convention; it does not establish an exact coefficient for every exercise/person. The publisher page provides abstract-level access, not the full subscription article. [Pelland et al., published December 4, 2025; 2026 issue](https://link.springer.com/article/10.1007/s40279-025-02344-w), accessed November 7, 2026.

A randomized study in resistance-trained men found different patterns for measured muscle size and strength under its particular protocol. It illustrates why a universal green/red “optimal sets” threshold is not justified by a counter alone. This is product interpretation, not a personalized training prescription. [Schoenfeld et al., 2019, primary trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/), accessed November 7, 2026.

The existing weekly heatmap uses green at 5+ and darker green at 10+ (`index.html:1548,1565`). Present these as display bins only, or replace the green achievement treatment with a neutral scale. **No universal target, balanced-routine grade, injury/readiness diagnosis or automatic volume escalation is proposed.** Optional user-set ranges belong to deliberate planning; a qualified professional's review is appropriate when the user needs exercise prescription around medical limitations or pain.

## 6. Bounded delivery sequence

| Phase | Owner | Deliverable | Exit gate |
| --- | --- | --- | --- |
| T1 · discovery | UX + frontend | Shared local picker in routine and active/past-workout add; consistent search/filter/create; saved parent draft preserved. | Keyboard/VoiceOver, 390/375px, both themes, 200% text, offline no-match/custom/multi-add scenarios; no catalogue/history rename. |
| T2 · substitution foundations | Domain + frontend | Snapshot/resolver contract, duplicate-block query correction, durable session-only swap/undo and conservative superset placement. | Exact IDs/values preserved across partial completion, abort/retry/reload, stale tab and type-change fixtures. No accepted history relabelled. |
| T3 · routine overview | Analytics + UX | Pure planned-distribution query, contributors/mapping quality, explicit primary/secondary counting and optional credited model. | Hand-calculated vectors; no ghosts; current-vs-legacy metadata provenance visible; no schedule inferred. |
| T4 · optional planning depth | Product + analytics | Explicit weekly frequency scenario, optional focus/range comparison, later template-update proposal. | Product-owner validation of usefulness and count conventions; defer if this adds setup friction. |

The repeated-block/Previous/PR audit is a prerequisite to safe swaps after any accepted work, and should be investigated first. Picker and query foundations can be reviewed together, but do not turn this into a catalogue-photo project, whole-program generator or coaching portal. Ship only after implementation is separately authorized.

## 7. Acceptance scenarios for implementation

1. **Discover an unfamiliar exercise:** open Add exercises with no typed name; browse by equipment and muscle, select two, clear filters and add. Parent routine's name, notes, prior rows/order and unsaved edits survive cancellation/re-entry.
2. **Offline custom movement:** no matching result; create an explicitly typed duration movement with Unknown muscle, add it locally, reload offline and find it again. No external image/search request is needed.
3. **Swap before work:** four planned bench slots → machine press. Position/rest/set-slot IDs remain stable; target load is blank/suggested from its own history; all rows remain unchecked. Original routine and old workout records are byte-for-byte unchanged.
4. **Swap after one accepted set:** original accepted bench set retains its original block/set IDs and values; three unaccepted slots become replacement work. Finish stores both actual exercises; checked count does not change just because substitution occurred.
5. **Draft and type mismatch:** incomplete load text plus reps → timed hold. Cancel preserves the exact original draft. Confirm preserves it in recoverable operation data, requests valid target duration, and never treats load/reps as time.
6. **Superset:** replace the remaining part of an exercise whose partner already has accepted sets. Original group/order/flags remain unchanged; preview names the replacement's conservative after-group placement. No accidental third-member chain is introduced.
7. **Repeated same-name blocks:** both instances appear in query results; session aggregate includes both exactly once, Previous identifies its source block/date and IDs never merge.
8. **Failure, restart and undo:** abort the substitution transaction; original accepted view remains authoritative and Retry retains selection. Retry/reload creates one replacement. Undo before later edits restores the exact original graph; reverse after later accepted work never deletes that work.
9. **Routine overview vector:** three bench sets (Chest primary, Triceps/Shoulders secondary) plus two triceps isolation sets → Chest primary 3, Triceps primary 2 + secondary exposure 3, Shoulders primary 0 + exposure 3. At 0.5 credit: 3 / 3.5 / 1.5. Physical planned sets remain 5; no percentages summing to 100 are implied.
10. **Coverage and schedule:** add an unmapped custom movement, warm-up-labelled prescription if later supported, timed plank and cardio block. Coverage caveats and separate summaries stay visible. Per-routine totals do not become weekly totals until frequency is supplied.
11. **Metadata change:** update the catalogue muscle/type after a new snapshotted session. New accepted history's interpretation remains stable; legacy rows clearly disclose current-mapping fallback. No raw history is rewritten or discarded.
12. **Regression:** workout JSON repeat/conflict import, full backup with photos, offline reload, namespace isolation, active/minimized resume, decimal units, all tracking types, timer ownership and explicit set acceptance continue to pass on Chromium/WebKit. Physical iPhone/VoiceOver results remain separately recorded.

## 8. Product-owner decisions recorded — November 7, 2026

The owner accepted the recommendations: session-only substitution that keeps completed work, primary/secondary routine coverage with optional labeled credit, and an initial per-routine overview. Explicit weekly scenarios and future-template updates remain optional later scope. The Grocery/Freezer amendment is specified in FEATURE_REVIEW_PLAN.md and does not change these training contracts.

No application implementation, publication or personal-record migration is authorized by this planning document. Its interaction targets and science-to-product choices remain proposals to validate, not measured user outcomes.
