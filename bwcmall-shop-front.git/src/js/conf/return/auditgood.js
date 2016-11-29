'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        uploadify = require('module/common/uploadify/uploadify'),
        urls = require('module/common/utils/url');

    var urlid = urls.getParamByKey("id");


    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dropdown/avalon.dropdown');
    require('lib/plugins/lightbox/js/lightbox.min');

    avalon.ready(function () {
        var vm = avalon.define({
            $id          : "auditgood",

            reasonTypeList  : [],
            refusePicList: [],
            result  : '',
            auditResult : '', // 1，2，3 顺序和界面一致 ,
            refuseReasonType : 1, //驳回理由类型 ,
            refuseReason :'', // 驳回理由说明 ,
            resourceId :[], // 图片资源id ,
            salerConsignee :'', // 卖家收件人 ,
            salerAreaId :'', // 卖家收获区域 ,
            salerAddress :'', // 卖家收货地址 ,
            salerPhone :'', // 卖家联系电话 ,
            freightAssumeType :'', // 运费承担类型(0买家承担1卖家承担),code=FREIGHT_ASSUME_TYPE ,
            remarks :'', // 协商补充说明 ,
            logisticCorp :'', // 物流公司ID ,
            logisticCorpRemark :'', // 物流公司备注 ,
            trackingNo :'', // 运单号
            


            //tab切换
            currentTab   : 'tab1',
            //tab数据
            currentData  : [{
                "text": "驳回申请",
                "value": "tab1"
            }, {
                "text": "同意换货",
                "value": "tab2"
            }, {
                "text": "协商重新修改退换货请求",
                "value": "tab3"
            }],
            //tab切换
            changeTab : function(value) {
                vm.currentTab = value;
            },

            //tab切换
            postTab   : '0',
            postData  : [{
                "text": "买家",
                "value": "0"
            }, {
                "text": "卖家",
                "value": "1"
            }],
            changePostTab : function(value) {
                vm.postTab = value;
            },

            cancel: function() {
                urls.goRef("/aftersale/list.html");
            },

            submit : function() {
                if (vm.currentTab == 'tab3') {
                    if (vm.remarks == '') {
                        alert('协商补充说明不能为空');
                        return false;
                    };
                    var serData = {
                        "auditResult": 3,
                        "remarks": vm.remarks
                    };
                    request.PATCH(API.vreturn + 'shop/physicalAudit/'+ urlid, JSON.stringify(serData),
                        function(data) {
                            if (data.success) {
                                alert('操作成功');
                                urls.goRef("/aftersale/list.html");
                            } else {
                                alert('操作失败');
                            }
                        }
                    );
                }else if (vm.currentTab == 'tab2') {
                    if (vm.result.afterSaleType == '0') {
                        var serData = {
                            "auditResult": 2
                        };
                    }else{
                        var serData = {
                            "auditResult": 2,
                            "freightAssumeType": vm.postTab
                        };
                    };
                    
                    request.PATCH(API.vreturn + 'shop/physicalAudit/'+ urlid, JSON.stringify(serData),
                        function(data) {
                            if (data.success) {
                                alert('操作成功');
                                urls.goRef("/aftersale/list.html");
                            } else {
                                alert('操作失败');
                            }
                        }
                    );
                }else{
                    var serData = {
                        "auditResult": 1,
                        "refuseReasonType": vm.refuseReasonType,
                        "refuseReason": vm.refuseReason,
                        "logisticCorp": vm.logisticCorp,
                        "logisticCorpRemark": vm.logisticCorpRemark,
                        "trackingNo": vm.trackingNo,
                        'resourceId'  : vm.resourceId
                    };
                    request.PATCH(API.vreturn + 'shop/physicalAudit/'+ urlid, JSON.stringify(serData),
                        function(data) {
                            if (data.success) {
                                alert('操作成功');
                                urls.goRef("/aftersale/list.html");
                            } else {
                                alert('操作失败');
                            }
                        }
                    );
                };
            }
        });

        uploadify('#refusePic', {
            uploader: API.upload,
            buttonText: '上传',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
                    avalon.vmodels['auditgood'].refusePicList.push({id: data.id,  resources: data.resources});
                    avalon.vmodels['auditgood'].resourceId.push(data.id);
                }

            }
        });

        
        
        request.GET(API.vreturn + 'shop/rejectReason?auditType=2', function(responseData) {

            if (responseData.success) {
                vm.reasonTypeList = responseData.result;
                avalon.scan();
                request.GET(API.getAfterSaleOrder+'/' + urlid, function(responseData) {
                    if (responseData.success) {
                        vm.result = responseData.result;

                        if (vm.result.afterSaleType == '0') {
                            vm.currentData[1].text = '同意退货退款';
                        };
                            
                        avalon.scan(document.body, vm);
                    }
                });
            }
        });

        
    });
});

