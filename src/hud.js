import { returnCardAnimation } from './returnCardAnimation.js';

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
        this.setupFoundationHud();
    }

    setupHudButtons() {
        this.setupShuffleButton();
        this.setupReturnButton();
        this.setupSettingsButton();
        this.setupGemsButton();
        //setup boosters
        this.setupJokerButton();
        this.setupMagicButton();
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
            this.scene.returnStack.length = 0;
            this.scene.hud?.updateReturnButton();
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

        this.returnIcon = this.scene.add.image(x - 3, y-2, 'common1', 'but_undo_gray')
            .setScale(1.5)
            .setDepth(6);

        this.scene.add.image(x, y, 'common1', 'undo_icon')
            .setScale(1.5)
            .setDepth(5);

        this.returnBtn = this.locateButtonBackground(x, y);

        this.returnBtn.on('pointerdown', () => {
            if (!this.scene.returnStack.length) return;
            returnCardAnimation(this.scene, this.scene.returnStack);
            this.updateReturnButton();
        });

        this.updateReturnButton();
    }

    updateReturnButton() {
        const hasCards = this.scene.returnStack.length > 0;

        if (hasCards) {
            this.returnIcon.setFrame('undo_icon'); 
            this.returnBtn.setInteractive();
            this.returnBtn.setAlpha(1);
        } else {
            this.returnIcon.setFrame('but_undo_gray'); 
            this.returnBtn.disableInteractive();
            this.returnBtn.setAlpha(1);
        }
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

    setupJokerButton() {
        const joker = this.scene.add.image(120, 970, 'common1', 'b_joker_out').setScale(1.5).setDepth(3).setInteractive();
        joker.on("pointerdown", () => {
            joker.setFrame('b_joker_gray_out');
            // play animation
        })
    }

    setupMagicButton() {
        const magic = this.scene.add.image(300, 970, 'common1', 'b_magic_out').setScale(1.5).setDepth(3).setInteractive();
        magic.on("pointerdown", () => {
            magic.setFrame('b_magic_gray_out');
            // play animation
        })
    }

    //foundation hud part

    setupFoundationHud() {
        const border = this.scene.add.graphics();

        border.lineStyle(4, 0xffffff, 1);
        border.strokeRoundedRect(
            410,
            800,
            1500,
            240,
            16
        ).setDepth(10);

        border.lineStyle(3, 0xffffff, 0.8);
        border.beginPath();
        border.moveTo(1160, 800);
        border.lineTo(1160, 1040);
        border.strokePath();
        const leftArrow = this.scene.add.image(1105, 920, 'arrow-curved-icon').setDepth(11).setAngle(-90).setScale(0.6).setFlipX(true);
        const rightArrow = this.scene.add.image(1215, 920, 'arrow-curved-icon').setDepth(11).setAngle(90).setScale(0.6).setFlipX(true);

        this.scene.tweens.add({ targets: [leftArrow, rightArrow], scale: 0.64, duration: 900, yoyo: true, repeat: -1 });
    }
}