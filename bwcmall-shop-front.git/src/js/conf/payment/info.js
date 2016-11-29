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
    var creditId = urls.getParamByKey("id");

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');

    avalon.ready(function() {
        var vm = avalon.define({
            $id: "accountCreditInfo",
            accountCreditInfo: '',
            result: {
                order: {}
            },
            cancel: function() {
                urls.goRef("/order/list.html");
            },
            confirmAndBack: function() {
                var order = vm.result.order;
                urls.goRef("/orderdetail/order-cancel.html?id=" + order.orderId + '&sn=' + order.orderSn);
            },
            getEffectiveDate: function(item) {
                if(item.nextCreditPeriodType) {
                    //下次生效时间减1秒
                    var newDate = new Date(item.updateEffectiveDate) - 1;

                    return myUtils.formatDate(newDate, "yyyy-MM-dd hh:mm:ss");
                }
                return item.effectiveDate;
            }
        });

        (function init() {
           
            request.GET(API.accountCreditInfo.replace('{creditId}', creditId), function(responseData) {
                if (responseData.success) {
                    vm.accountCreditInfo = responseData.result;
                    avalon.scan(document.body, vm);
                } else {
                    console.log(responseData.message);
                }
            });
        }());



        avalon.scan(document.body, vm);
    });
});
