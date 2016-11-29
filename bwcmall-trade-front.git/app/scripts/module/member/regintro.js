'use strict';

avalon.ready(function() {

    var token, user;
    if ( !storage.isLogin() ) {
        urls.goLogin();
    } else {
        user = storage.getCurrentUser();
    }

    var regIntroCtrl = avalon.define('regIntroCtrl', function(vm) {
        vm.username = user.username;
        vm.welcome = '尊敬的用户，' + user.username + '您好';
        vm.logout = function() {
            io.GET(apiConfig.logout, function(responseData) {
                storage.removeUser();
                urls.goLogin();
            });
        };
    });

    avalon.scan();

});