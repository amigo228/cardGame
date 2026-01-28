import { BOT_ASSETS } from '../../assets/bots/bots.js';

export function findPlayers(scene) {
    if (scene._botSearchCleanup) {
        scene._botSearchCleanup();
        scene._botSearchCleanup = null;
    }

    if (scene._currentFindPlayersUI) {
        cleanupFindPlayers(scene);
    }

    const gameMapOverlay = renderOverlay(scene);
    const findPlayerContainer = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    
    scene._currentFindPlayersUI = {
        overlay: gameMapOverlay,
        container: findPlayerContainer,
        isDestroyed: false
    };

    const bg = scene.add.image(0, 0, 'common2', 'win_bg_big')
    findPlayerContainer.add(bg);
    findPlayerContainer.setSize(bg.width, bg.height);
    findPlayerContainer.setInteractive();
    findPlayerContainer.setScale(1.5).setDepth(10);

    // cross button
    const cross = scene.add.container(407, -250);
    const crossBg = scene.add.image(0, 0, 'common1', 'but_out');
    cross.add(crossBg);
    cross.setSize(crossBg.width, crossBg.height);
    cross.add(scene.add.image(0, 0, 'common1', 'icon_close'));
    cross.setInteractive();
    cross.bg = crossBg;
    cross.on('pointerover', () => cross.bg.setFrame('but_over'));
    cross.on('pointerout', () => cross.bg.setFrame('but_out'));
    cross.on('pointerdown', () => {
        cleanupFindPlayers(scene);
    });

    //cup
    const cup = scene.add.container(-407, -250);
    const cupBg = scene.add.image(0, 0, 'common2', 'task_icon_bg');
    cup.add(cupBg);
    cup.setSize(cupBg.width, cupBg.height);
    cup.setInteractive();
    cup.add(scene.add.image(0, 0, 'common2', 'cup_ico'));

    // text
    findPlayerContainer.add(scene.add.text(0, -250, 'KNOCKOUT TOURNAMENT', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#FFFFFF',
        stroke: '#000000',
        fontStyle: 'bold',
        strokeThickness: 6
    }).setOrigin(0.5).setDepth(10));

    // LOADING
    const loading = scene.add.container(0, 210);
    loading.add(scene.add.image(0, 0, 'common1', 'panel1'));
    const loadingText = scene.add.text(0, 0, 'WAITING FOR THE PARTICIPANTS...', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5).setDepth(10);
    loading.add(loadingText);

    // WINNER CUP
    const winnerCup = scene.add.container(0, -100);
    winnerCup.add(scene.add.image(0, 0, 'common2', 'cup_tournament')).setScale(0.8);

    //PLAYERS LOGIC 
    const user1 = createUserWrapper(scene, true, { x: -150, y: 80 });
    const bot1 = createUserWrapper(scene, false, { x: 0, y: 80 });
    const bot2 = createUserWrapper(scene, false, { x: 150, y: 80 });

    // ADDING TO FINDPLAYERCONTAINER 
    findPlayerContainer.add([user1, bot1, bot2]);
    findPlayerContainer.add(winnerCup);
    findPlayerContainer.add(loading);
    findPlayerContainer.add(cup);
    findPlayerContainer.add(cross);

    const cleanup = simpleBotSearch(scene, findPlayerContainer, bot1, bot2, loadingText, () => {
        if (scene._currentFindPlayersUI && !scene._currentFindPlayersUI.isDestroyed) {
            loadingText.setText("STARTING THE GAME.");
            const transitionTimer = scene.time.delayedCall(200, () => {
                if (scene._currentFindPlayersUI && !scene._currentFindPlayersUI.isDestroyed) {
                    cleanupFindPlayers(scene);
                    scene.scene.start('GameScene');
                }
            });
            
            if (scene._currentFindPlayersUI) {
                scene._currentFindPlayersUI.transitionTimer = transitionTimer;
            }
        }
    });

    scene._botSearchCleanup = cleanup;
}

function cleanupFindPlayers(scene) {
    if (scene._currentFindPlayersUI) {
        scene._currentFindPlayersUI.isDestroyed = true;
    }
    
    if (scene._botSearchCleanup) {
        scene._botSearchCleanup();
        scene._botSearchCleanup = null;
    }
    
    if (scene._currentFindPlayersUI && scene._currentFindPlayersUI.transitionTimer) {
        if (scene._currentFindPlayersUI.transitionTimer.hasDispatched === false) {
            scene.time.removeEvent(scene._currentFindPlayersUI.transitionTimer);
        }
        scene._currentFindPlayersUI.transitionTimer = null;
    }
    
    if (scene._currentFindPlayersUI) {
        const { overlay, container } = scene._currentFindPlayersUI;
        if (overlay && overlay.destroy) overlay.destroy();
        if (container && container.destroy) container.destroy();
        scene._currentFindPlayersUI = null;
    }
}

function renderOverlay(scene) {
    return scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000)
        .setOrigin(0).setAlpha(0.85).setDepth(9).setInteractive();
}

function createUserWrapper(scene, isUser, positions) {
    const wrapper = scene.add.container(positions.x, positions.y);
    const bg = scene.add.image(0, 0, 'common1', isUser ? 'ava_user_frame' : 'ava_frame');
    wrapper.bg = bg;
    const wi = scene.add.image(
        0,
        0,
        isUser ? 'player_icon' : 'common1',
        isUser ? null : 'competitor_bg'
    ).setScale(isUser ? 0.7 : 1.5);
    wrapper.wi = wi;
    wrapper.add([bg, wi]);
    return wrapper;
}

function simpleBotSearch(scene, parent, bot1, bot2, loadingText, onComplete) {
    const magnifier = scene.add.image(0, 0, 'common2', 'lupa_mini').setScale(0.8);
    parent.add(magnifier);

    let t = 0;
    let target = bot1;
    let finished = false;

    const timers = [];

    function update(_, delta) {
        if (finished || !magnifier.active || !target || !target.active) return;
        t += delta * 0.004;
        magnifier.x = target.x + Math.cos(t) * 40;
        magnifier.y = target.y + Math.sin(t) * 40;
    }
    
    const updateListener = scene.events.on('update', update);

    function cleanup() {
        if (finished) return;
        finished = true;
        
        if (updateListener) {
            scene.events.off('update', update);
        }
        
        if (magnifier && magnifier.destroy) {
            magnifier.destroy();
        }
        
        timers.forEach(timer => {
            if (timer && timer.hasDispatched === false) {
                scene.time.removeEvent(timer);
            }
        });
        timers.length = 0;
    }
    const timer1 = scene.time.delayedCall(200, () => {
        if (finished || !parent.active) return cleanup();

        if (target && target.wi && target.wi.active) {
            const bot1Key = getRandomBotKey();
            target.wi.setTexture(bot1Key);
            target.wi.setScale(1);

            t = 0;
            target = bot2;
            
            const timer2 = scene.time.delayedCall(200, () => {
                if (finished || !parent.active) return cleanup();

                if (target && target.wi && target.wi.active) {
                    const bot2Key = getRandomBotKey(bot1Key);
                    target.wi.setTexture(bot2Key);
                    target.wi.setScale(1);
                }
                if (onComplete) {
                    onComplete();
                }
                
                scene.events.off('update', update);
                if (magnifier && magnifier.destroy) {
                    magnifier.destroy();
                }
            });
            
            timers.push(timer2);
        } else {
            cleanup();
        }
    });
    
    timers.push(timer1);

    return cleanup;
}

function getRandomBotKey(exclude) {
    const options = exclude
        ? BOT_ASSETS.filter(key => key !== exclude)
        : BOT_ASSETS;
    return Phaser.Utils.Array.GetRandom(options);
}