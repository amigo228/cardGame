export class Avatar {
    constructor(scene, startX, startY) {
        this.scene = scene;
        this.x = startX;
        this.y = startY;
        this.container = null;
        this.create();
    }

    create() {
        this.container = this.scene.add.container(this.x, this.y);
        const bg = this.scene.add.image(0, 0, 'common1', 'ava_competitor_player');
        this.container.add(bg);
        this.container.setSize(bg.width, bg.height).setDepth(5);
        const playerIcon = this.scene.add.image(0, 0, 'player_icon').setScale(0.4);
        this.container.add(playerIcon);
    }
}