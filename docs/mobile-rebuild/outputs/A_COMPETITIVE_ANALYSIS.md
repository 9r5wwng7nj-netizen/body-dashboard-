# Body Dashboard competitive analysis and UX handoff

> Platform update, November 7, 2026: this is preserved research from the native planning stage. Task/friction findings remain useful; the active delivery route is [web-first](../WEB_FIRST_PLAN.md).

Research date: November 7, 2026. Audience: product owner and Agents B and C. Scope: iPhone personal-use MVP, with a later coaching reference. Recommendations below are proposed changes to the draft PRD; the PRD and application have not been modified.

**Recommendation: prioritize a dependable logging workflow and faithful history transfer.** Previous-performance columns, checkboxes, rest timers and progress charts already have strong documented competitors. Body Dashboard's best opportunity for Seth is a focused combination: immediate access to his own history, dependable offline logging, and useful training/diet context with minimal interruption. This is a product hypothesis to validate, not an established market-wide gap.

## Research scope and evidence rules

Reviewed the current working-tree `AGENTS.md`, rebuild README, source audit and master PRD. The existing uncommitted web refresh remains part of that context. No personal exports, browser records or credentials were accessed.

The six comparison products are **Hevy, Strong, MacroFactor Nutrition, MacroFactor Workouts, Cronometer and ABC Trainerize**. MacroFactor Workouts replaces TrueCoach from the starting list because it directly competes for the experienced lifter's core logging/progression job. Nutrition and Workouts are separate MacroFactor apps and count as two products here. Trainerize supplies the Phase 2 coaching reference. TrueCoach was not included in the final comparison; this report contains no comparative ranking of it.

Evidence labels:

- **D — Documentation:** official help, developer product pages, release information or Apple-distributed metadata. This confirms a documented claim, not successful execution in an installed build.
- **H — Hands-on observation:** an installed-app workflow actually executed during this research. **None performed.**
- **I — Inference:** an interpretation or proposed Body Dashboard response, explicitly separated from competitor behavior.
- **Unknown:** not established by the reviewed evidence. An unknown is not a claim that a feature is absent.

All linked sources were accessed November 7, 2026. Platform is iPhone unless a row explicitly says web or cross-platform documentation. No competitor tap counts, performance measurements or durability tests were performed. Instructions containing several numbered steps are not treated as measured tap counts. Pricing, ratings, download counts and testimonials are excluded.

## Current iPhone versions and evidence limits

Apple's US software lookup was queried directly for the following app IDs. Release dates below are UTC dates from that metadata. Version metadata does not prove an unversioned help article precisely matches that binary.

| Product | US lookup version | Release date | Minimum iOS in metadata | Official listing |
| --- | --- | --- | --- | --- |
| Hevy | 3.2.5 | 2026-11-06 | 15.1 | [Hevy](https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350) |
| Strong | 6.5.1 | 2026-10-08 | 15.0 | [Strong](https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577) |
| MacroFactor Nutrition | 5.8.11 | 2026-11-05 | 15.6 | [MacroFactor Nutrition](https://apps.apple.com/us/app/macrofactor-macro-tracker/id1553503471) |
| MacroFactor Workouts | 1.4.3 | 2026-11-05 | 18.0 | [MacroFactor Workouts](https://apps.apple.com/us/app/macrofactor-workouts-tracker/id6737156524) |
| Cronometer | 4.60.2 | 2026-11-03 | 15.5 | [Cronometer](https://apps.apple.com/us/app/cronometer-calorie-counter/id1145935738) |
| ABC Trainerize base app | 8.18.8 | 2026-10-17 | 15.5 | [Fitness App ABC Trainerize](https://apps.apple.com/us/app/fitness-app-abc-trainerize/id516851502) |

Version source: [Apple lookup for the first five apps](https://itunes.apple.com/lookup?id=1458862350,464254577,1553503471,6737156524,1145935738&country=us&entity=software) and [Apple lookup for Trainerize](https://itunes.apple.com/lookup?id=516851502&country=us&entity=software). Trainerize's base listing seller is TSR Gym Technik Ltd.; custom-branded apps can have different binaries.

Freshness matters: the indexed Hevy listing showed 3.2.4 while the direct lookup returned 3.2.5. Strong's core help articles include 2021–2024 update dates. Cronometer's mobile diary overview was updated November 3, 2026, and Trainerize's known-issues page identifies November 3, 2026 as its last update. Historical help is retained as documented behavior with lower confidence about exact current interactions. Competitor minimum-iOS values are context, not a recommendation for Body Dashboard's supported devices.

## Dated evidence matrix by user task

### Task 1 Resume or repeat training and correct a set

| Product | Documented behavior and source | Evidence and uncertainty |
| --- | --- | --- |
| Hevy | Start a routine or empty session; previously logged exercises can bring prior sets/load/reps; completion triggers a rest timer. [Workout logging](https://www.hevyapp.com/features/track-workouts/). | D. Cold-launch recovery and exact accidental-completion undo behavior were not executed. |
| Strong | Templates or empty sessions; edit sets and complete with a checkbox. Supersets guide next-set navigation; set-number menus select warm-up/drop/failure tags. [Logging](https://help.strongapp.io/article/229-my-first-workout), [supersets](https://help.strongapp.io/article/98-supersets-and-circuits), [set tags](https://help.strongapp.io/article/166-set-tags). | D. Core articles are dated 2021; the current binary's exact layout and undo semantics need observation. |
| MacroFactor Workouts | A table shows previous performance, weight and reps. Accidental logging can be undone by unchecking. Minimize keeps a session active; rest timer remains at the top. [Workout logging](https://help.macrofactorapp.com/en/articles/310-how-to-log-a-workout). Warm-up and target controls are in an exercise action bar. [Exercise options](https://help.macrofactorapp.com/en/articles/333-accessing-exercise-options-during-a-workout). | D. Minimizing is documented; process-termination survival is not proved. |
| MacroFactor Nutrition | No resistance-session workflow evaluated in this nutrition app. | Unknown for this task; the separately evaluated Workouts app addresses it. |
| Cronometer | Diet documentation includes exercise entries; a progressive-overload set matrix was not evaluated. [Mobile diary](https://support.cronometer.com/hc/en-us/articles/360018593112-Mobile-Diary-Overview). | D for diary scope; detailed set-logging capability unknown. |
| ABC Trainerize | Scheduled workout → Track records statistics, while Check In has a different purpose. Workout statistics are documented as saving even when closing without End. [Mobile training workflow](https://help.trainerize.com/hc/en-us/articles/208689026-How-do-I-use-the-mobile-app-when-I-m-working-out). | D. No independent save/termination or undo test. The distinction between attendance and actual logging is relevant to the later coach UI. |

### Task 2 See comparable performance and progression

| Product | Documented behavior and source | Evidence and uncertainty |
| --- | --- | --- |
| Hevy | Previous values can come from the last exercise occurrence overall or the occurrence within the current routine. [Previous values](https://www.hevyapp.com/features/track-workouts/). | D. This establishes a choice of baseline context, not that all machine/variant/load conventions are equivalent. |
| Strong | Focus Metric compares current and prior exercise performance, including volume increase. Exercise details expose history/charts/records. Its 1RM help identifies Brzycki estimates. [Focus Metric](https://help.strongapp.io/article/226-focus-metric), [details](https://help.strongapp.io/article/237-about-exercise-detail), [1RM definition](https://help.strongapp.io/article/133-1rm). | D. The formula differs from Body Dashboard's proposed Epley baseline. Do not call a numeric difference between algorithms a training improvement. |
| MacroFactor Workouts | Smart Progression uses logged sets to recommend weights; exercise statistics include estimated strength at different rep ranges and volume. [Exercise options](https://help.macrofactorapp.com/en/articles/333-accessing-exercise-options-during-a-workout), [exercise statistics](https://help.macrofactorapp.com/en/articles/334-seeing-detailed-stats-and-data-for-each-exercise). | D. Accuracy, personalization quality and comparison speed were not measured. |
| MacroFactor Nutrition | Not evaluated as a lifting-performance comparison tool. | Unknown for this task. |
| Cronometer | Nutritional and biometric charting is documented; resistance-exercise E1RM comparisons were not verified. [Mobile charts](https://support.cronometer.com/hc/en-us/articles/360019864311-Mobile-Charts). | D for charts; lifting comparison unknown. |
| ABC Trainerize | Its November 3 issue note describes repeated-exercise autofill problems as open and mobile exercise-history access as expanded to 365 days while fuller restoration remains ongoing. [Known issues](https://help.trainerize.com/hc/en-us/articles/360034499751-Known-Issues-We-Are-Currently-Working-On). | D, date-sensitive. Not a measured failure in 8.18.8; use it to design repeated-instance and long-history test cases. |

### Task 3 Reuse food portions and distinguish partial days

| Product | Documented behavior and source | Evidence and uncertainty |
| --- | --- | --- |
| Hevy | A food-portion editing and daily-completeness workflow was not verified in the selected sources. | Unknown; no absence claim. |
| Strong | Documentation describes importing macros through Apple Health-compatible nutrition apps, showing nutrition widgets and manually recording total calories. [Nutrition with Strong](https://help.strongapp.io/article/240-track-nutrition-with-strong). | D, dated 2021. This does not establish a current native food-database/portion editor. |
| MacroFactor Nutrition | Multi-add foods, then edit quantities before logging; existing entries have a configurable direct-edit shortcut. Food tiles offer density choices and speed/context preferences. [Multi-add](https://help.macrofactorapp.com/en/articles/40-multi-add-foods), [editing quantities](https://help.macrofactorapp.com/en/articles/98-edit-quantities-of-foods-you-ve-already-logged-and-view-nutritional-values-for-foods-on-your-timeline), [logger configuration](https://help.macrofactorapp.com/en/articles/219-how-to-configure-your-food-logger). | D. Fast logging and adjustable density are established competitive capabilities. |
| MacroFactor Workouts | The vendor describes separate Workouts and Nutrition apps sharing selected body metrics; nutrition/training coaching are not automatically coupled in the launch description. [Integration explanation](https://macrofactor.com/workouts/). | D. Do not infer that one product contains the other app's food editor. |
| Cronometer | Tap a diary entry to change amount/serving; repeat/copy and meal/recipe actions are available. Marking a day complete can freeze editing and can be reversed; reports distinguish complete/incomplete days. [Mobile entry editing](https://support.cronometer.com/hc/en-us/articles/360019003171-Mobile-Edit-Diary-Entries), [nutrition reports](https://support.cronometer.com/hc/en-us/articles/360019864891-Mobile-Nutrition-Report). | D. Completeness controls exist; their real-world usage/error rate was not measured. |
| ABC Trainerize | A coach enables in-app meal tracking; clients can skip photos, search/add foods, change servings and log meals. [In-app tracking](https://help.trainerize.com/hc/en-us/articles/4405482601364-Calories-or-Full-Macro-Tracking-In-App). | D. Partial-day interpretation and completion markers were not established. |

MacroFactor's current partial-logging help also documents a check-in module that asks users whether selected days should be treated as incomplete. Describing MacroFactor as simply unable to represent partial days would miss this newer workflow. [Partial logging](https://help.macrofactorapp.com/en/articles/241-what-is-partial-logging), [partial-logging module](https://help.macrofactorapp.com/en/articles/248-coaching-module-partial-logging). Body Dashboard should preserve the user's partial observations and expose completeness directly; automated expenditure recommendations remain outside its MVP.

### Task 4 Interpret smoothed weight and sparse history

| Product | Documented behavior and source | Evidence and uncertainty |
| --- | --- | --- |
| Hevy | Measurements can be exported; an exact weight-smoothing or missing-day algorithm was not verified. [Data export](https://help.hevyapp.com/hc/en-us/articles/43708290987415-Exporting-Your-Data-from-Hevy). | D for measurements; smoothing unknown. |
| Strong | Measurement/nutrition features are documented; an exact bodyweight smoothing/gap policy was not verified. [Nutrition and measurements context](https://help.strongapp.io/article/240-track-nutrition-with-strong). | D for context; smoothing unknown. |
| MacroFactor Nutrition | Distinguishes scale weight and trend weight. Its explanation describes linearly interpolating missing scale-weight days before trend analysis. [Weight Trend](https://help.macrofactorapp.com/en/articles/21-weight-trend). | D. No claim that its algorithm equals the PRD's proposed gap-adjusted EWMA, or that either method is more accurate. |
| MacroFactor Workouts | Weight Trend is distinct from raw measurements and links to the nutrition algorithm explanation; raw dates can be edited. [Workouts Weight Trend](https://help.macrofactorapp.com/en/articles/278-weight-trend-workouts). | D. It already supplies training-adjacent weight context. |
| Cronometer | Charts expose date ranges, units, inclusion/exclusion of empty/incomplete days and today. [Mobile charts](https://support.cronometer.com/hc/en-us/articles/360019864311-Mobile-Charts). | D. Those reporting filters do not establish an EWMA weight algorithm. |
| ABC Trainerize | Body-stat tracking is available through client dashboards on web/mobile. [Feature access](https://help.trainerize.com/hc/en-us/articles/28912597414292-ABC-Trainerize-Feature-Access-Web-Account-vs-Mobile-App). | D. Exact smoothing/sparse-history policies unknown. |

### Task 5 Move history and recover without a connection

| Product | Documented behavior and source | Evidence and uncertainty |
| --- | --- | --- |
| Hevy | Official Strong CSV import requires source-format constraints; routines and superset connections are not carried over. A previous import can be reverted. The iOS listing advertises offline workouts. [Strong import](https://help.hevyapp.com/hc/en-us/articles/35687878672663-Importing-Strong-Data-into-Hevy), [iOS listing](https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350). | D. Imported field fidelity and offline cold-start/termination recovery were not tested. Source help distinguishes source-file kg requirements from display-unit handling. |
| Strong | Exports workout CSV; its export help says the export cannot be imported back into Strong. Cloud troubleshooting provides force sync and warns against deleting the app when sync fails. [Export](https://help.strongapp.io/article/235-export-workout-data), [sync recovery](https://help.strongapp.io/article/241-force-sync). | D, older help. Current import options and offline durability were not independently tested. CSV export alone is not proof of a restorable backup. |
| MacroFactor Nutrition | Granular/quick spreadsheet exports are documented. Limited offline use permits history/cache access and edits; complete online search requires connectivity, and launch can require account/subscription access. [Export](https://help.macrofactorapp.com/en/articles/68-export-your-data), [offline behavior](https://help.macrofactorapp.com/en/articles/28-does-macrofactor-have-an-offline-mode), [connectivity](https://help.macrofactorapp.com/en/articles/116-troubleshoot-internet-connectivity). | D. No independent cold-start failure or recovery measurement. |
| MacroFactor Workouts | Vendor FAQ explicitly separates formatted program import from completed workout-history import from other apps, which it says is unavailable. It documents bulk exports and limited rather than true offline mode. [Import FAQ](https://macrofactor.com/workouts/), [export](https://help.macrofactorapp.com/en/articles/356-export-your-data-workouts), [connectivity](https://help.macrofactorapp.com/en/articles/366-troubleshoot-internet-connectivity-workouts). | D. Export-to-restore round trip not verified. This distinction directly supports Body Dashboard's history-import requirement. |
| Cronometer | Date-ranged CSV exports include diary/biometrics and nutrition summaries. [Account export](https://support.cronometer.com/hc/en-us/articles/360018760151-Account-Settings). | D. Current offline cold-launch/edit/restart behavior was not established. Old 2018–2019 staff forum replies are insufficient evidence for a 2026 binary. |
| ABC Trainerize | Internal program/workout reuse is documented, but external completed-history import/export fidelity and network-offline recovery were not established. The client type named Offline means trainer-managed without client-app access. [Feature access](https://help.trainerize.com/hc/en-us/articles/28912597414292-ABC-Trainerize-Feature-Access-Web-Account-vs-Mobile-App), [Offline clients](https://help.trainerize.com/hc/en-us/articles/45796250283668-What-Are-Offline-Clients-and-How-to-Work-Best-With-Them). | D for the documented features. I: the client-type label is not evidence of airplane-mode operation. |

### Task 6 Assign programs and review clients later

| Product | Documented behavior and source | Evidence and uncertainty |
| --- | --- | --- |
| Hevy | Public feature documentation includes assigned workouts and coach communication. [Hevy feature index](https://www.hevyapp.com/features/workout-log/). | D, limited scope. The separate coach product was not audited for tenant/access behavior. |
| Strong | Sharing workout/template links is documented. [Export and sharing](https://help.strongapp.io/article/235-export-workout-data). | D. A multi-client permissions/review portal was not verified; sharing is not proof of coaching authorization controls. |
| MacroFactor Nutrition | The reviewed coaching modules are the app's user-facing algorithmic check-ins. [Coaching modules](https://help.macrofactorapp.com/en/articles/247-introduction-to-check-ins-and-coaching-modules). | D. A human coach's multi-client assignment/review portal was not established. |
| MacroFactor Workouts | Program spreadsheet sharing/import and personal program building are documented. [Program import](https://help.macrofactorapp.com/en/articles/287-how-to-import-a-workout-or-program). | D. A shared program is not evidence of client monitoring or delegated coach permissions. |
| Cronometer | Pro client settings expose diaries, targets, reports and export controls. [Pro client settings](https://support.cronometer.com/hc/en-us/articles/360024707231-Pro-Client-Settings-Menu). | D for nutrition coaching. Workout-program assignment is not established here. |
| ABC Trainerize | Master-program assignment and client tracking are documented. Its access matrix places compliance summaries and mass actions on web, with several client-dashboard functions on mobile. [Training documentation](https://help.trainerize.com/hc/en-us/categories/115000017023-Training-Programs-Workouts-Exercises), [web/mobile access](https://help.trainerize.com/hc/en-us/articles/28912597414292-ABC-Trainerize-Feature-Access-Web-Account-vs-Mobile-App). | D. Supports a later coach workspace with different tasks; does not validate its internal security or prescribe Body Dashboard's database. |

## Ten friction findings and proposed reductions

These are **I — design hypotheses**, grounded in the evidence above. They are not measured competitor usability failures.

| Finding | User task and evidence | Proposed Body Dashboard reduction | Density and accessibility tradeoff |
| --- | --- | --- | --- |
| 1. Previous values need a meaningful baseline. | Task 2: Hevy documents routine-specific versus overall previous performance. | Show baseline date and context inline; offer history detail when needed. Keep variant/load-basis ambiguity visible. | A short date/context label uses space but reduces misleading comparisons. VoiceOver must announce the baseline. |
| 2. Repeated exercise blocks can be confused. | Task 2: Trainerize's dated issue note identifies repeated-instance autofill problems. | Distinguish separate exercise blocks and preserve source order on import; validate a session with the same exercise twice. | More context should appear at block level, not as another column on every set. |
| 3. Completion correction is part of the normal loop. | Task 1: MacroFactor Workouts explicitly documents unchecking an accidental entry. | Make completion reversible in place; preserve typed values and clearly label failed/pending commits. | Large completion targets and non-color state cues take space; keep RPE outside the main row. |
| 4. Timers can compete with the work being logged. | Task 1: Strong documents compact/full-screen choices; MacroFactor Workouts keeps timers in the header. | Default to a compact timer that does not cover cells or numeric keyboard; expansion is optional. | Compact controls still need named actions and 44-point targets. No full-screen interruption by default. |
| 5. “More analytics” is a weak reason to switch. | Task 2: Strong and MacroFactor already expose comparisons and estimated-strength statistics. | Show one actionable comparable delta plus its baseline; put the metric catalogue in detail. | Avoid a chart or extra metric column in every row. Enlarged text gets a stacked detail arrangement. |
| 6. Density settings can become a setup task. | Task 3: MacroFactor documents extensive tile/banner customization. | Start with a useful energy/P/C/F layout, recent foods and direct portion editing; offer one readable alternate density. | Preserve long food names and serving units; avoid forcing configuration before the first meal. |
| 7. Partial logging can be mistaken for actual low intake. | Task 3: MacroFactor's incomplete-day module and Cronometer's complete-day reports. | Preserve partial entries, expose a clear daily status and identify the included days in summaries. | No repeated completion modal; status text must remain understandable without color. |
| 8. Smoothed curves can conceal the observation schedule. | Task 4: MacroFactor documents interpolation; Cronometer exposes reporting filters. | Distinguish raw readings from Body Dashboard's chosen trend; name the latest observation and show gaps. | A short text summary supports users who cannot read the chart; avoid portraying the smoother as measured tissue change. |
| 9. An import/export label can hide migration loss. | Task 5: Hevy omits routines/superset links on Strong import; Strong's export help does not promise re-import. | Preview field coverage and conflicts, retain unsupported training fields, reconcile counts and test native backup restoration separately. | Preview needs a simple summary with expandable issues; do not require hand-editing CSV to begin. |
| 10. Coaching and personal training have different navigation needs. | Task 6: Trainerize separates web compliance/bulk work from mobile functions. | Keep personal logging free of client administration. Add a coach workspace in Phase 2 while preserving athlete ownership. | A future explicit context switch is preferable to permanently widening today's navigation. |

## Three differentiator hypotheses and validation

These describe a potentially valuable combination for this persona. None is claimed to be unique across the entire market.

### H1 Dependable offline continuation

**Hypothesis:** an already-onboarded user can cold-launch, resume, log and correct sets, and finish in airplane mode without an account check blocking the session, while understanding which edits are committed. MacroFactor documents launch/connectivity limitations; Hevy advertises offline workouts, so offline support alone is not sufficient differentiation.

**Validation:** use synthetic sessions on the same iPhone, including warm-up/superset rows, a forced termination after an acknowledged set, restart, accidental completion and injected local write failure. Compare relevant supported competitor workflows without assuming their results. Run a Seth-only pilot first; later recruit five experienced lifters, including at least two trainers, if market validation is needed.

**Proposed success measures:** every acknowledged test set survives relaunch; repeated taps/retry produce no duplicates; participants correctly distinguish pending versus saved in every recovery scenario. For normal logging, compare completion time and errors in counterbalanced repeated sessions against the best observed baseline. Target at least parity in task time with fewer recovery failures; no speed advantage is claimed today. Native latency targets remain unmeasured PRD goals for Agent C.

### H2 A first session that already knows the lifter

**Hypothesis:** importing an existing Body Dashboard history with transparent reconciliation creates more immediate value for Seth than additional program generation. MacroFactor's documented completed-history limitation and Hevy's format-specific migration constraints support testing this hypothesis.

**Validation:** import synthetic multi-year JSON containing repeated exercise blocks, custom names, kg/lbs display preferences, supersets, missing RPE, backdated sessions and conflicting source IDs. Ask Seth to resume a familiar routine and explain the previous-performance baseline. Later compare a private on-device export with his source records; do not upload health history to an agent.

**Proposed success measures:** all supported values/counts reconcile; every unsupported or ambiguous item is reported and retained; re-import produces zero duplicates; no re-entry of valid historical sets; Seth finds and identifies the relevant baseline without manually rebuilding the exercise history. Time-to-first-useful-session is recorded rather than assigned an invented competitor benchmark.

### H3 A compact daily workspace with honest context

**Hypothesis:** one focused app for lifting and common meal portions reduces navigation overhead for this user while making partial days, estimated strength and subjective feedback understandable. MacroFactor already connects separate nutrition/workout apps, so “training plus diet” alone is not a defensible novelty claim.

**Validation:** script a training-to-meal task with an existing meal at a changed portion, a later correction, a partial day, a missing weigh-in and optional joint feedback. Compare dense and expanded prototypes at default/enlarged text and with VoiceOver. Test with representative new foods as well as saved foods; otherwise an offline-only food workflow may look artificially fast.

**Proposed success measures:** all quantities and nutrients remain correct; participants identify a partial day and an estimate correctly; no optional RPE/joint prompt blocks ordinary set completion; all task controls remain reachable at enlarged text. Count app/screen transitions and measure elapsed time. A proposed 20% reduction in task time versus the user's current combined workflow is a pilot decision target, not a research result.

## PRD retain change and defer recommendations

Priority P0 means required for the first usable personal release; P1 follows the proven logging path. Changes remain recommendations until product review.

| Priority | Decision | PRD area | Recommendation and reason |
| --- | --- | --- | --- |
| P0 | Retain | Offline commands and recovery | Keep local commits and restart verification. Distinguish network state from local save state. |
| P0 | Retain | Workout-history import | Keep JSON fidelity, source identity, repeated-import handling and reconciliation as release gates. An export and a backup restore need separate acceptance tests. |
| P0 | Retain | Matrix and ghost sets | Prior values plus explicit completion are familiar patterns. Add reversible completion and failure clarity without suggesting this pattern is new. |
| P0 | Clarify | Comparable performance | Require baseline date, exercise context and load basis. E1RM delta is one optional comparison; also retain raw load/reps. |
| P0 | Clarify | Nutrition completeness | Promote visible daily status from an optional metadata idea into an interaction requirement. Keep completion optional; retain partial data and disclose report inclusion. Do not infer fasting from emptiness. |
| P0 | Validate before deferring | Online food lookup | Test whether saved foods/manual entry cover Seth's ordinary diet. If new-food entry dominates effort, include one provider in the first useful diet build. Do not build a broad replicated food database to solve this. |
| P0 | Retain | Accessibility and density | Keep 44-point targets, meaningful VoiceOver cell labels and enlarged-text layouts. Specify a usable default and one alternate layout before adding many customization settings. |
| P1 | Narrow | Analytics scope | Ship comparable-session delta and a clearly labeled weight trend; defer a large dashboard catalogue and automated readiness scores. EWMA is an implementation choice whose presentation must be tested. |
| P1 | Narrow | RPE and joint feedback | RPE can be per-set; joint observations can be captured at exercise/session level with optional set specificity. Keep both out of the mandatory completion path. Do not equate soreness, fatigue and pain. |
| Phase 2 | Retain foundation, defer UI | Coaching | Preserve ownership/access requirements. Defer invitations, bulk client tools and coach summaries until the personal workflow and migration are dependable. |
| Later | Defer | Program generation and integrations | Retain manual expert control for MVP; defer competing with adaptive programming, Watch, social feeds and AI logging. Reconsider only after a measured user need. |

The product decision is whether Body Dashboard is primarily an expert's manual workbench or an automated programming coach. The evidence supports testing the first direction for this persona. Trying to match every competitor would undermine the focused MVP.

## Risks and product responses

| Risk | Evidence or uncertainty | Product response |
| --- | --- | --- |
| History transfer loses semantics | Documented format restrictions and omitted superset/routine data in competing migration paths; Body Dashboard's own source lacks some nested IDs/timezone evidence. | Keep the native importer focused on existing Body Dashboard JSON first. Preview ambiguity, reconcile and retain original files. Do not promise universal app import. |
| Offline claims exceed reality | Hevy advertises offline operation, while MacroFactor describes limited offline behavior; current Cronometer/Trainerize cold-start guarantees remain unverified here. | Specify and test cold start, saved-food entry, termination, low storage and retry individually. “Offline-first” is not measured performance or protection from device loss. |
| Food access and licensing become the schedule | USDA's API guide documents public-domain/CC0 data, API-key responsibility and rate limits. Open Food Facts documents usage terms/ODbL and search limits, including a warning against search-as-you-type on its search endpoint. [USDA API guide](https://fdc.nal.usda.gov/api-guide/), [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/). | Review provider terms, attribution, caching/redistribution and coverage before selecting a provider. Keep saved-food/manual fallback. Do not assume a competitor's database can be copied or that one open source covers every brand/portion. |
| Dense analytics increase interpretation errors | Strong documents a different E1RM formula; MacroFactor explains an interpolation policy distinct from the proposed Body Dashboard trend. | Name estimates, units, baseline and observation date; retain raw values and expose algorithm changes. No superiority claim without validation. |
| Subjective tags become burdensome or misleading | Optional context is part of this PRD; this research does not validate a fatigue/injury predictor. | Use direct user vocabulary and optional entry. No automatic diagnosis or readiness label derived from a few tags. |
| Coaching broadens scope prematurely | Trainerize documents substantial client/compliance/program-management tasks separate from simple logging. | Keep Phase 2 explicit. Agent C owns access/security contracts; Agent B keeps those tools out of personal navigation. No database redesign is proposed here. |
| Old documentation or uneven rollout distorts comparisons | App metadata and indexed pages can disagree; several Strong help pages are old. | Recheck the installed target binaries before any public competitive claim. Record plan/settings/OS and separate documentation from observation. |

## Handoff to Agent B

### Five design requirements

1. **Make the training row complete and reversible.** Show prior context/date, editable actual values and distinct suggested/pending/committed states. Untick/undo preserves edits, and a failed save remains recoverable. Documented anchors: [MacroFactor logging and uncheck](https://help.macrofactorapp.com/en/articles/310-how-to-log-a-workout), [Hevy previous-context choice](https://www.hevyapp.com/features/track-workouts/).
2. **Keep logging controls available around the timer.** Define keyboard, safe-area and enlarged-text behavior before adding optional columns; make timer expansion voluntary. Anchors: [Strong compact/expanded timer](https://help.strongapp.io/article/231-rest-timer), [MacroFactor timer/log layout](https://help.macrofactorapp.com/en/articles/310-how-to-log-a-workout).
3. **Optimize the repeat-food and correction loop.** Energy/P/C/F, portion/unit and edit access need a useful default. Partial/complete status is understandable without deleting food or blocking each entry. Anchors: [MacroFactor portion editing](https://help.macrofactorapp.com/en/articles/98-edit-quantities-of-foods-you-ve-already-logged-and-view-nutritional-values-for-foods-on-your-timeline), [Cronometer entry/completeness actions](https://support.cronometer.com/hc/en-us/articles/360019003171-Mobile-Edit-Diary-Entries).
4. **Design the import experience before a rich progress dashboard.** Include source format, original IDs, unit/timezone questions, duplicates/conflicts and reconciliation. Distinguish completed-history import from program import. Anchors: [Hevy migration limits](https://help.hevyapp.com/hc/en-us/articles/35687878672663-Importing-Strong-Data-into-Hevy), [MacroFactor import distinction](https://macrofactor.com/workouts/), [Body Dashboard audit](../SOURCE_AUDIT.md).
5. **Present interpretation context through concise labels and detail.** Preserve raw values; identify an E1RM baseline and a trend's latest observation. Optional joint feedback should not become a required row. Keep coach administration in Phase 2. Anchors: [Strong Focus Metric](https://help.strongapp.io/article/226-focus-metric), [MacroFactor weight explanation](https://help.macrofactorapp.com/en/articles/21-weight-trend), [Trainerize web/mobile separation](https://help.trainerize.com/hc/en-us/articles/28912597414292-ABC-Trainerize-Feature-Access-Web-Account-vs-Mobile-App).

### Decisions still requiring product judgment

- Confirm manual expert logging as the first-release priority; automatic load prescriptions stay deferred under this recommendation.
- Establish how many ordinary meals can be logged from saved foods before committing to deferring online lookup. Use a synthetic representative menu rather than uploading diet history.
- Choose default row density and the expanded layout with Seth on the target iPhone. Minimum supported iOS/device remains Agent C's compatibility decision.
- Choose joint-feedback vocabulary and preferred entry level; separate fatigue from discomfort without implying diagnosis.
- Decide the daily completeness interaction: proposed default is unobtrusive status, optional explicit completion, and a clear status update after editing a completed day. Avoid unexpectedly locking corrections.

### Validation to carry forward

Prototype an unchanged set, changed load/reps, a repeated exercise block, accidental completion, a pending-save failure, a superset timer, changed meal portion, incomplete day and an import with conflicts. Record task times, navigation/interaction counts, errors and comprehension. All success thresholds in this report are proposed targets. Agent B should deliver wireframes/interaction contracts; it should not redesign storage or begin implementation.

## Delivery and limits

Output: `docs/mobile-rebuild/outputs/A_COMPETITIVE_ANALYSIS.md`.

Strongest recommendation: **prove the migrated-history → resume → log → correct → recover loop before expanding analytics or coaching.** Preserve a simple food/portion workflow alongside it. Existing charts and smoothing are useful capabilities, but they do not establish a reason to switch by themselves.

This is primary-source desk research. There were no installed-app trials, observed tap counts, measured competitor latencies, physical-device accessibility sessions or verified offline recovery experiments. Current binary behavior, plan-dependent availability and all unverified cells remain follow-up work. No source app, production data, PRD requirements or database design was changed, and Agent B has not been run.
