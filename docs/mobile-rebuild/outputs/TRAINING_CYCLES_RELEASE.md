# Training cycles — beta verification

The update adds private multi-week cycle import, per-set prescriptions, optional training-max setup, loaded-distance logging and compact warm-up blocks. It extends the existing static app; it does not introduce accounts, sync, AI requests or a new data service.

## Preservation

- IndexedDB remains `body-dashboard`, version 1, with the original stores. `trainingCycles: []` and optional routine/session/target fields are additive.
- Import adds linked routines and preserves existing workouts, exercise definitions, nutrition, retired inventory collections and photos. Re-importing the same source opens its existing cycle; a changed source ID is refused.
- Actual logged values stay separate from prescriptions. Unset TMs do not borrow old loads, AMRAP requires actual reps, and RPE targets do not become observations.
- Base/ramp TM and date changes affect future starts. Existing and active target snapshots remain unchanged. The muscle-set planner derives the current calendar week's row counts without rewriting stored routines.
- Full backups include cycles, calibrated TMs, pending intents and photos. Old backups remain compatible. Export cycle is the original prescription only; use full backup for configured TMs.
- Source packages and private delivery references are excluded from the allowlisted public runtime. Validation and browser tests use synthetic data and fresh profiles.

## Verification

Exact runtime source: `89214bab54d4f5149e36ad158c1c837f615ea044`.

[GitHub checks](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42477440027) passed: `npm test` **256 passed**, `npm run test:webkit` **149 passed**. Static checks and CSS build passed. The focused cycle suite has 15 scenarios, including stale-review protection, import retry/backup restart, week-specific counts, optional TMs, AMRAP, short-distance precision, enlarged layouts and warm-up expansion.

The final staged package passed in Chromium and WebKit at the GitHub Pages project path:

- offline reload, private-package preview/import, calibration and explicit target acceptance;
- exact yards-to-km draft, commit and reload handling without invented duration;
- failed set save retained in an intent, backup captured, original recovery completed, explicit backup restoration and pending retry;
- existing synthetic workout IDs/precision, recipe photo bytes, retired inventory values and calibrated TMs preserved;
- no page exceptions, no non-GET/HEAD network requests, database version 1 and sync off;
- Cobalt Air light/dark visual review and no serious/critical automated WCAG contrast/accessibility violations in the cycle flow;
- 375/390px and 200% text covered by the focused suite; the native WebKit week picker was corrected and verified at 44px. Warm-up expansion remains open while saving.

[Pages deployment](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42477987010) passed from deployment commit `7c4dcac0f3285fb3486c2e3bda86b98a5238d3a0`.

The [live beta](https://9r5wwng7nj-netizen.github.io/body-dashboard-/) reports the exact tested runtime source. All 15 non-marker asset hashes in its manifest matched. The public package contains 17 allowlisted files and excludes personal cycle packages and delivery references.

Live verification passed in fresh Chromium and WebKit profiles: offline swap/minimize/resume/finish, history import twice, exact backup/photo restoration and reload, Cobalt Air theme switching, plus the complete new cycle/import/target/recovery flow described above. No page exceptions or network writes were observed. Original database namespaces/version and disabled sync were verified. No real user browser profile or health records were used.

## Practical limits

Physical iPhone Safari/Home Screen, VoiceOver and OS suspension behavior still need device testing. Automated WebKit is useful coverage, not a claim of physical-device acceptance. Storage clearing can still remove browser data; retain private backups.

Progression remains reviewable and manual: no automatic two-miss TM reduction, accessory load change or bodyweight-to-belt transition. No clinical/readiness inference or prohibited cardio logging. A linked cycle's source exercise schedule is not edited through the scalar routine editor; session swaps remain available. See [TRAINING_CYCLES.md](../../TRAINING_CYCLES.md) for the package contract and domain boundaries.
