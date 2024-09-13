import { Container, Graphics, Sprite } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';
import { AppConstants } from './Constants';
import { GameMap } from './Map/Map';
import { UIController } from './UI/UI Controller';
import { SpinController } from './Spin/SpinController';

export class GameScene extends Container {
    private _map: GameMap;
    private _UIController: UIController;
    private _spinController: SpinController;

    constructor() {
        super();
        // const logo = new Sprite(AssetsLoader.getTexture('logo'));
        // logo.width = AppConstants.appWidth;
        // logo.height = AppConstants.appHeight;
        // this.addChild(logo);

        this._map = new GameMap();
        this._UIController = new UIController();
        this._UIController.position = { x: 0, y: AppConstants.mapSize.height };
        this._spinController = new SpinController();
        this._spinController.position = { x: AppConstants.mapSize.width, y: 0 };
        this.addChild(this._map, this._UIController, this._spinController);

    }

    public init() {

    }

    private _useEventEffect(): void {

    }


    public update(dt: number) {


    }

}