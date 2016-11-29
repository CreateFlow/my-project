/**
 * Grunt configuration
 *
 * @author Jian Hou
 * @data Jun 17th 2016
 * @update Jun 21th 2016
 */

'use strict';

module.exports = function(grunt) {

    var makeGruntTask = require('./grunt/makeConfig');

    // var configMap = ['local', 'dev', 'uat', 'beta', 'production'];
    // make progress bar of time
    require('time-grunt')(grunt);
    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*', '@*/grunt-*']
    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    makeGruntTask(grunt, {
        src: 'src',
        dist: 'dist',
        tmp: '.tmp'
    });

    grunt.registerTask('default', ['local']);

};