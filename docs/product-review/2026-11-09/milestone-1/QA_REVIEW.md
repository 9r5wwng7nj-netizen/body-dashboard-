# Milestone 1 — independent sync safety QA

November 9, 2026 · Synthetic profiles only · Investigation and candidate acceptance

## Boundary and method

Read `AGENTS.md`, `docs/DRIVE_SYNC.md`, the current storage/backup/sync implementation and `tests/sync.spec.js`. New regressions live in `tests/sync-safety.spec.js`; their fake provider is intercepted locally. No real browser profile, health backup, Google account, credentials, deployed API or Life Dashboard storage was opened or changed. Test-created profiles and local servers are the only execution surfaces.

The test harness exercises the existing browser IndexedDB implementation and actual sync entry points. This is not a real Google Drive authorization, provider durability or physical-iPhone result. The prior reported history disappearance still has no established root cause.

## Baseline findings

| Priority | Reproduction / observed result | Consequence and required acceptance |
|---|---|---|
| P1 | Two previously linked devices edit the same routine name. After desktop sync, phone sync returns an empty error and chooses a timestamp winner. | A same-field conflict must pause before canonical local mutation or Drive record upload; both versions remain available for explicit review. A device timestamp is not informed consent to discard an edit. |
| P1 | Desktop deletes a completed workout while phone changes its note. After desktop sync, phone silently resolves the deletion/edit disagreement. | Preserve the edited history and remote deletion until reviewed. This is distinct from an unchanged device receiving an intentional deletion. Precision and IDs must survive reload. |
| P1 | After sync computes a merge, gate its `commitBackupImport(plan)` call. Save and flush a new local recipe, then release the prepared import. The acknowledged new record disappears. | Apply must compare immutable plan-time expected values, not mutable `WebWrites.bases` advanced by an intervening flush. Retain the new record; pause/replan rather than install a stale download. |
| P1 | Fake provider returns successful HTTP write but deliberately omits the new record from stored content. Existing sync reports no error and advances success metadata. | Read back and verify the agreed remote content before acknowledging that record exchange. A successful status code is not evidence of content equality. Local new records must stay intact. |
| P2 | A recipe references a photo ID with no local bytes and no matching Drive file. Existing `photos()` reports zero remaining transfers, no missing count and normal sync success. | Count missing referenced assets, expose a photo issue and distinguish verified record exchange from complete photo availability. Do not invent missing bytes or report full completeness. |
| Retained behavior | Save an addition while a remote download is gated, before the implementation captures its local snapshot. The addition survives merge, reload and convergence. | Retain this working timing case while fixing the later stale-plan race. Do not claim all in-flight editing was broken. |

Source at baseline: `syncMerge()` chooses `preferMine` for conflicting leaves and unsupported array structures; `Sync.exchange()` prepares merged data and calls backup import; `commitBackupImport()` flushes and then compares against current mutable writer bases; `Sync.run()` advances `last` after exchange and tolerates photo errors; `Sync.photos()` counts only actionable uploads/downloads. These paths explain the synthetic findings, not the unresolved real-device incident.

## Actual baseline execution

- `npx playwright test tests/sync-safety.spec.js --workers=1`: initial five-scenario Chromium run, **1 passed / 4 failed** in 3.7 seconds. Failed cases were same-field conflict, delete/edit conflict, missing-photo reporting and remote readback mismatch. Pre-capture download/edit timing passed.
- Added the sixth, post-merge-plan persistence-boundary case, then ran `npx playwright test tests/sync-safety.spec.js --workers=1 --grep 'after merge planning'`: **1 failed**, reproducing loss of the acknowledged synthetic record.

The new suite is intentionally a regression contract, not a claim that the candidate has fixed these findings. Three further candidate acceptance cases were added: actual IndexedDB abort while writing `sync.base` must roll back both downloaded records and agreement metadata; an older prepared full-backup plan must reject an intervening local save; and independent edits to different fields of one routine must still combine. These additions make nine focused cases. Final candidate results will be appended after implementation review.

## Acceptance that must remain separate

- Full application regression suites and WebKit execution, not only this focused Chromium suite.
- Backup/restore round trips with original identifiers, units and byte-identical locally stored photos.
- First-connection preview and explicit choice behavior, including empty or unexpectedly smaller remote data.
- Failed local save/base bookkeeping, interrupted remote writes, stale same-origin tabs and retried conflict reviews.
- Offline relaunch and reconnect from desktop and physical iPhone Safari/Home Screen, with named device/iOS evidence.
- Real provider readback, authentication/refresh and conditional writes under the owner-assisted pilot.

Keep the known-good downloaded backups unchanged. No physical-device or live-provider acceptance can be inferred from mock success.

## Focused candidate verification

The regression suite is frozen at **21 cases**. After the lead's implementation, the focused runs completed:

| Command | Actual result |
|---|---|
| `npx playwright test tests/sync-safety.spec.js --workers=1` | **21 passed, 12.3s**, Chromium. |
| `npx playwright test --config=playwright.webkit.config.js tests/sync-safety.spec.js --workers=1` | **21 passed, 48.5s**, WebKit using fresh test-owned persistent profiles at 390px. |

The cases cover concurrent same-field and delete/edit pauses; preserved precision/reload; independent-field merging; explicit device/Drive conflict choices; invalidation of an older review after a new remote revision; local saving during download and after merge planning; accepted-but-mismatching remote readback; actual IndexedDB abort of `sync.base` and atomic rollback/retry; stale backup plans; single-workout and nested completed-set removal review; missing photo references; localStorage settings failure with a durable checkpoint and startup recovery; a workout command queued during adoption; command-triggered sync scheduling and current-verification invalidation; same-origin saved-settings adoption; and retention of pre-adoption recovery data with API-key exclusion.

Two cases inspect the actual conflict-review dialog at **390px and 200% text**, in light and dark modes: no horizontal page/dialog overflow, all review buttons at least 44px in both dimensions, named controls, forward/reverse keyboard traversal and zero scoped WCAG A/AA-tagged axe violations. These are automated engine checks, not a screen-reader session or physical-iPhone certification.

An intermediate 15-case run had **14 pass / 1 fail**, exposing nested set removal that the first implementation did not count. The guard was corrected. A later 21-case run had **19 pass / 2 assertion mismatches**: a status check expected different words despite an accurate needs-verification message, and a deletion test unnecessarily required a pre-adoption recovery copy when sync had not adopted/replaced the already-deleted local graph. The status assertion now accepts the truthful message; the latter checks canonical/base agreement, while the separate destructive-adoption recovery-retention test remains strict. Neither correction weakens conflict, loss, acknowledgment or data-preservation assertions.

## Review conclusion and limits

The bounded candidate addresses the independently reproduced baseline failures in the focused synthetic scenarios. The source review also prompted protection for settings reconciliation, domain-command scheduling and long conflict-value review. No migration, schema reset or real-data operation was used.

The parent lead owns the final full-suite run and exact final runtime/package review after any remaining edits. These focused results do not establish live Google authorization, provider response durability, cross-device behavior on the owner's actual containers, physical Safari/Home Screen lifecycle, VoiceOver, or the cause of the earlier reported disappearance. Those acceptance gates remain explicit; the milestone must not be described as fully live-verified from this report.
