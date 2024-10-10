import { BitmapText, Container, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import Emitter from '../../Util';
import { AssetsLoader } from '../../AssetsLoader';

export class BasicBoard extends Container {
    private _wave: BitmapText;
    private _waveNumber: BitmapText;
    private _baseHp: BitmapText;
    private _baseHpNumber: BitmapText;
    private _playerGold: BitmapText;
    private _playerGoldNumber: BitmapText;

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