require(['dialog/avalon.dialog', 'pager/avalon.pager', "dropdownlist/avalon.dropdownlist"], function(avalon) {
    avalon.ready(function() {
        var vendorListCtrl = avalon.define({
            $id: "vendorListCtrl",
            currentNavInfo: 'vendor',
            dataList: [],
            brandList: [],
            brandRawList: [],
            categoryList: [],
            brandId: '',
            searchData: {
                brandId: '',
                skuSn: '',
                category: '',
                goodName: '',
                supplierName: ''
            },
            //$skipArray :["brandList"],
            init: function() {
                //取品牌列表
                //io.GET(apiConfig.brand + '/simpleData', {enableStatus: 1, per_page: 1000, page: 1}, function(data) {
                io.GET(apiConfig.brand + '/simpleData', { per_page: 10000, page: 1 }, function(data) {
                    if (data.result) {
                        for (var i = 0; i < data.result.length; i++) {
                            data.result[i].lowercaseEn = data.result[i].nameEn.toLowerCase();
                        }
                        vendorListCtrl.brandRawList = data.result;
                        vendorListCtrl.brandList = vendorListCtrl.brandRawList.slice(1, 20);

                        //初始化品牌下拉列表
                        var search = ''
                        var listData = []
                        var keyWords = search.toLowerCase();
                        for (var i = 0; i < vendorListCtrl.brandRawList.length; i++) {
                            if ((vendorListCtrl.brandRawList[i].name.indexOf(search) >= 0) || (vendorListCtrl.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                var item = {
                                    value: vendorListCtrl.brandRawList[i].id,
                                    label: vendorListCtrl.brandRawList[i].name + "/" + vendorListCtrl.brandRawList[i].nameEn
                                }
                                listData.push(item);
                                if (20 < listData.length) {
                                    break;
                                }
                            }
                        }

                        if (listData.length <= 0) {
                            listData.push({ value: "", label: "无相关品牌" });
                        } else {
                            listData.splice(0, 0, { value: '', label: '全部' })
                        }
                        avalon.vmodels.brandDropListId.render(listData)
                        //end

                        avalon.scan();
                    }
                });
                //取分类列表
                io.GET(apiConfig.category, { grade: 1 }, function(data) {
                    if (data.result) {
                        vendorListCtrl.categoryList = data.result;
                        avalon.scan();
                    }
                });
            },
            //下拉的处理
            dropdownlist: {
                getRealTimeData: function(search, dropdownlist) {
                    if (dropdownlist.$id == 'brandDropListId') {
                        setTimeout(function() {
                            var listData = [];
                            var keyWords = search.toLowerCase();
                            for (var i = 0; i < vendorListCtrl.brandRawList.length; i++) {
                                if ((vendorListCtrl.brandRawList[i].name.indexOf(search) >= 0) || (vendorListCtrl.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                    var item = {
                                        value: vendorListCtrl.brandRawList[i].id,
                                        label: vendorListCtrl.brandRawList[i].name + "/" + vendorListCtrl.brandRawList[i].nameEn
                                    }
                                    listData.push(item);
                                    if (20 < listData.length) {
                                        break;
                                    }
                                }
                            }

                            if (listData.length <= 0) {
                                listData.push({ value: "", label: "无相关品牌" });
                            } else {
                                listData.splice(0, 0, { value: '', label: '全部' })
                            }
                            dropdownlist.render(listData);
                        }, 100);
                    }
                },
                realTimeData: true
            },

            getQueryParam: function(curPage) {
                var queryParam = {};
                if (vendorListCtrl.brandId != '') {
                    queryParam.brandId = vendorListCtrl.brandId;
                }

                if (vendorListCtrl.searchData.skuSn != '') {
                    queryParam.sn_contains = vendorListCtrl.searchData.skuSn;
                }

                if (vendorListCtrl.searchData.category != '') {
                    queryParam.catId = vendorListCtrl.searchData.category;
                }

                if (vendorListCtrl.searchData.goodName != '') {
                    queryParam.goodsName_contains = vendorListCtrl.searchData.goodName;
                }

                if (vendorListCtrl.searchData.supplierName != '') {
                    queryParam.corpName_contains = vendorListCtrl.searchData.supplierName;
                }
                queryParam.page = curPage;
                queryParam.per_page = vendorListCtrl.pager.perPages;

                return queryParam;
            },

            pager: {
                perPages: 10,
                showJumper: true,
                //alwaysShowNext:true,
                //alwaysShowPrev:true,
                onJump: function(e, data) {
                    var searchData = vendorListCtrl.getQueryParam(data._currentPage);
                    io.GET(apiConfig.vendors, searchData, function(data) {
                        if (data.success) {
                            vendorListCtrl.dataList = data.result;
                            avalon.vmodels.vendorListPager.totalItems = data.result_info.total_count;
                            avalon.vmodels.vendorListPager.currentPage = data.result_info.page;
                            avalon.scan();
                        }
                    });
                }
            },
            //$skipArray :["pager", "brandRawList"],
            doVendorQuery: function() {
                var searchData = vendorListCtrl.getQueryParam(1);
                io.GET(apiConfig.vendors, searchData, function(data) {
                    if (data.success) {
                        vendorListCtrl.dataList = data.result;
                        avalon.vmodels.vendorListPager.totalItems = data.result_info.total_count;
                        avalon.vmodels.vendorListPager.currentPage = data.result_info.page;
                        avalon.scan();
                    }
                });
            },

            onKeyup: function(event) {
                if (event.keyCode === 13) {
                    vendorListCtrl.doVendorQuery();
                }
            },

            onTabSelect: function() {
                onTabSelect($(this));
            },

            $goodsListDialogOption: {
                title: "供应产品列表",
                draggable: true,
                showClose: true,
                width: 1200,
                isTop: true,
                zIndex: 100,
            },
            // showGoodsList : function(item) {
            //     var apiUrl = '';
            //     if(item.supplierId) {
            //         apiUrl = apiConfig.supplierGoods.replace('{supplierId}', item.supplierId); 
            //     } else {
            //         apiUrl = apiConfig.shopGoods.replace('{shopId}', item.shopId); 
            //     }
            //     goodsListCtrl.apiUrl = apiUrl;
            //     goodsListCtrl.brandList = goodsListCtrl.brandRawList = vendorListCtrl.brandRawList;
            //     goodsListCtrl.doGoodsQuery();
            //     avalon.vmodels['goodsListDialogId'].toggle = true;
            // },
            $addSupplierDialogOption: {
                title: "供应商详情",
                draggable: true,
                showClose: true,
                width: 600,
                zIndex: 100,
                //isTop: true,
            },
            editSupplier: function(item, bViewer) {
                addSupplierCtrl.bViewer = bViewer;
                if (item) {
                    addSupplierCtrl.init(item.supplierId);
                } else {
                    addSupplierCtrl.init(null);
                }
                addSupplierCtrl.brandList = [];
                addSupplierCtrl.brandRawList = vendorListCtrl.brandRawList;
                avalon.vmodels['addSupplierDialogId'].toggle = true;
                //卖家管理-查看详情页面不滚动
                setTimeout(function(){
                    $('#addSupplierDialogId').parent().css({height:'100%', overflow:'auto',width:'100%',position:'fixed'});
                    $('#addSupplierDialogId').css({position:'absolute'});
                },100)
            },
            $alertDialogOption: {
                title: '提示信息',
                draggable: true,
                showClose: true,
                width: 300,
                zIndex: 100,
                isTop: true,
            },
            openAlert: function(msg) {
                alertDialogCtrl.message = msg;
                avalon.vmodels['alertDialogCtrlId'].toggle = true;
            },
            $shopInfoDialogOption: {
                title: "店铺详情",
                draggable: true,
                showClose: true,
                width: 800,
            },
            showShopInfo: function(item) {
                shopInfoCtrl.init(item.shopId);
                avalon.vmodels['shopInfoDialogId'].toggle = true;
            },
        });

        //新增与编辑临时供应商
        var addSupplierCtrl = avalon.define({
            $id: "addSupplierCtrl",
            bViewer: true,
            //省份
            provinceData: [],
            province: '',
            //城市
            cityData: [],
            city: '',
            //县
            countyData: [],
            county: '',
            supplierTypeList: [],
            accreditStatusList: [],
            supplierBrandList: [],
            supplier: {
                id: null,
                sn: '',
                name: '',
                contacts: '',
                mobile: '',
                areaId: '',
                nature: '',
                address: '',
                remarks: '',
                brandList: [{ brandId: '', brandName: '', accreditStatus: 0, remarks: '' }],
                supplierStatus: 3,
            },
            //初始化数据
            init: function(supplierId) {
                var initResult = {
                    id: null,
                    sn: '',
                    name: '',
                    contacts: '',
                    mobile: '',
                    areaId: '',
                    nature: '',
                    address: '',
                    remarks: '',
                    brandList: [],//[{brandId:'', brandName:'', accreditStatus:0, remarks:''}],
                    supplierStatus: 3,
                };
                for (var i in initResult) {
                    addSupplierCtrl.supplier[i] = initResult[i];
                }

                if (supplierId) {
                    //获取信息
                    io.GET(apiConfig.supplier + '/' + supplierId, function(data) {
                        if (data.result) {
                            for (var i in data.result) {
                                addSupplierCtrl.supplier[i] = data.result[i];
                            }
                            if (addSupplierCtrl.supplier.brandList.length == 0) {
                                addSupplierCtrl.supplier.brandList = [{ brandId: '', brandName: '', accreditStatus: 0, remarks: '' }];
                            }
                            addSupplierCtrl.province = data.result.areaProvince;
                            addSupplierCtrl.city = data.result.areaCity;
                            addSupplierCtrl.county = data.result.areaCounty;
                            avalon.scan();
                        }
                    });
                } else {
                    addSupplierCtrl.supplier.brandList = [{ brandId: '', brandName: '', accreditStatus: 0, remarks: '' }];
                }
            },
            //下拉的处理
            dropdownlist: {
                getRealTimeData: function(search, dropdownlist) {
                    setTimeout(function() {
                        var listData = [];
                        var keyWords = search.toLowerCase();
                        for (var i = 0; i < vendorListCtrl.brandRawList.length; i++) {
                            if ((vendorListCtrl.brandRawList[i].name.indexOf(search) >= 0) || (vendorListCtrl.brandRawList[i].lowercaseEn.indexOf(keyWords) >= 0)) {
                                var item = {
                                    value: vendorListCtrl.brandRawList[i].id,
                                    label: vendorListCtrl.brandRawList[i].name + "/" + vendorListCtrl.brandRawList[i].nameEn
                                }
                                listData.push(item);
                                if (20 < listData.length) {
                                    break;
                                }
                            }
                        }

                        if (listData.length <= 0) {
                            listData.push({ value: "", label: "无相关品牌" });
                        }
                        dropdownlist.render(listData);
                    }, 100);
                },
                realTimeData: true
            },

            //添加按钮
            addBrand: function() {
                addSupplierCtrl.supplier.brandList.push({ brandId: '', brandName: '', accreditStatus: 0 });
                if (addSupplierCtrl.supplier.brandList.length > 1) {
                    $(".del-class-btn").show();
                } else {
                    $(".del-class-btn").hide();
                }
                $(".add-class-btn").show();
            },

            deleteBrand: function(index) {
                if (addSupplierCtrl.supplier.brandList.length > 1) {
                    addSupplierCtrl.supplier.brandList.splice(index, 1);
                }
                if (addSupplierCtrl.supplier.brandList.length == 1) {
                    $(".del-class-btn").hide();
                }

            },

            //选择省份
            selectProvince: function(name) {
                addSupplierCtrl.province = name;
                //清除
                addSupplierCtrl.city = '';
                addSupplierCtrl.county = '';
                addSupplierCtrl.cityData = [];
                addSupplierCtrl.countyData = [];
                addSupplierCtrl.supplier.areaId = '';
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
                for (var i = 0; i < addSupplierCtrl.provinceData.length; i++) {
                    if (addSupplierCtrl.provinceData[i].name === name) {
                        addSupplierCtrl.cityData = addSupplierCtrl.provinceData[i].c;
                    }
                }
            },

            //选择城市
            selectCity: function(name) {
                addSupplierCtrl.city = name;
                //清除
                addSupplierCtrl.county = '';
                addSupplierCtrl.countyData = [];
                addSupplierCtrl.supplier.areaId = '';
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
                for (var i = 0; i < addSupplierCtrl.cityData.length; i++) {
                    if (addSupplierCtrl.cityData[i].name === name) {
                        addSupplierCtrl.countyData = addSupplierCtrl.cityData[i].c;
                    }
                }
            },

            //选择区/县
            selectCounty: function(name, value) {
                addSupplierCtrl.county = name;
                addSupplierCtrl.supplier.areaId = value;
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
            },

            // keyEvent : function(event) {
            //     var keys = [13, 38, 40],
            //         keyCode = event.keyCode || event.which || event.charCode;

            //     if (keys.indexOf(keyCode) !== -1) {
            //         keyupList(event, keyCode);
            //     }
            // },
            onSave: function() {
                var postData = {
                    name: addSupplierCtrl.supplier.name,
                    contacts: addSupplierCtrl.supplier.contacts,
                    mobile: addSupplierCtrl.supplier.mobile,
                    areaId: addSupplierCtrl.supplier.areaId,
                    nature: addSupplierCtrl.supplier.nature,
                    address: addSupplierCtrl.supplier.address,
                    remarks: addSupplierCtrl.supplier.remarks,
                    brandList: [],
                    supplierStatus: addSupplierCtrl.supplier.supplierStatus,
                };
                for (var i = 0; i < addSupplierCtrl.supplier.brandList.length; i++) {
                    if (addSupplierCtrl.supplier.brandList[i].brandId != '') {
                        postData.brandList.push({
                            brandId: addSupplierCtrl.supplier.brandList[i].brandId,
                            accreditStatus: addSupplierCtrl.supplier.brandList[i].accreditStatus,
                            remarks: addSupplierCtrl.supplier.brandList[i].remarks,
                            certificate: addSupplierCtrl.supplier.brandList[i].certificate
                        });
                    }
                }
                if (addSupplierCtrl.supplier.id) {
                    io.PUT(apiConfig.supplier + '/temp/' + addSupplierCtrl.supplier.id, postData, function(data) {
                        if (data.success) {
                            avalon.vmodels['addSupplierDialogId'].toggle = false;
                        }
                    },
                        function(data) {
                            if (!data.success) {
                                vendorListCtrl.openAlert(data.message);
                            }
                        });
                } else {
                    io.POST(apiConfig.supplier, postData, function(data) {
                        if (data.success) {
                            avalon.vmodels['addSupplierDialogId'].toggle = false;
                        }
                    },
                        function(data) {
                            if (!data.success) {
                                vendorListCtrl.openAlert(data.message);
                            }
                        });
                }
            },
            onCloseDlg: function() {
                avalon.vmodels['addSupplierDialogId'].toggle = false;
            },
            //上传证书
        });
        /*
                //商品列表
                var goodsListCtrl = avalon.define({
                    $id: "goodsListCtrl",
                    apiUrl : '',
                    brandList : [],
                    brandRawList: [],
                    brandFilter : '',
                    goodsList : [],
                    searchData :{
                        brand : {id:'', name:''},
                        skuSn : '',
                        category : '',
                        goodName : ''
                    },
                    pager : {
                        perPages:10,
                        showJumper:true,
                        //alwaysShowNext:true,
                        //alwaysShowPrev:true,
                        onJump: function(e, data) {
                            var searchData = goodsListCtrl.getQueryParam(data._currentPage);
                            io.GET(goodsListCtrl.apiUrl, searchData, function(data) {
                                if(data.success){
                                    goodsListCtrl.goodsList = data.result;
                                    avalon.vmodels.goodsListPager.totalItems = data.result_info.total_count;
                                    avalon.vmodels.goodsListPager.currentPage = data.result_info.page;
                                    avalon.scan();
                                }
                            });
                        }
                    },
                    getQueryParam: function(curPage) {
                        var queryParam = {};
                        if(goodsListCtrl.searchData.brand.id != '') {
                            queryParam.brandId = goodsListCtrl.searchData.brand.id;
                        }
        
                        if(goodsListCtrl.searchData.skuSn != '') {
                            queryParam.sn_contains = goodsListCtrl.searchData.skuSn;
                        }
        
                        if(goodsListCtrl.searchData.category != '') {
                            queryParam.catId = goodsListCtrl.searchData.category;
                        }
        
                        if(goodsListCtrl.searchData.goodName != '') {
                            queryParam.goodsName_contains = goodsListCtrl.searchData.goodName;
                        }
        
                        queryParam.page = curPage;
                        queryParam.per_page = goodsListCtrl.pager.perPages;
        
                        return queryParam;
                    },
                    //$skipArray :["pager"],
                    doGoodsQuery : function() {
                        var searchData = goodsListCtrl.getQueryParam(1);
                        io.GET(goodsListCtrl.apiUrl, searchData, function(data) {
                            if(data.success){
                                goodsListCtrl.goodsList = data.result;
                                avalon.vmodels.goodsListPager.totalItems = data.result_info.total_count;
                                avalon.vmodels.goodsListPager.currentPage = data.result_info.page;
                                avalon.scan();
                            }
                        });
                    },
                    onTabSelect : function() {
                        onTabSelect($(this));
                    },
                    //品牌下拉
                    changeBrand :function(index, id, text) {
                        goodsListCtrl.searchData.brand.name = text;
                        goodsListCtrl.searchData.brand.id = id;
                        $('.m-tabselect-body').hide();
                    },
                    //品牌输入框change事件
                    brandInpChange : function(name, event) {
                        var keys = [13, 38, 40],
                            keyCode = event.keyCode || event.which || event.charCode;
        
                        if (keys.indexOf(keyCode) !== -1) {
                            keyupList(event, keyCode, goodsListCtrl.changeBrand);
                        }
                        name = name.toLowerCase();
                        if(goodsListCtrl.brandFilter != name) {
                            var arr = [];
                            goodsListCtrl.brandList = [];
                            if (name == '') {
                                goodsListCtrl.searchData.brand.id = '';
                                goodsListCtrl.brandList = goodsListCtrl.brandRawList.slice(1, 200);
                                $(this).siblings('.m-tabselect-body').fadeIn(100);
                            } else {
                                arr = [];
                                for (var i = 0; i < goodsListCtrl.brandRawList.length; i++) {
                                    if ((goodsListCtrl.brandRawList[i].name.indexOf(name) >= 0) || (goodsListCtrl.brandRawList[i].lowercaseEn.indexOf(name) >= 0)){
                                        arr.push(goodsListCtrl.brandRawList[i]);
                                        if(200 <arr.length) {
                                            break;
                                        }
                                    }
                                }
                                goodsListCtrl.brandList = arr;
                                $(this).siblings('.m-tabselect-body').fadeIn(100);
                            }
        
                            goodsListCtrl.brandFilter = name;
                        }
                    },        
                });
        */
        //提示框
        var alertDialogCtrl = avalon.define({
            $id: "alertDialogCtrl",
            message: '',
            onCloseAlert: function() {
                avalon.vmodels['alertDialogCtrlId'].toggle = false;
            }
        });

        //店铺
        var shopInfoCtrl = avalon.define({
            $id: "shopInfoCtrl",
            shopInfo: { brandList: [] },
            init: function(shopId) {
                apiUrl = apiConfig.shop.replace('{id}', shopId);
                io.GET(apiUrl, function(data) {
                    if (data.success) {
                        if (!data.result.brandList) {
                            data.result.brandList = [];
                        }
                        shopInfoCtrl.shopInfo = data.result;
                        avalon.scan();
                    }
                });
            },
            onCloseDlg: function() {
                avalon.vmodels['shopInfoDialogId'].toggle = false;
            },
        });
        vendorListCtrl.doVendorQuery();
        vendorListCtrl.$watch('brandId', function(a, b, c) {
            vendorListCtrl.doVendorQuery()
        })

        avalon.scan();
        vendorListCtrl.init();
        // vendorListCtrl.dropdownlist.getRealTimeData()


        //取供应商商类型
        io.GET(apiConfig.dict + '/SUPPLIER_TYPE/item', function(data) {
            if (data.result) {
                addSupplierCtrl.supplierTypeList = data.result;
            }
        });

        //取供应品牌的授权状态
        io.GET(apiConfig.dict + '/ACCREDIT_STATUS/item', function(data) {
            if (data.result) {
                addSupplierCtrl.accreditStatusList = data.result;
            }
        });

        //点击其他地方隐藏下拉
        $(document).click(function(e) {
            var $class = $(e.target);
            if (!$class.hasClass('m-tabselect-block') && !$class.hasClass('trans_link_3') && !$class.hasClass('m-tabselect-inp-brand')) {
                $('.m-tabselect-block').removeClass('m-tabselect-block-active');
                $('.m-tabselect-body').hide();
            }
        });

        //获取地区json数据
        $.get('/scripts/json/area.json', function(data) {
            if (data) {
                addSupplierCtrl.provinceData = data;
                //默认地址设置
                addSupplierCtrl.selectProvince('上海');
                addSupplierCtrl.selectCity('上海市');
                addSupplierCtrl.selectCounty('松江区', 806);
                addSupplierCtrl.supplier.areaId = 793;
            }
        }, 'json');

        //$('.m-tabselect-block').on('click', function() {
        //    var $dis = $(this).siblings('.m-tabselect-body').css('display');
        //    if ($dis == 'block') {
        //        $('.m-tabselect-body').hide();
        //        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        //    } else {
        //        $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        //        $(this).addClass('m-tabselect-block-active');
        //        $('.m-tabselect-body').hide();
        //        $(this).siblings('.m-tabselect-body').show();
        //    }
        //});

    });

    function onTabSelect(item) {
        var $dis = item.siblings('.m-tabselect-body').css('display');
        if ($dis == 'block') {
            $('.m-tabselect-body').hide();
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
        } else {
            $('.m-tabselect-block').removeClass('m-tabselect-block-active');
            item.addClass('m-tabselect-block-active');
            $('.m-tabselect-body').hide();
            item.siblings('.m-tabselect-body').show();
        }
    }

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

    function enter(activeIndex, items, callback) {
        var item = $(items[activeIndex]),
            index = item.attr('index'),
            id = item.attr('bid'),
            name = item.text();
        if (typeof activeIndex !== 'undefined' && typeof callback === 'function') {
            callback(index, id, name);
        }
    }

    function clear(element) {
        element.removeData('active-index');
    }

    //事件处理
    function keyupList(e, keyCode, callback) {
        var element = $(e.target),
            list = element.siblings('.m-tabselect-body'),
            activeIndex = list.data('active-index'),
            items = list.children('.m-tabselect-item');

        if (list.css('display') !== 'block') return;

        switch (keyCode) {
            case 13:
                enter(activeIndex, items, callback);
                break;
            case 38:
                up(activeIndex, items, list);
                break;
            case 40:
                down(activeIndex, items, list);
                break;
        }
    }

});