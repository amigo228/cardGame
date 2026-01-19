import createDeck from '../utils.js';
export class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.atlas('common1', 'assets/spritesheets/common1.png', 'assets/spritesheets/common1.json');
    this.load.image('card_bg', 'assets/cards/card_bg2.png');
    this.load.image('s', 'assets/cards/s.png');
    this.load.image('d', 'assets/cards/d.png');
    this.load.image('h', 'assets/cards/h.png');
    this.load.image('c', 'assets/cards/c.png');
    this.load.image('card_1rl', 'assets/cards/card_1rl.png');
    this.load.image('card_1bl', 'assets/cards/card_1bl.png');
    this.load.image('card_11rl', 'assets/cards/card_11rl.png');
    this.load.image('card_11bl', 'assets/cards/card_11bl.png');
    this.load.image('card_12rl', 'assets/cards/card_12rl.png');
    this.load.image('card_12bl', 'assets/cards/card_12bl.png');
    this.load.image('card_13rl', 'assets/cards/card_13rl.png');
    this.load.image('card_13bl', 'assets/cards/card_13bl.png');
    const colors = ['r', 'b'];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    for (const color of colors) {
      for (const rank of ranks) {
        const key = `card_${rank}${color}`;
        const path = `assets/cards/${key}.png`;
        this.load.image(key, path);
      }
    }
  }

  create() {
    this.topDepth = 10000;  

    this.hintTimer = this.time.addEvent({
      delay: 5000,
      callback: this.showHint,
      callbackScope: this,
      loop: false
    })
    this.hintArrow = null;
    this.deck = createDeck(this);
    this.renderFoundation();
    this.renderDeck(this.deck);
    this.renderButton();
  }

  renderFoundation() {
    const fStartX = 500;
    const fStartY = 900;
    const gap = 180;

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
      c.setPosition(fStartX + i * gap, fStartY);
      c.container.disableInteractive();
      c.container.setDepth(200);

      this.foundations.push({
        type: 'asc',
        suit: c.suit,
        cards: [c],
        x: c.container.x,
        y: c.container.y
      });
    });

    kingCards.forEach((c, i) => {
      const x = fStartX + (aceCards.length + i) * gap;
      const y = fStartY;

      c.setPosition(x, y);
      c.container.disableInteractive();
      c.container.setDepth(200);

      this.foundations.push({
        type: 'desc',
        suit: c.suit,
        cards: [c],
        x: x,
        y: y
      });
    });

  }


  renderDeck(deck) {
    const startX = 500;
    const startY = 200;
    const gapX = 180;
    const stacksPerRow = 8;
    const rows = 2;

    const stacks = stacksPerRow * rows;

    this.tableau = Array.from({ length: stacks }, () => []);

    deck.forEach((card, i) => {
      const stackIndex = i % stacks;
      const row = Math.floor(stackIndex / stacksPerRow);
      const col = stackIndex % stacksPerRow;

      const x = startX + col * gapX;
      const y = startY + row * 240 + this.tableau[stackIndex].length * 4;

      card.setPosition(x, y);
      card.startX = x;
      card.startY = y;

      this.tableau[stackIndex].push(card);
      card.originalDepth = stackIndex * 100 + this.tableau[stackIndex].length;
      card.container.setDepth(stackIndex * 100 + this.tableau[stackIndex].length);
    });


    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setDepth(10000);
      console.log(pointer, gameObject)
      if (this.hintArrow) {
        this.hintArrow.destroy();
        this.hintArrow = null;
      }
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      const currentCard = this.deck.find(c => c.container === gameObject);
      let placed = false;
      for (const f of this.foundations) {
        const dx = gameObject.x - f.x;
        const dy = gameObject.y - f.y;

        const thresholdX = 40;
        const thresholdY = 60;

        if (Math.abs(dx) < thresholdX && Math.abs(dy) < thresholdY) {
          const topCard = f.cards[f.cards.length - 1];
          if ((f.type === 'asc' && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank + 1) ||
            (f.type === 'desc' && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank - 1)) {
            currentCard.container.x = f.x;
            currentCard.container.y = f.y;
            currentCard.container.setDepth(5000 + f.cards.length + 1)
            f.cards.push(currentCard);
            this.deck = this.deck.filter(c => c !== currentCard);

            for (const stack of this.tableau) {
              const idx = stack.indexOf(currentCard);
              if (idx !== -1) {
                stack.splice(idx, 1);
                break;
              }
            }

            currentCard.container.disableInteractive();
            placed = true;

            this.checkWin();
          }

        }
      }
      if (!placed) {
        currentCard.container.setDepth(currentCard.originalDepth);
        this.tweens.add({
          targets: currentCard.container,
          x: currentCard.startX,
          y: currentCard.startY,
          duration: 200,
          ease: 'Linear'
        });
      }

      this.resetHintTimer();

    });
  }

  renderButton() {
    const btnWidth = 220;
    const btnHeight = 50;
    const btnX = this.scale.width / 2 + 170;
    const btnY = 670;

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
    this.deck.forEach((card, i) => {
      card.setPosition(card.startX, card.startY);
      card.container.setDepth(0);
      card.container.setInteractive();
    });
    this.deck = Phaser.Utils.Array.Shuffle(this.deck);
    this.input.removeAllListeners('dragstart');
    this.input.removeAllListeners('drag');
    this.input.removeAllListeners('dragend');
    this.renderDeck(this.deck)
    this.resetHintTimer();
  }


  checkWin() {
    const allFull = this.foundations.every(f => f.cards.length === 13);
    if (allFull) {
      this.showWinMessage();
    }
  }

  showWinMessage() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    const msg = this.add.text(width / 2, height / 2, 'YOU WON!', {
      fontSize: '74px',
      color: '#ff0000',
      fontStyle: 'bold',
      backgroundColor: '#ffffff'
    }).setOrigin(0.5).setDepth(1000);;

    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => msg.destroy()
    });
  }

  resetHintTimer() {
    if (this.hintTimer) {
      this.hintTimer.remove();
    }
    this.hintTimer = this.time.addEvent({
      delay: 5000,
      callback: this.showHint,
      callbackScope: this
    });
  }

  showHint() {
    let hintCard = undefined;
    let hintFoundation = undefined;
    console.log(this.tableau)
    for (let i = 0; i < this.foundations.length; ++i) {
      if (hintCard) break;
      const type = this.foundations[i].type;
      const suit = this.foundations[i].suit;
      const rank = this.foundations[i].cards[this.foundations[i].cards.length - 1].rank;
      for (let j = 0; j < this.tableau.length; ++j) {
        if (hintCard) break;
        const topCard = (this.tableau[j])[this.tableau[j].length - 1];
        if (type === "asc" && suit === topCard.suit && topCard.rank === rank + 1 || type === "desc" && suit === topCard.suit && topCard.rank === rank - 1) {
          hintFoundation = this.foundations[i];
          hintCard = topCard;
        }
      }
    }

    if (!hintCard) {
      //shuffleHint
      console.log("shuffle");
      return;
    }
    // I need find x and y for hint arrow here , maybe will use func 

    if (this.hintArrow) {
      this.hintArrow.destroy();
      this.hintArrow = null;
    }
    this.hintArrow = this.add.image(hintCard.startX, hintCard.startY + 160, 'common1', 'tutorial_arrow').setScale(1.7).setAngle(90).setDepth(100000);
    this.tweens.add({
      targets: this.hintArrow,
      y: this.hintArrow.y - 20,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    })

    console.log(this.foundations);
    console.log(this.deck)
    console.log("Show hint card: ", hintCard);
    console.log("Show hint found: ", hintFoundation);
  }
}


