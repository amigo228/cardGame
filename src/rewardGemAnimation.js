export function playRewardGemAnimation(scene, x, y) {
    scene.hud?.updateGems(-1);
    console.log("RewardGemAnimation");
    const gem = scene.add.image(x - 30, y, 'common1', 'money_ico_btn').setScale(1.5)
        .setDepth(5000);
    const rewardText = scene.add.text(x + 30, y, "+1", {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: '#db9c25',
        stroke: '#000000',
        strokeThickness: 6
    }).setDepth(10000);
    rewardText.setOrigin(0.5);

    scene.tweens.add({
        targets: [gem, rewardText],
        alpha: 0,
        y: y - 20,
        duration: 1000,
        onComplete: () => {gem.destroy(); rewardText.destroy();}
    });
}