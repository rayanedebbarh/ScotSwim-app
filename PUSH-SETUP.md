# Push notifications — the console steps

The code is done. These are the parts only the account owner can do. The
in-app bell already works without any of this; push is the extra channel
that reaches a phone whose app is closed.

## 1. APNs auth key (Apple Developer)

1. developer.apple.com → Certificates, Identifiers & Profiles → **Keys** → **+**
2. Name it `ScotSwim Push`, tick **Apple Push Notifications service (APNs)**, Continue → Register
3. **Download the `.p8`** — Apple lets you download it exactly once. Store it
   with the Android keystore.
4. Note the **Key ID** (on that page) and your **Team ID** (top right of the
   developer site).

## 2. Firebase Cloud Messaging

1. Firebase Console → your project → ⚙ **Project settings** → **Cloud Messaging**
2. Under *Apple app configuration*, upload the `.p8` with the Key ID and Team ID.

## 3. Register the iOS app with Firebase

1. Project settings → **General** → **Add app** → iOS
2. Bundle ID: `edu.alma.scotswim`
3. Download **`GoogleService-Info.plist`** and put it at
   `mobile-app/ios/App/App/GoogleService-Info.plist`
4. In Xcode, drag it into the **App** target so it's bundled (tick
   "Copy items if needed", target **App**). Without this the app can't get
   an FCM token.

## 4. Blaze plan

Firebase Console → ⚙ → **Usage and billing** → **Details & settings** →
**Modify plan** → Blaze. Cloud Functions won't deploy on Spark.

Expected cost for this team: **$0**. The free allowance is 2M invocations a
month; this sends a handful a week.

## 5. Push capability in Xcode

`mobile-app/ios/App/App.xcworkspace` → select **App** → **Signing &
Capabilities** → **+ Capability** → **Push Notifications**.

Add **Background Modes** too and tick *Remote notifications* if you want
notifications to arrive while the app is backgrounded rather than closed.

## 6. Deploy the function

```
cd ~/ScotSwim-app
npm install -g firebase-tools     # once
firebase login                    # once
cd functions && npm install
cd .. && firebase deploy --only functions
```

The first deploy asks to enable a few APIs — say yes. It takes a couple of
minutes.

Check it afterwards with `firebase functions:log`. A send looks like:

```
announcement -> 12/14 delivered, 2 stale token(s) removed
```

## 7. Build and test

Push does **not** work in the iOS Simulator — it needs a real device.

1. `cd mobile-app && npm install && npm run sync && npx cap open ios`
2. Archive → Distribute → Upload, install from TestFlight
3. Sign in on the phone — iOS asks for notification permission the first
   time, right after sign-in
4. On a second device (or the website) sign in as a coach and post a team
   announcement
5. The first phone should buzz within a few seconds

## If nothing arrives

Work down this list — it's roughly most to least common.

- **No `GoogleService-Info.plist` in the bundle** → the app never gets a
  token. Check `users/<uid>.pushTokens` in Firestore; if it's missing or
  empty, this is why.
- **Push capability not added** in Xcode → registration fails silently.
- **Permission denied** on the device → iOS Settings → ScotSwim →
  Notifications.
- **Function not deployed, or erroring** → `firebase functions:log`.
- **Testing on the simulator** → won't ever work.
- **Testing with your own account** → you don't get notified about your own
  actions, by design. Use two accounts.
