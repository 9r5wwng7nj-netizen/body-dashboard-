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


## Optional training/navigation metadata — Warm Mineral release

New accepted exercise instances may include `classification` (version 1 tracking type, primary/secondary muscle mapping, equipment, bodyweight basis and source). Historical instances without a snapshot continue to use a labeled current-library fallback; no snapshots are fabricated for imported history. Optional `routineSlot`/routine `slotId` preserve new slot lineage. Existing names and IDs remain intact.

An active workout may carry `swapToken`. Swap receipts in the existing private `local` store contain the exact before-workout graph and after digest, allowing undo only while that graph has not subsequently changed. Original unaccepted draft text/units remain recoverable in the receipt; replacement rows never copy those values as completed performance. Recovery purposes additionally allow add/swap/undo/custom-exercise, library portion logging and snapshot entry edits; the existing optional `extensions.bdWeb` backup envelope carries them.

`S.navOrder` is an optional three-root display order; legacy `S.bar`, hidden tabs/cards and card order are preserved. Optional food/saved-meal `fav`/use metadata is additive. Logged nutrient values remain snapshots; absent values stay null/unknown, and known zero stays zero.

`pantry`, `grocery`, `freezer`, `gkit` and legacy `freezerId` references are still loaded and included in full backups. Their product controls and active mutations are retired. Restoring these records does not reactivate inventory or shopping behavior. No database/version/store/collection rename or destructive migration occurred.

## Optional exercise-definition recovery and reusable cues

`exMeta[lowercasedName].notes` remains the reusable cue field; it may be a notes-only override. `exInfo` projects base catalog/inferred metadata plus optional user fields without persisting that projection. Notes-only overrides do not claim a user-reviewed muscle mapping. Workout `exercise.notes` remains that occurrence's session note. Copying a session note to cues does not delete or change it.

The existing web recovery extension also accepts `save-exercise-metadata` intents/receipts. Optional `exerciseToken` and bounded `exerciseEdit` include the raw reviewed form and, for picker creation, its parent draft/context. Canonical records and DB v1 stores are unchanged. Definitions/explicit global renames coordinate touched collections through the existing writer; recorded classifications and record IDs are retained. A narrowly scoped missing-collection/default equivalence permits metadata/custom intents to recover after a full backup materializes an unchanged empty default, but does not permit replay over nonempty/newer records. Old recovery entries without these optional fields remain valid.

If a precondition or all storage writes fail before an intent is checkpointed, the newest form is still transient: keep the tab open until saving or exporting the exercise draft succeeds. Exercise-draft JSON is a readable recovery export, not a completed-workout import file.

## Optional catalog metadata — Release 2

The 144 new built-in definitions are a runtime-only union with the original stored library. No catalog upgrade writes are performed at startup. `exMeta[lowercasedName].catalogHidden` optionally marks an explicitly removed/renamed virtual entry; user fields and actual history/routine/session names are retained. Explicit full save or selected active add/swap can clear that marker through coordinated commands. A cue-only edit does not clear it.

New accepted classification snapshots may include optional `catalog` (source ID/revision/URL/license/editorial status), `loadBasis` and `equipmentSubtype`. Old snapshots, current user overrides, original names and the seven canonical tracking types remain compatible. Reps only is a display label for the existing `bodyweight` type; unquantified bands do not acquire a canonical load conversion.
