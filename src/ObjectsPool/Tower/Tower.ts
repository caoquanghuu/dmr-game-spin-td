import Emitter from '../../Util';
import { EffectType, FireBulletOption, TowerType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { AppConstants } from '../../GameScene/Constants';
import { Graphics, PointData, Sprite } from 'pixi.js';
import { AssetsLoader } from '../../AssetsLoader';

export class Tower extends BaseObject {
    private _effectArena: number;
    public effectType: EffectType;
    private _towerType: TowerType;
    private _dame: number;
    private _goldCost: number;
    private _upGradeCost: number;
    protected fireTimeCd: number = 2000;
    protected target: PointData;
    public time: number;
    private _level: number = 1;
    public baseTower: Sprite;
    public circleImage: Sprite;
    private _item: BaseObject[] = [];


    constructor(towerType: TowerType) {
        super(towerType);
        this._towerType = towerType;
        this.speed = 100;
        this.image.width = 32;
        this.image.height = 60;
        this.circleImage = new Sprite(AssetsLoader.getTexture('circle'));
        this.circleImage.anchor = 0.5;
        this.circleImage.alpha = 50;
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

    get dame(): number {
        return this._dame;
    }

    set dame(dame: number) {
        this._dame = dame;
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


    public reset() {
        // reset property of tower to default when it return to pool
    }

    public toggleCircle(isVisible: boolean) {
        this.circleImage.visible = isVisible;
    }

    public upgrade() {
        this._level += 1;
        this._dame = this._dame * this._level;
        this.speed = this.speed * this._level;
        this.effectArena += 15;
        this._upGradeCost = this._goldCost * this._level;
    }

    public fire(target: PointData) {
        if (this.fireTimeCd > 0) return;
        const option: FireBulletOption = { position: this.position, target: target, towerType: this.towerType, dame: this.dame, speed: this.speed * 3, effectType: this.effectType };
        Emitter.emit(AppConstants.event.fireBullet, option);
        this.target = { x: target.x, y: target.y };
        this.fireTimeCd = 2000;

    }

    public update(dt: number): void {
        this.fireTimeCd -= dt;
        if (this.circleImage) {
            this.circleImage.angle += 1;

        }
    }
}