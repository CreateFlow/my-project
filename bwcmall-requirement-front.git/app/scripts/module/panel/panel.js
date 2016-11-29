require(['dialog/avalon.dialog', 'pager/avalon.pager', "dropdownlist/avalon.dropdownlist"], function (avalon) {
    avalon.ready(function () {
        var panelCtrl = avalon.define({
            $id: "panelCtrl",
            currentNavInfo: 'panel',
            dataList: [],
            categoryList: [],
            typeList: [],
            statusList: [],
            currentGoods: {},
            matchGoodsList: [],
            selectedGoodsList: [],
            reason: '',
            allstatus: false,
            message: '',
            unitList: [],
            unitMap: {},
            categoryList: [],
            batchMatch: false,
            selectedIndexs: [],
            init: function () {
                io.GET(apiConfig.requirement + '/workPanel', function (data) {
                    panelCtrl.dataList = data.result;
                });

                io.GET(apiConfig.rootUrl + 'category?grade=1', function (data) {
                    if (data.result) {
                        panelCtrl.categoryList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'dict/UNIT/item', { "per_page": 10000 }, function (data) {
                    if (data.result) {
                        panelCtrl.unitList = data.result;
                        for (var i = 0; i < panelCtrl.unitList.length; i++) {
                            panelCtrl.unitMap[panelCtrl.unitList[i].name] = panelCtrl.unitList[i].value + "";
                        }
                    }
                });
                io.GET(apiConfig.brand + '/simpleData', { per_page: 10000, page: 1 }, function (data) {
                    if (data.result) {
                        for (var i = 0; i < data.result.length; i++) {
                            data.result[i].lowercaseEn = data.result[i].nameEn.toLowerCase();
                        }
                        panelCtrl.brandRawList = data.result;
                    }
                });
            },
            checkout: function (id) {
                if (!panelCtrl.dataList[id].status) {
                    panelCtrl.dataList[id].status = true;
                    panelCtrl.allstatus = true;
                    for (var i = 0; i < panelCtrl.dataList.length; i++) {
                        if (!panelCtrl.dataList[i].status) {
                            panelCtrl.allstatus = false;
                        }
                    }
                } else {
                    panelCtrl.dataList[id].status = false;
                    panelCtrl.allstatus = false;
                };

            },
            //删除一行
            delProduct: function (index, id) {
                io.DELETE(apiConfig.requirement + '/workPanel/' + id, function (data) {
                    if (data.success) {
                        panelCtrl.dataList.removeAt(index);
                    } else {
                        panelCtrl.openAlert(data.message);
                    }

                });
            },
            checkall: function () {
                if (!panelCtrl.allstatus) {
                    panelCtrl.allstatus = true;
                    if (panelCtrl.dataList.length > 0) {
                        for (var i = 0; i < panelCtrl.dataList.length; i++) {
                            panelCtrl.dataList[i].status = true;
                        }
                    };

                } else {
                    panelCtrl.allstatus = false;
                    if (panelCtrl.dataList.length > 0) {
                        for (var i = 0; i < panelCtrl.dataList.length; i++) {
                            panelCtrl.dataList[i].status = false;
                        }
                    };
                };

            },
            $processDialogOption: {
                title: "商品处理",
                draggable: true,
                showClose: true,
                width: 1200,
                height: 600,
                isTop: true,
                zIndex: 100,
            },
            pager: {
                perPages: 5,
                onJump: function (e, data) {
                    var searchData = panelCtrl.getQueryParam(panelCtrl.currentGoods, data._currentPage);
                    io.GET(apiConfig.requirement + '/match', searchData, function (data) {
                        if (data.success) {
                            panelCtrl.matchGoodsList = data.result;
                            if (panelCtrl.matchGoodsList.length > 0) {
                                avalon.vmodels.matchGoddsListPager.totalItems = data.result_info.total_count;
                                avalon.vmodels.matchGoddsListPager.currentPage = data.result_info.page;
                            }
                            avalon.scan();
                        }
                    });
                }
            },
            clearPanel: function () {
                panelCtrl.openYesNoAlert("是否清空面板？", function () {
                    io.DELETE(apiConfig.requirement + '/workPanel/All', function (data) {
                        if (data.success) {
                            panelCtrl.dataList = [];
                        } else {
                            panelCtrl.openAlert(data.message);
                        }

                    });
                });
            },
            processMatch: function (index, batch) {
                panelCtrl.batchMatch = batch;
                panelCtrl.selectedIndexs = [];
                panelCtrl.reason = '';
                if (batch) {
                    for (var i = 0; i < panelCtrl.dataList.length; i++) {
                        if (panelCtrl.dataList[i].status) {
                            panelCtrl.selectedIndexs.push(i)
                        }
                    }
                } else {
                    if (panelCtrl.dataList.length > index) {
                        panelCtrl.selectedIndexs.push(index);
                    }
                }
                if (panelCtrl.selectedIndexs.length <= 0) {
                    panelCtrl.openAlert("请选择要处理的商品。");
                    return;
                }
                panelCtrl.processMatchByItem(0, panelCtrl.dataList[panelCtrl.selectedIndexs[0]]);
            },
            processMatchByItem: function (selectedIndex, item) {
                panelCtrl.matchGoodsList = [];
                panelCtrl.selectedGoodsList = [];
                panelCtrl.currentGoods = {
                    selectedIndex: selectedIndex,
                    id: item.id,
                    brandName: item.brandName,
                    itemName: item.itemName,
                    skuSnSet: item.skuSnSet,
                    requiredQuantity: item.requiredQuantity,
                    unit: item.unit,
                    category: item.category
                };

                panelCtrl.matchGoods(panelCtrl.currentGoods);
                panelCtrl.getOfferList(panelCtrl.currentGoods);
                avalon.vmodels['processDialogId'].toggle = true;
            },
            getQueryParam: function (item, curPage) {
                var searchData = {};
                searchData.page = curPage;
                searchData.per_page = 5;
                searchData.brandName_contains = item.brandName;
                searchData.goodsName_contains = item.itemName;
                searchData.sn_contains = item.skuSnSet;
                return searchData;
            },
            getOfferList: function (item) {
                //获取已经匹配过的数据
                io.GET(apiConfig.rootUrl + 'requirement/item/' + item.id, function (data) {
                    if (data.success) {
                        if (data.result.itemDetail.itemOfferList) {
                            panelCtrl.selectedGoodsList = data.result.itemDetail.itemOfferList;
                            avalon.scan();
                        }
                    }
                });
            },
            matchGoods: function (item, showError) {
                var searchData = panelCtrl.getQueryParam(item, 1);
                io.GET(apiConfig.requirement + '/match', searchData, function (data) {
                    if (data.success) {
                        panelCtrl.matchGoodsList = data.result;
                        if (panelCtrl.matchGoodsList.length > 0) {
                            avalon.vmodels.matchGoddsListPager.totalItems = data.result_info.total_count;
                            avalon.vmodels.matchGoddsListPager.currentPage = data.result_info.page;
                        }
                        avalon.scan();

                        if ((panelCtrl.matchGoodsList.length <= 0) && showError) {
                            panelCtrl.openAlert("没有匹配到对应的商品！请修改商品信息重新匹配。");
                        }
                    } else {
                        panelCtrl.openAlert(data.message);
                    }
                });
            },
            pocessNext: function (index) {
                if (panelCtrl.selectedIndexs.length <= index) {
                    avalon.vmodels['processDialogId'].toggle = false;
                    panelCtrl.openAlert("已经处理完成！");
                } else {
                    panelCtrl.processMatchByItem(index, panelCtrl.dataList[panelCtrl.selectedIndexs[index]]);
                }

            },
            setReason: function () {
                var data = {};
                io.PATCH(apiConfig.rootUrl + 'requirement/item/' + panelCtrl.currentGoods.id + '/canNotProcess?reason=' + panelCtrl.reason, data, function (data) {
                    if (data.success) {
                        if (panelCtrl.batchMatch) {
                            panelCtrl.pocessNext(panelCtrl.currentGoods.selectedIndex + 1);
                        } else {
                            avalon.vmodels['processDialogId'].toggle = false;
                            panelCtrl.openAlert("操作完成。");
                        }
                    } else {
                        panelCtrl.openAlert(data.message);
                    }
                });

            },
            submit: function () {
                if (panelCtrl.selectedGoodsList.length <= 0) {
                    panelCtrl.openAlert("请选择匹配的商品");
                    return;
                }
                //提交数组
                var data = {};
                data.itemOfferList = [];
                for (var i = 0; i < panelCtrl.selectedGoodsList.length; i++) {
                    data.itemOfferList.push({
                        "goodsId": panelCtrl.selectedGoodsList[i].goodsId,
                        "brandId": panelCtrl.selectedGoodsList[i].brandId,
                        "itemName": panelCtrl.selectedGoodsList[i].itemName,
                        "skuSnSet": panelCtrl.selectedGoodsList[i].skuSnSet,
                        "unitId": panelCtrl.selectedGoodsList[i].unitId,
                        "supplierId": panelCtrl.selectedGoodsList[i].supplierId,
                        "spuCategoryId": panelCtrl.selectedGoodsList[i].spuCategoryId,
                        "shopId": panelCtrl.selectedGoodsList[i].shopId,
                        "salePrice": panelCtrl.selectedGoodsList[i].salePrice,
                        "purchasePrice": panelCtrl.selectedGoodsList[i].purchasePrice,
                        "shipMin": panelCtrl.selectedGoodsList[i].shipMin,
                        "shipMax": panelCtrl.selectedGoodsList[i].shipMax,
                        "remarks": panelCtrl.selectedGoodsList[i].remarks
                    });
                }
                //PATCH请求
                io.PATCH(apiConfig.rootUrl + 'requirement/item/' + panelCtrl.currentGoods.id + '/complete', data,
                    function (data) {
                        if (data.success) {
                            if (panelCtrl.batchMatch) {
                                panelCtrl.pocessNext(panelCtrl.currentGoods.selectedIndex + 1);
                            } else {
                                avalon.vmodels['processDialogId'].toggle = false;
                                panelCtrl.openAlert("操作完成。");
                            }
                        } else {
                            panelCtrl.openAlert(data.message);
                        }
                    },
                    function (data) {
                        if (!data.success) {
                            panelCtrl.openAlert(data.message);
                        }
                    });
            },
            unselectedGoods: function (index) {
                panelCtrl.selectedGoodsList.removeAt(index);
            },
            selectedGoods: function (item) {
                var goodsInfo;
                if (item.shopId == 1) {
                    goodsInfo = {
                        "goodsId": item.goodsId,
                        "brandName": item.brandName,             //品牌名
                        "itemName": item.goodsName,              //品名
                        "skuSnSet": item.sn,                     //商品型号
                        "unit": item.unit,                       //商品单位
                        "spuCategoryName": item.firstCatName,
                        "spuCategoryId": item.spuCategoryId,     //一级分类
                        "requiredQuantity": "",                                          //需求数量
                        "shopName": item.shopName,             //店铺名 
                        "supplierId": "",
                        "supplierName": item.supplierName,       //供应商名
                        "salePrice": item.salePrice,             //销售价格
                        "purchasePrice": "",                                            //采购价格
                        "shipMin": item.minDeliveryTime,         //货期最小天
                        "shipMax": item.maxDeliveryTime,         //货期最小天
                        "remarks": item.remarks,                 //备注 
                        "supplierId": '',
                        "supplierList": []
                    };
                    var data = {
                        goodsId: goodsInfo.goodsId,
                        per_page: 100,
                        page: 1
                    }
                    //取供应商列表
                    io.GET(apiConfig.rootUrl + 'requirement/supplier', data, function (data) {
                        if (data.result) {
                            goodsInfo.supplierList = data.result;
                            if (goodsInfo.supplierList.length > 0) {
                                goodsInfo.supplierId = goodsInfo.supplierList[0].id;
                                goodsInfo.purchasePrice = goodsInfo.supplierList[0].purchasePrice;
                            }
                            panelCtrl.selectedGoodsList.push(goodsInfo);
                        }
                    });
                } else {
                    goodsInfo = {
                        "goodsId": item.goodsId,
                        "brandName": item.brandName,             //品牌名
                        "itemName": item.goodsName,              //品名
                        "skuSnSet": item.sn,                     //商品型号
                        "unit": item.unit,                       //商品单位
                        "spuCategoryId": item.spuCategoryId,     //一级分类
                        "requiredQuantity": "",                                          //需求数量
                        "shopName": item.shopName,               //店铺名
                        "supplierName": item.supplierName,       //供应商名
                        "salePrice": item.salePrice,             //销售价格
                        "purchasePrice": "",                                              //采购价格
                        "shipMin": item.minDeliveryTime,         //货期最小天
                        "shipMax": item.maxDeliveryTime,         //货期最小天
                        "remarks": item.remarks,                 //备注 
                        "supplierId": '',
                        "supplierList": []
                    };
                    panelCtrl.selectedGoodsList.push(goodsInfo);
                }
            },
            selectedSupplier: function (index, supplierId) {
                for (var i = 0; i < panelCtrl.selectedGoodsList[index].supplierList.length; i++) {
                    if (panelCtrl.selectedGoodsList[index].supplierList[i].id == supplierId) {
                        panelCtrl.selectedGoodsList[index].purchasePrice = panelCtrl.selectedGoodsList[index].supplierList[i].purchasePrice;
                        panelCtrl.selectedGoodsList[index].shipMin = panelCtrl.selectedGoodsList[index].supplierList[i].shipMin;
                        panelCtrl.selectedGoodsList[index].shipMax = panelCtrl.selectedGoodsList[index].supplierList[i].shipMax;
                    }
                };
            },

            $batchProcessDialogOption: {
                title: "批量处理",
                draggable: true,
                showClose: true,
                width: 1200,
                height: 600,
                isTop: true,
                zIndex: 100,
            },
            dropdownListOption: {
                width: 150,
            },
            selectedBrandId: "",
            brandList: [],
            selectedSupplierId: "",
            supplierList: [],
            batchGoodsList: [],
            batchOfferList: [],
            dropdownlist: {
                getRealTimeData: function (search, dropdownlist) {
                    if (dropdownlist.$id == 'brandDropListId') {
                        setTimeout(function () {
                            var listData = [];
                            var keyWords = search.toLowerCase();
                            for (var i = 0; i < panelCtrl.brandRawList.length; i++) {
                                if ((panelCtrl.brandRawList[i].name.indexOf(search) >= 0) || (panelCtrl.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                    var item = {
                                        value: panelCtrl.brandRawList[i].id,
                                        label: panelCtrl.brandRawList[i].name + "/" + panelCtrl.brandRawList[i].nameEn
                                    }
                                    listData.push(item);
                                    if (20 < listData.length) {
                                        break;
                                    }
                                }
                            }

                            if (listData.length <= 0) {
                                listData.push({ value: "", label: "无相关品牌" });
                            }
                            dropdownlist.render(listData);
                        }, 100);
                    }
                },
                realTimeData: true
            },
            batchProcess: function () {
                var goodsCount = 0;
                var queryBrands = {};
                panelCtrl.selectedBrandId = "";
                panelCtrl.brandList = [];
                panelCtrl.selectedSupplierId = "";
                panelCtrl.supplierList = [];
                panelCtrl.batchGoodsList = [];
                for (var i = 0; i < panelCtrl.dataList.length; i++) {
                    if (panelCtrl.dataList[i].status) {
                        if (panelCtrl.dataList[i].brandName) {
                            queryBrands[panelCtrl.dataList[i].brandName.toLowerCase()] = 0;
                        }

                        panelCtrl.batchGoodsList.push({
                            shopId: "1",
                            brandId: "",
                            supplierId: "",
                            requirementItemId: panelCtrl.dataList[i].id,
                            itemName: panelCtrl.dataList[i].itemName,
                            skuSnSet: panelCtrl.dataList[i].skuSnSet,
                            unit: panelCtrl.dataList[i].unit,
                            unitId: panelCtrl.unitMap[panelCtrl.dataList[i].unit],
                            spuCategoryName: panelCtrl.dataList[i].category,
                            spuCategoryId: panelCtrl.dataList[i].spuCategoryId,
                            salePrice: panelCtrl.dataList[i].salePrice,
                            purchasePrice: panelCtrl.dataList[i].purchasePrice,
                            shipMin: panelCtrl.dataList[i].shipMin,
                            shipMax: panelCtrl.dataList[i].shipMax,
                            remarks: panelCtrl.dataList[i].remarks,
                        });
                        goodsCount++;
                    }
                }
                if (goodsCount == 0) {
                    panelCtrl.openAlert("请选择要处理的商品。");
                    return;
                }

                var brandCount = 0;
                var queryParam = { brandNames: "" };
                avalon.each(queryBrands, function (key, value) {
                    if (queryParam.brandNames) {
                        queryParam.brandNames += "|"
                    }
                    queryParam.brandNames += key;
                    brandCount++;
                });

                if (brandCount > 1) {
                    panelCtrl.openAlert("批量处理需要选择同一品牌的商品。");
                    return;
                }

                if (queryParam.brandNames) {
                    io.GET(apiConfig.batchSearchBrand, queryParam, function (data) {
                        if (data.success) {
                            panelCtrl.brandList = data.result;
                            if (panelCtrl.brandList.length > 0) {
                                avalon.vmodels.brandDropListId.render([{'value':panelCtrl.brandList[0].id,'label':panelCtrl.brandList[0].name}])
                                panelCtrl.selectedBrandId = panelCtrl.brandList[0].id;
                                panelCtrl.selectedBrand();
                            }
                            //} else {
                            //    panelCtrl.openAlert("没有匹配到对应的品牌，无法批量处理。");
                            //}
                            avalon.vmodels['batchProcessDialogId'].toggle = true;
                        } else {
                            panelCtrl.openAlert(data.message);
                        }
                    });
                } else {
                    avalon.vmodels['batchProcessDialogId'].toggle = true;
                }
            },
            selectedBrand: function () {
                //取品牌对应的供应商
                io.GET(apiConfig.getSupplierByBrand.replace("{brandId}", panelCtrl.selectedBrandId), function (data) {
                    if (data.success) {
                        panelCtrl.supplierList = data.result;
                        if (panelCtrl.supplierList && panelCtrl.supplierList.length > 0) {
                            panelCtrl.selectedSupplierId = panelCtrl.supplierList[0].id;
                        }
                    } else {
                        panelCtrl.openAlert(data.message);
                    }
                });
            },
            removeFromBatchList: function (index) {
                panelCtrl.batchGoodsList.splice(index, 1);
            },
            saveGoods: function () {
                if (!panelCtrl.selectedBrandId) {
                    panelCtrl.openAlert("请选择品牌。");
                    return;
                }
                if (!panelCtrl.selectedSupplierId) {
                    panelCtrl.openAlert("请选择供应商。");
                    return;
                }
                if (panelCtrl.batchGoodsList.length <= 0) {
                    panelCtrl.openAlert("请选择要处理的商品。");
                    return;
                }
                var postData = [];
                for (var i = 0; i < panelCtrl.batchGoodsList.length; i++) {
                    var goodsInfo = {
                        shopId: "1",
                        brandId: panelCtrl.selectedBrandId,
                        supplierId: panelCtrl.selectedSupplierId,
                        requirementItemId: panelCtrl.batchGoodsList[i].requirementItemId,

                        itemName: panelCtrl.batchGoodsList[i].itemName,
                        skuSnSet: panelCtrl.batchGoodsList[i].skuSnSet,
                        unitId: panelCtrl.batchGoodsList[i].unitId,
                        spuCategoryId: panelCtrl.batchGoodsList[i].spuCategoryId,

                        salePrice: panelCtrl.batchGoodsList[i].salePrice,
                        purchasePrice: panelCtrl.batchGoodsList[i].purchasePrice,
                        shipMin: panelCtrl.batchGoodsList[i].shipMin,
                        shipMax: panelCtrl.batchGoodsList[i].shipMax,
                        remarks: panelCtrl.batchGoodsList[i].remarks,
                    };

                    if (!goodsInfo.itemName || !goodsInfo.skuSnSet || !goodsInfo.unitId) {
                        panelCtrl.openAlert("请完成必填信息。");
                        return;
                    }

                    postData.push(goodsInfo);
                }
                io.POST(apiConfig.batchCreateTempGoods, postData, function (data) {
                    if (data.success) {
                        panelCtrl.batchOfferList = [];
                        for (var i = 0; i < data.result.length; i++) {
                            panelCtrl.batchOfferList.push({ id: data.result[i].id });
                        }
                        panelCtrl.openYesNoAlert("保存成功，是否成询价链接？", panelCtrl.genQueryLink);
                        avalon.vmodels['batchProcessDialogId'].toggle = false;
                    } else {
                        panelCtrl.openAlert(data.message);
                    }
                },
                    function (data) {
                        if (!data.success) {
                            panelCtrl.openAlert(data.message);
                        }
                    });
            },
            genQueryLink: function () {
                io.POST(apiConfig.batchRequirementUrl, panelCtrl.batchOfferList, function (data) {
                    if (data.success) {
                        window.open("/link/survey.html?id=" + data.result.id + "&key=" + data.result.key, "_blank");
                    } else {
                        panelCtrl.openAlert(data.message);
                    }
                },
                    function (data) {
                        if (!data.success) {
                            panelCtrl.openAlert(data.message);
                        }
                    });
            },

            $reasonDialogOption: {
                title: '填写原因',
                draggable: true,
                showClose: true,
                width: 500,
                zIndex: 100,
                isTop: true,
            },
            batchReasonData: [],
            batchReason: '',
            openReasonDlg: function () {
                panelCtrl.batchReasonData = [];
                for (var i = 0; i < panelCtrl.dataList.length; i++) {
                    if (panelCtrl.dataList[i].status) {
                        panelCtrl.batchReasonData.push({
                            id: panelCtrl.dataList[i].id,
                            reason: ''
                        });
                    }
                }
                if (panelCtrl.batchReasonData.length <= 0) {
                    panelCtrl.openAlert("请选择要处理的商品。");
                    return;
                }

                panelCtrl.batchReason = "";
                avalon.vmodels['reasonDialogCtrlId'].toggle = true;
            },
            onBatchSetReason: function () {
                if (!panelCtrl.batchReason) {
                    panelCtrl.openAlert("请输入原因");
                    return;
                }
                for (var i = 0; i < panelCtrl.batchReasonData.length; i++) {
                    panelCtrl.batchReasonData[i].reason = panelCtrl.batchReason;
                }
                io.PATCH(apiConfig.batchCanNotProcess, panelCtrl.batchReasonData, function (data) {
                    if (data.success) {
                        avalon.vmodels['reasonDialogCtrlId'].toggle = false;
                        panelCtrl.openAlert("操作成功");
                    } else {
                        panelCtrl.openAlert(data.message);
                    }
                },
                    function (data) {
                        if (!data.success) {
                            panelCtrl.openAlert(data.message);
                        }
                    });

            },
            onCloseReasonDlg: function () {
                avalon.vmodels['reasonDialogCtrlId'].toggle = false;
            },

            $alertDialogOption: {
                title: '提示信息',
                draggable: true,
                showClose: true,
                width: 300,
                zIndex: 100,
                isTop: true,
            },
            openAlert: function (msg) {
                panelCtrl.message = msg;
                avalon.vmodels['alertDialogCtrlId'].toggle = true;
            },
            onCloseAlert: function () {
                avalon.vmodels['alertDialogCtrlId'].toggle = false;
            },

            $yesNoDialogOption: {
                title: '提示信息',
                draggable: true,
                showClose: true,
                width: 500,
                zIndex: 100,
                isTop: true,
                callback: null,
            },
            openYesNoAlert: function (msg, callback) {
                panelCtrl.message = msg;
                panelCtrl.$yesNoDialogOption.callback = callback;
                avalon.vmodels['yesNoDialogCtrlId'].toggle = true;
            },
            onNo: function () {
                avalon.vmodels['yesNoDialogCtrlId'].toggle = false;
            },
            onYes: function () {
                if (typeof (panelCtrl.$yesNoDialogOption.callback) == "function") {
                    panelCtrl.$yesNoDialogOption.callback();
                }
                avalon.vmodels['yesNoDialogCtrlId'].toggle = false;
            },
        });

        panelCtrl.$watch("selectedBrandId", function (newBrandId) {
            if (newBrandId) {
                panelCtrl.selectedBrand();
            } else {
                panelCtrl.supplierList = [];
                panelCtrl.selectedSupplierId = "";
            }
        });

        avalon.scan();
        panelCtrl.init();

    });

});