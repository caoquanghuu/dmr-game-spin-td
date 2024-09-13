import { Container, Sprite } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';
import { AppConstants } from './Constants';

export class GameScene extends Container {

    constructor() {
        super();
        const logo = new Sprite(AssetsLoader.getTexture('logo'));
        logo.width = AppConstants.appWidth;
        logo.height = AppConstants.appHeight;
        this.addChild(logo);
    }

    public init() {

    }

    private _useEventEffect(): void {

    }


    public update(dt: number) {


    }

}