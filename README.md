# Body Dashboard

Your training and your diet in one place. It works offline, installs on a phone's home screen, and keeps every record on your own device.

- **Workouts:** log sets as you train, with supersets, set types and a rest timer; routines and programs; an exercise library; progress stats; Hevy import and export.
- **Nutrition:** search foods or scan a barcode; saved foods and meals; weight trend; an adaptive plan with weekly check-ins; body measurements and progress photos; MacroFactor import.
- **Recipes & Meals:** recipes with their macros, cook mode, a meal plan, Plan my week, a grocery list, pantry and freezer, and saving a recipe from a link.
- **Dashboard:** today's workout, food so far, the weigh-in and dinner, with cards you can reorder or hide.

Body Dashboard started as the fitness and diet half of Life Dashboard. To bring your records across, back up in Life Dashboard (Settings & Sync), then here open **Settings & Sync → Import backup** and choose that file. Only workouts, food, weight, measurements, progress photos and recipes come in.

## Your records

Records stay in the browser on the device you use. Download a backup from Settings & Sync every week or so and keep it somewhere safe. Sync between devices through Google Drive is built but switched off until a Google account is chosen.

## Development

```bash
npm install
npx playwright install chromium   # once
npm test                          # builds CSS, runs the static check and the browser tests
npm start                         # http://localhost:8080
```

See [AGENTS.md](AGENTS.md) for how the code is organized and the rules for changing it, and [docs/DATA_MODEL.md](docs/DATA_MODEL.md) for what is stored.
