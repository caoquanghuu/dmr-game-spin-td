import { CreateEnemiesOption, GetEnemiesFromPoolFn, ReturnEnemiesToPoolFn } from 'src/Type';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { PointData } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import EnemiesOption from '../ObjectsPool/Enemies/Enemies.json';
import { AssetsLoader } from '../AssetsLoader';

export class EnemiesController {
    private _enemies: Enemies[] = [];
    private _getEnemiesFromPool: GetEnemiesFromPoolFn;
    private _returnEnemiesToPool: ReturnEnemiesToPoolFn;

    constructor(getEnemiesFromPoolCB: GetEnemiesFromPoolFn, returnEnemiesToPoolCB: ReturnEnemiesToPoolFn) {
        this._getEnemiesFromPool = getEnemiesFromPoolCB;
        this._returnEnemiesToPool = returnEnemiesToPoolCB;
        this._useEventEffect();
    }

    get enemies(): Enemies[] {
        return this._enemies;
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.removeEnemy, (id: number) => {
            this._removeEnemies(id);
        });
    }

    public spawnWave(wave: number, position: PointData) {
        // create enemies, set position, hp, move speed , texture base on current wave
        const enemiesOption = EnemiesOption.alias[wave - 1];
        const enePosition: PointData = { x: position.x, y: position.y };
        for (let i = 0; i <= enemiesOption.eneCount; i ++) {
            this._createEnemies(enemiesOption, enePosition);
            enePosition.y -= 100;
        }
    }

    private _createEnemies(option: CreateEnemiesOption, position: PointData) {
        const ene = this._getEnemiesFromPool();
        ene.image.texture = AssetsLoader.getTexture(`${option.name}`);
        ene.position = position;
        ene.image.zIndex = 4;
        ene.hpBar.zIndex = 5;
        ene.HP = option.HP;
        ene.dameDeal = option.dame;
        ene.speed = option.speed;
        ene.resetMove();
        ene.isMoving = true;

        Emitter.emit(AppConstants.event.addChildToScene, ene.image);
        Emitter.emit(AppConstants.event.addChildToScene, ene.hpBar);

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
        Emitter.emit(AppConstants.event.removeChildFromScene, ene.hpBar);

        this._enemies.splice(i, 1);

        // send event plus gold for player
        Emitter.emit(AppConstants.event.plusGold, ene.goldReward);
    }


    public update(dt: number) {
        this._enemies.forEach(ene => {
            ene.update(dt);
        });
    }
}