# Milestone 1 — independent architecture review

November 9, 2026 · Review baseline `3dc21b50f75dd3a0ed6fdb49dcb8a50f0d26f442` · Synthetic examples only

## Boundary and conclusion

Reviewed repository `AGENTS.md`, `docs/DRIVE_SYNC.md`, current Store/WebWrites/backup/sync source, and existing `tests/sync.spec.js`. This review changed no runtime source, tests, browser records, credentials or external service. Earlier uncommitted program-review documents remain separate. Source line numbers below refer to the inspected baseline and will move during implementation.

The present design has valuable isolation, local-first storage, conditional remote updates, backup compatibility and active-session guards. Milestone 1 should extend these boundaries. A new database, framework or sync service is not justified by this review.

**The reported real history disappearance remains unexplained.** The original remote payload, exact browser container and sequence were not captured. The findings below identify independently verifiable risks; they do not establish that incident's cause.

## Findings

| Priority | Verified source behavior | Consequence and required boundary |
|---|---|---|
| P1 | `syncMerge` (`index.html:5221–5250`) selects an entire non-ID object array by `preferMine` when both sides changed. Scalar conflicts also use a device-wide timestamp; this timestamp can reflect unrelated edits, while the remote timestamp is upload time. | Two edits to different sets in a legacy exercise block can lose one side silently. Retain the existing merge helper for compatible nonconflicting values, but detect and pause ambiguous both-side changes before applying either side. No clock-based conflict authority. |
| P1 | `Sync.adopt` (`5439–5445`) reads storage outside the coordinated writer and replaces both `WebWrites.bases` and memory without guarding a domain-command commit during the awaited read. Domain commands need not mark `Store.dirty`. | An older read can hide a newer committed command in memory and prepare an obsolete sync snapshot. Serialize adoption with commands and check dirty revisions plus current values before adopting. A successful local read is not a lease on an unchanged snapshot. |
| P1 | `Sync.exchange` commits local merged records via `commitBackupImport` before its conditional remote update (`5503–5514`). The base and remote version are then saved separately. | Failed/uncertain remote publication may leave local changes applied without agreement. Stage a proposal, publish conditionally, read back stable content, then commit local records and the agreed base/verification receipt atomically under expected local values. Failed verification preserves pre-exchange local records/base. |
| P1 | `commitBackupImport(plan)` (`3967–4005`) flushes edits after its caller has already constructed `plan`, then compares database values with the *current* `WebWrites.bases`. | Its own flush can advance the accepted baseline while the old replacement graph remains unchanged. Use captured plan expectations and reject stale plans. A dedicated sync commit must not reuse this unguarded restore contract. General backup restoration needs the same stale-preview boundary. |
| P1 | First adoption (`5581–5593`) describes Combine/Use Drive and obtains generic confirmation, without displaying source contents or keeping a durable pre-adoption record/settings checkpoint. | A person cannot assess whether the remote copy actually contains their history. Require a bound preview with counts, dates, changes and explicit scope; retain a recoverable pre-adoption checkpoint before replacement. Empty remote data must be visibly empty. |
| P1 | The deletion guard (`5254–5264`, `5500–5501`) counts top-level identities/keys and ordinarily allows up to ten deletions. It does not detect removed nested sets in an existing workout. A broad `allowLoss` applies to a newly fetched proposal. | Small or nested losses can be silent. Inspect identity/content changes, distinguish accepted deletions from unresolved absence, and bind any destructive approval to the exact candidate and inputs. New changes invalidate approval. |
| P2 | `Sync.photos` (`5545–5559`) only counts upload/download candidates. A referenced ID absent both locally and remotely has zero pending transfers and no error. Duplicate remote names choose the final Map entry. | Records may be verified while photos are missing or ambiguous. Keep records status separate from photo availability; show missing-both and duplicate-name issues. Filename presence alone is not byte verification. |
| P2 | Success (`5462–5470`) sets last-sync before photos and does not confirm the published body by stable remote readback or stored-local reread. | “Synced” is weaker than content agreement. Persist a versioned verification receipt only for a stable remote representation that matches the committed local graph; changes invalidate its current applicability. |
| P2 | Backup restoration preserves `sync.base` and existing `bd.sync` state; the restore action later calls `syncTouch` (`5784`). | An intentional old backup can be interpreted as deletions against a newer base. Invalidate the verified indicator and require a reviewed reconciliation after restoration before remote propagation. Do not silently revoke account access or erase remote history. |

Nested duplicate IDs also collapse through `Map` indexing in `syncMerge`. Top-level backup validation rejects duplicate root record IDs, but nested arrays lack an equivalent uniqueness check. Reject/quarantine ambiguity rather than assigning new identities or losing the first occurrence.

## Deterministic probes actually executed

Ran a Node source-extracted probe against the exact current `sameJson`, `syncMerge` and `Sync.adopt` method. No browser, database or network was used for these probes.

1. Legacy workout: base set reps `[5, 5]`; local edits the first to `6`, remote edits the second to `7`. Expected preservation requires both `[6, 7]` or explicit review. Current merge with `preferMine=true` returns **`[6, 5]`**.
2. Nested list with two records sharing `id: same`, names `one` and `two`: current merge with an empty other side produces **one** row (`two`).
3. Exact `adopt` method with a stubbed awaited `readMany`: simulate a completed domain command updating memory/bases to `new-command` while the read returns the earlier `old` snapshot. Current method restores both memory and bases to **`old`**, while simulated durable state remains `new-command`.

The first two are actual pure-function outputs. The third is a deterministic interleaving model of the source method, not a browser race reproduction. All three need meaningful real-browser regression coverage in the implementation. Existing tests cover normal adoption, a stale second tab, conditional conflicts, large losses, opt-in, invalid envelopes, photos and a 36-workout migration; they do not close these new races or real-provider/device gates.

## Minimal architecture contract recommended

### A. One coherent proposal

Capture actual saved records, relevant settings, local revision/digests, prior base, remote file identity/version/content and intended resolution. Validate schemas/IDs without rewriting legacy data. A proposal is not an acknowledged save. Changes to any participating input invalidate its approval.

### B. Conflict policy

Automatically combine additions and unambiguous changes supported by the three-way base. Both sides changing the same scalar differently, incompatible structural arrays, duplicate identities, delete/edit conflicts and competing active sessions pause. Preserve local and remote candidates. Offer explicit Keep device/Use Drive choices for the reviewed conflict scope, never a silent device-wide timestamp winner. Legacy arrays with no reliable nested IDs must remain intact; do not infer identity from array position.

### C. Publish and verify

Use the existing safe provider precondition protocol. Conditional failure triggers bounded refetch/reproposal. After successful or uncertain publication, obtain a stable remote read (identity/version around body), compare exact semantic content and verify it was not replaced by another writer. Then use the coordinated local writer to atomically commit canonical records, agreed base and a versioned verification receipt under captured local expectations. Do not advance the base before verification. A stale local state or failed commit stops acknowledgment and retains local work for retry.

There is no distributed atomic transaction spanning Drive and IndexedDB. A successful remote write followed by failed local commit must be treated as an uncertain exchange, not falsely rolled back. Reconciliation against the old local base on retry must retain published changes without duplicate records. A subsequent remote edit may make the verified snapshot old immediately; label the verification time and detect local edits rather than claiming perpetual equivalence.

Settings live in localStorage, outside the IndexedDB transaction. Explicitly design and test their ordering/rollback/reconciliation. Do not describe cross-store settings and records as atomic merely because `kv` and `local` are transactional.

### D. Recovery and portability

Before destructive first adoption, persist one bounded private local checkpoint of prior records/settings and photo references; leave existing photo blobs untouched. Provide a full downloadable backup and an explicit reviewed restore path. Checkpoint metadata is local-only, separate from synced records and ordinary provider grants. Failure to checkpoint blocks replacement. Never clear storage or use Life namespaces.

Keep DB v1/stores/collections/IDs/kg/km/seconds/photo references/backup envelopes compatible. Unknown future collections pass through unchanged. A checkpoint stores health data locally: no console/request logging, public fixture, Git artifact or hidden external transmission.

### E. Honest status

Distinguish Not connected, Local changes, Syncing, Review needed, Records verified at time, Photos pending/missing and failure. The receipt records exact approved scope and content verification; counts/range help people inspect history but cannot prove equality. Do not imply daily record copies contain photo bytes.

## Required acceptance evidence

| Scenario | Required result |
|---|---|
| Desktop routine → phone → completed session → desktop | All identifiers/targets/actual values reconcile; reload retains exact graph. |
| Offline set/routine edits, termination and reconnection | Acknowledged local data survives; one merge, no duplicates. |
| Different sets in legacy arrays; same-field conflict | Neither silent whole-array selection nor a timestamp winner; review bound to exact inputs. |
| Delete/edit and small/nested deletion | Visible exact effect and safe retry; no broad stale approval. |
| Local edit/domain commit during adoption, publish or readback | New local work retained; stale commit rejected; verified status withheld. |
| Remote 412, response lost, body mismatch or version changes during readback | Retry/review without advancing local agreement falsely. |
| Crash after remote save, before/after local atomic commit | Receipt/base/records reconcile on restart; no duplicate commands. |
| First Use Drive with empty/sparse/older remote data | Counts/range/changes visible; pre-adoption checkpoint and backup available; no implicit acceptance. |
| Failure writing checkpoint, records, settings, base or receipt | Prior committed data/base remain coherent and retryable; no success indicator. |
| Backup restore while connected | Verified state invalidated and next reconciliation reviewed; no silent propagation of a smaller old snapshot. |
| Photos present, absent on both sides, duplicate names, interrupted batches | Correct pending/error status; matching IDs and byte-identical transfer/restore for supported fixtures. |
| Old full backups, new optional metadata and unknown future collections | Readable/round-trip compatible; raw IDs and precision retained. |
| Two browser engines, phone width/themes/enlarged text/keyboard | Review, backup, retry and status reachable and named. |
| Actual desktop/iPhone Google pilot | Explicit real-provider and device verification after synthetic acceptance; do not equate mocks/WebKit viewport with live acceptance. |

This review recommends the bounded candidate above. It does not authorize provider changes, live record operations, retirement of the rejected program or new routine-editor work. The lead owns integrated scope and final implementation acceptance.

## Candidate cross-review — implementation in progress

Read the first Milestone 1 candidate after the lead added reviewed merging, stable remote readback, expected local snapshots, atomic base/receipt publication, restoration review and prior-record download. This is a source review of a moving working tree, not a completed-test or release approval.

The candidate addresses the original principal boundaries: remote publication precedes local adoption, canonical/known data and unknown future collections have separate scopes, missing former canonical files pause, remote content is read between stable markers, first connection displays both inventories, ordinary deletions now require review, and missing-both/duplicate remote photos are visible.

Follow-up findings sent to the lead before acceptance:

1. **Approval accumulation and rebinding.** `syncReview` initially reset `conflicts` when approving a restore and reset `restore` when approving a conflict. A restored graph with a real conflict could therefore require the same two reviews indefinitely. Its unconditional spread of the previous approval could also carry a destructive `loss` flag to a different signature. Accumulate flags only within the identical signature; discard all old privileges for a changed snapshot.
2. **Recovery retention.** An unconditional pre-publication `sync.recovery` write on every exchange overwrote the meaningful pre-adoption copy on the next unchanged sync. Keep recovery across no-op/outgoing-only exchanges. A visible recovery button must continue to retrieve the replaced graph after later routine syncs.
3. **Settings checkpoint concurrency.** Separate `LocalDb.get` / localStorage write / `LocalDb.del` allows a tab to delete a newer tab's checkpoint. Perform checkpoint read, synchronous localStorage reconciliation and deletion inside one `local` readwrite transaction, serializing against canonical sync/restore commits. A failed settings write retains the checkpoint. Its startup conflict must have a recovery explanation, not an invented successful state.
4. **Stale already-saved settings.** Adoption initially reloaded settings only if localStorage changed during the awaited collection read. If another tab saved before adoption began, stale in-memory `S` remained and could replace newer macro targets/units. Adopt the actual saved settings before making the next proposal, while retaining/rejecting genuinely unsaved in-memory edits.
5. **Verification invalidation and command scheduling.** Direct `WebWrites.command` saves do not necessarily traverse `Store.drain`, the only original `syncTouch` caller. Successful program/TM saves, workout finish and retries therefore need verification invalidation/scheduling too. An older timestamp in `bd.sync` is not current content verification. Restoration or a settings-recovery crash must not leave the old badge applicable after the atomic `sync.verified` receipt was removed. Post-commit bookkeeping failure cannot turn a successful local record commit into a false failure.
6. **Ordered insertions.** The first reviewed merge used the lead array followed by unique tail IDs, appending remote new rows. A remote exercise inserted first could become last when the local device made an independent field edit. Preserve source-relative unambiguous insertions or request review of incompatible order; do not silently reorder training targets.

The review also noted a narrow in-transaction race to cover: a local UI mutation after the final pre-write check but before the IndexedDB transaction's completion callback must not be erased by an unconditional `Store.data = plan.data`. Existing expected-value tests should inject at that boundary, not only during network calls. The correct handling must retain the latest typed values and avoid a later dirty whole-collection save reverting freshly adopted independent remote changes.

These items require final-diff review and meaningful regression evidence. No claim is made here that all remain present after the lead's subsequent repairs.

### Narrow repair review

The later source includes the reviewed repairs: same-signature approval accumulation; first meaningful recovery retained across no-op syncs; settings recovery serialized in one local-store transaction with an explicit settings-choice screen; adoption of already-saved settings; post-command invalidation/scheduling and a current-state verification stamp; source-relative list insertion; recursive duplicate identity checks before the merge; and nested deletion review. Stable remote readback and missing-file guards remain in place.

The final local transaction now retains late record input separately as `sync.late-input` and blocks further writer replay until export/reload, rather than assigning an older plan over that input. Canonical records and agreement remain committed together. If settings recovery remains unresolved after that commit, the path reports `settingsReview`/`recordsCommitted` and withholds verified success; it does not claim that a committed operation rolled back.

A final specific approval issue was returned to the lead: the restore-review Continue action must preserve a prior same-signature conflict choice (or first-adoption choice). It must not change an approved Drive resolution to device values merely because Continue carries a default `mine` attribute. This is a narrow correctness repair to the existing approval contract, not a new feature. Full-suite results and the late-settings-boundary regression belong to the lead/QA report; this architecture review has not independently rerun those browser suites.

### Final source closure

Rechecked the two final repairs in the current source: `syncReview` now preserves `prior.choice` for a same-signature restore review, and the post-commit settings-recovery path checks for an unresolved checkpoint and throws `settingsReview` with `recordsCommitted: true` before sync acknowledgment. Both specific findings are closed in source. The corresponding actual-browser regression cases are present in `tests/sync-safety.spec.js`; the lead reports both passed. This reviewer did not rerun those cases or the full suites.

No remaining acceptance-blocking source finding was identified within this bounded architecture review. This conclusion applies to the local candidate and its reviewed contracts. It does not explain the earlier real history incident, verify Google's live grant/provider behavior, establish physical iPhone acceptance, or authorize changes to live records. Final exact-source suite results and the owner-assisted pilot remain separately reported release gates.
