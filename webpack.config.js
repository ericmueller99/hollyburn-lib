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
                test:[ /react-datepicker.css/],
                use: [{
                    loader: "style-loader"
                },{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        sourceMap: true,
                        publicPath: "../"
                    }
                }, {
                    loader: "css-loader",
                }, {
                    loader: "postcss-loader"
                }],
                exclude:/src/
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
                exclude: /react-datepicker.css/
            },
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