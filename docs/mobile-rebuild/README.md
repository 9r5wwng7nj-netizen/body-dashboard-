# Body Dashboard — active web-first plan

Decision updated November 7, 2026: **build the free, iPhone-first web app on GitHub Pages using the existing application.** Native Expo/WatermelonDB, Xcode, CocoaPods, App Store membership and the native compatibility spike are deferred. This directory retains its historical `mobile-rebuild` name so existing links remain valid.

Fast workout and diet logging, offline operation, accurate comparisons and importing existing workout history without re-entry remain central. Coaching is Phase 2; static hosting does not supply its backend.

## Read and execute

1. Read repository [AGENTS.md](../../AGENTS.md).
2. Read the current [master PRD](MASTER_PRD.md).
3. Use the [web-first architecture, rollout and validation plan](WEB_FIRST_PLAN.md), which translates A–C findings to this route.
4. Continue implementation using the revised [Agent D web Sprint 1 handoff](PROMPT_D_DEV_TEAM_SPRINT_1.md). Its first gate is browser persistence/recovery and Safari compatibility, not native compilation.

The revised Agent D web sprint has now been implemented locally at the product owner’s request. Publication as a personal beta was subsequently authorized; see `docs/BETA_RELEASE.md` for deployment results. See [the persistence contract](outputs/D_WEB_PERSISTENCE_CONTRACT.md) and [Sprint 1 results/release gates](outputs/D_SPRINT_1_REPORT.md). All testing uses synthetic records and fresh profiles. Do not resume the deferred native build.

## Current decisions

- Reuse `index.html`, current components, IndexedDB `body-dashboard`, manifest and service worker. Keep application code in `index.html`; no framework/database rewrite is required for Sprint 1.
- Target iPhone Safari and Home Screen use at 390 CSS px with a 375px fallback. Verify actual supported devices before claiming iPhone acceptance.
- First online preparation caches the shell; offline reopen and logging must then work. A never-loaded device cannot install the app offline.
- Preserve IDs, units, preferences, photos, existing navigation and full-backup compatibility. Strengthen existing logging/import paths.
- Add fitness JSON preview/reconciliation and training-only extraction from full Body/Life backups. Full backup restoration, including photos, remains a separate flow.
- No compulsory account, production sync, AI logging, new image service, paid domain or paid hosting dependency. Online food search cannot block local logging.
- GitHub hosts source/public assets, not personal records or backups. Free Pages assumes a public repository/default domain within current limits. This update changes no repository visibility or deployment settings.

## Prior outputs and current authority

| Artifact | Use now |
| --- | --- |
| [Source audit](SOURCE_AUDIT.md) | Existing shapes/formats remain useful; native rewrite recommendations are superseded. |
| [A competitive analysis](outputs/A_COMPETITIVE_ANALYSIS.md) | Retain task/friction findings and research limits. Native version/platform context is historical. |
| [B UX spec](outputs/B_UX_SPEC.md), [wireframes](outputs/B_UX_WIREFRAMES.html), [validation](outputs/B_UX_VALIDATION.md) | Retain ghost/save semantics, portions/import and accessible density. Translate to web; do not implement React Native components or replace existing views in Sprint 1. |
| [C native architecture](outputs/C_SYSTEMS_ARCHITECTURE.md), [contracts](outputs/C_DOMAIN_CONTRACTS.ts), [compatibility report](outputs/C_COMPATIBILITY_REPORT.md) | Archived native proposal, not the active physical schema/release gate. Reuse invariants and [analytics vectors](outputs/C_ANALYTICS_VECTORS.json); do not port 41 tables. |
| [Native PRD archive](MASTER_PRD_NATIVE_ARCHIVE.md), [native D archive](PROMPT_D_NATIVE_ARCHIVE.md) | Historical reference only, not active execution instructions. |

The current PRD + web plan + revised D prompt take precedence over platform-specific instructions in A–C and their original prompts. Preserve that work for a possible later native app.

## Cost and delivery boundary

GitHub Pages supports GitHub Free public repositories. A Home Screen web app needs no App Store distribution. The personal MVP has no application server. Paid client services/cloud sync require a later hosting/security decision; Pages is not a free commercial SaaS backend. See dated official sources in the web plan.

Implementation produces a locally reviewable release candidate, tests and `outputs/D_SPRINT_1_REPORT.md`. Prepare the diff/branch and CI evidence first; publish only when explicitly requested. Never publish personal fixtures or backups.
