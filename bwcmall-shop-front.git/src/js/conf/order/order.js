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

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require("oniui/loading/avalon.loading");
    require("oniui/validation/avalon.validation");
    var validationVM
    function showError(el, data) {
        var next = el.nextSibling
        if (!(next && next.className === "error-tip")) {
            next = document.createElement("div")
            next.className = "error-tip"
            el.parentNode.appendChild(next)
        }
        next.innerHTML = data.getMessage()
    }
    function removeError(el) {
        var next = el.nextSibling
        if (next && next.className === "error-tip") {
            el.parentNode.removeChild(next)
        }
    }

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "orderList",
            opts1: {
                type: 'confirm',
                title: '取消订单',
                width:485,
                onOpen: function() {

                },
                onConfirm: function(){
                    var el = vm.dlgInfo.selectedOrder;
                    var cancelReason = vm.cancelReason;
                    validationVM.validateAll();
                    if(!cancelReason.option){
                        return false;
                    }
                    request.PATCH(API.cancelOrder.replace('{orderId}', el.orderId),{
                        cancelReasonType:cancelReason.option,
                        cancelReason:cancelReason.reason
                    }, function(responseData){
                        var result = {
                            success:responseData.success,
                            message:responseData.message,
                            order:el
                        }
                        if(responseData.success){
                            urls.goRef('/orderdetail/order-canceled-result.html');
                        }else{
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        }
                        session.set('orderCancelResult',result);

                    });
                },
                onClose: function(){

                }
            },
            reset: function() {
                validationVM && validationVM.resetAll()
            },
            validation: {
                onInit: function(v) {
                    validationVM = v
                },
                onReset: function(e, data) {
                    data.valueResetor && data.valueResetor()
                    avalon(this).removeClass("error success")
                    removeError(this)
                },
                onError: function(reasons) {
                    reasons.forEach(function(reason) {
                        avalon(this).removeClass("success").addClass("error")
                        showError(this, reason)
                    }, this)
                },
                onSuccess: function() {
                    avalon(this).removeClass("error").addClass("success")
                    removeError(this)
                },
                onValidateAll: function(reasons) {
                    reasons.forEach(function(reason) {
                        avalon(reason.element).removeClass("success").addClass("error")
                        showError(reason.element, reason)
                    })
                    if (reasons.length === 0) {
                        avalon.log("全部验证成功！")
                    }
                }
            },
            opts2: {
                type: 'alert',
                title: '提示',
                width:485
            },
            dlgInfo:{
                selectedOrder:{}
            },
            loading: {},
            showLoading:true,
            afterSaleType:[],
            cancelReasonType:[],
            orderStatus:[],
            paymentStatus:[],
            afterSaleOrderList:[],
            orderListEmptyText: '查询结果为空',
            confirmReceivedMsg: 'ok',
            cancelReason:{},
            searchInfo:{
                snOrPhone:'',
                orderStatus:'',
                paymentStatus:'',
                serviceBuyerName:''
            },
            ckSearchList: function(){
                var a = vm.searchInfo;
                request.GET(API.getOrderList + '?per_page=10&page=1'
                    + '&snOrPhone_contains=' + a.snOrPhone.trim()
                    +'&orderStatusValueList_in='+ a.orderStatus
                    +'&paymentStatusValueList_in='+ a.paymentStatus,function(responseData) {
                    if(responseData.success){
                        vm.afterSaleOrderList = responseData.result;
                        vm.pperPages = responseData.result_info.total_count;
                        vm.pPage = responseData.result_info.page;
                        avalon.scan(document.body, vm);
                    }else{
                        vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        console.log(responseData.message);
                    }
                });
            },

            ckShowInfo: function(id, msg){
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmCancel: function(el){
                vm.dlgInfo.selectedOrder = el;
                vm.ckShowInfo('dlgConfirmCancelOrder', '确认取消!');
            },
            goOrderDetail:function(el){
                urls.goRef('/orderdetail/order-detail.html?sn=' + el.orderSn+'&id='+el.orderId)
            },
            pager : {
                currentPage: 1,
                totalItems:10,
                perPages:10,
                showJumper:true,
                onJump: function(e, data) {
                    var a = vm.searchInfo;
                    vm.showLoading = true;
                    request.GET(API.getOrderList + '?per_page=10&page=' + data._currentPage, function(responseData) {
                        vm.showLoading = false;
                        if(responseData.success){
                            vm.afterSaleOrderList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            avalon.scan(document.body, vm);
                        }else{
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                            console.log(responseData.message);
                        }
                    });
                }
            },
            $skipArray :["pager","loading"],
            pperPages: 10,
            pPage:1,
            getLink: function(el){
                var h = '',
                    h1 = '<a target="_self" href="../orderdetail/order-detail.html?sn=' + el.orderSn+'&id='+el.orderId+'"' + 'class="link"> 查看 </a>',
                    h2 = '<a target="_self" href="../orderdetail/order-shipping.html?sn=' + el.orderSn+'&id='+el.orderId+'"' + 'class="link"> 查看 </a>',
                    h3 = '<a href="javascript:void(0)" ms-click="confirmCancel(el)" class="link"> 取消订单 </a>',
                    h4 = '<a target="_self" href="../orderdetail/order-cancel.html?sn=' + el.orderSn+'&id='+el.orderId+'"' + 'class="link"> 查看 </a>';
                if(el.orderStatusName == '待支付'){
                    return h1+h3;
                }else if(el.orderStatusName == '待发货'){
                    return h2+h3;
                }else if(el.orderStatusName == '待收货' ){
                    return h1+h3;
                }else if(el.orderStatusName == '已取消' ){
                    return h4;
                }else{
                    h = h1;
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

        (function init(){
            request.GET(API.dict.replace('{index}', 'ORDER_STATUS'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.orderStatus = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.dict.replace('{index}', 'PAYMENT_STATUS'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.paymentStatus = responseData.result;
                avalon.scan(document.body, vm);
            });
            request.GET(API.dict.replace('{index}', 'CANCEL_REASON_TYPE'), function(responseData) {
                //responseData.result.unshift({'name':'全部', 'value':''});
                vm.cancelReasonType = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.getOrderList + '?per_page=10&page=1', function(responseData) {
                vm.showLoading = false;
                if(responseData.success){
                    vm.afterSaleOrderList = responseData.result;
                    vm.pperPages = responseData.result_info.total_count;
                    avalon.scan(document.body, vm);
                }else{
                    console.log(responseData.message);
                }
            });
        }());



        avalon.scan(document.body, vm);
    });
});