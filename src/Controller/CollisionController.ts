import { Tower } from '../ObjectsPool/Tower/Tower';
import { Bullet } from '../ObjectsPool/Bullet';
import { Tank } from '../ObjectsPool/Enemies/Tank';
import { Circle, EffectType, GetExplosionFromPoolFn, GetObjectFromGameSceneFn, ReturnExplosionToPoolFn } from '../Type';
import { AnimatedSprite, PointData } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import { ControlUnit } from 'src/ObjectsPool/ControlUnit/ControlUnit';


export class CollisionController {
    private _towers: Tower[] = [];
    private _bullets: Bullet[] = [];
    private _units: Tank[] = [];
    private _flyUnits: ControlUnit[] = [];
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
        this._units.forEach((unit, unitIdx) => {
            const c1: Circle = { position: unit.position, radius: unit.image.width / 2 - 2 };

            // this._enemies.forEach(ene2 => {
            //     if (ene === ene2) return;
            //     const c2: Circle = { position: ene2.position, radius: ene2.image.width / 2 - 2 };
            //     const isCollision = this._isCollision(c1, c2);
            //     const distance1 = ene.bfsMoveEngine.calculateBfsDistance();
            //     const distance2 = ene2.bfsMoveEngine.calculateBfsDistance();
            //     if (isCollision) {

            //         if (distance1 >= distance2) {
            //             ene.moveEngine.direction = Direction.STAND;
            //             ene.isPauseMove = true;

            //         } else {
            //             ene.moveEngine.direction = Direction.STAND;
            //             ene2.isPauseMove = true;

            //         }
            //     }
            // });

            // check ene vs tower

            this._towers.forEach(tower => {
                const c2: Circle = { position: { x: tower.image.position.x + AppConstants.matrixSize / 2, y: tower.image.position.y + AppConstants.matrixSize / 2 }, radius: tower.effectArena };
                // avoid ally
                if (!unit.isEne) return;
                const isCollision = this._isCollision(c1, c2);
                if (isCollision) {
                    tower.fire(unit.getUpdatedPosition());
                }
            });

            // check ene vs their target
            const c2: Circle = { position: this._nuclearBasePosition, radius: 20 };

            const isCollision = this._isCollision(c1, c2);
            if (isCollision) {

                if (unit.isEne) {
                    const eneFired: boolean = unit.fire(this._nuclearBasePosition);
                    unit.isMoving = false;
                    // remove enemy cause it reached to base
                    // Emitter.emit(AppConstants.event.removeEnemy, ene.id);

                    // send event to ui controller
                    if (eneFired) {
                        Emitter.emit(AppConstants.event.reduceBaseHp, unit.dameDeal);
                    }

                }


            }

            // check ene vs control unit
            if (unit.isEne) {
                let eneIndex = unitIdx;
                this._flyUnits.forEach(unit => {
                    if (!unit.target) {
                        const enemy = this._units[eneIndex];
                        if (enemy) {
                            unit.target = { targetPosition: enemy.getUpdatedPosition(), targetID:  enemy.id };
                        }
                        eneIndex += 1;
                    }
                });
            }

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
                const eneCollisionWithBullet: Tank[] = [];
                this._units.forEach(ene => {
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
                        const speed = 60;
                        ene.speed = speed;
                        setTimeout(() => {
                            ene.speed = 100;
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
        this._units = objects.enemies;
        this._flyUnits = objects.units;
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