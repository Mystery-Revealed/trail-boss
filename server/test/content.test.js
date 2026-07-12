// content.test.js — sanity + historical-balance checks on the Trail Boss content
// bank, run for ALL THREE trail variants (spec §10).
import test from 'node:test';
import assert from 'node:assert/strict';
import game, { PHASES, WAYPOINTS, MARKERS, driveScore, endingFor } from '../src/games/trailBoss.js';

const TRAILS = ['chisholm', 'goodnight', 'western'];

test('three trail variants are registered as the sides, with no rival', () => {
  assert.deepEqual(game.sides.sort(), [...TRAILS].sort());
  assert.equal(game.hasOpponent, false, 'trails are parallel solo tracks, never rivals');
  assert.equal(game.totalActions, 12);
  assert.equal(game.chapterCount, 6);
  for (const t of TRAILS) assert.ok(game.meta.variants[t]?.waypoints?.length, `variant ${t} ships waypoints`);
});

for (const trail of TRAILS) {
  test(`[${trail}] six legs, each with an event and two graded steps (right/partial/wrong)`, () => {
    const phases = PHASES[trail];
    const waypointIds = new Set(WAYPOINTS[trail].map((w) => w.id));
    assert.equal(phases.length, 6, 'leg count');
    for (const [i, ph] of phases.entries()) {
      assert.ok(ph.title && ph.date && ph.event && ph.image, `leg ${i} metadata`);
      assert.equal(ph.steps.length, 2, `leg ${i} has 2 steps`);
      for (const [j, step] of ph.steps.entries()) {
        assert.ok(step.kind === 'map' || step.kind === 'decision', `leg ${i} step ${j} kind`);
        assert.ok(step.prompt?.length > 5, `leg ${i} step ${j} prompt`);
        const verdicts = step.choices.map((c) => c.verdict).sort();
        assert.deepEqual(verdicts, ['partial', 'right', 'wrong'], `leg ${i} step ${j} verdicts`);
        for (const c of step.choices) {
          assert.ok(c.label?.length > 5 && c.feedback?.length > 10, `leg ${i} step ${j} choice text`);
          if (c.position) assert.ok(waypointIds.has(c.position), `leg ${i} step ${j} position ${c.position} is a real waypoint`);
          if (c.marker) assert.ok(MARKERS[c.marker], `leg ${i} step ${j} marker ${c.marker}`);
        }
        // Positioned choices in a map step must use DISTINCT waypoints — otherwise
        // tapping a shared spot on the map would be ambiguous.
        if (step.kind === 'map') {
          const nodes = step.choices.map((c) => c.position).filter(Boolean);
          assert.equal(new Set(nodes).size, nodes.length, `leg ${i} step ${j} map nodes are distinct`);
        }
      }
    }
    const steps = phases.flatMap((p) => p.steps);
    assert.equal(steps.length, 12, '12 graded actions');
    // The map is genuinely tappable somewhere: at least two steps place the boss
    // among 2+ distinct waypoints.
    const tappable = steps.filter((s) => s.kind === 'map' && s.choices.filter((c) => c.position).length >= 2).length;
    assert.ok(tappable >= 2, `${trail}: ${tappable} tappable map steps — the trail map matters`);
  });

  test(`[${trail}] six ordered legs on the map for the herd to walk`, () => {
    const legs = WAYPOINTS[trail].filter((w) => w.leg).sort((a, b) => a.leg - b.leg);
    assert.deepEqual(legs.map((w) => w.leg), [1, 2, 3, 4, 5, 6], `${trail} has one main waypoint per leg`);
  });

  test(`[${trail}] vaquero origins are stated in Leg 1 (TEKS 7.6B)`, () => {
    const leg1 = PHASES[trail][0];
    const leg1Text = leg1.event + ' ' + leg1.steps.flatMap((s) => s.choices.map((c) => c.feedback)).join(' ');
    assert.match(leg1Text, /vaquero/i, `${trail} names the vaquero debt up front`);
  });
}

// --- Playthrough helpers (drive the adapter directly, no GameManager) --------

function playRun(trail, pick) {
  const state = game.initMatch({ soloSide: trail });
  for (let step = 0; step < game.totalActions; step++) {
    game.chapterEvent(state, trail);            // idempotent per leg; safe each step
    const res = game.resolve(state, trail, pick(state, trail));
    assert.ok(!res.error, `[${trail}] step ${step} failed: ${res.error}`);
  }
  return game.report(state);
}

const rightMove = (state, trail) => game.aiMove(state, trail);

function wrongMove(state, trail) {
  const ss = state.sides[trail];
  const cursor = ss.cursor;
  const steps = PHASES[trail].flatMap((p) => p.steps);
  const step = steps[cursor];
  const wrongReal = step.choices.findIndex((c) => c.verdict === 'wrong');
  return { kind: step.kind, choiceIndex: ss.shuffles[cursor].indexOf(wrongReal) };
}

for (const trail of TRAILS) {
  test(`[${trail}] all-right run: 100% accuracy and "Top Boss"`, () => {
    const report = playRun(trail, rightMove);
    const you = report.perSide[trail];
    assert.equal(you.accuracy, 100);
    assert.ok(you.score >= 210, `drive score ${you.score} should be high`);
    assert.equal(you.ending.key, 'top');
    assert.equal(you.variant, trail);
    assert.ok(you.debrief.includes('$4') && you.debrief.includes('$40'), 'debrief teaches the $4→$40 arithmetic');
    assert.match(you.debrief, /barbed wire/i, 'debrief lands the era’s end');
  });

  test(`[${trail}] all-wrong run: 0% accuracy and "Hard Lessons"`, () => {
    const report = playRun(trail, wrongMove);
    const you = report.perSide[trail];
    assert.equal(you.accuracy, 0);
    assert.ok(you.score < 150, `drive score ${you.score} should be low`);
    assert.equal(you.ending.key, 'hard');
  });

  test(`[${trail}] currentPrompt never leaks the answer key`, () => {
    const state = game.initMatch({ soloSide: trail });
    game.chapterEvent(state, trail);
    const prompt = game.currentPrompt(state, trail);
    assert.equal(prompt.choices.length, 3);
    for (const c of prompt.choices) {
      if (typeof c === 'object') {
        assert.ok(!('verdict' in c) && !('feedback' in c) && !('effects' in c), 'no answer key on a map choice');
      }
    }
  });
}

test('drive-score tiers: top ≥ 210, brought-through 150–209, hard < 150', () => {
  assert.equal(endingFor(300).key, 'top');
  assert.equal(endingFor(210).key, 'top');
  assert.equal(endingFor(180).key, 'through');
  assert.equal(endingFor(150).key, 'through');
  assert.equal(endingFor(100).key, 'hard');
  assert.equal(driveScore({ herd: 50, crew: 50, supplies: 50 }), 150);
});

test('Goodnight-Loving names Bose Ikard and handles Loving’s death with dignity (spec §11)', () => {
  const text = PHASES.goodnight.flatMap((p) => [p.event, ...p.steps.flatMap((s) => s.choices.map((c) => `${c.label} ${c.feedback}`))]).join(' ');
  assert.match(text, /Ikard/, 'Bose Ikard is named on the Goodnight-Loving trail');
  assert.match(text, /promise kept|home to Texas/i, 'Loving’s death is a promise kept, told gently');
  assert.doesNotMatch(text, /wound|bleeding|gangrene|amputat/i, 'no graphic wound detail');
});

test('a map placement writes a marker into the trail-map state', () => {
  const state = game.initMatch({ soloSide: 'chisholm' });
  // Chisholm Leg 2 step 1 is the river crossing (a map action with waypoints).
  game.chapterEvent(state, 'chisholm');
  game.resolve(state, 'chisholm', game.aiMove(state, 'chisholm')); // Leg 1 decision
  game.resolve(state, 'chisholm', game.aiMove(state, 'chisholm')); // Leg 1 map (chuck wagon, no position)
  game.chapterEvent(state, 'chisholm');                            // advance to Leg 2
  const crossing = game.resolve(state, 'chisholm', game.aiMove(state, 'chisholm')); // Leg 2 crossing
  assert.equal(crossing.kind, 'map');
  assert.ok(crossing.placed, 'the crossing placed a marker');
  assert.equal(crossing.placed.position, 'redRiver', 'the right crossing is the known Red River Station ford');
  assert.ok(state.map.positions.redRiver.markers.length >= 1, 'marker recorded on the map');
});
