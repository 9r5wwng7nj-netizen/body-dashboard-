# Body Dashboard iPhone systems architecture

> Archived native proposal, November 7, 2026. The active web route is governed by [WEB_FIRST_PLAN.md](../WEB_FIRST_PLAN.md) and the [current PRD](../MASTER_PRD.md). The 41-table schema, native engine selection and Xcode gate do not apply to web Sprint 1. The PRD used for this report is preserved in [the native archive](../MASTER_PRD_NATIVE_ARCHIVE.md).

Version 0.1 · November 7, 2026 · Systems Architect handoff to Agent D.

**Recommendation:** retain Expo/React Native/TypeScript with WatermelonDB SQLite as the candidate, protect completed observations with immutable revisions, and acknowledge saves only after local commit. **The native compatibility gate is not passed:** this Mac cannot run the required iOS build. Production engine selection remains conditional on that gate; no backend, account connection or native product implementation was started.

The exact [Agent C prompt](../PROMPT_C_SYSTEMS_ARCHITECT.md) was found and used. Inputs read: repository [AGENTS.md](../../../AGENTS.md), [README](../README.md), [source audit](../SOURCE_AUDIT.md), [master PRD](../MASTER_PRD.md), [Agent A analysis](A_COMPETITIVE_ANALYSIS.md) and [Agent B UX spec](B_UX_SPEC.md). The current uncommitted web refresh is source context, not a change made by this stage. All fixtures and observations in this packet are synthetic.

Companion artifacts:

- [Physical schema and typed domain contracts](C_DOMAIN_CONTRACTS.ts): executable schema metadata, row types, relationships, commands, queries, events, archive and sync shapes.
- [Native compatibility report and reproduction plan](C_COMPATIBILITY_REPORT.md), with [package/source evidence](C_TECHNOLOGY_EVIDENCE.json).
- [Analytics vectors](C_ANALYTICS_VECTORS.json) and [contract/arithmetic verifier](C_VERIFY_CONTRACTS.mjs).
- [Host SQLite rehearsal](C_HOST_SQLITE_CHECK.py) and [actual results](C_HOST_VALIDATION.json). These do not use WatermelonDB or an iPhone.

## 1 Decisions, boundaries and outstanding gates

| Decision | Status and reason |
| --- | --- |
| Native project at `mobile/` when Agent D is authorized | Proposed separate project; old `index.html`, browser records and Life Dashboard remain intact. No native app folder was created here. |
| Expo 58.0.23 / RN 0.88.1 / React 19.3.0 / Watermelon 0.28.0 | Exact candidate metadata/source inspected; native compilation and persistence unverified. The compatibility report distinguishes candidate pins from tested combinations. |
| Real SQLite adapter, development build, Hermes/New Architecture | Required spike configuration. No Expo Go assumption, in-memory substitution or parallel expo-sqlite domain database. |
| Stable roots plus immutable observation/version rows | Proposed elaboration of PRD snapshots. Corrections preserve IDs and prior values; a single head pointer selects a coherent version. Adds storage/joins, not logging steps. |
| Publication batch gate for imports | Proposed implementation of atomic visibility. New staged graphs are hidden; final publication and reviewed head changes commit together. |
| Durable command intents and idempotent receipts | Proposed local recovery contract, separate from Watermelon's own sync tracking. No optimistic completed counts. |
| Personal workspace/athlete scope from first launch | Fixed requirement. Scope checks apply to relationships and exports as well as lists. Phase 2 server authorization is additional work. |
| Coaching UI, production sync and food-provider selection | Deferred as specified; no client switcher or network dependency in personal logging. |

The physical proposal contains 41 tables, including local recovery/import bookkeeping and versioned snapshots. This is deliberately more than a set logger's minimal schema: reliable re-import, history correction and future device conflicts need retained lineage. Agent D builds the workout slice first; an empty declared diet/grant table does not authorize its UI or a coaching backend. If the native performance spike cannot support this cost, revise the design explicitly before shipping. Do not implement every future feature to justify the schema.

**Gates still open:** native compilation/JSI support; safe database lifecycle after a failed prepared batch; actual iOS file attributes; upgrade/downgrade safety; final import publication size/latency; physical-device UI/commit measurements. A host benchmark is not a waiver.

## 2 Native compatibility and engine decision

Actual environment: macOS 27.2 arm64, Node 24.21.0, npm 11.19.0. Developer directory is Command Line Tools. `xcodebuild -version` fails because full Xcode is unavailable; `xcrun simctl` is unavailable, and CocoaPods is not on PATH. No matching Xcode app was found under `/Applications`. Exact probes, candidate pins and reproduction commands are in the compatibility report. Simulator and physical-device results are both **not run**.

Public Watermelon documentation shows 0.27.1; the inspected release package/source is 0.28.0. Its SQLite batch source wraps the batch in a transaction, committing or rolling back; a writer alone is not a promise that several separate calls form one SQL transaction. Use one awaited `database.batch(...)` for each atomic domain effect. The JSI source enables WAL; its explicit `synchronous=FULL` setting is inside an Android conditional, so iOS settings must be inspected rather than assumed. [Pinned batch implementation](https://github.com/Nozbe/WatermelonDB/blob/v0.28.0/native/shared/Database-batch.cpp), [database initialization](https://github.com/Nozbe/WatermelonDB/blob/v0.28.0/native/shared/Database.cpp), [writer/batch guidance](https://watermelondb.dev/docs/Writers).

| Engine option | Benefit | Work/cost and decision |
| --- | --- | --- |
| Watermelon SQLite | Reactive models, SQL storage, migrations and existing sync machinery | Native integration/JSI and failure-cache recovery must pass the isolated spike. Remains candidate. |
| expo-sqlite 58.0.15 | Expo-supported SQL access; documented SQLCipher build option | We own reactive invalidation, migration runner, identity/association mapping and future record-sync tracking/conflicts. Separate probe only if Watermelon fails; no automatic switch. |

Expo's SQLite encryption option is not a capability transferred to Watermelon by installing both. A SQLCipher claim requires a compatible built binary and verified cipher operation. [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

For Agent B's keyboard contract, propose Expo's matching `react-native-keyboard-controller` 1.22.7 with its keyboard-aware scroll view/toolbar and safe-area context. Prove selection, decimal locale, enlarged layout and focus on the chosen native build. Core `InputAccessoryView` is currently deprecated. No keyboard implementation was built here. [Expo keyboard controller](https://docs.expo.dev/versions/latest/sdk/keyboard-controller/), [React Native deprecation](https://reactnative.dev/docs/inputaccessoryview).

## 3 Physical schema, identities and migrations

### Exact declaration

`C_DOMAIN_CONTRACTS.ts` is the normative column inventory. `TABLES[table][column]` states exactly `type`, `isOptional` and `isIndexed`; no omitted flags. It currently declares 560 application columns across 41 tables. Watermelon supplies `id`, `_status` and `_changed`; they are not declared application columns or assigned custom tracking meanings. All timestamps are finite UTC epoch **milliseconds**, all `recorded_day`/`effective_day` values are validated Gregorian `YYYY-MM-DD` strings. Number columns are finite doubles; integer/range rules are domain validation. JSON is stored as validated versioned text, not arbitrary executable objects. [Schema types and internals](https://watermelondb.dev/docs/Schema).

New rows use Watermelon's generated IDs. Original source IDs and deterministic logical import keys live in mappings; they are not forced into native primary keys. `revision` is a local optimistic-edit token, not a global sync cursor. Immutable rows have revision 1; creating a correction appends a new row and increments the stable root's revision/head. Watermelon's automatic timestamps are not the original workout timestamps; original values stay in version/source fields.

Common physical fields:

- `audit`: `created_at:number`, `updated_at:number`, `revision:number`, required.
- `owned`: audit plus required string `workspace_id` and `athlete_id` (both indexed), and required attribution strings `created_by_actor_id`, `updated_by_actor_id`.
- `visible`: owned plus required indexed string `publication_batch_id`.
- Optional string/number fields are explicitly nullable. Missing load, reps, duration, distance, RPE, bodyweight and nutrients never become zero defaults. Required quantities/bases are validated before creation.

The following inventory explains responsibilities; exact columns/types/indexes remain in the machine artifact rather than a second inconsistent schema:

| Tables | Physical role and associations |
| --- | --- |
| `actors`, `workspaces`, `athletes`, `identity_claims` | Generated local identity; workspace owner; athlete ownership; later verified principal binding. Owner binding is committed with bootstrap identity creation. |
| `access_grants` | Server-authoritative Phase 2 capabilities/expiry/version. No local bootstrap grant authorizes remote access. |
| `publication_batches`, `athlete_runtime` | Visibility gate; local active-session/timer pointers, timezone and UI preferences. Runtime data is local-only. |
| `exercises`, `exercise_aliases` | Stable canonical identity, tracking/load convention and explicitly reviewed source aliases. Names are editable labels. |
| `routines`, `routine_versions`, `routine_exercises` | Stable routine root, immutable prescription versions, ordered exercise snapshots/targets. Session references a version, never a mutable template. |
| `sessions`, `session_versions`, `session_exercises` | Stable session root, immutable lifecycle/date/note versions, separate ordered exercise instances. Repeated names do not collapse instances. |
| `sets`, `set_observations`, `set_drafts` | Stable set identity/order/suggestion, immutable actual-state revisions, separate local raw editor checkpoints. Current actual state is selected by `head_observation_id`; the observation also freezes exercise identity/label, variant, equipment and load basis. |
| `subjective_observations`, `rest_timers` | Attributed nullable feedback with supersession/retraction; local deadline/source/notification state. No readiness or injury score. |
| `foods`, `food_versions`, `saved_meals`, `saved_meal_versions` | Stable definitions and immutable serving/conversion/nutrient/constituent snapshots. Recipe-serving reuse does not require gallery/pantry parity. |
| `food_entries`, `food_entry_versions`, `diet_days`, `target_versions` | Consumption identity plus immutable corrected snapshots; explicit day-coverage declaration; dated targets. Definition edits cannot rewrite consumption. |
| `weigh_ins`, `weigh_in_versions`, `weight_day_choices` | Stable reading identity, immutable measured revisions, optional explicit daily representative. All raw revisions remain available. |
| `import_sources`, `import_jobs`, `import_records`, `import_items`, `source_id_maps` | Local source lineage, resumable job/counters, accepted hashes/heads, issues/raw training payload and persistent native-ID mappings. |
| `command_intents`, `command_receipts` | Recoverable pending payload and committed idempotency proof. Local-only; not an alternative network mutation queue. |
| `projection_epochs`, `derived_caches`, `conflict_reviews` | Recomputable local analytics invalidation/cache, plus reviewable sync branches later. No authoritative observations live only in a cache. |

### Relationship and visibility rules

Every owned row must reference an athlete in its workspace. Actor attribution must refer to a known actor; access checks use the active identity, not a caller's invented actor string. Every visible row references a committed same-scope batch for ordinary reads. New native rows use a bootstrap publication batch already committed for that athlete.

`RELATIONS` lists 55 explicit links, plus inherited ownership/publication/actor links. Validate same workspace **and** athlete at each edge and validate inverse identity: a set head must be an observation of that set/session/exercise; a session version must point back to the same root. A valid unrelated ID is not a valid parent. Completed observation snapshots are not rewritten when an exercise definition changes; an explicit historical metadata correction appends a reviewed observation revision. JSON-held constituent/source references receive the same checks where they claim native identity.

These domain relationships are not a blindly generated Watermelon `Model.associations` object. Multiple head/parent/self links to the same table cannot all be represented as one table-keyed association. Declare canonical collection associations explicitly; resolve head links by scoped ID lookup or reviewed parameterized SQL. Never fall back to a name match. [Watermelon models/associations](https://watermelondb.dev/docs/Model).

Root/head revision reads use joins that check back-reference, both scopes, both publication gates and `_status != 'deleted'` on each participating record. Implement only a small allowlisted SQL set, bind values, and keep table/column names static. No component receives an unscoped `find(id)` repository. For raw joined-query subscriptions either declare all join tables as required by Watermelon or observe a scoped projection epoch and refetch after invalidation. Do not assume a join observes every column automatically. [Query/security and raw SQL](https://watermelondb.dev/docs/Query).

Indexes: only declared `isIndexed` fields generate schema indexes. They cover scoped lookup, parent collections, heads, source/operation keys and day-based candidate selection. Day strings here are deliberate selective reporting keys, not a rule to index all timestamps or user text. No indexes on notes/JSON/nutrients. No custom composite/unique SQL hooks in v1; single-writer checks enforce one local runtime/day/key/operation mapping. Host plans used the exercise FK index, scoped version index and food-day index. Reconsider compound indexes only after native evidence and migration/index-recreation tests.

### Bootstrap, claim and schema changes

First launch with a genuinely new container commits actor → personal workspace → athlete → bootstrap batch → local runtime and receipt in one batch. Allocate IDs once per resolved domain attempt. After an uncertain result, look up its receipt before allocating anything again; a committed receipt preserves the original IDs. A hydration/read error must not seed another workspace. Existing file + missing manifest is recovery, not an empty install.

Phase 2 enrollment authenticates a server principal, requires explicit user consent to claim the local workspace, and sends an idempotent claim nonce/hash plus the proposed local identity map. The server verifies account control and that none of those IDs belongs to another principal; a duplicate/conflicting claim requires review. Only its signed/authenticated binding response changes claim status. Preserve local record/actor IDs, carry a server binding separately, and never treat posted `owner_id` as proof. Restored backups do not automatically acquire grants or a verified claim. First enrollment cannot by itself prove the human ownership of an unclaimed exported file; Phase 2 must settle device-key/recovery proof and stolen-backup threats before launch.

Native schema starts at version 1 in its own app container/name, for example `body-dashboard-native`; it is unrelated to the browser database's version 1. Wire an explicit migrations object from the first build. Each release has matching schema and ordered additive steps. New observations/columns remain optional or are backfilled from known evidence, not invented zeros. Retain shipped columns/IDs. Test upgrades from every supported shipped schema and a fresh latest install; interrupted upgrade must recover without resetting data. [Watermelon migrations](https://watermelondb.dev/docs/Advanced/Migrations).

Before opening the adapter, read a protected container manifest with database identity, engine and highest attempted schema. Mark upgrade intent before opening the newer schema; an older binary must stop instead of opening a newer file. Inspecting the native source showed reset paths for incompatible setup, so an app downgrade or missing migration cannot be delegated to a hopeful default. Maintain original files and a pre-upgrade recovery copy through a proven SQLite-consistent backup path. Manifest absence/inconsistency with an existing file blocks automatic initialization. The filesystem atomicity/adapter-open gate is native validation work, not implemented here. Never expose `unsafeResetDatabase()` as routine repair.

## 4 Commands, acknowledgments and recovery

The machine contract defines scope, operation ID, intent time, expected root revision/head and typed payloads for all Agent B mutations, including row addition, completed amendments, day/weight correction and import review. `Outcome` separates committed receipt, definite rejection and unknown result. UI components emit commands and render immutable query view models; they do not bind completion directly to a prepared Watermelon Model.

### Execution protocol

1. Validate payload shape, allowed enum/range, scope/authorization and request size before preparing model changes. Resolve parents and expected heads inside the serialized writer; do not rely on stale UI scope.
2. Build an operation key from scope + operation ID and a canonical payload hash. Return an existing matching receipt. Reusing an operation ID with a different payload is rejected. Double taps attach to one in-flight operation.
3. Persist the recoverable intent/editor checkpoint first. A valid ghost accepted in one UI action can still require two internal commits; no additional screen is added. “Intent retained” is not “Set saved”.
4. Inside one writer, recheck expected heads and prepare every atomic effect. One awaited `database.batch(...)` appends the observation/version, updates its stable head and runtime/day/timer/projection state, writes the receipt and resolves the intent. No independent per-row `.update()` sequence masquerades as a transaction.
5. Publish the receipt only after the adapter acknowledges. Queries/counts use committed heads; UI checks/haptics/timer activation follow that receipt. Late receipts cannot replace a newer editor revision. Events notify/refetch; the durable receipt/query is the authority.
6. On uncertain result, freeze mutation of the affected identities, read the durable receipt/heads through the recovery path, and either return success or retry the same intent. A timeout is not proof of rollback. Never allocate another set to fix uncertainty.

| Command | Atomic domain effects |
| --- | --- |
| StartSession | Session root + active version/exercise/set suggestions + one local active pointer + receipt. Check no other active local session. |
| EditSetDraft | Latest acknowledged raw text/editor revision; incomplete text stays outside observation columns. Old checkpoint receipts cannot overwrite newer text. |
| CompleteSet | Append completed observation, move set head, retain/resolve draft and intent, set timer deadline if applicable, increment relevant projection epoch, receipt. |
| Amend/Undo/Delete/Restore set | Append coherent new state, move same root head, update draft/count invalidation and cancel timer only when owned by the undone completion. Restoration/old edits never restart rest. |
| Finish/Discard session | Append lifecycle version; clear active pointer and cancel that session's timer; increment activity/history epochs; receipt. Failed unresolved writes must be reviewed/retried before finish. |
| Log/Amend/Delete/Restore food | Stable entry/immutable snapshot; meal-instance identity where needed; reopen affected old/new diet days and invalidate coverage/totals; receipt. A reusable meal's constituents commit together. |
| Record/Amend/Delete weigh-in | Reading root/version; invalidate earliest changed day onward and daily-primary choice if no longer valid; receipt. |
| CommitLegacyImport | Revalidated reviewed head changes + ledger/native mappings + publication gate + reconciliation + receipt, in one final batch. Staging batches are not import-success receipts. |

New set validation: all required values for its tracking type; integer positive reps except explicitly tagged zero-successful-rep Failure; finite nonnegative external/assistance magnitudes, positive duration, nonnegative distance with valid duration. New RPE is null or 1–10 in 0.5 steps. Raw invalid text is checkpointed separately. Unknown legacy types/values remain viewable with issues and raw source; they do not pass new-entry validation by pretending to be weight/reps.

**Important native risk:** preparing an update can mutate cached model state before the adapter returns; the inspected batch implementation explicitly assumes success in parts of its prepared-state handling. After native failure, do not retry using those objects or display them as persisted. Stop their subscriptions/writers and rebuild a clean database/model session against the same file, then check the receipt. There is no assumed public `close()`/rollback-cache method: the inspected adapter typings do not provide a general close API. Agent D must prove safe reinitialization and native resource cleanup, or use actual app relaunch as a conservative recovery boundary while retaining the durable intent. A seamless in-process Retry remains an engine gate until demonstrated. No raw adapter writes or private `_raw` cache patch is approved as a shortcut. [Pinned Database implementation](https://github.com/Nozbe/WatermelonDB/blob/v0.28.0/src/Database/index.js).

If even the intent/checkpoint cannot be written because storage is full, current-process editor text remains available and the last acknowledged draft survives restart. The newest unacknowledged keystrokes cannot be guaranteed after process death. Show that accurately and allow preserving/copying the pending entry; no secondary untracked database makes that guarantee true. Corruption opens a recovery screen with original files preserved, not empty seeds. Validate a recovery copy/restore separately before switching the active container.

### Timer and subscriptions

Persist a wall-clock deadline, duration, intent timestamp and source operation; add a monotonic anchor plus boot token when a supported native provider exists. While in the same boot, monotonic elapsed time protects against wall-clock adjustments. After reboot use the saved wall deadline, detect impossible differences and expose an uncertain timer instead of inventing remaining time. Native monotonic/boot-provider selection is still a spike task; JavaScript intervals/AppState alone do not provide it.

Completion-intent time is the deadline origin, even on a delayed retry. An older delayed completion must not replace a newer timer intent; compare its saved intent/monotonic ordering and retain the newer owner. If clock ordering is uncertain, expose that uncertainty. Manual StartRestTimer creates its own operation identity, so undoing an earlier set cannot cancel it. Do not schedule notifications before the local commit. Reconcile notification identifiers after relaunch; denied permission or scheduling failure does not roll back the set. Expired restored timers show ended without a stale alert burst. Timer display updates only its own view; it never triggers set/history queries each second.

Draft typing updates a local string immediately, checkpoints around 250ms idle/blur/navigation, and subscribes by row ID. The complete path does not wait for network, recompute all E1RMs or scan all history. History uses bounded pages/cursors; food picker searches local definitions; import issues are paged. Projection epochs/cache watermarks are recomputable query invalidation, not competing sync dirty flags. After a Phase 2 pull, invalidate affected projections before publishing query state.

## 5 Legacy mapping and atomic import

### Format and field mapping

| Source | Native mapping | Fidelity/issue behavior |
| --- | --- | --- |
| Unversioned `app:'body-dashboard', type:'fitness'` | `workouts`, `routines`, `programs`, `exMeta` | Do not assign it a fictional full-backup version. Retain program fields in versioned prescription/source payload even if not actionable. |
| Body/Life full backup `version:1` or `2` | Supported training keys under `data` | Read workout/routine/program/exercise metadata only. Do not import nutrition, faith/productivity modules, `activeWorkout`, settings credentials or `assets.photos`. |
| Workout `id`, name, notes, routineId/source | Stable session root + source map + version/source archive | Preserve original IDs verbatim as source data; no title/time dedup. Do not trim source notes via a text decorator. |
| `start`, `end` ISO instants | Nullable timestamps, recorded day from reviewed grouping assumption | Preserve originals; do not manufacture original timezone or set timestamps. Invalid dates remain retained issues, excluded from dated aggregates until repaired. |
| Exercise array/name/type/metadata | Separate instance at original ordinal, identity/variant/load snapshot and reviewed alias | Metadata keyed by lowercase name is evidence, not proof of identity. Unknown tracking type remains `legacy_unknown` plus raw value. |
| `ss:true` | Link exercise i to i+1, transitively forming a group | Preserve order; a trailing dangling link is an issue, not a link to another session. |
| Set array/type | Stable set root + initial source observation | `normal`→working, `warmup`→warmup, drop/failure retained; preserve unknown type text. Original nested IDs, when present, are retained in mappings. |
| `weight`, `reps`, `duration`, `distance`, `rpe` | kg, integer/known source reps, seconds, **meters = legacy km × 1000**, nullable RPE | No display-unit rounding. Missing and zero stay distinct. Retain unusual/invalid source numerics in raw payload and show issues; do not silently coerce them into native-valid observations. |
| Cached `pr`, unknown training fields | Local raw training archive/source annotation | Not authoritative current PRs. Preserve URLs/text as data; no remote fetch or execution during import. |
| Routine `sets` count, reps/rest targets | Immutable plan snapshots | Counts/targets are suggestions, not completed sets. Routine edits never rewrite imported sessions. |

**Source nuance verified in the current tree:** `awFinish` includes checked sets with data **or full-data rows**, and `editSave` retains any-data rows while stripping `id`/`done`. The export cannot prove that every historical set was explicitly checked. Mark source entries “Recorded in legacy history; explicit acceptance unavailable”. Preserve them as legacy-recorded observations, not new user-confirmed actions. Do not retroactively discard history to enforce the native ghost policy, invent per-set completion instants, or restore the old `activeWorkout` as completed history.

### Identity, hash and review

Create one athlete-scoped import source namespace per logical legacy dataset. First file review names it; repeat imports propose the matching source, and subsequent exports choose that existing source. Do not derive namespace from file export time or blindly from `app`: Body and Life copies can share ancestry/IDs. A different device/dataset can legitimately use the same original workout ID. ID overlap can suggest lineage but cannot silently select it.

Identity key: SHA-256 of a typed canonical tuple `[sourceNamespace, entityKind, originalWorkoutId, nestedPath, generation]`; preserve scalar ID type. Initial nested path is ordered `exercise/0/set/0`, never just the exercise name. Keys are deterministic mapping identities; a stored mapping assigns/reuses a generated native ID. Hash collision or contradictory existing mapping is a hard review error.

Sessions and routines also retain optional indexed `legacy_key` plus coherent `legacy_provenance_json` on their synced roots. These carry source namespace/ID, accepted content and head digests without exposing a second mutation queue. A second device can recognize existing roots after pull even though detailed import ledgers remain local. Phase 2 enforces source-key uniqueness within the athlete on the server; competing independently imported roots require explicit duplicate reconciliation, not silent ID replacement. Reconstructing ambiguous nested mappings still requires review.

Canonical content hash sorts object keys, preserves array order, all supported/unknown training fields and exact strings/null/zero distinctions, excludes only the export envelope's timestamp. Preserve the original training JSON alongside the canonical representation. Do not round numbers, normalize note whitespace or discard cached source annotations before conflict detection. Reject/quarantine unsupported numeric precision rather than silently truncating it.

Exact identity + accepted content + unchanged native heads is a duplicate. Same accepted source content after native edits skips reapplication and discloses the local edits; it must not restore old values. Changed source content, changed local heads or new mapping assumptions enter review. Keep current is default; Use source appends versions after explicit comparison/revalidation. A missing source workout on a later export is not a deletion request.

No-ID workouts cannot be confidently matched across reordered/changed exports. Keep an exact-file/training-fingerprint ledger and source ordinal; ask for mapping or retain as an identity issue before treating another file as the same record. For changed nested graphs lacking IDs, offer reviewed positional matching or explicit graph replacement. Preserve the session root; retain old nested rows/revisions and use a new deterministic generation for ambiguous replacement. Do not silently assign an old set identity to a different reordered exercise. Records with explicit nested IDs retain them in mappings, subject to collision checks.

### Staging, publication and restart

1. Native document picker selects a local file. Initial proposed limits: 80MiB file, depth 32, two million JSON nodes; these are guardrails to verify with actual native memory, not measured capacities. Oversized full-photo backups receive guidance to export fitness JSON. No upload. Reject prototype-pollution keys from interpretation and retain affected raw training records as issues. Never interpret a filename, MIME or app label as validation.
2. Inspect and extract only training data into protected app-owned staging/ledger records. A full backup's unrelated modules/photos are not kept in the training archive. A document-picker cache URI is not durable file access: retain the validated training chunks, or request the same file and verify its hash after restart. No fabricated progress percentages. [DocumentPicker cache behavior](https://docs.expo.dev/versions/latest/sdk/document-picker/).
3. Persist job choices, assumptions, expected native heads and source counts. Stage in small yielding batches, initially at most 200 prepared rows or a single bounded workout chunk; remeasure native duration/memory. Native parser/work scheduling must keep the active logging path responsive; whole-file `JSON.parse` on the gym UI thread is not an accepted large-import solution. The parser strategy remains a native spike task.
4. New domain graphs and immutable candidate versions reference an uncommitted publication batch. Existing public roots keep their old heads; changed existing metadata is stored in proposals until finalization. Ordinary reads, direct detail lookup and analytics must all apply visibility. Resume uses the ledger's mapped IDs, not newly generated duplicates.
5. Revalidate source identity, choices and every affected current head inside the final writer. Apply the reviewed head/metadata/mapping changes, mark the publication batch committed, store exact reconciliation and receipt together in one batch. Only then display Import complete. New-set volume is staged already; final work is gate + changed existing roots/metadata/mappings, not a second insertion of all new sets.
6. If many existing heads change, final work can still be large. Measure it. Do not silently split the final commit into independently visible batches. Require an explicit maintenance/finalizing interval outside active set entry if the measured cost exceeds the logging budget; that restriction needs product review. Until tested, arbitrary-size imports are not promised.
7. Failed or interrupted publication leaves old heads/gate intact or a committed receipt, never a guessed midpoint. Reconcile on launch before retry. Cancel only while safe; abandoned unpublished rows are cleaned only after confirming they were never published/synced. Keep quarantined training payload and reasons available for repair.

Reconciliation invariant: `source workouts = added + updated + skipped + quarantined`. Show reason subtotals for duplicates/user exclusions, plus added sets, source sets in updated workouts and net set-count change. Do not call all updated sets “added”. The Agent B example remains 100 added + 1 updated + 17 skipped + 2 retained issues = 120 source workouts.

Phase 2 synchronization pauses while a nonterminal import stages domain rows. Watermelon fetches and acknowledges its database changes as a unit; filtering out temporarily staged domain rows and then acknowledging the rest could lose their future push. Resume sync only after publication or safe cancellation cleanup. Permanent local-only tables may be excluded intentionally because they are never server domain data; this is different from temporarily suppressing dirty domain rows.

## 6 Analytics and reporting contracts

All calculations are pure functions over validated snapshots, with algorithm/eligibility versions and an explicit `throughDay`. Display conversion/rounding happens last. Raw historical values remain authoritative.

### E1RM and comparison

`epley-v1(load,reps) = load` for one rep; otherwise `load × (1 + reps/30)`.

Eligibility `working-external-1to10-v1`: current committed head is completed, not deleted/undone; its parent exercise is in the current nonremoved graph and all visibility checks pass; working kind; `weight_reps`; known positive external load and integer reps 1–10; known comparable load basis; session is completed through the reporting day for historical progress. Warm-up/drop/failure/unknown kinds do not qualify under this initial strict policy; they remain in the log and appropriate non-warm-up set counts. This is a product estimate policy, not a validated physiological accuracy range.

Compare the best eligible set in a session with the best estimate in the preceding completed comparable session: same canonical exercise, variant, equipment, load basis and algorithm/eligibility versions. Per-hand and total-pair estimates cannot mix. Added-bodyweight/assistance and cardio require separate models; initial E1RM is unavailable for them. Never use a future weigh-in to fill historical body mass.

`delta = current - baseline`; `percent = 100 × delta / baseline` only with positive baseline. No eligible set → no estimate. No comparable baseline → raw best set/estimate without delta; no fake zero baseline. Source ordering is recorded day + known start instant; ties with missing ordering evidence cannot claim a preceding session merely by alphabetic label. Active-session estimates may be labeled provisional current-session context; they are not completed-workout activity.

Examples verified by the vector runner: 80×1→80; 80×5→93.333333…; 82.5×5→96.25; delta 2.916666… and 3.125%. Unknown load, zero, 11 reps, warm-up, undone, unknown convention and weighted-bodyweight examples return no eligible basic estimate. Bodyweight model expansion requires explicit product review rather than quietly changing the same chart.

Backdating, deletion, head/alias/convention changes invalidate the affected exercise timeline from the earliest changed ordering point, including successor baselines. Cached imported PRs remain source annotations. A method version change invalidates caches, not raw sets.

### Monday weeks

Use one shared query in every current summary: completed session head, recorded day within this reporting timezone's Monday–Sunday interval, `day <= today`, and at least one committed performed/legacy-recorded set in the current nonremoved exercise graph with usable activity evidence. Active/discarded/empty/future records do not count. Ambiguous source dates/types remain visible in History with an excluded/review qualifier. The empty-session exclusion is Agent B's proposed policy, explicitly carried for product review.

Persist the recorded local day and timezone provenance. Travel changes the current reporting-week context, not the stored original day. An explicit historical date correction updates its week after commit. A future completed record is labeled Future date and excluded from through-today summaries/estimates. The vector fixture for Nov 7 counts Monday/Saturday, excluding Sunday-future, active, empty and prior-week examples.

### EWMA and sparse histories

Version `ewma-half-life7-v1`: select the explicit valid primary reading per recorded local day; otherwise latest known measured instant that day, with stable ID as a deterministic tie-breaker. A stale primary reference after moving/deleting a reading requires review; disclose use of a valid fallback. Preserve every raw measurement/revision. Filter future dates before calculating today's summary.

Sort representatives chronologically. Seed with the first valid representative. For later observations, use calendar-date ordinals (not elapsed hours across DST): `d = ordinal(day_i) - ordinal(day_previous)`, `alpha = 1 - 2^(-d/7)`, `trend_i = alpha × weight_i + (1-alpha) × trend_previous`. One representative per day ensures d>0; never apply alpha=0 to silently discard another same-day reading. The recurrence is a statistical smoother; first-reading seed, seven-day half-life and irregular-gap policy are Body Dashboard decisions. [NIST recurrence](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc324.htm).

No missing-day rows, zero-fill or interpolated weigh-ins. Empty → no point; single → seed only, no change claim. Show actual observation dates/gaps, latest date, units and a text summary. Future records stay in history. Long gaps update at the next real observation; graphical continuity is not a daily measurement assertion. The legacy trailing seven-calendar-day average retains its original method label/source provenance.

Verified vectors cover two readings seven days apart (82→80 gives 81), a 28-day gap (80→84 gives 83.75), explicit primary versus last reading, out-of-order input, earlier edit, middle deletion, future cutoff, pounds-to-kg seed and a DST calendar-day boundary. Use `1 lb = 0.45359237 kg`; legacy km→m conversion is performed once. Recompute from the nearest valid prefix before the earliest affected day, or fully if no verified prefix exists; never reuse a cache with a mismatched method/source watermark.

### Diet and subjective observations

Consumption revisions store quantity/unit/basis plus nullable energy/P/C/F values for the consumed quantity, already scaled once. Rendering totals does not multiply those snapshot values again. `known total = sum(known contributors)` and `unknown count = count(null contributors)` independently per nutrient. A known zero participates; a null does not. Remaining is Unknown when its target or contributors are unknown. Source calories are not replaced with 4/4/9-derived energy. Saved definition changes affect future entries; correcting an entry appends its own version only.

Day coverage is a versioned JSON declaration including explicit completion, intentional zero-entry coverage and a digest of current entry-head IDs. Effective Complete requires that digest still matches. Local entry changes atomically reopen affected days. The digest check prevents a stale Phase 2 completion declaration from labeling newer consumption complete after a merge. Complete can still have unknown nutrients. Multi-day complete-only averaging and the seven-day freshness label remain proposed product policies, not nutritional advice.

Set RPE belongs to its immutable set observation; saving set-level RPE appends an amendment rather than also writing a second RPE fact elsewhere. Session/exercise RPE and joint context use `subjective_observations`; corrections/retractions append superseding rows. Joint severity is nullable and names its user-facing scale if provided; no default none, copied prior report, readiness inference or diagnosis.

## 7 Phase 2 synchronization and coaching security

There is no production sync in MVP. Keep Watermelon's generated `_status`/`_changed`, standard synchronize flow and schema/migration negotiation. Local intents are for acknowledged-operation recovery; projection watermarks are for derived data. Neither replaces native sync tracking. Watermelon requires our own backend. [Sync introduction](https://watermelondb.dev/docs/Sync/Intro).

Transport types are in the contract. An authenticated enrollment binds a database replica, principal, stable scope set and access epoch. Initial pull uses null `lastPulledAt` and returns all authorized data; local enrollment reconciles the claimed local IDs before pushing. Never upload unrelated cached clients or replace IDs to solve enrollment.

Use a server-generated monotonically increasing integer commit cursor in the protocol timestamp slot, never a client clock. Pull reads a consistent snapshot of all authorized changes through cursor H, returning H. Serialize/reserve commit sequence allocation with publication so an older reserved cursor cannot commit after H and be missed. Cursors are bound server-side to enrollment/access epoch. On an epoch change, stale scope snapshots are rejected and the authorized replica transition is reconciled explicitly; ordinary filtered incremental pulls cannot safely remove old grants by themselves.

Push includes the standard changes and last-pull cursor plus an application wrapper's request ID/hash. Authenticate independently; authorize every record, parent, head reference, delete and original scope using server state. Client-provided scope/grant columns are not authority. Apply the full accepted push transactionally, with request-ID replay returning the same result and payload mismatch rejected. Conflict/newer-server writes since last pull abort the push for pull/retry; do not silently accept half. Preserve server tombstones/change log until all valid replicas have advanced, or require a reconciled re-enrollment when retention expires. Initial schema migration pulls include the new tables/columns required by the protocol. [Backend protocol](https://watermelondb.dev/docs/Sync/Backend).

### Conflict behavior without unsupported resolver promises

Watermelon's default is per-column local-wins for locally changed columns, not last-device-clock-wins. A load from one edit combined with reps from another can be a misleading result. This proposal puts observed tuples in immutable rows and changes one stable root head pointer. Both branches sync; default head selection gives a provisional current branch without synthesizing a tuple. Detect sibling/divergent observation ancestry and expose both for explicit review. Resolve by appending a new attributed observation referencing the reviewed history; never destroy the losing branch. [Default algorithm](https://watermelondb.dev/docs/Implementation/SyncImpl), [pinned conflict helper](https://github.com/Nozbe/WatermelonDB/blob/v0.28.0/src/sync/impl/helpers.js).

The pinned source exposes an advanced `conflictResolver`, but it is not a durable review queue or an async writer. No custom resolver is needed or claimed proven here. Derive review work after pull from immutable branches; parent-chain validation and immutable-payload checks are server responsibilities. Same-ID immutable content changes are rejected. The source also has experimental strategies; replacement sync/partial-rejection behavior is not silently enabled. [Pinned sync interface](https://github.com/Nozbe/WatermelonDB/blob/v0.28.0/src/sync/index.js).

Root structural conflicts (exercise reorder/group changes, competing active sessions) are retained/reviewed separately; a local one-active-session rule cannot prevent two offline devices starting independently. A server can flag and reconcile that case, not erase either session. No account/coach feature should be announced until those contracts and tests exist.

### Prescriptions, access, revocation and sign-out

Athlete observations remain in the athlete's personal workspace. Coach program/target assignments are versioned prescriptions referencing those athlete identities, with author/grant/assignment provenance; they never replace performed sets. Phase 2 may add assignment/comment/proposal tables through additive migrations. A coach template yields an athlete-scoped prescription snapshot with an attributed source reference; it does not create unchecked cross-scope exercise/observation links. Default coach capability is view/assign/comment; correction requires a separate explicit grant and attribution. Local athlete IDs and existing record IDs remain stable.

Server grants authorize specific capabilities, athlete/workspace and principal; guessed IDs and cross-parent links fail even when the child claims an allowed athlete. Apply the same policy to API, sync, exports, media references and aggregate coaching queries. Export access is not inferred from a UI filter. Test two unrelated coaches/clients and crafted payloads. Personal Phase 1 has no coaching selector; identity fields alone are not secure multi-tenancy.

Revocation denies server access immediately but cannot erase an offline copy instantly. Proposed Phase 2 coach access lease: no offline coach portal in the initial personal build; later coach caches need an explicit bounded lease/lock/purge policy before release. On reconnection or principal switch, block the old coach view, purge revoked read-only caches through a tested transition, and rotate replica/access epoch. Do not apply deletion tombstones that destroy unsynced athlete-owned observations to simulate cache eviction.

Use a separate replica/container per authenticated account role/enrollment where scopes differ; this separates authorized replicas, not a second local copy of the same Phase 1 domain in expo-sqlite. Sign-out removes credentials and hides server-authorized views, cancels network work and detaches subscriptions. Preserve the user's unsynced athlete data in its original local container with an explicit recovery/export path; never silently reset it. A new account cannot see it without an explicit verified claim. Sign-out/purge/enrollment protocols and tombstone retention durations require Phase 2 implementation/security review.

## 8 Privacy, files and portable recovery

The inspected Watermelon podspec links SQLite, not a verified SQLCipher integration. No database-level encryption claim is made. Apple's Foundation supports file protection classes; propose complete protection for the native database directory, staging and archives, then verify attributes for database/WAL/SHM and behavior while locked on device. Lock-denied storage is a recoverable state, not corruption. If background access requires a weaker class, decide it explicitly; rest notifications must not require reading health data while locked. [Pinned linkage](https://github.com/Nozbe/WatermelonDB/blob/v0.28.0/WatermelonDB.podspec), [Apple file protection](https://developer.apple.com/documentation/foundation/fileprotectiontype).

App-private file paths, backup exposure and protection defaults are **not verified on an iPhone** here. A reviewed native helper/configuration may be needed to set/read attributes; no invented Expo setting is promised. Keep data out of shared app groups/iCloud containers by default. OS device backup can still include app data according to actual platform settings; document observed behavior rather than promise exclusion.

Later credentials/API keys belong in SecureStore/Keychain, never source, database exports, import payloads or telemetry. SecureStore is for small secrets, not irreplaceable health records; its documented persistence/uninstall/biometric behavior must be handled. No user credentials were read or configured. [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).

Native portable format is `app:'body-dashboard-native', formatVersion:1`, schema/algorithm metadata, stable IDs, typed tables, source mappings and an asset manifest of logical ID/path/MIME/SHA-256. It is not automatically readable by the old web app. Preserve source IDs, canonical units and original photo links; where locally owned photo files exist, include actual bytes and verify hashes on restore. No new image service. Workout-only legacy import does not imply photo/nutrition migration.

Create a consistent export through a serialized read/snapshot boundary; never copy a live SQLite file without its transactional state/WAL. Stream large exports while retaining a fixed logical snapshot or briefly suspend mutations with an explicit Exporting state. Exclude credentials, verified grants/claim authority, internal `_status`/`_changed`, temporary uncommitted imports and foreign scopes. Retain acknowledged unresolved user intents/drafts as recovery data. Schema/row/asset size limits, traversal-safe paths and source hashes are validated on restore. The manifest checksum excludes its own hash field and detects corruption, not authenticity. The proposed portable JSON/archive is readable unless a separately reviewed authenticated-encryption format is added; no encrypted-export claim is made.

Restore into a new app-owned container, preserving domain IDs and cross-references through an isolated restore importer. Watermelon supports raw-ID import paths internally for synchronization, but the restore implementation must pin/test the chosen supported boundary and let Watermelon initialize tracking; do not scatter `_raw` assignments through UI code. Validate counts/units/nulls, root/head ownership, draft/receipt reconciliation and every asset hash before an atomic container-manifest switch. Keep the prior container until verification/rollback completes. Reset authentication/grants to unverified, not the user's record IDs. This restore path is an MVP release gate, not implemented in Sprint 1 or this stage.

Telemetry is off for record content by default. Diagnostic events may contain error class, operation timing/counts and software versions, with no food text, exercise notes, measurements, file contents or credentials. Source retention is local/user-controlled; raw training archives are included only in the user's own authorized portability flow. A corrupt database is preserved, copied consistently if possible and inspected without an automatic wipe. Low storage shows retained/not-saved state, retry and export/recovery options; no false success or silent collection replacement.

## 9 Actual validation and benchmark evidence

| Check | Actual result and limit |
| --- | --- |
| Strict TypeScript 6.0.3 compilation | Passed for `C_DOMAIN_CONTRACTS.ts`; no native library compilation implied. |
| Machine contract/arithmetic smoke | Passed: 41 tables/560 columns, 55 explicit relationships, nullable-observation checks, 12 E1RM and 11 EWMA cases, week/unknown/identity arithmetic. Reference fixture evaluators, not production analytics tests. |
| Host SQLite rehearsal | Passed on Python 3.9.6 / SQLite 3.54.0 / macOS arm64, file database, WAL/FULL. Scoped SQL/read/write checks, rollback, additive SQL migration/null-zero storage, publication gate, committed/pre-commit SIGKILL and integrity check `ok`. Not Watermelon/cache/authorization proof. |
| Existing repository check | `npm run check` passed: two scripts parse, 305 functions without duplicates, action handlers/collisions/local dependencies and 51 numeric keypads pass. `git diff --check` also passed. No runtime dependency changes required. |
| Native build, JSI, app restart, low storage, VoiceOver, keyboard and file protection | Not run: full Xcode/simulator toolchain unavailable. Native engine compatibility remains conditional. |

The host workload seeds **100,000 set identities, 100,000 initial observations, 5,000 sessions and 10,000 food entries for one athlete**, plus one foreign set for negative checks. Later rehearsal revisions/import fixture rows are additional, not erased to preserve a round count. Twenty-five warmups precede 300 measured samples per operation. Timings include Python/SQL work, not React rendering, Watermelon, Hermes or iPhone storage. Exact values/environment/query plans are in `C_HOST_VALIDATION.json`; the diet query must return actual rows (32 in this run), not benchmark an empty day.


Host-only measurements from the saved final run:

| Operation | Rows | Samples | p50 ms | p95 ms |
| --- | --- | --- | --- | --- |
| Read current exercise | 20 | 300 | 0.0337 | 0.0362 |
| Read history page | 50 | 300 | 3.9336 | 4.2183 |
| Read populated diet day | 32 | 300 | 0.045 | 0.0507 |
| Intent + observation/head/receipt commits | mutation | 300 | 0.2504 | 1.3769 |

These are a single warm-filesystem host run, with no UI or native-adapter measurement.

The host result can identify a pathological query, but cannot satisfy the PRD's p95 UI ≤50ms or commit ≤150ms. In particular, history pagination currently uses a scoped scan/sort over version candidates: measure its growth with long revision histories before adding an index or cache. Intent+observation timing covers two SQL commits in the harness; real commands also need scope/validation/timer/epoch work. No zero-latency claim is supported.

For native acceptance, run on the chosen physical reference iPhone in Release-like mode with both fresh and realistically revised/imported datasets. Measure 1,000 completions/amendments after warmup: input-event→visible editing feedback and command intent→durable receipt→render separately. Record p50/p95/p99, sample count, device/iOS/build/storage conditions and correctness failures. Include cold launch and background/termination variants separately. Set query/import budgets after that baseline; do not substitute host microseconds.

## 10 Dependency-ordered Sprint 1 handoff

Running Agent D still needs the user's implementation instruction; it was not run here. Its exact [Sprint 1 prompt](../PROMPT_D_DEV_TEAM_SPRINT_1.md) remains the execution brief. Do these dependencies in order:

| Order | Task | Required evidence before proceeding |
| --- | --- | --- |
| 1 | Complete isolated native compatibility probe | Real adapter build/open/query/relaunch + versions/locks/config; resolve hot-failure recovery and downgrade guard. If failed, engine comparison/review first. |
| 2 | Create isolated `mobile/` with approved pins/config | Reproducible native dev build; app bundle/container clearly distinct from old web/Life storage. |
| 3 | Generate schema/models and migration/bootstrap guard | Full declared schema, explicit nulls, scoped associations, local identity, upgrade/fresh-install/rollback tests. No data-reset recovery. |
| 4 | Implement command journal and workout core | Start, draft, Complete, amend/undo, finish/discard, receipts and row subscriptions; negative scope/parent tests; no duplicate acknowledgment. |
| 5 | Implement Agent B matrix and timer | One-action ghost acceptance, keyboard/stacked layout, timer deadline restoration; optional feedback outside required path. |
| 6 | Minimal history and fitness-JSON import slice | Source mapping, preview/conflicts/quarantine/repeated import and atomic publication; no unsupported-type data loss. Full backup-envelope/large-file coverage can follow this small slice. |
| 7 | Extract analytics functions and measure | Run vector fixtures through actual TypeScript implementations, invalidation/backdating tests and physical-device latency. |
| 8 | Produce Agent D report/demo | Start → accept/edit → undo → timer → fail/retry → terminate/relaunch → finish → history → import twice. Label every remaining MVP gap. |

Do not fill Diet/Progress/coach tabs with placeholder implementations to enlarge Sprint 1. Diet, complete migration coverage, analytics and portable restoration are subsequent MVP requirements with contracts already defined. No calendar estimate is justified before the native compatibility failure/recovery work is sized.

### Exact current checks

From repository root, Node 24+ and Python 3.9+:

```sh
node docs/mobile-rebuild/outputs/C_VERIFY_CONTRACTS.mjs
python3 docs/mobile-rebuild/outputs/C_HOST_SQLITE_CHECK.py
npm run check
git diff --check
```

Strict contract compilation was actually run using an isolated TypeScript 6.0.3 compiler. A reproducible equivalent, with the compiler downloaded by npm rather than changing root dependencies:

```sh
npm exec --yes --package=typescript@6.0.3 -- tsc --strict --noEmit --skipLibCheck --target ES2022 --module ESNext --lib ES2022 docs/mobile-rebuild/outputs/C_DOMAIN_CONTRACTS.ts
```

Native build/relaunch commands are in the compatibility report. For the future `mobile/` project, Agent D must define scripts named `typecheck`, `lint`, `test:domain` and `test:db:ios`; they do not exist yet. After implementation, run those scripts plus the actual native UI runner selected for the build; never report a command to a nonexistent test harness as a test result.

Required native test cases:

- `complete_retry_same_operation_once`: inject failure, preserve input/intent, rebuild clean model session, retry same ID, terminate/relaunch, exactly one completed observation/head and receipt.
- `termination_each_ack_boundary`: after draft/intent/complete/finish receipts, before acknowledgment and during uncertain result; restored state matches durable receipt, including correct active pointer.
- `scope_and_parent_denial`: foreign and mixed workspace/athlete reads, writes, IDs, head/parent links, import mappings and exports all fail without mutation; test database-level changes cannot self-authorize server grants in Phase 2.
- `import_atomic_and_idempotent`: staged/commit termination, failure, exact repeat, changed source plus native edit, duplicate source IDs, repeated exercise blocks, no nested IDs/reorder, all seven tracking types, timezone/unit ambiguity and reconciliation.
- `migration_preserves_identity`: previous native build→latest without uninstall, fresh latest parity, interrupted upgrade, newer-file/older-binary refusal; no automatic reset.
- `analytics_edit_invalidation`: future cutoff, deleted/undone sets, no baseline, incompatible basis, earlier weight edits/multiple primaries/gaps, raw snapshot preservation.
- `timer_keyboard_accessibility`: 390pt and approved smallest device, both themes, enlarged Dynamic Type, VoiceOver reading/actions/focus, 44pt targets, decimal locale, notification denied, suspension/reboot/clock change and no control overlap.
- `portable_restore_assets` (later MVP gate): typed IDs/units/nulls, pending recovery data, photo bytes/links and hash reconciliation into an isolated container; credentials/grants never restored as authority.

## 11 Final status and product judgments

Verified: exact handoff inputs obtained; current metadata/pinned sources inspected; machine contract typechecked; synthetic arithmetic and host SQL checks passed. Proposed: physical schema/domain/sync design, candidate native pins and migration/import/security behavior. Unverified: all native integration, durability, device accessibility and latency gates.

Product/team-lead judgments remain: confirm versioned-observation storage cost after native measurement; approve any maintenance interval needed for large changed-source imports; select actual supported device/iOS floor and food-provider timing; review Agent B's density, empty-session count, complete-day report and subjective-feedback defaults. Coach permissions, cache leases and retention require Phase 2 review. No decision here silently enables sync, AI logging or a new image service.

**Handoff readiness:** Agent D can begin the isolated compatibility work when instructed; broad native implementation must wait for a proven engine/recovery path. This Agent C run did not deploy, connect accounts, process personal exports or run Agent D.
