'use strict';

define(function(require, exports, module) {
    var $ = require('jquery'),
        extend = $.extend,

        inherits = typeof Object.create === 'function' ?
            // implementation from standard node.js 'util' module
            function inherits(ctor, superCtor) {
                ctor.__super__ = superCtor.prototype;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            } :
            // old school shim for old browsers
            function() {
                // 为了节省内存，使用一个共享的构造器
                function TempCtor(child) {
                    this.constructor = child;
                }
                return function inherits(ctor, superCtor) {
                    ctor.__super__ = superCtor.prototype;
                    TempCtor.prototype = superCtor.prototype;
                    ctor.prototype = new TempCtor(ctor);
                    // 不要保持一个 O 的杂散引用，切割引用
                    TempCtor.prototype = null;
                };
            }();

    module.exports = function(ctor, superCtor, prototype) {
        inherits(ctor, superCtor);
        // extend ctor prototype
        if (prototype) {
            extend(ctor.prototype, prototype);
        }
    };

});