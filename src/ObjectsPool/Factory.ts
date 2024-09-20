import { BulletType, EnemiesType, TowerType } from '../Type';
import { Bullet } from '../ObjectsPool/Bullet';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { CrystalMaiden } from '../ObjectsPool/Tower/CrystalMaiden';
import { Mirana } from '../ObjectsPool/Tower/Mirana';
import { Tinker } from '../ObjectsPool/Tower/Tinker';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';

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
            case BulletType.laser:
                const laserBullet = new Bullet(BulletType.laser);
                laserBullet.id = objectId;
                return laserBullet;

            case BulletType.rocket:
                const rocketBullet = new Bullet(BulletType.rocket);
                rocketBullet.id = objectId;
                return rocketBullet;
            case BulletType.ice:
                const iceBullet = new Bullet(BulletType.ice);
                iceBullet.id = objectId;
                return iceBullet;
            case BulletType.lightning:
                const lightningBullet = new Bullet(BulletType.lightning);
                lightningBullet.id = objectId;
                return lightningBullet;
            default:
        }
    }

    public static createTower(type: TowerType): Tower {
        const objectId = Factory.objectId;
        Factory.objectId++;

        switch (type) {
            case TowerType.crystal_maiden:
                const CM = new CrystalMaiden();
                CM.id = objectId;
                return CM;

            case TowerType.mirana:
                const mirana = new Mirana();
                mirana.id = objectId;
                return mirana;

            case TowerType.tinker:
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
            case EnemiesType.tank_1:
                const tank1 = new Enemies(EnemiesType.tank_1);
                tank1.id = objectId;
                return tank1;

            case EnemiesType.tank_2:
                const tank2 = new Enemies(EnemiesType.tank_2);
                tank2.id = objectId;
                return tank2;

            case EnemiesType.tank_3:
                const tank3 = new Enemies(EnemiesType.tank_3);
                tank3.id = objectId;
                return tank3;
            default:
        }
    }
}