# Exercise-library expansion — research and proposed delivery

Accessed November 7, 2026 (America/New_York). Planning only; no application implementation, database changes, external account connection or publication. Source baseline: `764b06667be71379ea1bde71058b4a9a753c1dfe`. Only source and public/synthetic data were examined.

## Recommendation

Expand a **curated, locally bundled catalog**, beginning with the common gym gaps and more dependable metadata. Target **200–250 reviewed total entries** for the first expanded release; this is a proposed scope target, not a source count or a promise that raw ingestion produces a useful catalog. Start with roughly 60 high-priority additions and validate them before filling the remaining coverage gaps. Keep all existing names and personal definitions intact.

Use `free-exercise-db` as a candidate metadata starting point, then review its records rather than copying everything indiscriminately. Retain source and license provenance. Start without newly sourced pictures; image rights and download size are a separate workstream. The app must browse, search and substitute offline without a live API, key, subscription or image service.

## What the current source actually contains

Counts were computed by evaluating the `DEFAULT_LIB` object in an isolated Node VM; no user's `Store` or browser profile was opened.

| Dimension | Observed source count |
| --- | ---: |
| Built-in names | **56** |
| Weight/reps | 30 |
| Bodyweight reps | 11 |
| Duration | 7 |
| Distance/duration | 5 |
| Weight/duration, assisted bodyweight, weighted bodyweight | 1 each |
| Machine / Cable / Dumbbell / Barbell | 8 / 6 / 9 / 9 |
| Bodyweight / Kettlebell | 16 / 2 |
| Primary Calves / Forearms / Glutes | 1 / 1 / 2 |
| Entries with nonempty secondary mapping | 37 |

There are **no built-in Band or Suspension entries**, despite those equipment choices existing. There is no built-in exercise with Lower Back as its primary group. The current 16-label muscle vocabulary has broad Shoulders/Upper Back groups and no Adductors/Abductors group. These are metadata observations, not anatomical or programming recommendations.

A real installation can contain more than 56 names: `libNames()` includes stored library names plus workout-history names; the shared picker also includes routine and active-session names. The 56 count describes the bundled seed, not the owner's personal history or installation.

### Discoverability and classification problems accompany the small catalog

| Confirmed source behavior | Consequence / recommendation |
| --- | --- |
| Standalone `fitLibraryTab()` searches a simple substring of the name. The shared picker tokenizes names, muscle, equipment and type, and expands DB/BB/RDL/DL aliases. | Use one normalized search query/matching contract across both surfaces. A user should not find an exercise in Add but miss it in Library with the same query. |
| Equipment filters compare exact strings. `inferMeta('Squat (Smith Machine)')` returns `Smith Machine`, while `EQUIPMENT` has `Machine` but no `Smith Machine`. | Introduce an explicit parent equipment category and optional subtype or a consistent supported option. Do not leave imported/inferred exercises unreachable by the expected filter. |
| Isolated evaluation of current `inferMeta('Chest-Supported Row (Machine)')` returns primary `Chest`; `inferMeta('Rear Delt Fly (Machine)')` also returns `Chest`. | The earlier chest/fly regex wins before row/delt matching. Do not treat name inference as reviewed muscle metadata. Prefer explicit catalog mappings, disclose inference, and include these cases in regression vectors. |
| `inferMeta('Hip Adduction (Machine)')` returns `Other`. | Broader names need a compatible muscle taxonomy and an explicit unknown/unmapped state. Do not force every new movement into an inaccurate existing bucket. |
| `exInfo()` prefers the user's `exMeta` record over the built-in catalog, then falls back to inference. New accepted exercise instances carry optional classification snapshots; legacy history uses a labeled current-mapping fallback. | Preserve that precedence and recorded snapshots. New defaults can change derived legacy reports even without editing records; preview and disclose those effects rather than silently presenting them as historical facts. |

These are source/isolated-function reproductions, not claims that every affected path has been measured on a physical iPhone. The shared custom-muscle entry defect is investigated in the separate exercise/notes audit.

## Current candidate-source evidence

The matrix separates software licensing, exercise content and media. Public availability or an open API is not by itself a redistribution grant. Licensing interpretation below is an engineering recommendation; unresolved redistribution terms need a specific rights review before shipping the affected assets.

| Source | Confirmed evidence, accessed Nov 7 | Offline/cost/privacy fit | Proposed use |
| --- | --- | --- | --- |
| **free-exercise-db** | Its official repository calls the dataset public domain, links an Unlicense and explicitly describes local use of JSON and images. Schema includes primary/secondary muscles, equipment, category, instructions and image paths; README notes incomplete fields. [Repository](https://github.com/yuhonas/free-exercise-db), [license](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md), [schema](https://github.com/yuhonas/free-exercise-db/blob/main/schema.json). | Local reviewed data can avoid a runtime service/account. Primary upstream provenance and the scope of rights in each selected image still deserve review; the root license's software wording and upstream media do not warrant an absolute ownership guarantee. | **Preferred metadata candidate**, pinned and curated. Do not hotlink the raw image CDN or copy the frontend's image service. Retain notices/provenance even where not required by the stated license. |
| **wger** | Official 2.7 docs separate AGPL-3+ application code, initial exercise/ingredient data under CC-BY-SA 3.0, documentation under CC-BY-SA 4+, and some images with separate source records. Public exercise API endpoints need no authentication. [License overview](https://wger.readthedocs.io/en/latest/), [API](https://wger.readthedocs.io/en/latest/api/api.html). | Useful open-source alternative, but exact selected content/media attribution and share-alike duties must be tracked. A live request still requires connectivity; bundling is a separate content-license decision. wger.de's public web/API landing page hit an anti-bot gate during this research; live catalog totals were not verified. | **Secondary reference / possible separately licensed content pack**. Do not import AGPL application code casually or assume its software license governs every image. Do not claim the whole Body app must adopt a license solely from this overview. |
| **ExerciseDB / AscendAPI** | Official pages distinguish free V1 hosted API from paid/enhanced products. V1 docs advertise 1,500 free records, not independently enumerated here. Official caching policy allows storage only when the plan explicitly permits it and describes weekly media-URL rotation. [V1](https://docs.ascendapi.com/products/edb-v1/overview), [caching](https://docs.ascendapi.com/guides/caching). Its GitHub repository displays AGPL-3.0; this does not establish blanket rights to download/rehost its commercial data or media. [Repository](https://github.com/ExerciseDB/exercisedb-api). | Runtime API/CDN, plan-specific storage rights and rotating URLs conflict with an unconditional offline catalog. Product/provider claims and tiers differ; no price or bulk redistribution right was verified. | **Defer for the free offline-first beta.** Revisit only with explicit terms for permanent local/bundled use and a separate product-owner decision about ongoing costs/services. |

`free-exercise-db`'s combined JSON contained **876 records** when fetched, with head SHA `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`. This is an observed parse count, not a curated count or independent biomechanical validation. Re-fetching the data at a pinned SHA makes the candidate reproducible: [pinned combined JSON](https://raw.githubusercontent.com/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/dist/exercises.json). That source includes strength, powerlifting, Olympic weightlifting, conditioning, stretching and other categories; they should not all enter the default lifting browse list without curation. Its schema has multiple-primary arrays, null equipment possibilities and a taxonomy different from Body Dashboard, so direct field copying is insufficient.

## Curated expansion priorities

These are proposed catalog entries and coverage tests, not prescribed exercises or a personalized program. Exact naming and metadata must be reviewed.

1. **Common gym equipment gaps:** flat dumbbell bench, incline barbell bench, machine chest press, chest-supported machine row, seated leg curl, hack squat, Smith squat/press variants, reverse pec deck, seated calf raise, cable lateral raise and cable overhead triceps extension.
2. **Substitution coverage:** meaningful machine/cable/dumbbell/bodyweight options for common movement families. Keep distinct equipment/load bases; a swap should suggest compatible alternatives without pretending their performance is directly comparable.
3. **Bodyweight variants:** assisted and weighted dips/chins/pull-ups, band-assisted alternatives and clear bodyweight versus added-load versus assistance tracking. Distinct variants should not share an E1RM history automatically.
4. **Unilateral work:** single-arm cable row/press, single-leg RDL, split-squat/step-up variants and single-leg curls/extensions. Specify load entry and side convention; never silently double recorded sets for two limbs.
5. **Underserved regions and equipment:** reviewed hip adduction/abduction, lower-back/trunk, forearm/grip, calves, bands and suspension entries. Coordinate any finer muscle groups with the volume redesign rather than creating incompatible taxonomies independently.
6. **Time/distance/load-time:** elliptical, stair climber, stationary bike, walking/running variants, loaded carries and common timed holds. Use the existing seven tracking types where they genuinely fit. Defer sports whose interval/scoring model needs a new data shape; do not misclassify every sport as strength or assign invented tonnage.

The goal is dependable coverage of everyday choices, not the largest headline count. Limit near-duplicate grips/angles in default browse; use explicit variants and good aliases, not hundreds of almost identical names at equal priority. Search and favorites/recency matter as much as catalog size.

## Data and compatibility contract for implementation

- Keep every existing stored exercise/workout/set/routine identity and name. A catalog upgrade is additive; do not use global rename/merge as an upgrade mechanism.
- Preserve user `exMeta` overrides, notes, tracking choices, how-to links and bodyweight conventions. Bundled metadata must never overwrite these.
- A new optional stable catalog key can support future lookup/provenance, but existing name-key records and old backups must continue to work. Aliases improve search only; they must not merge histories or assert equivalent load basis.
- For each selected entry, capture source URL, source record ID, pinned revision, declared content license, review date/status and any separately licensed media provenance. No selected item should be marked reviewed merely because it was present in a dataset.
- Review and map primary/secondary roles separately from muscle-volume credit rules. Empty secondary is not necessarily reviewed evidence of no secondary involvement; support unknown/unreviewed metadata rather than inventing certainty.
- Align `equipment category/subtype`, muscle vocabulary, aliases, tracking type and limb/load basis before ingestion. Map upstream `body only`, `e-z curl bar`, `kettlebells` and multiple-primary arrays explicitly.
- Preserve recorded classification snapshots. Report which legacy history rows depend on current mapping; preview report changes when new built-in names resolve previously inferred legacy exercise names. Do not backfill old snapshots as though they were recorded at workout time.
- Expand the locally shipped seed with a new additive catalog revision, reusing current seeding/default paths and existing storage namespace. Failed updates must keep current data usable. The source catalog and optional images must fit the project Pages/offline packaging model; new separate runtime assets require explicit service-worker/package allowlisting and validation.
- Images are optional. Text names, type, equipment and useful cues remain complete with missing images. If local assets are later approved, verify licenses/attribution individually, pre-size/compress them and give a deliberate optional download strategy rather than adding hundreds of remote image dependencies to the offline shell.

## Proposed delivery and acceptance

| Stage | Owner | Deliverable / exit criteria |
| --- | --- | --- |
| 1 — Repair discoverability and metadata contract | UI/domain + QA | One query/filter contract across Library and picker; DB/BB/RDL aliases behave consistently; stale filters are visible/clearable; Smith/machine subtype behavior defined. Confirm the custom-secondary fix separately before using its output as trusted metadata. |
| 2 — Candidate curation | Catalog curator + trainer/product owner | Review ~60 highest-priority additions against the missing movement/equipment matrix. Metadata, tracking/load basis, source/license and alias conflicts are signed off entry by entry. No media required. |
| 3 — Offline seed upgrade | Domain + QA | Add entries without deleting/renaming existing data or replacing user overrides. Fresh and populated synthetic profiles both work; repeated updates are idempotent. No record migration to a new identity scheme. |
| 4 — Reach 200–250 reviewed total entries | Curator + UX | Fill verified coverage gaps, not duplicates. Review browse density and substitution quality at 390px, both themes and enlarged text. The target may shrink if quality or taxonomy review requires it. |
| 5 — Optional media pack | Separate rights/UX decision | Only after content provenance and persistent offline redistribution are cleared; all text paths remain useful without it. No service is enabled by this research. |

Validation must include: fresh seed; old populated backup; imported unknown names; user-overridden built-ins; same exercise name with different source metadata; unknown/multiple primary mappings; assisted/weighted/bodyweight load basis; unilateral convention; duplicate aliases; empty/no-result filters; offline reload; repeated upgrade; backup restore including existing photos; and source mapping changes that could affect legacy volume reports. Test the complete picker/Library/routine/active swap paths in Chromium and WebKit using synthetic profiles, then actual iPhone acceptance. Establish measured browse/search task baselines before claiming speed improvements.

## Verification and limitations

Read AGENTS.md, inspected `DEFAULT_LIB`, `inferMeta`, `exInfo`, `exerciseClassification`, `libNames`, `exercisePickerItems`, search/filter logic, additive seeding and the data model. Isolated Node evaluation established the counts and the four inference examples above. No personal library was inspected; no external-source images were downloaded; no live API source was connected to the app. Public-source data quality and third-party media rights are not certified. Research is not a legal opinion or a recommendation to perform every listed exercise.
