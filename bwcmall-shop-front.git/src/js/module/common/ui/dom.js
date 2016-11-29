'use strict';

define(function(require, exports, module) {

    var $ = require('jquery'),
        path = require('module/common/config/path');

    function setDataAttr(element, propName, data) {
        var str, result, tpl, pathName,
            pattern = /\{\{([^}]+)\}\}/;

        str = data[propName];
        result = pattern.exec(str);
        tpl = result[0];
        pathName = result[1];
        str = str.replace(tpl, path[pathName]);
        element.attr(propName, str);
        element.removeAttr('data-' + propName);
    }

    module.exports = function(container, opts) {
        container = container || 'body';
        var selector = '.jNode',
            nodes = $(selector, container);

        if (!nodes.length) {
            return;
        }

        nodes.each(function(index, element) {
            var $elem = $(element),
                data = $elem.data(),
                keys = Object.keys(data),
                len = keys.length;

            while (len --) {
                setDataAttr($elem, keys[len], $elem.data());
            }
        });

    };

});