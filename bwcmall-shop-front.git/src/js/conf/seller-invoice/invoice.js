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
            $id: "sellerInvoiceCtrl",
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
            invoiceMethod:[],
            invoiceStatus:[],
            invoiceType:[],
            sellerInvoiceList:[],
            afterSaleOrderEmptyText: '数据为空',
            confirmReceivedMsg: 'ok',
            invoiceCount:'',
            invoiceCountAdd:'',
            searchInfo:{
                invoiceMethod:'',
                invoiceStatus:'',
                invoiceType:'',
                createTime__gte:'',
                createTime__lte:'',
                sn:'',
                corpTitle:'',
                customerName:''
            },
            getSearchParam: function(pageCode){
                var a = vm.searchInfo;
                var param = '?per_page=10&page=' + pageCode
                    + '&startTime__gte=' + a.createTime__gte
                    + '&endTime__lte=' + a.createTime__lte
                    + '&sn=' + a.sn
                    + '&corpTitle=' + a.corpTitle
                    + '&customerName=' + a.customerName
                    + '&invoiceMethod=' + a.invoiceMethod
                    + '&invoiceStatus=' + a.invoiceStatus
                    + '&type=' + a.invoiceType;

                return param;
            },
            ckSearchList: function(){

                request.GET(API.sellerInvoiceList + vm.getSearchParam(1), function(responseData) {
                    if(responseData.success){
                        vm.sellerInvoiceList = responseData.result;
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
                    request.GET(API.sellerInvoiceList + vm.getSearchParam(data._currentPage), function(responseData) {
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
                var h = '',
                    h1 = '<a target="_blank" href="../seller-invoice/info.html?id='+el.id+'&status='+el.invoiceStatus+'&type=1'+'"'+'class="link"> 查看 </a>',
                    h2 = '<a target="_blank" href="../seller-invoice/info.html?id='+el.id+'&status='+el.invoiceStatus+'&type=2'+'"'+'class="link"> 开票 </a>';

                if(el.invoiceStatus == 0){
                    h = h2;
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
            request.GET(API.dict.replace('{index}', 'INVOICE_METHOD'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.invoiceMethod = responseData.result;
                avalon.scan(document.body, vm);
            });

            // request.GET(API.dict.replace('{index}', 'INVOICE_STATUS'), function(responseData) {
            //     responseData.result.unshift({'name':'全部', 'value':''});
            //     vm.invoiceStatus = responseData.result;
            //     avalon.scan(document.body, vm);
            // });

            vm.invoiceStatus = [{value:'', name: "全部"}, {value:0, name:"未开票"}, {value:1, name:"已开票"}];

            request.GET(API.dict.replace('{index}', 'INVOICE_TYPE'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.invoiceType = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.sellerInvoiceList + '?per_page=10&page=1', function(responseData) {
                if(responseData.success){
                    vm.sellerInvoiceList = responseData.result;
                    vm.pperPages = responseData.result_info.total_count;
                    avalon.scan(document.body, vm);
                }else{
                    console.log(responseData.message);
                }
            });


            request.GET(API.countNoInvoice, function(responseData) {
                vm.invoiceCount = '待开普票: ' + '<span style="color:red;">' + responseData.result.invoiceCount+'个</span>';
                vm.invoiceCountAdd = '待开增票: ' + '<span style="color:red;">' + responseData.result.valueAddedInvoiceCount+'个</span>';
                avalon.scan(document.body, vm);
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