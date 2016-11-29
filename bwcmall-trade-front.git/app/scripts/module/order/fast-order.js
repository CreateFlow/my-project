avalon.ready(function() {
    //键盘事件数据
    var mIndex = -1;
    var addObj = {
        outIndex: '',
        id: '',
        sn: '',
        unit: '',
        image: '',
        name: '',
        price: '',
        total: '',
        quantity: '',
        brandName: '',
        disabled: ''
    };
    var FastOrderCtrl = avalon.define('FastOrderCtrl', function(vm) {
        //总价
        vm.totalMoney = 0;
        vm.isLogin = storage.isLogin();
        if (!vm.isLogin) {
            urls.goLogin();
        }
        //总数量
        vm.totalNum = 0;
        //键盘计数
        vm.keyboardModel = -1;
        //tr数组
        vm.trArr = [{
            //品牌名
            "brandName": "",
            //品牌ID
            "brandId": "",
            //商品型号
            "sn": "请先选择品牌",
            //商品ID
            "id": "",
            //商品名称
            "name": "",
            //商品图片
            "image": "",
            //商品数量
            "quantity": 0,
            //商品单位
            "unit": "",
            //售价
            "price": "",
            //小计
            "total": "",
            //输入框状态
            "disabled": true
        }, {
            "brandName": "",
            "brandId": "",
            "sn": "请先选择品牌",
            "id": "",
            "name": "",
            "image": "",
            "quantity": 0,
            "unit": "",
            "price": "",
            "total": "",
            "disabled": true
        }, {
            "brandName": "",
            "brandId": "",
            "sn": "请先选择品牌",
            "id": "",
            "name": "",
            "image": "",
            "quantity": 0,
            "unit": "",
            "price": "",
            "total": "",
            "disabled": true
        }, {
            "brandName": "",
            "brandId": "",
            "sn": "请先选择品牌",
            "id": "",
            "name": "",
            "image": "",
            "quantity": 0,
            "unit": "",
            "price": "",
            "total": "",
            "disabled": true
        }, {
            "brandName": "",
            "brandId": "",
            "sn": "请先选择品牌",
            "id": "",
            "name": "",
            "image": "",
            "quantity": 0,
            "unit": "",
            "price": "",
            "total": "",
            "disabled": true
        }];
        //品牌列表
        vm.brandFilter = null;
        vm.brandList = [];
        vm.brandListCopy = [];
        //型号列表
        vm.productNumList = [];
        //悬浮商品标题
        vm.hoverName = '';
        //错误提示
        vm.errorInfo = '';

        //型号列表hover动效 
        vm.onSNListMouseenter = function() {
            var $obj = $(this).parents('.m-tabselect-body');
            if ($obj.siblings().hasClass('item-hover')) {
                //文字
                FastOrderCtrl.hoverName = $(this).attr('titleName');
                //图片src赋值
                $obj.siblings('.item-hover').children('img').attr('src', $(this).attr('data-bimg'));
                $obj.siblings('.item-hover').stop(true, true).fadeIn(200);
            }
        };
       vm.onSNListMouseleave =function() {
            //文字
            FastOrderCtrl.hoverName = '';
            var $obj = $(this).parents('.m-tabselect-body');
            $obj.siblings('.item-hover').stop(true, true).fadeOut(200);
        };

        //更多
        vm.getMore = function() {
            for (var i = 0; i < 5; i++) {
                vm.trArr.push({
                    "brandName": "",
                    "brandId": "",
                    "sn": "请先选择品牌",
                    "id": "",
                    "name": "",
                    "image": "",
                    "quantity": 0,
                    "unit": "",
                    "price": "",
                    "total": "",
                    "disabled": true
                });
            }

        };

        //减号
        vm.numMinus = function(index, id) {
            var $numObj = $(this).parent().children('span').children('.m-inorder-num');
            if ($numObj.val() > 1) {
                $numObj.val(parseInt($numObj.val()) - 1);
            }
            io.GET(apiConfig.productPriceQuery, {
                "goodsId": id,
                "quantity": $numObj.val()
            }, function(data) {
                if (data.success) {
                    FastOrderCtrl.trArr[index].quantity = data.result.quantity;
                    FastOrderCtrl.trArr[index].price = data.result.price;
                    FastOrderCtrl.trArr[index].total = data.result.total;
                    vm.calculateMoney();
                }
            });
        };

        //加号
        vm.numAdd = function(index, id) {
            var $numObj = $(this).parent().children('span').children('.m-inorder-num');
            if ($numObj.val() == '') {
                $numObj.val(1);
            } else {
                $numObj.val(parseInt($numObj.val()) + 1);
            }
            io.GET(apiConfig.productPriceQuery, {
                "goodsId": id,
                "quantity": $numObj.val()
            }, function(data) {
                if (data.success) {
                    FastOrderCtrl.trArr[index].quantity = data.result.quantity;
                    FastOrderCtrl.trArr[index].price = data.result.price;
                    FastOrderCtrl.trArr[index].total = data.result.total;
                    vm.calculateMoney();
                }
            });
        };

        //输入框改变数量
        vm.numChange = function(index, id) {
            var $val = $(this).val();
            io.GET(apiConfig.productPriceQuery, {
                "goodsId": id,
                "quantity": $val
            }, function(data) {
                if (data.success) {
                    FastOrderCtrl.trArr[index].quantity = data.result.quantity;
                    FastOrderCtrl.trArr[index].price = data.result.price;
                    FastOrderCtrl.trArr[index].total = data.result.total;
                    vm.calculateMoney();
                }
            });
        };

        //删除一行
        vm.delProduct = function(index) {
            vm.trArr.removeAt(index);
            vm.calculateMoney();
        };

        //计算总金额
        vm.calculateMoney = function() {
            FastOrderCtrl.totalMoney = 0;
            FastOrderCtrl.totalNum = 0;
            var total = vm.totalMoney;
            //循环查找
            for (var i = 0; i < vm.trArr.length; i++) {
                if (vm.trArr[i].id != '') {
                    total += parseFloat(vm.trArr[i].total);
                    FastOrderCtrl.totalNum += vm.trArr[i].quantity;
                }
            }
            //判断非数字
            if (isNaN(total)) {
                total = 0;
            }
            vm.totalMoney = total.toFixed(2);
        };

        //选择品牌
        vm.changeBrand = function(index, id, text) {
            vm.trArr[index].brandName = text;
            vm.trArr[index].brandId = id;
            $('.m-tabselect-body').hide();
            //清空后面数据
            vm.trArr[index].sn = '';
            vm.trArr[index].id = "";
            vm.trArr[index].unit = '';
            vm.trArr[index].image = '';
            vm.trArr[index].name = '';
            vm.trArr[index].price = '';
            vm.trArr[index].total = '';
            vm.trArr[index].quantity = 0;
            vm.trArr[index].disabled = false;
            vm.calculateMoney();
            //显示详情
            detailsShow(0, index);
        };
        //选择型号
        vm.changeModel = function(index, id, sn, unit, image, name, price, total, quantity, brandName, disabled) {
            $('.m-tabselect-body').hide();
            //重复校验
            for (var i = 0; i < vm.trArr.length; i++) {
                if (vm.trArr[i].sn == sn && index != i && vm.trArr[i].id == id) {
                    alert("商品已存在！");
                    vm.trArr[index].sn = '';
                    vm.trArr[index].id = '';
                    vm.trArr[index].unit = '';
                    vm.trArr[index].image = '';
                    vm.trArr[index].name = '';
                    vm.trArr[index].price = '';
                    vm.trArr[index].total = '';
                    vm.trArr[index].quantity = 0;
                    vm.trArr[index].disabled = false;
                    //重新计算
                    vm.calculateMoney();

                    return;
                }
            }
            if(quantity == 0 || !quantity){
                quantity = 1;
                if(price){
                     total = quantity * price;
                 }
            } 

            vm.trArr[index].sn = sn;
            vm.trArr[index].id = id;
            vm.trArr[index].unit = unit;
            vm.trArr[index].image = image;
            vm.trArr[index].name = name;
            vm.trArr[index].price = price;
            vm.trArr[index].total = total;
            vm.trArr[index].quantity = quantity;
            vm.trArr[index].brandName = brandName;
            vm.trArr[index].disabled = false;
            //重置键盘事件值
            mIndex = -1;
            addObj = {
                outIndex: '',
                id: '',
                sn: '',
                unit: '',
                image: '',
                name: '',
                price: '',
                total: '',
                quantity: '',
                brandName: '',
                disabled: ''
            };
            $('.m-tabselect-item').removeClass('m-tabselect-item-hover');
            vm.calculateMoney();
            //显示详情
            detailsShow(1, index);
        };

        //型号输入框change事件
        vm.inpChange = function(index) {
            var $id = $(this).attr('bid'),
                $val = $(this).val();
            if ($val == '') {
                $(this).siblings('.m-tabselect-body').fadeOut(200);
            } else {
                io.GET(apiConfig.productAutoComplete, {
                    "brandId": $id,
                    "sn": $val
                }, function(data) {
                    if (data.type == 'success') {
                        if (data.data.productList.length > 0) {
                            FastOrderCtrl.productNumList = data.data.productList;
                        } else {
                            FastOrderCtrl.productNumList = [];
                        }
                    }
                });
                $(this).siblings('.m-tabselect-body').fadeIn(100);
            }
        };

        //品牌输入框change事件
        vm.brandInpChange = function(name, event) {
            var arr = [],
                keys = [13, 38, 40],
                keyCode = event.keyCode || event.which || event.charCode;

            if (keys.indexOf(keyCode) !== -1) {
                keyupList(event, keyCode);
            }
            if(FastOrderCtrl.brandFilter != name) {                
                FastOrderCtrl.brandList = [];
                if (name == '') {
                    FastOrderCtrl.brandList = FastOrderCtrl.brandListCopy.slice(0, 20);
                    $(this).siblings('.m-tabselect-body').fadeIn(100);
                } else {
                    var keyword = name.toLowerCase();
                    arr = [];
                    for (var i = 0; i < FastOrderCtrl.brandListCopy.length; i++) {
                        if (FastOrderCtrl.brandListCopy[i].nameEn.indexOf(keyword) >= 0) {
                            arr.push(FastOrderCtrl.brandListCopy[i]);
                        }

                        if(arr.length > 20) {
                            break;
                        }
                    }
                    FastOrderCtrl.brandList = arr;
                    $(this).siblings('.m-tabselect-body').fadeIn(100);
                }
                FastOrderCtrl.brandFilter = name;
            }
        };

        //型号输入框失去焦点
        vm.inpBlur = function(index) {
            if ($(this).val() == '') {
                FastOrderCtrl.trArr[index].sn = '';
                FastOrderCtrl.trArr[index].id = "";
                FastOrderCtrl.trArr[index].unit = '';
                FastOrderCtrl.trArr[index].image = '';
                FastOrderCtrl.trArr[index].name = '';
                FastOrderCtrl.trArr[index].price = '';
                FastOrderCtrl.trArr[index].total = '';
                FastOrderCtrl.trArr[index].quantity = 0;
                //计算
                vm.calculateMoney();
                //隐藏详情
                detailsShow(0, index);
            }
        };

        //提交订单
        vm.subOrder = function() {
            //提交数组
            var productIdList = [],
                quantityList = [];
            var data = new Array();

            for (var i = 0; i < vm.trArr.length; i++) {
                if (vm.trArr[i].id != '') {
                    data.push({
                        "goodsId": vm.trArr[i].id,
                        "quantity": vm.trArr[i].quantity
                    });
                }
            }
            if(0 < data.length) {
                //post请求
                io.POST(apiConfig.addCart, data,
                    function(data) {
                        if (data.success) {
                            //跳转
                            window.onbeforeunload = null;
                            window.location.href = '/cart/list.html';
                        } else {
                            FastOrderCtrl.errorInfo = data.message;
                            alert(data.message);
                        }
                    });
            }

            return false;
        };
		
		vm.tabselectblockClick = function(){ 
			var tabselect = $(this).siblings('.m-tabselect-body'),
				$dis = tabselect.css('display');
			clear(tabselect);
			if ($dis == 'block') {
				$('.m-tabselect-body').hide();
				$('.m-tabselect-block').removeClass('m-tabselect-block-active');
			} else {
				var name = $(this).val(),
					arr = [];
                FastOrderCtrl.brandFilter = name;
				FastOrderCtrl.brandList = [];
				if (name == '') {
					FastOrderCtrl.brandList = FastOrderCtrl.brandListCopy.slice(0, 20);
					$('.m-tabselect-block').removeClass('m-tabselect-block-active');
					$(this).addClass('m-tabselect-block-active');
					$('.m-tabselect-body').hide();
					$(this).siblings('.m-tabselect-body').show();
				} else {
                    var keyword = name.toLowerCase();
					arr = [];
					for (var i = 0; i < FastOrderCtrl.brandListCopy.length; i++) {
						if (FastOrderCtrl.brandListCopy[i].nameEn.indexOf(keyword) >= 0) {
							arr.push(FastOrderCtrl.brandListCopy[i]);
						}

                        if(arr.length > 20) {
                            break;
                        }
					}
					FastOrderCtrl.brandList = arr;
					$('.m-tabselect-block').removeClass('m-tabselect-block-active');
					$(this).addClass('m-tabselect-block-active');
					$('.m-tabselect-body').hide();
					$(this).siblings('.m-tabselect-body').show();
				}
			}
				
		}
		 
		
		 //输入框下拉
		 vm.tabselectInpBlockKeyUp = function(e){ 
			var $id = $(this).attr('bid'),
				$val = $(this).val(),
				index = $(this).parents('.order-trone').index();
			if ($val == '') {
				$(this).siblings('.m-tabselect-body').fadeOut(200);
			} else {
				//移除上下键
				if (e.keyCode != 38 && e.keyCode != 40) {
					io.GET(apiConfig.productAutoComplete, {
						"brandId": $id,
						"sn": $val
					}, function(data) {
						if (data.success) {
							if (data.result.length > 0) {
								FastOrderCtrl.productNumList = data.result;
							} else {
								FastOrderCtrl.productNumList = [];
							}
						}
					});
					//有数据时才显示
					$(this).siblings('.m-tabselect-body').fadeIn(100);

				}
			}
		 } 


    });

    //获取品牌列表
    if (FastOrderCtrl.isLogin) {
        io.GET(apiConfig.brand, function(data) {
            if (data.success) {
                // var array = new Array();
                // for(var obj in data.result){
                //     if(data.result[obj].id != 15   ){
                //         array.push(data.result[obj]);
                //     }
                // }
                FastOrderCtrl.brandListCopy = data.result;
                for (var i = 0; i < FastOrderCtrl.brandListCopy.length; i++) {
                    FastOrderCtrl.brandListCopy[i].name += " / " + FastOrderCtrl.brandListCopy[i].nameEn;
                    FastOrderCtrl.brandListCopy[i].nameEn = FastOrderCtrl.brandListCopy[i].name.toLowerCase()
                }
                FastOrderCtrl.brandList = FastOrderCtrl.brandListCopy.slice(0, 20);
 
            }
        });
    }

    //active状态，延迟处理
    setTimeout(function() {
        if (avalon.vmodels['accountHeadCtrl']) {
            FastOrderCtrl.$fire('down!currentNavInfo', 'inOrder');
        }
    }, 50);

    avalon.scan();

    //型号键盘事件

    $(document).keyup(function(e) {
        //当前显示的型号层父DIV
        var pmIndex = -1;

        for (var i = 0; i < $('.tabselect-body-noscroll').length; i++) {
            if ($('.tabselect-body-noscroll').eq(i).css('display') == 'block') {
                pmIndex = i;
            }
        }
        //如果有选择下拉
        if (pmIndex >= 0) {
            var pObj = $('.tabselect-body-noscroll').eq(pmIndex),
                pObjSize = pObj.find('.m-tabselect-item').length - 1;
            switch (e.keyCode) {
                //上
                case 38:
                    mIndex--;
                    mIndex = parseInt(mIndex) < 0 ? pObjSize : mIndex;
                    $('.m-tabselect-item').removeClass('m-tabselect-item-hover');
                    pObj.find('.m-tabselect-item').eq(mIndex).addClass('m-tabselect-item-hover');
                    pObj.find('.m-tabselect-item').eq(mIndex).trigger('mouseenter');
                    break;
                    //下
                case 40:
                    mIndex++;
                    mIndex = parseInt(mIndex) > pObjSize ? 0 : mIndex;
                    $('.m-tabselect-item').removeClass('m-tabselect-item-hover');
                    pObj.find('.m-tabselect-item').eq(mIndex).addClass('m-tabselect-item-hover');
                    pObj.find('.m-tabselect-item').eq(mIndex).trigger('mouseenter');
                    break;
                case 13:
                    addObj.outIndex = $('.m-tabselect-item-hover').attr('data-oindex');
                    addObj.id = $('.m-tabselect-item-hover').attr('data-id');
                    addObj.sn = $('.m-tabselect-item-hover').attr('data-sn');
                    addObj.unit = $('.m-tabselect-item-hover').attr('data-unit');
                    addObj.image = $('.m-tabselect-item-hover').attr('data-img');
                    addObj.name = $('.m-tabselect-item-hover').attr('data-name');
                    addObj.price = $('.m-tabselect-item-hover').attr('data-price');
                    addObj.total = $('.m-tabselect-item-hover').attr('data-total');
                    addObj.quantity = $('.m-tabselect-item-hover').attr('data-quantity');
                    addObj.brandName = $('.m-tabselect-item-hover').attr('data-brandname');
                    addObj.disabled = $('.m-tabselect-item-hover').attr('data-dis');
                    if( addObj.quantity == 0 || ! addObj.quantity){
                         addObj.quantity = 1;
                    }
                    //触发事件
                    FastOrderCtrl.changeModel(addObj.outIndex, addObj.id, addObj.sn, addObj.unit, addObj.images[0], addObj.name, addObj.price, addObj.total, addObj.quantity, addObj.brandName, addObj.disabled);
                    pObj.find('.m-tabselect-item').eq(mIndex).trigger('mouseleave');
                    break;
            }
        }
		
    });


    //点击其他地方隐藏下拉
    $(document).click(function(e) {
        var $class = $(e.target);
        if (!$class.hasClass('m-tabselect-block') && !$class.hasClass('trans_link_3')) {
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            $('.m-tabselect-body').hide();
        }
    });

   

    //品牌输入框
    //$('.m-tabselect-inp-brand').on('keyup',function(e){
    //    var name = $(this).val();
    //    if (name == '') {
    //        $(this).siblings('.m-tabselect-body').fadeOut(200);
    //    }
    //    else {
    //        var arr = [];
    //        for (var i = 0; i < FastOrderCtrl.brandList.length; i++) {
    //            if (FastOrderCtrl.brandList[i].name.indexOf(name) >= 0) {
    //                arr.push(FastOrderCtrl.brandList[i]);
    //            }
    //        }
    //        FastOrderCtrl.brandList = arr;
    //        $(this).siblings('.m-tabselect-body').fadeIn(100);
    //        avalon.log(arr);
    //    }
    //});
   
    //全选
    $('.m-checkbox-all-icon').click(function() {
        $state = !$(this).siblings('.m-checkbox-all-check').attr('checked');
        $checkbox = $('.m-checkbox-icon');
        if ($state) {
            $checkbox.removeClass('m-checkbox-icon-checked');
            $('.m-checkbox-check').attr('checked', false);
            $('.m-checkbox-all-icon').removeClass('m-checkbox-all-icon-checked');
            $('.select-order-tr').parents('tr').removeClass('tr-active');
        } else {
            $checkbox.addClass('m-checkbox-icon-checked');
            $('.m-checkbox-check').attr('checked', true);
            $('.m-checkbox-all-icon').addClass('m-checkbox-all-icon-checked');
            $('.select-order-tr').parents('tr').addClass('tr-active');
        }
        $('.m-checkbox-all-check').attr('checked', $state);
    });

    //勾选
    $('.m-checkbox-icon').on('click', function() {
        if ($(this).siblings('.m-checkbox-check').is(':checked')) {
            $(this).siblings('.m-checkbox-check').attr('checked', false);
            $(this).removeClass('m-checkbox-icon-checked');
            $(this).parents().parents().parents('tr').removeClass('tr-active');
        } else {
            $(this).siblings('.m-checkbox-check').attr('checked', true);
            $(this).addClass('m-checkbox-icon-checked');
            $(this).parents().parents().parents('tr').addClass('tr-active');
        }
    });


    //购物车数量加减
    //加减号
    //$('.m-inorder-minus').on('click', function () {
    //    var $numObj = $(this).parent().children('span').children('.m-inorder-num');
    //    if ($numObj.val() > 1) {
    //        $numObj.val(parseInt($numObj.val()) - 1);
    //    }
    //});
    //
    //$('.m-inorder-add').on('click', function () {
    //    var $numObj = $(this).parent().children('span').children('.m-inorder-num');
    //    if($numObj.val()==''){
    //        $numObj.val(1);
    //        return;
    //    }
    //    $numObj.val(parseInt($numObj.val()) + 1);
    //});


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

    //输入框只能输大于0数字
    $('.m-inorder-num').on('keyup', function() {
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        if ($(this).val() < 0) {
            $(this).val(1);
        }
    }).on("paste", function() {
        //粘贴处理
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        if ($(this).val() < 0) {
            $(this).val(1);
        }
    });

    //商品详情hover动效
    $('.goods-details').on({
        mouseenter: function() {
            $(this).find('.detail-hover').stop(true, true).fadeIn(300);
        },
        mouseleave: function() {
            $(this).find('.detail-hover').stop(true, true).fadeOut(300);
        }
    });

    //产品详情块显示/隐藏
    function detailsShow(num, index) {
        num == 0 ? $('.goods-details-hidden').eq(index).hide() : $('.goods-details-hidden').eq(index).show();
    }

    //修复样式
    $('.detail-hover').hover(function() {
        $(this).stop(true, true).fadeOut(200);
    });

    
    

    function getIndex(nextIndex, items) {
        var len = items.length - 1;
        if (nextIndex < 0) nextIndex = len;
        if (nextIndex > len) nextIndex = 0;
        return nextIndex;
    }

    function setFocus(index, items, list) {
        var activeIndex = getIndex(index, items);
        $(items[activeIndex]).addClass('focus');
        list.data('active-index', activeIndex);
    }

    function up(activeIndex, items, list) {
        setFocus(getUpIndex(activeIndex, items), items, list);
    }

    function down(activeIndex, items, list) {
        setFocus(getDownIndex(activeIndex, items), items, list);
    }

    function getUpIndex(activeIndex, items) {
        var index = items.length - 1;
        if (typeof activeIndex !== 'undefined') {
            $(items[activeIndex]).removeClass('focus');
            index = activeIndex - 1;
        }
        return index;
    }

    function getDownIndex(activeIndex, items) {
        var index = 0;
        if (typeof activeIndex !== 'undefined') {
            $(items[activeIndex]).removeClass('focus');
            index = activeIndex + 1;
        }
        return index;
    }

    function enter(activeIndex, items) {
        var item = $(items[activeIndex]),
            index = item.attr('index'),
            id = item.attr('bid'),
            name = item.text();
        if (typeof activeIndex !== 'undefined') FastOrderCtrl.changeBrand(index, id, name);
    }

    function clear(element) {
        element.removeData('active-index');
    }

    //事件处理
    function keyupList(e, keyCode) {
        var element = $(e.target),
            list = element.siblings('.m-tabselect-body'),
            activeIndex = list.data('active-index'),
            items = list.children('.m-tabselect-item');

        if (list.css('display') !== 'block') return;

        switch (keyCode) {
            case 13:
                enter(activeIndex, items);
                break;
            case 38:
                up(activeIndex, items, list);
                break;
            case 40:
                down(activeIndex, items, list);
                break;
        }

    }

    window.onbeforeunload = function(){
        var bData = false;
        for (var i = 0; i < FastOrderCtrl.trArr.length; i++) {
            if (FastOrderCtrl.trArr[i].id != '') {
                bData = true;
                break;
            }
        }

        if(bData) {
            return "数据没有保存将会丢失！";
        }
    };
});