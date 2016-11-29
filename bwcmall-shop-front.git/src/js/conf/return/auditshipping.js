'use strict';

define(function(require, exports, module) {

    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        urls = require('module/common/utils/url');

    var urlid = urls.getParamByKey("id");
    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('lib/plugins/lightbox/js/lightbox.min');

    avalon.define("auditshipping", function(vm) {
        
        vm.logisticCorp = '';
        vm.logisticCorpRemark = '';
        vm.trackingNo = '';
        vm.submit = function() {
            if (vm.logisticCorp == '') {
                alert('物流公司名称不能为空');
                return false;
            };
            if (vm.logisticCorpRemark == '') {
                alert('物流公司备注不能为空');
                return false;
            };
            if (vm.trackingNo == '') {
                alert('物流单号不能为空');
                return false;
            };
            var serData = {
                "logisticCorp": vm.logisticCorp,
                "logisticCorpRemark": vm.logisticCorpRemark,
                "trackingNo": vm.trackingNo
            };
            request.PATCH(API.vreturn + 'shop/redirectShipping/'+ urlid, JSON.stringify(serData),
                function(data) {
                    if (data.success) {
                        alert('操作成功');
                        urls.goRef("/aftersale/list.html");
                    } else {
                        alert('操作失败');
                    }
                }
            );
            
        };
        // 调用接口
        request.GET(API.getAfterSaleOrder+'/'+urlid, function(responseData) {
            if (responseData.success) {
                vm.result = responseData.result;
                avalon.scan(document.body, vm);
            }
        });
    });
});