import { EnemiesType, GetEnemiesFromPoolFn, ReturnBulletToPoolFn } from 'src/Type';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { PointData } from 'pixi.js';
import Emitter from 'src/Util';
import { AppConstants } from 'src/GameScene/Constants';

export class EnemiesController {
    private _enemies: Enemies[] = [];
    private _getEnemiesFromPool: GetEnemiesFromPoolFn;
    private _returnEnemiesToPool: ReturnBulletToPoolFn;

    constructor(getEnemiesFromPoolCB: GetEnemiesFromPoolFn, returnEnemiesToPoolCB: ReturnBulletToPoolFn) {
        this._getEnemiesFromPool = getEnemiesFromPoolCB;
        this._returnEnemiesToPool = returnEnemiesToPoolCB;
    }

    private _createEnemies(enemyType: EnemiesType, position: PointData) {
        const ene = this._getEnemiesFromPool(enemyType);
        ene.position = position;
        ene.HP = 10;
        ene.dameDeal = 1;
        ene.isMoving = true;

        Emitter.emit(AppConstants.event.addChildToScene, ene.image);

        this._enemies.push(ene);
    }


    public update(dt: number) {
        this._enemies.forEach(ene => {
            ene.update(dt);
        });
    }
}