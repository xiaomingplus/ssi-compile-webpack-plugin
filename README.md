# 静态编译ssi资源

## 使用

```javascript
// webpack.config.js
const SSICompileWebpackplugin = require('ssi-webpack-plugin')
module.exports = {
    // config
    plugin: [
        new SSICompileWebpackplugin({
            publicPath: '',
            localBaseDir: '/',
            minify: false,
            remoteBasePath:"http://baidu.com",//如果传了此参数，则表示从远程http请求中获取ssi文件的内容
            variable:{
                'QUERY_STRING':"test=1",//如果ssi文件地址里有引用变量,如${QUERY_STRING}，则会用此参数里的对应key的值替换
            }
        })
    ]
}
```

### 配合其他插件

> 插件的资源是根据webpack已有资源表中查找`.html`后缀产生的。所以正常需要配合其他插件/loader去读取.html作为入口

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SSICompileWebpackplugin = require('ssi-webpack-plugin')
module.exports = {
    // config
    plugin: [
        new HtmlWebpackPlugin({
            // setting
        }),
        new SSICompileWebpackplugin({
            publicPath: '',
            localBaseDir: '/',
            minify: false,
            remoteBasePath:"http://baidu.com",//如果传了此参数，则表示从远程http请求中获取ssi文件的内容
            variable:{
                'QUERY_STRING':"test=1",//如果ssi文件地址里有引用变量,如${QUERY_STRING}，则会用此参数里的对应key的值替换
            }
        })
    ]
}
```


## 配置说明

| *key* | *value* | *说明* |
| :---------  | :--------- | :------------------- |
| publicPath | String | 资源基础路径,为空时不处理路径，不为空的时将路径拼接为`${publicPath}/${path.basename}`, 默认 '' |
| localBaseDir | String | ssi本地路径的基础路径, 默认 '/' |
| remoteBasePath | String | 远程路径的基础路径，如果传了该参数，则ssi默认从远程url直接获取 |
| minify | Boolean | 是否压缩html, 默认 false |
| ext | String | 需要处理的文件后缀,多后缀名使用`|`分割，如 `.html|.shtml` 默认 .html |
| variable | obj |如果需要处理的ssi文件里含有变量，则会用该字段里的对应的key的值替换，如果找不到对应的值，则把变量替换为空|
