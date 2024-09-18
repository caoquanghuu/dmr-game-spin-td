import { Tower } from '../ObjectsPool/Tower/Tower';
import { Bullet } from '../ObjectsPool/Bullet';
import { Enemies } from '../ObjectsPool/Enemies/Enemies';
import { Circle, EffectType, GetObjectFromGameSceneFn } from '../Type';

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

            this._bullets.forEach(bullet => {
                const c2: Circle = { position: bullet.position, radius: bullet.image.width / 2 };

                const isCollision = this._isCollision(c1, c2);

                if (isCollision) {
                    ene.HP -= bullet.dame;
                    if (bullet.effectType === EffectType.SLOW) {
                        ene.speed = ene.speed / 2;
                        setTimeout(() => {
                            ene.speed = ene.speed * 2;
                        }, 3000);
                    }
                    bullet.destroy();
                }
            });

            this._towers.forEach(tower => {
                const c2: Circle = { position: tower.position, radius: tower.effectArena };

                const isCollision = this._isCollision(c1, c2);
                if (isCollision) {
                    tower.fire(ene.position);
                }
            });
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
    }
}