// "Every great game begins with a single scene. Let's make this one unforgettable!"
import { Level } from '../level.js';
import { LEVELS } from '../levelCoordinates.js';
import { GameState } from '../GameState.js';
import {playNextLevelAnimation} from '../animations/nextLevelAnimation.js';
import {Avatar} from '../avatar.js';
export class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        const bg = this.add.image(0, 0, 'map1').setOrigin(0, 0);
        bg.displayWidth = this.scale.width;
        bg.displayHeight = this.scale.height;
        this.levels = LEVELS.map(level => {
            let status = 'locked';
            if (level.id < GameState.currentLevel) status = 'passed'
            if (level.id === GameState.currentLevel) status = 'active'
            const l = new Level(this, level.x, level.y, status, level.id);
            l.drawLevel();
            return l;
        });

        this.renderContinueButton();
        this.avatar = new Avatar(this, LEVELS[GameState.currentLevel - 1].x, LEVELS[GameState.currentLevel - 1].y - 40);
        if (this.scene.settings.data?.nextLevel) {
            playNextLevelAnimation(this);
    }

    }

    renderContinueButton() {
        const playBtn = this.add.container(this.scale.width / 2, 1000);
        const bg = this.add.image(0, 0, 'common1', 'but_blue_out');
        playBtn.add(bg);
        playBtn.setSize(bg.width, bg.height);
        playBtn.setInteractive();
        playBtn.out = bg;
        playBtn.on('pointerover', () => playBtn.out.setFrame('but_blue_over'));
        playBtn.on('pointerout', () => playBtn.out.setFrame('but_blue_out'));

        const btnText = this.add.text(0, -5, 'CONTINUE', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#000000',
            stroke: '#ffffff',
            fontStyle: 'bold',
            strokeThickness: 6
        }).setOrigin(0.5)
            .setDepth(1);
        playBtn.add(btnText);

        playBtn.setScale(1.5)

        playBtn.on('pointerdown', () => this.scene.start('GameScene'));
    }

}
