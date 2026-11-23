// shots.js — deterministic screenshot scenes for DUEL 21, selected with
// ?shot=title|table|win|lose&seed=N. Each scene builds a real game state
// with fixed hands so the four required screens (title, table mid-duel,
// victory, defeat) render exactly the same way every time.

import { createGame } from './game.js';
import { makeRng } from './random.js';

// Fixed illustrative hands: values and suits stay large and readable, and
// each scene's totals match the hand it shows (17 vs a King up-card on the
// table, Ace + King for the win, a three-card bust for the loss).
const TABLE_PLAYER = [
  { rank: 10, suit: 0 },
  { rank: 7, suit: 1 },
];
const TABLE_DEALER = [
  { rank: 13, suit: 2 },
  { rank: 6, suit: 3 },
];
const WIN_PLAYER = [
  { rank: 1, suit: 0 },
  { rank: 13, suit: 1 },
];
const WIN_DEALER = [
  { rank: 9, suit: 2 },
  { rank: 8, suit: 3 },
];
const LOSE_PLAYER = [
  { rank: 10, suit: 1 },
  { rank: 6, suit: 0 },
  { rank: 9, suit: 3 },
];
const LOSE_DEALER = [
  { rank: 12, suit: 2 },
  { rank: 10, suit: 3 },
];

export function buildShotState(name, seed) {
  const state = createGame(makeRng(seed || 7));
  if (name === 'table') {
    state.phase = 'player';
    state.round = 3;
    state.playerHand = TABLE_PLAYER.slice();
    state.dealerHand = TABLE_DEALER.slice();
    state.dealerHidden = true;
    state.playerChips = 120;
    state.dealerChips = 80;
    state.wins = 2;
    state.losses = 1;
    state.message = 'Your hand: 17. HIT (H) or STAND (S)?';
  } else if (name === 'win') {
    state.phase = 'won';
    state.round = 14;
    state.playerHand = WIN_PLAYER.slice();
    state.dealerHand = WIN_DEALER.slice();
    state.dealerHidden = false;
    state.playerChips = 160;
    state.dealerChips = 0;
    state.dealerHearts = 0;
    state.wins = 9;
    state.losses = 5;
    state.message = 'Your DUEL 21 beats the dealer!';
  } else if (name === 'lose') {
    state.phase = 'lost';
    state.round = 11;
    state.playerHand = LOSE_PLAYER.slice();
    state.dealerHand = LOSE_DEALER.slice();
    state.dealerHidden = false;
    state.playerChips = 0;
    state.dealerChips = 180;
    state.playerHearts = 0;
    state.wins = 4;
    state.losses = 7;
    state.message = 'Bust at 25! The dealer takes this round.';
  } else {
    state.phase = 'title';
    state.playerHand = WIN_PLAYER.slice();
    state.dealerHand = TABLE_DEALER.slice();
    state.dealerHidden = true;
  }
  return state;
}

export function shotNameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot');
}

export function seedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed'));
  return Number.isFinite(seed) && seed > 0 ? seed : 7;
}
