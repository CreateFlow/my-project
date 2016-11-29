'use strict';
var path = require('path'),
    glob = require('glob'),

    PATTREN = '/**/*.js',
    ROOT_PATH = process.cwd(),
    JS_PATH = path.resolve(ROOT_PATH, 'src/js'),
    DIST_PATH = path.resolve(ROOT_PATH, 'dist');


function inFilter(basename, filter) {
    var len;
    if ( Array.isArray(filter) ) {
        len = filter.length;
        while (len --) {
            if ( filter.indexOf(basename) !== -1 ) {
                return true;
            }
        }
    }
}

function getModulesName(entryPath, filter) {
    var entry, dirname, basename, extname, len,
        i = 0,
        names = [],
        files = glob.sync( path.join(JS_PATH, entryPath, PATTREN) );

    for (len = files.length; i < len; i += 1) {
        entry = files[i];
        dirname = path.posix.dirname(entry).replace(JS_PATH + '/', '');
        extname = path.posix.extname(entry);
        basename = path.posix.basename(entry, extname);

        if (filter && !inFilter(basename, filter) ) {
            continue;
        }

        names.push(path.join(dirname, basename));
    }

    return names;
}

function getModules(opts) {
    var bundles = getBundles(opts.bundleDir, opts.include, opts.alias),
        modules = getModulesName(opts.baseDir);

    return setMainModule(modules, bundles).concat([
        {
            name: 'lib/require/require',
            create: true,
            include: bundles
        },
        {
            name: 'app'
        }
    ]);
}

function getBundles(bundleDir, include, alias) {
    return getModulesName(bundleDir, include).concat(alias);
}

function setMainModule(modules, bundles) {
    if (modules.length > 0) {
        return modules.map(function(name) {
            return {
                name: name,
                exclude: bundles
            }
        });
    }
}

module.exports = getModules;