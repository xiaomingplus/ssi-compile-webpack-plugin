'use strict'

const getSource = require('./utils/get-source.js')
const eachPromise = require('./utils/each-promise.js')
const pathRewrite = require('./utils/path-rewrite');
const HtmlWebpackPlugin = require('html-webpack-plugin')


/**
 * @class SSICompileWebpackplugin
 * ssi资源路径替换策略
 * 解析file路径 => 判断是否为线上资源
 * 线上资源 => http => 组合页面
 * 本地资源 => 解析路径 => fs => 组合页面
 */
class SSICompileWebpackplugin {

    /**
     * Creates an instance of SSICompileWebpackplugin.
     * 
     * @param {String} publicPath 资源基础路径,为空时不处理路径，不为空的时将拼接路径的`${publicPath}/${path.basename}`
     * @param {String} localBaseDir ssi本地路径的基础路径前缀
     * @param {String} ext 需要处理的后缀名，多个后缀可使用`|`分割
     * 
     * @memberOf SSICompileWebpackplugin
     */
    constructor(options) {

        this.setting = Object.assign({}, {
            publicPath: '',
            localBaseDir: '/',
            ext: '\\.html',
            variable: {},
            pathRewrite: {
            }, //路径替换
            proxy: "", //是否需要代理
        }, options)
    }


    apply(compiler) {
        compiler.hooks.compilation.tap("SSI Webpack Plugin", (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation)
                .afterTemplateExecution
                .tapPromise("SSI Webpack Plugin", (asset) => {
                    const extReg = new RegExp(this.setting.ext, 'g')

                    if (!extReg.test(asset.outputName)) {
                        return Promise.resolve(asset);
                    }

                    return this.replaceSSIFile(asset)
                })
        })
    }


    replaceSSIFile(asset) {
        const includeFileReg = /<!--#\s*include\s+(file|virtual)=(['"])([^\r\n\s]+?)\2\s*-->/g
        let source = asset.html;
        const fileArr = source.match(includeFileReg)

        if (!fileArr) {
            Promise.resolve(asset)
        }

        let replacePath = pathRewrite.create(this.setting.pathRewrite);

        return new Promise((resolve, reject) => {
            eachPromise(fileArr.map((item) => {
                let src = item.split('"')[1];
                if (replacePath) {
                    src = replacePath(src);
                }
                const isVar = /\${(.+?)}/.test(src);
                if (isVar) {
                    var variableMap = this.setting.variable;
                    try {
                        src = src.replace(/\${(.+?)}/g, function (matchItem) {
                            var variable = matchItem.match(/\${(.+?)}/)
                            if (variableMap[variable[1]]) {
                                return variableMap[variable[1]]
                            } else {
                                return ""
                            }
                        })
                    } catch (e) {
                        throw new Error(e)
                    }

                }
                return getSource(src, this.setting)
            }))
                .then((sucessResult) => {

                    fileArr.forEach((i, j) => {
                        source = source.replace(i, function () {
                            return decodeURIComponent(encodeURIComponent(sucessResult[j].data))
                        })
                    })

                    asset.html = source;

                    resolve(asset)
                }, (errResult) => {

                    fileArr.forEach((i, j) => {
                        source = source.replace(i, function () {
                            return decodeURIComponent(encodeURIComponent(errResult[j].data))
                        })
                    })

                    asset.html = source;

                    reject(asset)
                })
                .catch((err) => {
                    reject(err)
                })

        })

    }
}

module.exports = SSICompileWebpackplugin