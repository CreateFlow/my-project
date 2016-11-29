'use strict';

(function() {
    avalon.ready(function() {

        var loginCtrl = avalon.define('loginCtrl', function(vm) {
            // data
            vm.user = {
                userName: '',
                password: ''
            };
            // status
            vm.passwordVisible = false;
            vm.inputType = 'password';
            vm.errorInfo = '';
            vm.valid = false;
            vm.invalid = false;
            vm.autoChecked = false;
            vm.pending = false;

            vm.setup = function() {
                storage.removeCurrentUser();
                vm.initProps();
                vm.bindEvent();
                if ($(":input[name=username]").val() && $(":input[name=password]").val()) {
                    vm.valid = true;
                }
            };

            vm.initProps = function() {
                if (isAutoLogin()) {
                    var loginInfo = getLoginInfo();
                    if (typeof loginInfo !== 'undefined') {
                        vm.autoChecked = true;
                        vm.user = loginInfo;
                        vm.valid = vm.validate();
                    } else {
                        setAutoLogin(false);
                    }
                }
            };

            vm.bindEvent = function() {
                //绑定enter事件
                $(document).keyup(function(e) {
                    if (e.keyCode === 13) {
                        loginCtrl.submit();
                    }
                });
            };

            vm.showPassword = function(e) {
                vm.passwordVisible = !vm.passwordVisible;
                vm.inputType = vm.passwordVisible ? 'text' : 'password';
            };

            vm.check = function() {
                vm.autoChecked = !vm.autoChecked;
                setAutoLogin(vm.autoChecked);
            };
            vm.checkValid = function() {
                vm.valid = vm.validate();
            };
            vm.validate = function() {
                var values = [$.trim(vm.user.userName), $.trim(vm.user.password)],
                    len = values.length;

                while (len--) {
                    if (!values[len]) {
                        return false;
                    }
                }

                return true;
            };

            vm.checkPhone = function() {
                var userName = vm.user.userName;
                if (userName.replace(/\s+/g, '') === '') {
                    vm.setErrorInfo(true, '请输入帐号！');
                } else {
                    vm.setErrorInfo(false);
                    vm.valid = vm.validate();
                }
            };

            vm.checkPassword = function() {
                if (vm.user.password.replace(/\s+/g, '') === '') {
                    vm.setErrorInfo(true, '请输入密码！');
                } else {
                    vm.setErrorInfo(false);
                    vm.valid = vm.validate();
                }
            };

            vm.setErrorInfo = function(flag, msg) {
                vm.errorInfo = flag === false ? '' : msg;
                vm.invalid = flag;
            };

            vm.submit = function() {
                if (vm.valid === true && vm.validate() === true) {
                    storage.removeUser();
                    vm.valid = false;
                    // 保存登录账户
                    if (vm.autoChecked) {
                        setLoginInfo(vm.$model.user);
                    }
                    common.login(vm.$model.user, '.jSubmit', function(data) {
                        var result = data.result;
                        if (data.success === true) {
                            // 增加对上传三证用户对判断
                            // 未完成上传三证用户跳至转跳页面
                            var url = urlConfig.index;
                            if (urls.getParamByKey("ref")) {
                                try {
                                    url = $.base64.decode(urls.getParamByKey("ref"));
                                } catch (e) {}
                            }
                            urls.goRef(url);    
                            // 恢复按钮
                            vm.valid = true;
                        } else {
                            clearLoginInfo();
                            vm.errorInfo = '用户名或密码错误';
                        };
                    });
                }
            };

        });

        avalon.scan();
        loginCtrl.setup();

        // helper
        function isAutoLogin() {
            return storage.get('autoLogin');
        }

        function setLoginInfo(user) {
            storage.remove('loginInfo');
            storage.set('loginInfo', user);
        }

        function getLoginInfo() {
            var loginInfo = storage.get('loginInfo');
            if (loginInfo) {
                return loginInfo;
            }
        }

        function clearLoginInfo() {
            storage.remove('loginInfo');
        }

        function setAutoLogin(flag) {
            if (flag) {
                storage.set('autoLogin', flag);
            } else {
                storage.remove('autoLogin');
            }
        }

    });

}());