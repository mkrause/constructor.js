
const path = require('path');
const webpack = require('webpack');


module.exports = {
    target: 'node',
    
    entry: {
        constructor: path.join(__dirname, 'src/constructor.js'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        
        libraryTarget: 'umd',
        library: 'constructor',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                
                use: [ 'babel-loader' ],
            },
        ],
    },
};
