'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils'),
        uploadify = require('module/common/uploadify/uploadify'),
        urls = require('module/common/utils/url');
    var session = require('lib/io/session');
    var goodsId = urls.getParamByKey("id");
    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require("oniui/loading/avalon.loading");
    require("oniui/validation/avalon.validation");
    require("oniui/kindeditor/avalon.kindeditor");
    require('oniui/dropdownlist/avalon.dropdownlist');

    avalon.ready(function() {
        var validationVM;
        var vm = avalon.define({
            $id: "goodsDetail",
            showLoading: false,
            alertMessage: '',
            unitValue: '',
            unitDataLoaded: false,
            freightStatus: '0',
            goodsInfo: {    name: '',
                            unit: '',
                            subsidyPrice: '',
                            marketStatus : '',
                            soldOutStatus: '',
                            priceStatus: '',
                            returnStatus: '',
                            sku: {name: '', sn: '', attributes:[], spu:{name:'', brand:{name:''}, categorys:[]}},
                            resourceIds:[],
                            freight: '',
                            goodsShipPrices: [],
                            remarks: '' },
            $alertOpts: {
                type: 'confirm',
                title: '提示',
                width: 485
            },
            $editorOptions: {
                $options: {
                    allowImageRemote: false,
                    uploadJson: API.upload,//API.editorUpoadImg + "?token=" + session.getCurrentUser().authToken,
                    uploadFormData: {token: session.getCurrentUser().authToken},
                    items : [
                        'source', '|', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
                        'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
                        'insertunorderedlist', '|', 'emoticons', 'image', 'link']
                }
            },
            $unitListOptions: {
                width: 250,
                height: 30,
            },
            showAlertInfo: function(msg) {
                vm.alertMessage = msg;
                avalon.vmodels["dialogAlert"].toggle = true;
            },
            onCloseAlert: function() {
                avalon.vmodels["dialogAlert"].toggle = false;
            },
            deleteGoodsImg: function (index) {
                vm.goodsInfo.resourceIds.splice(index, 1);
            },
            setGoodsImg: function (index) {
                if(0<index) {
                    var mainImg = vm.goodsInfo.resourceIds.splice(index, 1);
                    vm.goodsInfo.resourceIds.unshift({id: mainImg[0].id, resources: mainImg[0].resources});
                }
            },
            save: function() {
                vm.goodsInfo.name = vm.goodsInfo.name.trim();
                if(!vm.goodsInfo.name || vm.unitValue<1 || (vm.goodsInfo.priceStatus==1)&&(!vm.goodsInfo.subsidyPrice)) {
                    vm.showAlertInfo("请输入必填信息！");
                    return;
                }
                vm.showLoading = true;
                var goodsData = {
                    id: vm.goodsInfo.id,
                    skuId: vm.goodsInfo.skuId,
                    name: vm.goodsInfo.name,
                    unit: vm.unitValue,
                    subsidyPrice: vm.goodsInfo.subsidyPrice,
                    salePrice: vm.goodsInfo.subsidyPrice,
                    priceStatus: vm.goodsInfo.priceStatus,
                    marketStatus: vm.goodsInfo.marketStatus,
                    soldOutStatus: vm.goodsInfo.soldOutStatus,
                    returnStatus: vm.goodsInfo.returnStatus,
                    freight: vm.freightStatus=='1'?parseFloat(vm.goodsInfo.freight).toFixed(2):0.00,
                    goodsShipPrices: [],
                    resourceIds: [],
                    remarks: vm.goodsInfo.remarks,
                };
                vm.goodsInfo.resourceIds.forEach(function(item, index) {
                    var item = {id: item.id, resources: item.resources};
                    goodsData.resourceIds.push(item)
                });

                vm.goodsInfo.goodsShipPrices.forEach(function(item, index) {
                    var item = {ship: item.ship, quantityMin: item.quantityMin, quantityMax: item.quantityMax, price: item.price};
                    goodsData.goodsShipPrices.push(item)
                });

                request.PUT(API.goodsId.replace('{id}', goodsId), goodsData, function(responseData) {
                    vm.showLoading = false;
                    if (responseData.success) {
                        vm.goodsInfo = responseData.result;
                        avalon.scan(document.body, vm);
                        vm.showAlertInfo("修改商品成功！");
                    } else {
                        vm.showAlertInfo(responseData.message);
                    }
                });
            },
            //配置价格
            goodsPrice: {ship:"", quantityMin:"", quantityMax:"", price:""},
            selectedGoodsPrices: [],
            $dialogConfigPricesOpts: {
                title: "价格配置",
                width: 560,
            },
            configPrices: function () {
                if(!vm.goodsInfo.goodsShipPrices) {
                    vm.goodsInfo.goodsShipPrices = [];
                }
                avalon.vmodels['dialogConfigPrices'].toggle = true;
            },
            addPrice: function () {
                var priceItem = {ship:parseInt(vm.goodsPrice.ship), 
                                    quantityMin:parseInt(vm.goodsPrice.quantityMin),
                                    quantityMax:parseInt(vm.goodsPrice.quantityMax),
                                    price:parseFloat(vm.goodsPrice.price).toFixed(2)};

                if(priceItem.quantityMin >= priceItem.quantityMax) {
                    vm.showAlertInfo("请输入正确的采购区间。");
                    return;                      
                }

                if(priceItem.price == '') {
                    vm.showAlertInfo("请输入价格。");
                    return;                      
                }

                if(isNaN(priceItem.ship)) {
                    priceItem.ship = 0;
                }
                if(isNaN(priceItem.quantityMin)) {
                    priceItem.quantityMin = 1;
                }
                if(isNaN(priceItem.quantityMax)) {
                    priceItem.quantityMax = -1;
                }
                //合法性校验
                var shipInfo = {};
                var splitCount = 0;
                for(var i=0; i<vm.goodsInfo.goodsShipPrices.length; i++) {
                    if(vm.goodsInfo.goodsShipPrices[i].ship == priceItem.ship){
                        splitCount++;

                        if(((priceItem.quantityMin>=vm.goodsInfo.goodsShipPrices[i].quantityMin) && (priceItem.quantityMin<=vm.goodsInfo.goodsShipPrices[i].quantityMax))
                            ||((priceItem.quantityMax>=vm.goodsInfo.goodsShipPrices[i].quantityMin) && (priceItem.quantityMax<=vm.goodsInfo.goodsShipPrices[i].quantityMax))
                            ||((priceItem.quantityMax>=vm.goodsInfo.goodsShipPrices[i].quantityMin) && (-1==vm.goodsInfo.goodsShipPrices[i].quantityMax))) {
                            vm.showAlertInfo("输入采购区间存在重叠。");
                            return;                           
                        }
                    }

                    if(!shipInfo[vm.goodsInfo.goodsShipPrices[i].ship+""]) {
                        shipInfo[vm.goodsInfo.goodsShipPrices[i].ship+""] = 0;
                    }
                    shipInfo[vm.goodsInfo.goodsShipPrices[i].ship+""]++;

                    if(splitCount >= 3) {
                        vm.showAlertInfo("输入采购区间的定价，最多只支持3个区间。");
                        return;
                    }
                }
                var shipCount = 0;
                for(var key in shipInfo) {
                    shipCount++;
                }
                if(shipCount > 20) {
                    vm.showAlertInfo( "货期最多只支持20种。");
                    return;
                }

                vm.goodsInfo.goodsShipPrices.push(priceItem);

                vm.goodsPrice.ship="";
                vm.goodsPrice.quantityMin="";
                vm.goodsPrice.quantityMax="";
                vm.goodsPrice.price="";
            },
            deletePrice: function(index) {
                vm.goodsInfo.goodsShipPrices.splice(index, 1);
            },
            onSavePrices: function() {
                avalon.vmodels['dialogConfigPrices'].toggle = false;
            }
        });

        (function init() {
            request.GET(API.dict.replace('{index}', 'UNIT'), {per_page: 1000}, function(responseData) {
                var unitData = [];
                responseData.result.forEach(function(item, index) {
                    var item = {value: item.value, label: item.name};
                    unitData.push(item)
                });
                avalon.vmodels.unitListId.render(unitData);
                vm.unitDataLoaded = true;
                if(vm.goodsInfo.unit) {
                    vm.unitValue = vm.goodsInfo.unit;
                }
                avalon.scan(document.body, vm);
            });

            request.GET(API.goodsId.replace('{id}', goodsId), function(responseData) {
                vm.showLoading = false;
                if (responseData.success) {
                    vm.goodsInfo = responseData.result;
                    if(vm.goodsInfo.unit && vm.unitDataLoaded) {
                        vm.unitValue = vm.goodsInfo.unit;
                    }
                    if(vm.goodsInfo.freight && vm.goodsInfo.freight>=0.1) {
                        vm.freightStatus = "1";
                    } else {
                        vm.freightStatus = "0";
                    }
                    avalon.scan(document.body, vm);
                } else {
                    vm.showAlertInfo(responseData.message);
                }
            });

        }());

        uploadify('#uploadPic', {
            uploader: API.upload,
            buttonText: '上传图片',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
                    vm.goodsInfo.resourceIds.push({
                        id: data.id,
                        resources: data.resources
                    });
                    avalon.scan(document.body, vm);
                } else if(data.error.code == 10006) {
                    urls.goLogin();
                }
            }
        });

        avalon.scan(document.body, vm);
    });
});
