var path = require('path');
var webpack = require('webpack');
var envs = {};
var minify = false;
var e = {
    entry: ['babel-polyfill','./src/clientjs/index.js'],
    output:
    {
        path: '.',
        filename: './app/clientjs/bundle.js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    module: {
        loaders: [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: [/node_modules/,/app/],
                query: {
                    presets: ['es2015','stage-0']
                }
            },
            { test: /\.json$/, loader: "json-loader" }

        ]

    },
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin(envs)],
    devServer: {
        stats: 'errors-only',
    }

};


if (minify) {
    e.plugins.push(new webpack.optimize.UglifyJsPlugin({
        beautify: true,
        mangle: false
    }));
    e.devtool = 'source-map';
}

module.exports = e;
