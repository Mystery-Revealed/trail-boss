// Datapad.jsx — the student game. A small state machine over socket pushes:
// title → how to play → join → pick a trail → (approval) → briefing → match
// (6 legs) → result. The student picks one of three historic trails; that trail
// is the "side" the Command Center groups accuracy by. The server owns all truth;
// this component only renders what it's told.

import { useEffect, useReducer, useRef, useState } from 'react';
import { getSocket, emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import MatchView from './MatchView.jsx';
import ResultScreen from './ResultScreen.jsx';

// The three trails a student can ride (display info for the pick screen; the
// server holds the real content). ids match the server's variant keys.
export const TRAILS = [
  {
    id: 'chisholm', name: 'Chisholm Trail', years: '1867 onward · the classic',
    route: 'San Antonio → Red River → Abilene, Kansas',
    challenge: 'The Red River crossing and the Kansas quarantine line.',
    emoji: '🐂',
  },
  {
    id: 'goodnight', name: 'Goodnight-Loving Trail', years: '1866 onward · the western epic',
    route: 'Fort Belknap → the Pecos → Fort Sumner → Colorado',
    challenge: 'A 96-mile dry drive with no water at all.',
    emoji: '🌵',
  },
  {
    id: 'western', name: 'Western Trail', years: 'mid-1870s · the last great trail',
    route: 'Bandera → Doan’s Crossing → Dodge City',
    challenge: 'Fenced range and the fever line that pushed the trail west.',
    emoji: '🤠',
  },
];

const initialState = {
  screen: 'title', // title | how | join | pick | waiting_approval | briefing | match | result | ended
  joinCode: '',
  name: '',
  trail: null,
  studentId: null,
  error: '',
  endedMessage: '',
  match: null,
  matchEnd: null,
};

function freshMatch(begin) {
  return {
    begin,
    map: begin.map,
    meters: begin.meters,
    eventCard: null,
    turn: null,
    feedback: null,
  };
}

// Merge live payloads (chapter:event, turn:begin, turn:resolution) into the match.
function mergeLive(match, payload) {
  const next = { ...match };
  if (payload.map) next.map = payload.map;
  if (payload.meters) next.meters = payload.meters;
  return next;
}

function reducer(state, action) {
  switch (action.type) {
    case 'ui':
      return { ...state, ...action.patch };
    case 'joined':
      return {
        ...state,
        studentId: action.studentId,
        error: '',
        screen: action.approved ? 'briefing' : 'waiting_approval',
      };
    case 'approved':
      return { ...state, screen: state.screen === 'waiting_approval' ? 'briefing' : state.screen };
    case 'match:begin':
      return { ...state, screen: 'match', matchEnd: null, match: freshMatch(action.payload) };
    case 'chapter:event': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, eventCard: action.payload } };
    }
    case 'turn:begin': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, turn: action.payload } };
    }
    case 'turn:resolution': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, feedback: action.payload } };
    }
    case 'match:end': {
      // Hold the result until pending feedback is dismissed (chronological order).
      const showNow = !state.match?.feedback;
      return { ...state, matchEnd: action.payload, screen: showNow ? 'result' : state.screen };
    }
    case 'dismiss-feedback': {
      if (!state.match) return state;
      if (state.matchEnd) return { ...state, screen: 'result', match: { ...state.match, feedback: null } };
      return { ...state, match: { ...state.match, feedback: null } };
    }
    case 'dismiss-event':
      return state.match ? { ...state, match: { ...state.match, eventCard: null } } : state;
    case 'sync': {
      const s = action.sync;
      if (s.screen === 'waiting_approval') return { ...state, screen: 'waiting_approval' };
      if (s.screen === 'lobby') return { ...state, screen: 'briefing' };
      if (s.screen === 'result') return { ...state, screen: 'result', matchEnd: s.matchEnd };
      if (s.screen === 'match') {
        const match = freshMatch(s.matchBegin);
        return {
          ...state,
          screen: 'match',
          matchEnd: null,
          match: { ...match, eventCard: s.chapterEvent, turn: s.turn },
        };
      }
      return state;
    }
    case 'removed':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: '', error: 'Your teacher removed you from the session. You can join again.' };
    case 'ended':
      return { ...initialState, screen: 'ended', endedMessage: 'Your teacher ended this session. Good drive, boss.' };
    case 'play-again':
      return { ...initialState, screen: 'pick', joinCode: state.joinCode, name: state.name };
    default:
      return state;
  }
}

export default function Datapad() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const socket = getSocket();
    const on = (event, type) => {
      const fn = (payload) => dispatch({ type, payload });
      socket.on(event, fn);
      return [event, fn];
    };
    const subs = [
      on('match:begin', 'match:begin'),
      on('chapter:event', 'chapter:event'),
      on('turn:begin', 'turn:begin'),
      on('turn:resolution', 'turn:resolution'),
      on('match:end', 'match:end'),
    ];
    const approved = () => dispatch({ type: 'approved' });
    const removed = () => dispatch({ type: 'removed' });
    const ended = () => dispatch({ type: 'ended' });
    socket.on('join:approved', approved);
    socket.on('student:removed', removed);
    socket.on('session:ended', ended);

    // School wifi blip: the socket reconnects → re-attach and re-sync the screen.
    const onReconnect = async () => {
      const s = stateRef.current;
      if (!s.studentId || !s.joinCode) return;
      const res = await emitAck('student:rejoin', { joinCode: s.joinCode, studentId: s.studentId });
      if (res.ok) dispatch({ type: 'sync', sync: res.sync });
    };
    socket.io.on('reconnect', onReconnect);

    return () => {
      for (const [event, fn] of subs) socket.off(event, fn);
      socket.off('join:approved', approved);
      socket.off('student:removed', removed);
      socket.off('session:ended', ended);
      socket.io.off('reconnect', onReconnect);
    };
  }, []);

  const { screen } = state;
  return (
    <div className="app student-app">
      {screen === 'title' && <TitleScreen onStart={() => dispatch({ type: 'ui', patch: { screen: 'join' } })} onHow={() => dispatch({ type: 'ui', patch: { screen: 'how' } })} />}
      {screen === 'how' && <HowToPlay onBack={() => dispatch({ type: 'ui', patch: { screen: 'title' } })} />}
      {screen === 'join' && <JoinForm state={state} dispatch={dispatch} />}
      {screen === 'pick' && <TrailPick state={state} dispatch={dispatch} />}
      {screen === 'waiting_approval' && (
        <WaitCard title="Hold tight!" text="Your teacher is checking names. Your drive will begin in a moment." />
      )}
      {screen === 'briefing' && (
        <WaitCard title="Saddle up, boss." text="Your crew is gathering and the herd is bawling. Your first orders are being drawn up — stand ready." />
      )}
      {screen === 'match' && state.match && <MatchView state={state} dispatch={dispatch} />}
      {screen === 'result' && state.matchEnd && <ResultScreen state={state} dispatch={dispatch} />}
      {screen === 'ended' && (
        <WaitCard title="Session ended" text={state.endedMessage}>
          <button className="btn" onClick={() => dispatch({ type: 'ui', patch: { ...initialState, screen: 'title' } })}>
            Back to the title screen
          </button>
        </WaitCard>
      )}
      <footer className="app-footer">Made for 7th Grade Texas History · TEKS 7.6A, 7.6B</footer>
    </div>
  );
}

/* ---------------- small screens ---------------- */

function TitleScreen({ onStart, onHow }) {
  return (
    <div className="card title-screen">
      <Art name="title_hero.jpg" alt="A two-mile line of longhorns moving north through open grass at dawn, riders at point and flank, dust hanging gold in the light" className="hero-art" />
      <h1 className="game-title">Trail Boss</h1>
      <p className="tagline">Read the rivers and the sky. Bring the herd home.</p>
      <p className="title-blurb">
        After the Civil War, a longhorn worth <b>$4</b> in Texas was worth <b>$40</b>
        {' '}at a Kansas railhead. You’re the boss of <b>2,500 longhorns</b> and a dozen
        riders — a real trail crew, about one rider in three Black or Mexican, working
        a craft learned from Mexican <b>vaqueros</b>. Pick a historic trail, keep your
        herd and crew together, and bring them through to where the cattle turn to gold.
      </p>
      <div className="btn-col">
        <button className="btn big" onClick={onStart}>Join your class</button>
        <button className="btn secondary" onClick={onHow}>How to play</button>
      </div>
    </div>
  );
}

function HowToPlay({ onBack }) {
  return (
    <div className="card how-screen">
      <h2>How to play</h2>
      <ol className="how-list">
        <li><b>Join with your class code</b> and <b>pick a trail</b> to ride.</li>
        <li><b>Drive the herd through 6 legs</b> to the railhead. Each leg you make <b>two calls</b>:</li>
      </ol>
      <div className="how-grid">
        <div className="how-card"><span className="how-icon">🧭</span><b>Trail action</b><p>Handle the trail — a river crossing, a camp, the herd. Tap a glowing spot on the map when there’s a place to choose.</p></div>
        <div className="how-card"><span className="how-icon">🤔</span><b>Your call</b><p>Pick 1 of 3 answers to the leg’s hard question.</p></div>
      </div>
      <h3>Your three meters</h3>
      <ul className="how-list">
        <li>🐂 <b>Herd</b> — the cattle’s numbers and condition. Weight is money.</li>
        <li>❤️ <b>Crew</b> — your riders’ health, trust, and morale.</li>
        <li>🍖 <b>Supplies</b> — food, gear, and the chuck wagon.</li>
      </ul>
      <div className="note">
        <b>Read the trail, and read history.</b> Your <b>Drive Score</b> is your three
        meters added up. But the score your teacher sees is your <b>accuracy</b> — how
        well your calls match what a good trail boss really did. Watch your herd 🐂
        walk north on the map, leg by leg — the geography is the scoreboard.
      </div>
      <h3>Words to know</h3>
      <ul className="how-list">
        <li><b>Trail boss</b> — the leader of a cattle drive (that’s you).</li>
        <li><b>Longhorn</b> — the tough Texas cattle that could walk a thousand miles.</li>
        <li><b>Remuda</b> — the herd of spare horses.</li>
        <li><b>Chuck wagon</b> — the rolling kitchen of the drive.</li>
        <li><b>Stampede</b> — the whole herd running in panic.</li>
        <li><b>Quarantine line</b> — a boundary farmers drew to keep Texas cattle (and their fever ticks) out.</li>
        <li><b>Railhead</b> — the town where the railroad ends and cattle ship east.</li>
      </ul>
      <button className="btn" onClick={onBack}>Back</button>
    </div>
  );
}

function JoinForm({ state, dispatch }) {
  const set = (patch) => dispatch({ type: 'ui', patch });
  const ready = state.joinCode.length === 6 && state.name.trim().length >= 2;

  return (
    <div className="card join-screen">
      <h2>Join your class</h2>
      <label htmlFor="join-code">Class code</label>
      <input
        id="join-code" inputMode="numeric" autoComplete="off" maxLength={6}
        placeholder="6-digit code" value={state.joinCode}
        onChange={(e) => set({ joinCode: e.target.value.replace(/\D/g, '') })}
      />
      <label htmlFor="join-name">Your first name</label>
      <input
        id="join-name" maxLength={20} placeholder="e.g. Ana R." value={state.name}
        onChange={(e) => set({ name: e.target.value })}
      />
      <p className="muted">Next you’ll pick which historic trail to ride.</p>

      <p className="err" role="alert">{state.error}</p>
      <div className="btn-col">
        <button className="btn big" disabled={!ready} onClick={() => set({ screen: 'pick', error: '' })}>
          Choose your trail →
        </button>
        <button className="btn ghost" onClick={() => set({ screen: 'title', error: '' })}>Back</button>
      </div>
    </div>
  );
}

function TrailPick({ state, dispatch }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function pick(trailId) {
    if (busy) return;
    setBusy(true);
    setErr('');
    const res = await emitAck('student:join', {
      joinCode: state.joinCode.trim(),
      nickname: state.name.trim(),
      mode: 'solo',
      nation: trailId,
    });
    setBusy(false);
    if (!res.ok) return setErr(errorText(res.error));
    dispatch({ type: 'ui', patch: { trail: trailId } });
    dispatch({ type: 'joined', studentId: res.studentId, approved: res.approved });
  }

  return (
    <div className="card pick-screen">
      <h2>Pick your trail</h2>
      <p className="muted">Each trail solved a different map problem. Ride one now — you can ride the others later.</p>
      <div className="trail-grid">
        {TRAILS.map((t) => (
          <button key={t.id} className="trail-card" disabled={busy} onClick={() => pick(t.id)}>
            <span className="trail-emoji" aria-hidden="true">{t.emoji}</span>
            <b className="trail-name">{t.name}</b>
            <span className="trail-years">{t.years}</span>
            <span className="trail-route">{t.route}</span>
            <span className="trail-challenge">{t.challenge}</span>
            <span className="trail-go">{busy ? 'Setting out…' : 'Ride this trail →'}</span>
          </button>
        ))}
      </div>
      <p className="err" role="alert">{err}</p>
      <button className="btn ghost" onClick={() => dispatch({ type: 'ui', patch: { screen: 'join' } })}>Back</button>
    </div>
  );
}

function WaitCard({ title, text, children }) {
  return (
    <div className="card wait-card">
      <div className="pulse-dot" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
