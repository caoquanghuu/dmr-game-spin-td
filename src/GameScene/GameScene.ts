import { Assets, Container, Sprite } from 'pixi.js';
import { AppConstants } from './Constants';
import { GameMap } from './Map/Map';
import { UIBoard } from './UI/UIBoard';
import { AssetsLoader } from '../AssetsLoader';
import { sound } from '@pixi/sound';
import Emitter, { createBitMapText, createImage } from '../Util';

export class GameScene extends Container {
    private _map: GameMap;
    private _UIBoard: UIBoard;
    private _startGameBoard: Container;
    private _isGameStart: boolean = false;

    constructor() {
        super();
        this._useEventEffect();

        this._map = new GameMap();
        this._UIBoard = new UIBoard();
        this._UIBoard.position = { x: 0, y: AppConstants.mapSize.height };
        this._UIBoard.width = AppConstants.appWidth;
        this._UIBoard.height = AppConstants.UISize.height;
        this._map.renderable = false;
        this._UIBoard.renderable = false;
        this.addChild(this._map, this._UIBoard);
        this._createStartGameBoard();
    }

    /**
     * method create start game board which will be display when player open game
     */
    private _createStartGameBoard() {
        // create container
        this._startGameBoard = new Container();

        // add logo
        const logo = createImage({ texture:'logo', width: AppConstants.appWidth, height:AppConstants.appHeight });

        const menuButtonOption = AppConstants.menuButtonOption;
        const startButton = createImage(menuButtonOption);
        startButton.position = { x: AppConstants.matrixSize * 10, y: AppConstants.matrixSize * 17 };
        const loadGameButton = createImage(menuButtonOption);
        loadGameButton.position = { x: AppConstants.matrixSize * 20, y: AppConstants.matrixSize * 17 };

        const startText = createBitMapText({ content: 'start mission', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        startText.position = startButton.position;
        const loadGameText = createBitMapText({ content: 'load previous', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        loadGameText.position = loadGameButton.position;

        this._startGameBoard.addChild(logo, startButton, loadGameButton, startText, loadGameText);

        // define event for buttons
        startButton.eventMode = 'static';
        startButton.cursor = 'pointer';
        startButton.on('pointerdown', () => {
            // stop render start board
            this._startGameBoard.renderable = false;
            // render map and ui board
            this._UIBoard.renderable = true;
            this._map.renderable = true;
            this._isGameStart = true;


            this._map.startGame();

            // add and play theme sound
            sound.add(AppConstants.soundName.mainSound, { url: `${Assets.get('game-sound').resources[0]}`, sprites: Assets.get('game-sound').spritemap });
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.battleControlOnline });
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.mainMusic, loop: true });

        });

        this.addChild(this._startGameBoard);
    }

    public reset() {
        this._isGameStart = false;
        this._UIBoard.reset();
        this._map.reset();
    }

    private _useEventEffect(): void {
        Emitter.on(AppConstants.event.gameOver, (isVictory: boolean) => {
            this._isGameStart = false;
            this.reset();
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


            this.addChild(gameOverBg);
            this.addChild(resultBg);

            gameOverBg.eventMode = 'static';
            gameOverBg.cursor = 'pointer';
            gameOverBg.on('pointerdown', () => {
                this._isGameStart = true;
                this.removeChild(gameOverBg);
                this.removeChild(resultBg);
                this._map.renderable = true;
                this._UIBoard.renderable = true;
            });
        });

    }


    public update(dt: number) {
        if (!this._isGameStart) return;
        this._map.update(dt);
        this._UIBoard.update(dt);

    }

}