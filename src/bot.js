export class Bot {
    constructor(scene, botData, x, y, name) {
        this.scene = scene;
        this.id = botData.id;
        this.botWrapper = null;
        this.startX = x;
        this.startY = y;
        this.name = name;
        this.createBot();
    }

    createBot() {
        this.botWrapper = this.scene.add.container(this.startX, this.startY).setDepth(5);
        this.botWrapper.add(this.scene.add.image(0, 0, 'common1', 'panel_norm_bg').setScale(1.5));
        this.botWrapper.add(this.scene.add.image(-115, -20, 'common1', 'ava_competitor').setScale(1.5));
        this.botWrapper.add(this.scene.add.image(-115, -20, this.id).setScale(0.8));
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

        const scoreBar = this.scene.add.image(0, 40, 'common1', 'pb_top').setScale(1.5);
        this.botWrapper.add(scoreBar);
        this.botWrapper.scoreBar = scoreBar;
    }
}