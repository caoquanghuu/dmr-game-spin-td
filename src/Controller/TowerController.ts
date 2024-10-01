import { FireBulletOption, GetTowerFromPoolFn, ReturnTowerToPoolFn, TowerInformation, TowerType } from '../Type';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { Sprite } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import { sound } from '@pixi/sound';

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
        tower.circleImage.position = { x: option.baseTower.x, y: option.baseTower.y };
        tower.circleImage.zIndex = 7;
        tower.image.zIndex = 7;
        tower.baseTower = option.baseTower;
        tower.baseTower.removeAllListeners();
        tower.baseTower.on('pointerdown', () => {
            // send tower info to ui controller
            const info: TowerInformation = { towerType: tower.towerType, speed: Math.floor(tower.fireTimeColdDown), dame: tower.dame.min, level: tower.level, goldUpgrade: tower.upGradeCost, towerId: tower.id };
            Emitter.emit(AppConstants.event.displayTowerInfo, info);
            sound.play('my-sound', { sprite: 'building-selected' });
        });

        tower.baseTower.on('mouseenter', () => {
            tower.toggleCircle(true);
        });
        tower.baseTower.on('mouseleave', () => {
            tower.toggleCircle(false);
        });

        this._towers.push(tower);
        tower.image.zIndex = tower.position.y;

        // use event emitter add tower to game
        Emitter.emit(AppConstants.event.addChildToScene, tower.image);
        Emitter.emit(AppConstants.event.addChildToScene, tower.circleImage);
        tower.toggleCircle(false);

        // play sound
        sound.play('my-sound', { sprite:'building-complete' });
    }

    private _removeTower(towerId: number): void {
        const i = this._towers.findIndex(tower => tower.id === towerId);
        if (i === -1) {
            console.log(`tower have id ${towerId} not found`);
            return;
        }

        const tower = this._towers[i];
        tower.baseTower.removeAllListeners();
        tower.baseTower.on('pointerdown', () => {
            Emitter.emit(AppConstants.event.selectTowerBase, tower.baseTower);
            sound.play('my-sound', { sprite: 'building-selected' });
        });
        tower.reset();
        this._returnTowerToPool(tower);
        Emitter.emit(AppConstants.event.removeChildFromScene, tower.image);
        Emitter.emit(AppConstants.event.removeChildFromScene, tower.circleImage);
        Emitter.emit(AppConstants.event.removeChildFromScene, tower.upGradeImage);
        this._towers.splice(i, 1);

        // play sound
        sound.play('my-sound', { sprite: 'sold-tower' });
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

        Emitter.on(AppConstants.event.upgradeTower, (towerId: number) => {
            const tower = this.towers.find(tower => {
                return tower.id === towerId;
            });
            if (tower) {
                tower.upgrade();
                sound.play('my-sound', { sprite: 'tower-upgraded' });
            } else {
                console.log('tower not found');
            }
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