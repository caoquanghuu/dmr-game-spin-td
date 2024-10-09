import { Container } from 'pixi.js';
import { UIController } from '../../Controller/UIController';

export class UIBoard extends Container {
    private _UIController: UIController;
    constructor() {
        super();

        this._UIController = new UIController(this._addToBoard.bind(this), this._removeFromBoard.bind(this));
    }

    private _addToBoard(container: Container): void {
        this.addChild(container);
    }

    private _removeFromBoard(container: Container): void {
        this.removeChild(container);
    }
}