const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    mode: 'development',
    context: __dirname,
    // entry: './test/dev-drag-box',
    entry: './test/dev-easy-drag',
    output: {
        path: '/',
        filename: 'bundle.js',
        sourceMapFilename: '[file].map',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                        },
                    },
                    {
                        loader: require.resolve('ts-loader'),
                        options: {
                            configFile: path.resolve(__dirname, 'tsconfig.json'),
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            tsconfig: path.resolve(__dirname, 'tsconfig.json'),
            async: false,
            useTypescriptIncrementalApi: true,
            reportFiles: [
                '**',
                '!node_modules/**',
                '!**/*.json',
                '!**/__tests__/**',
                '!**/?(*.)(spec|test).*',
                '!**/src/setupProxy.*',
                '!**/src/setupTests.*',
            ],
            watch: [path.resolve(__dirname, 'src')],
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
    ],
    devtool: 'eval',
    devServer: {
        publicPath: '/',
        compress: true,
        port: 4002,
        open: true,
        contentBase: '.',
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.js', '.jsx', '.ts', '.tsx'],
        alias: {
            '@dfe/react-easy-drag': path.join(__dirname, 'index-dev.js'),
        },
    },
};
