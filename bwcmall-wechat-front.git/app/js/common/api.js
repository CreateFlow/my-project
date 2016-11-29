'use strict';

(function() {
    var basePath = Vue.config.apiPath;
    var API = {
            basePath: basePath
        },

        methods = {
            login: '/v1/wechat/auth/login', //登录
            signup: '/v1/wechat/customer', //注册
            buyer: '/v1/wechat/buyer/service', //买家注册信息
            businessCategory: '/v1/wechat/buyer/service/businessCategory', //业务类型
            serviceCategory: '/v1/wechat/buyer/service/category', //查询主营品类
            uploadFile: '/v1/wechat/buyer/service/upload', //上传文件
            checkPhone: '/v1/wechat/customer/phone/', //检查手机号是否被注册
            password: '/v1/wechat/customer/{username}/password', //重置密码
            sendCaptcha: '/v1/wechat/verificationCode', //发送验证码
            orderList: '/v1/wechat/order', // 订单列表
            order: '/v1/wechat/order/', //订单详情
            confirmReceived: '/v1/wechat/order/{id}/confirmReceived', // 确认收货
            orderCancel: '/v1/wechat/order/{sn}/cancel', //取消订单
            menu: '/v1/wechat/menu?api_key=bwcmall', //菜单入口
            pay: '/v1/wechat/pay/JSAPI',
        };

    keys(methods).forEach(function(name, i) {
        var url,
            value = methods[name];

        if (typeof value === 'string') {
            API[name] = basePath + value;
        } else {
            API[name] = value;
            API[name].url = basePath + value.url;
        }

    });

    function keys(o) {
        var p, hasOwn, k;
        if (Object.keys) return Object.keys(o);
        if (typeof o === 'object') {
            hasOwn = Object.prototype.hasOwnProperty;
            k = [];
            for (p in o) {
                if (hasOwn.call(o, p)) {
                    k.push(p);
                }
            }

            return k;
        } else {
            throw new Error('Target isn\'t a object type!');
        }
    }

    window.API = API;

}());
