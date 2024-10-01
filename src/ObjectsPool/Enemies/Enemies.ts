import { BSFNextMove, Direction, EnemiesType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData, Sprite } from 'pixi.js';
import Emitter from '../../Util';
import { AppConstants } from '../../GameScene/Constants';
import { AssetsLoader } from '../../AssetsLoader';

export class Enemies extends BaseObject {
    private _HP: {hpConst: number, hpCount: number} = { hpConst: 0, hpCount: 0 };
    private _hpBar: Sprite;
    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    private _bfsMoveEngine: BSFMoveEngine;
    private _isMoving: boolean = false;
    private _target: PointData;
    private _goldReward: number = 2;
    constructor(enemyType: EnemiesType) {
        super(enemyType);
        this._enemiesType = enemyType;
        this.image.width = AppConstants.matrixSize;
        this.image.height = AppConstants.matrixSize;
        this.moveEngine = new BaseEngine(true);
        this._bfsMoveEngine = new BSFMoveEngine();
        this._getNextMove();
        this._hpBar = new Sprite(AssetsLoader.getTexture('hp-bar-10'));
        this._hpBar.width = AppConstants.matrixSize;
        this._hpBar.height = AppConstants.matrixSize / 6;
        this._hpBar.anchor.set(0.5, 4);

    }

    get HP(): number {
        return this._HP.hpCount;
    }

    set HP(newHp: number) {
        this._HP.hpConst = newHp;
        this._HP.hpCount = newHp;
        this.reduceHp(0);
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

    get hpBar(): Sprite {
        return this._hpBar;
    }

    public resetMove(): void {
        this._bfsMoveEngine.reset();
        this._getNextMove();
    }

    public getUpdatedPosition(): PointData {
        return this.image.position;
    }

    public reduceHp(hpReDuce: number): void {
        this._HP.hpCount -= hpReDuce;

        const hpRate = Math.round(this._HP.hpCount / (this._HP.hpConst / 10));
        if (hpRate <= 0) {
            Emitter.emit(AppConstants.event.removeEnemy, this.id);
            return;
        }
        this._hpBar.texture = AssetsLoader.getTexture(`hp-bar-${hpRate}`);


    }

    private _moveByBsf(dt: number) {
        this.move(dt);
        switch (this.direction) {
            case Direction.DOWN:
                if (this.position.y - AppConstants.matrixSize / 2 >= this._target.y) this._getNextMove();
                this.image.angle = 180;
                break;
            case Direction.UP:
                if (this.position.y - AppConstants.matrixSize / 2 <= this._target.y) this._getNextMove();
                this.image.angle = 0;
                break;
            case Direction.RIGHT:
                if (this.position.x - AppConstants.matrixSize / 2 >= this._target.x) this._getNextMove();
                this.image.angle = 90;
                break;
            case Direction.LEFT:
                if (this.position.x - AppConstants.matrixSize / 2 <= this._target.x) this._getNextMove();
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
        this._hpBar.position = this.image.position;
    }
}