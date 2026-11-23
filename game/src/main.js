// main.js — DUEL 21 entry point: canvas setup, keyboard and mouse input,
// and the render loop. Keys: H hit, S stand, Space/Enter deal or restart,
// click the HIT / STAND / DEAL buttons (or anywhere on title/end screens).

import { createGame, dealRound, playerHit, playerStand } from './game.js';
import { render, VIEW } from './render.js';
import { makeRng } from './random.js';
import { buildShotState, shotNameFromUrl, seedFromUrl } from './shots.js';
import { playCardSound, playChipSound, playWinSound, playLoseSound } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}

const shot = shotNameFromUrl();
let state = shot
  ? buildShotState(shot, seedFromUrl())
  : createGame(makeRng((Date.now() % 100000) + 1));

let lastPhase = state.phase;
function announce() {
  if (status) status.textContent = `DUEL 21: ${state.message} You have ${state.playerChips} chips and ${state.playerHearts} hearts.`;
  if (state.phase !== lastPhase) {
    if (state.phase === 'won') playWinSound();
    if (state.phase === 'lost') playLoseSound();
    if (state.phase === 'settled') playChipSound();
    lastPhase = state.phase;
  }
}

function advance() {
  if (state.phase === 'title' || state.phase === 'won' || state.phase === 'lost') {
    const hearts = { player: state.playerHearts, dealer: state.dealerHearts };
    state = createGame(makeRng((Date.now() % 100000) + 1));
    void hearts;
    dealRound(state);
    playCardSound();
  } else if (state.phase === 'settled') {
    dealRound(state);
    playCardSound();
  }
  announce();
}

function doHit() {
  if (state.phase !== 'player') return;
  playerHit(state);
  playCardSound();
  announce();
}

function doStand() {
  if (state.phase !== 'player') return;
  playerStand(state);
  playCardSound();
  announce();
}

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'h') doHit();
  else if (key === 's') doStand();
  else if (key === ' ' || key === 'enter') {
    event.preventDefault();
    advance();
  }
});

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * VIEW.width;
  const y = ((event.clientY - rect.top) / rect.height) * VIEW.height;
  if (state.phase === 'player') {
    if (y >= 648 && y <= 696 && x >= VIEW.width / 2 - 220 && x <= VIEW.width / 2 - 20) doHit();
    else if (y >= 648 && y <= 696 && x >= VIEW.width / 2 + 20 && x <= VIEW.width / 2 + 220) doStand();
  } else {
    advance();
  }
});

window.addEventListener('resize', fitCanvas);
fitCanvas();
announce();

function frame() {
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
