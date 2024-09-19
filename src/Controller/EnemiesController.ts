import { EnemiesType, GetEnemiesFromPoolFn, ReturnEnemiesToPoolFn } from 'src/Type';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { PointData } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';

export class EnemiesController {
    private _enemies: Enemies[] = [];
    private _getEnemiesFromPool: GetEnemiesFromPoolFn;
    private _returnEnemiesToPool: ReturnEnemiesToPoolFn;

    constructor(getEnemiesFromPoolCB: GetEnemiesFromPoolFn, returnEnemiesToPoolCB: ReturnEnemiesToPoolFn) {
        this._getEnemiesFromPool = getEnemiesFromPoolCB;
        this._returnEnemiesToPool = returnEnemiesToPoolCB;
        this._useEventEffect();
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.createEnemy, (option: { position: PointData, enemyType: EnemiesType}) => {
            this._createEnemies(option.enemyType, option.position);
        });
        Emitter.on(AppConstants.event.removeEnemy, (id: number) => {
            this._removeEnemies(id);
        });
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

    private _removeEnemies(id: number) {
        const i = this._enemies.findIndex(ene => {
            return ene.id === id;
        });

        const ene = this._enemies[i];
        ene.isMoving = false;
        this._returnEnemiesToPool(ene);

        Emitter.emit(AppConstants.event.removeChildFromScene, ene.image);

        this._enemies.splice(i, 1);
    }


    public update(dt: number) {
        this._enemies.forEach(ene => {
            ene.update(dt);
        });
    }
}