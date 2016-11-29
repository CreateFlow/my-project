avalon.ready(function () {
    var resetPasswordCtrl = avalon.define('resetPasswordCtrl', function (vm) {
            // data
            vm.password = '';
            vm.confirm = ''
            // status
            vm.passwordErrorInfo = '';
            vm.confirmErrorInfo = '';
            vm.valid = false;
            vm.invalid = false;

            vm.setup = function() {
                vm.bindEvent();
            };

            vm.bindEvent = function() {
                //绑定enter事件
                $(document).keyup(function(e) {
                    if (e.keyCode === 13) {
                        resetPasswordCtrl.submit();
                    }
                });
            };

            vm.validate = function() {
                var values = [$.trim(vm.password), $.trim(vm.confirm)],
                    len = values.length;

                while (len --) {
                    if (!values[len]) {
                        return false;
                    }
                }

                return true;
            };

            //密码校验
            vm.checkPassword = function () {
                var password = vm.password,
                    pattern = /^[0-9a-zA-Z]{6,20}$/;

                if (password.replace(/\s+/g, '') === '') {
                    vm.setPasswordErrorInfo(true, '请输入密码');
                } else if ( pattern.test(password) === false ) {
                    vm.setPasswordErrorInfo(true, '密码为6到20位字符');
                } else {
                    vm.setPasswordErrorInfo(false);
                    vm.valid = vm.validate();
                }
            };

            //确认密码校验
            vm.checkConfirm = function () {
                if (vm.confirm !== vm.password) {
                    vm.setConfirmErrorInfo(true, '两次输入的密码不一致');
                } else {
                    vm.setConfirmErrorInfo(false);
                    vm.valid = vm.validate();
                }
            };

            vm.setErrorInfo = function(errorName, flag, msg) {
                vm[errorName] = flag === false ? '' : msg;
                vm.invalid = flag;
            };

            vm.setPasswordErrorInfo = function(flag, msg) {
                this.setErrorInfo('passwordErrorInfo', flag, msg);
            };

            vm.setConfirmErrorInfo = function(flag, msg) {
                this.setErrorInfo('confirmErrorInfo', flag, msg);
            };

            vm.submit = function() {
                var formData, url,
                    resetInfo = storage.get('resetInfo');
                if ( vm.valid === true && vm.validate() === true && typeof resetInfo !== 'undefined' ) {
                    vm.valid = false;
                    formData = {
                        verificationCode: resetInfo.code,
                        verificationCodeId: resetInfo.codeId,
                        password: vm.password
                    };
                    url = apiConfig.reg + resetInfo.mobile + '/password';
                    io.PUT(url, formData, function(data) {
                        if (data.success === true && data.result === true) {
                            storage.remove('resetInfo');
                            window.location.href = urlConfig.resetSuccess;
                        }
                        // 恢复按钮
                        vm.valid = true;
                    });
                }
            };
    });

    avalon.scan();

});
