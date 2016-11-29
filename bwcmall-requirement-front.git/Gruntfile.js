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
                files: ['<%= config.app %>/template/**/*.html', '!<%= config.app %>/partials/**/*.html'],
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
                files: ['<%= config.app %>/styles/sass/{*/,**/}*.{scss,sass}'],
                tasks: ['sass']
            },
            styles: {
                files: ['<%= config.app %>/styles/**/*.css', '!<%= config.app %>/styles/sass/**/*.{scss,sass}'],
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
                        '<%= config.app %>/template/**/*.html',
                        '<%= config.app %>/partials/**/*.html',
                        // '<%= config.app %>/styles/{*/,**/}*.css',
                        '<%= config.app %>/scripts/module/**/*.js',
                        '.tmp/styles/{*/,**/}*.css',
                        '<%= config.app %>/images/**/*',
                        '.tmp/js/{,*/}*.js'
                    ],
                    ui: {
                        port: 3002
                    },
                    port: 9001,
                    server: {
                        baseDir: ['.tmp', config.app, config.dist],
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
                    cwd: '<%= config.app %>/styles/sass/',
                    src: ['{*/,**/}*.{scss,sass}'],
                    dest: '.tmp/styles',
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
                    src: '{*/,**/}*.css',
                    dest: '.tmp/css'
                }]
            }
        },
        // Automatically inject Bower components into the HTML file
        wiredep: {
            app: {
                src: ['<%= config.app %>/template/**/*.html'],
                ignorePath: /^(\.\.\/)*\.\./
            },
            sass: {
                src: ['<%= config.app %>/styles/sass/{,*/}*.{scss,sass}'],
                ignorePath: /^(\.\.\/)+/
            }
        },
        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/imges',
                    src: '**/*.{gif,jpeg,jpg,png}',
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
					'.tmp/styles/{*/,**/}*.css',
                    '<%= config.dist %>/scripts/include/{*/,**/}*.js',
                    '<%= config.dist %>/scripts/json/{*/,**/}*.js',
                    '<%= config.dist %>/scripts/module/{*/,**/}*.js',
                    '<%= config.dist %>/scripts/plugin/{*/,**/}*.js',
                    '<%= config.dist %>/styles/**/*.css',
                    '<%= config.dist %>/imgages/{,*/}*.*',
                    '<%= config.dist %>/fonts/{,*/}*.*',
                    '<%= config.dist %>/*.{png}'
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
            html: ['<%= config.dist %>/template/**/*.html']
        },
        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: [
					 '.tmp/styles',
                    '<%= config.dist %>',
                    '<%= config.dist %>/imgages',
                    '<%= config.dist %>/styles'

                ]
            },
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css','.tmp/styles/{*/,**/}*.css']
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
                '<%= config.app %>/scripts/**/*.js'
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
                        'imgages/{,*/}*.webp',
                        'template/module/{,*/}*.html',
                        'images/**/*',
                        'styles/**/*.css',
                        'scripts/**/*',
                        '*.xml',
						'*.html',
						'*.xsl',
						'favicon.ico'
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
                    cwd: '.',
                    dest: '<%= config.dist %>',
                    src: 'bower_components/**/*',
                }, {
                    expand: true,
                    dot: true,
                    cwd: '.tmp',
                    dest: '<%= config.dist %>',
                    src: 'styles/**/*.css',
                }]
            }
        },
        concurrent: {
            server: [
                'sass'
            ],
            dist: [
                'sass',
                'imagemin'
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
                expand: true,
                cwd: '<%= config.app %>/template/module/',
                src: '{,*/}*.html',
                // Destination directory to copy files to
                dest: '<%= config.dist %>/'
            }
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
            'sass',
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
         'wiredep',
         'useminPrepare',
         'concurrent:dist',
          'postcss', 
		'sass',
        //'concat',
          'cssmin',
      //   'uglify',
       'copy:dist',
         'filerev',
         'usemin',
         'htmlmin'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
