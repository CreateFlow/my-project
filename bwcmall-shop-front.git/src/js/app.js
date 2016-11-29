'use strict';

require.config({
    baseUrl: '/js',
    paths: {
        'lib': 'lib',
        'jquery': 'lib/jquery/jquery',
        'events': 'lib/core/events/emitter',
        // 'jquery': '/bower_components/jquery/jquery',
        'oniui': 'lib/oniui',
        'avalon': 'lib/oniui/avalon.shim',
        'text': 'lib/oniui/combo/text',
        'css': 'lib/oniui/combo/css',
        'css-builder': 'lib/oniui/combo/css-builder',
        'normalize': 'lib/oniui/combo/normalize',
        'domReady': 'lib/oniui/combo/domReady',
        'uploadify': 'lib/plugins/uploadify/uploadify'
    }
});

if (!Function.prototype.bind) {
    require(['lib/es5-shim/es5-shim']);
}