'use strict';

var gulp = require('gulp'),
    root = process.cwd(),
    src = root + '/src',
    dist = root + '/dist',
    html = root + '/html',
    view = src + '/views';

function clear() {
    var clean = require('gulp-clean');
    return gulp.src( [dist, html, view], {read: true} ).pipe( clean() );
}

// clean file
gulp.task('clean',  clear);