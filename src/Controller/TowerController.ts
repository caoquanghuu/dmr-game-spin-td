import { FireBulletOption, GetTowerFromPoolFn, ReturnTowerToPoolFn, TowerInformation, TowerType } from '../Type';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { PointData, Sprite } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';

export class TowerController {
    private _towers: Tower[] = [];
    private _getTowerFromPool: GetTowerFromPoolFn;
    private _returnTowerToPool: ReturnTowerToPoolFn;
    constructor(getTowerFromPoolCallBack: GetTowerFromPoolFn, returnTowerToPoolCallback: ReturnTowerToPoolFn) {
        this._getTowerFromPool = getTowerFromPoolCallBack;
        this._returnTowerToPool = returnTowerToPoolCallback;
        this._useEventEffect();
    }

    get towers(): Tower[] {
        return this._towers;
    }

    public _createTower(option: {towerType: TowerType, baseTower: Sprite}): void {
        const tower = this._getTowerFromPool(option.towerType);
        tower.position = { x: option.baseTower.x, y: option.baseTower.y - 25 };
        tower.baseTower = option.baseTower;
        tower.baseTower.removeAllListeners();
        tower.baseTower.on('pointerdown', () => {
            // send tower info to ui controller
            const info: TowerInformation = { towerType: tower.towerType, speed: tower.speed, dame: tower.dame, level: tower.level };
            Emitter.emit(AppConstants.event.displayTowerInfo, info);
        });
        this._towers.push(tower);
        tower.image.zIndex = tower.position.y;

        // use event emitter add tower to game
        Emitter.emit(AppConstants.event.addChildToScene, tower.image);
    }

    private _removeTower(towerId: number): void {
        const i = this._towers.findIndex(tower => tower.id === towerId);
        if (i === -1) {
            console.log(`tower have id ${towerId} not found`);
            return;
        }

        const tower = this._towers[i];
        tower.reset();
        this._returnTowerToPool(tower);
        // use event emitter to remove tower from game
        this._towers.splice(i, 1);
    }

    private _upgradeTower(towerId: number): void {
        const i = this._towers.findIndex(tower => tower.id === towerId);
        if (i === -1) {
            console.log(`tower have id ${towerId} not found`);
            return;
        }

        const tower = this._towers[i];
        tower.upgrade();
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.fireBullet, (option: FireBulletOption) => {
            this._fireBullet(option);
        });
        Emitter.on(AppConstants.event.createTower, (option: {towerType: TowerType, baseTower: Sprite}) => {
            this._createTower(option);
        });
        Emitter.on(AppConstants.event.destroyTower, (towerID: number) => {
            this._removeTower(towerID);
        });
    }

    private _fireBullet(option: FireBulletOption) {
        Emitter.emit(AppConstants.event.createBullet, option);

    }

    public update(dt: number) {
        this._towers.forEach(tower => {
            tower.update(dt);
        });
    }
}