# Prompt D Dev Team Sprint 1

> Archived native execution prompt, preserved November 7, 2026. Do not execute for the active route. Use [the revised web Agent D prompt](PROMPT_D_DEV_TEAM_SPRINT_1.md).

You are the Development Team for Body Dashboard Sprint 1. Implement the approved native workout vertical slice with TypeScript database layers and a React Native logging matrix. Running this prompt authorizes that local Sprint 1 implementation; it does not authorize publishing, connecting real accounts, production sync or migrating personal data.

Repository: https://github.com/9r5wwng7nj-netizen/body-dashboard-

Read `AGENTS.md` and every planning/input artifact in `docs/mobile-rebuild/`, especially the master PRD and outputs from Agents A–C. Require `outputs/C_SYSTEMS_ARCHITECTURE.md`, `outputs/C_DOMAIN_CONTRACTS.ts` and native compatibility evidence. If the approved engine/contracts are missing or contradicted by the installed native toolchain, report that concrete blocker before building around a different engine. Do not invent prior approvals or silently change architecture.

Preserve the current web app and all existing worktree edits. Build the new, explicitly authorized native application in an isolated `mobile/` project, or the location selected in Agent C's architecture. The old instruction to keep web app code in index.html continues to govern that application; this native project is a separate implementation. Never touch a personal browser database, Life Dashboard storage or real health exports. Use synthetic fixtures.

Implement in this order:

1. Bootstrap the approved Expo/React Native/TypeScript project and iOS development build. Pin compatible dependency versions and provide reproducible setup commands. Build against the actual selected native database adapter; test doubles alone are insufficient.
2. Add versioned schema/migrations, models and scoped repositories. Create a local workspace/actor/athlete without mandatory sign-in. Every owned query and write takes validated scope, and related rows cannot cross scopes. Use offline-generated stable IDs and preserve source IDs separately.
3. Implement StartSession, row draft editing, CompleteSet, UndoSetCompletion, timer deadline persistence, FinishSession and active-session restoration. Use transactional, idempotent commands. A failed write retains recoverable input, provides retry and never marks an unsaved set as saved.
4. Build the matrix from Agent B's specification: previous/ghost values, load/reps keypad and focus, one-action acceptance of valid suggestions, set types, completion state and optional RPE/joint detail. Ghost values never count as observations. Row updates must not rerender or rescan all history on every keystroke.
5. Add a compact timer that does not block logging and reconstructs from its deadline after backgrounding. Notifications are optional; denied permission must not break the timer. Prevent duplicate timers or completed sets from double taps.
6. Add minimal history detail and a local file import path for existing fitness JSON: preview, source mapping, duplicate/change detection, transactional commit and reconciliation. Preserve training field values, nested order and unsupported training details. A session with non-strength tracking types must remain recoverable even if Sprint 1 offers only a generic detail view for them. Full backup envelopes and direct Hevy import can be scheduled after this vertical slice unless Agent C explicitly includes them here.
7. Extract and test the approved E1RM/delta and EWMA functions as pure TypeScript where they are dependencies of the slice. Do not fabricate bodyweight observations or comparable-load context. Diet UI, full native backup/restore, broader analytics and all coaching screens remain subsequent MVP work; define their planned interfaces without filling screens with placeholders.

Required validation:

- Typecheck/lint, pure-domain/analytics tests and real database integration tests.
- Fail a set commit, retry it, and prove there is exactly one completed record after relaunch.
- Force terminate and relaunch after acknowledged set completion and workout finish. Restore the active session and timer accurately when unfinished.
- Import synthetic history twice without duplicates; present a conflict for changed content under the same source ID; fail midway without half-visible workouts; reconcile values, notes, IDs, units and counts.
- Negative workspace/athlete tests for reads, writes, parent-child links and exports/interfaces where implemented.
- iPhone layout at 390pt and the approved smallest device, light/dark themes, enlarged Dynamic Type, VoiceOver reading/activation, 44-point targets, keyboard focus and safe areas. Separate automated semantics from live VoiceOver/device evidence.
- Offline logging with network unavailable. Measure UI feedback and local commit latency using the approved dataset/device and PRD targets. Report measured percentiles and sample size rather than claiming zero latency.
- Re-run existing web checks if shared tooling is changed; never reset another contributor's edits to obtain a clean test run.

Deliver source code, tests, synthetic fixtures and `docs/mobile-rebuild/outputs/D_SPRINT_1_REPORT.md`. The report must list what works, commands and actual results, device/simulator/build versions, tested failure modes, compatibility or performance gaps and remaining MVP tasks. Identify any acceptance criterion that remains unverified. Include a short local demonstration path: launch → start session → accept/edit a set → timer → terminate/relaunch → finish → inspect history → import synthetic history.

Do not claim the entire MVP is complete after this slice. Keep the next sprint scoped to completing diet, analytics, migration and portability requirements in the approved PRD. Finish with a reviewable change summary and concrete remaining work.
