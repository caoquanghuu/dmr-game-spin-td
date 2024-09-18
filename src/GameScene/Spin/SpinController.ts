import { Container, Graphics } from 'pixi.js';
import { AppConstants } from '../Constants';

export class SpinController extends Container {

    constructor() {
        super();

        const graphics = new Graphics();
        graphics.rect(0, 0, AppConstants.SpinSize.width, AppConstants.SpinSize.height);
        graphics.fill('f49fe7');

    }
}