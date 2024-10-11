import { AnimatedSprite, AnimatedSpriteFrames, PointData, Sprite } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';
import { BaseEngine } from '../MoveEngine/BaseEngine';
import { Direction } from '../Type';
import Emitter, { switchFn } from '../Util';
import { AppConstants } from '../GameScene/Constants';

export class BaseObject {
    public isEne: boolean = true;
    public isDead: boolean = false;
    private _HP: {hpConst: number, hpCount: number} = { hpConst: 0, hpCount: 0 };
    private _hpBar: Sprite;
    private _image: Sprite | AnimatedSprite;
    private _animationName: {[animationTypes: string]: AnimatedSpriteFrames} = {};
    private _currentAnimation: string;
    private _id: number;
    private _speed: number;
    private _direction: Direction | number;
    private _moveEngine: BaseEngine;
    protected time: number = 0;
    constructor(textureName: string, isAnimatedSprite?: boolean) {
        if (isAnimatedSprite) {
            const animations = AssetsLoader.getTexture(textureName).animations;

            for (const key in animations) {

                this._animationName[key] = animations[key];
                this._image = new AnimatedSprite(this._animationName[key]);
            }
        } else {
            this._image = new Sprite(AssetsLoader.getTexture(textureName));
        }
        this._hpBar = new Sprite(AssetsLoader.getTexture('hp-10'));
        this._hpBar.scale.set(0.3, 0.2);
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

    get hpBar(): Sprite {
        return this._hpBar;
    }


    get position(): PointData {
        const position: PointData = { x: this._image.position.x, y: this._image.position.y };
        return position;
    }

    set position(position: PointData) {

        this._image.position.x = position.x;
        this._image.position.y = position.y;
    }

    get direction(): Direction | number {
        return this._moveEngine.direction;
    }

    set direction(direction) {
        this._moveEngine.direction = direction;
    }

    get image(): Sprite | AnimatedSprite {
        return this._image;
    }

    set image(image: Sprite | AnimatedSprite) {
        this._image = image;
    }

    get moveEngine(): BaseEngine {
        return this._moveEngine;
    }

    set moveEngine(moveEngine: BaseEngine) {
        this._moveEngine = moveEngine;
    }

    set id(id: number) {
        this._id = id;
    }

    get id(): number {
        return this._id;
    }

    get speed(): number {
        return this._speed;
    }

    set speed(sp: number) {
        this._speed = sp;
    }

    public reduceHp(hpReDuce: number): void {
        this._HP.hpCount -= hpReDuce;

        const hpRate = Math.round(this._HP.hpCount / (this._HP.hpConst / 10));
        if (hpRate <= 0) {
            Emitter.emit(AppConstants.event.removeEnemy, { id: this.id, isEne: this.isEne });
            this.isDead = true;
            return;
        }
        this._hpBar.texture = AssetsLoader.getTexture(`hp-${hpRate}`);
    }

    public setFrame(frame: number) {
        if (this._image instanceof AnimatedSprite) {
            (this._image as AnimatedSprite).gotoAndStop(frame);
        } else {
            return;
        }
    }

    public setAnimation(animationName: string, loop?: boolean) {
        if (this._image instanceof AnimatedSprite) {
            const textures = this._animationName[animationName];
            if (textures) {
                if (this._currentAnimation === animationName) return;


                (this._image as AnimatedSprite).textures = textures;
                (this._image as AnimatedSprite).loop = loop;
                (this._image as AnimatedSprite).play();
                this._currentAnimation = animationName;

            }
        } else {
            return;
        }
    }


    protected move(dt: number) {
        if (!this._moveEngine) return;

        const isAngleDirection = this.moveEngine.isMoveByEnumDirection;


        // if object move by angle
        if (!isAngleDirection) {

            const x = this._image.x + Math.cos((this._moveEngine.direction * Math.PI) / 180) * ((this._speed * dt) / 1000);

            const y = this._image.y + Math.sin((this._moveEngine.direction * Math.PI) / 180) * ((this._speed * dt) / 1000);

            this.image.position = { x: x, y: y };
        } else {
            // if object move by Direction type
            // get direction from move engine
            const direction = this._moveEngine.direction;

            // return if current direction is standing
            // if (direction === Direction.STAND) {
            //     return;
            // }


            //calculate next position base on direction, delta time and speed

            let nextX: number, nextY: number;

            const moveUp = () => {
                nextY = (this.position.y) - ((this._speed * dt) / 1000);
                nextX = this.position.x;
            };

            const moveDown = () => {
                nextY = (this.position.y) + ((this._speed * dt) / 1000);
                nextX = this.position.x;
            };

            const moveLeft = () => {
                nextY = this.position.y;
                nextX = (this.position.x) - ((this._speed * dt) / 1000);
            };

            const moveRight = () => {
                nextY = this.position.y;
                nextX = (this.position.x) + ((this._speed * dt) / 1000);
            };

            const standing = () => {
                nextY = this.position.y;
                nextX = this.position.x;
            };

            const moveUpLeft = () => {
                nextY = (this.position.y) - ((this._speed * dt) / (1000 * Math.sqrt(2)));
                nextX = (this.position.x) - ((this._speed * dt) / (1000 * Math.sqrt(2)));
            };

            const moveUpRight = () => {
                nextY = (this.position.y) - ((this._speed * dt) / (1000 * Math.sqrt(2)));
                nextX = (this.position.x) + ((this._speed * dt) / (1000 * Math.sqrt(2)));
            };

            const moveDownLeft = () => {
                nextY = (this.position.y) + ((this._speed * dt) / (1000 * Math.sqrt(2)));
                nextX = (this.position.x) - ((this._speed * dt) / (1000 * Math.sqrt(2)));
            };

            const moveDownRight = () => {
                nextY = (this.position.y) + ((this._speed * dt) / (1000 * Math.sqrt(2)));
                nextX = (this.position.x) + ((this._speed * dt) / (1000 * Math.sqrt(2)));
            };

            const moveList = {
                0 : moveUp,
                1 : moveDown,
                2 : moveLeft,
                3 : moveRight,
                4: standing,
                5: moveUpLeft,
                6: moveUpRight,
                7: moveDownLeft,
                8 :moveDownRight,

                'default' : () => {}
            };

            const moveSwitch = switchFn(moveList, 'default');

            moveSwitch(direction);


            const newPosition: PointData = { x: nextX, y: nextY };


            //set next position for sprite
            this.position = newPosition;

        }
    }
}