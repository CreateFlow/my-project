'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*', '@*/grunt-*']
    });

    // configurable paths
    var config = {
        app: 'app',
        assets: 'assets',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Project settings
        config: config,
        watch: {
            includereplace: {
                files: ['<%= config.app %>/**/*.html', '!<%= config.app %>/common/{, */}/*.html'],
                tasks: ['includereplace']
            },
            // bower: {
            //     files: ['bower.json'],
            //     tasks: ['wiredep']
            // },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            sass: {
                files: ['<%= config.assets %>/styles/sass/**/*.{scss,sass}'],
                tasks: ['sass', 'postcss']
            },
            styles: {
                files: ['<%= config.assets %>/styles/**/*.css', '!<%= config.assets %>/styles/sass/**/*.{scss,sass}'],
                tasks: ['newer:copy:css', 'postcss']
            }
        },
        browserSync: {
            options: {
                notify: false,
                background: true,
                watchOptions: {
                    ignored: ''
                }
            },
            livereload: {
                options: {
                    files: [
                        '<%= config.app %>/**/*.html',
                        '<%= config.app %>/**/*.js',
                        '<%= config.assets %>/styles/**/*.css',
                        '<%= config.assets %>/images/**/*',
                        '<%= config.assets %>/css/**/*.css',
                        // '.tmp/css/{,*/}*.css',
                        '.tmp/js/**/*.js'
                    ],
                    port: 9031,
                    server: {
                        baseDir: ['config.assets %>/css', config.dist, config.app, config.assets],
                        routes: {
                            '/bower_components': './bower_components'
                        }
                    }
                }
            },
            dist: {
                options: {
                    background: false,
                    server: '<%= config.dist %>'
                }
            }
        },
        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.assets %>/css',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                sourceMap: true,
                sourceMapEmbed: true,
                sourceMapContents: true,
                includePaths: ['.']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.assets %>/styles/sass/',
                    src: ['**/*.{scss,sass}'],
                    dest: '<%= config.assets %>/css',
                    ext: '.css'
                }]
            }
        },
        postcss: {
            options: {
                map: true,
                processors: [
                    // Add vendor prefixed styles
                    require('autoprefixer')({
                        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
                    })
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/css/',
                    src: '{,*/}*.css',
                    dest: '.tmp/css/'
                }]
            }
        },
        // Automatically inject Bower components into the HTML file
        // wiredep: {
        //     app: {
        //         src: ['<%= config.app %>/template/**/*.html'],
        //         ignorePath: /^(\.\.\/)*\.\./
        //     },
        //     sass: {
        //         src: ['<%= config.app %>/styles/sass/{,*/}*.{scss,sass}'],
        //         ignorePath: /^(\.\.\/)+/
        //     }
        // },
        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.assets %>/imges',
                    src: '**/*.{gif,jpeg,jpg,png}',
                    dest: '<%= config.dist %>/img'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.assets %>/imges',
                    src: '{,*/}*.svg',
                    dest: '<%= config.dist %>/img'
                }]
            }
        },
        cssmin: {
            dist: {
                options: {
                    banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
                },
                files: {
                    '<%= config.dist %>/styles/main.min.css': [
                        '.tmp/css/{,*/}*.css',
                        '<%= config.app %>/styles/**/*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    // true would impact styles with attribute selectors
                    removeRedundantAttributes: false,
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: 'template/module/{,*/}*.html',
                    dest: '<%= config.dist %>'
                }]
            }
        },
        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= config.dist %>/js/**/*.js',
                    '<%= config.dist %>/css/**/*.css'
                    //'<%= config.dist %>/images/{,*/}*.*',
                    //'<%= config.dist %>/fonts/{,*/}*.*',
                    //'<%= config.dist %>/*.{ico,png}'
                ]
            }
        },
        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ['<%= config.app %>/**/*.html'],
            options: {
                dest: '<%= config.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        }
                    }
                }
            }

            // html: ['<%= config.app %>/template/module/{,*/}*.html']
        },
        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: [
                    '<%= config.dist %>',
                    '<%= config.dist %>/images',
                    '<%= config.dist %>/styles'
                ]
            },
            html: ['<%= config.dist %>/**/*.html'],
            css: ['<%= config.dist %>/**/*.css']
        },
        // configure jshint to validate js files -----------------------------------
        jshint: {
            options: {
                reporter: require('jshint-stylish'), // use jshint-stylish to make our errors look and read good
                jshintrc: '.jshintrc'
            },
            // when this task is run, lint the Gruntfile and all js files in scripts
            all: [
                'Gruntfile.js',
                '<%= config.app %>/**/*.js'
            ]
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'templates/**/*.html',
                        'images/**/*',
                        'css/**/*'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '.',
                    flatten: true,
                    filter: 'isFile',
                    src: 'bower_components/font-awesome/fonts/{,*/}*.*',
                    dest: '<%= config.dist %>/fonts/'
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= config.assets %>/css',
                    dest: '<%= config.dist %>/css',
                    src: '{,*/}*.css'
                }, {
                    expand: true,
                    dot: true,
                    cwd: '.',
                    dest: '<%= config.dist %>',
                    src: 'bower_components/**/*',
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= config.assets %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            },
            css: {
                expand: true,
                cwd: '.tmp/styles/',
                dest: '<%= config.dist %>/styles',
                src: '{,*/}*.css'
            },
            lib: {
                expand: true,
                cwd: '<%= config.assets %>',
                dest: '<%= config.dist %>',
                src: ['**/*']
            }
        },
        includereplace: {
            build: {
                options: {
                    // Task-specific options go here.
                },
                // Files to perform replacements and includes with
                expand: true,
                cwd: '<%= config.app %>/templates/',
                src: '**/*.html',
                // Destination directory to copy files to
                dest: '<%= config.dist %>/'
            }
        },
        concurrent: {
            server: [
                'sass'
            ],
            dist: [
                'sass',
                'imagemin',
                'svgmin'
            ]
        }

    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.registerTask('serve', 'start the server and preview your app', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'browserSync:dist']);
        }

        grunt.task.run([
            'clean:server',
            'includereplace',
            //'wiredep',
            'concurrent:server',
            'postcss',
            'browserSync:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'includereplace',
        //'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'postcss',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        //'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
