avalon.ready(function () {
    var passwordResetCtrl = avalon.define('passwordResetCtrl', function (vm) {
        // data
            vm.user = {
                mobile: '',
                captcha: '',
                codeId: ''
            };
            vm.countNum = '';
            // status
            vm.phoneErrorInfo = '';
            vm.codeErrorInfo = '';
            vm.counting = false;
            vm.valid = false;
            vm.invalid = false;
            vm.phoneValid = false;

            vm.setup = function() {
                vm.bindEvent();
            };

            vm.bindEvent = function() {
                //绑定enter事件
                $(document).keyup(function(e) {
                    if (e.keyCode === 13) {
                        passwordResetCtrl.submit();
                    }
                });
            };

            vm.validate = function() {
                var values = [$.trim(vm.user.mobile), $.trim(vm.user.captcha)],
                    len = values.length;

                while (len --) {
                    if (!values[len]) {
                        return false;
                    }
                }

                return true;
            };

            vm.checkPhone = function() {
                var mobile = vm.user.mobile,
                    pattern = /^1[3|4|5|7|8][0-9]\d{8}$/;
                if ( mobile.replace(/\s+/g, '') === '' ) {
                    vm.setPhoneErrorInfo(true, '请输入手机号！');
                } else if ( pattern.test(mobile) === false ) {
                    vm.setPhoneErrorInfo(true, '请输入正确的手机号');
                } else {
                    //验证手机号是否存在
                    io.GET(apiConfig.phoneExist + mobile, function(data) {
                        if (data.result.canRegister) {
                            vm.setPhoneErrorInfo(true, '手机号未注册');
                        } else {
                            vm.setPhoneErrorInfo(false);
                            vm.valid = vm.validate();
                            vm.phoneValid = true;
                        }

                        avalon.scan(document.body, vm);
                    });
                }
            };

            // 验证码校验
            vm.checkCode = function() {
                if ( vm.user.captcha.replace(/\s+/g, '') === '' ) {
                    vm.setCodeErrorInfo(true, '请输入短信验证码');
                } else if (vm.user.codeId === '') {
                    vm.setCodeErrorInfo(true, '您输入短信验证码不正确');
                } else {
                    io.GET( apiConfig.verificationCodeById.replace(/\{.+\}/, vm.user.codeId), {
                        code: vm.user.captcha,
                        toAccount: vm.user.mobile
                    }, success  );
                }

                function success(responseData) {
                    var invalid;

                    if (responseData.success === true) {

                        if (responseData.result.success === true) {
                            invalid = false;
                        } else {
                            invalid = true;
                        }

                    } else {
                        invalid = true;
                    }

                    if (invalid === true) {
                        vm.setCodeErrorInfo(true, '您输入短信验证码不正确');
                    } else {
                        vm.setCodeErrorInfo(false);
                        vm.valid = vm.validate();
                    }

                    avalon.scan(document.body, vm);
                }
            };

            vm.getPhoneCode = function () {
                var postData = {
                    toAccount: vm.user.mobile,
                    type: 'sms',
                    opType: 'findPwd'
                };

                if (vm.counting === true) return;

                if (vm.user.mobile.replace(/\s+/g, '') === '') {
                    vm.setPhoneErrorInfo(true, '请输入手机号！');
                } else if (vm.phoneValid === true) {
                    vm.counting = true;
                    io.POST(apiConfig.verificationCode, postData, success);
                }

                function success(data, status) {
                    var timeout;
                    if (data.success === true) {
                        vm.user.codeId = data.result.id;
                        vm.countNum = 59;
                        timeout = setInterval(function () {
                            if (vm.countNum <= 0) {
                                vm.counting = false;
                                vm.countNum = '';
                                clearInterval(timeout);
                            } else {
                                vm.countNum --;
                            }
                        }, 1000);
                    } else {
                        vm.setCodeErrorInfo(true, data.result.errMsg);
                        vm.counting = false;
                    }
                }
            };

            vm.setErrorInfo = function(errorName, flag, msg) {
                vm[errorName] = flag === false ? '' : msg;
                vm.invalid = flag;
            };

            vm.setPhoneErrorInfo = function(flag, msg) {
                this.setErrorInfo('phoneErrorInfo', flag, msg);
                this.phoneValid = false;
            };

            vm.setCodeErrorInfo = function(flag, msg) {
                this.setErrorInfo('codeErrorInfo', flag, msg);
            };

            vm.cacheCode = function() {
                if ( typeof storage.get('resetInfo') !== 'undefined' ) {
                    storage.remove('resetInfo');
                }
                storage.set('resetInfo', {codeId: vm.user.codeId, code: vm.user.captcha, mobile: vm.user.mobile});
            };

            vm.submit = function() {
                var postData;
                if ( vm.valid === true && vm.validate() === true ) {
                    vm.valid = false;
                    postData = {
                        toAccount: vm.user.mobile,
                        code: vm.user.captcha
                    };
                    io.GET( apiConfig.verificationCodeById.replace(/\{.+\}/, vm.user.codeId), postData, function(data) {
                        if (data.result.success === true) {
                            // 恢复按钮
                            vm.valid = true;
                            vm.cacheCode();
                            window.location.href = urlConfig.resetPassword;
                        } else {
                            vm.setCodeErrorInfo(true, '验证码错误或已过期');
                        }
                    });
                }
            };
    });

    (function passwordInit(){
        var username = urls.getParamByKey('username');
        if(username != undefined && username.length == 11){
            passwordResetCtrl.user.mobile = username;
            passwordResetCtrl.checkPhone();
        }
    }());

    avalon.scan();

});
