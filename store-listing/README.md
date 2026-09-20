# Store assets

Everything here has been checked against the stores' own limits — see the
note on the old set below for why that matters.

```
screenshots/ios/    iPhone 6.9" (1290x2796), 6.5" (1284x2778), iPad 13" (2064x2752)
screenshots/play/   phone (1080x1920), tablet (1536x2048)
feature-graphic-1024x500.png   Play only; App Store has no equivalent
icon-512.png                   Play listing icon
appstore-icon-1024.png         App Store listing icon
listing.md                     description, keywords, short description
whats-new-1.1.txt              release notes for 1.1
```

All six screens show the app **in use** with real data: dashboard, meets,
training schedule, attendance, lift log, team roster.

## Why the previous set was replaced

The original screenshots led with a **login screen**. Apple rejected the
first submission under Guideline 2.3.3, which requires screenshots to show
the app in use rather than "the title art, login page, or splash screen".

They were also 1080x2400 — an aspect ratio of 2.22. Google Play requires a
screenshot's long side to be **at most twice** its short side, so that set
would have been refused there too, for an unrelated reason.

Both problems are fixed in the current set. If you ever regenerate these,
keep both constraints in mind: **app in use**, and **ratio at or under 2.0**.
