'use strict';

define(function(require, exports, module) {
    var avalon = require('avalon');
    var $ = require('jquery');
    var api = require('module/common/config/api');
    var api = require('lib/plugins/url/url');
    // loading ui component
    require('domReady');
    require('oniui/tab/avalon.tab');
    require('oniui/pager/avalon.pager');
    require('oniui/datepicker/avalon.datepicker');
    // debug
    avalon.log("domReady完成")
    // define model
    var vm = avalon.define({$id: "demo"})
    // scannig vm
    avalon.scan(document.body, vm);
});
// define(function(require, exports, module) {
//     // var $ = require('jquery');
//     var foo = require('./foo');
//     console.log();
// });