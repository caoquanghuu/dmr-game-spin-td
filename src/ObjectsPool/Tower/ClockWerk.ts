import { EffectType, TowerType } from "../../Type";
import { Tower } from "./Tower";
import { AppConstants } from "../../GameScene/Constants";
import { calculateAngleOfVector } from "../../Util";

export class ClockWerk extends Tower {
    constructor() {
        super(TowerType.clockwerk);
        this.dame = AppConstants.dame.ClockWerk;
        this.effectArena = AppConstants.effectArena.ClockWerk;
        this.goldCost = AppConstants.goldCost.ClockWerk;
        this.effectType = EffectType.BLAST;
        this.image.width = 25;
        this.image.height = 40;
        this.image.anchor.set(0.5, 0.3);
        this.time = 0;
    }

    private _rotateTowerFollowTarget() {
        if (!this.target) return;
        const direction = calculateAngleOfVector(this.position, this.target) + 90;
        // console.log(direction);
        // console.log(this.position);
    }

    public update(dt: number): void {
        this._fireTimeCd -= dt;
        this._rotateTowerFollowTarget();
    }
}