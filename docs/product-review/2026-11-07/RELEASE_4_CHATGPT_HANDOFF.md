# Release 4 — manual ChatGPT handoff and reviewed local drafts

November 8, 2026 (America/New_York). Final H1 stage of the authorized sequence; H2 built-in AI remains deferred.

## User flow

Train/Nutrition → ⋯ opens programming, meal/photo and diet-log briefing tools. Every brief starts with explicit choices and an exact outbound preview. Titles, notes, cues, RPE, target settings, bodyweight, joints, photos and private profile/settings are excluded unless the applicable explicit choice exists. Photos are attached manually in ChatGPT, never read or uploaded by this app. Copy and Download are deliberate actions. No model API, account, paid service, new image service or automatic transmission is introduced.

Pasted structured answers are bounded untrusted JSON, separate from performed-workout import. Map exercise names/aliases and review scalar prescriptions plus planned body-area coverage. Accept creates new routine templates; originals/history remain intact. Meal components require confirmed local food/recipe snapshots and exact available units; app arithmetic computes nutrition, preserving unknown versus zero and marking photo portions estimated. Resolve assumptions/questions and explicitly confirm before acceptance. A meal does not complete a diet day or change targets.

Selected historical blocks export canonical accepted values, source dates and effective recorded/current tracking basis; invalid/explicitly unchecked rows and uncommitted amendments are disclosed. Current definitions cannot silently become historical facts or comparable loads. Routine titles can be shown locally for choosing records while remaining anonymized in the outgoing brief by default.

## Saving and preservation

Optional handoffDrafts defaults empty in old backups. Raw text checkpoints before parsing; reviewed snapshots, status and result IDs are validated. Atomic target-plus-draft acceptance, stable tokens, expected revisions, receipt guards and proposal signatures prevent stale overwrites and accidental duplicate acceptance. Existing record IDs/units/photos/import namespaces remain. No database version/store/key renames or history migration occurs.

Resume and Export current draft keep in-memory raw/review input available after Close. Review fields capture immediately; unsaved state is explicit. Replacing unsaved work requires a discard choice; a pending prepared command cannot be replaced. Failure before any checkpoint is honestly limited to the current tab/export, not termination recovery. Durable saved/pending drafts recover through reload/full backup and explicit retry. Exported recovery packages reopen raw plus review without automatic acceptance.

## Actual verification

Builder's final isolated check/build passed; **25 Chromium (29.8s), 25 WebKit (35.2s)** focused cases passed. Independent read-only preservation/privacy review approved the core design and probed no automatic fetch/clipboard/download/photo access, atomic abort/reload/retry, exactly-once results, unchanged history/targets and old-backup defaults. Root added the real R2 alias/R3 body-area integration case, local selection labels and explicit brief-reference caps. Root full combined suites passed **240 Chromium (59.5s), 133 WebKit (1.8m)**, including CSS/static checks. Root then corrected the opt-in target brief to use current scheduled targets with an explicit date (not assumed historical targets) and added a regression. A follow-up Chromium stale-tab test initially raced the other tab’s save; it now waits for the durable receipt/state, with all protection assertions retained. It passed three repeats (5.9s). Final focused suites: **27 Chromium (32.1s), 27 WebKit (37.2s)**. The phone preview was then streamlined: shorter plain-language guidance, recovery details under the format disclosure and a smaller raw-text field after successful parsing. The final UI passed **27 Chromium (34.8s), 27 WebKit (42.4s)**. Exact-source CI/package/live gates are recorded when complete.

## Limits

No physical iPhone/VoiceOver or actual ChatGPT round trip/model-quality study was performed. Manual photos cannot measure exact grams/macros. Routine draft acceptance supports reps and timed targets; conditioning/distance prescriptions use the ordinary builder. Accept creates new routines rather than silently revising a selected existing template. Brief selectors show up to 40 routines (max eight selected), 15 foods and 10 recipes, explicitly disclosed; returned proposals can search all locally saved references. Local draft archive/delete management is not included. Intentional repeated meals/program copies use ordinary app actions because proposal signatures favor accidental-duplicate prevention. Coaching and integrated model services remain separate future work.

## Publication

- Final tested source `2634241e72c793f631f86b9fa2bef21e5ab8f796`; [exact-source Linux CI](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42451694950): **241 Chromium (1.6m), 134 WebKit (3.2m)** passed, without reported flaky/failed cases.
- Deployment `aca52cdc2a1dd7ab7b341816a85aaa80228d15bd`; [Pages run](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42452109123) succeeded. Earlier source `21a09be` was refined for clearer phone review before publication.
- Exact staged package and live HTTPS passed both engines: unselected history absent from default preview; offline raw/review/new-routine and photo-estimate meal acceptance; deterministic confirmed snapshots (150 kcal, 15g protein, unknown carbohydrate, 1.5g fat in the synthetic fixture); estimated portion status; accepted result IDs and history unchanged after backup/reload. No photos were read or uploaded by handoff.
- All 15 non-marker live runtime hashes match the manifest. Both engines passed Cobalt light/dark/light, offline swap/resume/finish, workout import twice without duplication/precision loss, byte-identical photo restoration and offline decode/reload, unchanged retired inventory records, Body-only database v1 and sync off. Zero page errors/network writes in both live flows.
- Actual light/dark review screenshots were inspected. Only 17 allowlisted runtime files were published; no personal data, backups, tests, certificates or planning documents entered the Pages artifact. Main remains unchanged and no force push was used.

All four authorized stages were published separately in order. Physical-device and external model-quality limits above remain open; automated checks do not establish those outcomes.

Current Linux CI logger fixture (100,000 historical sets / 10,000 food entries) measured finish around **1,024ms Chromium / 1,014ms WebKit**, above the proposed 150ms target. These are synthetic runner measurements, not real-device latency or a full Muscle sets query benchmark. No faster performance claim is made for this release.
