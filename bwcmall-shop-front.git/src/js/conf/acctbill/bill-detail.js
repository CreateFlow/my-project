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
    var billId  = urls.getParamByKey("id");
    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require("oniui/loading/avalon.loading");


    avalon.ready(function () {
        var vm = avalon.define({
            $id: "acctBillDetail",
            billInfo:{
                detailSellerVOList:[]
            },
            showE : '',
            showLoading:false,
            inputTrade:{},
            confirmReceivedMsg:'',
            opts1: {
                type: 'confirm',
                title: '确认已结清',
                width:485,
                onOpen: function() {

                },
                onConfirm: function(){
                    request.POST(API.confirmBill.replace('{billId}', billId), function(responseData){
                        vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        vm.getBillDetail();
                    });
                },
                onClose: function(){

                }
            },
            opts2: {
                type: 'confirm',
                title: '账单核销',
                width:485,
                onOpen: function() {

                },
                onConfirm: function(){
                    if (vm.inputTrade.bankStatementSn) {
                        var trade =  vm.inputTrade;
                        var params = '?tradeDate='+trade.tradeDate+'&bankStatementSn='+trade.bankStatementSn
                        request.POST(API.confirmBill.replace('{billId}', billId)+params, function(responseData){
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                            vm.getBillDetail();
                        });

                    }else{
                        vm.showE="* 银行流水号不能为空";
                        return false;
                    };
                    
                },
                onClose: function(){

                }
            },
            alertOpts: {
                type: 'alert',
                title: '提示',
                width:485
            },
            ckShowInfo: function(id, msg){
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmPaid: function(){
                var isSpecialShop = (vm.billInfo.verificationType =='1');
                if(isSpecialShop){
                    vm.ckShowInfo('dlgInputBankTradeCode', '账单核销!');
                }else{
                    vm.ckShowInfo('dlgConfirmPaidOrder', '确认已结清!');
                }
            },
            getBillDetail:function(){
                request.GET(API.accountBillInfo.replace('{billId}', billId), function(responseData) {
                    vm.billInfo = responseData.result;
                    avalon.scan(document.body, vm);
                });
            },
            exportBillDetail:function(){
                //模拟form
                var form = $('<form id="myForm"></form>').attr("style", 'display:none')
                    .attr("action", API.exportBills.replace('{billId}', urls.getParameter(window.location.href, 'id')))
                    //.attr("action", apiConfig.exportBills.replace('{billId}', '3786736223382142976'))
                    .attr("method", "GET");
                form.append('<input type="text" name="token" value="' + session.getCurrentUser().authToken + '">');
                form.appendTo('body');
                form.submit();
                form.remove();
            }
        });

        (function init(){
            vm.getBillDetail();
        }());



        avalon.scan(document.body, vm);
    });
});