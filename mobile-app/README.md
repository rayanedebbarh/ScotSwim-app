# ScotSwim mobile (Capacitor wrapper)

This wraps the real ScotSwim web app (the files at the repo root —
`ScotSwim.dc.html` and friends) in a native iOS/Android shell using
[Capacitor](https://capacitorjs.com). There is only one copy of the app's
source: the root-level files. `www/` here is never committed — it's
regenerated from the root on every build by `scripts/sync-web.sh`, so this
folder can never drift out of sync with the live site.

## Releases

Everything ships through the app stores — there is no over-the-air update
channel. One path to production means what's installed is always what was
reviewed. See "Android: signed release build" below for the CI build, and
`ios-build.yml` for the macOS compile check.

## The device-frame wrapper (resolved)

The app currently renders its entire UI inside a **fixed 402×874px mockup
phone graphic** (fake status bar, rounded bezel, drop shadow), centered on a
dark background — see `ios-frame.jsx` / the `<IOSDevice>` wrapper around the
whole app in `ScotSwim.dc.html`. That was built for previewing the design
inside the design canvas, not for an actual installed app. ~~On a real
device (native build or otherwise) it would show a small floating phone
shape in a black void instead of filling the screen~~ — **fixed**: full-
bleed under 560px viewport width (covers every real phone), real
safe-area-inset padding instead of the fake status bar/home-indicator, and
the original framed-mockup look preserved above 560px for the Design
Canvas preview.

## What's set up

- `npx cap add android` / `add ios` have been run — both native projects
  exist (`android/`, `ios/`).
- App icon + splash screen generated from `assets/icon-only.png` (a
  placeholder maroon/cream "AS" monogram — swap this for Alma's real team
  logo before shipping, then re-run `npx @capacitor/assets generate`).
- `appId` is set to `edu.alma.scotswim` in `capacitor.config.json` — this
  becomes the permanent bundle ID / package name once submitted to either
  store. Changing it later means a new app listing, not an update, so
  confirm this is the ID you want before the first real submission.
- Two GitHub Actions workflows build both platforms in CI (since this
  sandboxed environment can't reach `dl.google.com` to install the Android
  SDK itself, and iOS can only be built on macOS):
  - `.github/workflows/android-build.yml` — builds an unsigned debug APK
    on every push to `mobile-app/**`, uploaded as a workflow artifact you
    can download and sideload onto an Android device to test.
  - `.github/workflows/ios-build.yml` — builds for the iOS Simulator only
    (no signing certificate needed yet), just to prove the native project
    compiles cleanly.

## Local development

Run these from inside this `mobile-app` folder, not the repo root —
`package.json` lives here, one level down from where you cloned the repo:

```
cd mobile-app        # skip if your terminal is already in mobile-app/
npm install
npm run sync        # copies the root web app into www/, then cap syncs both platforms
npx cap open android # requires Android Studio
npx cap open ios     # requires Xcode (macOS only)
```

## Android: signed release build (Play Store-ready)

`.github/workflows/android-release.yml` builds a signed `.aab` (upload this
to Play Console) and a signed `.apk` (for sideload testing) — manually
triggered from GitHub → Actions → "Android Release Build (signed)" → Run
workflow. It needs a one-time signing keystore, generated **on your own
machine** (not in CI) since losing it means you can never
publish an update to the same Play Store listing again:

```
keytool -genkeypair -v -keystore scotswim-release.keystore -alias scotswim \
  -keyalg RSA -keysize 2048 -validity 10000
```

It'll prompt for a store password, a key password (fine to reuse the same
value for both), and some identity fields (name/org/etc. — cosmetic, not
verified by anyone). **Keep this file and its passwords somewhere safe and
backed up outside this repo** — that's the only copy.

Then add four repo secrets (GitHub → repo Settings → Secrets and variables
→ Actions → New repository secret):

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 scotswim-release.keystore` (Linux) or `base64 -i scotswim-release.keystore \| pbcopy` (macOS) |
| `ANDROID_KEYSTORE_PASSWORD` | the store password you set above |
| `ANDROID_KEY_ALIAS` | `scotswim` (or whatever `-alias` you used) |
| `ANDROID_KEY_PASSWORD` | the key password you set above |

Once those exist, run the workflow — the signed `.aab`/`.apk` show up as a
downloadable workflow artifact a few minutes later.

## iOS: needs a Mac

Apple's build/signing toolchain (Xcode, code signing, provisioning
profiles, TestFlight/App Store Connect upload) only runs on macOS — there's
no way around that from a Linux CI runner or this session. `ios-build.yml`
proves the native project compiles (simulator only, unsigned), but the
actual signed build for a real device or App Store submission needs to
happen on a Mac: either your own, or a cloud Mac CI service (Codemagic and
Bitrise both have Capacitor-specific docs; GitHub itself offers
`macos-latest` runners, which `ios-build.yml` already uses — that job could
be extended the same way as the Android one once you have an Apple
Developer account, a Distribution certificate, and a provisioning profile
to feed it as secrets).

## Status

- **iOS** — live on the App Store.
- **Android** — signed `.aab` builds in CI; Play Console submission in
  progress. New personal developer accounts must run a closed test with 12+
  testers for 14 consecutive days before a production release is allowed.
- App icon, screenshots, listing copy, support URL and privacy policy URL
  are all done for both stores.
