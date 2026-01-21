import Card from './card.js';
import { playInvalidCardAnimation } from './invalidCardAnimation.js';
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

export function renderDeck(scene, deck) {
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
        angle: angle
      });
    }
  }
  
  for (let stackIdx = 0; stackIdx < totalStacks; stackIdx++) {
    const stack = scene.tableau[stackIdx];
    const pos = stackPositions[stackIdx];
    
    stack.forEach((card, cardIdx) => {
      const y = pos.y + cardIdx * -4;
      
      card.setPosition(pos.x, y);
      card.startX = pos.x;
      card.startY = y;
      card.container.setAngle(pos.angle);
      card.originalAngle = pos.angle;
      
      const depth = stackIdx * 100 + (cardIdx + 1);
      card.originalDepth = depth;
      card.container.setDepth(depth);
    });
  }
}

export function registerDragHandlers(scene) {
  scene.input.on('dragstart', (pointer, gameObject) => {
    const currentCard = scene.deck.find(c => c.container === gameObject);
    if (!currentCard) return;

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

    if (!isCardValid(scene.foundations, currentCard)) {
      gameObject.disableInteractive();

      playInvalidCardAnimation(scene, gameObject, () => {
        gameObject.setInteractive({ draggable: true });
      });

      gameObject.setDepth(currentCard.originalDepth);
      return;
    }
    currentCard.container.setAngle(0);
    currentCard.originalScale = currentCard.container.scaleX;
    currentCard.container.setScale(currentCard.originalScale * 1.05);

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

    // debug
    // console.log('Drag started:', currentCard);
  });

  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  scene.input.on('dragend', (pointer, gameObject) => {
    const currentCard = scene.deck.find(c => c.container === gameObject);
    if (!currentCard) return;

    currentCard.container.setScale(currentCard.originalScale);
    let placed = false;

    for (const f of scene.foundations) {
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

          currentCard.container.disableInteractive();
          placed = true;
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
  const fStartY = 900;
  const gap = 180;

  const suits = ['h', 'd', 'c', 's'];

  const foundations = [];
  const usedCards = new Set();

  const placeCard = (card, x, y) => {
    card.setPosition(x, y);
    card.container.disableInteractive();
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
      const x = fStartX + (suits.length + i) * gap;
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

