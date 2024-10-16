import { BuildTowerBoard } from '../GameScene/UI/BuildTowerBoard';
import { AppConstants } from '../GameScene/Constants';
import { BasicBoard } from '../GameScene/UI/BasicBoard';
import { AddToBoardFn, RemoveFromBoardFb } from '../Type';
import Emitter from '../Util';
import { Container, Sprite } from 'pixi.js';
import { InformationBoard } from '../GameScene/UI/InformationBoard';
import { sound } from '@pixi/sound';
import { BuyUnitBoard } from '../GameScene/UI/BuyUnitBoard';
import { AssetsLoader } from '../AssetsLoader';

export class UIController {
    private _playerGold: number;
    private _playerHp: number;
    // 2 main board on player ui board
    private _basicBoard: BasicBoard;
    private _optionBoard: Container;

    // there board inside option board
    private _buildTowerBoard: BuildTowerBoard;
    private _infoTowerBoard: InformationBoard;
    private _buyUnitBoard: BuyUnitBoard;

    // sound mute or not
    private _isSoundMuted: boolean = false;
    // cb function add to main ui board
    private _addToBoardFn: AddToBoardFn;
    private _removeFromBoardFn: RemoveFromBoardFb;

    constructor(addToBoardCb: AddToBoardFn, removeFromBoardCb: RemoveFromBoardFb) {
        this._addToBoardFn = addToBoardCb;
        this._removeFromBoardFn = removeFromBoardCb;
        this._useEventEffect();

        // assign property
        this._playerGold = AppConstants.playerBasicProperty.playerGold;
        this._playerHp = AppConstants.playerBasicProperty.playerHp;

        // create basic board
        this._basicBoard = new BasicBoard();
        this._basicBoard.displayBaseHp(this._playerHp);
        this._basicBoard.displayGoldNumber(this._playerGold);
        this._basicBoard.displayWaveNumber(1);
        this._addToBoardFn(this._basicBoard);


        // create option board
        this._optionBoard = new Container();
        const bg = new Sprite(AssetsLoader.getTexture('option-background'));
        bg.width = AppConstants.appWidth;
        bg.height = AppConstants.optionBoardSize.height;
        bg.zIndex = -1;
        this._optionBoard.position = { x: AppConstants.optionBoardPosition.x, y: AppConstants.optionBoardPosition.y };
        this._optionBoard.addChild(bg);

        // create build tower board in side option board
        this._buildTowerBoard = new BuildTowerBoard(this._getPlayerGold.bind(this));
        // create tower information board
        this._infoTowerBoard = new InformationBoard(this._getPlayerGold.bind(this));
        // create buy unit board
        this._buyUnitBoard = new BuyUnitBoard(this._getPlayerGold.bind(this));

        // add to option board
        this._optionBoard.addChild(this._buildTowerBoard, this._infoTowerBoard, this._buyUnitBoard);

        // add option board to main ui board
        this._addToBoardFn(this._optionBoard);

        // invisible boards
        this._buildTowerBoard.renderable = false;
        this._infoTowerBoard.renderable = false;
    }

    get playerHp(): number {
        return this._playerHp;
    }

    set playerHp(hp: number) {
        this._playerHp = hp;
    }

    get playerGold(): number {
        return this._playerGold;
    }

    set playerGold(gold: number) {
        this._playerGold = gold;
    }

    get isSoundMute(): boolean {
        return this._isSoundMuted;
    }

    set isSoundMute(isMute: boolean) {
        this._isSoundMuted = isMute;
    }

    private _useEventEffect(): void {
        // display build tower board on event
        Emitter.on(AppConstants.event.selectTowerBase, (baseSprite: Sprite) => {
            this._infoTowerBoard.renderable = false;
            this._buyUnitBoard.renderable = false;
            this._buildTowerBoard.renderable = true;

            // assign base sprite
            this._buildTowerBoard.baseTower = baseSprite;
        });

        Emitter.on(AppConstants.event.plusGold, (goldPlus: number) => {
            this._playerGold += goldPlus;
            this._basicBoard.displayGoldNumber(this._playerGold);
        });

        Emitter.on(AppConstants.event.reduceGold, (goldReduce: number) => {
            this._playerGold -= goldReduce;
            this._basicBoard.displayGoldNumber(this._playerGold);
        });

        // reset option board to default
        Emitter.on(AppConstants.event.resetBoard, () => {
            this._buyUnitBoard.renderable = true;
            this._buildTowerBoard.renderable = false;
            this._infoTowerBoard.renderable = false;
        });

        Emitter.on(AppConstants.event.reduceBaseHp, (reduceCount: number) => {
            this._playerHp -= reduceCount;
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.baseBeAttacked });

            // check player current hp
            if (this._playerHp < 1) {
                //end game, send event to game scene told him stop game
                Emitter.emit(AppConstants.event.gameOver, false);
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.missionFail });
                return;
            }
            this._basicBoard.displayBaseHp(this._playerHp);
        });

        Emitter.on(AppConstants.event.displayTowerInfo, () => {
            this._buildTowerBoard.renderable = false;
            this._infoTowerBoard.renderable = true;
            this._buyUnitBoard.renderable = false;

        });

        // set sound play option mute of not
        Emitter.on(AppConstants.event.soundIconClicked, () => {
            if (this._isSoundMuted) {
                this._isSoundMuted = false;

                // send event change texture of icon
                Emitter.emit(AppConstants.event.toggleSound, true);

                // mute all sound
                sound.muteAll();
            } else {
                this._isSoundMuted = true;

                // send event change texture
                Emitter.emit(AppConstants.event.toggleSound, false);

                // play all sound
                sound.unmuteAll();
            }
        });
    }

    /**
     * method get data from ui board and assign and display them
     * @param data data get from game scene
     */
    public setPlayerData(data: {gold: number, playerHp: number, wave: number, isSoundMute: boolean}) {
        this._playerGold = data.gold;
        this._playerHp = data.playerHp;
        this._basicBoard.displayBaseHp(data.playerHp);
        this._basicBoard.displayGoldNumber(data.gold);
        this._basicBoard.displayWaveNumber(data.wave - 1);

        this._isSoundMuted = data.isSoundMute;
        if (data.isSoundMute) {
            sound.unmuteAll();
            Emitter.emit(AppConstants.event.toggleSound, false);
        } else {
            sound.muteAll();
            Emitter.emit(AppConstants.event.toggleSound, true);
        }
    }

    private _getPlayerGold(): number {
        return this._playerGold;
    }

    public reset() {
        this._playerHp = AppConstants.playerBasicProperty.playerHp;
        this._playerGold = AppConstants.playerBasicProperty.playerGold;
        this._basicBoard.displayBaseHp(AppConstants.playerBasicProperty.playerHp);
        this._basicBoard.displayGoldNumber(AppConstants.playerBasicProperty.playerGold);

        this._buyUnitBoard.renderable = true;
        this._buildTowerBoard.renderable = false;
        this._infoTowerBoard.renderable = false;
    }

    public update(dt: number) {
        this._buyUnitBoard.update(dt);
        this._basicBoard.displayBaseHp(this._playerHp);
        this._basicBoard.displayGoldNumber(this._playerGold);
    }
}