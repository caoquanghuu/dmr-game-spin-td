import { BulletType, TowerType } from '../Type';
import { Bullet } from '../ObjectsPool/Bullet';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { AppConstants } from '../GameScene/Constants';
import Factory from '../ObjectsPool/Factory';
import { AnimatedSprite } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';

export class ObjectPool {
    public static inst: ObjectPool;
    private _bulletPool: {[bulletType: string]: Bullet[]} = {};
    private _enemiesPool: Enemies[] = [];
    private _towerPool: {[towerType: string]: Tower[]} = {};
    private _explosionAnimation: AnimatedSprite[] = [];
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

        // init enemies pool and explosion animation sprite
        for (let i = 0; i <= 10; i ++) {
            const ene = Factory.createEnemies();
            this._enemiesPool.push(ene);

            // init animation sprite
            const explosion = new AnimatedSprite(AssetsLoader.getTexture('explosion').animations['tile']);
            explosion.width = 50;
            explosion.height = 50;
            explosion.anchor = 0.5;
            explosion.loop = false;
            explosion.alpha = 20;
            explosion.zIndex = 7;
            this._explosionAnimation.push(explosion);
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
    public getEnemies(): Enemies {
        if (this._enemiesPool.length <= 0) {
            const enemies = Factory.createEnemies();
            return enemies;
        } else {
            return this._enemiesPool.pop() as Enemies;
        }
    }

    public getExplosion(): AnimatedSprite {
        if (this._explosionAnimation.length <= 0) {
            const explosion = new AnimatedSprite(AssetsLoader.getTexture('explosion').animations['tile ']);
            return explosion;
        } else {
            return this._explosionAnimation.pop() as AnimatedSprite;
        }
    }

    public returnBullet(bullet: Bullet): void {
        this._bulletPool[bullet.bulletType].push(bullet);
    }

    public returnTower(tower: Tower): void {
        this._towerPool[tower.towerType].push(tower);
    }

    public returnEnemies(enemies: Enemies): void {
        this._enemiesPool.push(enemies);
    }

    public returnExplosion(ex: AnimatedSprite) {
        this._explosionAnimation.push(ex);
    }


}