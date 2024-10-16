import Emitter, { getRandomArbitrary } from '../../Util';
import { EffectType, FireBulletOption, FireTime, MinMax, TowerType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { AppConstants } from '../../GameScene/Constants';
import { PointData, Sprite } from 'pixi.js';
import { AssetsLoader } from '../../AssetsLoader';
import { sound } from '@pixi/sound';

export class Tower extends BaseObject {
    private _effectArena: number;
    public effectType: EffectType;
    private _towerType: TowerType;
    private _dame: MinMax = { min: 0, max: 0 };
    private _goldCost: number;
    private _upGradeCost: number;
    protected fireTimeCd: FireTime= { fireTimeConst: 0, fireTimeCount: 0 };
    protected target: PointData;
    protected isFireAble: boolean = true;
    protected isSpawnUnit: boolean = false;
    private _level: number = 1;
    public baseTower: Sprite[] = [];
    public circleImage: Sprite;
    private _upgradeLevelImage: Sprite;
    public buildingSize: PointData;
    // this main position of tower. This use to save data game
    private _towerMainMatrixPosition: PointData;


    constructor(towerType: TowerType, isAnimatedSprite?: boolean) {
        super(towerType, isAnimatedSprite);
        this._towerType = towerType;
        this.speed = 200;
        this.image.width = AppConstants.matrixSize;
        this.image.height = AppConstants.matrixSize * 1.9;
        this.circleImage = new Sprite(AssetsLoader.getTexture('circle'));
        this.circleImage.anchor = 0.5;
        this.circleImage.alpha = AppConstants.imageAlpha.towerCircle;
    }

    get towerMainMatrixPosition(): PointData {
        return { x: this._towerMainMatrixPosition.x, y: this._towerMainMatrixPosition.y };
    }

    set towerMainMatrixPosition(point: PointData) {
        this._towerMainMatrixPosition = { x: point.x, y: point.y };
    }

    get effectArena(): number {
        return this._effectArena;
    }

    set effectArena(effectArena: number) {
        this._effectArena = effectArena;
    }

    get towerType(): TowerType {
        return this._towerType;
    }

    set towerType(towerType: TowerType) {
        this._towerType = towerType;
    }

    get dame(): MinMax {
        return this._dame;
    }

    set dame(dame: MinMax) {
        this._dame.max = dame.max;
        this._dame.min = dame.min;
    }

    get goldCost(): number {
        return this._goldCost;
    }

    set goldCost(cost: number) {
        this._goldCost = cost;
    }

    get upGradeCost(): number {
        return this._upGradeCost;
    }

    set upGradeCost(cost: number) {
        this._upGradeCost = cost;
    }

    get level(): number {
        return this._level;
    }

    set level(lv: number) {
        this._level = lv;
    }

    get upGradeImage(): Sprite {
        return this._upgradeLevelImage;
    }

    set upGradeImage(img: Sprite) {
        this._upgradeLevelImage = img;
    }

    get fireTimeColdDown(): number {
        return this.fireTimeCd.fireTimeConst;
    }

    protected init() {
        this._level = 1;
        this._dame = { min: AppConstants.dame[`${this._towerType}`].min, max: AppConstants.dame[`${this._towerType}`].max };
        this.fireTimeCd.fireTimeConst = AppConstants.fireTimeCd[`${this._towerType}`].fireTimeConst;
        this._goldCost = AppConstants.towerPrice[`${this._towerType}`];
        this._upGradeCost = this._goldCost * 2;
        this._effectArena = AppConstants.effectArena[`${this._towerType}`];
        this.circleImage.width = this._effectArena * 2;
        this.circleImage.height = this._effectArena * 2;
        this.upGradeImage = new Sprite();

    }


    public reset() {
        // reset property of tower to default when it return to pool
        this._level = 1;
        this._dame = { min: AppConstants.dame[`${this._towerType}`].min, max: AppConstants.dame[`${this._towerType}`].max };
        this.fireTimeCd.fireTimeConst = AppConstants.fireTimeCd[`${this._towerType}`].fireTimeConst;
        this._goldCost = AppConstants.towerPrice[`${this._towerType}`];
        this._upGradeCost = this._goldCost * 2;
        this._effectArena = AppConstants.effectArena[`${this._towerType}`];
        this.circleImage.width = this._effectArena * 2;
        this.circleImage.height = this._effectArena * 2;
    }

    public toggleCircle(isVisible: boolean) {
        this.circleImage.visible = isVisible;
    }

    public upgrade() {
        this._level += 1;

        // change or add upgrade image for tower

        this._upgradeLevelImage.texture = AssetsLoader.getTexture(`upgrade-level-${this._level}`);
        this._upgradeLevelImage.position = { x: this.position.x + this.image.width * 3 / 4, y: this.position.y + this.image.height / 2 };
        this._upgradeLevelImage.width = AppConstants.matrixSize / 2;
        this._upgradeLevelImage.height = AppConstants.matrixSize / 2;
        this._upgradeLevelImage.anchor.set(0.5);
        this._upgradeLevelImage.alpha = AppConstants.imageAlpha.towerUpGradeIcon;
        this._upgradeLevelImage.zIndex = this.image.y + 1;
        Emitter.emit(AppConstants.event.addChildToScene, this._upgradeLevelImage);


        this._dame.max = AppConstants.dame[this._towerType].max * this._level;
        this._dame.min = AppConstants.dame[this._towerType].min * this._level;
        this.fireTimeCd.fireTimeConst -= this.fireTimeCd.fireTimeConst / 10 ;
        if (this.towerType === TowerType.crystal_maiden) {
            // more range fire for crystal maiden tower
            this.effectArena += this.effectArena / 6;
        } else {
            this.effectArena += this.effectArena / 8;
        }
        this.circleImage.width = this.effectArena * 2;
        this.circleImage.height = this.effectArena * 2;
        this._upGradeCost = this._goldCost * (this._level + 1);
    }

    public fire(target: PointData) {
        if (!this.isFireAble) return;
        if (this.fireTimeCd.fireTimeCount > 0) return;
        const dameDeal = getRandomArbitrary(this._dame);
        const option: FireBulletOption = { position: { x: this.image.position.x + this.image.width / 2, y: this.image.position.y }, target: target, towerType: this.towerType, dame: dameDeal, speed: this.speed * 3, effectType: this.effectType, isEneBullet: false };
        Emitter.emit(AppConstants.event.fireBullet, option);
        this.target = { x: target.x, y: target.y };
        this.fireTimeCd.fireTimeCount = this.fireTimeCd.fireTimeConst;
        // play sound
        sound.play(AppConstants.soundName.mainSound, { sprite: `${this.towerType}`, volume: 0.3 });

    }

    public update(dt: number): void {
        this.fireTimeCd.fireTimeCount -= dt;
        if (this.circleImage && this.circleImage.visible === true) {
            this.circleImage.angle += 0.5;
        }
    }
}