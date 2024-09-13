import { Container, Graphics } from 'pixi.js';
import { AppConstants } from '../Constants';

export class GameMap extends Container {
    constructor() {
        super();
        const graphics = new Graphics();
        graphics.rect (0, 0, AppConstants.mapSize.width, AppConstants.mapSize.height);
        graphics.fill('e5f293');
        this.addChild(graphics);
    }
}