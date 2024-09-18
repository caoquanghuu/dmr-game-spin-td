import { Direction } from '../Type';

export class BaseEngine {
    private _direction: Direction | number;
    private _isMoveByEnumDirection: boolean;

    constructor(isMoveByEnumDirection: boolean) {
        if (isMoveByEnumDirection) {
            this._direction = Direction.STAND;
        } else {
            this._direction = 0;
        }
        this._isMoveByEnumDirection = isMoveByEnumDirection;
    }

    get direction(): Direction | number {
        return this._direction;
    }

    get isMoveByEnumDirection(): boolean {
        return this._isMoveByEnumDirection;
    }

    set direction(direction: Direction | number) {
        this._direction = direction;
    }

}