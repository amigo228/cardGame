import Card from './card.js';

export function createDeck(scene) {            
  const suits = ['c','d','h','s'];       
  const ranks = Array.from({ length: 13 }, (_, i) => i + 1); 
  const deck = [];

  for (let d = 0; d < 2; d++) {
    for (const suit of suits) {
      const color = (suit === 'd' || suit === 'h') ? 'r' : 'b';

      for (const rank of ranks) {
        deck.push(new Card(scene, suit, color, rank));
      }
    }
  }

  console.log(deck)

  return Phaser.Utils.Array.Shuffle(deck);
}

export function isCardValid(foundation, card) {
  let isValid = null;
  for (let i = 0; i < foundation.length; ++i) {
    const topCard = foundation[i].cards[foundation[i].cards.length - 1];
    isValid = foundation[i].type === "asc" ? (card.rank === topCard.rank + 1 && card.suit === topCard.suit) : (card.rank === topCard.rank - 1 && card.suit === topCard.suit);
    if (isValid) return true;
  }
  return false;
}
