import Card from './card.js';

export default function createDeck(scene) {            
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
