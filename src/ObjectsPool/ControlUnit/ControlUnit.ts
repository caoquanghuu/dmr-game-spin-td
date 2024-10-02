import { calculateAngleOfVector, isCollision } from '../../Util';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BaseObject } from '../BaseObject';
import { PointData } from 'pixi.js';
import { AssetsLoader } from '../../AssetsLoader';
import { AppConstants } from '../../GameScene/Constants';
import { Circle } from '../../Type';

export class ControlUnit extends BaseObject {
    public _target: PointData = { x: 0, y: 0 };
    public isMoving: boolean = false;
    constructor(textureName: string, isAnimationSprite?: boolean) {
        super(textureName, isAnimationSprite);
        this.moveEngine = new BaseEngine(false);
        this.speed = 100;
    }

    set target(target: PointData) {
        this._target.x = target.x;
        this._target.y = target.y;
        this._updateDirection();
        this.isMoving = true;
    }

    private _checkTarget() {
        const c1: Circle = { position: this._target, radius: 5 };
        const c2: Circle = { position: this.image.position, radius: 5 };
        const isReached = isCollision(c1, c2);
        if (isReached) {
            this.isMoving = false;
        }
    }

    private _updateDirection() {
        // calculate direction
        const direction = calculateAngleOfVector(this.image.position, this._target);
        // set direction for move engine
        this.moveEngine.direction = direction;
        const imageDirection = direction + 90;
        // this.move(dt);
        console.log(imageDirection);

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

    public update(dt: number) {
        if (!this._target || !this.isMoving) return;
        this._checkTarget();
        this.move(dt);

    }
}