import { Container, Graphics, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import map from '../Map/mapMatrix.json';
import { Tinker } from '../../ObjectsPool/Tower/Tinker';
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

export class GameMap extends Container {
    private _towers: Tower[] = [];
    private _enemies: Enemies[] = [];
    private _bulletController: BulletController;
    private _collisionController: CollisionController;
    private _towerController: TowerController;
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
                    this.addChild(towerBase);

                    const rd = Math.random() * 10;
                    if (rd < 2) {
                        Emitter.emit(AppConstants.event.createTower, { position: { x: idxX * 32 + 16, y: idxY * 32 - 10 }, towerType: TowerType.tinker });
                    }

                }


            });
        });
        // this._towerController._createTower({ position: { x: 32 * 10, y: 32 * 10 }, towerType: TowerType.tinker });

        const ene = new Enemies(EnemiesType.tank_1);
        ene.position = { x: 15 * 32 + 16, y: -100 };
        ene.image.width = 32;
        ene.image.height = 32;
        ene.image.angle = 180;
        ene.HP = 10;
        this._enemies.push(ene);
        ene.isMoving = true;
        this.addChild(ene.image);

    }

    private _getObject(): {towers: Tower[], bullets: Bullet[], enemies: Enemies[]} {
        return { towers: this._towerController.towers, bullets: this._bulletController.bullets, enemies: this._enemies };
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.addChildToScene, (sprite: Sprite) => {
            this.addChild(sprite);
        });
        Emitter.on(AppConstants.event.removeChildFromScene, (sprite: Sprite) => {
            this.removeChild(sprite);
        });
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
    public update(dt) {
        this._towers.forEach(tower => {
            tower.update(dt);
        });

        this._enemies.forEach(ene => {
            ene.update(dt);
        });

        this._towerController.update(dt);
        this._bulletController.update(dt);
        this._collisionController.update(dt);
    }
}