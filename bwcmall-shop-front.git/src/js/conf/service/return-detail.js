'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        urls = require('module/common/utils/url');

    require('lib/plugins/lightbox/js/lightbox');

    // 加载框架组件
    require('module/common/ui/scaffolding');

	avalon.ready(function () {
	    var vm = avalon.define({
		    		$id: "returnDetail",
				    contactBuyer: function() {
    					//TODO
    					alert("联系卖家！");
    				},

    				close: function() {
    					urls.goRef("/aftersale/list.html");
    				},

		    		result: {
		    					afterSaleType: 0,
		    					sn: "S887766556",
		    					orderSn: "D887766556",
		    					afterSaleItem:[
			    					{
			    						goodsName: "扳手",
			    						mainImage: "/images/logo.png",
			    						brandSet: "博世",
			    						skuSnSet: "SN12345566",
			    						skuNoSet: "No956844",
			    						returnQuantity: "2",
			    						unitName: "台",
			    						price: "100.99"
			    					},
			    					{
			    						goodsName: "扳手2",
			    						mainImage: "/images/logo.png",
			    						brandName: "博世2",
			    						brandSet: "SN123455662",
			    						skuNoSet: "No9568442",
			    						returnQuantity: "22",
			    						unitName: "盒",
			    						price: "200.99"
			    					},
		    					],
		    					afterSaleLog: [
						            {
						                ownerType: "买家",
						                createTime: "2016-06-13 10:36:59",
						                createName: "zhoulan",
						                orderAfterStatus: 0,
						                afterSaleType: 0,
						                afterSaleTypeDesc: "退货退款",
						                afterTypeCauseReason: "其他原因",
						                reason: "型号选错了,我要退款",
						                amount: 200,
						                messages: [
						                    "买家zhoulan 发起了 退货退款 请求 ",
						                    "退货退款原因：其他原因",
						                    "说明：型号选错了,我要退款"
						                ],
						                buyerOrSalerRes: [
						                	"http://img2.bwcmall.com/img/PrivateImage/2016/07a/db9/155495766ce_1c45f7d9ce533d.png",
						                ]
						            }
						        ],
		    				},		    				
	    		});

	    var apiUrl = API.getAfterSaleOrderById.replace('{id}', urls.getParamByKey("id"));
	    request.GET(apiUrl, function(responseData) {
	    	if(responseData.success) {
		    	avalon.vmodels["returnDetail"].result = responseData.result;
		    	avalon.scan(document.body, vm);
		    } else {
		    	alert(responseData.message);
		    }
	    });

	   //avalon.scan(document.body, vm);
	});
});