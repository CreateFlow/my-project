'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils'),
        urls = require('module/common/utils/url');
    var session = require('lib/io/session');
    var accountId = urls.getParamByKey("id");

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');

    Date.prototype.YYYYMMDDHHMMSS = function(type) {
        var yyyy = this.getFullYear().toString();
        var MM = pad(this.getMonth() + 1, 2);
        var dd = pad(this.getDate(), 2);
        var hh = pad(this.getHours(), 2);
        var mm = pad(this.getMinutes(), 2)
        var ss = pad(this.getSeconds(), 2)
        if (type == 'back') {
            return yyyy + '-' + MM + '-' + dd + 'T' + hh + ':' + mm + ':' + ss + 'Z';
        } else {
            return yyyy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss;
        }
    };


    function getDate() {
        d = new Date();
        alert(d.YYYYMMDDHHMMSS());
    }

    function pad(number, length) {

        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }

        return str;

    }

    avalon.ready(function() {
        var vm = avalon.define({
            $id: "accountCreditAdd",
            isShowLine1: false,
            isShowLine2: false,
            isShowYuan2: false,
            isShowYuan3: false,
            step: 1,
            keyword: '',
            customerList: [],
            customerInfo: '',
            customerInfoShort: '',
            creditPeriodType: [],
            delayDays: [],
            expiredDate: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).YYYYMMDDHHMMSS(),
            customer: {
                customerId: '',
                creditPeriodType: '0',
                creditAmount: '',
                delayDays: '1',
                expiredDate: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).YYYYMMDDHHMMSS('back')
            },
            opts4: {
                type: 'alert',
                title: '',
                width: 200
            },
            ckShowInfo: function(id, msg) {
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmReceivedMsg: 'ok',
            newCustomer: {},
            result: {
                order: {}
            },
            cancel: function() {
                urls.goRef("/order/list.html");
            },
            crateArr: function(num) {
                var list = [];
                for (var i = 1; i <= num; i++) {
                    list.push(i);
                }
                vm.delayDays = list
            },
            confirmAndBack: function() {
                var order = vm.result.order;
                urls.goRef("/orderdetail/order-cancel.html?id=" + order.orderId + '&sn=' + order.orderSn);
            },
            search: function() {
                if (vm.keyword) {
                    request.GET(API.accountCreditCustomer.replace('{keyword}', vm.keyword), function(responseData) {
                        if (responseData.success) {
                            vm.customerList = responseData.result;
                            avalon.scan(document.body, vm);
                        } else {
                            vm.ckShowInfo('dlgAlert', responseData.message);
                        }
                    });
                } else {
                    vm.ckShowInfo('dlgAlert', '请输入关键词！');
                }

            },
            setCustomerInfo: function(item) {
                var arr = item.split('|')
                vm.customer.customerId = arr[0]
                vm.customerInfoShort = arr[1];
            },
            confirmStep0: function() {
                vm.isShowLine1 = false
                vm.isShowYuan2 = false
                vm.step = 1
            },
            confirmStep1: function() {
                if (!vm.customerInfo) {
                    alert('请先选择买家！')
                    return;
                }
                vm.setCustomerInfo(vm.customerInfo)
                vm.isShowLine1 = true
                vm.isShowYuan2 = true
                vm.step = 2
            },
            confirmStep2: function() {
                if (!vm.customer.creditAmount) {
                    vm.ckShowInfo('dlgAlert', '请填写授信额度！');
                    return;
                }
                request.POST(API.accountCredit, vm.customer, function(responseData) {
                    if (responseData.success) {
                        vm.isShowLine2 = true
                        vm.isShowYuan3 = true
                        vm.step = 3
                        vm.newCustomer = responseData.result;
                        avalon.scan(document.body, vm);
                    } else {
                        vm.ckShowInfo('dlgAlert', responseData.message);
                    }

                });
            },
            goBack: function() {
                location.href = "/payment/list.html"
            }

        });

        (function init() {
            vm.crateArr(7)
            request.GET(API.dict.replace('{index}', 'ACCT_SETTLEMENT_TYPE'), function(responseData) {
                vm.creditPeriodType = responseData.result;
                avalon.scan(document.body, vm);
            });
        }());


        avalon.scan(document.body, vm);

        vm.customer.$watch("creditPeriodType", function(value, oldValue) {
            if (vm.customer.creditPeriodType === "0") {
                vm.crateArr(7)
                vm.customer.delayDays = '1'
            } else {
                vm.crateArr(30)
            }
            avalon.scan(document.body, vm);
        })

    });


});
