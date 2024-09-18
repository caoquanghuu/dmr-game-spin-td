import { FireBulletOption, GetTowerFromPoolFn, ReturnTowerToPoolFn, TowerType } from '../Type';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { PointData } from 'pixi.js';
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

    public _createTower(option: {position: PointData, towerType: TowerType}): void {
        const tower = this._getTowerFromPool(option.towerType);
        tower.position = { x: option.position.x, y: option.position.y };
        this._towers.push(tower);

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
        Emitter.on(AppConstants.event.createTower, (option: {position: PointData, towerType: TowerType}) => {
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