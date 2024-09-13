/* eslint-disable @typescript-eslint/no-namespace */
export namespace AppConstants {
    export const appWidth: number = 960;
    export const appHeight: number = 640;
    export const appColor: string = '#1099bb';
    export const matrixSize = {
        width: 32,
        height: 32
    };
    export const mapSize = {
        width: matrixSize.width * (appWidth / matrixSize.width) * (5 / 6),
        height: matrixSize.width * (appHeight / matrixSize.width) * (4 / 5),
    };
    export const UISize = {
        width: appWidth,
        height: appHeight - mapSize.height
    };
    export const SpinSize = {
        width: appWidth - mapSize.width,
        height: appHeight - UISize.height
    };
}