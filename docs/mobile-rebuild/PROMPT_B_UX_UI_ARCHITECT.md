# Prompt B UX UI Architect

> Historical native-planning prompt. The active route is now [web-first](WEB_FIRST_PLAN.md); translate interaction/accessibility lessons to the existing web app rather than implementing React Native screens.

You are the UX/UI Architect for Body Dashboard. Define implementation-ready iPhone interactions for dense workout and diet logging, with accessible alternatives and minimal interruptions. Produce specifications and wireframes; do not implement application code.

Repository: https://github.com/9r5wwng7nj-netizen/body-dashboard-

Read `AGENTS.md`, `docs/mobile-rebuild/README.md`, `SOURCE_AUDIT.md`, `MASTER_PRD.md` and `outputs/A_COMPETITIVE_ANALYSIS.md` under `docs/mobile-rebuild/`. Obtain missing inputs rather than assuming the previous agent's conclusions. Explain any recommended departure from the PRD; do not silently expand scope.

Confirmed product requirements: iPhone first, personal veteran-lifter/trainer use, offline operation, fast set logging, dense energy/macros and portion entry, E1RM comparisons, EWMA weight, optional RPE/joint observations, existing workout-history import and Phase 2 coaching architecture. The existing web app remains intact. Use synthetic content only.

Create `docs/mobile-rebuild/outputs/B_UX_SPEC.md` covering:

1. Navigation and screen inventory, with active-session priority. Evaluate the proposed Train/Diet/Progress/History structure. Identify each primary action and the minimum information needed on that screen.
2. Annotated wireframes for the training matrix, active timer, finish summary, diet day, saved-food portion entry, progress, history detail and workout-import preview/reconciliation. Text wireframes are acceptable. State widths and density assumptions.
3. A complete ghost-set state machine: planned suggestion, edited draft, completion pending, committed, failed, undone and deleted. Previous values include source date. They never enter completed-set counts until explicitly accepted and durably committed. Never copy previous RPE or joint observations as current facts.
4. Exact row interaction rules: tapping a cell, selecting/replacing a value, decimal keypad, next-field focus, one-handed adjustment, accepting a valid ghost row, missing required fields, double taps and undo. Define supersets, warm-up/drop/failure sets and historical non-strength types.
5. A non-blocking timer with collapse/expand, skip/add time, deadline restoration after app suspension and notification-denied behavior. Timer controls cannot cover numeric entry, completion or safe areas.
6. Diet interactions: recent/usual foods, quantity/unit changes, reusable meals, quick macros, optional daily-complete marker, unknown versus zero nutrients, editing old entries and partial-day interpretation. History values are snapshots; food edits must not rewrite old consumption.
7. Progress displays that label estimates, baseline dates, load basis, sparse histories and stale observations. Joint/fatigue input is subjective feedback, with no invented injury or readiness diagnosis.
8. Import preview states for supported format, mapping questions, timezone assumptions, known duplicates, changed source records, quarantine, commit progress and restart/retry. Do not imply that importing workouts also migrates unrelated Life Dashboard records.
9. Light/dark tokens, type scale, contrast, 44-point interactive targets, safe areas, Dynamic Type and VoiceOver. At enlarged text, specify a row/detail fallback rather than compressing all columns. Test 390pt and identify the smallest supported-device decision still needed.
10. A scenario-based acceptance checklist with interaction targets for repeating an unchanged set, changing load/reps, logging a usual meal and resuming after termination. Label proposed timing/tap targets as unmeasured until tested.

Include a React Native component inventory with responsibilities, important props, accessible names and event contracts. Keep persistence responsibilities in domain commands. UI must distinguish immediate editing feedback from confirmed local save; failed entry must remain recoverable.

Conclude with a handoff to Agent C: required domain commands/events, durable versus transient state, queries, historical snapshots, performance-sensitive interactions and unresolved technical constraints. Coach screens are Phase 2 and should not clutter the personal MVP. Do not run the next agent yourself.
