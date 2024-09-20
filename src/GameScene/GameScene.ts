import { Container } from 'pixi.js';
import { AppConstants } from './Constants';
import { GameMap } from './Map/Map';
import { UIBoard } from './UI/UIBoard';
import { SpinController } from './Spin/SpinController';
import { ObjectPool } from '../ObjectsPool/ObjectPool';

export class GameScene extends Container {
    private _map: GameMap;
    private _UIBoard: UIBoard;
    // private _spinController: SpinController;
    private _objectPool: ObjectPool;

    constructor() {
        super();
        // const logo = new Sprite(AssetsLoader.getTexture('logo'));
        // logo.width = AppConstants.appWidth;
        // logo.height = AppConstants.appHeight;
        // this.addChild(logo);

        this._map = new GameMap();
        this._UIBoard = new UIBoard();
        this._UIBoard.position = { x: 0, y: AppConstants.mapSize.height };
        this._UIBoard.width = AppConstants.appWidth;
        this._UIBoard.height = AppConstants.UISize.height;
        // this._UIBoard.width = AppConstants.appWidth;
        // this._UIBoard.height = AppConstants.UISize.height;
        // this._spinController = new SpinController();
        // this._spinController.position = { x: AppConstants.mapSize.width, y: 0 };
        this.addChild(this._map, this._UIBoard);
        this._objectPool = new ObjectPool();

    }

    public init() {

    }

    private _useEventEffect(): void {

    }


    public update(dt: number) {
        this._map.update(dt);

    }

}