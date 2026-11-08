# Approved refresh — QA and release gates

November 7, 2026 · Synthetic data only · QA support for the authorized implementation

## Scope and evidence boundary

The owner authorized implementation and publication of the approved Warm Mineral / Today–Train–Nutrition refresh, including retirement of Pantry, Grocery and Freezer from active UI **and behavior**. Existing records, collection names, nested IDs, canonical units, photo formats and backups remain intact. This QA role does not publish or inspect a personal browser profile.

Read `FEATURE_REVIEW_PLAN.md`, `AGENTS.md` and `docs/BETA_RELEASE.md` alongside this record. The prior release's checks are historical evidence, not a pass for the newly changed source. Integrated focused checks are complete below; the lead owns final full-suite, exact-source CI and deployment verification.

## Tests retained versus changed

| Existing test area | Treatment |
| --- | --- |
| `security.spec.js`, `import-life-dashboard.spec.js`, `web-persistence.spec.js`, `save-recovery.spec.js`, `pwa.spec.js` | Retain rollback, namespace, snapshot, receipt, draft, retry/reload, photo and safe-worker assertions. No UX simplification justifies weakening them. |
| `web-hosted.spec.js` | Preserve project-path service worker, persistent WebKit photo, import-twice/conflict, precision, ownership and scale checks. Include new refresh tests in the WebKit selection. |
| `sync.spec.js` | Sync remains off by default, but collection merge/backup tests protect legacy retired data. Do not drop them because inventory is no longer visible. |
| `meal-plan.spec.js` generator test | Preserve planning counts, tags, recipe reuse and repeated-apply behavior. Replace grocery generation/tab assertions with no retired-data mutation and a Meal plan return. Meal planning remains; shopping does not. |
| `phone-first.spec.js` bottom bar | Assert three-root projection and preserved original four-item `S.bar`; retain quick-add and card preference tests. |
| `fewer-tabs.spec.js`, `daily-use.spec.js`, `refresh.spec.js` tab-specific cases | Replace removed horizontal-tab/editors with named page entry, back-navigation and old-route compatibility. Do not merely delete the test. |
| `smoke.spec.js`, `accessibility.spec.js` route loops | Explicitly enumerate named detail routes. Enumerating only remaining `setTab` buttons would silently stop checking History/Routines/Library/Progress and moved Nutrition screens. Preserve all existing non-navigation assertions. |
| Recipe/card/food tests | Update only changed entry points. Keep unknown-vs-zero, snapshot/portion, broken/missing photo and old data semantics. |

## New independent preservation coverage

`tests/approved-preservation.spec.js` contains four fresh hosted-profile scenarios:

1. Exact Pantry/Grocery/Freezer/gkit backup round trip, preserved `freezerId` references, retirement route handling and offline-independent reload persistence.
2. Marking an old freezer-linked plan made/unmade changes the plan fact but never inventory or implicitly logged nutrition.
3. Old retired mutation handlers are absent or inert. They cannot recreate shopping lists, put groceries away, change stock or add due staples.
4. Three bottom roots derive from the old order while leaving `S.bar`, `hiddenTabs`, `hiddenCards` and `cardOrder` intact through aliases and reload.

Fixtures retain custom unknown fields, fractional quantities, checked shopping items, section/store fields, due staples and an old linked recipe. Complete gkit defaults avoid mistaking legacy helper normalization for an approved mutation. Meal-planner `planPrefs` changes should be distinguished from retired shopping budget/staples/spend data; a generator test should assert only authorized planning preference changes.

Existing full-backup/photo and training-import tests remain the primary byte/identity checks. Do not add real health exports to the repository or reuse the user's Safari/Chrome profile.

## Required release sequence

1. Integrate the code patches; run `npm run build:css` and `npm run check`. Review action collisions, delegates and escaped strings. Keep database `body-dashboard` version 1 and collections unchanged.
2. Run the full `npm test -- --workers=2` and `npm run test:webkit` **sequentially** so the shared test-results folder is not overwritten by parallel engines. Include approved training, nutrition and preservation scenarios in WebKit.
3. Inspect representative 390px and 375px screens in both themes, with 200% text and a shorter Safari-height viewport. Scan all named screens and dialogs with axe after a painted frame; report the actual location, target, HTML and `failureSummary`, not just the rule name. Verify keyboard focus, touch target dimensions and timer/Resume/entry boundaries.
4. Run the meaningful retirement scenarios against populated legacy collections, then full backup replace/merge/restore. Old freezer-linked meal display and explicit made/log actions must not decrement stored stock or generate shopping data. Old aliases must explain retirement without a blank page.
5. Review the source diff and package contents. No personal fixtures, backups, secrets, private screenshots, local certificates, node_modules, tests or planning artifacts enter the deployment. Commit/push the reviewed source to the beta branch without changing main or force-pushing.
6. Wait for the **exact source SHA** to finish the GitHub Checks workflow successfully. Do not substitute a previous green run. The prior `/tmp/bd-publish-spacing.py` contains a historical hard-coded run ID; update/replace its guard for the new run, never bypass it.
7. With a clean runtime working tree matching that SHA, call `node scripts/package-beta.mjs EMPTY_TEMP_DIRECTORY FULL_SOURCE_SHA`. It copies allowlisted runtime assets, writes asset hashes and derives a new `beta-<sha>` worker generation. Run staged Chromium/WebKit offline smoke against that exact package.
8. Advance `gh-pages` with a new commit whose parent is the current deployment commit. The existing temporary-index/commit-tree approach avoids checking out/resetting the app worktree. Compare the local and remote old branch SHA first and push normally; no force push. Only the root publisher performs this action.
9. Wait for Pages deployment success for the new deployment SHA. Fetch live `release.json`; verify its source SHA and every served runtime hash. `.nojekyll` is a build marker, not a required served app URL. Do not assume a fixed asset count if approved runtime assets changed.
10. Use new test-owned persistent Chromium/WebKit profiles against live HTTPS. Verify the three roots, Warm Mineral light/dark, retired UI absence, Ready offline, offline reopen/log/finish, safe swap/reload where exposed, import twice without duplicates, and full backup with byte-identical local photo decoding. Observe zero unexpected network writes and page errors. Destroy only those owned synthetic profiles afterward.
11. Update `docs/BETA_RELEASE.md` with exact source/deployment/run links, actual pass counts and remaining limitations. A later docs-only `[skip ci]` commit must not contain runtime changes. Provide the same personal-beta URL and update instructions that never clear site data.

The current deployment helper and live smoke are useful starting points, not a new release's evidence. `/tmp/bd-beta-source-commit.txt`, package path and run IDs must all be refreshed for the exact candidate.

## Release limitations to state plainly

Automated Chromium/WebKit checks do not establish physical iPhone safe areas, native keyboard behavior, Home Screen termination reliability, VoiceOver or human gym comfort. Keep the exact observed test results separate from proposed tap/time targets. Browser storage remains local and may be cleared by the user/platform; preserve the existing backup/retry/update-waiting model rather than forcing reload over pending work.

## Actual work completed by this QA role

- Read the current agent guide, approved plan, prior release record, package helper, CI/browser configuration and relevant preservation/UX tests.
- Reviewed the existing local publication helper and live smoke without publishing or accessing credentials.
- Added independent synthetic preservation tests and, at the lead’s request, updated smoke/accessibility route inventories and keyboard navigation assertions. Syntax checks passed for the owned test files. The lead additionally assigned intentional-UX updates in phone-first, daily-use, fewer-tabs, refresh and meal-plan specs; their non-UX domain assertions were retained. Detailed axe output now preserves each route, target, HTML and failure summary.
- Runtime/index/CSS, other agents' owned test files and deployment branches have not been modified by this QA role. The lead assigned the seven existing UX/smoke/accessibility test updates explicitly; all domain/backup/reset/namespace assertions remain.

### First integrated focused run

`npx playwright test tests/approved-preservation.spec.js tests/smoke.spec.js tests/accessibility.spec.js tests/phone-first.spec.js tests/daily-use.spec.js tests/fewer-tabs.spec.js tests/refresh.spec.js tests/meal-plan.spec.js --workers=2 --output=/tmp/bd-qa-results`: **38 passed, 4 failed**, 10.3 seconds. The four independent preservation cases and explicit named-page smoke passed. All-page contrast scans found no contrast failure, but identified an unlabeled Training progress exercise selector in both themes. The lead was notified for a runtime accessible-name fix. Two test adaptations were corrected: seed `Store.set('gkit', k)` now that `gkit()` returns a pure defaults view, and accept the new compact summary's exact 120px boundary rather than requiring less than 120px. Follow-up results are recorded separately.

### Focused follow-up — passed

After the lead added an accessible name to `progEx` and the two fixture/boundary adaptations above:

- All **42 owned Chromium cases passed**, 9.7 seconds, using `/tmp/bd-qa-results`. This includes all seven existing updated specs and `approved-preservation.spec.js`; domain/backup/reset/namespace assertions remained intact.
- A separate temporary WebKit configuration ran `accessibility.spec.js` plus `approved-preservation.spec.js`: **12 passed**, 8.5 seconds, using `/tmp/bd-qa-webkit-results`. All 11 named pages in both themes, Settings/common dialogs, keyboard entry/back focus and four retired-data scenarios passed. No color-contrast or accessible-name issues remained in those scans.
- Browser contexts were fresh and test-owned. No existing profile or health export was read. No runtime edits were made by this QA role.
- Logs: `/tmp/bd-qa-owned.log`, `/tmp/bd-qa-webkit.log`. The temporary WebKit configuration intentionally avoids applying old file-photo tests to ephemeral WebKit Blob storage; existing hosted persistent-profile photo tests remain required.

These focused results do not replace the lead’s final full-suite, exact-source CI, staged-package and live-deployment verification. Physical iPhone/VoiceOver remains a separately recorded limit.
