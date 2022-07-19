const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require("path");

module.exports = {
    mode: 'production',
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, 'dist/esm'),
        library: 'hollyburn-Lib',
        libraryTarget: "umd",
        globalObject: 'this'
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
    ],
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.js', '.css', '.jsx']
    }
}