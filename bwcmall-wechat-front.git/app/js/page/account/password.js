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
            disabledClass: 'disabled',
            countBusy: false,
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
                if (phone.length == 11) {
                    self.$http.get(API.checkPhone + phone, {}).then(function(response) {
                        var body = response.data
                        if (body.success) {
                            if (!body.result.canRegister) {
                                alert(body.result.message)
                            }
                        } else {
                            alert(body.message)
                        }
                    }, function(response) {
                        // error callback
                    });
                }
            },
            sendCaptcha: function(phone) {
                var self = this;
                if (phone.length != 11) {
                    alert('请填写正确的手机号！');
                    return;
                }
                if (self.countBusy) {
                    return;
                }
                self.$http.post(API.sendCaptcha, {
                    "toAccount": phone,
                    "type": "sms",
                    "opType": "findPwd"
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
                if (self.validate(self.signup)) {
                    if (self.signup.password.val !== self.signup.cofirmPassword.val) {
                        alert('两次密码输入不一致！')
                        return;
                    }
                    var url = API.password.replace('{username}', self.signup.phone.val)
                    self.$http.put(url, {
                        "verificationCode": self.signup.captcha.val,
                        "verificationCodeId": self.verificationCodeId,
                        "password": self.signup.password.val
                    }).then(function(response) {
                        var body = response.data
                        if (body.success) {
                            location.href = 'password-success.html';
                        } else {
                            alert(body.message)
                        }
                    }, function(response) {
                        // error callback
                    });
                }


            }

        }
    });


})();
