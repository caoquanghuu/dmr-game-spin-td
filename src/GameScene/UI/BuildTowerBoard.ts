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

        // create exit button
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
        this.addChild(exitText);

        const positionXInContainerRatio = AppConstants.appWidth / (Object.keys(TowerType).length + 1);
        const firstIconPosition: PointData = { x: positionXInContainerRatio, y : 65 };

        // loop tower type
        for (const [key, value] of Object.entries(TowerType)) {
            // create tower icon as tower type
            const towerIcon = new Sprite(AssetsLoader.getTexture(`${value}-icon`));
            towerIcon.width = 65;
            towerIcon.height = 65;
            towerIcon.anchor = 0.5;
            towerIcon.position = { x: firstIconPosition.x, y: firstIconPosition.y};
            towerIcon.eventMode = 'static';
            towerIcon.cursor = 'pointer';
            towerIcon.on('pointerdown', () => {
                this.createTower(value);
            });
            this.addChild(towerIcon);

            this._towerCanBuildIcon.push(towerIcon);

            // create tower price
            const towerPriceText = new BitmapText({
                text: `${AppConstants.towerPrice[key]}`,
                style: {
                    fontFamily: 'font_number',
                    fontSize: 15,
                }
            });
            towerPriceText.anchor = 0.5;
            towerPriceText.position = { x: firstIconPosition.x, y: 85 };
            this.addChild(towerPriceText);

            firstIconPosition.x += positionXInContainerRatio;
        }
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
       
        let goldCost: number = AppConstants.towerPrice[towerType];

    
        // in case not enough
        if (playerGold < goldCost) {
            // set animate not enough gold
            return;
        }

        // in case enough gold
        Emitter.emit(AppConstants.event.createTower, { towerType: towerType, position: { x: this.towerPosition.x, y: this.towerPosition.y - 25 } });
        Emitter.emit(AppConstants.event.reduceGold, goldCost);
        Emitter.emit(AppConstants.event.resetBoard, null);
    }
    private async _init() {
    }
}