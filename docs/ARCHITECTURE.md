# Architecture

`index.html` is the whole app. Here's the order of the file, top to bottom.

## 1. `<head>`
- A pre-paint theme script reads `bd.settings` and sets `class="dark"` early to avoid a flash.
- Compiled `assets/app.css`, generated from `src/app.css` with the pinned Tailwind CLI.
- Pinned local Lucide icons from `vendor/lucide/`.
- `src/app.css` defines the brand palette, class-based dark mode and component classes:
  - `card`, `btn`, `btn-primary`, `btn-ghost`, `btn-danger`, `btn-sm`, `input`, `label`, `chip`, `chip-on`, `stat`, `tab`, `tab-active`, `muted`, `md`, `scroll-thin`
  - the build scans `index.html`; run `npm run build:css` after changing classes.

## 2. Shell markup
- Three projected destinations (Today, Train, Nutrition) in `#bottom-bar` preserve four legacy route IDs and saved `S.bar` preferences. There is no sidebar.
- Header holds `#view-title`, quick adds, Help and Settings. Active workouts switch to Minimize, rest timer and Finish.
- `renderNav()` toggles the focused-workout shell from the rendered active view. Minimized workouts have a Resume strip; the same `activeWorkout` record stays in storage. The timer moves into normal document flow above Resume to keep both controls reachable.
- Set-number options reuse existing set mutations. Expanded adjustments live in transient `ui.stepOpen`; no new stored UI fields are required. History previews exercises before expanding full details.
- `#view` is where the current page renders. `#modal` is the single modal host. Toasts sit alongside them.

## 3. Script sections (search for the banner text)

1. **CORE UTILITIES**: DOM helpers, date math (local `YYYY-MM-DD`, Monday weeks), formatting, `icon()`, `download()`, `copyText()`.
2. **SETTINGS**: `SETTINGS_DEFAULT`, `S`, `saveSettings()`.
3. **STORAGE**: `COLLECTIONS` and `Store` (IndexedDB `kv` store, localStorage fallback, debounced `save()`, flush on `pagehide`/`visibilitychange`). Writes drain serially from cloned snapshots; a successful write acknowledges only its captured revision. Failed keys remain dirty with a recovery banner, retry and export. History plus active workout commit in one IndexedDB transaction when both are dirty. In fallback mode history saves first. Recovery state is in memory, so keep the tab open until retry succeeds or export a backup. `readMany()` loads the collections in one readonly transaction. A failed transaction stops initialization rather than treating unread records as missing defaults.
4. **UI PRIMITIVES**: `toast`, `Modal`, `modalShell`, `tabs`, `cardHead`, `emptyState`, `ui` state.
5. **ROUTER / SHELL**: `VIEWS`, `renderNav`, `render`/`renderNow` (with a re-entrancy guard), `rerender` (keeps focus), `afterRender` (workout clock, photos, icons), `go(view)`.
6. **REST TIMER**: floating timer `Timer` (persists in `bd.timer`), `beep`, `notify`.
7. **DASHBOARD**: `renderDashboard()` and the module cards. `dashToday()` reuses quick-add food/weight flows and opens the workout screen. Card IDs, ordering and visibility preferences remain unchanged. `dashWeight()` reuses `trendSeries()` (seven calendar days of available readings), with calendar spacing and a text summary. Completed-week counts use `completedWorkoutsThisWeek()`, derived from saved history on every render; weeks start locally on Monday, future-dated records are excluded and `activeWorkout` stays separate. Legacy completed history does not require a new status field.
8. **FITNESS**: logger with supersets and set types, routines and programs, exercise library, stats, Hevy CSV.
9. **NUTRITION**:
   - Daily log, the log-food modal (search, barcode, quick add, saved meals, recipes), foods and meals.
   - Adaptive plan and weekly check-ins, weight trend and expenditure, body measurements and progress photos, MacroFactor import.
10. **SETTINGS & SYNC**: Settings modal, backup export and import (merge/replace), including Life Dashboard backups (`fromLifeDashboard`, `importSettings`, `importPhotos`).
    - **DEVICE SYNC** (opt-in on each device): `syncReviewedMerge` combines independent ID-addressable changes, while conflicting edits/deletions/legacy arrays pause for an explicit snapshot-bound choice. `Sync.adopt()` runs through the writer queue and adopts already-saved settings too. Stable Drive reads bracket full content with file markers; publication uses conditional updates and a full matching readback. Local canonical records, the agreed base, receipt and settings checkpoint commit together under frozen expected records. localStorage settings reconcile through a serialized recovery transaction. Incoming adoption keeps the first local recovery snapshot; unusual input arriving at final commit remains separately recoverable. Record verification and photo availability/errors are distinct. See [Drive sync](DRIVE_SYNC.md) and [Milestone 1](product-review/2026-11-09/milestone-1/SPEC.md). No real-provider or physical-phone guarantee follows from mocked tests.
11. **RECIPES & MEALS** (banners start `HOME`): recipe box and link clipper, cook mode, macro calculator (`ING_DB`), meal-plan slots and the Tonight card, `RECIPE_LIBRARY` and Plan my week, pantry and freezer, grocery sections, stores, staples and budget. The share sheet (`READER`, `readLink()`) saves a recipe from a link.
12. **HELP**: `RELEASES`, `TOUR`, the slide decks, `openHelp()`.
13. **ACTIONS**: the core `A` table, then `Object.assign(A, A_FIT, A_NUT, A_MF, A_MEALS, A_RECIPES, A_MPW, A_SYNC, A_HELP, A_SHARE)`. Later tables win.
14. **EVENT WIRING & INIT**: global delegated listeners (`click` → `data-action`, `input` → `data-input`, `change` → `data-change`, `submit` → `data-submit`, plus drag and drop), then `init()`.

## Request → render loop

```
user clicks [data-action="x"]  →  A.x(el, event)  →  mutate Store.get(key) / ui
                                                  →  Store.save(key)   (debounced IndexedDB write)
                                                  →  render()          (rebuild #view from state)
```

Modules render with template strings. `esc()` every user value. Keep handlers small and put logic in plain functions so it can be tested.

Photo URLs are presentation-only: pending reads are deduplicated, and `Photos.prune()` releases URLs not referenced by current photo elements. Saved blobs remain in IndexedDB.

## Adding a feature (checklist)

1. Data: add a collection to `COLLECTIONS` (with a default) or add optional fields. Never rename anything.
2. UI state: add defaults to that module's `Object.assign(ui, {...})`.
3. View: a function returning HTML, reached from the module's `tabs(...)` map.
4. Actions: add them to the module's `A_*` table. Search first to avoid name clashes.
5. Dark mode, 390px width, empty states.
6. Run `npm test`.


## Web Sprint 1 commands and recovery

`WebWrites` coordinates Store snapshots and explicit commands in one promise queue. Optional `bd.web.*` entries in the existing `local` store checkpoint intents, receipts, timer ownership, import preview/ledger/quarantine, and a single local ownership context. SHA-256 expected bases plus a compare-and-write transaction reject stale collection overwrites. Failed reads stop initialization; they never seed over unread saved data. See [the persistence contract](mobile-rebuild/outputs/D_WEB_PERSISTENCE_CONTRACT.md).

`WorkoutCommands` retains the committed view until transaction completion for Start/Complete/Undo/Amend/Finish. Optional active-set `draft` text and `draftUnits` retain input independently of accepted canonical values. Finish keeps accepted sets only and writes history + active clearing + owned timer + receipt atomically. `Store.ready` signals completed startup for test harnesses; `Store.data` may exist earlier during reconciliation.

Workout-history import is separate from whole-backup restoration. Source IDs define identity. A preview stores only training JSON, expected bases and choices; final canonical changes, ledger/receipt, retained quarantine and preview removal commit together. Unsafe/ambiguous raw records are retained as serialized JSON strings so backup validation can safely round-trip them. Full backup v2 optionally includes `extensions.bdWeb`; old backups remain valid. No schema version/store/collection rename was made.

The service worker uses a project-scoped Body cache generation. It waits for controlled tabs to close, reads only its own generation, and leaves the activated generation intact after failed installation. Bump `GENERATION` whenever shell HTML/CSS/assets change. Before the first upgrade, close older Body pages after saving/exporting; older code cannot enforce this writer protocol. No server authorization or coaching backend is supplied by local ownership metadata.

## Muscle sets and manual ChatGPT handoff

`muscleSetPerformedReport` / `muscleSetPlanReport` are read-only projections. Eligibility, role resolution and coarse-area deduplication are shared with finish/monthly display; UI state is transient. Recorded tracking basis stays snapshot-first even when the owner selects report-only current muscle roles. Physical source positions plus checked IDs/signatures keep old duplicate/missing IDs distinct. No stored aggregates or history rewrites occur.

`A_HANDOFF` exposes selected-data briefs and strict local routine/meal review. The module makes no network/model requests, image reads or automatic sharing. Domain accept/save commands use `WebWrites`; `handoffDrafts` is optional/backward compatible. Raw checkpoint, edited review, proposal signature, accepted result and receipt have distinct roles. UI shows unsaved versus confirmed state, keeps Resume/export/retry and prevents replacing a prepared pending command. Briefs are explicitly selected and previewed; automatic AI/coaching remains deferred; selected data sync is separately opt-in.
