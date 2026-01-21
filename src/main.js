import { GameScene } from './scenes/GameScene.js';
import {PreloadScene} from './scenes/PreloadScene.js';
const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1920,
    height: 1080,
    backgroundColor: 0x000000,
    pixelArt: false,
    scene: [
        PreloadScene, GameScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            