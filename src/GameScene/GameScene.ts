import { Container, Sprite } from 'pixi.js';
import { AppConstants } from './Constants';
import { GameMap } from './Map/Map';
import { UIBoard } from './UI/UIBoard';
import { ObjectPool } from '../ObjectsPool/ObjectPool';
import { AssetsLoader } from '../AssetsLoader';
import Emitter from '../Util';

export class GameScene extends Container {
    private _map: GameMap;
    private _UIBoard: UIBoard;
    private _isGameStart: boolean = false;
    // private _spinController: SpinController;
    private _objectPool: ObjectPool;

    constructor() {
        super();
        this._useEventEffect();
        const logo = new Sprite(AssetsLoader.getTexture('logo'));
        logo.width = AppConstants.appWidth;
        logo.height = AppConstants.appHeight;
        logo.eventMode = 'static';
        logo.on('pointerdown', () => {
            this._UIBoard.renderable = true;
            this._map.renderable = true;
            this._isGameStart = true;
        });
        this.addChild(logo);

        this._map = new GameMap();
        this._UIBoard = new UIBoard();
        this._UIBoard.position = { x: 0, y: AppConstants.mapSize.height };
        this._UIBoard.width = AppConstants.appWidth;
        this._UIBoard.height = AppConstants.UISize.height;
        this._map.renderable = false;
        this._UIBoard.renderable = false;
        this.addChild(this._map, this._UIBoard);
        this._objectPool = new ObjectPool();

    }

    public init() {

    }

    private _useEventEffect(): void {
        Emitter.on(AppConstants.event.gameOver, () => {
            this._UIBoard.renderable = false;
            this._map.renderable = false;

            const gameOverBg = new Sprite(AssetsLoader.getTexture('logo'));
            this._isGameStart = false;

            this.addChild(gameOverBg);
        });

    }


    public update(dt: number) {
        if (!this._isGameStart) return;
        this._map.update(dt);

    }

}