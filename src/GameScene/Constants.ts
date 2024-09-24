import { TextOptions } from 'pixi.js';
import { ClockWerk } from 'src/ObjectsPool/Tower/ClockWerk';


/* eslint-disable @typescript-eslint/no-namespace */
export namespace AppConstants {
    export const appWidth: number = 960;
    export const appHeight: number = 640;
    export const appColor: string = '#1099bb';
    export const matrixSize = {
        width: 32,
        height: 32
    };
    export const mapSize = {
        width: appWidth,
        height: matrixSize.width * (appHeight / matrixSize.width) * (4 / 5),
    };
    export const UISize = {
        width: appWidth,
        height: appHeight - mapSize.height
    };
    export const SpinSize = {
        width: appWidth / 2,
        height: appHeight / 2
    };

    export const textureName = {
        tower: {
            crystalMaiden: 'crystal-maiden',
            mirana: 'mirana',
            tinker: 'tinker'
        }
    };

    export const bulletCount = 5;
    export const towerCount = 5;
    export const enemiesCount = 5;

    export const dame = {
        CM: 0,
        Mirana: 1,
        Tinker: 2,
        ClockWerk: 3
    };

    export const goldCost = {
        CM: 50,
        Mirana: 70,
        Tinker: 100,
        ClockWerk: 150
    };

    export const effectArena = {
        CM: 200,
        Mirana: 200,
        Tinker: 200,
        ClockWerk: 300,
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
        createEnemy: 'create-enemy',
        removeEnemy: 'remove-enemy',
        addToUIBoard: 'add-to-ui-board',
        removeFromUiBoard: 'remove-from-ui-board',
        selectTowerBase:'select-tower-base',
        plusGold: 'plus-gold',
        reduceGold: 'reduce-gold',
        resetBoard: 'reset-board',
        displayTowerInfo: 'displayTowerInfo'
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
        dame: { x: 30, y: 0 },
        dameNumber: { x: 150, y: 0 },
        speed: { x: 30, y: 35 },
        speedNumber : { x: 150, y: 35 },
        level: { x: 350, y: 0 },
        levelNumber : { x: 470, y: 0 },
        effect: { x: 350, y: 35 },
        effectType: { x: 470, y: 35 }
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
        mirana: 30,
        crystal_maiden: 30,
        clockwerk: 40
    };

}