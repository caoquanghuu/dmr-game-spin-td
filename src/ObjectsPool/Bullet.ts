import { BulletType } from '../Type';
import { BaseObject } from '../ObjectsPool/BaseObject';
import { BaseEngine } from '../MoveEngine/BaseEngine';
import { PointData } from 'pixi.js';
import { calculateAngleOfVector } from '../Util';

export class Bullet extends BaseObject {
    private _dame: number;
    private _bulletType: BulletType;
    private _target: PointData;
    private _isMoving: boolean = false;
    constructor(bulletType: BulletType) {
        super(bulletType);
        this._bulletType = bulletType;
        this.moveEngine = new BaseEngine(false);
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