import {GameState} from './GameState.js';

export class Bot {
    constructor(scene, botData, x, y, name) {
        this.scene = scene;
        this.key = botData.id;
        this.botWrapper = null;
        this.startX = x;
        this.startY = y;
        this.name = name;
        this.createBot();
        this.score = 0;
    }

    createBot() {
        this.botWrapper = this.scene.add.container(this.startX, this.startY).setDepth(5);
        this.botWrapper.add(this.scene.add.image(0, 0, 'common1', 'panel_norm_bg').setScale(1.5));
        this.botWrapper.add(this.scene.add.image(-115, -20, 'common1', 'ava_competitor').setScale(1.5));
        this.botWrapper.add(this.scene.add.image(-115, -20, this.key).setScale(0.8));
        this.botWrapper.add(this.scene.add.text(-55, -50, this.name, {
            fontFamily: 'Arial',
            fontSize: '30px',
            color: '#2b1700',
            fontStyle: 'bold',
        }));
        this.botWrapper.add(this.scene.add.image(-25, 0, 'common1', 'score_icon').setScale(0.8));
        this.botWrapper.add(this.scene.add.text(48, -13, '96', {
            fontFamily: 'Arial',
            fontSize: '30px',
            color: '#2b1700',
            fontStyle: 'bold',
        }));
        const score = this.scene.add.text(20, -18, '0/', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#2b1700',
            fontStyle: 'bold',
        })
        this.botWrapper.add(score);
        this.botWrapper.score = score;

        const scoreBarFill = this.scene.add.image(-150, 40, 'task_prb_fill2')
            .setOrigin(0, 0.5)
            .setScale(1, 1);

        scoreBarFill.scaleX = 0;

        this.botWrapper.add(scoreBarFill);
        this.botWrapper.scoreBarFill = scoreBarFill;

        const scoreBar = this.scene.add.image(0, 40, 'common1', 'pb_top')
            .setScale(1.5);

        this.botWrapper.add(scoreBar);
        this.botWrapper.scoreBar = scoreBar;
    }

    start() {
        let baseDelay;
        if (GameState.currentLevel <= 3) {
            baseDelay = Phaser.Math.Between(35000, 40000);
        } else if (GameState.currentLevel <= 10) {
            const levelFactor = (GameState.currentLevel - 3) / 7;
            const minDelay = 15000 + (10000 * (1 - levelFactor));
            const maxDelay = 25000 + (10000 * (1 - levelFactor));
            baseDelay = Phaser.Math.Between(minDelay, maxDelay);
        } else if (GameState.currentLevel <= 19) {
            const levelFactor = (GameState.currentLevel - 10) / 10;
            const minDelay = 3000 + (10000 * (1 - levelFactor));
            const maxDelay = 8000 + (10000 * (1 - levelFactor));
            baseDelay = Phaser.Math.Between(minDelay, maxDelay);
        } else {

            baseDelay = Phaser.Math.Between(3000, 8000);
        }

        this.scoreTimer = this.scene.time.addEvent({
            delay: baseDelay,
            loop: true,
            callback: () => {
                this.addScore();
            }
        });
    }

    addScore() {
        if (this.scene.gameEnded) return;
        this.score++;
        const maxScore = 96;

        if (this.score > 9) {
            this.botWrapper.score.setText(`${this.score}/`).x = 5;
        }
        else {
            this.botWrapper.score.setText(`${this.score}/`);
        }

        const progress = Phaser.Math.Clamp(this.score / maxScore, 0, 1);

        this.scene.tweens.add({
            targets: this.botWrapper.scoreBarFill,
            scaleX: progress,
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.scene.updateLeaderboard();
                this.scene.checkGameEnd();
            }
        });
    }

    getWrapper() {
        return this.botWrapper;
    }

    getScore() {
        return this.score;
    }
}