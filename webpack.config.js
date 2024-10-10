const path = require('path');
const argv = require('yargs').argv;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

function makeRandomId() {
    let text = '';
    const l = 4;
    const char_list =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < l; i++) {
        text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return text;
}
const bundleID = makeRandomId();

module.exports = () => {
    const isProduction = argv.mode === 'production';
    return {
        entry: './src/index.ts',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
        },
        devtool: 'hidden-source-map',
        output: {
            filename: `bundle-${bundleID}.js`,
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            isProduction
                ? new WebpackObfuscator({
                    optionsPreset: 'low-obfuscation',
                    identifierNamesGenerator: 'mangled-shuffled',
                    debugProtection: false,
                    debugProtectionInterval: 0,
                    simplify: true,
                    log: true,
                })
                : false,

            new HtmlWebpackPlugin({
                template: './public/index.html',
                filename: 'index.html',
            }),

            isProduction
                ? new CopyPlugin({
                    patterns: [
                        { from: './public/assets/atlas', to: 'assets/atlas' },
                        { from: './public/assets/sounds/soundsAtlas', to: 'assets/sounds/soundsAtlas' },
                        { from: './public/assets/animation', to: 'assets/animation' },
                        { from: './public/assets/bitmapText', to: 'assets/bitmapText' },
                    ],
                })
                : false,
        ],
    };
};
