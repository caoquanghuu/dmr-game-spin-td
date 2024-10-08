import { Tower } from '../ObjectsPool/Tower/Tower';
import { Bullet } from '../ObjectsPool/Bullet';
import { Tank } from '../ObjectsPool/Enemies/Tank';
import { Circle, EffectType, GetExplosionFromPoolFn, GetObjectFromGameSceneFn, ReturnExplosionToPoolFn } from '../Type';
import { AnimatedSprite, PointData } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import { ControlUnit } from 'src/ObjectsPool/ControlUnit/ControlUnit';
import { BaseObject } from 'src/ObjectsPool/BaseObject';


export class CollisionController {
    private _towers: Tower[] = [];
    private _bullets: Bullet[] = [];
    private _allyTank: Tank[] = [];
    private _enemiesTank: Tank[] = [];
    private _flyUnits: ControlUnit[] = [];
    public nuclearBase: BaseObject;
    private _getObjectsFromGameScene: GetObjectFromGameSceneFn;
    private _getExplosionFromPool: GetExplosionFromPoolFn;
    private _returnExplosionToPool: ReturnExplosionToPoolFn;

    constructor(getObjectsFromGameSceneCB: GetObjectFromGameSceneFn, getExplosionFromPoolCB: GetExplosionFromPoolFn, returnExplosionToPoolCB: ReturnExplosionToPoolFn) {
        this._getObjectsFromGameScene = getObjectsFromGameSceneCB;
        this._getExplosionFromPool = getExplosionFromPoolCB;
        this._returnExplosionToPool = returnExplosionToPoolCB;
    }

    private async _checkCollisionBetweenObjects() {
        this._enemiesTank.forEach((ene, eneIdx) => {
            const c1: Circle = { position: ene.position, radius: ene.image.width / 2 - 2 };

            // check collision fire of tank and ene
            this._allyTank.forEach((ally) => {

                const fireC1: Circle = { position: ene.position, radius: 40 };

                const fireC2: Circle = { position: ally.position, radius: 40 };

                const isCollision = this._isCollision(fireC1, fireC2);

                if (isCollision) {
                    if (!ene.targetId && !ene.fireTarget) {
                        ene.targetId = ally.id;
                        ene.fireTarget = ally.getUpdatedPosition();
                    }

                    if (!ally.targetId && !ally.fireTarget) {
                        ally.targetId = ene.id;
                        ally.fireTarget = ene.getUpdatedPosition();
                    }
                }
            });

            this._towers.forEach(tower => {
                const c2: Circle = { position: { x: tower.image.position.x + AppConstants.matrixSize / 2, y: tower.image.position.y + AppConstants.matrixSize / 2 }, radius: tower.effectArena };
                const isCollision = this._isCollision(c1, c2);
                if (isCollision) {
                    tower.fire(ene.getUpdatedPosition());
                }
            });

            // check ene vs nuclear base
            const c2: Circle = { position: this.nuclearBase.position, radius: 30 };

            const isCollision = this._isCollision(c1, c2);
            if (isCollision) {


                ene.targetId = this.nuclearBase.id;
                ene.fireTarget = this.nuclearBase.position;
            }

            // check ene vs fly unit
            let eneIndex = eneIdx;
            this._flyUnits.forEach(unit => {
                if (!unit.targetId && !unit.targetPosition) {
                    const enemy = this._enemiesTank[eneIndex];
                    if (enemy) {
                        unit.targetId = enemy.id;
                        unit.targetPosition = enemy.getUpdatedPosition();
                    }
                    eneIndex += 1;
                }
            });


        });

        this._bullets.forEach(bullet => {


            const c3: Circle = { position: bullet.position, radius: bullet.image.width / 2 };

            const c1: Circle = { position: bullet.target, radius: bullet.image.width / 2 };


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
                const unitsCollisionWithBullet: Tank[] = [];

                // check bullet with other object
                if (!bullet.isEneBullet) {
                    this._enemiesTank.forEach(ene => {
                        // return in case bullet is ene bullet

                        const c2: Circle = { position: bullet.position, radius: bullet.effectArena };
                        const cEne: Circle = { position: ene.position, radius: ene.image.width / 2 };
                        const isCollisionWithBullet = this._isCollision(cEne, c2);


                        if (isCollisionWithBullet) {
                            unitsCollisionWithBullet.push(ene);
                        }
                    });
                } else {
                    const c2: Circle = { position: bullet.position, radius: bullet.effectArena };
                    this._allyTank.forEach(ally => {

                        // return is case bullet is ally bullet


                        const cAlly: Circle = { position: ally.position, radius: ally.image.width / 2 };
                        const isCollisionWithBullet = this._isCollision(cAlly, c2);
                        if (isCollisionWithBullet) {
                            unitsCollisionWithBullet.push(ally);
                        }
                    });

                    const cNuclear: Circle = { position: this.nuclearBase.position, radius: this.nuclearBase.image.width / 2 };
                    const isCollisionWithBase = this._isCollision(cNuclear, c2);
                    if (isCollisionWithBase) {
                        Emitter.emit(AppConstants.event.reduceBaseHp, bullet.dame);
                    }
                }


                unitsCollisionWithBullet.forEach(unit => {
                    if (bullet.effectType === EffectType.SLOW) {
                        // speed of enemy will be reduce
                        const speed = 60;
                        unit.speed = speed;
                        setTimeout(() => {
                            unit.speed = 100;
                        }, 2000);
                    } else {
                        unit.reduceHp(bullet.dame);
                    }
                });

                // destroy bullet
                bullet.destroy();
            }


        });
    }

    private _assignObject(): void {
        const objects = this._getObjectsFromGameScene();
        this._towers = objects.towers;
        this._bullets = objects.bullets;
        this._enemiesTank = objects.enemies;
        this._flyUnits = objects.units;
        this._allyTank = objects.allies;
    }

    private _isCollision(c1: Circle, c2: Circle): boolean {
        const r = c1.radius + c2.radius;
        const distance = Math.sqrt((c1.position.x - c2.position.x) * (c1.position.x - c2.position.x) + (c1.position.y - c2.position.y) * ((c1.position.y - c2.position.y)));
        if (distance <= r) return true;

        return false;
    }

    public update() {
        this._assignObject();
        this._checkCollisionBetweenObjects();
    }
}