import { AnimatedSprite } from 'pixi.js';
import { AppConstants } from '../../GameScene/Constants';
import { TowerType } from '../../Type';
import { Tower } from './Tower';

export class Barack extends Tower {
    constructor() {
        super(TowerType.barack, true);
        this.setAnimation('barack', true);
        this.init();
        this.image.width = AppConstants.matrixSize * 3;
        this.image.height = AppConstants.matrixSize * 3;
        this.image.anchor.set(0.5, 0.73);
        (this.image as AnimatedSprite).animationSpeed = 0.1;
        this.image.eventMode = 'none';
    }
}