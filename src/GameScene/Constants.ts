import { TextOptions } from 'pixi.js';


/* eslint-disable @typescript-eslint/no-namespace */
export namespace AppConstants {
    export const appWidth: number = 960;
    export const appHeight: number = 640;
    export const appColor: string = '#1099bb';
    export const matrixSize = appWidth / 30;
    export const mapSize = {
        width: appWidth,
        height: matrixSize * 16,
    };
    export const UISize = {
        width: appWidth,
        height: appHeight - mapSize.height
    };
    export const basicBoardSize = {
        width: appWidth / 3.8,
        height: UISize.height
    };
    export const optionBoardSize = {
        width: appWidth - basicBoardSize.width,
        height: UISize.height
    };
    export const optionBoardPosition = {
        x: basicBoardSize.width,
        y: 0
    };
    export const SpinSize = {
        width: appWidth / 2,
        height: appHeight / 2
    };

    export const matrixMapValue = {
        environment: 0,
        availableMoveWay: 1,
        availableTowerBuild: 2,
        nuclearBase: 3,
        enemy: 4,
        ally: 6,
        tower: 5,
        spawnAllyPosition: 7
    };

    export const bulletCount = 5;
    export const towerCount = 5;
    export const enemiesCount = 5;

    export const zIndex = {
        bullet: 6,
        enemy: 4,
        enemyHpBar: AppConstants.appHeight - 10,
        tower: 7,
        nuclearBase: 2,
        towerBase: 3,
        tankFactory: 8
    };

    export const playerBasicProperty = {
        playerGold: 10000,
        playerHp: 9000
    };

    export const imageAlpha = {
        towerBase: 0.8,
        towerCircle: 25,
        towerUpGradeIcon: 25
    };

    export const moveAnimationName = {
        moveUp: 'move-up',
        moveDown: 'move-down',
        moveLeft: 'move-left',
        moveRight: 'move-right',
        moveUpLeft: 'move-left-up',
        moveUpRight: 'move-right-up',
        moveDownLeft: 'move-left-down',
        moveDownRight: 'move-right-down'
    };

    export const textureName = {
        tankExplosionAnimation: 'tank',
        grass: 'grass-1',
        tree: 'tree-1',
        nuclearBase: 'nuclear-base',
        nuclearBaseAnimation: 'building',
        towerBase: 'tower-base',
        tankFactory: 'tank-factory',
        soundIcon: {
            on: 'sound-on',
            off: 'sound-off'
        },
        bulletCountImage: {
            exist: 'bullet-bar-1',
            null: 'bullet-bar-0'
        },
        informationBackGround: 'information-background',
        towers: {
            mirana1: 'mirana',
            mirana2: 'mirana-2',
            mirana3: 'mirana-3',
            tinker1: 'tinker',
            tinker2: 'tinker-2',
            clockwerk1: 'clockwerk',
            clockwerk2: 'clockwerk-2',
            clockwerk3: 'clockwerk-3',
            clockwerk4: 'clockwerk-4'
        }
    };

    export const soundName = {
        mainSound: 'my-sound',
        selectedBuilding: 'building-selected',
        buildingCompleted: 'building-complete',
        soldTower: 'sold-tower',
        towerUpgraded: 'tower-upgraded',
        baseBeAttacked: 'base-under-attacked',
        missionFail: 'mission-fail',
        nuclearMissileAlert: 'nuclear-missile-alert',
        nuclearMissileLaunch: 'nuclear-missile-launch',
        victory: 'victory',
        notEnoughGold: 'not-enough-gold',
        battleControlOnline: 'battle-control-online',
        mainMusic: 'main-music',
        barackBuilded: 'barack-builded',
        canNotBuild: 'can-not-build',
        firePowerUpgraded: 'firer-power-upgraded',
        setNewTarget1: 'set-new-target-1',
        setNewTarget2: 'set-new-target-2',
        spawnAlly1: 'spawn-ally-1',
        spawnAlly2: 'spawn-ally-2',
        spawnAlly3: 'spawn-ally-3',
        spawnHelicopter1: 'spawn-helicopter-1',
        spawnHelicopter2: 'spawn-helicopter-2',
        training: 'training',
        unitLost: 'unit-lost',
        unitReady: 'unit-ready'
    };

    export const maxLevelOfTower = 4;

    export const time = {
        delayWhenCreateEne: 1000,
        delayBetweenWaves: 5000,
        delayVictorySound: 8000,
        helicopterChargeBulletTime: 1000
    };

    export const limitWaveNumber = 17;

    export const goldPlusPerWave = 20;

    export const dame = {
        crystal_maiden: { min: 0, max: 0 },
        mirana: { min: 100, max: 140 },
        tinker: { min: 200, max: 240 },
        clockwerk: { min: 200, max: 250 },
        barack: { min: 0, max: 0 },
        helicopter: { min: 150, max: 300 },
        allyTank: { min: 200, max: 300 }
    };

    export const allyUnitBasicProperty = {
        dame: 100,
        speed: 100,
        hp: 1000
    };

    export const fireTimeCd = {
        crystal_maiden: { fireTimeConst: 3000, fireTimeCount: 3000 },
        mirana: { fireTimeConst: 2000, fireTimeCount: 2000 },
        tinker: { fireTimeConst: 3000, fireTimeCount: 3000 },
        clockwerk: { fireTimeConst: 3000, fireTimeCount: 3000 },
        barack: { fireTimeConst: 3000, fireTimeCount: 3000 },
        helicopter: { fireTimeConst: 1000, fireTimeCount: 0 }
    };

    export const effectArena = {
        crystal_maiden: 130,
        mirana: 120,
        tinker: 100,
        clockwerk: 150,
        barack: 100
    };

    export const bulletEffectArena = {
        ice: 10,
        laser: 10,
        lightning: 10,
        missile: 100
    };

    export const event = {
        fireBullet: 'fire-bullet',
        createBullet: 'create-bullet',
        removeBullet: 'remove-bullet',
        createTower: 'create-tower',
        destroyTower: 'destroy-tower',
        addChildToScene: 'add-child-to-scene',
        removeChildFromScene: 'remove-child-from-scene',
        destroyBullet: 'destroy-bullet',
        createUnit: 'create-unit',
        removeEnemy: 'remove-enemy',
        addToUIBoard: 'add-to-ui-board',
        removeFromUiBoard: 'remove-from-ui-board',
        selectTowerBase:'select-tower-base',
        plusGold: 'plus-gold',
        reduceGold: 'reduce-gold',
        resetBoard: 'reset-board',
        displayTowerInfo: 'displayTowerInfo',
        upgradeTower: 'upgrade-tower',
        displayWave: 'display-wave',
        reduceBaseHp: 'reduce-base-hp',
        gameOver: 'game-over',
        gameStart: 'game-start',
        createAllyUnit: 'create-ally-unit',
        createTowerIllusion: 'create-tower-illusion',
        invisibleTowerIllusion: 'invisible-tower-illusion',
        saveGame: 'save-game',
        toggleSound: 'toggle-sound',
        soundIconClicked: 'sound-icon-clicked'
    };

    export const position = {
        wave: { x: 30, y: 35 },
        waveNumber: { x: 150, y: 35 },
        gold: { x: 30, y: 70 },
        goldNumber: { x: 150, y: 70 },
        baseHp: { x: 30, y: 0 },
        baseNumber: { x: 150, y: 0 },
        spin: { x: 800, y: 35 },
        soundIcon : { x: matrixSize * 29, y: 0 }
    };

    export const infoBoardPosition = {
        dame: { x: matrixSize * 9, y: matrixSize },
        dameNumber: { x: matrixSize * 12, y: matrixSize },
        speed: { x: matrixSize * 8 + 10, y: matrixSize * 2 },
        speedNumber : { x: matrixSize * 12, y: matrixSize * 2 },
        level: { x: matrixSize * 20, y: matrixSize },
        levelNumber : { x: matrixSize * 23, y: matrixSize },
        effect: { x: matrixSize * 20 + 10, y: matrixSize * 2 },
        effectType: { x: matrixSize * 23, y: matrixSize * 2 },
        upgrade: { x: matrixSize * 9, y: matrixSize * 3 },
        upgradeNumber: { x: matrixSize * 12, y: matrixSize * 3 },
        sell: { x:  matrixSize * 20 - 10, y: matrixSize * 3 },
        sellNumber: { x: 750, y: 70 },
        exit: { x: matrixSize * 28, y: matrixSize },
        towerIcon: { x: matrixSize * 4, y: matrixSize * 2 },
        exitButton: { x: matrixSize * 28, y: matrixSize },
        upgradeButton: { x:  matrixSize * 10, y: matrixSize * 3 + 5 },
        sellButton: { x:matrixSize * 20, y: matrixSize * 3 + 5 }
    };

    export const text: {[text: string]: TextOptions} = {
        wave: {
            text: 'wave:',

            style: {
                fontFamily: 'Desyrel',
                fontSize: 30,
            }


        },
        waveNumber: {
            text: 0,
            style: {
                fontFamily: 'font_number',
                fontSize: 30,
            }
        }
        ,
        gold: {
            text: 'gold:',
            style: {
                fontFamily: 'Desyrel',
                fontSize: 30,
            }
        },
        goldNumber: {
            text: 0,
            style: {
                fontFamily: 'font_number',
                fontSize: 30,
            }
        }
        ,
        baseHp: {
            text: 'base HP:',
            style: {
                fontFamily: 'Desyrel',
                fontSize: 30,
            }
        },
        baseHpNumber: {
            text: 0,
            style: {
                fontFamily: 'font_number',
                fontSize: 30,
            } }
        ,
        spin: {
            text: 'spin',
            style: {
                fontFamily: 'Desyrel',
                fontSize: 30,
            }
        },
    };

    export const towerPrice = {
        tinker: 20,
        mirana: 10,
        crystal_maiden: 60,
        clockwerk: 40,
        barack: 60
    };

    export const unitPrice = {
        flyUnit: {
            helicopter: 100
        },
        allyTank: {
            sovietTank: 10
        }
    };

    export const menuButtonOption = {
        texture: 'menu_bar',
        width: matrixSize * 7,
        height: matrixSize * 2,
        anchor: 0.5,
        alpha: null

    };

    export const bitmapTextFontName = {
        fontNumber: 'font_number',
        fontAlpha: 'Desyrel'
    };

}