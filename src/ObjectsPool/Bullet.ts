import { BulletType, EffectType } from '../Type';
import { BaseObject } from '../ObjectsPool/BaseObject';
import { BaseEngine } from '../MoveEngine/BaseEngine';
import { PointData } from 'pixi.js';
import Emitter, { calculateAngleOfVector } from '../Util';
import { AppConstants } from '../GameScene/Constants';

export class Bullet extends BaseObject {
    private _dame: number;
    private _bulletType: BulletType;
    private _target: PointData;
    private _isMoving: boolean = false;
    private _effectType: EffectType;

    constructor(bulletType: BulletType) {
        super(bulletType);
        this._bulletType = bulletType;
        this.moveEngine = new BaseEngine(false);
        this.image.width = 16;
        this.image.height = 64;
    }

    get dame(): number {
        return this._dame;
    }

    set dame(dame: number) {
        this._dame = dame;
    }

    get bulletType(): BulletType {
        return this._bulletType;
    }

    get isMoving(): boolean {
        return this._isMoving;
    }

    set isMoving(isMv: boolean) {
        this._isMoving = isMv;
    }

    get target(): PointData {
        return this._target;
    }

    set target(target: PointData) {
        this._target = target;
    }

    get effectType(): EffectType {
        return this.effectType;
    }

    set effectType(ef: EffectType) {
        this._effectType = ef;
    }

    public destroy() {
        // send event to controller tell it remove this
        Emitter.emit(AppConstants.event.destroyBullet, this.id);
    }

    private _updateDirection() {
        const newDirection = calculateAngleOfVector(this.position, this._target);
        this.image.angle = newDirection;
        this.direction = newDirection;
    }

    public update(dt: number): void {
        if (!this._isMoving) return;
        this._updateDirection();
        this.move(dt);
    }
}