import { Direction } from '../Type';

export class BaseEngine {
    private _direction: Direction | number;

    constructor(isMoveByEnumDirection: boolean) {
        if (isMoveByEnumDirection) {
            this._direction = Direction.STAND;
        } else {
            this._direction = 0;
        }
    }

    get direction(): Direction | number {
        return this._direction;
    }

    set direction(direction: Direction | number) {
        this._direction = direction;
    }
    public update(dt: number) {

    }
}