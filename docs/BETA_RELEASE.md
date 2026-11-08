# Body Dashboard — personal beta release

Published November 7, 2026 (America/New_York).

**Warm Mineral personal beta — open on iPhone:** https://9r5wwng7nj-netizen.github.io/body-dashboard-/

## Release identity

- Tested source: `25d1c96bf8e10003323dc34c66720d2f7a46df0b`, branch `beta/personal-web`.
- Deployment: `35d2c922fe396cdb46b1d4b807ff86c979e26340`, branch `gh-pages`, root folder.
- [Passing source checks](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42441864544).
- [Successful Pages build/deployment](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42442129865).
- [Public release manifest](https://9r5wwng7nj-netizen.github.io/body-dashboard-/release.json) records source and SHA-256 asset hashes.

The deployment contains 17 allowlisted package files: app HTML, service worker, manifest, CSS, icons, pinned libraries/licenses, `.nojekyll` and the release manifest. No backups, credentials, certificates, local preview tools, tests or planning documents are in the Pages artifact. The public source branch contains reviewed code/tests and synthetic planning fixtures. Main was retained; no force push was used.

`node scripts/package-beta.mjs EMPTY_OUTPUT_DIRECTORY SOURCE_COMMIT` creates this package. It refuses a nonempty destination and rejects unexpected backup/key/JSON files. The packaged worker gets a cache generation derived from the tested source commit, so later deployments can install a new complete shell without forcing reload over active work. Keep Pages configured to `gh-pages` at `/`.

## Checks actually run

- Final local `npm test -- --workers=2`: **170 passed**, 43.6 seconds, including CSS/static checks.
- Final local `npm run test:webkit`: **63 passed**, 44.9 seconds.
- GitHub Linux runner on the exact tested source: **170 Chromium passed (1.1m)** and **63 WebKit passed (1.5m)**.
- The first candidate's Linux WebKit run caught native progress-photo file-control overflow at 375px. The final source bounds that control, and the same unchanged layout assertions passed. A subsequent local run exposed transient button contrast during theme interpolation; foreground/background now change together. Three focused Safari repeats and the final full suites passed. No failing candidate was published.
- Both engines passed the exact staged package and an expanded offline workflow: accept a set, safely swap, minimize/resume, finish, import fitness JSON twice without duplicates or lost precision, restore a full backup with byte-identical local PNG, decode the photo offline and reload. The staged localhost harness explicitly enabled its test-only `?pwa` switch.
- All **15 non-marker runtime files** listed in the actual live release manifest matched their SHA-256 hashes. The release manifest was fetched separately; `.nojekyll` is a build marker.
- Fresh, isolated persistent Chromium and WebKit profiles passed the expanded workflow against the **live HTTPS site**. Both confirmed three navigation roots, Ready offline, unchanged retired Pantry/Grocery/Freezer/gkit records, `body-dashboard` v1 and sync off, with **zero page errors and zero network writes**.
- Synthetic records lived only in owned profiles, removed afterward. No personal browser profiles, health records or credentials were inspected during validation. Repository tests also cover recipe/progress photo preservation and failed-write recovery.

## Warm Mineral update

- **Today / Train / Nutrition** replace long subnav rows while preserving legacy navigation/dashboard preferences. Train leads with routines; History and Progress are named pages. The active workout keeps its focused Minimize/Resume, timer and Finish controls.
- A shared **offline exercise picker** supports browsing, aliases, muscle/equipment filters, recent context, ordered multi-select and explicit custom exercises, including routine editing and mid-session additions.
- **Session-only swaps** preserve completed original exercise/set identities. Replacements begin unchecked; prior loads, RPE and observations are not relabeled. Recovery is idempotent. Undo refuses to erase subsequent work. A partially completed superset places the replacement after the original group.
- **Routine set coverage** separates primary sets and secondary exposures, lists contributors and unmapped/timed work, and offers labeled fractional credit and an explicit repeats/week scenario. It does not diagnose routine quality or injury/readiness.
- **Nutrition Library** brings distinct foods, saved meals and recipes into one searchable workspace, retaining photos, favorites, portion logging, meal planning and definition editing. Old consumption remains a snapshot; unknown nutrients remain unknown.
- **Pantry, Grocery and Freezer** controls, action handlers and automatic shopping/inventory mutations are retired. Their original collections, identifiers, quantities, metadata and legacy references remain readable and round-trip through backups. No inventory deletion or data migration occurs.
- **Warm Mineral** supplies coordinated light/dark colors, clearer surfaces and actions, native fonts, touch targets and enlarged-text reflow. Automated route coverage includes 375px and 390px, both themes and 100%/200% text; accessible names, keyboard paths and contrast are checked.

See `docs/product-review/2026-11-07/IMPLEMENTATION_REPORT.md` for behavior, preservation and intentional limits.

## Earlier beta history

The prior focused-interface source was `fa734b77e064cae7b3e3b64502a427802bec7c0d`, deployed as `1682a2ae40b73edbea609601ddd860d55ddf638f`. It removed the sidebar and introduced focused workout logging. The initial beta source was `98515a08138b7453b4c0a60e05282ff6575b11d9`, deployed as `65af0a3788f36cc3fc17dcbd7262deaa5b98b0f4`. Warm Mineral advances the existing Pages branch normally; no force push or browser-data reset was used. Main remains unchanged. Personal reference screenshots are excluded from source and artifacts.

## Records and updates

IndexedDB is still `body-dashboard`, version 1, with `kv`, `photos`, `local`; all collection names and units/identities remain compatible. `bd.*` and project-scoped `bd-shell-*` names remain separate from Life Dashboard. Sync is off. No application data was uploaded to GitHub or migrated automatically.

A new URL/browser/Home Screen context can have separate local records. Data from the Mac or private Wi-Fi preview does not automatically appear at the public beta URL. Keep original exports and bring copies through the supported importer. Never clear browser storage as an update/retry step. Export a backup before discarding pending input or changing origins.

Updates install in a waiting worker and activate after controlled Body tabs close. Save/export first, close old Body tabs, then reopen. Do not force-reload/clear site data to get an update over unsaved work. Deploying code does not restore or roll back browser records; recovery and backup restoration are separate user actions.

## First iPhone test

1. Export/keep an untouched backup from whichever app currently holds your records.
2. Open the beta link in ordinary Safari. Share → Add to Home Screen; enable Open as Web App if offered. Launch that Home Screen icon and wait for **Ready offline** there.
3. Create a disposable workout, enter dummy values, and wait for **Saved on device**. Turn on Airplane Mode and explicitly turn Wi-Fi off. Close/reopen from the Home Screen and resume it.
4. Accept/edit/undo a set, leave another populated row unchecked, and finish. History should contain only the accepted set. Reopen offline and confirm it persists.
5. Reconnect and put a copy of your Body workout JSON or full Body/Life backup in Files → On My iPhone. In the Home Screen app choose Settings & Sync → Import workout history. Review counts/IDs, units/timezone and conflict choices; keep current/skip is the default for changed records. Import selected, inspect older/newer workouts, then import the same file again to check that no duplicates appear. Hevy CSV uses its separate existing importer.
6. Training import excludes unrelated Life content, nutrition, recipes and photos. Full Import backup is a separate restoration flow; do not use Replace to bypass an import conflict.
7. Export **Back up records + photos** from the beta to Files. Check both themes, larger text, the decimal keyboard, touch controls and VoiceOver; report the device/iOS and any issue.

No local preview certificate, Mac server, App Store membership or sync account is needed for this published address. The optional local preview certificate can be removed after you export anything you want to keep from that preview.

Physical iPhone/Safari/Home Screen/VoiceOver acceptance is still open. Desktop browser automation does not establish those results. Large-history finish remains slower than the proposed 150ms target (the final Mac probes were about 0.41–0.57 seconds for 100,000 sets, and Linux CI probes about 0.98–1.02 seconds); this is a personal beta, not a completed coaching portal or complete diet/analytics MVP.
