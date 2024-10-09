import { BitmapText, Container, PointData, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import Emitter from '../../Util';
import { AllyTanksType, FlyUnitType } from '../../Type';
import { AssetsLoader } from '../../AssetsLoader';
import { sound } from '@pixi/sound';

export class BasicBoard extends Container {
    private _wave: BitmapText;
    private _waveNumber: BitmapText;
    private _baseHp: BitmapText;
    private _baseHpNumber: BitmapText;
    private _playerGold: BitmapText;
    private _playerGoldNumber: BitmapText;
    private _buyAbleUnits: Sprite[] = [];

    constructor() {
        super();
        this._init();
        this._useEventEffect();

    }

    private _init() {
        this._wave = new BitmapText(AppConstants.text.wave);
        this._wave.position = { x: AppConstants.position.wave.x, y: AppConstants.position.wave.y };

        this._baseHp = new BitmapText(AppConstants.text.baseHp);
        this._baseHp.position = { x: AppConstants.position.baseHp.x, y: AppConstants.position.baseHp.y };

        this._playerGold = new BitmapText(AppConstants.text.gold);
        this._playerGold.position = { x: AppConstants.position.gold.x, y: AppConstants.position.gold.y };


        this._waveNumber = new BitmapText(AppConstants.text.waveNumber);

        this._waveNumber.position = { x: AppConstants.position.waveNumber.x, y: AppConstants.position.waveNumber.y };

        this._playerGoldNumber = new BitmapText(AppConstants.text.goldNumber);

        this._playerGoldNumber.position = { x: AppConstants.position.goldNumber.x, y: AppConstants.position.goldNumber.y };

        this._baseHpNumber = new BitmapText(AppConstants.text.baseHpNumber);

        this._baseHpNumber.position = { x: AppConstants.position.baseNumber.x, y: AppConstants.position.baseNumber.y };

        this.addChild(this._wave, this._waveNumber, this._baseHp, this._baseHpNumber, this._playerGold, this._playerGoldNumber);


        const flyUnitLength = Object.keys(FlyUnitType).length;
        const allyUnitLength = Object.keys(AllyTanksType).length;


        const positionXInContainerRatio = AppConstants.appWidth / (flyUnitLength + allyUnitLength + 1);
        const firstIconPosition: PointData = { x: positionXInContainerRatio, y : this.height / 2 };


        for (const [key, value] of Object.entries(AllyTanksType)) {

            const unitIcon = new Sprite(AssetsLoader.getTexture(`${value}-icon`));
            unitIcon.width = AppConstants.matrixSize * 2;
            unitIcon.height = AppConstants.matrixSize * 2;
            unitIcon.anchor = 0.5;
            unitIcon.position = { x: firstIconPosition.x, y: firstIconPosition.y };

            unitIcon.eventMode = 'static';
            unitIcon.cursor = 'pointer';
            unitIcon.on('pointerdown', () => {
                this._createUnit(value);
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
            unitPriceText.position = { x: firstIconPosition.x, y: this.height / 2 + unitIcon.height / 2 };
            // this.addChild(unitIcon, unitPriceText);

            firstIconPosition.x += positionXInContainerRatio;
        }

        const bg = new Sprite(AssetsLoader.getTexture('information-background'));
        bg.width = AppConstants.basicBoardSize.width;
        bg.height = AppConstants.basicBoardSize.height;
        bg.zIndex = -1;
        this.addChild(bg);

    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.displayWave, (wave: number) => {
            this.displayWaveNumber(wave);
        });
    }

    private _createUnit(name: string) {
        // send to tower controller to create unit on type of unit
        if (this._playerGoldNumber < AppConstants.unitPrice.allyTank[name]) {
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.notEnoughGold });
        } else {
            Emitter.emit(AppConstants.event.createUnit, { name: name });
        }

    }

    public displayWaveNumber(wave: number | string): void {
        this._waveNumber.text = wave;
    }
    public displayGoldNumber(gold: number | string): void {
        this._playerGoldNumber.text = gold;
    }
    public displayBaseHp(hp: number | string): void {
        this._baseHpNumber.text = hp;
    }
}