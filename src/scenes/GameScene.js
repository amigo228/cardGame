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

  create() {
    this.gameEnded = false;

    if (!GameState.tournamentPlayers || GameState.tournamentPlayers.length === 0) {
      const players = [{ id: 'player', type: 'player', key: 'player_icon' }];

      const botsForTournament = BOT_ASSETS
        .filter(b => b.inGame)
        .slice(0, 2)
        .map(b => ({ id: b.id, type: 'bot', key: b.id }));

      GameState.tournamentPlayers = players.concat(botsForTournament);
      GameState.eliminatedBots = GameState.eliminatedBots || [];
      GameState.currentRound = GameState.currentRound || 1;
    }

    const activeBotEntries = GameState.tournamentPlayers
      .filter(p => p.type === 'bot' && !GameState.eliminatedBots.includes(p.id));

    this.bots = activeBotEntries.map(pe => BOT_ASSETS.find(a => a.id === pe.id)).filter(Boolean);
const indices = Phaser.Math.Between(0, 1) === 0 ? [0, 1] : [1, 0];
    if (this.bots[0]) {
      this.bot1 = new Bot(this, this.bots[0], 210, 600, 'OPPONENT 1', indices[0]);
    } else {
      this.bot1 = null;
    }
    if (this.bots[1]) {
      this.bot2 = new Bot(this, this.bots[1], 210, 770, 'OPPONENT 2', indices[1]);
    } else {
      this.bot2 = null;
    }


    // INITING PLAYER
    this.player = new Player(this, "player_icon", 210, 430, 'PLAYER');

    // INITING LEADERBOARD 
    this.leaderboard = [this.player, this.bot1, this.bot2].filter(Boolean);

    this.bot1?.start();
this.bot2?.start();

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
      if (!entity) return;

      const wrapper = entity.getWrapper();
      if (!wrapper) return;

      const targetY = startY + index * stepY;

      this.tweens.add({
        targets: wrapper,
        y: targetY,
        duration: 400,
        ease: 'Sine.easeInOut'
      });
    });
  }

  checkRoundEnd() {
    if (this.gameEnded) return;

    const maxScore = 96;
    const winner = this.leaderboard.find(e => e.score >= maxScore);
    if (!winner) return;

    this.gameEnded = true;
    const loser = this.leaderboard.find(e => e !== winner);
    this.showRoundEndScreen(winner, loser);
  }

  showRoundEndScreen(winner, loser) {
    this.input.enabled = false;

    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.4
    ).setDepth(300000);

    const text = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 60,
      `${GameState.currentRound === 1 ? "ROUND" : "LEVEL"} WINNER\n${winner.name}`,
      {
        fontSize: '56px',
        fontStyle: 'bold',
        color: '#ff3333',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setDepth(300001);

    this.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(2000, () => {
      overlay.destroy();
      text.destroy();

      let loserId = null;
      if (loser === this.player) loserId = 'player';
      else if (loser && loser.botId) loserId = loser.botId;

      const knockoutUI = this.drawKnockoutTournament(loserId);

      if (loserId && knockoutUI.uiMap && knockoutUI.uiMap[loserId]) {
        this.crossOut(knockoutUI.uiMap[loserId]);
        knockoutUI.uiMap[loserId].setAlpha(0.5);
      }

      this.time.delayedCall(1500, () => {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.handleAfterRound(loser);
        });
      });
    });
  }

  drawKnockoutTournament(loserId) {
    const root = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY).setDepth(200000);
    const bg = this.add.image(0, 0, 'common2', 'win_bg_big');
    root.add(bg);
    root.setSize(bg.width, bg.height);
    root.setScale(1.5);

    root.add(this.add.text(0, -250, 'KNOCKOUT TOURNAMENT', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      fontStyle: 'bold',
      strokeThickness: 6
    }).setOrigin(0.5));

    const winnerCup = this.add.container(0, -100);
    winnerCup.add(this.add.image(0, 0, 'common2', 'cup_tournament').setScale(0.8));
    root.add(winnerCup);

    const loadingText = loserId === 'player' ? 'You lose' : (GameState.currentRound === 1 ? 'Starting next round...' : "Loading map...");

    const loading = this.add.container(0, 210);
    loading.add(this.add.image(0, 0, 'common1', 'panel1'));
    loading.add(this.add.text(0, 0, loadingText, {
      fontFamily: 'Arial', fontSize: '24px', color: '#000000', fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5).setDepth(10));
    root.add(loading);

    const slots = [{ x: -150, y: 80 }, { x: 0, y: 80 }, { x: 150, y: 80 }];

    const uiMap = {};

    GameState.tournamentPlayers.forEach((p, i) => {
      const slot = slots[i] || { x: -150 + i * 150, y: 80 }; 
      const ui = this.createUserWrapper(p.type === 'player', slot, p.type === 'bot' ? p.key : null);
      root.add(ui);
      uiMap[p.id] = ui;

      if (GameState.eliminatedBots.includes(p.id)) {
        this.crossOut(ui);
        ui.setAlpha(0.5);
      }
    });

    return { root, uiMap };
  }

  createUserWrapper(isUser, positions, bot_key = null) {
    const wrapper = this.add.container(positions.x, positions.y);
    const bg = this.add.image(0, 0, 'common1', isUser ? 'ava_user_frame' : 'ava_frame');
    wrapper.bg = bg;
    const wi = this.add.image(
      0,
      0,
      isUser ? 'player_icon' : bot_key,
      null
    ).setScale(isUser ? 0.7 : 1);
    wrapper.wi = wi;
    wrapper.add([bg, wi]);
    return wrapper;
  }

  crossOut(wrapper) {
    if (!wrapper) return;

    const size = 80;
    const thickness = 10;

    const g = this.add.graphics();
    g.lineStyle(thickness, 0xff0000, 1);

    g.beginPath();
    g.moveTo(-size / 2, -size / 2);
    g.lineTo(size / 2, size / 2);
    g.strokePath();

    g.beginPath();
    g.moveTo(size / 2, -size / 2);
    g.lineTo(-size / 2, size / 2);
    g.strokePath();

    g.setScale(0);
    g.setDepth((wrapper.depth || 0) + 10);

    wrapper.add(g);

    this.tweens.add({
      targets: g,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    wrapper.cross = g;
  }

  handleAfterRound(loser) {
    if (loser === this.player) {
      GameState.eliminatedBots.push('player');
      GameState.resetTournament();
      BOT_ASSETS.forEach(b => b.inGame = false)
      this.scene.start('MapScene');
      return;
    }

    if (loser && loser.botId) {
      GameState.eliminatedBots.push(loser.botId);
    }

    if (GameState.currentRound < GameState.maxRounds) {
      GameState.nextRound();
      this.scene.restart();
    } else {
      GameState.resetTournament();
      BOT_ASSETS.forEach(b => b.inGame = false)
      this.scene.start('MapScene', { nextLevel: true });
    }
  }

}


