# Changelog

## 2026-11-07 — Faster logging (refresh step 2)

- On phones, dialogs open as sheets from the bottom; drag the handle or title bar down to close.
- Log food: the meal at the top; Recent and Usual-for-this-meal lists; tick several saved foods and add them together at their last amounts; portion chips (½, 1, 1½, 2 of the usual amount).
- Same as yesterday on an empty meal in the daily log.
- +/− under each exercise for the next set's weight and reps, starting from last time.
- The rest timer spans the screen above the bottom bar on phones; the screen stays on while a workout is on screen.

## 2026-11-07 — Easier to use on a phone (refresh step 1)

- Set logger: wider, 44px weight and reps fields; Previous on one line ("82.5×8"); the RPE column hidden unless turned on in Settings or a set already has one; move, superset and remove behind ⋯; notes behind Add note.
- Calories left is the big number in the calorie rings and on the Today card, with protein still to go; Settings can switch it to calories eaten.
- Nutrition day bar: "Today · Sat, Nov 7", tap to pick a day; copying a day lives under ⋯.
- Every number field opens the right keypad (checked by `npm run check`); buttons and fields are 44px on touch screens.
- Short tab names on phones; a tab row that still doesn't fit fades at the edge.
- Recipe filters in one row that scrolls sideways, beside the sort menu.
- The backup reminder is one line, with Later to put it off for a week.

## 2026-11-07 — Body Dashboard begins

- Started from Life Dashboard at commit `718c52f`, keeping Workouts, Nutrition, Recipes & Meals and the Dashboard.
- Removed Scripture, Journal, Media Library, Marriage & Family and Tasks, along with the features only they used: Smart Search, Berean tools, the Obsidian bridge, YouTube, podcasts, the Claude connector, the Morning brief, Hosting and the table prayers in Recipes.
- Every storage name is new (`body-dashboard`, `bd.*`, `bd-shell-*`, `body-dashboard-*` in Drive), because both apps share one web origin.
- Import from a Life Dashboard backup: only this app's collections, only the photos those records use, and only settings that apply here. Into an empty app it replaces the sample routines and recipes.
- The link sheet saves recipes only; the + button adds food, weight, a workout or a recipe from a link.
- The Today card shows the workout, food so far against the target, the weigh-in and dinner.
- Drive sync is built but off until a Google account is chosen.
- New icon, tour and What's new.
