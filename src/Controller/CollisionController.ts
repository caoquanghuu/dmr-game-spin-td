import { Tower } from '../ObjectsPool/Tower/Tower';
import { Bullet } from '../ObjectsPool/Bullet';
import { Tank } from '../ObjectsPool/Enemies/Tank';
import { Circle, EffectType, GetExplosionFromPoolFn, GetObjectFromGameSceneFn, ReturnExplosionToPoolFn, Square } from '../Type';
import { AnimatedSprite, Sprite } from 'pixi.js';
import Emitter, { findCorrectPositionBeforeCollision, getRandomArbitrary, isCollision } from '../Util';
import { AppConstants } from '../GameScene/Constants';
import { ControlUnit } from '../ObjectsPool/ControlUnit/ControlUnit';
import { BaseObject } from '../ObjectsPool/BaseObject';
import { MapControl } from './MapControl';
import { sound } from '@pixi/sound';


export class CollisionController {
    private _towers: Tower[] = [];
    private _enemiesTank: Tank[] = [];
    private _flyUnits: ControlUnit[] = [];
    private _allObjects: any[] = [];
    public nuclearBase: BaseObject;
    private _mapControl: MapControl;
    private _getObjectsFromGameScene: GetObjectFromGameSceneFn;
    private _getExplosionFromPool: GetExplosionFromPoolFn;
    private _returnExplosionToPool: ReturnExplosionToPoolFn;

    constructor(getObjectsFromGameSceneCB: GetObjectFromGameSceneFn, getExplosionFromPoolCB: GetExplosionFromPoolFn, returnExplosionToPoolCB: ReturnExplosionToPoolFn) {
        this._getObjectsFromGameScene = getObjectsFromGameSceneCB;
        this._getExplosionFromPool = getExplosionFromPoolCB;
        this._returnExplosionToPool = returnExplosionToPoolCB;
        this._mapControl = new MapControl(AppConstants.matrixSize * 4);
    }

    // still use this method for some special case
    private _checkCollisionBetweenObjects() {
        this._enemiesTank.forEach((ene, eneIdx) => {
            const c1: Circle = { position: ene.position, radius: ene.image.width / 2 };

            // tower check ene cause it range too big
            this._towers.forEach(tower => {
                const c2: Circle = { position: { x: tower.image.position.x + AppConstants.matrixSize / 2, y: tower.image.position.y + AppConstants.matrixSize / 2 }, radius: tower.effectArena };
                if (isCollision(c1, c2)) {
                    tower.fire(ene.getUpdatedPosition());
                }
            });


            // check ene vs nuclear base
            const c2: Circle = { position: this.nuclearBase.position, radius: 30 };

            if (isCollision(c1, c2)) {
                ene.targetId = this.nuclearBase.id;
                ene.targetPosition = this.nuclearBase.position;
            }

            // check ene vs fly unit
            let eneIndex = eneIdx;
            this._flyUnits.forEach(unit => {
                if (!unit.targetId && !unit.targetPosition && unit.fireStage) {
                    const enemy = this._enemiesTank[eneIndex];
                    if (enemy) {
                        unit.targetId = enemy.id;
                        unit.targetPosition = enemy.getUpdatedPosition();

                        // play sound random
                        const rd = getRandomArbitrary({ min: 0, max: 5 });
                        if (rd === 1) {
                            const rd2 = getRandomArbitrary({ min: 1, max: 2 });
                            sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName[`spawnHelicopter${rd2}`] });
                        }
                    }
                    eneIndex += 1;
                }
            });


        });
    }

    private _handleCollision() {
        this._allObjects.forEach(object1 => {
            // get objects nearby
            const otherObjects = this._mapControl.getObjectsInNearbyCells(object1.position.x, object1.position.y);

            // check collision of environment object with tanks
            if (object1 instanceof Sprite) {
                const square: Square = { position: { x: object1.position.x, y:  object1.position.y }, width: object1.width, height: object1.height };
                // const c1: Circle = { position: { x: object1.position.x + AppConstants.matrixSize / 2, y: object1.position.y + AppConstants.matrixSize / 2 }, radius: object1.width / 2 };
                otherObjects.forEach(object2 => {
                    if (object2 instanceof Tank) {
                        const c2: Circle = { position: object2.position, radius: object2.image.width / 2 };

                        if (isCollision(c2, null, square)) {
                            const correctPosition = findCorrectPositionBeforeCollision(c2, null, square);
                            object2.position = correctPosition;
                        }
                    }
                });
            }


            if (object1 instanceof Tank) {
                // avoid when ene dead but this still loop to it
                if (object1.isDead) return;
                const c1: Circle = { position: object1.position, radius: object1.image.width / 2 };
                otherObjects.forEach(object2 => {
                    if (object2 === object1) return;

                    // incase other tank
                    if (object2 instanceof Tank) {
                        if (object2.isDead) return;
                        const c2: Circle = { position: object2.position, radius: object2.image.width / 2 };

                        // handle collision of tanks
                        if (isCollision(c1, c2)) {
                            if (!object1.isMoving) {
                                const correctPosition = findCorrectPositionBeforeCollision(c1, c2);
                                object2.position = correctPosition;
                                object2.isPauseMove = true;
                            } else {
                                const correctPosition = findCorrectPositionBeforeCollision(c2, c1);

                                object1.position = correctPosition;
                                object1.isPauseMove = true;

                            }


                        }

                        // handle when 2 tank is their own ene
                        if (object1.isEne != object2.isEne) {
                            const fireC1: Circle = { position: object1.position, radius: object1.fireRadius };
                            const fireC2: Circle = { position: object2.position, radius: object2.fireRadius };
                            if (isCollision(fireC1, fireC2)) {
                                if (!object1.targetId || !object1.targetPosition) {
                                    object1.targetId = object2.id;
                                    object1.targetPosition = object2.getUpdatedPosition();
                                }

                                if (!object2.targetId || !object2.targetPosition) {
                                    object2.targetId = object1.id;
                                    object2.targetPosition = object1.getUpdatedPosition();
                                }
                            }
                        }
                    }
                });

            }

            // handle bullet collision
            if (object1 instanceof Bullet) {
                const c3: Circle = { position: object1.position, radius: object1.image.width / 2 };

                const c1: Circle = { position: object1.target, radius: object1.image.width / 2 };


                const isBulletReachToTarget = isCollision(c1, c3);
                // if bullet reached to it target
                if (isBulletReachToTarget) {
                    // create an explosion animation
                    const explosion: AnimatedSprite = this._getExplosionFromPool(object1.bulletType);
                    explosion.position = object1.target;
                    explosion.width = object1.effectArena * 2;
                    explosion.height = object1.effectArena * 2;

                    explosion.gotoAndPlay(0);
                    Emitter.emit(AppConstants.event.addChildToScene, explosion);
                    explosion.onComplete = () => {

                        this._returnExplosionToPool(explosion, object1.bulletType);

                        Emitter.emit(AppConstants.event.removeChildFromScene, explosion);
                    };

                    // create a variable avoid missing handle when code run
                    const unitsCollisionWithBullet: Tank[] = [];

                    // check bullet with other object
                    if (!object1.isEneBullet) {
                        // bullet is ally bullet and it will hit enemy
                        const eneTanks: Tank[] = otherObjects.filter((object): object is Tank => {
                            return (object instanceof Tank) && object.isEne;
                        });
                        eneTanks.forEach(ene => {
                            const c2: Circle = { position: object1.position, radius: object1.effectArena };
                            const cEne: Circle = { position: ene.position, radius: ene.image.width / 2 };
                            const isCollisionWithBullet = isCollision(cEne, c2);


                            if (isCollisionWithBullet) {
                                // push to array then handle later
                                unitsCollisionWithBullet.push(ene);
                            }
                        });
                    } else {
                        // bullet is ene bullet
                        const c2: Circle = { position: object1.position, radius: object1.effectArena };

                        // check ally tank near bullet
                        const allyTank: Tank[] = otherObjects.filter((object): object is Tank => {
                            return (object instanceof Tank) && !object.isEne;
                        });
                        allyTank.forEach(ally => {

                            const cAlly: Circle = { position: ally.position, radius: ally.image.width / 2 };
                            const isCollisionWithBullet = isCollision(cAlly, c2);
                            if (isCollisionWithBullet) {
                                // push to array then calculate later
                                unitsCollisionWithBullet.push(ally);
                            }
                        });

                        // handle nuclear base
                        const cNuclear: Circle = { position: this.nuclearBase.position, radius: this.nuclearBase.image.width / 2 };
                        const isCollisionWithBase = isCollision(cNuclear, c2);
                        if (isCollisionWithBase) {
                            Emitter.emit(AppConstants.event.reduceBaseHp, object1.dame);
                            this.nuclearBase.reduceHp(object1.dame);
                        }
                    }

                    // process do thing with units hit by bullet
                    unitsCollisionWithBullet.forEach(unit => {
                        if (object1.effectType === EffectType.SLOW) {
                            // speed of enemy will be reduce
                            const speed1 = 60;
                            const speed2 = unit.speed;
                            unit.speed = speed1;
                            setTimeout(() => {
                                unit.speed = speed2;
                            }, 2000);
                        } else {
                            unit.reduceHp(object1.dame);
                        }
                    });

                    // destroy bullet
                    object1.destroy();
                }
            }

        });
    }

    /**
     * method assign all object to check contact between object
     */
    private _assignObject(): void {
        // call back to map get objects
        const objects = this._getObjectsFromGameScene();

        this._towers = objects.towers;
        this._enemiesTank = objects.enemies;
        this._flyUnits = objects.units;
        this._allObjects = [];

        // clear object map and assign objects to object map
        this._mapControl.clear();
        // eslint-disable-next-line no-unused-vars
        for (const [key, value] of Object.entries(objects)) {
            this._allObjects = this._allObjects.concat(value);
            value.forEach(val => {
                if (!val.position.x && !val.position.y && !val.isDead) return;
                this._mapControl.addObject(val, val.position.x, val.position.y);

            });
        }
    }

    public reset() {
        this._towers = [];
        this._enemiesTank = [];
        this._flyUnits = [];
        this._allObjects = [];
        this._mapControl.clear();
    }


    public update() {
        this._assignObject();
        this._checkCollisionBetweenObjects();
        this._handleCollision();
    }
}