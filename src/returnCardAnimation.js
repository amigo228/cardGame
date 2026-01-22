export function returnCardAnimation(scene, stack) {
  const cardToReturn = stack.pop();
  if (!cardToReturn) return;
  if (scene.tweens) {
    try { scene.tweens.killTweensOf(cardToReturn.container); } catch (e) {}
  }
  cardToReturn.container.setDepth(10000);
  scene.tweens.add({
    targets: cardToReturn.container,
    duration: 400,
    x: cardToReturn.startX,
    y: cardToReturn.startY,
    ease: 'Linear',
    onComplete: () => {
        scene.hud?.updateReturnButton();
      if (scene.tweens) {
        try { scene.tweens.killTweensOf(cardToReturn.container); } catch (e) {}
      }

      cardToReturn.container.setDepth(cardToReturn.originalDepth ?? 0);
      cardToReturn.container.setAngle(cardToReturn.originalAngle ?? 0);
      if (cardToReturn.originalScale) {
        cardToReturn.container.setScale(cardToReturn.originalScale);
      }

      try { cardToReturn.container.off && cardToReturn.container.off('pointerdown'); } catch (e) {}

      if (Array.isArray(scene.foundations)) {
        scene.foundations.forEach(f => {
          const idx = f.cards.indexOf(cardToReturn);
          if (idx !== -1) f.cards.splice(idx, 1);
        });
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
      } catch (e) {
      }

      if (scene.hint) {
        try { typeof scene.hint.clear === 'function' && scene.hint.clear(); } catch (e) {}
        scene.hint.hintFoundation = null;
        scene.hint.hintCard = null;
      }
      if (typeof scene.resetHintTimer === 'function') {
        try { scene.resetHintTimer(); } catch (e) {}
      }

      if (!Array.isArray(scene.deck)) scene.deck = [];
      if (!scene.deck.includes(cardToReturn)) scene.deck.push(cardToReturn);
      if (!Array.isArray(scene.tableau)) scene.tableau = [];

      let inserted = false;
      if (typeof cardToReturn.originalDepth === 'number') {
        const stackIdx = Math.floor(cardToReturn.originalDepth / 100);
        if (Number.isFinite(stackIdx) && scene.tableau[stackIdx]) {
          scene.tableau[stackIdx].push(cardToReturn);
          inserted = true;
        }
      }

      if (!inserted) {
        let nearest = -1;
        let minD = Infinity;
        scene.tableau.forEach((s, idx) => {
          const ref = (s && s.length && s[0]) ? s[0] : null;
          const sx = ref ? ref.startX : cardToReturn.startX;
          const d = Math.abs((sx ?? 0) - (cardToReturn.startX ?? 0));
          if (d < minD) { minD = d; nearest = idx; }
        });

        if (nearest === -1) {
          scene.tableau[0] = scene.tableau[0] || [];
          scene.tableau[0].push(cardToReturn);
        } else {
          scene.tableau[nearest] = scene.tableau[nearest] || [];
          scene.tableau[nearest].push(cardToReturn);
        }
      }

    }
  });
}
