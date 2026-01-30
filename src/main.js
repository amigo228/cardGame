import { GameScene } from './scenes/GameScene.js';
import {PreloadScene} from './scenes/PreloadScene.js';
import {MapScene} from './scenes/MapScene.js';

const dpr = window.devicePixelRatio || 1;
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
        PreloadScene, GameScene, MapScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
        resolution: dpr
    },
}

new Phaser.Game(config);
            