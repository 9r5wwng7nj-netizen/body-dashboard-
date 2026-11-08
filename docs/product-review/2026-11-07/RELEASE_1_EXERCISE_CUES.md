# Release 1 — secondary muscles and reusable exercise cues

November 7, 2026 (America/New_York). Owner authorized ordered implementation, checks and publication of each ready update. This is the first stage of NEXT_ITERATION_PLAN.md.

## Behavior

Both Library and picker creation use shared metadata controls/validation, including secondary muscles, optional cues, equipment, tracking/load settings and how-to link. Native checkbox labels are at least 44px; a check and selected surface identify each secondary in both Cobalt Air modes. The primary group is excluded with explicit feedback when changed. Known old mappings outside today's vocabulary remain readable rather than being discarded.

Exercise cues use the existing optional `exMeta.notes` and appear beneath the exercise heading, compact to two lines with Expand/Edit. The existing menu exposes all-session cues even when none exist. Session notes remain on that workout occurrence. Save as exercise cue opens an explicit review and copies text without deleting the session observation. Repeat, routine, manual add and swap read the corresponding exercise's current cue; old notes and classifications are not copied as new observations.

Notes-only metadata stays partial, with base-plus-optional-override resolution, so a cue cannot freeze an inferred muscle mapping or falsely become a reviewed classification. Existing unknown metadata fields, tracking choices, cue text and source snapshots remain compatible.

## Save and preservation

Library/picker metadata uses existing coordinated intents, receipts and expected revisions; explicit global rename coordinates touched collections atomically and preserves record/nested IDs. No success acknowledgement occurs before local commit. A stale review cannot silently overwrite newer records. A recovered receipt cannot overwrite a newer in-memory edit. Pending editor payloads include bounded raw/context data for review after reload/full backup; older payloads remain accepted.

A narrowly scoped writer exception permits metadata/custom-definition intents that expected a missing collection to match that collection's unchanged default after backup restoration. Nonempty/newer data still rejects, and other command purposes keep their old conflict policy.

No database/store/key/collection was renamed, removed or added. Sync stays off; no model/API/credential/image service was introduced. All validation uses synthetic records and owned fresh profiles. The source branch also preserves the approved research/catalog/spec packet; those documents are excluded from deployment.

## Recovery boundary

If an earlier unrelated save or all storage writes fail before the metadata intent checkpoints, the newest form remains in memory. Keep the tab open until save or Export exercise draft succeeds. The readable draft export is not a completed-workout/history import file. Once checkpointed, the pending edit can be reviewed/retried after restart and carried in full backups. Reload saved definition is explicit, asks to preserve/export the draft and never discards other pending actions.

## Actual validation

- Builder: 14 new Chromium scenarios passed; combined new/approved-training WebKit 25 passed. Independent review found and resolved stale reopen, newer-edit acknowledgement, partial cue mapping and optional recovery validation issues.
- Root current-source full Chromium: **184 passed (38.1s)**, including CSS/static checks.
- Root hosted synthetic Chromium/WebKit smoke passed custom secondaries, visible cue, explicit session promotion, offline reload, finish/repeat cue/session distinction and full backup restoration, with original history IDs and zero page errors/network writes.
- Root current-source full WebKit: **77 passed (54.3s)**. Exact-source CI also passed **184 Chromium / 77 WebKit**.

Physical iPhone keyboard, safe-area, Home Screen termination and VoiceOver acceptance remain manual. Default engine checks do not establish those outcomes.

## Publication

- Tested source: `2834caca6e7c7cea387e4d9d389bfbe30476656d`.
- [Source CI](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42447614700) passed. Final independent read-only review found no critical preservation blocker.
- Deployment: `26228a86fa5843602f7eefb6b6eb4aea10bca94e`; [Pages run](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42448147503) succeeded.
- Exact staged package and live HTTPS passed both-engine common offline/import/photo-backup flow and the new secondary/cue/promotion/repeat/full-backup flow, with zero page errors or network writes. Live manifest and all 15 non-marker runtime file hashes match. Original history/set identities and session observations remained intact.
- Only 17 allowlisted public runtime files were published; research, tests, synthetic fixtures and personal data are excluded. Source/main/storage boundaries remain unchanged.

The first live smoke was started while Pages was still deploying and rejected the old manifest; a cue probe also encountered the old checkbox UI. These were deployment-timing checks, not successful acceptance runs. Both checks were rerun after Pages success and exact-source verification, and passed as reported above.
