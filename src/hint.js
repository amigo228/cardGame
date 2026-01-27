export class Hint {
    constructor(scene) {
        this.scene = scene;
        this.hintFoundation = null;
        this.hintCard = null;
    }

    calculateHint(foundations, tableau) {
        this.hintCard = null;
        this.hintFoundation = null;

        for (let i = 0; i < foundations.length; ++i) {
            const foundation = foundations[i];
            const type = foundation.type;
            const suit = foundation.suit;
            const topRank = foundation.cards.at(-1).rank;

            for (let j = 0; j < tableau.length; ++j) {
                const stack = tableau[j];
                if (!stack.length) continue;

                const card = stack.at(-1);

                const validAsc =
                    type === 'asc' &&
                    suit === card.suit &&
                    card.rank === topRank + 1;

                const validDesc =
                    type === 'desc' &&
                    suit === card.suit &&
                    card.rank === topRank - 1;

                if (validAsc || validDesc) {
                    this.hintFoundation = foundation;
                    this.hintCard = card;
                    return; // 
                }
            }
        }
    }


    show(foundations, tableau) {
        if (this.scene.tutorial && this.scene.tutorial.isActive) {
            return; 
        }
        this.clear();
        this.calculateHint(foundations, tableau);

        if (!this.hintCard) {
            console.log("shuffle");
            return;
        }

        const cardAngle = this.hintCard.container.angle || 0;
        let offsetX = 0;

        if (cardAngle < -5) offsetX = 15;
        else if (cardAngle < -2) offsetX = 10;
        else if (cardAngle < 2) offsetX = 0;
        else if (cardAngle < 5) offsetX = -10;
        else offsetX = -15;

        const centerX = this.hintCard.container.x + offsetX;

        this.drawArrow(
            centerX,
            this.hintCard.startY + 140,
            cardAngle + 90
        );
    }

    drawArrow(x, y, angle = 90, currentCard = null) {
        if (currentCard && currentCard !== this.hintCard) {
            return;
        }
        this.hintArrow = this.scene.add
            .image(x, y, 'common1', 'tutorial_arrow')
            .setAngle(angle)
            .setScale(1.7)
            .setDepth(5000);

        this.scene.tweens.add({ targets: this.hintArrow, y: this.hintArrow.y - 20, duration: 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    clear() {
        if (this.hintArrow) {
            this.hintArrow.destroy();
            this.hintArrow = null;
        }
    }
}