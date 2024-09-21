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
        this.time = 0;
    }

    private _rotateTowerFollowTarget() {
        const direction = calculateAngleOfVector(this.position, this.target) + 90;
        console.log(direction);
    }

    public update(dt: number): void {
        this._rotateTowerFollowTarget();
    }
}