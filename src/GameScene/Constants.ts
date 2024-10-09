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
        tower: 5
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
        towerBase: 3
    };

    export const playerBasicProperty = {
        playerGold: 10000,
        playerHp: 3000
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
        towerBase: 'tower-base'
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
        notEnoughGold: 'not-enough-gold'
    };

    export const maxLevelOfTower = 4;

    export const time = {
        delayWhenCreateEne: 1000,
        delayBetweenWaves: 5000,
        delayVictorySound: 8000
    };

    export const limitWaveNumber = 15;

    export const goldPlusPerWave = 10;

    export const dame = {
        crystal_maiden: { min: 0, max: 0 },
        mirana: { min: 100, max: 140 },
        tinker: { min: 200, max: 240 },
        clockwerk: { min: 200, max: 250 },
        barack: { min: 0, max: 0 }
    };

    export const fireTimeCd = {
        crystal_maiden: { fireTimeConst: 3000, fireTimeCount: 3000 },
        mirana: { fireTimeConst: 2000, fireTimeCount: 2000 },
        tinker: { fireTimeConst: 3000, fireTimeCount: 3000 },
        clockwerk: { fireTimeConst: 3000, fireTimeCount: 3000 },
        barack: { fireTimeConst: 3000, fireTimeCount: 3000 }
    };

    export const effectArena = {
        crystal_maiden: 130,
        mirana: 120,
        tinker: 100,
        clockwerk: 150,
        barack: 100
    };

    export const bulletEffectArena = {
        ice: 100,
        laser: 10,
        lightning: 10,
        missile: 100
    };

    export const enemiesHp = {
        tank1: 5,
        tank2: 10,
        tank3: 15
    };

    export const enemiesDameDeal = {
        tank1: 1,
        tank2: 2,
        tank3: 3
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
        invisibleTowerIllusion: 'invisible-tower-illusion'

    };

    export const position = {
        wave: { x: 30, y: 35 },
        waveNumber: { x: 150, y: 35 },
        gold: { x: 30, y: 70 },
        goldNumber: { x: 150, y: 70 },
        baseHp: { x: 30, y: 0 },
        baseNumber: { x: 150, y: 0 },
        spin: { x: 800, y: 35 },
    };

    export const infoBoardPosition = {
        dame: { x: 350, y: 35 },
        dameNumber: { x: 470, y: 35 },
        speed: { x: 350, y: 70 },
        speedNumber : { x: 470, y: 70 },
        level: { x: 350, y: 0 },
        levelNumber : { x: 470, y: 0 },
        effect: { x: 650, y: 0 },
        effectType: { x: 750, y: 0 },
        upgrade: { x: 650, y: 35 },
        upgradeNumber: { x: 780, y: 35 },
        sell: { x: 650, y: 70 },
        sellNumber: { x: 750, y: 70 },
        exit: { x: 900, y: 0 },
        towerIcon: { x: 150, y: 60 }
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
        crystal_maiden: 100,
        clockwerk: 80,
        barack: 10
    };

    export const unitPrice = {
        flyUnit: {
            helicopter: 100
        },
        allyTank: {
            sovietTank: 100
        }
    };

    export const objectZIndex = {

    };

}