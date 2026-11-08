# Agent D — web Sprint 1 implementation and validation

Date: 2026-11-07. Status: implemented locally for review; **unpublished**. This workout slice does not complete the broader diet/analytics MVP or physical iPhone acceptance.

## What works

- Start/resume, explicitly accept a previous set, edit a raw draft, save an amendment, undo, and finish through coordinated local writes. Set counts and new finished workouts use accepted sets; unchecked populated rows remain drafts. Previous values include their date and never copy previous RPE or joint feedback.
- Draft text and its original units survive a checkpoint. Canonical kg/km/seconds and accepted observations remain separate. Completion, undo, active amendments, historical amendments and finish retain the committed view until transaction completion. Double taps during a command do not create duplicate accepted sets.
- A durable intent precedes each canonical IndexedDB commit. Failed writes retain Retry/export recovery, including after browser-process close/relaunch when the checkpoint succeeded. Receipts prevent replay over newer acknowledged records. History, active clearing, owned rest deadline and finish receipt commit together. Read failures stop startup without resetting/reseeding saved records.
- Expected collection hashes and a final compare-and-write transaction reject changed targets in another updated-version tab. A stale import preview must be reviewed again. Refresh review loads the latest saved training records and records cancellation of its superseded attempt, preventing an older tab from replaying discarded choices. Reload saved copy is an explicit discard action, with export guidance.
- **Settings → Import workout history** accepts the actual Body fitness JSON export and extracts training only from Body/Life backups v1/v2. Original workout IDs, repeated exercise blocks/order, supersets, precision, notes, RPE, all seven tracking types and unknown training fields survive. Identical records skip; changed records default to keep current. Explicit replacement reports added sets separately from sets in updated workouts.
- Missing identities, malformed records and unknown tracking types remain quarantined rather than acquiring invented identities/observations. A private preview survives reopening; completed imports retain quarantine in their receipt, accessible through **Review quarantined history**. Quarantined raw JSON is serialized safely for backup/export. No unrelated Life collections/settings/photos are staged by this importer.
- The rest timer collapses, expands, adjusts and skips. Completion owns its deadline; undo cancels that set's timer only. Suspension/relaunch restores the deadline, or reports that rest elapsed. Denied/unavailable notifications do not block logging. Background alarms are not promised.
- The hosted shell installs under `/body-dashboard-/` using relative assets. Ready offline follows verification of the cached shell. Logging, editing, recovery, finishing, and bundled barcode/spreadsheet readers work after offline reopen. New workers wait for open Body pages to close; failed shell installation leaves the activated generation usable. Each worker reads its own project-scoped Body cache generation.
- Existing Today/quick actions, completed-week reporting, seven-calendar-day weight trend, calorie/card preferences, diet, recipes, local photos, Hevy/MacroFactor imports and full backups remain covered by regressions. Conservative E1RM/delta and optional EWMA helpers pass the supplied synthetic vectors; existing weight presentation is unchanged.

No personal history file was provided or imported during development. Import support is verified against synthetic files matching the source export shapes.

## Data contract and compatibility

The authoritative contract is [D_WEB_PERSISTENCE_CONTRACT.md](D_WEB_PERSISTENCE_CONTRACT.md). IndexedDB remains `body-dashboard` version 1, with `kv`, `photos`, `local` and the existing collection names. No Life storage is written. Existing identifiers, units, photo links/blobs and record fields remain compatible; new active-set draft fields and recovery metadata are optional.

Full backup v2 optionally carries `extensions.bdWeb`; old envelopes remain accepted. Restoration validates metadata namespaces, payload versions, intent targets/hashes and preview types before writes. It coordinates canonical data, photos and recovery metadata in its existing database transaction. Settings retain their existing rollback behavior. Tests restore byte-identical local PNGs, decode them offline and preserve recipe/progress photo regressions. Historical note edits retain unchanged timestamp offsets/precision and do not invent an unknown end time.

`bd.web.context` supplies single-user local actor/workspace/athlete defaults without replacing record IDs. It prepares a default ownership context, not client administration, authentication, server isolation or a coaching backend. Sync remains off (`DRIVE.clientId` is empty).

If IndexedDB cannot open after being used, the app stops rather than presenting an empty fallback install. In a genuinely fresh degraded localStorage install, existing ordinary edits remain available with save errors/retry, but new atomic workout commands and history import require IndexedDB. localStorage cannot provide the required multi-collection/cross-tab atomicity.

## Validation evidence

Baseline: the existing repository suite passed before implementation. The initial dirty source/planning work was preserved in a separate temporary baseline; no reset, stash, overwrite of unrelated work, branch switch, commit, push or publication was performed.

Environment: macOS 27.2 arm64; Node 24.21.0; npm 11.19.0; Playwright 1.64.0. Chromium 156.0.8078.4 and Playwright WebKit 27.2 were exercised. The iPhone device preset changes viewport/touch/user agent; it is **not** a physical iPhone or verified iOS version.

| Command / check | Actual result |
| --- | --- |
| `npm test -- --workers=2` | Final full Chromium suite: **129 passed in 26.9s**, including CSS build and static checks. |
| `npm run test:webkit` | Final hosted project-path WebKit suite: **22 passed in 19.8s**. |
| `npm run check` | Two inline scripts parse; 320 top-level functions, no duplicates; 292 used action names/handlers; 48 number fields declare their keypad. Workout text-entry fields separately declare decimal/numeric input modes. |
| `git diff --check` | Passed. |
| GitHub Actions | Prepared Chromium + WebKit installation/tests; not remotely executed because nothing was pushed. CI uses Node 20; the local run used Node 24. |

Both browser suites exercise actual IndexedDB and hosted service workers. No fake database substitutes establish the persistence result. Failure tests abort real writes; separately fail checkpoints, reads, sync bookkeeping and fallback quota writes; reject stale tabs/previews; check receipts; retry/reload/reopen; and reconcile imports exactly.

The browser-process relaunch case closes a fresh test-owned persistent browser, launches a new process with that same synthetic profile, goes offline, recovers a pending completion with its draft/IDs, then finishes once. This is a process close/relaunch test, not a power-loss or physical iOS force-quit guarantee.

Additional exercised scenarios include:

- Fitness JSON and Body/Life v1/v2 extraction; identical second import; explicit changed-source replacement; stale local changes; malformed/missing-ID/unknown-type quarantine; repeated blocks without nested IDs; kg/lbs display and raw km/seconds preservation; timezone review; aborted atomic import and retained quarantine.
- 390px and 375px fallback, light/dark themes, 200% root text, select/replace and Enter-to-next-field focus, 44px row controls, accessible names/keyboard focus and axe WCAG 2 A/AA + 2.1 AA scans. At larger text or narrow/RPE layouts, labeled row details replace compressed columns. Enlarged completion controls remain reachable above navigation (layout assertions allow subpixel rounding).
- Online preparation, controlled project-path worker, offline page and process reopen, offline local logging/finish, optional-notification denial, expired timer restoration, waiting-worker update while active, failed shell update and namespaced cache/storage checks.
- Backup restoration of original IDs/links/precision plus optional metadata and byte-identical photos. API settings and unrelated Life data stay outside the training flow.

Fresh Chromium/WebKit contexts were used. WebKit's temporary private sessions cannot persist Blob/File values in IndexedDB on this build; photo restoration and process-relaunch tests therefore use newly created, isolated persistent test profiles, removed afterward. This reproduces the distinction described in the [Playwright tracker](https://github.com/microsoft/playwright/issues/42795), accessed 2026-11-07. The application photo format was preserved.

Synthetic screenshots are reproducible under ignored `output/playwright/`: `web-chromium-390-light.png`, `web-chromium-390-dark.png`, `web-chromium-390-dark-large.png`, `web-chromium-390-dark-large-row.png`, and corresponding WebKit images. Normal and enlarged screenshots were visually inspected; a crowded title/status header was corrected by moving offline readiness to its own strip. Existing dashboard/recipe/chart screenshot regressions remain available there.

## Performance and its limits

Each browser probes **100,000 historical sets in 1,000 workouts plus 10,000 food entries**, using 20 input/checkpoint/complete-or-amend samples. Results below are the final run's host measurements, in milliseconds. Timer resolution can round short operations to zero. Samples dispatch synthetic input events; they do not establish physical keyboard/touch latency or display paint time.

| Measurement | Chromium p50 / p95 | WebKit p50 / p95 |
| --- | --- | --- |
| Synchronous input event feedback | 0.1 / 0.2 | 0.0 / 0.0 |
| Next animation-frame opportunity | 0.1 / 0.3 | 1.0 / 4.0 |
| Explicit draft checkpoint receipt | 2.2 / 2.5 | 4.0 / 9.0 |
| Complete/amend round trip | 14.5 / 18.2 | 28.0 / 46.0 |
| Finish against 100k sets (one sample) | 410.4 | 606.0 |
| History lookup (one sample) | 0.0 | 0.0 |

Draft receipt timing uses an explicit flush; ordinary typing has a 250ms debounce before its checkpoint. The next-animation-frame opportunity is a scheduling measurement, not proof of physical paint. Completion/amend timing includes command processing and render. Finish is a **single sample**, not a p95 estimate. History lookup is a single 1,000-session scan.

Ordinary set interaction met the proposed desktop timing budgets in these samples. Large-history finish exceeded the proposed 150ms save target. Investigation identifies the whole-history path: cloning/serializing and hashing expected/current collections, checkpointing the candidate, rereading/comparing in a transaction, committing the history and rendering the result. This is infrequent and preserves the current collection format; indexed history persistence and bounded query/serialization work need a separately reviewed optimization before claiming that target at 100k sets. Cold import/startup performance and physical iPhone p50/p95 remain unmeasured. No zero-latency or iPhone speed claim is made.

## Review gates and deliberate limits

1. **Physical iPhone acceptance remains open.** Verify a named device/iOS in Safari and Home Screen mode, 390pt and the approved smallest device, Dynamic Type/zoom, actual decimal keyboard/caret, one-handed use, safe areas with the keyboard, VoiceOver navigation/actions, suspension and OS force-quit. Desktop WebKit/axe do not replace these checks.
2. Keep storage/backups explicit. No browser can promise survival of site-data clearing, eviction or power loss. If the intent itself cannot be saved, preserve/export the open tab; current text cannot be promised after termination.
3. Before the first upgrade, export a backup, save work and close all legacy Body tabs. The update test exercises old/new worker generations with updated-version pages; an already-open legacy application can bypass the new writer protocol. It cannot be retroactively made safe by new-page code. Update policy therefore requires closing old pages before initial rollout.
4. Import supports the repository's actual JSON shapes. There is no invented mapping for missing IDs/unknown tracking types, no third-party arbitrary JSON adapter, and no automatic timezone conversion. Export quarantine and correct/review the source mapping. Valid history needs no re-entry. A source file with no importable changes remains staged for review.
5. Repeated exercise blocks remain intact. The pre-existing Previous/analytics lookup still uses the first matching exercise block in a workout; block-specific comparison needs an explicit product rule and later work. New comparable E1RM/EWMA UI, joint/fatigue tagging, diet completeness/snapshots and coaching screens remain later MVP scope. The tested optional analytics helpers do not silently replace the existing progress estimates/weight trend.
6. Finish no longer interrupts with the former automatic routine-update confirmation. Routine editing remains available in Routines; accepting an optional post-summary “update routine” action is a product-owner decision. PR badges/finish summaries remain available. Pending historical amendments now keep the saved history visible until acknowledgment.
7. Recovery receipts are retained locally and in optional backups; no retention/compaction policy has been introduced. Very long-lived profiles may need measured metadata/history cleanup designed around pending/import lineage preservation.
8. No live HTTPS deployment, GitHub Actions execution, real-data import, real account connection or production sync was performed. The repository stays on `main` at base commit `63d098f`, with the reviewable uncommitted changes. An isolated diff against the pre-sprint dirty working tree is saved at `output/playwright/web-sprint1-review.patch` (ignored, local only). No paid hosting, App Store tooling, AI logging or image service was added.

## Demonstration and next work

1. In a fresh test profile, run `npm start` and open `http://localhost:8080/index.html?pwa`. Wait for Ready offline. Never use a second same-origin path as a data sandbox.
2. Start/resume; accept a valid suggestion, edit/accept a draft, amend/undo, collapse/adjust the timer, and finish. Unchecked rows stay out of history.
3. Reproduce failure/recovery with `npx playwright test tests/web-persistence.spec.js tests/web-hosted.spec.js --workers=1` or `npm run test:webkit`. All injected failures and records are synthetic.
4. Choose a synthetic fitness export in Settings → Import workout history; review counts/IDs/units/timezone, import, import it again, change the source, and observe the keep-current default. Review/export quarantine.
5. Prepare online, close/reopen offline, log/finish, then export/restore a synthetic photo backup. For an approved hosted release, use Safari Share → Add to Home Screen after initial online preparation.

Next work: close physical-device/accessibility gates, measure and optimize large-history finish where needed, then continue the diet/comparable-progress MVP. Publication requires a separate instruction. Do not resume the deferred native build or run another agent automatically.
