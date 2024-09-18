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
        graphics.fill('ceaeaa');
        this.addChild(graphics);
        GameMap.mapMatrix = map;
        map.forEach((val, idxX) => {
            val.forEach((value, idxY) => {
                if (value === 1) {
                    const grass = new Sprite(AssetsLoader.getTexture('grass-1'));
                    grass.width = 32,
                    grass.height = 32,
                    grass.anchor = 0.5;
                    grass.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                    this.addChild(grass);
                }
                if (value === 0) {
                    const tree = new Sprite(AssetsLoader.getTexture('tree-1'));
                    tree.width = 32,
                    tree.height = 32;
                    tree.anchor.set(0.5);
                    this.addChild(tree);
                    tree.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                }

                if (value === 2) {
                    const towerBase = new Sprite(AssetsLoader.getTexture('tower-base'));
                    towerBase.anchor.set(0.5);
                    towerBase.position = { x: idxX * 32 + 16, y: idxY * 32 + 16 };
                    towerBase.width = 32;
                    towerBase.height = 32;
                    this.addChild(towerBase);

                    // const tower = new Tinker();
                    // this.addChild(tower.image);
                    // tower.image.width = 32;
                    // tower.image.height = 60;
                    // tower.position = { x: idxX * 32 + 16, y: idxY * 32 - 4 };
                    // this._towers.push(tower);
                }


            });
        });

        const ene = new Enemies();
        ene.position = { x: 15 * 32 + 16, y: -100 };
        ene.image.width = 32;
        ene.image.height = 32;
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