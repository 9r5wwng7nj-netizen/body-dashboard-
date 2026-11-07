# Your data

Everything you enter stays in the browser on the device you use. There is no account and no server that keeps your records.

## Where your records live

Each place you open the app keeps its own records: the app added to an iPhone home screen, a browser at the hosted address, and a copy opened as a file on a computer. Until Drive sync is set up, they don't share anything.

On an iPhone, the home-screen app keeps its own records, separate from Safari. Import backups inside the app you use.

## Bringing records from Life Dashboard

1. In Life Dashboard, open **Settings & Sync** and tap **Back up**. Keep the `.json` somewhere private.
2. In Body Dashboard, open **Settings & Sync → Import backup** and choose that file.

Only workouts, routines, programs, the exercise library, food, weight, measurements, the adaptive plan, progress photos, recipes, the meal plan and groceries come across. Life Dashboard's other records and its photos of journal entries and family memories are left out, and Life Dashboard itself is not changed.

## Backups

**Settings & Sync → Back up records + photos** downloads one `.json` file with every record and photo. API keys are left out. Importing checks the whole file first, then saves it in one step, so a bad file changes nothing. Keep backups out of any code folder: `.gitignore` blocks `*backup*.json`, and they hold your personal records.

## Sync

Sync between devices through a private Google Drive folder is built, but it is off until a Google account is chosen for it.
