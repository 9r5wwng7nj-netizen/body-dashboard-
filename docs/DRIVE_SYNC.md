# Optional Google Drive device sync

Body Dashboard keeps local IndexedDB logging as the primary path. Sync is opt-in on each device through Settings & Sync → Connect Google Drive. Use the same Google account on the phone and desktop. This extends the existing Drive sync implementation rather than replacing the browser app or its records.

## Isolation and credentials

- Use a **separate Body Dashboard Google Cloud project/OAuth client** from Life Dashboard, even when both use the same Google account. This separates grants, revocation and hidden app data.
- Request only `https://www.googleapis.com/auth/drive.appdata`. Google’s account chooser is explicit. The hidden app folder is application-specific and does not give ChatGPT/other Drive connectors automatic access.
- Body filenames are `body-dashboard-sync.json`, `body-dashboard-copy-YYYY-MM-DD.json` and `body-dashboard-photo-<original-photo-id>`. IDs/record/photo references stay unchanged. Never upload, update, prune or reuse Life photo filenames.
- `auth/worker.js` is an OAuth-only broker deployed as `body-dashboard-auth`. It never receives workout/nutrition/photo payloads and stores no records. Records/photos go from the browser directly to Google Drive.
- Google client ID is public configuration; the client secret belongs only in the Worker’s `GOOGLE_CLIENT_SECRET` secret binding. Never commit it or copy it into browser settings/backups. `GOOGLE_CLIENT_ID` must match the frontend’s public client ID; ready checks refuse a mismatch.
- Only the production origin `https://9r5wwng7nj-netizen.github.io` and callback `https://9r5wwng7nj-netizen.github.io/body-dashboard-/index.html` are accepted by the broker. It cannot exchange Life Dashboard codes. Authorization uses state and PKCE. There is no implicit-token fallback when the broker is unavailable.
- Browser access/refresh tokens stay in `bd.sync`, are excluded from backup/sync data and are sent only to Google or this dedicated broker. Stop syncing revokes the Body grant and retains local/Drive records.

Google revocation applies to the project grant, so stopping sync can require signing in again on other Body devices using that account. It cannot revoke the separate Life project. See [Google revocation behavior](https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke).

## First connection order

1. Save open work and export a full Body backup including photos independently on every device that has records. Verify which device has the complete expected history; do not assume that Drive, the phone or the desktop is authoritative. Keep downloaded originals unchanged.
2. After the candidate is published, update all participating Body clients without clearing site data. Save, close all Body tabs/Home Screen instances and reopen. Verify the running release before connecting.
3. Connect the device with the verified complete history first. Review the local/Drive inventories and familiar history dates. If Drive is unexpectedly empty or smaller, keep sync paused and preserve both copies; do not choose replacement just to clear an error. Combine retains independent additions and requires explicit conflict review. Wait for record verification and inspect photo status separately.
4. Connect the other device using the same Google account. Use the Drive copy only after verifying that the remote copy is complete and the receiving device has no unpreserved independent work. Otherwise review Combine and its conflicts. Verify familiar early/recent workouts, routines and a photo after reload on both devices; totals alone are insufficient.
5. With synthetic content, build one routine on desktop, sync, reload the phone and confirm exact targets. Log one synthetic phone session offline, reopen it, reconnect and verify that desktop receives the same values/IDs once. Review/clean up only those synthetic IDs afterward, retaining real history.
6. Sync before switching active logging devices. Keep periodic full backups; dated Drive copies and retained record-only downloads do not contain photo bytes. Actual iPhone/Google pilot acceptance is separate from mocked tests.

## Concurrent editing and recovery

The existing three-way merge combines ID-based record lists and object fields against a last-agreed local base. Conflicting changes to the same field, edit-versus-delete and incompatible ordered arrays now pause for an explicit choice. Independent changes can combine. Choices apply only to the exact reviewed local/base/remote snapshots; later changes invalidate them. This is eventual sync, not a collaborative editor. Keep active-set logging on one device at a time.

Before its first record upload, each new sign-in creates an empty temporary probe, verifies that a stale conditional write is rejected and deletes the probe. Unsupported preconditions stop sync before personal records are uploaded. Marker reads use Drive v2's documented JSON `etag`, `title` and `version` fields, normalizing `title` to the existing internal name. Existing-file content writes use the v2 media `PUT` endpoint with `If-Match`; creation, listing, downloads and photos retain v3. File identities, contents, names, scopes and storage stay unchanged. A 412 response causes refetch/merge/retry, with a bounded retry count. Missing, malformed or weak markers pause instead of an unprotected overwrite. Duplicate canonical sync files pause for review rather than silently choosing one. Live provider support must be checked during the signed-in pilot; mock API tests do not establish real Google authorization or conditional-write behavior.

The optional local-only `bd.sync.writeSafetyProtocol` stamp requires the probe to run again when the update protocol changes, even if an older client-level safety stamp exists. No approval stamp enters a backup or synced record.

Different locally changed active sessions, or a concurrently changed draft whose ID is already completed remotely, pause before replacing either side. Export the retained draft and resolve it explicitly. Pending failed local writes must be recovered before adoption or sync restoration. Record removals, including small and nested set removals, require snapshot-bound confirmation (the retired grocery compatibility exception remains). Body sync rejects Life Dashboard payloads even when a file is misnamed.

Photos are uploaded by original ID with the Body prefix and transferred in batches. Recipe photo edits create fresh photo IDs; no referenced source identifier is renamed. Dated-copy pruning recognizes only Body copy names. Unknown future Body collections pass through without being removed.

## Setup and checks

Create Body branding and a Web application OAuth client in its dedicated Google Cloud project; enable the Drive API. Authorized redirect URI must exactly match the callback above. Keep the Google account/consent configuration and credential entry under owner control. Do not accept legal agreements or capture credentials on the owner’s behalf.

During the personal pilot, the OAuth app remains External/Testing and only owner-approved test accounts may connect. Google expires Testing refresh tokens after seven days for this scope; reconnecting restores authorization without replacing local records. Moving to production requires a separate review of branding/privacy information and audience, not a silent expansion of this beta's access. See [Google token expiration](https://developers.google.com/identity/protocols/oauth2#expiration).

Deploy the broker with `wrangler deploy --config auth/wrangler.toml --keep-vars`, configure its public ID and private secret binding, verify `/google/ready` with the production Origin, and set the matching public frontend client ID. This alone does not connect a device or authorize uploading its records. The user must choose Connect and complete Google consent.

`npm run check` runs static checks and the dependency-free Worker tests. `npm test` and `npm run test:webkit` include synthetic two-device sync, concurrent precondition failures, active-session conflicts, cycles/TMs/drafts, photo isolation and offline preservation. Use fresh test profiles. Production Google sign-in/refresh and physical iPhone Safari/Home Screen behavior need the owner-assisted pilot. Never use real health records as test fixtures.

Sources: [Google app-data folder](https://developers.google.com/workspace/drive/api/guides/appdata), [Google OAuth web authorization](https://developers.google.com/identity/oauth2/web/guides/how-user-authz-works), [Drive usage limits](https://developers.google.com/workspace/drive/api/guides/limits).

## Initial beta verification — 2026-11-08

- Static checks and four OAuth broker unit tests passed.
- Exact-source [GitHub checks](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42528948672) passed: 265 Chromium and 171 iPhone-sized WebKit tests, including 22 sync/opt-in scenarios in each engine, plus the four broker unit tests.
- The dedicated broker is deployed with request logging disabled. The owner created the OAuth client and submitted its private secret directly to Cloudflare. The matching public client ID is configured; the broker reports ready. The Drive API and sole `drive.appdata` scope are enabled in the separate `body-dashboard-514117` project. The owner-approved sole beta account is registered; the signed-in provider pilot remains pending. No owner email or secret is part of the public runtime configuration.
- [Pages deployment](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42529536040) succeeded. Published runtime source: `8dbb05a262874cde782b301553cb08df2c1bff68`; deployment: `84c2f1d3a890eaae9898a3a8f5ec31299ff6188b`. Only 17 allowlisted public files were packaged. The deployed release marker and 15 nonempty public asset hashes matched the package.
- Fresh persistent Chromium and WebKit profiles at 390px passed staged and live offline reload, set completion, exercise swap, resume/finish, repeated workout-history import, full backup restore with identical photo bytes and readable restored photos. Cobalt Air light/dark colors matched. Retired inventory records stayed unchanged; no page errors or network writes occurred. Sync was off in both fresh profiles.
- The frontend is configured for optional connection, with device sync still off by default. Tests have not accessed real browser records or established that live Google authorization/refresh/conditional writes work. Those and physical iPhone behavior remain the owner-assisted pilot; unsupported provider writes pause before personal upload.

## First-connection compatibility follow-up — 2026-11-08

The owner completed Google sign-in on an iPhone and reported the preflight's missing-marker error: sync paused before personal records uploaded. The displayed branch is consistent with the app's v3 response-header assumption failing; actual phone response headers were not inspected. Earlier mock responses had supplied that header, so the original automated results did not establish live provider compatibility.

The fix reads the [documented v2 File ETag](https://developers.google.com/workspace/drive/api/reference/rest/v2/files#File.FIELDS.etag) and updates through the [v2 media endpoint](https://developers.google.com/workspace/drive/api/reference/rest/v2/files/update). Google's [comparison reference](https://developers.google.com/workspace/drive/api/guides/v2-to-v3-reference) lists the File `etag` field as absent in v3. This retains the same `drive.appdata` permission and requires the empty probe to reject a stale write before any personal upload. Tests now omit readable ETag headers, return the documented JSON marker, verify a protocol upgrade cannot skip probing, and cover missing/weak markers, unsafe providers, safe retries and concurrent writes. Paused sync is labeled paused in Settings.

No restore, replace, credential change, Life update or stored-record migration is needed. After publication, save open work, let the app prepare its update, close all Body tabs/Home Screen instances and reopen online. Choose Settings & Sync → Sync now if it has not already retried. Keep the desktop disconnected until phone records and photo batches finish successfully. Live conditional writes remain unverified until that owner-assisted retry succeeds.

The fix is published from source `fcff32ef4bf9bf7dab3e749d89cf73be8882c9ec`, deployment `94d95ce4eeed6db1d26fb5d06f39743dae566789`. [Exact-source checks](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42530606968) passed: 268 Chromium, 174 WebKit and four broker tests; the 25 focused sync cases also passed locally in both engines. [Pages deployment](https://github.com/9r5wwng7nj-netizen/body-dashboard-/actions/runs/42531174997) succeeded. Staged and live 390px fresh-profile checks passed in both engines: matching deployed source and asset hashes, offline reload/logging/swap/resume/finish, repeated history import, full backup/photo restoration, Cobalt Air themes, unchanged retired records, zero page errors and zero network writes with sync off. This validates the released package and mocked protocol behavior, not successful live Google writes; the phone retry remains necessary.


## Reported history disappearance — 2026-11-08

After the compatibility update, the owner reported both devices displaying “Synced,” then no workout history on either device after desktop adoption of the Drive copy. The cause is unresolved: the real remote payload, browser storage context and sequence were not captured. Do not treat a successful sync status as verification of data completeness or describe the incident as fixed.

The owner disconnected the devices and restored a downloaded backup with Replace, reporting the expected history returned. Later desktop inspection showed sync still enabled; the owner was advised to stop sync before further recovery or max entry. No automated test accessed or rewrote the owner’s records. A new synthetic 36-workout adoption regression verifies server/phone/desktop history and reload retention, but cannot reproduce or explain this incident. Keep original downloaded backups unchanged.

## Milestone 1 candidate — November 9, 2026

The owner authorized investigation, team review and local implementation, before routine rebuilding. This candidate is not a published release or a completed live pilot. [Specification](product-review/2026-11-09/milestone-1/SPEC.md), [team review](product-review/2026-11-09/milestone-1/ARCHITECT_REVIEW.md), [QA](product-review/2026-11-09/milestone-1/QA_REVIEW.md) and [integrated report](product-review/2026-11-09/milestone-1/IMPLEMENTATION_REPORT.md).

- First connection shows workouts, routines, food entries, photo references and local-calendar history dates for both copies. Counts aid review; exact content comparison supplies verification. Using Drive requires a deliberate replacement choice. Malformed or non-Body content is rejected before choices appear.
- Sync no longer uses device timestamps to resolve conflicting canonical values. The conflict screen shows complete expandable values and a clear choice for all conflicts; independent changes still combine. Changed proposals, restores and removals need a fresh review. Distinct active workouts remain a separate pause.
- Every exchange reads the Drive payload between matching identity/version markers. A successful write is downloaded and compared completely. Unknown future collections pass through unchanged. Missing or duplicate canonical files pause rather than create an apparently empty replacement agreement.
- The local canonical graph/base/verification receipt commit together using captured expected records. A failure or stale edit retains the previous local graph and base; a remote write may nevertheless already have succeeded. Retry merges current remote state, not a blind replay. There is no cross-service rollback.
- Settings cannot join the IndexedDB transaction atomically: the committed checkpoint reconciles localStorage on completion/relaunch, and conflicting later settings are explicitly reviewed. New input at the final record-commit boundary is retained in memory and a separate local copy, with further saves paused until export/reload. A download is never automatically imported.
- Canonical commands and shared-settings changes invalidate current verification and schedule sync. Status distinguishes local pending work, offline/authentication, record verification, pending/missing photos and photo errors. A record receipt is not a full photo backup or proof that another device has downloaded the same copy.
- Settings & Sync → Download retained local records offers the dated first pre-adoption record snapshot, or late input if present. These are version 1 record-only backups without API keys/photos. The first snapshot survives no-op syncs and may be old; keep periodic full records-and-photos backups. Backup restores require review before sync propagation.

Before a future pilot, update all participating clients without clearing browser data, retain known-good full backups, and verify familiar history plus a synthetic desktop routine and an offline phone session on both devices. Older cached clients do not enforce this protocol. Real authorization, provider races, iPhone Safari/Home Screen termination and VoiceOver remain owner-assisted gates. The prior disappearance incident is still unresolved; these independently tested safeguards do not establish its cause.
