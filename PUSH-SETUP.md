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

## 2. Register the iOS app with Firebase — do this BEFORE step 3

The Cloud Messaging tab shows no Apple section until an iOS app exists in
the project. If your project has only a Web app, that's why it looks like
the upload spot is missing.

1. Firebase Console → ⚙ **Project settings** → **General**
2. Scroll to **Your apps** → **Add app** → the **iOS** icon
3. Apple bundle ID: `edu.alma.scotswim` — it has to match exactly, it's
   what ties the APNs key to this app
4. App nickname: ScotSwim (optional). App Store ID: leave blank.
5. **Register app** → **Download GoogleService-Info.plist**
6. **Skip the remaining steps it shows you** (Add Firebase SDK, add
   initialisation code, CocoaPods). The Capacitor plugin brings the native
   SDK in itself — following those steps by hand causes duplicate-framework
   build errors. Just download the file and click through to Continue to
   console.
7. Put the file at `mobile-app/ios/App/App/GoogleService-Info.plist`, then
   in Xcode drag it into the **App** target (tick "Copy items if needed",
   target **App**). Without it bundled, the app never gets an FCM token.

## 3. Upload the APNs key

Now that the iOS app exists, the section is there:

1. Project settings → **Cloud Messaging**
2. Scroll to **Apple app configuration** — it appears under the iOS app you
   just registered
3. Upload the `.p8` with your **Key ID** and **Team ID**

## 4. Blaze plan

Firebase Console → ⚙ → **Usage and billing** → click **Upgrade** in the
banner at the top of that page. (Google moves this around; if the banner
isn't there, look under the **Account & budgets** tab.) Cloud Functions
won't deploy on Spark.

You'll need a Cloud Billing account — a card is required even though
nothing here will be charged. Set the budget alert it offers you; $5/month
is plenty, and it means you hear about a runaway cost rather than finding
it on a statement.

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
