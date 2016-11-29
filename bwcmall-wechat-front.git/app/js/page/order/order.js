'use strict'

;
(function() {

    Vue.component('actionsheet', vuxActionsheet)

    var vm = new Vue({
        el: '#app',
        data: {
            sn: '',
            order: {},
            step1: false,
            step2: false,
            step3: false,
            confirmModal: false,
            confirmMsg: "收货成功",
            payAction: false,
            menus1: {
                menu1: 'Share to friends',
                menu2: 'Share to timeline'
            },
            payStyle: {
                display: 'none'
            },
            payMethod: 5,
            accountCredit: {},
            phone: '',
        },
        methods: {
            getOrder: function() {
                var self = this;
                self.$http.get(API.order + self.sn, {}).then(function(response) {
                    var body = response.data
                    if (body.success) {
                        var order = body.result.order.orderDTO;
                        var accountCredit = body.result.order.accountCredit;
                        if (accountCredit && !accountCredit.status) {
                            self.accountCredit = accountCredit;
                        }
                        if (order.generalStatus == "已完成") {
                            self.step1 = true;
                            self.step2 = true;
                            self.step3 = true;
                        } else if (order.generalStatus == "待收货") {
                            self.step1 = true;
                            self.step2 = true;
                        } else if (order.generalStatus == "待发货") {
                            self.step1 = true;
                        }
                        self.order = order;
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            },
            setOrderCancel: function() {
                var self = this;
                var url = API.orderCancel.replace('{sn}', self.sn);
                self.$http.get(url, {}).then(function(response) {
                    var body = response.data
                    if (body.success) {
                        self.confirmModal = true;
                        self.confirmMsg = "取消订单成功！";
                        self.getOrder();
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            },
            setPayModal: function() {
                var self = this;
                self.payAction = true;
                self.payStyle = {
                    display: 'block'
                }
            },
            closePayModal: function() {
                var self = this;
                self.payAction = false;
                self.payStyle = {
                    display: 'none'
                }
            },
            getPayInfo: function() {
                var self = this;
                self.$http.post(API.pay, {
                    "orderSn": self.sn,
                    "platform": self.payMethod //4 账期支付，5 易宝支付
                }).then(function(response) {
                    var body = response.data
                    if (body.success) {
                        if (self.payMethod == 5) {
                            var payObj = JSON.parse(body.result)
                            self.setWeixinPay(payObj)
                        } else if (self.payMethod == 4) {
                            self.closePayModal();
                            self.confirmModal = true;
                            self.confirmMsg = "支付成功！";
                            self.getOrder();
                        }
                    } else {
                        alert(body.message)
                    }
                }, function(response) {
                    // error callback
                });
            },
            setWeixinPay: function(payObj) {
                var self = this;
                //this.closePayModal();
                WeixinJSBridge.invoke('getBrandWCPayRequest', payObj,
                    function(res) {
                        if (res.err_msg.indexOf('ok') >= 0) {
                            self.closePayModal();
                            self.confirmModal = true;
                            self.confirmMsg = "支付成功！";
                            self.getOrder();
                        } else {
                            //var str = JSON.stringify(res);
                            //alert(str);
                        }
                        // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
                    }
                );
            },
            setConfirmReceived: function() {
                var self = this;
                var url = API.confirmReceived.replace("{id}", self.order.id)
                self.$http.get(url, {}).then(function(response) {
                    var body = response.data
                    if (body.success) {
                        self.confirmModal = true;
                        self.confirmMsg = "确认收货成功！";
                        self.getOrder();
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
            self.sn = Util.getUrlParam('sn');
            if (self.sn) {
                self.getOrder();
            }

            // if (typeof WeixinJSBridge == "undefined") {
            //     if (document.addEventListener) {
            //         document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
            //     } else if (document.attachEvent) {
            //         document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
            //         document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
            //     }
            // } else {
            //     onBridgeReady();
            // }

        }
    });


})();
