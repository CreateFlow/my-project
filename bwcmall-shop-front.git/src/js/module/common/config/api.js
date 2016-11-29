'use strict';

define(function(require, exports, module) {

    var path = require('module/common/config/path'),
        basePath = path.bwcmallApi,
        api = {
            basePath: basePath
        },

        methods = {
            vreturn:                         '/v1/', //GET 获取字典值
            dict:                            '/v1/dict/{index}/item', //GET 获取字典值
            sellerInvoiceList:               '/v1/invoice/merchantInvoices', //GET 获取卖家发票列表
            countNoInvoice:                  '/v1/invoice/merchantInvoices/countNoInvoice', //GET 获取发票数量
            sellerInvoiceDetails:            '/v1/invoice/merchantInvoices/{invoiceId}', //GET 卖家发票详情
            sellerInvoiceUpdateAmount:       '/v1/invoice/merchantInvoices/{invoiceId}/updateInvoiceAmount', // POST 卖家修改开票金额
            sellerInvoiceConfirm:            '/v1/invoice/merchantInvoices/{invoiceId}/updateInvoiceNumber/{invoiceNumber}', //卖家确认开票
            logout:                          '/v1/auth/logout', //GET 用户注销
            updatePassword:                  '/v1/auth/updatePassword', //POST 修改密码
            getAfterSaleOrder:               '/v1/shop/afterSaleOrder', //GET 卖家各状态售后订单查询API
            getAfterSaleOrderById:           '/v1/shop/afterSaleOrder/{id}', // GET 卖家售后单详情（基本信息，商品信息，协商记录）
            getRejectReason:                 '/v1/shop/rejectReason', // GET 获取驳回理由API,auditType 1初审 2实物审核 3仅退款审核
            updateFirstAudit:                '/v1/shop/firstAudit/{id}', // PATCH 售后单初审API
            updatePhysicalAudit:             '/v1/shop/physicalAudit/{id}', // PATCH 实物审核API
            confirmReceived:                 '/v1/shop/afterSaleOrder/{id}/confirmReceived', //PATCH 确认收货
            shopPanorama:                    '/v1/shop/panorama', // GET 卖家全景数据
            setFreightFree:                  '/v1/shop/freightFree', //PUT
            getAreaById:                     '/v1/area/{id}', // GET 查询所有区域（根路径参数为0）
            upload:                          '/v1/buyer/service/upload', // POST 上传服务商三证图片（单个文件）
            queryCart:                       '/v1/cart/', // GET
            getOrderList:                    '/v1/shop/order/list',
            getOrderInfo:                    '/v1/shop/order/{orderSn}',
            getLogistic:                     '/v1/shop/order/logisticsList',
            saveOrderLogistic:               '/v1/shop/order/{orderId}/chooseLogistics',
            cancelOrder:                     '/v1/shop/order/{orderId}/cancel',
            changeShopOrderPrice:             '/v1/shop/order/changeShopOrderPrice',
            accountCredit:                   '/v1/account/credit',  //根据条件查询账期账户 创建
            accountCreditInfo:               '/v1/account/credit/{creditId}',  //根据ID查询账期账户
            accountCreditCustomer:           '/v1/account/credit/customer?keyword={keyword}', // 根据手机或名称查找用户
            accountCreditSummary:            '/v1/account/credit/summary', //获取授信总金额
            accountCreditAmount:             '/v1/account/credit/{creditId}/amount', //提升授信额度
            accountCreditEnable:             '/v1/account/credit/{creditId}/enable', //启用停用账期账户
            accountCreditPeriod:             '/v1/account/credit/{creditId}/period', //修改账期
            brand:                           '/v1/brand',
            brandSimpleData:                 '/v1/shop/brand/simpleData', //下拉框查询品牌信息
            brandUplpad:                     '/v1/shop/brand/upload', //上传品牌LOGO图片（单个文件）
            getBillSummary:                  '/v1/account/bill/summary',
            accountBillInfo:                 '/v1/account/bill/{billId}',
            getAcctBillList:                 '/v1/account/bill',
            confirmBill:                     '/v1/account/bill/{billId}/confirmPaid',
            exportBill:                      '/v1/account/bill/export',
            exportBills:                     '/v1/account/bill/{billId}/export',
            getSkuList:                      '/v1/shop/sku?spuId={spuId}',
            getSpuDetail:                    '/v1/shop/spu/{id}',
            getSpuAttrs:                     '/v1/shop/spu/spuAttrs/{spuId}',
            sku:                        '/v1/shop/sku',
            spu:                        '/v1/shop/spu',
            addAttr:                    '/v1/shop/attr/{id}/values',
            spuAttrId:                  '/v1/shop/spu/getSpuAttributeValueList/{id}',
            spuAttr:                    '/v1/shop/attr',  //SPU所有属性
            goodsType:                  '/v1/shop/spu/getSpuCategory',  // 商品分类
            goods:                      '/v1/shop/goods', //GET 查询商品
            goodsId:                    '/v1/shop/goods/{id}', //单个商品
            goodsOnShelf:               '/v1/shop/goods/onShelf', //POST 商品批量上架
            goodsOffShelf:              '/v1/shop/goods/offShelf', //POST 商品批量下架
            goodsPendingPrice:          '/v1/shop/goods/pendingPrice', //POST 商品批量待询价
            goodsSoldIn:                '/v1/shop/goods/soldIn', //POST 商品批量有货            
            goodsSoldOut:               '/v1/shop/goods/soldOut', //POST 商品批量售罄
            goodsSearch:                '/v1/shop/goods/search', //GET 指定品牌id，sn在es中查找商品brandId=?&sn=?
            goodsMarketStatus:          '/v1/shop/goods/marketStatusList', //GET 商品状态列表
            goodsSoldoutStatus:         '/v1/shop/goods/soldOutStatusList', //GET 售罄状态列表
            goodsExport:                '/v1/shop/goods/exportGoodsList', //GET 导出商品列表
            goodsSupplier:              '/v1/shop/goods/{id}/supplier', //GET 商品供应商
            goodsImport:                '/v1/shop/goods/goodsImport', //POST 批量导入商品
            goodsTemplate:              '/v1/shop/goods/import/template', //POST 批量处理的模板
            goodsTaskStatus:            '/v1/shop/goods/goodsImport/{task}', //GET 批量处理的状态
            goodsTaskData:              '/v1/shop/goods/goodsImport/{task}/data', //GET POST 批量处理的结果数据集
            goodsPrice:                 '/v1/shop/goods/batchModifyPrice', //POST 批量修改价格
            goodsPriceTaskStatus:       '/v1/shop/goods/batchModifyPrice/{task}', //GET 批量修改价格的状态
            goodsPriceTaskData:         '/v1/shop/goods/batchModifyPrice/{task}/data', //GET POST 批量价格处理的结果数据
            goodsImage:                 '/v1/image/upload', //POST 批量上传图片
            goodsImageTaskStatus:       '/v1/image/upload/{task}', //GET 批量上传图片的状态
            goodsImageTaskData:         '/v1/image/upload/{task}/data', //GET 批量上传图片的结果数据
            goodsStatistics:            '/v1/shop/goods/statistics', //获取店铺基本信息
            brandSpuCategory:           '/v1/shop/goods/category/{brandId}', //获取SPU分类
            exportSkuList:              '/v1/shop/goods/exportGoodsList', //POST 导出商品列表
            importGoods:                '/v1/shop/goods/goodsImport', //POST 批量导入商品信息
            getTaskStatus:              '/v1/shop/goods/goodsImport/{task}', //GET 批量导入商品任务状态
            getTaskResult:              '/v1/shop/goods/goodsImport/{task}/data', //批量导入商品任务预处理完成后,获取预处理后的数据,GET:josn 格式, POST：excel格式
            exportGoodsList:            '/v1/shop/goods/excel',
            editorUpoadImg:             '/v1/shop/avalon/image', 
            strategyList:               '/v1/shop/priceStrategy/strategyList', //价格策略列表
            createStrategy:             '/v1/shop/priceStrategy/createStrategy', //新增价格策略
            updateStrategy:             '/v1/shop/priceStrategy/updateStrategy', //更新策略
            removeStrategy:             '/v1/shop/priceStrategy/{strategyId}/removeStrategy', //价格策略列表
            shopGoodsStrategyList:      '/v1/shop/priceStrategy/shopGoodsStrategyList', //商品价格策略列表
            updateShopGoodsStrategy:    '/v1/shop/priceStrategy/updateShopGoodsStrategy',//商品策略价格更新
            shopBrandStrategyList:      '/v1/shop/priceStrategy/shopBrandStrategyList', //会员价格管理列表
            createStrategyCust:         '/v1/shop/priceStrategy/createStrategyCust',//添加客户进策略
            shopBrandStrategyCustList:  '/v1/shop/priceStrategy/shopBrandStrategyCustList',//策略客户列表
            removeStrategyCust:         '/v1/shop/priceStrategy/{strategyCustId}/removeStrategyCust'
        };

    Object.keys(methods).forEach(function(name, i) {
        var url,
            value = methods[name];

        if (typeof value === 'string') {
            api[name] = basePath + value;
        } else {
            api[name] = value;
            api[name].url = basePath + value.url;
        }

    });

    return api;

});