avalon.ready(function() {
    var sideBarCtrl = avalon.define({
        $id: 'sideBarCtrl',
        //list data
        favoriteListData: [],
        //car list data
        cartListData: [],
        //总收藏数量
        favoriteNum: 0,
        //购物车总数量
        cartNum: 0,
        //购物车总价
        cartTotal: 0,
        //是否显示侧边栏 进货单这几个字
        showWord:false,

        setListCart: function(data) {
            sideBarCtrl.cartNum = data.totalQuantity;
            sideBarCtrl.cartTotal = data.totalPrice ;
            sideBarCtrl.totalMoney = data.totalPrice; 
            sideBarCtrl.cartListData = data.cartItemList;
        },
        //添加购物车
        listCart: function() {
            if ( storage && storage.isLogin() ) {
                io.GET(apiConfig.listCart, function(data) {
                    if (data.success) {
                        sideBarCtrl.cartListData = data.result.cartItemList; 
                        sideBarCtrl.cartNum = data.result.totalQuantity;
                        sideBarCtrl.cartTotal = data.result.totalPrice ;
                    }
                });
            }
        },
        showFllowWord:function(){
            sideBarCtrl.showWord = true;
        },
        hideFllowWord:function(){
           sideBarCtrl.showWord = false;
        }

    });
 
    //获取购物车数据
    sideBarCtrl.listCart();

    avalon.scan();

    var $height = $(window).height();
    //置height
    $('.bwc-side-bar-wrap').css('height', $height);
    $('.bwc-side-bar').css('height', $height);
    $('.bwc-side').css('height', $height);
    $('.bwc-bar').css('height', $height);
    $('.bwc-side-plugin-fllow').css('height', $height);
    $('.bwc-side-plugin-cart').css('height', $height);

    $(window).resize(function() {
        $height = $(window).height();
        $('.bwc-side-bar-wrap').css('height', $height);
        $('.bwc-side-bar').css('height', $height);
        $('.bwc-side').css('height', $height);
        $('.bwc-bar').css('height', $height);
        $('.bwc-side-plugin-fllow').css('height', $height);
        $('.bwc-side-plugin-cart').css('height', $height);
    });

    //侧边购物车事件
    $('.bwc-bar-cart').click(function(e) {
        if (parseInt($('.bwc-side-bar').css('right')) < 0) {
            bwcSideFold(e);
            bwcSideCart();
            e.stopPropagation();
            return false;
        } else {
               bwcSideFold();
              bwcSideFllow();
            e.stopPropagation();
            return false;
        }

    });

    //折叠按钮事件
    $('.bwc-bar-btn').click(function() {
        bwcSideFold();
        bwcSideFllow();
    });

    //点击其他地方折叠
    $(document).click(function() {
        bwcSideFold(0);
    });

    function bwcSideFold(tag) {
        var $obj = $('.bwc-side-bar'),
            $oBtn = $('.bwc-bar-btn');


        if (tag == '0') {
            $obj.animate({
                right: "-220px"
            });
            $oBtn.hide();
            return;
        }
        if (tag == '1') {
            $obj.animate({
                right: "0"
            });
            $oBtn.show();
            return;
        }

        parseInt($obj.css('right')) < 0 ? $obj.animate({
            right: "0"
        }) : $obj.animate({
            right: "-220px"
        });
        parseInt($obj.css('right')) < 0 ? $oBtn.show() : $oBtn.hide();
    }

    function bwcSideFllow() {
        var $obj = $('.bwc-side-plugin-fllow'),
            $pObj = $('.bwc-side-bar'),
            $cartObj = $('.bwc-side-plugin-cart');

        $cartObj.hide();
        $obj.fadeIn(300);
        //parseInt($pObj.css('right')) < 0?$obj.fadeIn(300):$obj.fadeOut(300);
    }

    function bwcSideCart() {
        var $obj = $('.bwc-side-plugin-cart'),
            $fllowObj = $('.bwc-side-plugin-fllow');

        $fllowObj.hide();
        $obj.fadeIn(300);
    }

    //屏蔽滚动条
    function bwcSideShield() {
        //滚动条事件
        document.getElementById('bwcSide').onmousewheel = function scrollWheel(e) {
            var sl;
            e = e || window.event;
            if (navigator.userAgent.toLowerCase().indexOf('msie') >= 0) {
                event.returnValue = false;
            } else {
                e.preventDefault();
            };
            if (e.wheelDelta) {
                sl = e.wheelDelta;
            } else if (e.detail) {
                sl = -e.detail;
            };
        };
        if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
            //firefox支持onmousewheel
            addEventListener('DOMMouseScroll',
                function(e) {
                    var obj = e.target;
                    var onmousewheel;
                    while (obj) {
                        onmousewheel = obj.getAttribute('onmousewheel') || obj.onmousewheel;
                        if (onmousewheel) break;
                        if (obj.tagName == 'BODY') break;
                        obj = obj.parentNode;
                    };
                    if (onmousewheel) {
                        if (e.preventDefault) e.preventDefault();
                        e.returnValue = false; //禁止页面滚动
                        if (typeof obj.onmousewheel != 'function') {
                            //将onmousewheel转换成function
                            eval('window._tmpFun = function(event){' + onmousewheel + '}');
                            obj.onmousewheel = window._tmpFun;
                            window._tmpFun = null;
                        };
                        // 不直接执行是因为若onmousewheel(e)运行时间较长的话，会导致锁定滚动失效，使用setTimeout可避免
                        setTimeout(function() {
                                obj.onmousewheel(e);
                            },
                            1);
                    };
                },
                false);
        };
    }
});