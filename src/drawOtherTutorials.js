export function drawOtherTutorials(
    scene,
    x,
    y,
    text,
    arrow = null,
    nextTutorial = null,
    onAllComplete = null 
) {
    const tutorialTextBox = scene.add.container(x, y);

    const bg = scene.add.image(0, 0, 'common1', 'magic_hint_bg')
        .setScale(2);

    const textObj = scene.add.text(0, 0, text, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#000000',
        stroke: '#ffffff',
        fontStyle: 'bold',
        strokeThickness: 6,
        align: 'center'
    })
        .setOrigin(0.5)
        .setDepth(1);

    tutorialTextBox.add([bg, textObj]);
    tutorialTextBox.setDepth(99999);
    tutorialTextBox.setSize(bg.displayWidth, bg.displayHeight);
    tutorialTextBox.setInteractive();

    let arrowImage = null;
    let arrowTween = null;

    if (arrow) {
        arrowImage = scene.add
            .image(arrow.x, arrow.y, 'common1', 'tutorial_arrow')
            .setAngle(arrow.angle ?? 90)
            .setScale(1.7)
            .setDepth(99999);

        arrowTween = scene.tweens.add({
            targets: arrowImage,
            x: arrow.x - 20,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        arrowImage.setInteractive();
    }

    const destroyTutorial = () => {
        scene.input.off('pointerdown', destroyTutorial);

        arrowTween?.stop();
        arrowImage?.destroy();
        tutorialTextBox.destroy();
        
        if (nextTutorial) {
            drawOtherTutorials(
                scene, 
                nextTutorial.x, 
                nextTutorial.y, 
                nextTutorial.text, 
                nextTutorial.arrow,
                null, 
                onAllComplete 
            );
        } else {
            if (onAllComplete) {
                onAllComplete();
            }
        }
    };

    tutorialTextBox.once('pointerdown', destroyTutorial);
    arrowImage?.once('pointerdown', destroyTutorial);
    scene.input.once('pointerdown', destroyTutorial);
}