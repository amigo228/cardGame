import { createDeck } from './utils.js';

export class Tutorial {
    constructor(scene) {
        this.scene = scene;
        this.isActive = true;
        this.stepCard = null;
        this.currentStep = 0; 
        
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
            }
        ];
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

        return deck;
    }

    canDrag(card) {
        if (!this.isActive) return true;
        return card === this.stepCard;
    }

    start() {
        if (this.currentStep >= this.steps.length) {
            console.log('Tutorial completed');
            return;
        }
        
        this.showStep(this.currentStep);
    }

    nextStep() {
        this.clearTutorialElements();
        
        this.currentStep++;
        
        if (this.currentStep >= this.steps.length) {
            console.log('Tutorial completed!');
            this.isActive = false;
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

    findCardInFoundation(suit, rank, foundationIndex) {
        const foundation = this.scene.foundations[foundationIndex];
        if (!foundation) {
            console.error(`Foundation ${foundationIndex} not found`);
            return null;
        }
        
        console.log("Foundation object:", foundation);
        
        if (!foundation.cards) {
            console.error(`Foundation ${foundationIndex} has no cards property`);
            return null;
        }
        
        for (const card of foundation.cards) {
            if (card.suit === suit && card.rank === rank) {
                return card;
            }
        }
        
        console.error(`Card ${suit}${rank} not found in foundation ${foundationIndex}`);
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
}