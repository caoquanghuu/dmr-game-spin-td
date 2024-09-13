import { Assets, AssetsBundle } from 'pixi.js';
import { get } from 'lodash';

export class AssetsLoader {
    private static _resources: any = null;

    constructor() {
        if (AssetsLoader._resources) {
            console.error('AssetsLoader is a singleton class. Use AssetsLoader.instance to access the instance of this class.');
        }
        AssetsLoader._resources = {};
    }

    // load bundle
    static async loadBundle(bundles: AssetsBundle[]) {
        await Assets.init({ manifest: { bundles } });
        Assets.backgroundLoadBundle(bundles.map(i => i.name));
        return Assets.loadBundle('preLoad').then((data) => {
            Object.keys(data).forEach(key => {
                // @ts-ignore
                const keyData = bundles.find(i => i.name == 'preLoad').assets.find(asset => asset.name === key)?.data || '';
                AssetsLoader._resources[key] = keyData ? get(data, [key, keyData]) : data[key];


            });
        });
    }

    // static function get a texture
    static getTexture(name: string) {
        return AssetsLoader._resources[name];
    }

}
