import { CreateEnemiesOption, GetEnemiesFromPoolFn, GetExplosionFromPoolFn, GetMatrixMapFn, ReturnEnemiesToPoolFn, ReturnExplosionToPoolFn, SetMatrixMapFn } from 'src/Type';
import { Tank } from '../ObjectsPool/Enemies/Tank';
import { AnimatedSprite, PointData } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import EnemiesOption from '../ObjectsPool/Enemies/Enemies.json';
import { AssetsLoader } from '../AssetsLoader';

export class UnitController {
    private _units: Tank[] = [];
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

    get units(): Tank[] {
        return this._units;
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.removeEnemy, (id: number) => {
            this._removeUnit(id);
        });
        Emitter.on(AppConstants.event.createUnit, (info: {option: CreateEnemiesOption, position: PointData, isEne: boolean, wave: number }) => {
            this._createUnit(info.option, info.position, info.isEne, info.wave);
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


    private _createUnit(option: CreateEnemiesOption, position: PointData, isEne: boolean, wave?: number): Tank {
        const unit = this._getEnemiesFromPool();
        unit.image.texture = AssetsLoader.getTexture(`${option.name}`);
        unit.isEne = isEne;
        unit.position = position;
        unit.image.zIndex = AppConstants.zIndex.enemy;
        unit.hpBar.zIndex = AppConstants.zIndex.enemyHpBar;
        unit.HP = option.HP;
        unit.dameDeal = option.dame;
        unit.speed = option.speed;
        unit.startMove();

        if (isEne) {
            unit.matrixValue = AppConstants.matrixMapValue.enemy;
            unit.targetValue = AppConstants.matrixMapValue.nuclearBase;
            unit.goldReward = wave + 1;

        } else {
            unit.targetValue = AppConstants.matrixMapValue.enemy;
            unit.matrixValue = AppConstants.matrixMapValue.ally;

        }

        this._units.push(unit);


        Emitter.emit(AppConstants.event.addChildToScene, unit.image);
        Emitter.emit(AppConstants.event.addChildToScene, unit.hpBar);


        return unit;
    }

    private _removeUnit(id: number) {
        const i = this._units.findIndex(unit => {
            return unit.id === id;
        });

        const unit = this._units[i];

        unit.reset();
        this._returnEnemiesToPool(unit);

        const matrixPosition = unit.getMatrixPosition();
        this._getMatrixMapCb()[matrixPosition.x][matrixPosition.y] = AppConstants.matrixMapValue.availableMoveWay;

        // create animation explosion
        const explosion: AnimatedSprite = this._getExplosionFromPool(AppConstants.textureName.tankExplosionAnimation);
        explosion.position = unit.position;
        explosion.width = unit.image.width * 2;
        explosion.height = unit.image.height * 2;

        explosion.gotoAndPlay(0);
        Emitter.emit(AppConstants.event.addChildToScene, explosion);
        explosion.onComplete = () => {

            this._returnExplosionToPool(explosion, AppConstants.textureName.tankExplosionAnimation);

            Emitter.emit(AppConstants.event.removeChildFromScene, explosion);
        };

        Emitter.emit(AppConstants.event.removeChildFromScene, unit.image);
        Emitter.emit(AppConstants.event.removeChildFromScene, unit.hpBar);

        this._units.splice(i, 1);

        // send event plus gold for player
        if (unit.isEne) {
            Emitter.emit(AppConstants.event.plusGold, unit.goldReward);
        }

    }

    public update(dt: number) {
    // reset matrix map on move way
        this._getMatrixMapCb().forEach((row, idxX) => row.forEach((col, idxY) => {
            if (col === AppConstants.matrixMapValue.enemy || col === AppConstants.matrixMapValue.ally) {
                this._setMatrixMapCb(idxX, idxY, AppConstants.matrixMapValue.availableMoveWay);
            }
        }));
        this._units.forEach(unit => {
            // update and assign ene position on matrix map
            const matrixPosition = unit.update(dt);
            if (matrixPosition && this._getMatrixMapCb()[matrixPosition.x][matrixPosition.y] === AppConstants.matrixMapValue.availableMoveWay) {

                if (unit.isEne) {
                    this._setMatrixMapCb(matrixPosition.x, matrixPosition.y, AppConstants.matrixMapValue.enemy);
                } else {
                    this._setMatrixMapCb(matrixPosition.x, matrixPosition.y, AppConstants.matrixMapValue.ally);
                }

            }

        });

        this._time += dt;

        // create enemy for time
        if (this._isCreateEne) {
            if (this._time >= 1000) {
                if (this._eneCount.eneCount === this._eneCount.eneConst) {
                    this._isCreateEne = false;
                    this._eneCount.eneConst = 0;
                    this._eneCount.eneCount = 0;
                    return;
                }
                this._createUnit(this._enemiesOption, this._eneStartPosition, true, this._wave);
                this._eneCount.eneCount++;
                this._time = 0;
            }
        }
    }
}