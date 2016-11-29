avalon.ready(function() {
    require(['dialog/avalon.dialog'], function() {
        var orderTwoCtrl = avalon.define('addressCtrl', function(vm) {
            vm.addresses = {};
            vm.cart = {};
            vm.member = {};
            //总金额
            vm.totalPrice = $('#totalPrice').val();
            //可用仓豆
            vm.peasNum = parseFloat($('#peasNum').val());
            //使用仓豆
            vm.usePeas = '';
            //实付总金额
            vm.totalAmount = $('#totalPrice').val();
            //是否使用仓豆
            vm.isUsePeas = false;
            //发票类型单选
            vm.cInvoiceData = {};

            vm.pInvoiceData = {};

            vm.inProgress = false;

            vm.ajaxErrorFlag = false;

            //收货地址dialog配置项
            vm.$adressPopupOptions = {
                title: "收货地址编辑",
                showClose: true,
                type: 'nobtn',
                width: 500,
                isTop: true,
                onClose: function() {

                }
            };

            //修改/新增状态
            vm.status = 0;
            //修改/新增个人发票
            vm.pReceiptStatus = 0;
            //修改/新增增值税发票
            vm.cReceiptStatus = 0;
            //当前修改的ID
            vm.addressId = '';
            //当前修改的个人发票ID
            vm.pReceiptId = '';
            //当前查看的增值税发票ID
            vm.cReceiptId = '';
            //省份
            vm.provinceData = [];
            vm.province = '';
            //城市
            vm.cityData = [];
            vm.city = '';
            //县
            vm.countyData = [];
            vm.county = '';
            vm.value = '';
            //报错
            vm.errorInfo = '';
            vm.errorVoiceInfo = '';
            //地址提交/修改标志 
            vm.saveFlag = true;

            vm.subAddress = function(str){
                if(str){
                    if(str.length>20){
                        return str.substring(0,20)+"...";
                    }else{
                        return str;
                    }
                }else{
                    return "";
                } 
            }
            //删除收货地址
            vm.delAdress = function(id) {
                io.DELETE(apiConfig.addresses + "/" + id, {}, function(data) {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        orderTwoCtrl.errorText = '操作失败！';
                        orderTwoCtrl.show('errorDialog');
                        //alert('操作失败！');
                    }
                }, function(data) {
                    orderTwoCtrl.errorText = '操作失败！';
                    orderTwoCtrl.show('errorDialog');
                });
            };

            //设为默认收货地址
            vm.setDefault = function(id) {
                io.POST(apiConfig.addresses + "/" + id + "/default", {defaultStatus : 1 }, function(data) {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        orderTwoCtrl.errorText = '操作失败！';
                        orderTwoCtrl.show('errorDialog');
                        //alert('操作失败！');
                    }
                }, function(data) {
                    orderTwoCtrl.errorText = '操作失败！';
                    orderTwoCtrl.show('errorDialog');
                });
            };

            //修改收货地址查询
            vm.queryAdress = function(id, status) {
                orderTwoCtrl.addressId = id;
                io.GET(apiConfig.addresses + "/" + id, {}, function(data) {
                    if (data.success) {
                        data = data.result;
                        orderTwoCtrl.status = status;
                        //赋值并显示
                        //orderTwoCtrl.receipt.name = data.consignee;
                        //orderTwoCtrl.receipt.phone = data.phone;
                        //orderTwoCtrl.receipt.address = data.address;
                        $('#corpName').val(data.corpName);
                        $('#consignee').val(data.consignee);
                        $('#phone').val(data.phone);
                        $('#address').html(data.address);
                        if (data.defaultStatus == '1') {
                            $('#isDefault').prop("checked", true);
                        } else {
                            $('#isDefault').removeProp("checked");
                        }

                        if (data.areaId) {
                            orderTwoCtrl.selectProvince(data.areaVO.provinceName);
                            orderTwoCtrl.selectCity(data.areaVO.cityName);
                            orderTwoCtrl.selectCounty(data.areaVO.districtName, data.areaVO.districtId);
                        }

                        avalon.vmodels['adressPopup'].toggle = true;
                    }
                });
            };

            //公司校验
            vm.checkCropName = function() {
                if ($('#corpName').val().replace(/\s+/g, "") == '') {
                    orderTwoCtrl.errorInfo = "请填写收货公司";
                    return false;
                }
                $('#corpName').val($('#corpName').val().replace(/\s+/g, ""));
                if ($('#corpName').val().length > 60) {
                    orderTwoCtrl.errorInfo = "公司名称长度必须小于60个字符";
                    return false;
                }
                return true;
            };

            //收货人校验
            vm.checkName = function() {
                if ($('#consignee').val().replace(/\s+/g, "") == '') {
                    orderTwoCtrl.errorInfo = "请填写收货人";
                    return false;
                }
                $('#consignee').val($('#consignee').val().replace(/\s+/g, ""));
                if ($('#consignee').val().length > 50) {
                    orderTwoCtrl.errorInfo = "收货人长度必须小于50个字符";
                    return false;
                }
                return true;
            };

            //联系电话校验
            vm.checkPhone = function() {
                if ($('#phone').val().replace(/\s+/g, "") == '') {
                    orderTwoCtrl.errorInfo = "请填写联系电话";
                    return false;
                }
                $('#phone').val($('#phone').val().replace(/\s+/g, ""));
                if ($('#phone').val().length > 20) {
                    orderTwoCtrl.errorInfo = "联系电话长度必须小于20个字符";
                    return false;
                }
                return true;
            };

            //所在区域校验
            vm.checkArea = function() {
                if (orderTwoCtrl.value == '') {
                    orderTwoCtrl.errorInfo = "请选择区域";
                    return false;
                }
                return true;
            };

            //详细地址校验
            vm.checkAdress = function() {
                if ($('#address').val().replace(/\s+/g, "") == '') {
                    orderTwoCtrl.errorInfo = "请填写详细地址";
                    return false;
                }
                $('#address').val($('#address').val().replace(/\s+/g, ""));
                if ($('#address').val().length > 100) {
                    orderTwoCtrl.errorInfo = "详细地址长度必须小于100个字符";
                    return false;
                }
                return true;
            };

            //选择省份
            vm.selectProvince = function(name) {
                orderTwoCtrl.province = name;
                //清除
                orderTwoCtrl.city = '';
                orderTwoCtrl.county = '';
                orderTwoCtrl.cityData = [];
                orderTwoCtrl.countyData = [];
                orderTwoCtrl.value = '';
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
                for (var i = 0; i < orderTwoCtrl.provinceData.length; i++) {
                    if (orderTwoCtrl.provinceData[i].name === name) {
                        orderTwoCtrl.cityData = orderTwoCtrl.provinceData[i].c;
                    }
                }
            };

            //选择城市
            vm.selectCity = function(name) {
                orderTwoCtrl.city = name;
                //清除
                orderTwoCtrl.county = '';
                orderTwoCtrl.countyData = [];
                orderTwoCtrl.value = '';
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
                for (var i = 0; i < orderTwoCtrl.cityData.length; i++) {
                    if (orderTwoCtrl.cityData[i].name === name) {
                        orderTwoCtrl.countyData = orderTwoCtrl.cityData[i].c;
                    }
                }
            };

            //选择区/县
            vm.selectCounty = function(name, value) {
                orderTwoCtrl.county = name;
                orderTwoCtrl.value = value;
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
            };

            //打开弹窗
            vm.show = function(id, status) {
                orderTwoCtrl.status = status;
                orderTwoCtrl.value = '';
                //默认地址 
                // orderTwoCtrl.selectProvince('上海');
                //orderTwoCtrl.selectCity('上海市');
                //orderTwoCtrl.selectCounty('松江区', 806);
                avalon.vmodels[id].toggle = true;
                return false;
            };

            //关闭弹窗
            vm.closeDialog = function(id) {
                avalon.vmodels[id].toggle = false;
                return false;
            };
            vm.save = function() {
                vm.errorInfo = '';
                if (vm.saveFlag && vm.checkCropName() && vm.checkName() && vm.checkPhone() && vm.checkArea() && vm.checkAdress()) {
                    vm.saveFlag = false;
                    if (vm.status == 0) {
                        io.POST(apiConfig.addresses, {
                            corpName: $('#corpName').val(),
                            consignee: $('#consignee').val(),
                            areaId: vm.value,
                            address: $('#address').val(),
                            phone: $('#phone').val(),
                            defaultStatus: $('#isDefault').is(":checked") ? 1 : 0
                        }, function(message) {
                            if (message.success) {
                                location.reload();
                            } else {
                                vm.saveFlag = true;
                                //调用dialog
                                vm.errorText = message.content;
                                vm.show('errorDialog');
                                //alert(message.content);
                            }
                        });
                    } else if (vm.status == 1) {
                        io.PATCH(apiConfig.addresses + "/" + vm.addressId, {
                            corpName: $('#corpName').val(),
                            consignee: $('#consignee').val(),
                            areaId: vm.value,
                            address: $('#address').val(),
                            zipCode: $('#zipCode').val(),
                            phone: $('#phone').val(),
                            defaultStatus: $('#isDefault').is(":checked") ? 1 : 0
                        }, function(message) {
                            if (message.success) {
                                location.reload();
                            } else {
                                vm.saveFlag = true;
                                //调用dialog
                                vm.errorText = message.content;
                                vm.show('errorDialog');
                                //alert(message.content);
                            }
                        });
                    }
                }
            };

        });
        //收货地址
        io.GET(apiConfig.addresses, function(data) {
            orderTwoCtrl.addresses = data.result;
        });

        //获取地区json数据
        io.GET("/scripts/json/area.json").done(function(data) {
            if (data) {
                orderTwoCtrl.provinceData = data;
                //orderTwoCtrl.selectProvince('上海');
                //orderTwoCtrl.selectCity('上海市');
                //orderTwoCtrl.selectCounty('松江区', 806);
            }
        });
        avalon.scan();

        //报错页面定位动画
        function errorMove($obj, tag) {
            var $scrollTop;
            clearTimeout(t1);
            if (tag) {
                $scrollTop = $obj.offset().top - 150,
                    $targetTop = $obj.offset().top - $('.order-invoice-table').offset().top + 12;
                var t1 = setTimeout(function() {
                    $('.error-move-wrap').fadeIn(300);
                    $('.error-move-wrap').css('marginTop', $targetTop);

                }, 400);
            } else {
                $scrollTop = $obj.offset().top;
            }

            $("body,html").animate({
                scrollTop: $scrollTop
            }, 400);
        }

        function timeout3() {
            //下拉框折叠
            $('.m-tabselect-nav-title a').on('click', function() {
                $(this).parent().siblings('.m-tabselect-item-wrap').toggle();
                $(this).text() == '－' ? $(this).text('＋') : $(this).text('－');
            });
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
            $('.m-tabselect-item').on('click', function() {
                if (typeof($(this).attr('bValue')) != "undefined") {
                    corpInfoCtrl.company.businessCategory = $(this).attr("bValue");
                    $(this).parents().siblings('.m-tabselect-block').attr('bValue', $(this).attr('bValue'));
                }
                if (typeof($(this).attr('cValue')) != "undefined") {
                    $(this).parents().siblings('.m-tabselect-block').attr('cValue', $(this).attr('cValue'));
                    var $cObj = $('.business-value');
                    corpInfoCtrl.company.productCategory = [];
                    for (var i = 0; i < $cObj.length; i++) {
                        corpInfoCtrl.company.productCategory.push($cObj.eq(i).attr('cValue'));
                    }
                }
                $(this).parents().siblings('.m-tabselect-block').text($(this).text());
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
            });

            //勾选协议
            $('.m-checkbox-icon').on('click', function() {
                if ($(this).siblings('.m-checkbox-check').is(':checked')) {
                    $(this).siblings('.m-checkbox-check').removeProp('checked');
                    //$(this).removeClass('m-checkbox-icon-checked');
                    $(this).parents('.m-checkbox').siblings().removeClass('adress-title-text-bold');
                    $(this).parents('.adress-title').removeClass('adress-title-active');
                } else {
                    //同组单选
                    var $group = $(this).parents('.adress-block').siblings('.adress-block');
                    for (var i = 0; i < $group.length; i++) {
                        $group.eq(i).find('.m-checkbox-icon').removeClass('m-checkbox-icon-checked');
                        $group.eq(i).find('.m-checkbox-check').removeProp('checked');
                        $group.eq(i).find('.adress-title-text').removeClass('adress-title-text-bold');
                        $group.eq(i).find('.adress-title').removeClass('adress-title-active');
                    }
                    //$('.m-checkbox-icon').removeClass('m-checkbox-icon-checked');
                    //$('.m-checkbox-check').attr('checked', false);
                    //$('.adress-title-text').removeClass('adress-title-text-bold');
                    $(this).siblings('.m-checkbox-check').prop('checked', true);
                    $(this).addClass('m-checkbox-icon-checked');
                    $(this).parents('.m-checkbox').siblings().addClass('adress-title-text-bold');
                    $(this).parents('.adress-title').addClass('adress-title-active');
                    //$('.adress-title').removeClass('adress-title-active');
                }
            });
            //初始化选中默认
            function defaultSelect() {
                $('.m-checkbox-icon').each(function(index) {
                    if ($(this).siblings('.m-checkbox-check').is(':checked')) {
                        $(this).siblings('.m-checkbox-check').prop('checked', true);
                        $(this).addClass('m-checkbox-icon-checked');
                        $(this).parents('.m-checkbox').siblings().addClass('adress-title-text-bold');
                        $(this).parents('.adress-title').addClass('adress-title-active');
                    }
                });
            }
            defaultSelect();
            //鼠标移入显示修改删除操作
            $('.adress-block').on({
                'mouseenter': function() {
                    $(this).find('.adress-btn-wrap').stop(true, true).fadeIn(100);
                },
                'mouseleave': function() {
                    $(this).find('.adress-btn-wrap').stop(true, true).fadeOut(100);
                }
            });
            //tag-info
            $('.invoice-tag-info').hover(function() {
                var $pHeight = $(this).offset().top,
                    $oHeight = $('.invoice-tag-info-hidden').height(),
                    $sHeight = $(document).scrollTop();
                if ($sHeight > $pHeight - $oHeight + 5) {
                    $('.invoice-tag-info-hidden').addClass('invoice-tag-info-hidden-down');
                } else {
                    $('.invoice-tag-info-hidden').removeClass('invoice-tag-info-hidden-down');
                }
                $('.invoice-tag-info-hidden').show();
            }, function() {
                $('.invoice-tag-info-hidden').hide();
            });

            //peas info
            $('.invoice-tag-info').hover(function() {
                $(this).siblings('.invoice-peas-hidden').show();
            }, function() {
                $(this).siblings('.invoice-peas-hidden').hide();
            });
        };

        setTimeout(timeout3, 3000);
    });
});