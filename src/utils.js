import Card from './card.js';
import { playInvalidCardAnimation } from './invalidCardAnimation.js';
import { playRewardGemAnimation } from './rewardGemAnimation.js';
import { gameWon } from './gameWon.js';


export function createDeck(scene) {
  const suits = ['c', 'd', 'h', 's'];
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

export async function renderDeck(scene, deck) {
  const centerX = 1160;
  const startY = 200;
  const rows = [
    { count: 10, y: startY, gap: 145, arc: 60 },
    { count: 6, y: startY + 260, gap: 145, arc: 22 }
  ];

  const totalStacks = rows[0].count + rows[1].count;
  scene.tableau = Array.from({ length: totalStacks }, () => []);

  deck.forEach((card, i) => {
    scene.tableau[i % totalStacks].push(card);
  });

  const stackPositions = [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const rowWidth = (row.count - 1) * row.gap;
    const rowStartX = centerX - rowWidth / 2;

    const center = (row.count - 1) / 2;
    const maxOffset = Math.floor(row.count / 2);

    for (let col = 0; col < row.count; col++) {
      const x = rowStartX + col * row.gap;

      let offsetFromCenter = Math.abs(col - center);
      let normalizedHeight;

      if (row.count === 6) {
        normalizedHeight = offsetFromCenter / 2.5;
      } else {
        normalizedHeight = offsetFromCenter / maxOffset;
      }

      normalizedHeight = Math.min(normalizedHeight, 1);

      const y = row.y + (normalizedHeight * normalizedHeight) * row.arc;

      const angleOffset = (col - center) / center;
      const maxAngle = rowIdx === 0 ? 8 : 6;
      const angle = angleOffset * maxAngle;

      stackPositions.push({
        x: Math.round(x),
        y: Math.round(y),
        angle
      });
    }
  }
  scene.input.enabled = false;

  await new Promise((resolve) => {
    let flyDelay = 0;
    const FLY_STEP = 30;
    let totalTweens = 0;
    let finishedTweens = 0;

    for (let stackIdx = 0; stackIdx < totalStacks; stackIdx++) {
      totalTweens += scene.tableau[stackIdx].length;
    }

    for (let stackIdx = 0; stackIdx < totalStacks; stackIdx++) {
      const stack = scene.tableau[stackIdx];
      const pos = stackPositions[stackIdx];

      stack.forEach((card, cardIdx) => {
        const y = pos.y + cardIdx * -4;

        card.setPosition(centerX, -100);
        card.startX = pos.x;
        card.startY = y;

        card.container.setAngle(0);
        card.originalAngle = pos.angle;
        card.originIndex = cardIdx;
        card.originStackIndex = stackIdx;
        const depth = stackIdx * 100 + (cardIdx + 1);
        card.originalDepth = depth;
        card.container.setDepth(depth);

        scene.tweens.add({
          targets: card.container,
          x: pos.x,
          y: y,
          angle: pos.angle,
          alpha: { from: 0.7, to: 1 },
          ease: 'Sine.easeOut',
          duration: 150,
          delay: flyDelay,
          onComplete: () => {
            finishedTweens++;
            if (finishedTweens === totalTweens) {
              resolve();
            }
          }
        });

        flyDelay += FLY_STEP;
      });
    }
  });

  scene.input.enabled = true;
}


export function registerDragHandlers(scene) {
  scene.input.on('dragstart', (pointer, gameObject) => {
    const currentCard = scene.deck.find(c => c.container === gameObject);
    if (!currentCard) { return; }

    const stackIndex = scene.tableau.findIndex(stack => stack.includes(currentCard));
    if (stackIndex === -1) return;
    const stack = scene.tableau[stackIndex];
    const topCard = stack[stack.length - 1];

    if (currentCard !== topCard) {
      gameObject.disableInteractive();
      gameObject.setDepth(currentCard.originalDepth);
      return;
    }

    gameObject.setInteractive();
    gameObject.setDepth(scene.topDepth);
    currentCard.container.setAngle(0);
    currentCard.originalScale = currentCard.container.scaleX;
    currentCard.container.setScale(currentCard.originalScale * 1.05);

    attachParticlesToCard(scene, currentCard);

    currentCard._lastEmitX = gameObject.x;
    currentCard._lastEmitY = gameObject.y;
    currentCard._emitDistanceThreshold = 30; 

    if (scene.hint) {
      scene.hint.clear();
      scene.isDragging = true;
      if (scene.hint.hintFoundation) {
        scene.hint.drawArrow(
          scene.hint.hintFoundation.x,
          scene.hint.hintFoundation.y - 140,
          -90,
          currentCard
        );
      }
    }
  });

  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
    const currentCard = scene.deck.find(c => c.container === gameObject);
    if (!currentCard) return;

    if (!currentCard.particleManager) return;

    const lastX = currentCard._lastEmitX ?? dragX;
    const lastY = currentCard._lastEmitY ?? dragY;
    const dx = dragX - lastX;
    const dy = dragY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const threshold = currentCard._emitDistanceThreshold ?? 50;

    if (dist >= threshold) {
      currentCard.particleManager.emitParticleAt(dragX, dragY, 1);
      currentCard._lastEmitX = dragX;
      currentCard._lastEmitY = dragY;
    }
  });

  scene.input.on('dragend', (pointer, gameObject) => {
    const currentCard = scene.deck.find(c => c.container === gameObject);
    if (!currentCard) return;

    if (currentCard.particleEmitter) {
      currentCard.particleEmitter.stop && currentCard.particleEmitter.stop();
      currentCard.particleEmitter.destroy && currentCard.particleEmitter.destroy();
      currentCard.particleEmitter = null;
    }
    currentCard.container.setScale(currentCard.originalScale);
    let placed = false;

    for (const f of scene.foundations) {
      const dx = gameObject.x - f.x;
      const dy = gameObject.y - f.y;

      const thresholdX = 100;
      const thresholdY = 100;

      if (Math.abs(dx) < thresholdX && Math.abs(dy) < thresholdY) {
        const topCard = f.cards[f.cards.length - 1];
        if ((f.type === 'asc' && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank + 1) ||
          (f.type === 'desc' && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank - 1)) {
          scene.returnStack.push(currentCard);
          scene.hud?.updateReturnButton();
          currentCard.container.x = f.x;
          currentCard.container.y = f.y;
          currentCard.container.setDepth(200 + f.cards.length + 1);
          f.cards.push(currentCard);
          scene.deck = scene.deck.filter(c => c !== currentCard);

          for (const stack of scene.tableau) {
            const idx = stack.indexOf(currentCard);
            if (idx !== -1) {
              stack.splice(idx, 1);
              break;
            }
          }

          playRewardGemAnimation(scene, currentCard.container.x, currentCard.container.y);

          currentCard.container.input.draggable = false;
          currentCard.container.on('pointerdown', () => {
            playInvalidCardAnimation(scene, currentCard.container);
          });

          // add to return back stack
          placed = true;

          gameWon(scene);
        }
      }
    }

    if (!placed) {
      scene.tweens.add({
        targets: currentCard.container,
        x: currentCard.startX,
        y: currentCard.startY,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
          currentCard.container.setDepth(currentCard.originalDepth);
        }
      });
      currentCard.container.setAngle(currentCard.originalAngle);
    }

    scene.isDragging = false;
    scene.resetHintTimer();
    if (scene.hint) {
      scene.hint.hintFoundation = null;
      scene.hint.hintCard = null;
    }
  });
}

export function renderFoundation(scene) {
  const fStartX = 500;
  const fStartY = 920;
  const gap = 160;

  const suits = ['h', 'd', 'c', 's'];

  const foundations = [];
  const usedCards = new Set();

  const placeCard = (card, x, y) => {
    card.setPosition(x, y);

    card.container.input.draggable = false;
    card.container.on('pointerdown', () => {
      playInvalidCardAnimation(scene, card.container);
    });
    card.container.setDepth(200);
  };

  suits.forEach((suit, i) => {
    const ace = scene.deck.find(c => c.suit === suit && c.rank === 1);
    const king = scene.deck.find(c => c.suit === suit && c.rank === 13);

    if (ace) {
      const x = fStartX + i * gap;
      placeCard(ace, x, fStartY);

      foundations.push({
        type: 'asc',
        suit,
        cards: [ace],
        x,
        y: fStartY
      });

      usedCards.add(ace);
    }

    if (king) {
      const x = fStartX + (suits.length + i) * gap + 200;
      placeCard(king, x, fStartY);

      foundations.push({
        type: 'desc',
        suit,
        cards: [king],
        x,
        y: fStartY
      });

      usedCards.add(king);
    }
  });

  scene.deck = scene.deck.filter(c => !usedCards.has(c));

  scene.foundations = foundations;
}

export function createSpark(scene) {
  const size = 32;
  const graphics = scene.add.graphics();

  const spikes = 5;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.4;

  graphics.fillStyle(0xFFFFFF, 1);
  graphics.lineStyle(2, 0xFFFF00, 1);

  let x = size / 2;
  let y = size / 2;

  let rot = Math.PI / 2 * 3;
  let step = Math.PI / spikes;

  graphics.beginPath();
  graphics.moveTo(x, y - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = size / 2 + Math.cos(rot) * outerRadius;
    y = size / 2 + Math.sin(rot) * outerRadius;
    graphics.lineTo(x, y);
    rot += step;

    x = size / 2 + Math.cos(rot) * innerRadius;
    y = size / 2 + Math.sin(rot) * innerRadius;
    graphics.lineTo(x, y);
    rot += step;
  }

  graphics.lineTo(size / 2, size / 2 - outerRadius);
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();



  graphics.generateTexture('spark', size, size);
  graphics.destroy();
}

function attachParticlesToCard(scene, card) {
  if (card.particleManager) return;

  card.particleManager = scene.add.particles(0, 0, card.suit, {
    lifespan: 800,
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    gravityY: 200,
    scale: { start: 3, end: 0 },
    alpha: { start: 1, end: 0 },
    quantity: 1,
    frequency: -1 
  });

  if (card.particleManager.setDepth) card.particleManager.setDepth(card.container.depth + 1);
}


