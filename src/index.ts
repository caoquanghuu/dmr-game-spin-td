import { Application } from 'pixi.js';
import { AppConstants } from './GameScene/Constants';
import { AssetsLoader } from './AssetsLoader';
import bundles from './bundles.json';
import { GameScene } from './GameScene/GameScene';

// Asynchronous IIFE
(async () => {
    // Khởi tạo PixiJS application.
    const app = new Application();

    // Cài đặt app với một số thuộc tính.
    app
        .init({
            background: AppConstants.appColor,
            width: AppConstants.appWidth,
            height: AppConstants.appHeight,
        })
        .then(() => {
            // Thả canvas của app vào body của HTML.
            document.body.appendChild(app.canvas);
        });

    new AssetsLoader();
    await AssetsLoader.loadBundle(bundles);
    await AssetsLoader.loadBitmapText();

    const gameScene = new GameScene();
    app.stage.addChild(gameScene);


    app.ticker.add((sticker) => {
        gameScene.update(sticker.deltaMS);
    });
})();