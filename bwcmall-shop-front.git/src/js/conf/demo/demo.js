'use strict';

define(function(require, exports, module) {

    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        uploadify = require('module/common/uploadify/uploadify'),
        regions = require('module/common/config/regions'),
        select = require('module/common/ui/select/select');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    // 加载oniui
    require('oniui/dropdown/avalon.dropdown');
    require('oniui/dialog/avalon.dialog');
    require('oniui/loading/avalon.loading');
    // require('oniui/smartgrid/avalon.smartgrid');

    avalon.ready(function() {
        var vm = avalon.define({
            $id: "demo",
            value: 1,
            data: [
                {
                    value: 1,
                    label: '全选'
                },
                {
                    value: 2,
                    label: '已退货'
                },
                {
                    value: 3,
                    label: '未退货'
                },
                {
                    value: 4,
                    label: '未处理'
                }
            ],
            loading: {},
            saleOrder: {
                autoResize: false,
                noHeader: false,
                columns: [
                    {
                        key : "id",
                        name : "id",
                        toggle: false
                    },
                    {
                        key : "orderSn", //列标识
                        name : "订单号", //列名
                        sortable : true, //是否可排序
                        isLock : true
                    },
                    {
                        key : "customerName", //列标识
                        name : "客户名称"
                    },
                    {
                        key : "createTime", //列标识
                        name : "创建时间"
                    }
                ],
                data: []
            },
            show: function( id ){
                avalon.vmodels[id].toggle = true;
            },
            $aaOpts: {
                title: '冷冻账户理由',
                type: 'alert',
                confirmName: '确认短信并通知用户',
                onOpen: function() {
                    console.log("open dialog");
                },
                onConfirm: function(){
                    console.log('success');
                },
                onClose: function(){
                    console.log('fail');
                }
            }
        });

        // 调用组件
        request.GET(API.getAfterSaleOrder, function(responseData) {
            vm.saleOrder.data = responseData.result;
        });

        uploadify('#licensePic', {uploader: ''});
        avalon.scan();
        var province = select('#province', {
                placeholder: '选择省',
                data: regions
            }),

            city = select('#city', {
                placeholder: '选择市',
                data: regions[0].c
            }),

            region = select('#region', {
                placeholder: '选择区',
                data: regions[0].c[0].c
            });

        province.on('change', function(e, self) {
            var value = self.getDOMValue(),
                data = getRegionValueByParent(regions, value, 'id');
            city.setDataSources(data);
            city.source = data;
            city.setValue(data[0].id);
        });

        city.on('change', function(e, self) {
            var value = self.getDOMValue(),
                data = getRegionValueByParent(self.source, value, 'id');
            region.setDataSources(data);
        });

    });


    function getIndexByProp(list, val, prop) {
        var i = 0, item,
            len = list.length;

        prop = prop || 'value';

        for (; i < len; i += 1) {
            item = list[i];
            if (item[prop] === val) {
                return i;
            }
        }
    }

    function getRegionValueByParent(list, val, prop) {
        var index = getIndexByProp(list, val, prop);
        if (typeof index !== 'undefined') {
            return list[index].c;
        }
    }

});