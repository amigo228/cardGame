import { createDeck, renderDeck, renderFoundation, createSpark } from '../utils.js';
import { registerDragHandlers } from '../registerDragHandlers.js';
import { Hint } from '../hint.js';
import { Hud } from '../hud.js';
import { Tutorial } from '../tutorial.js';
import { GameState } from '../GameState.js';
import {Bot} from '../bot.js';
import { BOT_ASSETS } from '../../assets/bots/bots.js';
export class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  preload() {
  }


  create() {
    this.bots = BOT_ASSETS.filter(bot => bot.inGame);
    this.bot1 = new Bot(this, this.bots[0], 210, 430, 'OPPONENT 1');
    this.bot2 = new Bot(this, this.bots[1], 210, 600, 'OPPONENT 2');
    createSpark(this);
    this.returnStack = [];

    if (GameState.currentLevel === 1) {
      this.tutorial = new Tutorial(this);
      this.deck = this.tutorial.createTutorialDeck();
    }
    else {
      this.deck = createDeck(this);
    }

    this.hud = new Hud(this, this.reloadDeck.bind(this));
    this.hint = new Hint(this);
    const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);
    bg.displayWidth = this.scale.width;
    bg.displayHeight = this.scale.height;
    this.topDepth = 10000;
    this.isDragging = false;
    renderFoundation(this);
    renderDeck(this, this.deck);
    registerDragHandlers(this);
    this.hintTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.isDragging) return;
        this.hint.show(this.foundations, this.tableau);
      }
    });

  }

  reloadDeck() {
    const flipDuration = 300;
        this.hint.clear(false);
    this.resetHintTimer();

    const topCards = this.tableau
      .map(stack => stack[stack.length - 1])
      .filter(Boolean);

    if (!topCards.length) return;

    const topContainers = topCards.map(c => c.container);
    const topSet = new Set(topCards);

    const allCards = [];
    for (const stack of this.tableau) {
      for (const card of stack) {
        allCards.push(card);
      }
    }

    const bottomCards = allCards.filter(c => !topSet.has(c));

    const indices = allCards.map((_, i) => i);
    Phaser.Utils.Array.Shuffle(indices);

    const targetData = allCards.map((_, i) => {
      const src = allCards[indices[i]];
      return { rank: src.rank, suit: src.suit, color: src.color };
    });

    const prevInputEnabled = this.input.enabled;
    this.input.enabled = false;
    topContainers.forEach(tc => tc.disableInteractive());

    const ensureShirt = (container) => {
      if (!container._shirtImg || container._shirtImg.destroyed) {
        container._shirtImg = this.add
          .image(0, 0, 'common1', 'card_shirt')
          .setOrigin(0.5);
        container.add(container._shirtImg);
      } else {
        container._shirtImg.setVisible(true);
      }

      container.list.forEach(child => {
        if (child !== container._shirtImg) child.setVisible(false);
      });
    };

    const showFaceAgain = (container) => {
      if (container._shirtImg) container._shirtImg.setVisible(false);
      container.list.forEach(child => {
        if (child !== container._shirtImg) child.setVisible(true);
      });
    };

    const hideFace = (card) => {
      if (card.rankImg) card.rankImg.setVisible(false);
      if (card.suitImg) card.suitImg.setVisible(false);
      if (card.extraImg) card.extraImg.setVisible(false);
    };

    const showFace = (card) => {
      if (card.rankImg) card.rankImg.setVisible(true);
      if (card.suitImg) card.suitImg.setVisible(true);
      if (card.extraImg) card.extraImg.setVisible(true);
    };

    bottomCards.forEach(hideFace);

    this.tweens.add({
      targets: topContainers,
      scaleX: 0,
      duration: flipDuration,
      ease: 'Linear',
      onComplete: () => {

        topContainers.forEach(cont => ensureShirt(cont));

        this.tweens.add({
          targets: topContainers,
          scaleX: 1.7,
          duration: flipDuration,
          ease: 'Linear',
          onComplete: () => {

            this.tweens.add({
              targets: topContainers,
              scaleX: 0,
              duration: flipDuration,
              ease: 'Linear',
              onComplete: () => {

                allCards.forEach((card, i) => {
                  const t = targetData[i];
                  if (card.particleManager) {
                    card.particleManager.destroy();
                    card.particleManager = null;
                  }
                  card.updateFace(t.rank, t.suit, t.color, false);
                });

                topContainers.forEach(cont => showFaceAgain(cont));

                this.tweens.add({
                  targets: topContainers,
                  scaleX: 1.7,
                  duration: flipDuration,
                  ease: 'Linear',
                  onComplete: () => {

                    bottomCards.forEach(showFace);

                    topContainers.forEach(tc =>
                      tc.setInteractive({ draggable: true })
                    );
                    this.input.enabled = prevInputEnabled;
                  }
                });
              }
            });
          }
        });
      }
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


