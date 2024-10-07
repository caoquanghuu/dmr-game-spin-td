import { BulletType, EnemiesType, GetMatrixMapFn, TowerType, FlyUnitType, SetMatrixMapFn } from '../Type';
import { Bullet } from '../ObjectsPool/Bullet';
import { Tank } from './Enemies/Tank';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { AppConstants } from '../GameScene/Constants';
import Factory from '../ObjectsPool/Factory';
import { AnimatedSprite } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';
import { ControlUnit } from './ControlUnit/ControlUnit';

export class ObjectPool {
    private _bulletPool: {[bulletType: string]: Bullet[]} = {};
    private _enemiesPool: Tank[] = [];
    private _towerPool: {[towerType: string]: Tower[]} = {};
    private _explosionPool: {[explosionType: string]: AnimatedSprite[]} = {};
    private _unitPool: {[unitType: string]: ControlUnit[]} = {};
    private _getMatrixMapCb: GetMatrixMapFn;
    private _setMatrixMapCb: SetMatrixMapFn;

    constructor(getMatrixMap: GetMatrixMapFn, setMatrixMapCb: SetMatrixMapFn) {
        this._getMatrixMapCb = getMatrixMap;
        this._setMatrixMapCb = setMatrixMapCb;
        //init bullet pool
        for (const [key, value] of Object.entries(BulletType)) {
            this._bulletPool[key] = [];
            this._explosionPool[key] = [];

            for (let i = 0; i < AppConstants.bulletCount; i++) {
                const bullet = Factory.createBullet(value);
                this._bulletPool[key].push(bullet);
                const explosion = new AnimatedSprite(AssetsLoader.getTexture(`${key}-explosion`).animations['explosion']);
                explosion.loop = false;
                explosion.anchor = 0.5;
                explosion.alpha = 20;
                explosion.zIndex = 7;
                this._explosionPool[key].push(explosion);
            }
        }

        // init tower pool
        for (const [key, value] of Object.entries(TowerType)) {
            this._towerPool[key] = [];
            for (let i = 0; i < AppConstants.bulletCount; i++) {
                const tower = Factory.createTower(value);
                this._towerPool[key].push(tower);
            }
        }

        for (const [key, value] of Object.entries(FlyUnitType)) {
            this._unitPool[key] = [];
            for (let i = 0; i < 5; i++) {
                const unit = Factory.createUnit(value);
                this._unitPool[key].push(unit);
            }
        }

        for (let i = 0; i < 10; i ++) {
            this._explosionPool['tank'] = [];
            const tankExplosion = new AnimatedSprite(AssetsLoader.getTexture('tank-explosion').animations['explosion']);
            tankExplosion.loop = false;
            tankExplosion.anchor = 0.5;
            tankExplosion.alpha = 20;
            tankExplosion.zIndex = 7;
            this._explosionPool['tank'].push(tankExplosion);

            const enemies = new Tank(EnemiesType.tank_1, AppConstants.matrixMapValue.nuclearBase, this._getMatrixMapCb.bind(this), this._setMatrixMapCb.bind(this));
            const eneId = Factory.createEnemies();
            enemies.id = eneId;

            this._enemiesPool.push(enemies);
        }


    }

    public getBulletFromPool(bulletType: BulletType): Bullet {
        if (this._bulletPool[bulletType]?.length <= 0) {

            const bullet = Factory.createBullet(bulletType);
            return bullet;
        } else {
            return this._bulletPool[bulletType].pop() as Bullet;
        }
    }
    public getTowerFromPool(towerType: TowerType): Tower {
        if (this._towerPool[towerType]?.length <= 0) {
            const tower = Factory.createTower(towerType);
            return tower;
        } else {

            return this._towerPool[towerType].pop() as Tower;
        }
    }
    public getEnemies(): Tank {
        if (this._enemiesPool.length <= 0) {
            const enemyId = Factory.createEnemies();
            const ene = new Tank(EnemiesType.tank_1, AppConstants.matrixMapValue.nuclearBase, this._getMatrixMapCb.bind(this), this._setMatrixMapCb.bind(this));
            ene.id = enemyId;
            return ene;
        } else {
            return this._enemiesPool.shift() as Tank;
        }
    }

    public getExplosion(explosionType: BulletType | string): AnimatedSprite {
        if (this._explosionPool[explosionType]?.length <= 0) {
            const explosion = new AnimatedSprite(AssetsLoader.getTexture(`${explosionType}-explosion`).animations['explosion']);
            explosion.loop = false;
            explosion.anchor = 0.5;
            explosion.alpha = 20;
            explosion.zIndex = 7;
            return explosion;
        } else {
            return this._explosionPool[explosionType].pop() as AnimatedSprite;
        }
    }

    public getUnit(unitType: FlyUnitType) {
        if (this._unitPool[unitType]?.length <= 0) {
            const unit = Factory.createUnit(unitType);
            return unit;
        } else {

            return this._unitPool[unitType].pop() as ControlUnit;
        }
    }

    public returnBullet(bullet: Bullet): void {
        this._bulletPool[bullet.bulletType].push(bullet);
    }

    public returnTower(tower: Tower): void {
        this._towerPool[tower.towerType].push(tower);
    }

    public returnEnemies(enemies: Tank): void {
        this._enemiesPool.push(enemies);
    }

    public returnExplosion(ex: AnimatedSprite, exType: BulletType) {
        this._explosionPool[exType].push(ex);
    }

    public returnUnit(unit: ControlUnit) {
        this._unitPool[unit._unitType].push(unit);
    }
}