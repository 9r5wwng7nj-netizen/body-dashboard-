# Data model

All personal data stays in the browser. **Backward compatibility is the #1 rule.** Add fields and collections freely, but never rename or remove them. Collection keys and record shapes match Life Dashboard's for the sections kept, so Life Dashboard backups import as they are. See AGENTS.md.

## Where things are stored

| Place | Key(s) | Contents | In JSON backup? |
|---|---|---|---|
| IndexedDB `body-dashboard` (v1), store `kv` | one entry per collection key below | All records | ✅ |
| IndexedDB store `photos` | photo id → Blob | Progress photos (plain id) and recipe photos (`rp_…`) | ✅ (backup v2) |
| IndexedDB store `local` | `sync.base` | The last snapshot this device and Google Drive agreed on (`LocalDb`) | ❌ (rebuilt by the next sync) |
| localStorage | `bd.settings` | Settings object `S`: name, theme, units, rest timer, macro targets, `bar`, `hiddenTabs`, `hiddenCards`, `cardOrder`, `tour`, `newsSeen`, `bwFallback`, `rpe` (show the RPE column), `calBig` (`left` or `eaten`), `backupLater` (day the backup reminder was put off), `fdcKey` (USDA key, never in backups) | ✅ (keys excluded) |
| localStorage | `bd.data.<key>` | Fallback copy of collections when IndexedDB is unavailable | — |
| localStorage | `bd.sync` | Sync state for this device (on/off, Google token, refresh token, last sync, errors, photos left, last daily copy) | ❌ |
| localStorage | `bd.timer`, `bd.seeded`, `bd.libv` | Rest timer, and one-time seed flags | ❌ |
| Cache Storage | `bd-shell-v1` | The app's own files for offline use (`sw.js`); never personal data | — |
| Google Drive app folder (when sync is set up) | `body-dashboard-sync.json`, `body-dashboard-copy-YYYY-MM-DD.json`, `photo-<id>` | The synced records and settings, dated daily copies (7 daily, 8 weekly), and one file per photo a record uses | — |

`Store.init()` loads every key in `COLLECTIONS`. A missing key gets its default, which is how new collections arrive without an import.

## Collections (`COLLECTIONS` in index.html)

**Fitness**: `workouts`, `routines`, `exercises` (library names), `exMeta` (per-exercise type and notes), `programs`, `activeWorkout`

**Nutrition and body**
- `foods` (saved foods; `basis` is `100g` or `serving`, `base` holds the nutrients; optional `cupG` adds cup, tbsp and tsp units)
- `meals` (saved meals)
- `nutrition`: a `{ 'YYYY-MM-DD': { weight, entries[] } }` map
- `nutPlan` (adaptive plan and check-ins), `measurements`, `photoMeta` (progress-photo index), `mfImport`

**Recipes & Meals**
- `recipes`. Optional fields: `rating`, `fav`, `kids`, `made[]`, `cost`, `freezer`, `photo`, `img`, `macroMap`, `macroCalc`, `lib` (copied from `RECIPE_LIBRARY`).
- `mealPlan`: a `{ 'YYYY-MM-DD': [{ id, recipeId|null, text?, slot?, portions?, left?, from?, freezerId?, made?, logged?, batch? }] }` map. Items without `slot` mean dinner.
- `grocery`: `[{ id, name, qty, unit, checked, source, section?, store?, price?, note? }]`
- `pantry`, `freezer`
- `gkit`: `{ stores[], staples[], sectionMap{}, spend[], budget, basics[], planPrefs? }`

## Backups

`{ app: 'body-dashboard', version: 2, exportedAt, settings, data, assets: { photos: [{ id, data }] } }`. `validateBackup()` also accepts Life Dashboard backups (`app: 'life-dashboard'`, version 1 or 2): only the collections above are read, only the photos those records use are kept, and only `LD_SETTINGS` (plus the Workouts, Nutrition and Recipes entries of `hiddenTabs`) carry over.

## Conventions

- Dates are local `YYYY-MM-DD` strings (`ymd()`). Weeks start on **Monday** (`startOfWeek()`). Timestamps are ISO strings.
- IDs come from `uid()`. Records keep `id`, and where practical `created`/`updated`, which sync merges by.
- Body and lift weights are stored in kg and shown in the person's unit.


## Optional web recovery metadata (Sprint 1)

The database remains `body-dashboard` v1 with `kv`, `photos`, and `local`. No existing collection or record identifier is renamed. Active sets may carry optional `draft` text and `draftUnits` so raw input survives a checkpoint without changing accepted kg/km/seconds or `done`. New active nested IDs are preserved when finishing; legacy history without nested IDs remains valid.

The `local` store also holds version-1 `bd.web.*` metadata: intents, receipts, timer ownership, a staged training-import preview, and local actor/workspace/athlete defaults. Import receipts include source/target hashes, reconciliation counts and quarantined raw JSON strings. These are local recovery/scoping records, not server authorization or a coaching backend. The optional full-backup extension is `extensions.bdWeb: { version: 1, entries: [[key, value], ...] }`. Photos remain original blobs in `photos`, exported through the existing v2 photo envelope.

See [the exact persistence contract](mobile-rebuild/outputs/D_WEB_PERSISTENCE_CONTRACT.md) and [validation report](mobile-rebuild/outputs/D_SPRINT_1_REPORT.md). Old exports remain accepted; training-only import does not consume unrelated Life Dashboard collections or settings.
