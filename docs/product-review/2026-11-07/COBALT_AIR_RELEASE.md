# Cobalt Air — implementation and release verification

November 7, 2026 (America/New_York). The owner selected Cobalt Air and explicitly authorized implementation, checks and publication.

## Delivered

The chosen blue/white light palette and neutral navy/periwinkle dark palette replace Warm Mineral across existing screens. The semantic system covers text, backgrounds, necessary field edges, selected controls, focus, saved-set controls, charts, calorie/macro graphics, navigation and resume surfaces. Overview cards have restrained 18px corners; fields/buttons use 10px corners. Exercise headings use neutral ink, and committed fields use a quiet grouped fill. Foreground/background theme changes remain simultaneous.

The app keeps its current information and interactions, including the calorie display preference/ring, dense and enlarged-text workout layouts, explicit set acceptance, Minimize/Resume, timers, typed Nutrition Library and the retired inventory surfaces. Browser chrome follows the selected appearance before paint and on theme changes. The existing vector mark and all three local PNG app icons now use cobalt; no external font, image or account service was added. Existing Home Screen icons may retain a cached icon until the platform refreshes it; clearing site data is not an update procedure.

## Records and scope

No storage keys, schemas, IndexedDB version/store names, IDs, data commands, normalization, sync configuration, import or backup formats changed. Runtime JavaScript changes are presentation-only: theme metadata, chart colors, visual utility classes and the new What's new entry. No real records or personal profiles were opened. Production deployment contains only allowlisted runtime assets; these design/release documents and synthetic images remain outside the Pages package.

## Actual local verification

- `npm test -- --workers=2`: **170 passed (35.9s)**, including CSS build and static checks.
- `npm run test:webkit`: **63 passed (45.2s)**.
- Coverage includes named pages at 375/390px, light/dark and 100%/200% text, keyboard paths, accessible names/contrast, touch controls, failed-write recovery, safe swaps, unchanged retired collections, workout import twice, and byte-identical recipe/progress photo backup restoration/offline decoding.
- The existing theme color regression now expects Cobalt Air ink and checks browser metadata after light/dark/light transitions. The spacing fixture waits for the existing two-frame theme refresh before measuring current rows; its gap/size assertions are unchanged. The first run measured a replaced node and failed one spacing case; the final complete suites passed after that synchronization fix.
- Eight actual-app synthetic screenshots cover Today, Train, Nutrition and active workouts in both themes. Visual review verified neutral/blue surfaces, committed/draft distinction and the settled navigation. The preview session was separate from personal browser profiles. Asset PNGs were regenerated from the existing SVG, not from a photo or new image service.

Exact-source GitHub CI, staged package and live verification are recorded after the release gates finish. See `docs/BETA_RELEASE.md` for final identities and run links.

## Limits

Automated engines and desktop screenshots do not establish physical iPhone keyboard/safe-area/Home Screen/VoiceOver acceptance. The app's existing larger-history performance and local browser-storage limitations remain. This visual update does not enable coaching or sync.
