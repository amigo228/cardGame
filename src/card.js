export default class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.key = suit + (rank < 10 ? '0' + rank : rank); 
        this.faceUp = false;
    }

    toggle() {
        this.faceUp = !this.faceUp;
    }
}