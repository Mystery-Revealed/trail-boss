// ResultScreen.jsx — the end of the drive. Two stories, in order: (1) how the
// drive went (Drive Score + ending tier), (2) the score that matters to your
// teacher — accuracy — then the debrief: the sale at the railhead ($4 → $40),
// fair pay for the crew, and the era's end when rails and barbed wire close the
// open range (spec §3.4). Replay nudges you onto a different trail.

import { Art } from '../../services/assets.jsx';

const TIER_CLASS = { top: 'win', through: 'mid', hard: 'low' };

export default function ResultScreen({ state, dispatch }) {
  const end = state.matchEnd;
  const meta = end.meta || state.match?.begin?.meta;
  const you = end.you;
  const ending = you.ending;
  const score = you.score ?? 0;
  const trailName = meta?.variants?.[you.variant]?.name || 'the trail';

  return (
    <div className="card result-screen">
      <div className="event-kicker">{trailName} · the railhead</div>
      <h1 className={`result-headline ${TIER_CLASS[ending.key] || 'mid'}`}>{ending.title}</h1>

      <Art name="ending.jpg" alt="A cow town railhead at the end of the trail — stockyards full of longhorns, a locomotive taking on cattle cars, cowboys on the fences" className="result-art" />

      <p className="fall-note">
        This game measured how well you read the country and cared for your outfit.
        At the railhead, the herd you walked a thousand miles is suddenly worth about
        <b> ten times</b> what it was in Texas — that is the whole reason for the drive.
      </p>

      <div className="ending-block boss">
        <p>{ending.text}</p>
      </div>

      <div className="score-block" aria-label="Drive Score">
        <div className="score-head">
          <span className="score-title">🐂 Drive Score</span>
          <span className="score-num">{score}<span className="muted"> / 300</span></span>
        </div>
        <span className="score-bar-track">
          <span className={`score-bar ${TIER_CLASS[ending.key] || 'mid'}`} style={{ width: `${Math.min(100, (score / 300) * 100)}%` }} />
        </span>
        <div className="meter-final-row">
          {Object.entries(you.meters || {}).map(([k, v]) => (
            <span key={k} className="meter-final">{meta?.meters?.[k]?.name || k}: <b>{v}</b></span>
          ))}
        </div>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{you.accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>How well your 12 calls matched what a good trail boss really did. A boss who brings the herd in heavy <i>and</i> plays true to history scores highest.</p>
        </div>
      </div>

      <div className="debrief">
        <h3>What really happened</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={() => dispatch({ type: 'play-again' })}>
          Ride again
        </button>
        <p className="replay-nudge muted">Ride a different trail — different country, different problems.</p>
      </div>
    </div>
  );
}
