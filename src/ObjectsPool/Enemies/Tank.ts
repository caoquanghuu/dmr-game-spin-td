import { BSFNextMove, Direction, EnemiesType, FireBulletOption, FireTime, GetMatrixMapFn, SetMatrixMapFn, TowerType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData } from 'pixi.js';
import Emitter from '../../Util';
import { AppConstants } from '../../GameScene/Constants';

export class Tank extends BaseObject {

    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    private _bfsMoveEngine: BSFMoveEngine;
    private _isMoving: boolean = false;
    private _positionChangeDirection: PointData = { x: 0, y: 0 };
    private _goldReward: number = 2;
    private _fireRadius: number = 30;
    public fireTimeCd: FireTime= { fireTimeConst: 3000, fireTimeCount: 0 };
    private _forceChangeDirectionCd: {changeTimeConst: number, changeTimeCount: number} = { changeTimeConst: 500, changeTimeCount: 0 };
    public isPauseMove: boolean = false;

    private _targetPosition: PointData;
    private _targetID: number;

    private _targetValue: number;
    private _matrixValue: number = 4;

    private _getMatrixMapCb: GetMatrixMapFn;
    private _setMatrixMapCb: SetMatrixMapFn;

    // for debug enemies move
    // public g1: Sprite;
    // public g2: Sprite;

    constructor(enemyType: EnemiesType, targetValue: number, getMatrixMapCb: GetMatrixMapFn, setMatrixMapCb: SetMatrixMapFn) {
        super(enemyType);
        this._getMatrixMapCb = getMatrixMapCb;
        this._setMatrixMapCb = setMatrixMapCb;
        this._useEventEffect();

        this._enemiesType = enemyType;
        this.image.width = AppConstants.matrixSize * 0.7;
        this.image.height = AppConstants.matrixSize * 0.7;

        this.moveEngine = new BaseEngine(true);
        this._bfsMoveEngine = new BSFMoveEngine(this.getMatrixPosition.bind(this), targetValue, this._getMatrixMapCb.bind(this));
        this._targetValue = targetValue;

        this.image.anchor = 0.5;


        // this for debug ene next move
        // this.g1 = new Sprite(AssetsLoader.getTexture('grass-1'));
        // this.g1.width = AppConstants.matrixSize;
        // this.g1.height = AppConstants.matrixSize;
        // this.g1.anchor = 0.5;
        // this.g1.tint = 'red';
        // this.g2 = new Sprite(AssetsLoader.getTexture('grass-1'));
        // this.g2.width = AppConstants.matrixSize;
        // this.g2.height = AppConstants.matrixSize;
        // this.g2.anchor = 0.5;
        // this.g2.tint = 'blue';

    }

    get targetPosition(): PointData {
        return this._targetPosition;
    }

    get targetId(): number {
        return this._targetID;
    }

    set targetPosition(tar: PointData) {
        this._targetPosition = tar;
    }

    set targetId(id: number) {
        this._targetID = id;
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
        this.isDead = false;
    }

    public reset() {
        this.moveEngine.direction = Direction.STAND;
        this._isMoving = false;
        this._targetID = undefined;
        this._targetPosition = undefined;
    }

    public getUpdatedPosition(): PointData {
        return this.image.position;
    }

    public fire() {
        if (!this._targetID && !this._targetPosition) {
            this.isMoving = true;
            return;
        }
        this._isMoving = false;
        if (this.fireTimeCd.fireTimeCount < this.fireTimeCd.fireTimeConst) return;

        const option: FireBulletOption = { position: this.position, target: this._targetPosition, dame: this.dameDeal, speed: this.speed * 3, isEneBullet: this.isEne, towerType: TowerType.tinker };
        Emitter.emit(AppConstants.event.createBullet, option);
        this.fireTimeCd.fireTimeCount = 0;

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

    public getNextMove(): boolean {

        const nextMove: BSFNextMove = this._bfsMoveEngine.bsfNextMove;
        if (nextMove === undefined) {
            this.moveEngine.direction = Direction.STAND;
            this.isPauseMove = true;
            return false;
        }

        let nextPositionChangeDirection: PointData;
        let nextDirection: Direction;

        if (this._getMatrixMapCb()[nextMove.path.x][nextMove.path.y] != AppConstants.matrixMapValue.availableMoveWay) {
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

    private _useEventEffect() {
        Emitter.on(AppConstants.event.removeEnemy, (info: {id: number, isEne: boolean}) => {
            if (this.targetId === info.id) {
                this._targetPosition = null;
                this._targetID = null;
            }
        });
    }


    public update(dt: number) {
        if (this.isPauseMove) {
            this._forceChangeDirectionCd.changeTimeCount += dt;
            if (this._forceChangeDirectionCd.changeTimeCount >= this._forceChangeDirectionCd.changeTimeConst) {
                this.getNextMove();
                this._forceChangeDirectionCd.changeTimeCount = 0;
            }

        }

        this.fire();
        this.fireTimeCd.fireTimeCount += dt;
        this._bfsMoveEngine.update();
        if (this._isMoving) {
            this._moveByBsf(dt);
            this.hpBar.position = this.image.position;
        }

    }
}