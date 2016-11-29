'use strict';

define(function(require, exports, module) {
    var token,
        $ = require('jquery'),
        urls = require('module/common/utils/url'),
        session = require('lib/io/session');

    require('uploadify');

    var defaults = {
        auto: true,
        method: 'post',
        buttonClass: 'upButtonClass',
        swf: '/js/lib/plugins/uploadify/uploadify.swf',
        fileObjName: 'file',
        fileSizeLimit: 2048,
        width : 160,
        height : 36
    };

    if (!session.getCurrentUser()) {
        urls.goLogin();
    } else {
        token = session.getCurrentUser().authToken;
        defaults.formData = {token: token};
    }

    function uploadify(element, opts) {
        var options = $.extend({}, defaults, opts || {});

        if (element.selector == null) {
            element = $(element);
        }

        element.uploadify(options);
    }

    module.exports = uploadify;
});