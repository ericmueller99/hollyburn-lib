const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require("path");
const MomentTimezoneDataPlugin = require("moment-timezone-data-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, 'dist/esm'),
        library: 'hollyburn-Lib',
        libraryTarget: "umd",
        globalObject: 'this',
        publicPath: ""
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /nodeModules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", 'postcss-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'index.css'
        }),
        new MomentTimezoneDataPlugin({
            matchCountries: 'CA'
        })
    ],
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.js', '.jsx']
    }
}