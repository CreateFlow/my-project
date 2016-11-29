'use strict';

define(function() {

    var es5_trim = String.prototype.trim;

    function guid(str) {
        var value = Math.floor( (1 + Math.random() ) * 0x10000 ).toString(16).substring(1);
        return str + '_' + value;
    }

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

    function debounce(func, wait, immediate) {
        var timeout,
            args,
            context,
            timestamp,
            result;

        var now = Date.now || function() {
            return +new Date();
        };

        var later = function() {
            var last = now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    }

    function formatDate (strTime, fmt) {
        var date = new Date(strTime),
            opts = {
                "M+" : date.getMonth() + 1,                     //月份
                "d+" : date.getDate(),                          //日
                "h+" : date.getHours(),                         //小时
                "m+" : date.getMinutes(),                       //分
                "s+" : date.getSeconds(),                       //秒
                "q+" : Math.floor( (date.getMonth() + 3) / 3),  //季度
                "S"  : date.getMilliseconds()                   //毫秒
            };

        if( /(y+)/.test(fmt) ) {
            fmt = fmt.replace( RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length) );
        }
        for (var k in opts) {
            if ( new RegExp('(' + k + ')').test(fmt) ) {
                fmt = fmt.replace( RegExp.$1, (RegExp.$1.length == 1) ?
                        (opts[k]) : (('00' + opts[k]).substr( (''+ opts[k]).length) ) );
            }
        }
        return fmt;
    }

    function isPlainObject(o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    }

    function isEmpty(val) {
        var pattern = /(^\s*)|(\s*$)/g;
        if (typeof val === 'string') val.replace(pattern, '');
        return val === '' || val == null;
    }

    function trim() {
        return es5_trim && !es5_trim.call('\uFEFF\xA0') ?
            function(text) {
                return text == null ? '' : es5_trim.call(text);
            } :
            function(text) {
                var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF',
                    trimBeginRegexp = new RegExp('^' + ws + ws + '*'),
                    trimEndRegexp = new RegExp(ws + ws + '*$');
                return text == null ? '' : (text + '').replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
            }
    }

    return {
        formatDate: formatDate,
        keys: keys,
        guid: guid,
        isPlainObject: isPlainObject,
        isEmpty: isEmpty,
        debounce: debounce,
        trim: trim()
    };
});