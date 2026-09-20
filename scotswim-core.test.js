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

console.log(`✓ ${passed} assertions passed`);
