<div align="center">
  <h1>ScotSwim</h1>
  <p>A full-stack iOS team-management app for Alma College Swimming & Diving — built entirely in JavaScript and live on the App Store.</p>
  <p>
    <img src="https://img.shields.io/badge/Platform-iOS-black?style=flat-square&logo=apple" />
    <img src="https://img.shields.io/badge/Built%20with-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
    <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
    <img src="https://img.shields.io/badge/Status-Live%20on%20App%20Store-34C759?style=flat-square" />
  </p>
</div>

---

## Overview

Before ScotSwim, the season ran across paper heat sheets, group texts, spreadsheets, and third-party results sites. Athletes often didn't know what practice was that day. Coaches had no single place to keep any of it.

ScotSwim is that single place — used daily by **34 athletes and 2 coaches** through the 2026–27 season.

---

## Screenshots

<p align="center">
  <img src="store-listing/screenshots/ios/1-dashboard-iphone-6.7-1290x2796.jpg" width="160" alt="Dashboard" />
  <img src="store-listing/screenshots/ios/2-progression-iphone-6.7-1290x2796.jpg" width="160" alt="Progression" />
  <img src="store-listing/screenshots/ios/3-training-iphone-6.7-1290x2796.jpg" width="160" alt="Training" />
  <img src="store-listing/screenshots/ios/8-meets-iphone-6.7-1290x2796.jpg" width="160" alt="Meets" />
  <img src="store-listing/screenshots/ios/7-goals-iphone-6.7-1290x2796.jpg" width="160" alt="Goals" />
</p>

<p align="center">
  <img src="store-listing/screenshots/ios/5-coach-dashboard-iphone-6.7-1290x2796.jpg" width="160" alt="Coach Dashboard" />
  <img src="store-listing/screenshots/ios/6-attendance-iphone-6.7-1290x2796.jpg" width="160" alt="Attendance" />
  <img src="store-listing/screenshots/ios/4-team-iphone-6.7-1290x2796.jpg" width="160" alt="Team" />
  <img src="store-listing/screenshots/ios/9-notifications-iphone-6.7-1290x2796.jpg" width="160" alt="Notifications" />
</p>

---

## Features

### For Athletes
- **Dashboard** — practice schedule for the week, upcoming meets, and team announcements at a glance
- **Progression tracking** — log times and dive scores after every meet; the app builds a personal progression chart automatically
- **Goals** — view and track goals set by the coach, with prescribed workouts per goal
- **Training log** — track miles swum and time in the pool per session
- **Lift check-ins** — mark off independent lifts; coaches see who's keeping up
- **Practice attendance** — follow your own streak and attendance record
- **Notifications** — real-time push notifications for new announcements, schedule changes, and goal updates, with configurable quiet hours and a daily practice reminder

### For Coaches
- **Attendance** — take practice attendance in seconds with excused/unexcused markings
- **Roster & schedule** — edit the team roster and season meet calendar as things change
- **Per-athlete goals** — set individual goals and write a prescribed workout for each swimmer or diver
- **Announcements & workout sheets** — post team-wide messages and attach workout PDFs
- **Meet simulator** — project dual-meet scores against MIAA and Division III opponents, event by event, from both teams' entry times
- **Lift grid** — week-at-a-glance view of who completed their independent lifts

### Access Model
Invite-only. Every account comes from a coach-generated invite link bound to a specific email address and roster spot. Nothing in the app is visible to anyone outside the team.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | JavaScript (100% of the codebase) |
| UI | Custom component runtime with declarative templating, rendering directly to the DOM — no framework dependency |
| Native shell | [Capacitor](https://capacitorjs.com) — wraps the web app in a WKWebView for iOS |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore (11 collections, real-time listeners) |
| Push notifications | Firebase Cloud Messaging |
| OTA updates | [Capgo](https://capgo.app) — ships bug fixes and UI changes without a store review cycle |
| CI/CD | GitHub Actions — iOS compile check, Android signed release build |

---

## Architecture

A single HTML file is the entire application. The UI layer is a custom declarative component runtime: components declare their rendered output as a function of state, and the runtime diffs and patches the DOM. [Capacitor](https://capacitorjs.com) wraps it in a native shell for iOS and Android without requiring a rewrite — there is exactly one copy of the source in the repo, and a sync script copies it into the native build so the shipped app and the hosted site can never drift apart.

### Data Layer

Firebase Authentication and Cloud Firestore, with 11 Firestore collections:

| Collection | Holds | Written by |
|---|---|---|
| `users` | account profile: role, roster binding | account owner |
| `invites` | outstanding invite tokens | coaches |
| `roster` | team roster additions and removals | coaches |
| `myEvents` | logged meet times and dive scores | athletes |
| `trainingLog` | training volume and lift check-ins | athletes |
| `goalWorkouts` | coach-prescribed workouts | coaches |
| `training` | weekly practice schedule | coaches |
| `schedule` | season meet calendar | coaches |
| `attendance` | per-day practice attendance marks | coaches |
| `announcements` | team announcements | coaches |
| `workoutSheets` | dated workout sheet attachments | coaches |

Per-athlete documents are keyed by roster identity, so ownership is a property of the document path, not something the client asserts.

### Security Model

Access control lives in Firestore security rules — the client is open to inspection, so the rules are the only real enforcement boundary. Two predicates do most of the work: `isCoach()` reads the caller's own profile to verify their role, and `isSelf(rosterId)` verifies that the caller's profile is bound to the document they're writing.

### Derived Metrics

Nothing is stored that can be computed. Attendance rates, practice streaks (swim sessions only — a lift-only day neither extends nor breaks a streak), per-event improvement deltas against personal bests, weekly lift roll-ups, and the meet simulator's projected score are all derived at read time from the logged records.

---

## Engineering Challenges

**Safe-area insets returned zero.** `env(safe-area-inset-*)` reports 0 inside the Capacitor WKWebView, so the header sat under the status bar and the nav bar sat over the home indicator. Fixed by probing for a live value on mount and falling back to insets derived from screen dimensions, with a high-water mark so rotation never collapses the padding.

**Sign-in took seconds — and it wasn't the network.** Loading the dashboard fired a separate state update per athlete profile, re-rendering the whole component tree ~30 times before it settled. Batching those reads into a single flush cut it to 9 DOM mutations.

**Account deletion silently did nothing.** The profile document was deleted before the auth account, and a Firestore security rule blocked that delete — so the promise chain aborted and the account survived. Profile cleanup is now best-effort; the credential deletion runs regardless.

**"No account found" on a valid address.** A race between Firebase Auth issuing a token and Firestore accepting it surfaced as `permission-denied`, which the app reported as a missing account. Transient error codes are now classified and retried with exponential backoff — a wrong password still fails immediately rather than being masked by retries.

**Notification vibration fired on every login.** The notifications listener triggered a vibration whenever the snapshot returned data that was new compared to the previous state — which on first load was always zero, so any existing notification fired the haptic. Fixed with a connection-established flag that skips the first snapshot.

---

## Repository Layout

```
ScotSwim.dc.html          the entire app — UI, state machine, Firestore wiring
privacy.html              privacy policy (served via GitHub Pages)
photos/                   athlete profile photos
mobile-app/
  ios/                    Xcode project (Capacitor shell)
  android/                Android project (Capacitor shell)
  scripts/sync-web.sh     copies repo root into www/ before every cap sync
store-listing/
  screenshots/ios/        App Store screenshots (iPhone 6.9")
  listing.md              store description copy and keyword list
.github/workflows/        CI: Android signed build, iOS compile check, OTA publish
```

---

## Running Locally

Serve the repo root over HTTP and open `ScotSwim.dc.html` — there is no build step. For the native builds:

```bash
cd mobile-app
npm install
npm run sync        # copies web assets from repo root, then runs cap sync
npx cap open ios    # opens Xcode
```

Firebase credentials are the project's public web config. Access is governed by Firestore security rules, not by keeping the config secret.
