'use strict';

define(function(require, exports, module) {
    var $ = require('jquery'),
        utils = require('module/common/utils/utils'),
        urls = require('module/common/utils/url'),
        session = require('lib/io/session'),
        ajax = $.ajax,
        io = {},
        currentRequests = {},
        ERROR_CODE = {
            authorized: 401,
            session: 10006,
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
        stringify = JSON.stringify,
        parse = JSON.parse,
        keys = utils.keys,
        isEmpty = utils.isEmpty;

    function getRequestOpts(opts) {
        var header, token,
            defaults = {
                type: 'GET',
                dataType: 'json',
                crossDomain: true,
                timeout: 20 * 1000,
                cache: false,
                abortOnRetry: true
            },
            options = $.extend({}, defaults, opts || {}),
            oldError = options.error || NOOP,
            oldSuccess = options.success || NOOP,
            data = options.data,
            type = options.type,
            url = options.url;

        if (type === 'GET') {

            options.data = null;

            if (url) {
                if (url.indexOf("?") > 0) {
                    if ( !isEmpty(data) && typeof data !== 'string') {
                        for (var key in data) {
                            url += "&" + key + "=" + data[key];
                        }
                    } else {
                        url = url + "&" + data;
                    }
                } else {
                    if ( !isEmpty(data) && typeof data !== 'string') {
                        var i = 0;
                        for (var key in data) {
                            if (i == 0) {
                                url += "?" + key + "=" + data[key];
                            } else {
                                url += "&" + key + "=" + data[key];
                            }
                            i = i+1;

                        }
                    } else {
                        if( !isEmpty(data) ) {
                             url = url + "?" + data;
                        }
                    }
                }
                options.url = url;
            }


        } else {

            if ( !isEmpty(data) && typeof data !== 'string') {
                try {
                    data = stringify(data);
                } catch (e) {
                    throw new Error('Data type error!');
                }
            }

            options.data = data;

            if(!options.headers){
                options.headers  = {};
            }
            if(!options.contentType ){
                options.contentType = 'application/json; charset=utf-8';
             }
             if(!options.headers.Accept){
                options.headers.Accept = "application/json; charset=utf-8";
             }

        }

        token = session.getAuthToken();

        if (typeof token !== 'undefined') {
            if(!options.headers){
                options.headers = {};
            }
            options.headers.Authorization = token;
        }

        options.error = error;
        options.success = success;
        // options.beforeSend = function(jqXHR, setting) {
        //     console.log();
        // };

        function success(jqXHR, textStatus, msg) {
            // if (data.success) {
                oldSuccess(jqXHR);
            // } else {
            //     error(data, textStatus, jqXHR);
            // }
        }

        function error(jqXHR, textStatus, msg) {
            if (jqXHR) {

                switch (jqXHR.status) {
                    case ERROR_CODE.authorized:
                    case ERROR_CODE.session:
                        urls.goLogin();
                        // $rootScope.$broadcast(EVENTS.notAuthenticated);
                        break;
                }

            }

            oldError(jqXHR, textStatus, msg);
        }

        return options;
    }

    function ajaxSetup(opts) {
        // $.ajaxPrefilter(opts, function(options, originalOptions, jqXHR) {
        //     options.success = function() {
        //         console.log();
        //     };
        // })
        // $.ajaxSetup( getRequestOpts(opts) );
        $.ajax = request;
    }

    function getCruRequest(requests, value) {
        var index = getIndexByCruRequest(requests, value);
        if (index !== -1) {
            return requests[index];
        }
    }

    function getIndexByCruRequest(requests, value) {
        var result = -1;
        $.each(requests, function(index, item) {
            if (value === item.data) {
                result = index;
            }
        });
        return result;
    }

    /**
     * currentRequests = {
     *      url: [{
     *          xhr: jqXHR,
     *          data: postData
     *      },
     *      ...
     *      ]
     *  }
     */
    function abortOnRetry(requestsCache, opts) {
        var id, jqXHR, cruXHR, data,
            url = opts.url,
            cruRequest = requestsCache[url] || [];

        if ( utils.isEmpty(opts.data) ) {
            data = '';
        } else {
            data = stringify(opts.data);
        }

        if (cruRequest.length) {
            cruXHR = getCruRequest(cruRequest, data);
        }

        if (cruXHR !== undefined) {

            if ( cruXHR.xhr.state() === 'pending' ) {
                // console.debug('pending');
                // $scope.$broadcast('pending', function() {});
                // return;
                return cruXHR.xhr;
            }

        } else {
            cruXHR = {data: data};
            cruRequest.push(cruXHR);
        }

        function always() {
            // console.debug('complete');
            var index = getIndexByCruRequest(cruRequest, data);
            if (cruRequest.length > 1 && index !== -1) {
                requestsCache[url].splice(index, 1);
            } else {
                requestsCache[url] = cruRequest = null;
                delete requestsCache[url];
            }
        }

        jqXHR = cruXHR.xhr = ajax( getRequestOpts(opts) );
        requestsCache[url] = cruRequest;
        return jqXHR.always(always);
    }

    function clientRequest(opts) {
        // return $.ajax( getRequestOpts(opts) );
        // $.ajaxPrefilter(abortOnRetry);
        var options = getRequestOpts(opts);
        if (options.abortOnRetry) {
            return abortOnRetry(currentRequests, options);
        } else {
            return ajax(options);
        }
    }

    function request(opts, element) {
        var sender;

        function always() {
            if (sender) {
                sender.attr('data-async-lock', 0);
            }
        }

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
        return clientRequest(opts);

    }

    function getMethodsForRequest(methodName, opts) {
        return function(url, data, callback, error, element) {
            var options = opts || {};
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

            options = $.extend(options, {
                data: data,
                success: callback,
                error: error
            });

            if (typeof url === 'string') {
                options.url = url;
            } else {
                $.extend(options, url);
            }

            options.type = methodName;

            return request(options, element);
        };
    }

    $.each(keys(REST), function(i, method) {
        io[method] = getMethodsForRequest(method);
    });

    // io.ajaxSetup = ajaxSetup;
    io.request = request;

    ajaxSetup();

    return io;
});