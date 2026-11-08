# Body Dashboard — web-first execution plan

November 7, 2026 · Active platform decision · Read with the [current PRD](MASTER_PRD.md) and [Agent D prompt](PROMPT_D_DEV_TEAM_SPRINT_1.md).

Build on the existing app and publish a tested personal-use release to GitHub Pages when requested. The site is static; health records remain in the user's browser. This plan does not execute implementation, publish anything or migrate personal records.

## 1 What changes from A–C

| Earlier proposal | Active web route |
| --- | --- |
| Expo/React Native, `mobile/`, SQLite/Watermelon | Existing vanilla JS/HTML/CSS, IndexedDB and Store; no new app/database engine. |
| Xcode/CocoaPods/native compatibility gate | Browser write/retry/restart + hosted offline shell + WebKit/iPhone gate. Stop native installation work. |
| Four new Train/Diet/Progress/History tabs | Retain existing Dashboard/Workouts/Nutrition/Recipes views and preferences. Apply active-session priority inside familiar paths. |
| Native matrix/keyboard components | Semantic HTML fields/actions, `inputmode`, stable focus/selection, stacked rows when needed and keyboard-safe layout. No custom OS keyboard promise. |
| C's normalized 41-table physical schema | Retain collection/record shapes and database version 1. Optional metadata in existing stores; no mass migration. |
| Native observation versions and command receipts | Reuse the semantics; design small optional browser operation/import metadata. No replacement of stored workout identities. |
| Native process-death/notification guarantees | Real browser termination/reload tests and deadline restoration. Background timers/alarms are best-effort and not acceptance promises. |
| Native export format | Preserve current v1/v2 backup compatibility and photo restoration; new metadata extension is optional/backward-compatible. |
| Native device-local ownership | Optional local profile/scope metadata and command boundaries; server-enforced coaching remains future work. |

Keep A's friction findings and B's suggestion/draft/pending/committed/error semantics, optional feedback and readable density. Keep C's source identity, idempotency, null/zero, snapshot and analytics invariants. Native API/component/engine instructions and host benchmark numbers do not apply to the web release.

## 2 Verified starting point and unresolved gaps

Source inspected in the current working tree:

- `index.html`: IndexedDB `body-dashboard` version 1; `kv`, `photos`, `local`; serial snapshot draining; transaction-complete write acknowledgment; paired workout history/active writes; retry/export UI.
- `sw.js` and `manifest.webmanifest`: existing relative-path offline shell and Home Screen manifest. Service worker currently installs with `skipWaiting`/claims clients and fetches fresh assets; update safety must be evaluated before relying on it during an active workout.
- `fitJsonExport`: unversioned fitness JSON export exists. The full-backup validator expects a v1/v2 envelope, so export existence does not prove fitness JSON import support.
- `planBackupImport`/`commitBackupImport`: current full-backup and photo restoration paths. Preserve these; workout-only import needs its own scoped preview/commit behavior.
- [Refresh validation](../REFRESH_VALIDATION.md) records a prior Chromium run, not this task's new iPhone acceptance. It explicitly identifies in-memory pending recovery, degraded localStorage atomicity and separate photo/reference writes.

Main gaps for Agent D: acknowledged pending-entry recovery across closure, explicit-only new set completion, true fitness JSON re-import/conflicts, safe hosted updates, WebKit coverage and physical Home Screen/VoiceOver evidence. Do not relabel those as solved by the planning packet.

## 3 Persistence design gate

Before changing logging UX, document the narrow web persistence contract in `outputs/D_WEB_PERSISTENCE_CONTRACT.md` and prove it with real IndexedDB tests. Keep all application functions in `index.html`, following the existing action tables. No runtime framework/type-system prerequisite.

Proposed metadata location: versioned keys such as `bd.web.meta`, `bd.web.intent.<operationId>`, `bd.web.receipt.<operationId>` and `bd.web.import.<jobId>` in Body Dashboard's existing **local object store**. These are reserved proposals, not implemented fields. Audit current LocalDb/sync key usage first. Never clear the whole local store or change its existing base-copy keys. New COLLECTIONS keys, if needed, require defaults and an additive compatibility explanation.

Required contract:

1. Keep raw current editor text separate from committed values. A debounced draft checkpoint may contain incomplete numeric text; it never increments completed metrics.
2. Use one coordinated Store writer for old debounced writes and new commands. Prevent a late old snapshot from overwriting an acknowledged command. No second independent write pipeline.
3. Persist a recoverable intent/checkpoint, then apply canonical mutation + receipt + intent resolution in one readwrite transaction over `kv`/`local` where needed. Success is transaction completion, not one request's success or an in-memory mutation. Validate/prepare outside the active transaction; avoid unrelated asynchronous work that lets an IndexedDB transaction become inactive.
4. Each operation has scope, stable operation ID, expected revision/content digest and payload hash. Matching receipt returns the existing result. Same ID/different payload is rejected. Uncertain outcome checks the receipt before replay or allocating IDs.
5. On failure, preserve the editor and last acknowledged state, expose Retry, and do not publish a completed checkbox/count/timer or success toast. If the intent was acknowledged, reload restores it; if every write fails, the newest text is recoverable only while the tab remains open or after an explicit export. State that limit honestly.
6. Read persisted revisions/digests in the committing transaction to detect concurrent updated tabs. Resolve stale edits rather than letting two whole-collection snapshots silently overwrite each other. Default personal use remains one active workout/profile, without multi-client UI.
7. localStorage fallback must retain records and offer export/retry, with a visible degraded-storage state. It cannot claim multi-key atomicity or photo storage. Do not silently copy data from an unreadable IndexedDB into an apparently empty fallback or seed over a read failure.
8. Startup reconciles acknowledged intents/receipts before rendering authoritative counts. Failures stop hydration with recovery options; absence and read error are different.

Keep IDs on all existing records. New set/instance IDs may be optional additions; old nested rows without them use auxiliary deterministic identity. If new history retains nested IDs, update finish/edit/export paths consistently rather than stripping them. A retry does not create another workout.

The new bulk workout-import flow requires working IndexedDB for its atomic guarantee. If unavailable, retain the source file/current records and explain how to restore storage availability; do not perform a partial multi-key import in fallback mode. Preserve and accurately describe existing fallback behavior in other flows.

Protect newly added metadata in exports through an allowlisted optional extension (candidate: `extensions.bdWeb`, versioned), retaining the current backup version/envelope where compatible. Test current backups, new backups and older-reader behavior. Do not dump the entire local object store, credentials or sync base. If compatibility cannot be maintained, stop and present a concrete versioned alternative before shipping, rather than silently changing format.

Restored pending intents are recovery data, not permission to overwrite a different restored snapshot. Validate their owner/target IDs and expected revisions; incompatible intents stay available for review/export instead of automatic replay.

## 4 iPhone workout workflow

Preserve current navigation, quick add, Today, existing diet/recipes and card/tab preferences. An active-session Resume action remains easy to reach; no obligatory new dashboard.

- Previous values name their date and exercise/load context. Suggestions are placeholders, never saved observations merely because the row is populated.
- Accept valid suggested load/reps with one completion action. Keep edited text responsive; show pending until commit, then checked/saved. Finish includes only explicitly accepted **new** observations. Do not retroactively reinterpret existing completed history.
- Correct a committed set through an explicit save; uncheck/undo retains values as a draft. Double taps reuse intent. A delayed receipt never erases a newer draft.
- Preserve warm-up/drop/failure tags, supersets and all seven historical types. RPE/joint inputs remain optional; previous feedback is not copied. Unknown legacy type/basis remains readable with provenance.
- Use native HTML controls and decimal/integer `inputmode`. Preserve caret and next-field focus; do not rely on a particular Safari keyboard Return key. Avoid custom keypads or an overlay that covers entry/completion.
- Reference width 390 CSS px with 16px margins and 44px targets. Compact geometry from B is conditional, not a mandate to squeeze columns. Use stacked rows at 375px, enlarged text or measured clipping. Keep browser zoom enabled; text and safe-area controls remain scrollable/reachable.
- Use web headings/labels, checked/busy state and restrained live status announcements. No native React accessibility props. Announce save failure/completion once; do not read timer ticks continuously.

Timer: store deadline + source operation in the appropriate acknowledged transaction; starting from completion intent avoids granting a fresh interval after a slow retry. Undo cancels only its owned timer. Manual timer actions have their own identity. On resume derive remaining time from deadline; no replay of interval ticks. Clock changes/uncertainty require a truthful state. Do not guarantee execution or alerts while Safari/Home Screen is suspended; notification denial never blocks logging.

## 5 History import and preservation

Implement **Import workout history** as a separate operation from full backup restoration. Browser file input/File APIs read locally. Support fitness JSON and training-only extraction from Body/Life full backups v1/v2; unrelated Life data/settings/photos do not enter this flow.

Preview shows source/format, date interval, original IDs, known kg/km/seconds source conventions, display units, assumed timezone, counts, duplicates, changed records and quarantine. Source units in recognized Body JSON are not an editable display-preference guess.

Identity rules: preserve original workout IDs; use explicit source lineage + original IDs + typed canonical hashes. Repeated export time is not a new dataset. Same title/date is not identity. Missing nested IDs use position-based mappings scoped to the source/workout; repeated blocks stay distinct. Changed/reordered no-ID graphs require reviewed mapping/replacement with retained prior source. Colliding original IDs from unrelated datasets cannot be overwritten automatically; keep them as explicit unresolved issues or define a reviewed mapping preserving original IDs separately.

Default is skip identical / keep current on conflicts. Changed source or intervening local edit must be reviewed; source absence is not a deletion. Preserve timestamps/notes/RPE/types/unknown training fields and source precision. No invented timezone or per-set completion evidence. Valid unknown conventions limit analytics, not preservation.

Parsing, validation and hashes finish before opening the final transaction. For large files, stage validated training chunks/choices in private metadata, yield during preparation and measure memory. Canonical history stays unchanged until one final atomic commit of affected collections + ledger/receipt. No partially visible import, premature Store.data replacement or settings/photo mutation. Resume/retry reuses the job and checks stored receipt/source identity. Revalidate choices against the latest persisted target state.

Reconciliation: source workouts = added + updated + skipped + quarantined; distinguish added sets, sets in updates and net changes. Test repeat file, changed source, local edits, malformed rows, unsupported types and failure before/during commit. Backup restoration, including recipe/progress photos, stays an independent regression gate.

## 6 Offline shell, updates and storage identity

Serve over HTTPS at the existing canonical project path. Relative asset/manifest/start URLs and service-worker scope must work under the repository subpath, not just localhost `/`. First online preparation waits for a controlled/cached shell before claiming Ready offline. No offline-first-install promise.

Review the current worker's network-first/cache-first paths, scope checks, activation and version pairing. Do not activate/reload over an active workout or unacknowledged entry. An update must retain a complete prior shell if fetch/install fails; avoid mixing incompatible HTML/runtime/CSS. Define tests with an older open app and pending edits, not only a fresh install. Cache deletion is limited to Body Dashboard's own obsolete cache generations; never clear origin-wide data or other applications' service workers/caches.

The service worker caches app assets, not health records/backups. IndexedDB and local photo blobs serve offline data. Remote food search, recipe links and remote images can fail offline; local/manual logging and names/nutrition/access remain useful. Existing locally stored photos must still render after offline restoration.

Same-origin paths share IndexedDB. A preview branch/path under the same GitHub owner does **not** isolate it from the live database. Test locally on a separate origin with fresh profiles; any hosted preview must have a genuinely separate origin and synthetic data. Preserve Life Dashboard storage regardless of host paths.

Changing domain/protocol/browser/profile or Safari/Home Screen container can change available storage. Do not assume automatic transfer; keep the old environment and provide local backup/import. Request/check persistent storage only as feature-detected browser support allows; it is not a backup or promise against user deletion. Report origin-wide persistence/quota honestly, including shared-origin limitations.

## 7 Sprint sequence and acceptance

| Order | Deliverable | Pass condition |
| --- | --- | --- |
| 1 | Baseline + browser persistence contract | Existing suite checked; precise additive metadata/transaction/backup design; no app-data reset. |
| 2 | Recovery/logging commands | Acknowledged intent/records survive close/reopen; abort/retry once; concurrent-tab conflict; degraded storage honest. |
| 3 | Matrix, correction and timer | Explicit-only new completion, one-action suggestion acceptance, stable focus, no overlay or forced feedback. |
| 4 | Workout import | Fitness JSON + training extraction, counts/IDs/units/types retained, repeat/conflict/quarantine/atomic failure tests. |
| 5 | Hosted-path offline/update behavior | Prepare online, reopen/log/edit/finish offline; safe failed update; stored local photos and backups preserved. |
| 6 | iPhone release candidate | Chromium + automated WebKit and physical Safari/Home Screen matrix, documentation/release notes and reviewable diff. |
| 7 | GitHub delivery when requested | Push/CI/publish only within authorized scope; verify canonical HTTPS site and offline shell without entering real records. |

Full `npm test` remains required for implementation. Add WebKit-specific coverage for this slice without pretending the existing Chromium default is a Safari test. Playwright WebKit is not physical iOS Safari or VoiceOver. Hosted localhost tests must actually register the worker under a repository-like prefix; current registration behavior may need a narrow development/test adjustment. Keep `file://` regressions too.

Physical checks: Safari + Home Screen, named iPhone/iOS, 390px and smallest supported width, light/dark, 200% text/browser text settings, keyboard/caret/decimal locale, 44px targets, VoiceOver focus/actions, offline relaunch after acknowledgment, denied notifications and backup restore. Never use the user's real health database for agent tests. If the device session is unavailable, report it as unverified and keep a release-blocking checklist rather than claim acceptance.

Performance: separately measure input feedback, draft checkpoint, complete/finish receipt, history lookup/import time and offline startup. Proposed p95 50ms feedback/150ms save targets remain unmeasured on iPhone. Probe 100k sets/10k food entries; collection serialization and full history scans are specific risks. Improve bounded DOM/query work before proposing a rewrite. Host SQL and static wireframe results are historical evidence only.

Deliver `outputs/D_WEB_PERSISTENCE_CONTRACT.md`, source/tests/synthetic fixtures, updated app instructions/release notes and `outputs/D_SPRINT_1_REPORT.md`. The report must list exact commands/results and available browser/device evidence, remaining failures and demonstration steps. Do not mark the entire MVP complete after this workout slice.

## 8 Free hosting, privacy and publication

Target $0 required hosting/domain/App Store cost for the personal app: GitHub Free public repository, default Pages domain, static assets, no paid services. Source code/assets are public; browser logs/photos and backup files are never committed, uploaded to Actions, put in deployment artifacts or logged remotely. Existing `.gitignore` protections stay in place.

Pages is subject to limits and is not the commercial coaching SaaS host. Later accounts, payments, client records and sync need a separate backend/authorization/hosting review. Do not promise future coaching is free or secure because the personal shell is static.

Prepare deployment changes and passing CI for review; this planning request does not authorize a push/publish, Pages configuration/visibility change or custom domain. Prefer preserving the current canonical origin/path. The application stays usable locally during development; no personal data migration is part of agent implementation.

## 9 Sources and evidence limits

Official sources checked November 7, 2026:

- [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): free public-repository static hosting; code hosting does not create a data backend.
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits): service limits and commercial SaaS boundary.
- [HTTPS on Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https): HTTPS/default-domain support and public-site exposure.
- [Apple Home Screen web apps](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios): installation workflow reference; exact UI/support still requires device testing.
- [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/): quota, persistence and eviction considerations; no device-storage guarantee.
- [IndexedDB specification](https://www.w3.org/TR/IndexedDB-3/): transaction semantics; current draft is not proof that every browser supports every option or power-loss durability.
- [Service Worker specification](https://w3c.github.io/ServiceWorker/): scope/lifecycle/cache model; current draft does not establish our app's offline/update correctness.

The revised D workout slice is implemented locally and unpublished. Read [the implementation report](outputs/D_SPRINT_1_REPORT.md) for actual browser evidence, performance measurements and remaining physical iPhone gates. Broader diet/analytics features remain later work. No deployment is authorized.
