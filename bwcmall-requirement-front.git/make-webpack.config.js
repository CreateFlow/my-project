var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var NOOP = function() {};
var SYSTEM_WIN = 'win32';

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
var LIB_PATH = path.resolve(APP_PATH, 'js/lib');
var MODULE_PATH = path.resolve(APP_PATH, 'js/module');
var IMAGE_PATH = APP_PATH + '/img';
var ALIAS = {
    jquery: LIB_PATH + "/jquery/1.8.3/jquery.js",
    avalon: LIB_PATH + "/avalon/1.47/avalon.shim.js",
    '../avalon': LIB_PATH + "/avalon/1.47/avalon.shim.js",
    mock: ROOT_PATH + '/mock',
    oniui: APP_PATH + "/js/plugin/oniui",
    template: APP_PATH + '/template',
    images: IMAGE_PATH,
    sass: APP_PATH + "/sass",
    css: APP_PATH + "/css",
    js: APP_PATH + "/js",
    lib: LIB_PATH
};

var filterConfig = Object.keys( require('./config/entries.config.js') );
var entries = getEntry('src/js/module/**/*.js', 'src/js/module/', filterConfig);

var srcDir = path.resolve(process.cwd(), 'src');

function getEntries() {
    var jsDir = path.resolve(srcDir, 'js');
    var entryFiles = glob.sync(jsDir + '/*.{js,jsx}');
    var map = {};

    entryFiles.forEach( function(filePath) {
        var filename = filePath.substring( filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.') );
        map[filename] = filePath;
    });

    return map;
}

function getEntry(globPath, pathDir, filter) {
    var entry, dirname, basename, pathname, extname,
        entries = {},
        files = glob.sync(globPath);

    // replace path for windows
    if (process.platform === SYSTEM_WIN) {
        pathDir = pathDir.replace(/\//g, '\\\\');
    }

    for (var i = 0, len = files.length; i < len; i ++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        if ( filter && Array.isArray(filter) && filter.indexOf(basename) === -1 ) {
            continue;
        }
        pathname = path.join(dirname, basename);
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = './' + entry;
    }

    return entries;
}

module.exports = function(options) {
    options = options || {};
    var pages = Object.keys( getEntry('src/views/**/*.html', 'src/views/') ),
        chunks = Object.keys(entries),
        debug = 'debug' in options ? options.debug : true,
        config = {
			debug: debug ? true : false,
            entry: entries,
            output: {
                path: path.join(BUILD_PATH),
                publicPath: debug ? '/dist/' : 'http://s1.earth.dev.bwcmall.cn',
                filename: debug ? 'js/[name].js' : 'js/[name].[hash].js',
                chunkFilename: debug ? 'js/[id].chunk.js' : 'js/[id].[hash].chunk.js'
            },
            module: {
                loaders: [
                    {
                        test: /\.css$/,
                        loader: ExtractTextPlugin.extract('style', 'css')
                    },
                    {
                        test: /\.scss$/,
                        loader: ExtractTextPlugin.extract('css!sass')
                    },
                    // {
                    //     test: /\.html$/,
                    //     loader: "html"
                    // },
                    {
                        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                        loader: 'file-loader?name=fonts/[name].[ext]'
                    },
                    {
                        test: /\.(png|jpe?g|gif)$/,
                        loader: 'url-loader?limit=512&name=img/[name].[ext]',
                        resolve: {
                            context: IMAGE_PATH
                        }
                        // context: IMAGE_PATH
                        //loader: 'url-loader?limit=8192&name=imgs/[name]-[hash].[ext]'
                    }
                ],
				preLoaders: [{
     				test: /\.js$/,
      				loader: "require-css-preloader"
    			}]
            },
            resolve: {
                alias: ALIAS
            },
            plugins: [
                new CommonsChunkPlugin({
                    name: 'vendors',
                    chunks: chunks,
                    minChunks: chunks.length
                }),
                new ExtractTextPlugin( debug ? 'styles/[name].css' : 'styles/[name].[hash].css'),
                debug ? NOOP : new UglifyJsPlugin({
                    compress: {
                        warnings: false
                    },
                    except: ['$super', '$', 'exports', 'require']
                }),
                new webpack.HotModuleReplacementPlugin()
                // new HtmlWebpackPlugin({
                //     filename: '../html/test.html',
                //     template: 'src/views/test/test.html',
                //     inject: 'body',
                //     chunks: ['vendors', 'test/test']
                // })
            ],
            devtool: debug ? 'source-map' : 'eval',
            devServer: {
                // publicPath: '/dist/',
                // proxy: {
                //     "*": "http://localhost:54999"
                // },
                inline: true,
                hot: true,
                stats: {
                    cached: false,
                    colors: true
                }
            }
        };

    function plugins() {
        var entryHtml = glob.sync(APP_PATH + '/views/**/*.html');
        var pluginArray = [];

        entryHtml.forEach( function(filePath) {
            var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
            var conf = {
                template: 'html!' + filePath,
                filename: '../html/' + filename + '.html'
            };

            console.log('filename', filename);
            console.log('conf', conf);

            // if (filename in entries) {
            //     conf.inject = 'body';
            //     conf.chunks = ['vender', 'common', filename];
            // }

            // if(/b|c/.test(filename)) { conf.chunks.splice(2, 0, 'common-b-c'); }

            pluginArray.push( new HtmlWebpackPlugin(conf) );
        });

        return pluginArray;
    }

    // config.plugins = config.plugins.concat( plugins() );
    pages.forEach(function(pathname) {
        var conf = {
            filename: '../html/' + pathname + '.html',
            template: 'html!' + APP_PATH + '/views/' + pathname + '.html',
            inject: false,
            minify: {
                removeComments: debug ? false : true,
                collapseWhitespace: false
            }
        };

        if (pathname in config.entry) {
            // conf.favicon = 'src/imgs/favicon.ico';
            conf.inject = 'body';
            conf.chunks = ['vendors', pathname];
            conf.hash = false;
        }

        config.plugins.push( new HtmlWebpackPlugin(conf) );

    });

    return config;

};