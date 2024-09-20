import { BitmapText, Container, PointData, Sprite } from 'pixi.js';
import { GetPlayerGoldFn, TowerType } from '../../Type';
import { AssetsLoader } from '../../AssetsLoader';
import { AppConstants } from '../Constants';
import Emitter from '../../Util';

export class BuildTowerBoard extends Container {
    private _towerPosition: PointData;
    private _towerCanBuildIcon: Sprite[] = [];
    private _getPlayerGoldFn: GetPlayerGoldFn;

    constructor(getPlayerGoldCb: GetPlayerGoldFn) {
        super();
        this._getPlayerGoldFn = getPlayerGoldCb;
        const towerIcon = new Sprite(AssetsLoader.getTexture('tinker-icon'));
        towerIcon.width = 65;
        towerIcon.height = 65;
        towerIcon.anchor = 0.5;
        this.addChild(towerIcon);
        towerIcon.position = { x: 100, y:60 };
        towerIcon.eventMode = 'static';
        towerIcon.cursor = 'pointer';
        towerIcon.on('pointerdown', () => {
            this.createTower(TowerType.tinker);
        });
        this._towerCanBuildIcon.push(towerIcon);

        const towerPriceText = new BitmapText({
            text: `${AppConstants.towerPrice.tinker}`,
            style: {
                fontFamily: 'font_number',
                fontSize: 15,
            }
        });
        towerPriceText.position = { x: 90, y: 70 };
        const exitText = new BitmapText({
            text: 'x',
            style: {
                fontFamily: 'Desyrel',
                fontSize: 30,
            }
        });
        exitText.position = { x: 900, y:  10 };
        exitText.eventMode = 'static';
        exitText.cursor = 'pointer';
        exitText.on('pointerdown', () => {
            Emitter.emit(AppConstants.event.resetBoard, null);
        });
        this.addChild(towerPriceText, exitText);
        this._init();
    }

    get towerPosition(): PointData {
        return this._towerPosition;
    }

    set towerPosition(pos: PointData) {
        this._towerPosition = { x: pos.x, y: pos.y };
    }

    public createTower(towerType: TowerType) {
        // get player gold
        const playerGold = this._getPlayerGoldFn();
        let isEnoughGold: boolean = false;
        let goldCost: number = 0;

        // compare player gold with price of tower
        switch (towerType) {
            case TowerType.tinker:
                if (playerGold >= AppConstants.towerPrice.tinker) isEnoughGold = true;
                goldCost = AppConstants.towerPrice.tinker;
                break;
            case TowerType.mirana:
                if (playerGold >= AppConstants.towerPrice.mirana) isEnoughGold = true;
                goldCost = AppConstants.towerPrice.mirana;
                break;
            case TowerType.crystal_maiden:
                if (playerGold >= AppConstants.towerPrice.cm) isEnoughGold = true;
                goldCost = AppConstants.towerPrice.cm;
                break;
            default:
        }

        // in case not enough
        if (!isEnoughGold) {
            // set animate not enough gold
            return;
        }

        // in case enough gold
        Emitter.emit(AppConstants.event.createTower, { towerType: towerType, position: { x: this.towerPosition.x, y: this.towerPosition.y - 25 } });
        Emitter.emit(AppConstants.event.reduceGold, goldCost);
        Emitter.emit(AppConstants.event.resetBoard, null);
    }
    private _init() {
        // Object.keys(TowerType).forEach((key, value) => {
        //     const towerIcon = new Sprite(AssetsLoader.getTexture(`${value}-icon`));
        //     towerIcon.width = 96;
        //     towerIcon.height = 96;
        //     towerIcon.anchor = 0.5;
        //     this._towerCanBuildIcon.push(towerIcon);
        // });

        // const positionXInContainerRatio = AppConstants.appWidth / this._towerCanBuildIcon.length;
        // const firstIconPosition: PointData = { x: positionXInContainerRatio, y : 37 };
        // this._towerCanBuildIcon.forEach(icon => {
        //     icon.position = { x: firstIconPosition.x, y: firstIconPosition.y };
        //     this.addChild(icon);
        //     firstIconPosition.x += positionXInContainerRatio;
        // });
    }
}