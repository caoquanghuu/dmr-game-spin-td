import { TowerType } from '../../Type';
import { Tower } from '../Tower/Tower';
import { AppConstants } from '../../GameScene/Constants';

export class Tinker extends Tower {
    constructor() {
        super(TowerType.TINKER);
        this.dame = AppConstants.dame.Tinker;
        this.effectArena = AppConstants.effectArena.Tinker;
        this.goldCost = AppConstants.goldCost.Tinker;
    }
}