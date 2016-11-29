'use strict'

;
(function() {

    var vm = new Vue({
        el: '#app',
        data: {
            reqError: '',
            signup: {
                phone: {
                    type: 'phone',
                    val: '',
                    error: false,
                    errorMsg: '',
                    emptyMsg: '手机号码不能为空',
                    lengthMsg: '手机号码应为11位',
                    regExpMsg: '手机号码不正确',
                    focus: ''
                },
                captcha: {
                    type: 'captcha',
                    val: '',
                    error: false,
                    length: 6,
                    errorMsg: '',
                    emptyMsg: '验证码不能为空',
                    lengthMsg: '验证码应为6位',
                    regExpMsg: '',
                    focus: ''
                },
                username: {
                    type: 'username',
                    val: '',
                    error: false,
                    length: 10,
                    errorMsg: '',
                    emptyMsg: '姓名不能为空',
                    lengthMsg: '姓名应小于10个字符',
                    regExpMsg: '姓名应小于10个字符',
                    focus: ''
                },
                password: {
                    type: 'password',
                    val: '',
                    error: false,
                    length: 6,
                    errorMsg: '',
                    emptyMsg: '密码不能为空',
                    lengthMsg: '请输入不超过8位的密码',
                    regExpMsg: '密码应为非空字符',
                    focus: ''
                },
                cofirmPassword: {
                    val: ''
                }
            },
            error: false,
            errorMsg: '',
            openid: Cookies.get('openId'),
            disabledClass: 'disabled',
            countBusy: false,
            allowSub: false,
            isRegistered: '',
            countText: '发送验证码',
            verificationCodeId: ''
        },
        methods: {
            validate: function(obj) {
                var self = this;
                for (var key in obj) {
                    var regExp = {
                        phone: /^(1)+\d{10}$/,
                        username: /^\S{1,10}$/,
                        password: /^\S{6,}$/
                    }
                    var val = obj[key];
                    if (!val.val) {
                        self.error = true;
                        self.errorMsg = val.emptyMsg;
                        alert(self.errorMsg)
                        return false;
                    } else if (regExp[val.type] && !regExp[val.type].test(val.val)) {
                        self.error = true;
                        self.errorMsg = val.regExpMsg;
                        alert(self.errorMsg)
                        return false;
                    }
                }

                self.error = false;
                self.errorMsg = '';
                return true;

            },
            checkPhone: function(phone) {
                var self = this;
                var regExp = /^(1)+\d{10}$/;
                if (regExp.test(phone)) {
                    self.$http.get(API.checkPhone + phone, {}).then(function(response) {
                        var body = response.data
                        if (body.success) {
                            if (!body.result.canRegister) {
                                self.isRegistered = true;
                                alert(body.result.message)
                            } else {
                                self.isRegistered = false;
                            }
                        } else {
                            alert(body.message)
                        }
                    }, function(response) {
                        // error callback
                    });
                } else {
                    alert('请填写正确的手机号！');
                    return false;
                }
            },
            sendCaptcha: function(phone) {
                //type("消息类型,sms表示手机短信,email表示邮件,image 表示图形验证码")
                //@opType("发消息功能类型,reg表示注册功能,findPwd 表找回密码")
                var self = this;
                if (phone.length != 11) {
                    alert('请填写正确的手机号！');
                    return;
                }
                if (self.isRegistered) {
                    alert('该手机号已注册!');
                    return;
                }
                if (self.countBusy) {
                    return;
                }
                self.$http.post(API.sendCaptcha, {
                    "toAccount": phone,
                    "type": "sms",
                    "opType": "reg"
                }).then(function(response) {
                    var body = response.data
                    if (body.success && body.result.success) {
                        var countTime = 60
                        self.countBusy = true
                        var _timer = window.setInterval(function() {
                            if (countTime == 0) {
                                self.countText = '发送验证码';
                                self.countBusy = false;
                                window.clearTimeout(_timer);
                                return;
                            }
                            countTime--;
                            self.countText = "已发送(" + countTime + ")";
                        }, 1000);
                        self.verificationCodeId = body.result.id
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            },
            submit: function() {
                var self = this;
                if (!self.allowSub) {
                    return;
                }
                if (self.isRegistered) {
                    alert('该手机号已注册!');
                    return;
                }
                if (self.validate(self.signup)) {
                    if (self.signup.password.val !== self.signup.cofirmPassword.val) {
                        alert('两次密码输入不一致！')
                        return;
                    }
                    if (!self.openid) {
                        alert('出错了，没有获取到openId，请关闭窗口，重新点击菜单。')
                        return;
                    }
                    self.$http.post(API.signup, {
                        "phoneNumber": self.signup.phone.val,
                        "verificationCode": self.signup.captcha.val,
                        "verificationCodeId": self.verificationCodeId,
                        "openid": self.openid,
                        "password": self.signup.password.val
                    }).then(function(response) {
                        var body = response.data
                        if (body.success) {
                            Cookies.set('phone', self.signup.phone.val, { expires: 7 })
                            Cookies.set('authToken', body.result.authToken)
                            location.href = 'signup-info.html'
                        } else {
                            alert(body.message)
                        }
                    }, function(response) {
                        // error callback
                    });
                }


            }

        },
        watch: {
            'signup.cofirmPassword.val': function(val, oldVal) {
                if (val) {
                    this.allowSub = true;
                }
            },
            'signup.phone.val': function(val, oldVal) {
                if (val.length == 11) {
                    this.checkPhone(val);
                }
            }
        }
    });


})();
