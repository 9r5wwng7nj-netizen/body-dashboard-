# Local training cycles

Training cycles extend ordinary routines with optional, private, multi-week prescriptions. The runtime contains no personal plan. Source packages belong in private files, not the repository, fixtures, Pages artifacts or screenshots.

## User flow

Train → Import cycle → choose a JSON file or paste JSON → Preview cycle → Add training cycle. Import adds linked routines without writing workout history, global exercise definitions, food, photos or settings. An identical package reopens the saved cycle. A changed package using an existing cycle ID is rejected rather than overwriting it; use a new ID for an intentional new cycle. Review the preview before accepting.

Open a cycle to choose the week explicitly, review each day's targets and start a day. The calendar week uses local dates, seven days from the cycle's start date. Before/after the scheduled dates, the preview explains the date and permits an intentional repeat. An active workout keeps its week, phase and resolved set targets even after a training-max/date edit. Starting through a linked routine opens this review too.

Training-max setup accepts optional base and ramp TMs, plus a load-rounding increment. An explicit helper estimates base TM using `load × (1 + reps / 30) × 0.90` for 1–10 entered reps. This is an estimate, not a tested maximum. The cycle helper follows that formula even at one rep; existing strength-history analytics are unchanged. Use the same load convention for calibration and logging. Proposed ramp increments only fill a reviewable field; Save is required. Nothing automatically increases/reduces a TM, changes bodyweight tracking or prevents logging cardio.

Set targets are separate from actual weight/reps/duration/distance and never enter completed counts. Check explicitly accepts valid supplied targets; typing a result overrides them. A missing percentage TM requires manual load entry, without borrowing historical load. AMRAP requires actual reps; target RPE is visible and never copied as an observation. Optional effort remains optional. Previous remains an explicit copy action. Extra rows have no invented program target. Warm-up rows keep the existing warm-up kind and appear in one collapsible block ahead of primary work; its open state survives in-session saves.

Workout substitutions apply to the session. Program classifications describe the prescribed tracking basis and do not overwrite the exercise library. Generic library renames propagate through linked routine slots for future starts; old source packages remain immutable. Open a cycle → **Edit program** to edit before starting a workout. The linked routine’s Edit button opens this editor directly. Choose a training day and week, expand an exercise, and change its targets, rest, notes or superset link. Add, replace, reorder or remove exercises through the existing library. Exercise changes apply across the cycle; target changes apply only to the selected week unless you explicitly apply those sets to every week. Replacements clear the previous lift’s percentage-load references; incompatible tracking targets are cleared rather than reassigned. New exercises start with blank target rows. Save program changes is required. Cancel discards the unsaved draft after confirmation. Weekday offsets are planning labels, not an automatic scheduler. Backups remain the source of complete recovery.

## Optional persistence

`trainingCycles: []` is a new optional collection in IndexedDB `body-dashboard`, version 1. Existing store names and records are unchanged. Each cycle has:

- `id`, immutable validated `definition`, SHA-256 source `signature`;
- optional validated `customDefinition` for edited prescriptions; original source/signature stay immutable, and cycle/day/lift identities and week count stay stable;
- private configurable `startDate`, `maxes[liftKey] = {baseKg?, rampKg?, roundKg?}`;
- `routineIds[dayId]`, preserving linked routine IDs.

Linked routines add optional `cycleId`, `cycleDayId`, exercise `slotId`, prescribed `classification` and `plannedWarmup`. Their scalar row counts are import-time compatibility values. The muscle-set planner derives effective counts from the cycle's current calendar week without rewriting those records. An active/finished workout can add `cycle: {id,dayId,week,phase,startDate}`, `prescriptionNote`, and `set.target` containing the source prescription plus resolved `tmKg`, `tmGroup` and `weightKg`. Targets are historical snapshots, not actual values.

Full backup includes cycles, configured TMs, active/history snapshots and normal recovery metadata/photos. Old backups omit the collection and use its default. Export cycle exports the original prescription only; use a full backup to preserve edits and calibrated TMs. Both cycle exports now download the intended JSON content with JSON filenames. Atomic import/setup/program edits use existing WebWrites intent/receipt recovery with purposes `import-training-cycle`, `save-training-cycle` and `save-training-program`. Program saves update the cycle overlay and linked routines in one transaction; active/completed workouts are excluded. A failed prepared program save freezes its draft for exact retry. Newer changes from another tab are refused rather than overwritten. Failed writes remain pending and Retry save survives reload/backup restoration. A stale review is refused by compare-and-swap checks.

## Version 1 package contract

Top-level keys: `app: "body-dashboard"`, `type: "training-cycle"`, `version: 1`, stable `id`, `name`, local `startDate` (`YYYY-MM-DD`), optional `notes`, `weeks`, `lifts`, `days`. Unknown fields, unsafe object keys and malformed values are rejected. Limit 1 MB text, 1–52 weeks, 0–20 lifts, 1–7 training days, at most 40 exercise blocks per day and 30 target rows per exercise/week. This importer does not accept completed history or execute document instructions/code.

- Week: `name`, optional `note`, `tmGroup: "base" | "ramp"`.
- Lift: unique `key`, `label`, optional positive `incrementKg` (reviewable ramp suggestion).
- Day: unique `id`, `name`, `offset` (0–6 relative to start weekday, informational), optional `note`, `exercises`.
- Exercise: unique day-local `key`, `name`, `classification`, optional `note`, integer rest seconds `rest`, boolean `ss` linking to next exercise, `targets` (one set-array per week). Empty arrays omit the exercise in that week.
- Classification: version 1, recognized tracking `type`, canonical `primary`, `secondary` list, recognized `equipment`; optional `loadBasis` and `distanceUnit` (`m`, `yd`, `km`, `mi`). These snapshots are local to the imported routines/workouts.
- Target: optional `repsMin`, `repsMax`, `amrap`, `percentTM`, `liftKey`, `durationSec`, `distanceKm`, `rpeTarget`, `kind: "normal" | "warmup"`, `note`. Percentage targets require a known lift and either a rep minimum or AMRAP with actual rep entry. Physical values remain kg/km/seconds; no automatic unilateral doubling.

## Loaded distance

The additive `weight_distance` tracking type requires actual external load and positive distance. Optional classification `distanceUnit` supports yards/metres (or km/mi). Canonical distance stays km, with `1 yd = 0.0009144 km` and `1 m = 0.001 km`. Active numeric drafts record the display unit used at entry, so reload and later display-unit changes preserve physical quantities. Legacy `kg`/`lbs` draft tags keep their existing km/mile meaning.

Loaded-distance rows are separate Other work in muscle reports and have no invented duration, rep volume, E1RM or pace. Warm-ups stay separate too. Full JSON backup preserves precision and snapshots. Existing CSV export retains its established rounded km/mile interchange behavior; use full backups for exact app recovery.

## Deliberate limits

The editor keeps the imported week count, day IDs and training-max lift keys fixed. It does not create arbitrary extra weeks/days/lift keys or custom exercise definitions; create custom definitions in the library first. Older app versions do not understand edited-cycle overlays, so update each device before restoring or syncing an edited program. The cycle supports reviewable prescriptions and manual progression. Automatic two-session miss detection, progression notifications, bodyweight belt transitions and clinical/readiness decisions are not implemented. Conflicting source instructions must remain explicit review notes; do not turn them into silent app rules. Local editing requires no network. Optional Drive sync is separately enabled by the owner; see [DRIVE_SYNC.md](DRIVE_SYNC.md). A reported history-loss incident is still under investigation. Keep known-good downloaded backups and avoid connecting devices while recovering records; a displayed sync success alone does not verify record counts.
