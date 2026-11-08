# Body Dashboard — feature review and proposed next release

November 7, 2026 · Product/technical lead synthesis · **Approved product direction · implementation pending**

Audited application baseline: `daf7699693d36183824f2f61ff4ebab515454b3c` (`beta/personal-web`). This packet records the owner's new concerns and proposed solutions. The owner accepted the recommendations on November 7, 2026, with one amendment: remove Grocery and Freezer alongside Pantry. Warm Mineral and the three-root navigation are accepted directions. Detailed UX/domain contracts and implementation remain pending; this document update does not change or publish the app.

## Recommendation

Improve the exercise chooser and safe session substitutions first. Add a routine **Set coverage** overview using explicit counting assumptions. Consolidate meals into Nutrition, retire Pantry, Grocery and Freezer from the active interface and behavior, and reduce navigation to a small set of task destinations. Use the accepted Warm Mineral direction when specifying the updated screens.

The published focused workout interaction remains a foundation: no left drawer, explicit acceptance/save states, Minimize/Resume, 44px controls and accessible alternatives to dense rows. The new packet intentionally proposes departures from the older PRD's four-destination navigation and pantry surface; those changes were outside Sprint 1 and now respond to the owner's latest request.

## What is verified versus proposed

| Concern | Verified in current source | Proposed response |
| --- | --- | --- |
| Finding exercises while building a routine | `drawRoutineModal`, `rdAdd` and `exDatalist` use typed names/native suggestions. A separate `fitLibraryTab` already supports search, muscle and equipment filters. | Reuse one local exercise chooser in routine building, workout add and replacement. Browse without typing; keep explicit custom creation. |
| Adding a lift during training | `fitActive` / `awAddExercise` use another name/datalist form; the library is not a picker in that flow. | A visible Add exercise action opens the same chooser without losing the session or routine draft. |
| Machine occupied / substitution | `awExMenu` has move, superset, global exercise settings and removal; it has no session replacement action. | Session-only Replace exercise, separate from changing a routine template or globally renaming an exercise. |
| Safety of the apparent name-edit path | `libSave` can call `renameExerciseEverywhere`, rewriting names across history/routines/active work. | Never route a session swap through this global operation. Keep library administration distinct and clearly scoped. |
| Muscle-group overview | `exInfo`, `MUSCLES` and `muscleSets` exist. The current report gives full primary and half secondary credit. `workSets` excludes warm-ups but is not a filter for accepted active work. | Reuse metadata, not the counting function indiscriminately. Separate planned routine sets, performed accepted sets, and direct/secondary contributions. |
| Repeated exercise blocks | `exerciseHistory` uses `.find` per workout, returning only one matching block. Training reviewer reproduced this with synthetic repeated blocks. | Resolve query/comparison semantics before shipping swaps that preserve old work in separate blocks. |
| Meals separate from diet | `renderNutrition` and `renderRecipes` have separate roots/tab rows; saved foods, saved meals, recipes, planning and groceries are related but distinct models. | Nutrition becomes the parent workspace. Retain consumption snapshots and existing photo/recipe access. |
| Tag clutter | `recList` combines default/user tags and special flags in one scrolling chip row; some tags also affect meal-occasion/freezer eligibility. | Search, favorites/recent use and a small Filter sheet; retain legacy tags and meal-occasion compatibility while removing the visual tag wall and retired freezer filtering. |
| Pantry removal | `pantryHas`, `canMake`, recipe badges, plan-to-grocery generation and `grocPutAway` reference inventory. | Remove Pantry, Grocery and Freezer screens, entry points and associated inventory/shopping behavior, retaining original records in backups. Hiding tabs alone is insufficient. |
| Crowded secondary navigation | `renderFitness` has five section tabs; `renderNutrition` has four, and Recipes has another four. `barViews` currently requires four roots. | Fewer task-level destinations with named detail screens; preserve old-route aliases and preference compatibility. |
| Appearance | Current semantic intent is implemented through many Tailwind literals and legacy card/tab patterns; focused training is flatter than other screens. | A consistent light/dark token system, calmer surfaces, clearer hierarchy and a more welcoming palette, with practical logging contrast. |

These are source findings, not measured iPhone tap counts or a new usability study. All interaction counts below are proposed targets until observed on a device.

## Non-negotiable boundaries

- Existing web app, GitHub Pages, offline local logging and workout-history import continue. No native rewrite, account requirement, backend, AI logging or image service.
- Keep IndexedDB `body-dashboard` v1 and `kv`/`photos`/`local`, every existing collection, IDs, canonical units, photo bytes/links and full-backup compatibility. Never write Life Dashboard namespaces.
- Pantry retirement removes active product behavior; it does **not** delete `pantry`, `freezer`, `gkit`, grocery or recipe records. The owner explicitly requested removal of all three from the active product. Meal planning, recipes and nutrition logging remain.
- Foods, saved meals and recipes remain distinct reusable definitions. A consumed entry remains its historical snapshot. Recipe/food edits cannot change old nutrition.
- Existing completion/draft/intent/receipt semantics stay authoritative. No optimistic checkmark, new completed count, automatic carried-over RPE, joint observations or success toast before durable acceptance.
- Routine analysis is a planning aid. It is not a readiness, injury-risk, recovery or hypertrophy diagnosis and does not prescribe a universal ideal set count.

## Proposed interaction contracts

### One exercise chooser

Interpret the owner’s “library of workouts” here as exercise discovery inside routine/session editing, based on the described name-entry flow. Use the existing local catalog and imported/custom exercise names. Open with useful results before the keyboard appears. Provide text search, muscle/equipment filters, recent use and an explicit custom-exercise action. A result shows its canonical name, equipment, tracking type and primary muscle; optional secondary detail belongs in expansion rather than a dense chip row.

Build the derived catalog/history summary once per relevant Store revision and filter that snapshot locally, rather than rescanning large history on every keystroke. Invalidate it on relevant imports, custom exercise changes and metadata edits; measure on realistic synthetic histories.

The chooser carries a context: `routine-add`, `session-add` or `session-replace`, plus a stable target/revision. Reuse its presentation, not unsafe global edit commands. Cancel retains routine drafts, exercise order, current numeric input and focus. Routine multi-select can add several exercises in the chosen order; a session replacement selects exactly one.

The training audit found 56 seeded exercises, so browseability alone does not guarantee adequate catalog depth for an experienced lifter. Inventory common machine/cable/free-weight/bodyweight variants and name aliases against the owner’s real retrieval tasks (using synthetic task examples). Propose a bounded, curated offline expansion where gaps remain; document provenance/licensing for any contributed descriptions or images, and do not require an online image/catalog service. Existing custom/imported names must stay available.

A new custom exercise must be deliberately created, with editable/unknown metadata. Do not silently make a new library item from a misspelled search. Aliases or favorites, if adopted, are optional additions; the legacy `exercises` collection remains an array of names, not a silently converted object table.

### Session replacement

1. Exercise ⋯ → Replace exercise → chooser → clearly scoped application. A maximum of four control activations after an already visible exercise is a proposed unchanged-filter target, not an observed tap count.
2. Default scope is **this workout only**. Changing the saved routine is a separate reviewed action after the workout; the global library is never renamed.
3. With no accepted work, preserve the logical slot/order/rest intent and replace only the unperformed plan. Keep old draft text recoverable for review/undo. Never treat another machine's load, RPE or pain notes as a new observation.
4. With accepted work, keep original exercise attribution, set IDs, loads, units, receipt ownership where present, and completed counts. Create a replacement instance for remaining work. Do not relabel the completed rows under a new exercise name or re-accept them. If all original sets are already completed, offer fresh unchecked replacement work; none of the original sets move.
5. Suggested values come from the replacement exercise's comparable history or clearly labeled routine targets. Matching input columns do not establish comparable loads between machines or movement variants. Incompatible tracking types require clean/mapped unperformed fields; never reinterpret kg as assistance, distance or duration.
6. For the first partial-completion superset swap, keep the original group unchanged and preview the replacement after that group. Rejoining it to the cycle is a separate deliberate edit; seamless in-group replacement needs a stable group/slot contract. Superset structure needs a specific model before implementation: current `ss` booleans depend on adjacency. Retaining an earlier block cannot silently turn a two-exercise cycle into three exercises. Show the proposed order/grouping and prove it with synthetic cases.
7. Save via one coordinated domain command with stable operation identity, expected revision and recoverable intent. If persistence fails, keep the proposal recoverable and leave canonical accepted work unchanged. Retry/restart cannot add another replacement block. Undo cannot erase newly accepted replacement sets; after new work, a further change preserves both actual exercise blocks.

### Routine set coverage

- Provide a readable per-routine overview and a comparison/aggregation of selected routines. Report **planned working sets**; keep performed history in a separate view/query. Preserve completed legacy/imported history with no `done` or receipt fields; new-session acceptance rules must not retroactively exclude it.
- Lead with **Primary sets** using the existing declared muscle mapping; this is not a measurement of direct anatomical stimulus. Show secondary involvement separately, with an optional labeled estimated combined view. The current 0.5 coefficient is a product counting convention, not a biological constant.
- Do not infer a weekly dose from a routine folder or program length. Require selected training days or explicit repeats per week; otherwise label the scope "per routine" or "selected routines, frequency not specified."
- Current routines store a scalar planned set count, not per-set warm-up/drop prescriptions. Label that count planned working sets; richer prescriptions are optional later work. In performed-history calculations exclude warm-ups, count each existing drop/failure row once, and apply no failure multiplier. Separate unilateral conventions. Do not silently multiply left/right sets, count conditioning intervals as strength sets or turn absent muscle metadata into zero.
- Show unmapped exercises and provenance (catalog/custom/inferred) with a correction path. Editing metadata for planning cannot silently rewrite old performance attribution.
- A focused routine may intentionally omit muscle groups. Offer neutral coverage summaries and an optional user-selected focus/targets; avoid red "unbalanced" warnings by default.
- Always include exact numbers/text beside a chart and the scope/method. Synthetic example: three bench working sets are three primary chest sets, with triceps/shoulder secondary involvement shown separately; a scheduled twice-weekly repeat is a labeled six primary-set scenario, not an inference about actual training.

## Technical gates before development

| Gate | Required decision/proof | Owner |
| --- | --- | --- |
| Exercise identity and query context | Stable workout/instance/set IDs, legacy no-ID fallback, every matching historical block retained, explicit selection policy for Previous/PR/E1RM. No fabricated within-session timestamps. | Systems architect + training reviewer |
| Replacement transaction | Canonical before/after graph, completed/draft split, incompatible types, superset adjacency, owned timer, idempotent retry/reload, stale-tab conflict. Optional snapshots for newly accepted work; no invented historical backfill. | Systems architect |
| Analytics eligibility | Independent planned/performed selectors and labeled attribution/frequency policies; no direct use of `workSets` over active suggestions. | Training/domain owner |
| Navigation compatibility | Project old four-item `S.bar` into proposed roots without erasing it. Keep legacy `recipes`, tab and action targets resolvable. Preserve hidden-card/tab preferences; any new order preference is optional. | UX + systems |
| Inventory/shopping retirement and tag compatibility | Remove pantry coverage, grocery generation/export/staples/budget controls and freezer allocation/stock mutations. Preserve all raw records/tags; meal-occasion eligibility retains its fallback. Legacy freezer-friendly values remain stored without active freezer behavior. | Nutrition/domain owner |
| Release safety | Old/new full backups, training import twice, photos, failed writes, waiting worker, both themes, 390px/375px, enlarged text, keyboard and real iPhone/VoiceOver. | QA + product owner |

## Proposed delivery sequence

No delivery dates or effort estimates are asserted before the domain spike and design review.

| Milestone | Deliverable | Exit criteria |
| --- | --- | --- |
| 0 — Agree the interaction/visual direction | Finalize detailed flows within the accepted Warm Mineral/three-root direction; prove safe-swap and volume semantics with synthetic examples. | Owner can review actual screens and counting examples; no unresolved risk of relabeling accepted work. |
| 1A — Find and add exercises | Shared chooser in routine builder and active workout, including custom creation and empty/no-result states. | Browse without typing; current drafts survive chooser cancel; correct exercise and metadata persist offline. |
| 1B — Replace safely | Session-only replacement, with no automatic template update. Updating future templates remains optional later scope. | Completed work is unchanged, replacement suggestions belong to the replacement, supersets/types/timers are preserved, retry and reload are idempotent. |
| 2 — Assess routines | Per-routine primary/secondary set coverage; selected-routine/frequency scenarios. | Hand-calculated synthetic vectors match UI; missing metadata is visible; no invented weekly schedule or universal target. |
| 3 — Simplify Nutrition and navigation | Merge Meals into Nutrition, retire Pantry/Grocery/Freezer UI and behavior, replace tag wall and scrolling navigation. | Old routes/data remain usable; no hidden inventory effects; normal logging and recipe photos still work offline. |
| 4 — Apply and validate the visual system | Roll chosen tokens/spacing through the agreed screens with restrained chart/status colors. | Consistent light/dark behavior and contrast; phone, large-text and keyboard/device acceptance pass. |

Visual tokens can start in milestone 1 screens after milestone 0; milestone 4 is the consistency/release sweep, not a request to reskin the same screens twice. Ship in small reviewable releases only after implementation is authorized and checks pass.

## Acceptance pack for the implementation agent

- Empty, imported and custom libraries; no-result search; muscle/equipment filters; multi-add order; close/reopen picker without draft loss.
- Swap before any completion; swap after two completed sets; repeated same-name blocks; replacement already elsewhere in the workout; superset first/middle/last position; unknown metadata; strength/bodyweight/assisted/time/distance changes.
- Fail replacement writes at intent and canonical commit stages; reload after an acknowledged intent; retry after an unknown outcome; stale second tab; undo before/after replacement acceptance. Preserve IDs, precision, raw draft units and original attribution throughout.
- Routine coverage with zero/missing scalar counts, unknown muscles, cardio/time-only work, focused splits and a frequency-unspecified rotation. Test warm-up-only, drop/failure and bilateral/unilateral conventions in performed-history vectors; per-set routine prescriptions are not assumed to exist. Compare every displayed vector with a hand-counted synthetic fixture.
- Restore populated Pantry/Grocery/Freezer and gkit data. No shopping generation, inventory subtraction, stock decrement, staple scheduling or grocery export/Reminders action is reachable from active flows. Opening or marking an old freezer-linked planned meal made must not mutate inventory. All original references, quantities, IDs and metadata survive export/restore; ordinary leftovers and consumed nutrition remain distinct.
- Old four-root preferences, a saved Recipes landing route, hidden default tabs and hidden/reordered dashboard cards; direct recipe/meal-plan/food links; import from old Body/Life backups; no automatic navigation rewrite that discards settings.
- Log a saved meal at another portion, edit its definition, then confirm old intake is unchanged. Also change a saved food definition, then edit the quantity of an older food-linked entry: its snapshot basis must stay explicit and must not silently switch to current food data. Restore a full backup with local recipe/progress photos and decode offline. Import workout history twice without duplicate records.
- Every new screen at 390px and 375px, both themes and 200% text; keyboard focus return, screen-reader names, touch targets, no horizontal navigation trap, safe areas and active numeric entry unaffected by timers.

Timing/tap targets require an observed task study with synthetic examples. Automated engine checks cannot establish real iPhone keyboard, Home Screen termination or VoiceOver comfort.

## Specialist reports

- [Training review](TRAINING_REVIEW.md)
- [Nutrition and navigation review](NUTRITION_NAVIGATION_REVIEW.md)
- [Visual design review](VISUAL_DESIGN_REVIEW.md)
- [Interactive design directions](DESIGN_DIRECTIONS.html)

## Navigation recommendation

Use three bottom destinations: **Today / Train / Nutrition**. Remove the horizontal secondary tab strip, rather than nesting the old Meals strip inside Nutrition.

| Root | Landing content | Visible named detail screens |
| --- | --- | --- |
| Today | Existing daily summary and chosen dashboard cards; direct food/workout/weight actions. | Existing cards open the appropriate detail directly. |
| Train | Start/Resume, saved routines and New routine. | Workout history, Training progress, Exercise library; each routine opens Exercises and its Set coverage overview. |
| Nutrition | Daily log and Log food; Library remains a visible header action. | Library, Meal plan, Weight & measurements, Targets & check-ins. Grocery, Pantry and Freezer are absent. Meal planning and recipe preparation remain independent of inventory. |

Use clear back navigation for detail pages. Keep History visible near the Train heading and Library visible near the Nutrition heading. Proposed, unmeasured targets: one action from Train to History, one from Nutrition to Library, and no more than two from Nutrition to weight/targets. Named push screens reduce clutter but can add travel; compare those tasks against a compact alternative before locking the interaction spec. Do not put every useful feature in a generic More menu or replace the tab strip with another long horizontal chip rail. A routine Overview switch is local to editing, not a second global navigation system.

The two existing meanings of Plan become **Meal plan** and **Targets & check-ins**. Old `recTab=plan` targets Meal plan; old `nutTab=plan/history` targets Targets & check-ins/Logging history. Old body/trend routes target Weight & measurements. Recipes links resolve to the typed Nutrition Library. Preserve old four-root `S.bar` and hidden/card preferences; project and stable-deduplicate old recipes/nutrition positions into one Nutrition destination. New optional three-root ordering can override presentation without deleting the legacy setting.

A unified Library clearly marks Food, Saved meal and Recipe, using search, Favorites, recent/usual use where real data exists, and a Filter sheet. Existing recipe `fav` can be reused; food/saved-meal favorites need an optional compatible field or auxiliary flag, not an assumed existing index. Preserve tags as optional/searchable detail metadata, including meal-occasion compatibility. Retain original freezer-friendly metadata in storage/backups, but remove its active filter and inventory affordances. Do not invent old saved-meal use dates or silently label missing macros as zero.

## Additional issues found — scoped investigation, not automatic expansion

- **Repeated-block performance lookup** is reproduced with a source-extracted synthetic probe. It is a swap prerequisite, not permission to rewrite all historic workouts.
- **Historical metadata drift** follows current `exInfo(name)` resolution. Define optional snapshots for new accepted work and an honest legacy fallback; no fabricated backfill or record-ID migration.
- **Old nutrition editing and unknown nutrients:** the nutrition reviewer identified paths that select a mutable food definition while editing an older entry and paths that coerce missing nutrients to zero. Confirm these with focused synthetic reproductions. Fix only the relevant snapshot/unknown-value path if needed for the chosen Library interaction; do not replace the nutrition algorithm under a navigation change.

## Sequential agent handoffs

These prompts are for later authorized work. This review does not launch implementation agents.

**UX architect — finalize, then review**

> Read AGENTS.md, docs/FOCUSED_INTERFACE.md and every document in docs/product-review/2026-11-07/. Use the accepted Warm Mineral direction to produce implementation-ready 390px flows for shared exercise selection, session-only swapping, routine Set coverage, three bottom roots, named detail pages and typed Nutrition Library. Keep the active-session focus model. Specify cancellation, focus return, enlarged-text alternatives, empty/unknown states and the conservative partial-superset limitation. Produce annotated wireframes and acceptance scenarios. Remove Pantry, Grocery and Freezer entry points and related controls while keeping their records portable. Do not edit application code in this UX pass.

**Systems/domain architect — resolve the safety gates**

> Use the same source/review packet and current index.html. Specify the minimal additive contracts for repeated-block queries/comparability, new-instance metadata snapshots, idempotent exercise replacement/undo, planned/performed set queries, optional schedule assumptions, three-root preference projection, route aliases and Pantry/Grocery/Freezer retirement with tag compatibility. Prove before/after graphs and arithmetic using synthetic fixtures, including partial supersets, pending amendments, changed types, stale revisions and retry/reload. Preserve every original ID/unit/collection and full-backup/photo behavior. Resolve the scoped nutrition snapshot risks before adopting affected old-entry editing flows. No native schema, broad rewrite, application implementation or publishing.

**Development team — after implementation is authorized**

> Read the approved UX/domain contracts, AGENTS.md and this packet. Build one milestone at a time in the existing app, starting with the shared chooser and its preservation tests, then the approved safe-swap foundation. Keep app code in index.html and existing delegated/domain persistence patterns. Do not shortcut a swap through libSave/renameExerciseEverywhere. Remove the approved Pantry/Grocery/Freezer UI and behavior, but do not delete their stored records/tags or replace legacy preferences. Run repository and relevant fresh-profile Chromium/WebKit checks, add accurate release notes/help, and produce a reviewable diff and results. Stop before publishing unless publication is expressly part of that work's authorization.

**QA/release reviewer**

> Verify the acceptance pack against the exact proposed source/package using synthetic records and fresh profiles. Check IDs, raw precision, receipts, backup/photo restoration, workout import twice, offline termination/recovery, pending/failed/stale-tab writes, waiting-worker updates, all tracking types, hidden preferences and old routes. Evaluate 390/375px, both themes, enlarged text, keyboard, safe areas and real iPhone/VoiceOver. Label timing/tap targets unmeasured until observed. Record pass/fail and unresolved limitations; do not publish from a test result alone.

## Visual recommendation

**Lead choice: Warm Mineral.** Use warm off-white overview pages, forest text/actions and a charcoal-green dark theme. This makes the app more welcoming without adding decorative content to logging. The board compares real alternatives, not just accent-color swaps:

| Direction | Light appearance | Dark appearance | Product tradeoff |
| --- | --- | --- | --- |
| Warm Mineral — recommended | Warm off-white `#F5F3EE`, white surfaces, forest action `#315C4B` | Forest-charcoal `#141C18`, lifted surfaces, sage action `#A7C9B0` | Warmest practical default; green must mean selection/action, not a health verdict. |
| Clear Coast | Airy blue-grey `#F1F5F7`, marine action `#285E78` | Navy-charcoal `#111C24`, pale blue action `#9DCCE3` | Crisp and familiar, but less distinct from the existing cool palette. |
| Clay Studio | Cream `#FAF2EC`, clay action `#874C3E` | Warm graphite `#241A18`, pale clay action `#EAB49F` | Most expressive; keep warning/error semantics distinct from clay branding. |

The owner accepted the recommended Warm Mineral direction. The three-way selector remains a review tool, not a proposed extra app setting. Keep existing light/dark/system support.

Beyond color: use native system type, readable tabular numerals, a consistent spacing scale, restrained rounded surfaces on overview pages and flat exercise rows while logging. Reserve strong borders for actual fields/focus, rather than framing every metric. Keep photos useful but optional, remove repeated decorative chips, and show one clear primary action per section. Do not solve density by reducing text/targets. The detailed review defines semantic tokens and proposed type sizes; dense logging still needs measured fitting/fallback decisions.

The [interactive board](DESIGN_DIRECTIONS.html) contains six synthetic entry-path previews and light/dark/enlarged-text controls. It is a local concept, not a replacement application: no storage or real logging, and unbuilt detail destinations must be labeled as such. The visual review records token-pair contrast and artifact checks separately from future production accessibility acceptance.

## Product-owner decisions recorded — November 7, 2026

- Accepted the recommendations, including **Warm Mineral**, **Today / Train / Nutrition**, the shared exercise picker, session-only safe swaps, primary/secondary routine coverage, Nutrition Library and reduced tag clutter.
- Explicit amendment: **remove Grocery and Freezer as well as Pantry** from the active product. Remove their screens, links, filters and automatic inventory/shopping effects. Do not relocate them into another normal menu.
- Preserve original Pantry/Grocery/Freezer/gkit records and legacy references unchanged for loading, backup import/export and restoration. Feature removal is not data erasure.
- Keep recipes, saved meals/foods, meal planning, cook instructions, ordinary leftovers, nutrition logging and photos. These must work without inventory or shopping features.
- Initial routine coverage stays per routine; explicit weekly scenarios and future-template updates remain optional later scope. Detailed interaction placement and technical safety contracts still need completion.

The current turn records agreement to the plan and its amended scope. No application implementation, commit or deployment is performed by this update.

## Review boundary and validation

This packet is based on the audited local source, specialist investigations, cited primary research where used and synthetic design examples. It includes no user health records. No application code, storage, credentials, deployment settings or public beta was changed during this review. Full application regression suites are reserved for implementation; static checks and design-artifact checks are recorded separately. Physical iPhone, VoiceOver, task-time and tap-count findings remain unmeasured in this planning pass.


## Checks actually completed in this planning pass

- Three specialist reviews completed; the training and nutrition reviewers cross-reviewed the lead plan. Their corrections to legacy-history eligibility, scalar routine sets, completed-work swaps, superset placement, freezer-friendly tags and old-entry snapshot acceptance are incorporated.
- `npm run check` passed: 316 top-level functions, 299 actions with no accidental collisions, 48 numeric fields with keypad declarations, local runtime dependencies.
- All local Markdown links in this packet resolve. The new `docs/product-review/2026-11-07/` packet and approval note in AGENTS.md contain the planning changes; application code/assets and deployment files are unchanged. No commit or push was made.
- The design reviewer checked 72 concept states at 390px (three palettes × two appearances × six screens × two text sizes), wide 1180px layout, sample interactions, search and explicit unimplemented-route notices. No horizontal overflow was found in those checks. Computed text/action token pairs meet 4.5:1 and tested essential edge pairs meet 3:1; these are token/artifact results, not production certification.
- The lead visually reviewed the wide Warm Mineral comparison and dark focused-workout concept. The board's example behavior is illustrative; final Swap placement, persistence and all unbuilt routes belong to the later approved interaction/domain contracts.
- No full application suite or physical iPhone/VoiceOver/timing study was run for this documentation-only review. Existing application behavior is not newly certified by the concept checks.

## Scope amendment validation

The approved removal scope supersedes the initial provisional Grocery/Freezer retention in the specialist investigation. The nutrition report, handoffs and project guide now reflect retirement of all three features. Historical source findings and original stored shapes remain unchanged.
