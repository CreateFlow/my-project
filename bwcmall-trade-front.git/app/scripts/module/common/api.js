'use strict';

(function(window) {
    jQuery.support.cors = true;
    var basePath = 'http://earth.dev.bwcmall.cn/api',
        api = {},
        methods = {
            login:                  '/v1/auth/login',
            phoneExist:             '/v1/customer/phone/',
            verificationCode:       '/v1/verificationCode',
            verificationCodeById:   '/v1/verificationCode/{id}', // GET 检查验证码是否正确
            reg:                    '/v1/customer/',
            logout:                 '/v1/auth/logout',
            checkAuth:              '/v1/auth/check',
            queryCart:              '/v1/cart/',
            queryCartList:          '/v1/cart/items',
            editCart:               '/v1/cart/items/',
            addCart:                '/v1/cart/items',
            deleteMutCartIem:       '/v1/cart/items',
            getCmsGoods:            '/v1/cms/cmsGoods', //获取首页轮播商品列表
            getActivity:            '/v1/cms/cmsProduct',
            cmsBrand:               '/v1/cms/cmsBrand',
            product:                '/v1/product' ,
            queryPrice:             '/v1/product/priceQuery' , //GET 查询价格
            queryCartNum:           '/v1/cart/items',
            indexNavList:           '/v1/cms/cmsCategoryNavigation',
            brand:                  '/v1/brand',   //查询品牌列表
            brandNav:               '/v1/brand/navigation',
            listCart:               '/v1/cart/items/',
            queryCustomerPanorama:  '/v1/customer/panorama',
            favoriteList:           '/v1/cart/items',
            productAutoComplete:    '/v1/product/search',
            productPriceQuery:      '/v1/product/priceQuery',
            orderExport:            '/v1/order/export/',
            orderDeltail:           '/v1/order/',
            upload:                 '/v1/buyer/service/upload',
            buyerReg:               '/v1/buyer/service',
            isBuyerExist:           '/v1/buyer/service/corpName/{corpName}', //GET 判断注册的公司名称是否已经存在
            getBusinessCategory:    '/v1/buyer/service/businessCategory',
            getOrderList:           '/v1/order',
            basePath:               '',
            addresses:              '/v1/customer/custAddress',
            orderCreate:            '/v1/order/create',
            order_submit:           '/v1/order/confirm',
            shippingReceived:       '/v1/shipping/shippingReceived/',
            searchsuggest:          '/v1/suggest',
            searchsuggesthover:     '/v1/suggest/',
            saveshoppingList:       '/v1/customer/shoppingList',
            shoppingList:           '/v1/customer/shoppingList/',
            returnOrderInfo:        '/v1/afterSale/',
            returnOrderItemList:    '/v1/afterSale/',
            returnList:             '/v1/afterSale/',
            returnCreate:           '/v1/afterSale/',
            returnPatch:            '/v1/afterSale/',
            returnReasonList:       '/v1/afterSale/',
            buyerConfirmDeliver:    '/v1/afterSale/buyerConfirmDeliver',
            buyerConfirmRecive:     '/v1/afterSale/buyerConfirmReceiver',
            getlogisticCorp:        '/v1/shipping/logisticCorp',
            invoiceAPI:             '/v1/customer/custInvoice',
            invoice:                '/v1/customer/invoice',
            invoiceTotal:           '/v1/customer/invoice/total',
            rootUrl:                '/v1/',
            exportBills:            '/v1/account/bill/{billId}/export', //POST
            mainCategory:           '/v1/category', //GET注册时的主营品类
            checkRecommend:         '/v1/customer/recommend/', //GET /{number} 检查手机号是否能够被推荐
            trackUserHobby:         '/v1/minions' //POST

        };

    $.each( keys(methods), function(i, name) {
        var url,
            value = methods[name];

        if (typeof value === 'string') {
            api[name] = basePath + value;
        } else {
            api[name] = value;
            api[name].url = basePath + value.url;
        }

    });

    function keys(o) {
        var p, hasOwn, k;
        if (Object.keys) return Object.keys(o);
        if (typeof o === 'object') {
            hasOwn = Object.prototype.hasOwnProperty;
            k = [];
            for (p in o) {
                if ( hasOwn.call(o, p) ) {
                    k.push(p);
                }
            }

            return k;
        } else {
            throw new Error('Target isn\'t a object type!');
        }
    }

    // var api = {
    //     queryCart: {
    //         url: root + '/v1/cart/',
    //         type:'post',
    //         authorized: true
    //     }
    // };
    // io.requestAPI(api, function(data) {});

    window.apiConfig = api;
    window.payUrl = 'http://pay.earth.dev.bwcmall.cn/payment/payment.html';

}(this));
