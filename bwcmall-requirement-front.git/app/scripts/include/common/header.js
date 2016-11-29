'use strict';

var loginStatus = 0;

(function($) {
    var user = storage.getUser(),
        isLogin = typeof user !== 'undefined';

    require(['dialog/avalon.dialog'], function() {
        avalon.ready(function() {
            var headerCtrl = avalon.define('headerCtrl', function(vm) {
                vm.isLogin = isLogin;
                vm.totalQuantity = 0;
                vm.shopMerchant = false;
                vm.licensePassed = false;
                vm.licensePassedStatus = isLogin?user.licensePassedStatus:-1;
                vm.username = isLogin ? user.username : '';
                vm.goLogin = function(){
                    if(!vm.isLogin) {
                        urls.goLogin();
                    }
                }

            });
            avalon.scan();

            $('#logout').click(function() {
                common.logout(this);
            });

    


        });
    });


}(jQuery));