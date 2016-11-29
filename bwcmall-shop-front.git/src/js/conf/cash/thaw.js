'use strict';

define(function(require, exports, module) {
    // 加载依赖组件
    var avalon = require('avalon'),
        $ = require('jquery'),
        request = require('lib/io/request'),
        API = require('module/common/config/api'),
        urls = require('module/common/utils/url'),
        uploadify = require('module/common/uploadify/uploadify'),
        myUtils = require('module/common/utils/utils');

    // 加载框架组件
    require('module/common/ui/scaffolding');
    require('oniui/dialog/avalon.dialog');
    require('oniui/datepicker/avalon.datepicker');
    require('oniui/pager/avalon.pager');
    require('oniui/dropdown/avalon.dropdown');
    require('lib/plugins/lightbox/js/lightbox.min');

    avalon.ready(function () {
        var vm = avalon.define({
            $id: "thawCtrl",
            //tab切换
            currentTab   : 'tab1',
            //tab数据
            currentData  : [{
                "text": "三证未合一",
                "value": "tab1"
            }, {
                "text": "三证合一",
                "value": "tab2"
            }],
            refusePicList: [],

            refusePic : '',
            refusePic2 : '',
            refusePic3 : '',
            refusePic4 : '',
            refusePic5 : '',
            refusePic6 : '',

            refusePicx : '',
            refusePic2x : '',
            refusePic3x : '',
            refusePic4x : '',
            refusePic5x : '',
            refusePic6x : '',
            refusePicInfo : '',

            refuseUrl : '',
            refuseUrl2 : '',
            refuseUrl3 : '',
            refuseUrl4 : '',
            refuseUrl5 : '',
            refuseUrl6 : '',
            //tab切换
            changeTab : function(value) {
                vm.currentTab = value;
            },
            submit : function() {
                vm.refusePicList = '';
                if (vm.currentTab == 'tab1') {
                    if (vm.refusePic == '' || vm.refusePic2 == ''|| vm.refusePic3 == ''|| vm.refusePic4 == ''|| vm.refusePic5 == ''|| vm.refusePic6 == '') {
                        vm.refusePicInfo = '请上传完整资料';
                        return false;
                    };
                    vm.refusePicList = [
                        vm.refusePic,
                        vm.refusePic2,
                        vm.refusePic3,
                        vm.refusePic4,
                        vm.refusePic5,
                        vm.refusePic6
                    ];
                    request.POST(API.vreturn + 'shop/accounts', vm.refusePicList,
                        function(data) {
                            if (data.success) {
                                alert('操作成功');
                                urls.goRef("/");
                            } else {
                                alert('操作失败');
                            }
                        }
                    );
                }else{
                    if (vm.refusePic == '' || vm.refusePic4 == ''|| vm.refusePic5 == ''|| vm.refusePic6 == '') {
                        vm.refusePicInfo = '请上传完整资料';
                        return false;
                    };
                    vm.refusePicList = [
                        vm.refusePic,
                        {"resourcesId":vm.refusePic.resourcesId,"type": 1},
                        {"resourcesId":vm.refusePic.resourcesId,"type": 2},
                        vm.refusePic4,
                        vm.refusePic5,
                        vm.refusePic6
                    ];
                    request.POST(API.vreturn + 'shop/accounts', vm.refusePicList,
                        function(data) {
                            if (data.success) {
                                alert('操作成功');
                                urls.goRef("/");
                            } else {
                                alert('操作失败');
                            }
                        }
                    );
                };
            }

        });

        avalon.scan(document.body, vm);
    });

    uploadify('#refusePic', {
            uploader: API.upload,
            buttonText: '上传营业执照',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
      

                    avalon.vmodels['thawCtrl'].refusePic = {
                        "resourcesId": data.id, 
                        "type": 0
                    };
                    avalon.vmodels['thawCtrl'].refuseUrl = data.resources;
                    
                    
                }

            }
        });

        uploadify('#refusePic2', {
            uploader: API.upload,
            buttonText: '上传组织机构代码',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
                    avalon.vmodels['thawCtrl'].refusePic2 = {
                        "resourcesId": data.id, 
                        "type": 1
                    };
                    avalon.vmodels['thawCtrl'].refuseUrl2 = data.resources;
                }

            }
        });

        uploadify('#refusePic3', {
            uploader: API.upload,
            buttonText: '上传税务登记证',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
                    avalon.vmodels['thawCtrl'].refusePic3 = {
                        "resourcesId": data.id, 
                        "type": 2
                    };
                    avalon.vmodels['thawCtrl'].refuseUrl3 = data.resources;
                }

            }
        });

        uploadify('#refusePic4', {
            uploader: API.upload,
            buttonText: '上传银行开户许可证',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
                    avalon.vmodels['thawCtrl'].refusePic4 = {
                        "resourcesId": data.id, 
                        "type": 3
                    };
                    avalon.vmodels['thawCtrl'].refuseUrl4 = data.resources;
                }

            }
        });

        uploadify('#refusePic5', {
            uploader: API.upload,
            buttonText: '上传法人身份证正面',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
                    avalon.vmodels['thawCtrl'].refusePic5 = {
                        "resourcesId": data.id, 
                        "type": 4
                    };
                    avalon.vmodels['thawCtrl'].refuseUrl5 = data.resources;
                }

            }
        });

        uploadify('#refusePic6', {
            uploader: API.upload,
            buttonText: '上传法人身份证反面',
            onUploadSuccess: function(file, responseData, response) {
                try {
                    var data = JSON.parse(responseData);
                } catch(e) {
                    throw new Error('数据错误!');
                }

                if (data.success) {
                    data = data.result;
                    avalon.vmodels['thawCtrl'].refusePic6 = {
                        "resourcesId": data.id, 
                        "type": 5
                    };
                }
                avalon.vmodels['thawCtrl'].refuseUrl6 = data.resources;

            }
        });
});