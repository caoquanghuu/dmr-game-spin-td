import { BSFNextMove, Direction, EnemiesType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData } from 'pixi.js';
import Emitter from '../../Util';
import { AppConstants } from '../../GameScene/Constants';

export class Enemies extends BaseObject {
    private _HP: number;
    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    private _bfsMoveEngine: BSFMoveEngine;
    private _isMoving: boolean = false;
    private _target: PointData;
    private _goldReward: number = 10;
    constructor(enemyType: EnemiesType) {
        super(enemyType);
        this._enemiesType = enemyType;
        this.speed = 100;
        this.image.width = 32;
        this.image.height = 32;
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

    get goldReward(): number {
        return this._goldReward;
    }

    set goldReward(gold: number) {
        this._goldReward = gold;
    }

    public resetMove() {
        this._bfsMoveEngine.reset();
        this._getNextMove();
    }

    public getUpdatedPosition(): PointData {
        return this.image.position;
    }

    private _checkEnemyStage() {
        if (this._HP <= 0) {
            Emitter.emit(AppConstants.event.removeEnemy, this.id);
        }
    }

    private _moveByBsf(dt: number) {
        this.move(dt);
        switch (this.direction) {
            case Direction.DOWN:
                if (this.position.y - 16 >= this._target.y) this._getNextMove();
                this.image.angle = 180;
                break;
            case Direction.UP:
                if (this.position.y - 16 <= this._target.y) this._getNextMove();
                this.image.angle = 0;
                break;
            case Direction.RIGHT:
                if (this.position.x - 16 >= this._target.x) this._getNextMove();
                this.image.angle = 90;
                break;
            case Direction.LEFT:
                if (this.position.x - 16 <= this._target.x) this._getNextMove();
                this.image.angle = 270;
                break;
            default:
                break;
        }
    }

    private _getNextMove() {

        const nextMove: BSFNextMove = this._bfsMoveEngine.bsfNextMove;
        if (nextMove === undefined) {
            this.isMoving = false;
            return;
        }
        this.moveEngine.direction = nextMove.directions;

        this._target = nextMove.path;

    }


    public update(dt: number): void {
        if (!this._isMoving) return;
        this._moveByBsf(dt);
        this._checkEnemyStage();
    }
}