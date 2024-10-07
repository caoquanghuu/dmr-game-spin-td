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
    private _allyTank: Tank[] = [];
    private _enemiesTank: Tank[] = [];
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
        this._enemiesTank.forEach((ene, eneIdx) => {
            const c1: Circle = { position: ene.position, radius: ene.image.width / 2 - 2 };

            this._allyTank.forEach((ally) => {

                const fireC1: Circle = { position: ene.position, radius: 30 };

                const fireC2: Circle = { position: ally.position, radius: 30 };

                const isCollision = this._isCollision(fireC1, fireC2);

                if (isCollision) {
                    ene.isMoving = false;
                    ally.isMoving = false;

                    ene.fire(ally.getUpdatedPosition());
                    ally.fire(ene.getUpdatedPosition());
                } else {
                    if (ene.isMoving === false) {
                        ene.isMoving = true;
                        ene.getNextMove();
                    }

                    if (ally.isMoving === false) {
                        ally.isMoving = true;
                        ally.getNextMove();
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

            // check ene vs their target
            const c2: Circle = { position: this._nuclearBasePosition, radius: 20 };

            const isCollision = this._isCollision(c1, c2);
            if (isCollision) {


                const eneFired: boolean = ene.fire(this._nuclearBasePosition);
                ene.isMoving = false;
                // remove enemy cause it reached to base
                // Emitter.emit(AppConstants.event.removeEnemy, ene.id);

                // send event to ui controller
                if (eneFired) {
                    Emitter.emit(AppConstants.event.reduceBaseHp, ene.dameDeal);
                }


            }

            // check ene vs control unit

            let eneIndex = eneIdx;
            this._flyUnits.forEach(unit => {
                if (!unit.target) {
                    const enemy = this._enemiesTank[eneIndex];
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
                this._enemiesTank.forEach(ene => {
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