<div align="center">

<img src="mobile-app/assets/icon-only.png" width="120" alt="ScotSwim icon" />

<h1>ScotSwim</h1>

<p><strong>A full-stack iOS team-management app for Alma College Swimming & Diving.</strong><br/>
Built entirely in JavaScript — live on the App Store and in daily use by 34 athletes and 2 coaches.</p>

<p>
  <img src="https://img.shields.io/badge/Platform-iOS-000000?style=for-the-badge&logo=apple&logoColor=white" />
  &nbsp;
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  &nbsp;
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  &nbsp;
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" />
</p>

<br/>

<!-- ▶ REPLACE THE # WITH YOUR ACTUAL APP STORE URL -->
<a href="#">
  <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on the App Store" height="50" />
</a>

</div>

---

<br/>

## 📱 Live on the App Store

<p align="center">
  <img src="store-listing/app-store-listing.webp" width="320" alt="ScotSwim on the App Store — 5.0 stars, Sports category" />
</p>

<p align="center"><em>5.0 ★ · Sports · Age 4+ · Published by Rayane Debbarh</em></p>

---

<br/>

## 🎓 Internship Final Project

ScotSwim was designed and built as the **final project for a Data Engineering internship at [Enopps](https://enopps.com)** — an IT consulting and engineering company based in Morocco, specializing in data solutions, software development, and digital transformation. The internship was hybrid, and the project was developed and shipped end-to-end over its course: from initial concept to a live App Store release used by a real team every day.

---

<br/>

## 🏊 What It Solves

Before ScotSwim, the season ran across paper heat sheets, group texts, spreadsheets, and third-party results sites. Athletes often didn't know what practice was that day. Coaches had no single place to keep any of it.

ScotSwim is that single place.

---

<br/>

## 📸 Screenshots

<p align="center">
  <img src="store-listing/screenshots/ios/1-dashboard-iphone-6.7-1290x2796.jpg" width="155" alt="Dashboard" />
  &nbsp;
  <img src="store-listing/screenshots/ios/2-progression-iphone-6.7-1290x2796.jpg" width="155" alt="Progression" />
  &nbsp;
  <img src="store-listing/screenshots/ios/3-training-iphone-6.7-1290x2796.jpg" width="155" alt="Training" />
  &nbsp;
  <img src="store-listing/screenshots/ios/8-meets-iphone-6.7-1290x2796.jpg" width="155" alt="Meets" />
  &nbsp;
  <img src="store-listing/screenshots/ios/7-goals-iphone-6.7-1290x2796.jpg" width="155" alt="Goals" />
</p>

<p align="center">
  <img src="store-listing/screenshots/ios/5-coach-dashboard-iphone-6.7-1290x2796.jpg" width="155" alt="Coach Dashboard" />
  &nbsp;
  <img src="store-listing/screenshots/ios/6-attendance-iphone-6.7-1290x2796.jpg" width="155" alt="Attendance" />
  &nbsp;
  <img src="store-listing/screenshots/ios/4-team-iphone-6.7-1290x2796.jpg" width="155" alt="Team" />
  &nbsp;
  <img src="store-listing/screenshots/ios/9-notifications-iphone-6.7-1290x2796.jpg" width="155" alt="Notifications" />
  &nbsp;
  <img src="store-listing/screenshots/ios/10-profile-iphone-6.7-1290x2796.jpg" width="155" alt="My Profile" />
</p>

---

<br/>

## ✨ Features

### For Athletes
| | |
|---|---|
| 🏠 **Dashboard** | Practice schedule for the week, upcoming meets, and team announcements at a glance |
| 📈 **Progression** | Log times and dive scores after every meet — the app builds a personal progression chart automatically |
| 🎯 **Goals** | View coach-set goals and prescribed workouts, track your own season targets |
| 🏋️ **Training Log** | Track miles swum, time in the pool, and independent lift check-ins |
| 📅 **Attendance** | Follow your own practice streak and attendance record |
| 🔔 **Notifications** | Real-time push alerts for announcements, schedule changes, and new goals — with configurable quiet hours and a daily practice reminder |
| 👤 **Profile** | Personal stats, bio, and photo with custom framing |

### For Coaches
| | |
|---|---|
| ✅ **Attendance** | Take practice attendance in seconds with excused / unexcused markings |
| 👥 **Roster & Schedule** | Edit the team roster and season meet calendar as things change |
| 🎯 **Per-Athlete Goals** | Set individual goals and write a prescribed workout for each swimmer or diver |
| 📢 **Announcements** | Post team-wide messages and attach workout sheets |
| 🧮 **Meet Simulator** | Project dual-meet scores against MIAA and Division III opponents, event by event, from both teams' entry times |
| 📊 **Lift Grid** | Week-at-a-glance view of who completed their independent lifts |

> **Access is invite-only.** Every account comes from a coach-generated invite link bound to a specific email and roster spot. Nothing in the app is visible outside the team.

---

<br/>

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Language** | JavaScript — 100% of the codebase |
| **UI Runtime** | Custom component system with declarative templating, rendering directly to the DOM — no framework |
| **Native Shell** | [Capacitor](https://capacitorjs.com) — wraps the web app in a WKWebView for iOS |
| **Authentication** | Firebase Authentication (email/password) |
| **Database** | Cloud Firestore — 11 collections, real-time listeners |
| **Push Notifications** | Firebase Cloud Messaging |
| **OTA Updates** | [Capgo](https://capgo.app) — ships bug fixes and UI changes without a store review cycle |
| **CI/CD** | GitHub Actions — iOS compile check, Android signed release build, OTA publish |

---

<br/>

## 🏗 Architecture

A single HTML file is the entire application. The UI layer is a custom declarative component runtime: components declare their output as a function of state, and the runtime diffs and patches the DOM. Capacitor wraps it in a native shell without requiring a rewrite — there is one copy of the source in the repo, and a sync script copies it into the native build so the shipped app and the hosted site can never drift apart.

### Firestore Data Model

| Collection | Holds | Written by |
|---|---|---|
| `users` | Account profile: role, roster binding | Account owner |
| `invites` | Outstanding invite tokens | Coaches |
| `roster` | Team roster additions and removals | Coaches |
| `myEvents` | Logged meet times and dive scores | Athletes |
| `trainingLog` | Training volume and lift check-ins | Athletes |
| `goalWorkouts` | Coach-prescribed workouts | Coaches |
| `training` | Weekly practice schedule | Coaches |
| `schedule` | Season meet calendar | Coaches |
| `attendance` | Per-day attendance marks | Coaches |
| `announcements` | Team announcements | Coaches |
| `workoutSheets` | Dated workout sheet attachments | Coaches |

Per-athlete documents are keyed by roster identity, so ownership is a property of the document path — not something the client asserts.

### Security Model

Access control lives in Firestore security rules, not in client code. Two predicates do most of the work: `isCoach()` reads the caller's own profile to verify their role, and `isSelf(rosterId)` verifies the caller is bound to the document they're writing.

### Derived Metrics

Nothing is stored that can be computed. Attendance rates, practice streaks (swim sessions only — a lift-only day neither extends nor breaks one), per-event improvement deltas against personal bests, weekly lift roll-ups, and the meet simulator's projected score are all derived at read time.

---

<br/>

## 🧩 Engineering Challenges

**Safe-area insets returned zero.**
`env(safe-area-inset-*)` reports 0 inside the Capacitor WKWebView, so the header sat under the status bar and the nav sat over the home indicator. Fixed by probing for a live value on mount and falling back to insets derived from screen dimensions, with a high-water mark so rotation never collapses the padding.

**Sign-in took seconds — and it wasn't the network.**
Loading the dashboard fired a separate state update per athlete profile, re-rendering the whole component tree ~30 times before it settled. Batching those reads into a single flush cut it to 9 DOM mutations.

**Account deletion silently did nothing.**
The profile document was deleted before the auth account, and a Firestore security rule blocked that delete — so the promise chain aborted and the account survived. Profile cleanup is now best-effort; the credential deletion runs regardless.

**"No account found" on a valid address.**
A race between Firebase Auth issuing a token and Firestore accepting it surfaced as `permission-denied`, which the app reported as a missing account. Transient codes are now classified and retried with exponential backoff — a wrong password still fails immediately rather than being masked by retries.

**Notification vibration fired on every login.**
The notifications listener compared incoming data against the previous state — which on first load was always zero, so any existing notification triggered the haptic. Fixed with a connection-established flag that skips the first snapshot.

---

<br/>

## 📁 Repository Layout

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
  app-store-listing.webp  App Store page screenshot
  listing.md              store description copy and keyword list
.github/workflows/        CI: Android signed build, iOS compile check, OTA publish
```

---

<br/>

## 🚀 Running Locally

Serve the repo root over HTTP and open `ScotSwim.dc.html` — there is no build step.

For the native builds:

```bash
cd mobile-app
npm install
npm run sync        # copies web assets from the repo root, then runs cap sync
npx cap open ios    # opens Xcode
```

> Firebase credentials are the project's public web config. Access is enforced by Firestore security rules, not by keeping the config secret.

---

<div align="center">
  <br/>
  <p>Built by <strong>Rayane Debbarh</strong> · Final project for a Data Engineering internship at <a href="https://enopps.com">Enopps</a>, Morocco</p>
  <p>
    <a href="https://rayanedebbarh.github.io/ScotSwim-app/privacy.html">Privacy Policy</a>
  </p>
</div>
