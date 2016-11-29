'use strict';

var loginStatus = 0;

(function($) {
    var user = storage.getUser(),
        isLogin = typeof user !== 'undefined';

    require(['dialog/avalon.dialog'], function() {
        avalon.ready(function() {
            var headerCtrl = avalon.define('headerCtrl', function(vm) {
                vm.isLogin = isLogin;
                vm.totalQuantity = 0;
                vm.shopMerchant = false;
                vm.licensePassed = false;
                vm.licensePassedStatus = isLogin?user.licensePassedStatus:-1;
                vm.username = isLogin ? user.username : '';

                //购物车相关数据
                //购物车数据
                vm.cartData = {};
                //数量
                vm.totalNum = 0;
                //总数
                vm.totalMoney = 0;
                //总豆豆
                vm.totalPoint = 0;
                //购物车列表
                vm.cartList = [];

                //删除购物车选项
                vm.deleteCart = function(id) {
                    cart.deleteItem(id);
                };

                //加号
                vm.addNum = function(id) {
                    var $numObj = $(this).siblings('.purchase-input');
                    $numObj.val(parseInt($numObj.val()) + 1);
                    onQuantityChange($(this).parents('li'), id);
                };

                //减号
                vm.reduceNum = function(id) {
                    var $numObj = $(this).siblings('.purchase-input');
                    if ($numObj.val() > 1) {
                        $numObj.val(parseInt($numObj.val()) - 1);
                        onQuantityChange($(this).parents('li'), id);
                    }
                };

                //输入框
                vm.inputKeyup = function(){
                    $(this).val($(this).val().replace(/[^0-9]/g, ''));
                    if ($(this).val() <= 0) {
                        $(this).val(1);
                    }
                }

                vm.selected = []; //保存勾选的选项的id,方便传给后台

                vm.select_all_cb = function() { //全选框change事件回调
                    var list = vm.cartList,
                        selected = vm.selected;
                    if (this.checked) {
                        selected.clear(); //清空
                        avalon.each(list, function(i, v) { //循环保存着已经勾选选框的数据
                            selected.ensure(v['id']); //如果里面没有当前选框的数据，就保存
                        });
                    } else {
                        selected.clear(); //清空
                    }
                };

                vm.select_all = 0;

                //input
                vm.inputChange = function(id) {
                    onQuantityChange($(this).parents('li'), id);
                };

                vm.goLogin = function(){
                    if(!vm.isLogin) {
                        urls.goLogin();
                    }
                }

            });
            avalon.scan();
            if (typeof user !== 'undefined') {
                headerCtrl.shopMerchant = user.shopMerchant;
                headerCtrl.licensePassed = user.licensePassed;
                /* user.licensePassedStatus 状态值说明
                 * 0-带完善信息
                 * 1-待审核
                 * 2-审核通过
                 * 3-审核不通过
                 * */
                headerCtrl.licensePassedStatus = user.licensePassedStatus;
            }
            $('#login').click(function() {
                // location.href = "/member/login.html?target-url=" + $.base64.btoa(window.location);
                urls.goLogin();
            });

            $('#loginBtn').click(function() {
                urls.goLogin();
            });

            $('#logout').click(function() {
                common.logout(this);
            });

            //登录状态后ajax
            if (isLogin) {
                io.GET(apiConfig.queryCart, function(data) {
                    if(data.success) {
                        // $('.info-icon-center').text(data.result.totalQuantity);
                        //setTotalQuantity(data.result.totalQuantity);
                        updataInOrderModel(data.result);
                        avalon.scan();
                    }
                });
            }

            //购物车悬浮
            if ($('.head-content').position()) {
                var $top = $('.head-content').position().top;
                $(window).scroll(function() {
                    if ($(document).scrollTop() > $top) {
                        $('.head-content').addClass('head-content-fixed');
                        $('.head-content-add').show();
                    } else {
                        $('.head-content').removeClass('head-content-fixed');
                        $('.head-content-add').hide();
                    }
                });
            }

            //输入框只能输大于0数字
            // $(window).load(function(){
            //     $('.purchase-input').on('keyup', function() {
            //         $(this).val($(this).val().replace(/[^0-9]/g, ''));
            //         if ($(this).val() <= 0) {
            //             $(this).val(1);
            //         }
            //     }).on("paste", function() {
            //         //粘贴处理
            //         $(this).val($(this).val().replace(/[^0-9]/g, ''));
            //         if ($(this).val() <= 0) {
            //             $(this).val(1);
            //         }
            //     });
            // })

            function onQuantityChange(row, id) {
                var selected = 1,
                    // 转为数字确保参数正确
                    quantity = +$(row).find('.purchase-input').val();

                cart.updateItem([{
                    id: id,
                    quantity: quantity,
                    status: selected
                }]);
            }

        });
    });

    var cart = {
        addList: function(data, sender) {
            if (data) {
                io.POST(apiConfig.addCart, data, function(data) {
                    if(data.success) {
                        updateModel(data.result);
                    } else {
                        alert(data.message);
                    }
                });
            }

        },
        addItem: function(goodsId, quantity, ship, sender) {
            if (quantity <= 0) {
                alert("数量必须大于0");
            }
            if (storage.isLogin()) {
                addCart(goodsId, quantity, ship, sender);
            } else {
                urls.goLogin();
            }
        },
        deleteItem: function(id, sender) {
            io.DELETE(apiConfig.editCart + id, function(responseData) {
                if(responseData.success) {
                    updateModel(responseData.result);
                }
            }, sender);
        },
        updateItem: function(data, sender) {
            io.PATCH(apiConfig.editCart, data, function(responseData) {
                if(responseData.success) {
                    updateModel(responseData.result);
                }
            }, sender);
        }

    };

    function inVModels(modelName) {
        return modelName in avalon.vmodels;
    }

    function updataHeaderModel(data) {
        if (inVModels('headerCtrl')) {
            avalon.vmodels['headerCtrl'].totalQuantity = data.totalQuantity;
        }
    }

    function updataSideBarModel(data) {
        if (inVModels('sideBarCtrl')) {
            avalon.vmodels['sideBarCtrl'].setListCart(data);
        }
    }

    function updataInOrderModel(data) {
        if (inVModels('headerCtrl')) {
            var headerCtrl = avalon.vmodels['headerCtrl'];
            headerCtrl.totalMoney = data.totalPrice;
            headerCtrl.totalNum = data.totalQuantity;
            headerCtrl.cartList = data.cartItemList;
            // headerCtrl.totalPoint = data.totalPoint;
            headerCtrl.totalQuantity = data.totalQuantity;
            avalon.scan();
        }
    }

    function updateModel(data) {
        updataHeaderModel(data);
        updataSideBarModel(data);
        updataInOrderModel(data);
    }

    function renderCart(data) {
        if(data.success) {
            updateModel(data.result);
        }

        var t3;
        clearTimeout(t3);
        t3 = setTimeout(function() {
            $('.m-inorder-block').stop(true, true).fadeOut(300);
            $('.m-inorder-link').stop(true, true).fadeIn(300);
        }, 2000);

        //执行动画
        $('.m-inorder-link').stop(true, true).fadeOut(300);
        $('.m-inorder-block').stop(true, true).fadeIn(300);


        //修复进货单动效BUG
        $('.m-inorder-content').on('mouseenter', function() {
            clearTimeout(t3);
        });
    }

    function error(data) {
        var flyElm = $('img.fly');
        if(0 < flyElm.length) {
            flyElm.hide();
        }

        var timer = setTimeout(function() {
            alert(data.message);
        }, 100);
    }

    function addCart(goodsId, quantity, ship, sender) {
        var data = [{
            goodsId: goodsId,
            quantity: quantity,
            ship: ship
        }];

        io.POST(apiConfig.addCart, data, renderCart, error, sender);
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

    window.cart = cart;

}(jQuery));