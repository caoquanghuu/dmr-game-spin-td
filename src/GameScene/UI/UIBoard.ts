import { Container, Graphics } from 'pixi.js';
import { AppConstants } from '../Constants';
import { UIController } from '../../Controller/UIController';

export class UIBoard extends Container {
    private _UIController: UIController;
    constructor() {
        super();
        const graphics = new Graphics();
        graphics.rect(0, 0, AppConstants.UISize.width, AppConstants.UISize.height);
        graphics.fill('adf49f');
        this.addChild(graphics);

        this._UIController = new UIController(this._addToBoard.bind(this), this._removeFromBoard.bind(this));
    }

    private _addToBoard(container: Container): void {
        this.addChild(container);
    }

    private _removeFromBoard(container: Container): void {
        this.removeChild(container);
    }
}