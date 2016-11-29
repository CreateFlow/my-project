'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils'),
        myUrls = require('module/common/utils/url');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "sellerInvoiceInfoCtrl",
            opts1: {
                type: 'confirm',
                title: '输入开票金额',
                width:350,
                onOpen: function() {
                    vm.dlgInfo.invoiceId = this.invoiceId;
                    vm.dlgInfo.orderId = this.orderId;
                },
                onConfirm: function(){
                    var d = vm.dlgInfo;
                    var p = {
                        "amount": d.newPrice,
                        "orderId": d.orderId
                    };
                    request.POST(API.sellerInvoiceUpdateAmount.replace('{invoiceId}', d.invoiceId), p, function(responseData){
                        if(responseData.success){
                            //vm.ckShowInfo('dlgAfterSaleAlert', '卖家确认收货完成!');
                            console.log(responseData.result);
                        }else{
                            //vm.ckShowInfo('dlgAfterSaleAlert', responseData.message);
                            console.log(responseData.message);
                        }
                    })
                },
                onClose: function(){

                }
            },
            opts2: {
                type: 'alert',
                title: '',
                width:200
            },
            dlgInfo:{
                invoiceId:'',
                orderId:'',
                newPrice:''
            },
            invoiceInfo:{},
            invoiceStatus:0,
            isShowLine1:false,
            isShowLine2:false,
            isShowYuan2:false,
            isShowYuan3:false,
            isShowOperator:false,
            sellerInvoiceList:[],
            afterSaleOrderEmptyText: '数据为空',
            confirmReceivedMsg: 'ok',
            invoiceCount:'',
            invoiceCountAdd:'',
            invoiceNumber: '',
            ckShowInfo: function(id, msg){
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            pager : {
                currentPage: 1,
                totalItems:10,
                perPages:10,
                showJumper:true,
                onJump: function(e, data) {
                    var a = vm.searchInfo;
                    request.GET(API.getAfterSaleOrder + vm.getSearchParam(data._currentPage), function(responseData) {
                        if(responseData.success){
                            vm.sellerInvoiceList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            avalon.scan(document.body, vm);
                        }else{
                            console.log(responseData.message);
                        }
                    });
                }
            },
            $skipArray :["pager"],
            pperPages: 10,
            pPage:1,
            getLink: function(el){
                return '<a href="javascript:void(0);" class="link" ms-click="updateInvoiceAmount"> 修改开票金额 </a>';
            },
            goOrderDetail:function(el){
                myUrls.goRef('/orderdetail/order-detail.html?sn=' + el.orderSn+'&id='+el.orderId)
            },
            updateInvoiceAmount: function(){
                vm.ckShowInfo('dlgPutAmountConfirm', '');
            },
            confirmTheInvoice: function(){
                var id = myUrls.getParamByKey("id");
                var num = vm.invoiceNumber;
                request.POST(API.sellerInvoiceConfirm.replace('{invoiceId}', id).replace('{invoiceNumber}', num), function(responseData){
                    if(responseData.success){
                        vm.ckShowInfo('dlgConfirmInvoiceAlert', '操作成功!');
                    }else{
                        //vm.ckShowInfo('dlgAfterSaleAlert', responseData.message);
                        console.log(responseData.message);
                    }
                })
            }
        });

        (function init(){
            vm.invoiceStatus = myUrls.getParamByKey("status");
            if(vm.invoiceStatus == 0){
                vm.isShowLine1 = true;
                vm.isShowYuan2 = true;
            }
            if(vm.invoiceStatus == 1){
                vm.isShowLine1 = true;
                vm.isShowYuan2 = true;
                vm.isShowLine2 = true;
                vm.isShowYuan3 = true;
            }

            vm.isShowOperator = false;
            if(myUrls.getParamByKey("type") == 2 && myUrls.getParamByKey("status") == 0){
                vm.isShowOperator = true;
            }

            request.GET(API.sellerInvoiceDetails.replace('{invoiceId}', myUrls.getParamByKey("id")), function(responseData){
                if(responseData.success){
                    console.log(responseData.result);
                    vm.invoiceInfo = responseData.result;
                    vm.sellerInvoiceList = responseData.result.orders;
                }else{
                    console.log(responseData.message);
                }
            });
        }());




        avalon.scan(document.body, vm);
    });
});