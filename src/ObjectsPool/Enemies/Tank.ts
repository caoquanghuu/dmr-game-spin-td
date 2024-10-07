import { BSFNextMove, Direction, EnemiesType, FireBulletOption, FireTime, GetMatrixMapFn, SetMatrixMapFn, TowerType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData, Sprite } from 'pixi.js';
import Emitter from '../../Util';
import { AppConstants } from '../../GameScene/Constants';
import { AssetsLoader } from '../../AssetsLoader';

export class Tank extends BaseObject {
    private _HP: {hpConst: number, hpCount: number} = { hpConst: 0, hpCount: 0 };
    private _hpBar: Sprite;
    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    private _bfsMoveEngine: BSFMoveEngine;
    private _isMoving: boolean = false;
    private _positionChangeDirection: PointData = { x: 0, y: 0 };
    private _goldReward: number = 2;
    private _fireRadius: number = 100;
    public fireTimeCd: FireTime= { fireTimeConst: 3000, fireTimeCount: 0 };
    private _forceChangeDirectionCd: {changeTimeConst: number, changeTimeCount: number} = { changeTimeConst: 500, changeTimeCount: 0 };
    public isPauseMove: boolean = false;
    public isEne: boolean = true;
    public isFire: boolean = false;

    private _targetValue: number;
    private _matrixValue: number = 4;

    private _getMatrixMapCb: GetMatrixMapFn;
    private _setMatrixMapCb: SetMatrixMapFn;

    public g1: Sprite;
    public g2: Sprite;

    constructor(enemyType: EnemiesType, targetValue: number, getMatrixMapCb: GetMatrixMapFn, setMatrixMapCb: SetMatrixMapFn) {
        super(enemyType);
        this._getMatrixMapCb = getMatrixMapCb;
        this._setMatrixMapCb = setMatrixMapCb;

        this._enemiesType = enemyType;
        this.image.width = AppConstants.matrixSize;
        this.image.height = AppConstants.matrixSize ;

        this.moveEngine = new BaseEngine(true);
        this._bfsMoveEngine = new BSFMoveEngine(this.getMatrixPosition.bind(this), targetValue, this._getMatrixMapCb.bind(this));
        this._targetValue = targetValue;

        this.image.anchor = 0.5;
        this._hpBar = new Sprite(AssetsLoader.getTexture('hp-bar-10'));
        this._hpBar.scale.set(0.3, 0.2);
        this._hpBar.anchor.set(0.5, 4);


        this.g1 = new Sprite(AssetsLoader.getTexture('grass-1'));
        this.g1.width = AppConstants.matrixSize;
        this.g1.height = AppConstants.matrixSize;
        this.g1.anchor = 0.5;
        this.g1.tint = 'red';
        this.g2 = new Sprite(AssetsLoader.getTexture('grass-1'));
        this.g2.width = AppConstants.matrixSize;
        this.g2.height = AppConstants.matrixSize;
        this.g2.anchor = 0.5;
        this.g2.tint = 'blue';

    }

    get targetValue(): number {
        return this._targetValue;
    }

    set targetValue(val: number) {
        this._targetValue = val;
        this._bfsMoveEngine.targetValue = val;
    }

    get matrixValue(): number {
        return this._matrixValue;
    }

    set matrixValue(val: number) {
        this._matrixValue = val;
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

    get fireRadius(): number {
        return this._fireRadius;
    }

    set fireRadius(rad: number) {
        this._fireRadius = rad;
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

    get bfsMoveEngine(): BSFMoveEngine {
        return this._bfsMoveEngine;
    }

    get nextPosition(): PointData {
        return { x: this._positionChangeDirection.x / AppConstants.matrixSize, y: this._positionChangeDirection.y / AppConstants.matrixSize };
    }

    public getMatrixPosition(): PointData {
        const matrixPosition: PointData = { x: Math.round((this.position.x - AppConstants.matrixSize / 2) / AppConstants.matrixSize), y: Math.round((this.position.y - AppConstants.matrixSize / 2) / AppConstants.matrixSize) };
        return matrixPosition;
    }


    public startMove() {
        this._bfsMoveEngine.update();
        this.getNextMove();
        this._isMoving = true;
    }

    public reset() {
        this.moveEngine.direction = Direction.STAND;
        this._isMoving = false;
    }

    public getUpdatedPosition(): PointData {
        return this.image.position;
    }

    public fire(target: PointData): boolean {

        if (this.fireTimeCd.fireTimeCount < this.fireTimeCd.fireTimeConst) return false;
        this._isMoving = false;
        const option: FireBulletOption = { position: this.position, target: target, dame: this.dameDeal, speed: this.speed * 3, isEneBullet: this.isEne, towerType: TowerType.tinker };

        Emitter.emit(AppConstants.event.createBullet, option);
        this.fireTimeCd.fireTimeCount = 0;

        return true;
    }

    public reduceHp(hpReDuce: number): void {
        this._HP.hpCount -= hpReDuce;

        const hpRate = Math.round(this._HP.hpCount / (this._HP.hpConst / 10));
        if (hpRate <= 0) {
            Emitter.emit(AppConstants.event.removeEnemy, { id: this.id, isEne: this.isEne });
            return;
        }
        this._hpBar.texture = AssetsLoader.getTexture(`hp-bar-${hpRate}`);


    }

    private _moveByBsf(dt: number) {
        this.move(dt);

        switch (this.direction) {
            case Direction.DOWN:
                if (this.position.y - AppConstants.matrixSize / 2 >= this._positionChangeDirection.y) this.getNextMove();

                this.image.angle = 180;
                break;
            case Direction.UP:
                if (this.position.y - AppConstants.matrixSize / 2 <= this._positionChangeDirection.y) this.getNextMove();
                this.image.angle = 0;
                break;
            case Direction.RIGHT:
                if (this.position.x - AppConstants.matrixSize / 2 >= this._positionChangeDirection.x) this.getNextMove();
                this.image.angle = 90;
                break;
            case Direction.LEFT:
                if (this.position.x - AppConstants.matrixSize / 2 <= this._positionChangeDirection.x) this.getNextMove();
                this.image.angle = 270;
                break;
            case Direction.UP_LEFT:
                if ((this.position.x - AppConstants.matrixSize / 2 <= this._positionChangeDirection.x) && (this.position.y - AppConstants.matrixSize / 2 <= this._positionChangeDirection.y)) this.getNextMove();
                this.image.angle = -45;
                break;
            case Direction.UP_RIGHT:
                if ((this.position.x - AppConstants.matrixSize / 2 >= this._positionChangeDirection.x) && (this.position.y - AppConstants.matrixSize / 2 <= this._positionChangeDirection.y)) this.getNextMove();
                this.image.angle = 45;
                break;
            case Direction.DOWN_LEFT:
                if ((this.position.x - AppConstants.matrixSize / 2 <= this._positionChangeDirection.x) && (this.position.y - AppConstants.matrixSize / 2 >= this._positionChangeDirection.y)) this.getNextMove();
                this.image.angle = 225;
                break;
            case Direction.DOWN_RIGHT:
                if ((this.position.x - AppConstants.matrixSize / 2 >= this._positionChangeDirection.x) && (this.position.y - AppConstants.matrixSize / 2 >= this._positionChangeDirection.y)) this.getNextMove();
                this.image.angle = 135;
                break;
            default:
                break;
        }


    }

    public getNextMove() {

        const nextMove: BSFNextMove = this._bfsMoveEngine.bsfNextMove;
        if (nextMove === undefined) {
            this.moveEngine.direction = Direction.STAND;
            this.isPauseMove = true;
            return;
        }

        let nextPositionChangeDirection: PointData;
        let nextDirection: Direction;

        if (this._getMatrixMapCb()[nextMove.path.x][nextMove.path.y] === this.matrixValue) {
            switch (nextMove.directions) {
                case Direction.UP:
                    if (this._getMatrixMapCb()[nextMove.path.x - 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 1][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 2][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x - 1, y: nextMove.path.y };
                        nextDirection = Direction.UP_LEFT;

                        break;
                    } else if (this._getMatrixMapCb()[nextMove.path.x + 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 1][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 2][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x + 1, y: nextMove.path.y };
                        nextDirection = Direction.UP_RIGHT;

                        break;
                    }
                case Direction.LEFT:
                    if (this._getMatrixMapCb()[nextMove.path.x][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 2][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y - 1 };
                        nextDirection = Direction.UP_LEFT;

                        break;
                    } else if (this._getMatrixMapCb()[nextMove.path.x][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 1][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 2][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y + 1 };
                        nextDirection = Direction.DOWN_LEFT;

                        break;
                    }
                case Direction.DOWN:
                    if (this._getMatrixMapCb()[nextMove.path.x - 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 1][nextMove.path.y - 2] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x - 1, y:nextMove.path.y };
                        nextDirection = Direction.DOWN_LEFT;

                        break;
                    } else if (this._getMatrixMapCb()[nextMove.path.x + 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x + 1][nextMove.path.y - 2 ] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x + 1, y: nextMove.path.y };
                        nextDirection = Direction.DOWN_RIGHT;

                        break;
                    }
                case Direction.RIGHT:
                    if (this._getMatrixMapCb()[nextMove.path.x][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 2][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y - 1 };
                        nextDirection = Direction.UP_RIGHT;

                        break;
                    } else if (this._getMatrixMapCb()[nextMove.path.x][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 1][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        this._getMatrixMapCb()[nextMove.path.x - 2][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y + 1 };
                        nextDirection = Direction.DOWN_RIGHT;

                        break;
                    }

                default:
                    nextDirection = Direction.STAND;
                    break;
            }
        } else if (this._getMatrixMapCb()[nextMove.path.x][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay) {
            nextDirection = nextMove.directions;
            nextPositionChangeDirection = nextMove.path;

        } else {
            nextDirection === Direction.STAND;
        }

        if (nextDirection != Direction.STAND && nextPositionChangeDirection) {

            this.moveEngine.direction = nextDirection;

            this._positionChangeDirection = { x: nextPositionChangeDirection.x * AppConstants.matrixSize, y: nextPositionChangeDirection.y * AppConstants.matrixSize };


            this.isPauseMove = false;

        } else if (nextDirection === Direction.STAND) {
            this.moveEngine.direction = Direction.STAND;
            this.isPauseMove = true;
        }


    }


    public update(dt: number): PointData {
        if (this.isPauseMove) {
            this._forceChangeDirectionCd.changeTimeCount += dt;
            if (this._forceChangeDirectionCd.changeTimeCount >= this._forceChangeDirectionCd.changeTimeConst) {
                this.getNextMove();
                this._forceChangeDirectionCd.changeTimeCount = 0;
            }

        }
        this.fireTimeCd.fireTimeCount += dt;
        this._bfsMoveEngine.update();
        if (this._isMoving) {
            this._moveByBsf(dt);
            this._hpBar.position = this.image.position;
        }
        return this.getMatrixPosition() ;

    }
}