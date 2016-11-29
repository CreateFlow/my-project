require(["dialog/avalon.dialog","spinner/avalon.spinner"], function(avalon) {
    avalon.ready(function() {
        var offerCtrl = avalon.define({
            $id: "offerCtrl",
            currentNavInfo : 'index',
            allstatus : 0,
            dataList:{},
            addressIndex : 0,
            showItem : false,
            remark : '',
            expireInfo : '',
            totalAmount : '0.00',
            $spinnerOpts : {
                width : 60,
                min: 0,
                max: 1000000,
                onDecrease : function(value) {
                    offerCtrl.calcTotalAmount();
                },
                onIncrease : function(value) {
                    offerCtrl.calcTotalAmount();
                }
            },
            init : function(){
                io.GET(apiConfig.rootUrl + 'link/'+urls.getParameter(window.location.href, 'id'),{key:urls.getParameter(window.location.href, 'key')},function(data){
                    if(data.success){
                        var dataList = [];
                        for(var item=0; item<data.result.requirementItemVOs.length; item++) {
                            dataList.push({itemRow: true,
                                            brandName: data.result.requirementItemVOs[item].brandName,
                                            itemName: data.result.requirementItemVOs[item].itemName,
                                            skuSnSet:data.result.requirementItemVOs[item].skuSnSet,
                                            unit:data.result.requirementItemVOs[item].unit,});
                            dataList = dataList.concat(data.result.requirementItemVOs[item].itemOfferList);
                        }
                        data.result.offerList = dataList;
                        offerCtrl.dataList = data.result; 

                        //有效期信息，格式(有效期：2016/10/31～2016/11/07)
                        offerCtrl.expireInfo = "(有效期：" + data.result.createTime.substring(0,10) + "~" + data.result.invalidTime.substring(0,10) + ")";
                        avalon.scan();
                    }
                });
            },
            checkaddress : function(id){
                offerCtrl.addressIndex = id;
            },
            checkout : function(id){
                if (!offerCtrl.dataList.offerList[id].status) {
                    offerCtrl.dataList.offerList[id].status = true; 
                    offerCtrl.allstatus = true;
                    for (var i = 0; i < offerCtrl.dataList.offerList.length; i++) {
                        if (!offerCtrl.dataList.offerList[i].status) {
                            offerCtrl.allstatus = false;
                        };
                    }
                }else{
                    offerCtrl.dataList.offerList[id].status = false; 
                    offerCtrl.allstatus = false;
                };
                offerCtrl.calcTotalAmount();
            },
            checkoutall : function(){
                if (!offerCtrl.allstatus) {
                    offerCtrl.allstatus = true;
                    for (var i = 0; i < offerCtrl.dataList.offerList.length; i++) {
                        offerCtrl.dataList.offerList[i].status = true; 
                    }
                    offerCtrl.calcTotalAmount();
                }else{
                    offerCtrl.totalAmount = '0.00';
                    offerCtrl.allstatus = false;
                    for (var i = 0; i < offerCtrl.dataList.offerList.length; i++) {
                        offerCtrl.dataList.offerList[i].status = false;
                    }
                };
                
            },
            calcTotalAmount : function(){
                var totalAmount = 0.0;
                for (var i = 0; i < offerCtrl.dataList.offerList.length; i++) {
                    if (offerCtrl.dataList.offerList[i].status && !offerCtrl.dataList.offerList[i].itemRow) {
                        totalAmount += offerCtrl.dataList.offerList[i].requiredQuantity*offerCtrl.dataList.offerList[i].salePrice;
                    };                     
                }
                offerCtrl.totalAmount = totalAmount.toFixed(2);
            },
            query : function(){
                var postData = {};
                postData.key = urls.getParameter(window.location.href, 'key');
                postData.remark = offerCtrl.remark;
                postData.offerList = [];
                for (var i = 0; i < offerCtrl.dataList.offerList.length; i++) {
                    if (offerCtrl.dataList.offerList[i].status && !offerCtrl.dataList.offerList[i].itemRow) {
                        postData.offerList.push({
                            "id": offerCtrl.dataList.offerList[i].id,
                            "requiredQuantity": offerCtrl.dataList.offerList[i].requiredQuantity
                        });

                    };                     
                }
                if (offerCtrl.dataList.custAddressList.length >0) {
                    postData.custAddressId = offerCtrl.dataList.custAddressList[offerCtrl.addressIndex].id;
                } else {
                    offerCtrl.openAlert("请先添加收货地址。");
                }
                if (postData.offerList.length > 0) {
                    io.PATCH(apiConfig.rootUrl + 'link/createOrder/'+urls.getParameter(window.location.href, 'id'), postData,
                function(data) {
                        if (data.success) {
                            offerCtrl.openAlert('操作成功', true);
                        } else {
                            offerCtrl.openAlert(data.message);
                        }
                    },
                    function (data) {
                        if(!data.success) {
                            offerCtrl.openAlert(data.message);
                        }
                    });
                }else{
                    offerCtrl.openAlert("请选中要下单的商品");
                }
                
            },
            notBuy : function(){
                var postData = {};
                postData.key = urls.getParameter(window.location.href, 'key');
                postData.remark = offerCtrl.remark;
                //PATCH请求
                io.PATCH(apiConfig.rootUrl + 'link/notBuy/'+urls.getParameter(window.location.href, 'id'), postData,
                function(data) {
                    if (data.success) {
                        offerCtrl.openAlert('操作成功');
                    } else {
                        offerCtrl.openAlert(data.message);
                    }
                },
                function (data) {
                    if(!data.success) {
                        offerCtrl.openAlert(data.message);
                    }
                });
            },

            $alertDialogOption: {
                title: '提示信息',
                draggable: true,
                showClose: true,
                width: 300,
                zIndex: 100,
                isTop: true,
            },
            message : "",
            closeFlag : false,
            openAlert : function(msg, close) {
                offerCtrl.message = msg;
                offerCtrl.closeFlag = close;
                avalon.vmodels['alertDialogCtrlId'].toggle = true;
            },
            onCloseAlert : function() {
                avalon.vmodels['alertDialogCtrlId'].toggle = false;
                if(offerCtrl.closeFlag) {
                    window.close();
                }
            },
        });
        avalon.scan();
        offerCtrl.init();
    });
});