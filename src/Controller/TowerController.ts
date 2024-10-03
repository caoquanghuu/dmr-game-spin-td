import { FireBulletOption, GetTowerBasesFn, GetTowerFromPoolFn, ReturnTowerToPoolFn, TowerInformation, TowerType } from '../Type';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { PointData, Sprite } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import { sound } from '@pixi/sound';
import { GameMap } from '../GameScene/Map/Map';

export class TowerController {
    private _towers: Tower[] = [];
    private _getTowerFromPool: GetTowerFromPoolFn;
    private _returnTowerToPool: ReturnTowerToPoolFn;
    private _getTowerBases: GetTowerBasesFn;
    constructor(getTowerFromPoolCallBack: GetTowerFromPoolFn, returnTowerToPoolCallback: ReturnTowerToPoolFn, getTowerBasesCallBack: GetTowerBasesFn) {
        this._getTowerFromPool = getTowerFromPoolCallBack;
        this._returnTowerToPool = returnTowerToPoolCallback;
        this._getTowerBases = getTowerBasesCallBack;
        this._useEventEffect();
    }

    get towers(): Tower[] {
        return this._towers;
    }

    public _createTower(option: {towerType: TowerType, baseTower: Sprite}): void {
        const tower = this._getTowerFromPool(option.towerType);
        const info = { position: [{ x: option.baseTower.position.x, y: option.baseTower.position.y }], buildingSize: tower.buildingSize };
        if (!this._checkBuildingSpace(info)) {
            console.log('cant not build');
            this._returnTowerToPool(tower);
            return;
        }
        const towerBasesPosition = this._changeMatrixMap(true, info);
        const towerBases = this._getTowerBases(towerBasesPosition);
        tower.position = { x: option.baseTower.x, y: option.baseTower.y - 25 };
        tower.circleImage.position = { x: tower.position.x + tower.image.width / 2, y: tower.image.position.y + tower.image.height / 2 };
        tower.circleImage.zIndex = AppConstants.zIndex.tower;
        tower.image.zIndex = tower.position.y;
        tower.baseTower = towerBases;
        tower.baseTower.forEach(base => {
            base.removeAllListeners();
            base.on('pointerdown', () => {
            // send tower info to ui controller
                const info: TowerInformation = { towerType: tower.towerType, speed: Math.floor(tower.fireTimeColdDown), dame: tower.dame.min, level: tower.level, goldUpgrade: tower.upGradeCost, towerId: tower.id };
                Emitter.emit(AppConstants.event.displayTowerInfo, info);
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.selectedBuilding });
            });

            base.on('mouseover', () => {

                tower.toggleCircle(true);
            });
            base.on('mouseleave', () => {

                tower.toggleCircle(false);
            });
        });
        this._towers.push(tower);


        // use event emitter add tower to game
        Emitter.emit(AppConstants.event.addChildToScene, tower.image);
        Emitter.emit(AppConstants.event.addChildToScene, tower.circleImage);
        tower.toggleCircle(false);

        // play sound
        sound.play(AppConstants.soundName.mainSound, { sprite:AppConstants.soundName.buildingCompleted });
    }

    private _removeTower(towerId: number): void {
        const i = this._towers.findIndex(tower => tower.id === towerId);
        if (i === -1) {
            console.log(`tower have id ${towerId} not found`);
            return;
        }

        const tower = this._towers[i];
        tower.baseTower.forEach (base => {
            base.removeAllListeners();
            base.on('pointerdown', () => {
                Emitter.emit(AppConstants.event.selectTowerBase, base);
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.selectedBuilding });
            });
        });
        const basesPosition = tower.baseTower.map(base => base.position);
        this._changeMatrixMap(false, { position: basesPosition, buildingSize: tower.buildingSize });
        tower.reset();
        this._returnTowerToPool(tower);
        Emitter.emit(AppConstants.event.removeChildFromScene, tower.image);
        Emitter.emit(AppConstants.event.removeChildFromScene, tower.circleImage);
        Emitter.emit(AppConstants.event.removeChildFromScene, tower.upGradeImage);
        this._towers.splice(i, 1);

        // change matrix map


        // play sound
        sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.soldTower });
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
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.towerUpgraded });
            } else {
                console.log('tower not found');
            }
        });
    }

    private _fireBullet(option: FireBulletOption) {
        Emitter.emit(AppConstants.event.createBullet, option);

    }

    private _checkBuildingSpace(info: {position: PointData[], buildingSize: PointData}): boolean {
        const matrixPoint: PointData = { x: info.position[0].x / AppConstants.matrixSize, y: info.position[0].y / AppConstants.matrixSize };
        let isPositionAvailable: boolean = true;
        for (let i = 0; i < info.buildingSize.x; i++) {
            for (let n = info.buildingSize.y - 1; n >= 0; n--) {
                if ((GameMap.mapMatrix[matrixPoint.x + i][matrixPoint.y - n] != AppConstants.matrixMapValue.availableTowerBuild)) {
                    isPositionAvailable = false;
                }
            }
        }

        return isPositionAvailable;
    }


    private _changeMatrixMap(isBuilding: boolean, info: {position: PointData[], buildingSize: PointData}): PointData[] | undefined {
        const matrixValue = isBuilding ? AppConstants.matrixMapValue.tower : AppConstants.matrixMapValue.availableTowerBuild;
        const matrixPoint: PointData = { x: info.position[0].x / AppConstants.matrixSize, y: info.position[0].y / AppConstants.matrixSize };
        console.log(GameMap.mapMatrix);

        if (isBuilding) {
            return this._buildTower(matrixPoint, info.buildingSize, matrixValue);
        } else {
            this._clearTower(info.position, matrixValue);
            return;
        }
    }

    private _buildTower(matrixPoint: PointData, buildingSize: PointData, matrixValue: number): PointData[] {
        const basesPosition: PointData[] = [];

        for (let i = 0; i < buildingSize.x; i++) {
            for (let n = 0; n < buildingSize.y; n++) {
                GameMap.mapMatrix[matrixPoint.x + i][matrixPoint.y - n] = matrixValue;

                const basePosition: PointData = { x: (matrixPoint.x + i) * AppConstants.matrixSize, y: (matrixPoint.y - n) * AppConstants.matrixSize };
                basesPosition.push(basePosition);
            }
        }

        console.log(GameMap.mapMatrix);

        return basesPosition;
    }

    private _clearTower(positions: PointData[], matrixValue: number): void {
        positions.forEach(pos => {
            const matrixPoint: PointData = { x: pos.x / AppConstants.matrixSize, y: pos.y / AppConstants.matrixSize };
            GameMap.mapMatrix[matrixPoint.x][matrixPoint.y] = matrixValue;
        });
    }


    public update(dt: number) {
        this._towers.forEach(tower => {
            tower.update(dt);
        });
    }
}