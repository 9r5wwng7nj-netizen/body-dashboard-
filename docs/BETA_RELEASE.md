# Body Dashboard — personal beta release

Published November 7, 2026 (America/New_York).

**Open on iPhone:** https://9r5wwng7nj-netizen.github.io/body-dashboard-/

## Release identity

- Tested source: `fa734b77e064cae7b3e3b64502a427802bec7c0d`, branch `beta/personal-web`.
- Deployment: `1682a2ae40b73edbea609601ddd860d55ddf638f`, branch `gh-pages`, root folder.
- [Passing source checks](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42436234440).
- [Successful Pages build/deployment](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42436452466).
- [Public release manifest](https://9r5wwng7nj-netizen.github.io/body-dashboard-/release.json) records source and SHA-256 asset hashes.

The deployment contains 17 allowlisted package files: app HTML, service worker, manifest, CSS, icons, pinned libraries/licenses, `.nojekyll` and the release manifest. No backups, credentials, certificates, local preview tools, tests or planning documents are in the Pages artifact. The public source branch contains reviewed code/tests and synthetic planning fixtures. Main was retained; no force push was used.

`node scripts/package-beta.mjs EMPTY_OUTPUT_DIRECTORY SOURCE_COMMIT` creates this package. It refuses a nonempty destination and rejects unexpected backup/key/JSON files. The packaged worker gets a cache generation derived from the tested source commit, so later deployments can install a new complete shell without forcing reload over active work. Keep Pages configured to `gh-pages` at `/`.

## Checks actually run

- Local final `npm test -- --workers=2`: **140 passed**, 29.8 seconds, including CSS/static checks.
- Local final `npm run test:webkit`: **33 passed**, 27.7 seconds.
- A final hidden-History minimize fallback was then checked with the five navigation scenarios in each engine (all passed); the GitHub runner below tested the exact final source.
- GitHub Linux runner: full Chromium and hosted WebKit commands passed for the source commit above.
- Both browser engines passed a separate test against the exact staged package, including offline reopen/finish/reload.
- All 15 non-marker runtime files listed in the live release manifest matched their expected SHA-256 hashes. The release manifest itself was fetched separately; `.nojekyll` is a build marker.
- Fresh, isolated persistent browser profiles tested the actual live HTTPS site in Chromium and WebKit: Ready offline; offline reopen; explicit set acceptance; unchecked-row exclusion on finish; fitness JSON imported twice without duplicates; original precision; full backup restoration with byte-identical local PNG and offline image decoding; final reload.
- Live verification had zero page errors and zero network writes. Synthetic records lived only in the test profiles, which were removed afterward. No personal browser profiles, existing health records or credentials were inspected during app validation.
- Deployment review caught and fixed a Linux font/scrollbar overflow at 200% text. Card headings and actions now wrap. The regression also reserves scrollbar space and uses a portable font locally. The initially failing CI run was not published; only the subsequent passing source was packaged.

## Focused interface update

The November 7 update replaces the left drawer with four bottom destinations at every width, retaining saved navigation and dashboard preferences. Header controls provide quick adds, Help and Settings. Active sessions show a focused timer/Finish header, compact stats, flat exercise sections and wider set values. Minimize and Resume keep the same workout; a hidden History preference falls back to Dashboard. Set numbers open type/removal options. Optional adjustments retain expansion while editing. History previews exercises, with calendar/totals and full details available by expansion. See `docs/FOCUSED_INTERFACE.md`.

The initial beta source was `98515a08138b7453b4c0a60e05282ff6575b11d9`, deployed as `65af0a3788f36cc3fc17dcbd7262deaa5b98b0f4`. The intermediate spacing commit was checked but not deployed separately; it is included in the focused interface release above. The deployment advances the existing Pages branch normally. No force push or browser-data reset was used.

After the focused interface deployment, fresh Chromium and WebKit profiles verified all 15 public runtime hashes, the absence of a sidebar, focused Finish access, offline finish/import-twice/reload, and byte-identical photo backup restoration. Both had zero page errors and zero network writes. Personal reference screenshots were not added to source or artifacts.

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

Physical iPhone/Safari/Home Screen/VoiceOver acceptance is still open. Desktop browser automation does not establish those results. Large-history finish remains slower than the proposed 150ms target (the prior Mac probes were about 0.4–0.6 seconds for 100,000 sets); this is a personal beta, not a completed coaching portal or complete diet/analytics MVP.
