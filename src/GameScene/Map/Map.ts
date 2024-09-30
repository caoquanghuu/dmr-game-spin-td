import { AnimatedSprite, Container, Graphics, Sprite } from 'pixi.js';
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
import { BulletType, TowerType } from '../../Type';
import Emitter from '../../Util';
import { EnemiesController } from '../../Controller/EnemiesController';

export class GameMap extends Container {
    private _towers: Tower[] = [];
    private _towerBase: Sprite[] = [];
    private _enemies: Enemies[] = [];
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
        GameMap.mapMatrix = map;

        // assign event emitter
        this._useEventEffect();

        // drawn basic graphics to know position of objects
        const graphics = new Graphics();
        graphics.rect (0, 0, AppConstants.mapSize.width, AppConstants.mapSize.height);
        graphics.fill('506147');
        this.addChild(graphics);

        // create pool
        this._objectPool = new ObjectPool();

        // create controllers
        this._towerController = new TowerController(this._getTowerFromPool.bind(this), this._returnTowerToPool.bind(this));
        this._enemiesController = new EnemiesController(this._getEnemiesFromPool.bind(this), this._returnEnemiesToPool.bind(this));
        this._bulletController = new BulletController(this._getBulletFromPool.bind(this), this._returnBulletToPool.bind(this));
        this._collisionController = new CollisionController(this._getObject.bind(this), this._getExplosionFromPool.bind(this), this._returnExplosionToPool.bind(this));

        this._init();

        this._startGame();


    }

    private _init() {
        // create const objects base on matrix map
        map.forEach((val, idxX) => {
            val.forEach((value, idxY) => {
                if (value === 1) {

                    // create grass on map
                    const grass = new Sprite(AssetsLoader.getTexture('grass-1'));
                    grass.width = 32,
                    grass.height = 32,
                    grass.anchor = 0.5;
                    grass.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                    this.addChild(grass);
                    grass.zIndex = 1;
                }
                if (value === 0) {

                    // create tree con border of map
                    const tree = new Sprite(AssetsLoader.getTexture('tree-1'));
                    tree.width = 32,
                    tree.height = 32;
                    tree.anchor.set(0.5);
                    this.addChild(tree);
                    tree.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                }

                if (value === 3) {
                    this._nuclearBase = new AnimatedSprite(AssetsLoader.getTexture('nuclear-base').animations['building']);
                    this._nuclearBase.anchor = 0.5;
                    this._nuclearBase.position = { x: idxX * 32 + 32, y: idxY * 32 - 8 };
                    this._nuclearBase.width = 150;
                    this._nuclearBase.height = 150;
                    this._nuclearBase.animationSpeed = 0.1;
                    this._nuclearBase.zIndex = 2;
                    this._nuclearBase.loop = false;
                    this.addChild(this._nuclearBase);
                    this._nuclearBase.gotoAndStop(0);
                    // this._nuclearBase.onComplete = () => {
                    //     this._nuclearBase.gotoAndStop(15);
                    // };

                    // set target for collision
                    this._collisionController.nuclearPosition = this._nuclearBase.position;

                }

                if (value === 2) {
                    const towerBase = new Sprite(AssetsLoader.getTexture('tower-base'));
                    towerBase.anchor.set(0.5);
                    towerBase.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                    towerBase.width = 32;
                    towerBase.height = 32;
                    towerBase.zIndex = 3;

                    this._towerBase.push(towerBase);
                    this.addChild(towerBase);

                    // test space for create multi tower to debug
                    const rd = Math.random() * 10;
                    if (rd < 2) {
                        const rd = Math.random() * 10;
                        if (rd < 5) {
                            // Emitter.emit(AppConstants.event.createTower, { position: { x: idxX * 32 + 16, y: idxY * 32 - 10 }, towerType: TowerType.tinker });
                        } else {
                            // Emitter.emit(AppConstants.event.createTower, { position: { x: idxX * 32 + 16, y: idxY * 32 - 10 }, towerType: TowerType.clockwerk });
                        }

                    }

                }


            });
        });

        // set event for tower base, end event to ui controller display build tower option
        this._towerBase.forEach(base => {
            base.eventMode = 'static';
            base.cursor = 'pointer';
            base.on('pointerdown', () => {
                Emitter.emit(AppConstants.event.selectTowerBase, base);
            });
        });
    }

    private _getObject(): {towers: Tower[], bullets: Bullet[], enemies: Enemies[]} {
        return { towers: this._towerController.towers, bullets: this._bulletController.bullets, enemies: this._enemiesController.enemies };
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
    private _startGame() {
        this._enemiesController.spawnWave(this._wave, { x: 15 * 32, y: -100 });
    }

    private _checkWave(dt: number) {
        if (this._enemiesController.enemies.length > 0) return;

        this._time += dt;
        if (this._time >= 5000) {
            this._wave += 1;
            // send event to ui basic board display new wave
            Emitter.emit(AppConstants.event.displayWave, this._wave);
            this._enemiesController.spawnWave(this._wave, { x: 15 * 32, y: -100 });
            // change texture of nuclear base
            this._nuclearBase.gotoAndStop(this._wave - 1);
            this._time = 0;
        }

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

    private _getExplosionFromPool(): AnimatedSprite {
        return this._objectPool.getExplosion();
    }

    private _returnExplosionToPool(ex: AnimatedSprite) {
        this._objectPool.returnExplosion(ex);
    }

    // update function
    public update(dt: number) {
        this._towers.forEach(tower => {
            tower.update(dt);
        });

        this._enemies.forEach(ene => {
            ene.update(dt);
        });

        this._towerController.update(dt);
        this._bulletController.update(dt);
        this._collisionController.update();
        this._enemiesController.update(dt);

        this._checkWave(dt);
    }
}