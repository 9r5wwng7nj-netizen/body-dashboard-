# Body Dashboard iPhone UX specification

> Platform update, November 7, 2026: preserve these interaction/wireframe findings, but use [WEB_FIRST_PLAN.md](../WEB_FIRST_PLAN.md) for HTML accessibility, keyboard/layout, navigation and persistence translation. React Native implementation instructions are deferred.

Version 0.1 · November 7, 2026 · Owner: UX UI Architect · Handoff: Agent C.

Body Dashboard opens the next useful logging action quickly and keeps source observations distinct from suggestions and estimates. This specification defines the native iPhone experience, including interaction contracts and annotated wireframes. It does not implement the application or change the existing web app.

Inputs: [rebuild direction](../README.md), [source audit](../SOURCE_AUDIT.md), [master PRD](../MASTER_PRD.md) and [Agent A analysis](A_COMPETITIVE_ANALYSIS.md). All examples are synthetic. Native persistence, supported SDKs and physical database design belong to Agent C.

## 1 Product decisions and assumptions

| Decision | Specification | Relationship to PRD |
| --- | --- | --- |
| Primary navigation | Retain Train, Diet, Progress and History. Keep Settings and Import in the menu. | Retained. Four distinct jobs; a separate dashboard adds an avoidable stop. |
| Active-session priority | Cold launch opens the active workout after local restoration. A persistent Resume control remains available in other tabs. | Clarification. Opening a notification or explicit deep link honors its destination and still exposes Resume. |
| Expert control | Manual logging and comparisons are the initial default. No automatic load prescription. | Proposed default from Agent A; product-owner review still applies. |
| Density | Compact matrix at suitable width/text size; automatic stacked rows when text or width requires it. A comfortable layout is also selectable. | Retained accessibility requirement, with explicit geometry below. |
| Draft recovery | Typed drafts have a separate autosave state and can be recovered without being completed sets. | Clarification requiring an Agent C durability contract. Unsaved keystrokes cannot be promised to survive termination. |
| Daily status | Show Unlogged, In progress or Complete. Explicit completion is optional and never freezes corrections. Editing a completed day reopens it. | Proposed clarification from Agent A; no mandatory daily-completion flow or dietary coaching added. |
| RPE and joint feedback | Optional detail, never a required completion step. Joint feedback defaults to exercise level, with optional set specificity. | Proposed default that narrows interruption, preserving the PRD's optional data. |
| Timers | One rest timer per active athlete session. Default 90 seconds for a new working exercise; warm-up default off. Preserve imported/user rest preferences. | Uses the existing app's preference as an initial product default, not exercise advice. |
| Food discovery | Saved foods, meals and manual entry always work. A provider-backed search is a separately enabled source. | Retains offline core. Whether online lookup ships in the first useful build remains a product decision. |
| Coaching | No client list, coach switcher or invitations in personal navigation. | Phase 2 retained. Scope identity still accompanies every domain request. |

The recommendations above do not silently amend the PRD. Agent C should identify material conflicts before finalizing contracts. No calendar commitment or achieved performance claim is implied.

## 2 Navigation and screen inventory

The root remembers the last tab only when there is no active session. Initial onboarding offers **Import workout history**, **Start with a routine** and **Start empty**, without compulsory account creation. Import is skippable during onboarding and remains reachable in Settings; it remains an MVP release capability.

Cold start first reads local session state. During this brief hydration, show “Opening your local session…” rather than an empty workout list. A database-read failure shows retry and recovery options; it must not be interpreted as an empty database or create another session.

| Screen | Primary action | Minimum information | Secondary actions |
| --- | --- | --- | --- |
| Train without active session | Start a selected routine | Routine name, exercise count, last performed date, next suggested routine if explicitly configured | Repeat history, Empty workout, routine edit |
| Train active | Complete or edit the current set | Session name; exercise/variant; load basis/unit; previous dated values; actual/draft values; completion state | Add exercise/set, type, notes, optional feedback, Finish |
| Finish review | Finish and save | Saved set count, draft/uncompleted count and any failed writes | Return to logging; discard requires separate confirmation |
| Finish summary | Done | Confirmed completion/save status, working/warm-up counts, duration, completed this week, one comparable performance highlight | Review/edit session, repeat later |
| Diet day | Log food | Date, day status, energy/P/C/F known totals and targets, meal entries with portions | Saved meals, quick macros, weigh-in, day actions |
| Food picker | Choose saved/recent/usual item | Search and source, food/meal name, last portion, energy/macros with unknowns | Multi-add, New food, optional online search |
| Portion editor | Log portion or Save changes | Name, quantity, unit/basis and calculated preview; target meal/date | Portion shortcuts; edit saved definition separately |
| Progress | Inspect strength or bodyweight | Chosen exercise/metric or raw weight/trend, units, baseline/latest date, coverage | Measurement entry, observation list, metric detail |
| History | Open or repeat a session | Recorded local date, name, saved status, useful count; paginated list | Date/filter, import, session detail |
| History detail | Repeat session or Edit record | Original recorded values, dates/timezone provenance, notes, load basis, source | Per-set changes, source detail, reversible deletion |
| Import preview | Review and import selected training | Recognized format, scope, source counts, units/timezone assumptions, issues/conflicts | Map alias, keep current/use source, cancel |
| Import result | Inspect imported history | Committed additions/updates/skips/quarantine and reconciliation | Review retained issues, view batch details |
| Settings | Adjust preference or export | Units, theme, row layout, timer preferences, backup/import | Device-only account status; no coaching setup wizard |

Tab changes retain scroll and drafts by stable IDs. A session capsule in Diet/Progress/History says “Resume Push A · 3 sets saved”; when a timer is running, combine its remaining time in that same capsule rather than stacking duplicate bars. Tapping it opens Train at the last edited set. It occupies layout space above the tab bar and never covers content. With the keyboard open, move compact resume/timer access to the top navigation area and hide the bottom tab bar until editing ends. Returning from a modal restores focus to its opener or the nearest surviving row.

## 3 Layout assumptions and annotated wireframes

Reference canvas: **390 × 844 logical points**, portrait. Side margins are 16pt, giving **358pt** usable width. System safe areas and keyboard dimensions are runtime inputs; the drawings are content diagrams rather than pixel-exact screenshots. A normal header has a 52pt minimum height, the tab control area a 49pt minimum plus bottom inset, and the collapsed timer/resume bar a 52pt minimum. All heights may grow with text.

The default set row uses columns **44 / 88 / 80 / 64 / 50pt**, with four 8pt gaps: 326 + 32 = 358pt. Column order is Type/set, Previous, Load, Reps, Complete. The row has a 52pt minimum height. Previous is readable context, with baseline detail available from the exercise header; it is not a tiny additional input. Unit belongs in the column/header and accessible field name.

Compact rows require at least 358pt of inner width, default-compatible text metrics and no measured label/value clipping. Switch to stacked rows when inner width is smaller, user chooses Comfortable, font scale exceeds the initial 1.15 threshold, or measured content cannot fit. That threshold is a conservative design starting point for native validation, not an assumption that Dynamic Type is uniformly scaled. At 375pt, the 343pt content uses the stacked layout. At accessibility sizes, every field and label wraps/grows; no horizontal scrolling is required for core logging.

### W1 Training matrix

```text
Safe area
< Minimize        Push A                     Finish
3 sets saved · Device only

Bench press · Barbell                         More
Total load including bar · kg
Previous: Nov 2 · Push A · same variant
Type   Previous       kg        Reps       Done
 1     80 × 5        [82.5]      [5]         [✓]
       Saved on device
 2     80 × 5        (80)        (5)         [ ]
       Suggested from Nov 2
 3     80 × 5        [82.5]      [6]         [ ]
       Draft saved · not completed

Adjust set 3     [−2.5]   [+2.5]    [Details]
[Add set]                         [Add exercise]

Rest  1:12                 [+15 sec]  [Skip]
Train        Diet        Progress        History
Bottom safe area
```

Parentheses indicate suggested placeholders, not recorded current values. The checkmark is only shown after commit. Previous date/context is shown once per block unless rows use different baselines; exceptions receive their own date label. Tapping the exercise header opens Baseline and exercise details; the original workout is one explicit detail action away. Repeated instances are labeled “Bench press · block 2”, retain separate row identities and never borrow values from block 1 merely because names match.

At larger text, replace the matrix with:

```text
Set 2 · Working                             More
Suggested: 80kg × 5 · Nov 2
Load kg                    Repetitions
[80 suggested]             [5 suggested]
[Complete set 2 using 80kg × 5]
[Optional details]
```

The two fields may themselves stack at the largest sizes. Compact and comfortable layouts share values, state and event IDs. Changing layout must not commit, clear or duplicate data.

### W2 Active timer and numeric editing

```text
< Minimize      Push A       Rest 1:12 [Expand]
Bench press · Set 3
... scrollable rows ...
Focused row remains fully visible
Editing load: 82.5 kg
[−2.5]       [+2.5]       [Next]       [Done]
System decimal keyboard
Keyboard/system bottom inset
```

The keyboard toolbar is in the keyboard-avoidance layout; the timer has moved to the header. There is no bottom overlay crossing the focused field. At large text, toolbar actions wrap to two rows or show stepping in the row detail while retaining visible Next/Done. A “Done” action dismisses the keyboard after requesting draft persistence; it does not complete a set. Timer expansion is an explicitly opened sheet with remaining time, +15 seconds, −15 seconds, preset duration and Skip; it does not appear automatically.

### W3 Finish review and summary

```text
Finish Push A
12 working + 2 warm-up sets saved
2 suggested rows were not completed
1 unfinished draft: 82.5kg × 6       [Review]
Only completed sets enter this session's results.
[Keep logging]                 [Finish and save]
```

If no edits/failed writes remain, Finish can commit directly and open the summary without this extra review. Pure untouched suggestions need no confirmation; the summary identifies excluded rows. A typed unfinished draft receives this review once and can remain retained as an uncompleted draft after finish. It never becomes a performed set implicitly. Failed writes block finish, offering Retry/Return to set instead of a success screen.

```text
Push A complete                  Saved on device
44 min · 12 working + 2 warm-up sets
3 completed this week · Mon Nov 2–Sun Nov 8

Bench press
Best eligible est. 1RM: 96.3kg
+2.9kg (+3.1%) vs Nov 2, 93.3kg
82.5kg × 5 · Epley · total barbell load
[View session]                             [Done]
```

The example baseline is 80kg × 5 (93.333…kg), compared with 82.5kg × 5 (96.25kg). Rounded display values are not the calculation inputs. A current unfinished session is never counted as completed; a successful finish changes the week count once. Weeks use the recorded local dates through today, with future records excluded. No eligible/comparable baseline yields “No comparable prior session” with the raw best set still visible.

Use the same completed-week query in Train, any summary card and the finish screen: session status Completed, recorded local day within Monday–Sunday of the current reporting week, and no later than today. Show the reporting timezone in date detail; retain original recording-day provenance when the device travels. Backdating or editing a completed session moves its contribution to the appropriate week after commit. A future-dated completed record is visible in History with a Future date label but is excluded from current activity and latest-through-today estimates. An empty finished session should be flagged for review and excluded from workout activity counts; Agent C must define the shared eligibility predicate, including legacy ambiguous records, rather than allowing screens to invent different counts. This last eligibility clarification is a proposed product policy for review.

### W4 Diet day

```text
< Previous      Sat Nov 7                 More
In progress · totals from logged entries
950 kcal left                  1,450 logged
Protein       Carbs          Fat
105 / 180g    150 / 240g      52 / 75g
[Log food]           [Saved meal]   [Quick macros]

Breakfast                               [Add]
Oat bowl · 1.5 servings                    600 kcal
P30 · C82.5 · F18                           [Edit]
Lunch                                   [Add]
Example chicken rice · 1 portion          650 kcal
Snack                                   [Add]
Example shake · 1 serving                 200 kcal

Day status: In progress             [Mark complete]
Weight today: Not logged                [Log weight]
Train        Diet        Progress        History
```

These are synthetic source nutrient values; calories need not be overwritten to equal a macro-derived estimate. Meal rows expose quantity/unit. Each row's entire editing target is at least 44pt high. At large text, the macro summary becomes labeled stacked rows and action buttons wrap. Calories-left/eaten preference is preserved; no target or logging status is inferred from how close totals are to a goal.

### W5 Saved food or meal portion

```text
Cancel            Oat bowl
Saved meal · recipe version 1
Quantity                       Unit
[1.5]                          [serving v]
[½]             [1]              [1½]        [2]
600 kcal · P30g · C82.5g · F18g
Per serving: 400 kcal · P20 · C55 · F12
Meal: Breakfast           Date: Sat Nov 7
[Log portion]
```

Selecting an item opens its last-used portion in this editor. A clearly named “Add usual portion” secondary action can log directly from a recent/usual row when quantity/unit is fully defined; it must announce the accepted portion and provide undo. Unit choices require valid serving/mass conversion evidence. An unavailable grams-to-cups conversion is not guessed; offer servings or manual definition. Editing an existing entry changes the primary action to Save changes and states “This entry only”. Editing the saved definition is a separate, explicitly named action.

### W6 Progress

```text
Progress                          [Log weight]
[Strength]                         [Bodyweight]
Bench press · Barbell · total load
Latest eligible est. 1RM 96.3kg · Nov 7
vs Nov 2: +2.9kg (+3.1%)
Chart: real dates, eligible observations only
[View sets and baseline]

Bodyweight alternative
Latest measurement: 80kg · Nov 7
EWMA: 81kg · through Nov 7
Raw dots + labeled trend + observation gaps
2 readings in this displayed interval
[View measurements]                    [Trend method]
```

The bodyweight numbers are a synthetic illustration: 82kg followed seven calendar days later by 80kg gives 81kg under the proposed half-life policy. Do not imply the displayed raw measurement itself is 81kg. Empty history offers entry; one reading shows a single observation and “More readings will show change”. Missing days add no measurements. An interval without observations is not drawn as daily measured values. Trend method detail identifies the seven-day half-life proposal and the difference from the legacy seven-day average.

### W7 History detail

```text
< History          Push A                     More
Nov 7 · 8:00–8:44 · recorded local day
12 working + 2 warm-up sets · Saved
Native session                  [Source details]
Bench press · Barbell · total load kg
1   82.5 × 5       RPE not recorded
2   80 × 5         RPE 8
... notes and remaining exercises ...
[Repeat as new session]                [Edit record]
```

Read mode is the default. Edit mode keeps the original saved record while showing a separate pending revision. Imported detail preserves original labels/types and clearly names any assumed timezone or unknown load basis. Repeat creates a fresh session snapshot with suggestions, not another completed workout; prior RPE and joint observations stay in the original. Duration-only and distance records remain viewable even when no E1RM applies.

### W8 Import preview and reconciliation

```text
< Settings       Import workout history
Example fitness JSON · Body Dashboard
120 workouts · Nov 2020–Nov 2026
Source loads: kg       Display preference: lbs
Grouping timezone: America/New_York      [Review]
Original timezone missing in source

100 new     16 exact duplicates
2 changed source records                [Review]
2 records need repair                   [Review]
Training only: workouts + supplied routine/metadata
Other sections/photos stay in the original file
[Cancel]                  [Review import decisions]
```

The source unit for recognized Body Dashboard JSON is its documented kg contract; display preference is not a source-unit override. Unknown exercise load basis can be retained and later reviewed without discarding a valid workout. Malformed data is quarantined with reasons. The user must choose Keep current or Use source revision for changed records; no generic Merge button promises an undefined merge.

```text
Ready to import
Add 100 · Update 1 · Skip 17 · Retain 2 for repair
100 new + 16 duplicate + 2 changed + 2 issue = 120
[Back to review]                         [Import]

Importing… 72 of 101 selected workouts staged
Existing history remains usable
Finalizing… commit in progress

Import complete                     Saved on device
100 added · 1 updated · 17 skipped · 2 retained issues
2,400 sets added · 24 source sets in updated workout
[View history]                     [Review retained issues]
```

In this example, one changed record is explicitly kept current and one uses the source revision: 16 + 1 skipped = 17. Reconciliation distinguishes added sets, sets in updates and net changes; it must not call updated sets newly added. The numbers are synthetic design examples, not a completed migration result.

## 4 Set state machine and save semantics

State is a projection of **the last durable observation plus the current draft/operation**, rather than one boolean. Completion and persistence must not be collapsed into a single checkbox flag. A suggestion is a snapshot of prior/planned values with provenance; accepting it is an explicit current user action.

| UI state | Visible state and semantics | Events and next state | Counts and timer |
| --- | --- | --- | --- |
| Planned suggestion | Placeholder values, “Suggested · Nov 2”; unchecked | Type/copy accepted fields → edited draft. Complete with valid values → completion pending. Delete → deletion pending. | No completed count, volume or E1RM; no timer. |
| Edited draft | User text in normal contrast; separate Editing/Draft saved status | Edit → newer draft revision. Valid Complete → completion pending. Done/blur requests draft save only. | No completed count. Draft persistence is not completion. |
| Completion pending | Spinner + “Saving set…”; checkbox remains unchecked/busy | Confirmed receipt → committed. Definite failure → failed. Unknown result after restart → recovery checking. | No new completed count/timer before confirmation. |
| Committed | Checkmark + “Saved on device”; actual values | Uncheck → undo pending. Edit actual value → amended draft with prior saved observation retained. Delete → deletion pending. | Included once. Commit activates its timer intent where applicable. |
| Failed | “Not saved · input retained”; Retry and Edit | Retry reuses operation identity if payload unchanged. Editing creates a new draft/revision and supersedes the old attempt. | New observations excluded. For a failed amendment, the prior durable values still count, and are shown as the saved version. |
| Undone | Unchecked + “Completion removed · draft retained” after receipt | Complete → new completion intent for the same set identity. Edit → draft. | Remove from metrics only after undo commits. Cancel only a timer still owned by that completion. |
| Deleted | Row placeholder “Set removed” with Undo; original snapshot retained for recovery policy | Undo → restore same identity. Failed removal → original row + error. | Remove from projections only after delete receipt. Restoration does not create a duplicate. |
| Recovery checking | “Checking last save…” on affected row after restart | Read operation/result and saved record → committed, draft or failed/retry | Do not resend blindly or invent a failed/completed result. |

Pending undo/delete/amend operations preserve the prior durable observation in totals until acknowledgment, with “Change not saved yet”. Pending buttons prevent another identical mutation while keeping other rows usable. The UI cannot resolve an uncertain outcome by inserting a fresh set ID.

Undoing deletion restores the prior saved/draft state and identity after its receipt. Restoring a previously committed observation restores its metric contribution without starting a fresh rest timer; it is restoration, not another performed set.

**Counts invariant:** only committed observed sets enter completed-set metrics. Session completion is a separate committed status. Working-set and warm-up counts are named separately. Unchecked drafts, planned rows, deleted records and future sessions do not become completed-through-today activity by their presence.

**Draft persistence:** update local editor state immediately. Request a draft checkpoint after approximately 250ms idle, on blur, before navigation and before completion; exact scheduling/performance belongs to Agent C. Store incomplete editor text separately from validated observed values. “Draft saved” requires a receipt for the latest draft revision. If a draft save fails, retain current text in the open session and show “Draft not saved—retry before closing”. A process kill before acknowledgment can lose the latest keystrokes; never label them saved. Prefer last durable draft restoration over re-creating blank planned rows.

**Committed edits:** show the edited value plus “Changes not saved” and a reachable Save changes action in row detail/keyboard toolbar. A valid Save changes command amends the observation; it does not add a set or restart the rest timer. Invalid edits remain recoverable beside the last saved values. Navigating away requests persistence and exposes a persistent unsaved-edit indicator if it fails. Discard changes is explicit and returns to the last durable values.

**Feedback:** use one optional completion haptic after commit, a checkmark and text. No celebratory interruption per set. Announce a single completion/failure event through the iOS accessibility mechanism, not every keystroke or timer tick. Network status says Device only/Sync unavailable separately from local save status. Phase 1 has no misleading “Synced” badge.

## 5 Exact row interactions

| Action | Required behavior |
| --- | --- |
| Tap load or reps | Focus that native field and select its existing editable value for replacement. A suggested placeholder is not inserted into observations just by focus. Label the field with exercise, set number and unit. |
| Type | Keep the localized raw string and caret stable. Do not format group separators, round or convert the string during each keystroke. Normalize validated input at the command boundary. |
| Decimal keypad | Load/portion fields request a decimal keyboard; reps request integer entry. Provide explicit Next and Done controls because keyboard return affordances vary. Accept locale-appropriate decimal input; ambiguous pasted separators produce a clear correction request. |
| Next | Move load → reps → next uncompleted row's first required field, in superset order when applicable. It never completes a row. Keep focus visible above the keyboard toolbar. |
| Done | Request draft/amendment save according to row mode and dismiss the keyboard; show pending/failure correctly. It never means Finish workout. |
| One-handed adjustment | Focused-row step controls change the current field by a user/exercise preference; initial load steps 2.5kg or 5lb, reps 1. Step sizes are editing preferences, not load recommendations. No auto-repeat by default; press-and-hold is optional and stops on release/background. |
| Tap Complete on valid suggestion | Accept visible suggested required values plus any user edits into one current observation command. Keep current optional RPE/feedback only if entered; never carry these from history. No extra modal. |
| Tap Complete with missing/invalid data | Focus the first invalid required field, show a concise inline message, retain all other text. Do not insert zero to satisfy validation. |
| Double tap Complete | First intent locks the row mutation; additional identical presses are ignored until resolved. Retries are idempotent. Do not debounce into multiple operation IDs. |
| Previous values | Read-only in the matrix. Baseline detail is reachable through the exercise header. An explicit Use previous values action copies load/reps into a draft and never copies prior RPE/joint feedback or completes the row. |
| Type/set control | A 44pt control opens Working, Warm-up, Drop or Failure. Tag names are announced. Changing a committed set type is an amendment that may change metric eligibility only after commit. |
| Undo completion | Uncheck in place; preserve user values as a draft. Show pending until the removal commits. Expose the same action through VoiceOver, not only a swipe. |
| Delete row | Available in More; remove after receipt, leaving an Undo placeholder. Transient undo is also recoverable through session actions while the session is active. Bulk exercise/session discard identifies the affected saved data and asks for confirmation. |
| Add row | Create a new planned/draft identity; it is not a performed set. Use prior context when available, labeled as a suggestion. |
| Reorder/superset | More includes accessible Move up/down and Group/Ungroup controls. Dragging is an optional shortcut. Persist identity/order without deriving identity from position after creation. |

The keyboard implementation is an implementation decision. React Native documents numeric/decimal input modes and native focus behavior; its referenced `InputAccessoryView` documentation is marked deprecated. The contract requires a supported keyboard toolbar, not that particular component. Agent C must confirm the supported approach for the chosen Expo/React Native versions. [TextInput](https://reactnative.dev/docs/textinput), [InputAccessoryView status](https://reactnative.dev/docs/inputaccessoryview).

Stepping a visible valid suggestion explicitly materializes that field into an edited draft and applies the step. With no value or suggestion, focus entry instead of inventing zero. A step cannot cross the field's allowed range silently; explain the limit while preserving the current draft.

### Supersets and set types

Show group label A/B and exercise position, plus a small “Next: A2” cue. Completion leaves the viewport and accessibility focus stable; Next is the explicit way to advance entry. Avoid automatically jumping away from a just-completed row. Working-set rest begins at the last exercise in a round by default; intermediate rounds show “Rest after A2”. Users can start manual rest at any point. Standalone warm-ups default to no rest, preserving an existing preference when available. Drop-set continuations have no automatic rest until the sequence ends; allow an explicit override.

Failure means the rep count records successful reps, with an additional failure context tag. A zero-successful-rep failed attempt can be recorded as a Failure set, but is excluded from E1RM; retain the zero rather than presenting it as missing. Do not add an attempted rep to the performed count. Warm-ups remain in the log but are excluded from working-set estimates. Partial/myo sets imported from another supported source retain their original type/annotations; the MVP need not invent a native coaching model for them.

### Non-strength tracking types

| Type | Required current-entry values | Load display and analysis |
| --- | --- | --- |
| External load/reps | Known load and positive reps; Failure exception above | State total barbell, per-hand or total-pair basis. Unknown legacy basis remains flagged. |
| Bodyweight reps | Reps | Show Bodyweight instead of requiring a fake zero load. E1RM unavailable under the basic external-load rule. |
| Weighted bodyweight | Added load and reps | Label “Added kg/lb”; do not silently substitute body mass. |
| Assisted bodyweight | Assistance magnitude and reps | Label “Assistance kg/lb”; keep positive magnitude with clear meaning, not an unlabeled negative load. |
| Duration | Positive duration | Accept `m:ss` or numeric seconds with explicit preview. A completed duration does not imply reps. |
| Load and duration | Load and positive duration | Preserve units; no rep-based E1RM. |
| Distance and duration | Distance and positive duration | Show distance unit and elapsed time; imported km converts once under Agent C's contract. No E1RM. |

Historic incomplete/ambiguous records remain visible with their source values and issues. Native entry validation must not retroactively delete them or manufacture required measurements.

## 6 Timer lifecycle and interruptions

The timer uses an absolute rest deadline and source completion identity. Rendering ticks are disposable. A successful completion returns a committed observation and timer intent; only then does the running timer appear and optional notification scheduling occur. Deadline origin is the user's performed/completion-intent timestamp, so a delayed commit/retry does not quietly grant a fresh full rest period. If already expired on recovery, show Rest ended; do not deliver a stale burst of alerts.

| Event | UX outcome |
| --- | --- |
| Collapse | Keep remaining time, +15 and Skip in a layout-reserved bar; header variant while keyboard is open. |
| Expand | Explicit sheet; keyboard closes safely and draft state remains. Cancel returns focus to timer control. |
| Add/subtract/preset | Persist one timer adjustment; update the visible deadline after acknowledgment. A failed adjustment retains the previous running deadline and exposes Retry. |
| Skip | Commit timer cancellation, then remove the active countdown. Keep a failure actionable instead of pretending it stopped. |
| Another qualifying completion | Replace the previous rest intent with the new completion's intent; no stacked concurrent timers. |
| Undo a set | Cancel rest only if it is still owned by that completion. A newer set's timer continues. |
| Edit old/completed set | Does not start or reset rest. Imported observations never start timers. |
| Background/inactive | Checkpoint drafts and timer intent where possible. Return computes remaining time from deadline, rather than replaying missed ticks. |
| Clock change | Use a resilient elapsed-time policy supplied by Agent C; flag inconsistent clock data rather than guessing rest duration. |
| Notifications denied | Keep in-app countdown and optional foreground haptic/sound. No blocking permission prompt; the user opts into background rest alerts from timer settings. |
| Finish/discard | Cancel a timer tied to that session after the lifecycle command commits. Notification failure never rolls back a saved workout. |

Native suspension, relaunch and notification tests remain required. App-state events can trigger restoration checks but are not a promise that code will run before termination. [React Native AppState](https://reactnative.dev/docs/appstate).

## 7 Diet interactions and daily completeness

**Picker:** use Recent, Usual and Saved meals as small source segments, with search within saved data. Show the last-used quantity/unit and known nutrient summary. Online results, if enabled, are a separate labeled source and cannot block local entry. Offline message: “Saved foods and manual entry are available. Online search needs a connection.” Selecting an unavailable remote result does not insert an empty food.

**Usual portions:** Add usual portion logs a fully specified food/meal snapshot through one command. Portion chips represent absolute multipliers of the visible basis, not repeated multiplication of the current amount. Chips ½, 1, 1½ and 2 update the preview; Log portion commits it. Multi-add creates a review list with independently editable quantities, then commits once. No required photo, description or nutrient questionnaire.

**Units:** retain serving, grams and other known units. Changing unit preserves physical quantity only when the conversion is known; otherwise ask for the missing measurement without guessing a food density. The user can choose a different valid unit. Use a decimal keypad with locale handling and never silently truncate fractional portions. User-created food definitions state per-100g versus per-serving explicitly.

**Quick macros:** energy, protein, carbs and fat are independently optional numeric observations. At least one known value is required; known zero is allowed. Do not infer an absent value as zero. A separately labeled macro-derived energy preview can be added later, but never overwrites source calories or fills an unknown silently in this MVP. A quick entry may have unknown energy and still preserve known protein.

**Totals with unknowns:** show “52g known + ?” for a nutrient with missing contributions, name the number of affected entries in detail, and show remaining for that nutrient as Unknown. If energy is incomplete, show “1,450 kcal known + ?”; calories remaining cannot be presented as a definite number. A Complete day can still contain unknown nutrients; show “Complete log · some nutrient values unknown”. Completion describes the user's coverage declaration, not verified nutritional accuracy.

**Snapshots:** correcting a consumed entry updates that entry's snapshot after commit. Editing a saved food, serving definition or recipe changes future entries only. Provide Edit saved definition separately and explain this scope. Updating old entries does not rescale all copies. A saved meal logs constituent nutrient snapshots with a shared meal-instance identity so a later definition change cannot alter yesterday.

**Daily status:**

| Status | Meaning and transitions |
| --- | --- |
| Unlogged | No consumed entries or explicit coverage declaration. Does not mean fasting or zero intake. |
| In progress | One or more entries; coverage not explicitly declared complete. Editing a completed day returns here atomically with the edit. |
| Complete | User explicitly declares the day's logging complete. Corrections remain available. An empty-day completion requires a one-time choice distinguishing intentional zero-entry coverage from missing logging; no automatic fasting label. |

Mark complete is an optional day-level action, not a pop-up after every meal. When an edit reopens a completed day, show “Day reopened after your edit” with Mark complete available. If that edit fails, the old committed day status remains. No inferred low-calorie/punitive warning. Daily summaries label whether they include incomplete days; default multi-day intake averages use explicitly complete days and show the included-day count, with an option to inspect other days. An absence of complete days shows a helpful empty state rather than a zero average. This is a proposed reporting policy for review, not automated calorie coaching.

**Error and undo:** food addition/update/deletion uses the same pending/receipt/error pattern as sets. Undo is reachable from a stable entry action as well as a transient message. Restoring a deleted entry restores its snapshot/identity, not today's saved-food definition. A late receipt for an earlier portion cannot overwrite a newer visible edit.

## 8 Progress and subjective feedback

Default Strength view shows the selected exercise, variant/equipment/load convention, latest eligible estimate, baseline date and actual set behind each estimate. Baseline detail is available beside the comparison. Excluded warm-ups, unknown load basis and lack of eligible history are explained concisely. Percentage is omitted if no positive baseline exists. A change of algorithm is visible in method detail; imported cached PR labels are not reinterpreted as newly measured achievements.

Bodyweight shows raw points and a distinct EWMA line, with real calendar spacing, units and latest observation date. The proposed seven-day half-life belongs in method detail; the primary summary names “EWMA trend”. Show gaps without daily synthetic dots. For visual continuity across a long gap, use disconnected segments rather than implying a dense measurement schedule. Recalculation uses retained observations; changing the display method never rewrites them.

If the latest observation predates today, state “Last measured Nov 2 · 5 days ago”. After seven days without an observation, add “No recent measurement; trend ends Nov 2”. Seven days is a proposed freshness-display threshold, not a physiological validity cutoff. Future-dated readings remain in history but are excluded from today's summary. Same-day multiple readings remain listed; identify the primary representative and let the user change it explicitly.

Every chart has an accessible text summary and View observations action. Touch inspection uses a generous horizontal scrub region, a selected date/value summary and accessible Previous/Next observation actions; it cannot require hitting a tiny point. Dates with no observation are identified as gaps. Chart axes and raw measurements use the chosen unit, with estimates labeled as such.

**How it felt:** open optional detail from an exercise or session. Separate RPE from joint observations. RPE is nullable, 1–10 in 0.5 steps for new entries; clearing returns to Not recorded. Joint feedback offers location, side, category Fatigue or Discomfort, optional subjective severity and a note. There is no default “None” inferred from silence, no automatic copying from prior sessions, and no diagnosis/readiness prediction. Set-level attachment is optional from the same detail. A small “Feedback recorded” action returns to the saved detail without occupying another matrix column.

## 9 Import state and recovery contract

| State | Required UI and permitted action |
| --- | --- |
| Choose file | Native local-file chooser; scope copy says workout history. Cancel returns without changing data. |
| Inspecting | Local format/size/shape inspection; no upload. Show activity rather than invented percentage. Reject unsupported/oversized files with the recognized reason and export guidance. |
| Recognized | Identify unversioned fitness JSON or full backup version 1/2; show original source and training-only coverage. A format label is not a proof of semantic validity. |
| Mapping review | Show preserved source names, candidate aliases and load conventions. No forced merge by name; keep separate/unknown is available. Changing an alias explains affected comparison eligibility. |
| Timezone review | Preserve timestamps; explicitly choose grouping assumption if original timezone is missing. Device timezone can be a proposed selection labeled Assumed at import, never Original timezone. |
| Duplicate review | Exact identity plus content match is skipped. Show counts and source batch; do not classify solely by title/date. |
| Changed source | Show current versus source values/notes and effects of Keep current or Use source revision. Default is no overwrite. Resolve each choice or explicitly exclude it from this import. |
| Quarantine | Show invalid records/reasons with retained source references. Valid but unknown tracking types/load basis remain recoverable rather than being silently dropped. |
| Ready | Reconcile source totals with additions, updates, skips and issues. Explain what will change, then enable Import. |
| Staging | Show actual staged counts from job events. Existing history does not contain partially visible new sessions. Cancel is available only while safe; otherwise say Finalizing and finish the atomic publication. |
| Commit failure | No successful-import message. Preserve job/source mapping and offer Retry or Review. The next launch checks the job result before reapplying it. |
| Source unavailable after restart | Ask to select the same file again; verify its content identity. Do not resume from a different file under the old batch. |
| Revalidation needed | If history changed after preview, refresh affected conflicts and request review before applying stale choices. |
| Committed | Display actual reconciled totals, retained issues and source batch. View history opens the imported interval; repeated import uses the same identity rules. |

Source files remain unchanged. Full backups can contain unrelated Life Dashboard sections and photos; the native workout importer does not claim to migrate them. Successful history import and successful native backup restoration are separate flows and acceptance tests. Declining an alias change never deletes an otherwise valid source workout. Job detail remains accessible from Settings after leaving the result screen.

## 10 Visual tokens and native accessibility

These are proposed native tokens, not changes to the web app's Tailwind system. Use semantic names, preserve system accessibility preferences and verify against actual rendered surfaces.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas | `#F3F6F6` | `#07141B` | Screen background |
| Surface | `#FFFFFF` | `#10232C` | Inputs/cards/sheets |
| Raised surface | `#EEF4F4` | `#16303B` | Grouped rows and optional details |
| Primary text | `#102A32` | `#F0F5F6` | Values and essential labels |
| Secondary text | `#4A6068` | `#AEC1C7` | Dates/provenance; still readable |
| Input boundary | `#738C94` | `#66838D` | Input perimeter and visible focus structure |
| Primary action fill | `#006C67` | `#8DE4D5` | Complete/log/commit emphasis |
| Primary action text | `#FFFFFF` | `#062A28` | Content on that fill |
| Error text | `#B42335` | `#FFB4BE` | Failed save/invalid field, paired with text/icon |
| Caution text | `#8A4B00` | `#F6C779` | Pending/unknown provenance, paired with text |

On the Surface token, calculated contrast ratios are 15.01/14.70 for primary text, 6.64/8.66 for secondary text, 6.29/10.36 for action text on action fill, 3.55/4.00 for input boundaries, 6.50/9.64 for error text and 6.80/10.29 for caution text (light/dark). These calculations do not certify a rendered screen; translucent, disabled, selected and chart treatments require separate checks. Never fade essential suggested values below readable contrast; distinguish them with Suggested text and style rather than opacity alone.

Base type metrics: large title 28/34pt, section 20/26pt, body/button 17/22pt, numeric entry 20/24pt, secondary label 13/18pt. Values are size/line-height at the default text category, not fixed caps. Use system text scaling and tabular numerals for aligned values. Grow containers and lines naturally; do not clamp font scaling to protect the matrix. Long exercise/food names wrap with full accessible labels. The proposed targets follow Apple's published minimum 44 × 44pt touch guidance. [Apple design guidance](https://developer.apple.com/design/tips/).

Accessibility requirements:

- Screen navigation announces the new heading once. Preserve focus during ordinary row updates; stable record identities must survive list recycling.
- Traverse each exercise heading/context, then each row's type, previous summary, load, reps and completion in visible reading order. Do not group a whole editable row into one inaccessible element.
- A load label is “Bench press, set 2, total load, kilograms”; suggested hint adds “Suggested 80, previous Nov 2”. Completion label names the values it will accept. Committed checkbox exposes checked state; pending exposes busy state without falsely checking it.
- Every swipe, drag or long-press shortcut has a visible menu/action equivalent. Type, undo, reorder and chart inspection work through VoiceOver and external keyboard/Switch Control.
- Sheets have a heading, focus entry/return policy and dismissal action. Validation moves focus to the first invalid field after announcing the error once; it does not drop the current editor string.
- Timer seconds are not announced continuously. Announce Rest ended once when appropriate; expose remaining time on demand. Save receipts use platform-supported iOS announcements. React Native's documented `accessibilityLiveRegion` is Android-specific; it must not be the sole iOS announcement implementation. [React Native accessibility](https://reactnative.dev/docs/accessibility).
- Honor Reduce Motion; no flashing status, mandatory animation or animated scroll to another exercise on completion. Selected/error/suggested states include words and shapes as well as color.
- Respect top/bottom safe areas, the keyboard's actual frame and user text settings. The focused input, validation text and active primary action must be scrollable fully into the remaining viewport. At very large text, reduce visible simultaneous controls through stacked groups, not smaller targets.

Minimum supported iOS and smallest supported iPhone remain unresolved for Agent C. The specification provides a 375pt stacked fallback and a 390pt compact reference, but does not promise device/OS compatibility before the native build check.

## 11 React Native component inventory

The following props/events are UI contracts, not a prescribed storage schema. Domain commands receive scope, stable IDs, expected revision and operation identity through an application layer. No component writes a database directly.

| Component | Responsibility and important props | Accessible name/state | Events |
| --- | --- | --- | --- |
| AppShell | Active session, selected tab, hydration/recovery status, safe-area/keyboard metrics | Navigation heading and selected tabs | `onSelectTab`, `onResume`, `onRetryHydration` |
| ActiveSessionCapsule | Session summary, saved count, timer, local-save status | “Resume Push A, 3 sets saved” | `onResume`, `onExpandTimer` |
| TrainStart | Routines, last dates, start availability | Named routine start actions | `onStartRoutine`, `onStartEmpty`, `onRepeatHistory` |
| WorkoutHeader | Session name, lifecycle/save state, current timer | Name field, Finish, Minimize | `onRenameDraft`, `onFinishRequested`, `onMinimize` |
| ExerciseBlock | Instance ID, label/variant, load basis, baseline, group, ordered row IDs | Exercise heading + block identity | `onOpenBaseline`, `onOpenMenu`, `onAddSet` |
| SetRow / StackedSetRow | Same row view model: suggestions, raw draft, saved observation, pending/error state | Individual fields and named completion checkbox | `onFieldChange`, `onFieldFocus`, `onComplete`, `onUndo`, `onSaveAmendment`, `onRetry` |
| NumericEntry | Raw text, placeholder/source, unit, input kind, selection, validation | Exercise/set/field/unit | `onTextChange`, `onNext`, `onDone`, `onBlur` |
| SetAdjustmentBar | Focused set/field, unit step preference, availability | “Increase load by 2.5kg” etc. | `onStep`, `onOpenDetails` |
| KeyboardActionBar | Focus target, next availability, edit mode, save status | Explicit Next/Done or Save changes | `onStep`, `onNext`, `onDone` |
| SetTypeMenu | Current type, permitted choices, historical source type | Named selected type | `onSelectType` |
| FeedbackSheet | Optional RPE and joint observation draft, attachment scope, prior saved version | “How it felt”; optional fields named | `onRpeChange`, `onJointChange`, `onSave`, `onClear` |
| RestTimer | Deadline/source ID, remaining time, notification availability, pending adjustments | Remaining time on demand; named Skip/Adjust | `onExpand`, `onAdjust`, `onSkip` |
| SaveStatus / RetryRow | Latest acknowledged revision, pending intent, error, recovery action | Saving, Draft saved, Saved on device, Not saved | `onRetry`, `onReviewUnsaved` |
| FinishReview / Summary | Committed counts, unresolved drafts, eligible highlight, week count/range | Named summary and review actions | `onReturnToDraft`, `onConfirmFinish`, `onViewSession`, `onDone` |
| DietDay | Recorded date, day coverage, nutrient completeness, entries, targets | Date, status and known/unknown totals | `onShiftDate`, `onLogFood`, `onQuickMacros`, `onSetCompleteness` |
| MacroSummary | Known subtotals, missing contributors, targets, display preference | Each nutrient plus qualifier/unit | `onToggleConsumedRemaining`, `onInspectNutrient` |
| FoodPicker / SavedMealRow | Source, search text, saved items, usual portion, availability | Item + portion + known nutrients | `onSearchLocal`, `onSelect`, `onAddUsual`, `onTogglePicked` |
| PortionEditor | Entry/definition snapshot, raw quantity, unit/conversion, preview, date/meal | Quantity and unit; Log portion/Save changes | `onQuantityChange`, `onUnitChange`, `onCommit`, `onCancel` |
| FoodEntryRow | Saved snapshot, proposed edit, completeness/error state | Item + quantity/unit + save status | `onEditEntry`, `onDelete`, `onUndo` |
| QuickMacrosSheet | Nullable raw values, name, date/meal, validation | Energy kcal, Protein/Carbs/Fat grams | `onFieldChange`, `onCommit` |
| ProgressChart / ObservationList | Observations, estimates, gaps, units, source watermark | Text summary and observation navigation | `onSelectObservation`, `onPrevious`, `onNext`, `onOpenMethod` |
| HistoryList / SessionDetail | Paged sessions, recorded dates, source/provenance, read/edit mode | Named session and source details | `onOpen`, `onRepeat`, `onEdit`, `onLoadMore` |
| ImportPreview / IssueReview | Job phase, source coverage, counters, mapping/timezone/conflict choices | Counts, warning reasons, current/source comparison | `onResolveIssue`, `onConfirm`, `onCancel`, `onRetry` |
| ImportResult | Final receipt, reconciled counts, retained issues | “Import complete” only after commit | `onViewHistory`, `onReviewIssues` |

Every mutation callback produces intent only. Components render receipt/query state; they do not decide that a Promise timeout means rollback. UI-only focus, layout selection and raw editor text are separated from authoritative observations and command receipts.

## 12 Scenario acceptance checklist

All interaction/time thresholds below are **proposed, unmeasured targets**. Count deliberate activation gestures separately from numeric keystrokes. Timing starts from the stated screen/state and excludes exercise performance. The PRD's p95 50ms visual feedback and 150ms local commit targets remain Agent C/D measurement work.

| Scenario | Proposed acceptance target | Required invariant |
| --- | --- | --- |
| Repeat unchanged valid suggested set | From visible row, one Complete activation; no confirmation modal | Committed once, previous RPE absent, metrics/timer update only after receipt |
| Change load and reps | Tap load, type, Next, type, Complete: three activation gestures plus keystrokes; no extra editor screen | Caret stable, unit correct, exactly one observed set |
| Undo accidental completion | One uncheck activation from saved row | Values retained; count removes after commit; only the owned rest intent is canceled |
| Repeated exercise block | Log block 2 with different load from block 1 | Correct previous instance/context; no change to block 1 |
| Missing field | Complete an invalid row | One inline error and first-field focus; all other draft text preserved |
| Double tap or delayed acknowledgment | Repeatedly activate during pending save | One command identity; no duplicate record/timer |
| Low-storage/write failure | Fail completion and retry | Unchecked failed row retains data; no saved badge, no counted set before recovery |
| Resume after termination | Relaunch already-onboarded app; zero navigation steps to active session | All acknowledged observations/drafts restored; uncertain operations resolved; no sign-in/network gate |
| Usual meal unchanged | From Diet, open Saved meal and Add usual portion: two activations once item is visible | Snapshot + correct date/meal; undo reachable |
| Usual meal changed portion | Saved meal, choose item, quantity edit, Log portion: four activations plus keystrokes | Correct quantity/basis preview; original definition unchanged |
| Correct a food on a completed day | Open entry, edit and Save changes | Entry changes after receipt; day atomically reopens and clearly explains why |
| Unknown nutrient | Log known protein with missing calories/fat | Zero is not substituted; remaining values become Unknown where required |
| Sparse weight history | Two readings seven days apart and a long gap | Raw observations distinct; trend method/date/coverage exposed; no synthetic weigh-in |
| Import repeated file | Preview then import a synthetic file twice | Second import adds no duplicates; source totals reconcile |
| Changed source and malformed record | Review one conflict and one quarantine | Explicit choice, retained issue, no silent overwrite/drop |
| Import interrupted | Terminate during staging/uncertain commit | No half-visible dataset; restart checks receipt/file identity before replay |
| Enlarged text / VoiceOver | Perform unchanged-set, correction, portion and import tasks | All controls reachable, named and at least 44pt; no horizontal logging dependency |
| Timer and keyboard | Edit bottom visible row with rest active, then background/reopen | No input/control overlap; one restored deadline; denied notifications do not block logging |

For usability timing, run three counterbalanced sessions with Seth using synthetic data, then record median task time, errors, corrections and comprehension before claiming an improvement. Set initial target times after observing his baseline; do not invent a measured speed advantage. Use default and enlarged text plus VoiceOver on a physical supported iPhone before native acceptance.

## 13 Handoff to Agent C

### Domain commands and receipts

Required intents: `StartSession`, `EditSetDraft`, `CompleteSet`, `AmendCompletedSet`, `UndoSetCompletion`, `DeleteSet`, `RestoreSet`, `SetSetType`, `ReorderExercise`, `SetSupersetGroup`, `SaveSubjectiveObservation`, `ChangeRestTimer`, `SkipRestTimer`, `FinishSession`, `DiscardSession`, `LogFood`, `AmendFoodEntry`, `DeleteFoodEntry`, `RestoreFoodEntry`, `SetDayCompleteness`, `RecordWeighIn`, `SelectPrimaryWeighIn`, `PreviewLegacyImport`, `ResolveImportIssue` and `CommitLegacyImport`. Agent C may consolidate names while preserving semantics and ownership boundaries.

Every mutation carries workspace/athlete context, stable entity ID, operation ID, expected revision, intent timestamp and relevant payload. A receipt identifies the committed revision and affected IDs/projections. Retry reuses the identity for unchanged intent; changing payload produces a new intent. Return definite validation failures separately from uncertain persistence outcomes. Completion plus automatic timer intent, finish plus session lifecycle state, and food edit plus day reopening need consistent commit boundaries. These are behavior requirements, not prescribed table/transaction implementation.

Events/query refresh signals: `DraftCheckpointed`, `SetCompletionCommitted`, `SetAmended`, `CompletionUndone`, `TimerIntentCommitted`, `SessionFinished`, `FoodEntryCommitted`, `DayCoverageChanged`, `WeighInCommitted`, `ImportProgress`, `ImportCommitted`, `OperationFailed`, `OperationOutcomeUnknown` and `SourceHistoryChanged`. Events carry source revisions to prevent a stale receipt from replacing a newer editor state. Invalidation must update completed-week counts and affected analytics after edits/backdating/deletion.

### Durable state and transient state

| Durable or recoverable through domain contracts | UI-local transient state |
| --- | --- |
| Active session and ordered identities; accepted observations; acknowledged working draft text and revisions; latest operation receipts/uncertain intents | Focus/caret, selection, keyboard visibility, open sheet, current drag gesture and unsaved text since last checkpoint |
| Routine/exercise/source snapshots; load convention/provenance; observed RPE/joint tags | Suggested values rendered from those snapshots, selection highlight, temporary validation display |
| Timer source/deadline/cancellation; notification intent identity | Tick rendering, temporary animation, remaining seconds derived from deadline |
| Consumed-food nutrient snapshots, quantity/unit, recorded day and completeness declaration | Unsaved portion preview, picker search, multi-add selection before checkpoint |
| Raw weigh-ins, selected daily representative, recorded timezone assumption; algorithm/cache version | Chart selection, viewport and selected inspection marker |
| Import job/source identity, staging/progress, explicit choices, mapping, quarantine and final receipt | Expanded issue rows and navigation; percentage derived only from actual job counters |

No component-local flag can be the only proof that a set was committed or an import completed. Agent C must define recovery from termination at each acknowledgment boundary, including what happens when a file's access permission is no longer available.

### Required queries and snapshots

- Active session with only the visible exercise/rows subscribed; acknowledged drafts and unresolved operations by ID.
- Previous comparable sets with baseline dates, routine context, variant and load-basis evidence; independent repeated-exercise instances.
- Completed workouts this local week, excluding active/future records; consistent date/timezone handling after travel or backdating.
- Paged history/detail, original source mapping and retained unknown fields. Repeating uses a new session with historical suggestions only.
- Daily nutrient known subtotals, missing-contributor counts, target version, day status, saved/recent/usual foods and validated portion conversion.
- Weight observations with daily representative and dated EWMA cache/provenance; stale/gap flags derived from actual observation dates.
- Import reconciliation and current conflicts tied to the preview source revision. Recheck after concurrent native history edits.

Snapshot requirements: session/routine targets, exercise label/variant/equipment/load basis, dated suggestion source, completed observed values, consumed-food nutrients and serving basis, subjective observation attribution and original import payload references. Master-definition changes cannot silently rewrite historical observations.

### Performance and unresolved constraints

Keep native numeric editing responsive; subscribe by row identity and avoid full-history scans or chart recomputation on every keypress. Timer ticks update their own view. Import staging must not monopolize the logging path. Agent C chooses and measures query indexes, transaction sizing, worker/parser strategy and cache invalidation with the PRD's synthetic datasets.

Resolve: supported native keyboard-toolbar approach; SDK/database compatibility; minimum iOS/reference/smallest device; reliable local draft checkpoints; timer clock-change/notification semantics; ambiguous legacy load basis/timezone; import file-access lifetime; multi-day report coverage policy; proposed freshness threshold; optional food provider and its offline scope. Product review still owns manual-versus-prescriptive positioning, joint vocabulary and preferred density.

The next deliverable is Agent C's architecture and typed contracts. This specification does not authorize or run that stage.

## 14 Verification evidence

The companion [static wireframe board](B_UX_WIREFRAMES.html) is a design-only HTML/CSS rendering with synthetic values and no app persistence, networking or native implementation. Its browser geometry uses one CSS pixel per reference logical point solely to test the layout arithmetic; it is not a native iPhone screenshot or Dynamic Type simulation.

Actual browser-layout and contrast verification results are recorded in [UX validation](B_UX_VALIDATION.md). Native keyboard, safe areas, actual Dynamic Type categories, VoiceOver, app suspension/termination, data durability and latency still require Agent C/D's built application and supported devices. Proposed acceptance targets above must not be reported as achieved behavior.
