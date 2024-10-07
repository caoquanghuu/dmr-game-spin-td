import { BulletType, TowerType, FlyUnitType } from '../Type';
import { Bullet } from '../ObjectsPool/Bullet';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { CrystalMaiden } from '../ObjectsPool/Tower/CrystalMaiden';
import { Mirana } from '../ObjectsPool/Tower/Mirana';
import { Tinker } from '../ObjectsPool/Tower/Tinker';
import { ClockWerk } from '../ObjectsPool/Tower/ClockWerk';
import { Barack } from './Tower/Barack';
import { ControlUnit } from './ControlUnit/ControlUnit';

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

        const bullet = new Bullet(BulletType[type]);
        bullet.id = objectId;
        return bullet;

        // switch (type) {
        //     case BulletType.laser:
        //         const laserBullet = new Bullet(BulletType.laser);
        //         laserBullet.id = objectId;
        //         return laserBullet;

        //     case BulletType.rocket:
        //         const rocketBullet = new Bullet(BulletType.rocket);
        //         rocketBullet.id = objectId;
        //         return rocketBullet;
        //     case BulletType.ice:
        //         const iceBullet = new Bullet(BulletType.ice);
        //         iceBullet.id = objectId;
        //         return iceBullet;
        //     case BulletType.lightning:
        //         const lightningBullet = new Bullet(BulletType.lightning);
        //         lightningBullet.id = objectId;
        //         return lightningBullet;
        //     default:
        // }
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
            case TowerType.clockwerk:
                const clockwerk = new ClockWerk();
                clockwerk.id = objectId;
                return clockwerk;
            case TowerType.barack:
                const barack = new Barack();
                barack.id = objectId;
                return barack;
            default:
        }
    }

    public static createEnemies(): number {
        const objectId = Factory.objectId;
        Factory.objectId++;
        return objectId;
    }

    public static createUnit(type: FlyUnitType): ControlUnit {
        const unit = new ControlUnit(type, true);
        return unit;
    }
}