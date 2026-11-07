# Dependencies

The app runs its runtime dependencies from files committed to this repository. It does not load framework, icon or spreadsheet-parser code from a CDN. `package.json` lists the pinned development packages.

## Local runtime assets

| What | Local path | Version | Notes |
|---|---|---|---|
| Tailwind CSS | `assets/app.css` | 4.3.0 | Precompiled from `src/app.css`; there is no Tailwind runtime in the browser. |
| Lucide icons | `vendor/lucide/lucide-1.55.0.min.js` | 1.55.0 | Pinned UMD browser bundle. |
| ZXing for JavaScript | `vendor/zxing/zxing-library-0.23.0.min.js` | 0.23.0 | Loaded only when the camera barcode scanner starts in a browser without its own `BarcodeDetector`. |
| SheetJS Community Edition | `vendor/sheetjs/xlsx-0.20.3.full.min.js` | 0.20.3 | Loaded only for spreadsheet imports (MacroFactor). |

Licenses and SHA-256 hashes are recorded in `THIRD_PARTY_NOTICES.md`. After changing Tailwind classes or component styles, run `npm run build:css` and commit the regenerated `assets/app.css`.

## Web services called at runtime (all optional features)

| Feature | Service |
|---|---|
| Food search & barcodes | `world.openfoodfacts.org` · `api.nal.usda.gov` (USDA FoodData Central; `DEMO_KEY` unless the user adds a key) |
| Food search and reading recipe pages (hosted app only) | Life Dashboard's Cloudflare Worker, `life-dashboard-reader.lifedashboard-9r5w.workers.dev`. It answers by origin, and both apps share one. Its source lives in the Life Dashboard repo (`reader/`). |
| Device sync (off until a Google account is chosen) | `accounts.google.com` sign-in by redirect · `www.googleapis.com` Drive API, limited to the app's own hidden folder (`drive.appdata`) |

## Browser APIs used

IndexedDB, localStorage, Notifications (rest timer), Screen Wake Lock (cook mode), Web Audio (timer beeps), BarcodeDetector or the camera with ZXing, Clipboard, Service Worker (hosted copy only).
