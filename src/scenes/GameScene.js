import createDeck from '../utils.js';
export class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

 preload() {
    this.load.image('card_back', 'assets/cards/Card-Back-03.png');

    const suits = ['h', 'd', 'c', 's'];
    for (const suit of suits) {
        for (let rank = 1; rank <= 13; rank++) {
            const key = suit + (rank < 10 ? '0' + rank : rank);
            const path = `assets/cards/${key}.png`;
            this.load.image(key, path);
        }
    }
}

  create() {
    this.deck = createDeck();
    this.renderFoundation();
    this.renderDeck(this.deck);
    this.renderButton();
}

renderFoundation() {
  const fStartX = 350;
  const fStartY = 400;
  const gap = 80;

  const suits = ['h', 'd', 'c', 's'];
  const aceCards = [];
  const kingCards = [];

  for (const suit of suits) {
    const aceIndex = this.deck.findIndex(c => c.suit === suit && c.rank === 1);
    if (aceIndex !== -1) aceCards.push(this.deck[aceIndex]);

    const kingIndex = this.deck.findIndex(c => c.suit === suit && c.rank === 13);
    if (kingIndex !== -1) kingCards.push(this.deck[kingIndex]);
  }

  this.deck = this.deck.filter(c => !aceCards.includes(c) && !kingCards.includes(c));

  this.foundations = [];

  aceCards.forEach((c, i) => {
    c.img = this.add.image(fStartX + i * gap, fStartY, c.key).setScale(0.1);
    c.img.disableInteractive();

    this.foundations.push({
      type: 'asc',
      suit: c.suit,
      cards: [c],
      x: c.img.x,
      y: c.img.y
    });
  });

  kingCards.forEach((c, i) => {
    c.img = this.add
      .image(fStartX + (aceCards.length + i) * gap, fStartY, c.key)
      .setScale(0.1);
    c.img.disableInteractive();

    this.foundations.push({
      type: 'desc',
      suit: c.suit,
      cards: [c],
      x: c.img.x,
      y: c.img.y
    });
  });

  this.add.text(
    fStartX + (aceCards.length - 1) * gap / 2, 
    fStartY - 70, 
    'Asc', 
    {
        fontSize: '18px',
        color: '#000000',
        fontStyle: 'bold'
    }
).setOrigin(0.5).setDepth(500);

this.add.text(
    fStartX + (aceCards.length + kingCards.length - 1) * gap / 1.27, 
    fStartY - 70,
    'Desc',
    {
        fontSize: '18px',
        color: '#000000',
        fontStyle: 'bold'
    }
).setOrigin(0.5).setDepth(500);
}


  renderDeck(deck) {

    const startX = 350;
    const startY = 100;
    const gapX = 80;
    const gapY = 120;
    const stacksPerRow = 8;
    const rows = 2;

    const stacks = stacksPerRow * rows;
    if (this.deckText) {
      this.deckText.destroy();
    }

    this.deckText = this.add.text(
        this.scale.width / 2, 
        startY - 80,
        'Deck',
        {
            fontSize: '18px',
            color: '#000000',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5).setDepth(500);
    const tableau = Array.from({ length: stacks }, () => []);

    deck.forEach((card, i) => {
        const stackIndex = i % stacks;
        const row = Math.floor(stackIndex / stacksPerRow);
        const col = stackIndex % stacksPerRow;

        const x = startX + col * gapX;
        const y = startY + row * gapY;

        card.startX = x;
        card.startY = y;

        card.img = this.add.image(x, y, card.key)
            .setScale(0.1)
            .setInteractive({ draggable: true });

        tableau[stackIndex].push(card);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
        gameObject.setDepth(100); 
        console.log(pointer, gameObject)
    });

     this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
        const currentCard = this.deck.find(c => c.img === gameObject);
        let placed = false;
        for (const f of this.foundations) {
            const dx = gameObject.x - f.x;
            const dy = gameObject.y - f.y;

            const thresholdX = 40; 
            const thresholdY = 60; 

            if (Math.abs(dx) < thresholdX && Math.abs(dy) < thresholdY) {
                const topCard = f.cards[f.cards.length - 1];
                if((f.type === 'asc' && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank + 1) ||
                (f.type === 'desc' && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank - 1)){
                  currentCard.img.x = f.x;
                  currentCard.img.y = f.y;
                  currentCard.img.setDepth(f.cards.length + 1)
                  f.cards.push(currentCard);
                  this.deck = this.deck.filter(c => c !== currentCard);
                  currentCard.img.disableInteractive();
                  placed = true;

                   this.checkWin();
                }
                
            }
        }
        if(!placed) {
          currentCard.img.x = currentCard.startX;
          currentCard.img.y = currentCard.startY;
        }

    });
}  

  renderButton() {
    const btnWidth = 220;
    const btnHeight = 50;
    const btnX = this.scale.width / 2;
    const btnY = 550;

    const buttonBg = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x6666ff)
        .setInteractive({ useHandCursor: true })  
        .on('pointerdown', () => this.reloadDeck());

    const buttonText = this.add.text(btnX, btnY, 'Shuffle cards', {
        fontSize: '20px',
        color: '#ffffff'
    }).setOrigin(0.5);

    this.reloadButton = this.add.container(0, 0, [buttonBg, buttonText]);
  }

  reloadDeck() {
    this.deck.forEach(c => {
        if(c.img) c.img.destroy();
    });
    this.deck = Phaser.Utils.Array.Shuffle(this.deck);
    this.input.removeAllListeners('dragstart');
    this.input.removeAllListeners('drag');
    this.input.removeAllListeners('dragend');
    this.renderDeck(this.deck)
  }

  checkWin() {
    const allFull = this.foundations.every(f => f.cards.length === 13);
    if(allFull) {
        this.showWinMessage();
    }
}

showWinMessage() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    const msg = this.add.text(width/2, height/2, 'YOU WON!', {
        fontSize: '74px',
        color: '#ff0000',
        fontStyle: 'bold',
        backgroundColor: '#ffffff'
    }).setOrigin(0.5).setDepth(1000); ;

    this.tweens.add({
        targets: msg,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => msg.destroy()
    });
}
}


