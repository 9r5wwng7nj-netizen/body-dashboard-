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

1. Save any open cycle or logging form, then export a full Body backup including photos on each device that has independent data.
2. Connect the phone with the latest migrated records first. Wait for a successful record sync and completion of photo batches.
3. Connect the desktop using the same Google account. Review the first-connection choice: Use the Drive copy intentionally replaces desktop records; Combine merges them. Preserve any independent desktop records in a backup before choosing.
4. Verify a familiar workout, the cycle and calibrated TM, and a photo on both devices. Sync now before switching devices.
5. Logging remains available offline. Changes queue locally and can sync after connectivity returns. Keep periodic full backups; dated Drive copies do not contain photos.

## Concurrent editing and recovery

The existing three-way merge combines ID-based record lists and object fields against a last-agreed local base. Conflicting changes to the same field use the existing device-change timestamp preference; this is eventual sync, not a collaborative editor. Keep active-set logging on one device at a time.

Before its first record upload, each new sign-in creates an empty temporary probe, verifies that a stale conditional write is rejected and deletes the probe. Unsupported preconditions stop sync before personal records are uploaded. Marker reads use Drive v2's documented JSON `etag`, `title` and `version` fields, normalizing `title` to the existing internal name. Existing-file content writes use the v2 media `PUT` endpoint with `If-Match`; creation, listing, downloads and photos retain v3. File identities, contents, names, scopes and storage stay unchanged. A 412 response causes refetch/merge/retry, with a bounded retry count. Missing, malformed or weak markers pause instead of an unprotected overwrite. Duplicate canonical sync files pause for review rather than silently choosing one. Live provider support must be checked during the signed-in pilot; mock API tests do not establish real Google authorization or conditional-write behavior.

The optional local-only `bd.sync.writeSafetyProtocol` stamp requires the probe to run again when the update protocol changes, even if an older client-level safety stamp exists. No approval stamp enters a backup or synced record.

Different locally changed active sessions, or a concurrently changed draft whose ID is already completed remotely, pause before replacing either side. Export the retained draft and resolve it explicitly. Pending failed local writes must be recovered before adoption or sync restoration. Unexpected large record losses retain the existing confirmation gate. Body sync rejects Life Dashboard payloads even when a file is misnamed.

Photos are uploaded by original ID with the Body prefix and transferred in batches. Recipe photo edits create fresh photo IDs; no referenced source identifier is renamed. Dated-copy pruning recognizes only Body copy names. Unknown future Body collections pass through without being removed.

## Setup and checks

Create Body branding and a Web application OAuth client in its dedicated Google Cloud project; enable the Drive API. Authorized redirect URI must exactly match the callback above. Keep the Google account/consent configuration and credential entry under owner control. Do not accept legal agreements or capture credentials on the owner’s behalf.

During the personal pilot, the OAuth app remains External/Testing and only owner-approved test accounts may connect. Google expires Testing refresh tokens after seven days for this scope; reconnecting restores authorization without replacing local records. Moving to production requires a separate review of branding/privacy information and audience, not a silent expansion of this beta's access. See [Google token expiration](https://developers.google.com/identity/protocols/oauth2#expiration).

Deploy the broker with `wrangler deploy --config auth/wrangler.toml --keep-vars`, configure its public ID and private secret binding, verify `/google/ready` with the production Origin, and set the matching public frontend client ID. This alone does not connect a device or authorize uploading its records. The user must choose Connect and complete Google consent.

`npm run check` runs static checks and the dependency-free Worker tests. `npm test` and `npm run test:webkit` include synthetic two-device sync, concurrent precondition failures, active-session conflicts, cycles/TMs/drafts, photo isolation and offline preservation. Use fresh test profiles. Production Google sign-in/refresh and physical iPhone Safari/Home Screen behavior need the owner-assisted pilot. Never use real health records as test fixtures.

Sources: [Google app-data folder](https://developers.google.com/workspace/drive/api/guides/appdata), [Google OAuth web authorization](https://developers.google.com/identity/oauth2/web/guides/how-user-authz-works), [Drive usage limits](https://developers.google.com/workspace/drive/api/guides/limits).

## Verification status — 2026-11-08

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
