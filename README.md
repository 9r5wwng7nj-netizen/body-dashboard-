# Body Dashboard

Your training and your diet in one place. It works offline, installs on a phone's home screen, and keeps every record on your own device.

- **Workouts:** log sets as you train, with supersets, set types and a rest timer; routines and programs; an exercise library; progress stats; Hevy CSV and workout JSON import/export with a separate history review.
- **Nutrition:** search foods or scan a barcode; saved foods and meals; weight trend; an adaptive plan with weekly check-ins; body measurements and progress photos; MacroFactor import.
- **Recipes & Meals:** recipes with their macros, cook mode, a meal plan, Plan my week, a grocery list, pantry and freezer, and saving a recipe from a link.
- **Dashboard:** today's workout, food so far, the weigh-in and dinner, with cards you can reorder or hide.

Body Dashboard started as the fitness and diet half of Life Dashboard. To bring your records across, back up in Life Dashboard (Settings & Sync), then here open **Settings & Sync → Import backup** and choose that file. Only workouts, food, weight, measurements, progress photos and recipes come in.

## Your records

Records stay in the browser on the device you use. Download a backup from Settings & Sync every week or so and keep it somewhere safe. Sync between devices through Google Drive is built but switched off until a Google account is chosen.

## Development

```bash
npm install
npx playwright install chromium webkit   # once
npm test                          # builds CSS, runs the static check and the browser tests
npm run test:webkit               # hosted project-path Safari engine tests
npm start                         # http://localhost:8080
```

See [AGENTS.md](AGENTS.md) for how the code is organized and the rules for changing it, and [docs/DATA_MODEL.md](docs/DATA_MODEL.md) for what is stored.

## Current development direction

The active plan is an iPhone-first web app on GitHub Pages, extending this application with stronger offline recovery and workout-history import. Native/App Store work is deferred. See the [web-first plan](docs/mobile-rebuild/WEB_FIRST_PLAN.md), [current requirements](docs/mobile-rebuild/MASTER_PRD.md) and [Agent D web handoff](docs/mobile-rebuild/PROMPT_D_DEV_TEAM_SPRINT_1.md).

The web Sprint 1 implementation is being released as a personal beta. Physical iPhone/VoiceOver validation remains open. See the [implementation and validation report](docs/mobile-rebuild/outputs/D_SPRINT_1_REPORT.md) for tested behavior and remaining physical iPhone checks. Source and static assets can be hosted publicly; your local health records and backups must stay out of the repository.

## Workout history and offline use

Use **Settings & Sync → Import workout history** for Body fitness JSON, or training-only extraction from Body/Life backups v1/v2. Review source IDs, units and timezone assumptions. Identical records skip; changed records default to keep current. Unsupported/missing-identity records remain in quarantine, with their original training JSON available for export/review. This flow never imports unrelated Life records. Full **Import backup** remains the separate all-supported-records/photo restoration flow.

Check a set to accept and save it. Previous values are suggestions; typed drafts and unchecked populated rows do not become finished performance. Use **Save set changes** to amend a completed set, or **Undo completed set**. A failed action offers **Retry save**, including after reopening when its checkpoint succeeded. If even the checkpoint fails, preserve the tab or export a backup. For a stale-tab conflict, export pending input before explicitly choosing **Reload saved copy**.

For the hosted app, open online until **Ready offline** appears, then use Safari **Share → Add to Home Screen**. Offline reopen needs that prepared browser's storage; clearing site data removes it. Keep downloaded backups outside GitHub. Notifications are optional; rest alarms while Safari is suspended are not guaranteed. For a local service-worker check use `http://localhost:8080/index.html?pwa` after `npm start`. Plain `file://` use has no service worker.

Updates wait until all Body tabs close. Before the first upgrade from older app versions, export a backup, finish saving, and close all older Body tabs; legacy pages cannot participate in the new conflict protocol. Preserve the existing deployed origin/path when publication is later approved. A second path on the same origin shares the same Body database and is **not** a data sandbox. Test only in fresh profiles. No publication, real-data import or account connection was performed for this sprint.

For an unpublished iPhone test over your private Wi-Fi, use the [local HTTPS preview and testing walkthrough](docs/IPHONE_TESTING.md). The helper keeps certificate keys outside this repository and requires manual certificate trust on the phone; no public tunnel or deployment is started.
