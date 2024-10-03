import { BulletType, Circle, EffectType } from '../Type';
import { BaseObject } from '../ObjectsPool/BaseObject';
import { BaseEngine } from '../MoveEngine/BaseEngine';
import { PointData } from 'pixi.js';
import Emitter, { calculateAngleOfVector, isCollision } from '../Util';
import { AppConstants } from '../GameScene/Constants';

export class Bullet extends BaseObject {
    private _dame: number;
    private _bulletType: BulletType;
    private _target: PointData;
    private _isMoving: boolean = false;
    private _effectType: EffectType;
    private _effectArena: number;

    constructor(bulletType: BulletType) {
        super(bulletType);
        this._bulletType = bulletType;
        this.moveEngine = new BaseEngine(false);
        this.image.width = AppConstants.matrixSize / 2;
        this.image.height = AppConstants.matrixSize;
        this.image.anchor = 0.5;
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
        return this._effectType;
    }

    set effectType(ef: EffectType) {
        this._effectType = ef;
    }

    get effectArena(): number {
        return this._effectArena;
    }

    set effectArena(ef: number) {
        this._effectArena = ef;
    }

    public destroy() {
        // send event to controller tell it remove this
        Emitter.emit(AppConstants.event.removeBullet, this.id);
    }

    // handle remove bullet in case target die before bullet reach
    private _checkBulletMove() {
        const c1: Circle = { position: this.target, radius: 3 };
        const c2: Circle = { position: this.position, radius: 3 };

        if (isCollision(c1, c2)) {
            this.destroy();
        }
    }

    private _updateDirection() {
        const newDirection = calculateAngleOfVector(this.image.position, this._target);
        this.image.angle = newDirection + 90;
        this.moveEngine.direction = newDirection;
    }

    public update(dt: number): void {
        if (!this._isMoving) return;

        this.move(dt);
        this._updateDirection();

        this._checkBulletMove();
    }
}