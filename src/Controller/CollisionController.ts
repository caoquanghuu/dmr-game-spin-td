import { Tower } from '../ObjectsPool/Tower/Tower';
import { Bullet } from '../ObjectsPool/Bullet';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { Circle, EffectType, GetObjectFromGameSceneFn } from '../Type';
import { AnimatedSprite, Texture } from 'pixi.js';
import { AssetsLoader } from '../AssetsLoader';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';

export class CollisionController {
    private _towers: Tower[] = [];
    private _bullets: Bullet[] = [];
    private _enemies: Enemies[] = [];
    private _getObjectsFromGameScene: GetObjectFromGameSceneFn;

    constructor(getObjectsFromGameSceneCB: GetObjectFromGameSceneFn) {
        this._getObjectsFromGameScene = getObjectsFromGameSceneCB;
    }

    private _checkCollisionBetweenObjects() {
        this._enemies.forEach(ene => {

            // check ene vs bullet
            const c1: Circle = { position: ene.position, radius: ene.image.width / 2 };
            this._towers.forEach(tower => {
                const c2: Circle = { position: tower.position, radius: tower.effectArena };

                const isCollision = this._isCollision(c1, c2);
                if (isCollision) {
                    tower.fire(ene.getUpdatedPosition());
                }
            });
        });

        this._bullets.forEach(bullet => {
            const c2: Circle = { position: bullet.position, radius: bullet.effectArena };

            const c3: Circle = { position: bullet.position, radius: bullet.image.width / 2 };

            const c1: Circle = { position: bullet.target, radius: bullet.image.width / 2 };

            if (!bullet.target) {
                bullet.destroy();
                return;
            }

            const isBulletReachToTarget = this._isCollision(c1, c3);
            if (isBulletReachToTarget) {
                bullet.destroy();
                const a = new AnimatedSprite(AssetsLoader._explosion.animations['tile']);
                a.position = bullet.target;
                Emitter.emit(AppConstants.event.addChildToScene, a);
                a.width = 50;
                a.height = 50;
                a.anchor = 0.5;
                a.loop = false;
                a.alpha = 20;
                a.zIndex = 7;
                a.play();
                a.onComplete = () => {
                    Emitter.emit(AppConstants.event.removeChildFromScene, a);
                };

                this._enemies.forEach(ene => {
                    const cEne: Circle = { position: ene.position, radius: ene.image.width / 2 };
                    const isCollisionWithBullet = this._isCollision(cEne, c2);


                    if (isCollisionWithBullet) {
                        if (bullet.effectType === EffectType.SLOW) {
                            ene.speed = ene.speed / 2;
                            setTimeout(() => {
                                ene.speed = ene.speed * 2;
                            }, 3000);
                            return;
                        }

                        if (bullet.effectType === EffectType.BLAST) {
                            ene.reduceHp(bullet.dame);
                            return;
                        }
                        ene.reduceHp(bullet.dame);


                    }

                });
            }


        });
    }

    private _assignObject() {
        const objects = this._getObjectsFromGameScene();
        this._towers = objects.towers;
        this._bullets = objects.bullets;
        this._enemies = objects.enemies;
    }

    private _isCollision(c1: Circle, c2: Circle): boolean {
        const r = c1.radius + c2.radius;
        const distance = Math.sqrt((c1.position.x - c2.position.x) * (c1.position.x - c2.position.x) + (c1.position.y - c2.position.y) * ((c1.position.y - c2.position.y)));
        if (distance <= r) return true;

        return false;
    }

    public update(dt: number) {
        this._assignObject();
        this._checkCollisionBetweenObjects();
    }
}