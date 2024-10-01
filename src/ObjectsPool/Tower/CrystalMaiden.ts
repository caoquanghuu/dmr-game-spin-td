import { EffectType, TowerType } from '../../Type';
import { Tower } from './Tower';

export class CrystalMaiden extends Tower {
    constructor() {
        super(TowerType.crystal_maiden);
        this.effectType = EffectType.SLOW;
        this.image.width = 26;
        this.image.height = 32;
        this.image.anchor.set(0.5, 0.2);

        this.init();

    }

    public update(dt: number): void {
        super.update(dt);
    }
}