import { BulletType, EnemiesType, TowerType } from 'src/Type';
import { Bullet } from './Bullet';
import { AppConstants } from 'src/GameScene/Constants';
import { Tower } from './Tower/Tower';
import { CrystalMaiden } from './Tower/CrystalMaiden';
import { Mirana } from './Tower/Mirana';
import { Tinker } from './Tower/Tinker';
import { Enemies } from './Enemies/Enemies';

export default class Factory {
    public static instance: Factory;
    public static objectId: number = 0;
    constructor() {
        Factory.instance = this; // Singleton
    }
    // Factory Pattern
    public static createBullet(type: string): Bullet {
        const objectId = Factory.objectId;
        Factory.objectId++;

        switch (type) {
            case BulletType.LASER:
                const laserBullet = new Bullet(BulletType.LASER);
                laserBullet.id = objectId;
                return laserBullet;

            case BulletType.ROCKET:
                const rocketBullet = new Bullet(BulletType.ROCKET);
                rocketBullet.id = objectId;
                return rocketBullet;

            default:
        }
    }

    public static createTower(type: string): Tower {
        const objectId = Factory.objectId;
        Factory.objectId++;

        switch (type) {
            case TowerType.CRYSTAL_MAIDEN:
                const CM = new CrystalMaiden();
                CM.id = objectId;
                return CM;

            case TowerType.MIRANA:
                const mirana = new Mirana();
                mirana.id = objectId;
                return mirana;

            case TowerType.TINKER:
                const tinker = new Tinker();
                tinker.id = objectId;
                return tinker;

            default:
        }
    }

    public static createEnemies(type: string): Enemies {
        const objectId = Factory.objectId;
        Factory.objectId++;

        switch (type) {
            case EnemiesType.TANK1:
                const tank1 = new Enemies(EnemiesType.TANK1);
                tank1.id = objectId;
                return tank1;

            case EnemiesType.TANK2:
                const tank2 = new Enemies(EnemiesType.TANK2);
                tank2.id = objectId;
                return tank2;

            case EnemiesType.TANK3:
                const tank3 = new Enemies(EnemiesType.TANK3);
                tank3.id = objectId;
                return tank3;
            default:
        }
    }
}