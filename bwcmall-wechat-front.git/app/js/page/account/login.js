'use strict'

;
(function() {

    var vm = new Vue({
        el: '#app',
        data: {
            reqError: '',
            login: {
                phone: {
                    type: 'phone',
                    val: '',
                    error: false,
                    length: 11,
                    errorMsg: '',
                    emptyMsg: '手机号码不能为空',
                    lengthMsg: '手机号码应为11位',
                    regExpMsg: '手机号码不正确',
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
                }
            },
            state: '',
            error: false,
            errorMsg: '',
            openid: Cookies.get('openId')
        },
        methods: {
            validate: function(obj) {
                var self = this;
                for (var key in obj) {
                    var regExp = {
                        phone: /^(1)+\d{10}$/,
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
            submit: function() {

                var self = this;

                var statusObj = {
                    1: '/order/list.html',
                    2: '/account/signup-auditing.html',
                    3: '/account/login.html',
                    4: '/account/signup-audit.html'
                }

                self.state = Util.getUrlParam('state');
                if (self.validate(self.login)) {
                    Cookies.remove('authToken')

                    if (!self.openid) {
                        alert('出错了，没有获取到openId，请关闭窗口，重新点击菜单。')
                        return;
                    }
                    self.$http.post(API.login, {
                        "userName": self.login.phone.val,
                        "password": self.login.password.val,
                        //"ipAddress": "string",
                        "openid": self.openid
                    }).then(function(response) {
                        var body = response.data
                        if (body.success) {
                            Cookies.set('phone', body.result.username, { expires: 7 })
                            Cookies.set('authToken', body.result.authToken)
                            location.href = statusObj[body.result.userStatusWechat]
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
