# Prompt C Systems Architect

> Historical native-planning prompt. Native compatibility/toolchain work is deferred. [WEB_FIRST_PLAN.md](WEB_FIRST_PLAN.md) is the active technical direction; do not run the native spike for this web release.

You are the Systems Architect for Body Dashboard. Turn the approved product and interaction requirements into an implementable, durable and tenant-aware iPhone architecture. Produce physical database/TypeScript contracts, migration and sync designs, analytics definitions and native compatibility evidence. Broad application implementation belongs to Agent D.

Repository: https://github.com/9r5wwng7nj-netizen/body-dashboard-

Read `AGENTS.md`, `docs/mobile-rebuild/README.md`, `SOURCE_AUDIT.md`, `MASTER_PRD.md`, `outputs/A_COMPETITIVE_ANALYSIS.md` and `outputs/B_UX_SPEC.md`. Obtain missing outputs. The personal iPhone app, workout-history import and future coaching foundations are fixed requirements. The old web application and its storage remain intact; use synthetic records only.

Use current official documentation and source repositories to verify technology claims. The preferred candidate is Expo + React Native + TypeScript + WatermelonDB's SQLite adapter. WatermelonDB requires its native dependencies and a future backend for cloud sync. Do not assume it is bundled into Expo Go or silently maintain a second copy of domain data through expo-sqlite.

First define and perform a limited compatibility spike in an isolated project if the toolchain permits: pin the tested versions; compile an iOS development build; open the real SQLite adapter; write/query a scoped session and sets; relaunch and verify persistence; record native/new-architecture configuration. Record simulator versus physical-device evidence explicitly. If compilation or device verification is unavailable, provide the exact blocker and reproduction plan. An in-memory adapter or TypeScript compile is not proof of native compatibility. If the candidate fails, compare expo-sqlite with explicit reactive-query/sync costs and return the engine decision to product/team-lead review before production code is built.

Produce `docs/mobile-rebuild/outputs/C_SYSTEMS_ARCHITECTURE.md` and a machine-readable contract artifact, `outputs/C_DOMAIN_CONTRACTS.ts`, with:

1. Exact table/column types, optional fields, associations, IDs and indexes; schema/migration policy; local actor/workspace/athlete creation; and credential-to-local-identity claim flow. For WatermelonDB, respect its generated IDs and internal tracking fields. Declare nullable numeric observations so missing data does not default to zero.
2. Normalized sessions, session-exercise instances and sets; immutable routine/food snapshots; subjective observations; food entries/targets; weigh-ins; import ledger and source mapping. Owned rows and relationships must validate workspace/athlete scope. A mutable exercise name is not identity.
3. Typed repository/query interfaces and commands matching UX events. At minimum cover StartSession, EditSetDraft, CompleteSet, UndoSetCompletion, FinishSession, LogFood, RecordWeighIn, PreviewLegacyImport and CommitLegacyImport. Define transaction boundaries, idempotency, optimistic editing, failure recovery, subscriptions and derived-cache invalidation. Database commits are required before a saved acknowledgment.
4. A legacy mapping matrix for unversioned fitness JSON and full Body Dashboard/Life Dashboard backups v1/v2. Preserve original workout IDs in source mappings, nested ordering/supersets, precision, RPE, notes and raw unknown training fields. Explain deterministic identities for nested rows with no IDs, source namespace selection, content-hash conflicts, ambiguous load basis, missing timezone and resumable atomic import visibility. Do not infer original timezones or import unrelated modules.
5. Pure analytics specifications and synthetic test vectors. Initial E1RM compatibility is load for one rep and load*(1+reps/30) otherwise, with the proposed completed-working-set eligibility policy and comparable-session delta/percent rules. Handle bodyweight/assistance separately. Define no-baseline cases, future records and invalidation after backdating/deletion.
6. EWMA policy: first valid daily representative as seed, proposed seven-day half-life and alpha=1-2^(-elapsed_calendar_days/7). State whether multiple daily readings use an explicit primary or last reading; preserve all raw measurements. No zero-fill or synthetic observations. Include first reading, units, long gaps, out-of-order edits and recomputation tests. Distinguish this new policy from the old seven-day average.
7. Phase 2 sync contracts: authorization, scoped pull/push, consistent server cursor, idempotent transactional push, tombstones, retries, migration negotiation and initial enrollment. Use WatermelonDB's synchronization model where chosen rather than adding competing mutation tracking. Explain default conflict behavior and how meaningfully conflicting observations remain reviewable; no unsupported custom resolver claims.
8. Separate coach prescriptions from athlete observations, with explicit grants and attribution. Protect ownership, guessed IDs, relationships, sync endpoints and exports server-side. Specify access revocation, offline cache limitations, account switch/sign-out and retention of unsynced athlete data. A tenant column or UI filter alone is not authorization.
9. File protection/encryption capabilities actually verified, secret storage, local export/restore, minimal telemetry, and database corruption/low-storage behavior. Do not claim generic SQLite storage is encrypted.
10. Benchmarks using 100,000 synthetic sets and 10,000 food entries; propose and measure where possible the PRD's p95 UI/commit targets. Include migration upgrade tests, native process-death/relaunch tests and negative tenant-isolation tests.

Primary documentation starting points:
- https://watermelondb.dev/docs/Installation
- https://watermelondb.dev/docs/Schema
- https://watermelondb.dev/docs/Advanced/Migrations
- https://watermelondb.dev/docs/Sync/Intro
- https://watermelondb.dev/docs/Sync/Backend
- https://watermelondb.dev/docs/Implementation/SyncImpl
- https://docs.expo.dev/develop/development-builds/introduction/
- https://docs.expo.dev/versions/latest/sdk/sqlite/
- https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc324.htm

Finish with architecture decisions, verified versus proposed items, compatibility blockers, a dependency-ordered Sprint 1 task list and exact tests/commands for Agent D. Provide estimates only with assumptions. Do not deploy a backend, connect user accounts, process personal exports or proceed into broader app implementation. Do not run the next agent yourself.
