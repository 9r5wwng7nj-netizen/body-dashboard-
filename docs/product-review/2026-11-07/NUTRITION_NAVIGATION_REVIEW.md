# Nutrition, Meals and navigation review

November 7, 2026 · Approved direction, implementation pending · Current working tree reviewed · Synthetic examples only

**Recommendation:** use three bottom destinations—**Today, Train, Nutrition**—and put recipes, reusable meals and food management behind one Nutrition library. Replace the horizontal section-tab rows with task-focused landing screens and named detail destinations. Retire pantry inventory from the normal UI **and from hidden filtering behavior**, while retaining its records and backup compatibility. Owner amendment, November 7, 2026: remove Grocery and Freezer alongside Pantry from the active product, retaining all original records and backup compatibility.

This is a proposed amendment to the current PRD's “retain existing navigation” boundary, requested by the product owner in this review. The owner accepted the recommendations with the Grocery/Freezer amendment. Detailed implementation remains pending; this documentation update performs no application edits, data migration, commit or publication. Existing focused-workout behavior remains the baseline. The visual-design review owns final appearance; the training review owns exercise discovery, substitution and volume semantics.

## 1. Verified source findings

References are to `index.html` in the reviewed working tree; line numbers are a locator, with symbols as the stable reference.

| Finding | Evidence | Implication |
| --- | --- | --- |
| Nutrition currently has Daily log / Plan / Body & weight / Foods & meals. Plan combines target/check-in controls with dietary history; Body combines weight trend and measurements. | `renderNutrition`, lines 2148–2152; `nutFoods`, 2489 | Navigation mixes logging, settings and analysis. “Plan” is ambiguous beside the separate Meal plan. |
| Recipes & Meals has Recipe box / Meal plan / Grocery list / Pantry & freezer. | `renderRecipes`, 3588–3591 | Moving the entire current tab strip under Nutrition would preserve most of the clutter. |
| Three different reusable objects already exist: food definitions, saved meals (copied items or quick macros), and recipes with ingredients/instructions/photos. Consumption lives separately in dated `nutrition.entries`. | `COLLECTIONS`, 196–200; `saveFoodUse`, `mealItems`, `addEntries`, 2054–2077; `nutFoods`, 2489; `mealSaveTpl`, 2766; `docs/DATA_MODEL.md` | Consolidate access, not records or meanings. A recipe is not a logged meal, and a saved meal is not a recipe. |
| Recipe discovery displays fixed special filters plus arbitrary stored tags in one scrolling row. Recipe cards repeat up to three tags, ratings, “kids ate it,” and made recency. | `REC_SPECIAL`, `REC_SORT`, `recList`, 3594–3613 | The concern is confirmed presentation density. Useful Favorites and recency already exist; replacing every label with a new taxonomy would add work. |
| Tags have behavior: meal planner eligibility derives Breakfast/Lunch/Snack from tags; freezer-friendly filtering can derive from tags. | `mpwPool`, 3763–3767; `recSpecial`, 3596; `tests/meal-plan.spec.js`, “own recipes are used by their tags” | Removing tags from storage or parsing would alter planning results. Cosmetic removal needs legacy interpretation until explicit replacements exist. |
| Pantry matching includes both non-low inventory and `gkit.basics`, including default “always on hand” basics. | `gkit`, 3549; `pantryHas`, 3554–3557 | Hiding the inventory screen alone leaves unseen assumptions active. |
| Pantry affects ingredient availability badges, “What can I make?”, missing-ingredient grocery actions and plan-generated grocery omissions. Put away copies checked groceries into Pantry and removes them from the grocery list. | `recViewModal`, 3634/3647; `canMake`, 3559; `recPantry`, 3945; `groceryBuild`, 4149–4154; `grocPutAway`, 4161; `cmGroc`, 4183 | Pantry retirement requires a dependency change, not just removing a tab. |
| Current automatic meal-plan scoring uses estimated cost, favorites, repetition avoidance and time eligibility. It does **not** score pantry coverage. | `mpwPool`, `mpwGenerate`, 3763–3789 | Do not claim that an inventory-scoring engine exists or needs replacement. The actual pantry-driven recommendations are `canMake` and related presentation. |
| Freezer inventory is intertwined with the combined Pantry screen but also connects recipe cooking, meal-plan selections and portion decrements. | `cookFreeze`, 4095; `mealMade`, 4129–4133; `fzPlan`, `fzPlanSave`, 4181–4182; `recPlan`, 3873 | Retiring Pantry must not silently remove or decrement Freezer records. |
| Four unique destinations are required by `barViews()` and Settings saves. Recipe routes are used by dashboard dinner/grocery links and actions such as `goRecTab`. | `VIEWS`, 668–673; `barViews`, 697–701; `goRecTab`, 4059; `saveSettings`, near end of file; `tests/phone-first.spec.js` | Merely deleting Meals from the bar would fall back to the existing four destinations. Add a compatible presentation projection. |
| Hidden tabs/cards and ordering are stored preferences and participate in sync/backup handling. Full backups retain the pantry/freezer/gkit collections. | `SETTINGS_DEFAULT`, 155–168; `renderNow`, 741–746; `SYNC_SETTINGS`, 4359; `validateBackup`, `planBackupImport`, `buildBackupPayload`; `docs/DATA_MODEL.md` | No destructive navigation “migration,” collection deletion or DB version change is needed. |
| Logged entries copy nutrient values. However, editing an old food-linked entry selects the current mutable food definition; some recipe logging paths coerce missing macro fields to zero. | `logFoodAgain`, 2067; `addEntries`, 2073; `lfRecipe`, 2739; `entryEdit`, 2758; `recLog`, 4086 | A new unified library must preserve snapshots and unknown-versus-zero semantics. These are existing adjacent risks, not permission to rewrite nutrition calculation silently during a navigation release. |

No personal record database or backup was inspected. This review relies on application source, documented shapes and synthetic repository tests; it makes no claim of a hands-on physical-iPhone audit.

## 2. Accepted information architecture

Three bottom destinations: **Today / Train / Nutrition**. Remove scrolling secondary tab strips and use named detail pages with clear back navigation.

| Destination | Landing | Named pages/actions |
| --- | --- | --- |
| Today | Existing daily summary and chosen cards/order | Log food, Start/Resume, Log weight; existing relevant summary links |
| Train | Start/Resume, saved routines and New routine | History, Progress, Exercise library; routine detail/editor and Set coverage |
| Nutrition | Daily log with date, energy/macros and Log food | Visible Library action; Meal plan, Weight & measurements, Targets & check-ins |

Library combines searchable **Food / Saved meal / Recipe** results while keeping their distinct definitions, units and consumption snapshots. Meal plan retains planned slots, recipes, ordinary leftovers, prep instructions and explicit food logging. No Grocery, Pantry or Freezer section/action is moved into Library, Meal plan or another normal menu.

```text
NUTRITION                                      Library
Today                                      < date >
[ Energy remaining · P / C / F             Targets → ]
[ + Log food                                        ]
Breakfast / Lunch / Dinner / Snacks
  Entries, portions and edits
Meal plan                                         →
Weight & measurements                             →
Targets & check-ins                               →
-----------------------------------------------------
          Today          Train          Nutrition
```

```text
< Nutrition                 LIBRARY          + Create
[ Search foods, saved meals and recipes              ]
Favorites / Recent                    Filter (n)
Food        Greek yogurt     amount basis + nutrition
Saved meal  Breakfast bowl   portions + item summary
Recipe      Lentil skillet   per serving + instructions
Meal plan →
```

The active workout retains its focused header, explicit acceptance, Minimize/Resume and non-blocking timer. Nutrition browsing cannot finish or replace it.

## 3. Tag cleanup without losing facts

Use local search, Favorites and genuine recent/usual use instead of the chip wall. Cards show name, portion basis, known nutrition and at most one relevant contextual fact. Filters have visible predicates and Clear; unknown nutrition/time stays unknown.

- Reuse recipe `fav`/`made[]` and food use metadata. New food/saved-meal favorites or usage fields are optional; never invent past recency or equate made with consumed.
- Keep legacy tags searchable and portable. Treat them as optional detail metadata. Workout warm-up/drop/failure types and other training facts are outside this cleanup.
- Meal-occasion eligibility must keep its current Breakfast/Lunch/Snack tag fallback, or use an optional explicit Meal occasions control whose absence preserves legacy behavior.
- Preserve raw recipe `freezer` values and freezer-related tags in records/backups. Remove their active freezer filters, stock controls and planning affordances along with the retired feature; no replacement freezer taxonomy is needed.
- Avoid mandatory reclassification, AI-generated categories or another large row of filter chips.

## 4. Pantry, Grocery and Freezer retirement contract

The owner explicitly approved removal of **all three features**. This overrides the initial investigation's provisional recommendation to retain Grocery and Freezer. Preserve `pantry`, `grocery`, `freezer`, all `gkit` values and original `freezerId`/source/recipe references in loading, full backup import/export and restoration. Do not rename/delete collection keys or bump the database version.

Remove from active product behavior:

1. Inventory screens/editors, low-stock prompts, availability badges, pantry/basic ingredient coverage and “What can I make?” recommendations.
2. Grocery screens, build-from-plan and add-ingredients actions, check/clear/Put away flows, shopping quantities, store/aisle administration, budgeting/spend displays, staple scheduling and Apple Reminders/copy/export shopping actions.
3. Freezer screens, stock/portion allocation, freezing/use controls, freezer-friendly discovery filters, plan-from-freezer and automatic inventory decrements when cooking or marking a meal made.
4. Dashboard cards/quick links, old Help shortcuts, planner completion buttons and recipe tools that expose or execute any retired action. Preserve the ID/order/visibility of unaffected dashboard cards.
5. Any hidden inventory inference, background scheduling or automatic shopping writes. Do not merely conceal the screens while retaining their effects.

Retain independently:

- Recipes, instructions, locally stored photos, saved foods/meals, nutrition snapshots and explicit consumption logging.
- Meal planning, ordinary leftovers and cooking/prep checklists without stock accounting or grocery generation. Do not assume the meal planner's existing cost/favorite/time/repetition logic is pantry scoring.
- Original legacy plan items with `freezerId`. Display an intelligible existing meal title using retained references/read-only data when necessary; never silently consume stock or convert the historical item into a newly logged meal. If required metadata is unavailable, show a truthful legacy-item explanation.
- Full backup round trips of all retired records and references. Restoring a backup does not reactivate retired features or sync. A retained-data explanation under Settings may confirm preservation/export availability without recreating an inventory/shopping workflow.

## 5. Route and preference compatibility

- Project existing `S.bar` into Today/Train/Nutrition: dashboard→Today, fitness→Train, nutrition/recipes→Nutrition, then stable-deduplicate. Do not overwrite the legacy four-entry preference. Optional new ordering may take precedence compatibly.
- Old recipes routes resolve to the typed Library; recipe Plan resolves to Meal plan. Old Grocery/Pantry/Freezer routes show a clear retired-feature notice and return to Nutrition/Meal plan, with no inventory action or blank page.
- Old Nutrition today→Daily log, foods→Library, plan/history→Targets & check-ins/Logging history, trend/body→Weight & measurements. Preserve Train's old History/Stats/Routines/Exercises/Progress aliases.
- Resolve dinner links, recipe links, imported plan references, `goRecTab`, quick recipe saving, old release shortcuts and return paths explicitly. Suppress retired actions rather than translating them into a different side effect.
- Keep legacy `hiddenTabs`, `hiddenCards`, `cardOrder` and `tabsV`. Do not reinterpret a hidden subpage as hiding an entire root or reset preferences. Retired-feature records/preferences remain portable, not active.

## 6. Delivery gates

| Phase | Scope | Exit gate |
| --- | --- | --- |
| UX/domain detail | Specify accepted three-root/Library design and full retirement dependency map | All required actions remain discoverable; no retired action relocated to another normal menu |
| Navigation/library | Compatible root projection, route aliases, existing log/portion/recipe flows | No empty legacy routes, lost drafts, changed nutrition snapshots or preference resets |
| Retirement | Remove UI and all inventory/shopping effects while preserving stored collections | Restored nonempty legacy data stays unchanged during ordinary planning/cooking/logging |
| Retrieval | Search/Favorites/Filter sheet; optional meal occasions with fallback | Planning eligibility is preserved until explicit edits; no invented recency/zero nutrients |
| Validation | Repository checks, fresh Chromium/WebKit and real iPhone checks | Offline, imports, photo restoration, recovery and accessibility remain sound |

This remains a plan. It adds no new food provider, nutrition algorithm, sync service, native engine or automatic program generator.

## 7. Acceptance scenarios

Use synthetic records and fresh browser profiles. Interaction targets remain unmeasured proposals.

1. **Discovery:** Library is one named action from Nutrition; recipes can be found without tags or scrolling navigation. Log food stays prominent at 390px.
2. **Separate meanings:** planning a recipe, marking it made and logging a portion remain distinct, with correct IDs/values and no inventory/shopping writes.
3. **Snapshots:** change a food/recipe definition after consumption, then edit an older entry's quantity. Its snapshot basis stays explicit; past intake does not silently switch to the current definition. Unknown nutrients remain unknown.
4. **Legacy tags:** Breakfast tags retain future planning eligibility through fallback. Freezer-related metadata round-trips unchanged but exposes no active freezer filter/control.
5. **All three retired:** restore populated pantry, grocery, freezer and gkit/basics/staples/spend records. Browse all roots, recipe details, meal planner, cooking/prep and Settings. No retired section, grocery generation/export/Reminders action, stock edit or hidden scheduled mutation is reachable.
6. **Legacy freezer plan:** an existing `freezerId` item remains intelligible and its references remain intact. Viewing or marking made never decrements stock; explicit nutrition logging creates only the requested consumption entry.
7. **Data round trip:** before/after normal use and full backup restoration, all retired collection records, IDs, quantities, metadata and references match exactly. No Life Dashboard storage is written.
8. **Compatibility:** old routes, four-root order permutations, hidden defaults/cards and Help shortcuts resolve usefully. Retired routes show a notice; they never recreate a section or reset records.
9. **Active session:** minimize, browse Library/Meal plan, resume and reopen offline. Accepted sets, drafts, IDs and owned rest deadlines persist without timer overlap.
10. **Accessibility/offline:** 390/375px, light/dark, enlarged text, keyboard/VoiceOver; saved food/meal/recipe lookup, portions and local photos work offline after preparation. Physical device findings remain separate from automation.

## 8. Decisions recorded

The owner accepted the recommended three roots, unified typed Library, recipe-tag cleanup and recommended visual direction. Grocery and Freezer join Pantry in the removal scope. Meal planning and recipes remain. No further Grocery/Freezer retention decision is open; implementation detail and validation remain to be completed.

## Handoff

Use FEATURE_REVIEW_PLAN.md as the approved product direction. Build compatible navigation/resolver and preservation tests before changing menus. Retire all three features from UI and active behavior, retaining complete backup compatibility. Reuse existing portions, cooking, photos and import flows with the scoped snapshot safeguards. Do not implement or publish from this documentation update alone.
