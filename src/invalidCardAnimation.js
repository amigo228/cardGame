export function playInvalidCardAnimation(scene, container, onComplete) {
  if (!scene || !container) return;
  if (container._isAnimating) return;
  container._isAnimating = true;

  const startAngle = container.angle || 0;
  const startScale = container.scaleX || 1;

  const { width, height } = scene.scale;
  const blocker = scene.add.rectangle(0, 0, width, height, 0x000000, 0)
    .setOrigin(0, 0)
    .setDepth(99999)
    .setScrollFactor(0)
    .setInteractive();

  blocker.on('pointerdown', () => {  });

  scene.tweens.add({
    targets: container,
    angle: { from: startAngle - 10, to: startAngle + 10 },
    duration: 100,
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      container.angle = startAngle;
      container._isAnimating = false;
      container.setScale(startScale);

      blocker.destroy();

      scene.time.delayedCall(30, () => {
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
      });
    }
  });
}
