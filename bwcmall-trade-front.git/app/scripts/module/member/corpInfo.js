'use strict';

avalon.ready(function() {

    var token, user,
        nextStep = '/member/auditing.html';

    if ( !storage.isLogin() ) {
        urls.goLogin();
    } else {
        user = storage.getCurrentUser();
        token = user.authToken;
    }

    var corpInfoCtrl = avalon.define('corpInfoCtrl', function(vm) {
        vm.productData = [];
        vm.username = user.username;
        vm.totalQuantity = 0;
        //省份
        vm.provinceData = [];
        vm.province = '';
        //城市
        vm.cityData = [];
        vm.city = '';
        //县
        vm.countyData = [];
        vm.county = '';
        vm.businessData = [];
        vm.tabs = {
            activeIndex: '1'
        };
        vm.invalid = true;
        vm.valid = false;
        vm.btnVisible = true;
        vm.licenseType = '';// 0 or 1
        vm.licenseAll = false;
        //进入首页读秒
        vm.countDown = '';
        vm.selectedElem = [];
        //licensePassed

        //提交的公司数据
        vm.company = {
            "corpName": "",
            "contactName": "",
            "email": "",
            "areaId": "",
            "address": "",
            "productCategory": [],
            "businessCategory": "",
            "licenseAll": "",
            "license": "",
            "taxRegCert": "",
            "orgnizationCode": ""
        };
        //公司数据错误信息
        vm.companyInfo = {
            "nameError": "",
            "contactNameError": "",
            "emailError": "",
            "areaError": "",
            "textError": "",
            "productClassError": "",
            "businessClassError": "",
            "errorInfoTwo": "",
            "licenseError": "",
            "licenseAllPic": '',
            "licensePic": '',
            "orgnizationPic": '',
            "taxPic": ''
        };
        //公司数据Flag
        vm.companyFlag = {
            "name": false,
            "contactName": false,
            "email": false,
            "area": false,
            "text": false,
            "product": false,
            "business": false,
            "licensePic": false
        };

        vm.btnFlag = false;

        //添加按钮
        vm.addBtn = function() {
            vm.productData.push(vm.productData[0]);
            if ($(".business-value").length > 1) {
                $(".del-class-btn").show();
            }
            $(".add-class-btn").show();

        };

        vm.dropDown = function(e) {
            var $dis = $(this).siblings('.m-tabselect-body').css('display');
            if ($dis == 'block') {
                $('.m-tabselect-body').hide();
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            } else {
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $(this).addClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
                $(this).siblings('.m-tabselect-body').show();
            }
            e.stopPropagation();
        };

        vm.addDown = function(e) {
            $(this).parent().siblings('.m-tabselect-item-wrap').toggle();
            $(this).text() == '－' ? $(this).text('＋') : $(this).text('－');
              e.stopPropagation();
        };

        vm.delChoose = function(obj) {
            if ($(".business-value").length == 1) {
                return false;
            } else {
                $(obj.currentTarget).parent().remove();
            }
            if ($(".business-value").length == 1) {
                $(".del-class-btn").hide();
            }
            $(".add-class-btn").show();
        };

        vm.select = function() {
            vm.tabs.activeIndex = this.value;
            vm.licenseAll = this.value === '2' ? true : false;
        };

        vm.addChoose = function(e) {
            corpInfoCtrl.companyInfo.errorInfoTwo = '';
            var value = $(this).attr('bValue');
            var selectedText = '';

            if (typeof($(this).attr('bValue')) != "undefined") {
                corpInfoCtrl.company.businessCategory = $(this).attr("bValue");
                $(this).parents().siblings('.m-tabselect-block').attr('bValue', $(this).attr('bValue'));
                $(this).parents().siblings('.m-tabselect-block').text($(this).text());
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');

            }
            if (typeof($(this).attr('cValue')) != "undefined") {
                if($(this).hasClass('selected')){
                    $(this).removeClass('selected');
                    var haveIndex = corpInfoCtrl.selectedElem.indexOf($(this).text());
                    corpInfoCtrl.selectedElem.splice(haveIndex,1);
                    corpInfoCtrl.company.productCategory.splice(haveIndex,1);
                }else{
                    $(this).addClass('selected');
                    corpInfoCtrl.company.productCategory.push($(this).attr('cValue'));
                    corpInfoCtrl.selectedElem.push($(this).text());
                }
                selectedText  = corpInfoCtrl.selectedElem.join('，')
                $(this).parents().siblings('.m-tabselect-block').text(selectedText);
                if(corpInfoCtrl.selectedElem.length == 0){
                    $(this).parents().siblings('.m-tabselect-block').text('请点击主营品类（可多选）');
                }
                e.stopPropagation();
                // $(this).parents().siblings('.m-tabselect-block').attr('cValue', $(this).text());
                // for (var i = 0; i < corpInfoCtrl.company.productCategory.length; i++) {
                //     if (corpInfoCtrl.company.productCategory[i] == $(this).attr('cValue')) {
                //         $(this).parents().siblings('.m-tabselect-block').removeAttr('cValue');
                //         $(this).parents().siblings('.m-tabselect-block').text('请选择分类');
                //         $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                //         corpInfoCtrl.companyInfo.errorInfoTwo = '请选择不同的分类';
                //         return;
                //     }
                // }
                // $(this).parents().siblings('.m-tabselect-block').attr('cValue', $(this).attr('cValue'));
                // var $cObj = $('.f-ib.selected');
                // corpInfoCtrl.company.productCategory = [];
                // for (var i = 0; i < $cObj.length; i++) {
                //     corpInfoCtrl.company.productCategory.push($cObj.eq(i).attr('cValue'));
                // }
            }
            if ($(this).text() == "请选择分类") {
                $(this).parents().siblings('.m-tabselect-block').removeAttr('cValue');
                var $cObj = $('.business-value');
                corpInfoCtrl.company.productCategory = [];
                for (var i = 0; i < $cObj.length; i++) {
                    if (typeof($cObj.eq(i).attr('cValue')) != "undefined") {
                        corpInfoCtrl.company.productCategory.push($cObj.eq(i).attr('cValue'));
                    }
                }
            }

        };

        //公司名校验
        vm.checkCorp = function() {
            var corpName = corpInfoCtrl.company.corpName.replace(/\s+/g, '');

            if (corpInfoCtrl.company.corpName.replace(/\s+/g, '') === '') {
                corpInfoCtrl.companyInfo.nameError = "请输入公司名称";
                corpInfoCtrl.companyFlag.name = false;
                return false;
            } else {
                io.GET(apiConfig.isBuyerExist.replace('{corpName}', corpName), function(responseData){
                    if(responseData.success){
                        if(!responseData.result){
                            corpInfoCtrl.companyInfo.nameError = "";
                            corpInfoCtrl.companyFlag.name = true;
                            return true;
                        }else{
                            corpInfoCtrl.companyInfo.nameError = "公司名称已经存在!";
                            corpInfoCtrl.companyFlag.name = false;
                            return false;
                        }
                    }else{
                        corpInfoCtrl.companyInfo.nameError = "";
                        corpInfoCtrl.companyFlag.name = true;
                        return true;
                    }
                });
            }
        };

        //联系人校验
        vm.checkContact = function() {
            if (corpInfoCtrl.company.contactName.replace(/\s+/g, '') === '') {
                corpInfoCtrl.companyInfo.contactNameError = "请填写联系人名称";
                corpInfoCtrl.companyFlag.contactName = false;
                return false;
            } else {
                corpInfoCtrl.companyInfo.contactNameError = '';
                corpInfoCtrl.companyFlag.contactName = true;
                return true;
            }
        };

        //邮箱校验
        vm.checkEmail = function() {
            if (corpInfoCtrl.company.email.replace(/\s+/g, "") == '') {
                corpInfoCtrl.companyInfo.emailError = '邮箱不能为空';
                corpInfoCtrl.companyFlag.email = false;
                return true;
            } else if (!/\b(^['_A-Za-z0-9-]+(\.['_A-Za-z0-9-]+)*@([A-Za-z0-9-])+(\.[A-Za-z0-9-]+)*((\.[A-Za-z0-9]{2,})|(\.[A-Za-z0-9]{2,}\.[A-Za-z0-9]{2,}))$)\b/.test(corpInfoCtrl.company.email)) {
                corpInfoCtrl.companyInfo.emailError = "邮箱格式不正确";
                corpInfoCtrl.companyFlag.email = false;
                return false;
            } else {
                corpInfoCtrl.companyInfo.emailError = "";
                corpInfoCtrl.companyFlag.email = true;
                return true;
            }
        };

        //校验地址
        vm.checkAdress = function() {
            if (corpInfoCtrl.company.address.replace(/\s+/g, "") == '') {
                corpInfoCtrl.companyInfo.textError = "请输入详细地址";
                corpInfoCtrl.companyFlag.text = false;
                return false;
            }
            corpInfoCtrl.companyInfo.textError = '';
            corpInfoCtrl.companyFlag.text = true;
            return true;
        };

        //校验区域
        vm.checkArea = function() {
            if (corpInfoCtrl.company.areaId == '') {
                corpInfoCtrl.companyInfo.areaError = '请选择所在区域';
                corpInfoCtrl.companyFlag.area = false;
                return false;
            }
            corpInfoCtrl.companyInfo.areaError = '';
            corpInfoCtrl.companyFlag.area = true;
            return true;
        };

        //主营业务类别校验
        vm.checkBusinessClass = function() {
            if (corpInfoCtrl.company.businessCategory == '') {
                corpInfoCtrl.companyInfo.businessClassError = '请选择主营业务类别';
                corpInfoCtrl.companyFlag.business = false;
                return false;
            }
            corpInfoCtrl.companyInfo.businessClassError = '';
            corpInfoCtrl.companyFlag.business = true;
            return true;
        };

        //主营商品类别校验
        vm.checkProductClass = function() {
            //判断undefined
            var array = [];
            for (var i = 0; i < corpInfoCtrl.company.productCategory.length; i++) {
                if (typeof(corpInfoCtrl.company.productCategory[i]) != "undefined") {
                    array.push(corpInfoCtrl.company.productCategory[i]);
                }
            }
            corpInfoCtrl.company.productCategory = array;
            if (corpInfoCtrl.company.productCategory.length <= 0) {
                corpInfoCtrl.companyInfo.errorInfoTwo = '请选择主营商品类别';
                corpInfoCtrl.companyFlag.product = false;
                return false;
            }
            corpInfoCtrl.companyInfo.errorInfoTwo = '';
            corpInfoCtrl.companyFlag.product = true;
            return true;
        };

        vm.getLicense = function() {
            var result, k,
                keys = ['license', 'taxRegCert', 'orgnizationCode'],
                len = keys.length;

            if (vm.licenseAll === true) {
                result = { licenseAll: vm.company.licenseAll };
            } else {
                result = {};
                while (len --) {
                    k = keys[len];
                    result[k] = vm.company[k];
                }

            }

            return result;
        };

        vm.logout = function() {
            io.GET(apiConfig.logout, function(responseData) {
                storage.removeUser();
                urls.goLogin();
            });
        };

        vm.checkLicense = function() {
            var keys = ['license', 'taxRegCert', 'orgnizationCode'],
                len = keys.length,
                license = {
                    check: function(propName, vm) {
                        return vm.company[propName] !== '';
                    },
                    success:  function() {
                        vm.companyInfo.licenseError = '';
                        vm.companyFlag.licensePic = true;
                        return true;
                    },
                    error: function() {
                        vm.companyInfo.licenseError = "请上传完整的资料！";
                        vm.companyFlag.licensePic = false;
                        return false;
                    }
                };

            if (vm.licenseAll === true) {
                return license[ license.check('licenseAll', vm) ? 'success' : 'error' ]();
            } else {

                while (len --) {
                    if ( !license.check(keys[len], vm) ) {
                        return license.error();
                    }
                }

                return license.success();
            }
        };

        //选择省份
        vm.selectProvince = function(name) {
            corpInfoCtrl.province = name;
            //清除
            corpInfoCtrl.city = '';
            corpInfoCtrl.county = '';
            corpInfoCtrl.cityData = [];
            corpInfoCtrl.countyData = [];
            corpInfoCtrl.company.areaId = '';
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            $('.m-tabselect-body').hide();
            for (var i = 0; i < corpInfoCtrl.provinceData.length; i++) {
                if (corpInfoCtrl.provinceData[i].name === name) {
                    corpInfoCtrl.cityData = corpInfoCtrl.provinceData[i].c;
                }
            }
        };

        //选择城市
        vm.selectCity = function(name) {
            corpInfoCtrl.city = name;
            //清除
            corpInfoCtrl.county = '';
            corpInfoCtrl.countyData = [];
            corpInfoCtrl.company.areaId = '';
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            $('.m-tabselect-body').hide();
            for (var i = 0; i < corpInfoCtrl.cityData.length; i++) {
                if (corpInfoCtrl.cityData[i].name === name) {
                    corpInfoCtrl.countyData = corpInfoCtrl.cityData[i].c;
                }
            }
        };

        //选择区/县
        vm.selectCounty = function(name, value) {
            corpInfoCtrl.county = name;
            corpInfoCtrl.company.areaId = value;
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            $('.m-tabselect-body').hide();
        };

        vm.deleteLicensePic = function() {
            vm.company.license = null;
            vm.companyInfo.licensePic = '';
            licensePic.destroybutton();
            licensePic = uploadLicensePic();
        };

        vm.deleteOrgnizationPic = function() {
            vm.company.orgnizationCode = null;
            vm.companyInfo.orgnizationPic = '';
            orgazitionPic.destroybutton();
            orgazitionPic = uploadOrgazitionPic();
        };

        vm.deleteTaxPic = function() {
            vm.company.taxRegCert = null;
            vm.companyInfo.taxPic = '';
            taxPic.destroybutton();
            taxPic = uploadTaxPic();
        };

        vm.deleteLicenseAllPic = function() {
            vm.company.licenseAll = null;
            vm.companyInfo.licenseAllPic = '';
            licensePicAll.destroybutton();
            licensePicAll = uploadLicensePicAll();
        };

        vm.regist = function() {
            if (vm.companyFlag.name && vm.companyFlag.email) {

                if ( vm.checkArea() && vm.checkAdress() && vm.checkProductClass() && vm.checkBusinessClass()  && vm.checkLicense() ) {
                    vm.companyInfo.errorInfoTwo = '';
                    var serData = {
                        "corpName": vm.company.corpName,
                        "contacts": vm.company.contactName,
                        "email": vm.company.email,
                        "areaId": vm.company.areaId,
                        "address": vm.company.address,
                        "categoryId": vm.company.productCategory.$model,
                        "businessCategory": vm.company.businessCategory
                    };

                    serData = $.extend( {}, serData, vm.getLicense() );
                    serData.licenseType = vm.licenseAll ? '1' : '0';
                    vm.btnVisible = false;

                    io.POST(apiConfig.buyerReg, serData, success, error);
                }

            } else {
                //公司名校验成功邮箱校验不成功
                //否则校验公司名
                if (vm.companyFlag.name) {
                    vm.checkEmail();
                } else {
                    vm.checkCorp();
                }
            }

            function success(data) {
                if (data.success) {
                    //更新用户
                    var user = storage.getUser();
                    if(user) {
                        user.licensePassedStatus = 1;
                        storage.setUser(user);
                    }
                    urls.goRef(nextStep);
                } else {
                    vm.companyInfo.errorInfoTwo = data.message;
                    alert(data.message);
                }
                vm.btnVisible = true;
            }

            function error(data) {
                vm.btnVisible = true;
                vm.companyInfo.errorInfoTwo = data.message;
                alert(data.message);
            }
        };

    });

    io.GET(apiConfig.queryCart, function(data) {
        if (data.success) {
            corpInfoCtrl.totalQuantity = data.result.totalQuantity;
        }
    });

    //获取地区json数据
    $.get('/scripts/json/area.json', function(data) {
        if (data) {
            corpInfoCtrl.provinceData = data;
            //默认地址设置
            corpInfoCtrl.selectProvince('上海');
            corpInfoCtrl.selectCity('上海市');
            corpInfoCtrl.selectCounty('松江区', 806);
            corpInfoCtrl.company.areaId = 793;
        }
    }, 'json');

    //获取商品类别
    io.GET(apiConfig.mainCategory, function(data) {
        if (data.success) {
            corpInfoCtrl.productData = data.result;
        }
    });

    // 获取业务类别
    io.GET(apiConfig.getBusinessCategory, function(data) {
        if (data.success) {
            corpInfoCtrl.businessData = data.result;
        }
    });

    avalon.scan();

    //下拉框折叠
    // $('.m-tabselect-nav-title a').on('click', function() {
    //     $(this).parent().siblings('.m-tabselect-item-wrap').toggle();
    //     $(this).text() == '－' ? $(this).text('＋') : $(this).text('－');
    // });
    //下拉
    $('.m-tabselect-block').on('click', function() {
        var $dis = $(this).siblings('.m-tabselect-body').css('display');
        if ($dis == 'block') {
            $('.m-tabselect-body').hide();
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        } else {
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            $(this).addClass('m-tabselect-block-active');
            $('.m-tabselect-body').hide();
            $(this).siblings('.m-tabselect-body').show();
        }
    });

    //点击其他地方隐藏下拉
    $(document).click(function(e) {
        var $target = $(e.target);
        if (!$target.hasClass('m-tabselect-block') && !$target.hasClass('trans_link_3')) {
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            $('.m-tabselect-body').hide();
        }
    });

    var licensePic = uploadLicensePic(),
        orgazitionPic = uploadOrgazitionPic(),
        taxPic = uploadTaxPic(),
        licensePicAll = uploadLicensePicAll();


    function uploadLicensePicAll() {
        return upload('#licensePicAll', {
            onUploadSuccess: function(data) {
                corpInfoCtrl.company.licenseAll = data.id;
                corpInfoCtrl.companyInfo.licenseAllPic = data.resources;
            }
        });
    }

    function uploadLicensePic() {
        return upload('#licensePic', {
            onUploadSuccess: function(data) {
                corpInfoCtrl.company.license = data.id;
                corpInfoCtrl.companyInfo.licensePic = data.resources;
            }
        });
    }

    function uploadOrgazitionPic() {
        return upload('#orgazitionPic', {
            onUploadSuccess: function(data) {
                corpInfoCtrl.company.orgnizationCode = data.id;
                corpInfoCtrl.companyInfo.orgnizationPic = data.resources;
            }
        });
    }

    function uploadTaxPic() {
        return upload('#taxPic', {
            onUploadSuccess: function(data) {
                corpInfoCtrl.company.taxRegCert = data.id;
                corpInfoCtrl.companyInfo.taxPic = data.resources;
            }
        });
    }

    // helper

    function upload(selector, opts) {
        var defaults = {
                buttonClass: 'upButtonClass',
                swf: '/scripts/plugin/uploadifive/uploadify.swf',
                auto: true,
                method: 'post',
                fileSizeLimit: 10240,
                formData: {token: token},
                buttonText: '',
                fileObjName: 'file',
                fileTypeExts: '*.gif;*.jpg;*.jpeg;*.png;*.bmp;*.gif',
                uploader: apiConfig.upload ,
                height: 96,
                width: 166,
                errorMsg: '文件上传出错',
                overrideEvents: ['onSelectError', 'onDialogClose', 'onClearQueue'],
                onSelectError: function (file, errorCode, errorMsg) {
                    switch (errorCode) {
                        case -100:
                            alert("一次只能上传一个文件！");
                            break;
                        case -110:
                            alert("文件 [" + file.name + "] 大小必须小于10M！");
                            break;
                        case -120:
                            alert("文件 [" + file.name + "] 大小异常！");
                            break;
                        case -130:
                            alert("文件 [" + file.name + "] 类型不正确,只支持gif,jpg,jpeg,png,bmp等格式！");
                            break;
                    }
                }
            },
            options = $.extend({}, defaults, opts || {}),
            uploadSuccess = options.onUploadSuccess || function() {};

        options.onUploadSuccess = function(file, data, response) {
            try {
                data = JSON.parse(data);
            } catch(e) {
                throw new Error(e);
            }

            if (data.success) {
                uploadSuccess(data.result);
                corpInfoCtrl.checkLicense();
            } else {
                corpInfoCtrl.checkLicense();
            }
        };

        return $(selector).uploadbutton(options);

    }

});
