import { CreateEnemiesOption, GetEnemiesFromPoolFn, GetExplosionFromPoolFn, GetMatrixMapFn, ReturnEnemiesToPoolFn, ReturnExplosionToPoolFn, SetMatrixMapFn } from 'src/Type';
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
    private _getMatrixMapCb: GetMatrixMapFn;
    private _setMatrixMapCb: SetMatrixMapFn;
    private _isCreateEne: boolean = false;
    private _time: number = 0;
    private _enemiesOption: any;
    private _eneStartPosition: PointData;
    private _eneCount: {eneConst: number, eneCount: number} = { eneConst: 0, eneCount: 0 };
    private _wave: number;

    constructor(getEnemiesFromPoolCB: GetEnemiesFromPoolFn, returnEnemiesToPoolCB: ReturnEnemiesToPoolFn, getExplosionFromPoolCB: GetExplosionFromPoolFn, returnExplosionToPoolCB: ReturnExplosionToPoolFn, getMatrixMapCB: GetMatrixMapFn, setMatrixMapCB: SetMatrixMapFn) {
        this._getEnemiesFromPool = getEnemiesFromPoolCB;
        this._returnEnemiesToPool = returnEnemiesToPoolCB;
        this._getExplosionFromPool = getExplosionFromPoolCB;
        this._returnExplosionToPool = returnExplosionToPoolCB;
        this._getMatrixMapCb = getMatrixMapCB;
        this._setMatrixMapCb = setMatrixMapCB;
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
        // Create enemies, set position, hp, move speed, texture based on current wave
        this._enemiesOption = EnemiesOption.alias[wave - 1];
        this._eneStartPosition = { x: position.x * AppConstants.matrixSize, y: position.y * AppConstants.matrixSize + 1 };
        this._eneCount.eneConst = this._enemiesOption.eneCount;
        this._wave = wave;
        this._isCreateEne = true;
    }


    private _createEnemies(option: CreateEnemiesOption, position: PointData, wave: number): Enemies {
        const ene = this._getEnemiesFromPool();
        ene.image.texture = AssetsLoader.getTexture(`${option.name}`);
        ene.position = position;
        ene.image.zIndex = AppConstants.zIndex.enemy;
        ene.hpBar.zIndex = AppConstants.zIndex.enemyHpBar;
        ene.HP = option.HP;
        ene.dameDeal = option.dame;
        ene.speed = option.speed;
        ene.goldReward = wave + 1;
        ene.startMove();
        this._enemies.push(ene);


        Emitter.emit(AppConstants.event.addChildToScene, ene.image);
        Emitter.emit(AppConstants.event.addChildToScene, ene.hpBar);


        return ene;
    }

    private _removeEnemies(id: number) {
        const i = this._enemies.findIndex(ene => {
            return ene.id === id;
        });

        const ene = this._enemies[i];

        ene.reset();
        this._returnEnemiesToPool(ene);

        const matrixPosition = ene.getMatrixPosition();
        this._getMatrixMapCb()[matrixPosition.x][matrixPosition.y] = AppConstants.matrixMapValue.availableMoveWay;

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
        // this._calculateDistanceToNuclearBase(dt);
        this._getMatrixMapCb().forEach((row, idxX) => row.forEach((col, idxY) => {
            if (col === AppConstants.matrixMapValue.unit) {
                this._setMatrixMapCb(idxX, idxY, AppConstants.matrixMapValue.availableMoveWay);
            }
        }));
        this._enemies.forEach(ene => {
            const matrixPosition = ene.update(dt);
            if (matrixPosition && this._getMatrixMapCb()[matrixPosition.x][matrixPosition.y] === AppConstants.matrixMapValue.availableMoveWay) {

                this._setMatrixMapCb(matrixPosition.x, matrixPosition.y, AppConstants.matrixMapValue.unit);
            }

        });
        this._time += dt;
        if (this._isCreateEne) {
            if (this._time >= 1000) {
                if (this._eneCount.eneCount === this._eneCount.eneConst) {
                    this._isCreateEne = false;
                    this._eneCount.eneConst = 0;
                    return;
                }
                this._createEnemies(this._enemiesOption, this._eneStartPosition, this._wave);
                this._eneCount.eneCount++;
                this._time = 0;
            }
        }
    }
}