import { BitmapText, EventEmitter, PointData, Sprite } from 'pixi.js';
import { Circle, Direction, Square } from './Type';
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

        // Kiểm tra distance không bằng 0
        if (distance === 0) {
            console.error('Khoảng cách giữa hai hình tròn là 0, không thể tính toán.');
            return { x: c2.position.x, y: c2.position.y }; // Hoặc giá trị xử lý mặc định khác
        }

        const r = c1.radius + c2.radius + 1;
        const unitVector = { x: vector.x / distance, y: vector.y / distance };
        const correctPosition = {
            x: c2.position.x - unitVector.x * (r - distance),
            y: c2.position.y - unitVector.y * (r - distance)
        };

        if (isNaN(correctPosition.x) || isNaN(correctPosition.y)) {
            console.log('Giá trị NaN tìm thấy:', correctPosition);
        }

        return correctPosition;
    } else if (square) {
        // Find the closest point on the square to the circle's center
        const closestX = Math.max(square.position.x, Math.min(c1.position.x, square.position.x + square.width));
        const closestY = Math.max(square.position.y, Math.min(c1.position.y, square.position.y + square.height));

        // Calculate the vector from the circle's center to this closest point
        const vector = { x: c1.position.x - closestX, y: c1.position.y - closestY };
        const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

        // Kiểm tra distance không bằng 0
        if (distance === 0) {
            console.error('Khoảng cách từ hình tròn đến điểm gần nhất của hình vuông là 0, không thể tính toán.');
            return { x: c1.position.x, y: c1.position.y }; // Hoặc giá trị xử lý mặc định khác
        }

        const unitVector = { x: vector.x / distance, y: vector.y / distance };
        const r = c1.radius + 1;
        const correctPosition = {
            x: c1.position.x - unitVector.x * (distance - r),
            y: c1.position.y - unitVector.y * (distance - r)
        };

        if (isNaN(correctPosition.x) || isNaN(correctPosition.y)) {
            console.log('Giá trị NaN tìm thấy:', correctPosition);
        }

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

export function toRadians(angle: number) {
    return angle * (Math.PI / 180);
}

export function toDegrees(radian: number): number {
    return radian * (180 / Math.PI);
}

export function getNextPosition(position: PointData, angle: number, distance) {
    const rad = toRadians(angle);
    const newX = position.x + Math.cos(rad) * distance;
    const newY = position.y + Math.sin(rad) * distance;
    return { x: newX, y:  newY };
}

export function crossProduct(v1: PointData, v2: PointData): number {
    return v1.x * v2.y - v1.y * v2.x;
}
export function dotProduct(v1: PointData, v2: PointData): number {
    return v1.x * v2.x + v1.y * v2.y;
}

export function getMovementVector(start: PointData, end: PointData): PointData {
    return {
        x: end.x - start.x,
        y: end.y - start.y
    };
}

/**
 * method compare position of object 1 vs object 2
 * @param pos1 position of object1 and moving angle of it
 * @param pos2 position of object2 and moving angle of it
 * @returns return a number, if number > 0 mean pos1 is front of pos2, if number < 0 mean pos1 behind pos2, if number = 0 mean they moving same
 */
export function comparePosition(pos1: {position: PointData, angle: number}, pos2: {position: PointData, angle: number}): number {
    const nextPos1 = getNextPosition(pos1.position, pos1.angle, 1);
    const nextPos2 = getNextPosition(pos2.position, pos2.angle, 1);
    const moveVector1 = getMovementVector(pos1.position, nextPos1);
    const moveVector2 = getMovementVector(pos2.position, nextPos2);
    const dot = dotProduct(moveVector1, moveVector2);
    const magnitude1 = Math.sqrt(dotProduct(moveVector1, moveVector1));
    const magnitude2 = Math.sqrt(dotProduct(moveVector2, moveVector2));
    // const cross = crossProduct(moveVector1, moveVector2);
    const cosTheta = dot / (magnitude1 * magnitude2);
    return cosTheta;
    // return cross;
}

/**
 * Tính toán điểm di chuyển tiếp theo của hình tròn 1 sau khi va chạm với hình tròn 2.
 * @param c1 Hình tròn 1 (di chuyển).
 * @param c2 Hình tròn 2 (đứng yên).
 * @param angle Góc độ di chuyển ban đầu của hình tròn 1 (a1).
 * @returns Vị trí mới cho hình tròn 1 sau va chạm.
 */
export function calculateNextPositionAfterCollision(c1: Circle, c2: Circle, angle: number): PointData {
    // Chuyển đổi góc sang radians
    const angleRad = toRadians(angle);

    // Tính toán vector di chuyển ban đầu của hình tròn 1
    const moveVector: PointData = { x: Math.cos(angleRad), y: Math.sin(angleRad) };

    // Tính toán vector từ c1 đến c2
    const collisionVector: PointData = { x: c2.position.x - c1.position.x, y: c2.position.y - c1.position.y };

    // Tính khoảng cách giữa hai hình tròn
    const distance = Math.sqrt(collisionVector.x * collisionVector.x + collisionVector.y * collisionVector.y);

    // Chuẩn hóa vector va chạm
    const unitCollisionVector: PointData = { x: collisionVector.x / distance, y: collisionVector.y / distance };

    // Tính toán vector phản xạ đối xứng
    const dotProduct = moveVector.x * unitCollisionVector.x + moveVector.y * unitCollisionVector.y;
    const reflectionVector: PointData = {
        x: moveVector.x - 2 * dotProduct * unitCollisionVector.x,
        y: moveVector.y - 2 * dotProduct * unitCollisionVector.y
    };

    // Chuyển đổi vector phản xạ thành góc độ mới và cộng thêm 45 độ
    const rd = Math.random() < 0.5 ? -1 : 1;
    const newAngle = toDegrees(Math.atan2(reflectionVector.y, reflectionVector.x)) + 135 * rd;
    const newAngleRad = toRadians(newAngle);
    const adjustedVector: PointData = { x: Math.cos(newAngleRad), y: Math.sin(newAngleRad) };

    // Tính toán vị trí mới của c1 với khoảng cách mới là 32 pixels
    const newPosition: PointData = {
        x: c1.position.x + adjustedVector.x * Math.sqrt(64 * 64),
        y: c1.position.y + adjustedVector.y * Math.sqrt(64 * 64)
    };

    return newPosition;
}

export function changeEnumDirectionToAngle(direction: Direction): number | undefined {
    switch (direction) {
        case Direction.UP:
            return 0;
        case Direction.DOWN:
            return 180;
        case Direction.LEFT:
            return 270;
        case Direction.RIGHT:
            return 90;
        case Direction.UP_LEFT:
            return -45;
        case Direction.DOWN_RIGHT:
            return 45;
        case Direction.DOWN_LEFT:
            return 225;
        case Direction.UP_RIGHT:
            return 135;
        default:
            return undefined;
    }
}

