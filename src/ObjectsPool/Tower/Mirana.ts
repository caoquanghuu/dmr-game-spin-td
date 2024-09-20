import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AppConstants } from '../../GameScene/Constants';
import { AssetsLoader } from '../../AssetsLoader';

export class Mirana extends Tower {
    constructor() {
        super(TowerType.mirana);
        this.dame = AppConstants.dame.Mirana;
        this.effectArena = AppConstants.effectArena.Mirana;
        this.goldCost = AppConstants.goldCost.Mirana;
        this.image.width = 25;
        this.time = 0;
    }

    private _animateTexture() {
        if (this.time <= 200) {
            this.image.texture = AssetsLoader.getTexture('mirana-2');
        } else if (this.time <= 400) {
            this.image.texture = AssetsLoader.getTexture('mirana-3');
        } else if (this.time <= 600) {
            this.image.texture = AssetsLoader.getTexture('mirana');
            this.time = 0;
        }
    }

    public update(dt: number) {
        this.time += dt;
        this._fireTimeCd -= dt;
        this._animateTexture();
    }
}