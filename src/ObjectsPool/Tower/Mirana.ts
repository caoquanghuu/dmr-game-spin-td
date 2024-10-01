import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AssetsLoader } from '../../AssetsLoader';

export class Mirana extends Tower {
    constructor() {
        super(TowerType.mirana);
        this.init();
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
        super.update(dt);
        this._animateTexture();
    }
}