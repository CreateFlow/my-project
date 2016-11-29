avalon.ready(function() {
    require(['dialog/avalon.dialog'], function() {
        //console.debug("=================order-two.js====================");
        var shoppingListOrderCtrl = avalon.define('shoppingListOrderCtrl', function(vm) {
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

            //发票类型单选
            vm.invoice = [{
                "text": "不开发票",
                "check": true
            }, {
                "text": "开增值税发票",
                "check": false
            }, {
                "text": "开普通发票",
                "check": false
            }];
            //开票方式单选
            vm.invoiceWay = [{
                "text": "月度开票",
                "check": false
            }, {
                "text": "每单开票",
                "check": true
            }];

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

            //改变发票类型单选状态
            vm.changCheck = function(index) {
                vm.invoice[0].check = false;
                vm.invoice[1].check = false;
                vm.invoice[2].check = false;
                vm.invoice[index].check = true;
            };

            //改变开票方式单选状态
            vm.changCheckWay = function(index) {
                vm.invoiceWay[0].check = false;
                vm.invoiceWay[1].check = false;
                vm.invoiceWay[index].check = true;
            };

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
                        shoppingListOrderCtrl.errorText = '操作失败！';
                        shoppingListOrderCtrl.show('errorDialog');
                        //alert('操作失败！');
                    }
                }, function(data) {
                    shoppingListOrderCtrl.errorText = '操作失败！';
                    shoppingListOrderCtrl.show('errorDialog');
                });
            };

            //修改收货地址查询
            vm.queryAdress = function(id, status) {
                shoppingListOrderCtrl.addressId = id;
                io.GET(apiConfig.addresses + "/" + id, {}, function(data) {
                    if (data.success) {
                        data = data.result;
                        shoppingListOrderCtrl.status = status;
                        //赋值并显示
                        //shoppingListOrderCtrl.receipt.name = data.consignee;
                        //shoppingListOrderCtrl.receipt.phone = data.phone;
                        //shoppingListOrderCtrl.receipt.address = data.address;
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
                            shoppingListOrderCtrl.selectProvince(data.areaVO.provinceName);
                            shoppingListOrderCtrl.selectCity(data.areaVO.cityName);
                            shoppingListOrderCtrl.selectCounty(data.areaVO.districtName, data.areaVO.districtId);
                        }

                        avalon.vmodels['adressPopup'].toggle = true;
                    }
                });
            };

            //公司校验
            vm.checkCropName = function() {
                if ($('#corpName').val().replace(/\s+/g, "") == '') {
                    shoppingListOrderCtrl.errorInfo = "请填写收货公司";
                    return false;
                }
                $('#corpName').val($('#corpName').val().replace(/\s+/g, ""));
                if ($('#corpName').val().length > 60) {
                    shoppingListOrderCtrl.errorInfo = "公司名称长度必须小于60个字符";
                    return false;
                }
                return true;
            };

            //收货人校验
            vm.checkName = function() {
                if ($('#consignee').val().replace(/\s+/g, "") == '') {
                    shoppingListOrderCtrl.errorInfo = "请填写收货人";
                    return false;
                }
                $('#consignee').val($('#consignee').val().replace(/\s+/g, ""));
                if ($('#consignee').val().length > 50) {
                    shoppingListOrderCtrl.errorInfo = "收货人长度必须小于50个字符";
                    return false;
                }
                return true;
            };

            //联系电话校验
            vm.checkPhone = function() {
                if ($('#phone').val().replace(/\s+/g, "") == '') {
                    shoppingListOrderCtrl.errorInfo = "请填写联系电话";
                    return false;
                }
                $('#phone').val($('#phone').val().replace(/\s+/g, ""));
                if ($('#phone').val().length > 20) {
                    shoppingListOrderCtrl.errorInfo = "联系电话长度必须小于20个字符";
                    return false;
                }
                return true;
            };

            //所在区域校验
            vm.checkArea = function() {
                if (shoppingListOrderCtrl.value == '') {
                    shoppingListOrderCtrl.errorInfo = "请选择区域";
                    return false;
                }
                return true;
            };

            //详细地址校验
            vm.checkAdress = function() {
                if ($('#address').val().replace(/\s+/g, "") == '') {
                    shoppingListOrderCtrl.errorInfo = "请填写详细地址";
                    return false;
                }
                $('#address').val($('#address').val().replace(/\s+/g, ""));
                if ($('#address').val().length > 100) {
                    shoppingListOrderCtrl.errorInfo = "详细地址长度必须小于100个字符";
                    return false;
                }
                return true;
            };

            //选择省份
            vm.selectProvince = function(name) {
                shoppingListOrderCtrl.province = name;
                //清除
                shoppingListOrderCtrl.city = '';
                shoppingListOrderCtrl.county = '';
                shoppingListOrderCtrl.cityData = [];
                shoppingListOrderCtrl.countyData = [];
                shoppingListOrderCtrl.value = '';
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
                for (var i = 0; i < shoppingListOrderCtrl.provinceData.length; i++) {
                    if (shoppingListOrderCtrl.provinceData[i].name === name) {
                        shoppingListOrderCtrl.cityData = shoppingListOrderCtrl.provinceData[i].c;
                    }
                }
            };

            //选择城市
            vm.selectCity = function(name) {
                shoppingListOrderCtrl.city = name;
                //清除
                shoppingListOrderCtrl.county = '';
                shoppingListOrderCtrl.countyData = [];
                shoppingListOrderCtrl.value = '';
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
                for (var i = 0; i < shoppingListOrderCtrl.cityData.length; i++) {
                    if (shoppingListOrderCtrl.cityData[i].name === name) {
                        shoppingListOrderCtrl.countyData = shoppingListOrderCtrl.cityData[i].c;
                    }
                }
            };

            //选择区/县
            vm.selectCounty = function(name, value) {
                shoppingListOrderCtrl.county = name;
                shoppingListOrderCtrl.value = value;
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
            };

            //打开弹窗
            vm.show = function(id, status) {
                shoppingListOrderCtrl.status = status;
                shoppingListOrderCtrl.value = '';
                //默认地址 
                shoppingListOrderCtrl.selectProvince('上海');
                shoppingListOrderCtrl.selectCity('上海市');
                shoppingListOrderCtrl.selectCounty('松江区', 806);
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


            vm.submitOrder = function() {
                if (vm.inProgress) {
                    return false;
                }
                vm.inProgress = true;
                var selectedReceiverBlock = $('#receiverList .m-checkbox-icon-checked').parents('div.adress-block');
                var selectedReceiverId = $(selectedReceiverBlock).find('input.receiverId').val();
                if (!selectedReceiverId) {
                    alert("请选择收货地址！");
                    vm.inProgress  = false;
                    return false;
                };
                shoppingListOrderCtrl.ajaxErrorFlag = false;
                io.POST(apiConfig.shoppingList+urls.getParameter(window.location.href, 'shoplistid')+"/order", {
                      receiverId: selectedReceiverId,
                    receiverId: selectedReceiverId,
                    memo: $('#memo').val(),
                }, function(data) {
                    if (data.success == true) {
                        common.toPay(data.result.orderSn, '_self');
                    } else {
                        $('.order-submit-error').show();
                        shoppingListOrderCtrl.ajaxErrorFlag = true;
                    }
                }, function(data) {
                    if (data.error.code == '100102001') {
                        vm.inProgress = true;
                        $('.order-submit-error').show();
                        $('.order-submit-error').text("请不要重复下单！");
                    } else {
                        $('.order-submit-error').text("操作失败，请稍后重试!");
                        $('.order-submit-error').show();
                         vm.inProgress  = false;
                    }

                    shoppingListOrderCtrl.ajaxErrorFlag = true;
                });
            };
        });
        //收货地址
        io.GET(apiConfig.addresses, function(data) {
            shoppingListOrderCtrl.addresses = data.result;
        });
        //当前订单
        io.GET(apiConfig.shoppingList+"/"+urls.getParameter(window.location.href, 'shoplistid'), {}, function(data) {
            shoppingListOrderCtrl.cart = data.result;
            if (data.result.selectedList &&   data.result.selectedList.length > 0) {
                shoppingListOrderCtrl.inProgress = false;
            } else {
                shoppingListOrderCtrl.inProgress = true;
            }

        }, function(data) {
            shoppingListOrderCtrl.inProgress = true;
        });
        //active状态，延迟处理
        setTimeout(function() {
            if (avalon.vmodels['accountHeadCtrl']) {
                shoppingListOrderCtrl.$fire('down!currentNavInfo', 'inOrder');
            }
        }, 50);
        //placeholder
        $('#memo').focus(function() {
            $(this).siblings('.hidden-text').hide();
        }).blur(function() {
            $(this).siblings('.hidden-text').show();
        });
        $('.hidden-text').click(function() {
            $('#memo').trigger('focus');
        });
        //获取地区json数据
        io.GET("/scripts/json/area.json").done(function(data) {
            if (data) {
                shoppingListOrderCtrl.provinceData = data;
                shoppingListOrderCtrl.selectProvince('上海');
                shoppingListOrderCtrl.selectCity('上海市');
                shoppingListOrderCtrl.selectCounty('松江区', 806);
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
                    $(this).removeClass('m-checkbox-icon-checked');
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