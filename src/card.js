export default class Card {
    constructor(scene, suit, color, rank) {
        this.scene = scene;
        this.suit = suit;
        this.rank = rank;
        this.color = color;
        this.key = `card_${rank}${color}`;
        this.container = null;
        this.createCard();
    }

    createCard() {
        if (this.container) this.container.destroy();
        this.container = this.scene.add.container(0, 0);
        this.bg = this.scene.add.image(0, 0, 'card_bg').setScale(1);
        this.container.add(this.bg);

        if (this.rank === 1 || this.rank > 10) {
            this.extraImg = this.scene.add.image(-25, -43, this.key + 'l');
            this.container.add(this.extraImg);
        }

        this.rankImg = this.scene.add.image(0, 0, this.key).setScale(1);
        this.container.add(this.rankImg);
        this.suitImg = this.scene.add.image(25, -43, this.suit).setScale(0.9);
        this.container.add(this.suitImg);
        this.container.setSize(this.bg.width, this.bg.height);
        this.container.setInteractive({ draggable: true });
        this.container.setScale(1.7);
        this.prevX = this.container.x;
        this.prevY = this.container.y;
        this.addEmitter();
    }

    addEmitter() {
    if(this.emitter) this.emitter.destroy();
    this.emitter = this.scene.add.particles(25, -43, this.suit, {
        lifespan: 600,
        speed: {min: 100, max: 200},
        scale: { start: 0.7, end: 0 },
        angle: 260,
        frequency: 120,
        quantity: 1,
        alpha: { start: 1, end: 0 },
        emitting: false
    });
    this.container.add(this.emitter);
}

    setPosition(x, y) {
        this.container.setPosition(x, y);
    }

    destroy() {
        this.container.destroy();
    }


    updateFace(newRank, newSuit, newColor, show = true) {
        this.rank = newRank;
        this.suit = newSuit;
        this.color = newColor;
        this.key = `card_${this.rank}${this.color}`;

        if (this.rankImg && !this.rankImg.destroyed) {
            this.rankImg.setTexture(this.key);
            this.rankImg.setVisible(Boolean(show));
        } else {
            this.rankImg = this.scene.add.image(0, 0, this.key).setScale(1);
            this.rankImg.setVisible(Boolean(show));
            this.container.add(this.rankImg);
        }

        if (this.suitImg && !this.suitImg.destroyed) {
            this.suitImg.setTexture(this.suit);
            this.suitImg.setVisible(Boolean(show));
        } else {
            this.suitImg = this.scene.add.image(25, -43, this.suit).setScale(0.9);
            this.suitImg.setVisible(Boolean(show));
            this.container.add(this.suitImg);
        }

        if (this.rank === 1 || this.rank > 10) {
            const extraKey = this.key + 'l';
            if (this.extraImg && !this.extraImg.destroyed) {
                this.extraImg.setTexture(extraKey);
                this.extraImg.setVisible(Boolean(show));
            } else {
                this.extraImg = this.scene.add.image(-25, -43, extraKey);
                this.extraImg.setVisible(Boolean(show));
                this.container.addAt(this.extraImg, 1);
            }
        } else {
            if (this.extraImg && !this.extraImg.destroyed) {
                this.extraImg.destroy();
                this.extraImg = null;
            }
        }

        this.key = `card_${this.rank}${this.color}`;
        this.addEmitter();
    }


}