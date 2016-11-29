/**
 * Grunt configuration
 *
 * @author Jian Hou
 * @data Jun 17th 2016
 * @update Jun 23th 2016
 */

'use strict';

module.exports = function(grunt, opts) {

    return {

        pkg: grunt.file.readJSON('package.json'),
        options: opts,

        watch: {
            includereplace: {
                files: ['<%= options.src %>/html/**/*.html'],
                tasks: ['includereplace']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['<%= options.src %>/sass/{*/,**/}*.{scss,sass}'],
                tasks: ['compass']
            }
        },

        browserSync: {
            options: {
                notify: false,
                // 执行registerMultiTask()
                background: true,
                watchOptions: {
                    ignored: ''
                }
            },
            livereload: {
                options: {
                    files: [
                        '<%= options.src %>/js/{,**/}*.js',
                        '<%= options.src %>/images/{,**/}*.*',
                        '<%= options.tmp %>/{,**/}*.html',
                        '<%= options.tmp %>/css/{,**/}*.css',
                    ],
                    port: 9000,
                    server: {
                        baseDir: ['<%= options.tmp %>', '<%= options.src %>'],
                        routes: {
                            '/bower_components': './bower_components'
                        }
                    }
                }
            }
        },

        includereplace: {
            build: {
                expand: true,
                cwd: '<%= options.src %>/html/module',
                src: '{*/,**/}*.html',
                dest: '<%= options.tmp %>'
            }
        },

        compass: {
            dist: {
                options: {
                    config: 'compass/config.rb'
                }
            }
        },

        requirejs: require('../require/config'),

        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= options.src %>/images',
                        src: '{,*/}*.{gif,jpeg,jpg,png}',
                        dest: '<%= options.tmp %>/images'
                    }
                ]
            }
        },

        filerev: {
            dist: {
                options: {
                    algorithm: 'md5',
                    length: 16,
                    process: function(basename, name, extension) {
                        return basename + '.' + 'v' + name + '.' + extension;
                    }
                },
                src: ['<%= options.tmp %>/css/{*/,**/}/*.css']
            }
        },

        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [ '<%= options.dist %>{,**/}' ]
                    }
                ]
            },
            server: '.tmp',
            require: '.js'
        },

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= options.src %>',
                        dest: '<%= options.dist %>',
                        src: ['fonts/{, **/}*', '*.xml', '*.ico']
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: '.js',
                        // 展平
                        // flatten: true,
                        src: ['conf/**/*.js', 'lib/require/require.js', '*.js', 'lib/{,**/,}uploadify.swf'],
                        dest: '<%= options.dist %>/js'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= options.tmp %>',
                        src: ['**/*.html', 'images/{, **/}*.*', 'css/**/*.css', '!css/**/*.css.map'],
                        dest: '<%= options.dist %>'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: '.js/lib/oniui/kindeditor',
                        src: ['lang/**/*.*', 'plugins/**/*.*' ,'themes/**/*.*'],
                        dest: '<%= options.dist %>/goods'
                    }
                ]
            }
        }

    };

};