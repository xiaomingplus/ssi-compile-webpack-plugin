'use strict'

const fs = require('fs')
const path = require('path')
const request = require('request')


/**
 * 获取ssi资源内容
 * 
 * @param {String} dir 路径
 * @param {Object} setting 设置，主要使用localBaseDir和publicPath
 * @returns {Promise}  resolve(解析dir得到的资源) reject(错误状态码||异常信息栈)
 */
function getSource(dir, setting){


    const isRemotePath = /https?\:\/\//g.test(dir)
    const remoteBasePath = setting.remoteBasePath;
    const context = setting.localBaseDir
    const publicPath = setting.publicPath.trim()
    console.log('replace ssi file',dir);
    if(publicPath !== ''){
        return Promise.resolve(`<!--#include file="${publicPath}/${path.basename(dir)}"-->`)
    }
    if(isRemotePath || remoteBasePath){
        var _url = remoteBasePath?(remoteBasePath+dir): dir;
        return new Promise((resolve, reject) => {
            request({
                url:_url,
                gzip:true,
                timeout: 5000,
                headers:{
                    'Cache-Control':'no-cache'
                }
            }, (err, res, body) => {

                if(err || res.statusCode !== 200){
                    console.error(err);
                    console.error('statusCode', res && res.statusCode);
                    resolve('');
                } else {
                    resolve(body)
                }

            })
        })

    }else {

        return new Promise((resolve, reject) => {

            try{

                const absoultPath = path.normalize(context ? path.join(context, dir) : dir)
                const body = fs.readFileSync(absoultPath).toString()

                resolve(body)

            }catch(e){
                reject(e)
            }

        })

    }

}

module.exports = getSource