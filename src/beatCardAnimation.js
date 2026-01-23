import { playInvalidCardAnimation } from './invalidCardAnimation.js';
import { playRewardGemAnimation } from './rewardGemAnimation.js';
import { compactStack } from './compactStack.js';
import {gameWon} from './gameWon.js';
export function playBeatCardAnimation(scene, stackId = null, startPositions) {
    return new Promise(resolve => {
        scene.resetHintTimer?.();
        const [card, foundation] = findCardToBeat(scene, stackId);
        if (!card || !foundation) {
            resolve();
            return;
        }

        createParticlesForBooster(scene, startPositions.x, startPositions.y, {
            x: card.container.x,
            y: card.container.y
        }).then(() => {
            let affectedStack = null;
            for (const stack of scene.tableau) {
                const idx = stack.indexOf(card);
                if (idx !== -1) {
                    stack.splice(idx, 1);
                    affectedStack = stack;
                    break;
                }
            }
            scene.deck = scene.deck.filter(c => c !== card);
            foundation.cards.push(card);
            scene.returnStack.push(card);
            scene.hud?.updateReturnButton?.()
            card.container.setDepth(20000);
            scene.tweens.add({
                targets: card.container,
                x: foundation.x,
                y: foundation.y,
                duration: 100,
                angle: 0,
                ease: 'Linear',
                onComplete: () => {
                    card.container.setDepth(200 + foundation.cards.length);
                    card.container.setAngle(0);
                    card.container.setInteractive && card.container.setInteractive();
                    if (card.container.input) card.container.input.draggable = false;

                    card.container.off && card.container.off('pointerdown');
                    card.container.on('pointerdown', () => {
                        playInvalidCardAnimation(scene, card.container);
                    });

                    playRewardGemAnimation(scene, card.container.x, card.container.y);
                    if (affectedStack) compactStack(affectedStack);

                    resolve();
                    gameWon(scene);
                }
            });
        });
    });
}


function findCardToBeat(scene, stackId) {
    let foundationToPlace = null;

    if (typeof stackId === 'number') {
        foundationToPlace = scene.foundations[stackId];
        if (!foundationToPlace || foundationToPlace.cards.length >= 13) {
            return [null, null];
        }
    } else {
        const valid = scene.foundations.filter(f => f.cards.length < 13);
        if (valid.length === 0) return [null, null];
        foundationToPlace = valid[Math.floor(Math.random() * valid.length)];
    }

    const nextCardRank =
        foundationToPlace.cards[foundationToPlace.cards.length - 1].rank +
        (foundationToPlace.type === 'asc' ? 1 : -1);

    const nextCardSuit = foundationToPlace.suit;

    const nextCard = scene.deck.find(card => card.suit === nextCardSuit && card.rank === nextCardRank);

    return [nextCard || null, foundationToPlace];
}


export function playBeatAllCardAnimation(scene, startPositions, callback) {
    let promise = Promise.resolve();

    for (let i = 0; i < scene.foundations.length; ++i) {
        const foundation = scene.foundations[i];
        if (foundation.cards.length === 13) continue;

        promise = promise.then(() => {
            return playBeatCardAnimation(scene, i, startPositions)
                .then(() => {
                callback(); 
                });
        });
    }

    return promise;
}

export function createParticlesForBooster(scene, startX, startY, targetPos, opts = {}) {
    return new Promise(resolve => {
        const count = 7;
        const imgKey = 'spark';
        const baseDuration = 200;
        const depth = 30000;
        let particlesCompleted = 0;
        for (let i = 0; i < count; i++) {
            const jitterStartX = startX + Phaser.Math.Between(-12, 12);
            const jitterStartY = startY + Phaser.Math.Between(-12, 12);

            const star = scene.add.image(jitterStartX, jitterStartY, imgKey)
                .setScale(Phaser.Math.FloatBetween(2.5, 2.8))
                .setDepth(depth)
                .setBlendMode(Phaser.BlendModes.ADD);

            const targetOffsetX = Phaser.Math.Between(-10, 10);
            const targetOffsetY = Phaser.Math.Between(-8, 8);
            const duration = baseDuration;
            const delay = i * 40 + Phaser.Math.Between(0, 120);

            scene.tweens.add({
                targets: star,
                x: targetPos.x + targetOffsetX,
                y: targetPos.y + targetOffsetY,
                scale: 0,
                delay,
                duration,
                ease: 'Linear',
                onComplete: () => {
                    star.destroy();
                    particlesCompleted++;
                    if (particlesCompleted === count) {
                        resolve();
                    }
                }
            });
        }
    });
}



