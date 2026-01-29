import { createDeck, renderDeck, renderFoundation, createSpark } from '../utils.js';
import { registerDragHandlers } from '../registerDragHandlers.js';
import { Hint } from '../hint.js';
import { Hud } from '../hud.js';
import { Tutorial } from '../tutorial.js';
import { GameState } from '../GameState.js';
import { Bot } from '../bot.js';
import { Player } from '../player.js';
import { BOT_ASSETS } from '../../assets/bots/bots.js';
import { drawOtherTutorials } from '../drawOtherTutorials.js';

export class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  preload() {
  }


  create() {
    this.gameEnded = false;
    // INITING BOTS
    console.log("avail.bots", BOT_ASSETS);
    this.bots = BOT_ASSETS.filter(bot => bot.inGame);
    this.bot1 = new Bot(this, this.bots[0], 210, 600, 'OPPONENT 1');
    this.bot1.start();

    this.bot2 = new Bot(this, this.bots[1], 210, 770, 'OPPONENT 2');
    this.bot2.start();

    // INITING PLAYER
    this.player = new Player(this, "player_icon", 210, 430, 'PLAYER');


    //INITING LEADERBORD
    this.leaderboard = [
      this.player,
      this.bot1,
      this.bot2
    ];

    //OTHER CODE FIELD AND OTHER
    createSpark(this);
    this.returnStack = [];

    if (GameState.currentLevel === 1) {
      console.log("Gamestate 1")
      this.tutorial = new Tutorial(this);
      this.deck = this.tutorial.createTutorialDeck();
    }
    else if (GameState.currentLevel === 2) {
      this.tutorialActive = true;
      this.tutorial = null;
      drawOtherTutorials(this, this.scale.width / 2, this.scale.height / 2, 'These are your opponents.\n Your task is to clear the\n field faster than them.', { x: 450, y: 680, angle: 0 }, null, () => {
            this.tutorialActive = false;
            this.resetHintTimer();
        });
      this.deck = createDeck(this);
    }
    else if (GameState.currentLevel === 3) {
      this.tutorialActive = true;
      this.tutorial = null;
      drawOtherTutorials(
        this, 
        720, 
        970, 
        'Use magic booster to find\n one suitable card on field', 
        { x: 400, y: 970, angle: 0 },
        {
            x: 570,
            y: 970,
            text: 'Use joker booster to find\n eight suitable cards on field',
            arrow: { x: 220, y: 970, angle: 0 }
        },
        () => {
            this.tutorialActive = false;
            this.resetHintTimer();
        }
    );
      this.deck = createDeck(this);
    }
    else {
      this.tutorial = null;
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

    if (this.tutorialActive) return;

    this.hintTimer = this.time.addEvent({
        delay: 5000,
        callback: () => {
            if (this.isDragging) return;
            this.hint.show(this.foundations, this.tableau);
        }
    });
}

  updateLeaderboard() {
    const startY = 430;
    const stepY = 170;

    const sorted = [...this.leaderboard].sort(
      (a, b) => b.getScore() - a.getScore()
    );

    sorted.forEach((entity, index) => {
      const targetY = startY + index * stepY;
      const wrapper = entity.getWrapper();

      this.tweens.add({
        targets: wrapper,
        y: targetY,
        duration: 400,
        ease: 'Sine.easeInOut'
      });
    });
  }

  checkGameEnd() {
    if (this.gameEnded) return;

    const maxScore = 96;

    if (this.player.score >= maxScore) {
      this.showEndScreen(true, this.player.name);
      return;
    }

    const winnerBot = this.leaderboard.find(
      e => e !== this.player && e.score >= maxScore
    );

    if (winnerBot) {
      this.showEndScreen(false, winnerBot.name);
    }
  }

  showEndScreen(isPlayerWinner, playerName) {
    if (this.gameEnded) return;
    BOT_ASSETS.forEach(bot => bot.inGame = false);

    this.gameEnded = true;

    this.input.enabled = false;

    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.4
    ).setDepth(100000);

    const text = isPlayerWinner
      ? "GAME WON!"
      : `Player ${playerName} won this level`;

    const winText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      text,
      {
        fontFamily: 'Arial',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
      }
    )
      .setOrigin(0.5)
      .setDepth(100001)
      .setScale(0);

    this.tweens.add({
      targets: winText,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 800,
      onComplete: () => {
        this.time.delayedCall(3000, () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);

          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start("MapScene", { nextLevel: true });
          });
        });
      }
    });
  }
}


