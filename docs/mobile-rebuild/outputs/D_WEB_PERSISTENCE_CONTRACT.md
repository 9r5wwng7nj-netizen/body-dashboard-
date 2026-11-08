# Web Sprint 1 persistence contract

Date: 2026-11-07. Scope: local implementation, synthetic tests, no publication.

## Existing records remain authoritative

IndexedDB `body-dashboard`, version 1, retains `kv`, `photos`, and `local`. All existing collection names, kg/km/seconds, record identities, raw imported fields, and photo blobs remain unchanged. No Life Dashboard storage is written. Local storage fallback uses `bd.*` only. Read failures stop initialization; they do not create an empty installation.

## Optional metadata, version 1

`local` keys beginning `bd.web.` contain only private local metadata:

- `bd.web.intent.<operation-id>`: version, operation ID, purpose, candidate collections, SHA-256 hashes of expected persisted collection values, timestamp, and optional import ledger/timer receipt.
- `bd.web.receipt.<operation-id>`: version, operation ID, purpose, timestamp, local context and optional import/timer result. Import receipts retain reconciliation counts, source/target hashes and quarantine as serialized raw training JSON strings.
- `bd.web.import-preview`: staged source training records and review choices for restart. This is not committed history.
- `bd.web.context`: optional local actor/workspace/athlete IDs, shared by new commands. These are future ownership context, not authentication or server authorization.

Full backup v2 can carry optional `extensions.bdWeb` metadata; older envelopes remain valid. Metadata cannot include credentials or unrelated Life records. Restore validates keys and payload version; pending operations are recovered for review/retry, never automatically counted as completed history. Existing photo restoration remains a separate transaction.

## Writer, acknowledgment, and conflicts

One promise queue coordinates normal Store snapshots and explicit commands. Normal debounced editing retains existing behavior; new workout completion/undo/finish/import commands keep the committed in-memory view until acknowledgment. A command first flushes its drafts, captures expected persisted bases, and checkpoints its intent in a completed `local` transaction. It then uses one readwrite `kv` + `local` transaction to compare persisted values against those bases, write all affected collections, write its receipt, and remove superseded intents. Success means transaction completion, never merely a successful `put` request. A failed final transaction leaves the durable intent and its stable operation ID recoverable. On retry/restart the receipt is checked before applying anything again.

Expected values are exact serialized snapshots in memory; intents retain their SHA-256 digests. Hashing occurs outside transactions; final compare-and-write reads occur inside the same transaction. Other tabs cannot silently overwrite changed collections. A conflict retains local input for export/review and requires an explicit reload of the saved copy. No last-write-wins merge of workouts is attempted. An identical legacy snapshot can acknowledge the already-saved value, without overwriting a changed value. Reload saved copy requires explicit confirmation and removes only the pending intent IDs being discarded. Receipts are checked before retry so an older acknowledged candidate never rolls back a newer saved record. Full backup restore and sync adoption refresh these bases after their existing completed transactions.

## Drafts and completion

Optional set `draft` text and per-field `draftUnits` preserve decimal/time input without treating it as performance. Existing canonical fields remain snapshots. Historical amendments retain the committed view until acknowledgment, preserve unchanged timestamp precision/unknown end times and retain unknown source fields. Previous values are suggestions with a source date; they never copy RPE/joint feedback. Explicit Complete materializes and validates required fields, then commits `done` and an owned timer deadline together. Undo affects only that set's timer. Finish includes explicitly accepted sets only, preserves nested IDs/unknown fields, and commits history plus active clearing atomically. Repeated taps are serialized and the controls report pending state.

Startup loads committed collections, receipts and pending intents separately. Retry applies the same operation, revalidating its expected bases; no pending set or imported workout enters counts before acknowledgment. If the intent checkpoint itself fails, current-tab text remains available but cannot be promised after termination. The recovery UI states that limitation and offers backup export.

## Degraded storage and lifecycle

When IndexedDB cannot open, the existing localStorage fallback is explicitly labeled. It cannot provide a cross-tab atomic multi-collection commit. New atomic workout commands/import require IndexedDB; ordinary legacy edits remain available with honest save failures. No claim of permanent storage or guaranteed background timer notifications is made. Page hide initiates a flush but is not a durability acknowledgment. Export and periodic external backups remain necessary.

## Import and update boundaries

Training import extracts only workouts/routines/programs/exMeta from fitness JSON or Body/Life backup v1/v2. Original IDs define identity; titles/dates do not. Preview defaults to keep current records. Invalid/ambiguous records are quarantined with raw content in the private preview. Canonical collections and an import receipt/ledger commit together. A stale preview is rejected. Refresh review rereads the persisted training collections and supersedes only that preview’s failed operation with a cancellation receipt, so older tabs cannot replay discarded choices. The source remains in the staged review; no canonical records are discarded. Full backup replacement is never invoked by this flow. Import preview envelopes and quarantined raw records use JSON strings where needed so unsafe source object keys remain reviewable without breaking the safe backup envelope. Completed import receipts retain quarantine after the preview is removed; Settings offers its export/review.

A new service worker installs a complete generation before activation. It waits while existing pages remain open; the UI asks users to close all Body tabs and reopen after saving/finishing. No automatic reload or skipWaiting during active/pending work. Each generation reads its own shell cache; failed installation leaves the prior generation available. Only Body cache generations within this worker's project scope are eligible for cleanup.

## Evidence and validation

Real transaction aborts, close/reopen, duplicate operation retries, stale tabs, imports, metadata/photo backups, hosted project paths, and Chromium/WebKit are tested separately. Physical iPhone numeric keyboard, Home Screen suspension, safe areas and VoiceOver remain release gates if no device is available.

References accessed 2026-11-07: [IndexedDB transaction model](https://www.w3.org/TR/IndexedDB-3/), [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/), [Service Worker lifecycle](https://w3c.github.io/ServiceWorker/). A transaction acknowledgment does not guarantee survival of user clearing browser storage or operating-system eviction.
