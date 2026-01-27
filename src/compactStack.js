export function compactStack(
  stack,
  { gapY = -4, duration = 200 } = {}
) {
  if (!stack.length) return;

  const scene = stack[0].container.scene;
  const stackIdx = stack[0].originStackIndex;
  const baseAngle = scene.stackAngles?.[stackIdx] ?? 0;
  const baseY = stack[0].startY;

  stack.forEach((card, idx) => {
    const y = baseY + idx * gapY;

    scene.tweens.killTweensOf(card.container);

    scene.tweens.add({
      targets: card.container,
      y,
      angle: baseAngle, 
      duration,
      ease: 'Sine.easeOut'
    });

    card.startY = y;
    card.originalAngle = baseAngle;
    card.originIndex = idx;

    const depth = stackIdx * 100 + (idx + 1);
    card.originalDepth = depth;
    card.container.setDepth(depth);
  });
}
