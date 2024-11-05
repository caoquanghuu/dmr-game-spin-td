import { BSFNextMove, Circle, EnemiesType, FireBulletOption, FireTime, GetMatrixMapFn, SetMatrixMapFn, TowerType, UnitStage } from '../../Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BSFMoveEngine } from '../../MoveEngine/BSFMoveEngine';
import { PointData } from 'pixi.js';
import Emitter, { calculateAngleOfVector, changeEnumDirectionToAngle, isCollision } from '../../Util';
import { AppConstants } from '../../GameScene/Constants';

export class Tank extends BaseObject {

    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    private _bfsMoveEngine: BSFMoveEngine;
    private _positionChangeDirection: PointData = { x: 0, y: 0 };
    private _goldReward: number = 2;
    private _fireRadius: number = 30;
    public fireTimeCd: FireTime= { fireTimeConst: 3000, fireTimeCount: 0 };
    private _forceChangeDirectionCd: {changeTimeConst: number, changeTimeCount: number} = { changeTimeConst: 200, changeTimeCount: 0 };
    public unitStage: UnitStage = UnitStage.MOVING;

    private _targetPosition: PointData;
    private _targetID: number;

    private _targetValue: number;
    private _matrixValue: number;

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

    get goldReward(): number {
        return this._goldReward;
    }

    set goldReward(gold: number) {
        this._goldReward = gold;
    }


    get bfsMoveEngine(): BSFMoveEngine {
        return this._bfsMoveEngine;
    }

    get nextPositionChangeDirection(): PointData {
        return { x: this._positionChangeDirection.x, y: this._positionChangeDirection.y };
    }

    /**
     * method get units position and change it to grid map position
     * @returns return point data position on grid map
     */
    public getMatrixPosition(): PointData {
        const matrixPosition: PointData = { x: Math.round((this.position.x - AppConstants.matrixSize / 2) / AppConstants.matrixSize), y: Math.round((this.position.y - AppConstants.matrixSize / 2) / AppConstants.matrixSize) };
        return matrixPosition;
    }

    /**
     * method calculate next move vector of units base on it position and bfs move
     * @returns return angle number
     */
    public getBFSDirection(): number {
        const nextMove: BSFNextMove = this.bfsMoveEngine.bsfNextMove;
        if (nextMove) {
            return changeEnumDirectionToAngle(nextMove.directions);
        }
    }

    public startMove(): void {
        this.getNextMove();
        this.isDead = false;
    }

    public reset(): void {
        this._targetID = undefined;
        this._targetPosition = undefined;
        this._positionChangeDirection = { x: null, y: null };
    }

    /**
     * method to get updated position of unit using as target of bullet
     * @returns the object position of this units which will change when units move
     */
    public getUpdatedPosition(): PointData {
        return this.image.position;
    }

    /**
     * method fire of units will call to bullet controller to create bullet
     * @returns void
     */
    private _fire(): void {
        // change stage to idle when have no target.
        if (!this._targetID && !this._targetPosition) {
            this._forceChangeDirectionCd.changeTimeCount = 0;
            this.unitStage = UnitStage.IDLE;
            return;
        }
        if (this.fireTimeCd.fireTimeCount < this.fireTimeCd.fireTimeConst) return;

        const option: FireBulletOption = { position: this.position, target: this._targetPosition, dame: this.dameDeal, speed: this.speed * 3, isEneBullet: this.isEne, towerType: TowerType.tinker };
        Emitter.emit(AppConstants.event.createBullet, option);
        this.fireTimeCd.fireTimeCount = 0;
    }


    /**
     * method move by bsf. which will have a target to reach and if it reach to target position. will recalculate next target position
     * @param dt delta time
     */
    private _moveByBsf(dt: number): void {
        // move
        this.move(dt);

        // update direction
        const newDirection = calculateAngleOfVector(this.image.position, { x: this._positionChangeDirection.x, y: this._positionChangeDirection.y });
        this.moveEngine.direction = newDirection;
        // rotate image
        this.image.angle = newDirection + 90;

        // check it reached to target position or not
        const c1: Circle = { position: this.position, radius: 5 };
        const c2: Circle = { position: this._positionChangeDirection, radius: 5 };
        const isReached: boolean = isCollision(c1, c2);
        if (isReached) {
            this.getNextMove();
        }
    }

    /**
     * method call to calculate next move direction
     * @returns return true if have available move, false if can't calculate move ways
     */
    public getNextMove(): boolean {
        const nextMove: BSFNextMove = this._bfsMoveEngine.bsfNextMove;
        if (nextMove === undefined) {
            this.unitStage = UnitStage.IDLE;
            return false;
        }

        this._positionChangeDirection = { x: nextMove.path.x * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: nextMove.path.y * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
        this.unitStage = UnitStage.MOVING;
        return true;
    }

    private _useEventEffect(): void {
        Emitter.on(AppConstants.event.removeEnemy, (info: {id: number, isEne: boolean}) => {
            if (this.targetId === info.id) {
                this._targetPosition = null;
                this._targetID = null;
            }
        });
    }


    public update(dt: number): void {
        switch (this.unitStage) {
            // move by normal
            case UnitStage.MOVING:
                this._moveByBsf(dt);
                break;
            // units will move without calculate new direction
            case UnitStage.FORCE_MOVE:
                this.move(dt);
                break;
            // units will stop move and start fire
            case UnitStage.ATTACKING:
                this.fireTimeCd.fireTimeCount += dt;
                this._fire();
                break;
            // units will stop move for a while and try recalculate next move direction and change stage to move
            case UnitStage.IDLE:
                this._forceChangeDirectionCd.changeTimeCount += dt;
                if (this._forceChangeDirectionCd.changeTimeCount >= this._forceChangeDirectionCd.changeTimeConst) {
                    this.getNextMove();
                    this._forceChangeDirectionCd.changeTimeCount = 0;
                }
                break;
            // units will stop move for a while too but it will continue move without recalculate new direction
            case UnitStage.IDLE_TO_MOVE:
                this._forceChangeDirectionCd.changeTimeCount += dt;
                if (this._forceChangeDirectionCd.changeTimeCount >= this._forceChangeDirectionCd.changeTimeConst) {
                    this.unitStage = UnitStage.MOVING;
                    this._forceChangeDirectionCd.changeTimeCount = 0;
                }
                break;
            default:
                break;
        }

        // update hp bar position follow this image position
        this.hpBar.position = this.image.position;
    }
}