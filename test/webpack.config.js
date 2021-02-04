'use strict'

const path = require('path')
const webpack = require('webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SSICompileWebpackplugin = require('../index.js')


const htmlArr = () => {
    const html = glob.sync('./test/*.html')
    let array = []
    if (html.length > 0) {
        html.forEach((item) => {
            array.push(new HtmlWebpackPlugin({
                minify: true,
                filename: `${path.basename(item)}`,
                template: item,
                inject: true
            }))
        })
    }
    return array
}


module.exports = {
    entry: './test/entry.js',
    devtool: false,
    output: {
        path: path.resolve(__dirname, 'test/release'),
        filename: `test.js`
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'html-loader?minimize=false'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    ].concat(htmlArr(), new SSICompileWebpackplugin({
        localBaseDir: path.resolve(__dirname, '..'),
        publicPath: ''
    }))
}