'use strict';

(function(window) {
    jQuery.support.cors = true;
    var basePath = 'http://api.admin.earth.dev.bwcmall.cn/api',
        api = {},
        methods = {
            rootUrl:                '/v1/',
            login:                  '/v1/auth/login',
            logout:                 '/v1/auth/logout',
            requirement:            '/v1/requirement',
            brand:                  '/v1/brand',
            category:               '/v1/category', //GET  商品分类
            vendors:                '/v1/requirement/seller', //GET 供货商（供应商&店铺）列表
            shop:                   '/v1/shop/{id}', //GET 详情
            supplier:               '/v1/supplier', //POST 新增临时供应商; '{id}':GET/PUT 获取/修改临时供应商信息
            shopGoods:              '/v1/requirement/shop/{shopId}/goods', //GET 查询店铺商品
            supplierGoods:          '/v1/requirement/supplier/{supplierId}/goods', //GET 查询供应商供应的商品
            requirementUrlOfferList:'/v1/requirement/requirementUrlOfferList', // 待询价项-列表
            requirementUrlSupplier: '/v1/requirement/requirementUrlSupplier',  //待询价项-供应商下拉列表
            batchRequirementUrl:    '/v1/requirement/batchRequirementUrl', //批量生成链接
            batchSearchBrand:       '/v1/requirement/supplier/batchSearchBrand', //GET
            batchCreateTempGoods:   '/v1/requirement/batchCreateTempGoods', //POST
            batchCanNotProcess:     '/v1/requirement/item/batchCanNotProcess', //PATCH
            closeRequirement:       '/v1/requirement/{requirementId}/close', //PATCH
            getSupplierByBrand:     '/v1/supplier/{brandId}/getByBrandId', //GET
            dict:                   '/v1/dict',
            upload:                 '/v1/requirement/upload'

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

    window.apiConfig = api;

}(this));
