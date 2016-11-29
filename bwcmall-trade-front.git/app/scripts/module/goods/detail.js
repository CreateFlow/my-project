'use strict';

(function($) {
    var salePrice = null;

    avalon.ready(function() {
        var detailsCtrl = avalon.define({
            $id: 'detailsCtrl',
            $isLogin: storage.isLogin(),
            product: {
                images:[],
                propertyList:[]

            },
            isShoppingListModel: false,
            currentItemId: '',
            currentShoppingListId: '',
            shipInfo: [],
            selectedShipIndex: 0,
            selectedShip: '',
            priceInfo: "",
            computeShip: function(shipMin, shipMax) {
                if (shipMin == shipMax) {
                    if (shipMin == 0) {
                        return "当";
                    } else {
                        return shipMin;
                    }
                } else {
                    if (shipMin > shipMax) {
                        return shipMax + "-" + shipMin;
                    } else {
                        return shipMin + "-" + shipMax;
                    }
                }
            },
            addshoplist: function() {
                if (!storage.isLogin()) {
                    //redirect to login
                    urls.goLogin();
                } else {
                    var data = {
                        id: detailsCtrl.currentItemId,
                        shoppingListId: detailsCtrl.currentShoppingListId,
                        goodsId: urls.getParameter(window.location.href, 'id'),
                        quantity: $("#product-num").val()
                    };
                    io.POST(apiConfig.shoppingList + detailsCtrl.currentShoppingListId + '/goods', data, function(data) {
                        if (data.success == true) {
                            alert("成功加入购物清单！");
                        }
                    });
                }
            },
            addCart: function() {
                if (!storage.isLogin()) {
                    //redirect to login
                    urls.goLogin();
                } else {
                    var num = $("#product-num").val();
                    if (num == undefined) {
                        num = 1;
                    }
                    var productId = $("#productId").val();

                    var ship = detailsCtrl.shipInfo.length>0?detailsCtrl.shipInfo[detailsCtrl.selectedShipIndex].ship:0;
                    //加入购物车
                    cart.addItem(productId, num, ship);
                    detailsCtrl.flyToCart($(this));
                }
            },
            //飞入购物车
            flyToCart: function (item){
                //var img = item.parents('.product-left').find('.jqzoom img');
                var img = item.parents('.product-right').siblings('.product-left').find('.jqzoom img');
                var flyElm = img.clone().css('opacity', 0.75).addClass('fly');
                $('body').append(flyElm);
                var objT= img.offset().top-$(window).scrollTop();
                var objL=$('.purchase-order-title').offset().left+120;
                var imageRate = 0.3;
                flyElm.css({
                    'z-index': 9000,
                    'display': 'block',
                    'position': 'fixed',
                    'top': (objT+img.height()*(1-imageRate)/2) +'px',
                    'left': (img.offset().left+img.width()*(1-imageRate)/2) +'px',
                    'width': img.width()*imageRate +'px',
                    'height': img.height()*imageRate +'px'
                });
                flyElm.animate({
                    top: 0,
                    left: objL,
                    width: 5,
                    height: 5
                }, 'slow', function() {
                    flyElm.remove();
                });
            },
            goLogin: function(){
                if (!storage.isLogin()) {
                    urls.goLogin();
                } else {
                    if(parseInt(detailsCtrl.product.shopId) == 1) {
                        window.open("http://wpa.qq.com/msgrd?v=3&uin=3366370013&site=qq&menu=yes");
                    }
                }
            },
            //显示价格信息
            getPriceElement: function(item) {
                if(detailsCtrl.shipInfo.length>0) {
                    var elementString = '';
                    for(var i=0; i<detailsCtrl.shipInfo[detailsCtrl.selectedShipIndex].value.length; i++) {
                        elementString += '<span><span class="product-price">' + formatPrice(detailsCtrl.shipInfo[detailsCtrl.selectedShipIndex].value[i].price) + '</span>'
                                         + '(' + detailsCtrl.shipInfo[detailsCtrl.selectedShipIndex].value[i].quantityMin
                                         + '~' + ((detailsCtrl.shipInfo[detailsCtrl.selectedShipIndex].value[i].quantityMax==-1)?'以上':(detailsCtrl.shipInfo[detailsCtrl.selectedShipIndex].value[i].quantityMax))
                                         + ')&emsp;&emsp;&emsp;&emsp;</span>';
                    }
                    return elementString;
                }
                return '<span class="product-price">' + formatPrice(item.price) + '</span>' + (item.unit?('/'+item.unit):'');
            },
            changeShip: function(index) {
                detailsCtrl.selectedShipIndex = index;

                var $numObj = $("#product-num");
                var numVal = $numObj.val();
                calcTotalPrice(numVal);
                detailsCtrl.priceInfo =  detailsCtrl.getPriceElement(detailsCtrl.product);
                avalon.scan();
            }
        });
        var f = $.cookie()['shoppingList'];
        if (f) {
            var shoppingList = $.parseJSON(f);
            detailsCtrl.currentItemId = shoppingList.currentItemId;
            detailsCtrl.currentShoppingListId = shoppingList.id;
            detailsCtrl.isShoppingListModel = shoppingList.isShoppingListModel;
        }
        io.GET(apiConfig.product + "/" + urls.getParameter(window.location.href, 'id'), function(data) {
            if(data.success) {
                detailsCtrl.product = data.result;
                if(!detailsCtrl.product.images){
                    detailsCtrl.product.images = [];
                }
                 if(!detailsCtrl.product.propertyList){
                    detailsCtrl.product.propertyList = [];
                }
                salePrice = data.result.price;
                detailsCtrl.$totalPrice = salePrice;

                //货期数据
                var shipInfo = {};
                for(var i=0; i<detailsCtrl.product.shipPrices.length; i++) {
                    if(!shipInfo[detailsCtrl.product.shipPrices[i].ship+""]) {
                        shipInfo[detailsCtrl.product.shipPrices[i].ship+""] = [];
                    }
                    shipInfo[detailsCtrl.product.shipPrices[i].ship+""].push({name:detailsCtrl.product.shipPrices[i].ship==0?"当天":detailsCtrl.product.shipPrices[i].ship+"天",
                                                                        ship: detailsCtrl.product.shipPrices[i].ship,
                                                                        quantityMin: detailsCtrl.product.shipPrices[i].quantityMin,
                                                                        quantityMax: detailsCtrl.product.shipPrices[i].quantityMax,
                                                                        price: detailsCtrl.product.shipPrices[i].price
                                                                    });
                }

                for (var key in shipInfo) {
                    detailsCtrl.shipInfo.push({name:shipInfo[key][0].name, ship:shipInfo[key][0].ship, value:shipInfo[key]});
                }

                if(detailsCtrl.shipInfo.length>0) {
                    detailsCtrl.selectedShipIndex = 0;
                    detailsCtrl.selectedShip = detailsCtrl.shipInfo[0].ship + "";
                    var $numObj = $("#product-num");
                    var numVal = $numObj.val();
                    calcTotalPrice(numVal)
                }

                detailsCtrl.priceInfo =  detailsCtrl.getPriceElement(detailsCtrl.product);
                avalon.scan();
                pic_turn(detailsCtrl.product.images.length);
            }
        });
        avalon.scan();

        //tag-info
        $('.delivery-tag-info').hover(function() {
            $('.delivery-tag-info-hidden').show();
        }, function() {
            $('.delivery-tag-info-hidden').hide();
        });

        //加减号
        $('#product-minus').on('click', function() {
            var $numObj = $("#product-num");
            var numVal = $numObj.val();
            if (numVal > 1) {
                numVal = parseInt(numVal) - 1;
                $numObj.val(numVal);
                calcTotalPrice(numVal);
            }
        });

        $('#product-add').on('click', function() {
            var $numObj = $("#product-num");
            var numVal = $numObj.val();
            numVal = parseInt(numVal) + 1;
            $numObj.val(numVal);
            calcTotalPrice(numVal);
        });

        //输入框只能输大于0数字
        $('#product-num').on('keyup', function() {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
            if ($(this).val() <= 0) {
                $(this).val(1);
            }

            var numVal = $(this).val();
            calcTotalPrice(numVal);
        }).on("paste", function() {
            //粘贴处理
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
            if ($(this).val() <= 0) {
                $(this).val(1);
            }
            var numVal = $(this).val();
            calcTotalPrice(numVal);
        })

        function calcTotalPrice(numVal) {
            //取价格
            var queryParam = {
                goodsId: urls.getParameter(window.location.href, 'id'),
                quantity: numVal,
                ship: detailsCtrl.shipInfo.length>0?detailsCtrl.shipInfo[detailsCtrl.selectedShipIndex].ship:0
            }

            io.GET(apiConfig.queryPrice, queryParam, function(data) {
                if (data.success == true) {
                    salePrice = data.result.price;
                }
                $("#total-price").html(formatPrice(salePrice * numVal));
            });
        }


    });



}(jQuery));
//==================图片详细页函数=====================
//鼠标经过预览图片函数
function preview(img) {
    $("#preview .jqzoom img").attr("src", $(img).attr("src"));
    $("#preview .jqzoom img").attr("jqimg", $(img).attr("bimg"));
}
$('.jqzoom').jqueryzoom({
    xzoom:560,
    yzoom:560
});
//图片预览小图移动效果,页面加载时触发
function pic_turn(count){
    if(count>5){ 
        var oul=$('.spec-scroll ul');
        // var wli=$('.spec-scroll ul li').outerWidth(true);

        $('.spec-scroll .prev').click(function(){
            oul.prepend(oul.find('li:last')).css('left',-76+'px');
            oul.stop(true,false).animate({'left':0},300);
        })
        
        $('.spec-scroll .next').click(function(){
            oul.stop(false,true).animate({'left':-76+'px'},300,function(){
                oul.append(oul.find('li:first')).css('left',0); 
            });
        });
    }
}

//==================图片详细页函数=====================

function addshoplist() {
    if (!storage.isLogin()) {
        //redirect to login
        urls.goLogin();
    } else {
        var num = $("#product-num").val();
        if (num == undefined) {
            num = 1;
        }
        var productId = $("#productId").val();
        //加入购物车
        // cart.addItem(productId,num);
        var data = {
            id: $.parseJSON($.cookie()['shoppingList']).curritemid,
            shoppingListId: $.parseJSON($.cookie()['shoppingList']).id,
            goodsId: $("#productId").val(),
            requiredQuantity: $("#product-num").val()
        };
        io.POST(apiConfig.shoppingList + data.shoppingListId + '/goods', data, function(data) {
            if (data.success == true) {
                // window.location.reload();
                alert('添加成功!');
            }
        });
    }
}
