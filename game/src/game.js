// game.js — the DUEL 21 state machine: rounds, bets, lives and the dealer.
// Pure rules, no drawing: createGame makes a match, dealRound starts a hand,
// playerHit / playerStand / dealerPlay advance it, and settleRound pays the
// winner. A match is first to break the other side: both start with 100
// chips and 3 hearts; losing a round costs chips and a heart at zero chips.

import { buildDeck, shuffleDeck, handValue, isBlackjack, isBust } from './deck.js';

export const START_CHIPS = 100;
export const START_HEARTS = 3;
export const BET = 20;

export function createGame(rng) {
  return {
    phase: 'title', // title | betting | player | dealer | settled | won | lost
    rng,
    shoe: [],
    playerHand: [],
    dealerHand: [],
    dealerHidden: true,
    playerChips: START_CHIPS,
    dealerChips: START_CHIPS,
    playerHearts: START_HEARTS,
    dealerHearts: START_HEARTS,
    round: 0,
    message: 'Press SPACE or click DEAL to start.',
    lastResult: '',
    wins: 0,
    losses: 0,
  };
}

function draw(state) {
  // Refill before the shoe can run dry mid-hand: a fresh shuffled deck is
  // cut in as soon as fewer than six cards remain.
  if (state.shoe.length < 6) {
    state.shoe = shuffleDeck(buildDeck(), state.rng);
  }
  return state.shoe.pop();
}

export function dealRound(state) {
  state.round += 1;
  state.playerHand = [draw(state), draw(state)];
  state.dealerHand = [draw(state), draw(state)];
  state.dealerHidden = true;
  state.phase = 'player';
  if (isBlackjack(state.playerHand)) {
    state.message = 'DUEL 21! Stand to collect — or the dealer may match you.';
  } else {
    state.message = `Your hand: ${handValue(state.playerHand)}. HIT (H) or STAND (S)?`;
  }
  state.lastResult = '';
  return state;
}

export function playerHit(state) {
  if (state.phase !== 'player') return state;
  state.playerHand.push(draw(state));
  const value = handValue(state.playerHand);
  if (isBust(state.playerHand)) {
    state.message = `Bust at ${value}! The dealer takes this round.`;
    settleRound(state, 'dealer');
  } else if (value === 21) {
    state.message = '21! The dealer plays…';
    dealerPlay(state);
  } else {
    state.message = `Your hand: ${value}. HIT (H) or STAND (S)?`;
  }
  return state;
}

export function playerStand(state) {
  if (state.phase !== 'player') return state;
  state.message = 'You stand. The dealer plays…';
  dealerPlay(state);
  return state;
}

// Dealer reveals the hole card and draws until 17 or more, standing on all
// 17s — the classic table rule, printed on the felt in the renderer.
export function dealerPlay(state) {
  state.dealerHidden = false;
  state.phase = 'dealer';
  while (handValue(state.dealerHand) < 17) {
    state.dealerHand.push(draw(state));
  }
  const player = handValue(state.playerHand);
  const dealer = handValue(state.dealerHand);
  if (isBust(state.dealerHand)) {
    state.message = `Dealer busts at ${dealer}! You win the round.`;
    settleRound(state, 'player');
  } else if (isBlackjack(state.dealerHand) && !isBlackjack(state.playerHand)) {
    state.message = 'Dealer has DUEL 21. The dealer takes this round.';
    settleRound(state, 'dealer');
  } else if (isBlackjack(state.playerHand) && !isBlackjack(state.dealerHand)) {
    state.message = 'Your DUEL 21 beats the dealer!';
    settleRound(state, 'player');
  } else if (player > dealer) {
    state.message = `${player} beats ${dealer}. You win the round!`;
    settleRound(state, 'player');
  } else if (dealer > player) {
    state.message = `${dealer} beats ${player}. The dealer wins the round.`;
    settleRound(state, 'dealer');
  } else {
    state.message = `Push at ${player} — nobody pays.`;
    state.phase = 'settled';
  }
  return state;
}

export function settleRound(state, winner) {
  if (winner === 'player') {
    state.playerChips += BET;
    state.dealerChips -= BET;
    state.wins += 1;
    if (state.dealerChips <= 0) {
      state.dealerChips = 0;
      state.dealerHearts -= 1;
      if (state.dealerHearts <= 0) {
        state.phase = 'won';
        return state;
      }
      state.dealerChips = START_CHIPS;
      state.message += ' The dealer loses a heart and rebuys!';
    }
  } else {
    state.dealerChips += BET;
    state.playerChips -= BET;
    state.losses += 1;
    if (state.playerChips <= 0) {
      state.playerChips = 0;
      state.playerHearts -= 1;
      if (state.playerHearts <= 0) {
        state.phase = 'lost';
        return state;
      }
      state.playerChips = START_CHIPS;
      state.message += ' You lose a heart and rebuy!';
    }
  }
  state.phase = 'settled';
  return state;
}

export function visibleDealerValue(state) {
  if (!state.dealerHidden || state.dealerHand.length === 0) {
    return handValue(state.dealerHand);
  }
  return handValue([state.dealerHand[0]]);
}
