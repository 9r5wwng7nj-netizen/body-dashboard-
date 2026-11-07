# Body Dashboard — guide for coding agents

This file is the shared brief for **Claude Code** (via `CLAUDE.md`) and **OpenAI Codex** (which reads `AGENTS.md`). Read it before changing anything.

## What this is

A personal, offline-first training and diet app: **Workouts**, **Nutrition** and **Recipes & Meals**, with a Dashboard. It was started on 2026-11-07 from a copy of Life Dashboard (commit `718c52f`), keeping only the fitness and diet sections; Scripture, Journal, Media, Marriage & Family, Tasks, the Obsidian bridge, YouTube, the Claude connector and the Morning brief were removed. Life Dashboard itself is untouched and lives on in its own repo.

The application UI and about 4,200 lines (about 0.5 MB, many of them very long) of vanilla JavaScript are in `index.html`; pinned runtime libraries and compiled Tailwind CSS live in `vendor/` and `assets/`. There is no framework or application server. All data lives in the user's browser (IndexedDB). Opening `index.html` from disk (`file://`) works and is how most tests run.

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

The `<head>` holds the theme pre-paint script, compiled `assets/app.css`, and the pinned local Lucide bundle. The body holds the shell (sidebar `#nav`, header, `#view`, `#modal`, toasts) and one large `<script>`. Search for these banner comments:

| Banner / marker | What's there |
|---|---|
| `CORE UTILITIES` | `$`, `$$`, `esc`, `uid`, `ymd`, `addDays`, `daysBetween`, `startOfWeek` (Monday), `fmtDate`, `fmtNum`, `sum`, `hostOf`, `slugTitle`, `stars`, `num`, `round`, `download`, `copyText`, `icon()` |
| `SETTINGS (localStorage)` | `SETTINGS_DEFAULT`, `S`, `loadSettings`/`saveSettings` (`bd.settings`) |
| `STORAGE (IndexedDB primary…)` | `COLLECTIONS` (every data key and its default), the `Store` API, `LocalDb` (the `local` store sync keeps its base copy in) |
| `UI PRIMITIVES` | `toast`, `Modal`, `modalShell`, `tabs`, `cardHead`, `emptyState`, `ui` |
| `ROUTER / SHELL` | `VIEWS` (four), `NAV_COUNTS`, `render()`, `go(view)`, the phone bottom bar (`renderBar`, `S.bar`) and its + sheet (`QUICK_ADD`: food, weight, workout, recipe from a link) |
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
