require(['dialog/avalon.dialog'], function(avalon) {
    avalon.ready(function() {
        var surveyCtrl = avalon.define({
            $id: "surveyCtrl",
            currentNavInfo : 'index',
            expireInfo : '',
            dataList:{},
            init : function(){
                io.GET(apiConfig.rootUrl + 'link/'+urls.getParameter(window.location.href, 'id'),{key:urls.getParameter(window.location.href, 'key')},function(data){
                    if(data.success){
                        surveyCtrl.dataList = data.result; 
                        //有效期信息，格式(有效期：2016/10/31～2016/11/07)
                        surveyCtrl.expireInfo = "(有效期：" + data.result.createTime.substring(0,10) + "~" + data.result.invalidTime.substring(0,10) + ")";
                        avalon.scan();
                    }
                });
            },
            query : function(){
                var postData = {};
                postData.key = urls.getParameter(window.location.href, 'key');
                postData.offerList = [];
                for (var i = 0; i < surveyCtrl.dataList.offerList.length; i++) {
                        postData.offerList.push({
                            "id": surveyCtrl.dataList.offerList[i].id,
                            "purchasePrice": surveyCtrl.dataList.offerList[i].purchasePrice,
                            "shipMin": surveyCtrl.dataList.offerList[i].shipMin,
                            "shipMax": surveyCtrl.dataList.offerList[i].shipMax,
                            "remarks": surveyCtrl.dataList.offerList[i].remarks,
                            "sellerFeedback": surveyCtrl.dataList.offerList[i].sellerFeedback
                        });

                }
                //PATCH请求
                io.PATCH(apiConfig.rootUrl + 'link/submitOffer/'+urls.getParameter(window.location.href, 'id'), postData,
                function(data) {
                    if (data.success) {
                        surveyCtrl.openAlert('操作成功', true);
                    } else {
                        surveyCtrl.openAlert(data.message);
                    }
                },
                function (data) {
                    if(!data.success) {
                        surveyCtrl.openAlert(data.message);
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
                surveyCtrl.message = msg;
                surveyCtrl.closeFlag = close;
                avalon.vmodels['alertDialogCtrlId'].toggle = true;
            },
            onCloseAlert : function() {
                avalon.vmodels['alertDialogCtrlId'].toggle = false;
                if(surveyCtrl.closeFlag) {
                    window.close();
                }
            },
        });
        avalon.scan();
        surveyCtrl.init();
    });
});