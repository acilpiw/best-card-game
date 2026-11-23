// render.js — every pixel of DUEL 21: the green felt table, both hands,
// the chip stacks and hearts, and the title / victory / defeat panels.
// Drawing only: it reads the game state and never changes it.

import { rankLabel, suitGlyph, suitColor, handValue } from './deck.js';
import { visibleDealerValue, BET } from './game.js';

const W = 1280;
const H = 720;

export function drawCard(ctx, card, x, y, w, h, faceDown) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, x, y, w, h, 12);
  if (faceDown) {
    ctx.fillStyle = '#274b9f';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#d9b64a';
    ctx.lineWidth = 3;
    roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 8);
    ctx.stroke();
    ctx.fillStyle = '#d9b64a';
    ctx.font = `bold ${Math.round(w * 0.42)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('21', x + w / 2, y + h / 2);
  } else {
    ctx.fillStyle = '#fdfcf7';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#c9c4b4';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();
    const color = suitColor(card);
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${Math.round(w * 0.34)}px Georgia, serif`;
    ctx.fillText(rankLabel(card), x + w * 0.09, y + h * 0.05);
    ctx.font = `${Math.round(w * 0.34)}px Georgia, serif`;
    ctx.fillText(suitGlyph(card), x + w * 0.09, y + h * 0.34);
    ctx.textAlign = 'center';
    ctx.font = `${Math.round(w * 0.62)}px Georgia, serif`;
    ctx.fillText(suitGlyph(card), x + w / 2, y + h * 0.52);
    ctx.save();
    ctx.translate(x + w, y + h);
    ctx.rotate(Math.PI);
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(w * 0.34)}px Georgia, serif`;
    ctx.fillText(rankLabel(card), w * 0.09, h * 0.05);
    ctx.restore();
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHand(ctx, hand, cx, y, hiddenSecond) {
  const w = 118;
  const h = 168;
  const gap = 26;
  const total = hand.length * w + (hand.length - 1) * gap;
  let x = cx - total / 2;
  for (let i = 0; i < hand.length; i += 1) {
    drawCard(ctx, hand[i], x, y, w, h, hiddenSecond && i === 1);
    x += w + gap;
  }
}

function drawHearts(ctx, count, x, y, label) {
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 20px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.font = '30px Verdana, sans-serif';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < count ? '#e0344a' : 'rgba(255,255,255,0.25)';
    ctx.fillText('♥', x + 118 + i * 34, y);
  }
}

function drawChips(ctx, amount, x, y, label) {
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 20px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}  ${amount}`, x, y);
  const stack = Math.max(1, Math.round(amount / 20));
  for (let i = 0; i < Math.min(stack, 8); i += 1) {
    ctx.beginPath();
    ctx.ellipse(x + 24 + i * 4, y + 34 - i * 5, 20, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#d9b64a' : '#b03a4b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.stroke();
  }
}

function drawButton(ctx, x, y, w, h, label, enabled) {
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = enabled ? '#d9b64a' : 'rgba(217,182,74,0.35)';
  ctx.fill();
  ctx.fillStyle = enabled ? '#20301f' : 'rgba(255,255,255,0.6)';
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
}

function drawTable(ctx, state) {
  const grad = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 760);
  grad.addColorStop(0, '#1d7a46');
  grad.addColorStop(1, '#0c4a29');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,233,168,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2 + 16, 520, 268, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,233,168,0.75)';
  ctx.font = 'italic 21px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Dealer stands on all 17s  •  Bet ' + BET + ' chips a round', W / 2, H / 2 + 22);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Verdana, sans-serif';
  ctx.textAlign = 'center';
  const dealerShown = state.dealerHand.length === 0 ? '—' : state.dealerHidden ? visibleDealerValue(state) + ' + ?' : String(handValue(state.dealerHand));
  ctx.fillText(`DEALER  •  ${dealerShown}`, W / 2, 44);
  drawHearts(ctx, state.dealerHearts, 36, 44, 'DEALER');
  drawChips(ctx, state.dealerChips, 1030, 30, 'CHIPS');
  if (state.dealerHand.length > 0) drawHand(ctx, state.dealerHand, W / 2, 66, state.dealerHidden);

  const playerShown = state.playerHand.length === 0 ? '—' : String(handValue(state.playerHand));
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`YOU  •  ${playerShown}`, W / 2, 438);
  drawHearts(ctx, state.playerHearts, 36, 676, 'YOU');
  drawChips(ctx, state.playerChips, 1030, 662, 'CHIPS');
  if (state.playerHand.length > 0) drawHand(ctx, state.playerHand, W / 2, 458, false);

  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 23px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.message, W / 2, 300);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '19px Verdana, sans-serif';
  ctx.fillText(`Round ${Math.max(state.round, 1)}  •  Rounds won ${state.wins} — lost ${state.losses}`, W / 2, 334);

  if (state.phase === 'player') {
    drawButton(ctx, W / 2 - 220, 648, 200, 48, 'HIT  [H]', true);
    drawButton(ctx, W / 2 + 20, 648, 200, 48, 'STAND  [S]', true);
  } else if (state.phase === 'settled') {
    drawButton(ctx, W / 2 - 110, 648, 220, 48, 'DEAL  [Space]', true);
  }
}

function drawPanel(ctx, title, titleColor, lines) {
  ctx.fillStyle = 'rgba(6,26,16,0.94)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 84px Georgia, serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, W / 2, 218);
  ctx.fillStyle = '#f4ecd2';
  ctx.font = '26px Verdana, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, 320 + i * 42);
  });
}

export function render(ctx, state) {
  drawTable(ctx, state);
  if (state.phase === 'title') {
    drawPanel(ctx, 'DUEL 21', '#d9b64a', [
      'A blackjack duel against the house dealer.',
      'Beat the dealer hand without going over 21.',
      'Win rounds to take 20 chips a hand — empty the dealer',
      'three times to take the match, or lose your hearts trying.',
      '',
      'HIT  H key or button   •   STAND  S key or button',
      'Press SPACE or click anywhere to deal the first hand',
    ]);
  } else if (state.phase === 'won') {
    drawPanel(ctx, 'YOU WIN THE DUEL!', '#7be495', [
      'The dealer is out of hearts — the table is yours.',
      `Rounds won ${state.wins} — lost ${state.losses} in ${state.round} rounds.`,
      '',
      'Press SPACE or click to play a new match',
    ]);
  } else if (state.phase === 'lost') {
    drawPanel(ctx, 'THE HOUSE WINS', '#ff8a7a', [
      'You are out of hearts — the dealer keeps the table.',
      `Rounds won ${state.wins} — lost ${state.losses} in ${state.round} rounds.`,
      '',
      'Press SPACE or click to try a new match',
    ]);
  }
}

export const VIEW = { width: W, height: H };
