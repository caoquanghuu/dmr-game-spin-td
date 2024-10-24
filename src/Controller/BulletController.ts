import { BulletType, FireBulletOption, GetBulletFromPoolFn, ReturnBulletToPoolFn, TowerType } from '../Type';
import { Bullet } from '../ObjectsPool/Bullet';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';


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

    public reset() {
        const bulletIdList = this._bullets.map(bullet => bullet.id);
        bulletIdList.forEach(id => this._removeBullet(id));
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
            case TowerType.crystal_maiden:
                bullet = this._getBulletFromPool(BulletType.ice);
                bullet.dame = 0;


                break;
            case TowerType.tinker:
                bullet = this._getBulletFromPool(BulletType.laser);
                bullet.dame = option.dame;

                break;
            case TowerType.mirana:
                bullet = this._getBulletFromPool(BulletType.lightning);
                bullet.dame = option.dame;

                break;
            case TowerType.clockwerk:
                bullet = this._getBulletFromPool(BulletType.missile);
                bullet.dame = option.dame;

                break;
            default:
                break;
        }

        bullet.effectArena = AppConstants.bulletEffectArena[bullet.bulletType];


        // set property follow option
        bullet.speed = option.speed;
        bullet.position = { x: option.position.x, y: option.position.y };
        bullet.target = option.target;
        bullet.effectType = option.effectType;
        bullet.image.zIndex = AppConstants.zIndex.bullet;
        bullet.isEneBullet = option.isEneBullet;

        this._bullets.push(bullet);

        // add bullet to game.
        Emitter.emit(AppConstants.event.addChildToScene, bullet.image);
        bullet.isMoving = true;
    }

    private _removeBullet(bulletId: number) {
        const i = this._bullets.findIndex(bullet => {
            return bullet.id === bulletId;
        });

        const bullet = this.bullets[i];

        if (!bullet) return;

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