# ScotSwim — store listing draft

Everything below is ready to paste into Play Console and App Store Connect.

---

## App identity

- **App name**: ScotSwim
- **Publisher / developer name**: Rayane Debbarh
- **Bundle ID / package name**: `edu.alma.scotswim` (already set in `capacitor.config.json` — this is permanent once submitted, changing it later means a new listing, not an update)
- **Category**: Sports
- **Support email**: ardebbarh@gmail.com
- **Privacy policy URL**: `https://rayanedebbarh.github.io/ScotSwim-app/privacy.html` (live once `privacy.html` is merged — already written, see that file)

---

## Google Play Store

**Short description** (max 80 characters):
```
Alma College Swimming & Diving — roster, schedule, times, and team goals.
```
(74 characters)

**Full description** (max 4000 characters):
```
ScotSwim is the official team app for Alma College Swimming & Diving —
built for the Scots' athletes and coaches to run the season together in
one place.

FOR ATHLETES
• Log your times and dive scores after every meet and watch your
  progression chart build itself
• Set your own season goals, and see the goals and workouts your coach
  has set for you
• Track training volume — miles and minutes logged per session
• Mark off the lifts you do on your own
• Check the weekly practice schedule, meet calendar and team roster
• Follow your practice attendance and current streak
• Get notified when a coach posts an announcement, changes the meet
  schedule, or sets you a new goal

FOR COACHES
• Take practice attendance in seconds, marking absences excused or
  unexcused
• See at a glance who has been getting their lifts in
• Set individual goals and write a prescribed workout for each athlete
• Edit the roster and the season meet schedule as things change
• Post announcements, workout sheets and lift schedules
• Run a Meet Simulator to project dual-meet scores against MIAA and
  national Division III opponents, event by event

Built specifically around swimming and diving — dive scores, boards, and
diving-specific goal tracking work the same way times and swim goals do,
rather than being bolted on afterwards.

Accounts are by invite only, issued by your coach. This is a private team
app, not a public directory: nothing in it is visible to anyone outside
the roster.
```

**Category**: Sports
**Content rating questionnaire**: no user-generated public content, no
ads, no in-app purchases, no location collection, no violence/mature
content — should land in the lowest rating tier (Everyone) in every
regional rating system Play asks about (ESRB/PEGI/etc., auto-generated
from the questionnaire).
### Data safety answers (Play Console)

Play asks this as a questionnaire. These are the accurate answers for the
current build — checked against what the app actually writes, not what it
used to.

**Does your app collect or share any of the required user data types?** Yes

**Collected, linked to the user, for App functionality — none of it shared
with third parties, none of it used for tracking or advertising:**

| Data type | Category | Why |
|---|---|---|
| Email address | Personal info | Sign-in (Firebase Authentication) |
| Name | Personal info | Which roster entry the account belongs to |
| Other user-generated content | App activity | Logged times, goals, training entries, attendance, announcements |
| Device or other IDs | Device or other IDs | Push notification token, so a notification reaches the right phone |

**Not collected:** location, contacts, financial info, health info,
messages, calendar, search history, browsing history, installed apps,
audio, files, or advertising data.

**Photos:** not collected. A profile photo and its framing are kept in the
app's own storage on that device and are never uploaded.

**Security practices:**
- Data encrypted in transit: **Yes** (HTTPS / Firestore)
- Users can request that data be deleted: **Yes** — in-app at Menu >
  Delete my account, and by email, both documented in the privacy policy
- Data can be deleted without leaving the app: **Yes**
- Independent security review: No
- Committed to Play Families Policy: not applicable — the app is not
  directed at children

**A note on Firebase:** Play distinguishes *sharing* (transfer to a third
party) from transfer to a service provider processing data on your behalf.
Firebase is the latter, so the honest answer to "shared with third
parties" is **No**.

---

## Apple App Store

**Subtitle** (max 30 characters):
```
Alma Scots Swim & Dive Team
```
(27 characters)

**Promotional text** (max 170 characters, editable without a new review):
```
Log times and dive scores, track training, see your coach's goals and
workouts, and check the schedule — all in one place for Alma Swimming &
Diving.
```

**Description** (max 4000 characters) — same copy as the Play Store full
description above works as-is.

**Keywords** (max 100 characters, comma-separated, no spaces needed):
```
swimming,diving,alma college,scots,team,roster,times,meet,coach,training,goals,ncaa
```

**Category**: Sports
**Age rating**: 4+ (no objectionable content of any kind)

---

## Status

**App Store** — live. Version 1.1 submitted and in review.

**Play Store** — not yet submitted. What's left:

1. Play Console account ($25, Personal) — verification in progress
2. Create the app, fill this listing, upload the signed `.aab` from the
   "Android Release Build (signed)" workflow
3. Closed testing: **12 testers opted in for 14 consecutive days** before
   Google allows a production release. This is the long pole — new personal
   developer accounts can't skip it. Invite ~20 people to land 12.
4. Apply for production access, then submit

Screenshots and graphics are in `screenshots/play/` and verified against
Play's limits — see `README.md` here for what went wrong with the previous
set and why.
