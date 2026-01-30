import { returnCardAnimation } from './returnCardAnimation.js';
import { playBeatCardAnimation, playBeatAllCardAnimation } from './beatCardAnimation.js';
import { languages } from './languages.js';
import { GameState } from './GameState.js';

export class Hud {
    constructor(scene, onShuffle) {
        this.scene = scene;
        this.onShuffle = onShuffle;
        this.init();
        this.settingButtons = null;
        this.currentLanguage = 'en';
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

        this.returnIcon = this.scene.add.image(x - 3, y - 2, 'common1', 'but_undo_gray')
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

        if (this.scene.tutorial) {
            this.scene.returnStack.length = 0;
            return;
        }

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
        settingsBtn.on('pointerdown', () => this.renderSettingsOverlay());
    }

    renderSettingsOverlay() {
        this.overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000)
            .setOrigin(0).setAlpha(0.75).setDepth(99999).setInteractive();

        const soundButton = this.createSoundButton(this.createToggleButton({ x: 660, y: 1200 }));
        const musicButton = this.createMusicButton(this.createToggleButton({ x: 880, y: 1200 }));
        const languageButton = this.createLanguageButton(this.createToggleButton({ x: 1100, y: 1200 }));
        const exitButton = this.createExitButton(this.createToggleButton({ x: 1320, y: 1200 }));
        languageButton.relatedButtons = [soundButton, musicButton, exitButton];
        exitButton.relatedButtons = [soundButton, musicButton, languageButton];
        this.scene.tweens.add({
            targets: [soundButton, musicButton, languageButton, exitButton],
            duration: 300,
            ease: 'Linear',
            y: (this.scene.scale.height / 2)
        })

        this.overlay.on('pointerdown', () => this.hideOverlay(this.overlay, [soundButton, musicButton, languageButton, exitButton]));
    }

    hideOverlay(overlay, buttons, onComplete) {
        this.scene.tweens.add({
            targets: buttons,
            duration: 300,
            ease: 'Linear',
            y: 1200,
            onComplete: () => {
                buttons.forEach(btn => btn.destroy());
                if (overlay) { overlay.destroy(); this.overlay = null };
                if (onComplete) onComplete();
            }
        });
    }


    createToggleButton(positions, out, over) {
        const container = this.scene.add.container(positions.x, positions.y);
        const bg = this.scene.add.image(0, 0, 'common1', out ? out : 'but_options1');
        container.add(bg);
        container.bg = bg;
        container.setSize(bg.width, bg.height);
        container.setInteractive();

        container.on('pointerover', () => bg.setFrame(over ? over : 'but_options2'));
        container.on('pointerout', () => bg.setFrame(out ? out : 'but_options1'));
        return container.setDepth(1000000);
    }

    createSoundButton(container) {
        const fillImage = this.scene.add.image(0, 0, 'common1', 'icon_sound').setScale(0.7);
        const clickFillImage = this.scene.add.image(0, 0, 'icon_sound_off').setScale(0.7);
        clickFillImage.setVisible(false);
        container.add([fillImage, clickFillImage]);
        container.fill = fillImage;
        container.clickFill = clickFillImage;
        container.on('pointerdown', () => {
            const isOn = container.fill.visible;
            container.fill.setVisible(!isOn);
            container.clickFill.setVisible(isOn);
        });
        return container.setScale(2);
    }

    createMusicButton(container) {
        const fillImage = this.scene.add.image(0, 0, 'common1', 'icon_music').setScale(0.7);
        const clickFillImage = this.scene.add.image(0, 0, 'icon_music_off').setScale(0.7);
        clickFillImage.setVisible(false);
        container.add([fillImage, clickFillImage]);
        container.fill = fillImage;
        container.clickFill = clickFillImage;
        container.on('pointerdown', () => {
            const isOn = container.fill.visible;
            container.fill.setVisible(!isOn);
            container.clickFill.setVisible(isOn);
        });
        return container.setScale(2);
    }

    getCurrentLanguageIcon() {
        return languages.find(l => l.id === this.currentLanguage);
    }

    createLanguageButton(container) {
        const fillImage = this.scene.add.image(0, 0, 'common1', this.getCurrentLanguageIcon().icon).setScale(0.7);
        container.add(fillImage);
        container.fill = fillImage;
        container.on('pointerdown', () => {
            this.overlay.off('pointerdown');
            this.hideOverlay(null, [...(container.relatedButtons), container], () => this.createLanguageButtons());


        })
        return container.setScale(2);
    }

    createLanguageButtons() {
        const startX = 300;
        const startY = 1400;
        const gapX = 220;

        const languageButtons = languages.map((l, index) => {
            let languageButton = null;
            if (l.id === this.currentLanguage) {
                languageButton = this.scene.add.container(startX + gapX * index, startY);
                const bg = this.scene.add.image(0, 0, 'but_round3').setScale(0.7);
                languageButton.add(bg);
                languageButton.setSize(bg.width, bg.height).setDepth(1000000);
            }
            else {
                languageButton = this.createToggleButton({ x: startX + gapX * index, y: startY });
            }
            languageButton.add(this.scene.add.image(0, 0, 'common1', l.icon).setScale(0.7)).setScale(2);
            languageButton.id = l.id;
            return languageButton;
        });

        languageButtons.forEach((l, index) => {
            l.on('pointerdown', () => {
                if (this.currentLanguage === l.id) return;
                this.currentLanguage = l.id;
                this.hideOverlay(this.overlay, languageButtons);
            })
        });

        this.scene.tweens.add({
            targets: languageButtons,
            duration: 400,
            ease: "Linear",
            y: this.scene.scale.height / 2
        })

        this.overlay.on('pointerdown', () => {
            this.hideOverlay(this.overlay, languageButtons)
        })
    }

    createExitButton(container) {
        const fillImage = this.scene.add.image(0, 0, 'common2', 'game_exit_icon_small').setScale(0.7);
        container.add(fillImage);
        container.fill = fillImage;

        container.on('pointerdown', () => {
            this.hideOverlay(null, [...(container.relatedButtons), container]);
            this.overlay.off('pointerdown');
            const exitContainer = this.scene.add.container(this.scene.scale.width / 2, 1400).setDepth(100000);
            const exitBg = this.scene.add.image(0, 0, 'common2', 'win_bg');
            exitContainer.add(exitBg);
            exitContainer.setSize(exitBg.width, exitBg.height);
            exitContainer.setInteractive();
            const closeButton = this.createToggleButton({ x: 250, y: -248 }, 'but_out', 'but_over');
            closeButton.add(this.scene.add.image(0, 0, 'common1', 'icon_close'));
            exitContainer.add(closeButton);

            const exitLevelButton = this.createToggleButton({ x: 0, y: 250 }, 'but_red_out', 'but_red_over');
            exitLevelButton.add(
                this.scene.add.text(0, -5, 'EXIT', {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#000000',
                    stroke: '#ffffff',
                    fontStyle: 'bold',
                    strokeThickness: 6
                }).setOrigin(0.5)
                    .setDepth(1)
            )
            exitContainer.add(exitLevelButton);

            exitContainer.add(
                this.scene.add.text(0, -130, 'DO YOU REALLY WANT TO \nQUIT THE LEVEL', {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#FFFFFF',
                    stroke: '#000000',
                    fontStyle: 'bold',
                    align: 'center',
                    strokeThickness: 6
                }).setOrigin(0.5)
                    .setDepth(1)
            )
            exitContainer.add(
                this.scene.add.image(0, 30, 'common2', 'game_exit_icon')
            )

            exitContainer.setScale(1.5);


            this.scene.tweens.add({
                targets: exitContainer,
                duration: 400,
                ease: 'Linear',
                y: this.scene.scale.height / 2
            })

            this.overlay.on('pointerdown', () => {
                this.hideOverlay(this.overlay, [exitContainer]);
            })

            closeButton.on('pointerdown', () => {
                this.hideOverlay(this.overlay, [exitContainer]);
            })

            exitLevelButton.on('pointerdown', () => {
                this.hideOverlay(this.overlay, [exitContainer], () => {
                    this.scene.cameras.main.fadeOut(500, 0, 0, 0);
                    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.scene.start('MapScene');
                    });
                });
            })

        })


        return container.setScale(2);
    }

    setupGemsButton() {
        const x = 120;
        const y = 266;

        this.gemsContainer = this.scene.add.container(x, y);
        this.gemsContainer.setDepth(5);

        const icon = this.scene.add.image(-2, -5, 'common2', 'shop_icon_money')
            .setScale(1.2)
            .setOrigin(0.5);

        const bg = this.locateButtonBackground(0, 8);

        const gems = this.scene.add.text(0, 33, GameState.gems, {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#000000',
            stroke: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.gemsContainer.text = gems;

        this.gemsContainer.add([bg, icon, gems]);
    }

    updateGems(spent) {
        const currentGems = GameState.gems; 
        const newGems = Math.max(currentGems - spent, 0);

        const counter = { value: currentGems };

        this.scene.tweens.add({
            targets: counter,
            value: newGems,
            duration: 200,
            ease: 'Cubic.Out',
            onUpdate: () => {
                this.gemsContainer.text.setText(Math.floor(counter.value));
            }
        });

        GameState.gems = newGems; 
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
            this.updateGems(100);
            this.playBoosterExplosion(120, 970);
            this.drawGemsCost(180, 860, 100);
            joker.setFrame('b_joker_gray_out');
            joker.disableInteractive();
            playBeatAllCardAnimation(this.scene, { x: 120, y: 970 }, () => this.playBoosterExplosion(120, 970)).then(() => {
                joker.setFrame('b_joker_out');
                joker.setInteractive(true);
            });
        })
    }

    setupMagicButton() {
        const magic = this.scene.add.image(300, 970, 'common1', 'b_magic_out').setScale(1.5).setDepth(3).setInteractive();
        magic.on("pointerdown", () => {
            this.updateGems(25);
            this.playBoosterExplosion(300, 970);
            this.drawGemsCost(360, 860, 25);
            magic.setFrame('b_magic_gray_out');
            magic.disableInteractive();
            playBeatCardAnimation(this.scene, null, { x: 300, y: 970 }).then(() => {
                magic.setFrame('b_magic_out');
                magic.setInteractive();
            });
        })
    }

    drawGemsCost(x, y, cost) {
        const costContainer = this.scene.add.container(x, y);
        costContainer.add(this.scene.add.image(0, 0, 'common1', 'tip_bg').setScale(0.5, -0.5));
        costContainer.add(this.scene.add.text(-20, -5, `-${cost}`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5));
        costContainer.add(this.scene.add.image(30, -5, 'common1', 'money_ico_btn')).setDepth(10);
        this.scene.tweens.add({
            targets: costContainer,
            duration: 800,
            ease: 'Linear',
            alpha: 0,
            onComplete: () => costContainer.destroy()
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
        const leftArrow = this.scene.add.container(1215, 920).add(this.scene.add.image(0, 0, 'arrow-curved-icon')).setDepth(11).setAngle(-90).setScale(0.6);
        const rightArrow = this.scene.add.container(1105, 920).add(this.scene.add.image(0, 0, 'arrow-curved-icon')).setDepth(11).setAngle(90).setScale(0.6);

        //this.scene.tweens.add({ targets: [leftArrow, rightArrow], scale: 0.64, duration: 900, yoyo: true, repeat: -1 });
    }

    playBoosterExplosion(x, y) {
        const emitter = this.scene.add.particles(x, y, 'spark', {
            lifespan: 380,
            quantity: 30,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            speed: { min: 400, max: 600 },
            scale: { start: 2, end: 0.2 },
            alpha: { start: 1, end: 0.3 },
            tint: [0xffff00, 0xffaa00, 0xff5500],
            gravityY: -250,
            frequency: -1,
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Circle(0, 0, 50)
            }
        });

        emitter.setDepth(100000);

        this.scene.time.delayedCall(10, () => {
            emitter.explode(25);
        });

        this.scene.time.delayedCall(20, () => {
            emitter.explode(15);
        });

        this.scene.time.delayedCall(30, () => {
            emitter.explode(10);
        });

        this.scene.time.delayedCall(400, () => {
            emitter.destroy();
        });

    }
}