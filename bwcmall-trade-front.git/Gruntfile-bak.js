// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>

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
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Project settings
        config: config,
        watch: {
            includereplace: {
                files: ['<%= config.app %>/template/module/{,*/}*.html', '!<%= config.app %>/index.html'],
                tasks: ['includereplace']
            },
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            sass: {
                files: ['<%= config.app %>/sass/{,*/}*.{scss,sass}'],
                tasks: ['sass', 'postcss']
            }, 
            styles: {
                files: ['<%= config.app %>/css/{,*/}*.css'],
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
                        '<%= config.app %>/{,*/}*.html',
                        'dist/css/{,*/}*.css',
                        '<%= config.app %>/img/{,*/}*',
                        'dist/js/{,*/}*.js'
                    ],
                    port: 9000,
                    server: {
                        baseDir: ['dist','dist/app/template/module'],
                        routes: {
                            '/bower_components': './bower_components'
                        }
                    }
                }
            },
            /*
            test: {
                options: {
                    port: 9001,
                    open: false,
                    logLevel: 'silent',
                    host: 'localhost',
                    server: {
                        baseDir: ['.tmp', './test', config.app],
                        routes: {
                            '/bower_components': './bower_components'
                        }
                    }
                }
            },*/
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
                    cwd: '<%= config.app %>/css',
                    src: ['*.{scss,sass}'],
                    dest: '.tmp/css',
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
        wiredep: {
            asset: {
                src: ['<%= config.app %>/index.html','<%= config.app %>/login.html'],
                exclude: ['bootstrap.js'],
                ignorePath: /^(\.\.\/)*\.\./
            },
            sass: {
                src: ['<%= config.app %>/css/{,*/}*.{scss,sass}'],
                ignorePath: /^(\.\.\/)+/
            }
        },
        // The following *-min tasks produce minified files in the dist folder
        imagemin: { 
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/img',
                    src: '{,*/}*.{gif,jpeg,jpg}', // ÒªÐÞ¸´png
                    dest: '<%= config.dist %>/img'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/img',
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
                    '<%= config.dist %>/css/main.min.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= config.app %>/css/{,*/}*.css'
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
                    src: 'dist/template/module/{,*/}*.html',
                    dest: '<%= config.dist %>'
                }]
            }
        },
        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= config.dist %>/js/{,*/}*.js',
                    '<%= config.dist %>/css/{,*/}*.css',
                    '<%= config.dist %>/img/{,*/}*.*',
                    '<%= config.dist %>/css/fonts/{,*/}*.*',
                    '<%= config.dist %>/*.{ico,png}'
                ]
            }
        },
        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: ['<%= config.dist %>/template/module/{,*/}*.html']
        },
        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: [
                    '<%= config.dist %>',
                    '<%= config.dist %>/img',
                    '<%= config.dist %>/css'
                ]
            },
            html: ['<%= config.dist %>/template/module/{,*/}*.html'],
            css: ['<%= config.dist %>/css/{,*/}*.css']
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
                '<%= config.app %>/js/{,*/}*.js'
            ]
        },
        /*
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
                }
            }
        },*/

        // By default, your `index.html`'s <!-- Usemin block --> will take care
        // of minification. These next options are pre-configured if you do not
        // wish to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= config.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css',
        //         '<%= config.app %>/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= config.dist %>/scripts/scripts.js': [
        //         '<%= config.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },
        // Copies remaining files to places other tasks can use
        // Run some tasks in parallel to speed up build process
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.webp',
                        '{,*/}*.html',
						'js/{,*/}*.*',
                        'fonts/{,*/}*.*',
                        'css/fonts/{,*/}*.*',
                        'css/img/{,*/}*.*'
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
                    cwd: './bower_components/jquery-mobile-bower/css/',
                    src: 'images/**',
                    dest: '<%= config.dist %>/styles/'
                }]
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
        },
        requirejs: {
            compile: {
                options: {
                    name: 'main',
                    baseUrl: ".",
                    mainConfigFile: "./main.js",
                    out: "./optimized.js",
                    preserveLicenseComments: false,
                    include: ['path/to/require.js']
                }
            }
        },
        includereplace: {
            build: {
                options: {
                    // Task-specific options go here.
                },
                // Files to perform replacements and includes with
                src: '<%= config.app %>/template/module/{,*/}*.html',
                // Destination directory to copy files to
                dest: '<%= config.dist %>/'
            }
        }
    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.registerTask('serve', 'start the server and preview your asset', function(target) {
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

    /*
        grunt.registerTask('test', function(target) {
            if (target !== 'watch') {
                grunt.task.run([
                    'clean:server',
                    'concurrent:test',
                    'postcss'
                ]);
            }

            grunt.task.run([
                'browserSync:test',
                'mocha'
            ]);
        });
    */
    grunt.registerTask('build', [
        'clean:dist',
        'includereplace',
        //'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'postcss',
       // 'concat', 
        'cssmin',
		//'uglify', 
        'copy:dist',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        //'test',
        'build'
    ]);
};
