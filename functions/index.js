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
  lineup: 'Meet lineup posted',
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

    // Every account listing each token. One phone can appear on several
    // accounts' lists: sign out of one and into another on the same phone
    // and the old listing can survive. Taken at face value, that phone
    // then receives every one of those accounts' notifications — a coach
    // got a banner for their own post, with nothing in their bell.
    const listedBy = new Map(); // token -> [{ref, rosterId}]
    users.forEach((doc) => {
      const u = doc.data() || {};
      (u.pushTokens || []).forEach((t) => {
        if (!listedBy.has(t)) listedBy.set(t, []);
        listedBy.get(t).push({ref: doc.ref, uid: doc.id, rosterId: u.rosterId});
      });
    });
    if (listedBy.size === 0) return;

    // pushTokens/{token} records who signed in on that phone most recently,
    // and that account alone owns it. A token with no record comes from a
    // build older than the record; it is trusted only when exactly one
    // account lists it, since otherwise there is no telling whose phone it is.
    const ownerDocs = await db.getAll(
      ...[...listedBy.keys()].map((t) => db.collection('pushTokens').doc(t)));
    const owners = new Map(); // token -> user doc ref, for the send + cleanup
    const disowned = [];      // listings on accounts that no longer own the phone
    ownerDocs.forEach((snap) => {
      const t = snap.id;
      const listings = listedBy.get(t);
      const ownerUid = snap.exists ? (snap.data() || {}).uid : null;
      let owner = null;
      if (ownerUid) {
        owner = listings.find((l) => l.uid === ownerUid) || null;
        listings.filter((l) => l.uid !== ownerUid).forEach((l) => disowned.push({ref: l.ref, t}));
      } else if (listings.length === 1) {
        owner = listings[0];
      }
      // Nobody needs their phone buzzing about something they just did —
      // and it's the phone's owner that decides whose phone this is.
      if (!owner || (n.author && owner.rosterId === n.author)) return;
      owners.set(t, owner.ref);
    });
    if (disowned.length) {
      await Promise.all(disowned.map(({ref, t}) =>
        ref.update({pushTokens: FieldValue.arrayRemove(t)}).catch(() => {})));
    }

    const tokens = [...owners.keys()];
    if (tokens.length === 0) return;

    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {title: TITLES[n.type] || 'ScotSwim', body: n.msg},
      // Read by the app when the banner is tapped, to open the right screen.
      // ref points at the specific item (announcement id, meet id, event),
      // so tapping the banner opens that item rather than just its tab.
      data: {tab: String(n.tab || 'home'), type: String(n.type || ''), ref: String(n.ref || '')},
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
