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
        await Assets.loadBundle('animation').then((data) => {

            Object.keys(data).forEach(key => {
                // @ts-ignore
                const keyData = bundles.find(i => i.name === 'animation').assets.find(asset => asset.name === key)?.data || '';
                AssetsLoader._resources[key] = keyData ? get(data, [key, keyData]) : data[key];


            });

        });
        await Assets.loadBundle('images').then((data) => {
            console.log(data);
            Object.keys(data).forEach(spriteSheet => {
                for (const [key, value] of Object.entries(data[spriteSheet].textures)) {
                    AssetsLoader._resources[key] = value;
                }


            });
            console.log(AssetsLoader._resources);
        });


    }

    static async loadSound() {
        await Assets.load({ 'alias': 'game-sound', 'src':'../assets/sounds/soundsAtlas/sounds_sprite.json' });
    }

    static async loadBitmapText() {
        await Assets.load('../assets/bitmapText/desyrel.xml');
        await Assets.load('../assets/bitmapText/font_number.fnt');
    }

    // static function get a texture
    static getTexture(name: string) {
        return AssetsLoader._resources[name];
    }

}
