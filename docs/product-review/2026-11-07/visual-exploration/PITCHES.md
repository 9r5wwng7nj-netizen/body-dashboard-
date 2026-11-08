# Five new visual directions for Body Dashboard

Design exploration, November 7, 2026. **Later decision: Cobalt Air selected; implementation, checks and publication explicitly authorized. See [the Cobalt Air release record](../COBALT_AIR_RELEASE.md).**

The following records the original exploration before selection. Prepared by three specialist design agents and the product/technical lead. All examples are synthetic. The production app and its records are unchanged; nothing was published.

Open **FIVE_DESIGNS.html** locally. Choose a direction and Today / Active workout / Nutrition. Light and dark previews appear together. At phone width the two previews stack. Only these preview choices and temporary field edits work; logging buttons do not execute app commands or save data. Overview screens scroll above their bottom navigation.

## Recommendation

**Cobalt Air** is the strongest everyday choice: crisp, friendly and easy to apply consistently. **Lilac Studio** is the strongest alternative if personality and softer grouping matter more. Carbon offers the most restrained gym-focused look. Select one coherent light/dark pair before any implementation. Mixing a layout from one with another palette is possible, but should receive a fresh consistency review.

## Five pitches

### 1. Cobalt Air

**Fresh. Clear. Confident.** Bright neutral surfaces and decisive blue. The clearest everyday direction, with a precise gym mode.

Tradeoff: Familiar and easy to read; less distinctive than the other directions.

[Workout: light + dark](images/01-cobalt-workout.png) · [Nutrition: light + dark](images/01-cobalt-nutrition.png) · [Today: light + dark](images/01-cobalt-today.png)

### 2. Carbon

**The training notebook.** Graphite, white and a tiny citrine signature. Flat, disciplined and almost entirely free of color noise.

Tradeoff: The strongest gym character, but the least soft or welcoming.

[Workout: light + dark](images/02-carbon-workout.png) · [Nutrition: light + dark](images/02-carbon-nutrition.png) · [Today: light + dark](images/02-carbon-today.png)

### 3. Coral Paper

**A warmer kind of progress.** Clean paper, graphite and restrained coral. An editorial journal with useful numbers, rather than a wall of cards.

Tradeoff: Expressive and personal; coral needs careful separation from error messaging.

[Workout: light + dark](images/03-coral-workout.png) · [Nutrition: light + dark](images/03-coral-nutrition.png) · [Today: light + dark](images/03-coral-today.png)

### 4. Lilac Studio

**Calm focus. Modern energy.** Cool white, soft lilac and indigo. Friendlier grouped summaries with a crisp, practical workout matrix.

Tradeoff: The most approachable; too many rounded panels would dilute its training focus.

[Workout: light + dark](images/04-lilac-workout.png) · [Nutrition: light + dark](images/04-lilac-nutrition.png) · [Today: light + dark](images/04-lilac-today.png)

### 5. Atlantic

**A quiet performance instrument.** Petrol blue, clean white and ink navy. Compact horizontal readouts make daily numbers easy to scan.

Tradeoff: Precise and calm, though more technical than playful.

[Workout: light + dark](images/05-atlantic-workout.png) · [Nutrition: light + dark](images/05-atlantic-nutrition.png) · [Today: light + dark](images/05-atlantic-today.png)

## Shared product constraints

All five retain Today / Train / Nutrition, no sidebar or inventory features, explicit draft versus saved states, dated Previous values, 44px controls and full-width set logging. They introduce no new feature, database, backend, image service or account requirement. The currently published app retains all behavior until a design is selected and implementation is separately requested.

These are layout and color proposals, not pixel-final specifications. Workout compositions reserve space outside the matrix for the timer; actual application implementation must retain timer collapse, keyboard avoidance, safe areas, enlarged-text detail rows, failed/pending/retry states and every existing command/persistence guarantee. Accent never means medical readiness or optimal volume. Unknown nutrient examples remain distinguishable from zero. The weight graph is a schematic synthetic illustration, not a validation of smoothing behavior.

## Verification actually performed

- Fifteen PNG boards: five directions × three screens × two appearances = **30 screen examples**.
- Native HTML/CSS/inline SVG rendered with Playwright Chromium in an isolated preview session, with 390×844 reference frames. No production app or personal browser profile was opened.
- All 30 frames: no horizontal overflow; all preview button hit boxes at least 44×44; workout matrices clear of the timer; automated WCAG A/AA tagged axe scans reported zero violations for the composed preview pages.
- Scrolled Today/Nutrition to their ends in all ten mode pairs: final content clears bottom navigation. The outer comparison board fits a 390px browser width without horizontal overflow.
- All 70 specified semantic token pairs meet their chosen text/control contrast thresholds; see TOKEN_CONTRAST.json. Decorative separators are not substitutes for necessary input boundaries. Focus inside each phone uses its own accent.
- Designers visually inspected all five workout pairs and selected Today/Nutrition boards for hierarchy, identity, readable text and unintended overlap.
- Repository `npm run check` passed. Application runtime files, CSS, storage and deployment branches were unchanged. No application regression suite was rerun for isolated proposal artifacts.

These results do not certify production accessibility, physical iPhone safe areas/keyboard/VoiceOver, enlarged text or actual logging usability. Those checks belong to implementation of the selected design. No measured speed or tap-count improvement is claimed.

## Files

- FIVE_DESIGNS.html — self-contained interactive comparison; no external assets, storage APIs or network requests.
- images/ — fifteen paired PNG boards.
- palettes.json — proposed semantic light/dark color tokens, not app settings.
- TOKEN_CONTRAST.json — local token calculations.
- PREVIEW_QA.json — actual preview layout/accessibility/scroll results.
