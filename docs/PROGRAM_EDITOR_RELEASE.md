# Edit imported programs before training

## Problem and resulting behavior

Imported multi-week cycles previously supported training-max/date setup and review, while a linked routine’s Edit action returned to that review. Users had to start a workout to change exercises, affecting only that session. The cycle now has an explicit **Edit program** action; linked routine Edit opens it directly without creating an active workout.

Choose a day/week and expand an exercise. Edit names/notes, planned weekdays, rest, supersets, set kinds/counts, rep ranges, AMRAP, percentage/lift references, duration/distance and target RPE. The shared exercise library adds/replaces movements; reorder/remove actions affect the program draft across weeks. Target changes affect the selected week unless the user confirms Apply these sets to every week. A replacement clears the previous lift’s percentage references; a tracking-type change clears incompatible targets. New movements contain blank targets requiring review.

## Persistence and recovery

- Optional `customDefinition` overlays the immutable imported source; original signature, cycle/day/lift identities, routine IDs and max settings remain.
- Atomic `save-training-program` commands update only `trainingCycles` and linked `routines`. Active and completed workout snapshots remain unchanged.
- Failed prepared edits stay recoverable for exact retry, reload and full-backup restoration. Compare-and-swap checks reject stale edits from another tab.
- Full backups preserve edits and training maxes. The cycle-only export remains the original prescription. Both cycle exporters now pass filename/content arguments in the intended order.
- No database/store/namespace changes, personal plans, workout records or credentials enter the runtime package. The separate Drive history-loss report is documented in `DRIVE_SYNC.md`; this editor does not resolve that incident.

## Validation and release gates

Local `npm test` passed: static checks, four broker unit tests and 278 Chromium tests. The added editor scenarios cover save/reload/source re-import/full-backup restore, linked routine entry, retained active/history/max snapshots, shared picker, cancel, failed atomic saves, stale-tab refusal, corrected exports and 390px light/dark enlarged text. The added 36-workout mock Drive-adoption regression passed; it is not proof of real-provider recovery.

WebKit, staged package, GitHub checks and deployed-package results are recorded below when completed. Test profiles and content are synthetic. Physical iPhone/VoiceOver use remains owner-assisted verification.

## Limits

The editor retains the imported number of weeks, day IDs and training-max lift keys. Weekday offsets are informational. Create custom movements in the exercise library first; the program picker uses existing definitions. Unsaved drafts live in the current tab until saved; failed prepared saves use durable recovery. Update every device before restoring or syncing edited cycles, because earlier strict validators do not recognize the optional overlay. Keep known-good downloaded backups, especially while the separate sync incident is unresolved.
