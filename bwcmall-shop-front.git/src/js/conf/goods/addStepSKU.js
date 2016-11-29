'use strict';

define(function (require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        myUtils = require('module/common/utils/utils'),
        uploadify = require('module/common/uploadify/uploadify'),
        urls = require('module/common/utils/url');
    var session = require('lib/io/session');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require("oniui/loading/avalon.loading");
    require("oniui/kindeditor/avalon.kindeditor");

    function getUrlParams(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }    

    var spuId = getUrlParams('spuId');

    avalon.ready(function () {
        var vm = avalon.define({
            $id: 'goodsStepSKU',
            $dialogSKUOpts: {
                title: '根据你选择的SPU，您可添加如下商品',
                width: 850,
                onConfirm: function () {
                    for(var i = 0; i < vm.spuAttrGroups.length; i++) {
                        vm.spuAttrGroups[i].resourceIds = vm.spuAttrGroups[i].resourceIds || [];
                    }

                    var data = vm.skuListData.concat(vm.spuAttrGroups);
                    vm.skuListData = data;

                    for(var i = 0; i < vm.skuListData.length; i++) {
                        vm.skuListData[i].index = i;
                    }
                    avalon.vmodels['goodsStepSKU'].toggle = true;
                    avalon.scan(document.body, vm);
                },
                onOpen: function () {
                    vm.spuAttrGroups = [];
                    $('#dialog-add-sku').find('[type=checkbox]').removeAttr('checked');
                }
            },
            $addAttrOpts: {
                title: '添加属性',
                width: 400,
                onConfirm: function () {
                    if(vm.newAttrValue.length === 0) {
                        vm.showAlert('dialogAlert', '请输入属性值');
                        return false;
                    }
                    vm.newAttr.value = vm.newAttrValue;
                    request.POST(API.addAttr.replace('{id}', vm.newAttr.attributeId), vm.newAttr, function(responseData) {
                        if (responseData.success) {
                            request.GET(API.getSpuAttrs.replace('{spuId}', spuId), function(responseData) {
                                if (responseData.success) {
                                    console.log(responseData.result);
                                    vm.spuAttributes = responseData.result;
                                } else {
                                    console.log(responseData.message);
                                }
                            });
                            avalon.scan(document.body, vm);
                        } else {
                            vm.showAlert('dialogAlert', responseData.message);
                        }
                    });  
                },
                onOpen: function () {
                    vm.newAttrValue = '';
                }
            },
            $alertOpts: {
                title: '提示',
                showClose: false
            },
            $submitTipOpts: {
                title: '提示',
                onConfirm: function () {
                    window.location.href = '/goods/list.html';
                },
                showClose: false
            },
            $opts: {
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
            configPricesIndex: -1,
            goodsPrice: {ship:"", quantityMin:"", quantityMax:"", price:""},
            selectedGoodsPrices: [],
            $dialogConfigPricesOpts: {
                title: "价格配置",
                width: 560,
            },
            emptyArr: [],
            editorCont: '',
            alertMessage: '',
            goodsEditInfoVisible: false,
            skuListData: [],
            spuDetailData: {},
            spuAttributes: [],
            spuAttrGroups: [],
            uploadPics: [],
            skuHeaderAttrs: [],
            spuMainAttr: {},
            checkedMainAttrIndex: -1,
            checkedSkuIndex: null,
            showMainAttrUpload: false,
            unitData: [],
            emptyVal: '',
            testarr: [],
            selectedSkuData: [],
            mainAttrIndex: '',
            select_all: 0,
            selected: [],
            newAttrName:'',
            newAttrValue: '',
            newAttr: {},
            freight: 0.00,
            freightStatus: '0',
            onOpenAddSKU: function (id) {
                avalon.vmodels[id].toggle = true;
            },
            buildSkuData: function (data) {
                var i, len = data.length;
                if(len === 0) return data;

                for(var i = 0; i < len; i++) {
                    data[i].resourceIds = data[i].resourceIds || [];
                }

                var attrs = data[0].attributes;
                if(attrs.length === 0) return data;

                var finalAttrs = [];
                for(var i = 0; i < attrs.length; i++) {
                    if(attrs[i].type) {
                        finalAttrs.push(attrs[i].attributeName);
                    }
                }
                vm.skuHeaderAttrs = finalAttrs;
                return data;
            },
            clickedSKURow: function (event, index) {
                event.stopPropagation();
                console.log(event.target.tagName);
                if(event.target.tagName == 'INPUT' || event.target.tagName == 'SELECT' || event.target.tagName == 'BUTTON' || event.target.tagName == 'A') {
                    return;
                }
                
                vm.checkedSkuIndex = index;
                $(this).addClass('checked-tr').siblings().removeClass('checked-tr');

                var data = vm.skuListData[index],
                    selectData = [];
                for(var i = 0; i < data.resourceIds.length; i++) {
                    selectData.push({
                        id: data.resourceIds[i].id,
                        resources: data.resourceIds[i].resources
                    });
                }
                vm.selectedSkuData = selectData;
                vm.editorCont = vm.skuListData[index].editorCont || '';
                vm.goodsEditInfoVisible = true;
            },
            change: function () {
            },
            copySKU: function (index) {
                var data = vm.skuListData[index];
                data.id = null;
                data.resourceIds = []
                data.editorCont = '';
                vm.skuListData.splice(index, 0, data);
            },
            deleteSKU: function (index) {
                vm.skuListData.splice(index, 1);
            },
            addAttr: function (index) {
                vm.newAttrName = vm.spuAttributes[index].name;
                vm.newAttr = {
                    attributeId:vm.spuAttributes[index].attrId,
                    name: vm.spuAttributes[index].name        //后端要求传的
                };
                avalon.vmodels['dialogAddAttr'].toggle = true;
            },
            onConfrimAttr: function () {
                var $dialogAttr = $('#dialog-attrs'),
                    $line = $dialogAttr.find('.attr-line'),
                    arr = [],
                    data = [],
                    finalData = [];

                if($dialogAttr.find(':checked').length === 0) {
                    vm.showAlert('dialogAlert', '请勾选属性');
                    return false;
                }

                $line.each(function (index, el) {
                    var attrs = [],
                        $checked = $(el).find(':checked');
                    if($checked.length == 0) return;
                    $checked.each(function (i, e) {
                        attrs.push({
                            attributeValue: $(e).next().text(),
                            attributeValueId: $(e).closest('.attr-item-inline').attr('data-id'),
                            attributeName: $(e).closest('.attr-item-inline').attr('data-name'),
                            spuAttributeId: $(e).closest('.attr-item-inline').attr('spuattr-id'),
                            type: 1
                        });
                    });
                    arr.push(attrs);
                });
                
                function Node(data,parent){
                    this.data = data;
                    this.parent = parent;
                    this.toString = function(){
                        return "[data:" + this.data + ",parent:" + this.parent + "]";
                    };
                }

                var root = new Node(null,null);
                var nodes = [];
                var result = [];
                
                function constructTree(parent,array){
                    nodes.push(parent);
                    if(array.length > 0){
                        array = array.slice(0);
                        var cur = array.shift();
                        for(var i=0;i<cur.length;i++){
                            var newNode = new Node(cur[i],parent);
                            constructTree(newNode,array);
                        }
                    }
                }

                function findChildren(parent){
                    var result = [];
                    for(var i=0;i<nodes.length;i++){
                        if(nodes[i].parent === parent){
                            result.push(nodes[i]);
                        }
                    }
                    return result;
                }

                function all(parent,to){
                    var children = findChildren(parent);
                    if(children.length > 0){
                        for(var i=0;i<children.length;i++){
                            var newTo = to.slice(0);
                            newTo.push(children[i].data);
                            all(children[i],newTo);
                        }
                    }
                    else{
                        result.push(to);
                    }
                }
                
                constructTree(root,arr);
                all(root,[]);

                for(var i = 0; i < result.length; i++) {
                    finalData.push({
                        attributes: result[i],
                        marketPrice: null,
                        name: null,
                        resources: null,
                        sales: null,
                        skuNo: null,
                        sn: null,
                        snKeyword: null,
                        spu: {
                            id: spuId
                        },
                        suppliers: null,
                        id: null,
                        goodsShipPrices: [],
                        isEdit: true
                    })
                }

                vm.spuAttrGroups = finalData;clickedMainAttr
            },
            clickedMainAttr: function (index) {
                vm.checkedMainAttrIndex = index;
                vm.showMainAttrUpload = true;
            },
            delMainAttrImg: function (index) {
                if(0<=vm.checkedMainAttrIndex && vm.checkedMainAttrIndex<vm.spuMainAttr.values.length) {
                    vm.spuMainAttr.values[vm.checkedMainAttrIndex].attributeValueResources.splice(index, 1);
                }
            },
            setMainAttrImg: function (index) {
                if(0<=vm.checkedMainAttrIndex && vm.checkedMainAttrIndex<vm.spuMainAttr.values.length) {
                    var mainImg = vm.spuMainAttr.values[vm.checkedMainAttrIndex].attributeValueResources.splice(index, 1);
                    vm.spuMainAttr.values[vm.checkedMainAttrIndex].attributeValueResources.unshift({resourcesId: mainImg[0].resourcesId, resources: mainImg[0].resources});
                }
            },
            deleteSkuImg: function (url, index) {
                var i = vm.checkedSkuIndex;

                vm.skuListData[i].resourceIds.splice(index, 1);
                vm.selectedSkuData.splice(index, 1);
            },
            setSkuImg: function (url, index) {
                if(0<index) {
                    var i = vm.checkedSkuIndex;
                    var mainImg = vm.skuListData[i].resourceIds.splice(index, 1);
                    vm.skuListData[i].resourceIds.unshift({id: mainImg[0].id, resources: mainImg[0].resources});
                    vm.selectedSkuData = vm.skuListData[i].resourceIds;
                }
            },
            currentTextboxVal: '',
            changeVal: function () {
                $(this).removeClass('error');
            },
            keydownVal: function () {
                vm.currentTextboxVal = $(this).val();
            },
            focusTextbox: function () {
                vm.currentTextboxVal = $(this).val();  
            },
            enterText: function () {
                var reg = new RegExp($(this).attr('data-reg') || ''),
                    val = $(this).val();

                if(!reg.test(val)) {
                    $(this).val(vm.currentTextboxVal);
                }
            },
            showAlert: function (id, msg) {
                avalon.vmodels[id].toggle = true;
                vm.alertMessage = msg;
            },
            onCloseDailog: function (id) {
                avalon.vmodels[id].toggle = false;
            },
            save: function () {
                if(validate()) {
                    var params = getParams();   
                    request.POST(API.goods, params, function(responseData) {
                        if (responseData.success) {
                            vm.showAlert('dialogSubmitTip', '保存成功');
                            avalon.scan(document.body, vm);
                        } else {
                            vm.showAlert('dialogAlert', responseData.message);
                        }
                    });                
                }
            },

            //价配置窗口
            configPrices: function(index) {
                vm.configPricesIndex = index;
                if(!vm.skuListData[index].goodsShipPrices) {
                    vm.skuListData[index].goodsShipPrices = [];
                }
                vm.goodsPrice.ship="";
                vm.goodsPrice.quantityMin="";
                vm.goodsPrice.quantityMax="";
                vm.goodsPrice.price="";
                vm.selectedGoodsPrices = [];
                vm.selectedGoodsPrices = vm.skuListData[index].goodsShipPrices;
                avalon.vmodels['dialogConfigPrices'].toggle = true;
                avalon.scan(document.body, vm);
            },
            addPrice: function () {
                var priceItem = {ship:parseInt(vm.goodsPrice.ship), 
                                    quantityMin:parseInt(vm.goodsPrice.quantityMin),
                                    quantityMax:parseInt(vm.goodsPrice.quantityMax),
                                    price:parseFloat(vm.goodsPrice.price).toFixed(2)};

                if(priceItem.quantityMin >= priceItem.quantityMax) {
                    vm.showAlert('dialogAlert', "请输入正确的采购区间。");
                    return;                      
                }

                if(priceItem.price == '') {
                    vm.showAlert('dialogAlert', "请输入价格。");
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
                for(var i=0; i<vm.selectedGoodsPrices.length; i++) {
                    if(vm.selectedGoodsPrices[i].ship == priceItem.ship){
                        splitCount++;

                        if(((priceItem.quantityMin>=vm.selectedGoodsPrices[i].quantityMin) && (priceItem.quantityMin<=vm.selectedGoodsPrices[i].quantityMax))
                            ||((priceItem.quantityMax>=vm.selectedGoodsPrices[i].quantityMin) && (priceItem.quantityMax<=vm.selectedGoodsPrices[i].quantityMax))
                            ||((priceItem.quantityMax>=vm.selectedGoodsPrices[i].quantityMin) && (-1==vm.selectedGoodsPrices[i].quantityMax))) {
                            vm.showAlert('dialogAlert', "输入采购区间存在重叠。");
                            return;                           
                        }
                    }

                    if(!shipInfo[vm.selectedGoodsPrices[i].ship+""]) {
                        shipInfo[vm.selectedGoodsPrices[i].ship+""] = 0;
                    }
                    shipInfo[vm.selectedGoodsPrices[i].ship+""]++;

                    if(splitCount >= 3) {
                        vm.showAlert('dialogAlert', "输入采购区间的定价，最多只支持3个区间。");
                        return;
                    }
                }
                var shipCount = 0;
                for(var key in shipInfo) {
                    shipCount++;
                }
                if(shipCount > 20) {
                    vm.showAlert('dialogAlert', "货期最多只支持20种。");
                    return;
                }

                vm.skuListData[vm.configPricesIndex].goodsShipPrices.push(priceItem);
                vm.selectedGoodsPrices.push(priceItem);
                vm.goodsPrice.ship="";
                vm.goodsPrice.quantityMin="";
                vm.goodsPrice.quantityMax="";
                vm.goodsPrice.price="";
            },
            deletePrice: function(index) {
                vm.skuListData[vm.configPricesIndex].goodsShipPrices.splice(index, 1);
                vm.selectedGoodsPrices.splice(index, 1);
            },
            onSavePrices: function() {
                avalon.vmodels['dialogConfigPrices'].toggle = false;
            }
        });

        $('#select_all').on('change', function () {
            if($(this).is(':checked')) {
                $('#sku-tab').find('[type=checkbox]').prop('checked', true);
            } else {
                $('#sku-tab').find('[type=checkbox]').prop('checked', false);
            }
        });

        $('#sku-tab').on('change', '[type=checkbox]', function () {
            if($('#sku-tab').find('[type=checkbox]:checked').length === $('#sku-tab').find('tr').length) {
                $('#select_all').prop('checked', true);
            } else {
                $('#select_all').prop('checked', false);
            }
        });

        vm.$watch('editorCont', function (after) {
            vm.skuListData[vm.checkedSkuIndex].editorCont = vm.editorCont;
        });

        function validate() {
            var vm = avalon.vmodels['goodsStepSKU'],
                $tab = $('#sku-tab'),
                $selectEls = $tab.find('select'),
                $inputEls = $tab.find('input'),
                num = 0,
                params;

            if(!$('#sku-tab').find('[type=checkbox]:checked').length) {
                vm.showAlert('dialogAlert', '请选择您要上传的商品');
                return false;
            }

            $selectEls.removeClass('error');
            $inputEls.removeClass('error');
            for(var i = 0, len = $selectEls.length; i < len; i++) {
                if($selectEls.eq(i).closest('tr').find('[type=checkbox]').is(':checked')) {
                    if(!$selectEls.eq(i).val() || $selectEls.eq(i).val() == '0') {
                        num++;
                        $selectEls.eq(i).addClass('error');
                    }                    
                }
            }
            for(var j = 0, len = $inputEls.length; j < len; j++) {
                if($inputEls.eq(j).closest('tr').find('[type=checkbox]').is(':checked')) {
                    if(!$inputEls.eq(j).val()) {
                        num++;
                        $inputEls.eq(j).addClass('error');   
                    }                    
                }
            }

            if (num > 0) {
                return false;
            } else {
                return true;
            }
        }

        function getParams() {
            var vm = avalon.vmodels['goodsStepSKU'],
                priceStatus = $('[name=priceStatus]:checked').val(),
                marketStatus = $('[name=marketStatus]:checked').val(),
                returnStatus = $('[name=returnStatus]:checked').val(),
                freightStatus = $('[name=freightStatus]:checked').val(),
                $tr = $('#sku-tab').find('tr'),
                skuList = vm.skuListData,
                goods = [],
                attrs = [],
                finalGoods = {},
                freight = 0.00,
                field, value, sku;

            if(vm.freightStatus == '1') {
                freight = parseFloat(vm.freight).toFixed(2);
            }

            for(var i = 0; i < $tr.length; i++) {
                if($tr.eq(i).find('[type=checkbox]').is(':checked')) {
                    var goodsParams = {
                            priceStatus: priceStatus,
                            marketStatus: marketStatus,
                            returnStatus: returnStatus,
                            freight: freight,
                            resourceIds: skuList[i].resourceIds || [],
                            goodsShipPrices: skuList[i].goodsShipPrices || [],
                            remarks: skuList[i].editorCont || ''
                        };
                    var $els = $tr.eq(i).find('[data-name]');
                    for(var j = 0; j < $els.length; j++) {
                        field = $els.eq(j).attr('data-name');
                        value = $els.eq(j).val();
                        sku = $els.eq(j).attr('data-sku') || '';
                        if(sku == 'true') {
                            skuList[i][field] = value;
                        } else {
                            goodsParams[field] = value;
                        }
                        goodsParams['subsidyPrice'] = goodsParams['salePrice'] || '';
                    }
                    goods.push({
                        sku: skuList[i],
                        goods: goodsParams
                    });
                }
            }

            if(vm.spuMainAttr.values && vm.spuMainAttr.values.length > 0) {
                for(var i = 0; i < vm.spuMainAttr.values.length; i++) {
                    if(vm.spuMainAttr.values[i].attributeValueResources.length > 0) {
                        attrs = attrs.concat(vm.spuMainAttr.values[i].attributeValueResources);
                    }
                }
            }

            finalGoods['goods'] = goods;
            finalGoods['attributeValueResources'] = attrs;
            return finalGoods;
        }

        (function init() {

            if(spuId.length === 0) {
                alert('缺少spuId');
            }

            request.GET(API.dict.replace('{index}', 'UNIT'), {per_page: 10000}, function(responseData) {
                if(responseData.success) {
                    responseData.result.unshift({ 'name': '请选择', 'value': '' });
                    vm.unitData = responseData.result;
                }
                avalon.scan(document.body, vm);
            });

            request.GET(API.getSkuList.replace('{spuId}', spuId), function(responseData) {
                if (responseData.success) {
                    if(responseData.result.length > 0) {
                        vm.skuListData = vm.buildSkuData(responseData.result);
                    } else {
                        vm.skuListData = [{
                            attributes: [],
                            marketPrice: null,
                            name: null,
                            resources: null,
                            sales: null,
                            skuNo: null,
                            sn: null,
                            snKeyword: null,
                            spu: {
                                id: spuId
                            },
                            suppliers: null,
                            id: null,
                            resourceIds: [],
                            goodsShipPrices: [],
                            isEdit: true
                        }];
                    }
                    avalon.scan(document.body, vm);
                } else {
                    console.log(responseData.message);
                }
            });

            request.GET(API.getSpuDetail.replace('{id}', spuId), function(responseData) {
                if (responseData.success) {
                    vm.spuDetailData = responseData.result;
                    avalon.scan(document.body, vm);
                } else {
                    console.log(responseData.message);
                }
            });

            request.GET(API.getSpuAttrs.replace('{spuId}', spuId), function(responseData) {
                if (responseData.success) {
                    for(var i = 0; i < responseData.result.length; i++) {
                        if (responseData.result[i].mainStatus == 1) {
                            var data = responseData.result[i];
                            for(var j = 0; j < data.values.length; j++) {
                                if(!data.values[j].attributeValueResources) {
                                    data.values[j].attributeValueResources = [];
                                }
                            }
                            vm.spuMainAttr = data;
                            break;
                        }
                    }
                    console.log(responseData.result);
                    vm.spuAttributes = responseData.result;
                    avalon.scan(document.body, vm);
                } else {
                    console.log(responseData.message);
                }
            });

        }());

        avalon.scan(document.body, vm);
    });

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
                var vm = avalon.vmodels['goodsStepSKU'],
                    i = vm.checkedSkuIndex;

                vm.skuListData[i].resourceIds.push({
                    id: data.id,
                    resources: data.resources
                });

                vm.selectedSkuData.push({
                    id: data.id,
                    resources: data.resources
                });
                avalon.scan(document.body, vm);
            } else if(data.error.code == 10006) {
                urls.goLogin();
            }
        }
    });

    uploadify('#uploadAttrPic', {
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
                var vm = avalon.vmodels['goodsStepSKU'],
                    index = vm.checkedMainAttrIndex;

                if(0<=index && index<vm.spuMainAttr.values.length) {
                    vm.spuMainAttr.values[index].attributeValueResources.push({
                        resourcesId: data.id,
                        resources: data.resources
                    });
                }
            } else if(data.error.code == 10006) {
                urls.goLogin();
            }
        }
    });

});