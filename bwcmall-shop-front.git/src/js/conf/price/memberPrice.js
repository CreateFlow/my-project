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
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require('oniui/dropdownlist/avalon.dropdownlist');
    require('oniui/pager/avalon.pager');
    require('oniui/textbox/avalon.textbox');


    avalon.ready(function () {
        var vm = avalon.define({
            $id: "memberPrice",
            searchInfo: {
                customerName: ''
            },
            brandId: '',
            customerList: [],
            T: '',
            brandList: [],
            shopBrandList: [],
            confirmReceivedMsg: '',
            memberList: [],
            currentEditData: {
                tackId: '',
                tackName: '',
                brandId: '',
                brandName: ''
            },
            $brandListOption: {
                data: [{ value: '', label: "全部 / ALL" }],
                getRealTimeData: function (search, dropdownlist) {
                    setTimeout(function () {
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
            orderListEmptyText: '查询结果为空',
            edit: function (el) {
                vm.currentEditData.tackId = el.strategyId
                vm.currentEditData.tackName = el.strategyName
                vm.currentEditData.brandId = el.brandId
                vm.getCustomList(vm.currentEditData.brandId, vm.currentEditData.tackId)
                avalon.vmodels['dlgEditId'].toggle = true;
            },
            dlgEditOption: {
                type: 'confirm',
                title: '客户添加',
                confirmName: '确定',
                width: 800,
                draggable: true,
                onOpen: function () {
                    $('.doubleList-list li').removeClass('active')
                    doubleListEventInit()
                },
                onConfirm: function () {

                },
                onClose: function () {
                    console.log(vm.pPage1)
                    vm.getList(vm.brandId, vm.pPage)
                    vm.memberList = []
                }
            },
            addToMember: function () {
                var activeElements = $('.doubleList-list.customer li.active')
                var customIds = []
                activeElements.each(function (index, item) {
                    customIds.push($(item).attr('custom-id'))
                })

                if (customIds.length > 0) {
                    request.POST(API.createStrategyCust, {
                        customerId: customIds[0],
                        strategyId: vm.currentEditData.tackId,
                        brandId: vm.currentEditData.brandId
                    }, function (responseData) {
                        if (responseData.success) {
                            vm.getCustomList(vm.currentEditData.brandId, vm.currentEditData.tackId)
                        } else {
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        }
                    });
                }

            },
            removeMember: function () {
                var activeElements = $('.doubleList-list.member li.active')
                request.DELETE(API.removeStrategyCust.replace('{strategyCustId}', activeElements.attr('member-id')), function (responseData) {
                    vm.getCustomList(vm.currentEditData.brandId, vm.currentEditData.tackId, 9999, 1, function () {
                        $('.doubleList-list.member li.active').removeClass('active')
                    })
                });
            },
            showCustomers: function (el) {
                vm.currentEditData.brandName = el.brandName
                vm.currentEditData.tackName = el.strategyName
                vm.currentEditData.tackId = el.strategyId
                vm.currentEditData.brandId = el.brandId
                vm.getCustomList(el.brandId, el.strategyId, 10, 1, function () {
                    avalon.vmodels['dlgShowCustomersId'].toggle = true;
                })
            },
            dlgShowCustomersOption: {
                type: 'alert',
                title: '客户列表',
                confirmName: '关闭',
                width: 700,
                draggable: true,
                onOpen: function () {

                },
                onConfirm: function () {

                }
            },
            opts: {
                type: 'alert',
                title: '提示',
                width: 485
            },
            ckShowInfo: function (id, msg) {
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            doCustomSearch: function (keyword) {
                clearTimeout(vm.T)
                vm.T = setTimeout(function () {
                    if (keyword) {
                        request.GET((API.accountCreditCustomer + '&per_page=10&page=1').replace('{keyword}', keyword), function (responseData) {
                            if (responseData.success) {
                                vm.customerList = responseData.result
                                doubleListEventInit()
                            } else {
                                console.log(responseData.message);
                            }
                        });
                    } else {
                        vm.customerList = []
                    }
                }, 500);
            },
            getList: function (brandId, page) {
                request.GET(API.shopBrandStrategyList + '?per_page=10&page=' + page
                    + '&brandId=' + brandId,
                    function (responseData) {
                        if (responseData.success) {
                            vm.shopBrandList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            avalon.scan(document.body, vm);
                        } else {
                            alert(responseData.message);
                        }
                    });
            },
            $skipArray: ["pager", "pager1"],
            pperPages: 10,
            pPage: 1,

            pperPages1: 10,
            pPage1: 1,
            pager: {
                currentPage: 1,
                totalItems: 10,
                perPages: 10,
                showJumper: true,
                onJump: function (e, data) {
                    vm.getList(vm.brandId, data._currentPage)
                }
            },
            doSearch: function () {
                vm.getList(vm.brandId, 1)
            },
            option: {
                currentPage: 1,
                totalItems: 10,
                perPages: 10,
                showJumper: true,
                onJump: function (e, data) {
                    vm.getCustomList(vm.currentEditData.brandId, vm.currentEditData.tackId, 10, data._currentPage)
                }
            },
            getCustomList: function (brandId, strategyId, perPage, page, callback) {
                !perPage && (perPage = 9999)
                !page && (page = 1)
                request.GET(API.shopBrandStrategyCustList + '?per_page=' + perPage + '&page=' + page
                    + '&brandId=' + brandId
                    + '&strategyId=' + strategyId,
                    function (responseData) {
                        if (responseData.success) {
                            vm.memberList = responseData.result;
                            if (perPage == 10) {
                                vm.pperPages1 = responseData.result_info.total_count;
                                vm.pPage1 = responseData.result_info.page;
                            }
                            doubleListEventInit()
                            avalon.scan(document.body, vm);
                            callback && callback()
                        } else {
                            alert(responseData.message);
                        }
                    });
            }
        });

        vm.$watch("pperPages", function (a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.totalItems = a;
            }
        });

        vm.$watch("pPage", function (a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.currentPage = a;
            }
        });

        vm.$watch("pperPages1", function (a) {
            var widget = avalon.vmodels.pp1;
            if (widget) {
                widget.totalItems = a;
            }
        });

        vm.$watch("pPage1", function (a) {
            var widget = avalon.vmodels.pp1;
            if (widget) {
                widget.currentPage = a;
            }
        });

        vm.$watch("brandId", function (newValue) {
            vm.brandId = newValue;
            vm.doSearch()
        });

        function doubleListEventInit() {
            $('.doubleList-list li').unbind('click')
            $('.doubleList-list li').click(function () {
                $(this).siblings().removeClass('active')
                $(this).hasClass('active') ? $(this).removeClass('active') : $(this).addClass('active')
            })
        }

        !function init() {
            request.GET(API.brandSimpleData, { per_page: 10000 }, function (responseData) {
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

            vm.getList(vm.brandId, 1)

        } ()

        avalon.scan(document.body, vm);
    });
});