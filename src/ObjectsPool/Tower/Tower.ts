import Emitter from '../../Util';
import { EffectType, FireBulletOption, TowerType } from '../../Type';
import { BaseObject } from '../BaseObject';
import { AppConstants } from '../../GameScene/Constants';
import { PointData } from 'pixi.js';

export class Tower extends BaseObject {
    private _effectArena: number;
    private _effectType: EffectType;
    private _towerType: TowerType;
    private _dame: number;
    private _goldCost: number;
    private _upGradeCost: number;
    private _fireTimeCd: number;
    private _level: number = 1;
    private _item: BaseObject[] = [];


    constructor(towerType: TowerType) {
        super(towerType);

        this._towerType = towerType;
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

    public reset() {
        // reset property of tower to default when it return to pool
    }

    public upgrade() {
        this._level += 1;
        this._dame = this._dame * this._level;
        this.speed = this.speed * this._level;
        this.effectArena += 15;
        this._upGradeCost = this._goldCost * this._level;
    }

    public fire(target: PointData) {
        // use eventemitter fire bullet
        const option: FireBulletOption = { position: this.position, target: target, towerType: this.towerType, dame: this.dame, speed: this.speed };
        Emitter.emit(AppConstants.event.fireBullet, option);
    }

    private _changeTextureFollowDirection() {
        const direction = this.direction;
        this.image.angle = direction;
        // change texture or animation
    }

    public update(dt: number): void {
        this._fireTimeCd += dt;
        if (this._fireTimeCd > 3000) {
            // cd fire of tower
            this._fireTimeCd = 0;
        }

        this._changeTextureFollowDirection();
    }
}