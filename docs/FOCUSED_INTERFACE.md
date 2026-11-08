# Focused training interface — November 7, 2026

The product owner requested a simpler iPhone interface using supplied lifting-app screenshots as directional references, while retaining Body Dashboard's own appearance and offline data model.

## Navigation

- Four bottom destinations: Dashboard, Workouts, Nutrition and Meals. Existing `S.bar` ordering remains supported at every width; dashboard card visibility/order remain unchanged.
- Header: quick add, Help/What's new, Settings & Sync. Theme remains in Settings. There is no left drawer or desktop sidebar.
- Active session: Minimize, Log workout, timer and Finish. Section tabs and bottom navigation are hidden while logging, leaving the full width for set entry.
- Minimize keeps the active workout and opens History (Dashboard if History is hidden). Resume returns to the same session; it does not create or replace a workout.

## Training

- Editable workout name and Duration / Volume / Sets appear above flat exercise sections.
- Each exercise has its name, previous context, Rest and Note controls, a set matrix and Add set.
- Previous is omitted for first-time exercises. Longer previous values wrap, with full source/date information in accessible names. No exercise image service or copied imagery is required.
- Numbered set controls open working/warm-up/drop/failure choices and deletion. Removing an accepted set requires confirmation.
- Check accepts a set through the existing durable command; Undo reverses completion. Suggestions remain outside completed history until explicitly accepted and committed.
- Extra load/reps steppers live under Adjust next set; expansion stays open through edits in transient UI state. Workout notes, discard and completed-week context live in Workout options.
- History shows up to three exercise previews and an expansion affordance. Expanding reveals all sets and existing Edit/Repeat/Save as routine actions. Calendar and totals expand separately; legacy Stats links open that section.

## Accessibility and recovery

- Light and dark themes, 44px controls, keyboard access and visible focus are retained. Enlarged text uses the existing labeled detail-row fallback and a two-column navigation grid.
- Rest timer and Resume occupy separate layout space when minimized. With numeric entry focused, the timer uses document flow so it cannot cover entry/acceptance controls.
- Save state and offline readiness remain explicit. Existing failed-write retry/export, durable intent recovery, stale-tab protection and update-waiting behavior remain in place.
- No stored schema, record identity, unit, photo format, backup contract or sync configuration changed. Only transient UI state was added.

## Validation boundary

Automated checks use synthetic content and fresh browser profiles. Chromium and WebKit emulate phone dimensions; real iPhone Home Screen, keyboard, safe-area, VoiceOver and comfort validation still belongs to the personal beta test. The supplied personal screenshots are not copied into source or deployment artifacts.
