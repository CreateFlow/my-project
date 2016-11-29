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
    require('oniui/dropdown/avalon.dropdown');
    require('lib/plugins/lightbox/js/lightbox.min');

    avalon.ready(function () {
        var vm = avalon.define({
            $id          : "auditconfirm",
            result  : '',

            cancel: function() {
                urls.goRef("/aftersale/list.html");
            },

            submit : function() {
                request.PATCH(API.vreturn + 'shop/afterSaleOrder/'+ urlid +'/confirmReceived',
                    function(data) {
                        if (data.success) {
                            alert('操作成功');
                            urls.goRef("/aftersale/list.html");
                        } else {
                            alert('操作失败');
                        }
                    }
                );
            }
        });

        
        
        request.GET(API.getAfterSaleOrder+'/' + urlid, function(responseData) {
            if (responseData.success) {
                vm.result = responseData.result;
                avalon.scan(document.body, vm);
            }
        });

        
    });
});