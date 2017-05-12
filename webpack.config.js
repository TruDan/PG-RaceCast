/**
 * Created by truda on 09/05/2017.
 */
var path = require( 'path' );
module.exports = {
    entry: {
        game: "./src/game/index.js",
        controls: "./src/controls/index.js"
    },
    output: {
        filename: "./build/[name].bundle.js"
    },
    node: {
        fs: 'empty'
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                include: path.join(__dirname, 'node_modules', 'pixi.js'),
                loader: 'json',
            },
            {
                test: /node_modules/,
                loader: 'ify-loader'
            }
        ]
    },
    devServer: {
        host: '0.0.0.0',
        port: '3000',
        disableHostCheck: true
    }
};