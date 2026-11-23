// deck.js — the DUEL 21 deck: building, shuffling and scoring hands.
// A card is { rank, suit } with rank 1..13 (1 = Ace, 11 = Jack, 12 = Queen,
// 13 = King) and suit one of the four classic suits. All rules about what a
// hand is worth live here so the game state and the renderer agree.

export const SUITS = [
  { id: 'spades', glyph: '♠', color: '#1c2430' },
  { id: 'hearts', glyph: '♥', color: '#c0273d' },
  { id: 'diamonds', glyph: '♦', color: '#c0273d' },
  { id: 'clubs', glyph: '♣', color: '#1c2430' },
];

export const RANK_LABELS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function rankLabel(card) {
  return RANK_LABELS[card.rank - 1];
}

export function suitGlyph(card) {
  return SUITS[card.suit].glyph;
}

export function suitColor(card) {
  return SUITS[card.suit].color;
}

// A fresh ordered 52-card deck.
export function buildDeck() {
  const deck = [];
  for (let suit = 0; suit < 4; suit += 1) {
    for (let rank = 1; rank <= 13; rank += 1) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// Fisher-Yates shuffle driven by the caller's rng so screenshot scenes can
// be reproduced exactly from a seed.
export function shuffleDeck(deck, rng) {
  const cards = deck.slice();
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = cards[i];
    cards[i] = cards[j];
    cards[j] = tmp;
  }
  return cards;
}

// Blackjack value of one card before Ace flexibility is resolved.
export function cardPoints(card) {
  if (card.rank === 1) return 11;
  if (card.rank > 10) return 10;
  return card.rank;
}

// Best total for a hand: Aces count 11 while the hand stays at or under 21
// and drop to 1 as soon as they would bust it.
export function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    total += cardPoints(card);
    if (card.rank === 1) aces += 1;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

export function isSoft(hand) {
  // Soft when an Ace still counts as 11 in the best total: the raw sum
  // (Ace = 11) fits under 22 and handValue did not have to demote it.
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    total += cardPoints(card);
    if (card.rank === 1) aces += 1;
  }
  return aces > 0 && total <= 21 && handValue(hand) === total;
}

export function isBlackjack(hand) {
  return hand.length === 2 && handValue(hand) === 21;
}

export function isBust(hand) {
  return handValue(hand) > 21;
}
