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
    require('lib/io/FileSaver');
    require('lib/file-download/fileDownload');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require("oniui/loading/avalon.loading");


    avalon.ready(function () {
        var vm = avalon.define({
            $id: "acctBillList",
            billList:[],
            showLoading:false,
            paymentStatus:[],
            billListEmptyText:'结果为空',
            confirmReceivedMsg:'',
            billTotalAmount:0,
            billSummary:{},
            billTypes:[],
            verificationStatus:[],
            searchInfo:{customerName_contains:'', billingDate__gte:'', billingDate__lte:'', acctBillType_eq:'', paymentStatus_eq:'', verificationStatus_eq:''},
            ckShowInfo: function(id, msg){
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            ckSearchList:function(){
                // var params = '';
                // var reg = /(customerName_contains|billingDate__gte|billingDate__lte|acctBillType_eq|paymentStatus_eq|verificationStatus_eq)/;
                // for(var field in vm.searchInfo){
                //     if(reg.test(field)){
                //         params += '&'+field+'='+vm.searchInfo[field];
                //     }
                // }
                var a = vm.searchInfo;
                request.GET(API.getAcctBillList + '?per_page=10&page=1'+
                    '&customerName_contains=' + a.customerName_contains.trim() +
                    '&billingDate__gte=' + a.billingDate__gte +
                    '&billingDate__lte=' + a.billingDate__lte +
                    '&acctBillType_eq=' + a.acctBillType_eq +
                    '&paymentStatus_eq=' + a.paymentStatus_eq +
                    '&verificationStatus_eq=' + a.verificationStatus_eq , function(responseData) {
                    if(responseData.success){
                        vm.billList = responseData.result;
                        vm.pperPages = responseData.result_info.total_count;
                        vm.pPage = responseData.result_info.page;
                        vm.calcTotalAmount();
                        avalon.scan(document.body, vm);
                    }else{
                        vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        console.log(responseData.message);
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
                    vm.showLoading = true;
                    request.GET(API.getAcctBillList + '?per_page=10&page=' + data._currentPage +
                        '&customerName_contains=' + a.customerName_contains.trim() +
                        '&billingDate__gte=' + a.billingDate__gte +
                        '&billingDate__lte=' + a.billingDate__lte +
                        '&acctBillType_eq=' + a.acctBillType_eq +
                        '&paymentStatus_eq=' + a.paymentStatus_eq +
                        '&verificationStatus_eq=' + a.verificationStatus_eq , function(responseData) {
                        vm.showLoading = false;
                        if(responseData.success){
                            vm.billList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            vm.calcTotalAmount();
                            avalon.scan(document.body, vm);
                        }else{
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                            console.log(responseData.message);
                        }
                    });
                }
            },
            opts2: {
                type: 'alert',
                title: '提示',
                width:485
            },
            $skipArray :["pager","loading"],
            pperPages: 10,
            pPage:1,
            getLink: function(el){
                var h1 = '<a target="_self" href="/acctbill/bill-detail.html?id='+el.id+'"' + 'class="link"> 账单明细 </a>';

                return h1;
            },
            calcTotalAmount:function() {
                var total = 0;
               for(var i=0;i<vm.billList.length;i++){
                   var amt = vm.billList[i].payableAmount;
                   total = (parseFloat(amt)+parseFloat(total)).toFixed(2);
               }
                vm.billTotalAmount = total;
            },
            exportBills:function(){
                var params = '';
                var reg = /(acctBillType_eq|customerName_contains|billingDate__gte|billingDate__lte|acctBillType_eq|paymentStatus_eq|verificationStatus_eq)/;
                for(var field in vm.searchInfo){
                    if(reg.test(field) && vm.searchInfo[field] != ""){
                        params += '&'+field+'='+vm.searchInfo[field].trim();
                    }
                }
                var token = session.getAuthToken();
                var url = API.exportBill + '?token='+token+params;
                $.fileDownload(url, {
                    httpMethod: 'GET',
                    successCallback: function (url) {
                        alert('导出账单成功');
                    },
                    failCallback: function (html, url, error) {
                        //alert('导出账单失败');
                    }
                });
            }
        });
        //初始化日期
        var now = new Date(),
            start = new Date();
        if(1<start.getMonth()) {
            start.setMonth(start.getMonth()-1);
        } else {
            start.setMonth(12);
            start.setYear(start.getYear()-1);
        }
        start.setDate(1);
        vm.searchInfo.billingDate__gte = myUtils.formatDate(start, 'yyyy-MM-dd');
        vm.searchInfo.billingDate__lte = myUtils.formatDate(now, 'yyyy-MM-dd');
        //初始化数据
        vm.ckSearchList();

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
            request.GET(API.dict.replace('{index}', 'ACCT_BILLS_TYPE'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.billTypes = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.dict.replace('{index}', 'ACCT_PAY_STATUS'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.paymentStatus = responseData.result;
                avalon.scan(document.body, vm);
            });
            request.GET(API.dict.replace('{index}', 'Verification_Status'), function(responseData) {
                responseData.result.unshift({'name':'全部', 'value':''});
                vm.verificationStatus = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.getBillSummary,function(responseData) {
                if(responseData.success){
                    vm.billSummary = responseData.result;
                    avalon.scan(document.body, vm);
                }else{
                    console.log(responseData.message);
                }
            })
            // vm.showLoading = true;
            // request.GET(API.getAcctBillList + '?per_page=10&page=1', function(responseData) {
            //     vm.showLoading = false;
            //     if(responseData.success){
            //         vm.billList = responseData.result || [{}];
            //         vm.pperPages = responseData.result_info.total_count;
            //         vm.pPage = responseData.result_info.page;
            //         vm.calcTotalAmount();
            //         avalon.scan(document.body, vm);
            //     }else{
            //         console.log(responseData.message);
            //     }
            // });
        }());



        avalon.scan(document.body, vm);
    });
});