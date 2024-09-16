import { TowerType } from 'src/Type';
import { Tower } from './Tower';
import { AppConstants } from 'src/GameScene/Constants';

export class CrystalMaiden extends Tower {
    constructor() {
        super(TowerType.CRYSTAL_MAIDEN);
        this.dame = AppConstants.dame.CM;
        this.effectArena = AppConstants.effectArena.CM;
        this.goldCost = AppConstants.goldCost.CM;
    }
}