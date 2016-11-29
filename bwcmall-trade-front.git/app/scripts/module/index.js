(function ($) {
    require(['loading/avalon.loading'], function () {
        avalon.filters.serialNumber = function (str) { //用法： {{aaa|haha}}
            var result;
            if (str) {
                result = str.substring(0, 10);
            } else {
                result = '';
            }
            return result;
        }
        avalon.ready(function () {
            //banner右边的用户信息
            var indexCtrl = avalon.define('indexCtrl', function (vm) {
                var user = storage.getUser();
                vm.isLogin = user ? true : false;
                vm.userName = '';
                if (vm.isLogin) {
                    vm.userName = user.userRealname || user.username;
                }

                vm.loginData = {};

                vm.$loginDataLoadingOptions = {
                    color: '#382223',
                    modal: true,
                    modalOpacity: 1,
                    modalBackground: '#eceae9'
                };

                vm.goLogin = function () {
                    if (!vm.isLogin) {
                        urls.goLogin();
                    }
                }
            });

            //楼层数据--TODO:购物清单相关代码的整理---Mark
            var brandCtrl = avalon.define('brandCtrl', function (vm) {
                vm.indexBrands = [];
                vm.isShoppingListModel = false;
                vm.currentItemId = '';
                vm.currentShoppingListId = '';

                //加入购物车
                vm.addCart = function (item, quantity, e) {
                    var ship = 0;
                    if (item.shipPrices.length > 0) {
                        ship = item.shipPrices[0].ship;
                    }
                    cart.addItem(item.goodsId, quantity, ship, e.target);
                    vm.flyToCart($(this));
                };

                //飞入购物车
                vm.flyToCart = function (item) {
                    var img = item.siblings('.product-img').find('img');
                    var flyElm = img.clone().css('opacity', 0.75).addClass('fly');
                    $('body').append(flyElm);
                    var objT = img.offset().top - $(window).scrollTop();
                    var objL = $('.purchase-order-title').offset().left + 120;
                    flyElm.css({
                        'z-index': 9000,
                        'display': 'block',
                        'position': 'fixed',
                        'top': objT + 'px',
                        'left': img.offset().left + 'px',
                        'width': img.width() + 'px',
                        'height': img.height() + 'px'
                    });
                    flyElm.animate({
                        top: 0,
                        left: objL,
                        width: 5,
                        height: 5
                    }, 'slow', function () {
                        flyElm.remove();
                    });
                }

                vm.goLogin = function (item) {
                    if (!storage.isLogin()) {
                        urls.goLogin();
                    } else {
                        if (parseInt(item.shopId) == 1) {
                            window.open("http://wpa.qq.com/msgrd?v=3&uin=3366370013&site=qq&menu=yes");
                        }
                    }
                }

                //加入购物清单
                vm.addshoplist = function (id) {
                    if (!storage.isLogin()) {
                        //redirect to login
                        urls.goLogin();
                    } else {
                        var data = {
                            id: vm.currentItemId,
                            shoppingListId: vm.currentShoppingListId,
                            goodsId: id,
                            quantity: 1
                        };
                        io.POST(apiConfig.shoppingList + vm.currentShoppingListId + '/goods', data, function (data) {
                            if (data.success == true) {
                                alert("成功加入购物清单！");
                            }
                        });
                    }
                }

                vm.subStr = function (str, num) {
                    if (str) {
                        if (str.length > num) {
                            return str.substring(0, num);
                        } else {
                            return str;
                        }
                    } else {
                        return "";
                    }
                }

                var f = $.cookie()['shoppingList'];
                if (f) {
                    var shoppingList = $.parseJSON(f);
                    vm.currentItemId = shoppingList.currentItemId;
                    vm.currentShoppingListId = shoppingList.id;
                    vm.isShoppingListModel = shoppingList.isShoppingListModel;
                }
            });

            //获取楼层数据
            io.GET(apiConfig.cmsBrand, function (data) {
                brandCtrl.indexBrands = data.result;
                avalon.scan();
            });


            //获取用户订单
            if (storage.isLogin()) {
                io.GET(apiConfig.queryCustomerPanorama, function (data) {
                    //关闭loading
                    //avalon.vmodels['loginDataLoading'].hideLoading();
                    indexCtrl.loginData = data.result;
                    avalon.scan();
                });
            }

            //image lazyload
            $('img').lazyload({
                effect: "fadeIn"
            });

            //TODO:确定不再使用将删除此段代码---Mark
            //tabProduct('.product-category-wrap-inner', '.product-category', '.product-tab-link', 'product-tab-active');
        });
    });

    // //product-list-left tab
    // function tabProduct(obj, subObj, item, active) {
    //     //init
    //     $width = $(obj).children(subObj).length * parseInt($(obj).children(subObj).css('width'));
    //     $(obj).css('width', $width);

    //     $(item).hover(function() {
    //         $(this).siblings(item).removeClass(active);
    //         $(this).addClass(active);
    //         var $index = $(this).index(),
    //             $left = -(parseInt($(obj).children(subObj).css('width')) * $index);
    //         $(this).parent().siblings(obj).animate({
    //             'left': $left + 'px'
    //         }, 300);
    //     });
    // }   
} (jQuery));
