import { Assets, Container, Sprite } from 'pixi.js';
import { AppConstants } from './Constants';
import { GameMap } from './Map/Map';
import { UIBoard } from './UI/UIBoard';
import { AssetsLoader } from '../AssetsLoader';
import { sound } from '@pixi/sound';
import Emitter from '../Util';

export class GameScene extends Container {
    private _map: GameMap;
    private _UIBoard: UIBoard;
    private _isGameStart: boolean = false;

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
            Emitter.emit(AppConstants.event.gameStart, null);

            sound.add('my-sound', { url: `${Assets.get('game-sound').resources[0]}`, sprites: Assets.get('game-sound').spritemap });
            sound.play('my-sound', { sprite: 'battle-control-online' });
            sound.play('my-sound', { sprite: 'main-music', loop: true });

            logo.eventMode = 'none';


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
    }

    public init() {

    }

    private _useEventEffect(): void {
        Emitter.on(AppConstants.event.gameOver, (isVictory: boolean) => {
            this._UIBoard.renderable = false;
            this._map.renderable = false;

            const gameOverBg = new Sprite(AssetsLoader.getTexture('logo'));
            gameOverBg.width = AppConstants.appWidth;
            gameOverBg.height = AppConstants.appHeight;
            const resultBg = new Sprite();
            resultBg.height = AppConstants.appHeight;
            resultBg.anchor = 0.5;
            resultBg.position.x = AppConstants.appWidth / 2;
            resultBg.position.y = AppConstants.appHeight / 2;

            isVictory ? resultBg.texture = AssetsLoader.getTexture('victory-background') : resultBg.texture = AssetsLoader.getTexture('defeated-background');

            this._isGameStart = false;

            this.addChild(gameOverBg);
            this.addChild(resultBg);
        });

    }


    public update(dt: number) {
        if (!this._isGameStart) return;
        this._map.update(dt);
        this._UIBoard.update(dt);

    }

}