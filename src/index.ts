import { Application, Assets, Container, Sprite } from 'pixi.js';
import { AppConstants } from './GameScene/Constants';

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


    app.ticker.add(() => {

    });
})();