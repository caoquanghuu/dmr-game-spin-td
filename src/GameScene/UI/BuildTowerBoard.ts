import { BitmapText, Container, PointData, Sprite } from 'pixi.js';
import { GetPlayerGoldFn, TowerType } from '../../Type';
import { AssetsLoader } from '../../AssetsLoader';
import { AppConstants } from '../Constants';
import Emitter from '../../Util';
import { sound } from '@pixi/sound';

export class BuildTowerBoard extends Container {
    private _baseTower: Sprite;
    private _towerCanBuildIcon: Sprite[] = [];
    private _getPlayerGoldFn: GetPlayerGoldFn;

    constructor(getPlayerGoldCb: GetPlayerGoldFn) {
        super();
        this._getPlayerGoldFn = getPlayerGoldCb;

        // create exit button
        const exitText = new BitmapText({
            text: 'exit',
            style: {
                fontFamily: 'Desyrel',
                fontSize: 30,
            }
        });
        exitText.position = { x: AppConstants.matrixSize * 28, y:  10 };
        exitText.eventMode = 'static';
        exitText.cursor = 'pointer';
        exitText.on('pointerdown', () => {
            Emitter.emit(AppConstants.event.resetBoard, null);
        });
        this.addChild(exitText);

        const positionXInContainerRatio = AppConstants.appWidth / (Object.keys(TowerType).length + 1);
        const firstIconPosition: PointData = { x: positionXInContainerRatio, y : AppConstants.matrixSize * 2 };

        // loop tower type
        for (const [key, value] of Object.entries(TowerType)) {
            // create tower icon as tower type
            const towerIcon = new Sprite(AssetsLoader.getTexture(`${value}-icon`));
            towerIcon.width = AppConstants.matrixSize * 2;
            towerIcon.height = AppConstants.matrixSize * 2;
            towerIcon.anchor = 0.5;
            towerIcon.position = { x: firstIconPosition.x, y: firstIconPosition.y };
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
            towerPriceText.position = { x: firstIconPosition.x, y: AppConstants.matrixSize * 3 };
            this.addChild(towerPriceText);

            firstIconPosition.x += positionXInContainerRatio;
        }
    }

    get baseTower(): Sprite {
        return this._baseTower;
    }

    set baseTower(baseTW: Sprite) {
        this._baseTower = baseTW;
    }

    public createTower(towerType: TowerType) {
        // get player gold
        const playerGold = this._getPlayerGoldFn();

        const goldCost: number = AppConstants.towerPrice[towerType];


        // in case not enough
        if (playerGold < goldCost) {
            // set animate not enough gold
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.notEnoughGold });
            return;
        }

        // in case enough gold
        Emitter.emit(AppConstants.event.createTower, { towerType: towerType, baseTower: this._baseTower });
        Emitter.emit(AppConstants.event.reduceGold, goldCost);
        Emitter.emit(AppConstants.event.resetBoard, null);
    }
}