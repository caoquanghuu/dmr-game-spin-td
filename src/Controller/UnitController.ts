import { CreateEnemiesOption, GetEnemiesFromPoolFn, GetExplosionFromPoolFn, GetMatrixMapFn, ReturnEnemiesToPoolFn, ReturnExplosionToPoolFn, SetMatrixMapFn } from '../Type';
import { Tank } from '../ObjectsPool/Enemies/Tank';
import { AnimatedSprite, PointData } from 'pixi.js';
import Emitter, { getRandomArbitrary } from '../Util';
import { AppConstants } from '../GameScene/Constants';
import EnemiesOption from '../ObjectsPool/Enemies/Enemies.json';
import { AssetsLoader } from '../AssetsLoader';
import { sound } from '@pixi/sound';

export class UnitController {
    private _enemies: Tank[] = [];
    private _allies: Tank[] = [];
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
    private _createEnemiesTime: number = 0;

    constructor(getEnemiesFromPoolCB: GetEnemiesFromPoolFn, returnEnemiesToPoolCB: ReturnEnemiesToPoolFn, getExplosionFromPoolCB: GetExplosionFromPoolFn, returnExplosionToPoolCB: ReturnExplosionToPoolFn, getMatrixMapCB: GetMatrixMapFn, setMatrixMapCB: SetMatrixMapFn) {
        this._getEnemiesFromPool = getEnemiesFromPoolCB;
        this._returnEnemiesToPool = returnEnemiesToPoolCB;
        this._getExplosionFromPool = getExplosionFromPoolCB;
        this._returnExplosionToPool = returnExplosionToPoolCB;
        this._getMatrixMapCb = getMatrixMapCB;
        this._setMatrixMapCb = setMatrixMapCB;
        this._useEventEffect();
    }

    get enemies(): Tank[] {
        return this._enemies;
    }

    get allies(): Tank[] {
        return this._allies;
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.removeEnemy, (info: {id: number, isEne: boolean}) => {
            this._removeUnit(info.id, info.isEne);
        });
        Emitter.on(AppConstants.event.createAllyUnit, (info: {op: CreateEnemiesOption, position: PointData}) => {
            this._createUnit(info.op, info.position, false);
        });
    }

    public spawnWave(wave: number, position: PointData) {
        // Create enemies, set position, hp, move speed, texture based on current wave
        this._enemiesOption = EnemiesOption.alias[wave - 1];
        this._eneStartPosition = { x: position.x * AppConstants.matrixSize, y: position.y * AppConstants.matrixSize };
        this._eneCount.eneConst = this._enemiesOption.eneCount;
        this._wave = wave;
        this._createEnemiesTime = 100 / (this._enemiesOption.speed / 1000);
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


        if (isEne) {
            unit.targetValue = AppConstants.matrixMapValue.nuclearBase;
            unit.matrixValue = AppConstants.matrixMapValue.enemy;

            unit.goldReward = wave + 1;
            this._enemies.push(unit);

        } else {
            unit.targetValue = AppConstants.matrixMapValue.enemy;
            unit.matrixValue = AppConstants.matrixMapValue.ally;
            this._allies.push(unit);

            // play sound rd
            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.unitReady });
            const rd2 = getRandomArbitrary({ min: 1, max: 3 });
            setTimeout(() => {
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName[`spawnAlly${rd2}`] });
            }, 500);
        }

        unit.startMove();


        Emitter.emit(AppConstants.event.addChildToScene, unit.image);
        Emitter.emit(AppConstants.event.addChildToScene, unit.hpBar);

        // debug by render enemy move on game
        // Emitter.emit(AppConstants.event.addChildToScene, unit.g1);
        // Emitter.emit(AppConstants.event.addChildToScene, unit.g2);


        return unit;
    }

    private _removeUnit(id: number, isEne: boolean) {
        let unit: Tank;
        let i: number;
        if (isEne) {
            i = this._enemies.findIndex(ene => {
                return ene.id === id;
            });
            unit = this._enemies[i];
        } else {
            i = this._allies.findIndex(ally => {
                return ally.id === id;
            });
            unit = this._allies[i];

            const rd = getRandomArbitrary({ min: 1, max: 2 });
            if (rd === 1) {
                sound.play(AppConstants.soundName.mainSound, { sprite:AppConstants.soundName.unitLost });
            }
        }

        // in case duplicate emitter call
        if (!unit) {
            return;
        }


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

        // debug by render enemy move on game
        // Emitter.emit(AppConstants.event.removeChildFromScene, unit.g1);
        // Emitter.emit(AppConstants.event.removeChildFromScene, unit.g2);

        if (isEne) {
            this._enemies.splice(i, 1);
        } else {
            this._allies.splice(i, 1);
        }

        // send event plus gold for player
        if (isEne) {
            Emitter.emit(AppConstants.event.plusGold, unit.goldReward);
        }

    }

    private _updateUnits(units: Tank[], dt: number) {
        // update for ene
        units.forEach(unit => {
            // update and assign ene position on matrix map
            unit.update(dt);
            const matrixPosition: PointData = unit.getMatrixPosition();
            if (matrixPosition.x < 0 || matrixPosition.x > 30 || matrixPosition.y < 0 || matrixPosition.y > 16) return;
            if (this._getMatrixMapCb()[matrixPosition.x][matrixPosition.y] === AppConstants.matrixMapValue.availableMoveWay) {


                this._setMatrixMapCb(matrixPosition.x, matrixPosition.y, AppConstants.matrixMapValue.enemy);
                // unit.g1.position = { x: matrixPosition.x * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: matrixPosition.y * AppConstants.matrixSize + AppConstants.matrixSize / 2 };

            }

            // set next direction of ene on matrix map have value of it and wont let other ene go in there

            // switch (unit.direction) {
            //     case Direction.DOWN:
            //         // avoid next position go out of map
            //         if (this._getMatrixMapCb().length < (matrixPosition.x + 1) || this._getMatrixMapCb()[0].length < (matrixPosition.y + 2)) return;
            //         if (this._getMatrixMapCb()[matrixPosition.x][matrixPosition.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x, matrixPosition.y + 1, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: (matrixPosition.y + 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;
            //     case Direction.UP:
            //         // avoid next position go out of map
            //         if (this._getMatrixMapCb().length < (matrixPosition.x + 1) || (matrixPosition.y - 2) < 0) return;
            //         if (this._getMatrixMapCb()[matrixPosition.x][matrixPosition.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x, matrixPosition.y - 1, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: (matrixPosition.y - 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;
            //     case Direction.RIGHT:
            //         // avoid next position go out of map
            //         if (this._getMatrixMapCb().length < (matrixPosition.x + 2) || this._getMatrixMapCb()[0].length < (matrixPosition.y + 1)) return;
            //         if (this._getMatrixMapCb()[matrixPosition.x + 1][matrixPosition.y] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x + 1, matrixPosition.y, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x + 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: matrixPosition.y * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;
            //     case Direction.LEFT:
            //         // avoid next position go out of map
            //         if ((matrixPosition.x - 2) < 0 || this._getMatrixMapCb()[0].length < (matrixPosition.y + 1)) return;
            //         if (this._getMatrixMapCb()[matrixPosition.x - 1][matrixPosition.y] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x - 1, matrixPosition.y, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x - 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: matrixPosition.y * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;
            //     case Direction.DOWN_LEFT:
            //         // avoid next position go out of map
            //         if ((matrixPosition.x - 2 < 0) || this._getMatrixMapCb()[0].length < (matrixPosition.y + 2)) return;
            //         // if next position available then set value for that next matrix
            //         if (!this._getMatrixMapCb()[matrixPosition.x - 1][matrixPosition.y + 1]) return;
            //         if (this._getMatrixMapCb()[matrixPosition.x - 1][matrixPosition.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x - 1, matrixPosition.y + 1, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x - 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: (matrixPosition.y + 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;
            //     case Direction.DOWN_RIGHT:
            //         // avoid next position go out of map
            //         if (this._getMatrixMapCb().length < (matrixPosition.x + 2) || this._getMatrixMapCb()[0].length < (matrixPosition.y + 2)) return;
            //         // if next position available then set value for that next matrix
            //         if (this._getMatrixMapCb()[matrixPosition.x + 1][matrixPosition.y + 1] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x + 1, matrixPosition.y + 1, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x + 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: (matrixPosition.y + 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;
            //     case Direction.UP_LEFT:
            //         // avoid next position go out of map
            //         if ((matrixPosition.x - 2) < 0 || (matrixPosition.y - 2 < 0)) return;
            //         // if next position available then set value for that next matrix
            //         if (this._getMatrixMapCb()[matrixPosition.x - 1][matrixPosition.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x - 1, matrixPosition.y - 1, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x - 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: (matrixPosition.y - 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;
            //     case Direction.UP_RIGHT:
            //         // avoid next position go out of map
            //         if (this._getMatrixMapCb().length < (matrixPosition.x + 2) || (matrixPosition.y - 2) < 0) return;

            //         // if next position available then set value for that next matrix
            //         if (this._getMatrixMapCb()[matrixPosition.x + 1][matrixPosition.y - 1] === AppConstants.matrixMapValue.availableMoveWay) {
            //             this._setMatrixMapCb(matrixPosition.x + 1, matrixPosition.y - 1, AppConstants.matrixMapValue.enemy);

            //             // for debug ene matrix map
            //             // unit.g2.position = { x: (matrixPosition.x + 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: (matrixPosition.y - 1) * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
            //         }
            //         break;

            //     default:
            //         break;
            // }


            // // set value next position in case ene calculate next position
            // const nextMatrixPosition = unit.nextPosition;

            // if (nextMatrixPosition && this._getMatrixMapCb()[nextMatrixPosition.x][nextMatrixPosition.y] === AppConstants.matrixMapValue.availableMoveWay) {

            //     this._setMatrixMapCb(nextMatrixPosition.x, nextMatrixPosition.y, AppConstants.matrixMapValue.enemy);


            // }

        });
    }

    public reset() {
        const eneId = this._enemies.map(ene => ene.id);
        eneId.forEach(id => this._removeUnit(id, true));
        this._enemies = [];

        const allyId = this._allies.map(ally => ally.id);
        allyId.forEach(id => this._removeUnit(id, false));
        this._allies = [];

        this._isCreateEne = false;
        this._enemiesOption = null;
        this._eneCount = { eneConst: 0, eneCount: 0 };
        this._wave = 0;
        this._createEnemiesTime = 0;
    }

    public update(dt: number) {
    // reset matrix map on move way
        this._getMatrixMapCb().forEach((row, idxX) => row.forEach((col, idxY) => {
            if (col === AppConstants.matrixMapValue.enemy || col === AppConstants.matrixMapValue.ally) {
                this._setMatrixMapCb(idxX, idxY, AppConstants.matrixMapValue.availableMoveWay);
            }
        }));

        this._updateUnits(this._enemies, dt);
        this._updateUnits(this._allies, dt);

        this._time += dt;

        // create enemy for time
        if (this._isCreateEne) {
            if (this._time >= this._createEnemiesTime) {
                if (this._eneCount.eneCount >= this._eneCount.eneConst) {
                    this._isCreateEne = false;
                    this._eneCount.eneConst = 0;
                    this._eneCount.eneCount = 0;
                    return;
                }
                if (this._getMatrixMapCb()[(this._eneStartPosition.x) / AppConstants.matrixSize][(this._eneStartPosition.y) / AppConstants.matrixSize] === AppConstants.matrixMapValue.availableMoveWay) {
                    this._createUnit(this._enemiesOption, this._eneStartPosition, true, this._wave);
                    this._eneCount.eneCount++;
                    this._time = 0;
                }
            }
        }
    }
}