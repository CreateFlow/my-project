'use strict';

(function(window, $) {

    function login(formData, btn, callBack) {
        var userName = formData.userName,
            password = formData.password,
            url = urlConfig.index;

        function error(data, textStatus, jqXHR) {
            storage.removeUser();
            callBack(data);
        }

        function success(data) {
            storage.setUser(data.result);
            if (!callBack) {
                urls.goRef(url);
            } else {
                callBack(data);
            }
        }

        if (typeof btn === 'function') {
            callBack = btn;
            btn = null;
        }

        if (userName && password) {
            return io.POST(apiConfig.login, formData, success, error, btn);
        }
    }

    function logout(btn) {

        function success(data) {
            storage.removeUser();
            urls.goLogin();
        }

        io.GET(apiConfig.logout, success, btn);
    }

    function toPay(sn, target) {
        if (!target) {
            target = "_self";
        }
        var snList = null;
        if (typeof sn === 'string') {
            snList = [];
            snList.push(sn);
        } else {
            snList = sn;
        }


        io.POST(apiConfig.orderDeltail + "paysign", snList, function(data) {
            var form = $('<form></form>').attr("style", 'display:none').attr("action", window.payUrl).attr("method", "POST")
                .attr("target", target);
            var jsondata = null;
            for (var key in data.result) {
                if (key == 'params') {
                    form.append('<input type="text" name="' + key + '" value="">');
                    jsondata = data.result[key];
                } else {
                    form.append('<input type="text" name="' + key + '" value="' + data.result[key] + '">');
                }

            }
            form.appendTo('body');

            $(form).find(":input[name=params]").val(jsondata);
            form.submit();

            form.remove();
        });

    }

    window.common = {
        login: login,
        logout: logout,
        toPay: toPay
    };
}(this, jQuery));