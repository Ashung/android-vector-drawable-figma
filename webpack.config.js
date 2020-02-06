const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = (env, argv) => ({
    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === 'production' ? false : 'inline-source-map',

    entry: {
        ui: './src/ui.ts', // The entry point for your UI code
        code: './src/code.ts', // The entry point for your plugin code
    },

    module: {
        rules: [
            // Converts TypeScript code to JavaScript
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            // Enables including CSS by doing "import './file.css'" in your TypeScript code
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/ui.html',
            filename: 'ui.html',
            inlineSource: '.(js)$',
            chunks: ['ui'],
        }),
        new HtmlWebpackInlineSourcePlugin(),
    ],

})