import { Container, Graphics, Sprite } from 'pixi.js';
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
import { BulletType, EnemiesType, TowerType } from '../../Type';
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

    public static mapMatrix: any;
    constructor() {
        super();
        GameMap.mapMatrix = map;
        this._useEventEffect();
        const graphics = new Graphics();
        graphics.rect (0, 0, AppConstants.mapSize.width, AppConstants.mapSize.height);
        graphics.fill('506147');
        this.addChild(graphics);
        this._objectPool = new ObjectPool();

        this._towerController = new TowerController(this._getTowerFromPool.bind(this), this._returnTowerToPool.bind(this));
        this._enemiesController = new EnemiesController(this._getEnemiesFromPool.bind(this), this._returnEnemiesToPool.bind(this));
        this._bulletController = new BulletController(this._getBulletFromPool.bind(this), this._returnBulletToPool.bind(this));
        this._collisionController = new CollisionController(this._getObject.bind(this));


        map.forEach((val, idxX) => {
            val.forEach((value, idxY) => {
                if (value === 1) {
                    const grass = new Sprite(AssetsLoader.getTexture('grass-1'));
                    grass.width = 32,
                    grass.height = 32,
                    grass.anchor = 0.5;
                    grass.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                    this.addChild(grass);
                }
                if (value === 0) {
                    const tree = new Sprite(AssetsLoader.getTexture('tree-1'));
                    tree.width = 32,
                    tree.height = 32;
                    tree.anchor.set(0.5);
                    this.addChild(tree);
                    tree.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                }

                if (value === 2) {
                    const towerBase = new Sprite(AssetsLoader.getTexture('tower-base'));
                    towerBase.anchor.set(0.5);
                    towerBase.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                    towerBase.width = 32;
                    towerBase.height = 32;

                    this._towerBase.push(towerBase);
                    this.addChild(towerBase);

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

        this._startGame();

        this._init();

    }

    private _init() {
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
        Emitter.on(AppConstants.event.addChildToScene, (sprite: Sprite) => {
            this.addChild(sprite);
        });
        Emitter.on(AppConstants.event.removeChildFromScene, (sprite: Sprite) => {
            this.removeChild(sprite);
        });
    }

    // method to create enemies
    private _startGame() {
        let y = -100;
        for (let i = 0; i < 10; i++) {
            Emitter.emit(AppConstants.event.createEnemy, { position: { x: 15 * 32, y: y }, enemyType: EnemiesType.tank_1 });
            y -= 100;
        }
    }

    private _spawnWave() {
        if (this._enemiesController.enemies.length === 0) this._startGame();
    }

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

    private _getEnemiesFromPool(eneType: EnemiesType): Enemies {
        return this._objectPool.getEnemies(eneType);
    }

    private _returnEnemiesToPool(ene: Enemies): void {
        this._objectPool.returnEnemies(ene);
    }
    public update(dt: number) {
        this._towers.forEach(tower => {
            tower.update(dt);
        });

        this._enemies.forEach(ene => {
            ene.update(dt);
        });

        this._towerController.update(dt);
        this._bulletController.update(dt);
        this._collisionController.update(dt);
        this._enemiesController.update(dt);

        this._spawnWave();

    }
}