import { BitmapText, Container, Sprite, Text } from 'pixi.js';
import { BaseObject } from 'src/ObjectsPool/BaseObject';
import { AppConstants } from '../Constants';

export class BasicBoard extends Container {
    private _wave: BitmapText;
    private _waveNumber: BitmapText;
    private _baseHp: BitmapText;
    private _baseHpNumber: BitmapText;
    private _playerGold: BitmapText;
    private _playerGoldNumber: BitmapText;
    private _item: BaseObject[] = [];
    private _spin: BitmapText;

    constructor() {
        super();
        this._init();

    }

    private _init() {
        this._wave = new BitmapText(AppConstants.text.wave);
        this._wave.position = { x: AppConstants.position.wave.x, y: AppConstants.position.wave.y };

        this._baseHp = new BitmapText(AppConstants.text.baseHp);
        this._baseHp.position = { x: AppConstants.position.baseHp.x, y: AppConstants.position.baseHp.y };

        this._playerGold = new BitmapText(AppConstants.text.gold);
        this._playerGold.position = { x: AppConstants.position.gold.x, y: AppConstants.position.gold.y };

        this._spin = new BitmapText(AppConstants.text.spin);
        this._spin.position = { x: AppConstants.position.spin.x, y: AppConstants.position.spin.y };
        this._spin.eventMode = 'static';
        this._spin.cursor = 'pointer';
        this._spin.on('pointerdown', () => {
            // spin
        });

        this._waveNumber = new BitmapText(AppConstants.text.waveNumber);

        this._waveNumber.position = { x: AppConstants.position.waveNumber.x, y: AppConstants.position.waveNumber.y };

        this._playerGoldNumber = new BitmapText(AppConstants.text.goldNumber);

        this._playerGoldNumber.position = { x: AppConstants.position.goldNumber.x, y: AppConstants.position.goldNumber.y };

        this._baseHpNumber = new BitmapText(AppConstants.text.baseHpNumber);

        this._baseHpNumber.position = { x: AppConstants.position.baseNumber.x, y: AppConstants.position.baseNumber.y };

        this.addChild(this._wave, this._waveNumber, this._baseHp, this._baseHpNumber, this._playerGold, this._playerGoldNumber, this._spin);

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