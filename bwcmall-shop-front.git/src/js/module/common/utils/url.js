'use strict';

define(function(require, exports, module) {

    var parseUrl = require('lib/plugins/url/url'),
        URL_CONFIG = require('module/common/config/urls');

    require('lib/plugins/base64/base64');

    function href(url) {
        if (url) {
            window.location.href = url;
        }
    }

    module.exports = {

        get: function(arg, url) {
            return parseUrl(arg, url);
        },

        getParams: function(url) {
            var obj =  parseUrl('?', url);
            if (!obj) {
                return {};
            } else {
                return obj;
            }
        },

        /**
         * 根据参数的key获取参数的值
         * @param  {String} key 参数名称
         * @param  {String} url 可选
         * @return String 参数的值
         */
        getParamByKey: function(key, url) {
            var paramsObj =  this.getParams(url);
            if (key in paramsObj) {
                return paramsObj[key];
            }
        },

        getParameter: function(url,paramName) {
            var object =  this.getParams();
            if(!object){
                return null;
            }
            return object[paramName] ? object[paramName] :null;
        },

        refresh: function() {
            href( this.get() );
        },

        goRef: function(url) {
            var o = this.getParams();

            if (typeof o !== 'undefined' && 'ref' in o) {
                // 尝试解码
                try {
                    url = $.base64.atob(o.ref);
                } catch(e) {
                    url = o.ref;
                }

            }

            url ? href(url) : this.refresh();
        },

        goLogin: function() {
            var loginUrl = URL_CONFIG.login,
                prefix = '?ref=',
                local = $.base64.btoa( this.get() );

            href(loginUrl + prefix + local);
        }

    };

});