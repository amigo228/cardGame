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

        if (this.rank === 1 || this.rank > 10){
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
    }

    setPosition(x, y) {
        this.startX = x;
        this.startY = y;
        this.container.setPosition(x, y);
    }

    destroy() {
        this.container.destroy();
    }
}