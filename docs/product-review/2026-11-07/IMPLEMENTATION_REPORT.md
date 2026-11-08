# Approved feature implementation — Warm Mineral

November 7, 2026 · User authorized implementation, checks and publication.

## Delivered behavior

- Shared local exercise picker: browse, token/alias search, muscle/equipment filtering, recent context, ordered multi-select, typed custom creation, preserved parent drafts and accessible detail controls. No new remote catalog or image service.
- Session-only swaps: accepted exercise/set identities and original observations remain attached to original work. Replacement rows are unchecked and obtain their own comparable history. Raw prior drafts/units stay in private recovery metadata. The command uses the existing coordinated intent/receipt writer and revision checks. Retry/reload cannot add a duplicate replacement. Undo uses an after digest and refuses to erase later work.
- Repeated historical blocks all participate in compatible queries. Previous uses routine-slot lineage when available, otherwise latest compatible dated session and its last stored matching block. Stored order is not presented as a fabricated observation timestamp. New accepted blocks carry optional classification snapshots; legacy current-mapping fallback is labeled.
- Routine coverage: primary sets, secondary exposures, contributor lists, optional credited estimate and explicit repeats/week. Missing/noninteger/negative prescriptions are invalid, zero remains zero, and an all-zero routine cannot start. Timed/conditioning work and inferred/unmapped metadata are disclosed. No optimal-dose, injury/readiness or balanced-routine diagnosis.
- Today / Train / Nutrition project legacy navigation without replacing `S.bar` or hidden/card preferences. Named pages replace scrolling subnav rows; old recipes/Body/Plan links resolve compatibly. Train leads with starting/routines; totals are expandable.
- Nutrition Library unifies access to distinct foods, saved meals and recipes, including local photos, favorites, search/filter, definition editing and explicit portion logging. Editing old food-linked quantities scales their original snapshot rather than today's mutable food definition. Unknown nutrients stay unknown.
- Pantry, Grocery and Freezer UI, delegated actions and automatic effects are retired. Cooking/meal-made/generator paths do not update inventory or generate shopping lists. Original collections, quantities, IDs, metadata and freezer-linked plan references round-trip through full backups. Recipes, ordinary leftovers, meal planning, explicit consumption and photos remain.
- Warm Mineral semantic light/dark colors, native fonts, 44px controls, larger-text detail rows and reflow. A Safari inherited-color issue on live theme changes is covered by a dedicated regression; section markup refreshes after theme paint. Button foreground/background change together without a contrast dip during color interpolation. Native photo selection is bounded inside narrow forms, including Linux WebKit’s wider intrinsic file control.

## Storage and privacy

IndexedDB remains `body-dashboard` version 1 with `kv`, `photos` and `local`. All original collections and canonical kg/km/seconds conventions remain. Additions are optional classification/slot/swap/favorite/navigation metadata plus new allowed receipt purposes in the existing versioned backup extension. Sync stays off. No health records, credentials or personal reference screenshots were inspected or added to source/builds. Tests use synthetic content and fresh profiles.

## Verification record

Final local `npm test -- --workers=2`: **170 passed (43.6s)**, including CSS/static checks. Final local `npm run test:webkit`: **63 passed (44.9s)**. Exact source/CI/deployment and live verification are recorded after release gates finish; see `docs/BETA_RELEASE.md` for the final release identity. Independent specialist runs already checked training recovery and classification, nutrition/snapshot behavior, preserved retired records and all named-page accessibility. Those targeted checks do not substitute for the final complete suites.

## Intentional limits

- A partial-completion swap inside a superset places replacement work after the original group; joining a new cycle is deliberate.
- Undo does not delete later edits/accepted replacement work; another swap preserves the accumulated actual work instead.
- Legacy classification/load basis may be unavailable; current-mapping fallback remains labeled, never retroactively invented.
- The library is the offline built-in/custom/imported catalog, not an exhaustive anatomical or licensed image database.
- Unsaved routine editing remains transient until Save; an explicit custom definition can be saved independently. If all storage writes fail, the newest unacknowledged text requires keeping the tab open or exporting recovery data.
- Physical iPhone Safari/Home Screen/VoiceOver, actual keyboard/safe-area behavior and gym comfort still require device testing. Engine automation is not physical-device acceptance.
- The final WebKit probe finished a 100,000-set synthetic history in about 568ms; its sampled complete/amend p95 was 37ms. These are desktop engine probes, not physical iPhone timings; no 150ms finish guarantee is made.
