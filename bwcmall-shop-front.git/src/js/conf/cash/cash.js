'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        urls = require('module/common/utils/url'),
        myUtils = require('module/common/utils/utils');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "cashCtrl",
            money : '',
            panel : 1 ,
            refusePicInfo : '',
            yibaoData:  {
                // id : 1 ,//(integer, optional): 唯一标识 ,
                // type : 1 , //(integer, optional): 店铺账号类型(0易宝),code=SHOP_ACCOUNT_TYPE ,
                // shopAccount : 1 ,//(string, optional): 账号 ,
                // signedName : 1 , //(string, optional): 签约名(个人时，填写姓名；企业时，填写企业名称) ,
                // bankProvince : 1 , //(string, optional): 开户省 ,
                // bankCity : 1 , //(string, optional): 开户市 ,
                // bankName : 1 , //(string, optional): 开户行 ,
                // bankAccountNumber : 1 , //(string, optional): 银行卡号 ,
                // customerType : 1 , //(integer, optional): 注册类型(0：个人 1：企业)code=YEEPAY_ACCOUNT_CUSTOMER_TYPE ,
                // acctStatus : 1 , //(integer, optional): 账号状态(0冻结1通过2不通过),code=SHOP_ACCOUNT_STATUS ,
                // reason : 1 , //(string, optional): 不通过原因 ,
                // shopId : 1 , //(integer, optional): 关联店铺标识 ,
                // balance : 20000.00 , //(number, optional): 可用余额 ,
                // freeze : '111' //(number, optional): 冻结余额
            },
            all : function() {
                vm.money = vm.yibaoData.balance;
            },
            resub : function() {
                vm.panel = 1;
            },
            reindex : function() {
                urls.goRef("/");
            },
            submit : function() {
                if (!vm.money) {
                    vm.refusePicInfo = '提现金额不能为空';
                    return false;
                };
                if (vm.money == 0) {
                    vm.refusePicInfo = '提现金额不能为0';
                    return false;
                };
                if (vm.money < 0) {
                    vm.refusePicInfo = '提现金额不能为负数';
                    return false;
                };
                if(!isNaN(vm.money)){
                   
                }else{
                    vm.refusePicInfo = '提现金额必须为数字';
                    return false;
                }

                var serData =vm.money;
                request.POST(API.vreturn + 'shop/cashTransfer', serData,
                    function(data) {
                        if (data.success) {
                            vm.panel = 2;
                        } else {
                            vm.panel = 3;
                        }
                    }
                );
            }
        });

        request.GET(API.vreturn + 'shop/yeepayAccountBalance', function(responseData) {
            if(responseData.success) {
                vm.yibaoData = responseData.result;
                avalon.scan(document.body, vm);
            } else {
                alert(responseData.message);
            }
        });
        
    });
});