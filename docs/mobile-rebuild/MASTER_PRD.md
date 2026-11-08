# Body Dashboard — web-first product requirements

Version 0.2 · November 7, 2026 · Product owner: Seth · Delivery owner: technical team lead.

**Active route: free GitHub Pages web app, optimized for iPhone Safari and Home Screen use.** This replaces the native-first draft, preserved in [the native archive](MASTER_PRD_NATIVE_ARCHIVE.md). Use the [web execution plan](WEB_FIRST_PLAN.md) and revised [Agent D handoff](PROMPT_D_DEV_TEAM_SPRINT_1.md). Xcode and the native database spike no longer block this release.

## Outcome and boundaries

Make daily training/diet logging quick, reliable and understandable while preserving existing records. The first user is an experienced lifter/personal trainer logging personal activity. Existing workout history must import without re-entry. Client coaching remains Phase 2.

Develop the current vanilla JavaScript application in place. Preserve Dashboard, Workouts, Nutrition and Recipes & Meals, quick actions, hidden-card/tab preferences, calorie-left/eaten preference and ordering. The native Train/Diet/Progress/History concept informs task grouping; navigation replacement is outside Sprint 1.

The public site serves code/assets; logs/photos stay in the local browser database. Imports are user-selected local files. No compulsory login, backend, cloud sync, App Store membership, paid domain, AI logging or new image service. The revised Agent D workout slice is now implemented locally; see [Sprint 1 results and remaining release gates](outputs/D_SPRINT_1_REPORT.md). Deployment remains unauthorized. This does not complete the broader diet/analytics MVP.

## Principles

- Logging/correction takes priority over extra dashboards or coaching setup.
- Suggestions, editable drafts, pending writes and confirmed local saves are distinct.
- New completion requires explicit acceptance and successful persistence. Never copy previous RPE/joint observations as current facts.
- Preserve source IDs, raw observations, units and precision. Label estimates with method/date/comparable context.
- Missing stays unknown; zero is a value. Partial dietary logging is not a complete day.
- Browser storage can be cleared/evicted. Offline use requires a prepared shell and available storage; backups remain essential.

## Personal MVP

| Area | Required behavior and acceptance |
| --- | --- |
| Installation | HTTPS site usable in Safari and from the Home Screen. Document tested device/iOS and initial online preparation. No Apple membership/payment gate. |
| Offline shell | After preparation, close/reopen/reload offline with saved records. No remote runtime dependency. A failed update retains a usable prior shell. |
| Workout logging | Start from routine/history/empty; resume; show dated previous values and current drafts. One-action valid suggestion acceptance, edit/undo, set types, supersets and optional RPE. Ghosts never enter completed metrics/history. |
| Save recovery | Saved feedback follows IndexedDB transaction completion. Retain failed input/retry. Acknowledged records/drafts/intents survive tested reload/termination; unknown outcomes are resolved before replay. If no write succeeds, disclose that latest text is unacknowledged. |
| Lifecycle/timers | Finish history and clear active state consistently, without duplicate IDs on retries. Non-blocking deadline timer restores after suspension/reopen. Foreground fallback if notifications are denied/unavailable; no guaranteed background alarm. |
| History import | Fitness JSON and training fields from full Body/Life backups v1/v2; preview IDs/counts/units/timezone assumptions, duplicates/conflicts and retained issues. Atomic, idempotent commit and reconciliation after reload. No manual re-entry or silent same-ID overwrite. |
| Diet | Preserve offline manual/saved-food/meal/portion flows. Clear energy/P/C/F, direct portion corrections, optional daily completeness, consumption snapshots so food-definition changes cannot rewrite past intake. |
| Progress | Comparable E1RM/deltas and honest sparse weight history. Optional labeled EWMA after verification; preserve the current seven-day average and preference until explicitly changed. |
| Portability | Keep full backup compatibility, IDs/units/photo links and locally stored photo bytes. Optional new recovery/import metadata has a backward-compatible export/restore path. Workout-only import remains separate from full restoration. |
| Accessibility | Both themes, keyboard/VoiceOver, 44×44 CSS-pixel controls, safe areas and text enlargement. Compact rows only where they fit; stacked/detail fallback at 375px/enlarged text. |

Sprint 1 focuses on persistence/offline preparation → logging/correction/timer → history import → iPhone validation. Existing diet/recipe features remain usable and regression-tested. New diet snapshot/status refinements, broader analytics and scale tuning follow; Sprint 1 is not the entire MVP.

## Data and architecture constraints

Follow repository `AGENTS.md`. Keep application code in `index.html` and current event/component patterns. Preserve IndexedDB **body-dashboard version 1**, stores **kv/photos/local**, localStorage **bd.*** and caches **bd-shell-***. Never write Life Dashboard namespaces, rename/delete collection keys or replace the database to implement this plan.

Add optional fields/metadata with legacy fallbacks. Retain current nested workout/routine shapes, IDs and ordering. New nested IDs or ownership metadata cannot require rewriting old records. Preserve stored kg, km and seconds; retain unknown training fields and source precision.

Use one coordinated Store write path, not a second writer beside its debounce. Proposed recovery/import metadata uses prefixed keys in the existing local store; its versioned payload/backup extension must be documented before coding. Canonical mutations, receipts and intent resolution commit together when IndexedDB is available. localStorage fallback is explicitly degraded: no atomic multi-key or photo guarantee.

C's native contract supplies semantic lessons, not a browser migration. No 41-table normalization, WatermelonDB/expo-sqlite, mobile/ project or mandatory TypeScript/framework rebuild for this sprint.

Optional local actor/workspace/athlete metadata can default legacy records to the single local profile without changing IDs. New command/query boundaries carry scope. This prepares attribution, not secure multi-tenancy: Phase 2 still needs server authorization and compatible storage/services.

## Workout import contract

Accept unversioned app:body-dashboard/type:fitness JSON containing workouts/routines/programs/exMeta, plus full Body/Life v1/v2 envelopes containing data.workouts. Do not invent a numeric version for fitness exports. Preserve current full-backup restoration separately, including photos/nutrition/recipes; a workout import must never invoke whole-app Replace.

1. Validate a user-selected file locally, with size/depth limits and no remote fetch/code execution.
2. Preserve existing records/source IDs. Recognize logical source lineage across envelope types; title/date and export time are not identity.
3. Skip identical known records. Changed source/local content requires explicit Keep current/Use source/Exclude and a retained source/before-image; default is no overwrite.
4. Preserve repeated exercises, nested order, supersets, set types, RPE, notes and all seven tracking types. Missing nested IDs use deterministic auxiliary mappings, never name collapse.
5. Preserve timestamps and state grouping-timezone assumptions explicitly. Legacy history does not prove every set was checked; do not fabricate acceptance or per-set timestamps.
6. Retain malformed records/reasons for repair. Unknown load basis limits estimates, not preservation of valid history.
7. Commit training changes + ledger/receipt atomically, or stage privately before one final transaction. Keep the committed in-memory view until acknowledgment; restart checks the receipt before retry.
8. Reconcile added/updated/skipped/quarantined counts and values; import twice without duplicates and revalidate after another tab changes target records.

## Analytics retained

Epley compatibility: one rep → load; otherwise load × (1 + reps/30). Proposed eligible estimates use completed working weight/reps sets with known positive external load, 1–10 positive integer reps and comparable exercise/variant/equipment/load basis. Exclude ghosts, warm-ups and unsupported/unknown conventions. Compare to the preceding comparable completed session, label estimates/baseline date, and omit invented zero baselines. Round only for display.

Use one Monday-based completed-week query across Dashboard, Workouts and finish summary, through today. Keep active/future records separate and refresh after date edits/deletion. Preserve existing legacy completion semantics; the native draft's extra empty-session exclusion is not permission to silently change historical counts.

EWMA remains a proposed selectable method, distinct from the current seven-calendar-day mean: explicit primary or last daily reading, first valid representative as seed, alpha = 1 - 2^(-elapsed_calendar_days/7), trend = alpha × measurement + (1-alpha) × prior trend. Preserve raw readings; no zero-fill/interpolated weigh-ins. Handle primary changes, multiple daily readings, gaps, edits and future cutoff. Reuse [synthetic vectors](outputs/C_ANALYTICS_VECTORS.json); host SQLite timings are not browser evidence.

Joint/fatigue reports stay subjective and optional; missing does not mean none. No injury/readiness diagnosis.

## Validation and release gates

| Gate | Required evidence |
| --- | --- |
| Persistence | Real IndexedDB aborted write/retry/reload/termination, same-ID finish, acknowledged draft/intent recovery, blocked storage and concurrent-tab conflict. Synthetic profiles only. |
| Offline/update | Hosted-path/service-worker preparation, offline reopen/log/edit/finish, failed update and old/new-tab coordination. file:// checks alone do not establish hosted PWA behavior. |
| History/portability | Fitness JSON/full-envelope extraction, repeat/change/malformed fixtures, atomic retry and ID/value/count reconciliation. Full photo backup restoration and offline images remain regression gates. |
| iPhone | Chromium + Playwright WebKit with fresh contexts; physical Safari and Home Screen online/offline, both themes, enlarged text, safe areas, keyboard and VoiceOver. List unavailable checks explicitly. |
| Delivery | Repository suite/CI, reviewable diff, versioned shell assets, release notes and usage instructions. Deployment follows a user request; no real-data migration by agents. |

Proposed p95 input feedback ≤50ms and local save receipt ≤150ms must be measured separately on a named iPhone with sample size. Probe 100,000 synthetic sets and 10,000 food entries; these are scale targets, not achieved capacity. Investigate serialization/scans where measured; avoid a speculative database rewrite.

## Costs, rollout and later scope

Use the existing canonical HTTPS repository/site path to reduce storage disruption. GitHub Free + public repository + default Pages domain is the zero-required-hosting-cost target within current limits. No paid Apple/Expo/API/domain/backend subscription is required. Optional external lookups can require network/keys; local/manual alternatives remain available.

Changing origin/protocol/browser/container may make an old database unavailable. Keep the old environment and use tested export/import. A different preview path on the same origin is not an IndexedDB sandbox.

GitHub Pages is static hosting, not the future commercial coaching service. Review hosting, authorization and privacy before client launch. Accounts, paid coaching, production sync, native distribution, Watch/Health integrations and AI logging remain later work.

Remaining implementation decisions: physical iPhone/iOS matrix, journal/backup extension contract, measured large-import limits, food-provider timing and optional daily-complete/joint/EWMA presentation. None requires Xcode for the first web release.
