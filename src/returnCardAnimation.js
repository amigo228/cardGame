import { compactStack } from './compactStack.js';

export function returnCardAnimation(scene) {
  scene.hint.clear(false);
  scene.resetHintTimer(); 
  const action = Array.isArray(arguments[1]) ? arguments[1].pop() : scene.returnStack.pop();
  if (!action) return;

  const cardToReturn = action.card;
  if (!cardToReturn) return;

  if (scene.tweens) {
    try { scene.tweens.killTweensOf(cardToReturn.container); } catch (e) {}
  }

  cardToReturn.container.setDepth(10000);

  const targetX = action.prevStartX ?? cardToReturn.startX ?? (cardToReturn.container.x || 0);
  const targetY = action.prevStartY ?? cardToReturn.startY ?? (cardToReturn.container.y || 0);

  scene.tweens.add({
    targets: cardToReturn.container,
    duration: 400,
    x: targetX,
    y: targetY,
    ease: 'Linear',
    onComplete: () => {
      scene.hud?.updateReturnButton();

      if (scene.tweens) {
        try { scene.tweens.killTweensOf(cardToReturn.container); } catch (e) {}
      }

      cardToReturn.container.setDepth(action.prevOriginalDepth ?? cardToReturn.originalDepth ?? 0);
      cardToReturn.container.setAngle(action.prevOriginalAngle ?? cardToReturn.originalAngle ?? 0);
      if (cardToReturn.originalScale) {
        cardToReturn.container.setScale(cardToReturn.originalScale);
      }

      try { cardToReturn.container.off && cardToReturn.container.off('pointerdown'); } catch (e) {}

      if (action.toType === 'foundation') {
        const fidx = action.toFoundationIndex;
        if (Array.isArray(scene.foundations) && scene.foundations[fidx]) {
          const f = scene.foundations[fidx];
          const idx = f.cards.indexOf(cardToReturn);
          if (idx !== -1) f.cards.splice(idx, 1);
        }
      } else if (action.toType === 'tableau') {
        const ts = action.toStack;
        if (Number.isFinite(ts) && scene.tableau[ts]) {
          const idx = scene.tableau[ts].indexOf(cardToReturn);
          if (idx !== -1) scene.tableau[ts].splice(idx, 1);
          compactStack(scene.tableau[ts]);
        }
      }

      if (action.fromType === 'tableau' && Number.isFinite(action.fromStack) && Array.isArray(scene.tableau[action.fromStack])) {
        // insert at original index (or push if index invalid)
        const targetStack = scene.tableau[action.fromStack];
        const insertIdx = (typeof action.fromIndex === 'number' && action.fromIndex >= 0) ? Math.min(action.fromIndex, targetStack.length) : targetStack.length;
        targetStack.splice(insertIdx, 0, cardToReturn);

        cardToReturn.startX = action.prevStartX ?? cardToReturn.startX;
        cardToReturn.startY = action.prevStartY ?? cardToReturn.startY;
        cardToReturn.originStackIndex = action.fromStack;
        cardToReturn.originIndex = insertIdx;
        cardToReturn.originalDepth = action.prevOriginalDepth ?? cardToReturn.originalDepth;
        cardToReturn.originalAngle = action.prevOriginalAngle ?? cardToReturn.originalAngle;

        if (!Array.isArray(scene.deck)) scene.deck = [];
        if (!scene.deck.includes(cardToReturn)) scene.deck.push(cardToReturn);

        try { compactStack(scene.tableau[action.fromStack]); } catch (e) {}
      } else {
        if (!Array.isArray(scene.deck)) scene.deck = [];
        if (!scene.deck.includes(cardToReturn)) scene.deck.push(cardToReturn);

        let nearest = -1; let minD = Infinity;
        scene.tableau.forEach((s, idx) => {
          const ref = (s && s.length && s[0]) ? s[0] : null;
          const sx = ref ? ref.startX : cardToReturn.startX;
          const d = Math.abs((sx ?? 0) - (cardToReturn.startX ?? 0));
          if (d < minD) { minD = d; nearest = idx; }
        });
        if (nearest === -1) { scene.tableau[0] = scene.tableau[0] || []; scene.tableau[0].push(cardToReturn); }
        else { scene.tableau[nearest] = scene.tableau[nearest] || []; scene.tableau[nearest].push(cardToReturn); }
        try { compactStack(scene.tableau[nearest === -1 ? 0 : nearest]); } catch (e) {}
      }

      try {
        if (cardToReturn.container.input && cardToReturn.container.input.enabled === false) {
          cardToReturn.container.input.enabled = true;
        } else {
          cardToReturn.container.setInteractive && cardToReturn.container.setInteractive();
        }

        if (scene.input && typeof scene.input.setDraggable === 'function') {
          scene.input.setDraggable(cardToReturn.container, true);
        } else if (cardToReturn.container.input) {
          cardToReturn.container.input.draggable = true;
        }
      } catch (e) {}
    }
  });
}
