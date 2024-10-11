import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AssetsLoader } from '../../AssetsLoader';
import { AppConstants } from '../../GameScene/Constants';

export class Mirana extends Tower {
    constructor() {
        super(TowerType.mirana);
        this.buildingSize = { x: 1, y: 1 };
        this.image.anchor.set(0, 0.3);
        this.init();
    }

    private _animateTexture() {
        if (this.time <= 200) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.mirana3);
        } else if (this.time <= 400) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.mirana2);
        } else if (this.time <= 600) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.mirana1);
            this.time = 0;
        }
    }

    public update(dt: number) {
        this.time += dt;
        super.update(dt);
        this._animateTexture();
    }
}