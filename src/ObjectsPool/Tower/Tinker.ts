import { TowerType } from 'src/Type';
import { Tower } from './Tower';
import { AppConstants } from 'src/GameScene/Constants';

export class Tinker extends Tower {
    constructor() {
        super(TowerType.TINKER);
        this.dame = AppConstants.dame.Tinker;
        this.effectArena = AppConstants.effectArena.Tinker;
        this.goldCost = AppConstants.goldCost.Tinker;
    }
}