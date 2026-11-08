# Agent C native compatibility evidence

> Historical native compatibility record. The user has deferred native tooling/App Store work in favor of [the web-first route](../WEB_FIRST_PLAN.md). These blockers no longer gate the active release; do not resume native setup from this report.

November 7, 2026. **Native compatibility remains unverified because the iOS toolchain is unavailable.** This is an environment blocker, not an observed WatermelonDB build failure or an engine-switch decision. No simulator or physical-device build was compiled, opened or relaunched. The existing browser app was not changed.

Exact brief used: [Prompt C](../PROMPT_C_SYSTEMS_ARCHITECT.md). Package metadata and six pinned source hashes (all six matched the GitHub v0.28.0 files): [technology evidence](C_TECHNOLOGY_EVIDENCE.json). Architecture: [systems handoff](C_SYSTEMS_ARCHITECTURE.md).

## Actual environment probe

| Command or inspection | Actual result |
| --- | --- |
| `sw_vers` | macOS 27.2, build 26B123 |
| `node --version`; `npm --version` | v24.21.0; 11.19.0 |
| `xcode-select -p` | `/Library/Developer/CommandLineTools` |
| `xcodebuild -version` | Error: requires Xcode; selected directory is a Command Line Tools instance |
| `xcrun simctl list devices available` | Error: unable to find utility `simctl` |
| Xcode app candidates under `/Applications` | None found matching `*Xcode*.app`; no system-wide installation search was performed |
| CocoaPods / TypeScript compiler on PATH | Neither `pod` nor `tsc` found |
| Existing native project | No native app, Podfile or Expo config found in this checkout |

The `/usr/bin/xcodebuild` executable is a system launcher, not proof that Xcode is installed. No developer-directory setting, account, signing identity or system tool was changed. Public package sources were extracted into a task-specific temporary directory, separate from the repository and web dependencies. TypeScript 6.0.3's downloaded archive integrity was verified and its compiler was used for the contract check.

## Pinned candidate, not a tested native combination

| Dependency | Candidate version | Evidence |
| --- | --- | --- |
| Expo | 58.0.23 | Official npm metadata and downloaded package |
| React Native | 0.88.1 | Expo 58.0.23 `bundledNativeModules.json`, template and npm metadata |
| React | 19.3.0 | Expo's matching version; independent latest was 19.3.1 and was deliberately not substituted |
| WatermelonDB | 0.28.0 | Official npm release/source package and GitHub v0.28.0 sources |
| Nozbe simdjson | 3.9.4 | Watermelon package dependency and npm metadata |
| Expo development client | 58.0.18 | Expo's recommended `~58.0.18` range; exact base release exists |
| TypeScript | 6.0.3 | Blank TypeScript template's `~6.0.3` baseline; strict contract compilation passed |
| Blank TypeScript template / creator | 58.0.32 / 5.0.0 | Official registry metadata and template package contents |
| Legacy decorator transform | 7.28.0 | Exists in official Babel npm package; Babel 7 peer dependency, native transformation untested |
| Keyboard controller | 1.22.7 | Expo's matching native-module list and current official example; proposed, not built here |

The public Watermelon docs identify themselves as 0.27.1 while npm/source inspection found 0.28.0. Pinning therefore includes source inspection; old installation examples are not assumed to prove RN 0.88 support. Registry access URLs and integrity values are saved in the evidence artifact; dependency installation and a transitive lockfile for a native project were not performed. These pins must be locked and tested together before production use. [Expo SDK reference](https://docs.expo.dev/versions/latest/), [official blank template package](https://registry.npmjs.org/expo-template-blank-typescript/58.0.32), [Watermelon release package](https://registry.npmjs.org/@nozbe%2fwatermelondb/0.28.0).

Configuration to test: Expo development build, Hermes, New Architecture, Watermelon SQLite adapter with `jsi: true`, no Expo Go database substitute. Expo SDK 55+ does not support disabling New Architecture. The Watermelon podspec includes native shared/iOS sources and SQLite linkage, but that does not establish New Architecture compatibility. Its simdjson dependency requires the documented CocoaPods configuration. [Expo architecture policy](https://docs.expo.dev/guides/new-architecture/), [Watermelon installation](https://watermelondb.dev/docs/Installation), [pinned podspec](https://github.com/Nozbe/WatermelonDB/blob/v0.28.0/WatermelonDB.podspec).

The pinned RN helper reports minimum iOS 15.1 and Xcode 16.1. Those are component minima, not a verified effective minimum for this Expo combination or today's macOS. Agent D must record the generated deployment target, selected Xcode/SDK and supported device matrix. Proposed reference: a physical 390pt iPhone, with a 375pt device as the smallest-layout check; choose actual available models before measuring. [RN helper source](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/scripts/cocoapods/helpers.rb).

## Reproduction after the environment is available

These commands were **not run** here. Install/select a compatible full Xcode and simulator runtime, accept its license, and make CocoaPods available first. Do not globally switch developer tools as an incidental app task. Verify `xcodebuild -version`, `xcode-select -p`, `xcrun simctl list devices available` and `pod --version` before continuing.

Create a fresh disposable project outside this checkout:

```sh
BD_C_SPIKE_ROOT="$(mktemp -d -t body-dashboard-db-spike)"
cd "$BD_C_SPIKE_ROOT"
npx --yes create-expo-app@5.0.0 body-dashboard-db-spike --template expo-template-blank-typescript@58.0.32 --no-install
cd body-dashboard-db-spike
npm install --save-exact expo@58.0.23 react@19.3.0 react-native@0.88.1 expo-dev-client@58.0.18 @nozbe/watermelondb@0.28.0 @nozbe/simdjson@3.9.4
npm install --save-dev --save-exact typescript@6.0.3 @babel/plugin-proposal-decorators@7.28.0
npx expo install --check
npx expo prebuild --platform ios --no-install
```

Record Node/npm versions and preserve the resulting package lock. Verify the generated project's own remaining template dependency ranges; freeze their resolved versions before a repeatable native test. Keep the Expo Babel preset and add `['@babel/plugin-proposal-decorators', { legacy: true }]`. Do not replace the Expo preset with the old Metro-only example. Add inside the generated iOS target, idempotently:

```ruby
pod 'simdjson', path: '../node_modules/@nozbe/simdjson', modular_headers: true
```

Use autolinking for Watermelon; avoid introducing `use_frameworks!` just for this probe. For a later continuously generated production project, encode the Podfile adjustment in a reviewed local Expo config plugin and verify clean regeneration; no third-party plugin is silently selected here. Set a disposable bundle identifier, for example `com.bodydashboard.compatibility`, in the spike config.

Implement only this probe fixture (not the product UI):

1. Two workspace/athlete scopes; session table plus set table with optional numeric observations and indexed scope/parent IDs. Use real Watermelon Model fields and SQLiteAdapter, named `body-dashboard-compatibility`; `jsi: true`, schema version 1 and an explicit migrations object. Do not use `:memory:`.
2. A Write fixture button commits one scoped session and three sets (80kg×5, 82.5kg×5, missing load + 5 reps). Persist the generated IDs. Query by scope; show exactly three rows with null distinct from zero. The other scope sees none.
3. A Verify fixture button reads existing rows without reseeding or clearing the database. Run it after termination/relaunch with Metro disconnected and network unavailable. Compare IDs, values, nulls and row counts, not only a remembered UI state.
4. Add one optional field through a version-2 migration. Install over version 1 without removing its container. Verify the same IDs/values; separately test a fresh version-2 install. Test the app's pre-open downgrade gate before attempting an older binary.
5. Inject a batch error after intent acknowledgment. Verify rollback, reopen/rebuild the database session to avoid cached prepared values, look up the durable operation receipt, then retry with the same operation ID. There must be exactly one observed set.

Then run:

```sh
pod install --project-directory=ios
npx expo run:ios --configuration Debug
```

Capture full build output, Podfile.lock, package lock, simulator model/runtime, adapter settings and exact fixture IDs/results. With the simulator running, obtain its UDID from `xcrun simctl list devices booted`, set `BD_C_SIMULATOR_UDID` to that actual value, and run:

```sh
xcrun simctl terminate "$BD_C_SIMULATOR_UDID" com.bodydashboard.compatibility
xcrun simctl launch "$BD_C_SIMULATOR_UDID" com.bodydashboard.compatibility
```

These lifecycle commands are only the harness around the fixture; they do not themselves verify persisted values. Tap Verify fixture after relaunch. Repeat the read/write/relaunch and notification/lock behavior on a physical development-signed device; simulator success is not physical-device evidence. Build Release-like configuration for latency; debug/Metro timings do not satisfy the PRD.

## Native pass/fail gate

Pass requires compilation, real SQLite open, scope queries, persisted acknowledgment across process death, recovery from native write failure, migration preservation and recorded configuration. TypeScript checks, host SQL and source availability cannot substitute. Separate all results as simulator, physical device or host.

If the candidate fails a native build or durability test, retain logs and reduce to this probe. Compare the same fixture against **expo-sqlite 58.0.15** in a different disposable project. Its documented SQLCipher option requires a rebuilt binary and actual `cipher_version` verification; this does not establish Watermelon encryption. The fallback would require our own reactive subscriptions, migration orchestration and record-sync tracking/protocol. Return the cost and failure evidence to product/team-lead review before changing the production engine. No second copy of domain records is to be maintained beside Watermelon. [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

Current gate: **architecture/host checks complete; native compatibility blocked by environment; Watermelon remains the provisional candidate; production build has not started.**
