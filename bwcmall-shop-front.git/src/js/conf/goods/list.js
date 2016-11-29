'use strict';

define(function (require, exports, module) {
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
    require("oniui/loading/avalon.loading");
    require("oniui/validation/avalon.validation");
    require('oniui/dropdownlist/avalon.dropdownlist');

    var validationVM

    function showError(el, data) {
        var next = el.nextSibling
        if (!(next && next.className === "error-tip")) {
            next = document.createElement("div")
            next.className = "error-tip"
            el.parentNode.appendChild(next)
        }
        next.innerHTML = data.getMessage()
    }

    function removeError(el) {
        var next = el.nextSibling
        if (next && next.className === "error-tip") {
            el.parentNode.removeChild(next)
        }
    }

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "goodsList",
            opts1: {
                type: 'confirm',
                title: '取消订单',
                width: 485,
                onOpen: function () {

                },
                onConfirm: function () {
                    var el = vm.dlgInfo.selectedOrder;
                    var cancelReason = vm.cancelReason;
                    validationVM.validateAll();
                    if (!cancelReason.option) {
                        return false;
                    }
                    request.PATCH(API.cancelOrder.replace('{orderId}', el.orderId), {
                        cancelReasonType: cancelReason.option,
                        cancelReason: cancelReason.reason
                    }, function (responseData) {
                        var result = {
                            success: responseData.success,
                            message: responseData.message,
                            order: el
                        }
                        if (responseData.success) {
                            urls.goRef('/orderdetail/order-canceled-result.html');
                        } else {
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        }
                        session.set('orderCancelResult', result);

                    });
                },
                onClose: function () {

                }
            },
            reset: function () {
                validationVM && validationVM.resetAll()
            },
            validation: {
                onInit: function (v) {
                    validationVM = v
                },
                onReset: function (e, data) {
                    data.valueResetor && data.valueResetor()
                    avalon(this).removeClass("error success")
                    removeError(this)
                },
                onError: function (reasons) {
                    reasons.forEach(function (reason) {
                        avalon(this).removeClass("success").addClass("error")
                        showError(this, reason)
                    }, this)
                },
                onSuccess: function () {
                    avalon(this).removeClass("error").addClass("success")
                    removeError(this)
                },
                onValidateAll: function (reasons) {
                    reasons.forEach(function (reason) {
                        avalon(reason.element).removeClass("success").addClass("error")
                        showError(reason.element, reason)
                    })
                    if (reasons.length === 0) {
                        avalon.log("全部验证成功！")
                    }
                }
            },
            opts2: {
                type: 'alert',
                title: '提示',
                width: 485
            },
            dlgInfo: {
                selectedOrder: {}
            },
            $brandListOption: {
                data: [{ value: -1, label: "全部 / ALL" }],
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
            loading: {},
            showLoading: true,
            afterSaleType: [],
            cancelReasonType: [],
            orderStatus: [],
            paymentStatus: [],
            brandList: [],
            brandRawList: [],
            goodsList: [],
            orderListEmptyText: '查询结果为空',
            confirmReceivedMsg: 'ok',
            cancelReason: {},
            selectBrandId: -1,
            searchInfo: {
                brandId: -1,
                keyword__contains: '',
                marketStatus: -1,
                soldOutStatus: -1,
                goodsStatus: -1
            },
            selected: [],
            select_all: 0,
            goodsStatistics: {
                "marketDateCount": 0,
                "marketSalableCount": 0,
                "marketSuspendedSalesCount": 0,
                "marketToBeSaleCount": 0,
                "tempGoodsCount": 0,
                "onlineGoodsCount": 0,
                "pendingOnlineGoodsCount": 0,
                "soldOutNormalCount": 0,
                "soldOutSoldOutCount": 0
            },
            select_all_cb: function () {
                var list = vm.goodsList,
                    selected = vm.selected;
                if (this.checked) {
                    avalon.each(list, function (i, v) { //循环保存着已经勾选选框的数据
                        selected.ensure(v['goodsId']); //如果里面没有当前选框的数据，就保存
                        console.log(selected)
                    });
                } else {
                    selected.clear(); //清空
                }
            },
            setSearchInfo: function () {
                var urlParams = ''
                for (var key in vm.searchInfo) {
                    if (vm.searchInfo.hasOwnProperty(key)) {
                        var value = vm.searchInfo[key]
                        if (value !== '' && value != -1) {
                            urlParams += '&' + key + '=' + value
                        }
                    }

                }
                return urlParams;
            },
            ckSearchList: function () {
                var a = vm.searchInfo;
                var urlParams = vm.setSearchInfo();
                var url = API.goods + '?per_page=10&page=1' + urlParams

                request.GET(url, function (responseData) {
                    if (responseData.success) {
                        vm.goodsList = responseData.result;
                        vm.pperPages = responseData.result_info.total_count;
                        vm.pPage = responseData.result_info.page;
                        avalon.scan(document.body, vm);
                    } else {
                        vm.ckShowInfo('dlgAfterAlert', responseData.message);
                        console.log(responseData.message);
                    }
                });
            },
            onKeyup: function (event) {
                if (event.keyCode === 13) {
                    vm.ckSearchList();
                }
            },
            ckShowInfo: function (id, msg) {
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmCancel: function (el) {
                vm.dlgInfo.selectedOrder = el;
                vm.ckShowInfo('dlgConfirmCancelOrder', '确认取消!');
            },
            goOrderDetail: function (el) {
                urls.goRef('/orderdetail/order-detail.html?sn=' + el.orderSn + '&id=' + el.orderId)
            },
            pager: {
                currentPage: 1,
                totalItems: 10,
                perPages: 10,
                showJumper: true,
                onJump: function (e, data) {
                    var a = vm.searchInfo;
                    vm.showLoading = true;
                    var urlParams = vm.setSearchInfo();
                    var url = API.goods + '?per_page=10&&page=' + data._currentPage + urlParams
                    request.GET(url, function (responseData) {
                        vm.showLoading = false;
                        if (responseData.success) {
                            vm.goodsList = responseData.result;
                            vm.pperPages = responseData.result_info.total_count;
                            vm.pPage = responseData.result_info.page;
                            avalon.scan(document.body, vm);
                        } else {
                            vm.ckShowInfo('dlgAfterAlert', responseData.message);
                            console.log(responseData.message);
                        }
                    });
                }
            },
            $skipArray: ["pager", "loading"],
            pperPages: 10,
            pPage: 1,
            batchProcess: function (url, successMsg, errormsg) {
                var goodsIds = { "ids": vm.selected };
                if (0 < goodsIds.ids.length) {
                    request.POST(url, goodsIds, function (responseData) {
                        if (responseData.success) {
                            alert(successMsg);
                        } else {
                            alert(errormsg);
                        }
                        vm.selected = [];
                        //刷新列表
                        vm.ckSearchList()
                    });
                } else {
                    alert('请先选中商品!');
                }
            },
            //批量上架
            batchOnShelf: function () {
                vm.batchProcess(API.goodsOnShelf, '完成批量上架!', '批量上架失败!');
            },

            //批量下架
            batchOffShelf: function () {
                vm.batchProcess(API.goodsOffShelf, '完成批量下架!', '批量下架失败!');
            },

            //批量改为待询价
            batchPendingPrice: function () {
                vm.batchProcess(API.goodsPendingPrice, '完成批量改为待询价!', '批量改为待询价失败!');
            },

            //批量有货
            batchSoldIn: function () {
                vm.batchProcess(API.goodsSoldIn, '完成批量改有货!', '批量改为有货失败!');
            },

            //批量售罄
            batchSoldOut: function () {
                vm.batchProcess(API.goodsSoldOut, '完成批量改售罄!', '批量改为售罄失败!');
            },

            //导出Excel
            exportExcel: function () {
                vm.showLoading = true;
                var data = vm.setSearchInfo();

                var form = $('<form id="cateForm"></form>').attr("style", 'display:none')
                    .attr("action", API.exportGoodsList)
                    .attr("method", "GET");

                form.append('<input type="text" name="token" value="' + session.getCurrentUser().authToken + '">');
                if (vm.searchInfo.keyword__contains != '') {
                    form.append('<input type="text" name="keyword__contains" value="' + vm.searchInfo.keyword__contains + '">');
                }
                if (vm.searchInfo.brandId != -1) {
                    form.append('<input type="text" name="brandId" value="' + vm.searchInfo.brandId + '">');
                }
                if (vm.searchInfo.marketStatus != -1) {
                    form.append('<input type="text" name="marketStatus" value="' + vm.searchInfo.marketStatus + '">');
                }
                if (vm.searchInfo.soldOutStatus != -1) {
                    form.append('<input type="text" name="soldOutStatus" value="' + vm.searchInfo.soldOutStatus + '">');
                }
                if (vm.searchInfo.goodsStatus != -1) {
                    form.append('<input type="text" name="goodsStatus" value="' + vm.searchInfo.goodsStatus + '">');
                }

                form.append('<input type="text" name="per_page" value="5000">');
                form.append('<input type="text" name="page" value="1">');
                form.appendTo('body');
                form.submit();
                form.remove();
                vm.showLoading = false;
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

        vm.selected.$watch('length', function (after) { //监听保存数据数组的变化
            var len = vm.goodsList.length;
            if (after == len) {
                vm.select_all = 1;
            } else {
                vm.select_all = 0;
            }
            avalon.scan(document.body, vm);
        });

        vm.searchInfo.$watch('[marketStatus,soldOutStatus,goodsStatus]', function (after) {
            vm.ckSearchList();
            avalon.scan(document.body, vm);
        });

        vm.$watch("selectBrandId", function (newValue) {
            vm.searchInfo.brandId = newValue;
            vm.ckSearchList();
        });

        (function init() {

            request.GET(API.goodsMarketStatus, function (responseData) {
                vm.goodsStatus = [{ key: -1, value: "全部" }];
                vm.goodsStatus = vm.goodsStatus.concat(responseData.result);
                avalon.scan(document.body, vm);
            });
            request.GET(API.goodsSoldoutStatus, function (responseData) {
                vm.saleStatus = [{ key: -1, value: "全部" }];
                vm.saleStatus = vm.saleStatus.concat(responseData.result);
                avalon.scan(document.body, vm);
            });

            request.GET(API.goods + '?per_page=10&page=1', function (responseData) {
                vm.showLoading = false;
                if (responseData.success) {
                    vm.goodsList = responseData.result;
                    vm.pperPages = responseData.result_info.total_count;
                    avalon.scan(document.body, vm);
                }
            });

            request.GET(API.goodsStatistics, function (responseData) {
                if (responseData.success) {
                    vm.goodsStatistics = responseData.result;
                    avalon.scan(document.body, vm);
                }
            });

            // request.GET(API.brandSimpleData, { per_page: 100 }, function (responseData) {
            //     var brandData = [];
            //     responseData.result.unshift({ id: -1, name: "全部", nameEn: "ALL" });
            //     responseData.result.forEach(function (item, index) {
            //         var item = { value: item.id, label: item.name + ' / ' + item.nameEn };
            //         brandData.push(item)
            //     });
            //     avalon.vmodels.brandListId.render(brandData);
            //     avalon.vmodels.brandListId.placeholder = "选择品牌";
            //     avalon.scan(document.body, vm);
            // });
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

        } ());



        avalon.scan(document.body, vm);
    });
});
