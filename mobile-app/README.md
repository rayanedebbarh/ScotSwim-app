# ScotSwim mobile (Capacitor wrapper)

This wraps the real ScotSwim web app (the files at the repo root —
`ScotSwim.dc.html` and friends) in a native iOS/Android shell using
[Capacitor](https://capacitorjs.com). There is only one copy of the app's
source: the root-level files. `www/` here is never committed — it's
regenerated from the root on every build by `scripts/sync-web.sh`, so this
folder can never drift out of sync with the live site.

## OTA updates (Capgo Cloud)

`@capgo/capacitor-updater` is installed and wired in — `componentDidMount`
in `ScotSwim.dc.html` calls `notifyAppReady()` (no-op outside the native
app), and `PrivacyInfo.xcprivacy` declares the UserDefaults API usage
Apple requires. Publishing an update is one step:

**GitHub → Actions → "Publish OTA Update (Capgo)" → Run workflow** (optionally
type a comment describing the change first). That's the whole process —
it builds the current web app, bumps the bundle version automatically, and
pushes it live to every installed copy within minutes. No app store review,
no manual zipping, no version bookkeeping.

One-time setup this needs (not done yet): add a repository secret named
`CAPGO_API_KEY` — GitHub → repo Settings → Secrets and variables → Actions
→ New repository secret — with a Capgo API key as the value (generate one
at console.capgo.app/dashboard/apikeys, or reuse the one from the
`capgo.app` onboarding flow). The workflow (`.github/workflows/
capgo-publish.yml`) registers the app and a default "production" channel
in Capgo Cloud automatically on first run if they don't already exist.

This is fully compliant with both stores: **Google Play and Apple both
explicitly allow OTA JS/HTML/CSS updates** for interpreted code (see the
plugin's compliance notes) — the one rule is it must never change native
code or the app's core purpose, only content.

## Known blocker before this is store-ready

The app currently renders its entire UI inside a **fixed 402×874px mockup
phone graphic** (fake status bar, rounded bezel, drop shadow), centered on a
dark background — see `ios-frame.jsx` / the `<IOSDevice>` wrapper around the
whole app in `ScotSwim.dc.html`. That was built for previewing the design
inside Claude's Design Canvas, not for an actual installed app. ~~On a real
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

```
npm install
npm run sync        # copies the root web app into www/, then cap syncs both platforms
npx cap open android # requires Android Studio
npx cap open ios     # requires Xcode (macOS only)
```

## Still needed before either store submission

1. **Add the `CAPGO_API_KEY` repo secret** (see above) to actually turn on
   OTA updates — everything else for it is already wired up.
2. **Real app icon** — replace `assets/icon-only.png` (and re-run
   `npx @capacitor/assets generate`) with Alma's actual team logo/mark.
3. **Apple Developer Program** account ($99/yr) — needed for App Store
   signing certificates and provisioning profiles.
4. **Google Play Console** account ($25 one-time) — needed for a Play App
   Signing key and to create the store listing.
5. Once both exist, the CI workflows can be extended to produce signed,
   submittable builds (a `.ipa` for TestFlight/App Store, an `.aab` for
   Play Store) using credentials stored as GitHub Actions secrets — ask for
   this once the accounts are ready.
6. Store listing assets: screenshots (several device sizes each store
   requires), an app description, a support URL, and a privacy policy URL
   (required by both stores since this app collects account data).
