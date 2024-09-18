import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AppConstants } from '../../GameScene/Constants';
import { AssetsLoader } from '../../AssetsLoader';

export class Tinker extends Tower {
    private _time: number = 0;
    constructor() {
        super(TowerType.tinker);
        this.dame = AppConstants.dame.Tinker;
        this.effectArena = AppConstants.effectArena.Tinker;
        this.goldCost = AppConstants.goldCost.Tinker;
    }

    private _animateTexture(dt: number) {
        this._time += dt;
        if (this._time <= 200) {
            this.image.texture = AssetsLoader.getTexture('laser-tower-2');
        } else {
            this.image.texture = AssetsLoader.getTexture('laser-tower-1');
        }
        if (this._time > 400) {
            this._time = 0;
        }
    }
    public update(dt: number): void {
        this._animateTexture(dt);
    }
}