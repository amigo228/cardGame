export class Level {
    constructor(scene, x, y, status, id) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.status = status;
        this.id = id;
        this.fgKey = null
        this.container;
    }

    drawLevel() {
        this.container = this.scene.add.container(this.x, this.y)
        const bg = this.scene.add.image(0, 0, 'common1', 'level_item_bg_out')
        const fg = this.scene.add.image(0, 0, 'common1', this.getFgKey());

        const idText = this.scene.add.text(0, -35, this.id, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold',
        })
            .setOrigin(0.5)
            .setDepth(1)
        this.container.add([bg, fg, idText]);

        this.container.setSize(bg.width, bg.height)
        this.container.setInteractive().setScale(1.5)
        this.container.bg = bg
        this.container.fg = fg

        this.container.on('pointerover', () => {
            bg.setFrame('level_item_bg_over')
        })

        this.container.on('pointerout', () => {
            bg.setFrame('level_item_bg_out')
        })

        if (this.status === 'locked') {
            this.container.on('pointerdown', () => {
                this.drawDisabledLevel(this.container.x + 160, this.container.y + 120);
            })
        }
    }

    getFgKey() {
        console.log(this.status)
        if (this.status === 'locked') {
            return 'level_item_forward';
        }
        else if (this.status === 'active') {
            return 'level_item_active';
        }
        else {
            return 'level_item_passed';
        }
    }

    updateLevel() {
        const key = this.getFgKey();
        this.container.fg.setFrame(key);
    }

    drawDisabledLevel(x, y) {
        const isRightSide = this.id >= 19;

        const cloudContainer = this.scene.add.container(x, y);
        const bg = this.scene.add.image(0, 0, 'common1', 'tip_bg');
        if (isRightSide) {
            bg.setScale(-1, 1);
            cloudContainer.x -= 315;
        }
        cloudContainer.add(bg).setDepth(100);
        cloudContainer.add(this.scene.add.text(0, 15, 'PLEASE GO THROUGH\n THE PREVIOUS\n TOURNAMENTS TO\n OPEN THIS ONE', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold',
            align: 'center',
        }).setOrigin(0.5)).setScale(1.3)

        this.scene.time.delayedCall(0, () => {
            this.scene.input.once('pointerdown', () => {
                cloudContainer.destroy();
            });
        });
    }
}