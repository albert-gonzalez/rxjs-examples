const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const extractSass = new MiniCssExtractPlugin({
    filename: "[name].css",
});

module.exports = {
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: [
                    /node_modules/,
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        extractSass
    ],
    devServer: {
        publicPath: '/dist/',
        compress: true,
        port: 8080,
        host: '0.0.0.0'
    },
    devtool: 'source-map'
};
