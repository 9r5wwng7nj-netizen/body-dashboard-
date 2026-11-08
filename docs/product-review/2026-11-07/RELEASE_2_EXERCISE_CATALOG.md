# Release 2 — a broader offline exercise library

November 7, 2026 (America/New_York). Second stage of the authorized next-iteration plan. Verification and publication are pending until recorded below.

## Intended behavior and preservation contract

Bundle 144 curated additions alongside the original 56 default names. The additions cover common free-weight, cable, machine, unilateral, band, suspension, hip and conditioning choices. Their role labels are editable focus/involvement defaults, not exact physiological stimulus or trainer certification. No instructions or images are copied; pinned metadata provenance and the upstream license declaration remain available.

The original seed and stored exercise list are retained. New catalog names are projected as a read-only union, so merely updating or opening the app does not rewrite exercises, metadata, history or pending intents. User overrides and cues take precedence; recorded classifications remain unchanged. An optional per-name catalogHidden marker records an explicit removal/rename without deleting unknown metadata. Actual names in routines, active sessions and history remain discoverable.

Library and picker use one normalized name/alias/equipment/muscle matching contract. Adductors and Abductors are additive labels. Smith apparatus uses the Machine parent filter. Chest-supported rows, rear-delt flys and hip-adduction inference traps are corrected for current fallback interpretation; old snapshots stay recorded. Legacy reports using current mappings may therefore change interpretation without record changes.

Unquantified bands use the existing bodyweight canonical shape with a clearer Reps only display label, countBW false and an explicit unquantified-resistance load basis. No band-to-kg, each-hand-to-pair, floor-to-distance or bodyweight conversion is invented. Conditioning/timed entries keep compatible existing tracking types.

## Actual checks and publication

- Curator focused verification: **26 Chromium (10.9s), 26 WebKit (23.6s)**, covering 12 catalog and all 14 cue cases. Root reviewed the source/data and all 144 entries match the reviewed candidate identity/mapping/equipment/aliases/tracking flags and pinned provenance.
- First full run found an unnecessary null load-basis field on plain custom creation. The derived-field invalidation now applies only where such an annotation already exists; custom canonical shapes stay compatible. The initial run was not published.
- Root final Chromium suite: **196 passed (44.3s)**, including CSS/static, new catalog scenarios and existing phone/theme/enlarged-text, recovery, import and backup suites.
- Root full WebKit, exact-source CI and staged/live gates are recorded after completion. No personal health records are used in tests or deployment artifacts.
