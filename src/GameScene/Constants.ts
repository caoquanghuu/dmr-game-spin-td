

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
            tinker: 'tiner'
        }
    };

    export const bulletCount = 5;
    export const towerCount = 5;
    export const enemiesCount = 5;

    export const dame = {
        CM: 0,
        Mirana: 1,
        Tinker: 2
    };

    export const goldCost = {
        CM: 50,
        Mirana: 70,
        Tinker: 100
    };

    export const effectArena = {
        CM: 200,
        Mirana: 200,
        Tinker: 200
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
        destroyBullet: 'destroy-bullet'
    };
}