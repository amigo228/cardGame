import { GameState } from './GameState.js';

export class Bot {
    constructor(scene, botData, x, y, name, index) {
        if (!botData) {
            this.scene = scene;
            this.botWrapper = null;
            this.score = 0;
            this.botId = null;
            return;
        }

        this.scene = scene;
        this.key = botData.id;
        this.botId = botData.id;
        this.startX = x;
        this.startY = y;
        this.name = name;
        this.botWrapper = null;
        this.score = 0;
        this.baseSpeedFactor = Phaser.Math.FloatBetween(0.85, 1.15);
        this.catchUpFactor = Phaser.Math.FloatBetween(1.05, 1.25);
        this.fatigueFactor = Phaser.Math.FloatBetween(0.9, 1.0);
        this.startLag = index === 0
            ? 0
            : Phaser.Math.Between(5000, 8000);
        this.role = index === 0 ? 'leader' : 'chaser';

        this.targetLead = Phaser.Math.Between(8, 12);

        this.leadReached = false;
        this.createBot();
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
        this.scene.time.delayedCall(this.startLag, () => {
            this.scheduleNextScore();
        });
    }

    scheduleNextScore() {
        if (this.scene.gameEnded) return;

        const delay = this.calculateNextDelay();

        this.scoreTimer = this.scene.time.addEvent({
            delay,
            callback: () => {
                this.addScore();
                this.scheduleNextScore();
            }
        });
    }

    calculateNextDelay() {
        const level = GameState.currentLevel;

        let min = 3000;
        let max = 8000;

        if (level <= 3) {
            min = 35000;
            max = 40000;
        } else if (level <= 10) {
            min = 12000;
            max = 22000;
        }


        let delay = Phaser.Math.Between(min, max);


        delay *= this.baseSpeedFactor;

        const opponent = (this.scene.leaderboard || []).find(b => {
            if (!b || b === this) return false;
            if (b.botId && this.botId) return b.botId !== this.botId;
            return typeof b.getScore === 'function' && b !== this;
        });

        if (!opponent) {
            // если соперника нет — возвращаем обычный delay
            delay *= Phaser.Math.FloatBetween(0.9, 1.1);
            return Phaser.Math.Clamp(delay, 800, 60000);
        }


        const lead = this.score - opponent.score;

        const opponentLead = opponent.score - this.score;


        if (this.role === 'leader') {

            if (!this.leadReached) {

                delay *= Phaser.Math.FloatBetween(0.45, 0.65);

                if (lead >= this.targetLead) {
                    this.leadReached = true;
                }
            } else {

                delay *= Phaser.Math.FloatBetween(1.3, 1.7);

                if (Phaser.Math.Between(1, 100) <= 10) {
                    delay *= Phaser.Math.FloatBetween(0.5, 0.8);
                }
            }
        }

        if (this.role === 'chaser') {
            if (opponentLead >= 4 && opponentLead < this.targetLead) {
                delay *= Phaser.Math.FloatBetween(0.45, 0.75);
            }
            if (opponentLead >= this.targetLead) {
                const extraFactor = Phaser.Math.Clamp(opponentLead / (this.targetLead * 2), 0.25, 2.0);
                delay *= Phaser.Math.FloatBetween(0.25, 0.55) * (1 / extraFactor);
            }
            if (this.score > opponent.score + 1) {
                delay *= Phaser.Math.FloatBetween(1.05, 1.25);
            }
        }

        delay *= Phaser.Math.FloatBetween(0.9, 1.12);

        return Phaser.Math.Clamp(delay, 400, 60000);
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
                this.scene.checkRoundEnd();
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