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
    require('oniui/dropdownlist/avalon.dropdownlist');
    require("oniui/loading/avalon.loading");
    require("oniui/validation/avalon.validation");
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

    avalon.ready(function() {
        var vm = avalon.define({
            $id: "addGoods",
            reset: function() {
                validationVM && validationVM.resetAll()
            },
            validation: {
                onInit: function(v) {
                    validationVM = v
                },
                onReset: function(e, data) {
                    data.valueResetor && data.valueResetor()
                    avalon(this).removeClass("error success")
                    removeError(this)
                },
                onError: function(reasons) {
                    reasons.forEach(function(reason) {
                        avalon(this).removeClass("success").addClass("error")
                        showError(this, reason)
                    }, this)
                },
                onSuccess: function() {
                    avalon(this).removeClass("error").addClass("success")
                    removeError(this)
                },
                onValidateAll: function(reasons) {
                    reasons.forEach(function(reason) {
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
            },
            loading: {},
            showLoading: true,
            afterSaleType: [],
            cancelReasonType: [],
            orderStatus: [],
            paymentStatus: [],
            afterSaleOrderList: [],
            orderListEmptyText: '查询结果为空',
            confirmReceivedMsg: 'ok',
            cancelReason: {},
            spuResult: [],
            spuResultNav: {},
            newData: {
                categorys: '',
                spuKeyword: '',
                brand: '',
                name: '',
                brandName: '',
                optionsAttr: '1',
                spuAttrKeyword: ''
            },
            selectAttr: {},
            spuInfo: {},
            spuId: '',
            isExistSpu: false,
            skuInfo: {},
            brandList: [],
            searchBrandList: [],
            spuAttrList: [],
            addbrandData: {
                name: '',
                nameEn: '',
                firstLetter: '',
                homeNavLogoId: '',
                brandListLogoId: '',
                productDefLogoId: '',
                spuCategorys: '',
                orientate: '1',
                enableStatus: '1'
            },
            addbrandDataError: '',
            categoryAry: { 1: [], 2: [], 3: [], 4: [] },
            selectedRow: { 1: -1, 2: -1, 3: -1, 4: -1, 5: -1 },
            spuNo: '',
            optionsAttr: '1',
            showLevel2: false,
            showLevel3: false,
            showLevel4: false,
            step1: true,
            step2: false,
            step3: false,
            categoryData: '',
            categoryName: '',
            categoryName1: '',
            categoryName2: '',
            categoryName3: '',
            categoryName4: '',
            categoryNameID: '',
            categoryNameX: [],
            formData: {},
            spuDetail: [],
            spuDetailSon: {},
            orientateS: {},
            uploadBusy: false,
            isSelectSpu: false,
            selectBrandId: -1,
            searchAttrKeyword: null,
            searchSpu: function(pageNum) {
                console.log(pageNum)
                if (typeof pageNum != 'number') {
                    var pageNum = 1;
                }
                var keyword = vm.newData.spuKeyword || '';
                request.GET(API.spu + '?per_page=10&page=' + pageNum + '&keyword=' + keyword, function(responseData) {
                    if (responseData.success) {
                        vm.spuResult = responseData.result;
                        vm.spuResultNav = responseData.result_info
                        $("#spu-list").show();
                        avalon.scan(document.body, vm);
                    } else {
                        vm.ckShowInfo('dlgAfterAlert', responseData.message);
                    }
                });
            },

            getSpuItem: function(id) {
                vm.spuId = id;
                request.GET(API.spu + '/' + id, function(responseData) {
                    if (responseData.success) {
                        vm.spuInfo = responseData.result;
                        vm.isExistSpu = true;
                        var spu = vm.spuInfo;
                        vm.newData.name = spu.name;
                        vm.newData.spuKeyword = spu.brand.name + '-' + spu.name;
                        vm.newData.categorys = spu.categorys[0].pathName + " > " + spu.categorys[0].name;
                        vm.selectBrandId = spu.brand.id;
                        var attributes = spu.spuAttributes;
                        if (spu.spuNo) {
                            vm.isSelectSpu = true;
                        }

                        vm.spuDetail = attributes;
                        avalon.scan(document.body, vm);
                    } else {
                        vm.ckShowInfo('dlgAfterAlert', responseData.message);
                    }
                });
            },

            searchSpuAttr: function() {
                var search = vm.newData.spuAttrKeyword || '';
                if(vm.searchAttrKeyword != search) {
                    vm.searchAttrKeyword = search;
                    request.GET(API.spuAttr + "?attributeName__contains=" + search, function(responseData) {
                        if (responseData.success) {
                            var temp = responseData.result
                            for (var i = 0; i < temp.length; i++) {
                                var item = temp[i];
                                item.value = item.id
                                item.label = item.name
                            }
                        }
                        vm.spuAttrList = temp;
                        $("#spuAttr-list").show();
                    })
                }
            },

            getSpuAttrItem: function(item) {
                vm.selectAttr = item;
                vm.newData.spuAttrKeyword = item.name;
            },

            ckShowInfo: function(id, msg) {
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },

            $skipArray: ["loading", "dropdownlist"],
            //一级分类点击处理
            ckLiCategory1: function(item, index) {
                vm.categoryData = item;
                vm.categoryName1 = item.name;
                vm.categoryName = vm.categoryName1

                //获取分类数据
                vm.getCategorys(item.id, 2);

                //设置被点击分类的样式
                vm.selectedRow[1] = index;

                //清除被点击分类的样式
                vm.selectedRow[2] = -1;
                vm.selectedRow[3] = -1;
                vm.selectedRow[4] = -1;
                vm.showLevel2 = true;
                vm.showLevel3 = false;
                vm.showLevel4 = false;
            },

            //二级分类点击处理
            ckLiCategory2: function(item, index) {
                vm.categoryData = item;
                vm.categoryName2 = item.name;
                vm.categoryName = vm.categoryName1 + " > " + vm.categoryName2

                //获取分类数据
                vm.getCategorys(item.id, 3);

                //设置被点击分类的样式
                vm.selectedRow[2] = index;

                //清除被点击分类的样式
                vm.selectedRow[3] = -1;
                vm.selectedRow[4] = -1;
                vm.showLevel3 = true;
                vm.showLevel4 = false;
            },

            //三级分类点击处理
            ckLiCategory3: function(item, index) {
                vm.categoryData = item;
                vm.categoryName3 = item.name;
                vm.categoryName = vm.categoryName1 + " > " + vm.categoryName2 + " > " + vm.categoryName3;

                //获取分类数据
                vm.getCategorys(item.id, 4);

                //设置被点击分类的样式 显示分类
                vm.selectedRow[3] = index;
                vm.selectedRow[4] = -1;
                vm.showLevel4 = true;
            },

            //四级分类点击处理
            ckLiCategory4: function(item, index) {
                vm.categoryData = item;
                vm.categoryName4 = item.name;
                vm.categoryNameID = item.id;
                vm.categoryName = vm.categoryName1 + " > " + vm.categoryName2 + " > " + vm.categoryName3;
                //设置被点击分类的样式
                vm.selectedRow[4] = index;
                vm.selectedRow[5] = -1;
                var tt = 0;
                var temp = { id: vm.categoryNameID, pathName: vm.categoryName, name: vm.categoryName4 };
                if (vm.categoryNameX) {
                    for (var i = vm.categoryNameX.length - 1; i >= 0; i--) {
                        if (vm.categoryNameX[i].id == temp.id) {
                            //alert('此项分类已被选择');
                            vm.selectedRow[5] = i;
                            var tt = 1;
                        };
                    };
                    if (tt != 1) {
                        vm.categoryNameX.push(temp);
                        tt = 0;
                    };
                } else {
                    vm.categoryNameX.push(temp);
                };
                console.log(vm.categoryNameX)
            },
            //根据parentId获取单个分类数据
            getCategorys: function(parentId, level) {
                request.GET(API.goodsType + "?parentId=" + parentId, function(responseData) {
                    if (responseData.success) {
                        vm.categoryAry[level] = responseData.result;
                        avalon.scan(document.body, vm);
                    }
                })
            },
            delCategory: function(index) {
                vm.categoryNameX.splice(index, 1);
                vm.selectedRow[5] = -1;
            },
            dropdownlist: {
                getRealTimeData: function(search, dropdownlist) {
                    var id = dropdownlist.$id
                    if (id == 'a') {
                        setTimeout(function() {


                        }, 100)
                    }

                },
                realTimeData: true
            },

            addAttr: function() {
                if (vm.isSelectSpu) {
                    return;
                }
                if (vm.selectAttr.name == undefined) {
                    alert("请选择属性名");
                    return;
                }
                var ct = 0;
                console.log(vm.selectAttr)
                if (vm.optionsAttr == 1) {
                    var spuDetailSon = {
                        "type": 0,
                        "typeShowName": "普通属性",
                        "attributeId": String(vm.selectAttr.id),
                        "mainStatus": '0',
                        "attribute": {
                            "name": vm.selectAttr.name
                        }
                    };
                } else if (vm.optionsAttr == 2) {
                    var spuDetailSon = {
                        "type": 1,
                        "typeShowName": "关键属性",
                        "attributeId": String(vm.selectAttr.id),
                        "mainStatus": '0',
                        "attribute": {
                            "name": vm.selectAttr.name
                        }

                    };
                } else if (vm.optionsAttr == 3) {
                    var spuDetailSon = {
                        "type": 1,
                        "typeShowName": "主属性",
                        "attributeId": String(vm.selectAttr.id),
                        "mainStatus": '1',
                        "attribute": {
                            "name": vm.selectAttr.name
                        }
                    };
                };

                if (vm.spuDetail) {
                    for (var i = vm.spuDetail.length - 1; i >= 0; i--) {
                        if (vm.spuDetail[i].attributeId == spuDetailSon.attributeId) {

                            vm.ckShowInfo('dlgAfterAlert', "此属性名已被选择");
                            ct = 1;
                            return;
                        };
                        if (spuDetailSon.mainStatus == 1) {
                            if (vm.spuDetail[i].mainStatus == 1) {
                                vm.ckShowInfo('dlgAfterAlert', "一个SPU最多只能增加1个‘主要属性’");
                                ct = 1;
                                return;
                            };
                        };

                    };
                    if (ct != 1) {
                        vm.spuDetail.push(spuDetailSon);
                        ct = 0;
                    };
                } else {
                    vm.spuDetail.push(spuDetailSon);
                };
            },

            delAttr: function(index) {
                vm.spuDetail.splice(index, 1)
            },

            step1OK: function() {
                if (vm.isSelectSpu) {
                    location.href = 'add-step-sku.html?spuId=' + vm.spuId;
                    return;
                }
                if(vm.categoryNameX.length<=0) {
                    vm.ckShowInfo('dlgAfterAlert', "请选分类， 并且选择到四级分类。");
                    return false;       
                }
                var postData = {}

                postData.categorys = [];
                postData.spuAttributes = [];
                postData.brandId = vm.selectBrandId;
                postData.name = vm.newData.name;
                //postData.unit = vm.formData.unitM.value;
                for (var i = vm.categoryNameX.length - 1; i >= 0; i--) {
                    var tmp = { id: vm.categoryNameX[i].id };
                    postData.categorys.push(tmp);

                };
                for (var i = vm.spuDetail.length - 1; i >= 0; i--) {
                    var tmp2 = {
                        id: vm.spuDetail[i].id,
                        attributeId: vm.spuDetail[i].attributeId,
                        type: vm.spuDetail[i].type,
                        mainStatus: vm.spuDetail[i].mainStatus,
                        defaultValue: vm.spuDetail[i].mainStatus
                    };
                    postData.spuAttributes.push(tmp2);
                };
                postData.introduction = vm.introduction;

                if (!postData.brandId || postData.brandId<0) {
                    vm.ckShowInfo('dlgAfterAlert', "品牌不能为空");
                    return false;
                };

                postData.nameEn = '';
                postData.remarks = '';
                postData.sales = '';
                request.POST(API.spu, postData, function(responseData) {
                    if (responseData.success) {
                        location.href = 'add-step-sku.html?spuId=' + (responseData.result.id || '');
                    } else {
                        alert(responseData.message);
                    }
                });

            }
        });

        vm.$watch("selectBrandId", function(newValue) {
            vm.selectBrandId = newValue;
        });

        (function init() {
            request.GET(API.brandSimpleData, {per_page: 10000 }, function(responseData) {
                if (responseData.success) {
                    var brandData = [];
                    responseData.result.forEach(function(item, index) {
                        var item = { value: item.id, label: item.name + ' / ' + item.nameEn };
                        brandData.push(item)
                    });
                    avalon.vmodels.brandListId.render(brandData);
                    avalon.vmodels.brandListId.placeholder = "选择品牌";
                    vm.showLoading = false;
  
                    avalon.scan(document.body, vm);
                }

            });

            //获取单位字典
            request.GET(API.dict + "/" + "UNIT" + "/item?per_page=200", function(responseData) {
                vm.unitS = responseData.result;
                avalon.scan(document.body, vm);
            });

            //品牌定位
            var url = API.dict.replace('{index}', 'BRAND_ORIENTATE')
            request.GET(url, function(responseData) {
                if (responseData.success) {
                    vm.orientateS = responseData.result;
                    avalon.scan(document.body, vm);
                }
            });

            //获取初始值 一级分类
            request.GET(API.goodsType + "?grade=1", function(responseData) {
                if (responseData.success) {
                    vm.categoryAry[1] = responseData.result;
                    avalon.scan(document.body, vm);
                }
            });

        }());

        $(document).on('click', function(e) {
            if ($(e.target).parent().hasClass('dropdown') || $(e.target).parent().hasClass('dropdown-nav')) {
                e.preventDefault();
                return;
            }
            if ($("#brand-list").css('display') == 'block') {
                $("#brand-list").hide()
            } else if ($("#spuAttr-list").css('display') == 'block') {
                $("#spuAttr-list").hide()
            } else if ($("#spu-list").css('display') == 'block') {
                $("#spu-list").hide()
            }
        })

        avalon.scan(document.body, vm);
    });
});
