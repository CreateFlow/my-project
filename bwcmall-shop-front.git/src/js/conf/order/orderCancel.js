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

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "orderCancel",
            result:{
                order:{}
            },
            orderLink:'',
            cancel:function(){
                urls.goRef("/order/list.html");
            },
            confirmAndBack:function(){
                var order = vm.result.order;
                urls.goRef("/orderdetail/order-cancel.html?id="+order.orderId+'&sn='+order.orderSn);
            }

        });

        (function init(){
            vm.result = session.get('orderCancelResult');
            var order = vm.result.order;
            vm.orderLink = "/orderdetail/order-cancel.html?id="+order.orderId+'&sn='+order.orderSn;
        }());



        avalon.scan(document.body, vm);
    });
});