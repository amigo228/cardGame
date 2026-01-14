import Card from './card.js';

export default function createDeck() {
  const suits = ['h', 'd', 'c', 's'];
  const deck = [];

  for (let d = 0; d < 2; d++) {
    for (const suit of suits) {
      for (let rank = 1; rank <= 13; rank++) {
        deck.push(new Card(suit, rank, suit + (rank < 10 ? "0" + rank : rank)));
      }
    }
  }
  console.log(deck)

  return Phaser.Utils.Array.Shuffle(deck);
}