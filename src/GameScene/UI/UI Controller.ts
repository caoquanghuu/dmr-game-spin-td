import { Container, Graphics } from 'pixi.js';
import { AppConstants } from '../Constants';

export class UIController extends Container {
    constructor() {
        super();
        const graphics = new Graphics();
        graphics.rect(0, 0, AppConstants.UISize.width, AppConstants.UISize.height);
        graphics.fill('adf49f');
        this.addChild(graphics);
        
    }
}