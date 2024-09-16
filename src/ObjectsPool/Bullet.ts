import { BulletType } from '../Type';
import { BaseObject } from '../ObjectsPool/BaseObject';
import { BaseEngine } from '../MoveEngine/BaseEngine';

export class Bullet extends BaseObject {
    private _dame: number;
    private _bulletType: BulletType;
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
    private _changeDirectionOnMove() {
        this.image.angle = this.moveEngine.direction;
    }
    public update(dt: number): void {
        this.move(dt);
        this._changeDirectionOnMove();
    }
}