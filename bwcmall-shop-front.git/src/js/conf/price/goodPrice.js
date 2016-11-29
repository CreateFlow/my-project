'use strict';

define(function(require, exports, module) {
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
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require('oniui/dropdownlist/avalon.dropdownlist');
    require("oniui/loading/avalon.loading");

    avalon.ready(function() {
        var vm = avalon.define({
            $id: "goodPrice",
            goodPriceList: [],
            goodPriceItemList: [],
            editDlgData: {
                goodsName: '',
                price: ''
            },
            brandList: [],
            brandRawList: [],
            showLoading: true,
            tackList: [],
            orderListEmptyText: '查询结果为空',
            confirmReceivedMsg: '',
            selectBrandId: '',
            searchData: {
                goodsId: '',
                goodsName: '',
                brandId: ''
            },
            $brandListOption: {
                data: [{ value: '', label: "全部 / ALL" }],
                getRealTimeData: function(search, dropdownlist) {
                    setTimeout(function() {
                        var listData = [];
                        var keyWords = search.toLowerCase();
                        for (var i = 0; i < vm.brandRawList.length; i++) {
                            if ((vm.brandRawList[i].name.indexOf(search) >= 0) || (vm.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                var item = {
                                    value: vm.brandRawList[i].id,
                                    label: vm.brandRawList[i].name + "/" + vm.brandRawList[i].nameEn
                                }
                                listData.push(item);
                                if (100 < listData.length) {
                                    break;
                                }
                            }
                        }

                        if (listData.length <= 0) {
                            listData.push({ value: "", label: "无相关品牌" });
                        } else {
                            listData.splice(0, 0, { value: '', label: "全部 / ALL" })
                        }
                        dropdownlist.render(listData);
                    }, 100)
                },
                realTimeData: true
            },
            editPrice: function(index) {
                vm.goodPriceItemList = []
                vm.editDlgData.goodsName = vm.goodPriceList[index].goodsName
                vm.editDlgData.price = vm.goodPriceList[index].salePrice
                var currentEditData = vm.goodPriceList[index].strategyPriceVOList
                for (var i = 0; i < currentEditData.length; i++) {
                    var temp = $.extend({}, currentEditData[i])
                    currentEditData[i].id && (temp.id = currentEditData[i].id)
                    temp.tackname = vm.tackList[i].name
                    temp.discount = (temp.strategyPrice / vm.goodPriceList[index].salePrice).toFixed(2)
                    temp.price = vm.goodPriceList[index].salePrice
                    vm.goodPriceItemList.push(temp)
                }
                avalon.vmodels['dlgEditPriceId'].toggle = true;
            },
            dlgEditPriceOption: {
                type: 'confirm',
                title: '编辑价格',
                confirmName: '保存',
                width: 600,
                draggable: true,
                onConfirm: function() {
                    for (var i = 0; i < vm.goodPriceItemList.length; i++) {
                        delete vm.goodPriceItemList[i].price
                        delete vm.goodPriceItemList[i].discount
                        delete vm.goodPriceItemList[i].tackname
                    }
                    request.PATCH(API.updateShopGoodsStrategy, {
                        strategyPriceVOList: vm.goodPriceItemList
                    }, function(responseData) {
                        if (responseData.success) {
                            vm.getList(vm.searchData, vm.pPage)
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        } else {
                            alert(responseData.message);
                        }
                    })
                }
            },
            opts: {
                type: 'alert',
                title: '提示',
                width: 485
            },
            ckShowInfo: function(id, msg) {
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            pager: {
                currentPage: 1,
                totalItems: 10,
                perPages: 10,
                showJumper: true,
                onJump: function(e, data) {
                    var a = vm.searchData;
                    vm.getList(a, data._currentPage)
                }
            },
            $skipArray: ["pager"],
            pperPages: 10,
            pPage: 1,
            importTemplate: function() {

            },
            exportTemplate: function() {

            },
            getList: function(searchData, page) {
                vm.showLoading = true
                vm.goodPriceList = []
                request.GET(API.shopGoodsStrategyList + '?per_page=10&page=' + page
                    + '&goodsId=' + searchData.goodsId
                    + '&goodsName_contains=' + searchData.goodsName
                    + '&brandId=' + searchData.brandId,
                    function(responseData) {
                        vm.showLoading = false;
                        if (responseData.success) {
                            vm.goodPriceList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            avalon.scan(document.body, vm);
                        } else {
                            alert(responseData.message);
                        }
                    });
            },
            getTacks: function() {
                request.GET(API.strategyList, function(responseData) {
                    vm.tackList = responseData.result;
                });
            },
            doSearch: function() {
                vm.getList(vm.searchData, 1)
            },
            priceChange: function(el) {
                var discount = (el.strategyPrice / el.price).toFixed(2)
                el.discount = discount
            },
            discountChange: function(el) {
                var price = (el.discount * el.price).toFixed(2)
                el.strategyPrice = price
            },
            onKeyup: function(event) {
                if (event.keyCode === 13) {
                    vm.doSearch()
                }
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

        vm.$watch("selectBrandId", function(newValue) {
            vm.searchData.brandId = newValue;
            vm.doSearch()
        });

        !function init() {
            vm.getTacks()
            vm.getList(vm.searchData, 1)
            request.GET(API.brandSimpleData, { per_page: 10000 }, function(responseData) {
                for (var i = 0; i < responseData.result.length; i++) {
                    responseData.result[i].lowercaseEn = responseData.result[i].nameEn.toLowerCase();
                }
                vm.brandRawList = responseData.result;
                vm.brandList = vm.brandRawList.slice(1, 100);

                //初始化品牌下拉列表
                var search = ''
                var listData = []
                var keyWords = search.toLowerCase();
                for (var i = 0; i < vm.brandRawList.length; i++) {
                    if ((vm.brandRawList[i].name.indexOf(search) >= 0) || (vm.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                        var item = {
                            value: vm.brandRawList[i].id,
                            label: vm.brandRawList[i].name + "/" + vm.brandRawList[i].nameEn
                        }
                        listData.push(item);
                        if (100 < listData.length) {
                            break;
                        }
                    }
                }
                if (listData.length <= 0) {
                    listData.push({ value: "", label: "无相关品牌" });
                } else {
                    listData.splice(0, 0, { value: '', label: '全部' })
                }
                avalon.vmodels.brandListId.render(listData)
                //end

                avalon.scan();
            });
        } ()

        avalon.scan(document.body, vm);
    });
});