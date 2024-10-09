import { FireBulletOption, GetMatrixMapFn, GetTowerBasesFn, GetTowerFromPoolFn, GetUnitFromPoolFn, ReturnTowerToPoolFn, ReturnUnitToPoolFn, SetMatrixMapFn, TowerInformation, TowerType, FlyUnitType, CreateEnemiesOption } from '../Type';
import { Tower } from '../ObjectsPool/Tower/Tower';
import { PointData, Sprite } from 'pixi.js';
import Emitter from '../Util';
import { AppConstants } from '../GameScene/Constants';
import { sound } from '@pixi/sound';
import { ControlUnit } from 'src/ObjectsPool/ControlUnit/ControlUnit';

export class TowerController {
    private _towers: Tower[] = [];
    private _units: ControlUnit[] = [];
    private _illusionTower: Tower;
    private _getTowerFromPool: GetTowerFromPoolFn;
    private _returnTowerToPool: ReturnTowerToPoolFn;
    private _getTowerBases: GetTowerBasesFn;
    private _getUnitFromPool: GetUnitFromPoolFn;
    private _returnUnitToPool: ReturnUnitToPoolFn;
    private _getMatrixMap: GetMatrixMapFn;
    private _setMatrixMap: SetMatrixMapFn;
    constructor(getTowerFromPoolCallBack: GetTowerFromPoolFn, returnTowerToPoolCallback: ReturnTowerToPoolFn, getTowerBasesCallBack: GetTowerBasesFn, getUnitFromPoolCallBack: GetUnitFromPoolFn, returnUnitToPoolCallBack: ReturnUnitToPoolFn, getMatrixMapCb: GetMatrixMapFn, setMatrixMapCb: SetMatrixMapFn) {
        this._getTowerFromPool = getTowerFromPoolCallBack;
        this._returnTowerToPool = returnTowerToPoolCallback;
        this._getTowerBases = getTowerBasesCallBack;
        this._getUnitFromPool = getUnitFromPoolCallBack;
        this._returnUnitToPool = returnUnitToPoolCallBack;
        this._getMatrixMap = getMatrixMapCb;
        this._setMatrixMap = setMatrixMapCb;
        this._useEventEffect();
    }

    get towers(): Tower[] {
        return this._towers;
    }

    get units(): ControlUnit[] {
        return this._units;
    }

    private _createTowerIllusion(towerType: TowerType, position: PointData): Tower {
        const tower = this._getTowerFromPool(towerType);

        tower.position = { x: position.x, y: position.y - 25 };
        tower.circleImage.position = { x: tower.position.x + tower.image.width / 2, y: tower.image.position.y + tower.image.height / 2 };
        tower.circleImage.zIndex = AppConstants.zIndex.tower;
        tower.image.zIndex = tower.position.y;
        tower.image.alpha = 0.7;
        tower.circleImage.alpha = 0.7;

        Emitter.emit(AppConstants.event.addChildToScene, tower.image);
        Emitter.emit(AppConstants.event.addChildToScene, tower.circleImage);

        return tower;
    }

    /**
     * method create tower be called when ui success buy tower
     * @param option  type of tower and the base where player chose to build tower
     * @returns return tower
     */
    public _createTower(option: {towerType: TowerType, baseTower: Sprite}) {
        // get tower from pool
        const tower = this._illusionTower;

        // create a variable info to check that position with tower size available or not
        const info = { position: [{ x: option.baseTower.position.x, y: option.baseTower.position.y }], buildingSize: tower.buildingSize };
        // in case cant not build then return
        if (!this._checkBuildingSpace(info)) {
            // return tower to pool
            Emitter.emit(AppConstants.event.removeChildFromScene, tower.image);
            Emitter.emit(AppConstants.event.removeChildFromScene, tower.circleImage);
            return;
        }

        this._illusionTower = null;
        tower.image.alpha = 1;
        tower.circleImage.alpha = 1;

        // in case that position is available

        // update matrix map and get position of base towers tower need
        const towerBasesPosition = this._changeMatrixMap(true, info);
        // get bases from map and assign to tower
        const towerBases = this._getTowerBases(towerBasesPosition);
        tower.baseTower = towerBases;

        // set position for images of tower
        // tower.position = { x: option.baseTower.x, y: option.baseTower.y - 25 };
        // tower.circleImage.position = { x: tower.position.x + tower.image.width / 2, y: tower.image.position.y + tower.image.height / 2 };
        // tower.circleImage.zIndex = AppConstants.zIndex.tower;
        // tower.image.zIndex = tower.position.y;

        // set new event for bases that when click will render tower information
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

        tower.toggleCircle(true);


        this._towers.push(tower);

        if (tower.towerType === TowerType.barack) {
            this._createFlyUnit(FlyUnitType.helicopter, tower.position, tower.id);
        }


        // use event emitter add tower to game
        Emitter.emit(AppConstants.event.addChildToScene, tower.image);
        Emitter.emit(AppConstants.event.addChildToScene, tower.circleImage);
        Emitter.emit(AppConstants.event.reduceGold, AppConstants.towerPrice[tower.towerType]);
        // // play sound
        sound.play(AppConstants.soundName.mainSound, { sprite:AppConstants.soundName.buildingCompleted });

        // toggle turn of tower circle
        setTimeout(() => {
            tower.toggleCircle(false);
        }, 1000);
    }

    /**
     * method remove tower
     * @param towerId  id of tower will be remove
     * @returns return undefine when cant find tower
     */
    private _removeTower(towerId: number): void {
        const i = this._towers.findIndex(tower => tower.id === towerId);
        if (i === -1) {
            return;
        }

        const tower = this._towers[i];

        // reset event for bases
        tower.baseTower.forEach (base => {
            base.removeAllListeners();
            base.on('pointerdown', () => {
                Emitter.emit(AppConstants.event.selectTowerBase, base);
                sound.play(AppConstants.soundName.mainSound, { sprite: AppConstants.soundName.selectedBuilding });
            });
        });

        // update matrix map to available build tower
        const basesPosition = tower.baseTower.map(base => base.position);
        this._changeMatrixMap(false, { position: basesPosition, buildingSize: tower.buildingSize });

        // reset tower property to default
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

    private _createFlyUnit(unitType: FlyUnitType, position: PointData, towerId: number) {
        const unit = this._getUnitFromPool(unitType);

        unit.position = position;
        unit.id = towerId;
        unit.setAnimation(AppConstants.moveAnimationName.moveDown, true);
        Emitter.emit(AppConstants.event.addChildToScene, unit.image);
        this._units.push(unit);
    }

    private _useEventEffect() {
        Emitter.on(AppConstants.event.fireBullet, (option: FireBulletOption) => {
            this._fireBullet(option);
        });

        // get event from ui build tower board
        Emitter.on(AppConstants.event.createTower, (option: {towerType: TowerType, baseTower: Sprite}) => {
            this._createTower(option);
        });

        // create illusion of tower
        Emitter.on(AppConstants.event.createTowerIllusion, (option: {towerType: TowerType, baseTower: Sprite}) => {
            if (this._illusionTower && this._illusionTower.towerType === option.towerType) {
                this._illusionTower.position = { x: option.baseTower.position.x, y: option.baseTower.position.y - 24 };
                this._illusionTower.circleImage.position = { x: this._illusionTower.position.x + this._illusionTower.image.width / 2, y: this._illusionTower.image.position.y + this._illusionTower.image.height / 2 };
                Emitter.emit(AppConstants.event.addChildToScene, this._illusionTower.image);
                Emitter.emit(AppConstants.event.addChildToScene, this._illusionTower.circleImage);
            } else if (this._illusionTower) {
                this._returnTowerToPool(this._illusionTower);
                this._illusionTower = this._createTowerIllusion(option.towerType, option.baseTower.position);
            } else {
                this._illusionTower = this._createTowerIllusion(option.towerType, option.baseTower.position);
            }


        });

        // event toggle illusion tower
        Emitter.on(AppConstants.event.invisibleTowerIllusion, () => {
            if (this._illusionTower) {
                Emitter.emit(AppConstants.event.removeChildFromScene, this._illusionTower.image);
                Emitter.emit(AppConstants.event.removeChildFromScene, this._illusionTower.circleImage);
            }

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

        Emitter.on(AppConstants.event.createUnit, (option: {name: string}) => {

            const isHaveBarack = this._towers.some(tower => tower.towerType === TowerType.barack);
            if (isHaveBarack) {
                const op: CreateEnemiesOption = { name: 'tank-5', dame: 100, speed: 100, HP: 300 };

                let spawnPosition: PointData;
                this._getMatrixMap().find((row, idxX) => {
                    row.find((val, idxY) => {
                        if (val === AppConstants.matrixMapValue.spawnAllyPosition) {
                            spawnPosition = { x: idxX - 1, y: idxY };
                            return true;
                        }
                    });
                });

                if (this._getMatrixMap()[spawnPosition.x][spawnPosition.y] === AppConstants.matrixMapValue.availableMoveWay) {
                    const position: PointData = { x: spawnPosition.x * AppConstants.matrixSize + AppConstants.matrixSize / 2, y: (spawnPosition.y) * AppConstants.matrixSize + AppConstants.matrixSize / 2 };
                    Emitter.emit(AppConstants.event.createAllyUnit, { op, position });

                    Emitter.emit(AppConstants.event.reduceGold, AppConstants.unitPrice.allyTank[option.name]);
                } else {
                    // play sound cant not spawn
                }


            } else {
                // barack require
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
                if ((this._getMatrixMap()[matrixPoint.x + i][matrixPoint.y - n] != AppConstants.matrixMapValue.availableTowerBuild)) {
                    isPositionAvailable = false;
                }
            }
        }

        return isPositionAvailable;
    }


    /**
     * method change matrix map and return position available when build tower
     * @param isBuilding building or destroy
     * @param info position and building size
     * @returns
     */
    private _changeMatrixMap(isBuilding: boolean, info: {position: PointData[], buildingSize: PointData}): PointData[] | undefined {
        const matrixValue = isBuilding ? AppConstants.matrixMapValue.tower : AppConstants.matrixMapValue.availableTowerBuild;
        const matrixPoint: PointData = { x: info.position[0].x / AppConstants.matrixSize, y: info.position[0].y / AppConstants.matrixSize };

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
                this._setMatrixMap(matrixPoint.x + i, matrixPoint.y - n, matrixValue);
                // GameMap.mapMatrix[matrixPoint.x + i][matrixPoint.y - n] = matrixValue;

                const basePosition: PointData = { x: (matrixPoint.x + i) * AppConstants.matrixSize, y: (matrixPoint.y - n) * AppConstants.matrixSize };
                basesPosition.push(basePosition);
            }
        }
        return basesPosition;
    }

    private _clearTower(positions: PointData[], matrixValue: number): void {
        positions.forEach(pos => {
            const matrixPoint: PointData = { x: pos.x / AppConstants.matrixSize, y: pos.y / AppConstants.matrixSize };
            this._setMatrixMap(matrixPoint.x, matrixPoint.y, matrixValue);
            // GameMap.mapMatrix[matrixPoint.x][matrixPoint.y] = matrixValue;
        });
    }


    public update(dt: number) {
        this._towers.forEach(tower => {
            tower.update(dt);
        });

        this._units.forEach(unit => {
            unit.update(dt);
        });
    }
}