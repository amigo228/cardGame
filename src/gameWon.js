export function gameWon(scene) {
  if (scene.deck.length === 0) {
    console.log("Won");
    scene.input.enabled = false;

    const overlay = scene.add.rectangle(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      scene.scale.width,
      scene.scale.height,
      0x555555,
      0.4
    ).setDepth(1000);

    const winText = scene.add.text(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      "GAME WON!",
      {
        fontFamily: 'Arial',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
      }
    )
    .setOrigin(0.5)
    .setDepth(1001)
    .setScale(0);

    scene.tweens.add({
      targets: winText,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 800,
      onComplete: () => {
        scene.time.delayedCall(3000, () => {
          scene.cameras.main.fadeOut(500, 0, 0, 0);

          scene.cameras.main.once('camerafadeoutcomplete', () => {
            scene.scene.start("MapScene", { nextLevel: true });
          });
        });
      }
    });
  }
}
