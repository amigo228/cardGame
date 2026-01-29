export class Player {
    constructor(scene, playerData, x, y, name) {
        this.scene = scene;
        this.key = playerData;
        this.playerWrapper = null;
        this.startX = x;
        this.startY = y;
        this.name = name;
        this.createPlayer();
        this.score = 0;
    }

    createPlayer() {
        this.playerWrapper = this.scene.add.container(this.startX, this.startY).setDepth(5);
        this.playerWrapper.add(this.scene.add.image(0, 0, 'common1', 'panel_norm_bg_player').setScale(1.5));
        this.playerWrapper.add(this.scene.add.image(-115, -20, 'common1', 'ava_competitor_player').setScale(1.5));
        this.playerWrapper.add(this.scene.add.image(-115, -20, this.key).setScale(0.55));
        this.playerWrapper.add(this.scene.add.text(-20, -50, this.name, {
            fontFamily: 'Arial',
            fontSize: '30px',
            color: '#2b1700',
            fontStyle: 'bold',
            align: 'center'
        }));
        this.playerWrapper.add(this.scene.add.image(-25, 0, 'common1', 'score_icon').setScale(0.8));
        this.playerWrapper.add(this.scene.add.text(48, -13, '96', {
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
        this.playerWrapper.add(score);
        this.playerWrapper.score = score;

        const scoreBarFill = this.scene.add.image(-150, 40, 'task_prb_fill2')
            .setOrigin(0, 0.5)
            .setScale(1, 1);

        scoreBarFill.scaleX = 0;

        this.playerWrapper.add(scoreBarFill);
        this.playerWrapper.scoreBarFill = scoreBarFill;

        const scoreBar = this.scene.add.image(0, 40, 'common1', 'pb_top')
            .setScale(1.5);

        this.playerWrapper.add(scoreBar);
        this.playerWrapper.scoreBar = scoreBar;
    }

    addScore(value) {
        this.score = this.score + value;
        const maxScore = 96;

        if(this.score > 9) {
            this.playerWrapper.score.setText(`${this.score}/`).x = 5;
        }
        else {
            this.playerWrapper.score.setText(`${this.score}/`);
        }

        const progress = Phaser.Math.Clamp(this.score / maxScore, 0, 1);

        this.scene.tweens.add({
            targets: this.playerWrapper.scoreBarFill,
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
        return this.playerWrapper;
    }

    getScore() {
        return this.score;
    }
}