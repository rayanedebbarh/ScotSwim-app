# ScotSwim

A team-management app for the Alma College swimming and diving program — live on the
App Store and in daily use by 32 athletes and 2 coaches through the 2026–27 season.

Before ScotSwim, the season lived in paper heat sheets, group texts, spreadsheets and
third-party results sites. Athletes often didn't know what practice was that day; coaches
had nowhere single to keep any of it. This is that single place.

**[Privacy policy](https://rayanedebbarh.github.io/ScotSwim-app/privacy.html)** ·
iOS (App Store) · Android (Play Store submission in progress)

---

## What it does

**For athletes** — the week's practice schedule, the meet calendar, personal event goals,
logged times with an automatically-built progression chart, self-reported lift check-ins,
and a practice streak.

**For coaches** — attendance in a couple of taps, team announcements, an editable roster
and meet schedule, per-athlete goals and prescribed workouts, a week-at-a-glance lift
attendance grid, and a dual-meet simulator that projects a score against another school
from both teams' entry times.

Access is invite-only. There is no public sign-up: every account comes from a
coach-generated invite link bound to a specific email address and roster spot, and nothing
in the app is visible outside the roster.

## Architecture

A single-page app in a native shell. The UI is a component runtime with declarative
templating rendering to the DOM; [Capacitor](https://capacitorjs.com) wraps it in a
WKWebView for iOS and a WebView for Android. There is exactly one copy of the source —
the repo root — and `mobile-app/scripts/sync-web.sh` copies it into the native build, so
the shipped app and the hosted site can't drift apart.

### Data layer

Firebase Authentication (email/password only — no social sign-in) and Cloud Firestore,
across 11 collections:

| Collection | Holds | Written by |
|---|---|---|
| `users` | account profile: role, roster binding | the account owner |
| `invites` | outstanding invite tokens | coaches |
| `roster` | additions/removals over the built-in roster | coaches |
| `myEvents` | logged times and scores | the athlete |
| `trainingLog` | training volume and lift check-ins | the athlete |
| `goalWorkouts` | coach-prescribed workouts | coaches |
| `training` | weekly practice schedule | coaches |
| `schedule` | season meet calendar | coaches |
| `attendance` | per-day practice attendance | coaches |
| `announcements` | team announcements | coaches |
| `workoutSheets` | dated workout sheets | coaches |

Per-athlete documents are keyed by roster identity, so ownership is a property of the
document path rather than something the client asserts.

### Security model

Access control lives in Firestore security rules, not in client code — the app can be
read, modified or bypassed by anyone who installs it, so the rules are the only real
boundary. Two predicates do most of the work: `isCoach()` reads the caller's own profile
to check their role, and `isSelf(rosterId)` checks that the caller's profile is bound to
the document they're writing.

Two details worth noting, both of which caused real bugs before they were understood:

- Multiple `allow` statements on one path are **OR**-ed together. An `allow write` beside
  an `allow delete: if false` still permits deletes — the restrictive rule is dead. Paths
  that must not allow deletion name `create, update` explicitly instead.
- `users` deliberately permits a one-document `list`. The "forgot password?" check runs
  before anyone is authenticated and has to tell a real address from a typo, so the query
  is capped at a single document rather than opened up.

### Derived metrics

Nothing is stored that can be computed. Attendance rates, consecutive-practice streaks
(counting swim sessions only, so a lift-only day neither extends nor breaks one),
per-event improvement deltas against personal bests, weekly lift roll-ups, and the meet
simulator's projected score are all derived at read time from the logged records.

## Release pipeline

Two tracks, because most changes don't need a store review:

**Over-the-air** — the app's web content updates through
[Capgo](https://capgo.app) via a manually-triggered GitHub Actions workflow. Bug fixes,
schedule changes and UI work reach every installed copy within minutes, with no review
cycle. Permitted for interpreted code under both stores' rules.

**Store builds** — needed only when native code changes: plugins, permissions, icons,
the app shell itself. `android-release.yml` produces a signed `.aab` and `.apk` in CI
from a keystore held in repository secrets, with the Android SDK packages pinned
explicitly (the action's defaults ask for a `tools` package Google has since removed).
iOS is archived and uploaded from Xcode, since Apple's signing toolchain is macOS-only;
`ios-build.yml` compiles the native project on a macOS runner as a check that it still
builds.

The web app and the native builds share one source. `mobile-app/scripts/sync-web.sh`
copies the repo root into `www/` before every `cap sync`, and `www/` is never committed —
so the shipped app can't drift from the hosted site. An OTA bundle is built from that
same `www/`, which is why the two tracks can't diverge either.

## Some things that were harder than they looked

**Safe-area insets returned zero.** `env(safe-area-inset-*)` reports 0 inside the
Capacitor 8 WKWebView, so the header sat under the status bar and the nav bar under the
home indicator. Fixed by probing for a real value and falling back to insets derived from
screen dimensions, with a high-water mark so rotation doesn't collapse the padding.

**Sign-in took seconds, and it wasn't the network.** Loading the dashboard fired a
separate state update per athlete profile, re-rendering the whole tree ~30 times before
it settled. Batching those reads into a single flush cut it to 9 DOM mutations.

**Account deletion silently did nothing.** The profile document was deleted before the
auth account, and a security rule forbade that delete — so the promise chain aborted and
the login survived. Profile cleanup is now best-effort and the credential deletion runs
regardless.

**"No account found" on a valid account.** A race between Firebase Auth issuing a token
and Firestore accepting it surfaced as `permission-denied`, which the app reported as a
missing account. Transient codes are now classified and retried with backoff — while a
genuinely wrong password still fails immediately, rather than being masked by retries.

## Repository layout

```
ScotSwim.dc.html        the app — UI, state, Firestore wiring
support.js              shared helpers
image-slot.js           image handling
ios-frame.jsx           device-frame wrapper (desktop preview vs. full-bleed on device)
privacy.html            privacy policy (served by GitHub Pages)
mobile-app/             Capacitor project — ios/, android/, sync script
store-listing/          store assets and listing copy
.github/workflows/      CI: Android debug + signed release, iOS compile check, OTA publish
```

## Running it

Serve the repo root over HTTP and open `ScotSwim.dc.html` — there is no build step for
the web app. For the native builds:

```bash
cd mobile-app
npm install
npm run sync          # copy web assets from the repo root, then cap sync
npx cap open ios      # or: npx cap open android
```

Firebase credentials are the project's public web config; access is governed by the
security rules, not by hiding the config.
