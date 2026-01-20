export function playInvalidCardAnimation(scene, container, onComplete) {
  if (!scene || !container) return;
  if (container.procceed) return;
  container.procceed = true;

  const startAngle = container.angle || 0;
  scene.tweens.add({
    targets: container,
    angle: { from: startAngle - 10, to: startAngle + 10 },
    duration: 100,
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      container.angle = startAngle;
      container.procceed = false;
      if (onComplete) onComplete();
    }
  });
}
