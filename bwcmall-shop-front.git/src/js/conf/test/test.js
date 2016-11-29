'use strict';

define(function(require, exports, module) {
    var avalon = require('avalon');
    var $ = require('jquery');
    // loading ui component
    var api = require('module/common/config/api');
    var request = require('lib/io/request');
    var session = require('lib/io/session');
    
    require('oniui/dialog/avalon.dialog');
    var url = require('lib/plugins/url/url');
    require('domReady');
    require('oniui/tab/avalon.tab');
    require('oniui/pager/avalon.pager');
    require('oniui/datepicker/avalon.datepicker');
    require('module/common/ui/scaffolding');
    // debug
    avalon.log("domReady完成")
    // define model
    var vm = avalon.define({$id: "demo"})
    // scannig vm
    avalon.scan(document.body, vm);
});