export class Hud {
    constructor(scene, onShuffle) {
        this.scene = scene;
        this.onShuffle = onShuffle;
        this.init();
    }

    init() {
        this.scene.add.image(210, this.scene.scale.height / 2, 'common1', 'gameplay_panel_bg').setScale(1.5)
            .setDepth(2);
        this.setupHudButtons();
    }

    setupHudButtons() {
        this.setupShuffleButton();
    }

    setupShuffleButton() {
        const x = 307;
        const y = 274
        this.scene.add.image(x, y, 'common1', 'magnet_icon').setScale(1.5)
            .setDepth(5)
        const shuffleBtn = this.locateButtonBackground(x, y);
        shuffleBtn.on('pointerdown', () => this.onShuffle())
    }

    locateButtonBackground(x, y) {
        const btn = this.scene.add.image(x - 3, y, 'common1', 'but_gp1_1').setScale(1.5)
            .setDepth(3).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setFrame('but_gp1_2'));
        btn.on('pointerout', () => btn.setFrame('but_gp1_1'));

        return btn;
    }
}