import { EffectType, TowerType } from '../../Type';
import { Tower } from './Tower';
import { AppConstants } from '../../GameScene/Constants';

export class CrystalMaiden extends Tower {
    constructor() {
        super(TowerType.crystal_maiden);
        this.dame = AppConstants.dame.CM;
        this.effectArena = AppConstants.effectArena.CM;
        this.effectType = EffectType.SLOW;
        this.goldCost = AppConstants.towerPrice.crystal_maiden;
        this.upGradeCost = this.goldCost * 2;
        this.image.width = 26;
        this.image.height = 32;
        this.image.anchor.set(0.5, 0.2);

    }

    public update(dt: number): void {
        super.update(dt);
    }
}