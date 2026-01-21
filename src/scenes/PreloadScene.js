export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.cameras.main.setBackgroundColor('#000000');

        this.load.image('bg', 'assets/bg_gameplay.jpg');
        this.load.image('arrow-curved-icon', 'assets/curved-arrow-icon.svg')

        this.load.atlas('common1', 'assets/spritesheets/common1.png', 'assets/spritesheets/common1.json');
        this.load.image('card_bg', 'assets/cards/card_bg2.png');
        this.load.image('s', 'assets/cards/s.png');
        this.load.image('d', 'assets/cards/d.png');
        this.load.image('h', 'assets/cards/h.png');
        this.load.image('c', 'assets/cards/c.png');
        this.load.image('card_1rl', 'assets/cards/card_1rl.png');
        this.load.image('card_1bl', 'assets/cards/card_1bl.png');
        this.load.image('card_11rl', 'assets/cards/card_11rl.png');
        this.load.image('card_11bl', 'assets/cards/card_11bl.png');
        this.load.image('card_12rl', 'assets/cards/card_12rl.png');
        this.load.image('card_12bl', 'assets/cards/card_12bl.png');
        this.load.image('card_13rl', 'assets/cards/card_13rl.png');
        this.load.image('card_13bl', 'assets/cards/card_13bl.png');
        const colors = ['r', 'b'];
        const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

        for (const color of colors) {
            for (const rank of ranks) {
                const key = `card_${rank}${color}`;
                const path = `assets/cards/${key}.png`;
                this.load.image(key, path);
            }
        }
    }

    create() {
        const options = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'common1',
            'options'
        ).setScale(1.7);

        this.tweens.add({
            targets: options,
            angle: 360,        
            duration: 1000,   
            repeat: -1,     
            ease: 'Linear'
        });
        this.time.delayedCall(2000, () => {
            this.scene.start('GameScene');
        });
    }

}