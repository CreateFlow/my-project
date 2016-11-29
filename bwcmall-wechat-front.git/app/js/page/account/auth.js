'use strict'

;
(function() {

    var vm = new Vue({
        el: '#app',
        data: {
            state: '',
            code: ''
        },
        methods: {
            setMenu: function() {
                var self = this;
                self.$http.post(API.menu, {
                    "code": self.code,
                    "state": self.state
                }).then(function(response) {
                    //1，用户已绑定且通过审核，返回{status:1, token:...} 2, 用户已绑定，但未审核通过或者资料审核中 返回 {status：2}， 3， 用户未绑定， 返回 {status：3}
                    //4、用户已注册，但是未提交资料 
                    var statusObj = {
                        1: '/order/list.html',
                        2: '/account/signup-auditing.html',
                        3: '/account/login.html',
                        4: '/account/signup-audit.html'
                    }
                    var body = response.data
                    if (body.success) {
                        var status = body.result.status
                        if (body.result.openid) {
                            //body.result.openid = 'otG0Is-66Uvm1_KpWmyHwqgErMOU'
                            Cookies.set('openId', body.result.openid);
                            Cookies.set('authToken', body.result.token)
                        }
                        if (status) {
                            location.replace(statusObj[status]);  //跳转页面不产生历史记录
                        }
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            }
        },
        ready: function() {
            var self = this;
            self.state = Util.getUrlParam('state');
            self.code = Util.getUrlParam('code');
            if (self.state) {
                self.setMenu();
            }
        }
    });


})();
