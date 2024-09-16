import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AppConstants } from '../../GameScene/Constants';

export class Mirana extends Tower {
    constructor() {
        super(TowerType.MIRANA);
        this.dame = AppConstants.dame.Mirana;
        this.effectArena = AppConstants.effectArena.Mirana;
        this.goldCost = AppConstants.goldCost.Mirana;
    }
}