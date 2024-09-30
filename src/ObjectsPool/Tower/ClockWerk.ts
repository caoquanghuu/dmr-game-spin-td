import { EffectType, TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AppConstants } from '../../GameScene/Constants';
import { calculateAngleOfVector } from '../../Util';
import { AssetsLoader } from '../../AssetsLoader';

export class ClockWerk extends Tower {
    constructor() {
        super(TowerType.clockwerk);
        this.dame = AppConstants.dame.ClockWerk;
        this.effectArena = AppConstants.effectArena.ClockWerk;
        this.goldCost = AppConstants.towerPrice.clockwerk;
        this.upGradeCost = this.goldCost * 3;
        this.effectType = EffectType.BLAST;
        this.fireTimeCd.fireTimeConstant = 1000;
        this.image.width = 25;
        this.image.height = 40;
        this.image.anchor.set(0.5, 0.3);
        this.time = 0;
    }

    private _rotateTowerFollowTarget() {
        if (!this.target) return;
        const direction = calculateAngleOfVector(this.position, this.target) + 90;
        if (direction > -45 && direction <= 45) {
            this.image.texture = AssetsLoader.getTexture('clockwerk-4');
            return;
        }

        if (direction > 45 && direction <= 135) {
            this.image.texture = AssetsLoader.getTexture('clockwerk-3');
            return;
        }

        if (direction > 135 && direction <= 225) {
            this.image.texture = AssetsLoader.getTexture('clockwerk');
            return;
        }

        if (direction > 225 && direction <= 270 || direction >= -90 && direction < 0) {
            this.image.texture = AssetsLoader.getTexture('clockwerk-2');
            return;
        }
    }

    public update(dt: number): void {
        super.update(dt);
        this._rotateTowerFollowTarget();
    }
}