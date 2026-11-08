# Third-party runtime assets

Body Dashboard vendors these browser assets so application startup, spreadsheet imports and barcode scanning do not execute code from a third-party CDN.

| Component | Version | Repository path | License | SHA-256 |
|---|---:|---|---|---|
| Lucide | 1.55.0 | `vendor/lucide/lucide-1.55.0.min.js` | ISC | `48b3b5d82216bbe1d0c49dea480ed38fca8420c275c98f20505e3f9556f6b1d1` |
| ZXing for JavaScript (`@zxing/library`) | 0.23.0 | `vendor/zxing/zxing-library-0.23.0.min.js` | Apache-2.0 | `3ede94153fb0c5b67a12d7adff6decd827c2b22714fdc6faecf27a8f20937ea6` |
| SheetJS Community Edition | 0.20.3 | `vendor/sheetjs/xlsx-0.20.3.full.min.js` | Apache-2.0 | `cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41` |

The complete license texts are stored alongside each vendored asset.

Tailwind CSS 4.3.0 is a development dependency used to produce `assets/app.css`; Tailwind code is not executed in the user's browser.

## Curated exercise metadata

The additional 144 catalog definitions reference `free-exercise-db` by yuhonas and contributors, pinned to revision `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`:

- Source: https://github.com/yuhonas/free-exercise-db/tree/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5
- Declared upstream license: Unlicense / public-domain dedication: https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/LICENSE.md

Names, equipment categories and primary/secondary roles were curated into the app's broad vocabulary, with explicit editorial role and tracking choices. Per-entry source IDs and revision are retained in runtime metadata; candidate/review documents preserve the raw source metadata and differences. These are proposed focus conventions, not measured activation, injury guidance or trainer approval. No exercise instructions, images, GIFs or video from that source are included. Existing runtime-library licenses remain unchanged.
