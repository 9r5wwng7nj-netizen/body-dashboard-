# Release 2 — a broader offline exercise library

November 7, 2026 (America/New_York). Second stage of the authorized next-iteration plan. Published November 8, 2026 (America/New_York), following the November 7 review packet.

## Intended behavior and preservation contract

Bundle 144 curated additions alongside the original 56 default names. The additions cover common free-weight, cable, machine, unilateral, band, suspension, hip and conditioning choices. Their role labels are editable focus/involvement defaults, not exact physiological stimulus or trainer certification. No instructions or images are copied; pinned metadata provenance and the upstream license declaration remain available.

The original seed and stored exercise list are retained. New catalog names are projected as a read-only union, so merely updating or opening the app does not rewrite exercises, metadata, history or pending intents. User overrides and cues take precedence; recorded classifications remain unchanged. An optional per-name catalogHidden marker records an explicit removal/rename without deleting unknown metadata. Actual names in routines, active sessions and history remain discoverable.

Library and picker use one normalized name/alias/equipment/muscle matching contract. Adductors and Abductors are additive labels. Smith apparatus uses the Machine parent filter. Chest-supported rows, rear-delt flys and hip-adduction inference traps are corrected for current fallback interpretation; old snapshots stay recorded. Legacy reports using current mappings may therefore change interpretation without record changes.

Unquantified bands use the existing bodyweight canonical shape with a clearer Reps only display label, countBW false and an explicit unquantified-resistance load basis. No band-to-kg, each-hand-to-pair, floor-to-distance or bodyweight conversion is invented. Conditioning/timed entries keep compatible existing tracking types.

## Actual checks and publication

- Curator focused verification: **26 Chromium (10.9s), 26 WebKit (23.6s)**, covering 12 catalog and all 14 cue cases. Root reviewed the source/data and all 144 entries match the reviewed candidate identity/mapping/equipment/aliases/tracking flags and pinned provenance.
- First full run found an unnecessary null load-basis field on plain custom creation. The derived-field invalidation now applies only where such an annotation already exists; custom canonical shapes stay compatible. The initial run was not published.
- Root final Chromium suite: **196 passed (44.3s)**, including CSS/static, new catalog scenarios and existing phone/theme/enlarged-text, recovery, import and backup suites.
- Root final WebKit: **89 passed (1.1m)**. Exact-source Linux CI: **196 Chromium (1.3m), 89 WebKit (2.1m)**. Source `3df2c5b932d3640bb810152fd3bc8ed8e5331e79`; [CI run](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42448950755).
- Exact staged package and live HTTPS catalog flows passed both engines: fresh read-only union, alias/filter search, offline add/accept, new catalog/band snapshots, finish, full backup restore and reload, original history IDs/values intact. Both light/dark staged screenshots were reviewed.
- Live common checks passed both engines: all 15 non-marker runtime hashes; Cobalt light/dark/light; offline swap/resume/finish; workout import twice without duplicates/precision loss; byte-identical photo-backup restore and offline decode; unchanged retired inventory records and storage names. Zero page errors or network writes.
- Deployment `2ec7e53d8ffb3ed2edcc5dc2b0ac977aed6ac3d9`; [Pages run](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42449312563) succeeded. Only 17 allowlisted runtime files were published. Main remains unchanged; no force push.
- No personal health records were used or inspected. Physical iPhone keyboard, Home Screen, safe-area and VoiceOver testing remain manual. Source/reference mappings are editable conventions, not expert certification or measured physiology.
