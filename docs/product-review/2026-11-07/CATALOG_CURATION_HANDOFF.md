# Release 2 catalog curation handoff

November 7, 2026 (America/New_York). Data/document preparation only. Application runtime, tests, storage and deployment were not changed by this curation task.

## Ready for independent review

`catalog-candidates.json` contains **60 proposed additions**, no exact-name duplicates of the existing 56 built-ins. If all are accepted the catalog would contain **116 names**. The packet uses 58 exact upstream records pinned to `free-exercise-db` revision `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`; every referenced record path was checked against that revision's Git tree. The four assisted/weighted variants deliberately share two base movement-family records and disclose that adaptation.

All candidates have one proposed primary group, separate secondary roles, normalized equipment, a compatible tracking type, search aliases, original identification text, source record/revision/URL/license notice and per-entry review decisions. Source metadata is preserved alongside the proposed mapping for comparison. No instructions or media were copied. No candidate is labeled trainer-approved or physiologically validated. `review.status` is **curated_proposal_awaiting_product_review**; the primary/secondary labels are proposed focus classifications, not measured set stimulus.

The curation was checked entry by entry for duplicate identity, incompatible apparatus, source role mapping, required vocabulary, tracking/load-basis ambiguity and conditional exclusions. The mechanical validation summary is in the JSON. Review the following integration decisions before copying defaults into runtime.

## Decisions that must remain explicit

1. **Band tracking resolved by root technical review.** The six band entries use the existing canonical `bodyweight` type as a reps-only shape; the runtime display label will become **Reps only**. They have `countBW: false` and `loadBasis: unquantified_resistance`. No kg value, band-color conversion, bodyweight addition or external-load E1RM is implied. This changes the proposed logging semantics, not existing canonical type identities, and is not trainer approval.
2. **Hip vocabulary resolved by root technical review.** Add `Adductors`/`Abductors` consistently to metadata forms, filters, snapshots and the new Muscle sets grouping before exposing Hip Adduction (Machine), Hip Abduction (Machine), Hip Adduction (Band) and Split Squat (Suspension). Do not remap these to Glutes/Other. The `requiresVocabulary` field is an adapter requirement, not an unresolved product rejection.
3. **Conditioning remains separate.** Elliptical is distance/duration; Stair Climber is duration-only so floors/steps are not invented as kilometers. Both use Cardio as the reporting role, retaining the upstream leg-muscle fields only as provenance. This is a documented product mapping rather than a claim that no muscles are involved.
4. **Primary/secondary lists need root/product review.** Source lists sometimes include stabilizers or broad involvement. Pallof's proposed secondaries intentionally omit the source's chest/shoulders/triceps to avoid turning stabilization into unexplained working-set credit. The upstream list and decision remain visible. Empty upstream secondaries are explicitly not proof of absence.
5. **Gear and load basis stay distinct.** Smith is categorized as Machine with subtype Smith Machine; EZ Bar uses Barbell plus subtype. Assisted and added-load variants remain separate from unassisted bodyweight work. Carries use weight/duration; do not fabricate distance. A dumbbell label does not settle whether the user records each implement or the pair, so no load doubling is applied.
6. **Aliases are search aids.** They do not rename, merge or redirect history. For example, the source's lying T-bar row becomes Chest-Supported T-Bar Row (Machine), not a claim that all chest-supported machines have interchangeable load or performance. Stiff-Legged Deadlift (Dumbbell) is deliberately not aliased to Romanian Deadlift.

## Proposed runtime integration order

- First resolve the inference traps separately: Chest-Supported Row and Rear Delt Fly must not hit Chest merely because of an early regex; Smith equipment must fit an available category. Exact curated defaults outrank inference. Do not use broader inference rules to overwrite a personal override.
- Make one query/alias/equipment normalization contract for standalone Library and the shared picker. Retain recent-first ordering, user custom items, explicit metadata detail and clearable active filters.
- Adapt only approved candidate fields into the existing in-file default metadata table or an explicitly authorized catalog constant. Keep IDs/names of the original 56 and all stored exercise/workout/set/routine records. Do not bulk copy `upstreamMetadata` into user `exMeta`.
- Preserve `exMeta` precedence and user cues/type/bodyweight conventions. Add the new default names idempotently using the existing additive library revision path; verify populated profiles and repeated seed upgrades. No collection rename, database version bump or namespace change is needed.
- Retain source/revision and proposed-mapping status in the default metadata's optional provenance, and display a readable mapping source. New accepted snapshots should preserve enough provenance to identify the mapping that was recorded. Do not insert snapshots into old historical records.
- Preview/report legacy current-mapping changes when a newly recognized name resolves an old inferred exercise. That can alter a report without changing stored workouts, so label it rather than presenting the revised interpretation as recorded fact.
- Avoid default instructional cues overwriting the persistent user cue field. The packet descriptions are identification copy, not personal cues or programming advice.

## Priority batch review table

All rows are proposals for root/product review. The band/hip gates in this historical first-batch table are now resolved technical adapter requirements, not failed source lookups or trainer approval.

| Name | Type | Primary | Secondary | Equipment | Gate |
| --- | --- | --- | --- | --- | --- |
| Bench Press (Dumbbell) | weight_reps | Chest | Shoulders, Triceps | Dumbbell | product focus review |
| Incline Bench Press (Barbell) | weight_reps | Chest | Shoulders, Triceps | Barbell | product focus review |
| Chest Press (Machine) | weight_reps | Chest | Shoulders, Triceps | Machine | product focus review |
| Incline Chest Press (Machine) | weight_reps | Chest | Shoulders, Triceps | Machine | product focus review |
| Chest Press (Cable) | weight_reps | Chest | Shoulders, Triceps | Cable | product focus review |
| Chest Fly (Dumbbell) | weight_reps | Chest | Not specified | Dumbbell | product focus review |
| Incline Chest Fly (Dumbbell) | weight_reps | Chest | Shoulders | Dumbbell | product focus review |
| Close-Grip Bench Press (Barbell) | weight_reps | Triceps | Chest, Shoulders | Barbell | product focus review |
| Chest-Supported T-Bar Row (Machine) | weight_reps | Upper Back | Biceps, Lats | Machine | product focus review |
| Chest-Supported Row (Dumbbell) | weight_reps | Upper Back | Biceps, Forearms, Lats, Shoulders | Dumbbell | product focus review |
| Single-Arm Seated Row (Cable) | weight_reps | Upper Back | Biceps, Lats | Cable | product focus review |
| Straight-Arm Pulldown (Cable) | weight_reps | Lats | Not specified | Cable | product focus review |
| Neutral-Grip Pulldown (Cable) | weight_reps | Lats | Biceps, Upper Back, Shoulders | Cable | product focus review |
| Back Extension (Bodyweight) | bodyweight | Lower Back | Glutes, Hamstrings | Bodyweight | product focus review |
| High Row (Machine) | weight_reps | Upper Back | Lats | Machine | product focus review |
| Rear Delt Fly (Machine) | weight_reps | Shoulders | Not specified | Machine | product focus review |
| Rear Delt Fly (Cable) | weight_reps | Shoulders | Not specified | Cable | product focus review |
| Seated Lateral Raise (Cable) | weight_reps | Shoulders | Upper Back | Cable | product focus review |
| Front Raise (Dumbbell) | weight_reps | Shoulders | Not specified | Dumbbell | product focus review |
| Shoulder Press (Machine) | weight_reps | Shoulders | Triceps | Machine | product focus review |
| Arnold Press (Dumbbell) | weight_reps | Shoulders | Triceps | Dumbbell | product focus review |
| Bicep Curl (Barbell) | weight_reps | Biceps | Forearms | Barbell | product focus review |
| Bicep Curl (EZ Bar) | weight_reps | Biceps | Not specified | Barbell | product focus review |
| Bicep Curl (Cable) | weight_reps | Biceps | Not specified | Cable | product focus review |
| Incline Curl (Dumbbell) | weight_reps | Biceps | Not specified | Dumbbell | product focus review |
| Concentration Curl (Dumbbell) | weight_reps | Biceps | Forearms | Dumbbell | product focus review |
| Overhead Triceps Extension (Cable) | weight_reps | Triceps | Not specified | Cable | product focus review |
| Triceps Extension (Machine) | weight_reps | Triceps | Not specified | Machine | product focus review |
| Triceps Kickback (Dumbbell) | weight_reps | Triceps | Not specified | Dumbbell | product focus review |
| Hack Squat (Machine) | weight_reps | Quads | Calves, Glutes, Hamstrings | Machine | product focus review |
| Squat (Smith Machine) | weight_reps | Quads | Calves, Glutes, Hamstrings, Lower Back | Machine | product focus review |
| Seated Leg Curl (Machine) | weight_reps | Hamstrings | Not specified | Machine | product focus review |
| Standing Leg Curl (Machine) | weight_reps | Hamstrings | Not specified | Machine | product focus review |
| Reverse Lunge (Dumbbell) | weight_reps | Quads | Calves, Glutes, Hamstrings | Dumbbell | product focus review |
| Step Up (Dumbbell) | weight_reps | Quads | Calves, Glutes, Hamstrings | Dumbbell | product focus review |
| Stiff-Legged Deadlift (Dumbbell) | weight_reps | Hamstrings | Glutes, Lower Back | Dumbbell | product focus review |
| Hip Adduction (Machine) | weight_reps | Adductors | Glutes, Hamstrings | Machine | root additive hip vocabulary |
| Hip Abduction (Machine) | weight_reps | Abductors | Glutes | Machine | root additive hip vocabulary |
| Seated Calf Raise (Machine) | weight_reps | Calves | Not specified | Machine | product focus review |
| Calf Press (Leg Press Machine) | weight_reps | Calves | Not specified | Machine | product focus review |
| Single-Leg Leg Extension (Machine) | weight_reps | Quads | Not specified | Machine | product focus review |
| Crunch (Machine) | weight_reps | Abs | Not specified | Machine | product focus review |
| Pallof Press (Cable) | weight_reps | Abs | Not specified | Cable | product focus review |
| Dead Bug | bodyweight | Abs | Not specified | Bodyweight | product focus review |
| Side Plank | duration | Abs | Shoulders | Bodyweight | product focus review |
| Assisted Dip | assisted_bw | Triceps | Chest, Shoulders | Machine | product focus review |
| Weighted Dip | weighted_bw | Triceps | Chest, Shoulders | Plate | product focus review |
| Assisted Chin Up | assisted_bw | Lats | Biceps, Forearms, Upper Back | Machine | product focus review |
| Weighted Chin Up | weighted_bw | Lats | Biceps, Forearms, Upper Back | Plate | product focus review |
| Pull Apart (Band) | bodyweight | Shoulders | Upper Back | Band | root reps-only adapter |
| Shoulder Press (Band) | bodyweight | Shoulders | Triceps | Band | root reps-only adapter |
| Seated Leg Curl (Band) | bodyweight | Hamstrings | Not specified | Band | root reps-only adapter |
| Chest Fly (Band) | bodyweight | Chest | Biceps, Shoulders | Band | root reps-only adapter |
| Overhead Triceps Extension (Band) | bodyweight | Triceps | Not specified | Band | root reps-only adapter |
| Hip Adduction (Band) | bodyweight | Adductors | Not specified | Band | root reps-only adapter; root additive hip vocabulary |
| Row (Suspension) | bodyweight | Upper Back | Biceps, Lats | Suspension | product focus review |
| Split Squat (Suspension) | bodyweight | Quads | Abductors, Adductors, Calves, Glutes, Hamstrings | Suspension | root additive hip vocabulary |
| Elliptical Trainer | distance_duration | Cardio | Not specified | Machine | product focus review |
| Stair Climber | duration | Cardio | Not specified | Machine | product focus review |
| Farmer's Carry (Kettlebell) | weight_duration | Forearms | Abs, Glutes, Hamstrings, Lower Back, Quads, Upper Back | Kettlebell | product focus review |

## Second batch now prepared — 84 additions toward 200 total

`catalog-candidates-batch2.json` adds **84 distinct proposed names** to the first 60, producing **144 candidate additions / 200 potential total names** with the existing 56. These are prepared curation proposals for root/product review, not a claim of trainer validation or 200 shipped exercises. Review the old 56 too; built-in status alone does not establish metadata quality. The 250 upper target remains optional and is not a quota.

The preliminary review budgets were adjusted after inspecting records: fewer extra machine entries and conditioning labels, more distinct cable/free-weight/trunk coverage. No extra grips or near-duplicate machine names were added merely to preserve the earlier budget. See [the second-batch review](CATALOG_BATCH2_REVIEW.md) for all 84 rows and exclusions.

| Coverage area | Prepared additions | Why it is useful |
| --- | ---: | --- |
| Machine/Smith variants | 12 | Fixed-bar presses/rows/hinges, decline press, independently moving row, reverse hyper, shrug, seated external-load dip press and lying squat apparatus. |
| Cable alternatives | 14 | Single-arm pulldown/high row/fly, preacher/hammer/overhead curls, lying triceps extension, front raise, shrug, pull-through, hip adduction/extension and trunk rotation. |
| Free-weight fundamentals | 20 | Floor/decline/single-arm/neutral presses, pullover, shrugs, good morning, sumo/trap-bar deadlifts, box/Zercher squat, triceps extensions, supported rear-delt fly and shoulder/upper-back work. |
| Lower-body unilateral/hinge | 12 | Barbell step-up/walking lunge, Smith split squat, kettlebell single-leg hinge, bridges, side-loaded squat, unloaded walking lunge, lateral split squat, Nordic-style knee flexion and free-weight calf work. |
| Trunk and grip | 10 | Rollout, reverse/decline crunch, side bend, wrist flexion/extension, reverse elbow curl, wrist roller and unloaded trunk rotation. |
| Bands and suspension | 8 | Suspension push-up/fallout/reverse crunch plus reps-only band good morning, lateral raise, calf raise, lying extension and hip extension. |
| Other bodyweight/assistance | 4 | Rep-only band-assisted pull-up, ring dip, added-load push-up and supported knee raise. |
| Conditioning | 4 | Recumbent bike, treadmill run/walk and a duration-only revolving step mill. No fabricated floors-to-km or calorie conversion. |

Both batches retain source raw metadata beside editorial choices. Per-entry conditional apparatus adaptations and source-empty roles remain disclosed. Root selected the technical band/hip vocabulary contract; source focus roles still require independent root/product review. No new media/service or paid dependency is introduced.

## Validation handoff

- Check exact metadata and alias search for all approved additions, including no source muscle silently lost through taxonomy normalization. Make the empty/unknown distinction visible.
- Fresh seed and populated synthetic backups; user overrides win; repeat upgrade does not duplicate names; all old names/IDs/units/cues remain. Source changes cannot rewrite recorded classification.
- Browse/search/filter/add/routine/swap paths offline, both themes and 375/390px, enlarged text and screen-reader names. Test empty/no-result filters, long names and source aliases.
- Verify band and assisted-bodyweight bases cannot enter comparable external-load E1RM accidentally; no automatic limb/implement/bodyweight conversion.
- Backups retain original photos/records and optional added metadata; no new remote media, API key, account or paid service. Runtime packaging and service-worker list stay deliberate.

## Checks actually performed here

Pinned source JSON contains 876 records; all 58 referenced source IDs and individual JSON paths exist at the pinned Git tree. The output has 60 unique new names, zero exact-name overlap with 56 current defaults, valid existing tracking/equipment enums, no primary duplicated in its secondary list, no duplicate secondary roles, and no image/instruction payload. The source primary/secondary fields are preserved to audit every editorial adjustment. Application code and tests were not changed or run by this preparation task; root's actual integration needs repository and browser validation.
