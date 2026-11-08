# Try the unpublished app on iPhone

This private LAN preview uses the Mac's existing Python/OpenSSL tools. No App Store build, public tunnel, GitHub push, account connection or system trust change is performed automatically. Your phone and Mac need the same regular Wi-Fi for setup. A trusted HTTPS certificate is required for the service worker; bypassing a Safari certificate warning is not an offline acceptance test.

## Start the preview on this Mac

In Terminal:

```sh
cd "/Users/connectionconner/Documents/ChatGPT/Body Dashboard"
python3 scripts/preview-iphone.py
```

Keep Terminal open and the Mac awake while preparing/installing/importing. Ctrl-C stops the preview. If macOS asks, allow Python incoming connections for this local test. The server binds only the Mac's private LAN IPv4 address and serves the app shell, assets/vendor and one synthetic fixture. It offers no file-upload endpoint or directory listing; repository backups, `.git`, scripts and certificate keys are not served.

The helper prints its addresses. On this Mac the preferred address at preparation was:

`https://macbook-pro.local:8443/index.html`

Use the printed hostname consistently. The IP fallback is a different browser origin with different records. Do not switch between them after importing/logging without exporting a backup first. If using an IP because Bonjour does not resolve, keep it stable for the test; an IP/port change also changes the origin.

## Install the preview certificate manually

The helper created a private local CA and a short-lived server certificate outside the repository. It did not install trust on the Mac or iPhone. In Finder, choose Go → Go to Folder and enter:

`~/Library/Application Support/Body Dashboard Preview`

AirDrop **only `Body-Dashboard-Preview-CA.cer`** to your own iPhone. Never share the private `.pem` keys.

1. On iPhone, open Settings → General → VPN & Device Management (or Profile Downloaded).
2. Install **Body Dashboard Local Preview CA**, entering the device passcode if asked.
3. Open Settings → General → About → Certificate Trust Settings. Enable full trust for that exact certificate.
4. Open the printed HTTPS app address in ordinary Safari, outside Private Browsing. There should be no certificate warning. Do not proceed with a certificate error.

This is the manual trust procedure described by [Apple](https://support.apple.com/en-us/102390). Only install the certificate generated on your own Mac. When testing is finished, export any records you want to keep, then remove this specific preview profile from VPN & Device Management. The server certificate lasts 14 days; the preview CA lasts 30 days. The helper reissues the server certificate on launch while keeping that CA. It stops if the CA is near expiry rather than silently replacing trust.

## Install the Home Screen copy first

1. In Safari, wait for **Ready offline**.
2. Share → Add to Home Screen; enable Open as Web App if offered. Name it **Body Preview**.
3. Launch **Body Preview**, keeping the connection on, and wait for **Ready offline** there too.
4. Use this Home Screen copy for logging and imports. Do not assume ordinary Safari and the installed web app share their storage.

If the address does not open, check that both devices use the same non-guest Wi-Fi, the Mac is awake, Terminal is still running and local access is allowed. Try the printed IP fallback before you import anything. If Ready offline never appears, leave networking on and resolve that problem before doing the offline test.

## Test with disposable records

1. On the Mac or iPhone Safari while connected, download `https://macbook-pro.local:8443/preview-history.json` (use the same host/port selected above) and save it to Files → On My iPhone so it is available offline. It contains one synthetic workout named **Preview import test**, with 40kg × 5 (about 88.2lb × 5), dated November 1, 2026.
2. In Body Preview, start a workout named **Offline test**, add an exercise and enter dummy values. Wait for **Saved on device**. Typed rows remain drafts until you check them.
3. Turn on Airplane Mode and explicitly turn Wi-Fi off too. Close Body Preview from the app switcher, then reopen its Home Screen icon.
4. Resume the same workout. Confirm the draft values survived. Check one set, change/save its values, undo/reaccept it, and test collapse/+15/skip on the timer. Wait for the saved acknowledgment after each change.
5. Populate another set but leave it unchecked. Finish. History should contain only the accepted set. Close/reopen offline again and confirm it remains there exactly once.
6. Also try Log food → Quick add with a fictitious food, or an already saved food. Reopen and check it remains. Remote food search needs a connection; logging a local/saved entry does not.
7. In Settings & Sync → Import workout history, select the synthetic JSON from Files. Review the units/timezone checkbox and tap Import selected. Check History for Preview import test. Import that same file again: no second workout should be added. This file-picker/import test can be performed offline because the sample is already saved in Files.

Airplane Mode does not simulate a storage failure. Do not clear website data, fill phone storage or delete records to force a Retry test. Real write failures are covered by automated synthetic failure tests. If Not saved appears naturally, preserve the app/input and use Retry save or export before discarding anything.

## Bring in your own history after the sample succeeds

1. Keep an untouched original export/backup from the app that currently has the history.
2. For Body Dashboard, Settings & Sync → Export workouts → JSON produces the supported fitness file. A full Body backup also works.
3. For Life Dashboard, use its full backup. This training importer extracts workouts/routines/programs/exercise metadata only; unrelated Life content and photos are excluded. Hevy CSV uses the separate Import Hevy CSV action.
4. Save a copy in Files → On My iPhone, using AirDrop if it is on the Mac. Do not put your personal exports in this repository or send them to the assistant.
5. In **Body Preview**, open Settings & Sync → Import workout history. If the previous sample review opens, tap Choose another file.
6. Choose your copy. Review IDs, counts, units and timezone assumptions. Keep current/skip is the default for changed records; do not select replacement without checking it. Unsupported records remain in quarantine for review/export rather than receiving invented values or IDs.
7. Confirm the checkbox, then Import selected. Check the oldest/newest workouts and a few detailed sets, including weights, reps, supersets and notes. Test the same import again to confirm no duplicates.
8. Export **Back up records + photos** from this preview and save it in Files outside the repository. Delete the two clearly named synthetic workouts if desired, then export a fresh clean backup.

Training-only import does not migrate nutrition, recipes or photos. Full Import backup is a separate flow if you later want those records too; do not use Replace as a workaround for training import conflicts.

## Before moving to the published app

Preview records stay on the iPhone under the preview address; they are not uploaded to this Mac or GitHub. They do not automatically move to the later published GitHub address. Export a full backup from this Home Screen preview before removing the icon/certificate or clearing storage; restore it through the published app's separate Import backup flow when publication is approved. Leave sync off throughout this test.

Record the iPhone model, iOS version, chosen URL, Home Screen/Safari surface and any problem. Check light/dark, larger text, decimal entry and VoiceOver as well. This guide prepares a real-device test; it does not claim that a physical iPhone has already passed.

## Checks performed on the helper

TLS chain and hostname were verified against the generated local CA without disabling certificate validation. Six shell/fixture endpoints returned correctly; private/backups/traversal paths were denied. `npm run check` and `git diff --check` passed. No application code was changed for this helper. The browser regression results remain in [the D report](mobile-rebuild/outputs/D_SPRINT_1_REPORT.md).
