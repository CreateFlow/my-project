'use strict';

(function () {
    avalon.ready(function () {

        var loginCtrl = avalon.define('loginCtrl', function (vm) {
            // data
            vm.setup = function () {
                storage.removeCurrentUser();
                var data = {
                    'authToken': urls.getParamByKey("authToken"),
                    'userId': urls.getParamByKey("customerId"),
                    'username': urls.getParamByKey("username"),
                    'licensePassedStatus': urls.getParamByKey("licensePassedStatus"),
                    'shopMerchant':  eval(urls.getParamByKey("shopMerchant"))
                }
                console.log(data.authToken)
                if (data.authToken) {
                    console.log(storage.setUser())
                    storage.setUser(data);
                    urls.goRef('/');
                } else {
                    console.log('error')
                }
            };

        });

        avalon.scan();
        loginCtrl.setup();



    });

} ());
