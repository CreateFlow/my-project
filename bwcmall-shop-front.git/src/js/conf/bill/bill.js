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
            $id: "billList",
            afterSaleType:[],
            orderStatus:[],
            income : '',
            cashAdvance : '',
            paymentStatus:[],
            afterSaleOrderList:[],
            orderListEmptyText: '查询结果为空',
            searchInfo:{
                orderStatus:'0',
                createTime__gte:'',
                createTime__lte:''
            },
            todaySearch : function(){
                var now = new Date(),
                tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
                sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 0);
                vm.searchInfo.createTime__gte = myUtils.formatDate(sevenDay, 'yyyy-MM-dd');
                vm.searchInfo.createTime__lte = myUtils.formatDate(tomorrow, 'yyyy-MM-dd');
                vm.ckSearchList();
            },
            weekSearch : function(){
                var now = new Date(),
                tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
                sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 7);
                vm.searchInfo.createTime__gte = myUtils.formatDate(sevenDay, 'yyyy-MM-dd');
                vm.searchInfo.createTime__lte = myUtils.formatDate(tomorrow, 'yyyy-MM-dd');
                vm.ckSearchList();
            },
            monthSearch : function(){
                var now = new Date(),
                tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
                sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 30);
                vm.searchInfo.createTime__gte = myUtils.formatDate(sevenDay, 'yyyy-MM-dd');
                vm.searchInfo.createTime__lte = myUtils.formatDate(tomorrow, 'yyyy-MM-dd');
                vm.ckSearchList();
            },
            threeSearch : function(){
                var now = new Date(),
                tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
                sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 90);
                vm.searchInfo.createTime__gte = myUtils.formatDate(sevenDay, 'yyyy-MM-dd');
                vm.searchInfo.createTime__lte = myUtils.formatDate(tomorrow, 'yyyy-MM-dd');
                vm.ckSearchList();
            },
            yearSearch : function(){
                var now = new Date(),
                tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
                sevenDay = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 178);
                vm.searchInfo.createTime__gte = myUtils.formatDate(sevenDay, 'yyyy-MM-dd');
                vm.searchInfo.createTime__lte = myUtils.formatDate(tomorrow, 'yyyy-MM-dd');
                vm.ckSearchList();
            },
            ckSearchList: function(){
                var a = vm.searchInfo;
                request.GET(API.vreturn + 'shop/yeepayAccountDetail?per_page=10&page=1'
                    + '&startTime__gte=' + a.createTime__gte
                    + '&endTime__lte=' + a.createTime__lte
                    + '&type='+ a.orderStatus,
                    function(responseData) {
                    if(responseData.success){
                        vm.afterSaleOrderList = responseData.result;
                        vm.pperPages = responseData.result_info.total_count;
                        vm.pPage = responseData.result_info.page;
                        avalon.scan(document.body, vm);
                    }else{
                        //console.log(responseData.message);
                        alert(responseData.message);
                    }
                });
            },
            pager : {
                currentPage: 1,
                totalItems:10,
                perPages:10,
                showJumper:true,
                onJump: function(e, data) {
                    var a = vm.searchInfo;
                    request.GET(API.vreturn + 'shop/yeepayAccountDetail?per_page=10&page=' + data._currentPage
                        + '&startTime__gte=' + a.createTime__gte
                        + '&endTime__lte=' + a.createTime__lte
                        + '&type='+ a.orderStatus, 
                    function(responseData) {
                        if(responseData.success){
                            
                            vm.afterSaleOrderList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            avalon.scan(document.body, vm);
                        }else{
                            //console.log(responseData.message);
                            alert(responseData.message);
                        }
                    });
                }
            },
            $skipArray :["pager"],
            pperPages: 10,
            pPage:1,
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
            request.GET(API.vreturn + 'shop/yeepayAccountntAmount', function(responseData) {
                vm.income = responseData.result.income;
                vm.cashAdvance = responseData.result.cashAdvance;
                avalon.scan(document.body, vm);
            });
            request.GET(API.dict.replace('{index}', 'SHOP_ACCT_DETAIL_TYPE'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.orderStatus = responseData.result;
                avalon.scan(document.body, vm);
            });
            request.GET(API.vreturn + 'shop/yeepayAccountDetail?per_page=10&page=1', function(responseData) {
                if(responseData.success){
                    vm.afterSaleOrderList = responseData.result;
                    vm.pperPages = responseData.result_info.total_count;
                    avalon.scan(document.body, vm);
                }else{
                    //console.log(responseData.message);
                    alert(responseData.message);
                }
            });

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