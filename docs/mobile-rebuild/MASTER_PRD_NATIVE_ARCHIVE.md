# Body Dashboard master product requirements draft

> Archived native draft, preserved November 7, 2026. This is not the active plan. Use [MASTER_PRD.md](MASTER_PRD.md) and [WEB_FIRST_PLAN.md](WEB_FIRST_PLAN.md).

Version 0.1, November 7, 2026. Product owner: Seth. Delivery owner: the technical team lead. Confirmed platform and migration decisions are iPhone first and preservation of existing workout history through import. Architecture and interaction details below are proposed defaults for the agent review sequence.

Body Dashboard helps an experienced lifter record what happened, see the next useful comparison and manage daily food intake with minimal interruption. The MVP must function in a gym without a connection and remain useful with years of workout history. Its architecture separates athlete records and access from the start so coaching can expand through compatible migrations and services.

## Product principles

- Logging takes priority over dashboards, setup and social features.
- Dense screens expose the needed numbers while preserving readable text, touch targets and accessibility.
- A completed action receives immediate feedback; a saved indicator requires a successful local database commit.
- Raw observations remain authoritative. Derived estimates are labeled, reproducible and versioned.
- A suggested previous value is visually and semantically different from a completed current set.
- Training and diet are the native product boundary. General productivity and personal disciplines remain outside it.

## Users and core jobs

The primary user is an experienced lifter and personal trainer logging their own training and diet on an iPhone. They need to repeat a prior session, adjust a load, complete a set, inspect comparable performance, record food portions and understand weight trends.

Phase 2 introduces athletes and coaches with separate permissions. A coach needs program assignment, adherence review and meaningful exceptions across clients. Athletes retain clear ownership and visibility into access. The coach portal may use a responsive web client against the same domain/API contracts; that UI is not part of the personal-use MVP.

## MVP scope

| Area | Required behavior | Release acceptance |
| --- | --- | --- |
| Workout logging | Start from a routine, prior session or empty session. Show a matrix with set type, previous performance, load, reps and completion. Optional RPE and joint observations stay out of the default row. | Repeat an unchanged prior set with one completion action. Changing load/reps requires no modal confirmation. Unfilled required values prompt entry; a ghost row never counts as completed. |
| Progression context | Show the most recent comparable performance and an eligible E1RM delta, with explicit baseline and date. | Exercise variants, equipment and load conventions are comparable before a delta is shown. Missing baseline produces a clear empty state. |
| Workout lifecycle | Resume after backgrounding or termination, edit/backdate history, finish or discard intentionally, and undo accidental completion. | Completed set acknowledgments survive immediate app termination and relaunch. Finishing commits session state consistently. No duplicate set/session from repeated taps or retries. |
| Timer | Optional compact rest timer, adjustable during logging. | Timer never blocks a row or keyboard. Rest state reconstructs from a saved deadline after suspension. Notifications are optional and have an in-app fallback. |
| Diet logging | Fast daily energy/protein/carbohydrate/fat view; manual quick entry; locally saved foods, recent/usual portions and reusable meals or recipe servings. | Food logging works offline. A known zero is retained; an unknown nutrient stays unknown. Partial logging is identified rather than interpreted as a completed dietary day. |
| Daily targets | User-entered targets and calories left/eaten preference. | Targets can be changed without altering historical consumption. No forced automated dietary recommendations. |
| Weight | Quick weigh-in, raw measurements, EWMA trend, observation dates and accessible text summary. | Empty/single/sparse histories, multiple readings per day, edits, kg/lbs and missing dates behave as specified below. |
| Subjective feedback | Optional RPE and joint observations attached to the relevant session, exercise instance or set. | RPE is nullable and supports 0.5 increments from 1–10 for new entries. Joint location, side, observation category and optional severity/note are self-reports. Missing reports never mean no fatigue. |
| History import | Existing fitness JSON plus supported full backup envelopes. Preview, source identity, duplicate/conflict detection and reconciliation. | Eligible workout/set counts and values reconcile; repeating an import makes no duplicate records. Source IDs and unresolved fields remain recoverable. |
| Recovery and portability | Atomic local commands, retry, import/export and versioned native backup/restore. | A reported saved record survives restart. Backup restore round-trips typed data and references. A failed import leaves no partially visible dataset. |

Online food discovery and barcode lookup can follow the offline logging core. The initial provider, coverage, licensing and costs require review; an unavailable lookup must not prevent manual or saved-food entry. Full recipe galleries, pantry/grocery tools, adaptive calorie expenditure, Apple Health, Watch, Android, AI logging, social feeds and live coaching are excluded from the first release.

## Interaction requirements

The proposed primary navigation is **Train**, **Diet**, **Progress** and **History**, with settings and import/export reachable from the app menu. A resumed session takes priority over an introductory dashboard. The UX agent may propose a stronger structure while retaining the same jobs and constraints.

Ghost sets display a planned or previous load/reps suggestion with their source date. They are not completed records. Completion explicitly accepts valid suggested values, writes an observed set and starts the timer only after the local completion command succeeds. Prior RPE or joint feedback is never copied as a current observation. Unticking or undoing completion preserves intentional edits without duplicating rows.

Diet views prioritize totals, remaining values, portions and recent foods. Food entries snapshot their nutrients and serving basis at the time of logging. Updating a saved food or recipe affects future additions; it must not silently recalculate past intake. Source calories and macro-derived energy may differ; preserve provenance rather than silently replacing one with the other.

Use dark and light themes, Dynamic Type, VoiceOver reading order, accessible names for matrix cells and 44-point minimum interactive targets. Validate at 390pt and the smallest supported iPhone. At enlarged sizes, show optional columns through an alternate row/detail arrangement; do not shrink labels or require precision taps to preserve density.

## Local architecture and tenancy

Use React Native, Expo and TypeScript. The preferred first candidate is **WatermelonDB using its SQLite adapter**, with domain commands and repositories separating persistence from UI. Do not create a parallel `expo-sqlite` database containing a second copy of the same records.

WatermelonDB has native installation requirements; Expo development builds support custom native libraries. The specific Expo/React Native/WatermelonDB combination must compile and persist successfully in an iOS development build before broader implementation. If it fails the agreed check, document an `expo-sqlite` alternative and its reactive-query/sync costs before changing engines. [WatermelonDB installation](https://watermelondb.dev/docs/Installation), [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/), [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

Local-only onboarding creates stable workspace, actor and athlete identities without requiring an account. Every athlete-owned record carries `workspace_id` and `athlete_id`; mutation provenance identifies its actor. These are schema/domain requirements from version 1. All commands, queries and parent-child relationships validate scope. Two synthetic athletes in different workspaces must pass negative isolation tests even before a client switcher exists.

The proposed ownership model keeps personal history in its original workspace. Phase 2 grants a coach access to specific athletes rather than moving records into a coach’s ownership. A coach can aggregate authorized clients across workspaces. Broader organizations can be added through memberships without rewriting set and food identities. Normal additive schema migrations remain expected; “ready for coaching” is not a promise of no future migrations.

Account enrollment later links a local actor to a verified server principal through an explicit claim flow. A client-provided owner ID is never proof of ownership. New native record IDs are generated offline and reused by the server; original legacy IDs remain in an import mapping.

## Data requirements

The systems agent owns the final physical WatermelonDB schema and associations. The following are required entities and invariants, not an already validated database design.

| Entities | Required information and boundaries |
| --- | --- |
| Workspaces, actors, athletes | Stable IDs, personal ownership, explicit principal-link status, display preferences and recording timezone. Local identities must remain claimable without rewriting training history. |
| Access grants and memberships | Granting actor, recipient principal, workspace/athlete scope, capabilities, status and revocation/version metadata. Phase 2 authorization is server-controlled. Local users cannot self-escalate by editing a role. |
| Exercises and aliases | Canonical exercise ID, variant/equipment, tracking type, load convention, user label and source alias. Repeated exercise instances are separate from exercise definitions. |
| Routines and routine exercises | Versioned structure, order, targets, set types, rest preferences and supersets. A session uses a snapshot so routine edits do not change its history. |
| Sessions | Athlete scope, status, start/end timestamps, recorded local date/timezone provenance, notes, originating routine version and source mapping. One active session per athlete for MVP. |
| Session exercises and sets | Stable IDs, exercise/position/superset group, historical label/type/load basis; planned versus observed values; load kg, reps, seconds, distance, set type, nullable RPE and completion time. Preserve original imported fields. |
| Joint observations | Scope and referenced session/exercise/set; location/side, fatigue/discomfort category, optional severity and note, observation time. Do not collapse all observations into an inferred readiness or injury score. |
| Foods, food entries and saved meals | Source/basis, measured quantity/unit, conversion evidence, nutrient snapshot with nullable fields, meal/date and optional completion-of-day marker. Reusable meal definitions are versioned independently of consumption. |
| Weigh-ins and target history | Raw measurement kg, measured-at/local-date provenance, source and chosen daily representative; dated target changes. Keep raw observations when changing the trend method. |
| Imports and source records | Batch state, source namespace/ID, canonical content hash, native ID map, raw supported training payload, validation issues, accepted/skipped/conflicting counts and importer version. |
| Derived caches and sync metadata | Algorithm version and source watermark for recomputable results; device sync state and server cursor. Preserve WatermelonDB’s own internal tracking rather than repurposing its special columns. |

Missing numeric values use optional columns rather than implicit zero. WatermelonDB supports string/number/boolean columns with optional fields; relations and indexes require explicit schema decisions. [WatermelonDB schema](https://watermelondb.dev/docs/Schema).

Store load and body mass canonically in kg, with duration in seconds and an explicitly documented distance unit in the new model. Convert legacy km once if the native model chooses meters. Preserve source values, units and precision. Dumbbell per-hand versus total load, assistance and bodyweight contributions require explicit load-basis metadata; importing a number does not establish its physiological meaning.

Store UTC event instants and a recorded local day with timezone/provenance. Changing display timezone must not silently move a logged nutrition day or workout week. Weeks start on local Monday. Active and future-dated records are separate from completed-through-today counts.

## Workout import contract

Required source formats are the existing unversioned `app: body-dashboard`, `type: fitness` JSON export, and version 1/2 Body Dashboard or Life Dashboard backup envelopes containing `data.workouts`. Import only training fields from broader backups. Supporting direct Hevy CSV is a secondary path after those JSON formats pass.

The importer must:

1. Inspect a user-selected local file with size/depth limits, strict shape validation and no remote code or URL execution.
2. Show format, date range, workout/exercise/set counts, source namespace, chosen recording-timezone assumption and mapping issues before commit.
3. Preserve source workout IDs, notes, timestamps, set order/types, supersets, units, RPE and custom names. Include routine/program/exercise metadata when supplied; an unsupported program field remains in the source archive and is reported.
4. Generate stable native identities for exercise instances/sets lacking IDs using source identity, original workout ID and nested position, with collision checks. Preserve repeated exercise blocks.
5. Skip a source record only when its identity and canonical content are already imported. The same source ID with different content enters explicit review; unrelated native edits are never overwritten automatically.
6. Quarantine invalid or ambiguous records with reasons. Nothing disappears silently. New timestamps, original timezones, missing loads and set completion evidence must not be fabricated.
7. Apply an approved import transactionally or through resumable staging that becomes visible atomically. A failure or restart must not expose half a workout or a half-imported history.
8. Report exact accepted/skipped/quarantined counts and reconciliation differences, then survive relaunch and repeated import. Source files and the existing browser app remain unchanged.

Historical comparisons may require reviewing exercise aliases/load basis. Lack of that context limits an estimate; it does not block preserving and viewing the workout. Old active workouts are not treated as completed history. Old food/weight/photo data are not mandatory for this import and remain available in the old app and its backups.

## Analytics definitions

### E1RM and deltas

Use the existing Epley-style definition as the initial compatibility baseline: for one rep, `E1RM = load`; otherwise `E1RM = load * (1 + reps / 30)`. Version this definition separately from its eligibility policy.

Proposed MVP policy: completed working sets of 1–10 positive reps with known positive external load qualify for standard resistance-exercise E1RM. Warm-ups, incomplete rows, cardio and unknown load conventions do not. The rep limit is a product guardrail, not a claim that this range guarantees accuracy. Bodyweight/assisted variants require a separate explicit model and must not mix with added-load-only estimates.

Compare the session’s best eligible estimate against the preceding completed comparable session using the same exercise identity, variant, equipment, load basis and algorithm. `delta = current - baseline`; `percent = 100 * delta / baseline` only when the baseline is positive. Label estimates and their baseline dates. Edits, backdating, deletions and alias changes invalidate affected caches. Do not use future observations as historical bodyweight inputs.

Synthetic example: 80kg × 5 gives approximately 93.33kg; against a comparable 90kg baseline, the delta is approximately +3.33kg and +3.70%. This is an analytics calculation, not a recommendation to attempt that load. RPE/joint observations add context; they do not turn an estimate into a measured maximum.

### EWMA weight smoothing

EWMA uses `trend_i = alpha_i * weight_i + (1 - alpha_i) * trend_(i-1)`. The recursive form is a standard statistical smoother. [NIST EWMA definition](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc324.htm).

Proposed Body Dashboard policy: initialize from the first valid daily representative, use a seven-calendar-day half-life, and compute `alpha_i = 1 - 2^(-d_i / 7)`, where `d_i` is elapsed calendar days between representatives. These initialization/half-life/gap choices are product decisions, not NIST weight-management guidance.

Preserve all measurements; use an explicitly selected primary reading per local day, defaulting to the last reading that day. Recompute chronologically after edits. Missing days are not zeroes and generate no synthetic weigh-ins. Evaluate the curve at observations, expose gaps and latest measurement date, and show a one-reading state without a claimed trend change. Retain the old seven-day-average method as source provenance rather than silently relabeling it EWMA.

## Offline durability and future sync

All logging commands commit locally before acknowledging persistence. Network work never sits on the gym input path. A transient editor draft can give immediate feedback, but failure retains the user’s input and presents retry without claiming completion. Native process-death tests replace reliance on browser unload handlers.

Phase 1 includes repository interfaces, sync contracts and synthetic conflict/isolation tests. Production cloud sync and coaching accounts are Phase 2. WatermelonDB supplies local change tracking and synchronization facilities, but requires a backend; it is not a hosted coaching service. [WatermelonDB sync introduction](https://watermelondb.dev/docs/Sync/Intro).

Define server-authoritative authorization, consistent pull cursors, transactional idempotent push, deletion handling and schema negotiation before enabling sync. Keep athlete observations separate from coach prescriptions so different actors normally edit different records. Same-field concurrent edits need an explicit policy and recoverable conflict path; device clocks alone must not decide ownership or overwrite a completed set. The backend implementation must conform to the selected sync protocol. [WatermelonDB backend contract](https://watermelondb.dev/docs/Sync/Backend).

Server access revocation takes effect immediately on the server but cannot instantly erase an offline copy. Phase 2 must specify offline coach-cache limits, deletion on reconnection and sign-out handling. Never erase unsynced athlete observations merely to resolve a coaching access conflict.

## Performance and reliability targets

These are proposed acceptance targets to measure, not achieved results:

- Local visual input feedback at p95 within 50ms and set-commit acknowledgment at p95 within 150ms on the selected reference iPhone in a release-like build. Capture device, dataset, instrumentation and measurement boundaries.
- A synthetic 100,000-set history and 10,000 food entries remain usable without full-history scans on every keystroke. Use scoped/indexed queries and targeted subscriptions; measure navigation and history query latency before setting their final budgets.
- Repeated fast taps cannot create duplicate completed sets. No acknowledged data loss after force termination, restart, low-storage failure or migration testing.
- Timers, focus and numeric inputs recover correctly after keyboard changes, suspension and app relaunch.
- Database upgrades have tested migration paths. No shipped-data reset path is accepted as routine recovery. [WatermelonDB migrations](https://watermelondb.dev/docs/Advanced/Migrations).

## Privacy and portability

MVP is local without compulsory sign-in. Import and analytics operate on device. Development, screenshots, logs and agent prompts use synthetic records. Credentials stay outside the database exports and repository. Do not log food text, workout notes or personal measurements to remote telemetry by default.

The systems review must document native file protection, backup exposure and any database-encryption capability actually supported by the chosen engine. Do not claim encryption merely because SQLite is local. Later coaching requires explicit sharing, least privilege, access audit, export/deletion paths and a privacy/security review appropriate to the deployment.

The native app provides a versioned portable export and tested restore. This is a new native format; importing old web exports does not automatically mean the old web app can read native backups. Keep the original files and document any future compatibility exporter separately.

## Phase 2 coaching expansion

Add verified accounts, invitations, athlete-scoped coach grants, program/target assignments, check-ins, comments and authorized progress review. Separate plan versions and assignment snapshots from observed sets/food entries. Coach-authored corrections to observations require attribution and a recoverable history rather than an invisible overwrite.

The first coaching release must demonstrate two unrelated coaches and their clients cannot read or mutate each other’s records through UI, API, sync, export, guessed IDs or cached queries. Test sharing, revocation, multi-device edits and client offboarding. Reuse stable domain IDs and ownership fields; introduce compatible migrations and server services rather than replacing every record’s identity.

## Delivery gates and owners

| Gate | Owner | Required evidence |
| --- | --- | --- |
| A Market and friction review | Competitive analyst, reviewed by product owner | Dated primary-source comparison, observed versus inferred friction, prioritized MVP changes. |
| B Interaction contract | UX UI architect, reviewed by product owner | Matrix/ghost states, keyboard/focus/timer behavior, diet layouts, Dynamic Type and VoiceOver specifications. |
| C Architecture contract | Systems architect, reviewed by team lead | Native compatibility proof, physical schema, migration/import design, analytics fixtures, tenancy/sync contracts and failure cases. |
| D Sprint 1 vertical slice | Dev team, reviewed by team lead | Native workout loop, durable scoped commands, synthetic import slice and measured tests from the approved architecture. |
| MVP completion | Product owner and team lead | Diet, analytics, full migration/reconciliation and export/restore work completed in subsequent sprints; iPhone and accessibility acceptance verified. |

No calendar delivery promise is set before the native compatibility check and Sprint 1 sizing. Agent D’s prompt is an execution brief to run after implementation is authorized; the present packet is planning work.

## Open decisions

The first native compatibility check must resolve supported Expo/React Native/WatermelonDB versions, minimum iOS and reference devices. Product review must settle load conventions for ambiguous imported exercises, joint-feedback vocabulary, the preferred coach editing policy and whether online food lookup is needed in the first usable build. None of these requires uploading personal history to an agent or changing the current app.
