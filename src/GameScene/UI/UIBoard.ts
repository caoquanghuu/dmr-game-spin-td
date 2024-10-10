import { Container } from 'pixi.js';
import { UIController } from '../../Controller/UIController';

export class UIBoard extends Container {
    private _UIController: UIController;
    constructor() {
        super();

        this._UIController = new UIController(this._addToBoard.bind(this), this._removeFromBoard.bind(this));
    }

    public getUiData(): {gold: number, hp: number} {
        const data = { gold: this._UIController.playerGold, hp: this._UIController.playerHp };
        return data;
    }

    /**
     * set data for ui controller to set and display wave, gold, hp
     * @param data data get from game scene
     */
    public saveUiData(data: {gold: number, playerHp: number, wave: number}) {
        this._UIController.setPlayerData(data);
    }
    private _addToBoard(container: Container): void {
        this.addChild(container);
    }

    private _removeFromBoard(container: Container): void {
        this.removeChild(container);
    }

    public reset() {
        this._UIController.reset();
    }

    public update(dt: number) {
        this._UIController.update(dt);
    }
}