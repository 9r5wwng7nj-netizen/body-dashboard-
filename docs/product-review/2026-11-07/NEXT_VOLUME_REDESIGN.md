# Rebuild muscle-set analysis around questions a lifter can answer

November 7, 2026 (America/New_York) · Investigation and proposal only

Source audited: `764b06667be71379ea1bde71058b4a9a753c1dfe`. Read the current `AGENTS.md` and prior `TRAINING_REVIEW.md`. The owner has confirmed that **both planned routine coverage and actual weekly training** are wanted. No runtime, records, committed tests, branches or deployment were changed by this review. Probes used synthetic content in a fresh Chromium context.

## Recommendation

Replace the scattered coverage modal / monthly credited bars / four-week credits table with one **Muscle sets** workspace, with clearly separated **Plan** and **Performed** views. Lead with body-area rows, expose the current muscle vocabulary in drilldown, and show primary and secondary counts separately. Every count must reveal its contributing exercise/set records and mapping source.

A working-set count is a useful accounting convention, not a measured amount of muscle stimulation. Do not call it “effective volume,” assign a balance/readiness grade, or auto-prescribe an optimal target. Keep physical logged-set totals separate from muscle-attributed counts, which overlap. Keep load × reps (“load volume”) in exercise/session detail with its existing unit/basis limitations; it is not the headline measure for comparing different body parts.

## Confirmed findings

| Evidence in current `index.html` | Verified behavior | Classification |
| --- | --- | --- |
| `routineCoverage`, `drawRoutineCoverage` | One routine at a time; optional whole repeats/week; default primary and secondary separated; optional 0.5 or 1 secondary-credit model. Contributors are present but nested in every muscle disclosure. | Existing feature, weak planning scope for a multi-routine rotation. Not evidence that the arithmetic is wrong. |
| `muscleSets`, `fitStatsTab`, `workoutSummaryModal` | History and finish summary still combine primary = 1 and secondary = 0.5 by default. The history function returns only combined values, losing the separate roles. | Confirmed semantic inconsistency with the routine overview. “Triceps 3.5” does not let a person see two isolation sets plus three compound exposures. |
| `MUSCLES`, `DEFAULT_LIB` | A single flat vocabulary mixes body areas and specific groups: Shoulders, Lats, Upper Back, Lower Back, Abs, Full Body and Cardio. Every definition has one primary group. | A clear taxonomy limitation. It cannot truthfully show front/side/rear delts, hamstring heads or “all back” from those fields alone. |
| `routineCoverage` vs `workSets`/`muscleSets` | Timed movements are excluded from routine resistance-set totals, but performed `muscleSets` counts every non-warmup row, including timed Plank. | Confirmed cross-view counting mismatch. Timed training should remain useful and separately visible. |
| `fitStatsTab` (`inMonth`, `wk`) vs `completedWorkoutHistory` | Monthly and weekly muscle tables query `W()` directly, including future-dated saved workouts. Dashboard/finish completed-this-week uses the future-excluding query. | Confirmed date eligibility defect/inconsistency. A future record must be retained but excluded from performed-to-date metrics. |
| `workSets` | Excludes only `type === 'warmup'`; has no validity/done filter. New finish commands already retain accepted actual sets, while imported/older history can omit `done`. | Do not “fix” this by requiring `done === true`, which would discard legitimate legacy history. A malformed empty row can currently receive muscle credit; evidence of robustness gap, not evidence of the owner's data being malformed. |
| `exerciseInfo`, `exerciseClassification`, `WorkoutCommands.complete` | Newly accepted blocks can carry version-1 classification snapshots; legacy blocks fall back to current library mapping. | Good preservation foundation. Current global remapping must not silently rewrite new snapshots; old interpretation still needs an explicit legacy/current-mapping label. |
| `muscleSets` vs `routineCoverage` | Routine counting deduplicates secondary names and removes primary/secondary self-overlap. `muscleSets` does not perform those defensive checks. | Potential overcount for malformed/repeated legacy mappings. No claim that normal UI-created mappings currently contain these values. |
| Existing labels/UI | Monthly bars are ranked by the largest observed credit value. Four-week table uses a dot for zero and a single neutral tint for work; no anatomy overview or coarse-to-fine grouping exists. | The owner may be asking for a different mental model, not merely new colors or a new multiplier. A dot also needs a readable text/accessible zero state. |

### Synthetic runtime reproduction

Temporary probe `/tmp/bd-volume-audit.mjs` loaded current source in a fresh test context with `America/New_York` time. This was not a full test-suite run or a real-record inspection.

- Plan: Bench Press (Barbell) × 3, Triceps Pushdown (Cable) × 2, Plank × 1. `routineCoverage(..., 0, 1)` reports **5 resistance sets**, with Plank separately listed; Chest primary 3, Triceps primary 2 / secondary 3, Shoulders secondary 3.
- Performed version of the same rows: `muscleSets` reports **Chest 3, Triceps 3.5, Shoulders 1.5, Abs 1**. `workoutSets` reports **6** rows.
- A synthetic saved history block with one empty, unchecked normal Bench row still returns Chest 1 / Triceps 0.5 / Shoulders 0.5.
- A synthetic future workout on November 9 appears in November's monthly report, while `completedWorkoutsThisWeek()` on November 7 returns only the earlier workout.

These results explain plausible confusion. They do not establish which screen or arithmetic the owner found unsatisfactory; the root lead should retain that distinction.

## Proposed information architecture

Entry: **Train → Progress → Muscle sets**. From a routine editor, **Set coverage** opens the Plan view scoped to that draft and returns to the same unsaved editor on Back. Do not lose the existing one-routine shortcut.

| View | Main question | Default scope | What it must not imply |
| --- | --- | --- | --- |
| **Plan** | “What am I programming across these routines?” | Selected routine, or an explicitly selected rotation | A routine folder/rotation is not automatically one calendar week. |
| **Performed** | “What have I actually logged in this period?” | Local Monday through today | Future saved records and active drafts are not completed work. |
| **Compare** — later within the same workspace | “What changed from plan to actual?” | A named scenario and a stated actual interval | No invented adherence denominator when the person has not assigned a schedule. |

Plan can select Routine A + Routine B as **one rotation** with one occurrence each. If the person wants a week scenario, they explicitly set A × 2 and B × 1, or map routine occurrences to dates. Default to “frequency not specified,” never silently A/B × 3 because a folder has three routines. MVP does not require a scheduling engine or planned-session database.

## Counts and taxonomy contract

### Vocabulary

1. **Overview body areas:** Chest, Back, Shoulders, Arms, Legs, Glutes, Core. Use Unmapped / needs review as an independent coverage row, and Conditioning / timed work as a separate section.
2. **Current muscle drilldown:** Back → Lats / Upper Back / Lower Back; Arms → Biceps / Triceps / Forearms; Legs → Quads / Hamstrings / Calves; Core → Abs. Chest, Shoulders and Glutes remain at the available granularity.
3. Do not synthesize lateral/rear/anterior delt counts from the generic Shoulders field. A future curated catalog can supply reviewed granular targets with provenance; existing generic mappings stay visibly broad.
4. Treat “Full Body” as **unspecified distribution**, not one set for every muscle. Cardio is an activity classification, not an anatomical group.
5. Existing metadata says **primary/secondary**, not scientifically measured direct/indirect stimulation. UI should use “Primary sets” and “Secondary involvement.” If “direct” is chosen as friendlier copy, define it explicitly as the app's primary-target mapping. A later reviewed target list may allow multiple primary muscles; normalize today's single primary into the read model without overwriting it or assuming such data already exists.

### Deduplication and totals

- Count each eligible physical set row once in the global logged-set total.
- Count a row once per mapped muscle and role. Remove duplicate secondary entries and exclude the same muscle from secondary when it is already primary.
- Within a **coarse body area**, count the set once even when two child muscles are mapped. Primary takes precedence over secondary inside that area. Three rows mapped primary Upper Back + secondary Lats yield **Back: 3 primary, 0 additional secondary**, not Back 3 + 3.
- Child muscle rows may overlap. Do not sum them to derive a body-area count or a percentage of all logged sets. Derive body-area counts from unique set provenance.
- Every row carries contributor references sufficient to explain a count. Preserve real IDs where present. Missing legacy IDs can use stable read-time `(workout ID, block position, set position)` references; do not replace record identities merely to render a report.
- “0 mapped primary sets” is different from “this muscle received no training,” particularly when unmapped sets exist. Empty history is “No completed records in this period.”

### Eligible rows

| Case | Proposed treatment |
| --- | --- |
| Active session | Separate “In progress” note, excluded from Performed totals until the current finish command commits actual work. |
| New completed history | Use the canonical accepted set base; do not count unchecked suggestions or pending draft amendments as extra sets. |
| Legacy/imported history without `done` | Treat saved valid actual rows as historical work, retaining compatibility. Do not globally require `done:true`. Missing/invalid required fields go to a visible review count rather than silently crediting muscle work or deleting records. |
| Date | Use workout start's existing local calendar date; local Monday–Sunday ranges, with current week capped at today. Backdating and edits recompute the selected interval. A future record is retained and separately disclosed/excluded until its date is reached. |
| Warm-up | Exclude from working-set headline; optionally show “3 warm-up rows” in breakdown. Never infer warm-up solely from low load. |
| Drop/failure | Count each logged working row once and show its type in contributors. No failure multiplier. Do not infer how many drop segments occurred inside a single row. |
| Unilateral | Follow stored row convention, no automatic doubling or halving. Show “logged rows; sides not normalized” where side metadata is unavailable. A future per-side/pair option must not retroactively reinterpret old data by guess. |
| Bodyweight/weighted/assisted | Valid rep-based working rows can contribute muscle counts under their mapped type. No invented bodyweight conversion is needed for a set count. Keep load-basis comparisons separate. |
| Timed isometric / carries | Show segments and duration separately; may show mapped muscle exposure, but do not equate a 45-second Plank segment with one resistance working set. |
| Distance/cardio | Separate sessions/time/distance; no muscle-set inflation from conditioning secondaries. |
| Swaps | Completed original work keeps original classification/IDs; accepted replacement work counts only under its own mapping. Never credit remaining unchecked replacement targets. |
| Metadata | New snapshots win; legacy current mapping is labeled. Report “recorded mapping,” “legacy/current mapping,” “inferred” and “unmapped” counts. Mapping edits must not backfill history silently. |

## Synthetic worked example

These are counting demonstrations, not exercise prescriptions or suggested weekly doses.

### Two-routine plan

- **Routine A:** Bench Press 3; Lateral Raise 2; Triceps Pushdown 2 = **7 physical working-set slots**.
- **Routine B:** Seated Cable Row 3; Lat Pulldown 2; Biceps Curl 2 = **7 physical working-set slots**.
- **One A+B rotation:** **14 slots**, with no weekly frequency assumed.

Using current built-in mappings:

| Body area | Primary sets | Additional secondary involvement | Explanation |
| --- | ---: | ---: | --- |
| Chest | 3 | 0 | Bench |
| Back | 5 | 0 | Row 3 + Pulldown 2. Row's secondary Lats is deduplicated inside Back. |
| Shoulders | 2 | 3 | Lateral Raise primary; Bench secondary |
| Arms | 4 | 8 | Pushdown 2 + Curl 2 primary; Bench 3 + Row 3 + Pulldown 2 secondary |

Arms drilldown: Triceps primary 2 / secondary 3; Biceps primary 2 / secondary 5; Forearms primary 0 / secondary 2. The Forearms exposure is already contained in the same curl rows as Arms primary; summing child rows would be misleading. The overview and drilldown therefore carry an overlap explanation.

### Actual local week, November 2–8, through November 7

- Monday Nov 2: Routine A, all 7 rows accepted/finished.
- Thursday Nov 5: Routine B, only 2 Row sets finished, plus 2 Pulldown and 2 Curl = 6 rows.
- Entered Saturday but backdated to Tuesday Nov 3: one legacy Bench row, two explicit rep-based rows mapped Other, one 45-second Plank segment. No classification snapshot on that Bench row; label current mapping.
- Future Monday Nov 9 Routine A is saved but excluded. An active Saturday workout's suggestions are excluded.

Headline: **16 logged resistance working rows · 1 timed segment · 2 resistance rows need muscle mapping.** Three dated completed workouts this week; this is not “17 muscle sets.”

| Body area | Primary | Additional secondary |
| --- | ---: | ---: |
| Chest | 4 | 0 |
| Back | 4 | 0 |
| Shoulders | 2 | 4 |
| Arms | 4 | 8 |
| Unmapped resistance | 2 | Not inferred |

There are 14 known-mapped primary rows plus 2 unmapped resistance rows. The one timed Core segment remains visible separately. The backdated Bench adds to Tuesday/current week when its record is committed, not Saturday and not a duplicate of the legacy record. A diff view can show Row: planned 3 vs actual 2 **for that explicitly compared occurrence**; comparing the whole 14-slot rotation against a week that also contains extra backdated work must disclose that scope difference.

## iPhone Cobalt Air wireframe

```text
‹ Progress                    Muscle sets
[ Plan ] [ Performed ]

This week                 ‹ Nov 2–8 ›
Through today · local Monday week
16 working rows · 3 workouts
2 unmapped · 1 timed segment    Review ›

                       Primary   Secondary
Chest       ████████       4          —    ›
Back        ████████       4          —    ›
Shoulders   ████           2          4    ›
Arms        ████████       4          8    ›
Legs                       0 mapped       ›
Glutes                     0 mapped       ›
Core                 1 timed segment      ›

Primary and secondary overlap.
Secondary is involvement, not extra physical sets.

Mapping: 13 recorded · 1 legacy/current · 2 unknown

Today             Train             Nutrition
```

Use primary bars in cobalt/periwinkle; secondary as a separate outlined marker/bar plus a number/label. Never stack them into a misleading total, use a target-progress ring, or tint red/green for “balanced.” Rows need 44px targets, 16–20px gutters and visible labels. At enlarged text, put primary/secondary values on separate labeled lines rather than squeezing two numeric columns. Keep the selected period and scope visible.

Tap **Arms → Triceps**:

```text
‹ Arms                         Triceps
2 primary sets · 4 secondary involvements

PRIMARY
Nov 2 · Triceps Pushdown         2 rows ›

SECONDARY
Nov 2 · Bench Press              3 rows ›
Nov 3 · Bench Press              1 row  ›
  Legacy record · current library mapping

[Counting rules] [Review exercise mappings]
```

Each contribution opens its workout/exercise detail, not a global rename editor. Plan uses the same rows but reads “planned slots” and contributors lead to the routine draft. In Plan, selecting A+B displays “One rotation · 14 slots”; an explicit week-scenario action can set A×2/B×1. No hidden conversion between these scopes.

## Fractional credits and evidence

**Recommendation:** remove fractional credit controls from the default overview, but do not pretend the 0.5 convention has no research basis. Preserve it as an optional advanced **model** view with its exact formula and scope, after separate primary/secondary counts are understandable. It must not be shown as measured stimulation or a universal equivalence for every exercise/person.

An original meta-regression publication compared indirect-set counting methods of 0, 0.5 and 1 and reported strongest relative evidence for the fractional method in its modeled data. That supports investigating a clearly labeled model; it does not supply this app's missing exercise-specific anatomical mappings or establish what one individual set “really” contributes. This is the product interpretation of the cited abstract, not a claim that fractional accounting is invalid. [Pelland et al., *The Resistance Training Dose Response*](https://pubmed.ncbi.nlm.nih.gov/41343037/), [publisher DOI](https://doi.org/10.1007/s40279-025-02344-w). Accessed November 7, 2026. Search exposed the PubMed abstract; direct full page/DOI retrieval was unavailable in the research tool, so no full-text method claims or dose thresholds are made here.

No weekly target thresholds, injury/readiness inference, minimum “effective RPE,” or personalized programming advice is included in this proposal.

## Implementation-ready acceptance cases

1. Plan A+B yields the 14-slot example exactly; no week label before explicit occurrence/frequency selection.
2. Selecting A×2/B×1 changes the scenario only, never routine templates or history.
3. Performed yields the synthetic 16-row/1-segment example; future and active suggestions excluded, backdated actual work included by local date.
4. Week boundaries cover local Monday and Sunday, month-crossing weeks and DST; date edits move contribution once, not append duplicate totals.
5. Row primary Upper Back + secondary Lats contributes one Back primary; per-muscle drilldown preserves both disclosed roles without adding them to the body-area total.
6. Duplicate secondary names and self-secondary cannot inflate counts. Invalid/unknown labels go to mapping review.
7. Invalid empty legacy rows are not credited silently; valid legacy records without `done` still count. Raw records remain exportable unchanged.
8. New recorded classification remains stable after a catalog mapping edit. Legacy/current mapping label updates its interpretation without rewriting source records.
9. Unknown mapping is distinct from zero. Partial mapping coverage is visible before a person interprets unfilled muscles as untrained.
10. Warm-up, drop, failure and unilateral conventions match the declared rules; no automatic side/failure multipliers. Timed/cardio rows stay visible in separate units.
11. A partial swap preserves original completed contributors and only adds accepted target work, with IDs and recovery semantics intact.
12. All totals have an exercise/set contributor trail; contributor counts reconcile with the displayed numbers and label overlap.
13. 390px and 375px, both Cobalt Air modes and 200% text: no horizontal navigation trap; 44px rows; useful labels and text summaries; keyboard/VoiceOver names and focus return.
14. Offline reload, backup/export/restore and imported name variants retain identical source records and recomputed totals; no stored aggregate migration or new database is necessary.

## Delivery sequence and open judgments

1. **First:** correct history date eligibility, define valid historical-row policy without dropping legacy records, and unify primary/secondary query outputs. Keep a parity fixture for current behavior as a migration comparison, not as truth to preserve forever.
2. **Then:** a read-only Plan/Performed overview with unique-set coarse grouping, drilldown and mapping coverage. Use existing collections/IDs; compute projections from source records. No global database redesign or persisted counters.
3. **Next:** catalog metadata review and the persistent-cue/custom-secondary corrections from the companion audits. More exercises with poor mappings would worsen this analysis.
4. **Later:** explicit schedule/scenario comparison, granular target metadata and optional fractional model controls, after reviewing actual user questions and a default-screen prototype.

Owner judgments still needed: preferred coarse areas (especially Legs vs separate Quads/Hamstrings/Calves and Glutes), whether a rotation or a scheduled week is the main planning unit, per-side logging convention, desired default ranking (anatomical order recommended; rank-by-count optional), and what specifically felt wrong in the prior output. Both planning and performed scope are already confirmed; do not ask that again.
