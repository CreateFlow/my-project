'use strict';

'use strict';

(function(window) {
    //url配置
    var base = '',
        url = {
            index: '/index.html',
            login: '/member/login.html',
            regIntro: '/member/regintro.html', // 带完成注册认证的转跳页面
            corpInfo: '/member/corp-info.html', // 完成注册信息页面
            resetPassword: '/member/reset.html', // 重置密码页面
            resetSuccess: '/member/reset-success.html' // 完成重置密码页面
        };

    function mergePath(url) {
        var path = {};
        $.each(keys(url), function(i, key) {
            path[key] = base + url[key];
        });
        return path;
    }

    function keys(o) {
        var p, hasOwn, k;
        if (Object.keys) return Object.keys(o);
        if (typeof o === 'object') {
            hasOwn = Object.prototype.hasOwnProperty;
            k = [];
            for (p in o) {
                if ( hasOwn.call(o, p) ) {
                    k.push(p);
                }
            }

            return k;
        } else {
            throw new Error('Target isn\'t a object type!');
        }
    }

    window.urlConfig = mergePath(url);
}(this));
