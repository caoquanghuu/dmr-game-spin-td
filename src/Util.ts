import { BitmapText, EventEmitter, PointData, Sprite } from 'pixi.js';
import { Circle } from './Type';
import { AssetsLoader } from './AssetsLoader';

export const switchFn = (lookupObject, defaultCase = '_default') => expression => (lookupObject[expression] || lookupObject[defaultCase])();

export function calculateAngleOfVector(p1: PointData, p2: PointData): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const radian = Math.atan2(dy, dx);
    const angle = radian * (180 / Math.PI);
    return angle;
}

const eventEmitter = new EventEmitter();
const Emitter = {
    on: (event: string, fn) => eventEmitter.on(event, fn),
    once: (event: string, fn) => eventEmitter.once(event, fn),
    off: (event: string, fn) => eventEmitter.off(event, fn),
    emit: (event: string, payload) => eventEmitter.emit(event, payload),
    remove: () => eventEmitter.removeAllListeners(),
};
Object.freeze(Emitter);
export default Emitter;

/**
     * method check collision between 2 circle base on calculate distance
     * @param c1
     * @param c2
     * @returns return result as boolean have collision or not
     */
export function isCollision(c1: Circle, c2: Circle): boolean {
    const r = c1.radius + c2.radius;
    const distance = Math.sqrt((c1.position.x - c2.position.x) * (c1.position.x - c2.position.x) + (c1.position.y - c2.position.y) * ((c1.position.y - c2.position.y)));
    if (distance <= r) return true;

    return false;
}

export function getRandomArbitrary(option: {min: number, max: number}): number {
    const min = Math.ceil(option.min);
    const max = Math.floor(option.max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
     * method will calculate correct distance of circle 2 before collision
     * @param c1 circle 1
     * @param c2 circle 2, which no calculate correct position
     * @returns return correct position of c2 before collision
     */
export function findCorrectPositionBeforeCollision(c1: Circle, c2: Circle): PointData {
    const vector = { x: c1.position.x - c2.position.x, y: c1.position.y - c2.position.y };
    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    const r = c1.radius + c2.radius;
    const unitVector = { x: vector.x / distance, y: vector.y / distance };

    const correctPosition = {
        x: c2.position.x - unitVector.x * (r - distance),
        y: c2.position.y - unitVector.y * (r - distance)
    };

    return correctPosition;
}

/**
 * method create a sprite and return that sprite
 * @param texture texture name of that image define on json sprite sheet
 * @param width width of image
 * @param height height of image
 * @param anchor anchor of image
 * @param alpha alpha of image
 * @returns return image created
 */
export function createImage(option: {texture: string, width?: number, height?: number, anchor?: number, alpha?: number}): Sprite {
    const sprite = new Sprite(AssetsLoader.getTexture(option.texture));
    sprite.width = option.width;
    sprite.height = option.height;
    if (option.anchor) {
        sprite.anchor = option.anchor;
    }
    if (option.alpha) {
        sprite.alpha = option.alpha;
    }
    return sprite;
}

/**
 * method create a bitmap text with basic property, can be update later
 * @param option content for the text want display, font is name of bitmap font was load, size of text
 * @returns return bitmap text was created
 */
export function createBitMapText(option: {content: string, font: string, size: number, anchor?: number}): BitmapText {
    const text = new BitmapText({
        text: option.content,
        style: {
            fontFamily: option.font,
            fontSize: option.size
        }
    });

    if (option.anchor) {
        text.anchor = option.anchor;
    }
    return text;
}