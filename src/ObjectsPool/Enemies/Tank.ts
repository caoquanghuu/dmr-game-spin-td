import { BSFNextMove, Circle, Direction, EnemiesType, FireBulletOption, FireTime, GetMatrixMapFn, SetMatrixMapFn, TowerType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData } from 'pixi.js';
import Emitter, { calculateAngleOfVector, isCollision } from '../../Util';
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

        this.moveEngine = new BaseEngine(false);
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
        return { x: (this._positionChangeDirection.x - AppConstants.matrixSize / 2) / AppConstants.matrixSize, y: (this._positionChangeDirection.y - AppConstants.matrixSize / 2) / AppConstants.matrixSize };
    }

    set nextPositionChangeDirection(pos: PointData) {
        this._positionChangeDirection = { x: pos.x, y: pos.y };
    }

    public getMatrixPosition(): PointData {
        const matrixPosition: PointData = { x: Math.round((this.position.x - AppConstants.matrixSize / 2) / AppConstants.matrixSize), y: Math.round((this.position.y - AppConstants.matrixSize / 2) / AppConstants.matrixSize) };
        return matrixPosition;
    }


    public startMove() {
        this.getNextMove();
        this._isMoving = true;
        this.isDead = false;
    }

    public reset() {
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
        const c1: Circle = { position: this.position, radius: 5 };
        const c2: Circle = { position: this._positionChangeDirection, radius: 5 };
        const isReached: boolean = isCollision(c1, c2);
        if (isReached) {
            this.getNextMove();
        }
    }

    public getNextMove(): boolean {

        const nextMove: BSFNextMove = this._bfsMoveEngine.bsfNextMove;
        if (nextMove === undefined) {
            this.isPauseMove = true;
            return false;
        }
        this._positionChangeDirection = { x: nextMove.path.x * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: nextMove.path.y * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
        const newDirection = calculateAngleOfVector(this.image.position, { x: this._positionChangeDirection.x, y: this._positionChangeDirection.y });
        this.image.angle = newDirection + 90;
        this.moveEngine.direction = newDirection;
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