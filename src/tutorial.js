import { createDeck } from './utils.js';

export class Tutorial {
    constructor(scene) {
        this.scene = scene;
        this.isActive = true;
        this.stepCard = null;
        this.currentStep = 0;
        this.drawTutorialBlockOverlays();

        this.steps = [
            {
                id: 1,
                type: 'pickup',
                target: { suit: 'c', rank: 12, pileIndex: 14, isFoundation: false },
                text: 'IN THE LEFT PILES \n CARDS OF THE SAME SUIT \n AND LOWER IN VALUE BY ONE \n CAN BE PLACED ON EACH OTHER. \n PICK UP THE QUEEN OF CLUBS',
                arrow: { yOffset: 140, angle: 90 },
                textBox: { yOffset: 400 }
            },
            {
                id: 2,
                type: 'place',
                target: { suit: 'c', rank: 13, foundationIndex: 5, isFoundation: true },
                text: 'PLACE IT ON THE KINGS OF CLUBS',
                arrow: { x: 1660, y: 820, angle: -90 },
                textBox: { x: 1660, y: 620 }
            },
            {
                id: 3,
                type: 'pickup',
                target: { suit: 'c', rank: 11, pileIndex: 3, isFoundation: false },
                text: 'PICK UP THE JACK OF CLUBS',
                arrow: { yOffset: 140, angle: 90 },
                textBox: { yOffset: 400 }
            },
            {
                id: 4,
                type: 'place',
                target: { suit: 'c', rank: 12, foundationIndex: 5, isFoundation: true },
                text: 'PLACE IT ON THE\n QUEEN OF CLUBS',
                arrow: { x: 1660, y: 820, angle: -90 },
                textBox: { x: 1660, y: 620 }
            },
            {
                id: 5,
                type: 'pickup',
                target: { suit: 'h', rank: 2, pileIndex: 12, isFoundation: false },
                text: 'IN THE RIGHT PILES\n CARDS OF THE SAME SUIT\n AND HIGHER IN VALUE BY ONE\n CAN BE PLACED ON EACH OTHER.\n PICK UP THE TWO OF HEARTS',
                arrow: { yOffset: 140, angle: 90 },
                textBox: { yOffset: 400 }
            },
            {
                id: 6,
                type: 'place',
                target: { suit: 'h', rank: 12, foundationIndex: 0, isFoundation: true },
                text: 'PLACE IT ON THE\n ACE OF HEARTS',
                arrow: { x: 500, y: 820, angle: -90 },
                textBox: { x: 500, y: 620 }
            },
            {
                id: 7,
                type: 'pickup',
                target: { suit: 's', rank: 11, pileIndex: 10, isFoundation: false },
                text: 'IN THE TOP PILES CARDS\n OF THE SAME SUIT AND EITHER\n HIGHER OR LOWER IN VALUE BY ONE\n CAN BE PLACED ON EACH OTHER.\n PICK UP THE JACK OF SPADES',
                arrow: { yOffset: 140, angle: 90 },
                textBox: { yOffset: 400 }
            },
            {
                id: 8,
                type: 'place',
                target: { suit: 's', rank: 10, pileIndex: 2, isFoundation: false },
                text: 'PLACE IT ON THE\n TEN OF SPADES',
                arrow: { yOffset: 140, angle: 90 },
                textBox: { yOffset: 400 }
            },
            {
                id: 9,
                type: 'pickup',
                target: { suit: 'h', rank: 3, pileIndex: 10, isFoundation: false },
                text: 'THIS FREED THE\n THREE OF HEARTS!\n PICK IT UP.',
                arrow: { yOffset: 140, angle: 90 },
                textBox: { yOffset: 400 }
            },
            {
                id: 10,
                type: 'place',
                target: { suit: 'h', rank: 12, foundationIndex: 0, isFoundation: true },
                text: 'PLACE IT ON THE\n TWO OF HEARTS',
                arrow: { x: 500, y: 820, angle: -90 },
                textBox: { x: 500, y: 620 }
            }
        ];
    }

    get currentStepType() {
        return this.steps[this.currentStep]?.type;
    }

    createTutorialDeck() {
        const deck = createDeck(this.scene);

        const topCards = [
            { s: 'h', r: 4 },
            { s: 'h', r: 10 },
            { s: 's', r: 10 },
            { s: 'c', r: 11 },
            { s: 's', r: 6 },
            { s: 'd', r: 4 },
            { s: 'h', r: 9 },
            { s: 'h', r: 5 },
            { s: 'c', r: 2 },
            { s: 'd', r: 5 },

            { s: 's', r: 11 },
            { s: 's', r: 8 },
            { s: 'h', r: 2 },
            { s: 'h', r: 11 },
            { s: 'c', r: 12 },
            { s: 'd', r: 7 },
        ];

        const forcedCards = [];

        for (const need of topCards) {
            const idx = deck.findIndex(
                c => c.suit === need.s && c.rank === need.r
            );

            if (idx === -1) {
                console.warn('tutorial card not found', need);
                continue;
            }

            forcedCards.push(deck.splice(idx, 1)[0]);
        }

        deck.push(...forcedCards);

        const h3Indices = [];
        for (let i = 0; i < deck.length; i++) {
            if (deck[i].suit === 'h' && deck[i].rank === 3) {
                h3Indices.push(i);
            }
        }

        const targetPosition = 82;

        if (h3Indices.length > 0 && targetPosition < deck.length) {
            const cardAt82 = deck[targetPosition];

            if (!(cardAt82.suit === 'h' && cardAt82.rank === 3)) {
                const h3Index = h3Indices[0];

                [deck[h3Index], deck[targetPosition]] = [deck[targetPosition], deck[h3Index]];

            }
        }

        return deck;
    }

    canDrag(card) {
        if (!this.isActive) return true;
        if (!this.stepCard) return false;

        console.log('Comparing cards:', {
            card: `${card.suit}${card.rank} (${card.startX}, ${card.startY})`,
            stepCard: `${this.stepCard.suit}${this.stepCard.rank} (${this.stepCard.startX}, ${this.stepCard.startY})`,
            suitEqual: card.suit === this.stepCard.suit,
            rankEqual: card.rank === this.stepCard.rank,
        });

        return card.suit === this.stepCard.suit &&
            card.rank === this.stepCard.rank

    }

    start() {
        if (this.currentStep >= this.steps.length) {
            console.log('Tutorial completed');
            return;
        }
        this.drawTutorialSkipButton();

        this.showStep(this.currentStep);
    }

    nextStep(notPlaced) {
        this.clearTutorialElements();

        if (notPlaced) {
            this.currentStep = this.currentStep - 1;
        }
        else {
            this.currentStep++;
        }

        console.log("current step" + this.currentStep)

        if (this.currentStep === 10) {
            if (this.skipButton) {
                this.skipButton.destroy();
                this.skipButton = null;
            }
            console.log('Tutorial completed!');
            const overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.5)
                .setOrigin(0)
                .setDepth(99999);
            this.drawTutorialTextBox('CONTINUE TO TRANSFER CARDS\n INTO THE LOWER PILES.\n WHEN NO CARDS LEFT IN THE\n TOP PILES YOU HAVE WON',
                1080, 600);

            const clickHandler = () => {
                overlay.destroy();
                this.tutorialTextBox.destroy();

                this.isActive = false;
                this.blockOverlay.destroy();
                this.blockOverlayShuffle.destroy();
                this.scene.tutorial = null;
                this.scene.resetHintTimer();

            };
            this.tutorialTextBox.setSize(400, 200);
            this.tutorialTextBox.setInteractive().on('pointerdown', clickHandler);
            overlay.setInteractive().on('pointerdown', clickHandler);
            return;
        }

        this.showStep(this.currentStep);
    }

    showStep(stepIndex) {
        const step = this.steps[stepIndex];
        console.log(`Showing step ${step.id}: ${step.type}`);

        if (step.type === 'pickup') {
            this.stepCard = this.findCardInPile(
                step.target.suit,
                step.target.rank,
                step.target.pileIndex
            );

            if (!this.stepCard) {
                console.error(`Card not found in step ${step.id}`);
                return;
            }

            const arrowX = this.calculateXOffset();
            const arrowY = this.stepCard.startY + step.arrow.yOffset;

            this.drawArrow(arrowX, arrowY, step.arrow.angle);

            const textX = arrowX;
            const textY = this.stepCard.startY + step.textBox.yOffset;

            this.drawTutorialTextBox(step.text, textX, textY);

        } else if (step.type === 'place') {
            if (!step.target.isFoundation) {

                const targetCard = this.findCardInPile(
                    step.target.suit,
                    step.target.rank,
                    step.target.pileIndex
                );

                if (!targetCard) {
                    console.error('Target card not found for place step', step.id);
                    return;
                }

                const arrowX = targetCard.startX;
                const arrowY = targetCard.startY + (step.arrow?.yOffset ?? 140);

                this.drawArrow(arrowX, arrowY, step.arrow?.angle ?? 90);

                const textX = arrowX;
                const textY = targetCard.startY + (step.textBox?.yOffset ?? 400);

                this.drawTutorialTextBox(step.text, textX, textY);

                return;
            }

            this.drawArrow(step.arrow.x, step.arrow.y, step.arrow.angle);
            this.drawTutorialTextBox(step.text, step.textBox.x, step.textBox.y);
        }
    }

    clearTutorialElements() {
        if (this.tutorialTextBox) {
            this.tutorialTextBox.destroy();
            this.tutorialTextBox = null;
        }
        if (this.hintArrow) {
            this.hintArrow.destroy();
            this.hintArrow = null;
        }
    }

    findCardInPile(suit, rank, pileIndex) {
        const pile = this.scene.tableau[pileIndex];
        if (!pile) {
            console.error(`Pile ${pileIndex} not found`);
            return null;
        }

        for (const card of pile) {
            if (card.suit === suit && card.rank === rank) {
                return card;
            }
        }

        console.error(`Card ${suit}${rank} not found in pile ${pileIndex}`);
        return null;
    }

    drawArrow(x, y, angle = 90) {
        this.hintArrow = this.scene.add
            .image(x, y, 'common1', 'tutorial_arrow')
            .setAngle(angle)
            .setScale(1.7)
            .setDepth(100000);

        this.scene.tweens.add({
            targets: this.hintArrow,
            y: this.hintArrow.y - 20,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    calculateXOffset() {
        if (!this.stepCard) return 0;

        const cardAngle = this.stepCard.originalAngle || 0;
        let offsetX = 0;

        if (cardAngle < -5) offsetX = 15;
        else if (cardAngle < -2) offsetX = 10;
        else if (cardAngle < 2) offsetX = 0;
        else if (cardAngle < 5) offsetX = -10;
        else offsetX = -15;

        return this.stepCard.startX + offsetX;
    }

    drawTutorialTextBox(text, x, y) {
        this.tutorialTextBox = this.scene.add.container(x, y);

        const bg = this.scene.add.image(0, 0, 'common1', 'magic_hint_bg')
            .setScale(2);

        const textObj = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000',
            stroke: '#ffffff',
            fontStyle: 'bold',
            strokeThickness: 6,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(1);

        this.tutorialTextBox.add(bg);
        this.tutorialTextBox.add(textObj);
        this.tutorialTextBox.setDepth(99999);
    }

    drawTutorialBlockOverlays() {
        this.blockOverlay = this.scene.add.rectangle(15, 855, 385, 300, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(99999).setInteractive();
        this.blockOverlayShuffle = this.scene.add.rectangle(219, 221, 170, 101, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(99999).setInteractive();
    }

    drawTutorialSkipButton() {
        this.skipButton = this.scene.add.container(1650, 70).setDepth(100000);
        const bg = this.scene.add.image(0, 0, 'common1', 'but_red_down').setScale(1.5, 1);
        this.skipButton.add(bg);
        this.skipButton.setSize(bg.width, bg.height);
        this.skipButton.setInteractive();
        this.skipButton.add(this.scene.add.text(0, 0, 'SKIP TUTORIAL', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#FFFFFF',
            stroke: '#000000',
            fontStyle: 'bold',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5));
        this.skipButton.bg = bg;

        this.skipButton.on('pointerover', () => this.skipButton.bg.setFrame('but_red_out'));
        this.skipButton.on('pointerout', () => this.skipButton.bg.setFrame('but_red_down'));



        this.skipButton.once('pointerdown', () => {
            this.clearTutorialElements();
            if (this.skipButton) {
                this.skipButton.destroy();
                this.skipButton = null;
            }
            this.isActive = false;
            this.blockOverlay.destroy();
            this.blockOverlayShuffle.destroy();
            this.scene.tutorial = null;
            this.scene.resetHintTimer();
        })
    }
}