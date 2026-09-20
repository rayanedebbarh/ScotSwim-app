// Sends a push notification when a coach creates a notifications document.
//
// This runs on a server because it has to: the credential that sends push
// can't ship inside the app, or anyone who unzipped the app could message
// the whole team. The app writes the notification document; this turns it
// into a push.
//
// The in-app bell does not depend on this — it reads the same documents
// directly. If this function is down, or never deployed, athletes still
// see everything the next time they open the app. Push is an extra
// delivery channel, not the mechanism.
const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {getMessaging} = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();

// What shows in bold on the lock screen. The document's own msg is the
// line underneath it.
const TITLES = {
  announcement: 'Team announcement',
  schedule: 'Meet schedule updated',
  goal: 'New goal for you',
};

exports.sendTeamNotification = onDocumentCreated(
  {document: 'notifications/{notificationId}', region: 'us-central1'},
  async (event) => {
    const n = event.data && event.data.data();
    if (!n || !n.msg) return;

    // 'team' goes to everyone; anything else is a roster id and goes to
    // that one athlete.
    let query = db.collection('users');
    if (n.target && n.target !== 'team') {
      query = query.where('rosterId', '==', n.target);
    }
    const users = await query.get();

    // token -> the user doc it came from, so invalid ones can be cleaned
    // up afterwards without a second lookup.
    const owners = new Map();
    users.forEach((doc) => {
      const u = doc.data() || {};
      // Nobody needs their phone buzzing about something they just did.
      if (n.author && u.rosterId === n.author) return;
      (u.pushTokens || []).forEach((t) => owners.set(t, doc.ref));
    });

    const tokens = [...owners.keys()];
    if (tokens.length === 0) return;

    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {title: TITLES[n.type] || 'ScotSwim', body: n.msg},
      // Read by the app when the banner is tapped, to open the right screen.
      data: {tab: String(n.tab || 'home'), type: String(n.type || '')},
      apns: {payload: {aps: {sound: 'default', badge: 1}}},
      android: {notification: {sound: 'default', channelId: 'scotswim'}},
    });

    // A token goes stale when someone reinstalls or signs out on a device.
    // Left in place they'd fail on every future send, so they're dropped.
    const dead = [];
    res.responses.forEach((r, i) => {
      const code = r.error && r.error.code;
      if (code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token') {
        dead.push(tokens[i]);
      }
    });
    await Promise.all(dead.map((t) =>
      owners.get(t).set({pushTokens: FieldValue.arrayRemove(t)}, {merge: true})
    ));

    console.log(
      `${n.type} -> ${res.successCount}/${tokens.length} delivered` +
      (dead.length ? `, ${dead.length} stale token(s) removed` : '')
    );
  }
);
