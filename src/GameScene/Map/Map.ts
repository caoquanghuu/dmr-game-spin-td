import { Container, Graphics, Sprite } from 'pixi.js';
import { AppConstants } from '../Constants';
import map from './mapMatrix.json';
import { Tinker } from '../../ObjectsPool/Tower/Tinker';
import { Tower } from '../../ObjectsPool/Tower/Tower';
import { Enemies } from '../../ObjectsPool/Enemies/Enemies';
import { EnemiesType } from '../../Type';
import { AssetsLoader } from '../../AssetsLoader';

export class GameMap extends Container {
    private _towers: Tower[] = [];
    private _enemies: Enemies[] = [];

    public static mapMatrix: any;
    constructor() {
        super();
        const graphics = new Graphics();
        graphics.rect (0, 0, AppConstants.mapSize.width, AppConstants.mapSize.height);
        graphics.fill('e5f293');
        this.addChild(graphics);
        GameMap.mapMatrix = map;
        map.forEach((val, idxX) => {
            val.forEach((value, idxY) => {
                if (value === 1) {
                    graphics.rect(idxX * AppConstants.matrixSize.width, idxY * AppConstants.matrixSize.height, AppConstants.matrixSize.width, AppConstants.matrixSize.height);
                    graphics.fill('bb94b5');
                }
                if (value === 0) {
                    graphics.rect(idxX * AppConstants.matrixSize.width, idxY * AppConstants.matrixSize.height, AppConstants.matrixSize.width, AppConstants.matrixSize.height);
                    graphics.fill('f39589');
                }

                if (value === 2) {
                    const grc = new Graphics();
                    grc.circle(0, 0, AppConstants.matrixSize.width / 2);
                    grc.fill('abbb94');
                    grc.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                    this.addChild(grc);
                    const tower = new Tinker();
                    this.addChild(tower.image);
                    tower.image.width = 40;
                    tower.image.height = 80;
                    tower.position = { x: idxX * 32 + 16, y: idxY * 32 - 12 };
                    this._towers.push(tower);
                }


            });
        });

        const ene = new Enemies();
        ene.position = { x: 15 * 32, y: -100 };
        ene.image.width = 40;
        ene.image.height = 40;
        ene.image.angle = 180;
        this._enemies.push(ene);
        ene.isMoving = true;
        this.addChild(ene.image);

    }

    public update(dt) {
        this._towers.forEach(tower => {
            tower.update(dt);
        });

        this._enemies.forEach(ene => {
            ene.update(dt);
        });
    }
}