'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils'),
        urls = require('module/common/utils/url');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "orderShipping",
            opts1: {
                type: 'confirm',
                title: '',
                width:250,
                onOpen: function() {

                },
                onConfirm: function(){
                    var el = vm.dlgInfo.el;
                    request.PATCH(API.confirmReceived.replace('{id}', el.id), function(responseData){
                        if(responseData.success){
                            vm.ckShowInfo('dlgAfterSaleAlert', '卖家确认收货完成!');
                            vm.ckSearchList();
                        }else{
                            vm.ckShowInfo('dlgAfterSaleAlert', responseData.message);
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
                el:{}
            },
            originTotal:0,
            afterSaleType:[],
            orderStatus:[],
            paymentStatus:[],
            logisticCorpList:[],
            afterSaleOrderEmptyText: '数据为空',
            confirmReceivedMsg: 'ok',
            searchInfo:{
                noNeed4:4,
                noNeed8:8,
                orderSn:'',
                sn:'',
                afterSaleType:'',
                afterSaleStatus:'',
                createTime__gte:'',
                createTime__lte:''
            },
            ckSearchList: function(){
                var a = vm.searchInfo;
                request.GET(API.getOrderList + '?per_page=10&page=1'
                    + '&orderSn=' + a.orderSn
                    + '&sn=' + a.sn, function(responseData) {
                    if(responseData.success){
                        vm.afterSaleOrderList = responseData.result;
                        vm.pperPages = responseData.result_info.total_count;
                        vm.pPage = responseData.result_info.page;
                        avalon.scan(document.body, vm);
                    }else{
                        console.log(responseData.message);
                    }
                });
            },
            ckShowInfo: function(id, msg){
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmReceived: function(el){
                vm.dlgInfo.el = el;
                vm.ckShowInfo('dlgAfterSaleConfirm', '请确认已经收到货!');
            },
            cancel:function(){
                urls.goRef("/order/list.html");
            },
            pager : {
                currentPage: 1,
                totalItems:10,
                perPages:10,
                showJumper:true,
                onJump: function(e, data) {
                    var a = vm.searchInfo;
                    request.GET(API.getAfterSaleOrder + '?per_page=10&page=' + data._currentPage,
                        + '&noNeed__ne=' + a.noNeed4
                        + '&noNeedTwo__ne=' + a.noNeed8
                        + '&startTime__gte=' + a.createTime__gte
                        + '&endTime__lte=' + a.createTime__lte
                        + '&orderSn=' + a.orderSn
                        + '&sn=' + a.sn
                        + '&afterSaleType=' + a.afterSaleType
                        + '&afterSaleStatus=' + a.afterSaleStatus, function(responseData) {
                        if(responseData.success){
                            vm.afterSaleOrderList = responseData.result;
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
                //return/auditone 是初审页面
                //return/auditgood 是退换货实物
                //return/auditreturn 是退款页面
                //return/auditshipping 是重寄物流

                var h = '',
                    h1 = '<a target="_blank" href="../service/return-detail.html?id=' + el.id +'"' + 'class="link"> 查看 </a>',
                    h2 = '<a target="_self" href="../return/auditone.html?id=' + el.id +'"' + 'class="link"> 发货 </a>',
                    h3 = '<a target="_self" href="../return/auditgood.html?id=' + el.id +'"' + 'class="link"> 取消订单 </a>';

                if(el.orderStatusName == '已发货' ){
                    h = h1+h3;
                }else if(el.orderStatusName == ' 已取消' ){
                    h = h1;
                }else{
                    h = h1+h2+h3;
                }
                return h;
            },
            ckNoNeed: function(){
                if(vm.searchInfo.noNeed8 == 8){
                    vm.searchInfo.noNeed4 = '';
                    vm.searchInfo.noNeed8 = '';
                }else{
                    vm.searchInfo.noNeed4 = 4;
                    vm.searchInfo.noNeed8 = 8;
                }
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



            request.GET(API.getLogistic,function(resp){
                if(resp.success){
                    vm.logisticCorpList = resp.result;
                    avalon.scan(document.body,vm);
                }else{
                    consolog.log(resp.message);
                }
            })

            //初始化日期 前7天 后1天
            var now = new Date(),
                tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
                sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 7);
            vm.searchInfo.createTime__gte = myUtils.formatDate(sevenDay, 'yyyy-MM-dd');
            vm.searchInfo.createTime__lte = myUtils.formatDate(tomorrow, 'yyyy-MM-dd');
        }());



        avalon.scan(document.body, vm);
    });
});