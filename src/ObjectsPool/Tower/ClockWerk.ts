import { EffectType, TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { calculateAngleOfVector } from '../../Util';
import { AssetsLoader } from '../../AssetsLoader';
import { AppConstants } from '../../GameScene/Constants';

export class ClockWerk extends Tower {
    constructor() {
        super(TowerType.clockwerk);
        this.effectType = EffectType.BLAST;
        this.image.width = 0.7 * AppConstants.matrixSize;
        this.image.height = 1.25 * AppConstants.matrixSize;
        this.buildingSize = { x: 1, y: 1 };
        this.image.anchor.set(-0.2, -0.05);
        this.init();
    }

    private _rotateTowerFollowTarget() {
        if (!this.target) return;
        const direction = calculateAngleOfVector(this.position, this.target) + 90;
        if (direction > -45 && direction <= 45) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.clockwerk4);
            return;
        }

        if (direction > 45 && direction <= 135) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.clockwerk3);
            return;
        }

        if (direction > 135 && direction <= 225) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.clockwerk1);
            return;
        }

        if (direction > 225 && direction <= 270 || direction >= -90 && direction < 0) {
            this.image.texture = AssetsLoader.getTexture(AppConstants.textureName.towers.clockwerk2);
            return;
        }
    }

    public update(dt: number): void {
        super.update(dt);
        this._rotateTowerFollowTarget();
    }
}