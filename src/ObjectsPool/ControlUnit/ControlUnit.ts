import Emitter, { calculateAngleOfVector, createImage, findCorrectPositionBeforeCollision, getRandomArbitrary, isCollision } from '../../Util';
import { BaseEngine } from '../../MoveEngine/BaseEngine';
import { BaseObject } from '../BaseObject';
import { Container, PointData, Sprite } from 'pixi.js';
import { AppConstants } from '../../GameScene/Constants';
import { Circle, FireBulletOption, FlyUnitType, TowerType } from '../../Type';
import { sound } from '@pixi/sound';
import { AssetsLoader } from '../../AssetsLoader';

export class ControlUnit extends BaseObject {
    private _targetPosition: PointData;
    private _targetID: number;
    private _barackPosition: PointData;
    readonly _unitType: FlyUnitType;
    public isMoving: boolean = false;
    private _upgradeLevelImage: Sprite;
    private _dame: {min: number, max: number} = { min: AppConstants.dame.helicopter.min, max: AppConstants.dame.helicopter.max };
    private _fireTimeCD: {fireTimeConst: number, fireTimeCount: number} = { fireTimeConst: AppConstants.fireTimeCd.helicopter.fireTimeConst, fireTimeCount: AppConstants.fireTimeCd.helicopter.fireTimeCount };
    private _bulletBar: {id: number, bulletCountImage: Sprite }[] = [];
    private _bulletBarImage: Container;
    private _bulletCount: {bulletConst: number, bulletCount: number} = { bulletConst: 8, bulletCount: 8 };
    private _fireStage: boolean = true;

    constructor(unitType: FlyUnitType, isAnimationSprite?: boolean) {
        super(unitType, isAnimationSprite);
        this._useEventEffect();
        this._unitType = unitType;
        this.moveEngine = new BaseEngine(false);

        this.speed = 150;

        this.image.zIndex = 1000;
        this.image.width = AppConstants.matrixSize * 2;
        this.image.height = AppConstants.matrixSize * 2;

        this._upgradeLevelImage = new Sprite();

        this._upgradeLevelImage.width = AppConstants.matrixSize / 3;
        this._upgradeLevelImage.height = AppConstants.matrixSize / 3;
        this._upgradeLevelImage.anchor.set(0.5);
        this._upgradeLevelImage.alpha = AppConstants.imageAlpha.towerUpGradeIcon;
        this._upgradeLevelImage.zIndex = 1000;

        this._bulletBarImage = new Container();
        this._bulletBarImage.zIndex = 1000;
        for (let i = 0; i < this._bulletCount.bulletConst; i ++) {
            const id = i;
            const bulletCountSize: number = (AppConstants.matrixSize * 2) / this._bulletCount.bulletConst;
            const bulletCountImage: Sprite = createImage({ texture: AppConstants.textureName.bulletCountImage.exist, width: bulletCountSize, height: bulletCountSize });
            this._bulletBarImage.addChild(bulletCountImage);
            bulletCountImage.position = { x: bulletCountSize * i, y: 0 };

            this._bulletBar.push({ id: id, bulletCountImage: bulletCountImage });
        }
    }

    get fireStage(): boolean {
        return this._fireStage;
    }

    get barackPosition() {
        return this._barackPosition;
    }

    set barackPosition(pos: PointData) {
        this._barackPosition = pos;
    }

    get bulletCountImage(): Container {
        return this._bulletBarImage;
    }
    get targetPosition(): PointData {
        return this._targetPosition;
    }

    get upgradeImage(): Sprite {
        return this._upgradeLevelImage;
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

    public reset() {
        this._targetID = null;
        this._targetPosition = null;
        this._barackPosition = null;
        this._dame = { min: AppConstants.dame.helicopter.min, max: AppConstants.dame.helicopter.max };
        this._fireTimeCD.fireTimeConst = AppConstants.fireTimeCd.helicopter.fireTimeConst;

        // reset bullet bar
        for (let i = 0; i < this._bulletCount.bulletConst - this._bulletCount.bulletCount; i++) {
            this._changeBulletCount(true);
        }
        this._fireStage = true;
    }

    private _checkTarget() {

        // in case stage can fire, unit will find fire able target
        if (this._fireStage) {
            if (!this._targetID && !this._targetPosition) return;

            const c1: Circle = { position: this._targetPosition, radius: AppConstants.matrixSize / 2 };
            const c3: Circle = { position: this.image.position, radius: this.image.width / 2 };
            const c2: Circle = { position: this.image.position, radius: AppConstants.matrixSize * 3 };
            const isCollisionWithEne = isCollision(c1, c3);

            // incase can fire and collision with ene
            if (isCollisionWithEne) {
                const correctPosition = findCorrectPositionBeforeCollision(c1, c3);
                this.position = correctPosition;
            }
            const isReached = isCollision(c1, c2);
            if (isReached) {
                if (this._fireTimeCD.fireTimeCount < this._fireTimeCD.fireTimeConst) return;
                this.isMoving = false;
                const dameDeal = getRandomArbitrary({ min: this._dame.min, max: this._dame.max });
                const option: FireBulletOption = { position: this.position, target: this._targetPosition, towerType: TowerType.tinker, dame: dameDeal, speed: this.speed * 3, effectType: null, isEneBullet: false };
                Emitter.emit(AppConstants.event.createBullet, option);
                // sound.play(AppConstants.soundName.mainSound, { sprite: `${TowerType.tinker}` });
                this._fireTimeCD.fireTimeCount = 0;

                // reduce bullet on success fired
                // change image of bullet bar
                this._changeBulletCount(false);
            } else {
                this.isMoving = true;
            }
        } else {
            // in case out of bullet then target of unit is the tower where unit created.
            this.isMoving = true;
            const c1: Circle = { position: { x: this._barackPosition.x + AppConstants.matrixSize, y: this._barackPosition.y }, radius: 5 };
            const c2: Circle = { position: this.position, radius: 5 };
            const isReached = isCollision(c1, c2);
            if (isReached) {
                this.isMoving = false;
                if (this.time >= AppConstants.time.helicopterChargeBulletTime) {
                    // charge bullet each time
                    this._changeBulletCount(true);
                    this.time = 0;
                }
            }

        }

    }

    private _changeBulletCount(isCharge: boolean): void {
        if (isCharge) {
            // change image of bullet count
            this._bulletBar[this._bulletCount.bulletCount].bulletCountImage.texture = AssetsLoader.getTexture(AppConstants.textureName.bulletCountImage.exist);
            this._bulletCount.bulletCount += 1;
            if (this._bulletCount.bulletCount >= this._bulletCount.bulletConst) {
                // charge complete
                this._targetPosition = null;
                this._targetID = null;
                this._fireStage = true;
                this.isMoving = true;
            }

        } else {
            this._bulletBar[this._bulletCount.bulletCount - 1].bulletCountImage.texture = AssetsLoader.getTexture(AppConstants.textureName.bulletCountImage.null);
            this._bulletCount.bulletCount -= 1;
            if (this._bulletCount.bulletCount <= 0) {
                this._fireStage = false;
                // change target move of unit
                this._targetPosition = { x: this._barackPosition.x, y: this._barackPosition.y };
                this.isMoving = true;
            }
        }
    }

    public upgrade(level: number) {
        this._dame.min = AppConstants.dame.helicopter.min * level;
        this._dame.max = AppConstants.dame.helicopter.max * level;
        this._upgradeLevelImage.texture = AssetsLoader.getTexture(`upgrade-level-${level + 1}`);
        Emitter.emit(AppConstants.event.addChildToScene, this._upgradeLevelImage);

        if (level === 3) {
            this._fireTimeCD.fireTimeConst -= 500;
        }
        // incase level 3 will increase fire speed and bullet carrying count
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
        Emitter.on(AppConstants.event.removeEnemy, (info: {id: number, isEne: boolean}) => {
            if (this._targetID === info.id) {
                // avoid incase ene die right on time helicopter start move to base
                if (this._targetPosition.x === this._barackPosition.x && this._targetPosition.y === this._barackPosition.y) return;
                this._targetPosition = null;
                this._targetID = null;
            }
        });
    }

    public update(dt: number) {
        this._fireTimeCD.fireTimeCount += dt;
        this.time += dt;
        this._checkTarget();
        this._upgradeLevelImage.position = { x: this.position.x - this.image.width, y: this.position.y };
        this._bulletBarImage.position = { x: this.position.x - this.image.width / 2, y: this.position.y + AppConstants.matrixSize / 2 };
        if (!this._targetPosition || !this.isMoving) return;
        this._updateDirection();
        this.move(dt);

    }
}