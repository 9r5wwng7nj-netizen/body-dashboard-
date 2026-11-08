# Next Body Dashboard iteration — fixes, library, muscle sets and AI handoff

November 7, 2026 (America/New_York) · Investigation and proposed build plan

**Implementation approved:** the owner authorized this sequence, beginning with secondary muscles and reusable cues, with checks and publication for each ready update. The findings below record the pre-implementation audit; per-release verification records describe what actually shipped. Built-in AI remains a later separate decision.

Audited checkout: `764b06667be71379ea1bde71058b4a9a753c1dfe` on `beta/personal-web` (the published runtime is Cobalt Air source `f4ea8bb87dc92d577aca7752d0aee8e1e3691b93`). The team inspected source and ran isolated synthetic probes in fresh browser contexts. This packet does not implement or publish changes, inspect personal records, enable AI, connect an account or modify the app's storage.

## Confirmed owner direction

- Retain Cobalt Air, iPhone-first use, offline logging and safe import/backup compatibility.
- Show **both planned routine coverage and actual weekly training**. They should be linked and use consistent muscle mapping/counting, with clearly separate scopes.
- Start AI assistance with a **manual ChatGPT handoff**, then consider optional built-in AI later. No new API integration or usage charge is being enabled now.
- Exercise cues should persist and be visible next time that exercise is performed.
- Broaden the exercise catalog and reconsider the muscle-volume experience rather than adding another cosmetic chart.

## Findings — verified versus recommended

| Concern | Confirmed behavior | Recommendation |
|---|---|---|
| Secondary muscle selection | Library checkboxes save/reload correctly, but selected chips look unchanged in both themes. Their span is only 20px high. Shared picker custom creation offers no secondary field and saves an empty list. | One shared metadata form; visible check plus selected styling, actual 44px label targets, multi-select validation and recoverable saving. |
| Reusable notes | Add note belongs to the session occurrence; it survives reload/history but starts blank next session. Existing persistent Form cues save in library metadata but are not shown while logging. | Show **Exercise cues** under the heading; keep **Session note** separate. Offer deliberate Save as exercise cue; do not copy all old notes automatically. |
| Exercise coverage | Only **56 built-in entries**. Actual personal libraries can contain more; no personal library was inspected. Some machine/cable/body-region/filter coverage is poor. Standalone Library search differs from picker search. | Expand a reviewed, locally bundled catalog, unify search/aliases/equipment filters, and preserve personal overrides/identities. |
| Muscle metadata | Name inference misclassifies chest-supported rows and rear-delt flys as Chest. Smith Machine inference does not match an available equipment filter; hip adduction is unmapped. | Prefer explicit reviewed mappings, surface unknown/inferred data and fix inference traps. Catalog size alone cannot fix bad analysis. |
| Set-volume reporting | Routine primary/secondary counts differ from history's default 0.5-credit totals; timed work is treated inconsistently. History's monthly/weekly muscle reports include future-dated saved records, unlike the completed-this-week query. Empty malformed legacy rows can receive credit. | A single tested read model for eligibility, roles, date scope and provenance, used by Plan/Performed/finish. Preserve valid imported rows without requiring a new `done:true` flag. |
| AI-assisted logging/programming | No AI request, proposal review or photo-macro workflow exists in the app. Existing routine, food, recipe, photo and recovery functions supply useful building blocks. | Start with chosen-data ChatGPT briefs and editable answers. Later build local review/mapping; optional integrated requests require a separate credential/privacy/cost design. |

These findings explain plausible causes; they do not prove which exact screen/count the owner found unsatisfactory. No personal workout or meal was used to derive them.

## The new muscle-set model

Use one named **Muscle sets** workspace with **Plan** and **Performed**.

- **Plan:** selected routine or explicit A+B rotation. Display planned working slots. A rotation is not labeled a week unless the owner supplies occurrence counts or dates.
- **Performed:** local Monday through today by default. Count valid finished historical work; disclose excluded future records and active sessions. Backdating/editing recomputes the interval.
- **Overview:** Chest, Back, Shoulders, Arms, Legs, Glutes, Core, plus a visible Unmapped row. Tap into the available muscle groups and contributing exercises/sets. Propose this grouping as a default; finer distinctions need real reviewed metadata.
- **Counts:** Primary sets and Secondary involvement remain separate. The same physical set can involve several muscles. Derive coarse areas from unique row references, not the sum of overlapping child muscles. Show a global logged-row total separately.
- **Other work:** warm-ups, timed holds/carries and conditioning remain visible with their own type/units. No automatic side doubling, failure bonus or invented per-exercise stimulus.
- **Data confidence:** recorded mapping, legacy/current mapping, inferred and unmapped contributions remain identifiable. Catalog edits never silently rewrite recorded snapshots. A mapping update may alter legacy interpretation; disclose that effect.
- **Advanced models:** any fractional secondary credit is an optional explained model, not the default count or an assertion of exact physiological contribution. No red/green balance grade or universal target range is proposed.

### Small worked example

This is a counting demonstration, not a training prescription. A routine with three Bench rows and two Triceps Pushdown rows has **five physical working-set slots** under the stated mappings:

| Muscle | Primary sets | Secondary involvement |
|---|---:|---:|
| Chest | 3 | 0 |
| Triceps | 2 | 3 |
| Shoulders | 0 | 3 |

The useful Triceps statement is **2 primary + 3 secondary**, with Bench and Pushdown as contributors. It is not eight physical sets, and the default should not compress it into an unexplained 3.5. The full redesign includes a two-routine rotation, actual local week, timed work, backdated/future records and coarse-area overlap examples.

## Catalog strategy

Curate the first roughly **60 high-priority additions**, with a proposed eventual target of **200–250 reviewed total entries**. These are scope targets, not observed catalog counts or a promise to ship a quota. Prioritize normal gym substitutions, machines/cables, calf/forearm/hip coverage, unilateral variants, bands and assisted/weighted bodyweight tracking. Preserve comparable load basis and aliases without merging history.

Use pinned `free-exercise-db` metadata as a candidate, not an unquestioned authority. The research also evaluated wger and ExerciseDB; their software/content/media and runtime caching terms differ. No new pictures or image service is needed for the first expansion. Keep per-entry provenance/review status and assess image rights separately before bundling media. See the source-backed library report rather than inferring permission from an API being public.

## AI handoff strategy

The first useful AI experience is **prepare a briefing → manually share in ChatGPT → review a draft → explicitly save through the app**. Programming drafts must not go through the performed-history importer. For food/photo drafts, confirm identity, quantity, preparation, hidden fats/sauces and eaten fraction; compute nutrition from chosen food snapshots after review. Photo estimates are labeled estimates, not measurements. Partial diet logging is not zero intake.

The companion AI report includes manual prompts usable now, candidate in-app preparation/review flows, guided description questions, source grounding and future privacy/cost constraints. It explicitly distinguishes external ChatGPT from an app API; there is no claim of access to this conversation, automatic answer retrieval or unlimited free image usage. The existing app stays fully usable offline without AI.

## Recommended delivery sequence

| Priority / release | Owner | Deliverable | Exit gate |
|---|---|---|---|
| **1 — Correct exercise editing and cue visibility** | UI/domain + QA | Shared secondary/cue form, checked-state/touch fix, durable metadata acknowledgement, reusable Exercise cues and separate Session notes | Both creation paths save zero/one/multiple secondaries; cues show on routine/add/repeat/swap; reload/retry/backup preserve values; old session notes/snapshots unchanged |
| **2 — Trustworthy metadata and common catalog gaps** | Catalog curator + trainer/product owner + domain | Explicit mapping review, consistent search/equipment categories, first reviewed additions | Misclassification regressions pass; existing names/IDs/user overrides remain; offline browse/add/swap and repeat seed upgrade work; mapping provenance visible |
| **3 — Rebuild Muscle sets** | Domain + UX + QA | Unified counting/date query plus linked Plan/Performed overview and contributor drilldown | Worked examples reconcile; future/active/invalid rows handled explicitly; coarse dedup/legacy snapshots correct; text summary and accessibility useful at 375/390px/200% |
| **Parallel H0, then H1 — ChatGPT handoff** | Product/UX + owner + domain | H0 manual prompts; H1 selected-data brief and editable local routine/meal review | No automatic transmission or logging; malformed/unknown units/IDs reviewed; failed writes/retry/reload cannot duplicate or overwrite newer input |
| **Later, separate decision — built-in AI** | Systems/security + owner | Authenticated request service, provider/model evaluation, spend/privacy controls | Explicit chosen account/cost/data boundaries; current provider terms checked; secrets never client-side; core app independent |

Date eligibility and counting robustness can be fixed independently before the full workspace ships. Catalog curation and the read-model prototype may proceed in parallel, but do not ship a larger inaccurate catalog or an opaque report ahead of the metadata review. No dates or effort estimates are asserted without an implementation review.

## Validation and preservation gates for implementation

- Keep every current storage namespace, collection, identifier, canonical unit, photo link, old backup and recorded classification. No global rename/merge or automatic migration of session notes into cues.
- Fresh and populated synthetic profiles, imported old backups, user-overridden metadata, unknown names and repeated upgrades. No real health records or credentials in artifacts.
- Fail metadata/cue/draft writes before/after durable intent; retry/reload idempotency and stale second-tab conflicts. Show immediate editing separately from saved acknowledgement.
- Cross-check counts against hand-calculated fixtures, local Monday/week/month/DST boundaries, backdated/edited/future records, unchecked/pending/legacy rows, warm-up/drop/failure/unilateral/timed types and swaps.
- Chromium/WebKit, Cobalt light/dark, 375/390px, enlarged text, 44px controls, keyboard and screen-reader names/focus. Physical iPhone testing remains a separate acceptance activity.
- Offline reopen, full record/photo backup restoration and duplicate-safe workout import. Keep old app data intact while updates wait; never clear storage to update.
- Run repository checks and relevant/full regression suites for the actual implementation. The current planning work ran targeted synthetic investigations and static checks, not a new full 170/63 application regression run.

## Open product judgments — suggested defaults, not blockers for this packet

Use coarse areas with finer drilldown, anatomical rather than rank-by-count ordering, a rotation by default until frequency is explicit, and current stored row convention for unilateral work. Review these in the first prototype. The owner has already chosen both Plan/Performed and ChatGPT handoff-first; do not ask those questions again. Precise lateral/rear-delt/adductor detail depends on the catalog taxonomy decision rather than chart decoration.

## Specialist reports

- [Secondary muscles and reusable cues](NEXT_EXERCISE_NOTES_AUDIT.md) — Chromium/WebKit reproductions and acceptance cases.
- [Exercise catalog and licensing research](NEXT_LIBRARY_RESEARCH.md) — counts, gaps, candidate sources, provenance and offline strategy.
- [Muscle-set redesign](NEXT_VOLUME_REDESIGN.md) — verified discrepancies, counting policy, worked examples and Cobalt Air wireframes.
- [AI use cases and copyable prompts](NEXT_AI_USE_CASES.md) — ChatGPT handoff first, guided photo/description logging and later integrated-route boundaries.
