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

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "afterSaleOrder",
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
            afterSaleType:[],
            afterSaleStatus:[],
            afterSaleOrderList:[],
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
                request.GET(API.getAfterSaleOrder + '?per_page=10&page=1'
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
            },
            ckShowInfo: function(id, msg){
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmReceived: function(el){
                vm.dlgInfo.el = el;
                vm.ckShowInfo('dlgAfterSaleConfirm', '请确认已经收到货!');
            },
            pager : {
                currentPage: 1,
                totalItems:10,
                perPages:10,
                showJumper:true,
                onJump: function(e, data) {
                    var a = vm.searchInfo;
                    request.GET(API.getAfterSaleOrder + '?per_page=10&page=' + data._currentPage
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
                //return/auditconfirm 是确认收货

                var h = '',
                    h1 = '<a target="_blank" href="../service/return-detail.html?id=' + el.id +'"' + 'class="link"> 查看 </a>',
                    h2 = '<a target="_self" href="../return/auditone.html?id=' + el.id +'"' + 'class="link"> 审核 </a>',
                    h3 = '<a target="_self" href="../return/auditgood.html?id=' + el.id +'"' + 'class="link"> 审核 </a>',
                    h4 = '<a target="_self" href="../return/auditreturn.html?id=' + el.id +'"' + 'class="link"> 审核 </a>',
                    h5 = '<a target="_self" href="../return/auditconfirm.html?id=' + el.id +'"' + 'class="link"> 确认收货 </a>',
                    //h5 = '<a href="javascript:void(0);" class="link" ms-click="confirmReceived(el)"> 确认收货 </a>',
                    h6 = '<a target="_self" href="../return/auditshipping.html?id=' + el.id +'"' + 'class="link"> 发起重寄物流 </a>';

                if(el.afterSaleStatus == 1 || el.afterSaleStatus == 4 || el.afterSaleStatus == 5
                    || el.afterSaleStatus == 7  || el.afterSaleStatus == 8){
                    h = h1;
                }

                if(el.afterSaleStatus == 0 && el.afterSaleType != 1){ h = h2; }
                if(el.afterSaleStatus == 3){ h = h3; }
                if(el.afterSaleStatus == 0 && el.afterSaleType == 1){ h = h4; }
                if(el.afterSaleStatus == 2){ h = h5; }
                if(el.afterSaleStatus == 6){ h = h6; }

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
            request.GET(API.dict.replace('{index}', 'AFTER_SALE_TYPE'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.afterSaleType = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.dict.replace('{index}', 'AFTER_SALE_STATUS'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.afterSaleStatus = responseData.result;
                avalon.scan(document.body, vm);
            });

            //初始化日期 前7天 后1天
            var now = new Date(),
                tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
                sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 7);
            vm.searchInfo.createTime__gte = myUtils.formatDate(sevenDay, 'yyyy-MM-dd');
            vm.searchInfo.createTime__lte = myUtils.formatDate(tomorrow, 'yyyy-MM-dd');

            request.GET(API.getAfterSaleOrder + '?per_page=10&page=1&noNeed__ne=4&noNeedTwo__ne=8'
                + '&startTime__gte=' + vm.searchInfo.createTime__gte
                + '&endTime__lte=' + vm.searchInfo.createTime__lte,
                function(responseData) {
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