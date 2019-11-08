const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// Builds bundle usable <script>. Includes RGL and all deps, excluding React.
module.exports = {
    mode: 'production',
    optimization: {
        minimize: true,
    },
    context: __dirname,
    entry: {
        'react-grid-layout': './index-dev.js',
    },
    output: {
        path: `${__dirname}/dist`,
        filename: '[name].min.js',
        libraryTarget: 'umd',
        library: 'ReactGridLayout',
    },
    devtool: 'source-map',
    externals: {
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            // React dep should be available as window.React, not window.react
            root: 'React',
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            root: 'ReactDOM',
        },
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
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
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
        new webpack.optimize.ModuleConcatenationPlugin(),
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
};
