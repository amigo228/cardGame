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
        this.setupReturnButton();
        this.setupSettingsButton();
        this.setupGemsButton();
    }

    setupShuffleButton() {
        const x = 307;
        const y = 274
        this.scene.add.image(x, y, 'common1', 'magnet_icon').setScale(1.5)
            .setDepth(5)
        const shuffleBtn = this.locateButtonBackground(x, y);
        shuffleBtn.on('pointerdown', () => {
            shuffleBtn.setFrame('but_gp1_1');
            shuffleBtn.disableInteractive();
            this.onShuffle();
            this.scene.time.delayedCall(1200, () => {
                shuffleBtn.setInteractive();
                const pointer = this.scene.input.activePointer;
                if (shuffleBtn.getBounds().contains(pointer.x, pointer.y)) {
                    shuffleBtn.setFrame('but_gp1_2');
                } else {
                    shuffleBtn.setFrame('but_gp1_1');
                }
            });
        })
    }

    setupReturnButton() {
        const x = 307;
        const y = 153;
        this.scene.add.image(x, y, 'common1', 'undo_icon').setScale(1.5)
        .setDepth(5);
        const returnBtn = this.locateButtonBackground(x, y);
    }

    setupSettingsButton() {
        const x = 120;
        const y = 153;
        this.scene.add.image(x, y, 'common1', 'options_mini').setScale(1.5)
        .setDepth(5);
        const settingsBtn = this.locateButtonBackground(x, y);
    }

    setupGemsButton() {
        const x = 120;
        const y = 266;
        this.scene.add.image(x, y, 'common1', 'money_ico_btn').setScale(1.5)
        .setDepth(5);
        const gemsBtn = this.locateButtonBackground(x, y + 8);
    }

    locateButtonBackground(x, y) {
        const btn = this.scene.add.image(x - 3, y, 'common1', 'but_gp1_1').setScale(1.5)
            .setDepth(3).setInteractive();

        btn.on('pointerover', () => btn.setFrame('but_gp1_2'));
        btn.on('pointerout', () => btn.setFrame('but_gp1_1'));

        return btn;
    }
}