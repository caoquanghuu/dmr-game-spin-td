import { BitmapText, Container, PointData, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import { AllyTanksType, FlyUnitType, GetPlayerGoldFn } from '../../Type';
import { AssetsLoader } from '../../AssetsLoader';
import { sound } from '@pixi/sound';
import Emitter from '../../Util';

export class BuyUnitBoard extends Container {
    private _buyAbleUnits: Sprite[] = [];
    private _time: {timeConst: number, timeCount: number} = { timeConst: 1000, timeCount: 0 };
    private _getPlayerGoldFn: GetPlayerGoldFn;

    constructor(getPlayerGoldCb: GetPlayerGoldFn) {
        super();

        this._getPlayerGoldFn = getPlayerGoldCb;

        const flyUnitLength = Object.keys(FlyUnitType).length;
        const allyUnitLength = Object.keys(AllyTanksType).length;
        const positionXInContainerRatio = AppConstants.optionBoardSize.width / (flyUnitLength + allyUnitLength + 1);
        const firstIconPosition: PointData = { x: positionXInContainerRatio, y : AppConstants.optionBoardSize.height / 2 };
        for (const [key, value] of Object.entries(AllyTanksType)) {

            const unitIcon = new Sprite(AssetsLoader.getTexture(`${value}-icon`));
            unitIcon.width = AppConstants.matrixSize * 2;
            unitIcon.height = AppConstants.matrixSize * 2;
            unitIcon.anchor = 0.5;
            unitIcon.position = { x: firstIconPosition.x, y: firstIconPosition.y };

            unitIcon.eventMode = 'static';
            unitIcon.cursor = 'pointer';
            unitIcon.on('pointerdown', () => {
                this._createUnit(value, unitIcon);
            });

            this._buyAbleUnits.push(unitIcon);

            // create tower price
            const unitPriceText = new BitmapText({
                text: `${AppConstants.unitPrice.allyTank[key]}`,
                style: {
                    fontFamily: 'font_number',
                    fontSize: 15,
                }
            });
            unitPriceText.anchor = 0.5;
            unitPriceText.position = { x: firstIconPosition.x, y: firstIconPosition.y + unitIcon.height / 2 };
            this.addChild(unitIcon, unitPriceText);

            firstIconPosition.x += positionXInContainerRatio;
        }


    }

    private _createUnit(name: string, unitIcon: Sprite) {
        // send to tower controller to create ally unit on type of unit
        if (this._time.timeCount < this._time.timeConst) {
            unitIcon.tint = 'red';
            setTimeout(() => {
                unitIcon.tint = 'white';
            }, 200);
            return;
        }

        if (this._getPlayerGoldFn() < AppConstants.unitPrice.allyTank[name]) {
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.notEnoughGold });
            unitIcon.tint = 'red';
            setTimeout(() => {
                unitIcon.tint = 'white';
            }, 200);
        } else {
            Emitter.emit(AppConstants.event.createUnit, { name: name });
            this._time.timeCount = 0;
        }


    }

    public update(dt: number) {
        this._time.timeCount += dt;
    }

}