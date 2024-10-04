import { AnimatedSprite, Container, Graphics, PointData, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import map from '../Map/mapMatrix.json';
import { Tower } from '../../ObjectsPool/Tower/Tower';
import { Enemies } from '../../ObjectsPool/Enemies/Enemies';
import { AssetsLoader } from '../../AssetsLoader';
import { BulletController } from '../../Controller/BulletController';
import { CollisionController } from '../../Controller/CollisionController';
import { TowerController } from '../../Controller/TowerController';
import { ObjectPool } from '../../ObjectsPool/ObjectPool';
import { Bullet } from '../../ObjectsPool/Bullet';
import { BulletType, TowerType, UnitType } from '../../Type';
import Emitter from '../../Util';
import { EnemiesController } from '../../Controller/EnemiesController';
import { sound } from '@pixi/sound';
import { ControlUnit } from '../../ObjectsPool/ControlUnit/ControlUnit';

export class GameMap extends Container {
    private _unit: ControlUnit[] = [];
    private _towerBase: Sprite[] = [];
    private _bulletController: BulletController;
    private _collisionController: CollisionController;
    private _towerController: TowerController;
    private _enemiesController: EnemiesController;
    private _objectPool: ObjectPool;
    private _time: number = 0;
    private _nuclearBase: AnimatedSprite;

    // wave is define to current hard level
    private _wave: number = 1;

    public static mapMatrix: any;
    constructor() {
        super();
        // get matrix map from map file json file
        GameMap.mapMatrix = map.map(row => [...row]);

        // assign event emitter
        this._useEventEffect();

        // create pool
        this._objectPool = new ObjectPool();

        // create controllers
        this._towerController = new TowerController(this._getTowerFromPool.bind(this), this._returnTowerToPool.bind(this), this._getTowerBase.bind(this), this._getUnitFromPool.bind(this), this._returnUnitToPool.bind(this));
        this._enemiesController = new EnemiesController(this._getEnemiesFromPool.bind(this), this._returnEnemiesToPool.bind(this), this._getExplosionFromPool.bind(this), this._returnExplosionToPool.bind(this));
        this._bulletController = new BulletController(this._getBulletFromPool.bind(this), this._returnBulletToPool.bind(this));
        this._collisionController = new CollisionController(this._getObject.bind(this), this._getExplosionFromPool.bind(this), this._returnExplosionToPool.bind(this));

        this._init();
        sound.muteAll();
    }

    private _init() {
        // create const objects base on matrix map
        map.forEach((val, idxX) => {
            val.forEach((value, idxY) => {
                const grass = new Sprite(AssetsLoader.getTexture(AppConstants.textureName.grass));
                grass.width = AppConstants.matrixSize,
                grass.height = AppConstants.matrixSize,
                // grass.anchor = 0.5;

                grass.position = { x: idxX * AppConstants.matrixSize, y: idxY * AppConstants.matrixSize };
                this.addChild(grass);
                grass.zIndex = 0;
                if (value === 1) {

                    // where ene can go

                }
                if (value === 0) {

                    // create tree con border of map
                    const tree = new Sprite(AssetsLoader.getTexture(AppConstants.textureName.tree));
                    tree.width = AppConstants.matrixSize,
                    tree.height = AppConstants.matrixSize;
                    // tree.anchor = 0.5;
                    tree.position = { x: idxX * AppConstants.matrixSize, y: idxY * AppConstants.matrixSize };
                    this.addChild(tree);
                }

                if (value === 3) {
                    this._nuclearBase = new AnimatedSprite(AssetsLoader.getTexture(AppConstants.textureName.nuclearBase).animations[AppConstants.textureName.nuclearBaseAnimation]);
                    // this._nuclearBase.anchor = 0.5;
                    this._nuclearBase.position = { x: idxX * AppConstants.matrixSize + AppConstants.matrixSize, y: idxY * AppConstants.matrixSize - AppConstants.matrixSize / 3 };
                    this._nuclearBase.width = AppConstants.matrixSize * 4;
                    this._nuclearBase.height = AppConstants.matrixSize * 4;
                    this._nuclearBase.zIndex = AppConstants.zIndex.nuclearBase;
                    this.addChild(this._nuclearBase);
                    this._nuclearBase.gotoAndStop(0);


                    // set target for collision
                    this._collisionController.nuclearPosition = this._nuclearBase.position;

                }

                if (value === 2) {
                    const towerBase = new Sprite(AssetsLoader.getTexture(AppConstants.textureName.towerBase));

                    // towerBase.anchor.set(0.5);
                    towerBase.position = { x: idxX * AppConstants.matrixSize, y: idxY * AppConstants.matrixSize };
                    towerBase.width = AppConstants.matrixSize;
                    towerBase.height = AppConstants.matrixSize;
                    towerBase.zIndex = AppConstants.zIndex.towerBase;
                    towerBase.alpha = AppConstants.imageAlpha.towerBase;


                    this._towerBase.push(towerBase);
                    this.addChild(towerBase);
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

    private _getObject(): {towers: Tower[], bullets: Bullet[], enemies: Enemies[], units: ControlUnit[]} {
        return { towers: this._towerController.towers, bullets: this._bulletController.bullets, enemies: this._enemiesController.enemies, units: this._towerController.units };
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.addChildToScene, (sprite: Sprite | AnimatedSprite | Graphics) => {
            this.addChild(sprite);
        });
        Emitter.on(AppConstants.event.removeChildFromScene, (sprite: Sprite | AnimatedSprite | Graphics) => {
            this.removeChild(sprite);
        });

        Emitter.on(AppConstants.event.gameStart, () => {
            this._startGame();
        });
    }

    // method to create enemies
    private _startGame() {
        // position spawn enemy game get on matrix map
        this._enemiesController.spawnWave(this._wave, { x: 15, y: 0 });
    }

    private _checkWave(dt: number) {
        if (this._enemiesController.enemies.length > 0) return;

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
            this._enemiesController.spawnWave(this._wave, { x: 15, y: 0 });
            // change texture of nuclear base
            this._nuclearBase.gotoAndStop(this._wave - 1);
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

    private _getEnemiesFromPool(): Enemies {
        return this._objectPool.getEnemies();
    }

    private _returnEnemiesToPool(ene: Enemies): void {
        this._objectPool.returnEnemies(ene);
    }

    private _getExplosionFromPool(explosionType: BulletType): AnimatedSprite {
        return this._objectPool.getExplosion(explosionType);
    }

    private _returnExplosionToPool(ex: AnimatedSprite, exType: BulletType) {
        this._objectPool.returnExplosion(ex, exType);
    }

    private _getUnitFromPool(unitType: UnitType): ControlUnit {
        return this._objectPool.getUnit(unitType);
    }

    private _returnUnitToPool(unit: ControlUnit) {
        this._objectPool.returnUnit(unit);
    }

    // update function
    public update(dt: number) {
        this._unit.forEach(unit => {
            unit.update(dt);
        });


        this._towerController.update(dt);
        this._bulletController.update(dt);
        this._collisionController.update();
        this._enemiesController.update(dt);

        this._checkWave(dt);
    }
}