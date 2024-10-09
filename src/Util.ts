import { EventEmitter, PointData } from 'pixi.js';
import { Circle } from './Type';

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
