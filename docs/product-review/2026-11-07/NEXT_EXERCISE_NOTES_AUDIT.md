# Exercise secondary muscles and persistent cues — investigation

November 7, 2026 (America/New_York). Audited source: `764b06667be71379ea1bde71058b4a9a753c1dfe`. Investigation and planning only. Application/runtime, saved records and deployed beta were not changed. All examples used fresh, owned synthetic browser contexts.

## Findings and direct answers

**The secondary-muscle concern is real, but there are two separate problems.** In the Library editor, the checkbox changes and its values save correctly, while the selected chip looks unchanged. In the newer in-workout/routine picker, custom creation does not offer secondary muscles at all and always saves an empty array.

**An exercise's Add note currently belongs to that workout occurrence.** It survives reloading the current workout and remains in its finished history, but it does not automatically carry into the next session. The separate **Exercise settings → Form cues** field is persistent library metadata, yet its content is not displayed in the active logger. The current interface therefore does not meet the requested “write a cue once and see it next time” behavior.

## Confirmed evidence

| Concern | Current behavior and reproduction | Source |
| --- | --- | --- |
| Secondary selection appears broken | Open Train → Exercises → New exercise; choose Chest primary; tap Triceps among secondary chips. The hidden checkbox toggles true and FormData contains Triceps, but the chip's text/background remain identical. Selecting Chest as secondary is filtered on Save. | `libModal` at `index.html:1572–1587`; `libSave` at `2042–2047`; `src/app.css:272–274` |
| Secondary values survive | Save synthetic custom press with Chest primary, Triceps secondary and a synthetic form cue. Reload; stored `exMeta['synthetic audit press'].secondary` is still `['Triceps']`; the cue also remains. A newly accepted block's classification snapshot includes Triceps. No loss of these values was reproduced through this path. | `libSave`; `exerciseClassification` at `1732–1735`; set acceptance at `1295` |
| New picker custom form is incomplete | Open a routine → Add exercises → Create a custom exercise. The form has only name, tracking type, primary muscle and equipment. No secondary-muscle control exists. Save-and-select creates metadata with `secondary: []`. This also applies when the shared picker is used during a workout. | `customPickerForm` at `1844–1847`; `saveCustomPickerExercise` at `1848–1861` |
| Selected chips are small | At the 390px reference frame, each secondary chip span measured 20px high. The containing label does not have class `chip`; the global 44px rule only matches `button.chip` and `label.chip`, so it misses this label/span construction. The small label makes phone selection harder even when persistence works. | `libModal`; `src/app.css:273` |
| Add note is saved to current occurrence | Add a synthetic session note, flush, reload the page: `activeWorkout.exercises[0].notes` still contains it. Accept a set and finish: the completed exercise block keeps the note. | Active note markup at `1449–1452`; `awExNote` at `2001`; `wSave` at `1889`; `WorkoutCommands.finish` |
| New occurrence starts blank | The routine constructor, picker insertion and swap replacement initialize `notes: ''`. Repeat workout explicitly resets exercise notes to blank. Reproduced repeat after finishing synthetic history: repeated occurrence note was `''`, while `exInfo(name).notes` still contained the library cue. | `workoutFromRoutine` at `1341`; `newPickedExercise` at `1796`; `prepareExerciseSwap` at `1802`; `repeatWorkout` at `1921` |
| Persistent cue is hidden during logging | With a saved library cue, start the exercise. `#view` did not contain that cue text. The logger reads `info` for mapping/how-to but renders only `ex.notes`; `info.notes` appears only in the settings form. | `fitExercise` around `1444–1452`; `libModal` at `1585` |

The browser reproductions used a synthetic press with Chest primary and Triceps secondary. These assignments demonstrate application behavior; they are not exercise-prescription or muscle-activation recommendations.

### Exact observed selection appearance

| Appearance | Before tap | After tap | Stored checkbox |
| --- | --- | --- | --- |
| Light | background `rgb(234,240,255)`, text `rgb(86,97,118)` | Same colors | `true` |
| Dark | background `rgb(38,51,75)`, text `rgb(178,189,208)` | Same colors | Toggled back to `false` |

The reproduction selected Triceps again before saving. Saved and reloaded metadata retained Triceps; primary Chest was excluded from secondary.

## Root causes

1. **CSS cascade conflict:** the secondary span relies on layered Tailwind `peer-checked:bg-brand-600 peer-checked:text-white`. The later, unlayered `.chip` rule assigns background/text and outranks those layered utilities. This is a visible-selection defect, not evidence of a failed database write in the tested path.
2. **Two metadata forms have diverged:** Library creation supports multiple secondary checkboxes and Form cues, whereas picker creation has neither. Its writer hard-codes an empty secondary array. It does not parse and then lose a supplied secondary list; no such list can be supplied through that form.
3. **Two note concepts are stored but only one is surfaced:** library `exMeta[name.toLowerCase()].notes` is a reusable cue; workout `exercise.notes` is a dated session observation. New occurrences correctly avoid copying session facts, but the interface exposes the session field as generic Add note and never shows reusable cues.

## Recommended next implementation

### 1. Repair secondary selection and unify the forms

- Give both creation paths the same optional multi-select secondary field and metadata validation. Preserve existing type, equipment, primary, secondary, cue and how-to values when moving Back or retrying a save.
- Use a native checkbox with an obvious check indicator and theme-aware selected state, rather than relying on color alone. Apply at least 44px targets to the actual label/control. Do not rely on layered peer utility precedence against unlayered component CSS.
- Disable/identify the current primary muscle in the secondary selector; explain that it is already counted as primary. When primary changes, make the resulting secondary selection explicit. Deduplicate allowed values. Do not silently relabel existing history or override completed blocks' classification snapshots.
- Use the shared recoverable writer and expected-revision behavior for metadata changes. The current picker already uses coordinated `save-custom-exercise` intents/receipts. The older `libSave` mutates/schedules `Store.save`, closes and toasts before awaiting a durable flush. This is a source-level acknowledgement concern, not a reproduced data-loss finding; do not duplicate that pattern in the unified flow.
- Replace the Library form's universal “count as half a set” field label with neutral “Secondary muscles.” Any fractional credit belongs to the volume report's explicitly selected/labeled model.

### 2. Make reusable cues visible next session

Use the existing optional `exMeta.notes` for **Exercise cues**; no new collection is required. Show its first one or two lines beneath the exercise heading, with Expand/Edit for longer cues. It should be visible whenever present, including newly started routines, empty-session additions, repeated workouts and replacements with that exercise.

Keep `exercise.notes` as **Session note** for observations tied to a particular workout. Rename the current Add note affordance accordingly. Offer an explicit **Save as exercise cue** action when the user intentionally wants session text reused; never auto-promote all old notes. Optional future per-routine instructions would be a third, separately labeled concept and should be deferred unless needed.

- Saving/editing a reusable cue must not rewrite old session notes, completed set facts or historical classification snapshots.
- A swap shows the replacement exercise's own cue, preserving the original occurrence's note in actual work/recovery metadata. It must not transfer a different exercise's cue as a current fact.
- Current live cues can be read from library metadata during logging even when the block has a historical classification snapshot. If current cues are ever shown in history, label them **Current exercise cue**, not as something recorded in that session.
- Preserve the current lowercased-name lookup and existing record identities. Imported aliases and similarly named equipment variants need explicit matching, not an automatic history merge. Library expansion should account for cue ownership before introducing canonical catalog IDs.
- A full backup/training metadata export already includes `exMeta.notes`; retain this compatibility. Cue saves should use the same pending/saved/failed/retry acknowledgement semantics as other local commands.

## Acceptance pack for the builder

1. Library and picker create the same synthetic custom exercise shape with zero, one and multiple secondaries. Zero selected secondary muscles save as `[]`; duplicate/invalid values are rejected or normalized explicitly.
2. Primary cannot also count as secondary. Changing primary preserves/updates choices with clear feedback. Save, reopen and reload retain the result.
3. Checked state has a visible check + selected surface in Cobalt Air light/dark. Keyboard Space toggles; focus is visible; VoiceOver announces checked/unchecked; actual targets are at least 44px at 390px and enlarged text reflows.
4. Picker Back/cancel preserves its parent routine/session draft. A failed metadata save retains all chosen fields/cue text and offers Retry/Export. Retry/reload commits once; another tab cannot silently overwrite a changed exercise definition.
5. Current routine coverage/picker filtering immediately reflects newly saved secondaries. New accepted classifications capture them. Previously snapshotted historical blocks remain unchanged; legacy current-mapping fallback remains labeled.
6. A reusable cue saved once is visible on the next routine session, empty-session add, repeat and replacement. A session note remains in its own history and does not become the next session's observation automatically.
7. Editing a global cue updates future/live cue display without rewriting history. Explicit promotion of a session note requires the chosen action. Cancelling a cue edit changes neither field.
8. Full backup plus training import/export round-trip cue/secondary fields, IDs, units and unrelated data. Aliases/rename/merge and imported variant names do not silently overwrite cues.
9. Offline cue save/reload and abort/retry work in fresh test profiles. No Body action accesses Life Dashboard storage. No external AI or network dependency is involved in this correction.

## Verification and limits

A fresh Chromium context at 390×844 reproduced the complete flow above in light/dark. `npm run check` passed (347 top-level functions, 331 actions, 50 numeric fields). No runtime changes, repository test additions, commits, pushes or publication were performed by this audit. No real records, health photos or personal browser profiles were inspected.

The same complete synthetic scenario also passed against the repository’s installed WebKit engine with an iPhone 13 device configuration at 390×844. It reproduced identical selection colors/20px spans, correct secondary/cue persistence, missing picker controls, hidden library cues and blank repeated-session notes. The latest standalone Playwright CLI could not find its own matching WebKit binary, so the WebKit run used the repository’s already-installed Playwright library and a temporary audit script; no dependency was installed or changed. Desktop engines do not establish physical iPhone touch or VoiceOver usability.
