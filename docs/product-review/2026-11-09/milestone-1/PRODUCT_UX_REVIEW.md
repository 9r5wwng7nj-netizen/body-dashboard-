# Milestone 1 — product and interaction review

November 9, 2026 · PM/UX review · Source inspection, not live-device acceptance

## Decision boundary

The owner completed the alignment interview and authorized Milestone 1 investigation, specification, team review and supported changes. The release is training-first: an excellent workout log and ordinary editable routines with optional percentage targets; simple macros; basic planned/performed muscle sets; dependable desktop–iPhone sync. Recipes and meal planning stay secondary in Nutrition. Multiweek variations, built-in photo AI and client coaching follow later. Milestone 1 precedes routine-editor rebuilding.

This review specifies safety/status interactions only. It does not authorize a new program engine, redesign Nutrition, change training maxes, archive the owner's rejected program, operate a real account, replace real records or publish. Application code and tests are owned by the implementation/QA workstreams. This reviewer inspected `AGENTS.md`, `docs/DRIVE_SYNC.md` and the current `index.html`; no personal browser profile was opened.

## Verified source findings

Line references describe the inspected source before the Milestone 1 implementation and can move afterward.

| Finding | Evidence | Product implication |
|---|---|---|
| First-connection **Combine** promises to keep everything. | `syncAskFirst` around 5581; `syncMerge` around 5221 resolves conflicts by `preferMine`, including whole arrays without stable record IDs. | The text promises a union that the algorithm does not guarantee. Same-record conflicts need explicit review or an honest pause; a clock preference is not user approval. |
| **Use the Drive copy** has no inventory comparison. | `syncAskFirst` displays no record counts, history range, local-only IDs or change summary; `syncFirst` sets `allowLoss` for this choice. | The user approves a broad replacement without seeing whether Drive is empty, older or missing history. A generic irreversible confirmation is insufficient. |
| The loss gate permits smaller removals. | `SYNC_LOSS_LIMIT = 10`; `exchange` pauses only when `here > limit` or `away > limit`. | The new promise is no silent destructive reconciliation. Safeguarding eleven lost workouts but silently allowing one is not adequate. An intentional deletion can sync, but ambiguous deletion/edit conflicts cannot silently win. |
| Record success is announced independently of photo completeness. | `run` sets `last`, then separately catches file-list/photo errors and still announces “Synced”; `status` does not incorporate `photosLeft`/`photoError`. | Records and photo transfer need separate status. “Synced” alone is misleading when a referenced photo is unavailable. |
| The photo queue omits references missing from both locations. | `photos` counts upload candidates only when bytes exist locally, and download candidates only when a Drive photo exists. | A missing-everywhere reference can yield zero photos left. Zero queue entries is not proof every photo is available. |
| The header does not expose offline or unverified local changes distinctly. | `status` selects busy/auth/error/last-sync; the header derives alert state from auth/error. | The previous successful exchange should remain a timestamp, not imply current offline changes reached Drive. Local save state remains independent. |
| Dated-copy recovery promises a confirmation more broadly than implemented. | `importChoice(d, day)` says the next sync asks before removing newer records on other devices, while the threshold remains greater than ten. | Correct the copy or the gate; do not promise every destructive change is reviewed when it is not. Copies contain records, not photo bytes. |

The documented history-disappearance incident remains unresolved. These are concrete risks and misleading interfaces; none establishes the incident's cause.

## Minimum interaction contract

1. **Local versus remote:** show local save failures independently of sync. Never replace recoverable drafts with a connection, sign-in or sync success message.
2. **First connection:** inspect before applying. Compare this device and Drive using known collection identities/counts and workout date coverage; identify additions, differing same-ID records and removals. Counts help orientation; identifiers/content determine equality. An empty remote history must be visible. Cancel changes neither canonical side.
3. **Safe default:** nonconflicting additions can combine. Ambiguous same-record changes, delete-versus-edit cases and conflicting active sessions pause. An explicit reviewed choice is bound to the reviewed versions; another write invalidates it. Do not add a new general conflict-management product in this milestone if a clear pause and preservation path is the safe bounded implementation.
4. **Replacement:** describe the exact affected records and preserve a recoverable pre-change copy before applying. A mere “cannot be undone” warning does not provide recovery. Keep Stop, Cancel, Retry and backup export reachable. Do not silently propagate a local restoration as an approved overwrite of another device.
5. **Truthful verification:** a completed exchange may say which snapshot was verified and when. It cannot claim all other devices are currently complete without observing them. Verify persisted local content and the agreed remote snapshot, not a successful HTTP response alone.
6. **Photos:** separately report pending uploads/downloads, failed transfer and referenced photos unavailable from either source. A record sync may succeed while photos remain incomplete. Dated copies explicitly exclude photo bytes; full records-and-photos backups retain their distinct role.
7. **Continuity:** offline logging remains available. Returning online does not override pending failed local writes. Resuming on a second device requires an up-to-date received session; divergent active work pauses for review.

## Suggested status vocabulary

Keep one concise header state and full explanation in Settings & Sync. Pair icons with text, use Cobalt Air light/dark, keep controls at least 44px and allow wrapping at 390px/enlarged text.

| State | Meaning to communicate |
|---|---|
| Saved on this device | Local persistence acknowledged; makes no Drive claim. |
| Offline · changes waiting | Local records remain usable; last verified exchange time is separate. |
| Syncing records… | An exchange is in progress; no success assertion yet. |
| Records verified · photos pending | The record snapshot agreed; photo transfer is incomplete. |
| Sync paused · review changes | Conflicting or destructive reconciliation has not been applied. |
| Sign-in needed · records kept | Authorization needs renewal; no reset/re-import instruction. |
| Last verified [time] | A historical snapshot verification, with record/photo detail available. |

These are proposed labels, not claims that the implementation already supports them. Avoid “everything is synced” and do not continuously announce polling/timer changes to a screen reader. Error focus must reach the useful explanation and preserve the action that opened the dialog.

## Acceptance scenarios

| Scenario | Required observation |
|---|---|
| First-device upload | A synthetic history with gaps, old records, routines, precise loads and photo references is uploaded, read back and reconciled. Local reload retains identical identities/content. |
| Second-device connection | Empty/sample-only and populated destinations see meaningful inventories before a choice. Cancel is inert. Drive adoption cannot silently remove local history; repeated retry is idempotent. |
| Desktop edit → phone | Edit one routine on desktop, receive it on phone, start a session, and prove the started snapshot retains its intended values while history is unchanged. This exercises current routines, not the deferred new editor. |
| Offline phone → desktop | Save sets and finish offline, close/reopen, reconnect, then receive exactly one completed workout on desktop with the same IDs, precision and notes. |
| Independent edits | Add different records on two devices; both survive. Same-ID contradictory edits and delete-versus-edit pause without silently accepting a timestamp winner. |
| Stale tabs and retries | A stale tab cannot overwrite newer saved content. Failure before/after remote or local commit, 412 responses, relaunch and repeated retry preserve a recoverable state and no duplicate records. |
| Photo failure | Pending batches, denied downloads, zero-byte responses and a referenced image missing locally and remotely are distinguishable from complete photos. Restored photos decode offline and retain byte identity. |
| Recovery | A full synthetic backup restores records/photos. A dated records-only copy is clearly labeled, previews its effects and cannot unexpectedly erase newer history on another device. |
| Accessibility | At 390px in both themes and enlarged text, all comparison/status/retry actions remain readable/reachable. Keyboard traversal, focus return and screen-reader status names are tested. |
| Isolation | Tests cannot touch Life namespaces/files, unrelated Google files, credentials or real health records. Full export excludes secrets. |

## Release limits and owner-assisted gate

Automated Chromium/WebKit with synthetic provider responses can verify algorithms and failure boundaries. They do not establish real Google authorization/refresh, actual provider conditional writes, physical Safari/Home Screen lifecycle, VoiceOver comfort or record completeness on the owner's devices. Do not call Milestone 1 accepted solely because its regression suite passes.

After a reviewed candidate exists, the live pilot needs a preserved full backup from each independently populated device, a recorded app version/browser container, explicit source/destination inventory reconciliation, a desktop edit received on iPhone, an offline phone session received on desktop, and photo verification on both. Keep private counts/content out of public artifacts. Do not clear site data or use whole-app Replace as an update procedure. Any owner interaction or credential entry stays with the owner; it is not a reason to skip safe local implementation and synthetic testing now.

The current review ran source inspection only. No runtime changes, live sign-in, physical-device acceptance or new automated test run is claimed here.

## Candidate interaction review — later in this work session

The lead supplied a runtime candidate with first-link inventory, snapshot-bound approvals, explicit conflicting-value selection, remote readback verification, a retained local records checkpoint and separate photo status. This section supersedes the preceding source-inspection-only activity statement for the candidate UI, not for real-device or provider acceptance.

Used the Playwright CLI skill and a fresh named, test-owned Chromium session against a throwaway localhost server. No user profile/account was opened. Only small synthetic `Sync.review` values were supplied; Google API requests were aborted. These are interaction/layout probes, not new provider protocol or persistence tests.

- First-link and conflict dialogs were exercised at **390×844**, light/dark, **100% and 200% root text**. Document scroll width remained 390px in all eight cases. Controls were at least 44px high/wide; at 200%, long choices wrapped rather than overflowing. Dialog content remained scrollable.
- Tab and Shift+Tab reached the visible Close, cancel/pause and choice buttons and wrapped within the dialog. PageDown scrolled the conflict review. No hidden-panel keyboard trap occurred in these candidate dialogs.
- Visually inspected the actual candidate dark conflict dialog at 200% text. The larger sticky footer reduces the initial reading area, but content remains available by scrolling. Screenshot is an ignored local artifact, `output/playwright/m1-ux-conflict-dark-200.png`, not a screenshot of personal records.
- Snapshot showed meaningful headings and accessible action names. This is not a VoiceOver session or a full accessibility certification.
- A bounded axe check of the dark 200% conflict dialog reported zero violations for WCAG 2 A/AA and 2.1 AA tagged rules. Color contrast was returned as **incomplete**, so no contrast certification is claimed.

Review concerns sent to the lead:

1. **Do not silently truncate conflict evidence.** The initial candidate used 500-character JSON previews and capped collected conflicts at 100 while accepting a side for every conflicting value. A difference after the preview cutoff could be invisible. Full expandable evidence or a complete downloadable comparison, explicit total/scope, and a safe refusal for unreviewable conflicts are needed before calling this reviewed reconciliation.
2. **Restore review should not present a conflicting-value choice when no conflicts exist.** A clear Review and continue plus Keep paused is sufficient; actual conflicts can follow separately.
3. **Pending records should lead status priority.** A prior photo warning should not hide newer locally queued record changes. Keep photo detail separately visible.
4. **Name the retained checkpoint honestly.** The candidate preserves the first differing-adoption checkpoint rather than overwriting it. Date/inventory or explicit first-retained-copy wording prevents the download from being mistaken for the most recent pre-sync state. The copy contains records/settings, not photo bytes.

The lead owns fixes and final regression results. These candidate observations do not establish resolution of the prior live history incident or acceptance on a physical iPhone.

### Follow-up review of expanded conflict and settings evidence

The later source removes silent preview truncation/caps, names routines/workouts, uses an explicit all-conflicts choice, simplifies restore-only review, prioritizes unsynced records and dates/describes retained records before download. These address the earlier source-level concerns.

A fresh Chromium recheck found an additional layout issue in the newly expandable conflict evidence: at 390px/200% text, after the opening animation settled, the sticky footer obscured the focused summaries. One summary spanned y418–506 while the footer began at y461; a second at y706–794 was wholly covered. A normal Playwright click timed out because header/footer elements intercepted it. Forward and reverse keyboard focus technically reached the summaries but did not reliably make them visible. This is a new evidence-control visibility finding, not the earlier hidden-panel focus trap.

A temporary browser-only diagnostic made the footer non-sticky and added scroll padding equal to the actual header height plus 12px. Every summary/button center was then visible through the forward/reverse cycles. No source repair is claimed by that diagnostic; the lead owns the scoped production remedy and final recheck.

The interrupted-settings review also initially displayed only `SYNC_SETTINGS` while its saved-side action applied the full settings object (preserving the local USDA key). The lead was asked to show all affected non-secret fields or constrain the applied fields to the comparison, so device-only settings cannot change outside the review evidence.

### Final scoped UX closure

The lead repaired the candidate using optional normal-flow header/footer layout on the first-link, conflict and interrupted-settings dialogs only. Other dialogs retain their existing layout. The saved-side settings action now changes only the displayed `SYNC_SETTINGS` fields and keeps device-only values. This supersedes the follow-up blockers above.

Reopened the frozen candidate in the fresh test-owned Chromium session and completed the final bounded checks:

Reviewed `index.html` SHA-256: `55e8aec2dfaca13f0651b3e8802afc19c68f2a9de39cf78716cc694238558026`.

- **Eight cases:** conflict and interrupted-settings dialogs × light/dark × 100%/200% text, all at 390×844. Document width remained 390px, dialog scroll width 388px, all tested buttons/summaries at least 44×44px.
- Normal pointer clicks opened both complete-value disclosures in all four conflict cases. Synthetic values deliberately differed after character 650; both distinct ending markers remained present, and the routine's readable name appeared in the heading.
- Tab/Shift+Tab reached the closed and expanded disclosures and all actions. Additional center-hit testing after expansion found **zero obscured focused controls** across both themes/text sizes. The former sticky-header/footer interception was no longer reproduced.
- Interrupted-settings actions remained keyboard reachable in all four cases. Clicking **Use saved operation settings** applied the displayed synthetic unit/rest changes, preserved the current device theme/view and synthetic USDA key, kept the complete record digest unchanged, and removed the resolved checkpoint.
- Source inspection confirmed restore-only review has one continue choice, the all-conflicts scope/count is explicit, pending record status precedes prior photo warnings, and retained-record download describes its date/inventory and does not automatically import.

**PM/UX outcome:** no remaining blocker was found within this bounded candidate review. Full regression/provider tests belong to the lead and QA report. Physical iPhone Safari/Home Screen, VoiceOver and live Google behavior remain separate gates; the prior history-disappearance cause remains unresolved. No personal records, real credentials or real browser profiles were used.
