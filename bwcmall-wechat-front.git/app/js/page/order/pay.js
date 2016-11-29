'use strict'

;
(function() {

    var vm = new Vue({
        el: '#app',
        data: {
            state: '',
            code: '',
            targetUrl: ''
        },
        methods: {
            setWeixinPay: function(payObj) {
                var self = this;
                WeixinJSBridge.invoke('getBrandWCPayRequest', payObj,
                    function(res) {
                        if (res.err_msg == "get_brand_wcpay_request：ok") {
                            self.confirmModal = true;
                            self.confirmMsg = "支付成功！";
                            location.replace(self.targetUrl)
                        } else {
                            var str = JSON.stringify(res);
                            alert(str);
                        }
                        // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
                    }
                );
            }
        },
        ready: function() {
            var self = this;
            self.targetUrl = Util.getUrlParam('target_url');
            var payObj = Cookies.get('payObj');
            if (payObj) {
                self.setWeixinPay(payObj);
            } else {
                alert('非法访问！')
            }
        }
    });


})();
