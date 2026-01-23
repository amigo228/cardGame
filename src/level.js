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
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        })
            .setOrigin(0.5)
            .setDepth(1)
        this.container.add([bg, fg, idText]);

        this.container.setSize(bg.width, bg.height)
        this.container.setInteractive()
        this.container.bg = bg
        this.container.fg = fg

        this.container.on('pointerover', () => {
            bg.setFrame('level_item_bg_over')
        })

        this.container.on('pointerout', () => {
            bg.setFrame('level_item_bg_out')
        })
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
}