# Body Dashboard refresh — validation

**Later web sprint:** [D Sprint 1 report](mobile-rebuild/outputs/D_SPRINT_1_REPORT.md) supersedes the save-journal, fallback and WebKit limitations below. This document records the earlier refresh run.

Validated locally on November 7, 2026. All fixtures were synthetic. Browser tests used fresh Playwright profiles, never a personal browser profile.

## Results

- `npm test -- --workers=2`: **100 passed**. This command rebuilds CSS, runs the static checker, and runs the complete browser suite.
- Static checker: both inline scripts parse, no duplicate top-level functions, no undefined or colliding actions, local runtime dependencies, and all 51 numeric fields specify their keypad.
- `git diff --check`: passed.
- Targeted weight-chart test rerun after adding its screenshot capture: passed.

| Area | Verified behavior |
| --- | --- |
| Save recovery | Aborted IndexedDB writes retain failed keys; successful keys persist; newer edits made during a write are not lost; retry persists through reload. Background and lifecycle failures produce no unhandled rejection. Pending entries can be exported. |
| Workout finish | An aborted history/active-state transaction leaves the saved active workout intact. Retry saves exactly one history record and clears active state, surviving reload. |
| Fallback storage | IndexedDB unavailability and localStorage quota failure retain pending data and reject a failed flush; retry survives reload. |
| Save feedback | Weight logging does not announce success on a failed write. Recovery controls retain keyboard focus after a failed retry. |
| Today | Direct food, weight and start/resume paths work. Logged zero is distinct from an empty log. Calorie preference, hidden cards, card ordering, weight units and active workout IDs are retained. |
| Workout count | Dashboard, Workouts, active view and finish summary agree. Tests cover a Sunday local date that is Monday in UTC, Monday starts, backdating, date edits, future dates and active state. |
| Weight | Empty, single-reading and sparse histories; real calendar spacing; seven-day mean from available readings; kg/lbs conversion; future measurements excluded from current presentation without deletion. No connecting trend across gaps outside the averaging window. |
| Recipes | Missing images, failed remote URLs, unavailable local blobs and broken image bytes preserve names, known zero nutrition and keyboard access. Saved photo references and remote links remain unchanged. |
| Phone and text | 390px touch contexts in light and dark themes. At 200% root text size, Today actions remain fully reachable above the bottom navigation; Dashboard, Recipes and Workouts fit without page-level horizontal overflow. New Today actions are at least 44px in both dimensions. |
| Accessibility | Existing keyboard, dialog focus, focus restoration and live-announcement tests pass. axe WCAG 2 A/AA and WCAG 2.1 AA scans pass across views and dialogs in both themes, plus populated refreshed screens at enlarged text size. |
| Offline and restore | Hosted service-worker reload works offline. Version 2 restoration preserves recipe/food IDs, units, photo links and byte-identical recipe/progress PNG blobs. Both restored image types load offline. Legacy and Life Dashboard import compatibility tests pass. |
| Boundaries | Body Dashboard storage namespace tests pass. No collections, database/store names or persisted record fields changed. `DRIVE.clientId` remains empty. No AI logging or image service was added. |

## Visual review

Reviewed generated phone screenshots of Today in light mode, enlarged dark mode, the dark recipe card with a long title and missing photo, and the weight chart with sparse synthetic measurements. The enlarged page requires vertical scrolling; each daily action was separately checked for reachability. The weight chart has a text summary independent of the SVG.

Reproducible screenshots are generated under the ignored `output/playwright/` directory by `tests/dashboard-refresh.spec.js`.

## Remaining limits

- Manual VoiceOver/TalkBack sessions and physical iPhone/Android checks have not been performed. Automated semantic/contrast checks are not a claim of full accessibility compliance.
- Browser coverage for this run is Chromium; Safari/WebKit and Firefox were not tested.
- Pending changes are kept in the open tab, with retry/export and a browser exit warning when supported. Closing the tab before successful recovery or export can still lose pending data; no persistent recovery journal was added.
- localStorage cannot commit multiple keys atomically. Workout history is written before clearing active state; interruption can leave a duplicate active copy. Re-finishing replaces the existing history record with the same ID.
- Existing recipe photo uploads still write the blob and recipe reference separately. This refresh preserves that storage design; pending recipe changes should be retried or exported before closing the tab.
- This is a local implementation. No deployment, account connection or live user-data migration was performed.
