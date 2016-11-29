(function($, window) {

    avalon.ready(function() {
        var user = storage.getUser(),
            isLogin = typeof user !== 'undefined';

        var cartListCtrl = avalon.define('cartListCtrl', function(vm) {
            //登录状态 
            vm.isLogin = isLogin;
            //数量
            vm.totalNum = 0;
            //商品总价
            vm.selectedPrice = 0;
            //运费总价
            vm.freightSelectedPrice = 0;
            //总数
            vm.totalMoney = 0;
            //总豆豆
            vm.totalPoint = 0;
            //选中的商品数量
            vm.selectedQuantity = 0;
            //购物车列表
            vm.cartShopVOs = [];

            //删除购物车选项
            vm.deleteCart = function(id) {
                io.DELETE(apiConfig.editCart + id, function(responseData) {
                    queryCartList();
                });
            };

            //加号
            vm.addNum = function(item) {
                var $numObj = $(this).parent().children('span').children('.m-inorder-num');
                $numObj.val(parseInt($numObj.val()) + 1);
                onQuantityChange($(this).parents('tr'), item);
            };

            //减号
            vm.reduceNum = function(item) {
                var $numObj = $(this).parent().children('span').children('.m-inorder-num');
                if ($numObj.val() > 1) {
                    $numObj.val(parseInt($numObj.val()) - 1);
                    onQuantityChange($(this).parents('tr'), item);
                }
            };
            //input
            vm.inputChange = function(item) {
                onQuantityChange($(this).parents('tr'), item);
            };
            //货期
            vm.changeShip = function(item) {
                onQuantityChange($(this).parents('tr'), item);               
            }

            vm.selected = []; //保存勾选的选项的id,方便传给后台

            vm.checkAll = function() { //全选框change事件回调
                var isChecked = false;
                if (!$(this).find(":input").is(":checked")) {
                    $(".select-all").find("strong").addClass('m-checkbox-all-icon-checked');
                    $(".select-all").find(":input[type=checkbox]").prop("checked", true);

                    $(".cart-data-row").find("strong").addClass('m-checkbox-icon-checked');
                    $(".cart-data-row").find(":input[type=checkbox]").prop("checked", true);
                    isChecked = true;
                } else {
                    $(".select-all").find(":input[type=checkbox]").removeProp('checked');
                    $(".select-all").find("strong").removeClass(' m-checkbox-all-icon-checked');

                    $(".cart-data-row").find("strong").removeClass('m-checkbox-icon-checked');
                    $(".cart-data-row").find(":input[type=checkbox]").removeProp("checked");

                    isChecked = false;
                }

                var list = vm.cartShopVOs,
                    selected = vm.selected;
                if (isChecked) {
                    selected.clear(); //清空
                    avalon.each(list, function(i, v) { //循环保存着已经勾选选框的数据
                        selected.ensure(v['id']); //如果里面没有当前选框的数据，就保存
                    });
                    $(".cartItemId").each(function() {
                        if ($(this).parent().find(":checkbox").length > 0) {
                            $(this).parent().addClass("tr-active");
                        }

                    });
                    onCheckAllChange(true);
                } else {
                    selected.clear(); //清空
                    $(".cartItemId").each(function() {
                        if ($(this).parent().find(":checkbox").length > 0) {
                            $(this).parent().removeClass("tr-active");
                        } 
                    });
                    onCheckAllChange(false);
                }
            };
            vm.onCheckBoxSelected = function(item) {
                if (!$(this).find(":input").is(":checked")) {
                    $(this).find("strong").addClass('m-checkbox-icon-checked');
                    $(this).find(":input[type=checkbox]").prop("checked", true);
                } else {
                    $(this).find(":input[type=checkbox]").removeProp('checked');
                    $(this).find("strong").removeClass('m-checkbox-icon-checked');
                }
                var id = $(this).parents('tr').find('.cartItemId').val();
                var quantity = $(this).parents('tr').find('.m-inorder-num').val();
                var data = {
                    status: $(this).parents('tr').find(":checkbox").is(":checked") ? 1 : 0,
                    quantity: quantity,
                    ship: item.ship,
                    id: id
                };
                isSelectAll();
                var array = new Array();
                array.push(data);
                io.PATCH(apiConfig.editCart, array, function(responseData) {
                    updateModel(responseData);
                });

            };
            vm.select_all = 0;

        });

        //获取购物车列表
        queryCartList();


        avalon.scan();

        $(".header-nav li a").removeClass("header-nav-item-active");
        $(".header-nav li a[href='/cart/list.html']").addClass("header-nav-item-active");

        //购物车动效
        $('.m-inorder-link').hover(function() {
            clearTimeout(t2);
            var t2 = setTimeout(function() {
                $('.m-inorder-link').stop(true, true).fadeOut(300);
                $('.m-inorder-block').stop(true, true).fadeIn(300);
            }, 300);
        });
        $('.m-inorder').hover(function() {}, function() {
            clearTimeout(t1);
            var t1 = setTimeout(function() {
                $('.m-inorder-block').stop(true, true).fadeOut(300);
                $('.m-inorder-link').stop(true, true).fadeIn(300);
            }, 1000);
        });

        //输入框只能输大于0数字
        $('.m-inorder-num').on('keyup', function() {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
            if ($(this).val() <= 0) {
                $(this).val(1);
            }
        }).on("paste", function() {
            //粘贴处理
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
            if ($(this).val() <= 0) {
                $(this).val(1);
            }
        });
        $('.sub-order-del').on('click', function() {
            var selectedIds = new Array();
            $(".cartItemId").each(function() {
                if ($(this).parent().find(":checkbox").is(":checked")) {
                    selectedIds.push($(this).parent().find(":checkbox").val());
                }
            });
            io.DELETE(apiConfig.deleteMutCartIem, selectedIds, function(responseData) {
                queryCartList();
            });
        });

        $('.sub-order-btn').on('click', function() {
            var selectedNumber = $('tr.tr-active').length;
            if (selectedNumber > 0) {
                // 选择商品数量>0
                location.href = '/order/create.html';
            } else {
                alert('请勾选商品!');
            }
        });

        function onCheckAllChange(status) {
            var array = new Array();
            var allRows = $(".cart-data-row");
            for (var i = 0; i < allRows.length; i++) {
                var row = $(allRows[i]);
                var quantity = $(row).find('.m-inorder-num').val();
                var ship = $(row).find('#shipDisplay').val();
                var data = {
                    status: row.find(":checkbox").is(":checked") ? 1 : 0,
                    quantity: quantity,
                    ship: ship,
                    id: row.find(":checkbox").attr("value")
                };
                if (data.id && row.find(":checkbox").length > 0) {
                    array.push(data);
                }

            }

            if (array && array.length > 0) {
                io.PATCH(apiConfig.editCart, array, function(responseData) {
                    updateModel(responseData);
                });
            }

        }

        function onQuantityChange(row, item) {
            var quantity = +$(row).find('.m-inorder-num').val();
            var data = {
                status: row.find(":checkbox").is(":checked") ? 1 : 0,
                quantity: quantity,
                ship: item.ship,
                id: item.id
            };
            var array = new Array();
            array.push(data);
            io.PATCH(apiConfig.editCart, array, function(responseData) {
                updateModel(responseData);
            });
        }

        function updateModel(data) {
            var cartListModel = avalon.vmodels['cartListCtrl'];
            if (data.success) {
                if (avalon.vmodels['headerCtrl'] && avalon.vmodels['headerCtrl'].totalQuantity) {
                    avalon.vmodels['headerCtrl'].totalQuantity = data.result.totalQuantity;
                }
                cartListModel.cartShopVOs = data.result.cartShopVOs;
                cartListModel.totalNum = data.result.selectedQuantity;
                cartListModel.selectedPrice = data.result.selectedPrice;
                cartListModel.freightSelectedPrice = data.result.freightSelectedPrice;
                cartListModel.totalMoney = data.result.cartSelectedPrice;
                cartListModel.selectedQuantity = data.result.selectedQuantity;
                if (data.result.cartItemList && data.result.cartItemList.length > 0) {
                    var isAllselected = true;
                    for (var i = 0; i < data.result.cartItemList.length; i++) {
                        if (data.result.cartItemList[i].status == 0 && data.result.cartItemList[i].marketable == true && data.result.cartItemList[i].soldOut == false && data.result.cartItemList[i].price) {
                            isAllselected = false;
                            break;
                        }

                    }
                    if (isAllselected) {
                        cartListModel.select_all = 1;
                    }
                }
            }

        }

        function queryCartList() {
            if (storage.isLogin()) {
                io.GET(apiConfig.queryCart, function(data) {
                    updateModel(data);
                });
            }

        }
        //输入框数字输入限制
        function RepNumber(obj) {
            var reg = /^[\d]+$/g;
            if (!reg.test(obj.val())) {
                var txt = obj.val();
                txt.replace(/[^0-9]+/, function(char, index, val) { //匹配第一次非数字字符
                    obj.val(val.replace(/\D/g, "")); //将非数字字符替换成""
                    var rtextRange = null;
                    if (obj.setSelectionRange) {
                        obj.setSelectionRange(index, index);
                    } else { //支持ie
                        rtextRange = obj.createTextRange();
                        rtextRange.moveStart('character', index);
                        rtextRange.collapse(true);
                        rtextRange.select();
                    }
                })
            }
        }


        //判断是否全选
        function isSelectAll() {
            var $flag = true,
                obj = $(".cartItemId").parent().find(":checkbox");

            for (var i = 0; i < obj.length; i++) {
                if (!obj.eq(i).is(':checked')) {
                    $flag = false;
                    break;
                }
            }
            if ($flag) {
                $('.m-checkbox-all-check').prop('checked', true);
                $('.m-checkbox-all-icon').addClass('m-checkbox-all-icon-checked');
            } else {
                $('.m-checkbox-all-check').removeProp('checked');
                $('.m-checkbox-all-icon').removeClass('m-checkbox-all-icon-checked');
            }
        }

    });
}(jQuery, this));