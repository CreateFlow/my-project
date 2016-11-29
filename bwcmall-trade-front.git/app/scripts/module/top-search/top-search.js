  avalon.ready(function() {
    var model = avalon.define('topSearchCtrl', function(vm) {

      vm.suggestResult = {}; //主推荐结果
      vm.suggestBrandList = [] //悬停品牌标题推荐的品牌结果
      vm.suggestBrandCatList = []; //悬停具体品牌推荐的分类结果
      vm.suggestCatList = []; //悬停品名推荐的分类结果
      vm.suggestCatProductList = []; //悬停具体分类推荐的商品结果
      vm.suggestSNList = []; //悬停型号标题推荐的型号
      vm.suggestSNProductList = []; //悬停型号推荐的商品结构
      vm.suggestShopList = [];
      vm.suggestShopProductList = [];
      vm.isShoppingListModel = false;
      vm.currentItemId = '';
      vm.currentShoppingListId = '';

      var f = $.cookie()['shoppingList'];
      if (f) {
        var shoppingList = $.parseJSON(f);
        vm.currentItemId = shoppingList.currentItemId;
        vm.currentShoppingListId = shoppingList.id;
        vm.isShoppingListModel = shoppingList.isShoppingListModel;
      }

      document.onclick = function() {
        $(".search_result").hide();
      };
      $(".search_result").on("click", function(e) {
        var e = window.event || event;
        if (e.stopPropagation) {
          e.stopPropagation();
        } else {
          e.cancelBubble = true;
        }
      });
      vm.onSearchKeyup = function(e) {
        if (e.keyCode == '13') {
          vm.doSearch();
        }
        vm.searchinput();
      };
      vm.onSearchBtnClick = function(e) {
        vm.doSearch();
      };
      vm.viewDetail = function(id) {
        window.location.href = "/goods/detail.html?id=" + id;
      };
      vm.doSearch = function(shopId, brandId, categoryId, sn) {
        var href = "/goods/search.html?";
        var keyword = vm.getKeyword();
        if (brandId && !(typeof brandId == 'string')) {
          brandId = '';
        }
        if (shopId && !(typeof shopId == 'string')) {
          shopId = '';
        }

        if (sn) {
          keyword = sn;
        }
        if (keyword !== "") {
          href = href + "keywords=" + encodeURIComponent(encodeURIComponent(keyword));
        } else {
          href = href + "keywords=";
        }
        if (brandId) {
          href = href + "&brandId=" + brandId;
        }
        if (shopId) {
          href = href + "&shopId=" + shopId;
        }
        if (categoryId) {
          href = href + "&categoryId=" + categoryId;
        }
        window.location.href = href;
      }

      vm.searchinput = function() {
        var data;
        data = $(".u-sh-input").val();
        if (data == '') {
          $('.search_result').hide();
          return;
        }
        $('.search_result').show();
        // 搜索请求
        io.GET(apiConfig.searchsuggest, {
          keywords: data
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestResult = data.result;
            if (!avalon.vmodels['topSearchCtrl'].suggestResult.snList) {
              avalon.vmodels['topSearchCtrl'].suggestResult.snList = [];
            }
          }
        });
      }
      vm.addToCart = function() {
        if (!storage.isLogin()) {
          //redirect to login
          urls.goLogin();
        } else {
          var lidata = $(this).parent('li');
          var data = [];
          var obj = {};
          obj.quantity = lidata.find('input[name=sNumber]').val();
          obj.goodsId = lidata.find('.sGoodsId').text();
          data.push(obj);
          if (data && data.length > 0) {
            cart.addList(data);
          }
        }
        model.flyToCart($(this));
      }

      vm.addshoplist = function() {
        if (!storage.isLogin()) {
          //redirect to login
          urls.goLogin();
        } else {
          var lidata = $(this).closest('.search_popupmenu').find('li');
          var data = [];
          $.each(lidata, function(index, el) {
            var obj = {};
            if (parseInt($(el).find('input[name=sNumber]').val()) == 0) {
              return;
            }
            obj.id = vm.currentItemId;
            obj.shoppingListId = vm.currentShoppingListId;
            obj.quantity = $(el).find('input[name=sNumber]').val();
            obj.goodsId = $(el).find('.sGoodsId').text();
            data.push(obj);
          });
          if (data && data.length > 0) {
            io.POST(apiConfig.shoppingList + vm.currentShoppingListId + '/goods', data[0], function(data) {
              if (data.success == true) {
                alert("成功加入购物清单！");
              }
            });
          }

        }
      }
      vm.numAdd = function() {
        var $numObj = $(this).parent().find('.product-num');
        var numVal = $numObj.val();
        numVal = parseInt(numVal) + 1;
        $numObj.val(numVal);
      };
      vm.numMinus = function() {
        var $numObj = $(this).parent().find('.product-num');
        var numVal = $numObj.val();
        if (numVal > 1) {
          numVal = parseInt(numVal) - 1;
        }
        $numObj.val(numVal);
      };
      vm.numKeyup = function() {
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        if ($(this).val() <= 0) {
          $(this).val(1);
        }

      };
      vm.numPaste = function() {
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        if ($(this).val() <= 0) {
          $(this).val(1);
        }
        var numVal = $(this).val();
      };
      vm.getKeyword = function() {
        var keyword = $(".u-sh-input").val();
        return keyword;
      };
      vm.subStr = function(str,num){
        if(str){
          if(str.length>num){
            return str.subStr(0,num);
          }else{
            return str;
          }
        }else{
          return "";
        }
      }
      //品名 
      //品名标题鼠标进入
      vm.onCategoryTitleMouseover = function() {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/category", {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestCatList = data.result;
          }
        });
      };
      //品名标题鼠标移出
      vm.onCategoryTitleMouseout = function() {
        // avalon.vmodels['topSearchCtrl'].suggestCatList = [];
      };

      //具体的某一个cat鼠标进入
      vm.onCategoryMouseover = function(categoryId) {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/category/" + categoryId, {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestCatProductList = data.result;
          }
        });
      };
      //具体的某一个cat鼠标移出
      vm.onCategoryMouseout = function() {
        // avalon.vmodels['topSearchCtrl'].suggestCatProductList = []; 
      };



      //店铺名 
      //店铺名标题鼠标进入
      vm.onShopTitleMouseover = function() {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/shop", {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestShopList = data.result;
          }
        });
      };
      //店铺名标题鼠标移出
      vm.onShopTitleMouseout = function() {
        // avalon.vmodels['topSearchCtrl'].suggestCatList = [];
      };

      //具体的某一个shop鼠标进入
      vm.onShopMouseover = function(shopId) {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/shop/" + shopId, {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestShopProductList = data.result;
          }
        });
      };
      //具体的某一个shop鼠标移出
      vm.onShopMouseout = function() {
        // avalon.vmodels['topSearchCtrl'].suggestCatProductList = []; 
      };



      //品牌
      //品牌标题鼠标进入
      vm.onBrandTitleMouseover = function() {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/brand/", {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestBrandList = data.result;
          }
        });
      };
      //品牌标题鼠标移出
      vm.onBrandTitleMouseout = function() {
        //  avalon.vmodels['topSearchCtrl'].suggestBrandList = []; 
      };
      //具体的某一个品牌鼠标进入
      vm.onBrandMouseover = function(brandId) {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/brand/" + brandId, {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestBrandCatList = data.result;
          }
        });
      };
      //具体的某一个品牌鼠标移出
      vm.onBrandMouseout = function() {
        //     avalon.vmodels['topSearchCtrl'].suggestBrandCatList = []; 
      };



      //型号
      //型号标题鼠标进入
      vm.onSNTitleMouseover = function() {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/sn/", {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestSNList = data.result;
          }
        });
      };
      //型号标题鼠标移出
      vm.onSNTitleMouseout = function() {
        //   avalon.vmodels['topSearchCtrl'].suggestSNList = [];
      };
      //具体的某一个型号鼠标进入
      vm.onSNMouseover = function(sn) {
        // 搜索请求
        io.GET(apiConfig.searchsuggest + "/sn/" + sn, {
          keywords: vm.getKeyword()
        }, function(data) {
          if (data.success == true) {
            avalon.vmodels['topSearchCtrl'].suggestSNProductList = data.result;
          }
        });
      };
      //具体的某一个型号鼠标移出
      vm.onSNMouseout = function() {
        // avalon.vmodels['topSearchCtrl'].suggestSNProductList = [];
      };

      //飞入购物车
      vm.flyToCart = function(item) {
          var img = item.siblings('.goods_list_detail').children('img');
          var flyElm = img.clone().css('opacity', 0.75).addClass('fly');
          $('body').append(flyElm);
          var objT= img.offset().top-$(window).scrollTop();
          var objL=$('.purchase-order-title').offset().left+120;
          flyElm.css({
              'z-index': 9999,
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
              height: 5 
          }, 'slow', function() {
              flyElm.remove();
          });
      } 
    });
    avalon.scan();
  });