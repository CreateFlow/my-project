'use strict';

define(function (require, exports, module) {
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

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "tack",
            dlgType: '',
            tackData: {
                id: '',
                name: '',
                sort: 0,
            },
            tackList: [],
            confirmReceivedMsg: '',
            showAddTackDlg: function (msg) {
                vm.dlgType = 'add'
                vm.tackData.id = ''
                vm.tackData.name = ''
                vm.tackData.sort = 0
                avalon.vmodels['dlgAddTackId'].setTitle('新增定价策略')
                avalon.vmodels['dlgAddTackId'].toggle = true;
            },
            dlgAddTackOption: {
                type: 'confirm',
                title: '',
                confirmName: '确认',
                draggable: true,
                onConfirm: function () {
                    if (vm.tackData.name) {
                        if (vm.dlgType == 'add') {
                            vm.addTack(vm.tackData)
                        } else if (vm.dlgType == 'edit') {
                            vm.editTack(vm.tackData)
                        } else {
                            return false
                        }
                        return true
                    }
                    return false
                }
            },
            ckShowInfo: function (id, msg) {
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            getList: function () {
                request.GET(API.strategyList, function (responseData) {
                    vm.tackList = responseData.result;
                });
            },
            addTack: function (tackData) {
                request.POST(API.createStrategy, tackData, function (responseData) {
                    vm.getList()
                });
            },
            editTackDlg: function (el) {
                avalon.vmodels['dlgAddTackId'].setTitle('编辑定价策略')
                vm.dlgType = 'edit'
                vm.tackData.id = el.id
                vm.tackData.name = el.name
                vm.tackData.sort = el.sort
                avalon.vmodels['dlgAddTackId'].toggle = true;
            },
            editTack: function (tackData) {
                request.PATCH(API.updateStrategy, tackData, function (responseData) {
                    vm.getList()
                });
            },
            delTack: function (id) {
                vm.dlgInfo.id = id;
                var msg = '是否删除该条策略？（这会导致这条策略相关联的价格和会员失效）'
                vm.ckShowInfo('dlgConfirmEnable', msg);
            },
            dlgInfo: {
                id: ''
            },
            opts1: {
                type: 'confirm',
                title: '确认',
                width: 400,
                onConfirm: function () {
                    request.DELETE(API.removeStrategy.replace('{strategyId}', vm.dlgInfo.id), function (responseData) {
                        vm.getList()
                    });
                }
            },
        });


        !function init() {
            vm.getList()
        } ()

        avalon.scan(document.body, vm);
    });
});