import { Container, Graphics } from 'pixi.js';
import { AppConstants } from '../Constants';
import map from './mapMatrix.json';
import { Tinker } from '../../ObjectsPool/Tower/Tinker';

export class GameMap extends Container {

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
                    tower.image.width = 32;
                    tower.image.height = 64;
                    tower.position = { x: idxX * 32 + 16, y: idxY * 32 -8}
                    this._towers.push(tower);
                }


            });
        });

    }

    public update(dt) {
        this._towers.forEach(tower => {
            tower.update(dt);
        })
    }
}