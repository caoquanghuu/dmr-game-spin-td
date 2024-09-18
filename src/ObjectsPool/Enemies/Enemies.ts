import { BSFNextMove, Direction, EnemiesType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData } from 'pixi.js';

export class Enemies extends BaseObject {
    private _HP: number;
    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    private _bfsMoveEngine: BSFMoveEngine;
    private _isMoving: boolean = false;
    private _target: PointData;
    constructor() {
        super('tank-1');
        this._enemiesType = EnemiesType.TANK1;
        this.speed = 100;
        this.moveEngine = new BaseEngine(true);
        this._bfsMoveEngine = new BSFMoveEngine();
        this._getNextMove();

    }

    get HP(): number {
        return this._HP;
    }

    set HP(newHp: number) {
        this._HP = newHp;
    }

    get dameDeal(): number {
        return this._dameDeal;
    }

    set dameDeal(dame: number) {
        this._dameDeal = dame;
    }

    get enemiesType(): EnemiesType {
        return this._enemiesType;
    }

    set isMoving(isMoving: boolean) {
        this._isMoving = isMoving;
    }

    private _checkEnemyStage() {
        if (this._HP === 0) {
            // send info that this was die.
        }
    }

    private _moveByBsf(dt: number) {
        this.move(dt);
        switch (this.direction) {
            case Direction.DOWN:
                if (this.position.y >= this._target.y) this._getNextMove();
                this.image.angle = 180;
                break;
            case Direction.UP:
                if (this.position.y <= this._target.y) this._getNextMove();
                this.image.angle = 0;
                break;
            case Direction.RIGHT:
                if (this.position.x >= this._target.x) this._getNextMove();
                this.image.angle = 90;
                break;
            case Direction.LEFT:
                if (this.position.x <= this._target.x) this._getNextMove();
                this.image.angle = 270;
                break;
            default:
                break;
        }
    }

    private _getNextMove() {

        const nextMove: BSFNextMove = this._bfsMoveEngine.bsfNextMove;
        this.moveEngine.direction = nextMove.directions;

        this._target = nextMove.path;

    }


    public update(dt: number): void {
        if (!this._isMoving) return;
        this._moveByBsf(dt);
        this._checkEnemyStage();
    }
}