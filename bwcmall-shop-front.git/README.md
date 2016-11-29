### 1, 源码

从项目托管平台BitLab上检出源码:

http://git.bwcmall.cn/next/bwcmall-shop-front.git

### 2, 安装

检出项目后，你需要首先[安装node.js]

然后进行一下步骤的安装以完成编译环境的安装:

1、安装sass and compass

```sh

    #设置淘宝镜像
    gem sources --remove https://rubygems.org/
    gem sources -a https://ruby.taobao.org/

    # https://ruby.taobao.org
    # 请确保只有 ruby.taobao.org
    gem sources -l

    # 安装sass and compass
    gem install sass
    gem update --system
    gem install compass

```


2, 安装Grunt & Bower
```sh
$ npm install -g grunt grunt-cli bower
```

3, 安装项目依赖
```sh
npm install && bower install
```

4,git提交代码步骤
```sh
    #首先，拉取develop分支到本地
    #自建feature-xxx分支
    #然后，完成功能需要提交，执行
    commit -m "xxx"
    pull origin develop

    #合并develop到本地，解决冲突
    git pull origin feature-xxx
    git push origin feature-xxx

    #申请合并到develop分支
```


### 3, 资源组织结构

```sh
- bwcmall/                          # 应用目录
    - src /                         # 开发源目录
        - sass/                     # css资源目录(css资源会被sass文件逐步替换)
            + common/               # 基础公共sass目录
            + component/            # 预留组件目录
            - module/               # 页面业务sass目录
                － index.scss/      # index页面级的样式文件
                － _index.scss/     # index模块样式文件
        + fonts/                    # 字体资源目录
        + images/                   # 图片资源目录
        - js /                      # js资源目录
            + lib/                  # js基础库资源目录
            + conf/                 # 页面应用入口文件
            - module/               # 页面业务js资源目录
                + common/           # 页面业务js公共资源目录
                + header/           # header资源目录
                + order/
                index.js
            + plugin/               # 第三插件资源目录
        - html/                     # html模板资源目录
            - include/              # 子模板资源目录
                + common/           # 公共的子模板资源目录
            + module/               # 业务模板资源目录
```

### 4, 开发规范


#### 4.1 基础框架版本
```sh

前端基础框架：
MVVM －
avalonJS  版本1.46
DOM操作 －
jquery 版本1.10.2

UI组件：
主UI库 - Oniui 版本1.3.8

```


#### 4.2 html代码规范
1、doctype 声明使用 html5
```html

   <!doctype html>

```

2、统一页面编码格式为 utf-8 , meta 标签 charset 设置为 utf-8;
```html

   <meta charset="utf-8" />

```

3、元素标签写法,在书写 XHTML 元素标签时,应该统一用小写,避免同时出现大小写的行为,并且
遵守 XHTML 规范所有标签需要关闭(包括 br、link、meta 等元素标签),所有属性 都需要用双引号包围
```html

    <!-- 反模式 -->
    <br>
    <a href="#" rel="text" dataUrl="url">link</a>
    <!-- 正确写法 -->
    <br />
    <a href="#" rel="text" data-url="url">link</a>

    <!-- CSS 中规定,如果在 inline 元素里面套入 block 元素,那么这种嵌套将是非法的。 -->

    <!-- 反模式 -->
    <span><p><b>XHTML 代码规范 </b></p></span>
    <!-- 正确写法 -->
    <div><p><b>XHTML 代码规范 </b></p></div>

```

4、对于 JS 钩子, 以 jCamelCase 的驼峰形式来命名，js钩子不能关联样式定义
```html
    <!-- js钩子不能关联样式定义 -->
    <button class="jClick">提交</button>

```

5、对于普通 class 或者 id 命名（此处id仅做样式，不做js钩子）, 统一使用小写字母, 第一个字符必须为字母, 连接符用中划线 '-'表状态或者 下划线'_'表层级。
```html

    <!-- 中划线表示样式的状态扩展 -->
    <span class="btn btn-link">按钮</span>

    <!-- 下划线指示层级关系 -->
    <div class="item">
        <span class="item_btn">按钮</span>
    </div>

```

6、css 引用置于头部 标签内。

7、js 引用置于底部 标签前。

8、html文件名使用小写加中划线 '-'，例如：in-order。

9、使用字体图标
```html

    <i class="icon icon-glyph icon-clock"></i>
    
    icon: 应用图标样式
    icon-glyph: 应用字体图标
    icon-clock: 图标clock

```

#### 4.3 css代码规范

CSS 语言规范
1. 样式文件中不要出现大写的标签定义, 不要对 JS 钩子进行样式定义。
2. 避免出现 .a.b 之类的定义, 如果做 hack 使用请注明。
3. 稀奇古怪的 hack 请加注释。
4. important只允许出现在公共工具中,避免在业务模块使用 !important , 如果必须请加注释,检查全局的影响。
5. 缩进以4个空格为基本单位[参考]。
6. css样式使用竖排, 不要使用横排以及 n 级缩进等。
7. 对于所有 hack 请放到每个样式定义的最后边。
8. class selector 层级尽量控制在 4 层以内(sass编写注意控制在4层)。

```scss

    .sidebar {
        .hd {
            .btn {
                .icon {
                    ...
                }
            }
        }
    }

```

CSS 命名规则
1. 样式类名全部用小写，首字符必须是字母，禁止数字或其他特殊字符。由以字母开头的小写 字母（a-z）、数字（0-9）、中划线 （-）和下划线(_)组成。
2. 双单词或多单词组合方式：命名空间-名词、命名空间-形容词-名词、block_名词、block-形容词。例如： mod-feeds、mod-my-feeds、btn-long、box_btn

#### 4.4 js代码规范

配置api
```js

    // api mothods统一写在api.js文件
    methods = {
        login: '/v1/auth/login',
        ...
    };

```

代码块和语句
```js

    //反模式
    // 容易产生奇义，不方便阅读
    // {}是js标准用法
    if (i < 3)
    {
        ...
    }

    //反模式
    // 没有`;`结束语句
    if (i < 3) {
        var a = c
        b = d
    }

    //正确
    if (i < 3) {
        var a = c;
        b = d;
    }

```


使用模块，加载依赖，输出模块
```js

   define(function(require, exports, module) {
    // 加载依赖模块
    var avalon = require('avalon');
    var $ = require('jquery');
    // 加载运行模块，没有返回结果的
    require('module/common/ui/nav');

    //输出模块
    exports.login = function() {
        ...
    };
    //或者 返回对象
    return {
        ...
    };
});

```


使用模块模式，隔离局部变量，避免使用全局变量
```js

   (function(){
        //模块内的处理逻辑
    }());

    //反模式
    var a = 1;
    function() {
        a = b;
    }

```



ajax请求处理
```js

    var request = require('lib/io/request');
    // 使用request模块的'GET','POST','PATCH','PUT','DELETE'方法
    // 调用方式
    request.POST(url, postData, success, error);

    // 例子
    request.PATCH(apiConfig.editCart, data, function(responseData) {
        updateModel(responseData.result);
    }, sender);

```


获取缓存用户信息和状态
```js

    // 获取当前用户
    var user = session.getUser();

    // 判断登录状态
    if ( session.isLogin() ) {
        ...
    }

    // 删除用户缓存信息
    session.removeUser();

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
grunt 或者 grunt local
```

### 6, 打包
当需要部署项目到Apache Http服务器时，需要将项目的源码编译打包:
```sh
grunt build
```

**重要链接**

checklist:  http://git.bwcmall.cn/next/bwcmall-shop-front/wikis/checklist

**参考链接**

avalon（司徒正美）文章链接：http://www.html-js.com/article/column/234

Oniui库：http://hotelued.qunar.com/oniui/index.html
