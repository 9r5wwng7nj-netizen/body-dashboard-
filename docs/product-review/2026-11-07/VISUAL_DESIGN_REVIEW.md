# Visual design review — Body Dashboard

November 7, 2026 · Planning only · Synthetic examples · Application and beta unchanged.

## Recommendation

Use the accepted **Warm Mineral** direction: warm off-white, forest ink, restrained sage actions and a neutral forest-charcoal dark mode. Pair it with a clearer information hierarchy and fewer persistent controls. A palette change by itself will not solve navigation or density. The owner subsequently accepted all recommendations except provisional Grocery/Freezer retention, so Warm Mineral is the accepted direction; detailed layouts still require specification and validation.

The companion [design board](DESIGN_DIRECTIONS.html) compares three directions, six selected entry paths, light/dark appearances and a 200% phone-text/detail-row preview. It is a standalone local concept; it has no persistence, remote assets, food services or real records. Controls change synthetic examples only. Do not put it in the allowlisted Pages package without a separate publication decision.

## Verified current source

| Evidence | Finding | Implication (design interpretation) |
| --- | --- | --- |
| `src/app.css:24–35` | A teal brand ramp and system/Inter fallback font are defined. | Keep native font delivery, but choose a deliberate tonal system beyond an accent swap. |
| `src/app.css:39–50` | White/slate cards, borders, shadows, pills, input borders and rounded tabs provide most component styling. | Similar emphasis across many surfaces makes overview pages busier than the focused workout. |
| `src/app.css:166–225` | The focused workout already removes card frames, uses flat exercise sections and hides bottom navigation; later overrides repeat some selectors. | Retain this useful behavior; move future colors into semantic tokens rather than accumulating competing color overrides. This is a styling cleanup, not an application refactor. |
| `index.html:668–673` | Four roots still include a separate Recipes & Meals destination. | The requested consolidation permits a proposed three-root model; preserve stored route/preference compatibility in implementation. |
| `index.html:1292–1301`, `2148–2151`, `3588–3591` | Workouts, Nutrition and Recipes each render secondary tab rows with multiple destinations. | Replace permanent rows with task-focused landing pages and named push screens; avoid recreating all tabs in an unlabeled More sheet. |
| `docs/FOCUSED_INTERFACE.md` | Active focus, explicit acceptance, Minimize/Resume and recoverable local saving are intentional. | They remain requirements; visual polish must not hide draft/save/error distinctions. |
| `MASTER_PRD.md`, `WEB_FIRST_PLAN.md` | Web-first, offline, current nested records/backups, no compulsory services; native platform instructions are deferred. | No font service, image service, framework migration or new account dependency is needed for this design. |

These are code/document observations, not a measured usability study or a claim about the product owner's personal records.

## Three directions

| Direction | Character and surface strategy | Dark mode | Tradeoff |
| --- | --- | --- | --- |
| **Warm Mineral — recommended** | Warm off-white canvas, white content surfaces, soft mineral grouping, forest actions. Gentle on overview screens; flat and precise during logging. | Neutral forest-charcoal, lifted dark surfaces and pale sage actions. | Strongest move away from the current clinical cool slate. Keep green tied to action/selection, never implied health/readiness. |
| **Clear Coast** | Airy blue-grey canvas, clean white surfaces, marine actions and crisp type. | Deep navy-charcoal with airy blue actions and clear edges. | Familiar to a precision training tool; least risk, but may feel too close to today's cool appearance. |
| **Clay Studio** | Cream canvas, warm graphite text, restrained terracotta actions; slightly more tactile and expressive. | Warm brown-black, cocoa surfaces, pale clay actions. | Most distinctive and approachable. Clay must not double as the warning/fatigue color; avoid an overly decorative wellness aesthetic. |

Warm Mineral is the accepted production direction; the board retains alternatives for comparison. Shipping three selectable brand palettes is not part of this proposal. Existing light/dark/system behavior remains.

## Semantic tokens and computed contrast

All values below are proposed opaque sRGB tokens. Canvas is the page, surface is a content panel/input fill, soft groups related overview content, control is a necessary field edge, and line is a decorative separator. Accent is action/selection/link/focus; on-accent is its label. Decorative lines are intentionally quieter than control boundaries.

| Direction / mode | Canvas | Surface | Soft | Main text | Secondary text | Accent | On accent | Control edge | Decorative line |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Warm Mineral / light | `#F5F3EE` | `#FFFFFF` | `#E9ECE4` | `#222C28` | `#53635B` | `#315C4B` | `#FFFFFF` | `#7D8C80` | `#D9DFD8` |
| Warm Mineral / dark | `#141C18` | `#1D2822` | `#29382F` | `#F2F4EE` | `#AFBDB1` | `#A7C9B0` | `#17251C` | `#778B7C` | `#3D4E43` |
| Clear Coast / light | `#F1F5F7` | `#FFFFFF` | `#E4EDF2` | `#202E39` | `#506575` | `#285E78` | `#FFFFFF` | `#7A909D` | `#D6E0E7` |
| Clear Coast / dark | `#111C24` | `#1B2A35` | `#293D4B` | `#EEF4F7` | `#AFC1CF` | `#9DCCE3` | `#142C39` | `#7392A4` | `#3A5263` |
| Clay Studio / light | `#FAF2EC` | `#FFFCF8` | `#F0E2D9` | `#382A28` | `#735A50` | `#874C3E` | `#FFFFFF` | `#A37E70` | `#E4D3C9` |
| Clay Studio / dark | `#241A18` | `#312421` | `#43322B` | `#FBF0E9` | `#D0B5A7` | `#EAB49F` | `#3B231E` | `#A78372` | `#60473C` |

Calculated from `(Llighter + .05) / (Ldarker + .05)`, with the WCAG sRGB transfer function and relative luminance coefficients 0.2126 / 0.7152 / 0.0722. Pass/fail uses unrounded values; displayed values are rounded to two decimals.

| Direction / mode | Text / canvas | Secondary / surface | Secondary / soft | Accent text / canvas | Action label / fill | Edge / surface | Edge / canvas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Warm Mineral / light | 12.98:1 | 6.36:1 | 5.32:1 | 6.85:1 | 7.60:1 | 3.54:1 | 3.19:1 |
| Warm Mineral / dark | 15.67:1 | 7.79:1 | 6.31:1 | 9.61:1 | 8.82:1 | 4.18:1 | 4.77:1 |
| Clear Coast / light | 12.67:1 | 6.07:1 | 5.11:1 | 6.46:1 | 7.09:1 | 3.33:1 | 3.04:1 |
| Clear Coast / dark | 15.57:1 | 7.94:1 | 6.09:1 | 10.02:1 | 8.41:1 | 4.46:1 | 5.25:1 |
| Clay Studio / light | 12.40:1 | 6.21:1 | 5.01:1 | 6.06:1 | 6.70:1 | 3.55:1 | 3.29:1 |
| Clay Studio / dark | 15.16:1 | 7.72:1 | 6.27:1 | 9.33:1 | 7.98:1 | 4.37:1 | 4.96:1 |

All proposed pairs in this table meet the stated text/edge thresholds. This establishes token-pair contrast only; it does **not** certify component states, opacity, browser painting, photographs or the finished application. Implementation must also check hover, focus, keyboard selection, disabled states and colors over every actual background. The focus ring uses accent with a 3px offset so its adjacent surface remains clear.

Authoritative criteria checked November 7, 2026: [W3C normal text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), and [W3C text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). Target at least 4.5:1 for normal text, at least 3:1 for essential control/state cues and usable text enlargement to 200%. The repository's 44px controls are a retained product requirement, not a claim that WCAG requires that exact size in every case.

## Layout and interaction recommendations

1. **Three roots: Today, Train, Nutrition.** Preserve the no-drawer model. Meals belongs inside Nutrition. Existing saved route/order preferences need an explicit mapping rather than deletion or resetting. The owner accepted these root labels and the overall direction.
2. **No horizontal subnav strip.** Train lands on start/resume, routines and recent activity, with named routes for History, Exercises and Progress. Nutrition lands on Daily log with a clear Library action and named Meal plan, Weight & measurements, and Targets & check-ins routes. A normal back action/title identifies deeper screens. Avoid squeezing three labels into every page or hiding essential destinations behind generic More menus.
3. **Two surface styles, one system.** Today/routine/nutrition overviews can use one or two softly grouped surfaces. Active workout logging remains flat, with clear exercise separation and real input boundaries. Do not nest a card inside another card for every number. Use a 4/8/12/16/24/32px spacing scale; 16–20px phone gutters, 24px between sections, 8px between distinct controls. Decorative separators do not have to resemble controls.
4. **Type and numerals.** Use the existing native system stack; no remote font. Proposed page title 28px/32px at ordinary text, section title 20px/26px, body 16px/23px, secondary 13–14px/18px and numeric entries 18–20px with tabular numerals. Keep input text at least 16px on iPhone. Use uppercase only for occasional small category labels, not every metric. Final sizes must be tested, not copied mechanically into the dense table.
5. **Set matrix.** Keep explicit acceptance, unknown-vs-zero and dated prior context. At 390px, reserve 44px each for numbered options and acceptance; allow previous values to wrap and allocate remaining width to load/reps. Place the source date once per exercise/comparison group, with full accessible labels. Test long loads and all tracking types. If the matrix cannot fit, switch to labeled row details rather than shrinking everything.
6. **Enlarged text.** At 200%, stack load/reps and labeled actions within one row card; let titles/actions wrap and move the Finish action to its own header row if needed. Bottom destinations may stack/reflow without truncating their names. Extra scrolling is preferable to hidden fields. VoiceOver order should be exercise → set/type → previous → field label/value → acceptance → status.
7. **State semantics.** Accent means a choice/action, not a health score. Draft = explicit text, Saving = pending, Saved on device = durable receipt, Failed = retained entry plus Retry. Ready offline describes shell readiness only. Use error/caution text and icons separately from the brand color; no red muscle gaps, green optimal-dose bars, injury diagnosis or readiness gauge. Planned-volume displays need units/method and unknown coverage, not a balanced/unbalanced verdict.
8. **Food library.** Favor useful names, recent/favorite access, portions and per-serving nutrition. Photos can add warmth when already stored, but cannot be the only way to recognize/open a recipe. Missing/broken/offline photos need useful text. Do not reintroduce a decorative tag wall as a substitute for search or clear library sections.

## Handoff and bounded implementation

- **First: finalize the accepted direction.** Warm Mineral and Today/Train/Nutrition are accepted. Specify their detailed layouts and old-route/preference compatibility before app changes. The owner also approved retiring Pantry, Grocery and Freezer UI and behavior while retaining records. The active-session focus behavior remains.
- **Then: token and component foundation.** Map the chosen semantic colors onto existing `card`, `btn`, `input`, `muted`, `chip`, status and focus patterns. Use one source of truth for light/dark surfaces; remove replaced color overrides only after regression evidence. No stored-data additions are required for this step.
- **Then: apply to the agreed flows.** Exercise browser/swap and routine-volume views should use the training review's contracts; nutrition/library/mealplan pages use the nutrition/navigation review. Do not build a complete new shell independently in parallel.
- **Accept only after:** all existing save/import/photo/offline tests still pass; 390px and selected smallest-device layouts work; all seven training types work; no control or keyboard/timer overlap; 200% text has no lost action/content; no color-only states; VoiceOver and physical Safari/Home Screen checks are recorded. A palette token calculation is not a substitute for these tests.

## Actual artifact validation

These are concept-artifact checks only, not new application test results.

- Used a fresh Playwright CLI browser session against a temporary localhost server containing only review artifacts. No existing app/browser profile or health records were used. No remote assets or storage APIs are in the board.
- Checked **72 states at a 390px viewport**: 3 palettes × 2 appearances × 6 screens × 2 text sizes. Both the document and mock phone had no horizontal overflow. Enlarged mode doubles the mock phone's base text from 16px to 32px and uses labeled row details.
- Inspected screenshots at **1180px** (overview/comparison), **390px dark** (focused session), and **390px enlarged dark** (row fallback). Wide document scroll width was exactly 1180px. Screenshots are ignored local artifacts in `output/playwright/design-review-wide.png`, `design-review-390-dark.png` and `design-review-390-large.png`.
- Verified palette/theme/screen/text-size controls; Start training routes to the active preview; accepting two example sets and undoing one changes the synthetic preview count from 2 to 1.
- Verified metadata search: query `cable` returns only the synthetic Lat pulldown row. A browser check caught that authored flex layout initially overrode the hidden attribute; the board now explicitly hides filtered rows.
- Nutrition visibly names Library, Meal plan, Weight & measurements and Targets & check-ins. Unbuilt detail-route buttons explicitly report that the named detail screen is not included; none navigates to an unrelated root. Verified the Meal plan disclosure and separately checked Weight & measurements.
- Computed the semantic token pairs shown above with the WCAG sRGB formula. Every tested normal-text pair is ≥4.5:1 and every tested control-edge pair is ≥3:1 using unrounded values. An initial Warm Mineral edge was 2.985:1 against the canvas; it was darkened to the current `#7D8C80` before validation.
- After adding a local empty favicon declaration, the browser console reported no errors or warnings. The initial server favicon 404 was a preview-only resource request, not an application failure.

**Remaining limitations:** this does not validate physical iPhone safe areas, native keyboards, Home Screen lifecycle, VoiceOver, human gym readability, full-route usability or production component contrast/state behavior. The board illustrates selected entry paths and visual hierarchy, not the completed feature implementation. Warm Mineral and the three root labels were subsequently accepted; detailed interaction/layout decisions and physical-device validation remain open. No application code, application test, runtime dependency, storage shape, commit or deployment was changed by this design review.
