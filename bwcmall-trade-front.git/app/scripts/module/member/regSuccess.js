avalon.ready(function () {
    var registCtrl = avalon.define('registCtrl', function (vm) {

        //手机验证码读秒
        vm.countNum = '';
        vm.countFlag = true;
        //提交数据
        vm.user = {
            "mobile": "",
            "imageCaptcha": "",
            "mobileCaptcha": "",
            "name": "",
            "password": "",
            "confirmPassword": ""
        };
        //错误信息
        vm.mobileErrorInfo = '';
        vm.imgCodeErrorInfo = '';
        vm.codeErrorInfo = '';
        vm.nameErrorInfo = '';
        vm.passwordErrorInfo = '';
        vm.confirmErrorInfo = '';
        vm.agreeErrorInfo = '';
        //注册第一步标志
        vm.fFlagMobile = false;
        vm.fFlagImgCode = false;
        vm.fFlagCode = false;
        vm.fFlagName = false;
        vm.fFlagPassword = false;
        vm.fFlagConfirm = false;
        vm.agreeFlag = true;
        vm.btnFlag = false;
        vm.errorInfo='';


        //手机校验
        vm.checkPhone = function () {
            if (registCtrl.user.mobile.replace(/\s+/g, "") == '') {
                registCtrl.mobileErrorInfo = "请输入手机号";
                registCtrl.fFlagMobile = false;
                return false;
            }
            if (!/^1[34578]+\d{9}$/.test(registCtrl.user.mobile)) {
                registCtrl.mobileErrorInfo = "请输入正确的手机号";
                registCtrl.fFlagMobile = false;
                return false;
            }
            //验证手机号是否存在
            $.post(apiConfig.phoneExist, {"mobile": registCtrl.user.mobile},
                function (data) {
                    if (data.type == 'error') {
                        registCtrl.mobileErrorInfo = '手机号已存在';
                        registCtrl.fFlagMobile = false;
                        return false;
                    }
                    else {
                        registCtrl.mobileErrorInfo = "";
                        registCtrl.fFlagMobile = true;
                        return true;
                    }
                }, 'json');

        };

        //图形验证码校验
        vm.checkImgCode = function () {
            if (registCtrl.user.imageCaptcha.replace(/\s+/g, "") == '') {
                registCtrl.imgCodeErrorInfo = "请先输入图形验证码";
                registCtrl.fFlagImgCode = false;
                return false;
            }
            $.post(apiConfig.imgCode, {"imageCaptcha": registCtrl.user.imageCaptcha}, function (data) {
                if (data.type == 'error') {
                    registCtrl.imgCodeErrorInfo = data.content;
                    registCtrl.fFlagImgCode = false;
                    return false;
                }
                else {
                    registCtrl.imgCodeErrorInfo = '';
                    registCtrl.fFlagImgCode = true;
                    return true;
                }
            }, 'json');
        };

        //验证码校验
        vm.checkCode = function () {
            if (registCtrl.user.mobileCaptcha.replace(/\s+/g, "") == '') {
                registCtrl.codeErrorInfo = "请输入短信验证码";
                registCtrl.fFlagCode = false;
                return false;
            }
            registCtrl.codeErrorInfo = "";
            registCtrl.fFlagCode = true;
            return true;
        };

        //姓名校验
        vm.checkName = function () {
            if (registCtrl.user.name.replace(/\s+/g, "") == '') {
                registCtrl.nameErrorInfo = "请输入真实姓名";
                registCtrl.fFlagName = false;
                return false;
            }
            registCtrl.nameErrorInfo = "";
            registCtrl.fFlagName = true;
            return true;
        };

        //密码校验
        vm.checkPassword = function () {
            if (registCtrl.user.password.replace(/\s+/g, "") == '') {
                registCtrl.passwordErrorInfo = "请输入密码";
                registCtrl.fFlagPassword = false;
                return false;
            }
            if (!/^[0-9a-zA-Z]{6,20}$/.test(registCtrl.user.password)) {
                registCtrl.passwordErrorInfo = "密码为6到20位字符";
                registCtrl.fFlagPassword = false;
                return false;
            }
            registCtrl.passwordErrorInfo = "";
            registCtrl.fFlagPassword = true;
            return true;
        };

        //确认密码校验
        vm.checkConfirm = function () {
            if (registCtrl.user.confirmPassword.replace(/\s+/g, "") == '') {
                registCtrl.confirmErrorInfo = "请输入确认密码";
                registCtrl.fFlagConfirm = false;
                return false;
            }
            if (registCtrl.user.confirmPassword !== registCtrl.user.password) {
                registCtrl.confirmErrorInfo = "两次输入的密码不一致";
                registCtrl.fFlagConfirm = false;
                return false;
            }
            registCtrl.confirmErrorInfo = '';
            registCtrl.fFlagConfirm = true;
            return true;
        };


        //刷新图片验证码
        vm.refreshImg = function () {
            var $src = $('#imgCode').attr("src");
            $src = $src.lastIndexOf("?") < 0 ? $src : $src.substring(0, $src.lastIndexOf('?'));
            $('#imgCode').attr("src", $src + '?' + new Date().getTime());
        }

        //注册第一步
        vm.registOne = function () {
            registCtrl.errorInfo = '';
            if (registCtrl.agreeFlag && registCtrl.fFlagMobile && registCtrl.fFlagImgCode && registCtrl.fFlagCode && registCtrl.fFlagName && registCtrl.fFlagPassword && registCtrl.fFlagConfirm) {
                $('.regist-btn').hide();
                $('.regist-btn-disabled').css('display','block');
                $.post(apiConfig.registOne,
                    registCtrl.user.$model, function (data) {
                        if (data.type == 'error') {
                            $('.regist-btn-disabled').css('display','none');
                            $('.regist-btn').show();
                            registCtrl.errorInfo = data.content;
                        }
                        else {
                            //登录处理
                            $('#hideUsername').val(registCtrl.user.mobile);
                            $('#hidePassword').val(registCtrl.user.password);
                            $('#hideForm').submit();
                        }
                    }, 'json');
            }
        };



        //获取手机验证码
        vm.getPhoneCode = function () {
            if (registCtrl.fFlagMobile && registCtrl.fFlagImgCode) {
                registCtrl.mobileErrorInfo = '';
                registCtrl.imgCodeErrorInfo = '';
                registCtrl.errorInfo = '';
                if (registCtrl.countFlag) {
                    registCtrl.countFlag=false;
                    $.post(apiConfig.postMessage,
                        {"mobile": registCtrl.user.mobile, "imageCaptcha": registCtrl.user.imageCaptcha},
                        function (data) {
                            if (data.type === 'error') {
                                registCtrl.errorInfo = data.content;
                                registCtrl.countFlag=true;
                                return;
                            }
                            else {
                                registCtrl.countFlag = false;
                                registCtrl.countNum = 59;
                                var t1 = setInterval(function () {
                                    if (registCtrl.countNum <= 0) {
                                        registCtrl.countFlag = true;
                                        registCtrl.countNum = '';
                                        clearInterval(t1);

                                    }
                                    else {
                                        registCtrl.countNum--;
                                    }
                                }, 1000);
                            }
                        });
                }

            }
        };
    });




    avalon.scan();

    //绑定enter事件
    $(document).keyup(function(e){
        if(e.keyCode=='13'){
            registCtrl.registOne();
        }
    });
    //勾选协议
    $('.icon-checked').click(function () {
        if ($(this).siblings('.xieyi-check').is(':checked')) {
            $(this).siblings('.xieyi-check').attr('checked', false);
            registCtrl.agreeFlag = false;
        }
        else {
            $(this).siblings('.xieyi-check').attr('checked', true);
            registCtrl.agreeFlag = true;
        }
        $(this).toggleClass('icon-checked-false');
    });


});