import { BulletType, EnemiesType, TowerType } from 'src/Type';
import { Bullet } from './Bullet';
import { Enemies } from './Enemies/Enemies';
import { Tower } from './Tower/Tower';
import { AppConstants } from 'src/GameScene/Constants';
import Factory from './Factory';

export class ObjectPool {
    public static inst: ObjectPool;
    private _bulletPool: {[bulletType: string]: Bullet[]} = {};
    private _enemiesPool: {[enemiesType: string]: Enemies[]} = {};
    private _towerPool: {[towerType: string]: Tower[]} = {};
    constructor() {
        ObjectPool.inst = this;
        //init bullet pool
        for (const [key, value] of Object.entries(BulletType)) {
            this._bulletPool[key] = [];

            for (let i = 0; i < AppConstants.bulletCount; i++) {
                const bullet = Factory.createBullet(value);
                this._bulletPool[key].push(bullet);
            }
        }

        // init enemies pool
        for (const [key, value] of Object.entries(EnemiesType)) {
            this._enemiesPool[key] = [];

            for (let i = 0; i < AppConstants.bulletCount; i++) {
                const enemies = Factory.createEnemies(value);
                this._enemiesPool[key].push(enemies);
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
    }
    public getBulletFromPool(bulletType: string): Bullet {
        if (this._bulletPool[bulletType]?.length <= 0) {
            const bullet = Factory.createBullet(bulletType);
            return bullet;
        } else {
            return this._bulletPool[bulletType].pop() as Bullet;
        }
    }
    public getTowerFromPool(towerType: string): Tower {
        if (this._towerPool[towerType]?.length <= 0) {
            const tower = Factory.createTower(towerType);
            return tower;
        } else {
            return this._towerPool[towerType].pop() as Tower;
        }
    }
    public getEnemies(enemiesType: string): Enemies {
        if (this._enemiesPool[enemiesType]?.length <= 0) {
            const enemies = Factory.createEnemies(enemiesType);
            return enemies;
        } else {
            return this._enemiesPool[enemiesType].pop() as Enemies;
        }
    }

    public returnBullet(bullet: Bullet): void {
        this._bulletPool[bullet.bulletType].push(bullet);
    }

    public returnTower(tower: Tower): void {
        this._towerPool[tower.towerType].push(tower);
    }

    public returnEnemies(enemies: Enemies): void {
        this._enemiesPool[enemies.enemiesType].push(enemies);
    }


}