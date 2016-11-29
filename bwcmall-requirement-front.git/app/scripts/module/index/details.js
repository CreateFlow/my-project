require(['dialog/avalon.dialog'], function(avalon) {
    avalon.ready(function() {
        var detailsCtrl = avalon.define({
            $id: "detailsCtrl",
            currentNavInfo : 'index',
            dataList:{},
            allstatus: false,
            init : function(){
                io.GET(apiConfig.rootUrl + 'requirement/'+urls.getParameter(window.location.href, 'id'),function(data){
                    if(data.success){
                        detailsCtrl.dataList = data.result; 
                        avalon.scan();
                    }
                });
            },
            checkout : function(fid,id){
                if (!detailsCtrl.dataList.requireItemList[fid].itemOfferList[id].status) {
                    detailsCtrl.dataList.requireItemList[fid].itemOfferList[id].status = true; 
                    detailsCtrl.allstatus = true;
                    for (var i = 0; i < detailsCtrl.dataList.requireItemList.length; i++) {
                        if (detailsCtrl.dataList.requireItemList[i].itemOfferList) {
                            for (var j = 0; j < detailsCtrl.dataList.requireItemList[i].itemOfferList.length; j++) { 
                                if (!detailsCtrl.dataList.requireItemList[i].itemOfferList[j].status) {
                                    detailsCtrl.allstatus = false;
                                };
                            }
                        }
                    }
               }else{
                    detailsCtrl.dataList.requireItemList[fid].itemOfferList[id].status = false; 
                    detailsCtrl.allstatus = false;
               };
                
            },
            checkall : function(){
                if (!detailsCtrl.allstatus) {
                    detailsCtrl.allstatus = true;
                    if (detailsCtrl.dataList.requireItemList) {
                        for (var i = 0; i < detailsCtrl.dataList.requireItemList.length; i++) {
                            if (detailsCtrl.dataList.requireItemList[i].itemOfferList) {
                                for (var j = 0; j < detailsCtrl.dataList.requireItemList[i].itemOfferList.length; j++) {
                                    detailsCtrl.dataList.requireItemList[i].itemOfferList[j].status = true; 
                                }
                            };
                        }
                    };
                    
                }else{
                    detailsCtrl.allstatus = false;
                    if (detailsCtrl.dataList.requireItemList) {
                        for (var i = 0; i < detailsCtrl.dataList.requireItemList.length; i++) {
                            if (detailsCtrl.dataList.requireItemList[i].itemOfferList) {
                                for (var j = 0; j < detailsCtrl.dataList.requireItemList[i].itemOfferList.length; j++) {
                                    detailsCtrl.dataList.requireItemList[i].itemOfferList[j].status = false; 
                                }
                            }
                        }
                    }
                };
                
            },
            closeRequirement : function() {
                io.PATCH(apiConfig.closeRequirement.replace("{requirementId}", urls.getParameter(window.location.href, 'id')),
                    function(data) {
                        if (data.success) {
                            detailsCtrl.dataList.requireStatusDesc = "已完成";
                            detailsCtrl.dataList.requireStatus = 2;
                            detailsCtrl.openAlert('操作成功');
                        } else {
                            detailsCtrl.errorInfo = data.message;
                            detailsCtrl.openAlert(data.message);
                        }
                    },
                    function (data) {
                        if(!data.success) {
                            detailsCtrl.openAlert(data.message);
                        }
                    });
            },
            matchmaking : function(){
                var postData = {};
                postData.ids  = [];
                for (var i = 0; i < detailsCtrl.dataList.requireItemList.length; i++) {
                    for (var j = 0; j < detailsCtrl.dataList.requireItemList[i].itemOfferList.length; j++) {
                        if (detailsCtrl.dataList.requireItemList[i].itemOfferList[j].status) {
                            postData.ids.push(detailsCtrl.dataList.requireItemList[i].itemOfferList[j].id);
                        };
                        
                    }
                    
                };
                if (postData.ids.length > 0) {
                    io.POST(apiConfig.rootUrl + 'requirement/matchmakingTrading',postData,function(data){
                        if(data.success){
                            detailsCtrl.openAlert("撮合成功");
                        }
                    },
                    function (data) {
                        if(!data.success) {
                            detailsCtrl.openAlert(data.message);
                        }
                    });
                }else{
                    detailsCtrl.openAlert("请选中要撮合的商品");
                }
                
            },
            survey : function(){
                var postData = {};
                postData.urlType = 0;
                postData.offerList  = [];
                for (var i = 0; i < detailsCtrl.dataList.requireItemList.length; i++) {
                    if (detailsCtrl.dataList.requireItemList[i].itemOfferList) {
                        for (var j = 0; j < detailsCtrl.dataList.requireItemList[i].itemOfferList.length; j++) {
                            if (detailsCtrl.dataList.requireItemList[i].itemOfferList[j].status
                                &&detailsCtrl.dataList.requireItemList[i].itemOfferList[j].goodsId
                                &&((detailsCtrl.dataList.requireItemList[i].itemOfferList[j].shopId=='1'&&detailsCtrl.dataList.requireItemList[i].itemOfferList[j].supplierId)
                                    ||(detailsCtrl.dataList.requireItemList[i].itemOfferList[j].shopId&&detailsCtrl.dataList.requireItemList[i].itemOfferList[j].shopId!='1'))) {
                                postData.offerList.push({
                                    "id": detailsCtrl.dataList.requireItemList[i].itemOfferList[j].id,
                                });
                            };
                            
                        }
                    };
                    
                    
                };
                if (postData.offerList.length > 0) {
                    io.POST(apiConfig.rootUrl + 'requirement/requirementUrl',postData,function(data){
                        if(data.success){
                        
                            window.open ( "/link/survey.html?id="+data.result.id+"&key="+data.result.key, "_blank" ) ;
                        }
                    },
                    function (data) {
                        if(!data.success) {
                            detailsCtrl.openAlert(data.message);
                        }
                    });
                }else{
                    detailsCtrl.openAlert("请选中要生成询价链接的商品");
                };
                
            },
            offer : function(){
                var postData = {};
                postData.urlType = 1;
                postData.offerList  = [];
                for (var i = 0; i < detailsCtrl.dataList.requireItemList.length; i++) {
                    if (detailsCtrl.dataList.requireItemList[i].itemOfferList) {
                        for (var j = 0; j < detailsCtrl.dataList.requireItemList[i].itemOfferList.length; j++) {
                            if (detailsCtrl.dataList.requireItemList[i].itemOfferList[j].status&&detailsCtrl.dataList.requireItemList[i].itemOfferList[j].goodsId) {
                                postData.offerList.push({
                                    "id": detailsCtrl.dataList.requireItemList[i].itemOfferList[j].id,
                                    "salePrice": detailsCtrl.dataList.requireItemList[i].itemOfferList[j].salePrice
                                });
                            };
                            
                        }
                    };
                    
                };
                if (postData.offerList.length > 0) {
                    io.POST(apiConfig.rootUrl + 'requirement/requirementUrl',postData,function(data){
                        if(data.success){
                            window.open ("/link/offer.html?id="+data.result.id+"&key="+data.result.key, "_blank" ) ;
                            
                        }
                    },
                    function (data) {
                        if(!data.success) {
                            detailsCtrl.openAlert(data.message);
                        }
                    });
                }else{
                    detailsCtrl.openAlert("请选中要生成报价链接的商品");
                }
                
            },


            //提示框
            $alertDialogOption: {
                title: '提示信息',
                draggable: true,
                showClose: true,
                width: 300,
                zIndex: 100,
                isTop: true,
            },
            message : '',
            openAlert : function(msg) {
                detailsCtrl.message = msg;
                avalon.vmodels['alertDialogCtrlId'].toggle = true;
            },
            onCloseAlert : function() {
                avalon.vmodels['alertDialogCtrlId'].toggle = false;
            },
        });
        avalon.scan();
        detailsCtrl.init();
    });
});