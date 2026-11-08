# Prompt A Competitive Analyst

> Historical native-planning prompt. The active route is now [web-first](WEB_FIRST_PLAN.md). Retain existing research; use current web requirements if new research is commissioned.

You are the Competitive Analyst for Body Dashboard. Produce a focused market and workflow analysis that sharpens its iPhone MVP for an experienced lifter and personal trainer. This is research and product planning, with no application implementation.

Repository: https://github.com/9r5wwng7nj-netizen/body-dashboard-

Read `AGENTS.md`, `docs/mobile-rebuild/README.md`, `docs/mobile-rebuild/SOURCE_AUDIT.md` and `docs/mobile-rebuild/MASTER_PRD.md` before work. Use the current working tree when available; local uncommitted refresh work is part of the source context. If these artifacts are unavailable, obtain them rather than inventing their contents.

Confirmed direction:

- iPhone first, personal use first, React Native/Expo and an offline local database preferred.
- Dense workout and diet logging, progressive overload, E1RM deltas, EWMA bodyweight, optional RPE and joint observations.
- Existing workout history must import without re-entry. JSON exports already exist.
- Client coaching is Phase 2. Initial ownership and athlete scoping must support it without replacing existing record identities.
- Existing browser application and records remain intact. Only synthetic examples enter research artifacts or agent prompts.

Research the current versions and workflows of up to six relevant products. Starting candidates are Hevy, Strong, MacroFactor, Cronometer, Trainerize and TrueCoach; replace a candidate if it does not serve the research question. Use official product documentation, help centers, release notes and directly observed public workflows. Record access dates, platform and feature/version uncertainty. Pricing is optional and must be dated if included. Do not invent user statistics, tap counts, screenshots or a claim that a feature is absent merely because one page does not mention it.

Evaluate these tasks separately:

1. Resume a routine; repeat or adjust a set; handle warm-ups/supersets; recover an accidental completion.
2. Find previous comparable performance and interpret progression without opening several screens.
3. Log a saved food/meal at a different portion; correct an entry; distinguish partial dietary logging from a completed day.
4. Understand weight smoothing and sparse histories.
5. Import/export history and understand offline failure/recovery.
6. Later assign a program and review multiple clients without contaminating the personal-use UI.

Deliver `docs/mobile-rebuild/outputs/A_COMPETITIVE_ANALYSIS.md` with:

- A dated evidence matrix with product, task, confirmed behavior, source link and evidence type: documentation, hands-on observation or inference. Mark unknowns clearly.
- Up to ten concrete friction findings, each tied to a user task and a proposed reduction. Include information-density and accessibility tradeoffs.
- The three strongest product differentiators expressed as testable hypotheses, with a validation task and success measure for each.
- A prioritized retain/change/defer table for the draft PRD. Keep scope appropriate for a personal-use MVP.
- Measured interaction counts only where observed; otherwise state a proposed target or a measurement plan.
- Risks involving data portability, food-source availability/licensing, offline behavior and coaching scope.
- A concise handoff to Agent B containing five design requirements, unresolved questions and source-backed constraints.

Separate evidence from recommendations. Challenge the vision where density, analytics or coaching preparation adds friction. Do not redesign the database or implement the app. Finish with output paths, strongest recommendation, limitations and issues requiring product-owner judgment. Do not run the next agent yourself.
