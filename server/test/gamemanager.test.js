// gamemanager.test.js — drives the manager exactly the way socketHandlers does
// and inspects the emit instructions it returns. No sockets involved. Trail Boss
// is solo with three trail VARIANTS, so these focus on the solo lifecycle and on
// per-trail (per-side) grouping with no rival.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameManager } from '../src/GameManager.js';
import game from '../src/games/trailBoss.js';

const PIN = '4242';

function makeSession(manager, { requireApproval = false } = {}) {
  const res = manager.createSession({ pin: PIN, requireApproval });
  assert.ok(res.joinCode, 'session created');
  return res.joinCode;
}

function join(manager, joinCode, nickname, trail = 'chisholm') {
  const res = manager.joinStudent({ joinCode, nickname, mode: 'solo', nation: trail });
  assert.ok(!res.error, `join failed: ${res.error}`);
  return res;
}

const eventsOf = (emits, name) => emits.filter((e) => e.event === name);
const studentEvents = (emits, studentId, name) =>
  emits.filter((e) => e.to.type === 'student' && e.to.studentId === studentId && (!name || e.event === name));

// Play the student's current step with the historically right move for their trail.
function playRight(manager, joinCode, studentId) {
  const session = manager.registry.get(joinCode);
  const student = session.students.get(studentId);
  const match = session.matches.get(student.matchId);
  const move = game.aiMove(match.gameState, match.side);
  return manager.submitMove({ joinCode, studentId, move });
}

function playToEnd(manager, joinCode, studentId) {
  let last;
  for (let i = 0; i < 12; i++) {
    last = playRight(manager, joinCode, studentId);
    assert.ok(!last.error, `step ${i}: ${last.error}`);
  }
  return last;
}

test('createSession rejects a bad PIN', () => {
  const manager = new GameManager();
  assert.equal(manager.createSession({ pin: 'abc' }).error, 'bad_pin');
  assert.equal(manager.createSession({ pin: '12345' }).error, 'bad_pin');
});

test('the default game is Trail Boss', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  assert.equal(manager.registry.get(joinCode).gameId, 'trail-boss');
});

test('teacher ops require the right PIN', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  assert.equal(manager.endSession({ joinCode, pin: '9999' }).error, 'bad_pin');
  assert.equal(manager.setApproval({ joinCode, pin: '0000', requireApproval: false }).error, 'bad_pin');
});

test('solo student starts on their chosen trail and completes with 100% accuracy', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana', 'goodnight');

  const begin = studentEvents(res.emits, res.studentId, 'match:begin');
  assert.equal(begin.length, 1, 'solo match begins on join');
  assert.equal(begin[0].payload.side, 'goodnight', 'the side is the chosen trail');
  assert.equal(begin[0].payload.mode, 'solo');
  assert.equal(begin[0].payload.chapterCount, 6, 'six legs');
  assert.equal(begin[0].payload.rivalMeters, null, 'three variant sides, but no rival');
  assert.ok(begin[0].payload.meta.variants.goodnight.waypoints.length, 'the trail’s waypoints ship with the board');
  assert.equal(studentEvents(res.emits, res.studentId, 'chapter:event').length, 1);
  assert.equal(studentEvents(res.emits, res.studentId, 'turn:begin').length, 1);

  const last = playToEnd(manager, joinCode, res.studentId);
  const end = studentEvents(last.emits, res.studentId, 'match:end');
  assert.equal(end.length, 1, 'match ends after 12 actions');
  assert.equal(end[0].payload.you.accuracy, 100);
  assert.equal(end[0].payload.yourSide, 'goodnight');
  assert.equal(end[0].payload.you.ending.key, 'top', 'a perfect run is Top Boss');
  assert.ok(end[0].payload.you.score >= 210);
  assert.equal(end[0].payload.rival, null, 'no rival card — trails never oppose');

  assert.equal(eventsOf(last.emits, 'student:end').length, 1);
  const roster = manager.roster(manager.registry.get(joinCode));
  assert.equal(roster.students[0].status, 'completed');
  assert.equal(roster.students[0].accuracy, 100);
  assert.equal(roster.students[0].nation, 'goodnight', 'roster records the trail');
});

test('class accuracy is grouped per trail, and only for the trails played', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const a = join(manager, joinCode, 'Ana', 'chisholm');
  const b = join(manager, joinCode, 'Leo', 'western');
  playToEnd(manager, joinCode, a.studentId);
  playToEnd(manager, joinCode, b.studentId);

  const { classAccuracy } = manager.roster(manager.registry.get(joinCode));
  assert.deepEqual(Object.keys(classAccuracy).sort(), ['chisholm', 'goodnight', 'western']);
  assert.equal(classAccuracy.chisholm.count, 1);
  assert.equal(classAccuracy.chisholm.average, 100);
  assert.equal(classAccuracy.western.count, 1);
  assert.equal(classAccuracy.western.average, 100);
  assert.equal(classAccuracy.goodnight.count, 0, 'a trail nobody rode has no completions');
});

test('approval gate: solo student waits, then starts on approve', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager, { requireApproval: true });
  const res = join(manager, joinCode, 'Leo', 'western');
  assert.equal(res.approved, false);
  assert.equal(studentEvents(res.emits, res.studentId, 'match:begin').length, 0);

  const ok = manager.approveStudent({ joinCode, pin: PIN, studentId: res.studentId });
  assert.equal(studentEvents(ok.emits, res.studentId, 'join:approved').length, 1);
  assert.equal(studentEvents(ok.emits, res.studentId, 'match:begin').length, 1);
});

test('a wrong-kind move is rejected', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana', 'chisholm');
  // Chisholm Leg 1 step 1 is a decision (hire crew); submit a map action instead.
  const bad = manager.submitMove({ joinCode, studentId: res.studentId, move: { kind: 'map', choiceIndex: 0 } });
  assert.equal(bad.error, 'wrong_step_kind');
});

test('a map move places a marker the client can render', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana', 'chisholm');
  // Play right until a map action reports a placed marker (Chisholm Leg 2 crossing).
  let placed = null;
  for (let i = 0; i < 12 && !placed; i++) {
    const out = playRight(manager, joinCode, res.studentId);
    const resolution = studentEvents(out.emits, res.studentId, 'turn:resolution')[0];
    if (resolution?.payload.placed) placed = resolution.payload;
  }
  assert.ok(placed, 'a map action placed a marker during the run');
  assert.ok(placed.map.positions[placed.placed.position].markers.length >= 1);
});

test('rejoin returns a full snapshot of the live turn', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana', 'chisholm');
  playRight(manager, joinCode, res.studentId); // Leg 1 decision done; the chuck-wagon map action is pending

  manager.markDisconnected({ joinCode, studentId: res.studentId });
  const back = manager.rejoinStudent({ joinCode, studentId: res.studentId });
  assert.ok(!back.error);
  assert.equal(back.sync.screen, 'match');
  assert.equal(back.sync.turn.kind, 'map', 'the pending step is Leg 1’s chuck-wagon action');
  assert.equal(back.sync.turn.yourTurn, true);
  assert.ok(back.sync.matchBegin.meta.variants.chisholm.waypoints, 'meta ships with the snapshot');
  assert.equal(back.sync.matchBegin.rivalMeters, null, 'no rival meters in a variant solo game');
  assert.ok(Array.isArray(back.sync.turn.choices) && back.sync.turn.choices.length === 3);
});

test('end_session wipes the session from memory', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  join(manager, joinCode, 'Ana', 'chisholm');
  const res = manager.endSession({ joinCode, pin: PIN });
  assert.ok(eventsOf(res.emits, 'session:ended').length >= 2, 'teacher + student notified');
  assert.equal(manager.registry.get(joinCode), undefined);
});

test('students cannot reach teacher data: report requires the PIN', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  assert.equal(manager.sessionReport({ joinCode, pin: '1111' }).error, 'bad_pin');
  assert.ok(manager.sessionReport({ joinCode, pin: PIN }).report);
});
