// Tests for the pure helpers. No framework, no browser: `node
// scotswim-core.test.js`. These ran against a live app in a headless
// browser before the functions moved out here, which took about ninety
// seconds a round; this takes milliseconds.
const assert = require('assert');
const C = require('./scotswim-core.js');

let passed = 0;
const check = (label, actual, expected) => {
  assert.deepStrictEqual(actual, expected, `${label}\n  expected ${JSON.stringify(expected)}\n  got      ${JSON.stringify(actual)}`);
  passed++;
};

// --- fmtDuration: minutes -> human ---
check('under an hour drops the hours part', C.fmtDuration(45), '45m');
check('exactly an hour', C.fmtDuration(60), '1h 0m');
check('rounds to the nearest minute', C.fmtDuration(95.4), '1h 35m');
check('zero', C.fmtDuration(0), '0m');

// --- attStateOf: three attendance states, with the legacy value ---
check('missing entry counts as present', C.attStateOf(undefined), 'present');
check('true is present', C.attStateOf(true), 'present');
check('legacy false reads as unexcused', C.attStateOf(false), 'unexcused');
check('explicit unexcused', C.attStateOf('unexcused'), 'unexcused');
check('excused', C.attStateOf('excused'), 'excused');
check('anything unrecognised is present', C.attStateOf('nonsense'), 'present');

// --- ymd / seasonStartYear: date keys ---
check('ymd pads month and day', C.ymd(new Date(2026, 0, 5)), '2026-01-05');
check('ymd end of year', C.ymd(new Date(2026, 11, 31)), '2026-12-31');

// --- agoLabel: relative time ---
const now = Date.now();
check('just now', C.agoLabel(now - 30 * 1000), 'just now');
check('minutes', C.agoLabel(now - 5 * 60000), '5m ago');
check('hours', C.agoLabel(now - 3 * 3600000), '3h ago');
check('yesterday', C.agoLabel(now - 26 * 3600000), 'yesterday');
check('days', C.agoLabel(now - 3 * 86400000), '3d ago');

// --- isTransient: which auth failures are worth retrying ---
check('network failure is transient', C.isTransient('auth/network-request-failed'), true);
check('a wrong password is not', C.isTransient('auth/wrong-password'), false);

// --- authErrMsg: every message is human, never a raw code ---
for (const code of ['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email',
                    'auth/too-many-requests', 'auth/network-request-failed']) {
  const msg = C.authErrMsg({ code });
  assert.ok(msg && !msg.includes('auth/'), `authErrMsg leaked the raw code for ${code}: ${msg}`);
  passed++;
}
const unknown = C.authErrMsg({ code: 'auth/something-new-apple-invented' });
assert.ok(unknown && !unknown.includes('auth/'), 'unknown codes must still get a human message');
passed++;

// --- niceTicks: axis numbers a person would have chosen ---
const ticks = C.niceTicks(0, 100, 5);
assert.ok(Array.isArray(ticks) && ticks.length >= 2, 'niceTicks returns a range');
assert.ok(ticks[0] <= 0 && ticks[ticks.length - 1] >= 100, 'ticks span the data');
const even = ticks.map((t, i) => i ? +(t - ticks[i - 1]).toFixed(6) : null).slice(1);
assert.ok(new Set(even).size === 1, `tick spacing must be uniform, got ${even}`);
passed += 3;

// --- fmt: the generic number formatter ---
check('fmt keeps two decimals', C.fmt(27.5), '27.50');

// --- isLiftSession: the Mark done button must find every lift ---
// The tag is the intended marker...
check('LIFT tag is a lift', C.isLiftSession({ tag: 'LIFT', n: 'Whatever' }), true);
check('a lowercase tag still counts', C.isLiftSession({ tag: 'lift', n: '' }), true);
// ...but coaches schedule lifts under other tags all the time, and the
// name is what gives them away. This is the case that was reported.
check('Team Lift in Sherm tagged DRY', C.isLiftSession({ tag: 'DRY', n: 'Team Lift in Sherm' }), true);
check('Lift — team', C.isLiftSession({ tag: 'POOL', n: 'Lift — team' }), true);
check('Lift on your own', C.isLiftSession({ tag: 'DRY', n: 'Lift on your own' }), true);
check('plural lifts', C.isLiftSession({ tag: 'DRY', n: 'Morning lifts' }), true);
check('lifting', C.isLiftSession({ tag: 'DRY', n: 'Lifting in Sherman' }), true);
// And it must not drag ordinary sessions in with them.
check('a pool set is not a lift', C.isLiftSession({ tag: 'POOL', n: 'Distance set' }), false);
check('dryland is not a lift', C.isLiftSession({ tag: 'DRY', n: 'Core + bands' }), false);
check('uplifting is not a lift', C.isLiftSession({ tag: 'POOL', n: 'Uplifting recovery swim' }), false);
check('a missing session is not a lift', C.isLiftSession(null), false);
check('an unnamed untagged session is not a lift', C.isLiftSession({}), false);

// --- lineupChange / lineupChangeMessage: say what the coach actually did ---
{
  const W = 'Coach Hamstra', M = 'Alma at Albion';
  const msg = (b, a) => C.lineupChangeMessage(C.lineupChange(b, a), W, M);
  const base = { pics: ['A', 'B'], pdf: null, notes: 'Bus 2:15' };
  check('first post', msg(null, base), 'Coach Hamstra posted the lineup for Alma at Albion');
  check('nothing changed -> no notification', msg(base, { ...base }), null);
  check('added one pic', msg(base, { ...base, pics: ['A', 'B', 'C'] }), 'Coach Hamstra added a pic to the lineup for Alma at Albion');
  check('added two pics', msg(base, { ...base, pics: ['A', 'B', 'C', 'D'] }), 'Coach Hamstra added 2 pics to the lineup for Alma at Albion');
  check('removed a pic', msg(base, { ...base, pics: ['A'] }), 'Coach Hamstra removed a pic from the lineup for Alma at Albion');
  check('reordered pics', msg(base, { ...base, pics: ['B', 'A'] }), 'Coach Hamstra updated the pics on the lineup for Alma at Albion');
  check('swapped a pic', msg(base, { ...base, pics: ['A', 'Z'] }), 'Coach Hamstra updated the pics on the lineup for Alma at Albion');
  check('note updated', msg(base, { ...base, notes: 'Bus 2:00' }), 'Coach Hamstra updated the note on the lineup for Alma at Albion');
  check('note removed', msg(base, { ...base, notes: '' }), 'Coach Hamstra removed the note from the lineup for Alma at Albion');
  check('note added', msg({ ...base, notes: '' }, base), 'Coach Hamstra added a note to the lineup for Alma at Albion');
  check('whitespace-only edit is not a change', msg(base, { ...base, notes: '  Bus 2:15 ' }), null);
  const pdf = { name: 'heat.pdf', pages: ['p1', 'p2'] };
  check('PDF added', msg(base, { ...base, pdf }), 'Coach Hamstra added a PDF to the lineup for Alma at Albion');
  check('PDF removed', msg({ ...base, pdf }, base), 'Coach Hamstra removed the PDF from the lineup for Alma at Albion');
  check('PDF replaced (same name, new pages)', msg({ ...base, pdf }, { ...base, pdf: { name: 'heat.pdf', pages: ['p1', 'p9'] } }),
    'Coach Hamstra replaced the PDF on the lineup for Alma at Albion');
  check('pics and note', msg(base, { ...base, pics: ['A'], notes: 'x' }), 'Coach Hamstra updated the pics and the note on the lineup for Alma at Albion');
  check('all three', msg(base, { pics: ['A'], pdf, notes: 'x' }), 'Coach Hamstra updated the pics, the PDF and the note on the lineup for Alma at Albion');
  check('removed PDF and note', msg({ ...base, pdf }, { ...base, notes: '' }),
    'Coach Hamstra removed the PDF and the note from the lineup for Alma at Albion');
  check('added pics and a PDF', msg(base, { ...base, pics: ['A', 'B', 'C', 'D'], pdf }),
    'Coach Hamstra added 2 pics and a PDF to the lineup for Alma at Albion');
  check('mixed kinds stay "updated"', msg({ ...base, pdf }, { ...base, pics: ['A', 'B', 'C'] }),
    'Coach Hamstra updated the pics and the PDF on the lineup for Alma at Albion');
  check('emptied lineup is flagged', C.lineupChange(base, { pics: [], pdf: null, notes: '' }).empty, true);
}

// --- fmtAnnDate: day, exact date and time, not just the date ---
{
  const ms = new Date('2026-09-23T16:12:00').getTime(); // a Wednesday
  const s = C.fmtAnnDate(ms);
  check('has the weekday', /^Wed,/.test(s), true);
  check('has the date', s.includes('Sep 23'), true);
  check('has a time', /\d{1,2}:\d{2}\s?[AP]M/i.test(s), true);
}

console.log(`✓ ${passed} assertions passed`);
