'use strict';

var getModules = require('./makeConfig'),
    options = require('./build');

if ('modules' in options) {
    options.modules = getModules(options.modules);
}

module.exports = {
    compile: {
        options: options
    }
};