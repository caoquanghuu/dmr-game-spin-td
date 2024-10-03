import { Tower } from '../ObjectsPool/Tower/Tower';
import { Bullet } from '../ObjectsPool/Bullet';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { Circle, EffectType, GetExplosionFromPoolFn, GetObjectFromGameSceneFn, ReturnExplosionToPoolFn } from '../Type';
import { AnimatedSprite, PointData } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import { ControlUnit } from 'src/ObjectsPool/ControlUnit/ControlUnit';
import { GameMap } from '../GameScene/Map/Map';

export class CollisionController {
    private _towers: Tower[] = [];
    private _bullets: Bullet[] = [];
    private _enemies: Enemies[] = [];
    private _units: ControlUnit[] = [];
    private _eneMatrixMap: {position: PointData, value: number}[] = [];
    private _towerMatrixMap: {position: PointData, value: number}[] = [];
    private _nuclearBasePosition: PointData;
    private _getObjectsFromGameScene: GetObjectFromGameSceneFn;
    private _getExplosionFromPool: GetExplosionFromPoolFn;
    private _returnExplosionToPool: ReturnExplosionToPoolFn;

    constructor(getObjectsFromGameSceneCB: GetObjectFromGameSceneFn, getExplosionFromPoolCB: GetExplosionFromPoolFn, returnExplosionToPoolCB: ReturnExplosionToPoolFn) {
        this._getObjectsFromGameScene = getObjectsFromGameSceneCB;
        this._getExplosionFromPool = getExplosionFromPoolCB;
        this._returnExplosionToPool = returnExplosionToPoolCB;
    }

    private async _checkCollisionBetweenObjects() {
        this._enemies.forEach((ene, eneIdx) => {

            // check ene vs tower
            const c1: Circle = { position: ene.position, radius: ene.image.width / 2 };
            this._towers.forEach(tower => {
                const c2: Circle = { position: tower.position, radius: tower.effectArena };

                const isCollision = this._isCollision(c1, c2);
                if (isCollision) {
                    tower.fire(ene.getUpdatedPosition());
                }
            });

            // check ene vs their target
            const c2: Circle = { position: this._nuclearBasePosition, radius: 10 };

            const isCollision = this._isCollision(c1, c2);
            if (isCollision) {
                // remove enemy cause it reached to base
                Emitter.emit(AppConstants.event.removeEnemy, ene.id);

                // send event to ui controller
                Emitter.emit(AppConstants.event.reduceBaseHp, ene.dameDeal);
            }

            // check ene vs control unit
            let eneIndex = eneIdx;
            this._units.forEach(unit => {
                if (!unit.target) {
                    const enemy = this._enemies[eneIndex];
                    if (enemy) {
                        unit.target = { targetPosition: enemy.getUpdatedPosition(), targetID:  enemy.id };
                    }
                    eneIndex += 1;
                }
            });
        });

        this._bullets.forEach(bullet => {


            const c3: Circle = { position: bullet.position, radius: bullet.image.width / 2 };

            const c1: Circle = { position: bullet.target, radius: bullet.image.width / 2 };

            // if (!bullet.target) {
            //     bullet.destroy();
            //     return;
            // }

            const isBulletReachToTarget = this._isCollision(c1, c3);
            if (isBulletReachToTarget) {

                const explosion: AnimatedSprite = this._getExplosionFromPool(bullet.bulletType);
                explosion.position = bullet.target;
                explosion.width = bullet.effectArena * 2;
                explosion.height = bullet.effectArena * 2;

                explosion.gotoAndPlay(0);
                Emitter.emit(AppConstants.event.addChildToScene, explosion);
                explosion.onComplete = () => {

                    this._returnExplosionToPool(explosion, bullet.bulletType);

                    Emitter.emit(AppConstants.event.removeChildFromScene, explosion);
                };
                const eneCollisionWithBullet: Enemies[] = [];
                this._enemies.forEach(ene => {
                    const c2: Circle = { position: bullet.position, radius: bullet.effectArena };
                    const cEne: Circle = { position: ene.position, radius: ene.image.width / 2 };
                    const isCollisionWithBullet = this._isCollision(cEne, c2);


                    if (isCollisionWithBullet) {
                        eneCollisionWithBullet.push(ene);
                    }
                });
                eneCollisionWithBullet.forEach(ene => {
                    if (bullet.effectType === EffectType.SLOW) {
                        // speed of enemy will be reduce
                        ene.speed = ene.speed / 3;
                        setTimeout(() => {
                            ene.speed = ene.speed * 3;
                        }, 2000);
                    } else {
                        ene.reduceHp(bullet.dame);
                    }
                });

                // destroy bullet
                bullet.destroy();
            }


        });
    }

    set nuclearPosition(position: PointData) {
        this._nuclearBasePosition = { x: position.x, y: position.y };
    }

    private _assignObject() {
        const objects = this._getObjectsFromGameScene();
        this._towers = objects.towers;
        this._bullets = objects.bullets;
        this._enemies = objects.enemies;
        this._units = objects.units;
    }

    private _isCollision(c1: Circle, c2: Circle): boolean {
        const r = c1.radius + c2.radius;
        const distance = Math.sqrt((c1.position.x - c2.position.x) * (c1.position.x - c2.position.x) + (c1.position.y - c2.position.y) * ((c1.position.y - c2.position.y)));
        if (distance <= r) return true;

        return false;
    }

    private _changeMatrixMap() {
        this._updateMatrixMap();
        const matrixSize = AppConstants.matrixSize;

        this._eneMatrixMap.forEach(val => {
            const c1: Circle = { position: { x: val.position.x * matrixSize + matrixSize / 2, y: val.position.y * matrixSize + matrixSize / 2 }, radius: matrixSize / 2 };

            this._enemies.forEach(ene => {

                const c2: Circle = { position: ene.position, radius: matrixSize / 2 };

                const isCollision = this._isCollision(c1, c2);
                if (isCollision) {
                    GameMap.mapMatrix[val.position.x][val.position.y] = AppConstants.matrixMapValue.unit;
                } else {
                    GameMap.mapMatrix[val.position.x][val.position.y] = AppConstants.matrixMapValue.availableMoveWay;
                }
            });
        });

        // this._towerMatrixMap.forEach(val => {
        //     const c1: Circle = { position: { x: val.position.x * matrixSize + matrixSize / 2, y: val.position.y * matrixSize + matrixSize / 2 }, radius: matrixSize / 2 };

        //     this._towers.forEach(tower => {
        //         const c2: Circle = { position: tower.position, radius: matrixSize / 2 };
        //         const isCollision = this._isCollision(c1, c2);

        //         if (isCollision) {
        //             GameMap.mapMatrix[val.position.x][val.position.y] = AppConstants.matrixMapValue.tower;
        //         } else {
        //             GameMap.mapMatrix[val.position.x][val.position.y] = AppConstants.matrixMapValue.availableTowerBuild;
        //         }
        //     });
        // });
    }

    /**
     * method to get update matrix map. It not really need but in case on update of future some other class will change matrix map
     * it will help full
     */
    private _updateMatrixMap() {
        const eneMatrixMap: {value: number, position: PointData}[] = [];
        const towerMatrixMap: {value: number, position: PointData}[] = [];
        GameMap.mapMatrix.forEach((values: number[], idxX: number) => {
            values.forEach((val, idxY: number) => {
                if (val === AppConstants.matrixMapValue.availableMoveWay || val === AppConstants.matrixMapValue.unit) {
                    eneMatrixMap.push({ position: { x: idxX, y: idxY }, value: val });
                } else if (val === AppConstants.matrixMapValue.availableTowerBuild || val === AppConstants.matrixMapValue.tower) {
                    towerMatrixMap.push({ position: { x: idxX, y: idxY }, value: val });
                }
            });
        });
        this._eneMatrixMap = eneMatrixMap;
        this._towerMatrixMap = towerMatrixMap;
    }

    public update() {
        this._assignObject();
        this._checkCollisionBetweenObjects();
        this._changeMatrixMap();
    }
}