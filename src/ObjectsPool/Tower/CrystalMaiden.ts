import { AppConstants } from '../../GameScene/Constants';
import { EffectType, TowerType } from '../../Type';
import { Tower } from './Tower';

export class CrystalMaiden extends Tower {
    constructor() {
        super(TowerType.crystal_maiden);
        this.effectType = EffectType.SLOW;
        this.image.width = 0.8 * AppConstants.matrixSize;
        this.image.height = AppConstants.matrixSize;
        this.buildingSize = { x: 1, y: 1 };

        this.init();

    }

    public update(dt: number): void {
        super.update(dt);
    }
}