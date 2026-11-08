# Body Dashboard existing application audit

> Web-first update, November 7, 2026: the source facts below remain useful. Native rewrite recommendations are historical and superseded by [WEB_FIRST_PLAN.md](WEB_FIRST_PLAN.md); the active release extends the existing web app in place.

The existing app provides a useful domain reference and a practical workout migration path. Its browser UI, persistence and synchronization layers need native replacements. Reuse tested rules and fixtures after extracting them into TypeScript; preserve the old application and records during the rebuild.

Audit date: November 7, 2026. Sources are the current local `index.html`, repository instructions, architecture/data-model documents and tests. The checkout includes uncommitted dashboard-refresh work; it is not identical to the committed baseline `63d098ffdbe70de23dd3d5cc7c9af10ab37f95f6`. No personal browser database or backup was opened.

## Findings

| Existing area | Verified source | Native rebuild decision |
| --- | --- | --- |
| Workout data | `COLLECTIONS`, `awFinish`, `editSave`, `fitJsonExport` | Retain values, ordering, notes, source IDs and provenance through a versioned importer. Normalize nested exercise instances and sets into related tables. |
| Exercise types | `EX_TYPES` | Preserve weight/reps, bodyweight, weighted and assisted bodyweight, duration, weight/duration and distance/duration records. A strength-first UI must not discard other historical types. |
| Strength estimates | `e1rm`, `setMetrics`, `exerciseHistory` | Existing estimate uses weight for a single rep and `weight * (1 + reps / 30)` otherwise. Extract with explicit eligibility and comparable-exercise rules. The current weighted-bodyweight estimate uses added load; do not silently mix it with total-system-load estimates. |
| Units | `LB`, `toUnit`, `fromUnit`, Hevy parser | Existing stored body/lift weights are kg. Stored workout distance is km, and duration is seconds. Preserve precision and convert only at input/output boundaries. |
| Set entry | `blankSet`, `exerciseCard`, `setStepper`, `awSetDone` | Retain prior-set copying, optional RPE, set types, supersets and quick adjustment concepts. Rebuild with native inputs, row-level updates and explicit draft/committed states. |
| Timers | `Timer`, visibility handling | Retain the rest-timer behavior; store deadlines and restore elapsed state after suspension. A JavaScript interval is not an authoritative background clock. |
| Weight trend | `weightSeries`, `trendSeries` | Current trend is a trailing seven-calendar-day mean of available readings. EWMA is a new algorithm with separate version and label. Retain raw readings; do not present a new curve as unchanged historical analytics. |
| Nutrition | `foods`, `nutrition`, `foodNutr`, `dayTotals`, recent/usual flows | Reuse the nutrient and portion concepts, saved-food speed and nullable values. Native entries need nutrient snapshots so edits to a food do not rewrite old consumption. |
| Joint feedback | Completed-set and exercise shapes | No dedicated joint-fatigue structure was identified. Add optional subjective observations; do not infer an injury or clinical score. |
| Persistence | `Store`, `drawSaveRecovery`, recovery tests | Native database commits must survive process termination after acknowledgment. Preserve failure/retry semantics, replacing the browser’s in-memory pending queue. |
| Identity | `uid`, string exercise names, nested arrays | Workout IDs exist. Completed exercise instances and sets can lack IDs. Generate deterministic import identities without collapsing repeated exercise blocks. Replace name-based identity for new native records. |
| Sync | `Sync`, `syncMerge`, `DRIVE` | Existing Drive sync is off by default and operates on whole collection snapshots. Design a new record-based, tenant-scoped protocol rather than porting it as coaching infrastructure. |
| Photos and recipes | `Photos`, `recipes`, v2 assets | Preserve the old app and exports. Full photo migration and recipe-gallery parity are outside the required workout-history import. Do not lose or rewrite their original files. |

## Existing export routes

The most direct source is **Settings and Sync → Export workouts → JSON**. `fitJsonExport` produces:

```json
{
  "app": "body-dashboard",
  "type": "fitness",
  "exportedAt": "2026-11-01T12:00:00.000Z",
  "workouts": [],
  "routines": [],
  "programs": {},
  "exMeta": {}
}
```

This fitness export has no numeric `version` field. Recognize its explicit shape; do not pretend it is a versioned full backup. The native importer should also recognize Body Dashboard and Life Dashboard backup envelopes with `version: 1` or `2` and workouts under `data.workouts`. Read only the supported training collections from a broader backup.

Full backups also contain `settings`, `data` and, for v2, `assets.photos`. Version 2 exports can be large because images are embedded. Prefer the fitness JSON for a workout-only transfer. The native app cannot directly read another app’s browser IndexedDB; the bridge is a user-selected exported file.

Hevy CSV is a secondary compatibility path. Existing parsing supports kg/lbs and km/miles, notes, set types, RPE and superset IDs. The parser groups sessions by title and start time and generates fresh IDs; the current CSV export rounds displayed weights and distances. JSON is therefore the preferred loss-minimizing migration source.

## Synthetic completed workout example

The following illustrates the source shape; it is not a personal record.

```json
{
  "id": "synthetic_workout_001",
  "name": "Example push session",
  "start": "2026-11-02T13:00:00.000Z",
  "end": "2026-11-02T14:00:00.000Z",
  "notes": "Synthetic fixture",
  "routineId": null,
  "exercises": [
    {
      "name": "Bench Press (Barbell)",
      "notes": "Example exercise note",
      "ss": false,
      "sets": [{ "type": "normal", "weight": 80, "reps": 5, "rpe": 8 }]
    }
  ]
}
```

`source`, `duration`, `distance` and cached `pr` fields may also occur. Preserve recognized values and retain unknown training fields in a local source payload for audit or future importer versions. Cached PRs are historical source annotations, not authoritative new analytics.

## Migration hazards

1. Exercise metadata is often keyed by lowercased name; a name is not a stable identity or proof of equipment/load convention. Preserve the original label and type evidence, and offer explicit alias review.
2. Supersets use `ss: true` to connect an exercise to the next array element. Preserve array order before deriving group IDs.
3. Source dates are timestamps. The original recording timezone generally is not stored, and the old app derives calendar dates using the current browser timezone. Preserve timestamps and record the import timezone assumption separately; never invent an original timezone.
4. Legacy bodyweight volume can use a later weigh-in or a settings fallback. Do not transplant that behavior into historical estimates without an explicit provenance policy.
5. Re-import matching must use a source identity plus original workout ID when available. Identical names and start times do not prove two source records are duplicates. Changed content under the same source ID requires a conflict preview.
6. Missing values, zero values, warm-ups, drop/failure sets and assisted loads have different meanings. Preserve them distinctly.
7. Completed history and `activeWorkout` are separate. Import completed history first; restoring an old active session must be an explicit separate choice.

## Salvage boundary

Retain source contracts, workout field semantics, conversion constants, import fixture ideas, failure cases and interaction lessons. Rewrite storage, native components, record identity, reactive queries, ownership/access, sync and analytics eligibility. Exclude productivity, pastoral disciplines, pantry/grocery administration and broader Life Dashboard modules from native scope.

This audit establishes format feasibility. End-to-end native import remains a release gate requiring synthetic fixture tests and, later, a private on-device comparison against a user-selected export. No personal export needs to be pasted into an AI conversation.

## Source references

- [Existing app source](../../index.html): search the function markers cited above.
- [Existing data model](../DATA_MODEL.md).
- [Existing architecture](../ARCHITECTURE.md).
- [Existing refresh validation](../REFRESH_VALIDATION.md).
- [Life Dashboard import fixtures](../../tests/import-life-dashboard.spec.js).
- [Save recovery fixtures](../../tests/save-recovery.spec.js).
