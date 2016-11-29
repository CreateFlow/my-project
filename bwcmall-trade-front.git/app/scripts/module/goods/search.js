'use strict';
(function($) {

    avalon.filters.categoryNameShort = function(str) { //用法： {{aaa|haha}}
        if (str) {
            if (str.length > 6) {
                return str.substring(0, 6) + "...";
            } else {
                return str;
            }
        } else {
            return "";
        }
    }

    avalon.ready(function() {
        var searchCtrl = avalon.define({
            $id: 'searchCtrl',
            $categoryId: urls.getParameter(window.location.href, 'categoryId'),
            $brandId: urls.getParameter(window.location.href, 'brandId'),
            $shopId: urls.getParameter(window.location.href, 'shopId'),
            $priceStatus: urls.getParameter(window.location.href, 'priceStatus'),
            searchwords: '',
            $order: urls.getParameter(window.location.href, 'order'),
            $direction: urls.getParameter(window.location.href, 'direction'),
            $currPage: urls.getParameter(window.location.href, 'page'),
            tab: urls.getParameter(window.location.href, 'mode'),
            $pageCount: 0,
            filterShops: [],
            filterBrands: [],
            filterCategorys: [],
            filterPrices: [{id:"", name:"全部"}, {id:"0", name:"已标价商品"}, {id:"1", name:"待询价商品"}],
            crumbsNavigation: [],
            categorysNavigation: [],
            searchBrand: {},
            searchShop: {},
            suggestBrands: [],
            inProgress: false,
            searchResult: {},
            isShoppingListModel: false,
            currentItemId: '',
            currentShoppingListId: '',
            shopListSearchResult: {
                "itemList": [],
                'id': ''
            },
            doInit: function() {
                if (!searchCtrl.$currPage) {
                    searchCtrl.$currPage = 1;
                }
                if (urls.getParameter(window.location.href, 'keywords')) {
                    searchCtrl.searchwords = decodeURIComponent(urls.getParameter(window.location.href, 'keywords'));
                } else {
                    searchCtrl.searchwords = '';
                }
                if (searchCtrl.searchwords) {
                    $(".u-sh-input").val(searchCtrl.searchwords);
                }
                //面包屑导航更多
                $('.get-more').on('click', function() {
                    var $obj = $(this).siblings('.select-tag-right');
                    var $leftHeight = $(this).siblings('.select-tag-left').css('height');
                    var $rightHeight = $obj.css('height');
                    var $height = $obj.children('ul').css('height');

                    if ($rightHeight == $leftHeight) {
                        $(this).children('.get-more-text').text("隐藏");
                        $(this).children('.get-more-icon').addClass('get-more-icon-active');
                        $obj.animate({
                            height: $height
                        }, 300);
                    } else {
                        $(this).children('.get-more-text').text("更多");
                        $(this).children('.get-more-icon').removeClass('get-more-icon-active');
                        $obj.animate({
                            height: $leftHeight
                        }, 300);
                    }
                });

                searchCtrl.initShoppingListConfig();

                if (searchCtrl.$order && !searchCtrl.$direction) {
                    searchCtrl.$direction = 'desc';
                }

                searchCtrl.trackUserHobby("search",0,'');

                searchCtrl.search();
            },
            onFoldTitleClick: function() {
                if (!$(this).hasClass('m-fold-title-active')) {
                    $('.m-fold-title').removeClass('m-fold-title-active');
                    $(this).addClass('m-fold-title-active');
                    $('.m-fold-inner').slideUp(300);
                    $(this).siblings('.m-fold-inner').slideDown(300);
                }
            },
            shopingListItemClick: function(itemId, itemName) {
                var f = $.cookie()['shoppingList'];
                if (f) {
                    var shoppingList = $.parseJSON(f);
                    shoppingList.currentItemId = itemId;
                    $.cookie('shoppingList', JSON.stringify(shoppingList), {
                        path: '/'
                    });
                    var baseUrl = '/goods/search.html?keywords=' + encodeURIComponent(encodeURIComponent(itemName));
                    window.location.href = baseUrl;
                }
            },
            getWidth:function(name){
                return (name.length * 10+60)+"px";
            },
            clearKeywords: function() {
                searchCtrl.searchwords = '';
                searchCtrl.searchByCondition('', '', '', searchCtrl.$priceStatus);
            },
            clearBrandId: function() {
                searchCtrl.$brandId = '';
                searchCtrl.searchByCondition('', '', '', searchCtrl.$priceStatus);
            },
            clearShopId: function() {
                searchCtrl.$shopId = '';
                searchCtrl.searchByCondition('', '', '', searchCtrl.$priceStatus);
            },
            changeOrderBy: function(col) {
                if (searchCtrl.$direction == 'desc') {
                    searchCtrl.$direction = 'asc';
                } else {
                    searchCtrl.$direction = 'desc';
                }
                if (col == 'default') {
                    searchCtrl.$order = '';
                    searchCtrl.$direction = '';
                } else if (col == 'sales') {
                    searchCtrl.$order = 'sales';
                } else if (col == 'price') {
                    searchCtrl.$order = 'price';
                }
                searchCtrl.searchByCondition('', '', '', searchCtrl.$priceStatus);
            },
            changeModeBy: function(mode){
                searchCtrl.tab = mode;
            },
            searchByCondition: function(shopId, brandId, catId, priceStatus) {
                if (!shopId) {
                    shopId = searchCtrl.$shopId;
                }
                if (!brandId) {
                    brandId = searchCtrl.$brandId;
                }
                if (!catId) {
                    catId = searchCtrl.$categoryId;
                }
                //if (!priceStatus) {
                //    priceStatus = searchCtrl.$priceStatus;
                //}
                var baseUrl = '/goods/search.html?t='+(new Date()).getTime();


                if(searchCtrl.searchwords){
                      baseUrl = baseUrl + "&keywords=" + encodeURIComponent(encodeURIComponent(searchCtrl.searchwords));
                }
                if (shopId) {
                    baseUrl = baseUrl + "&shopId=" + shopId;
                }
                if (brandId) {
                    baseUrl = baseUrl + "&brandId=" + brandId;
                }
                if (catId) {
                    baseUrl = baseUrl + "&categoryId=" + catId;
                }
                if (priceStatus) {
                    baseUrl = baseUrl + "&priceStatus=" + priceStatus;
                }
                if (searchCtrl.tab) {
                     baseUrl = baseUrl + "&mode=" + searchCtrl.tab;
                }
                if (searchCtrl.$order) {
                    baseUrl = baseUrl + "&order=" + searchCtrl.$order;
                    if (!searchCtrl.$direction) {
                        searchCtrl.$direction = 'desc';
                    }
                    baseUrl = baseUrl + "&direction=" + searchCtrl.$direction;
                }
                window.location.href = baseUrl;
            },
            addCart: function(item) {
                if (!storage.isLogin()) {
                    //redirect to login
                    urls.goLogin();
                } else {
                    //加入购物车
                    var ship = 0;
                    if(item.shipPrices.length>0) {
                        ship = item.shipPrices[0].ship;
                    }
                    var listNumInput=parseInt($(this).siblings('.list-num-wrap').children('.purchase-input').val());
                    if(!listNumInput){
                        listNumInput=1;
                    }
                    cart.addItem(item.id, listNumInput, ship);
                    searchCtrl.flyToCart($(this));
                }
            },
            flyToCart: function(item) {
                var img = item.siblings('.product-img').find('img');
                var flyElm = img.clone().css('opacity', 0.75).addClass('fly');
                $('body').append(flyElm);
                var objT= img.offset().top-$(window).scrollTop();
                var objL=$('.purchase-order-title').offset().left+120;
                flyElm.css({
                    'z-index': 9000,
                    'display': 'block',
                    'position': 'fixed',
                    'top': objT +'px',
                    'left': img.offset().left +'px',
                    'width': img.width() +'px',
                    'height': img.height() +'px'
                });
                flyElm.animate({
                    top: 0,
                    left: objL,
                    width: 5,
                    height: 5,
                }, 'slow', function() {
                    flyElm.remove();
                })
            },
            addshoplist: function(goodsId) {
                if (!storage.isLogin()) {
                    //redirect to login
                    urls.goLogin();
                } else {
                    //加入购物清单
                    // cart.addItem(goodsId,1);
                    var data = {
                        id: searchCtrl.currentItemId,
                        shoppingListId: searchCtrl.currentShoppingListId,
                        goodsId: goodsId,
                        quantity: $('.shopListSearchResultcurr .needquatity').text()
                    };
                    io.POST(apiConfig.shoppingList + searchCtrl.currentShoppingListId + '/goods', data, function(data) {
                        if (data.success == true) {
                            window.location.reload();
                        }
                    });
                }
            },
            initShoppingListConfig: function() {
                var isLogin = storage.isLogin();
                var shoplistid = urls.getParameter(window.location.href, 'id');
                var f = $.cookie()['shoppingList'];
                var shoppingList = [];
                if (f && isLogin) {
                    var shoppingList = $.parseJSON(f);
                    searchCtrl.isShoppingListModel = shoppingList.isShoppingListModel;
                    searchCtrl.currentItemId = shoppingList.currentItemId;
                    searchCtrl.currentShoppingListId = shoppingList.id;
                    searchCtrl.shopListSearchResult = shoppingList;
                    io.GET(apiConfig.shoppingList + shoppingList.id, function(data) {
                        if (data.success == true) {
                            $.each(data.result.itemList, function(i, k) {
                                if (searchCtrl.currentItemId == k.id) {
                                    $('.shopListSearchResultli').eq(i).addClass('shopListSearchResultcurr');
                                }
                                if (k.itemStatus == '1') {
                                    $('.shopListSearchResultli').eq(i).addClass('shopListSearchResulttrue');
                                }
                            });
                            $.cookie('shoppingList', JSON.stringify(shoppingList), {
                                path: '/'
                            });
                        }
                    });

                }
            },

            goLogin: function(item){
                if (!storage.isLogin()) {
                    urls.goLogin();
                } else {
                    if(parseInt(item.shopId) == 1) {
                        window.open("http://wpa.qq.com/msgrd?v=3&uin=3366370013&site=qq&menu=yes");
                    }
                }
            },
            formatDate: function(strTime, fmt) {
                var date = new Date(strTime),
                    opts = {
                        "M+" : date.getMonth() + 1,                     //月份
                        "d+" : date.getDate(),                          //日
                        "h+" : date.getHours(),                         //小时
                        "m+" : date.getMinutes(),                       //分
                        "s+" : date.getSeconds(),                       //秒
                        "q+" : Math.floor( (date.getMonth() + 3) / 3),  //季度
                        "S"  : date.getMilliseconds()                   //毫秒
                    };

                if( /(y+)/.test(fmt) ) {
                    fmt = fmt.replace( RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length) );
                }
                for (var k in opts) {
                    if ( new RegExp('(' + k + ')').test(fmt) ) {
                        fmt = fmt.replace( RegExp.$1, (RegExp.$1.length == 1) ?
                            (opts[k]) : (('00' + opts[k]).substr( (''+ opts[k]).length) ) );
                    }
                }
                return fmt;
            },
            trackUserHobby:function(type,index,goodsId){
                var postData = {};
                postData.type = type;
                postData.index = index;
                postData.goodsId = goodsId;
                postData.type = type;
                if(storage.getUser()){
                    postData.userId = storage.getUser().userId;
                }else{
                    postData.userId = "";
                }
                postData.date = searchCtrl.formatDate(new Date(),"yyyy-MM-dd hh:mm:ss");
                postData.keywords = decodeURIComponent(decodeURIComponent(urls.getParamByKey("keywords")));

                io.POST(apiConfig.trackUserHobby, JSON.stringify(postData), function(data) {
                });
            },

            isNull: function(data) {
                if (data && data != null && data != 'null') {
                    return false;
                } else {
                    return true;
                }
            },
            search: function() {
                var isFirst = false;
                searchCtrl.inProgress = true;
                if ((searchCtrl.$pageCount != 0 && searchCtrl.$pageCount <= searchCtrl.$currPage) || (searchCtrl.$pageCount == -1)) {
                    return;
                }
                var postData = {};

                postData.per_page = 40;
                if (searchCtrl.$currPage <= 1) {
                    isFirst = true;
                }

                if (!searchCtrl.isNull(searchCtrl.$categoryId)) {
                    postData.categoryId = searchCtrl.$categoryId;
                }

                if (!searchCtrl.isNull(searchCtrl.$brandId)) {
                    postData.brandId = searchCtrl.$brandId;
                }

                if (!searchCtrl.isNull(searchCtrl.$shopId)) {
                    postData.shopId = searchCtrl.$shopId;
                }
                if (!searchCtrl.isNull(searchCtrl.$priceStatus)) {
                    postData.priceStatus = searchCtrl.$priceStatus;
                }
                if (searchCtrl.searchResult && searchCtrl.searchResult.productPager) {
                    postData.page = (searchCtrl.$currPage + 1);
                } else {
                    postData.page = searchCtrl.$currPage;
                }

                if (!searchCtrl.isNull(searchCtrl.$order)) {
                    postData.order = searchCtrl.$order;
                    postData.direction = searchCtrl.$direction;
                }
                if (!searchCtrl.isNull(searchCtrl.searchwords)) {
                    postData.keyword = encodeURIComponent(encodeURIComponent(searchCtrl.searchwords));
                }


                io.GET(apiConfig.product, postData, function(data) {
                    searchCtrl.inProgress = false;
                    if (data && data.success) {
                        if (data.result.productPager) {
                            searchCtrl.$currPage = data.result.productPager.currPage;
                            searchCtrl.$pageCount = data.result.productPager.pageCount;
                        }
                        if (!searchCtrl.searchResult.productPager) { //如果productPager不存在，表示第一次查询
                            
                            // $('.mode a').click(function(){
                            //     if(searchCtrl.tab=='list'){
                            //         searchCtrl.tab='grid';
                            //     }else{
                            //         searchCtrl.tab='list';
                            //     }
                            //     $(this).addClass('cur-mode').siblings().removeClass('cur-mode');
                            // })
                        }
                        if (searchCtrl.searchResult && searchCtrl.searchResult.productPager) {
                            for (var i = 0; i < data.result.productPager.pageItems.length; i++) {
                                searchCtrl.searchResult.productPager.pageItems.push(data.result.productPager.pageItems[i]);
                            }
                        } else {
                            searchCtrl.searchResult = data.result;
                            setTimeout(function() {
                                 $("#searchResultPannel").show();
                            }, 1);
                        }
                        if (!searchCtrl.searchResult.productPager.pageItems || searchCtrl.searchResult.productPager.pageItems.length == 0) {
                            $("#searchError").show();
                            searchCtrl.$pageCount = -1;
                        } else {
                            $("#searchError").hide();
                        }
                        if (isFirst) {
                            if (data.result) {
                                if (data.result.filterShops) {
                                    searchCtrl.filterShops = data.result.filterShops;
                                }
                                if (data.result.filterBrands) {
                                    searchCtrl.filterBrands = data.result.filterBrands;
                                }
                                if (data.result.filterCategorys) {
                                    searchCtrl.filterCategorys = data.result.filterCategorys;
                                }
                                if (data.result.crumbsNavigation) {
                                    searchCtrl.crumbsNavigation = data.result.crumbsNavigation;
                                }
                                if (data.result.searchBrand) {
                                    searchCtrl.searchBrand = data.result.searchBrand;
                                }
                                if (data.result.shop) {
                                    searchCtrl.searchShop = data.result.shop;
                                }
                                if (data.result.brands) {
                                    searchCtrl.suggestBrands = data.result.brands;
                                }
                                if (data.result.categorysNavigation) {
                                    searchCtrl.categorysNavigation = data.result.categorysNavigation;
                                }


                            }
                        }
                    }
                }, function(data) {
                    searchCtrl.inProgress = false;
                    if (!searchCtrl.searchResult.productPager || !searchCtrl.searchResult.productPager.pageItems || searchCtrl.searchResult.productPager.pageItems.length == 0) {
                        $("#searchError").show();
                    }
                });
            },

            mask: function() {
                $('html').css('overflow','hidden');
                $('#know').click(function(){
                    recover();
                })
                setTimeout(function(){
                    recover();
                },8000)
                function recover(){
                    $('.mask').remove();
                    $('html').css('overflow','scroll');
                }
            },

            setReadFlag: function() {
                storage.set("read_flag", '1');
            },

            getReadFlag: function() {
                if (storage.get("read_flag") == undefined){
                    searchCtrl.mask();
                }
                return storage.get("read_flag");
            },

            //加号
            numAdd: function() {
                var $numObj = $(this).siblings('.purchase-input');
                $numObj.val(parseInt($numObj.val()) + 1);
            },

            //减号
            numMin: function(){
                var $numObj = $(this).siblings('.purchase-input');
                if ($numObj.val() > 1) {
                    $numObj.val(parseInt($numObj.val()) - 1);
                }
            },

            //输入框
            inputKeyup: function(){
                $(this).val($(this).val().replace(/[^0-9]/g, ''));
                if ($(this).val() <= 0) {
                    $(this).val(1);
                }
            }

        });


        avalon.scan();
        searchCtrl.doInit();
        searchCtrl.setReadFlag();


        //tag-info
        $('.delivery-tag-info').hover(function() {
            $('.delivery-tag-info-hidden').show();
        }, function() {
            $('.delivery-tag-info-hidden').hide();
        });

        $(window).bind("scroll", function() {
            var hScroll = $(window).scrollTop();
            var hDocument = $(document).height();
            var hWindow = $(window).height();
            if ((hDocument - hScroll) < 1500) {
                if (!searchCtrl.inProgress) {
                    searchCtrl.search();
                }

            }
        });
    });
}(jQuery));
