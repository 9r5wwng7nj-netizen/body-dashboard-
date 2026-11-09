# Milestone 1 — local implementation and review

November 9, 2026. Status: local candidate; not published, no owner accounts or records accessed. The owner authorized investigation, team review and changes for sync safety before routine editing. This is not completion of the real-provider/iPhone acceptance milestone.

## Result

- Replaced timestamp-selected conflict resolution in the sync exchange with explicit snapshot-bound conflict review. Independent ID-addressable edits still combine. Delete/edit, legacy-array, ordering and duplicate-ID boundaries do not silently discard observations. A restore review preserves a previously selected conflict side; changed snapshots invalidate approval.
- Added first-link inventory/history-date previews and deliberate Drive adoption. Small and nested removals need exact-proposal confirmation. Invalid/non-Body remote content is rejected before first-link choices. The retired grocery exception remains for compatibility.
- Serialized adoption with the existing writer and loaded already-saved settings from other tabs. Captured local graph/settings and immutable restore plans are rechecked after awaits and within the commit transaction. New input arriving at final transaction completion stays recoverable rather than being overwritten or replayed over incoming records.
- Read Drive content between stable identity/version/ETag markers. Publish conditionally; download and compare the complete resulting data/settings before local acknowledgment. Recheck canonical identity/version after readback. Unknown future collections pass through. Missing or duplicate canonical files pause. No cross-service atomicity or rollback claim is made.
- Committed local canonical records, agreed base, verification receipt and settings checkpoint in the same IndexedDB transaction. Reconciled localStorage settings from the committed checkpoint under a serialized local transaction, including startup recovery and explicit choices when newer settings conflict. A remaining checkpoint withholds verification/success. Shared-setting choices affect exactly the displayed shared fields, retaining private settings.
- Retained the first pre-adoption local record snapshot through no-op syncs. Its dated download contains no photos/API keys and never imports automatically. A separate late-input copy takes priority in that download. Full record/photo backups remain the portable recovery method; backup restoration invalidates verification and requires sync review.
- Canonical commands and shared-setting changes invalidate current verification and schedule sync. Status distinguishes local saving/recovery, offline/authentication, last record verification, missing/pending photos and errors. Missing images on both sides no longer count as zero remaining work. Duplicate photo filenames and truncated Drive listings pause photo transfer. Existing-file photo availability is not a checksum certification of all assets.
- Added scoped non-sticky header/footer layout to sync-review dialogs so enlarged text and expanded complete values remain reachable. Other modal behavior, Cobalt Air and core navigation are retained. Added release notes and advanced the Body-only service-worker generation for a future safe update.

## Preservation and review

Database remains `body-dashboard` version 1 with `kv`, `photos`, `local`; original collection keys, identifiers, kg/km/seconds, snapshots and photo references are unchanged. New metadata lives only in the existing private `local` store, outside normal backup recovery extensions. No migration, personal program archive, max entry, Life storage write, native rewrite, new service or credential change occurred. Pre-existing changes to AGENTS.md, PROGRAM_EDITOR_RELEASE.md and the November 8 program-review packet were preserved.

PM/UX and architect reviewed the actual candidate and reported narrow corrections, which were incorporated. QA independently reproduced five initial safety failures and supplied 21 tests; the lead added final record/settings commit-boundary and combined approval regressions. See [architecture review](ARCHITECT_REVIEW.md), [product/UX review](PRODUCT_UX_REVIEW.md), [QA review](QA_REVIEW.md) and [contract](SPEC.md).

## Verification record

Baseline existing sync suite: 26 Chromium tests passed. The new QA probes still reproduced silent conflicts, stale prepared-merge overwrite, missing-photo status and accepted-write/readback mismatch. This demonstrates why a prior passing suite did not establish the new requirements.

Intermediate full run: 300/301 Chromium passed. The failing worker-update fixture hardcoded generation `v2`, so it no longer produced the intended synthetic update after the generation bump. The fixture now varies any current generation and checks that the actual prior cache is retained. The waiting-worker and failed-installation assertions remain. Existing restore/invalid-Life tests were updated to assert the intentional new review/early-rejection behavior, not weakened preservation checks.

An intermediate 303-case run reproduced a theme-test timing failure: the assertion sampled before inherited colors settled after the asynchronous theme rebuild. The test now polls the same actual heading/main colors for at most one second, retaining all expected color and browser-metadata checks. Ten repeated light/dark/light cases passed. No theme implementation or expected palette was changed to satisfy the test.

Final frozen-runtime results:

| Command/check | Actual result |
|---|---|
| `npm test -- --workers=2` | **303 Chromium tests passed, 1.7m**; includes CSS build, static checks and **4 broker tests passed**. |
| `npm run test:webkit -- --output=/tmp/body-dashboard-m1-webkit-final` | **209 passed, 4.2m**, fresh synthetic profiles. |
| `git diff --check` | Passed. |
| Local milestone Markdown links | All five documents checked; no missing local links. |

The final suite includes **24 new sync-safety cases**: the independent QA set plus lead regressions for input at final transaction completion, restore-plus-conflict approval, and late settings reconciliation. Review dialogs are exercised at 390px/200% text in both themes; independent PM/UX also checked normal/enlarged text, complete values, pointer access and unobscured forward/reverse keyboard focus. Existing suites cover 375/390px, offline process reopen, history import twice and byte-identical photo backup restoration. These remain synthetic browser results.

Exact tested local runtime SHA-256 values (no commit or deployment created):

- `index.html`: `9b7022026b79d7d98be82b33e4ed72357d2993b5f823675f31a304f614c7a198`
- `assets/app.css`: `1e598b93e9ef34202a309facba1b7fd5d1b8dc2e610137bc1453d4e6543f06e8`
- `sw.js`: `f221ebc8abe8411190af52cb987491fac826fd6f60b709f47be71e1ab4a6534f`

Only documentation was finalized after these frozen-runtime runs. No package was published, live browser profile opened, remote account connected or private data included in artifacts.

## Remaining acceptance limits

- Actual Google sign-in/refresh and concurrent real provider behavior were not exercised. The canonical Drive copy and the historical disappearance incident were not inspected; its cause remains unresolved.
- Physical iPhone Safari/Home Screen safe areas, keyboard, suspension/termination and VoiceOver require the owner-assisted pilot. Phone-sized WebKit/Chromium and axe checks do not certify these.
- Both participating clients must run the updated protocol. An old cached client cannot enforce the new review and writer contracts. Updating never requires clearing browser data.
- A verification receipt proves a particular local/remote snapshot at its recorded time; it does not prove the other device has fetched it. Verify each participating device and its inventory/history before switching.
- Photo transfer/availability is separate from complete byte-integrity certification of every pre-existing remote asset. Existing synthetic transfer and byte-identical backup/photo restoration tests remain required.
- Full snapshot reads/comparison/hash and conflict review increase sync work; no new physical-device latency or large-history performance claim is made. Browser eviction/device loss still requires independent full backups.
- The first retained pre-adoption copy can be old; it is not a rolling latest backup. Record-only recovery downloads exclude photos. Latest unacknowledged input cannot be promised durable if its recovery checkpoint also fails; keep the tab open and export/retry.

The next acceptance activity is a controlled owner-assisted desktop/iPhone pilot with known-good full backups and a synthetic routine/session. Routine-editor rebuilding and publication remain separate from this local delivery.

## Provider references

Official references accessed November 9, 2026: [Drive v2 file update](https://developers.google.com/workspace/drive/api/reference/rest/v2/files/update), [blob downloads with alt=media](https://developers.google.com/workspace/drive/api/guides/manage-downloads), [application-specific data folder and scope](https://developers.google.com/workspace/drive/api/guides/appdata). Documentation supports the API contract; it is not evidence of successful live authorization or real-device execution.
