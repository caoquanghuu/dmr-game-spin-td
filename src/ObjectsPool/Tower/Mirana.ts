import { TowerType } from 'src/Type';
import { Tower } from './Tower';
import { AppConstants } from 'src/GameScene/Constants';

export class Mirana extends Tower {
    constructor() {
        super(TowerType.MIRANA);
        this.dame = AppConstants.dame.Mirana;
        this.effectArena = AppConstants.effectArena.Mirana;
        this.goldCost = AppConstants.goldCost.Mirana;
    }
}