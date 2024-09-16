import { PointData, Sprite } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';
import { BaseEngine } from '../MoveEngine/BaseEngine';
import { Direction } from '../Type';
import { switchFn } from '../Util';

export class BaseObject {
    private _image: Sprite;
    private _id: number;
    private _speed: number;
    private _direction: Direction | number;
    private _moveEngine: BaseEngine;
    constructor(textureName: string) {
        this._image = new Sprite(AssetsLoader.getTexture(textureName));
        this._image.anchor.set(0.5);
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

    get image(): Sprite {
        return this._image;
    }

    set image(image: Sprite) {
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


    protected move(dt: number) {
        if (!this._moveEngine) return;
        const isAngleDirection = typeof this._direction === 'number';

        // if object move by angle
        if (isAngleDirection) {
            this._image.x = this._image.x - Math.cos((this._moveEngine.direction * Math.PI) / 180) * ((this._speed * dt) / 1000);

            this._image.y = this._image.y - Math.sin((this._moveEngine.direction * Math.PI) / 180) * ((this._speed * dt) / 1000);

            // rotate image direction
            this._image.angle = this._moveEngine.direction;
        } else {
            // if object move by Direction type
            // get direction from move engine
            const direction = this._moveEngine.direction;

            // return if current direction is standing
            if (direction === Direction.STAND) {
                return;
            }


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

            const moveList = {
                1 : moveUp,
                2 : moveDown,
                3 : moveLeft,
                4 : moveRight,
                'default' : () => {}
            };

            const moveSwitch = switchFn(moveList, 'default');

            moveSwitch(direction);


            const newPosition: PointData = { x: nextX, y: nextY };


            //set next position for sprite
            this.position = newPosition;

        }
    }
    public update(dt: number) {
    }
}