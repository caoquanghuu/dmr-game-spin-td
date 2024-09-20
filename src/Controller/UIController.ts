import { AppConstants } from '../GameScene/Constants';
import { UIBasicBoard } from '../GameScene/UI/UIBasicBoard';
import { AddToBoardFn, RemoveFromBoardFb } from '../Type';

export class UIController {
    private _playerGold: number;
    private _playerHp: number;
    private _wave: number;
    private _basicBoard: UIBasicBoard;
    private _addToBoardFn: AddToBoardFn;
    private _removeFromBoardFn: RemoveFromBoardFb;

    constructor(addToBoardCb: AddToBoardFn, removeFromBoardCb: RemoveFromBoardFb) {
        this._addToBoardFn = addToBoardCb;
        this._removeFromBoardFn = removeFromBoardCb;
        this._playerGold = 10;
        this._playerHp = 50;
        this._wave = 0;
        this._basicBoard = new UIBasicBoard(this._playerGold, this._wave, this._playerHp);
        this._basicBoard.scale = 1;

        this._addToBoardFn(this._basicBoard);
    }

    private _mainUiBoard() {

    }
}