'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');

    avalon.ready(function() {
        var vm = avalon.define({
            $id: "paymentList",
            opts1: {
                type: 'confirm',
                title: '确认',
                width: 400,
                onOpen: function() {

                },
                onConfirm: function() {
                    var el = vm.dlgInfo.el;
                    if (el.accountCreditStatus == "通过") {
                        var enable = 'false'
                    } else {
                        var enable = 'true'
                    }
                    var url = API.accountCreditEnable + '?enable=' + enable;
                    request.POST(url.replace('{creditId}', el.id), function(responseData) {
                        if (responseData.success) {
                            vm.ckShowInfo('dlgAlert', '操作成功!');
                            vm.ckSearchList();
                        } else {
                            vm.ckShowInfo('dlgAlert', responseData.message);
                        }
                    })
                },
                onClose: function() {

                }
            },
            opts2: {
                type: 'confirm',
                title: '更改账期',
                width: 500,
                onOpen: function() {

                },
                onConfirm: function() {
                    var el = vm.dlgInfo.el;
                    var url = API.accountCreditAmount + '?amount=' + vm.dlgInfo.amount.amount;
                    request.POST(url.replace('{creditId}', el.id), function(responseData) {
                        if (responseData.success) {
                            vm.ckShowInfo('dlgAlert', '操作成功!');
                            vm.dlgInfo.amount = {}
                            vm.ckSearchList();
                        } else {
                            vm.ckShowInfo('dlgAlert', responseData.message);
                        }
                    })
                },
                onClose: function() {

                }
            },
            opts3: {
                type: 'confirm',
                title: '修改额度',
                width: 500,
                onOpen: function() {

                },
                onConfirm: function() {
                    var el = vm.dlgInfo.period;
                    var url = API.accountCreditPeriod + '?periodType=' + vm.period.creditPeriodNum + '&delayDays=' + vm.period.delayDays;
                    request.POST(url.replace('{creditId}', el.id), function(responseData) {
                        if (responseData.success) {
                            vm.ckShowInfo('dlgAlert', '操作成功!');
                            vm.ckSearchList();
                        } else {
                            vm.ckShowInfo('dlgAlert', responseData.message);
                        }
                    })
                },
                onClose: function() {

                }
            },
            opts4: {
                type: 'alert',
                title: '',
                width: 200
            },
            dlgInfo: {
                el: {},
                amount: {},
                period: {}
            },
            period: {
                creditPeriodNum: '0',
                delayDays: '7'
            },
            paymentType: {
                '周结': '0',
                '月结': '1',
                '双月结': '2',
            },
            creditPeriodType: [],
            creditPeriodTypeShort: [],
            accountCreditStatus: [],
            paymentList: [],
            delayDays: [],
            afterSaleOrderEmptyText: '数据为空',
            confirmReceivedMsg: 'ok',
            searchInfo: {
                customerName: '',
                creditPeriodType: '',
                accountCreditStatus: ''
            },
            ckSearchList: function() {
                var a = vm.searchInfo;
                request.GET(API.accountCredit + '?per_page=10&page=1' + '&customerName=' + a.customerName + '&creditPeriodType=' + a.creditPeriodType + '&accountCreditStatus=' + a.accountCreditStatus, function(responseData) {
                    if (responseData.success) {
                        vm.paymentList = responseData.result;
                        vm.pperPages = responseData.result_info.total_count;
                        vm.pPage = responseData.result_info.page;
                        avalon.scan(document.body, vm);
                    } else {
                        console.log(responseData.message);
                    }
                });
            },
            ckShowInfo: function(id, msg) {
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmEnable: function(el) {
                vm.dlgInfo.el = el;
                if (el.accountCreditStatus == "通过") {
                    var msg = '确定要停用该买家的账期吗？停用后该买家不能再用账期支付！'
                } else {
                    var msg = '确认要恢复该客户的账期吗？启用将立即生效！'
                }
                vm.ckShowInfo('dlgConfirmEnable', msg);
            },
            confirmAmount: function(el) {
                vm.dlgInfo.el = el;
                vm.ckShowInfo('dlgConfirmAmount', '');
            },
            confirmPeriod: function(el) {
                vm.dlgInfo.period = el;
                vm.period.creditPeriodNum = vm.paymentType[vm.dlgInfo.period.creditPeriodType];
                vm.period.delayDays = vm.dlgInfo.period.delayDays;
                if (vm.period.creditPeriodNum === "0") {
                    vm.crateArr(7)
                    vm.period.delayDays = '1'
                } else {
                    vm.crateArr(30)
                }
                avalon.scan(document.body, vm);
                vm.ckShowInfo('dlgConfirmPeriod', '');
            },
            crateArr: function(num) {
                var list = [];
                for (var i = 1; i <= num; i++) {
                    list.push(i);
                }
                vm.delayDays = list
            },
            pager: {
                currentPage: 1,
                totalItems: 10,
                perPages: 10,
                showJumper: true,
                onJump: function(e, data) {
                    var a = vm.searchInfo;
                    request.GET(API.accountCredit + '?per_page=10&page=' + data._currentPage, +'&customerName=' + a.customerName, function(responseData) {
                        if (responseData.success) {
                            vm.paymentList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            avalon.scan(document.body, vm);
                        } else {
                            console.log(responseData.message);
                        }
                    });
                }
            },
            $skipArray: ["pager"],
            pperPages: 10,
            pPage: 1,
            getLink: function(el) {
                //return/auditone 是初审页面
                //return/auditgood 是退换货实物
                //return/auditreturn 是退款页面
                //return/auditshipping 是重寄物流

                var h = '',
                    h1 = '<a target="_self" href="info.html?id=' + el.id + '"' + 'class="link"> 查看 </a>',
                    h2 = '<a href="javascript:void(0)" ms-click="confirmEnable(el)" class="link"> 启用 </a>',
                    h3 = '<a href="javascript:void(0)" ms-click="confirmEnable(el)" class="link"> 停用 </a>',
                    h4 = '<a href="javascript:void(0)" ms-click="confirmAmount(el)" class="link"> 调整额度 </a>',
                    h5 = '<a href="javascript:void(0)" ms-click="confirmPeriod(el)" class="link"> 更改账期 </a>';

                if (el.accountCreditStatus == '通过') {
                    h = h1 + h3 + h4 + h5;
                } else if (el.accountCreditStatus == '停用') {
                    h = h1 + h2;
                } else {
                    h = h1 + h3;
                }
                return h;
            }
        });

        vm.$watch("pperPages", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.totalItems = a;
            }
        });
        vm.$watch("pPage", function(a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.currentPage = a;
            }
        });

        (function init() {
            request.GET(API.dict.replace('{index}', 'ACCT_SETTLEMENT_TYPE'), function(responseData) {
                vm.creditPeriodTypeShort = responseData.result;
                responseData.result.unshift({ 'name': '全部', 'value': '' });
                vm.creditPeriodType = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.dict.replace('{index}', 'CREDIT_ACCOUNT_STATUS'), function(responseData) {
                responseData.result.unshift({ 'name': '全部', 'value': '' });
                vm.accountCreditStatus = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.accountCredit + '?per_page=10&page=1', function(responseData) {
                if (responseData.success) {
                    vm.paymentList = responseData.result;
                    vm.pperPages = responseData.result_info.total_count;
                    avalon.scan(document.body, vm);
                } else {
                    console.log(responseData.message);
                }
            });

        }());

        avalon.scan(document.body, vm);

        vm.period.$watch("creditPeriodNum", function(value, oldValue) {
            if (vm.period.creditPeriodNum === "0") {
                vm.crateArr(7)
                vm.period.delayDays = '1'
            } else {
                vm.crateArr(30)
            }
            avalon.scan(document.body, vm);
        })


    });
});
