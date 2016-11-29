'use strict';

define(function(require, exports, module) {

    var avalon = require('avalon'),
        urls = require('module/common/utils/url'),
        request = require('lib/io/request'),
        session = require('lib/io/session'),
        user = session.getUser(),
        API = require('module/common/config/api');

    if (user == null) {
        urls.goLogin();
    }

    avalon.ready(function() {

        var vm = avalon.define({
            $id: 'topCtrl',
            username: user.username,
            totalQuantity: 0,
            logout: function() {
                request.GET(API.logout, function(responseData) {
                    session.removeUser();
                    urls.goLogin();
                });
            }
        });

        request.GET(API.queryCart, function(data) {
            if (data.success) {
                vm.totalQuantity = data.result.totalQuantity;
            }
        });

    });

    avalon.scan();

});