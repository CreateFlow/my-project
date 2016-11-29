/**
 * IO模块
 * 统一错误的处理
 * io.GET(url, data, callback, error, element)
 * io.POST(url, data, callback, error, element)
 * io.PUT(url, data, callback, error, element)
 * io.DELETE(url, data, callback, error, element)
 * io.PATCH(url, data, callback, error, element)
 * io.request(opts)
 * io.requestAPI(apiName, data, callback, error, element)
 */

'use strict';

(function(window, $) {
    var io = {},
        ERROR_CODE = {
            authorized: 401,
            cookie: 10001
        },
        NOOP = function() {},
        REST = {
            POST: 'POST',
            PUT: 'PUT',
            PATCH: 'PATCH',
            GET: 'GET',
            DELETE: 'DELETE'
        },
        LOADING_TEXT = '加载中...',
        stringify = JSON.stringify,
        parse = JSON.parse;

    // helper
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

    function isPlainObject(o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    }

    function isEmpty(val) {
        var pattern = /(^\s*)|(\s*$)/g;
        if (typeof val === 'string') val.replace(pattern, '');
        return val === '' || val == null;
    }

    function ClientRequest(opts) {
        var defaults = {
                type: 'GET',
                dataType: 'json',
                crossDomain: true,
                timeout: 20 * 1000,
                cache: false
            },
            options = $.extend({}, defaults, opts);

        return $.ajax(options);
    }

    function requestAPI(api, data, callback, error, element) {
        var opts, token, _request;

        if (isPlainObject(api)) {
            token = getAuthToken();

            if (typeof token === 'undefined') {
                return;
            }

            if (api.authorized && typeof token !== 'undefined') {
                opts = {
                    headers: {
                        Authorization: token
                    }
                };
            }

            _request = getMethodsForRequest(api.type, opts);
            return _request(api.url, data, callback, error, element);
        } else {
            throw new Error('Request type error!');
        }
    }

    function getAuthToken() {
        var user = storage.getUser();
        if (user) {
            return user.authToken;
        }
    }

    function request(opts, element) {
        var sender,
            oldError = opts.error || NOOP,
            oldSuccess = opts.success || NOOP;

        function always() {
            if (sender) {
                sender.attr('data-async-lock', 0);
            }
        }

        function success(data, textStatus, jqXHR) {
            if (data.success) {
                oldSuccess(data);
            } else {
                error(data, textStatus, jqXHR);
            }
        }

        function error(data, textStatus, jqXHR) {
            if (data && data.status == ERROR_CODE.authorized) {
                //跳转登录
                urls.goLogin();
            }

            oldError(data, textStatus, jqXHR);
        }

        opts.error = error;
        opts.success = success;

        if (element && (sender = $(element))) {

            if (!sender.length) {
                throw new Error('Element is the invalid DOM!');
            }

            if (+sender.attr('data-async-lock') === 1) {
                console.log(sender.attr('data-async-lock'));
                return;
            }

            sender.attr('data-async-lock', 1);

        }

        return ClientRequest(opts).always(always);

    }

    function getMethodsForRequest(methodName, opts) {
        return function(url, data, callback, error, element) {
            var type, token,
                options = opts || {};

            options.headers = options.headers || {};

            if (typeof data === 'function') {
                element = element || error;
                error = callback;
                callback = data;
                data = null;
            }

            if (error && typeof error !== 'function') {
                element = error;
                error = null;
            }


            if (methodName == 'GET') {
                options = $.extend(options, {
                    success: callback,
                    error: error
                });

            } else {
                if (data && typeof data !== 'string') {
                    try {
                        data = stringify(data);
                    } catch (e) {
                        throw new Error('Data type error!');
                    }
                }
                options = $.extend(options, {
                    data: data,
                    success: callback,
                    error: error
                });
            }

            if (typeof url === 'string') {
                options.url = url;
            } else {
                $.extend(options, url);
            }

            if (methodName == 'GET') {
                if (options.url.indexOf("?") > 0) {
                    if (data && typeof data !== 'string') {
                        for (var key in data) {
                            options.url += "&" + key + "=" + data[key];
                        }
                    } else {
                        options.url = options.url + "&" + data;
                    }
                } else {
                    if (data && typeof data !== 'string') {
                        var i = 0;
                        for (var key in data) {
                            if (i == 0) {
                                options.url += "?" + key + "=" + data[key];
                            } else {
                                options.url += "&" + key + "=" + data[key];
                            }
                            i = i+1;

                        }
                    } else {
                        if(data){
                             options.url = options.url + "?" + data;
                         }
                    }
                }

            }

            token = getAuthToken();
          
            if (typeof token !== 'undefined') {
                options.headers.Authorization = token;
            }

            type = methodName;

            if (methodName !== 'GET') {
                options.contentType = 'application/json; charset=utf-8';
                options.headers.Accept = "application/json; charset=utf-8";
            }

            options.type = type;

            return request(options, element);
        };
    }

    $.each(keys(REST), function(i, method) {
        io[method] = getMethodsForRequest(method);
    });

    io.request = request;
    io.requestAPI = requestAPI;

    window.io = io;

}(this, jQuery));
