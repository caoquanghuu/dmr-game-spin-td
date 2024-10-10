import { AnimatedSprite, Container, Graphics, PointData, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import gameMap from '../Map/mapMatrix.json';
import { Tower } from '../../ObjectsPool/Tower/Tower';
import { Tank } from '../../ObjectsPool/Enemies/Tank';
import { AssetsLoader } from '../../AssetsLoader';
import { BulletController } from '../../Controller/BulletController';
import { CollisionController } from '../../Controller/CollisionController';
import { TowerController } from '../../Controller/TowerController';
import { ObjectPool } from '../../ObjectsPool/ObjectPool';
import { Bullet } from '../../ObjectsPool/Bullet';
import { BulletType, FlyUnitType, TowerType } from '../../Type';
import Emitter, { createImage } from '../../Util';
import { UnitController } from '../../Controller/UnitController';
import { sound } from '@pixi/sound';
import { ControlUnit } from '../../ObjectsPool/ControlUnit/ControlUnit';
import Factory from '../../ObjectsPool/Factory';
import { BaseObject } from '../../ObjectsPool/BaseObject';

export class GameMap extends Container {
    private _towerBase: Sprite[] = [];
    private _trees: Sprite[]= [];
    private _bulletController: BulletController;
    private _collisionController: CollisionController;
    private _towerController: TowerController;
    private _unitController: UnitController;
    private _objectPool: ObjectPool;
    private _time: number = 0;
    private _nuclearBase: BaseObject;

    // wave is define to current hard level
    private _wave: number = 1;

    private _mapMatrix: any;
    constructor() {
        super();
        // get matrix map from map file json file
        this._mapMatrix = gameMap.gridMap;

        // assign event emitter
        this._useEventEffect();

        // create pool
        this._objectPool = new ObjectPool(this._getMatrixMap.bind(this), this._setMatrixMap.bind(this));

        // create controllers
        this._towerController = new TowerController(this._getTowerFromPool.bind(this), this._returnTowerToPool.bind(this), this._getTowerBase.bind(this), this._getUnitFromPool.bind(this), this._returnUnitToPool.bind(this), this._getMatrixMap.bind(this), this._setMatrixMap.bind(this));
        this._unitController = new UnitController(this._getEnemiesFromPool.bind(this), this._returnEnemiesToPool.bind(this), this._getExplosionFromPool.bind(this), this._returnExplosionToPool.bind(this), this._getMatrixMap.bind(this), this._setMatrixMap.bind(this));
        this._bulletController = new BulletController(this._getBulletFromPool.bind(this), this._returnBulletToPool.bind(this));
        this._collisionController = new CollisionController(this._getObject.bind(this), this._getExplosionFromPool.bind(this), this._returnExplosionToPool.bind(this));

        this._init();
        // sound.muteAll();
    }

    private _init() {
        // create const objects base on matrix map
        this._mapMatrix.forEach((val, idxX) => {
            val.forEach((value, idxY) => {
                // const rd = Math.round(Math.random()*1 + 1);
                const grass = createImage({ texture: 'grass-1', width: AppConstants.matrixSize, height: AppConstants.matrixSize });
                grass.position = { x: idxX * AppConstants.matrixSize, y: idxY * AppConstants.matrixSize };
                this.addChild(grass);
                grass.zIndex = 0;

                if (value === 1) {
                    // where ene can go

                }
                if (value === 0) {
                    // create tree con border of map
                    const treeNumber = Math.round(Math.random() * 5);
                    const tree = createImage({ texture: `tree-${treeNumber}`, width: AppConstants.matrixSize, height: AppConstants.matrixSize });
                    tree.position = { x: idxX * AppConstants.matrixSize, y: idxY * AppConstants.matrixSize };
                    this.addChild(tree);
                    this._trees.push(tree);
                }

                if (value === 3) {
                    this._nuclearBase = Factory.createNuclearBase();
                    this._nuclearBase.position = { x: idxX * AppConstants.matrixSize + AppConstants.matrixSize, y: idxY * AppConstants.matrixSize - AppConstants.matrixSize / 3 };
                    this._nuclearBase.hpBar.position = { x: this._nuclearBase.position.x, y: this._nuclearBase.position.y - AppConstants.matrixSize / 2 };
                    this._nuclearBase.image.width = AppConstants.matrixSize * 4;
                    this._nuclearBase.image.height = AppConstants.matrixSize * 4;
                    this._nuclearBase.image.zIndex = AppConstants.zIndex.nuclearBase;
                    this._nuclearBase.hpBar.zIndex = AppConstants.zIndex.nuclearBase;
                    this._nuclearBase.HP = AppConstants.playerBasicProperty.playerHp;
                    this._nuclearBase.setAnimation(AppConstants.textureName.nuclearBaseAnimation);
                    this._nuclearBase.setFrame(0);
                    this.addChild(this._nuclearBase.image);
                    this.addChild(this._nuclearBase.hpBar);


                    // set target for collision
                    this._collisionController.nuclearBase = this._nuclearBase;

                }

                if (value === 2) {
                    const towerBase = createImage({ texture: AppConstants.textureName.towerBase, width: AppConstants.matrixSize, height: AppConstants.matrixSize, alpha: AppConstants.imageAlpha.towerBase });

                    towerBase.position = { x: idxX * AppConstants.matrixSize, y: idxY * AppConstants.matrixSize };
                    towerBase.zIndex = AppConstants.zIndex.towerBase;
                    this._towerBase.push(towerBase);
                    this.addChild(towerBase);
                }

                if (value === 7) {
                    const tankFactory = createImage({ texture: AppConstants.textureName.tankFactory, width: AppConstants.matrixSize * 2, height: AppConstants.matrixSize * 2, anchor: 0.5 });
                    tankFactory.position = { x: idxX * AppConstants.matrixSize, y: idxY * AppConstants.matrixSize + AppConstants.matrixSize / 4 };
                    tankFactory.zIndex = AppConstants.zIndex.tankFactory;
                    this._trees.push(tankFactory);
                    this.addChild(tankFactory);
                }


            });
        });

        // set event for tower base, end event to ui controller display build tower option
        this._towerBase.forEach(base => {
            base.eventMode = 'dynamic';
            base.cursor = 'pointer';
            base.on('pointerdown', (event) => {
                event.stopPropagation();
                Emitter.emit(AppConstants.event.selectTowerBase, base);
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.selectedBuilding });
            });
        });

    }

    private _getObject(): {towers: Tower[], bullets: Bullet[], enemies: Tank[], allies: Tank[], units: ControlUnit[], blockObjects: Sprite[]} {
        return { towers: this._towerController.towers, bullets: this._bulletController.bullets, enemies: this._unitController.enemies, allies: this._unitController.allies, units: this._towerController.units, blockObjects: this._towerBase.concat(this._trees) };
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.addChildToScene, (sprite: Sprite | AnimatedSprite | Graphics) => {
            this.addChild(sprite);
        });
        Emitter.on(AppConstants.event.removeChildFromScene, (sprite: Sprite | AnimatedSprite | Graphics) => {
            this.removeChild(sprite);
        });
    }

    // method to create enemies
    public startGame() {
        // position spawn enemy game get on matrix map
        this._unitController.spawnWave(this._wave, { x: 15, y: 0 });
    }

    private _checkWave(dt: number) {
        if (this._unitController.enemies.length > 0) return;

        this._time += dt;
        if (this._time >= AppConstants.time.delayBetweenWaves) {
            this._wave += 1;
            if (this._wave > AppConstants.limitWaveNumber) {
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.nuclearMissileAlert });
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.nuclearMissileLaunch });
                Emitter.emit(AppConstants.event.gameOver, true);
                setTimeout(() => { sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.victory }); }, AppConstants.time.delayVictorySound);

                return;

            }
            // send event to ui basic board display new wave
            Emitter.emit(AppConstants.event.displayWave, this._wave);
            // plus gold for player at new wave
            Emitter.emit(AppConstants.event.plusGold, (AppConstants.goldPlusPerWave + this._wave));
            this._unitController.spawnWave(this._wave, { x: 15, y: 0 });
            // change texture of nuclear base
            this._nuclearBase.setFrame(this._wave - 1);
            this._time = 0;
        }

    }

    private _getTowerBase(position: PointData[]): Sprite[] {
        const towerBases: Sprite[] = [];
        for (let i = 0; i < position.length; i++) {
            const towerBase = this._towerBase.find(base => base.position.x === position[i].x && base.position.y === position[i].y);
            towerBases.push(towerBase);
        }
        return towerBases;
    }

    // methods get and return object to controllers
    private _getTowerFromPool(towerType: TowerType): Tower {
        return this._objectPool.getTowerFromPool(towerType);
    }

    private _returnTowerToPool(tower: Tower): void {
        this._objectPool.returnTower(tower);
    }

    private _getBulletFromPool(bulletType: BulletType): Bullet {
        return this._objectPool.getBulletFromPool(bulletType);
    }

    private _returnBulletToPool(bullet: Bullet): void {
        this._objectPool.returnBullet(bullet);
    }

    private _getEnemiesFromPool(): Tank {
        return this._objectPool.getEnemies();
    }

    private _returnEnemiesToPool(ene: Tank): void {
        this._objectPool.returnEnemies(ene);
    }

    private _getExplosionFromPool(explosionType: BulletType): AnimatedSprite {
        return this._objectPool.getExplosion(explosionType);
    }

    private _returnExplosionToPool(ex: AnimatedSprite, exType: BulletType) {
        this._objectPool.returnExplosion(ex, exType);
    }

    private _getUnitFromPool(unitType: FlyUnitType): ControlUnit {
        return this._objectPool.getUnit(unitType);
    }

    private _returnUnitToPool(unit: ControlUnit) {
        this._objectPool.returnUnit(unit);
    }

    private _getMatrixMap(): number[][] {
        return this._mapMatrix;
    }

    private _setMatrixMap(row: number, colum: number, value: number) {
        this._mapMatrix[row][colum] = value;
    }

    public reset() {
        this._collisionController.reset();
        this._towerController.reset();
        this._unitController.reset();
        this._bulletController.reset();

        this._wave = 0;
        this._nuclearBase.HP = AppConstants.playerBasicProperty.playerHp;
        this._nuclearBase.setFrame(0);
        this._nuclearBase.hpBar.texture = AssetsLoader.getTexture('hp-10');
    }

    // update function
    public update(dt: number) {

        this._collisionController.update();
        this._towerController.update(dt);
        this._bulletController.update(dt);
        this._unitController.update(dt);
        this._checkWave(dt);
    }
}