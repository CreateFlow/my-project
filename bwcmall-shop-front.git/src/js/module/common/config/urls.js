'use strict';

define(function(require, exports, module) {

    var path = require('module/common/config/path'),
        basePath = path.bwcmallBase,
        urls = {
            index: '/index.html',
            login: '/member/login.html'
        };

    function mergePath(url) {
        var path = {};

        Object.keys(url).forEach(function(key) {
            path[key] = basePath + url[key];
        });

        return path;
    }

    module.exports = mergePath(urls);

});