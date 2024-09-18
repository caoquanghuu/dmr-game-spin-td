import { BulletType, FireBulletOption, GetBulletFromPoolFn, ReturnBulletToPoolFn, TowerType } from '../Type';
import { Bullet } from '../ObjectsPool/Bullet';
import Emitter from 'src/Util';
import { AppConstants } from 'src/GameScene/Constants';


export class BulletController {
    private _bullets: Bullet[] = [];
    private _getBulletFromPool: GetBulletFromPoolFn;
    private _returnBulletToPool: ReturnBulletToPoolFn;

    constructor(getBulletFromPoolCB: GetBulletFromPoolFn, returnBulletFromPoolCB: ReturnBulletToPoolFn) {
        this._getBulletFromPool = getBulletFromPoolCB;
        this._returnBulletToPool = returnBulletFromPoolCB;

        this._useEventEffect();
    }

    get bullets(): Bullet[] {
        return this._bullets;
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.createBullet, (option: FireBulletOption) => {
            this._createBullet(option);
        });

        Emitter.on(AppConstants.event.removeBullet, (id: number) => {
            this._removeBullet(id);
        });
    }

    private _createBullet(option: FireBulletOption) {
        // define tower type will have their own bullet type
        const towerFiredType = option.towerType;

        let bullet: Bullet;
        switch (towerFiredType) {
            case TowerType.CRYSTAL_MAIDEN:
                bullet = this._getBulletFromPool(BulletType.ICE);
                bullet.dame = 0;
                break;
            case TowerType.TINKER:
                bullet = this._getBulletFromPool(BulletType.LASER);
                bullet.dame = option.dame;
                break;
            case TowerType.MIRANA:
                bullet = this._getBulletFromPool(BulletType.ROCKET);
                bullet.dame = option.dame;
            default:
                break;
        }

        // set property follow option
        bullet.speed = option.speed;
        bullet.position = option.position;
        bullet.target = option.target;

        this._bullets.push(bullet);

        // add bullet to game.
        Emitter.emit(AppConstants.event.addChildToScene, bullet.image);
        bullet.isMoving = true;
    }

    private _removeBullet(bulletId: number) {
        const i = this._bullets.findIndex(bullet => {
            bullet.id === bulletId;
        });

        const bullet = this.bullets[i];
        bullet.isMoving = false;
        this._returnBulletToPool(bullet);

        Emitter.emit(AppConstants.event.removeChildFromScene, bullet.image);

        this._bullets.splice(i, 1);
    }

    public update(dt: number) {
        this._bullets.forEach(bullet => {
            bullet.update(dt);
        });
    }
}