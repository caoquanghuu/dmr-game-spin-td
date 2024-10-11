import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AssetsLoader } from '../../AssetsLoader';
import { AppConstants } from '../../GameScene/Constants';

export class Tinker extends Tower {

    constructor() {
        super(TowerType.tinker);
        this.buildingSize = { x: 1, y: 1 };
        this.image.anchor.set(0, 0.28);
        this.init();
    }

    private _animateTexture(dt: number) {
        this.time += dt;
        if (this.time <= 200) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.tinker1);
        } else {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.tinker2);
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