# Second catalog batch — 84 proposed additions

November 7, 2026. Data-only curation for root/product review; no application implementation or publication by this agent.

## What is ready

`catalog-candidates-batch2.json` contains **84 names** from the same pinned `free-exercise-db` revision as the first packet. Exact-name checks found no overlap with either the original 56 or the first 60 candidates. Each source ID and individual JSON path exists at revision `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`. This yields **200 potential names** only if all 144 additions survive root/product review. The upper target of 250 is deliberately not filled with weaker variants.

Per-entry fields retain source primary/secondary/equipment/category; proposed broad app focus; aliases; normalized equipment; original identification text; canonical type, load/row conventions, source/license URL and review decisions. All reviews say `curated_proposal_awaiting_product_review` and `reviewedByHumanTrainer: false`. This records an inspectable curation process, not measured physiology or expert endorsement.

The combined packet represents all seven existing tracking types. Every band entry follows root's technical decision: canonical `bodyweight` rendered as **Reps only**, `countBW: false`, `loadBasis: unquantified_resistance`; the band-assisted pull-up also records assistance direction without invented negative kilograms. Required Adductors/Abductors vocabulary remains additive. No stored names or identities are changed by these files.

## Quality decisions and exclusions

- **No semantic blind import.** The upstream `Air_Bike` describes an abdominal bicycle-style movement, not a fan-bike conditioning machine. It was excluded rather than mislabeled.
- **No glute label from a hip name.** `Smith_Machine_Hip_Raise` is an abdominal/pelvic raise in its source description, not a Smith hip thrust; it was excluded from hip-thrust suggestions.
- **Avoid questionable duplicates.** Generic machine bicep curl versus the existing preacher machine, generic calf press versus the first-batch leg-press calf press, and jogging versus treadmill running were not counted as additional entries simply to hit a budget.
- **Apparatus matters.** A seated external-resistance dip-press machine is not the first-batch assisted bodyweight dip. Smith/Trap/EZ/Rings have explicit subtypes where useful, without changing the parent filter category or asserting equivalent performance.
- **Source focus is a proposal.** The source barbell floor press maps primarily to Triceps, but root editorial review chooses Chest for generic dumbbell/barbell floor presses, with Shoulders/Triceps secondary; Close-Grip Bench retains Triceps focus. Cable adduction is corrected to Adductors rather than upstream Quads; barbell good morning uses Hamstrings with Glutes/Lower Back secondary; band-assisted pull-up includes Biceps secondary. All upstream fields remain preserved. These are consistent editorial role conventions, not measured physiology or trainer approval. The pullover source Chest focus remains visible and editable. Stabilizer-heavy Pallof secondaries were omitted from proposed counted roles with the raw source list retained.
- **Reps versus load.** A barbell rollout uses the bar as an implement; bar mass is not entered as a lifted load. Wrist-roller work is deliberately weight/duration. Ring and suspension exercises retain reps-only defaults. An added-load push-up is a disclosed adaptation of a bodyweight movement-family record, not a falsely claimed exact upstream loaded variant.
- **Conditioning does not become leg strength volume.** The pedal-style Stair Climber reference from batch one and the revolving-step Step Mill reference are distinguishable apparatus. Both are duration-only; no km or calorie-burn conversion is introduced. Treadmill/bike distance is machine reported, not an inferred physiological measurement.
- **No bulk instruction copy.** The dataset was used as a metadata/reference source. No source instruction arrays or images are included; the short descriptions identify the variant and do not overwrite personal cues.

## Review table

All entries below remain proposals for independent root/product review. Role lists are broad focus/involvement classifications, not exact stimulus measurements. A dash means the source does not specify secondary roles or a disclosed editorial decision omits them; inspect the JSON decisions before treating it as proof of absence.

| Name | Canonical type | Primary | Secondary | Equipment |
| --- | --- | --- | --- | --- |
| Bench Press (Smith Machine) | weight_reps | Chest | Shoulders, Triceps | Machine |
| Incline Bench Press (Smith Machine) | weight_reps | Chest | Shoulders, Triceps | Machine |
| Shoulder Press (Smith Machine) | weight_reps | Shoulders | Triceps | Machine |
| Bent Over Row (Smith Machine) | weight_reps | Upper Back | Biceps, Lats, Shoulders | Machine |
| Standing Calf Raise (Smith Machine) | weight_reps | Calves | — | Machine |
| Stiff-Legged Deadlift (Smith Machine) | weight_reps | Hamstrings | Glutes, Lower Back | Machine |
| Decline Chest Press (Machine) | weight_reps | Chest | Shoulders, Triceps | Machine |
| Iso-Lateral Row (Machine) | weight_reps | Lats | Biceps, Upper Back | Machine |
| Reverse Hyperextension (Machine) | weight_reps | Hamstrings | Calves, Glutes | Machine |
| Shrug (Machine) | weight_reps | Upper Back | Forearms | Machine |
| Seated Dip Press (Machine) | weight_reps | Triceps | Chest, Shoulders | Machine |
| Lying Squat (Machine) | weight_reps | Quads | Calves, Glutes, Hamstrings | Machine |
| Single-Arm Pulldown (Cable) | weight_reps | Lats | Biceps, Upper Back | Cable |
| Kneeling Single-Arm High Row (Cable) | weight_reps | Lats | Biceps, Upper Back | Cable |
| Preacher Curl (Cable) | weight_reps | Biceps | Forearms | Cable |
| Hammer Curl (Cable) | weight_reps | Biceps | — | Cable |
| Lying Triceps Extension (Cable) | weight_reps | Triceps | — | Cable |
| Front Raise (Cable) | weight_reps | Shoulders | — | Cable |
| Shrug (Cable) | weight_reps | Upper Back | — | Cable |
| Pull Through (Cable) | weight_reps | Glutes | Hamstrings, Lower Back | Cable |
| Hip Adduction (Cable) | weight_reps | Adductors | — | Cable |
| Glute Kickback (Cable) | weight_reps | Glutes | Hamstrings | Cable |
| Wood Chop (Cable) | weight_reps | Abs | Shoulders | Cable |
| Pallof Press with Rotation (Cable) | weight_reps | Abs | — | Cable |
| Single-Arm Chest Fly (Cable) | weight_reps | Chest | — | Cable |
| Overhead Curl (Cable) | weight_reps | Biceps | — | Cable |
| Floor Press (Dumbbell) | weight_reps | Chest | Shoulders, Triceps | Dumbbell |
| Floor Press (Barbell) | weight_reps | Chest | Shoulders, Triceps | Barbell |
| Decline Bench Press (Dumbbell) | weight_reps | Chest | Shoulders, Triceps | Dumbbell |
| Decline Bench Press (Barbell) | weight_reps | Chest | Shoulders, Triceps | Barbell |
| Single-Arm Bench Press (Dumbbell) | weight_reps | Chest | Shoulders, Triceps | Dumbbell |
| Pullover (Dumbbell) | weight_reps | Chest | Lats, Shoulders, Triceps | Dumbbell |
| Shrug (Barbell) | weight_reps | Upper Back | — | Barbell |
| Shrug (Dumbbell) | weight_reps | Upper Back | — | Dumbbell |
| Good Morning (Barbell) | weight_reps | Hamstrings | Glutes, Lower Back | Barbell |
| Sumo Deadlift (Barbell) | weight_reps | Hamstrings | Adductors, Forearms, Glutes, Lower Back, Upper Back, Quads | Barbell |
| Deadlift (Trap Bar) | weight_reps | Quads | Glutes, Hamstrings | Barbell |
| Box Squat (Barbell) | weight_reps | Quads | Adductors, Calves, Glutes, Hamstrings, Lower Back | Barbell |
| Zercher Squat (Barbell) | weight_reps | Quads | Calves, Glutes, Hamstrings | Barbell |
| Overhead Triceps Extension (Dumbbell) | weight_reps | Triceps | — | Dumbbell |
| Skullcrusher (EZ Bar) | weight_reps | Triceps | — | Barbell |
| Lying Triceps Extension (Dumbbell) | weight_reps | Triceps | Chest, Shoulders | Dumbbell |
| Supported Rear Delt Fly (Dumbbell) | weight_reps | Shoulders | — | Dumbbell |
| Single-Arm Shoulder Press (Dumbbell) | weight_reps | Shoulders | Triceps | Dumbbell |
| Upright Row (Dumbbell) | weight_reps | Upper Back | Biceps, Shoulders | Dumbbell |
| Neutral-Grip Bench Press (Dumbbell) | weight_reps | Chest | Shoulders, Triceps | Dumbbell |
| Step Up (Barbell) | weight_reps | Quads | Calves, Glutes, Hamstrings | Barbell |
| Walking Lunge (Barbell) | weight_reps | Quads | Calves, Glutes, Hamstrings | Barbell |
| Split Squat (Smith Machine) | weight_reps | Quads | Calves, Glutes, Hamstrings | Machine |
| Single-Leg Deadlift (Kettlebell) | weight_reps | Hamstrings | Glutes, Lower Back | Kettlebell |
| Single-Leg Glute Bridge | bodyweight | Glutes | Hamstrings | Bodyweight |
| Glute Bridge (Barbell) | weight_reps | Glutes | Calves, Hamstrings | Barbell |
| Squat (Dumbbell) | weight_reps | Quads | Calves, Glutes, Hamstrings, Lower Back | Dumbbell |
| Walking Lunge (Bodyweight) | bodyweight | Quads | Calves, Glutes, Hamstrings | Bodyweight |
| Side Split Squat (Barbell) | weight_reps | Quads | Calves, Hamstrings, Lower Back | Barbell |
| Nordic Curl (Bodyweight) | bodyweight | Hamstrings | Calves, Glutes, Lower Back | Bodyweight |
| Single-Leg Seated Calf Raise (Dumbbell) | weight_reps | Calves | — | Dumbbell |
| Seated Calf Raise (Barbell) | weight_reps | Calves | — | Barbell |
| Kneeling Ab Rollout (Barbell) | bodyweight | Abs | Lower Back, Shoulders | Barbell |
| Reverse Crunch | bodyweight | Abs | — | Bodyweight |
| Decline Crunch | bodyweight | Abs | — | Bodyweight |
| Side Bend (Dumbbell) | weight_reps | Abs | — | Dumbbell |
| Reverse Crunch (Cable) | weight_reps | Abs | — | Cable |
| Wrist Curl (Dumbbell) | weight_reps | Forearms | — | Dumbbell |
| Reverse Wrist Curl (Dumbbell) | weight_reps | Forearms | — | Dumbbell |
| Reverse Curl (Barbell) | weight_reps | Biceps | Forearms | Barbell |
| Wrist Roller | weight_duration | Forearms | Shoulders | Other |
| Russian Twist (Bodyweight) | bodyweight | Abs | Lower Back | Bodyweight |
| Push Up (Suspension) | bodyweight | Chest | Shoulders, Triceps | Suspension |
| Fallout (Suspension) | bodyweight | Abs | Chest, Lower Back, Shoulders | Suspension |
| Reverse Crunch (Suspension) | bodyweight | Abs | — | Suspension |
| Good Morning (Band) | bodyweight | Hamstrings | Glutes, Lower Back | Band |
| Lateral Raise (Band) | bodyweight | Shoulders | — | Band |
| Calf Raise (Band) | bodyweight | Calves | — | Band |
| Skullcrusher (Band) | bodyweight | Triceps | — | Band |
| Hip Extension (Band) | bodyweight | Glutes | Hamstrings | Band |
| Pull Up (Band Assisted) | bodyweight | Lats | Biceps, Abs, Forearms, Upper Back | Band |
| Dip (Rings) | bodyweight | Triceps | Chest, Shoulders | Suspension |
| Weighted Push Up | weighted_bw | Chest | Shoulders, Triceps | Plate |
| Knee Raise (Parallel Bars) | bodyweight | Abs | — | Bodyweight |
| Cycling (Recumbent Bike) | distance_duration | Cardio | — | Machine |
| Running (Treadmill) | distance_duration | Cardio | — | Machine |
| Walking (Treadmill) | distance_duration | Cardio | — | Machine |
| Step Mill (Revolving Stairs) | duration | Cardio | — | Machine |

## Root editorial mapping decisions

The root independently reviewed the proposed names/types and selected five explicit mapping corrections: cable hip adduction → Adductors; barbell good morning → Hamstrings with Glutes/Lower Back; both generic floor presses → Chest with Shoulders/Triceps; band-assisted pull-up → include Biceps secondary. Each affected JSON entry marks `rootEditorialMappingDecision` and retains the unmodified upstream metadata/source. The close-grip bench remains Triceps primary. These are broad product focus conventions, not a trainer sign-off or quantified muscle stimulus.

## Integration and validation

Use the first packet's `CATALOG_CURATION_HANDOFF.md` contract: shared search only (aliases never rename or merge history), additive seeding, user `exMeta`/cues precedence, optional provenance, original snapshots preserved and legacy current-mapping report changes disclosed. A name count is not the acceptance gate. Exercise browsing, metadata trust and accurate type/basis behavior are.

Before shipping, root should review every mapping, cull semantic duplicates and confirm naming/filter categories. The implementation must prove offline routine/add/swap paths, repeated seed upgrades, preserved populated backups/overrides, new muscle vocabulary, typed historic comparison and no E1RM for unquantified bands. It must keep all canonical storage namespaces, types, record IDs, kg/km/seconds and photo compatibility intact. No database migration or runtime dependency is required by these candidate files.

## Mechanical results

- Batch one: 60 distinct names; batch two: 84; combined additions: 144.
- Original 56 plus candidates: **200 potential names**, not 200 reviewed or shipped names.
- No exact-name duplicates across the batches or original defaults; all 144 candidate IDs unique.
- All source record paths checked at the pinned Git tree; no images/instructions copied.
- Equipment/categories and canonical types fit the existing technical contract plus the root-approved hip vocabulary. Primary roles are not repeated in secondary arrays; normalization removes duplicate broad roles.
- All 12 band candidates across both packets are reps-only, do not add bodyweight and do not claim calibrated load. The assisted-band variant remains explicitly unquantified.

These are data validations. Runtime/browser integration tests belong to root after approval; no application/tests/deployment were changed by this curation task.
