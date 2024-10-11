import { Assets, Container } from 'pixi.js';
import { AppConstants } from './Constants';
import { GameMap } from './Map/Map';
import { UIBoard } from './UI/UIBoard';
import { AssetsLoader } from '../AssetsLoader';
import { sound } from '@pixi/sound';
import Emitter, { createBitMapText, createImage } from '../Util';
import { SaveGameData } from '../Type';
import { loadGame, saveGame } from '../../tools/SaveGameData';

export class GameScene extends Container {
    private _map: GameMap;
    private _UIBoard: UIBoard;
    private _startGameBoard: Container;
    private _endGameBoard: Container;
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
        this._createEndGameBoard();
        sound.add(AppConstants.soundName.mainSound, { url: `${Assets.get('game-sound').resources[0]}`, sprites: Assets.get('game-sound').spritemap });
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
            this._startGame();
            this._map.startGame();


        });

        loadGameButton.eventMode = 'static';
        loadGameButton.cursor = 'pointer';
        loadGameButton.on('pointerdown', async () => {
            const isLoaded: boolean = this._loadGame();
            // no data then cant load
            if (!isLoaded) return;

            this._startGame();

        });

        this.addChild(this._startGameBoard);
    }

    /**
     * method start game by render or stop render boards, play sounds
     */
    private _startGame() {
        // stop render start board
        this._startGameBoard.renderable = false;
        // render map and ui board
        this._UIBoard.renderable = true;
        this._map.renderable = true;
        this._isGameStart = true;

        // add and play theme sound
        sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.battleControlOnline });
        sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.mainMusic, loop: true });
    }

    /**
     * method to create end game board
     */
    private _createEndGameBoard() {
        this._endGameBoard = new Container();
        const background = createImage({ texture: 'logo', width: AppConstants.appWidth, height: AppConstants.appHeight });
        const endGameImage = createImage({ texture: 'victory-background', width: AppConstants.matrixSize * 15, height: AppConstants.appHeight, anchor: 0.5 });
        endGameImage.position = { x: AppConstants.matrixSize * 15, y: AppConstants.matrixSize * 10 };

        const menuButtonOption = AppConstants.menuButtonOption;
        const playAgainButton = createImage(menuButtonOption);
        playAgainButton.position = { x: AppConstants.matrixSize * 15, y: AppConstants.matrixSize * 15 };

        const playAgainText = createBitMapText({ content: 'Play Again', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        playAgainText.position = playAgainButton.position;

        this._endGameBoard.addChild(background, endGameImage, playAgainButton, playAgainText);

        // set event for play again image\
        playAgainButton.eventMode = 'static';
        playAgainButton.cursor = 'pointer';
        playAgainButton.on('pointerdown', () => {
            this._endGameBoard.renderable = false;
            this._map.renderable = true;
            this._UIBoard.renderable = true;
            this._isGameStart = true;
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.battleControlOnline });
        });

        // change texture of result background
        Emitter.on(AppConstants.event.gameOver, (isVictory: boolean) => {
            if (isVictory) {
                endGameImage.texture = AssetsLoader.getTexture('victory-background');
            } else {
                endGameImage.texture = AssetsLoader.getTexture('defeated-background');
            }
            this._isGameStart = false;
        });

        this.addChild(this._endGameBoard);
        this._endGameBoard.renderable = false;
    }

    public reset() {
        this._isGameStart = false;
        // reset map first
        this._map.reset();
        this._UIBoard.reset();
    }

    private _useEventEffect(): void {
        // eslint-disable-next-line no-unused-vars
        Emitter.on(AppConstants.event.gameOver, (isVictory: boolean) => {
            this._isGameStart = false;
            this.reset();
            this._UIBoard.renderable = false;
            this._map.renderable = false;
            this._endGameBoard.renderable = true;
        });

        Emitter.on(AppConstants.event.saveGame, () => {
            this._autoSaveGame();
        });
    }

    private _autoSaveGame() {
        const mapData = this._map.getDataOnMap();
        const uiData: {gold: number, hp: number, isSoundMute: boolean} = this._UIBoard.getUiData();

        const data: SaveGameData = { wave: mapData.wave, gold: uiData.gold, towers: mapData.towers, nuclearBaseHp: mapData.nuclearBaseHp, soundOption: uiData.isSoundMute };

        // save game to local storage
        saveGame(data);
    }

    private _loadGame(): boolean {
        const data: SaveGameData = loadGame();
        if (!data) return false;
        // build tower first avoid when create tower player gold become < 0
        this._map.saveDataOnMap({ wave:data.wave, towers: data.towers, nuclearBaseHp: data.nuclearBaseHp });

        // set player base hp, and gold
        this._UIBoard.saveUiData({ gold: data.gold, playerHp: data.nuclearBaseHp, wave: data.wave, isSoundMute: data.soundOption });
        return true;
    }


    public update(dt: number) {
        if (!this._isGameStart) return;
        this._map.update(dt);
        this._UIBoard.update(dt);

    }

}