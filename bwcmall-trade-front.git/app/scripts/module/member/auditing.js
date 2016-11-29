'use strict';

avalon.ready(function() {

    var token, user;
    if ( !storage.isLogin() ) {
        urls.goLogin();
    } else {
        user = storage.getCurrentUser();
    }

    var auditingCtrl = avalon.define('auditingCtrl', function(vm) {
        vm.username = user.username;

        vm.logout = function() {
            io.GET(apiConfig.logout, function(responseData) {
                storage.removeUser();
                urls.goLogin();
            });
        };

    });

    avalon.scan();

});