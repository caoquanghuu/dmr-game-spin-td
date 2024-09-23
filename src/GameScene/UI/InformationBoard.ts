import { BitmapText, Container } from 'pixi.js';
import { AppConstants } from '../Constants';
import Emitter from '../../Util';
import { TowerInformation } from '../../Type';

export class InformationBoard extends Container {
    private _dameNumber: BitmapText;
    private _speedNumber: BitmapText;
    private _levelNumber: BitmapText;
    private _effectType: BitmapText;
    constructor() {
        super();
        this._useEventEffect();
        this._init();
    }


    private _init() {
        // create text
        const style1 = {
            fontFamily: 'Desyrel',
            fontSize: 30
        };


        const dameText: BitmapText = new BitmapText({
            text: 'Dame:',
            style: style1
        });
        dameText.position = { x: AppConstants.infoBoardPosition.dame.x, y: AppConstants.infoBoardPosition.dame.y };

        const speedText: BitmapText = new BitmapText({
            text: 'Speed:',
            style: style1
        });
        speedText.position = { x: AppConstants.infoBoardPosition.speed.x, y: AppConstants.infoBoardPosition.speed.y };

        const levelText: BitmapText = new BitmapText({
            text: 'Level:',
            style: style1
        });
        levelText.position = { x: AppConstants.infoBoardPosition.level.x, y: AppConstants.infoBoardPosition.level.y };

        const effectText: BitmapText = new BitmapText({
            text: 'Effect:',
            style: style1
        });
        effectText.position = { x: AppConstants.infoBoardPosition.effect.x, y: AppConstants.infoBoardPosition.effect.y };

        this.addChild(dameText, speedText, levelText, effectText);


        // create number:
        const style2 = {
            fontFamily: 'font_number',
            fontSize: 30
        };

        this._dameNumber = new BitmapText({
            text: '0',
            style: style2
        });
        this._dameNumber.position = { x: AppConstants.infoBoardPosition.dameNumber.x, y: AppConstants.infoBoardPosition.dameNumber.y };

        this._speedNumber = new BitmapText({
            text: '0',
            style: style2
        });
        this._speedNumber.position = { x: AppConstants.infoBoardPosition.speedNumber.x, y: AppConstants.infoBoardPosition.speedNumber.y };

        this._levelNumber = new BitmapText({
            text: '0',
            style: style2
        });
        this._levelNumber.position = { x: AppConstants.infoBoardPosition.levelNumber.x, y: AppConstants.infoBoardPosition.levelNumber.y };

        this._effectType = new BitmapText({
            text: 'laser',
            style: style1
        });
        this._effectType.position = { x: AppConstants.infoBoardPosition.effectType.x, y: AppConstants.infoBoardPosition.effectType.y };

        this.addChild(this._effectType, this._dameNumber, this._levelNumber, this._speedNumber);
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.displayTowerInfo, (option: TowerInformation) => {
            this._effectType.text = option.towerType;
            this._levelNumber.text = option.level;
            this._dameNumber.text = option.dame;
            this._speedNumber.text = option.speed;
        });
    }
}