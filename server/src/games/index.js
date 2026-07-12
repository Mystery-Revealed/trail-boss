// games/index.js — registry of playable games. GameManager looks games up here,
// keeping the engine reusable across Texas History units.

import trailBoss from './trailBoss.js';

export const GAMES = {
  [trailBoss.id]: trailBoss,
};

export function getGame(id) {
  return GAMES[id] || null;
}
