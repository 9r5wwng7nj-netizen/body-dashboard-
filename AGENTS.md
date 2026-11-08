# Body Dashboard — guide for coding agents

This file is the shared brief for **Claude Code** (via `CLAUDE.md`) and **OpenAI Codex** (which reads `AGENTS.md`). Read it before changing anything.

## What this is

A personal, offline-first training and diet app: **Workouts**, **Nutrition** and **Recipes & Meals**, with a Dashboard. It was started on 2026-11-07 from a copy of Life Dashboard (commit `718c52f`), keeping only the fitness and diet sections; Scripture, Journal, Media, Marriage & Family, Tasks, the Obsidian bridge, YouTube, the Claude connector and the Morning brief were removed. Life Dashboard itself is untouched and lives on in its own repo.

The application UI and about 4,900 lines (many of them very long) of vanilla JavaScript are in `index.html`; pinned runtime libraries and compiled Tailwind CSS live in `vendor/` and `assets/`. There is no framework or application server. All data lives in the user's browser (IndexedDB). Opening `index.html` from disk (`file://`) works and is how most tests run.

## Active delivery decision — 2026-11-07

- Build the **free web app on GitHub Pages first**, optimized for iPhone Safari and Home Screen use, by extending this existing application. Preserve offline logging, workout-history import, existing records/photos and backup compatibility.
- The active requirements are [docs/mobile-rebuild/MASTER_PRD.md](docs/mobile-rebuild/MASTER_PRD.md), [WEB_FIRST_PLAN.md](docs/mobile-rebuild/WEB_FIRST_PLAN.md) and the revised [Agent D web handoff](docs/mobile-rebuild/PROMPT_D_DEV_TEAM_SPRINT_1.md). The directory name is historical.
- Expo/React Native, WatermelonDB/SQLite, Xcode/CocoaPods and App Store distribution are deferred. Their archived A–C platform instructions and native D prompt do not override this decision. Do not create a native project or port C's 41-table schema for this sprint.
- Retain the existing navigation/components and Store/IndexedDB namespaces. Add browser recovery/import behavior compatibly; validate hosted service workers, WebKit and actual iPhone use rather than treating `file://` or Chromium alone as PWA acceptance.
- The zero-required-hosting-cost target assumes GitHub Free/public repository/default Pages domain within current limits. No paid dependency, account connection or production sync. Personal records/backups never go into GitHub or build artifacts.
- The product owner authorized publication as a personal beta on 2026-11-07. Run final checks, publish only the allowlisted runtime files at the existing project address, and preserve all browser storage/record identities. Keep backups, credentials and preview certificates out of GitHub and deployment artifacts. See `docs/mobile-rebuild/outputs/D_SPRINT_1_REPORT.md` for results and release gates.

## Golden rules

1. **Never touch Life Dashboard's storage.** Both apps are hosted on the same origin (`9r5wwng7nj-netizen.github.io`), and browsers share storage across an origin. Every storage name here is Body Dashboard's own: IndexedDB `body-dashboard`, localStorage `bd.*`, Cache Storage `bd-shell-*`, Drive files `body-dashboard-*`. Never use `life-dashboard`, `ld.*` or `ld-shell-*` for anything that is written. `tests/smoke.spec.js` checks this.
2. **Never break saved data.** Records must never need re-entering after an update.
   - Changes to stored data are **additive only**. New fields are optional and read with fallbacks (`r.made || []`).
   - New collections are added to `COLLECTIONS` with a default. `ensureSeeds()` and `Store.init()` fill in anything missing.
   - Never rename or delete a collection key, a `bd.*` key, the IndexedDB name or a store name (`kv`, `photos`, `local`). Never bump the DB version (1) without an `onupgradeneeded` path that keeps the existing data.
   - Collection keys and record shapes match Life Dashboard's for the sections kept, so a Life Dashboard backup imports as is. Keep them compatible.
3. **Preserve the design.** Use the existing Tailwind patterns and components (`card`, `btn`, `btn-primary`, `chip`, `chip-on`, `stat`, `label`, `input`, `muted`). Every new UI needs `dark:` variants and must work at 390px wide.
4. **Keep application code in `index.html`** unless the user asks for a refactor.
5. **Run the checks before you finish:** `npm test`, or at least `npm run check`.
6. **Keep the app generic.** No personal names in titles, headings, placeholders, exports or seed data; anything personal comes from Settings (`S.name`) or the user's own records.
7. **Tell users what changed.** Every change a user would notice adds an entry at the top of `RELEASES` (a new `id`, a short title, a slide per change in plain language). Keep `TOUR` accurate.
8. **No secrets in the repo.** API keys (USDA) are entered in Settings, live in localStorage and are excluded from backups. Never commit backup JSON files; `.gitignore` blocks them.

## Run, check, test

```bash
npm install                 # dev tools only — the app itself has no npm dependencies
npm run build:css           # rebuild assets/app.css after changing classes or src/app.css
npm start                   # serves http://localhost:8080
npm run check               # static check: syntax, duplicate functions, action names that collide or have no handler
npx playwright install chromium   # once
npm test                    # build:css + check + Playwright tests (every view and tab, phone width, backups, import, sync)
```

The tests use a fresh, empty browser profile every run. Never point a test at a real browser profile.

## Architecture (all in `index.html`)

The `<head>` holds the theme pre-paint script, compiled `assets/app.css`, and the pinned local Lucide bundle. The body holds the shell (header, `#view`, bottom navigation, `#modal`, toasts) and one large `<script>`. Search for these banner comments:

| Banner / marker | What's there |
|---|---|
| `CORE UTILITIES` | `$`, `$$`, `esc`, `uid`, `ymd`, `addDays`, `daysBetween`, `startOfWeek` (Monday), `fmtDate`, `fmtNum`, `sum`, `hostOf`, `slugTitle`, `stars`, `num`, `round`, `download`, `copyText`, `icon()` |
| `SETTINGS (localStorage)` | `SETTINGS_DEFAULT`, `S`, `loadSettings`/`saveSettings` (`bd.settings`) |
| `STORAGE (IndexedDB primary…)` | `COLLECTIONS` (every data key and its default), the `Store` API, `LocalDb` (the `local` store sync keeps its base copy in) |
| `UI PRIMITIVES` | `toast`, `Modal`, `modalShell`, `tabs`, `cardHead`, `emptyState`, `ui` |
| `ROUTER / SHELL` | `VIEWS` (four), `NAV_COUNTS`, `render()`, `go(view)`, bottom navigation at every width (`renderBar`, `S.bar`), focused-workout Minimize/Resume, and the header + sheet (`QUICK_ADD`: food, weight, workout, recipe from a link) |
| `REST TIMER` | `Timer`, `beep()`, `notify()` |
| `DASHBOARD (home)` | `renderDashboard()`, `DASH_CARDS` (today, nutrition, weight, training, meals), `dashToday()` (workout, food so far, weigh-in, dinner), `dashMeals()` |
| `FITNESS` | workout logger, programs, exercise library, stats, Hevy CSV import/export |
| `NUTRITION` | food log, Open Food Facts / USDA search, barcode, adaptive plan and check-ins, measurements and progress photos, MacroFactor import |
| `SETTINGS & SYNC` | Settings modal, backup export, import (`validateBackup`, `planBackupImport`, `commitBackupImport`), and the Life Dashboard import: `fromLifeDashboard()`, `importSettings()` (only `LD_SETTINGS` and the `LD_TABS` tabs), `importPhotos()` (only photos the imported records use), `hasOwnRecords()` |
| `HOME — … recipes` | Recipes & Meals: recipe box, ingredient nutrition (`ING_DB`), cook mode, meal plan with a Tonight card, `RECIPE_LIBRARY` and Plan my week (`mpw*`), grocery list and sections, pantry and freezer. Action tables `A_MEALS` (basics), `A_RECIPES`, `A_MPW`; `runShortcut()` sends groceries to Apple Reminders |
| Share sheet → `READER`, `readLink()` | Save a recipe from a link (recipe only). The link reader is Life Dashboard's deployed Cloudflare Worker; it answers by origin, and this app is on the same origin. It also serves the food search (`/food/search`) |
| `HELP: start-here tour and what's new` | `RELEASES`, `TOUR`, `dashNotices()`, the `deck*` slides, `openHelp()`, `A_HELP` |
| `DEVICE SYNC (Google Drive app folder)` | Built but **off**: `DRIVE.clientId` is empty until the user chooses a Google account. `syncMerge()` three-way merge, Google sign-in, Drive calls, `Sync`, photo sync, daily copies, `A_SYNC` |
| `ACTIONS (event-delegated)` | the core `A` table and `Object.assign(A, A_FIT, A_NUT, A_MF, A_MEALS, A_RECIPES, A_MPW, A_SYNC, A_HELP, A_SHARE)` |
| `EVENT WIRING & INIT` | global click/input/change/submit listeners and `init()` |

See `docs/ARCHITECTURE.md` for the patterns and `docs/DATA_MODEL.md` for every stored collection.

### Core patterns (follow them)

- **Rendering:** views are functions that return HTML strings. `render()` rebuilds `#view` and then calls `afterRender`. Escape every user string with `esc()`; use `webUrl()` for external links.
- **Events:** never attach listeners to elements. Put `data-action`, `data-change`, `data-input` or `data-submit` on the element and add a handler to a module's action table. Later tables override earlier ones; `npm run check` flags collisions and any action name with no handler.
- **Saving:** mutate `Store.get('key')` then `Store.save('key')`, or `Store.set('key', value)`. Then `render()`.
- **UI state** that shouldn't persist goes on `ui`; persistent preferences go on `S` plus `saveSettings()`.
- **Modals:** `Modal.open(modalShell(title, bodyHtml, footerHtml, submitActionName), { wide })`.
- **Tabs:** `tabs('uiKey', [[id, label, icon], …])`; tabs can be hidden (`S.hiddenTabs`), so a view must work when its default tab is hidden.
- **Icons:** `icon('lucide-name')`; the bundle is pinned under `vendor/lucide/`.
- **Top-level names are global.** Search before adding `function foo` or `const foo`.

## Decisions (Seth, 2026-11-07)

- Body Dashboard is a new app; Life Dashboard is left exactly as it is. Its fitness and diet records come across once, from a Life Dashboard backup (Settings & Sync → Import backup), and from then on fitness and diet are logged here.
- "Science" in the original request meant diet; the focus is fitness and diet.
- Which Google account syncs it is not decided yet, so Drive sync stays off (`DRIVE.clientId` empty). If it ends up using the same Google Cloud project as Life Dashboard, the app folder would be shared, so the sync file names here (`body-dashboard-sync.json`, `body-dashboard-copy-*`) must stay different from Life Dashboard's.
- Next: expand and refine the fitness and diet side.

## Refresh plan (Seth, 2026-11-07)

From the "Body Dashboard Refresh" research page: four steps, each shipped with a What's new note, keeping familiar paths working.

1. **Fixes (built):** number fields name their keypad (`npm run check` enforces it), 44px buttons and fields on touch screens, a set row that fits a phone (`setShort()` for Previous), the RPE column hidden unless `S.rpe` is on or a set already has one, exercise tools behind ⋯ (`awExMenu`), notes behind Add note (`ui.noteOpen`), short tab labels on phones (4th item in `tabs()`) with a fade on rows that still scroll (`tabFade`), the Nutrition day bar (`dayName()`, `nutDayMenu`), one row of recipe filters, and a one-line backup reminder with Later (`S.backupLater`).
2. **Speed (built):** dialogs are bottom sheets under 640px (`.sheet-grab`, `.sheet-head`, drag to close via the `SHEET` touch listeners); Log food has the meal on top (`lfMealSeg`), Recent and Usual lists (`usualFoods()`), ticks for multi-add (`ui.lf.picked`, `lfAddPicked`, `logFoodAgain()`) and portion chips (`PORTIONS`, `ui.lf.base`); Same as yesterday on an empty meal (`prevMeal`, `mealSamePrev`); +/− for the next set (`setStepper`, `awStep`); the rest timer spans the screen above the bottom bar on phones; the screen stays on while a workout is on screen (`workoutWake`).
3. **Look:** one Today card that leads, the weight trend drawn bold over faint weigh-ins, the week counted instead of a streak, a number type style, photo recipe cards, dark mode tuned for the gym.
4. **Extras:** plate math and warm-ups, a finish summary, "fits today" on recipes, cook-mode timers, a muscle map.

Decisions: the big calorie number is **calories left** by default (`S.calBig`, switchable in Settings, drawn by `calCenter()` and `foodSoFar()`); RPE is hidden by default; **photo or "describe a meal" logging is planned for later through ChatGPT (the OpenAI API)**. When it is built, the request goes through the reader Worker or another server with the user's own key entered in Settings (never in the repo or a backup), and the result only fills in database foods the person can edit before saving.

## Focused interface (2026-11-07)

The product owner requested a simpler lifting interface using supplied screenshots as directional references, not an exact copy. There is no sidebar. Four bottom destinations use the existing `S.bar` order; header controls expose quick adds, help and settings. Active workout rendering hides section tabs and bottom navigation; the down arrow minimizes to History, and Resume retains the active record. Numbered sets open options; extra steppers expand on demand (`ui.stepOpen`, transient). Calendar/totals and full history details expand separately. Keep all original storage, record and backup formats.

## Approved next product iteration — 2026-11-07

The owner accepted the recommendations in [the feature review plan](docs/product-review/2026-11-07/FEATURE_REVIEW_PLAN.md), with **Grocery and Freezer removed alongside Pantry** from the active product. Use Warm Mineral, Today/Train/Nutrition navigation, a shared exercise picker, safe session-only swaps, routine primary/secondary set coverage and a typed Nutrition Library with reduced tag clutter. Retire all three inventory/shopping surfaces **and their hidden effects**, preserving every stored collection/record/reference and backup compatibility. Meal planning, recipes, consumption logging and photos remain. This records the next iteration's direction; detailed implementation is pending and no application changes/deployment are part of the approval-record update.

## Authorized implementation and publication — 2026-11-07

The owner explicitly authorized implementing the approved feature-review plan, running checks and publishing. The Warm Mineral candidate now uses three projected roots while retaining all four legacy route IDs, named Train/Nutrition pages, shared exercise selection, durable swaps and routine set coverage. Pantry/Grocery/Freezer records remain in storage/backups; their actions are inert and rendered affordances removed. New optional snapshots and receipts use existing stores. See `docs/product-review/2026-11-07/IMPLEMENTATION_REPORT.md` for actual verification and release limits. The earlier planning-only notes describe the prior review, not a new approval requirement.

## Cobalt Air selected and authorized — 2026-11-07

The owner selected Cobalt Air from the five paired proposals and explicitly authorized implementation in both light/dark modes, checks and publication. Cobalt Air supersedes Warm Mineral as the production visual direction; the earlier product/navigation decisions remain. Use the selected semantic palette in `docs/product-review/2026-11-07/visual-exploration/palettes.json` without adding multiple brand themes or changing stored records. This is a presentation update, not a persistence or logging redesign.

## Ordered next-iteration implementation authorized — 2026-11-07

The owner explicitly authorized implementing `docs/product-review/2026-11-07/NEXT_ITERATION_PLAN.md` in order, starting with secondary muscles and persistent exercise cues, running checks and publishing each ready update. Sequence: (1) shared reliable exercise metadata forms and visible reusable cues, (2) curated offline catalog/search/mapping corrections, (3) linked Plan/Performed muscle-set analysis, (4) ChatGPT handoff preparation and reviewed drafts. Keep Cobalt Air and every storage/record/photo/import guarantee. Built-in model requests, paid services and server credentials remain deferred to a separate decision; the agreed first AI route is manual ChatGPT handoff. Do not treat the earlier investigation-only status as a new approval requirement for these authorized stages.

## Ordered iteration delivery — current runtime

Secondary selections/cues, the read-only 200-definition catalog and Plan/Performed Muscle sets have shipped through individual checked Pages updates; see per-release records under `docs/product-review/2026-11-07/`. The fourth stage adds manual ChatGPT handoff/review with optional `handoffDrafts`, existing coordinated commands and strict snapshot validation. H2 built-in AI remains deferred. The old browser-API-key sketch in Refresh plan is superseded: do not add provider secrets to browser settings/client code; any later integration needs a separately chosen server credential boundary. Core logging stays offline and separate from manual external ChatGPT use. Preserve these scopes when extending the app.

## Optional local training cycles — 2026-11-08

- Train → Import cycle adds private multi-week prescriptions with per-set targets, optional base/ramp TMs and load rounding. See `docs/TRAINING_CYCLES.md` for the versioned contract and persistence boundaries.
- `trainingCycles: []` is optional. Keep imported cycle definitions, targets and actual logged values separate. Preserve active/history snapshots after setup changes. Do not seed personal plans or commit them to this public repository.
- `weight_distance` adds loaded carries with canonical kg/km and optional yards/metres display. Preserve legacy tracking and draft-unit meanings. Warm-ups and loaded carries stay outside rep-based muscle-set totals.
- Progression and contradictory source instructions require user review. Do not silently change TMs, infer effort or prohibit recording actual activity. Sync remains off.
