/**
 * Grunt configuration
 *
 * @author Jian Hou
 * @data Jun 17th 2016
 * @update Jun 20th 2016
 */

'use strict';

var glob = require('glob'),
    path = require('path'),
    fs= require('fs'),

    SYSTEM_WIN = 'win32',
    CONFIG_PATH = './config',
    ENTRIES_PATH = './config/*.*',
    CONFIG_BASE_PATH = '/src/js/module/common/config',
    ROOT_PATH = process.cwd();

function getPathDir(pathDir) {
    if (process.platform === SYSTEM_WIN) {
        pathDir = pathDir.replace(/\//g, '\\\\');
    }
    return pathDir;
}

function getEntry(globPath) {
    var entry, dirname, basename, extname, len,
        i = 0,
        map = {},
        files = glob.sync(globPath);

    for (len = files.length; i < len; i += 1) {
        entry = files[i];
        dirname = path.posix.dirname(entry);
        extname = path.posix.extname(entry);
        basename = path.posix.basename(entry, extname);
        map[basename] = getPathDir( path.join(ROOT_PATH, dirname, basename) );
    }

    return map;
}

function replacePath(opts) {
    var configPath = path.resolve( ROOT_PATH, getPathDir(CONFIG_BASE_PATH) );
    if (opts !== undefined) {

        fs.readFile( path.join(ROOT_PATH, configPath, 'config.js'), {encoding:'utf-8'}, function(err, file) {
            var matches,
                result = [],
                str = file,
                fileStr = file,
                options = {encoding:'utf-8'},
                pattern = /\{\{([^}]+)\}\}/;

            // fs.unlinkSync( path.join(ROOT_PATH, configPath, 'path.js'), function(err) {
            //    if (err) {
            //        throw err;
            //    }
            //    console.log('successfully deleted!');
            // });

            while ( matches = pattern.exec(str) ) {
                result.push(matches[0]);
                str = str.substring( str.indexOf(matches[0]) + 1 );
            }

            result.forEach(function(rStr) {
                var key = /\w+/.exec(rStr)[0];
                fileStr = fileStr.replace(rStr, opts[key]);
            });

            fs.writeFile( path.join(ROOT_PATH, configPath, 'path.js'), fileStr, options );
        });
    }

}

function registerTasks(name, entries, grunt) {
    var options = require(entries[name]);

    if ('grunt' in options) {

        Object.keys(options.grunt).forEach(function(key) {
            switch (key) {
                case 'task':
                    grunt.registerTask(name,  function() {
                        grunt.task.run(options.grunt[key]);
                    });
                    break;
                default:
                    break;
                    // console.log('default');
            }
        });
    } else {
        console.log('grunt isn\'t configured!');
    }

}

function registerPathTask(taskName, entries, grunt) {
    grunt.registerTask(taskName, function(target) {
        var options, key,
            keys = Object.keys(entries);

        if ( Object.keys(entries).indexOf(target) !== -1 ) {
            options = require(entries[target]);
            key = options.grunt[taskName];
            replacePath(options[taskName]);
        }
    });
}

function makeConfig(grunt, opts) {
    var initConfig = require(CONFIG_PATH),
        entries = getEntry( getPathDir(ENTRIES_PATH) );

    registerPathTask('path', entries, grunt);

    Object.keys(entries).forEach(function(key) {
        registerTasks(key, entries, grunt);
    });

    grunt.initConfig( initConfig(grunt, opts) );
}

module.exports = makeConfig;