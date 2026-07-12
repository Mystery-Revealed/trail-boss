# Trail Boss

**Unit 6 · 7th Grade Texas History · Cotton, Cattle, and Railroads (the trail-drive era, ~1867–1885)**

A browser strategy game for the classroom. You're the **trail boss** of 2,500
longhorns and a dozen riders. Pick one of three historic cattle trails and drive
the herd north to the railhead — reading rivers and weather, paying fair tolls,
respecting the quarantine lines, and keeping your crew together. Six legs × two
graded actions = **12 graded actions**, 8–10 minutes per trail; replay to ride the
others.

The core teaching idea is geography and economics: after the Civil War, Texas was
cattle-rich and cash-poor — a longhorn worth about **$4** in Texas was worth about
**$40** at a Kansas railhead. Each trail solved a different map problem, and the
whole way of life ran on skills learned from Mexican **vaqueros**. Students learn
the trails *by riding them* (TEKS 7.6B, 7.21).

**Tone (please read).** The vaquero debt is the headline, not a footnote — the
craft is Spanish-Mexican in origin, and real crews were about **one rider in three
Black or Mexican/Tejano** (Bose Ikard, whom Goodnight trusted with the outfit's
money, is named on the Goodnight-Loving trail). Indian Territory tolls are shown
as fair payment for crossing sovereign land. Texas-fever quarantines were
legitimate — the farmers aren't villains; they're the reason the trails kept
shifting west. Oliver Loving's death is one gentle line: a promise kept.

- **TEKS:** 7.6A (frontier expansion), 7.6B (the cattle industry from its Spanish
  beginnings; the cowboy way of life), 7.6C (railroads); skills 7.8A/B, 7.21A/B,
  7.20B.
- **Reading level:** everything a student sees is written at a 5th-grade level.

## The three trails (the variants)

The student picks a trail at the start; it is the "side" the Command Center groups
accuracy by (exactly like tribes in *Survive the Season*).

- **Chisholm** — San Antonio → Red River Station → Abilene, Kansas. The classic.
- **Goodnight-Loving** — Fort Belknap → the 96-mile dry drive → Horsehead Crossing
  on the Pecos → Fort Sumner → Colorado. The western epic.
- **Western** — Bandera → Doan's Crossing → Dodge City. The last great trail.

## Architecture

Same shared, server-authoritative Socket.IO engine as *Survive the Season*, *Claim
the Land*, *Hold the Line*, and *Run the Blockade* — extended here for **solo
variant** play (three parallel trail tracks, no rival).

- `server/` — Node + Express + Socket.IO (ESM). All truth (answer key, scoring,
  session state) lives here, in memory only. No database, no accounts. The game
  content is one adapter: `server/src/games/trailBoss.js`, built on the reusable,
  now **variant-aware** `_stepGame.js` factory. The three trails are the game's
  `sides`; GameManager treats them as independent solo tracks (`hasOpponent:
  false`) so no AI rival is ever driven and class accuracy groups per trail.
- `client/` — React 18 + Vite. Student game at `/`, Teacher Command Center at
  `/#teacher`. The signature UI is `components/shared/TrailMap.jsx` — each trail
  ships its own ordered waypoints, and the herd 🐂 walks north leg by leg.
- **Meters:** Herd 🐂 · Crew ❤️ · Supplies 🍖 (each 0–100, start 50). **Drive
  Score** = their sum (max 300) → three ending tiers (Top Boss / Brought 'Em
  Through / Hard Lessons), then the shared debrief: the $4 → $40 sale, fair pay,
  and the era's end as rails and barbed wire close the range.

Session data is deliberately disposable: it is deleted on **End Session**, after
an idle sweep, or on server restart. The teacher's **PDF export** (Name · Trail ·
Status · Accuracy, plus class accuracy by trail) is the only lasting record.

## Local development

```bash
npm install          # cascades to server/ and client/ (exFAT-safe: no workspaces)
npm run build        # builds the client into client/dist
npm start            # serves the built client + Socket.IO on http://localhost:4400
npm test             # runs the server test suite (per-trail balance + lifecycle)
```

The student page is `http://localhost:4400/`; the Teacher Command Center is
`http://localhost:4400/#teacher`.

## Deploy (GitHub → Render → Wix)

- `render.yaml` is a ready Render blueprint (one free web service, name
  `trail-boss`, `npm install && npm run build` → `node server/src/index.js`).
- Render injects `PORT`; local dev falls back to `4400`.
- Embed the two routes on Wix: the student `/` on the public page, the `/#teacher`
  route on a password-protected page.

## Content & tests

The full content bank (all three trails, every choice, feedback, and the debrief)
lives in `trailBoss.js`. `npm test` pins the history for **each trail**: an
all-right run reaches "Top Boss" at 100% accuracy; an all-wrong run lands at "Hard
Lessons" at 0%; the vaquero origins are stated in Leg 1; Bose Ikard is named and
Loving's death is handled with dignity; and the debrief teaches the $4 → $40
arithmetic and the coming of barbed wire.

> **Content status:** the Chisholm trail is written to final quality (spec §4). The
> Goodnight-Loving and Western trails are structurally complete first drafts from
> the §5 beat matrices — balanced and playable, with the prose to be elevated into
> three distinct 5th-grade voices (Fable pass). Trail art is generated in the art
> phase (Higgsfield).
