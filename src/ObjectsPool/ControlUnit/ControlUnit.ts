import Emitter, { calculateAngleOfVector, isCollision } from '../../Util';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BaseObject } from '../BaseObject';
import { PointData } from 'pixi.js';
import { AssetsLoader } from '../../AssetsLoader';
import { AppConstants } from '../../GameScene/Constants';
import { Circle, EffectType, FireBulletOption, TowerType } from '../../Type';
import { sound } from '@pixi/sound';

export class ControlUnit extends BaseObject {
    private _targetPosition: PointData;
    private _targetID: number;
    public isMoving: boolean = false;
    private _fireTimeCD: {fireTimeConst: number, fireTimeCount: number} = { fireTimeConst: 1000, fireTimeCount: 0 };
    constructor(textureName: string, isAnimationSprite?: boolean) {
        super(textureName, isAnimationSprite);
        this.moveEngine = new BaseEngine(false);
        this.speed = 150;
        this._useEventEffect();
    }

    get target(): PointData {
        return this._targetPosition;
    }

    set target(target: {targetPosition: PointData, targetID: number}) {
        this._targetPosition = target.targetPosition;
        this._targetID = target.targetID;
        this.isMoving = true;
    }

    private _checkTarget() {
        if (!this.target) return;

        const c1: Circle = { position: this._targetPosition, radius: 5 };
        const c2: Circle = { position: this.image.position, radius: 200 };
        const isReached = isCollision(c1, c2);
        if (isReached) {
            if (this._fireTimeCD.fireTimeCount < this._fireTimeCD.fireTimeConst) return;
            this.isMoving = false;
            const option: FireBulletOption = { position: this.position, target: this.target, towerType: TowerType.tinker, dame: 100, speed: this.speed * 3, effectType: null };
            Emitter.emit(AppConstants.event.createBullet, option);
            // sound.play(AppConstants.soundName.mainSound, { sprite: `${TowerType.tinker}` });
            this._fireTimeCD.fireTimeCount = 0;
        } else {
            this.isMoving = true;
        }
    }

    private _updateDirection() {
        // calculate direction
        const direction = calculateAngleOfVector(this.image.position, this._targetPosition);
        // set direction for move engine
        this.moveEngine.direction = direction;
        const imageDirection = direction + 90;

        // change vector of animation
        if (imageDirection > -22.5 && imageDirection <= 22.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveUp, true);
            return;
        }

        if (imageDirection > 22.5 && imageDirection <= 67.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveUpRight, true);
            return;
        }

        if (imageDirection > 67.5 && imageDirection <= 112.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveRight, true);
            return;
        }

        if (imageDirection > 112.5 && imageDirection <= 157.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveDownRight, true);
            return;
        }

        if (imageDirection > 157.5 && imageDirection <= 205.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveDown, true);
            return;
        }

        if (imageDirection > 205.5 && imageDirection <= 247.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveDownLeft, true);
            return;
        }

        if (imageDirection > 247.5 && imageDirection <= 270 || imageDirection >= -112.5 && imageDirection < -67.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveLeft, true);
            return;
        }

        if (imageDirection > 270 && imageDirection <= 315 || imageDirection >= -67.5 && imageDirection <= -22.5) {
            this.setAnimation(AppConstants.moveAnimationName.moveUpLeft, true);
            return;
        }
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.removeEnemy, (eneId: number) => {
            if (this._targetID === eneId) {
                this._targetPosition = undefined;
                this._targetID = undefined;
            }
        });
    }

    public update(dt: number) {
        this._fireTimeCD.fireTimeCount += dt;
        this._checkTarget();
        if (!this._targetPosition || !this.isMoving) return;
        this._updateDirection();
        this.move(dt);
    }
}