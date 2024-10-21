import { BitmapText, EventEmitter, PointData, Sprite } from 'pixi.js';
import { Circle, Square } from './Type';
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
     * method check collision between 2 circle base on calculate distance or circle with square
     * @param c1
     * @param c2
    * @param square
     * @returns return result as boolean have collision or not
     */
export function isCollision(c1: Circle, c2?: Circle, square?: Square): boolean {
    if (c2) {
        const r = c1.radius + c2.radius;
        const distance = Math.sqrt((c1.position.x - c2.position.x) * (c1.position.x - c2.position.x) + (c1.position.y - c2.position.y) * ((c1.position.y - c2.position.y)));
        if (distance <= r) return true;

        return false;
    } else if (square) {
        const closestX = Math.max(square.position.x, Math.min(c1.position.x, square.position.x + square.width));
        const closestY = Math.max(square.position.y, Math.min(c1.position.y, square.position.y + square.height));

        const distanceX = c1.position.x - closestX;
        const distanceY = c1.position.y - closestY;

        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        return distanceSquared <= (c1.radius * c1.radius);
    }


}

export function getRandomArbitrary(option: {min: number, max: number}): number {
    const min = Math.ceil(option.min);
    const max = Math.floor(option.max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Method to calculate the correct position of the circle's center before collision with a circle or a square.
 * @param c1 The moving circle.
 * @param c2 Another circle, which we need to calculate the correct position.
 * @param square The stationary square.
 * @returns The correct position of the moving circle before collision.
 */
export function findCorrectPositionBeforeCollision(c1: Circle, c2?: Circle, square?: Square): PointData {
    if (c2) {
        // Calculate position before collision with another circle
        const vector = { x: c1.position.x - c2.position.x, y: c1.position.y - c2.position.y };
        const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        const r = c1.radius + c2.radius;
        const unitVector = { x: vector.x / distance, y: vector.y / distance };
        const correctPosition = {
            x: c2.position.x - unitVector.x * (r - distance),
            y: c2.position.y - unitVector.y * (r - distance)
        };
        return correctPosition;
    } else if (square) {
        // Find the closest point on the square to the circle's center
        const closestX = Math.max(square.position.x, Math.min(c1.position.x, square.position.x + square.width));
        const closestY = Math.max(square.position.y, Math.min(c1.position.y, square.position.y + square.height));

        // Calculate the vector from the circle's center to this closest point
        const vector = { x: c1.position.x - closestX, y: c1.position.y - closestY };
        const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

        // Calculate the required position before collision
        const unitVector = { x: vector.x / distance, y: vector.y / distance };
        const r = c1.radius;

        // Correct position of c1 before collision
        const correctPosition = {
            x: c1.position.x - unitVector.x * (distance - r),
            y: c1.position.y - unitVector.y * (distance - r)
        };
        return correctPosition;
    }

    throw new Error('Either a second circle or a square must be provided.');
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

/**
 * calculate new vector for c2 when have collision
 * @param c1 circle 1 (stay).
 * @param c2 circle 2 (move).
 * @returns next position for circle 2 after collision.
 */
export function calculateNextPositionAfterCollision(c1: Circle, c2: Circle): PointData {
    // Tính toán vector va chạm từ c1 đến c2
    const collisionVector: PointData = { x: c1.position.x - c2.position.x, y: c1.position.y - c2.position.y };

    // Chuẩn hóa vector va chạm
    const distance = Math.sqrt(collisionVector.x * collisionVector.x + collisionVector.y * collisionVector.y);
    const unitCollisionVector: PointData = { x: collisionVector.x / distance, y: collisionVector.y / distance };

    // Tính toán vị trí mới của c2 sau va chạm sao cho không va chạm lại với c1 và cách vị trí hiện tại 32 pixel
    const r = c1.radius + c2.radius;
    const newPositionDistance = 32; // Khoảng cách mong muốn từ vị trí hiện tại
    const nextPosition: PointData = {
        x: c2.position.x + unitCollisionVector.x * newPositionDistance,
        y: c2.position.y + unitCollisionVector.y * newPositionDistance
    };

    return nextPosition;
}

