import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AssetsLoader } from '../../AssetsLoader';

export class Tinker extends Tower {

    constructor() {
        super(TowerType.tinker);
        this.init();
    }

    private _animateTexture(dt: number) {
        this.time += dt;
        if (this.time <= 200) {
            this.image.texture = AssetsLoader.getTexture('laser-tower-2');
        } else {
            this.image.texture = AssetsLoader.getTexture('laser-tower-1');
        }
        if (this.time > 400) {
            this.time = 0;
        }
    }
    public update(dt: number): void {
        super.update(dt);
        this._animateTexture(dt);
    }
}