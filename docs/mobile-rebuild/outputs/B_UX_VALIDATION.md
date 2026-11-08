# Agent B UX validation record

> Historical validation evidence: these are static native-concept wireframes, not proof of the current web app on iPhone. See [the active web plan](../WEB_FIRST_PLAN.md).

November 7, 2026. Scope: [UX specification](B_UX_SPEC.md) and [static wireframe board](B_UX_WIREFRAMES.html). Synthetic examples only. This is planning-stage verification, not acceptance of a native application.

## Actual checks

| Check | Method | Actual result |
| --- | --- | --- |
| Required source context | Read repository `AGENTS.md`, rebuild README, source audit, master PRD and Agent A output, including current uncommitted context | Existing app/history boundaries retained; departures and new policy defaults are explicitly proposed in the spec. |
| Phone geometry | Fresh isolated Playwright CLI browser, Chromium 156.0.8078.80; localhost serves the static board | Eight frames checked at 390×844 and 375×844 CSS-pixel viewports, light/dark and default/200% design text variants: eight combinations, 64 frame inspections. No document/frame horizontal overflow. |
| Control dimensions | DOM bounding boxes of all illustrated frame buttons, inputs and select | 80 controls per combination; all at least 44×44 CSS pixels. No control had horizontal content clipping in these examples. This is geometric evidence, not native hit-testing. |
| Matrix budget | Computed layout measurements | At 390/default: columns 44/88/80/64/50px with four 8px gaps fit 358px. At 375/default: alternate stacked row. At enlarged text: single-column fields and full-width completion action. |
| Browser keyboard reachability | Sequential Tab through the static document at 390/light/default | 82 focus steps, including 80 steps inside frames; no unexpected body focus during that traversal. This does not test action execution, native focus restoration, VoiceOver or Switch Control. |
| Automated accessibility | Installed axe-core 4.14.0; WCAG 2 A/AA and 2.1 AA tags at 390px, both themes/text variants | Zero reported violations in all four runs. Contrast remained incomplete for nine glyph/SVG nodes at default and four glyph nodes at enlarged text. Not an accessibility certification. |
| Contrast | sRGB relative-luminance calculation for explicit token pairs | Results below; essential text pairs exceed 4.5:1 and input boundaries exceed 3:1 on the stated Surface. Glyph/SVG colors were also reviewed against their explicit surfaces; native rendering still needs testing. |
| Visual review | Inspected training light/default, training dark/enlarged, diet and import captures | Values, state labels, source context, macro totals and reconciled import numbers remain readable. Large text trades simultaneous density for vertical scrolling. |
| Repository static check | `npm run check` | Passed: two inline scripts parse; 305 top-level functions without duplicates; action handlers/collisions, local runtime dependencies and 51 numeric keypads pass. This check validates the existing web application, not a native build. |
| Whitespace and references | `git diff --check`; check relative links in the two B Markdown documents and the board | Passed. Existing unrelated worktree edits were preserved. |

An initial automated pass caught a dark-theme error-color override missing from the board and two labeled generic containers without group roles. Those were corrected before the final runs. The remaining automated contrast incompletes concern non-text checkbox/keypad glyphs and SVG text where axe could not infer the background; explicit color calculations and visual inspection supplement them.

## Calculated token contrast

| Foreground / background | Light | Dark |
| --- | --- | --- |
| Primary text / Surface | 15.01:1 | 14.70:1 |
| Secondary text / Surface | 6.64:1 | 8.66:1 |
| Primary action text / action fill | 6.29:1 | 10.36:1 |
| Input boundary / Surface | 3.55:1 | 4.00:1 |
| Error text / Surface | 6.50:1 | 9.64:1 |
| Caution text / Surface | 6.80:1 | 10.29:1 |
| Error text / Raised surface | 5.84:1 | 8.24:1 |

These are exact opaque color-pair calculations rounded to two decimals. They do not cover every selected/disabled/translucent state or certify charts. The specification supplies full token hex values. Source guidance reviewed November 7, 2026: [Apple minimum touch targets](https://developer.apple.com/design/tips/), [React Native TextInput](https://reactnative.dev/docs/textinput), [accessibility](https://reactnative.dev/docs/accessibility), [AppState](https://reactnative.dev/docs/appstate) and [InputAccessoryView status](https://reactnative.dev/docs/inputaccessoryview). Native API claims must be rechecked against Agent C's pinned SDK versions.

## Reproducible local artifacts

The board is self-contained HTML/CSS with no external assets, application JavaScript, storage access or network calls. Open it locally, or serve its directory with a local static server. The QA runner changes only the document's `data-theme` and `data-text` attributes, measures geometry and injects the installed axe script for testing. The 200% variant is an intentional layout stress case; it does not emulate iOS Dynamic Type categories.

Ignored local artifacts in `output/playwright/`:

- `ux-b-check.cli.js`: Playwright CLI verification function, callable with `run-code --filename` in an isolated session on the served board.
- `ux-b-final-results.json`: browser version, eight layout runs, four axe summaries and keyboard traversal result.
- `ux-b-training-{light,dark}-{default,large}-390.png`: four training captures.
- `ux-b-diet-light-390.png`, `ux-b-import-light-390.png`, `ux-b-progress-light-390.png`: supporting captures.

These ignored screenshots/results are local review evidence; the repository Markdown and HTML retain the specification and summarized findings without relying on them. No personal browser profile, health record, backup or credential was used. No runtime dependencies were added.

## Native acceptance still required

All task tap/time/latency targets in the specification are **proposed and unmeasured**. Static illustrations do not execute logging, timers, undo or import. No usability trial with Seth or installed competitor app was performed during Agent B.

Agent C/D must still verify real safe-area/keyboard avoidance, decimal locale entry, selection/caret behavior, actual Dynamic Type categories, VoiceOver announcements and focus order, Switch Control/external keyboard, minimum supported iPhone/iOS, deadline restoration, notification denial, restart recovery, low-storage failure, double-tap idempotence, import staging/retry and native backup restoration. Native offline cold launch and acknowledged-data durability were specified but not exercised. The board is self-contained; that is not evidence for native offline persistence.

The native database/Expo compatibility check and scoped domain contracts remain Agent C work. Product-owner decisions still include food-provider timing, compact default versus comfortable preference, subjective joint vocabulary, empty-session eligibility, multi-day diet-report inclusion and freshness labeling. Coaching screens remain Phase 2. Agent C was not run; application code was not changed for this UX stage.
