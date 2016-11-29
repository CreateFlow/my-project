
上线静态资源域名：s1.bwcmall.com 

### 1, 源码

从项目托管平台BitLab上检出源码:

http://git.bwcmall.cn/next/bwcmall-trade-front.git

### 2, 安装

检出项目后，你需要首先[安装node.js]

然后进行一下步骤的安装以完成编译环境的安装:

1, 安装Grunt & Bower
```sh
$ npm install -g grunt grunt-cli bower
```
2, 安装项目依赖
```sh
npm install && bower install
```

### 3, 资源组织结构

```sh
- bwcmall/                  # 应用目录
    - app /                 # 开发目录
        - styles/           # css资源目录(css资源会被sass文件逐步替换)
            + common/       # 编译基础公共css目录
                － api.js   # api接口配置文件
                － io.js    # ajax请求模块
            + module/       # 编译页面业务css目录
            - sass/         # sass资源目录
                + common/   # 基础公共sass目录
                + module/   # 页面业务sass目录
        + fonts/            # 字体资源目录
        + images/           # 图片资源目录
        - scripts /         # js资源目录
            + lib/          # js基础库资源目录
            - module/       # 页面业务js资源目录
                + common/   # 页面业务js公共资源目录
                + header/   # header资源目录
                + order/
                index.js
            + plugin/       # 第三插件资源目录
        - template/         # 模板资源目录
            - include/      # 子模板资源目录
                + common/   # 公共的子模板资源目录
                + module/   # 页面模板资源目录
```

### 4, 开发规范



```sh

前端基础框架：
MVVM －
avalonJS  版本1.46
DOM操作 －
jquery 版本1.10.2

UI组件：
主UI库 - Oniui 版本1.3.8

```



配置api
```js

    // api mothods统一写在api.js文件
    methods = {
        login: '/v1/auth/login',
        ...
    };

```



封装模块模式，隔离全局变量
```js

   (function(){
        //模块内的处理逻辑
    }());

```



ajax请求处理
```js

    // 使用io模块的'GET','POST','PATCH','PUT','DELETE'方法
    // 调用方式
    io.POST(url, postData, success, error);

    // 例子
    io.PATCH(apiConfig.editCart, data, function(responseData) {
        updateModel(responseData.result);
    }, sender);

```


获取缓存用户信息和状态
```js

    // 获取当前用户
    var user = storage.getUser();

    // 判断登录状态
    if ( storage.isLogin() ) {
        ...
    }

    // 删除用户缓存信息
    storage.removeUser();

```


avalon基本用法
```js

    // 定义avalon控制器
    var inOrderCtrl = avalon.define('inOrderCtrl', function(vm) {
        //属性
        vm.cartData = {};
        //方法
        vm.deleteCart = function(id) {
            cart.deleteItem(id);
        };
    };

    // document ready方法
    avalon.ready(function() {
        ...
    }

```


### 5, 运行
运行以下命令会自动启动node.js并且在默认浏览器中打开首页，并且自动监听源文件的任何修改，然后自动编译并刷新页面(依赖于[livereload]):
```sh
grunt serve
```

### 6, 打包
当需要部署项目到Apache Http服务器时，需要将项目的源码编译打包:
```sh
grunt build
```


**参考链接**

avalon（司徒正美）文章链接：http://www.html-js.com/article/column/234

Oniui库：http://hotelued.qunar.com/oniui/index.html


**开心的写每一行代码**

[AngularJS 1.3.x]:https://angularjs.org/
[UI-Router]:https://github.com/angular-ui/ui-router
[angular-breadcrumb]:https://github.com/ncuillery/angular-breadcrumb
[Twitter Bootstrap3.3.x]:http://getbootstrap.com/
[UI Bootstrap]:http://angular-ui.github.io/bootstrap/
[animate.css]:http://daneden.github.io/animate.css/
[font awesome]:http://fortawesome.github.io/Font-Awesome/icons/
[SASS]:http://sass-lang.com/
[es5-shim]:https://github.com/es-shims/es5-shim
[node.js]:http://nodejs.org/
[bower]:http://bower.io/
[Grunt]:http://gruntjs.com/
[安装node.js]:http://nodejs.org/download/
[sublime3]:http://www.sublimetext.com/3
[livereload]:https://www.npmjs.org/package/grunt-livereload
[安装ruby]:https://www.ruby-lang.org/en/downloads/

