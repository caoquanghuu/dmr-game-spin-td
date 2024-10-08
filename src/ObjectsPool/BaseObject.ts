import { AnimatedSprite, AnimatedSpriteFrames, PointData, Sprite } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';
import { BaseEngine } from '../MoveEngine/BaseEngine';
import { Direction } from '../Type';
import { switchFn } from '../Util';

export class BaseObject {
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

            // rotate image direction
            // this._image.angle = this._moveEngine.direction;
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