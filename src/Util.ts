import { EventEmitter, PointData } from 'pixi.js';

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
