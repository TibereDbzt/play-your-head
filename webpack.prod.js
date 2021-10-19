const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PATHS = {
    scripts: path.join(__dirname, '/src/scripts'),
    styles: path.join(__dirname, '/src/styles'),
    assets: path.join(__dirname, '/src/assets'),
    node: path.join(__dirname, '/node_modules'),
};

let config = {

    mode: 'production',

    entry: './src/scripts/main.js',

    resolve: {
        modules: [
            PATHS.scripts,
            PATHS.styles,
            PATHS.assets,
            PATHS.node,
        ]
    },

    output: {
        path: PATHS.dist,
        filename: 'scripts/main.js',
        clean: true
    },

    module: {
        rules: [{
            test: /\.html$/,
            loader: 'html-loader'
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
            }
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.(sass|scss)$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
        },
        {
            test: /\.(mov|mp4)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'assets/videos/',
                esModule: false,
            }
        },
        {
            test: /\.(woff(2)?|ttf|eot|otf)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assets/fonts/',
                    esModule: false,
                },
            }]
        },
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin({
            filename: `main.css`
        })
    ]
};

module.exports = config
