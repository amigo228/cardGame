import { playRewardGemAnimation } from './rewardGemAnimation.js';
import { compactStack } from './compactStack.js';
import { playInvalidCardAnimation } from './invalidCardAnimation.js';
export function registerDragHandlers(scene) {
    scene.input.on('dragstart', (pointer, gameObject) => {
        const currentCard = scene.deck.find(c => c.container === gameObject);
        if (!currentCard) { return; }

        currentCard.container.off('pointerdown');

        const stackIndex = scene.tableau.findIndex(stack => stack.includes(currentCard));
        if (stackIndex === -1) return;
        const stack = scene.tableau[stackIndex];
        const topCard = stack[stack.length - 1];

        if (currentCard !== topCard) {
            gameObject.disableInteractive();
            gameObject.setDepth(currentCard.originalDepth);
            scene.time.delayedCall(100, () => {
                gameObject.setInteractive({ draggable: true });
            });
            return;
        }

        if (scene.tutorial?.isActive) {

            if (!scene.tutorial.canDrag(currentCard)) {
                currentCard.container.on('pointerdown', () => {
                    playInvalidCardAnimation(scene, currentCard.container);
                });

                gameObject.disableInteractive();
                playInvalidCardAnimation(scene, currentCard.container, () => {
                    gameObject.setInteractive({ draggable: true });
                });

                return;
            }
            if (scene.tutorial.currentStepType === 'pickup') {
                scene.tutorial.nextStep();
            }
        }
        gameObject.setInteractive();
        gameObject.setDepth(scene.topDepth);

        currentCard.container.setAngle(0);
        currentCard.originalScale = currentCard.container.scaleX;
        currentCard.container.setScale(currentCard.originalScale * 1.05);

        if (!scene.tutorial?.isActive || (scene.tutorial?.isActive && scene.tutorial.canDrag(currentCard))) {
            attachParticlesToCard(scene, currentCard);
        }

        currentCard._lastEmitX = gameObject.x;
        currentCard._lastEmitY = gameObject.y;
        currentCard._emitDistanceThreshold = 30;
        gameObject.setDepth(100000);

        if (scene.hint) {
            scene.hint.clear(true);
            scene.isDragging = true;

             if (scene.hint.hintCard && currentCard !== scene.hint.hintCard) {
                return;
            }


            if (scene.hint.hintFoundation) {
                scene.hint.drawArrow(
                    scene.hint.hintFoundation.x,
                    scene.hint.hintFoundation.y - 140,
                    -90
                );
            }
            else if (scene.hint?.targetTableauCard) {
                const target = scene.hint.targetTableauCard;
                const angle = target.container?.angle || 0;
                let offsetX = 0;
                if (angle < -5) offsetX = 15;
                else if (angle < -2) offsetX = 10;
                else if (angle < 2) offsetX = 0;
                else if (angle < 5) offsetX = -10;
                else offsetX = -15;

                scene.hint.drawArrow(
                    target.container.x + offsetX,
                    target.startY + 140,
                    angle + 90
                );
            }

            else if (scene.hint.targetEmptyStackIndex !== null) {
            const stackIndex = scene.hint.targetEmptyStackIndex;
            
            let targetX, targetY;
            
            if (scene.tableauPositions && scene.tableauPositions[stackIndex]) {
                targetX = scene.tableauPositions[stackIndex].x;
                targetY = scene.tableauPositions[stackIndex].y;
            }
            else if (scene.stackPositions && scene.stackPositions[stackIndex]) {
                targetX = scene.stackPositions[stackIndex].x;
                targetY = scene.stackPositions[stackIndex].y;
            }
            else {
                const firstStackX = 500;
                const stackGap = 150; 
                const stackY = 400; 
                
                targetX = firstStackX + stackIndex * stackGap;
                targetY = stackY;
            }
            
            scene.hint.drawArrow(
                targetX,
                targetY - 100,
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
            if (!currentCard._lastEmitTime || Date.now() - currentCard._lastEmitTime > 16) { // ~60fps
                currentCard.particleManager.emitParticleAt(dragX, dragY, 1);
                currentCard._lastEmitX = dragX;
                currentCard._lastEmitY = dragY;
                currentCard._lastEmitTime = Date.now();
            }
        }
    });

    scene.input.on('dragend', (pointer, gameObject) => {
        const currentCard = scene.deck.find(c => c.container === gameObject);
        if (!currentCard) return;

        if (currentCard.particleManager) {
            try {
                if (currentCard.particleManager.emitters) {
                    currentCard.particleManager.emitters.each(e => {
                        e.stop && e.stop();
                        if (currentCard.particleManager.removeEmitter) {
                            currentCard.particleManager.removeEmitter(e);
                        }
                    });
                }
            } catch (err) {
            }

            currentCard.particleManager.destroy && currentCard.particleManager.destroy();
            currentCard.particleManager = null;
        }
        currentCard.container.setScale(currentCard.originalScale);
        let placed = false;

        const sourceStackIdx = scene.tableau.findIndex(s => s.includes(currentCard));
        const sourceIndexInStack = sourceStackIdx !== -1 ? scene.tableau[sourceStackIdx].indexOf(currentCard) : -1;

        for (const f of scene.foundations) {
            const dx = gameObject.x - f.x;
            const dy = gameObject.y - f.y;

            const thresholdX = 100;
            const thresholdY = 100;

            if (Math.abs(dx) < thresholdX && Math.abs(dy) < thresholdY) {
                const topCard = f.cards[f.cards.length - 1];
                if ((f.type === 'asc' && topCard && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank + 1) ||
                    (f.type === 'desc' && topCard && currentCard.suit === topCard.suit && currentCard.rank === topCard.rank - 1)) {

                    const action = {
                        card: currentCard,
                        fromType: 'tableau',
                        fromStack: sourceStackIdx,
                        fromIndex: sourceIndexInStack,
                        prevStartX: currentCard.startX,
                        prevStartY: currentCard.startY,
                        prevOriginalDepth: currentCard.originalDepth,
                        prevOriginalAngle: currentCard.originalAngle,
                        toType: 'foundation',
                        toFoundationIndex: scene.foundations.indexOf(f),
                        time: Date.now()
                    };

                    placed = true;

                    currentCard.container.setDepth(200 + f.cards.length + 20);

                    if (sourceStackIdx !== -1) {
                        const src = scene.tableau[sourceStackIdx];
                        const idx = src.indexOf(currentCard);
                        if (idx !== -1) {
                            src.splice(idx, 1);
                            compactStack(src);
                        }
                    }

                    scene.tweens.add({
                        targets: currentCard.container,
                        x: f.x,
                        y: f.y,
                        duration: 300,
                        ease: "Quad.Out",
                        onComplete: () => {
                            f.cards.push(currentCard);
                            currentCard.container.setDepth(200 + f.cards.length + 1);
                            scene.deck = scene.deck.filter(c => c !== currentCard);
                            playRewardGemAnimation(scene, currentCard.container.x, currentCard.container.y);

                            currentCard.container.input.draggable = false;
                            currentCard.container.off && currentCard.container.off('pointerdown');
                            currentCard.container.on('pointerdown', () => {
                                playInvalidCardAnimation(scene, currentCard.container);
                            });

                            scene.returnStack.push(action);
                            scene.hud?.updateReturnButton();

                            // ADDING A POINT TO PLAYER SCORE
                            scene.player.addScore(1);

                            scene.isDragging = false;
                            scene.resetHintTimer();
                            scene.hint.clear(false);
                        }
                    });
                }
            }
        }


        if (!placed) {
            for (let i = 0; i < scene.tableau.length; i++) {
                const stack = scene.tableau[i];
                const isEmpty = stack.length === 0;

                let targetX, targetY, topCard;
                if (!isEmpty) {
                    topCard = stack[stack.length - 1];
                    targetX = topCard.container.x;
                    targetY = topCard.container.y;
                } else {
                    const ph = scene.tableauPlaceholders && scene.tableauPlaceholders[i];
                    if (!ph) continue;
                    targetX = ph.x;
                    targetY = ph.y;
                }

                const dx = gameObject.x - targetX;
                const dy = gameObject.y - targetY;

                const thresholdX = 100;
                const thresholdY = 140;

                if (Math.abs(dx) < thresholdX && Math.abs(dy) < thresholdY) {
                    let accept = false;

                    if (isEmpty) {
                        accept = true;
                    } else {
                        const sameSuit = currentCard.suit === topCard.suit;
                        const rankDiff = Math.abs(currentCard.rank - topCard.rank) === 1;
                        if (sameSuit && rankDiff) accept = true;
                    }

                    if (accept) {
                        let prevStackIdx = -1;
                        let prevIndex = -1;
                        for (let sIdx = 0; sIdx < scene.tableau.length; sIdx++) {
                            const s = scene.tableau[sIdx];
                            const idx = s.indexOf(currentCard);
                            if (idx !== -1) { prevStackIdx = sIdx; prevIndex = idx; break; }
                        }

                        const action = {
                            card: currentCard,
                            fromType: 'tableau',
                            fromStack: prevStackIdx,
                            fromIndex: prevIndex,
                            prevStartX: currentCard.startX,
                            prevStartY: currentCard.startY,
                            prevOriginalDepth: currentCard.originalDepth,
                            prevOriginalAngle: currentCard.originalAngle,
                            toType: 'tableau',
                            toStack: i,
                            time: Date.now()
                        };

                        if (prevStackIdx !== -1) {
                            const src = scene.tableau[prevStackIdx];
                            const idx = src.indexOf(currentCard);
                            if (idx !== -1) {
                                src.splice(idx, 1);
                                compactStack(src);
                            }
                        }

                        stack.push(currentCard);
                        currentCard.originStackIndex = i;
                        currentCard.originIndex = stack.length - 1;

                        if (isEmpty) {
                            currentCard.startX = targetX;
                            currentCard.startY = targetY;
                        } else {
                            currentCard.startX = topCard.startX;
                            currentCard.startY = topCard.startY + (stack.length - 1) * -4;
                        }

                        currentCard.container.x = currentCard.startX;
                        currentCard.container.y = currentCard.startY;
                        currentCard.container.setDepth(i * 100 + stack.length);
                        compactStack(stack);
                        scene.returnStack.push(action);
                        scene.hud?.updateReturnButton();

                        placed = true;
                        break;
                    }
                }
            }
        }


        if (!placed) {
            scene.tweens.killTweensOf(currentCard.container);
            const endX = pointer.x;
            const endY = pointer.y;
            const distanceX = Math.abs(endX - currentCard.startX);
            const distanceY = Math.abs(endY - currentCard.startY);
            const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            currentCard.container.disableInteractive();
            if (totalDistance > 500) {
                const vectorX = currentCard.startX - endX;
                const vectorY = currentCard.startY - endY;

                const overshootFactor = 0.1;
                const overshootX = vectorX * overshootFactor;
                const overshootY = vectorY * overshootFactor;

                const overshootPointX = currentCard.startX + overshootX;
                const overshootPointY = currentCard.startY + overshootY;

                scene.tweens.add({
                    targets: currentCard.container,
                    x: overshootPointX,
                    y: overshootPointY,
                    duration: 300,
                    ease: 'Power2.Out',
                    onComplete: () => {
                        currentCard.container.setAngle(currentCard.originalAngle);
                        scene.tweens.add({
                            targets: currentCard.container,
                            x: currentCard.startX,
                            y: currentCard.startY,
                            duration: 600,
                            ease: 'Back',
                            onComplete: () => {
                                currentCard.container.setDepth(currentCard.originalDepth);
                                currentCard.container.setInteractive({ draggable: true });

                            }
                        });
                    }
                });
            } else {
                scene.tweens.add({
                    targets: currentCard.container,
                    x: currentCard.startX,
                    y: currentCard.startY,
                    duration: 300,
                    ease: 'Power2.Out',
                    onComplete: () => {
                        currentCard.container.setDepth(currentCard.originalDepth);
                        currentCard.container.setAngle(currentCard.originalAngle);
                        currentCard.container.setInteractive({ draggable: true });
                    }
                });
            }
        }
        scene.isDragging = false;
        scene.resetHintTimer();
        scene.hint.clear(false);

        if (scene.tutorial?.isActive) {
            if (scene.tutorial.currentStepType === 'place' && placed) {
                scene.tutorial.nextStep();
            }
            else {
                scene.tutorial.nextStep(true);
            }
        }
    });
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