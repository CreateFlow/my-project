'use strict';

avalon.ready(function () {

    var vm = avalon.define({
        $id: 'registCtrl',
        // 手机验证码读秒
        countNum: '',
        username: '',
        codeId: '',
        invalid: true,
        valid: false,
        btnVisible: true,
        countFlag: true,
        // 提交数据
        user: {
            mobile: '',
            mobileCaptcha: '',
            password: '',
            confirmPassword: ''
        },
        // 错误信息
        mobileErrorInfo: '',
        imgCodeErrorInfo: '',
        codeErrorInfo: '',
        nameErrorInfo: '',
        passwordErrorInfo: '',
        confirmErrorInfo: '',
        agreeErrorInfo: '',
        fFlagMobile: false,
        fFlagImgCode: false,
        fFlagCode: false,
        fFlagName: false,
        fFlagPassword: false,
        fFlagConfirm: false,
        agreeFlag: true,

        checkPhone: function() {
            var mobilePattern = /^1[3|4|5|7|8][0-9]\d{8}$/;

            if ( vm.user.mobile.replace(/\s+/g, '') === '' ) {
                vm.mobileErrorInfo = '请输入手机号';
                vm.fFlagMobile = false;
                vm.invalid = true;
                return;
            }

            if ( !mobilePattern.test(vm.user.mobile) ) {
                vm.mobileErrorInfo = '请输入正确的手机号';
                vm.fFlagMobile = false;
                vm.invalid = true;
                return;
            }

            //验证手机号是否存在
            io.GET(apiConfig.phoneExist + vm.user.mobile, function(data) {
                if (data.result.canRegister) {
                    vm.mobileErrorInfo = '';
                    vm.fFlagMobile = true;
                    vm.invalid = false;
                } else {
                    vm.mobileErrorInfo = '手机号已存在';
                    vm.fFlagMobile = false;
                    vm.invalid = true;
                }
            });
        },

        // 验证码校验
        checkCode: function() {
            if ( vm.user.mobileCaptcha.replace(/\s+/g, '') === '' ) {
                vm.codeErrorInfo = '请输入短信验证码';
                vm.fFlagCode = false;
                vm.invalid = true;
                return;
            }

            if (vm.codeId === '') {
                vm.codeErrorInfo = '您输入短信验证码不正确';
                vm.fFlagCode = false;
                vm.invalid = true;
                return;
            }

            io.GET( apiConfig.verificationCodeById.replace(/\{.+\}/, vm.codeId), {
                code: vm.user.mobileCaptcha,
                toAccount: vm.user.mobile
            }, success  );

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
                    vm.codeErrorInfo = '您输入短信验证码不正确';
                    vm.fFlagCode = false;
                    vm.invalid = true;
                } else {
                    vm.codeErrorInfo = '';
                    vm.fFlagCode = true;
                    vm.invalid = false;
                }

                avalon.scan(document.body, vm);
            }
        },

        getPhoneCode: function () {
            var phoneCodedata = {
                toAccount: vm.user.mobile,
                // toAccount: '18773116605',
                type: 'sms',
                opType: 'reg'
            };

            if (vm.user.mobile.replace(/\s+/g, '') == '') {
                vm.mobileErrorInfo = '请输入手机号';
                vm.fFlagMobile = false;
                return;
            }

            // vm.countFlag === false禁止操作
            if (vm.countFlag === false) {
                return;
            }

            if (vm.fFlagMobile) {
                vm.mobileErrorInfo = '';
                vm.errorInfo = '';
                if (vm.countFlag) {
                    vm.countFlag = false;
                    io.POST(apiConfig.verificationCode, phoneCodedata, success);
                }

            }

            function success(data, status) {
                var timeout;
                if (!data.success) {
                    vm.errorInfo = data.result.errMsg;
                    vm.countFlag = true;
                } else {
                    vm.codeId = data.result.id;
                    vm.countFlag = false;
                    vm.countNum = 59;
                    timeout = setInterval(function () {
                        if (vm.countNum <= 0) {
                            vm.countFlag = true;
                            vm.countNum = '';
                            clearInterval(timeout);
                        } else {
                            vm.countNum --;
                        }
                    }, 1000);
                }
            }
        },

        // 密码校验
        checkPassword: function () {
            if (vm.user.password.replace(/\s+/g, '') == '') {
                vm.passwordErrorInfo = '请输入密码';
                vm.fFlagPassword = false;
                vm.invalid = true;
                return;
            }
            if (!/^[0-9a-zA-Z]{6,20}$/.test(vm.user.password)) {
                vm.passwordErrorInfo = '密码为6到20位字符';
                vm.fFlagPassword = false;
                vm.invalid = true;
                return;
            }
            vm.passwordErrorInfo = '';
            vm.fFlagPassword = true;
            vm.invalid = false;
        },

        // 确认密码校验
        checkConfirm: function () {
            if (vm.user.confirmPassword.replace(/\s+/g, '') === '') {
                vm.confirmErrorInfo = '请输入确认密码';
                vm.fFlagConfirm = false;
                vm.invalid = true;
                return;
            }

            if (vm.user.confirmPassword !== vm.user.password) {
                vm.confirmErrorInfo = '两次输入的密码不一致';
                vm.fFlagConfirm = false;
                vm.invalid = true;
                return;
            }

            vm.confirmErrorInfo = '';
            vm.fFlagConfirm = true;
            vm.invalid = false;
        },

        validate: function() {
            var keys = ['agreeFlag', 'fFlagMobile', 'fFlagCode', 'fFlagPassword', 'fFlagConfirm'],
                len = keys.length;

            while (len --) {
                if (!vm[ keys[len] ]) {
                    vm.invalid = true;
                    return false;
                }
            }

            return true;
        },

        check: function() {
            vm.agreeFlag  = this.checked;
            vm.invalid = !this.checked;
        },

        regist: function() {
            vm.errorInfo = '';
            if (vm.validate()) {
                var postData = {
                    'phoneNumber': vm.user.mobile,
                    'verificationCode': vm.user.mobileCaptcha,
                    'verificationCodeId': vm.codeId,
                    'password': vm.user.password
                };
                vm.btnVisible = false;
                io.POST(apiConfig.reg, postData, success, error);
            }

            function success(data, status) {
                var formData = {
                    'userName': vm.user.mobile,
                    'password': vm.user.password
                };

                if (data.success) {
                    common.login(formData, '.jRegistBtn', function (data) {
                        if (data.success) {
                            urls.goRef(urlConfig.corpInfo);
                        } else {
                            vm.errorInfo = data.message;
                        }
                        vm.btnVisible = true;
                    });
                } else {
                    vm.btnVisible = true;
                    vm.errorInfo = data.message;
                }
            }

            function error(obj, info, errObj) {
                vm.btnVisible = true;
                vm.errorInfo = obj.responseText;
            }
        }
    });

    vm.$watch('invalid', function(val) {
        if (val === false) {
            this.valid = this.validate();
        } else {
            this.valid = false;
        }
    });

    avalon.scan();

    //绑定enter事件
    $(document).keyup(function(e) {
        if (e.keyCode=='13'){
            vm.regist();
        }
    });

});
