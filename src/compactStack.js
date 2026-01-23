export function compactStack(stack, { animate = true, gapY = -4, duration = 200 } = {}) {
    console.log("In compact stack")
    if (!Array.isArray(stack) || stack.length === 0) return;
    stack.sort((a, b) => (a.originIndex ?? 0) - (b.originIndex ?? 0));
    const baseY = stack[0]?.startY ?? 200;
    stack.forEach((card, idx) => {
        const y = baseY + idx * gapY;
        card.container.scene.tweens.killTweensOf(card.container);
        card.container.scene.tweens.add({
            targets: card.container,
            y,
            duration,
            ease: 'Sine.easeOut'
        });
        card.startY = y;
        const stackIdx = card.originStackIndex ?? 0;
        const depth = stackIdx * 100 + (idx + 1);
        card.originalDepth = depth;
        card.container.setDepth(depth);
        card.originIndex = idx;
    });
}