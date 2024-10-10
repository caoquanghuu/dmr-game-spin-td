import { BitmapText, Container, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import Emitter, { createBitMapText, createImage } from '../../Util';
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
        this._towerIcon = createImage({ texture: '', width: AppConstants.matrixSize * 3, height: AppConstants.matrixSize * 3, anchor: 0.5 });
        this._towerIcon.position = { x: AppConstants.infoBoardPosition.towerIcon.x, y:AppConstants.infoBoardPosition.towerIcon.y };
        this.addChild(this._towerIcon);


        const dameText: BitmapText = createBitMapText({ content: 'Damage:', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        dameText.position = { x: AppConstants.infoBoardPosition.dame.x, y: AppConstants.infoBoardPosition.dame.y };

        const speedText: BitmapText = createBitMapText({ content: 'Speed:', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        speedText.position = { x: AppConstants.infoBoardPosition.speed.x, y: AppConstants.infoBoardPosition.speed.y };

        const levelText: BitmapText = createBitMapText({ content: 'Level:', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        levelText.position = { x: AppConstants.infoBoardPosition.level.x, y: AppConstants.infoBoardPosition.level.y };

        const effectText: BitmapText = createBitMapText({ content: 'Effect:', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        effectText.position = { x: AppConstants.infoBoardPosition.effect.x, y: AppConstants.infoBoardPosition.effect.y };

        // upgrade button
        const upgradeButton = createImage({ texture: 'menu_bar', width: AppConstants.matrixSize * 6, height: AppConstants.matrixSize * 1.3, anchor: 0.5 });
        const upgradeText: BitmapText = createBitMapText({ content: 'Upgrade:', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        upgradeText.position = { x: AppConstants.infoBoardPosition.upgrade.x, y: AppConstants.infoBoardPosition.upgrade.y };
        upgradeButton.position = { x: AppConstants.infoBoardPosition.upgradeButton.x, y: AppConstants.infoBoardPosition.upgradeButton.y };
        upgradeButton.zIndex = -1;

        upgradeText.eventMode = 'static';
        upgradeText.cursor = 'pointer';
        upgradeText.on('pointerdown', () => {
            // send upgrade event to tower controller
            this._upGradeTower();
        });
        upgradeText.on('mouseenter', () => {
            upgradeText.tint = '4aeac8';
        });
        upgradeText.on('mouseleave', () => {
            upgradeText.tint = 'ffffff';
        });

        // sell button
        const sellButton = createImage({ texture: 'menu_bar', width: AppConstants.matrixSize * 3, height: AppConstants.matrixSize * 1.3, anchor: 0.5 });
        const sellText = createBitMapText({ content: 'Sell', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        sellText.position = { x: AppConstants.infoBoardPosition.sell.x, y: AppConstants.infoBoardPosition.sell.y };
        sellText.eventMode = 'static';
        sellText.cursor = 'pointer';
        sellText.on('pointerdown', () => {
            // send event sell tower to ui controller plus gold for player and tower controller remove tower
            Emitter.emit(AppConstants.event.destroyTower, this._towerId);
            Emitter.emit(AppConstants.event.plusGold, Math.floor(this._goldUpgrade / 3));
            Emitter.emit(AppConstants.event.resetBoard, null);
        });
        sellText.on('mouseenter', () => {
            sellText.tint = 'fe0606';
        });
        sellText.on('mouseleave', () => {
            sellText.tint = 'ffffff';
        });
        sellButton.position = { x: AppConstants.infoBoardPosition.sellButton.x, y: AppConstants.infoBoardPosition.sellButton.y };
        sellButton.zIndex = -1;
        // exit button
        const exitButton = createImage({ texture: 'menu_bar', width: AppConstants.matrixSize * 3, height : AppConstants.matrixSize * 1.3, anchor : 0.5 });
        const exitText = createBitMapText({ content: 'Exit', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor : 0.5 });
        exitText.position = { x: AppConstants.infoBoardPosition.exit.x, y: AppConstants.infoBoardPosition.exit.y };
        exitButton.position = { x: AppConstants.infoBoardPosition.exitButton.x, y: AppConstants.infoBoardPosition.exitButton.y };
        exitText.eventMode = 'static';
        exitText.cursor = 'pointer';
        exitText.on('pointerdown', () => {
            Emitter.emit(AppConstants.event.resetBoard, null);
        });
        exitText.on('mouseenter', () => {
            exitText.tint = 'fe0606';
        });
        exitText.on('mouseleave', () => {
            exitText.tint = 'ffffff';
        });

        // add text to game
        this.addChild(dameText, speedText, levelText, effectText, upgradeButton, upgradeText, exitButton, exitText, sellButton, sellText);


        // create number
        this._dameNumber = createBitMapText({ content: '0', font: AppConstants.bitmapTextFontName.fontNumber, size: AppConstants.matrixSize, anchor : 0.5 });
        this._dameNumber.position = { x: AppConstants.infoBoardPosition.dameNumber.x, y: AppConstants.infoBoardPosition.dameNumber.y };

        this._speedNumber = createBitMapText({ content: '0', font: AppConstants.bitmapTextFontName.fontNumber, size: AppConstants.matrixSize, anchor : 0.5 });
        this._speedNumber.position = { x: AppConstants.infoBoardPosition.speedNumber.x, y: AppConstants.infoBoardPosition.speedNumber.y };

        this._levelNumber = createBitMapText({ content: '0', font: AppConstants.bitmapTextFontName.fontNumber, size: AppConstants.matrixSize, anchor : 0.5 });
        this._levelNumber.position = { x: AppConstants.infoBoardPosition.levelNumber.x, y: AppConstants.infoBoardPosition.levelNumber.y };

        this._effectType = createBitMapText({ content: '0', font: AppConstants.bitmapTextFontName.fontAlpha, size: AppConstants.matrixSize, anchor: 0.5 });
        this._effectType.position = { x: AppConstants.infoBoardPosition.effectType.x, y: AppConstants.infoBoardPosition.effectType.y };
        this._effectType.anchor = { x: 0, y: 0.5 };
        this._goldUpgradeNumber = createBitMapText({ content: '0', font: AppConstants.bitmapTextFontName.fontNumber, size: AppConstants.matrixSize, anchor : 0.5 });
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