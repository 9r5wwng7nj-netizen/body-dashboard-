# Milestone 1 — verified records and recoverable device sync

November 9, 2026. Authorized investigation, team review and implementation. This milestone precedes routine-editor work. Publication and a live account/data pilot are not performed by this specification.

## Aligned boundary

Training first: editable routines and percentage targets, workout logging, simple macros, basic planned/performed muscle sets and dependable desktop–iPhone continuity. Recipes/meal planning stay secondary. Week variations, built-in photo AI and coaching remain later. Training maxes change only after owner approval; session edits default to that session and completed history remains authoritative. Keep Cobalt Air, the existing web application and every storage/backup/photo guarantee.

## Evidence and uncertainty

The November 8 disappearance incident is unresolved. Source review identifies independent risks; these must not be presented as its proven cause. Existing sync tests pass while leaving concurrent conflict, stale adoption and photo-completeness gaps. See ARCHITECT_REVIEW.md, PRODUCT_UX_REVIEW.md and QA_REVIEW.md for independent findings and actual probes.

## Contract

1. Local IndexedDB remains authoritative for acknowledged offline work. Sync uses the existing coordinated writer and DB v1 stores; no parallel database, credentials, personal fixtures or Life writes.
2. Capture the exact local graph/settings and persisted bases before network work. A local mutation or another-tab save invalidates the exchange. Incoming data must never overwrite an edit that occurred during a download/upload/flush.
3. Pause on concurrent conflicting values, delete-versus-edit, incompatible/legacy ordered arrays or duplicate IDs. Independently changed ID-addressable fields can combine. Any conflict choice is explicit and bound to the reviewed complete snapshots; changed inputs require another review.
4. First connection previews local/Drive workout/routine/nutrition inventories and history dates. Drive adoption never occurs by opening a preview. Replacements and removals require review of the exact proposal. Retain the first pre-adoption local records/settings as a durable local recovery copy, preserving photo blobs; no-op syncs cannot replace it. Its date/inventory must be reviewed because it may not be the latest copy. Exporting it is a records backup, not a photo backup.
5. Read the canonical Drive content between matching version markers. After a write, fetch it again and verify complete data/settings equality before acknowledging. HTTP success, counts or a connection alone are insufficient. Unknown future collections pass through; original IDs/units/precision remain unchanged.
6. Canonical local changes, the agreed base and a versioned verification receipt commit in one compare-and-write transaction. A failed or uncertain remote publication leaves the prior local graph/base available. Retry downloads current state and merges again; it does not blindly replay an overwrite.
7. Local status distinguishes pending local changes, offline state, authentication, review/conflict, verified record time/inventory, photo transfer and missing photos. A referenced image missing both locally and remotely is an issue, never zero remaining work. No full-photo-integrity claim follows from filename presence.
8. A backup restore invalidates previous verification and requires reviewed synchronization before its effects propagate. Backup commit uses the graph from which its plan was computed and refuses stale plans. It does not reset namespaces or rewrite record identities.

## Acceptance

- Desktop routine edit → verified exchange → phone adoption/reload; original history values/IDs match throughout.
- Phone offline completion → restart → reconnect → desktop; no duplicates, values preserved.
- Independent edits combine; concurrent same-field, deletion/edit and legacy-array conflicts pause without mutation, then resolve only through a reviewed choice.
- Local edits during download/upload, same-origin second-tab writes and changed review inputs survive or reject the stale exchange.
- Conditional PUT conflict retries; accepted-but-corrupt readback, interrupted local commit and uncertain network responses cannot produce a current verification receipt.
- Restore is durable and reviewed before cross-device effects; pre-adoption recovery export retains exact old records/settings. Photos and byte-identical full-backup restoration remain covered.
- Missing, partial and failed photo transfers have truthful status. Both themes, 390px, enlarged text, keyboard and accessible review controls work in fresh browser profiles.
- Full repository and WebKit checks. Actual Google authorization, provider races, iPhone Safari/Home Screen lifecycle and VoiceOver require a separate owner-assisted pilot; automated mocks do not close those gates.

## Review ownership

Product/UX: scope and truthful review/status. Architect: snapshot authority, conflict and commit boundaries. Developer/lead: minimal implementation. QA: independent synthetic regressions and full-suite evidence. No routine/program redesign is included.
