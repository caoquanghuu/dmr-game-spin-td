import { BuildTowerBoard } from '../GameScene/UI/BuildTowerBoard';
import { AppConstants } from '../GameScene/Constants';
import { BasicBoard } from '../GameScene/UI/BasicBoard';
import { AddToBoardFn, RemoveFromBoardFb } from '../Type';
import Emitter from '../Util';
import { PointData, Sprite } from 'pixi.js';
import { InformationBoard } from '../GameScene/UI/InformationBoard';

export class UIController {
    private _playerGold: number;
    private _playerHp: number;
    private _wave: number;
    private _basicBoard: BasicBoard;
    private _buildTowerBoard: BuildTowerBoard;
    private _infoTowerBoard: InformationBoard;
    private _addToBoardFn: AddToBoardFn;
    private _removeFromBoardFn: RemoveFromBoardFb;

    constructor(addToBoardCb: AddToBoardFn, removeFromBoardCb: RemoveFromBoardFb) {
        this._addToBoardFn = addToBoardCb;
        this._removeFromBoardFn = removeFromBoardCb;
        this._playerGold = 10000;
        this._playerHp = 50;
        this._wave = 0;
        this._basicBoard = new BasicBoard();
        this._basicBoard.scale = 1;
        this._basicBoard.displayBaseHp(this._playerHp);
        this._basicBoard.displayGoldNumber(this._playerGold);
        this._basicBoard.displayWaveNumber(this._wave);
        this._buildTowerBoard = new BuildTowerBoard(this._getPlayerGold.bind(this));
        this._buildTowerBoard.scale = 1;

        this._infoTowerBoard = new InformationBoard(this._getPlayerGold.bind(this));


        this._addToBoardFn(this._basicBoard);
        this._addToBoardFn(this._buildTowerBoard);
        this._addToBoardFn(this._infoTowerBoard);
        this._buildTowerBoard.renderable = false;
        this._infoTowerBoard.renderable = false;
        this._basicBoard.renderable = true;
        this._useEventEffect();
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.selectTowerBase, (baseSprite: Sprite) => {
            this._basicBoard.renderable = false;
            this._infoTowerBoard.renderable = false;
            this._buildTowerBoard.renderable = true;
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

        Emitter.on(AppConstants.event.resetBoard, () => {
            this._basicBoard.renderable = true;
            this._buildTowerBoard.renderable = false;
            this._infoTowerBoard.renderable = false;
        });

        Emitter.on(AppConstants.event.displayTowerInfo, (option) => {
            this._buildTowerBoard.renderable = false;
            this._basicBoard.renderable = false;
            this._infoTowerBoard.renderable = true;

        });
    }

    private _getPlayerGold(): number {
        return this._playerGold;
    }

    private _mainUiBoard() {

    }
}