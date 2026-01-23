import { GameState } from '../GameState.js';

export function playNextLevelAnimation(scene) {
    const prevLevel = GameState.currentLevel - 1;
    const nextLevel = GameState.currentLevel; 
    scene.levels[prevLevel].status = 'passed';
    scene.levels[prevLevel].updateLevel();

    const targetX = scene.levels[nextLevel].x;
    const targetY = scene.levels[nextLevel].y - 40;

    scene.tweens.add({
        targets: scene.avatar.container,
        x: targetX,
        y: targetY,
        ease: "Linear",
        duration: 2000,
        onComplete: () => {
            scene.levels[nextLevel].status = 'active';
            scene.levels[nextLevel].updateLevel();
            GameState.currentLevel++;
        }
    })
}