import { Container, Graphics } from 'pixi.js';
import { AppConstants } from '../Constants';
import map from './mapMatrix.json';

export class GameMap extends Container {
    constructor() {
        super();
        const graphics = new Graphics();
        graphics.rect (0, 0, AppConstants.mapSize.width, AppConstants.mapSize.height);
        graphics.fill('e5f293');
        this.addChild(graphics);
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
                }


            });
        });

    }
}