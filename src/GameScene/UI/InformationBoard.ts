import { BitmapText, Container, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import Emitter from '../../Util';
import { GetPlayerGoldFn, TowerInformation } from '../../Type';
import { AssetsLoader } from '../../AssetsLoader';
import { sound } from '@pixi/sound';

export class InformationBoard extends Container {
    private _dameNumber: BitmapText;
    private _speedNumber: BitmapText;
    private _levelNumber: BitmapText;
    private _effectType: BitmapText;
    private _goldUpgradeNumber: BitmapText;
    private _goldUpgrade: number;
    private _towerId: number;
    private _towerIcon: Sprite;

    private _getPlayerGoldFn: GetPlayerGoldFn;
    constructor(getPlayerGoldCb: GetPlayerGoldFn) {
        super();
        this._getPlayerGoldFn = getPlayerGoldCb;
        this._useEventEffect();
        this._init();
    }


    private _init() {
        // create text
        const style1 = {
            fontFamily: 'Desyrel',
            fontSize: 30
        };

        this._towerIcon = new Sprite();
        this._towerIcon.width = AppConstants.matrixSize * 3;
        this._towerIcon.height = AppConstants.matrixSize * 3;
        this._towerIcon.anchor = 0.5;
        this._towerIcon.position = { x: AppConstants.infoBoardPosition.towerIcon.x, y:AppConstants.infoBoardPosition.towerIcon.y };
        this.addChild(this._towerIcon);


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

        const upgradeText = new BitmapText({
            text: 'upgrade: ',
            style: style1
        });
        upgradeText.position = { x: AppConstants.infoBoardPosition.upgrade.x, y: AppConstants.infoBoardPosition.upgrade.y };
        upgradeText.eventMode = 'static';
        upgradeText.cursor = 'pointer';
        upgradeText.on('pointerdown', () => {
            // send upgrade event to tower controller
            this._upGradeTower();
        });

        const sellText = new BitmapText({
            text: 'sell',
            style: style1
        });
        sellText.position = { x: AppConstants.infoBoardPosition.sell.x, y: AppConstants.infoBoardPosition.sell.y };
        sellText.eventMode = 'static';
        sellText.cursor = 'pointer';
        sellText.tint = 'fe0606';
        sellText.on('pointerdown', () => {
            // send event sell tower to ui controller plus gold for player and tower controller remove tower
            Emitter.emit(AppConstants.event.destroyTower, this._towerId);
            Emitter.emit(AppConstants.event.plusGold, Math.floor(this._goldUpgrade / 3));
            Emitter.emit(AppConstants.event.resetBoard, null);
        });

        const exitText = new BitmapText({
            text: 'exit',
            style: style1,
        });
        exitText.position = { x: AppConstants.infoBoardPosition.exit.x, y: AppConstants.infoBoardPosition.exit.y };
        exitText.eventMode = 'static';
        exitText.cursor = 'pointer';
        exitText.tint = 'fe0606';
        exitText.on('pointerdown', () => {
            Emitter.emit(AppConstants.event.resetBoard, null);
        });

        this.addChild(dameText, speedText, levelText, effectText, upgradeText, exitText, sellText);


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

        this._goldUpgradeNumber = new BitmapText({
            text: '0',
            style: style2
        });
        this._goldUpgradeNumber.position = { x: AppConstants.infoBoardPosition.upgradeNumber.x, y: AppConstants.infoBoardPosition.upgradeNumber.y };

        this.addChild(this._effectType, this._dameNumber, this._levelNumber, this._speedNumber, this._goldUpgradeNumber);
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.displayTowerInfo, (option: TowerInformation) => {
            this._effectType.text = option.towerType;
            this._levelNumber.text = option.level;
            this._dameNumber.text = option.dame;
            this._speedNumber.text = option.speed;
            this._goldUpgradeNumber.text = option.goldUpgrade;
            this._goldUpgrade = option.goldUpgrade;
            this._towerId = option.towerId;
            this._towerIcon.texture = AssetsLoader.getTexture(`${option.towerType}-icon`);
        });
    }

    private _upGradeTower() {
        // check player gold
        const playerGold = this._getPlayerGoldFn();
        if (playerGold < this._goldUpgrade) {
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.notEnoughGold });
            return;
        }
        if (this._levelNumber.text === `${AppConstants.maxLevelOfTower}`) return;

        Emitter.emit(AppConstants.event.upgradeTower, { towerId: this._towerId, towerType: this._effectType.text });
        Emitter.emit(AppConstants.event.reduceGold, this._goldUpgrade);
        Emitter.emit(AppConstants.event.resetBoard, null);
    }
}