import { CreateEnemiesOption, GetEnemiesFromPoolFn, GetExplosionFromPoolFn, ReturnEnemiesToPoolFn, ReturnExplosionToPoolFn } from 'src/Type';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { AnimatedSprite, PointData } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import EnemiesOption from '../ObjectsPool/Enemies/Enemies.json';
import { AssetsLoader } from '../AssetsLoader';

export class EnemiesController {
    private _enemies: Enemies[] = [];
    private _getEnemiesFromPool: GetEnemiesFromPoolFn;
    private _returnEnemiesToPool: ReturnEnemiesToPoolFn;
    private _getExplosionFromPool: GetExplosionFromPoolFn;
    private _returnExplosionToPool: ReturnExplosionToPoolFn;

    constructor(getEnemiesFromPoolCB: GetEnemiesFromPoolFn, returnEnemiesToPoolCB: ReturnEnemiesToPoolFn, getExplosionFromPoolCB: GetExplosionFromPoolFn, returnExplosionToPoolCB: ReturnExplosionToPoolFn) {
        this._getEnemiesFromPool = getEnemiesFromPoolCB;
        this._returnEnemiesToPool = returnEnemiesToPoolCB;
        this._getExplosionFromPool = getExplosionFromPoolCB;
        this._returnExplosionToPool = returnExplosionToPoolCB;
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
        let time = 0;
        for (let i = 0; i <= enemiesOption.eneCount; i ++) {
            setTimeout(() => {
                this._createEnemies(enemiesOption, enePosition, wave);
            }, time);
            time += 500;

        }
    }

    private _createEnemies(option: CreateEnemiesOption, position: PointData, wave: number) {
        const ene = this._getEnemiesFromPool();
        ene.image.texture = AssetsLoader.getTexture(`${option.name}`);
        ene.position = position;
        ene.image.zIndex = AppConstants.zIndex.enemy;
        ene.hpBar.zIndex = AppConstants.zIndex.enemyHpBar;
        ene.HP = option.HP;
        ene.dameDeal = option.dame;
        ene.speed = option.speed;
        ene.goldReward = wave + 1;
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
        ene.resetMove();
        ene.isMoving = false;
        this._returnEnemiesToPool(ene);

        // create animation explosion
        const explosion: AnimatedSprite = this._getExplosionFromPool(AppConstants.textureName.tankExplosionAnimation);
        explosion.position = ene.position;
        explosion.width = ene.image.width * 2;
        explosion.height = ene.image.height * 2;

        explosion.gotoAndPlay(0);
        Emitter.emit(AppConstants.event.addChildToScene, explosion);
        explosion.onComplete = () => {

            this._returnExplosionToPool(explosion, AppConstants.textureName.tankExplosionAnimation);

            Emitter.emit(AppConstants.event.removeChildFromScene, explosion);
        };

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