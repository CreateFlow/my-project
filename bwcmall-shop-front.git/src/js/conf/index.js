'use strict';

define(function(require, exports, module) {
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        urls = require('module/common/utils/url');

    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');


    avalon.ready(function () {
        var vm = avalon.define({
            $id: "indexCtrl",
            goSaleList: function() {
                urls.goRef("/aftersale/list.html");
            },
            accountData :   {
                // id: '111213', //(integer, optional): 唯一标识 ,
                // type: 0 ,//(integer, optional): 店铺账号类型(0易宝),code=SHOP_ACCOUNT_TYPE ,
                // shopAccount: '123123' ,//(string, optional): 账号 ,
                // signedName: '签约名',//(string, optional): 签约名(个人时，填写姓名；企业时，填写企业名称) ,
                // bankProvince: '开户省',//(string, optional): 开户省 ,
                // bankCity: '开户市',//(string, optional): 开户市 ,
                // bankName: '开户行',//(string, optional): 开户行 ,
                // bankAccountNumber: '1123123',//(string, optional): 银行卡号 ,
                // customerType: 1,//(integer, optional): 注册类型(0：个人 1：企业)code=YEEPAY_ACCOUNT_CUSTOMER_TYPE ,
                 acctStatus: 0,//(integer, optional): 账号状态(0冻结1通过2不通过),code=SHOP_ACCOUNT_STATUS ,
                // reason: '解冻收款账户需要您提交相关企业资质，审核通过后即可在此查看收入并提现至绑定的银行卡！',//(string, optional): 不通过原因 ,
                // shopId: 1,//(integer, optional): 关联店铺标识 ,
                // balance: '2000',//(number, optional): 可用余额 ,
                // freeze: '10000'//(number, optional): 冻结余额
            },
            result: {
                afterSaleCount: 0,
            },
            show: function(){
                urls.goRef("/cash/thaw.html");
            },
            showto: function(){
                urls.goRef("/cash/cash.html");
            },
            //免运费设置
            setFreight: function() {
                avalon.vmodels["dialogFreight"].toggle = true;
            },
            $dialogFreightOpts: {
                title: "免运费设置",
                width: 560,
            },
            onSaveFreight: function() {
                var updateData = {
                    freightFree: vm.result.freightFree,
                    freightFreeSill: vm.result.freightFreeSill
                }
                request.PUT(API.setFreightFree, updateData, function(responseData) {
                    if(responseData.success) {
                        avalon.scan(document.body, vm);
                        avalon.vmodels["dialogFreight"].toggle = false;
                    } else {
                        alert(responseData.message);
                    }
                });
            }
        });

        request.GET(API.vreturn + 'shop/yeepayAccountBalance', function(responseData) {
            if(responseData.success) {
                if (responseData.result) {
                    avalon.vmodels["indexCtrl"].accountData = responseData.result;
                    avalon.scan(document.body, vm);
                };
            } else {
                alert(responseData.message);
            }
        });


        request.GET(API.shopPanorama, {abortOnRetry:false}, function(responseData) {
            if(responseData.success) {
                avalon.vmodels["indexCtrl"].result = responseData.result;
                avalon.scan(document.body, vm);
            } else {
                alert(responseData.message);
            }
        });
    });
});