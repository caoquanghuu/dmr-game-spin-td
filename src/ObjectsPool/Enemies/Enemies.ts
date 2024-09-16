import { EnemiesType } from 'src/Type';
import { BaseObject } from '../BaseObject';
import { BaseEngine } from 'src/MoveEngine/BaseEngine';

export class Enemies extends BaseObject {
    private _HP: number;
    private _dameDeal: number;
    private _enemiesType: EnemiesType;
    constructor(enemiesType: EnemiesType) {
        super(enemiesType);
        this._enemiesType = enemiesType;
        this.moveEngine = new BaseEngine(true);
    }

    get HP(): number {
        return this._HP;
    }

    set HP(newHp: number) {
        this._HP = newHp;
    }

    get dameDeal(): number {
        return this._dameDeal;
    }

    set dameDeal(dame: number) {
        this._dameDeal = dame;
    }

    get enemiesType(): EnemiesType {
        return this._enemiesType;
    }

    private _checkEnemyStage() {
        if (this._HP === 0) {
            // send info that this was die.
        }
    }


    public update(dt: number): void {
        this.move(dt);
        this._checkEnemyStage();
    }
}