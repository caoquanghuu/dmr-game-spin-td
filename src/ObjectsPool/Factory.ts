import { BulletType, EnemiesType, TowerType, UnitType } from '../Type';
import { Bullet } from '../ObjectsPool/Bullet';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { CrystalMaiden } from '../ObjectsPool/Tower/CrystalMaiden';
import { Mirana } from '../ObjectsPool/Tower/Mirana';
import { Tinker } from '../ObjectsPool/Tower/Tinker';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { ClockWerk } from '../ObjectsPool/Tower/ClockWerk';
import { Barack } from './Tower/Barack';
import { ControlUnit } from './ControlUnit/ControlUnit';
import { AppConstants } from '../GameScene/Constants';

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

    public static createEnemies(): Enemies {
        const objectId = Factory.objectId;
        Factory.objectId++;

        const enemies = new Enemies(EnemiesType.tank_1, AppConstants.matrixMapValue.nuclearBase);
        enemies.id = objectId;
        return enemies;

        // switch (type) {
        //     case EnemiesType.tank_1:
        //         const tank1 = new Enemies(EnemiesType.tank_1);
        //         tank1.id = objectId;
        //         return tank1;

        //     case EnemiesType.tank_2:
        //         const tank2 = new Enemies(EnemiesType.tank_2);
        //         tank2.id = objectId;
        //         return tank2;

        //     case EnemiesType.tank_3:
        //         const tank3 = new Enemies(EnemiesType.tank_3);
        //         tank3.id = objectId;
        //         return tank3;
        //     default:
        // }
    }

    public static createUnit(type: UnitType): ControlUnit {
        const unit = new ControlUnit(type, true);
        return unit;
    }
}