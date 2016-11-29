
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;

// Internal helper functions {{{

function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}

var isArray = Array.isArray || function() {
    return o && o instanceof Array;
};

var forEach = function(o, fn) {
    var l = o.length,
        i = -1;

    while (++i < l) {
        fn(o[i], i);
    }
};

var forIn = function(o, fn) {
    for (var k in o) {
        if (hasOwn.call(o, k)) {
            fn(o[k], k);
        }
    }
};

// guid generator
var guid = function() {
    var expando = (+new Date).toString('36'),
        seed = -1;
    return function(prefix) {
        return (prefix || '') + expando + ++seed;
    };
}();

var _keys = Object.keys || function(o) {
    var arr = [];
    forIn(function(v, k) { arr.push(k); });
    return arr;
};

var extend = function(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject(add)) return origin;

    var keys = _keys(add);
    var i = keys.length;
    while (i--) {
        origin[keys[i]] = add[keys[i]];
    }
    return origin;
};

var inherits = typeof Object.create === 'function' ?
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
        function TempCtor(child) {
            this.constructor = child;
        }
        return function inherits(ctor, superCtor) {
            ctor.__super__ = superCtor.prototype;
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor(ctor);
        }
    }();

// }}}

/**
 * Mixin combines two objects from right to left, overwriting the left-most
 * object, and returning the newly mixed object for use.  By default all
 * properties are applied, and a property that is already on the reciever will be overwritten.
 *
 * @param {Object} r The object to receive the augmentation.
 * @param {Mixed} s The objects that supplies the properties to augment.
 *
 * @example
 *
 * ```js
 * var source = { foo: 1 };
 * var target = { bar: 2 };
 * extend(source, target); // => { foo: 1, bar: 2 }
 * ```
 */
exports.extend = function(r, s) {
    var supplies = [].slice.call(arguments, 1),
        l = supplies.length,
        i = -1;

    while (++i < l) {
        extend(r, supplies[i]);
    }
    return r;
};

/**
 * Inherit the prototype methods from one constructor into another.
 * sync from standard node.js 'util' module with `super_` api for superclass refs
 *
 * @method inherits
 *
 * @param {Function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {Function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor, prototype) {
    inherits(ctor, superCtor);
    // extend ctor prototype
    if (prototype) {
        extend(ctor.prototype, prototype);
    }
};

/**
 * Parse a querystring to a map object.
 *
 * @param {String} search The targe querystring to parse, actually it like location.search
 * @return {Object} A object with k/v mpping from query.
 */
exports.parseParams = function(search) {
    // Fails if a key exists twice (e.g., ?a=foo&a=bar would return {a:"bar"}
    var queryKeys = {};
    if (search) {
        if (search.charAt(0) !== '?') search = '?' + search;
        search.replace(/(?:^\?|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
            if ($1) queryKeys[$1] = unescape($2);
        });
    }
    return queryKeys;
};

/**
 * forEach iterator enhancements with more performances.
 *
 * @method each
 * @param {Object|Array} object to iteration
 * @param {Function} fn
 */
exports.each = function(o, fn) {
    if (o.forEach) {
        return o.forEach(fn);
    } else {
        if (isArray(o)) {
            forEach(o, fn);
        } else {
            forIn(o, fn);
        }
    }
};

/**
 * Mixin object from supplies to reciever, support deepth and force mix.
 *
 * @param {Object} r
 * @param {Object} s
 */
exports.mix = function mix(r, s, deep, force) {
    for (var k in s) if (s.hasOwnProperty(k)) {
        if (s[k] && r[k] && deep && typeof s[k] === 'object') {
            mix(r[k], s[k], deep, force);
        } else {
            if (r[k] === undefined || force) {
                r[k] = s[k];
            }
        }
    }
    return r;
};

/**
 * GUID generator.
 *
 * @method guid
 * @param {String} prefix (Optional) set the prefix for guid.
 * @return {String} Returns a unique id for current page context.
 */
exports.guid = guid;

/**
 * A cross-browser setImmediate implementation.
 *
 * @method setImmediate
 * @param {Function} callback
 * @author Allex Wang
 */
exports.setImmediate = function() {
    var global = new Function('return this')()
      , document = global.document
      , _postMessage = global.postMessage
      , _setImmediate = global.setImmediate;

    return _setImmediate ? _setImmediate : 'onreadystatechange' in document.createElement('script') ? function(callback) {
        function f() {
            el.onreadystatechange = null;
            el.parentNode.removeChild(el);
            callback();
        }
        var el = document.createElement('script');
        el.onreadystatechange = f;
        document.documentElement.appendChild(el);
    } : _postMessage ? function(callback) {
        function f(e) {
            if (e.data === key) {
                global.removeEventListener('message', f, true);
                callback();
            }
        }
        var key = guid();
        global.addEventListener('message', f, true);
        _postMessage(key, '*');
    } : function(f) {
        global.setTimeout(f, 0);
    }
}();

/**
 * noop function for async callback defaults
 *
 * @method noop
 */
exports.noop = function() {};