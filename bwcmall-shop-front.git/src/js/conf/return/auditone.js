'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        urlUtils = require('module/common/utils/url'),
        uploadify = require('module/common/uploadify/uploadify'),
        API = require('module/common/config/api'),
        AREA = require('module/common/config/area'),
        urls = require('module/common/utils/url'),

        urlid = urls.getParamByKey("id"),
        firstDropdowns = [],
        secondDropdowns = [],
        thirdDropdowns = [],
        provinces = AREA,
        cities = clone(provinces[0].c),
        regions = clone(cities[0].c);

    // 加载框架组件
    require('module/common/ui/scaffolding');
    // 加载oniui
    require('oniui/dropdown/avalon.dropdown');
    require('lib/plugins/lightbox/js/lightbox.min');
    // 3776123234857517056
    // afterSaleType: 0(退换货),1(仅退款),2(换货)

    avalon.ready(function () {

        var vm = avalon.define({
            $id: "auditone",
            afterSale: {},
            //tab切换
            currentTab: 'tab1',
            reasonType: '',
            reasonTypeList: [],
            provinces: provinces,
            provincesValue: '',
            cities: cities,
            citiesValue: '',
            regions: regions,
            regionsValue: '',
            refusePicList: [],
            result: '',
            auditResult: '', // 1，2，3 顺序和界面一致 ,
            refuseReasonType: 0, //驳回理由类型 ,
            refuseReason: '', // 驳回理由说明 ,
            resourceId: [], // 图片资源id ,
            salerConsignee: '', // 卖家收件人 ,
            salerAreaId: '', // 卖家收获区域 ,
            salerAddress: '', // 卖家收货地址 ,
            salerPhone: '', // 卖家联系电话 ,
            freightAssumeType: '', // 运费承担类型(0买家承担1卖家承担),code=FREIGHT_ASSUME_TYPE ,
            remarks: '', // 协商补充说明 ,
            logisticCorp: '', // 物流公司ID ,
            logisticCorpRemark: '', // 物流公司备注 ,
            trackingNo: '', // 运单号
            returnable: true,
            $provinceOpt: {
                onInit: function (el) {
                    firstDropdowns.push(el.$id);
                },
                onChange: function (val, old, dpVm) {
                    var citiesDropdown = avalon.vmodels[secondDropdowns[0]],
                        citiesSource = getAreaValueByParent(provinces, val);

                    vm.cities = citiesSource;
                    citiesDropdown.source = [];
                    citiesDropdown.source = avalon.mix(true, [], citiesSource);
                }
            },
            $cityOpt: {
                onInit: function (el) {
                    secondDropdowns.push(el.$id)
                },
                onChange: function (val, old, dpVm) {
                    var regionDropdown = avalon.vmodels[thirdDropdowns[0]],
                        regionSource = getAreaValueByParent(vm.cities, val);

                    regionDropdown.source = [];
                    regionDropdown.source = avalon.mix(true, [], regionSource);
                }
            },
            $regionOpt: {
                onInit: function (el) {
                    thirdDropdowns.push(el.$id)
                }
            },
            //tab数据
            currentData  : [
                {
                    "text": "驳回申请",
                    "value": "tab1"
                },
                {
                    "text": "同意买家发货",
                    "value": "tab2"
                },
                {
                    "text": "协商重新修改退换货请求",
                    "value": "tab3"
                }
            ],
            //tab切换
            changeTab: function(value) {
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
            submit: function() {
                if (vm.currentTab == 'tab3') {
                    if (vm.remarks == '') {
                        alert('协商补充说明不能为空');
                        return false;
                    };
                    var serData = {
                        "auditResult": 3,
                        "remarks": vm.remarks
                    };
                    request.PATCH(API.vreturn + 'shop/firstAudit/'+ urlid, JSON.stringify(serData),
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
                    var serData = {
                        "auditResult": 2,
                        "freightAssumeType": vm.postTab,
                        "salerAreaId" : vm.regionsValue,
                        "salerAddress" : vm.salerAddress,
                        "salerConsignee" : vm.salerConsignee,
                        "salerPhone" : vm.salerPhone
                    };
                    request.PATCH(API.vreturn + 'shop/firstAudit/'+ urlid, JSON.stringify(serData),
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
                        'resourceId'  : vm.resourceId

                    };
                    request.PATCH(API.vreturn + 'shop/firstAudit/'+ urlid, JSON.stringify(serData),
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

        var params = urlUtils.getParams(),
            afterSaleOrderUrl = API.getAfterSaleOrderById.replace(/\{.+\}/, params.id);

        request.GET(API.getRejectReason, {auditType: 1}, function(responseData) {
            if (responseData.success) {
                vm.reasonTypeList = responseData.result;
                avalon.scan();
               // 调用接口
                request.GET(afterSaleOrderUrl, function(responseData) {
                    if (responseData.success) {
                        vm.afterSale = getAfterSaleData(responseData.result);
                        vm.afterSale.afterSaleItem.forEach(function(item) {
                            if('1' != item.canReturn) {
                                vm.returnable = false;
                            }
                        });

                        avalon.scan(document.body, vm);
                    }
                });
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
                    avalon.vmodels['auditone'].refusePicList.push({id: data.id,  resources: data.resources});
                    avalon.vmodels['auditone'].resourceId.push(data.id);
                }

            }
        });

    });

    function clone(o) {
        return JSON.parse( JSON.stringify(o) );
    }

    function getIndexByProp(list, val, prop) {
        var i = 0, item,
            len = list.length;

        prop = prop || 'value';
        val = Number(val);

        for (; i < len; i += 1) {
            item = list[i];
            if (item[prop] === val) {
                return i;
            }
        }
    }

    function getAreaValueByParent(list, val, prop) {
        var index = getIndexByProp(list, val, prop);
        if (typeof index !== 'undefined') {
            return list[index].c;
        }
    }

    function getAfterSaleData(data) {
        if (typeof data === 'undefined') {
            throw new Error('返回数据为空!');
            return;
        }

        switch (data.afterSaleType) {
            case 0:
                data.afterSaleTitle = '退货初审';
                data.afterSaleLabel = '退货商品';
                break;
            case 2:
                data.afterSaleTitle = '换货初审';
                data.afterSaleLabel = '换货商品';
                break;
        }

        return data;
    }

});