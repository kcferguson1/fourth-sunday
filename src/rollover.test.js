/**
 * Unit tests for the Latin-square rollover algorithm (proposeSchedule).
 *
 * Run with: node src/rollover.test.js
 *
 * These tests are standalone — they import only the pure function,
 * not the Google Apps Script environment.
 */

'use strict';

// ---------------------------------------------------------------------------
// Inline the pure function (copy of proposeSchedule from rollover.gs)
// Without a build step, we re-implement the signature here for Node test use.
// ---------------------------------------------------------------------------

function proposeSchedule({ speakers, wards, dates, overrides, lockedCells }) {
  if (!speakers || speakers.length === 0) throw new Error('proposeSchedule: speakers list is empty');
  if (!wards    || wards.length === 0)    throw new Error('proposeSchedule: wards list is empty');
  if (!dates    || dates.length === 0)    throw new Error('proposeSchedule: dates list is empty');

  const N = speakers.length;
  const assignments = [];

  dates.forEach((date, monthIndex) => {
    wards.forEach((ward, wardIndex) => {
      const cellKey = `${date}:${ward}`;
      if (lockedCells && lockedCells.has(cellKey)) return;

      const wardOverrideLabel   = overrides[cellKey];
      const wildcardOverrideLabel = overrides[`${date}:*`];
      const overrideLabel = wardOverrideLabel || wildcardOverrideLabel;

      if (overrideLabel) {
        assignments.push({ date, ward, speaker: '', status: 'skipped', notes: overrideLabel, locked: false });
        return;
      }

      const speaker = speakers[(monthIndex + wardIndex) % N];
      assignments.push({ date, ward, speaker, status: 'pending', notes: '', locked: false });
    });
  });

  return assignments;
}

function findDoubleAssignments(assignments) {
  const map = {};
  assignments.forEach(a => {
    if (!a.speaker) return;
    const key = `${a.date}:${a.speaker}`;
    if (!map[key]) map[key] = { date: a.date, speaker: a.speaker, wards: [] };
    map[key].wards.push(a.ward);
  });
  return Object.values(map).filter(x => x.wards.length > 1);
}

// ---------------------------------------------------------------------------
// Minimal test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${label}`);
    console.error(`     ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || ''}\n     expected: ${JSON.stringify(expected)}\n     got:      ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(`${msg || ''}\n     expected: ${b}\n     got:      ${a}`);
  }
}

function assertThrows(fn, msgFragment) {
  let threw = false;
  try { fn(); } catch (e) {
    threw = true;
    if (msgFragment && !e.message.includes(msgFragment)) {
      throw new Error(`Expected error containing "${msgFragment}" but got "${e.message}"`);
    }
  }
  if (!threw) throw new Error('Expected function to throw but it did not');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const SPEAKERS = ['Alice', 'Bob', 'Carol', 'Dave'];
const WARDS    = ['Ward A', 'Ward B', 'Ward C'];
const DATES    = ['2026-01-25', '2026-02-22', '2026-03-29'];

console.log('\nrollover.gs — proposeSchedule()\n');

test('produces one assignment per (date, ward) pair', () => {
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides: {}, lockedCells: new Set() });
  assertEqual(result.length, DATES.length * WARDS.length, 'assignment count');
});

test('first month: speaker index = (0 + wardIndex) % N', () => {
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides: {}, lockedCells: new Set() });
  const month0 = result.filter(a => a.date === DATES[0]);
  assertEqual(month0[0].speaker, 'Alice', 'ward 0 month 0');
  assertEqual(month0[1].speaker, 'Bob',   'ward 1 month 0');
  assertEqual(month0[2].speaker, 'Carol', 'ward 2 month 0');
});

test('second month shifts by one', () => {
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides: {}, lockedCells: new Set() });
  const month1 = result.filter(a => a.date === DATES[1]);
  assertEqual(month1[0].speaker, 'Bob',   'ward 0 month 1');
  assertEqual(month1[1].speaker, 'Carol', 'ward 1 month 1');
  assertEqual(month1[2].speaker, 'Dave',  'ward 2 month 1');
});

test('speaker list wraps around modulo N', () => {
  const shortSpeakers = ['X', 'Y'];
  const result = proposeSchedule({ speakers: shortSpeakers, wards: WARDS, dates: DATES, overrides: {}, lockedCells: new Set() });
  // month 0: (0+0)%2=X, (0+1)%2=Y, (0+2)%2=X
  const m0 = result.filter(a => a.date === DATES[0]);
  assertEqual(m0[0].speaker, 'X');
  assertEqual(m0[1].speaker, 'Y');
  assertEqual(m0[2].speaker, 'X');
});

test('ward-specific override produces skipped status', () => {
  const overrides = { '2026-01-25:Ward B': 'Ward Conference' };
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides, lockedCells: new Set() });
  const skipped = result.find(a => a.date === '2026-01-25' && a.ward === 'Ward B');
  assertEqual(skipped.status, 'skipped');
  assertEqual(skipped.notes, 'Ward Conference');
  assertEqual(skipped.speaker, '');
});

test('wildcard override (* ward) applies to all wards on that date', () => {
  const overrides = { '2026-02-22:*': 'Stake Conference' };
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides, lockedCells: new Set() });
  const feb = result.filter(a => a.date === '2026-02-22');
  assertEqual(feb.length, WARDS.length);
  feb.forEach(a => {
    assertEqual(a.status, 'skipped', `ward ${a.ward} should be skipped`);
    assertEqual(a.notes, 'Stake Conference');
  });
});

test('locked cells are omitted from output', () => {
  const lockedCells = new Set(['2026-01-25:Ward A', '2026-03-29:Ward C']);
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides: {}, lockedCells });
  assertEqual(result.length, DATES.length * WARDS.length - 2, 'locked cells excluded');
  const hasLocked = result.some(a =>
    (a.date === '2026-01-25' && a.ward === 'Ward A') ||
    (a.date === '2026-03-29' && a.ward === 'Ward C')
  );
  assertEqual(hasLocked, false, 'locked cells should not appear in output');
});

test('all proposed assignments have status "pending"', () => {
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides: {}, lockedCells: new Set() });
  const nonPending = result.filter(a => a.status !== 'pending' && a.status !== 'skipped');
  assertEqual(nonPending.length, 0, 'all non-skipped should be pending');
});

test('all proposed assignments have locked=false', () => {
  const result = proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: DATES, overrides: {}, lockedCells: new Set() });
  const hasLocked = result.some(a => a.locked === true);
  assertEqual(hasLocked, false, 'rollover proposals must not be pre-locked');
});

test('throws on empty speakers list', () => {
  assertThrows(
    () => proposeSchedule({ speakers: [], wards: WARDS, dates: DATES, overrides: {}, lockedCells: new Set() }),
    'speakers list is empty'
  );
});

test('throws on empty wards list', () => {
  assertThrows(
    () => proposeSchedule({ speakers: SPEAKERS, wards: [], dates: DATES, overrides: {}, lockedCells: new Set() }),
    'wards list is empty'
  );
});

test('throws on empty dates list', () => {
  assertThrows(
    () => proposeSchedule({ speakers: SPEAKERS, wards: WARDS, dates: [], overrides: {}, lockedCells: new Set() }),
    'dates list is empty'
  );
});

// ---------------------------------------------------------------------------
// Tests: findDoubleAssignments
// ---------------------------------------------------------------------------

console.log('\nrollover.gs — findDoubleAssignments()\n');

test('returns empty array when no speaker is doubled', () => {
  const assignments = [
    { date: '2026-01-25', ward: 'Ward A', speaker: 'Alice' },
    { date: '2026-01-25', ward: 'Ward B', speaker: 'Bob' },
    { date: '2026-01-25', ward: 'Ward C', speaker: 'Carol' },
  ];
  assertEqual(findDoubleAssignments(assignments).length, 0);
});

test('detects a speaker assigned to two wards on the same date', () => {
  const assignments = [
    { date: '2026-01-25', ward: 'Ward A', speaker: 'Alice' },
    { date: '2026-01-25', ward: 'Ward B', speaker: 'Alice' },
    { date: '2026-01-25', ward: 'Ward C', speaker: 'Carol' },
  ];
  const doubles = findDoubleAssignments(assignments);
  assertEqual(doubles.length, 1);
  assertEqual(doubles[0].speaker, 'Alice');
  assertEqual(doubles[0].wards.length, 2);
});

test('does not flag the same speaker on different dates', () => {
  const assignments = [
    { date: '2026-01-25', ward: 'Ward A', speaker: 'Alice' },
    { date: '2026-02-22', ward: 'Ward B', speaker: 'Alice' },
  ];
  assertEqual(findDoubleAssignments(assignments).length, 0);
});

test('ignores assignments with no speaker', () => {
  const assignments = [
    { date: '2026-01-25', ward: 'Ward A', speaker: '' },
    { date: '2026-01-25', ward: 'Ward B', speaker: '' },
  ];
  assertEqual(findDoubleAssignments(assignments).length, 0);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
