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
    var orderSn = urls.getParamByKey("sn");
    var orderId = urls.getParamByKey("id");
    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require("oniui/loading/avalon.loading");
    require("oniui/validation/avalon.validation");
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
        var validationVM;
        var vm = avalon.define({
            $id: "orderDetail",
            orderInfo:{
                shippingCorpName:'',
                shopOrderItemDetailVOList:[]
            },
            shippingCorpName:'',
            $skipArray: ["validation"],
            isUserDefined:false,
            defineCorpName:'',
            validateNameError:false,
            validateTNoError:false,
            confirmReceivedMsg: 'ok',
            editingPrice:false,
            logisticCorpList:[],
            cancelReasonType:[],
            cancelReason:{},
            originFreight:0,
            originTotal:0,
            originShopItem:[],
            loading:{},
            showLoading:true,
            discount: '',
            loadingOpt:{
                modalBackground:'rgba(6,0,0,0.32)',
                modalOpacity:0
            },
            authorise:{
                canEditPrice:false,
                canEditShip:false,
                canCancelOrder:false
            },
            options:{
                '待支付':{
                    canEditPrice:true,
                    canEditShip:false,
                    canCancelOrder:true
                },
                '待发货':{
                    canEditPrice:false,
                    canEditShip:true,
                    canCancelOrder:true
                },
                '待收货':{
                    canEditPrice:false,
                    canEditShip:true,
                    canCancelOrder:true
                }
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
            opts1: {
                type: 'confirm',
                title: '取消订单',
                width:485,
                onOpen: function() {

                },
                onConfirm: function(){
                    var order = vm.orderInfo;
                    var cancelReason = vm.cancelReason;
                    if(!cancelReason.option){
                        return false;
                    }
                    request.PATCH(API.cancelOrder.replace('{orderId}', order.orderId),{
                        cancelReasonType:cancelReason.option,
                        cancelReason:cancelReason.reason
                    }, function(responseData){
                        var result = {
                            success:responseData.success,
                            message:responseData.message,
                            order:order
                        }
                        session.set('orderCancelResult',result);
                        if(responseData.success){
                            urls.goRef('/orderdetail/order-canceled-result.html');
                        }else{
                            vm.ckShowInfo('dlgOrderAlert', responseData.message);
                        }


                    });
                },
                onClose: function(){
                }
            },
            opts2:{
                type: 'confirm',
                title: '修改物流信息',
                width:485,
                onOpen: function() {

                },
                onConfirm: function(){
                    var orderInfo = vm.orderInfo;
                    var new_shippingCorpName = vm.shippingCorpName;
                    if(!vm.validateShipping()){
                        return false;
                    }
                    var params = '';
                    if(vm.isUserDefined){
                        params = '?logisticsCorp='+encodeURIComponent(vm.defineCorpName)+'&trackingNo='+orderInfo.trackingNo
                    }else{
                        params = '?logisticsCorp='+encodeURIComponent(new_shippingCorpName)+'&trackingNo='+orderInfo.trackingNo
                    }

                    request.PATCH(API.saveOrderLogistic.replace('{orderId}',orderId)+params, function(responseData) {
                        vm.orderInfo.shippingCorpName = vm.shippingCorpName;
                        if(responseData.success){
                            avalon.scan(document.body, vm);
                            console.log(responseData);
                        }else{
                            vm.ckShowInfo('dlgOrderAlert', responseData.message);
                            console.log(responseData.message);
                        }
                    });
                },
                onClose: function(){

                }
            },
            opts3:{
                type: 'confirm',
                title: '修改优惠单价',
                width:485,
                onOpen: function() {

                },
                onConfirm: function(){
                    var order = vm.orderInfo;
                    var shopItemList = vm.orderInfo.shopOrderItemDetailVOList;
                    var prices = [];
                    for(var i=0;i<shopItemList.length;i++){
                        prices.push({
                            "orderId": orderId,
                            "orderItemId": shopItemList[i].orderItemId,
                            "discountPrice": shopItemList[i].price,
                        })
                    }

                    var patchData = {
                        "orderId": orderId,
                        "discountFreight": isNaN(parseFloat(vm.orderInfo.freight))?0:vm.orderInfo.freight,
                        "shopOrderItemChangePriceVOList": prices
                    }

                    request.PATCH(API.changeShopOrderPrice, patchData, function(responseData) {
                        if(responseData.success){
                            vm.orderInfo.totalAmount = vm.getShopTotal();
                            avalon.scan(document.body, vm);
                            console.log(responseData);
                            vm.ckShowInfo('dlgOrderAlert', responseData.message);
                        }else{
                            //vm.revokePrice();
                            vm.ckShowInfo('dlgOrderAlert', responseData.message);
                            console.log(responseData.message);
                        }
                    });
                },
                onCancel:function(){
                    vm.orderInfo.shopOrderItemDetailVOList = vm.originShopItem;
                },
                onClose: function(){

                }
            },
            alertOpts:{
                type: 'confirm',
                title: '提示',
                width:485
            },
            validateShipping:function(){
                if(vm.isUserDefined){
                    if(!vm.defineCorpName){
                        vm.validateNameError = true;
                        return false;
                    }else{
                        vm.validateNameError = false;
                        return true;
                    }
                    vm.validateTNoError = true
                }else{//非公司自取
                    if(vm.orderInfo.trackingNo){
                        vm.validateTNoError = false
                        return true;
                    }else{
                        vm.validateTNoError = true
                        return false;
                    }

                }
            },
            getItemTotal:function(item){
                return parseFloat(item.quantity*item.price).toFixed(2);
            },
            getShopTotal:function(bFreight){
                var shopItemList = vm.orderInfo.shopOrderItemDetailVOList;
                var total = parseFloat(0.00);
                for(var i=0;i<shopItemList.length;i++){
                    var itemTotal = parseFloat(shopItemList[i].quantity * shopItemList[i].price).toFixed(2);
                    total = (parseFloat(itemTotal) + parseFloat(total)).toFixed(2);
                }

                if(bFreight && !isNaN(parseFloat(vm.orderInfo.freight))) {
                    total = (parseFloat(total)+parseFloat(vm.orderInfo.freight)).toFixed(2);
                }
                return total;
            },
            getUpdateItemName:function(){
                var result = "";
                var shopItemList = vm.orderInfo.shopOrderItemDetailVOList;
                var itemNames = [];
                for(var i=0;i<shopItemList.length;i++){
                    var itemTotal = parseFloat(shopItemList[i].quantity * shopItemList[i].price).toFixed(2);
                    if(shopItemList[i].totalPrice != itemTotal){
                        console.log("two item count price",shopItemList[i].totalPrice,itemTotal);
                        itemNames.push(shopItemList[i].goodsName);
                    }
                }
                if(itemNames.length>0){
                    result=itemNames.join(',') + "商品";
                }
                if(vm.originFreight != vm.orderInfo.freight) {
                    result += (result?"/":"") + "运费";
                }
                return result;
            },
            getCorpName:function(code){
                if(!code) {
                    return '<span>无</span>'
                } else {
                    for(var i=0;i<vm.logisticCorpList.length;i++){
                        var corp = vm.logisticCorpList[i];
                        if(corp.code == code){
                            return '<span>'+corp.name+'</span>';
                        }
                    }
                }
                return code;
            },
            saveShipping:function(){
                var orderInfo = vm.orderInfo;
                //FIXME
                var new_shippingCorpName = vm.shippingCorpName;
                if(!vm.validateShipping()){
                    return false;
                }
                var params = '';
                if(vm.isUserDefined){
                    params = '?logisticsCorp='+encodeURIComponent(vm.defineCorpName)+'&trackingNo='+orderInfo.trackingNo
                }else{
                    params = '?logisticsCorp='+encodeURIComponent(new_shippingCorpName)+'&trackingNo='+orderInfo.trackingNo
                }
                request.PATCH(API.saveOrderLogistic.replace('{orderId}',orderId)+params, function(responseData) {
                    if(responseData.success){
                        avalon.scan(document.body, vm);
                        urls.goRef('/orderdetail/order-detail.html?sn='+orderSn+'&id='+orderId);
                        console.log(responseData);
                    }else{
                        vm.ckShowInfo('dlgOrderAlert', responseData.message);
                        console.log(responseData.message);
                    }
                });
            },
            editShippingInfo:function(){
                vm.shippingCorpName = vm.orderInfo.shippingCorpName;
                vm.ckShowInfo('dlgEditShipping', '修改物流信息!');
            },
            ckShowInfo: function(id, msg){
                vm.confirmReceivedMsg = msg;
                avalon.vmodels[id].toggle = true;
            },
            confirmCancel: function(){
                vm.ckShowInfo('dlgConfirmCancelOrder', '确认取消订单');
            },
            confirmUpdatePrice: function(el){
                //vm.dlgInfo.el = el;
                vm.editingPrice = false;
                if(vm.getUpdateItemName()) {
                    vm.ckShowInfo('dlgConfirmUpdatePrice', '确认修改单价');
                }
            },
            goBack:function(){
                urls.goRef("/order/list.html");
            },
            editNewPrice:function(){
                vm.editingPrice = !vm.editingPrice;
                var shopItemList = vm.orderInfo.shopOrderItemDetailVOList;
                vm.originShopItem = [];
                for(var i =0;i<shopItemList.length;i++){
                    vm.originShopItem.push({
                        attributeSet:shopItemList[i].attributeSet,
                        brandSet:shopItemList[i].brandSet,
                        goodsName: shopItemList[i].goodsName,
                        orderItemId: shopItemList[i].orderItemId,
                        price:shopItemList[i].price,
                        quantity : shopItemList[i].quantity,
                        salePrice : shopItemList[i].salePrice,
                        skuSnSet : shopItemList[i].skuSnSet,
                        totalPrice : shopItemList[i].totalPrice,
                        unitName : shopItemList[i].unitName
                    })
                }
            }
        });

        vm.$watch("shippingCorpName", function(v) {
            if(v =='公司自送'){
                vm.isUserDefined = true;
            }else{
                vm.isUserDefined = false;
            }
        });

        (function init(){
            request.GET(API.getOrderInfo.replace('{orderSn}',orderSn), function(responseData) {
                vm.showLoading = false;
                if(responseData.success){
                    vm.orderInfo = responseData.result;
                    var rights = vm.options[vm.orderInfo.orderStatusName];
                    if(rights){
                        vm.authorise = rights;
                    }
                    vm.originFreight = vm.orderInfo.freight;
                    vm.originTotal = vm.orderInfo.totalAmount;
                    vm.shippingCorpName = vm.orderInfo.shippingCorpName;
                    avalon.scan(document.body, vm);
                }else{
                    console.log(responseData.message);
                }

            });

            request.GET(API.dict.replace('{index}', 'CANCEL_REASON_TYPE'), function(responseData) {
                //responseData.result.unshift({'name':'全部', 'value':''});
                vm.cancelReasonType = responseData.result;
                avalon.scan(document.body, vm);
            });

            request.GET(API.getLogistic,function(resp){
                if(resp.success){
                    vm.logisticCorpList = resp.result;
                    avalon.scan(document.body,vm);
                }else{
                    consolog.log(resp.message);
                }
            })
        }());



        avalon.scan(document.body, vm);
    });
});