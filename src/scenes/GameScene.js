import { createDeck, isCardValid } from '../utils.js';
import { playInvalidCardAnimation } from '../invalidCardAnimation.js';
import { Hint } from '../hint.js';
import { Hud } from '../hud.js';
export class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  preload() {
    //bg load
    this.load.image('bg', 'assets/bg_gameplay.jpg');

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
    this.isDragging = false;
    this.hud = new Hud(this, this.reloadDeck.bind(this));
    this.hint = new Hint(this);
    const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);;
    bg.displayWidth = this.scale.width;
    bg.displayHeight = this.scale.height;
    this.topDepth = 10000;

    this.hintTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.isDragging) return;
        this.hint.show(this.foundations, this.tableau);
      }
    });
    this.hintArrow = null;
    this.deck = createDeck(this);
    this.renderFoundation();
    this.renderDeck(this.deck);
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
      const currentCard = this.deck.find(c => c.container === gameObject);
      if (!currentCard) return;

      const stackIndex = this.tableau.findIndex(stack => stack.includes(currentCard));
      if (stackIndex === -1) return;
      const stack = this.tableau[stackIndex];
      const topCard = stack[stack.length - 1];

      if (currentCard !== topCard) {
        gameObject.disableInteractive()
        gameObject.setDepth(currentCard.originalDepth);
        return;
      }

      gameObject.setInteractive();
      gameObject.setDepth(this.topDepth);

      if (!isCardValid(this.foundations, currentCard)) {
        gameObject.disableInteractive();

        playInvalidCardAnimation(this, gameObject, () => {
          gameObject.setInteractive({ draggable: true });
        });

        gameObject.setDepth(currentCard.originalDepth);
        return;
      }
      currentCard.originalScale = currentCard.container.scaleX;
      currentCard.container.setScale(currentCard.originalScale * 1.05);

      if (this.hint) {
        this.hint.clear();
        this.isDragging = true;
        if (this.hint.hintFoundation) this.hint.drawArrow(this.hint.hintFoundation.x, this.hint.hintFoundation.y - 140, -90, currentCard);
      }

      console.log('Drag started:', currentCard);
    });


    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      const currentCard = this.deck.find(c => c.container === gameObject);
      currentCard.container.setScale(currentCard.originalScale);
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
        this.tweens.add({
          targets: currentCard.container,
          x: currentCard.startX,
          y: currentCard.startY,
          duration: 200,
          ease: 'Linear',
          onComplete: () => {
            currentCard.container.setDepth(currentCard.originalDepth);
          }
        });
      }

      this.isDragging = false;
      this.resetHintTimer();
      this.hint.hintFoundation = null;
      this.hint.hintCard = null;
    });
  }

  reloadDeck() {
  const flipDuration = 400;

  const topCards = this.tableau.map(stack => stack[stack.length - 1]).filter(Boolean);
  if (!topCards.length) return;

  const cardContainers = topCards.map(c => c.container);

  cardContainers.forEach(container => {
    if (!container.shirtImg) {
      container.shirtImg = this.add.image(0, 0, 'common1', 'card_shirt');
      container.add(container.shirtImg);
      container.shirtImg.setVisible(false);
    }
  });

  this.tweens.add({
    targets: cardContainers,
    scaleX: 0,
    duration: flipDuration,
    ease: 'Linear',
    onComplete: () => {
      cardContainers.forEach(container => container.shirtImg.setVisible(true));

      this.tweens.add({
        targets: cardContainers,
        scaleX: 1.7,
        duration: flipDuration,
        ease: 'Linear',
        onComplete: () => {
          this.tweens.add({
            targets: cardContainers,
            scaleX: 0,
            duration: flipDuration,
            ease: 'Linear',
            onComplete: () => {
              cardContainers.forEach(container => container.shirtImg.setVisible(false));

              this.tweens.add({
                targets: cardContainers,
                scaleX: 1.7,
                duration: flipDuration,
                ease: 'Linear',
              });
            }
          });
        }
      });
    }
  });
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
    if (this.hintTimer) this.hintTimer.remove();

    this.hint.clear();

    this.hintTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.isDragging) return;
        this.hint.show(this.foundations, this.tableau);
      }
    });
  }


}


