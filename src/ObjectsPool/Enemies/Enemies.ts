import { BSFNextMove, Direction, EnemiesType, FireBulletOption, FireTime, TowerType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData, Sprite } from 'pixi.js';
import Emitter from '../../Util';
import { AppConstants } from '../../GameScene/Constants';
import { AssetsLoader } from '../../AssetsLoader';
import { GameMap } from '../../GameScene/Map/Map';

export class Enemies extends BaseObject {
    private _HP: {hpConst: number, hpCount: number} = { hpConst: 0, hpCount: 0 };
    private _hpBar: Sprite;
    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    private _bfsMoveEngine: BSFMoveEngine;
    private _isMoving: boolean = false;
    private _positionChangeDirection: PointData;
    private _goldReward: number = 2;
    private _fireRadius: number = 100;
    public fireTimeCd: FireTime= { fireTimeConst: 3000, fireTimeCount: 0 };
    private _lastMatrix: PointData = { x: 0, y: 0 };
    private _isPauseMove: boolean = false;
    readonly isEneBullet: boolean = true;

    private _targetValue: number;
    private _matrixValue: number = 4;

    constructor(enemyType: EnemiesType, targetValue: number) {
        super(enemyType);
        this._enemiesType = enemyType;
        this.image.width = AppConstants.matrixSize;
        this.image.height = AppConstants.matrixSize;

        this.moveEngine = new BaseEngine(true);
        this._bfsMoveEngine = new BSFMoveEngine(this.getMatrixPosition.bind(this), targetValue);
        this._targetValue = targetValue;

        this.image.anchor = 0.5;
        this._hpBar = new Sprite(AssetsLoader.getTexture('hp-bar-10'));
        this._hpBar.scale.set(0.3, 0.2);
        this._hpBar.anchor.set(0.5, 4);

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

    public getMatrixPosition(): PointData {
        const matrixPosition: PointData = { x: Math.round((this.position.x - AppConstants.matrixSize / 2) / AppConstants.matrixSize), y: Math.round((this.position.y - AppConstants.matrixSize / 2) / AppConstants.matrixSize) };
        return matrixPosition;
    }

    public startMove() {
        this._bfsMoveEngine.update();
        this.getNextMove();
        this._isMoving = true;
    }

    private _updateMatrixMap() {
        const newMatrixPosition = this.getMatrixPosition();
        if (!newMatrixPosition) return;
        // if (this._lastMatrix.x === newMatrixPosition.x && this._lastMatrix.y === newMatrixPosition.y) return;
        GameMap.mapMatrix[newMatrixPosition.x][newMatrixPosition.y] = this._matrixValue;
        // GameMap.mapMatrix[this._lastMatrix.x][this._lastMatrix.y] = AppConstants.matrixMapValue.availableMoveWay;

        // this._lastMatrix = { x: newMatrixPosition.x, y: newMatrixPosition.y };
    }

    public reset() {
        this.moveEngine.direction = Direction.STAND;
        this._isMoving = false;
    }

    public getUpdatedPosition(): PointData {
        return this.image.position;
    }

    public boundBack() {

        switch (this.moveEngine.direction) {
            case Direction.UP:
                this.position = { x: this.position.x, y: this.position.y + 2 };
                break;

            case Direction.DOWN:
                this.position = { x: this.position.x, y: this.position.y - 2 };
                break;

            case Direction.LEFT:
                this.position = { x: this.position.x + 2, y: this.position.y };
                break;

            case Direction.RIGHT:
                this.position = { x: this.position.x - 2, y: this.position.y };
                break;
            default:
                break;
        }
    }
    public fire(target: PointData): boolean {
        if (this.fireTimeCd.fireTimeCount < this.fireTimeCd.fireTimeConst) return false;
        const option: FireBulletOption = { position: this.position, target: target, dame: this.dameDeal, speed: this.speed * 3, isEneBullet: this.isEneBullet, towerType: TowerType.tinker };

        Emitter.emit(AppConstants.event.createBullet, option);
        this.fireTimeCd.fireTimeCount = 0;
        return true;
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


        if (this.direction != Direction.STAND) {
                GameMap.mapMatrix[this._lastMatrix.x][this._lastMatrix.y] = AppConstants.matrixMapValue.availableMoveWay;
                GameMap.mapMatrix[this.getMatrixPosition().x][this.getMatrixPosition().y] = AppConstants.matrixMapValue.unit;
                this._lastMatrix = {x: this.getMatrixPosition().x, y: this.getMatrixPosition().y}
            
        }
        this.move(dt);
    }

    public getNextMove() {

        const nextMove: BSFNextMove = this._bfsMoveEngine.bsfNextMove;
        if (nextMove === undefined) {
            this.isMoving = false;
            this._isPauseMove = true;
            return;
        }

        let nextPositionChangeDirection: PointData;
        let nextDirection: Direction;

        if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y] === AppConstants.matrixMapValue.unit) {
            switch (nextMove.directions) {
                case Direction.UP:
                    if (GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x - 1, y: nextMove.path.y };
                        nextDirection = Direction.UP_LEFT;

                        break;
                    } else if (GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x + 1, y: nextMove.path.y };
                        nextDirection = Direction.UP_RIGHT;

                        break;
                    }
                case Direction.LEFT:
                    if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y - 1 };
                        nextDirection = Direction.UP_LEFT;

                        break;
                    } else if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y + 1 };
                        nextDirection = Direction.DOWN_LEFT;

                        break;
                    }
                case Direction.DOWN:
                    if (GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x - 1, y:nextMove.path.y };
                        nextDirection = Direction.DOWN_LEFT;

                        break;
                    } else if (GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x + 1, y: nextMove.path.y };
                        nextDirection = Direction.DOWN_RIGHT;

                        break;
                    }
                case Direction.RIGHT:
                    if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y - 1 };
                        nextDirection = Direction.UP_RIGHT;

                        break;
                    } else if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay &&
                        GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
                        nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y + 1 };
                        nextDirection = Direction.DOWN_RIGHT;

                        break;
                    }
                // case Direction.UP_LEFT:
                //     if (GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x:nextMove.path.x + 1, y: nextMove.path.y };
                //         nextDirection = Direction.UP;

                //         break;
                //     } else if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y - 1};
                //         nextDirection = Direction.LEFT;

                //         break;
                //     }
                // case Direction.UP_RIGHT:
                //     if (GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x: nextMove.path.x - 1, y: nextMove.path.y };
                //         nextDirection = Direction.UP;

                //         break;
                //     } else if (GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x: nextMove.path.x + 1, y: nextMove.path.y };
                //         nextDirection = Direction.RIGHT;

                //         break;
                //     }
                // case Direction.DOWN_LEFT:
                //     if (GameMap.mapMatrix[nextMove.path.x + 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x: nextMove.path.x + 1, y: nextMove.path.y };
                //         nextDirection = Direction.DOWN;

                //         break;
                //     } else if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x: nextMove.path.x, y: nextMove.path.y - 1 };
                //         nextDirection = Direction.LEFT;

                //         break;
                //     }
                // case Direction.DOWN_RIGHT:
                //     if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x: nextMove.path.x, y:nextMove.path.y - 1 };
                //         nextDirection = Direction.RIGHT;

                //         break;
                //     } else if (GameMap.mapMatrix[nextMove.path.x - 1][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay) {
                //         nextPositionChangeDirection = { x: nextMove.path.x - 1, y: nextMove.path.y };
                //         nextDirection = Direction.LEFT;

                //         break;
                //     }

                default:
                    // this._isMoving = false;
                    // this._isPauseMove = true;
                    nextDirection = Direction.STAND;
                    break;
            }
        } else if (GameMap.mapMatrix[nextMove.path.x][nextMove.path.y] === AppConstants.matrixMapValue.availableMoveWay) {
            nextDirection = nextMove.directions;
            nextPositionChangeDirection = nextMove.path;
        } else {
            nextDirection === Direction.STAND;
        }

        if (nextDirection != Direction.STAND && nextPositionChangeDirection) {
            // GameMap.mapMatrix[nextPositionChangeDirection.x][nextPositionChangeDirection.y] = AppConstants.matrixMapValue.unit;


            this.moveEngine.direction = nextDirection;

            this._positionChangeDirection = { x: nextPositionChangeDirection.x * AppConstants.matrixSize, y: nextPositionChangeDirection.y * AppConstants.matrixSize };

            this._isPauseMove = false;

        } else if (nextDirection === Direction.STAND) {
            this.moveEngine.direction = Direction.STAND;
            this._isPauseMove = true;
            // this.isMoving = false;
        }


    }


    public update(dt: number): void {
        if (this._isPauseMove) {
            this.getNextMove();
        }
        // this._updateMatrixMap();
        this.time += dt;
        this.fireTimeCd.fireTimeCount += dt;
        this._bfsMoveEngine.update();
        if (!this._isMoving) return;
        this._moveByBsf(dt);
        this._hpBar.position = this.image.position;


    }
}