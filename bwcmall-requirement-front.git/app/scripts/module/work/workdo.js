require(['dialog/avalon.dialog', 'pager/avalon.pager', "dropdownlist/avalon.dropdownlist"], function (avalon) {
    avalon.ready(function () {
        var workdoCtrl = avalon.define({
            $id: "workdoCtrl",
            currentNavInfo: 'work',
            dataList: {},
            searchList: [],
            supplierList: [],
            supplierRawList: [],
            trArr: [],
            reason: "",
            shopList: [],
            categoryList: [],
            unitList: [],
            totalItems: 1,
            currentPage: 1,
            supName: '',
            supNameId: '',
            supNameList: [],
            brandId: '',
            brandIdCheck: true,
            unitMap: {},
            match: function () {
                var searchData = {};
                searchData.per_page = 10;
                searchData.brandName_contains = workdoCtrl.dataList.itemDetail.brandName;
                searchData.goodsName_contains = workdoCtrl.dataList.itemDetail.itemName;
                searchData.sn_contains = workdoCtrl.dataList.itemDetail.skuSnSet;
                searchData.page = 1;
                searchData.per_page = workdoCtrl.pager.perPages;
                io.GET(apiConfig.requirement + '/match', searchData, function (data) {
                    if (data.success) {
                        workdoCtrl.searchList = data.result;
                        workdoCtrl.totalItems = data.result_info.total_count;
                        workdoCtrl.currentPage = data.result_info.page;

                        if (workdoCtrl.searchList.length <= 0) {
                            workdoCtrl.openAlert("没有匹配到对应的商品！请修改商品信息重新匹配。");
                        }
                    } else {
                        workdoCtrl.openAlert(data.message);
                    }
                });
            },
            supNameSearch: function () {
                var data = {};
                data.name = workdoCtrl.supName;
                if (workdoCtrl.brandIdCheck) {
                    data.brandId = workdoCtrl.brandId;
                } else {
                    data.brandId = '';
                };

                //取供应商列表
                io.GET(apiConfig.rootUrl + 'requirement/supplier', data, function (data) {
                    if (data.result) {
                        workdoCtrl.supNameList = data.result;
                    }
                });
            },
            chooseSup: function ($index) {
                var i = workdoCtrl.supNameId;
                workdoCtrl.trArr[i].supplierId = workdoCtrl.supNameList[$index].id;
                workdoCtrl.trArr[i].supplierName = workdoCtrl.supNameList[$index].name;
                avalon.vmodels['aa'].toggle = false;
                console.log(workdoCtrl.trArr[i])
                workdoCtrl.trArr[i].shopId = "1"
                workdoCtrl.trArr[i].shopName = '佰万仓商城自营'
            },


            //删除一行
            delProduct: function (index) {
                workdoCtrl.trArr.removeAt(index);
            },
            pager: {
                currentPage: 1,
                perPages: 10,
                showJumper: false,
                totalItems: 1,
                onJump: function (e, data) {
                    var searchData = {};
                    searchData.brandName_contains = workdoCtrl.dataList.itemDetail.brandName;
                    searchData.goodsName_contains = workdoCtrl.dataList.itemDetail.itemName;
                    searchData.sn_contains = workdoCtrl.dataList.itemDetail.skuSnSet;
                    searchData.page = data._currentPage;
                    searchData.per_page = workdoCtrl.pager.perPages;
                    io.GET(apiConfig.requirement + '/match', searchData, function (data) {
                        if (data.success) {
                            workdoCtrl.searchList = data.result;
                            workdoCtrl.currentPage = data.result_info.page;
                        } else {
                            workdoCtrl.openAlert(data.message);
                        }
                    });
                }
            },
            dropdownListOption: {
                width: 150,
            },
            dropdownlist: {
                getRealTimeData: function (search, dropdownlist) {
                    if (dropdownlist.$id == 'brandDropListId') {
                        setTimeout(function () {
                            var listData = [];
                            var keyWords = search.toLowerCase();
                            for (var i = 0; i < workdoCtrl.brandRawList.length; i++) {
                                if ((workdoCtrl.brandRawList[i].name.indexOf(search) >= 0) || (workdoCtrl.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                    var item = {
                                        value: workdoCtrl.brandRawList[i].id,
                                        label: workdoCtrl.brandRawList[i].name + "/" + workdoCtrl.brandRawList[i].nameEn
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

            $skipArray: ["pager"],
            getBrandInfo: function (brandName) {
                var brandInfo = {
                    id: '',
                    name: brandName
                };
                if (brandName) {
                    for (var i = 0; i < workdoCtrl.brandRawList.length; i++) {
                        if ((workdoCtrl.brandRawList[i].name == brandName)) {
                            brandInfo.id = workdoCtrl.brandRawList[i].id;
                            brandInfo.name = workdoCtrl.brandRawList[i].name + "/" + workdoCtrl.brandRawList[i].nameEn;
                            break;
                        }
                    }
                    if (!brandInfo.id) {
                        var keyWords = brandName.toLowerCase();
                        for (var i = 0; i < workdoCtrl.brandRawList.length; i++) {
                            if ((workdoCtrl.brandRawList[i].name.indexOf(brandName) >= 0) || (workdoCtrl.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                brandInfo.id = workdoCtrl.brandRawList[i].id;
                                brandInfo.name = workdoCtrl.brandRawList[i].name + "/" + workdoCtrl.brandRawList[i].nameEn;
                                break;
                            }
                        }
                    }
                }

                return brandInfo;
            },
            //更多
            getMore: function () {
                var brandInfo = workdoCtrl.getBrandInfo(workdoCtrl.dataList.itemDetail.brandName);
                workdoCtrl.trArr.push({
                    "type": 2,
                    "brandName": brandInfo.name,             //品牌名
                    "brandId": brandInfo.id,             //品牌名
                    "itemName": workdoCtrl.dataList.itemDetail.itemName,              //品名
                    "skuSnSet": workdoCtrl.dataList.itemDetail.skuSnSet,              //商品型号
                    "unit": workdoCtrl.dataList.itemDetail.unit,                  //商品单位
                    "unitId": workdoCtrl.unitMap[workdoCtrl.dataList.itemDetail.unit],                  //商品单位
                    "spuCategoryId": workdoCtrl.dataList.itemDetail.spuCategoryId,        //一级分类
                    "requiredQuantity": workdoCtrl.dataList.itemDetail.requiredQuantity,     //需求数量
                    "shopName": '',               //店铺名
                    "shopId": '',               //店铺名
                    "supplierName": '',       //供应商名
                    "supplierId": '',       //供应商名
                    "salePrice": '',             //销售价格
                    "purchasePrice": '',     //采购价格
                    "shipMin": '',         //货期最小天
                    "shipMax": '',         //货期最小天
                    "remarks": '',                 //备注 
                });

                avalon.scan();
            },
            setSearchForm: function ($index, supplierId) {

                for (var i = 0; i < workdoCtrl.trArr[$index].supplierList.length; i++) {
                    if (workdoCtrl.trArr[$index].supplierList[i].id == supplierId) {
                        workdoCtrl.trArr[$index].purchasePrice = workdoCtrl.trArr[$index].supplierList[i].purchasePrice;
                        workdoCtrl.trArr[$index].shipMin = workdoCtrl.trArr[$index].supplierList[i].shipMin;
                        workdoCtrl.trArr[$index].shipMax = workdoCtrl.trArr[$index].supplierList[i].shipMax;
                    }
                };
            },
            addDetail: function ($index) {
                var addArr;
                if (workdoCtrl.searchList[$index].shopId == 1) {
                    addArr = {
                        "type": 1,
                        "sonType": "",
                        "goodsId": workdoCtrl.searchList[$index].goodsId,
                        "brandName": workdoCtrl.searchList[$index].brandName,             //品牌名
                        "itemName": workdoCtrl.searchList[$index].goodsName,              //品名
                        "skuSnSet": workdoCtrl.searchList[$index].sn,                     //商品型号
                        "unit": workdoCtrl.searchList[$index].unit,                       //商品单位
                        "spuCategoryName": workdoCtrl.searchList[$index].firstCatName,
                        "spuCategoryId": workdoCtrl.searchList[$index].spuCategoryId,     //一级分类
                        "requiredQuantity": "",                                          //需求数量
                        "shopName": workdoCtrl.searchList[$index].shopName,             //店铺名 
                        "supplierId": "",
                        "supplierName": workdoCtrl.searchList[$index].supplierName,       //供应商名
                        "salePrice": workdoCtrl.searchList[$index].salePrice,             //销售价格
                        "purchasePrice": "",                                            //采购价格
                        "shipMin": workdoCtrl.searchList[$index].minDeliveryTime,         //货期最小天
                        "shipMax": workdoCtrl.searchList[$index].maxDeliveryTime,         //货期最小天
                        "remarks": workdoCtrl.searchList[$index].remarks,                 //备注 
                        "supplierId": '',
                        "supplierList": []
                    };
                    var data = {
                        goodsId: addArr.goodsId,
                        //goodsId:'3776862204168241152',
                        per_page: 100,
                        page: 1
                    };
                    //取供应商列表
                    io.GET(apiConfig.rootUrl + 'requirement/supplier', data, function (data) {
                        if (data.result) {
                            addArr.supplierList = data.result;
                            if (addArr.supplierList.length == 1) {
                                addArr.sonType = 1;
                                addArr.supplierId = addArr.supplierList[0].id;
                                addArr.purchasePrice = addArr.supplierList[0].purchasePrice;
                            } else {
                                addArr.sonType = 2;
                            };
                            workdoCtrl.trArr.push(addArr);
                        }
                    });
                } else {
                    addArr = {
                        "type": 1,
                        "sonType": 3,
                        "goodsId": workdoCtrl.searchList[$index].goodsId,
                        "brandName": workdoCtrl.searchList[$index].brandName,             //品牌名
                        "itemName": workdoCtrl.searchList[$index].goodsName,              //品名
                        "skuSnSet": workdoCtrl.searchList[$index].sn,                     //商品型号
                        "unit": workdoCtrl.searchList[$index].unit,                       //商品单位
                        "spuCategoryId": workdoCtrl.searchList[$index].spuCategoryId,     //一级分类
                        "requiredQuantity": "",                                          //需求数量
                        "shopName": workdoCtrl.searchList[$index].shopName,               //店铺名
                        "supplierName": workdoCtrl.searchList[$index].supplierName,       //供应商名
                        "salePrice": workdoCtrl.searchList[$index].salePrice,             //销售价格
                        "purchasePrice": "",                                              //采购价格
                        "shipMin": workdoCtrl.searchList[$index].minDeliveryTime,         //货期最小天
                        "shipMax": workdoCtrl.searchList[$index].maxDeliveryTime,         //货期最小天
                        "remarks": workdoCtrl.searchList[$index].remarks,                 //备注 
                        "supplierId": '',
                        "supplierList": []
                    };
                    workdoCtrl.trArr.push(addArr);
                };

            },
            $aaOpts: {
                title: "选择供应商",
                width: 800,
                draggable: true
            },


            show: function (id, $index) {

                avalon.vmodels[id].toggle = true;
                workdoCtrl.supNameList = [];
                workdoCtrl.brandIdCheck = true;
                workdoCtrl.supNameId = $index;
                workdoCtrl.brandId = workdoCtrl.trArr[$index].brandId;
                workdoCtrl.supName = '';
                workdoCtrl.supNameSearch();

            },


            init: function () {
                io.GET(apiConfig.rootUrl + 'category?grade=1', function (data) {
                    if (data.result) {
                        workdoCtrl.categoryList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'shop', { "per_page": 100 }, function (data) {
                    if (data.result) {
                        workdoCtrl.shopList = data.result;
                    }
                });
                io.GET(apiConfig.rootUrl + 'dict/UNIT/item', { "per_page": 10000 }, function (data) {
                    if (data.result) {
                        workdoCtrl.unitList = data.result;
                        for (var i = 0; i < workdoCtrl.unitList.length; i++) {
                            workdoCtrl.unitMap[workdoCtrl.unitList[i].name] = workdoCtrl.unitList[i].value + "";
                        }
                    }
                });
                io.GET(apiConfig.rootUrl + 'requirement/item/' + urls.getParameter(window.location.href, 'id'), function (data) {
                    if (data.success) {
                        workdoCtrl.dataList = data.result;
                        if (data.result.itemDetail.itemOfferList && data.result.itemDetail.itemOfferList.length > 0) {
                            for (var i = 0; i < data.result.itemDetail.itemOfferList.length; i++) {
                                if (data.result.itemDetail.itemOfferList[i].goodsId) {
                                    var tr = {
                                        "type": 1,
                                        "sonType": '',
                                        "goodsId": data.result.itemDetail.itemOfferList[i].goodsId,
                                        "brandId": data.result.itemDetail.itemOfferList[i].brandId,             //品牌名
                                        "brandName": data.result.itemDetail.itemOfferList[i].brandName,             //品牌名
                                        "itemName": data.result.itemDetail.itemOfferList[i].itemName,              //品名
                                        "skuSnSet": data.result.itemDetail.itemOfferList[i].skuSnSet,                     //商品型号
                                        "unit": data.result.itemDetail.itemOfferList[i].unit,                       //商品单位
                                        "unitId": data.result.itemDetail.itemOfferList[i].unitId + "",
                                        "spuCategoryName": data.result.itemDetail.itemOfferList[i].firstCatName,
                                        "spuCategoryId": data.result.itemDetail.itemOfferList[i].spuCategoryId,     //一级分类
                                        "spuCategoryName": data.result.itemDetail.itemOfferList[i].categoryName,     //一级分类
                                        "requiredQuantity": "",                                          //需求数量
                                        "shopName": data.result.itemDetail.itemOfferList[i].shopName,             //店铺名 
                                        "supplierId": data.result.itemDetail.itemOfferList[i].supplierId,
                                        "supplierName": data.result.itemDetail.itemOfferList[i].supplierName,       //供应商名
                                        "salePrice": data.result.itemDetail.itemOfferList[i].salePrice,             //销售价格
                                        "purchasePrice": data.result.itemDetail.itemOfferList[i].purchasePrice,                                            //采购价格
                                        "shipMin": data.result.itemDetail.itemOfferList[i].shipMin,         //货期最小天
                                        "shipMax": data.result.itemDetail.itemOfferList[i].shipMax,         //货期最小天
                                        "remarks": data.result.itemDetail.itemOfferList[i].remarks,
                                        "supplierList": data.result.itemDetail.itemOfferList[i].supplierList
                                    };

                                    if (tr.supplierList.length > 1) {
                                        tr.sonType = 2;
                                    }
                                    workdoCtrl.trArr.push(tr);
                                }

                                if (!data.result.itemDetail.itemOfferList[i].goodsId) {
                                    workdoCtrl.trArr.push({
                                        "type": 2,
                                        "sonType": "",
                                        "brandId": data.result.itemDetail.itemOfferList[i].brandId,
                                        "goodsId": data.result.itemDetail.itemOfferList[i].goodsId,
                                        "brandName": data.result.itemDetail.itemOfferList[i].brandName,             //品牌名
                                        "itemName": data.result.itemDetail.itemOfferList[i].itemName,              //品名
                                        "skuSnSet": data.result.itemDetail.itemOfferList[i].skuSnSet,                     //商品型号
                                        "unit": data.result.itemDetail.itemOfferList[i].unit,                       //商品单位
                                        "unitId": data.result.itemDetail.itemOfferList[i].unitId + "",
                                        "spuCategoryName": data.result.itemDetail.itemOfferList[i].firstCatName,
                                        "spuCategoryId": data.result.itemDetail.itemOfferList[i].spuCategoryId,     //一级分类
                                        "requiredQuantity": "",                                          //需求数量
                                        "shopName": data.result.itemDetail.itemOfferList[i].shopName,             //店铺名 
                                        "supplierId": data.result.itemDetail.itemOfferList[i].supplierId,
                                        "supplierName": data.result.itemDetail.itemOfferList[i].supplierName,       //供应商名
                                        "salePrice": data.result.itemDetail.itemOfferList[i].salePrice,             //销售价格
                                        "purchasePrice": data.result.itemDetail.itemOfferList[i].purchasePrice,                                            //采购价格
                                        "shipMin": data.result.itemDetail.itemOfferList[i].shipMin,         //货期最小天
                                        "shipMax": data.result.itemDetail.itemOfferList[i].shipMax,         //货期最小天
                                        "remarks": data.result.itemDetail.itemOfferList[i].remarks,                 //备注 
                                        "supplierList": data.result.itemDetail.itemOfferList[i].supplierList
                                    });
                                }
                            }
                        };
                    }
                    console.log(workdoCtrl.trArr);
                });
                //取品牌列表
                io.GET(apiConfig.brand + '/simpleData', { per_page: 10000, page: 1 }, function (data) {
                    if (data.result) {
                        for (var i = 0; i < data.result.length; i++) {
                            data.result[i].lowercaseEn = data.result[i].nameEn.toLowerCase();
                        }
                        workdoCtrl.brandRawList = data.result;
                    }
                });
            },
            getOfferList: function () {
                var dataValid = true;
                var itemOfferList = [];
                for (var i = 0; i < workdoCtrl.trArr.length; i++) {
                    if (workdoCtrl.trArr[i].type == 1) {
                        itemOfferList.push({
                            "goodsId": workdoCtrl.trArr[i].goodsId,
                            "supplierId": workdoCtrl.trArr[i].supplierId,
                            "salePrice": workdoCtrl.trArr[i].salePrice,
                            "purchasePrice": workdoCtrl.trArr[i].purchasePrice,
                            "shipMin": workdoCtrl.trArr[i].shipMin,
                            "shipMax": workdoCtrl.trArr[i].shipMax,
                            "remarks": workdoCtrl.trArr[i].remarks
                        });
                    }
                    if (workdoCtrl.trArr[i].type == 2) {
                        var goodsInfo = {
                            "brandId": workdoCtrl.trArr[i].brandId,
                            "itemName": workdoCtrl.trArr[i].itemName,
                            "skuSnSet": workdoCtrl.trArr[i].skuSnSet,
                            "unitId": workdoCtrl.trArr[i].unitId,
                            "supplierId": workdoCtrl.trArr[i].supplierId,
                            "spuCategoryId": workdoCtrl.trArr[i].spuCategoryId,
                            "shopId": workdoCtrl.trArr[i].shopId,
                            "salePrice": workdoCtrl.trArr[i].salePrice,
                            "purchasePrice": workdoCtrl.trArr[i].purchasePrice,
                            "shipMin": workdoCtrl.trArr[i].shipMin,
                            "shipMax": workdoCtrl.trArr[i].shipMax,
                            "remarks": workdoCtrl.trArr[i].remarks
                        };

                        //完整信息校验
                        if (!goodsInfo.brandId || !goodsInfo.supplierId || !goodsInfo.itemName || !goodsInfo.skuSnSet || !goodsInfo.unitId) {
                            dataValid = false;
                            break;
                        }

                        itemOfferList.push(goodsInfo);
                    }
                }
                return { dataValid: dataValid, itemOfferList: itemOfferList };
            },
            canNotProcess: function () {
                var data = {};
                data.reason = workdoCtrl.reason;
                var dataInfo = workdoCtrl.getOfferList();
                if (!dataInfo.dataValid) {
                    workdoCtrl.openAlert("请完成商品必填信息。");
                    return;
                }
                data.itemOfferList = dataInfo.itemOfferList;
                io.PATCH(apiConfig.rootUrl + 'requirement/item/' + urls.getParameter(window.location.href, 'id') + '/canNotProcess', data, function (data) {
                    if (data.success) {
                        workdoCtrl.openAlert('操作成功', true);
                    }
                });

            },
            //提交订单
            submit: function () {
                //提交数组
                var data = {};
                var dataInfo = workdoCtrl.getOfferList();
                if (!dataInfo.dataValid) {
                    workdoCtrl.openAlert("请完成商品必填信息。");
                    return;
                }
                data.itemOfferList = dataInfo.itemOfferList;

                //PATCH请求
                io.PATCH(apiConfig.rootUrl + 'requirement/item/' + urls.getParameter(window.location.href, 'id') + '/complete', data,
                    function (data) {
                        if (data.success) {
                            workdoCtrl.openAlert('操作成功', true);
                        } else {
                            workdoCtrl.openAlert(data.message);
                        }
                    },
                    function (data) {
                        if (!data.success) {
                            workdoCtrl.openAlert(data.message);
                        }
                    });
            },
            //保存进度
            // save : function() {
            //     var data = {};
            //     data.itemOfferList = [];
            //     for (var i = 0; i < workdoCtrl.trArr.length; i++) {
            //         if (workdoCtrl.trArr[i].type == 1) {
            //             data.itemOfferList.push({
            //                 "goodsId": workdoCtrl.trArr[i].goodsId,
            //                 "supplierId": workdoCtrl.trArr[i].supplierId,
            //                 "shipMin": workdoCtrl.trArr[i].shipMin,
            //                 "shipMax": workdoCtrl.trArr[i].shipMax,
            //                 "remarks": workdoCtrl.trArr[i].remarks
            //             });
            //         };
            //         if (workdoCtrl.trArr[i].type == 2) {
            //             data.itemOfferList.push({
            //                 "brandId": workdoCtrl.trArr[i].brandId,
            //                 "itemName": workdoCtrl.trArr[i].itemName,
            //                 "skuSnSet": workdoCtrl.trArr[i].skuSnSet,
            //                 "unitId": workdoCtrl.trArr[i].unitId,
            //                 "supplierId": workdoCtrl.trArr[i].supplierId,
            //                 "spuCategoryId" : workdoCtrl.trArr[i].spuCategoryId,
            //                 "shopId" : workdoCtrl.trArr[i].shopId,
            //                 "salePrice": workdoCtrl.trArr[i].salePrice,
            //                 "purchasePrice": workdoCtrl.trArr[i].purchasePrice,
            //                 "shipMin": workdoCtrl.trArr[i].shipMin,
            //                 "shipMax": workdoCtrl.trArr[i].shipMax,
            //                 "remarks": workdoCtrl.trArr[i].remarks
            //             });
            //         };
            //     }
            //     //PATCH请求
            //     io.PATCH(apiConfig.rootUrl + 'requirement/item/'+urls.getParameter(window.location.href, 'id')+'/saveProgress', data,
            //     function(data) {
            //         if (data.success) {
            //             workdoCtrl.openAlert('操作成功', true);
            //         } else {
            //             workdoCtrl.openAlert(data.message);
            //         }
            //     },
            //     function (data) {
            //         if(!data.success) {
            //             workdoCtrl.openAlert(data.message);
            //         }
            //     });
            // },
            // getData : function(search) {
            //     var token = null;
            //     if (!storage.getCurrentUser()) {
            //         urls.goLogin();
            //     } else {
            //         token = storage.getCurrentUser().authToken;
            //     };
            //     var datam = [];
            //     if (search) {
            //         $.ajax({
            //             url:apiConfig.brand + '/simpleData',    //请求的url地址
            //             dataType:"json",   //返回格式为json
            //             async:false,//请求是否异步，默认为异步，这也是ajax重要特性
            //             data:{"keyword_contains": search, "per_page": 10, "page": 1},    //参数值
            //             type:"GET",   //请求方式
            //             headers : {"Authorization" :token},
            //             beforeSend:function(){
            //                 //请求前的处理
            //             },
            //             success:function(req){
            //                 if (req.result.length > 0) {
            //                     for (var i = 0; i < req.result.length; i++) {
            //                         var item = {
            //                             value: req.result[i].id,
            //                             label: req.result[i].name + "/" + req.result[i].nameEn
            //                         }
            //                         datam.push(item);

            //                     }

            //                 }
            //             },
            //             complete:function(){
            //                 //请求完成的处理
            //             },
            //             error:function(){
            //                 //请求出错处理
            //             }
            //         });
            //     };
            //     return datam;  
            // },

            $alertDialogOption: {
                title: '提示信息',
                draggable: true,
                showClose: true,
                width: 300,
                zIndex: 100,
                isTop: true,
            },
            message: "",
            closeFlag: false,
            openAlert: function (msg, close) {
                workdoCtrl.message = msg;
                workdoCtrl.closeFlag = close;
                avalon.vmodels['alertDialogCtrlId'].toggle = true;
            },
            onCloseAlert: function () {
                avalon.vmodels['alertDialogCtrlId'].toggle = false;
                if (workdoCtrl.closeFlag) {
                    window.close();
                }
            },
        });
        workdoCtrl.$watch("totalItems", function (a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.totalItems = a;
            }
        });
        workdoCtrl.$watch("currentPage", function (a) {
            var widget = avalon.vmodels.pp;
            if (widget) {
                widget.currentPage = a;
            }
        });
        avalon.scan();
        workdoCtrl.init();
    });


});

